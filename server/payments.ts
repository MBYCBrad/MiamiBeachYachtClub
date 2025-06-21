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

      const paymentIntent = await stripe.paymentIntents.create({
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
          adjustedPrice: adjustedPrice.toString()
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
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

      const paymentIntent = await stripe.paymentIntents.create({
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
          totalAmount: totalAmount.toString()
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
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