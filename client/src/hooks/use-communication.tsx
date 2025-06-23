import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types for the communication system
export interface Conversation {
  id: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
  membershipTier: string;
  status: 'active' | 'pending' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  tags: string[];
  currentTripId?: number;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId?: number;
  conversationId: string;
  content: string;
  messageType: 'text' | 'voice' | 'system' | 'trip_alert';
  status: 'sent' | 'delivered' | 'read';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PhoneCall {
  id: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
  agentId?: number;
  callType: 'inbound' | 'outbound';
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  reason: 'trip_start' | 'trip_emergency' | 'trip_end' | 'general_inquiry' | 'concierge_request';
  tripId?: number;
  yachtId?: number;
  notes?: string;
  recordingUrl?: string;
  twilioCallSid?: string;
  metadata?: Record<string, any>;
}

export interface CommunicationAnalytics {
  conversations: {
    total: number;
    active: number;
    urgent: number;
    resolved: number;
    escalated: number;
  };
  calls: {
    total: number;
    missed: number;
    answered: number;
    averageDuration: number;
    emergencyCalls: number;
  };
  messages: {
    total: number;
    today: number;
    averageResponseTime: number;
  };
  membershipTierBreakdown: Record<string, number>;
}

// Custom hooks for communication features
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // 30 seconds for real-time updates
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery<Message[]>({
    queryKey: ["/api/messages", conversationId],
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 15, // 15 seconds for real-time messages
  });
}

export function useRecentCalls() {
  return useQuery<PhoneCall[]>({
    queryKey: ["/api/calls/recent"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // 1 minute
  });
}

export function useCommunicationAnalytics() {
  return useQuery<CommunicationAnalytics>({
    queryKey: ["/api/communication/analytics"],
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hooks for actions
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      content: string;
      messageType?: string;
      recipientId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate conversation messages and conversations list
      queryClient.invalidateQueries({ queryKey: ["/api/messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      memberId: number;
      memberName: string;
      memberPhone: string;
      membershipTier: string;
      priority?: string;
    }) => {
      const response = await apiRequest("POST", "/api/conversations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conversation> }) => {
      const response = await apiRequest("PATCH", `/api/conversations/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useInitiateCall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      memberId: number;
      reason: string;
      tripId?: number;
      yachtId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/calls/initiate", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useAnswerCall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (callId: string) => {
      const response = await apiRequest("POST", `/api/calls/${callId}/answer`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useEndCall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ callId, notes }: { callId: string; notes?: string }) => {
      const response = await apiRequest("POST", `/api/calls/${callId}/end`, { notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/communication/analytics"] });
    },
  });
}

export function useMemberCallRequest() {
  return useMutation({
    mutationFn: async (data: {
      memberPhone: string;
      reason: string;
      tripId?: number;
      emergency?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/calls/member-request", data);
      return response.json();
    },
  });
}