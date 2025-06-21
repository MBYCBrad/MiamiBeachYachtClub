import { MembershipTier, getMembershipBenefits } from './membership';

export interface TokenBalance {
  userId: number;
  currentTokens: number;
  monthlyAllocation: number;
  lastReset: Date;
  tier: MembershipTier;
}

export interface TokenTransaction {
  id: number;
  userId: number;
  bookingId?: number;
  tokensUsed: number;
  transactionType: 'booking' | 'refund' | 'monthly_reset';
  timestamp: Date;
  description: string;
}

export class TokenManager {
  static calculateTokensForBooking(durationHours: number): number {
    // Standard token calculation: 1 token per 4-hour block
    return Math.ceil(durationHours / 4);
  }

  static hasEnoughTokens(balance: TokenBalance, requiredTokens: number): boolean {
    return balance.currentTokens >= requiredTokens;
  }

  static shouldResetTokens(balance: TokenBalance): boolean {
    const now = new Date();
    const lastReset = new Date(balance.lastReset);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                            (now.getMonth() - lastReset.getMonth());
    return monthsSinceReset >= 1;
  }

  static resetMonthlyTokens(balance: TokenBalance): TokenBalance {
    const benefits = getMembershipBenefits(balance.tier);
    return {
      ...balance,
      currentTokens: benefits.monthlyTokens,
      lastReset: new Date()
    };
  }

  static deductTokens(balance: TokenBalance, tokensToDeduct: number): TokenBalance {
    if (!this.hasEnoughTokens(balance, tokensToDeduct)) {
      throw new Error('Insufficient tokens for this booking');
    }
    return {
      ...balance,
      currentTokens: balance.currentTokens - tokensToDeduct
    };
  }

  static refundTokens(balance: TokenBalance, tokensToRefund: number): TokenBalance {
    const benefits = getMembershipBenefits(balance.tier);
    return {
      ...balance,
      currentTokens: Math.min(balance.currentTokens + tokensToRefund, benefits.monthlyTokens)
    };
  }

  static getTokensRemaining(balance: TokenBalance): number {
    return balance.currentTokens;
  }

  static getTokensUsedThisMonth(balance: TokenBalance): number {
    const benefits = getMembershipBenefits(balance.tier);
    return benefits.monthlyTokens - balance.currentTokens;
  }
}