// Twilio Concierge Service Integration for MBYC Premium Members
import { apiRequest } from '@/lib/queryClient';

export interface ConciergeRequest {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'yacht_booking' | 'service_request' | 'event_planning' | 'dining' | 'transportation' | 'general';
  membershipTier: string;
}

export interface ConciergeResponse {
  success: boolean;
  messageId?: string;
  estimatedResponseTime?: string;
  error?: string;
}

class TwilioConciergeService {
  // Send SMS request to concierge team
  async sendConciergeRequest(request: ConciergeRequest): Promise<ConciergeResponse> {
    try {
      const response = await apiRequest('POST', '/api/concierge/request', request);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data.messageId,
          estimatedResponseTime: this.getEstimatedResponseTime(request.priority, request.membershipTier)
        };
      }
      
      return { success: false, error: 'Failed to send concierge request' };
    } catch (error) {
      console.error('Concierge request error:', error);
      return { success: false, error: 'Service temporarily unavailable' };
    }
  }

  // Get estimated response time based on priority and membership
  private getEstimatedResponseTime(priority: string, membershipTier: string): string {
    const isPlatinum = membershipTier === 'platinum';
    
    switch (priority) {
      case 'urgent':
        return isPlatinum ? '5-10 minutes' : '15-30 minutes';
      case 'high':
        return isPlatinum ? '15-30 minutes' : '1-2 hours';
      case 'medium':
        return isPlatinum ? '1-2 hours' : '4-6 hours';
      case 'low':
        return isPlatinum ? '2-4 hours' : '12-24 hours';
      default:
        return '24 hours';
    }
  }

  // Send yacht availability notification
  async sendYachtAvailabilityAlert(yachtId: number, memberPhone: string): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/api/concierge/yacht-alert', {
        yachtId,
        memberPhone,
        type: 'availability'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Yacht alert error:', error);
      return false;
    }
  }

  // Send booking confirmation SMS
  async sendBookingConfirmation(bookingDetails: any, memberPhone: string): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/api/concierge/booking-confirmation', {
        bookingDetails,
        memberPhone
      });
      
      return response.ok;
    } catch (error) {
      console.error('Booking confirmation error:', error);
      return false;
    }
  }

  // Send emergency assistance request
  async sendEmergencyRequest(location: string, description: string): Promise<ConciergeResponse> {
    try {
      const response = await apiRequest('POST', '/api/concierge/emergency', {
        location,
        description,
        timestamp: new Date().toISOString()
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data.messageId,
          estimatedResponseTime: 'Immediate - Emergency services contacted'
        };
      }
      
      return { success: false, error: 'Failed to send emergency request' };
    } catch (error) {
      console.error('Emergency request error:', error);
      return { success: false, error: 'Emergency service temporarily unavailable' };
    }
  }

  // Get concierge service availability
  async getConciergeStatus(): Promise<{ available: boolean; hours: string }> {
    try {
      const response = await apiRequest('GET', '/api/concierge/status');
      
      if (response.ok) {
        return await response.json();
      }
      
      return { available: false, hours: 'Service unavailable' };
    } catch (error) {
      console.error('Concierge status error:', error);
      return { available: false, hours: 'Status unknown' };
    }
  }
}

export const twilioConciergeService = new TwilioConciergeService();