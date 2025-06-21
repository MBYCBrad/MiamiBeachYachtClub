export const MembershipTiers = {
  BRONZE: 'bronze',
  SILVER: 'silver', 
  GOLD: 'gold',
  PLATINUM: 'platinum'
} as const;

export type MembershipTier = typeof MembershipTiers[keyof typeof MembershipTiers];

export interface MembershipLimits {
  maxYachtSize: number; // in feet
  monthlyTokens: number;
  conciergeAccess: boolean;
  priorityBooking: boolean;
  eventDiscounts: number; // percentage
  serviceFees: number; // percentage reduction
}

export const MEMBERSHIP_BENEFITS: Record<MembershipTier, MembershipLimits> = {
  [MembershipTiers.BRONZE]: {
    maxYachtSize: 45,
    monthlyTokens: 8,
    conciergeAccess: false,
    priorityBooking: false,
    eventDiscounts: 0,
    serviceFees: 0
  },
  [MembershipTiers.SILVER]: {
    maxYachtSize: 60,
    monthlyTokens: 12,
    conciergeAccess: true,
    priorityBooking: false,
    eventDiscounts: 10,
    serviceFees: 5
  },
  [MembershipTiers.GOLD]: {
    maxYachtSize: 70,
    monthlyTokens: 16,
    conciergeAccess: true,
    priorityBooking: true,
    eventDiscounts: 15,
    serviceFees: 10
  },
  [MembershipTiers.PLATINUM]: {
    maxYachtSize: Infinity,
    monthlyTokens: 24,
    conciergeAccess: true,
    priorityBooking: true,
    eventDiscounts: 25,
    serviceFees: 15
  }
};

export function getMembershipBenefits(tier: MembershipTier): MembershipLimits {
  return MEMBERSHIP_BENEFITS[tier];
}

export function canBookYacht(memberTier: MembershipTier, yachtSize: number): boolean {
  const limits = getMembershipBenefits(memberTier);
  return yachtSize <= limits.maxYachtSize;
}

export function calculateEventPrice(basePrice: number, memberTier: MembershipTier): number {
  const limits = getMembershipBenefits(memberTier);
  const discount = limits.eventDiscounts / 100;
  return basePrice * (1 - discount);
}

export function calculateServicePrice(basePrice: number, memberTier: MembershipTier): number {
  const limits = getMembershipBenefits(memberTier);
  const reduction = limits.serviceFees / 100;
  return basePrice * (1 - reduction);
}