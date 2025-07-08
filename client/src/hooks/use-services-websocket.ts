import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useServicesWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('🛠️ Connecting to services WebSocket...');
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🛠️ Services WebSocket connected');
        // Send services channel subscription
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'services'
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'service_updated' || data.type === 'service_created' || data.type === 'service_deleted') {
            console.log('🛠️ Service update received:', data);
            // Invalidate service-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/services'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
            queryClient.invalidateQueries({ queryKey: ['/api/provider/services'] });
          }
        } catch (error) {
          console.error('🛠️ Error parsing services WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('🛠️ Services WebSocket disconnected:', event.code);
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('🛠️ Services WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}