import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ServiceWebSocketMessage {
  type: 'service_added' | 'service_updated' | 'service_deleted';
  data: any;
}

export function useServicesWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Services WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: ServiceWebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'service_added':
              console.log('Service added via WebSocket:', message.data);
              // Invalidate services cache to trigger refetch
              queryClient.invalidateQueries({ queryKey: ['/api/services'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
              break;
              
            case 'service_updated':
              console.log('Service updated via WebSocket:', message.data);
              // Invalidate both general services and specific service cache
              queryClient.invalidateQueries({ queryKey: ['/api/services'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/services', message.data.id] });
              break;
              
            case 'service_deleted':
              console.log('Service deleted via WebSocket:', message.data);
              // Invalidate services cache to trigger refetch
              queryClient.invalidateQueries({ queryKey: ['/api/services'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
              // Remove specific service from cache
              queryClient.removeQueries({ queryKey: ['/api/admin/services', message.data.id] });
              break;
              
            default:
              console.log('Unknown service WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing services WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Services WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting services WebSocket in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Services WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create services WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect
  };
}