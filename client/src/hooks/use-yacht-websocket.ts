import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface YachtWebSocketEvent {
  type: 'yacht_created' | 'yacht_updated' | 'yacht_deleted';
  yacht?: any;
  yachtId?: number;
  timestamp: string;
}

export function useYachtWebSocket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}&role=${user.role}`;
    
    let ws: WebSocket;
    
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🚤 Yacht WebSocket connected for real-time updates');
      };

      ws.onmessage = (event) => {
        try {
          const data: YachtWebSocketEvent = JSON.parse(event.data);
          
          switch (data.type) {
            case 'yacht_created':
              console.log('🚤 New yacht created:', data.yacht?.name);
              // Invalidate yacht queries to refresh all yacht data
              queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
              
              if (user.role === 'admin') {
                toast({
                  title: "Yacht Added",
                  description: `${data.yacht?.name || 'New yacht'} has been added to the fleet`,
                  variant: "default",
                });
              }
              break;

            case 'yacht_updated':
              console.log('🚤 Yacht updated:', data.yacht?.name);
              // Invalidate specific yacht and general yacht queries
              queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/yacht', data.yacht?.id] });
              
              if (user.role === 'admin') {
                toast({
                  title: "Yacht Updated",
                  description: `${data.yacht?.name || 'Yacht'} details have been updated`,
                  variant: "default",
                });
              }
              break;

            case 'yacht_deleted':
              console.log('🚤 Yacht deleted:', data.yachtId);
              // Invalidate yacht queries and remove specific yacht from cache
              queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
              queryClient.removeQueries({ queryKey: ['/api/yacht', data.yachtId] });
              
              if (user.role === 'admin') {
                toast({
                  title: "Yacht Removed",
                  description: `Yacht has been removed from the fleet`,
                  variant: "destructive",
                });
              }
              break;

            default:
              // Handle other WebSocket events if needed
              break;
          }
        } catch (error) {
          console.error('Failed to parse yacht WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🚤 Yacht WebSocket disconnected:', event.code);
      };

      ws.onerror = (error) => {
        console.error('🚤 Yacht WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create yacht WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, queryClient, toast]);
}