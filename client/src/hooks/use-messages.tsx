import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, InsertMessage } from "@shared/schema";

export function useMessages(conversationId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get messages for a specific conversation
  const messagesQuery = useQuery({
    queryKey: ["/api/messages", conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      return apiRequest("GET", `/api/messages/${conversationId}`).then(res => res.json());
    },
    enabled: !!conversationId,
    staleTime: 30000, // 30 seconds
  });

  // Get user conversations
  const conversationsQuery = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => apiRequest("GET", "/api/conversations").then(res => res.json()),
    staleTime: 60000, // 1 minute
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: Omit<InsertMessage, 'senderId'>) => {
      const fullMessageData = {
        ...messageData,
        conversationId: conversationId || messageData.conversationId
      };
      console.log('Sending message with data:', fullMessageData);
      const res = await apiRequest("POST", "/api/messages", fullMessageData);
      return res.json();
    },
    onSuccess: (newMessage: Message) => {
      // Update messages cache
      if (conversationId) {
        queryClient.setQueryData(["/api/messages", conversationId], (old: Message[] = []) => {
          return [...old, newMessage];
        });
      }
      
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Message failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/status`, { status: "read" });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate messages and conversations to update read status
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    conversations: conversationsQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    isLoadingConversations: conversationsQuery.isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    error: messagesQuery.error || conversationsQuery.error,
  };
}

export function useConversations() {
  const { toast } = useToast();

  const conversationsQuery = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => apiRequest("GET", "/api/conversations").then(res => res.json()),
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
  };
}