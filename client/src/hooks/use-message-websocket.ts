import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface MessageWebSocketEvent {
  type: 'new_message' | 'message_read' | 'conversation_updated';
  messageId?: number;
  conversationId?: string;
  messageData?: any;
  senderName?: string;
  content?: string;
}

export function useMessageWebSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    let ws: WebSocket;

    try {
      // Connect to WebSocket with user info
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}&role=${user.role}`;
      
      ws = new WebSocket(wsUrl);
      console.log('💬 Connecting to message WebSocket...');

      ws.onopen = () => {
        console.log('💬 Message WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle notification service messages
          if (data.type === 'notification' && data.notification?.type === 'new_message') {
            const notificationData = data.notification;
            
            // If this is an admin receiving a member message
            if (user.role === 'admin' && notificationData.data?.conversationId) {
              console.log('💬 Admin received new member message:', notificationData.data.senderName);
              
              // Invalidate conversation and message queries for real-time updates
              queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
              queryClient.invalidateQueries({ 
                queryKey: ['/api/messages', notificationData.data.conversationId] 
              });
              
              // Show toast notification to admin
              toast({
                title: "New Member Message",
                description: `${notificationData.data.senderName}: ${notificationData.message}`,
                duration: 5000,
              });
            }
          }
          
          // Handle direct message events
          if (data.type === 'new_message' && data.conversationId) {
            console.log('💬 New message received:', data);
            
            // Invalidate queries to refresh message list
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
            queryClient.invalidateQueries({ 
              queryKey: ['/api/messages', data.conversationId] 
            });
          }

          // Handle message read status updates
          if (data.type === 'message_read' && data.messageId) {
            console.log('💬 Message marked as read:', data.messageId);
            
            // Update specific message read status
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
            if (data.conversationId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/messages', data.conversationId] 
              });
            }
          }

        } catch (error) {
          console.error('Failed to parse message WebSocket data:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('💬 Message WebSocket disconnected:', event.code);
      };

      ws.onerror = (error) => {
        console.error('💬 Message WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create message WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, queryClient, toast]);
}