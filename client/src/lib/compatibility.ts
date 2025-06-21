// TypeScript compatibility layer for MBYC cross-platform React Native Web PWA
import { MembershipTier } from '@shared/membership';

// Type guards and converters
export function ensureMembershipTier(tier: string | null | undefined): MembershipTier {
  const validTiers = ['bronze', 'silver', 'gold', 'platinum'] as const;
  if (tier && validTiers.includes(tier as any)) {
    return tier as MembershipTier;
  }
  return 'bronze'; // Default fallback
}

export function safeParseFloat(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeString(value: string | null | undefined, fallback = ''): string {
  return value ?? fallback;
}

export function safeNumber(value: number | null | undefined, fallback = 0): number {
  return value ?? fallback;
}

export function safeBoolean(value: boolean | null | undefined, fallback = false): boolean {
  return value ?? fallback;
}

// Extended interfaces for missing properties
export interface ExtendedEvent {
  id: number;
  title: string;
  description: string | null;
  location: string;
  startTime: Date;
  endTime: Date;
  startDate?: Date; // Legacy compatibility
  category?: string; // Legacy compatibility
  capacity: number;
  ticketPrice: string | null;
  imageUrl: string | null;
  hostId: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface ExtendedService {
  id: number;
  name: string;
  description: string | null;
  category: string;
  pricePerSession: string | null;
  price?: string; // Legacy compatibility
  duration: number | null;
  rating: string | null;
  reviewCount: number | null;
  providerId: number | null;
  imageUrl: string | null;
  isAvailable: boolean | null;
  createdAt: Date | null;
}

export interface ExtendedServiceBooking {
  id: number;
  userId: number | null;
  serviceId: number | null;
  status: string;
  totalPrice: string | null;
  bookingDate: Date;
  datetime?: Date; // Legacy compatibility
  stripePaymentIntentId: string | null;
  createdAt: Date | null;
}

export interface ExtendedTokenBalance {
  currentTokens: number;
  monthlyAllocation: number;
  lastReset: Date;
  userId: number;
  tier: MembershipTier;
}

// Helper functions for compatibility
export function convertEventToExtended(event: any): ExtendedEvent {
  return {
    ...event,
    startDate: event.startTime,
    category: event.category || 'general'
  };
}

export function convertServiceToExtended(service: any): ExtendedService {
  return {
    ...service,
    price: service.pricePerSession
  };
}

export function convertServiceBookingToExtended(booking: any): ExtendedServiceBooking {
  return {
    ...booking,
    datetime: booking.bookingDate
  };
}

export function createExtendedTokenBalance(
  balance: { currentTokens: number; monthlyAllocation: number; lastReset: Date },
  userId: number,
  tier: string
): ExtendedTokenBalance {
  return {
    ...balance,
    userId,
    tier: ensureMembershipTier(tier)
  };
}