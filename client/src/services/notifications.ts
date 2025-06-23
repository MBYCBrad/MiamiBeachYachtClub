import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
}

export interface NotificationState {
  isConnected: boolean;
  notifications: NotificationMessage[];
  unreadCount: number;
  lastConnectionTime: Date | null;
}

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectInterval = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  private listeners: Array<(notification: NotificationMessage) => void> = [];
  private stateListeners: Array<(state: NotificationState) => void> = [];
  private state: NotificationState = {
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    lastConnectionTime: null
  };

  private updateState(updates: Partial<NotificationState>) {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach(listener => listener(this.state));
  }

  connect(userId: number, role: string) {
    // Prevent multiple connections
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    // Clean up existing connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}&role=${role}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected for notifications');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.updateState({ 
          isConnected: true, 
          lastConnectionTime: new Date() 
        });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', { 
          code: event.code, 
          reason: event.reason,
          wasClean: event.wasClean 
        });
        
        this.isConnecting = false;
        this.stopHeartbeat();
        this.updateState({ isConnected: false });
        
        // Only reconnect on abnormal closure and if we should reconnect
        if (this.shouldReconnect && event.code === 1006 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(userId, role);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.updateState({ isConnected: false });
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(userId: number, role: string) {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    
    setTimeout(() => {
      if (this.shouldReconnect && this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId, role);
      }
    }, delay);
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'connection_established':
        console.log('Connection established:', data.message);
        break;
      case 'notification':
        this.addNotification(data.data);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.log('Received message:', data);
    }
  }

  private addNotification(notification: NotificationMessage) {
    this.updateState({
      notifications: [notification, ...this.state.notifications],
      unreadCount: this.state.unreadCount + 1
    });

    // Notify listeners
    this.listeners.forEach(listener => listener(notification));

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
      setTimeout(() => browserNotification.close(), 5000);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(listener: (notification: NotificationMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToState(listener: (state: NotificationState) => void) {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  markAsRead(notificationId: string) {
    this.updateState({
      notifications: this.state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, this.state.unreadCount - 1)
    });
  }

  markAllAsRead() {
    this.updateState({
      notifications: this.state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.updateState({ isConnected: false });
  }

  getState() {
    return this.state;
  }
}

export const notificationService = new NotificationService();

export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    lastConnectionTime: null
  });
  const [latestNotification, setLatestNotification] = useState<NotificationMessage | null>(null);

  // Use polling instead of WebSocket to avoid connection issues
  useEffect(() => {
    if (!user) return;

    // Simple polling-based notification system
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        if (response.ok) {
          const notifications = await response.json();
          setState(prev => ({
            ...prev,
            notifications: notifications.slice(0, 10), // Latest 10 notifications
            unreadCount: notifications.filter((n: any) => !n.read).length,
            isConnected: true,
            lastConnectionTime: new Date()
          }));
        }
      } catch (error) {
        console.log('Notification polling error:', error);
        setState(prev => ({ ...prev, isConnected: false }));
      }
    }, 30000); // Poll every 30 seconds

    // Initial load
    fetch('/api/admin/notifications')
      .then(response => response.json())
      .then(notifications => {
        setState({
          isConnected: true,
          notifications: notifications.slice(0, 10),
          unreadCount: notifications.filter((n: any) => !n.read).length,
          lastConnectionTime: new Date()
        });
      })
      .catch(() => setState(prev => ({ ...prev, isConnected: false })));

    return () => clearInterval(pollInterval);
  }, [user]);

  return {
    ...state,
    latestNotification,
    markAsRead: () => {}, // Placeholder - implement if needed
    markAllAsRead: () => {}, // Placeholder - implement if needed
    disconnect: () => {} // Placeholder - not needed for polling
  };
}