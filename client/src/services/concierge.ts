import { apiRequest } from "@/lib/queryClient";

export interface ConciergeMessage {
  id: string;
  userId: number;
  message: string;
  timestamp: Date;
  sender: 'member' | 'concierge';
  status: 'sent' | 'delivered' | 'read';
}

export interface ConciergeConversation {
  id: string;
  userId: number;
  memberName: string;
  memberTier: string;
  status: 'active' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  lastActivity: Date;
  messages: ConciergeMessage[];
}

export interface VoiceCallRequest {
  userId: number;
  memberName: string;
  memberTier: string;
  callType: 'booking_assistance' | 'general_inquiry' | 'emergency' | 'complaint';
  priority: 'normal' | 'high' | 'urgent';
}

export class ConciergeService {
  private static twilioToken: string | null = null;

  static async initializeTwilioToken(): Promise<string> {
    try {
      const response = await apiRequest("POST", "/api/concierge/token");
      const result = await response.json();
      this.twilioToken = result.token;
      return result.token;
    } catch (error) {
      console.error("Failed to initialize Twilio token:", error);
      throw new Error("Concierge service unavailable");
    }
  }

  // Voice Call Integration
  static async initiateVoiceCall(request: VoiceCallRequest): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/concierge/call", {
        userId: request.userId,
        memberName: request.memberName,
        memberTier: request.memberTier,
        callType: request.callType,
        priority: request.priority
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Voice call initiation failed:", error);
      return false;
    }
  }

  // Chat Service Integration
  static async startChatConversation(userId: number, initialMessage: string): Promise<string> {
    try {
      const response = await apiRequest("POST", "/api/concierge/chat/start", {
        userId,
        message: initialMessage
      });

      const result = await response.json();
      return result.conversationId;
    } catch (error) {
      console.error("Failed to start chat conversation:", error);
      throw new Error("Chat service unavailable");
    }
  }

  static async sendChatMessage(conversationId: string, message: string): Promise<ConciergeMessage> {
    try {
      const response = await apiRequest("POST", "/api/concierge/chat/message", {
        conversationId,
        message
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw new Error("Message sending failed");
    }
  }

  static async getChatHistory(conversationId: string): Promise<ConciergeMessage[]> {
    try {
      const response = await apiRequest("GET", `/api/concierge/chat/${conversationId}/history`);
      return await response.json();
    } catch (error) {
      console.error("Failed to retrieve chat history:", error);
      return [];
    }
  }

  static async getActiveConversations(userId: number): Promise<ConciergeConversation[]> {
    try {
      const response = await apiRequest("GET", `/api/concierge/conversations/${userId}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to retrieve conversations:", error);
      return [];
    }
  }

  static async closeChatConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/concierge/chat/close", {
        conversationId
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Failed to close conversation:", error);
      return false;
    }
  }

  // Emergency and Priority Handling
  static async requestEmergencyAssistance(userId: number, location: string, details: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/concierge/emergency", {
        userId,
        location,
        details,
        timestamp: new Date().toISOString()
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Emergency assistance request failed:", error);
      return false;
    }
  }

  static async scheduleCallback(userId: number, preferredTime: Date, topic: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/concierge/callback", {
        userId,
        preferredTime: preferredTime.toISOString(),
        topic
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Callback scheduling failed:", error);
      return false;
    }
  }

  // Concierge Availability
  static async getConciergeAvailability(): Promise<{
    isAvailable: boolean;
    responseTime: number;
    queuePosition?: number;
  }> {
    try {
      const response = await apiRequest("GET", "/api/concierge/availability");
      return await response.json();
    } catch (error) {
      console.error("Failed to check concierge availability:", error);
      return {
        isAvailable: false,
        responseTime: 0
      };
    }
  }

  // Real-time Chat Updates
  static setupChatListener(conversationId: string, onMessage: (message: ConciergeMessage) => void): () => void {
    // WebSocket or Server-Sent Events for real-time updates
    const eventSource = new EventSource(`/api/concierge/chat/${conversationId}/stream`);
    
    eventSource.onmessage = (event) => {
      const message: ConciergeMessage = JSON.parse(event.data);
      onMessage(message);
    };

    return () => {
      eventSource.close();
    };
  }
}