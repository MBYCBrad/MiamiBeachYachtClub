// Twilio Backend Integration for MBYC Concierge Services
import twilio from 'twilio';
import type { Express } from 'express';
import { storage } from './storage';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.warn('⚠️ Twilio credentials not found - concierge service will be disabled');
}

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface ConciergeRequest {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'yacht_booking' | 'service_request' | 'event_planning' | 'dining' | 'transportation' | 'general';
  membershipTier: string;
  userId: number;
}

export class TwilioService {
  // Send concierge request SMS to staff
  async sendConciergeRequest(request: ConciergeRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!twilioClient) {
      return { success: false, error: 'Twilio service not configured' };
    }

    try {
      const user = await storage.getUser(request.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const priorityEmoji = this.getPriorityEmoji(request.priority);
      const categoryLabel = this.getCategoryLabel(request.category);
      
      const messageBody = `${priorityEmoji} MBYC CONCIERGE REQUEST\n\n` +
        `Member: ${user.username} (${request.membershipTier.toUpperCase()})\n` +
        `Category: ${categoryLabel}\n` +
        `Priority: ${request.priority.toUpperCase()}\n\n` +
        `Request: ${request.message}\n\n` +
        `Respond within: ${this.getResponseTime(request.priority, request.membershipTier)}`;

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.CONCIERGE_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER // Fallback for demo
      });

      // Log the concierge request
      console.log(`📱 Concierge request sent - ID: ${message.sid}, Priority: ${request.priority}`);

      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio concierge request error:', error);
      return { success: false, error: 'Failed to send concierge request' };
    }
  }

  // Send yacht availability alert to member
  async sendYachtAvailabilityAlert(yachtId: number, memberPhone: string): Promise<boolean> {
    if (!twilioClient) return false;

    try {
      const yacht = await storage.getYacht(yachtId);
      if (!yacht) return false;

      const messageBody = `🛥️ YACHT AVAILABLE - MBYC\n\n` +
        `${yacht.name} is now available for booking!\n\n` +
        `• Size: ${yacht.size}ft\n` +
        `• Capacity: ${yacht.capacity} guests\n` +
        `• Location: ${yacht.location}\n` +
        `• Price: $${yacht.pricePerHour}/hour\n\n` +
        `Book now through the MBYC app or call concierge.`;

      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: memberPhone
      });

      return true;
    } catch (error) {
      console.error('Yacht availability alert error:', error);
      return false;
    }
  }

  // Send booking confirmation
  async sendBookingConfirmation(bookingDetails: any, memberPhone: string): Promise<boolean> {
    if (!twilioClient) return false;

    try {
      const messageBody = `✅ BOOKING CONFIRMED - MBYC\n\n` +
        `Your reservation has been confirmed!\n\n` +
        `Details:\n` +
        `• Service: ${bookingDetails.serviceName || bookingDetails.yachtName}\n` +
        `• Date: ${new Date(bookingDetails.date).toLocaleDateString()}\n` +
        `• Time: ${new Date(bookingDetails.date).toLocaleTimeString()}\n` +
        `• Total: $${bookingDetails.totalPrice}\n\n` +
        `Confirmation #: ${bookingDetails.confirmationNumber}\n\n` +
        `Thank you for choosing MBYC!`;

      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: memberPhone
      });

      return true;
    } catch (error) {
      console.error('Booking confirmation error:', error);
      return false;
    }
  }

  // Send emergency assistance request
  async sendEmergencyRequest(location: string, description: string, userId: number): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!twilioClient) {
      return { success: false, error: 'Emergency service not available' };
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const messageBody = `🚨 EMERGENCY ALERT - MBYC\n\n` +
        `Member: ${user.username}\n` +
        `Phone: ${user.email}\n` +
        `Location: ${location}\n\n` +
        `Description: ${description}\n\n` +
        `Timestamp: ${new Date().toLocaleString()}\n\n` +
        `IMMEDIATE RESPONSE REQUIRED`;

      // Send to emergency contact
      const message = await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.EMERGENCY_PHONE_NUMBER || process.env.CONCIERGE_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER
      });

      // Also call emergency contact if number is provided
      if (process.env.EMERGENCY_PHONE_NUMBER) {
        await twilioClient.calls.create({
          twiml: `<Response><Say voice="alice">Emergency alert from Miami Beach Yacht Club. Member ${user.username} requires immediate assistance at ${location}. Please check your messages for details.</Say></Response>`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.EMERGENCY_PHONE_NUMBER
        });
      }

      console.log(`🚨 Emergency request sent - ID: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Emergency request error:', error);
      return { success: false, error: 'Failed to send emergency request' };
    }
  }

  // Send membership upgrade notification
  async sendMembershipUpgradeNotification(userId: number, newTier: string): Promise<boolean> {
    if (!twilioClient) return false;

    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      const benefits = this.getMembershipBenefits(newTier);
      
      const messageBody = `🎉 MEMBERSHIP UPGRADED - MBYC\n\n` +
        `Congratulations! Your membership has been upgraded to ${newTier.toUpperCase()}!\n\n` +
        `New benefits include:\n${benefits}\n\n` +
        `Your new privileges are active immediately. Welcome to the next level of luxury!`;

      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.email // Assuming phone stored in email field for demo
      });

      return true;
    } catch (error) {
      console.error('Membership upgrade notification error:', error);
      return false;
    }
  }

  // Helper methods
  private getPriorityEmoji(priority: string): string {
    const emojis = {
      urgent: '🚨',
      high: '⚡',
      medium: '⭐',
      low: '📝'
    };
    return emojis[priority as keyof typeof emojis] || '📝';
  }

  private getCategoryLabel(category: string): string {
    const labels = {
      yacht_booking: 'Yacht Booking',
      service_request: 'Service Request',
      event_planning: 'Event Planning',
      dining: 'Dining Reservation',
      transportation: 'Transportation',
      general: 'General Inquiry'
    };
    return labels[category as keyof typeof labels] || 'General';
  }

  private getResponseTime(priority: string, membershipTier: string): string {
    const isPlatinum = membershipTier.toLowerCase() === 'platinum';
    
    const times = {
      urgent: isPlatinum ? '5-10 minutes' : '15-30 minutes',
      high: isPlatinum ? '15-30 minutes' : '1-2 hours',
      medium: isPlatinum ? '1-2 hours' : '4-6 hours',
      low: isPlatinum ? '2-4 hours' : '12-24 hours'
    };
    
    return times[priority as keyof typeof times] || '24 hours';
  }

  private getMembershipBenefits(tier: string): string {
    const benefits = {
      platinum: '• Access to 95ft+ super yachts\n• 5-minute concierge response\n• Complimentary helicopter transfers\n• Private dining experiences',
      gold: '• Access to 75ft+ luxury yachts\n• 30-minute concierge response\n• Priority event booking\n• Reduced service fees',
      silver: '• Access to 55ft+ yachts\n• 2-hour concierge response\n• Event discounts\n• Standard service fees',
      bronze: '• Access to 35ft+ yachts\n• 12-hour concierge response\n• Basic event access\n• Standard rates'
    };
    
    return benefits[tier.toLowerCase() as keyof typeof benefits] || 'Standard membership benefits';
  }
}

export const twilioService = new TwilioService();

// Express routes setup
export async function setupTwilioRoutes(app: Express) {
  // Concierge request endpoint
  app.post('/api/concierge/request', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { message, priority, category, membershipTier } = req.body;
    
    if (!message || !priority || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await twilioService.sendConciergeRequest({
      message,
      priority,
      category,
      membershipTier: membershipTier || 'bronze',
      userId: req.user!.id
    });

    if (result.success) {
      res.json({ messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  });

  // Yacht availability alert
  app.post('/api/concierge/yacht-alert', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { yachtId, memberPhone } = req.body;
    
    const success = await twilioService.sendYachtAvailabilityAlert(yachtId, memberPhone);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send alert' });
    }
  });

  // Booking confirmation
  app.post('/api/concierge/booking-confirmation', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { bookingDetails, memberPhone } = req.body;
    
    const success = await twilioService.sendBookingConfirmation(bookingDetails, memberPhone);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send confirmation' });
    }
  });

  // Emergency request
  app.post('/api/concierge/emergency', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { location, description } = req.body;
    
    if (!location || !description) {
      return res.status(400).json({ error: 'Location and description required' });
    }

    const result = await twilioService.sendEmergencyRequest(location, description, req.user!.id);

    if (result.success) {
      res.json({ messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  });

  // Concierge status
  app.get('/api/concierge/status', (req, res) => {
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 6 && currentHour <= 22; // 6 AM to 10 PM

    res.json({
      available: !!twilioClient && isBusinessHours,
      hours: 'Available 6:00 AM - 10:00 PM EST',
      emergencyAvailable: !!twilioClient
    });
  });
}