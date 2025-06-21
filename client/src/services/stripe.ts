// Stripe Integration for MBYC Cross-Platform PWA
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface ServiceBookingData {
  serviceId: number;
  userId: number;
  bookingDate: string;
  datetime: string;
  totalPrice: number;
}

export interface EventRegistrationData {
  eventId: number;
  userId: number;
  memberTier: string;
  ticketQuantity: number;
  amount: number;
}

class StripeService {
  private stripe: Stripe | null = null;

  async getStripe(): Promise<Stripe> {
    if (!this.stripe) {
      this.stripe = await stripePromise;
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }
    }
    return this.stripe;
  }

  // Create Payment Intent for Service Bookings
  async createServicePaymentIntent(bookingData: ServiceBookingData): Promise<string> {
    try {
      const response = await apiRequest('POST', '/api/payments/create-service-payment', bookingData);
      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating service payment intent:', error);
      throw new Error('Failed to create payment intent for service booking');
    }
  }

  // Create Payment Intent for Event Registration
  async createEventPaymentIntent(registrationData: EventRegistrationData): Promise<string> {
    try {
      const response = await apiRequest('POST', '/api/payments/create-event-payment', registrationData);
      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating event payment intent:', error);
      throw new Error('Failed to create payment intent for event registration');
    }
  }

  // Process Service Booking Payment
  async processServicePayment(
    serviceBooking: ServiceBookingData,
    paymentMethodId?: string
  ): Promise<{ success: boolean; booking?: any; error?: string }> {
    try {
      const stripe = await this.getStripe();
      const clientSecret = await this.createServicePaymentIntent(serviceBooking);

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          payment_method: paymentMethodId || undefined,
          return_url: `${window.location.origin}/services/booking-success`,
        },
        redirect: 'if_required'
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Create service booking record
        const bookingResponse = await apiRequest('POST', '/api/service-bookings', {
          ...serviceBooking,
          stripePaymentIntentId: result.paymentIntent.id,
          status: 'confirmed'
        });
        
        const booking = await bookingResponse.json();
        return { success: true, booking };
      }

      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error('Service payment error:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Process Event Registration Payment
  async processEventPayment(
    eventRegistration: EventRegistrationData,
    paymentMethodId?: string
  ): Promise<{ success: boolean; registration?: any; error?: string }> {
    try {
      const stripe = await this.getStripe();
      const clientSecret = await this.createEventPaymentIntent(eventRegistration);

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          payment_method: paymentMethodId || undefined,
          return_url: `${window.location.origin}/events/registration-success`,
        },
        redirect: 'if_required'
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Create event registration record
        const registrationResponse = await apiRequest('POST', '/api/event-registrations', {
          ...eventRegistration,
          stripePaymentIntentId: result.paymentIntent.id,
          status: 'confirmed'
        });
        
        const registration = await registrationResponse.json();
        return { success: true, registration };
      }

      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error('Event payment error:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Create Payment Sheet for mobile-optimized payments
  async createPaymentSheet(amount: number, currency = 'usd') {
    try {
      const stripe = await this.getStripe();
      
      const response = await apiRequest('POST', '/api/payments/create-payment-intent', {
        amount: Math.round(amount * 100), // Convert to cents
        currency
      });
      
      const { clientSecret } = await response.json();
      
      return {
        clientSecret,
        stripe
      };
    } catch (error) {
      console.error('Error creating payment sheet:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  // Retrieve Payment Method for saved cards
  async getSavedPaymentMethods(): Promise<any[]> {
    try {
      const response = await apiRequest('GET', '/api/payments/payment-methods');
      return await response.json();
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      return [];
    }
  }

  // Save Payment Method for future use
  async savePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await apiRequest('POST', '/api/payments/save-payment-method', {
        paymentMethodId
      });
      return true;
    } catch (error) {
      console.error('Error saving payment method:', error);
      return false;
    }
  }
}

export const stripeService = new StripeService();