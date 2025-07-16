import { Express } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { calculateEventPrice, calculateServicePrice } from "@shared/membership";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

export async function setupPaymentRoutes(app: Express) {
  // Verify Stripe account configuration on startup
  stripe.accounts.retrieve().then(account => {
    console.log(`🏦 Stripe platform connected: ${account.business_profile?.name || account.id}`);
    console.log(`📧 Platform email: ${account.email}`);
    console.log(`🌍 Country: ${account.country}`);
  }).catch(error => {
    console.error("❌ Stripe platform verification failed:", error.message);
  });

  // Get membership pricing from database
  app.get("/api/membership/pricing", async (req, res) => {
    try {
      const pricing = await storage.getMembershipPricing();
      res.json(pricing);
    } catch (error: any) {
      console.error("Pricing fetch error:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // Get specific tier pricing (e.g., Platinum)
  app.get("/api/membership/pricing/:tier", async (req, res) => {
    try {
      const { tier } = req.params;
      const pricing = await storage.getMembershipPricingByTier(tier);
      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found for this tier" });
      }
      res.json(pricing);
    } catch (error: any) {
      console.error("Tier pricing fetch error:", error);
      res.status(500).json({ message: "Failed to fetch tier pricing" });
    }
  });

  // Create Stripe Connect account for service providers and yacht owners
  app.post("/api/payments/create-connect-account", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { role } = req.user;
    if (role !== 'service_provider' && role !== 'yacht_owner' && role !== 'admin') {
      return res.status(403).json({ error: "Only service providers and yacht owners can create Connect accounts" });
    }

    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          user_id: req.user.id.toString(),
          role: req.user.role,
          platform: 'miami_beach_yacht_club'
        }
      });

      // Update user with Stripe account ID
      await storage.updateUser(req.user.id, {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending'
      });

      res.json({ accountId: account.id, status: 'pending' });
    } catch (error: any) {
      console.error("Connect account creation failed:", error);
      res.status(500).json({ error: "Account creation failed: " + error.message });
    }
  });

  // Generic payment intent creation (for concierge services with Connect routing)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, description, serviceIds } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Determine destination account based on service provider
      let destinationAccount = null;
      let applicationFeeAmount = 0;

      if (serviceIds && serviceIds.length > 0) {
        try {
          // Get the service provider for the first service (assuming all services from same provider)
          const service = await storage.getService(serviceIds[0]);
          if (service && service.providerId) {
            const provider = await storage.getUser(service.providerId);
            if (provider?.stripeAccountId && provider.stripeAccountStatus === 'active') {
              destinationAccount = provider.stripeAccountId;
              // Take 10% platform fee
              applicationFeeAmount = Math.round(amount * 100 * 0.10);
              console.log(`💰 Routing payment to service provider account: ${destinationAccount}`);
            } else {
              console.log(`📋 Service provider ${provider?.username || 'unknown'} doesn't have active Stripe account, using platform account`);
            }
          }
        } catch (error) {
          console.error("Error checking service provider Stripe account:", error);
          // Continue with platform account as fallback
        }
      }

      const paymentIntentData: any = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          description: description || "Miami Beach Yacht Club - Concierge Services",
          business: "Miami Beach Yacht Club",
          service_type: "yacht_concierge",
          timestamp: new Date().toISOString()
        },

        receipt_email: req.isAuthenticated() ? req.user?.email : undefined
      };

      // Add Connect routing if service provider account exists
      if (destinationAccount) {
        paymentIntentData.transfer_data = {
          destination: destinationAccount,
        };
        paymentIntentData.application_fee_amount = applicationFeeAmount;
      }

      console.log(`🔄 Creating payment intent for $${amount} with routing:`, destinationAccount ? 'service provider' : 'platform');
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      console.log(`✅ Payment intent created successfully: ${paymentIntent.id}`);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        destinationAccount: destinationAccount,
        routingType: destinationAccount ? 'service_provider' : 'platform'
      });
    } catch (error: any) {
      console.error("❌ Payment intent creation failed:", error);
      console.error("Error details:", {
        message: error.message,
        type: error.type,
        code: error.code,
        requestBody: req.body
      });
      res.status(500).json({ error: "Payment setup failed: " + error.message });
    }
  });

  // Create payment intent for service bookings
  app.post("/api/payments/service-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { serviceId, datetime } = req.body;
      
      // Get service and user details
      const service = await storage.getService(serviceId);
      const user = await storage.getUser(req.user.id);
      
      if (!service || !user) {
        return res.status(400).json({ error: "Service or user not found" });
      }

      const basePrice = parseFloat(service.pricePerSession || '0');
      const adjustedPrice = calculateServicePrice(basePrice, (user.membershipTier || 'bronze') as any);
      const amountInCents = Math.round(adjustedPrice * 100);

      // Get service provider for payment routing
      let destinationAccount = null;
      let applicationFeeAmount = 0;
      
      if (service.providerId) {
        const provider = await storage.getUser(service.providerId);
        if (provider?.stripeAccountId && provider.stripeAccountStatus === 'active') {
          destinationAccount = provider.stripeAccountId;
          // Take 15% platform fee for services
          applicationFeeAmount = Math.round(amountInCents * 0.15);
        }
      }

      const paymentIntentData: any = {
        amount: amountInCents,
        currency: "usd",
        customer: user.stripeCustomerId || undefined,
        metadata: {
          type: "service_booking",
          serviceId: serviceId.toString(),
          userId: user.id.toString(),
          datetime: datetime,
          memberTier: user.membershipTier || 'bronze',
          originalPrice: basePrice.toString(),
          adjustedPrice: adjustedPrice.toString(),
          business: "Miami Beach Yacht Club",
          service_category: "yacht_services",
          providerId: service.providerId?.toString() || 'platform'
        },

        receipt_email: user.email || undefined
      };

      // Add Connect routing if service provider account exists
      if (destinationAccount) {
        paymentIntentData.transfer_data = {
          destination: destinationAccount,
        };
        paymentIntentData.application_fee_amount = applicationFeeAmount;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        destinationAccount: destinationAccount
      });
    } catch (error: any) {
      console.error("Service payment intent creation failed:", error);
      res.status(500).json({ error: "Payment setup failed: " + error.message });
    }
  });

  // Create payment intent for event registrations
  app.post("/api/payments/event-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { eventId, ticketQuantity = 1 } = req.body;
      
      // Get event and user details
      const event = await storage.getEvent(eventId);
      const user = await storage.getUser(req.user.id);
      
      if (!event || !user) {
        return res.status(400).json({ error: "Event or user not found" });
      }

      const basePrice = parseFloat(event.ticketPrice || '0');
      const adjustedPrice = calculateEventPrice(basePrice, (user.membershipTier || 'bronze') as any);
      const totalAmount = adjustedPrice * ticketQuantity;
      const amountInCents = Math.round(totalAmount * 100);

      // Get event host for payment routing
      let destinationAccount = null;
      let applicationFeeAmount = 0;
      
      if (event.hostId) {
        const host = await storage.getUser(event.hostId);
        if (host?.stripeAccountId && host.stripeAccountStatus === 'active') {
          destinationAccount = host.stripeAccountId;
          // Take 20% platform fee for events
          applicationFeeAmount = Math.round(amountInCents * 0.20);
        }
      }

      const paymentIntentData: any = {
        amount: amountInCents,
        currency: "usd",
        customer: user.stripeCustomerId || undefined,
        metadata: {
          type: "event_registration",
          eventId: eventId.toString(),
          userId: user.id.toString(),
          memberTier: user.membershipTier || 'bronze',
          ticketQuantity: ticketQuantity.toString(),
          originalPrice: basePrice.toString(),
          adjustedPrice: adjustedPrice.toString(),
          totalAmount: totalAmount.toString(),
          business: "Miami Beach Yacht Club",
          service_category: "yacht_events",
          hostId: event.hostId?.toString() || 'platform'
        },

        receipt_email: user.email || undefined
      };

      // Add Connect routing if event host account exists
      if (destinationAccount) {
        paymentIntentData.transfer_data = {
          destination: destinationAccount,
        };
        paymentIntentData.application_fee_amount = applicationFeeAmount;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        destinationAccount: destinationAccount
      });
    } catch (error: any) {
      console.error("Event payment intent creation failed:", error);
      res.status(500).json({ error: "Payment setup failed: " + error.message });
    }
  });

  // Confirm payment and create booking/registration
  app.post("/api/payments/confirm", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { paymentIntentId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const metadata = paymentIntent.metadata;
        
        if (metadata.type === 'service_booking') {
          // Create service booking
          await storage.createServiceBooking({
            serviceId: parseInt(metadata.serviceId),
            userId: parseInt(metadata.userId),
            bookingDate: new Date(metadata.datetime),
            status: 'confirmed',
            totalPrice: metadata.adjustedPrice,
            stripePaymentIntentId: paymentIntentId
          });
        } else if (metadata.type === 'event_registration') {
          // Create event registration
          await storage.createEventRegistration({
            eventId: parseInt(metadata.eventId),
            userId: parseInt(metadata.userId),
            status: 'confirmed',
            ticketCount: parseInt(metadata.ticketQuantity),
            totalPrice: metadata.totalAmount,
            stripePaymentIntentId: paymentIntentId
          });
        }

        res.json({ success: true, status: paymentIntent.status });
      } else {
        res.json({ success: false, status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Payment confirmation failed:", error);
      res.status(500).json({ error: "Payment confirmation failed: " + error.message });
    }
  });

  // Get payment status
  app.get("/api/payments/status/:paymentIntentId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      res.json({ 
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error: any) {
      console.error("Payment status check failed:", error);
      res.status(500).json({ error: "Status check failed: " + error.message });
    }
  });

  // Process refund
  app.post("/api/payments/refund", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { paymentIntentId, amount } = req.body;
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount || undefined // Full refund if amount not specified
      });

      res.json({ 
        success: true, 
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      });
    } catch (error: any) {
      console.error("Refund processing failed:", error);
      res.status(500).json({ error: "Refund failed: " + error.message });
    }
  });

  // Membership upgrade to Platinum
  app.post("/api/membership/upgrade-to-platinum", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user is already Platinum or higher
      if (user.membershipTier === 'platinum' || user.membershipTier === 'diamond') {
        return res.status(400).json({ error: "User is already Platinum or higher tier" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString(),
            previousTier: user.membershipTier || 'bronze'
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Create subscription for Platinum membership
      // Monthly subscription: $10,000/month for Platinum + $25,000 initiation fee
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MBYC Platinum Membership',
              description: 'Miami Beach Yacht Club Platinum Membership - Access to premium yachts and exclusive services'
            },
            unit_amount: 1000000, // $10,000.00 in cents
            recurring: {
              interval: 'month'
            }
          }
        }],
        // Add one-time initiation fee
        add_invoice_items: [{
          price_data: {
            currency: 'usd',
            product: 'Platinum Membership Initiation Fee',
            unit_amount: 2500000, // $25,000.00 in cents
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user.id.toString(),
          membershipTier: 'platinum',
          upgradeFrom: user.membershipTier || 'bronze',
          monthlyAmount: '10000',
          initiationFee: '25000'
        }
      });

      // Update user membership tier
      await storage.updateUser(user.id, { 
        membershipTier: 'platinum',
        stripeSubscriptionId: subscription.id
      });

      const paymentIntent = subscription.latest_invoice?.payment_intent;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Membership upgrade failed:", error);
      res.status(500).json({ error: "Upgrade failed: " + error.message });
    }
  });

  // Create account onboarding link for Connect accounts
  app.post("/api/payments/create-account-link", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { role } = req.user;
    if (role !== 'service_provider' && role !== 'yacht_owner' && role !== 'admin') {
      return res.status(403).json({ error: "Only service providers and yacht owners can access onboarding" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeAccountId) {
        return res.status(400).json({ error: "No Stripe account found. Create account first." });
      }

      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${req.protocol}://${req.get('host')}/dashboard`,
        return_url: `${req.protocol}://${req.get('host')}/dashboard`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error("Account link creation failed:", error);
      res.status(500).json({ error: "Onboarding link creation failed: " + error.message });
    }
  });

  // Stripe account verification endpoint
  app.get("/api/payments/account-info", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.sendStatus(403);
    }

    try {
      const account = await stripe.accounts.retrieve();
      
      res.json({
        accountId: account.id,
        businessName: account.business_profile?.name || "Not set",
        email: account.email,
        country: account.country,
        currency: account.default_currency,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        type: account.type
      });
    } catch (error: any) {
      console.error("Stripe account info retrieval failed:", error);
      res.status(500).json({ error: "Account info retrieval failed: " + error.message });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });
}