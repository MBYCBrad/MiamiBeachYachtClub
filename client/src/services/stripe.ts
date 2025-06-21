import { apiRequest } from "@/lib/queryClient";
import { MembershipTier, calculateEventPrice, calculateServicePrice } from "@shared/membership";

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ServiceBookingPayment {
  serviceId: number;
  userId: number;
  datetime: Date;
  memberTier: MembershipTier;
}

export interface EventRegistrationPayment {
  eventId: number;
  userId: number;
  memberTier: MembershipTier;
  ticketQuantity: number;
}

export class StripeService {
  static async createServicePaymentIntent(
    booking: ServiceBookingPayment,
    basePrice: number
  ): Promise<PaymentIntentResponse> {
    const adjustedPrice = calculateServicePrice(basePrice, booking.memberTier);
    const amountInCents = Math.round(adjustedPrice * 100);

    const response = await apiRequest("POST", "/api/payments/service-intent", {
      amount: amountInCents,
      currency: "usd",
      metadata: {
        type: "service_booking",
        serviceId: booking.serviceId.toString(),
        userId: booking.userId.toString(),
        datetime: booking.datetime.toISOString(),
        memberTier: booking.memberTier,
        originalPrice: basePrice.toString(),
        adjustedPrice: adjustedPrice.toString()
      }
    });

    return await response.json();
  }

  static async createEventPaymentIntent(
    registration: EventRegistrationPayment,
    baseTicketPrice: number
  ): Promise<PaymentIntentResponse> {
    const adjustedPrice = calculateEventPrice(baseTicketPrice, registration.memberTier);
    const totalAmount = adjustedPrice * registration.ticketQuantity;
    const amountInCents = Math.round(totalAmount * 100);

    const response = await apiRequest("POST", "/api/payments/event-intent", {
      amount: amountInCents,
      currency: "usd",
      metadata: {
        type: "event_registration",
        eventId: registration.eventId.toString(),
        userId: registration.userId.toString(),
        memberTier: registration.memberTier,
        ticketQuantity: registration.ticketQuantity.toString(),
        originalPrice: baseTicketPrice.toString(),
        adjustedPrice: adjustedPrice.toString(),
        totalAmount: totalAmount.toString()
      }
    });

    return await response.json();
  }

  static async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/payments/confirm", {
        paymentIntentId
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Payment confirmation failed:", error);
      return false;
    }
  }

  static async getPaymentStatus(paymentIntentId: string): Promise<string> {
    const response = await apiRequest("GET", `/api/payments/status/${paymentIntentId}`);
    const result = await response.json();
    return result.status;
  }

  static async processRefund(paymentIntentId: string, amount?: number): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/payments/refund", {
        paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Refund processing failed:", error);
      return false;
    }
  }

  static formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  static calculateMembershipSavings(originalPrice: number, memberTier: MembershipTier): number {
    const adjustedPrice = calculateServicePrice(originalPrice, memberTier);
    return originalPrice - adjustedPrice;
  }
}