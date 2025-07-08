import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useYachtWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('🚢 Connecting to yacht WebSocket...');
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🚢 Yacht WebSocket connected');
        // Send yacht channel subscription
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'yachts'
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'yacht_updated' || data.type === 'yacht_created' || data.type === 'yacht_deleted') {
            console.log('🚢 Yacht update received:', data);
            // Invalidate yacht-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
            queryClient.invalidateQueries({ queryKey: ['/api/owner/yachts'] });
          }
        } catch (error) {
          console.error('🚢 Error parsing yacht WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('🚢 Yacht WebSocket disconnected:', event.code);
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('🚢 Yacht WebSocket error:', error);
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