import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useRef, useCallback } from 'react';

export interface NotificationMessage {
  type: 'new_booking' | 'booking_cancelled' | 'service_booking' | 'event_registration' | 'connection_established' | 'ping' | 'pong';
  title?: string;
  message?: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read?: boolean;
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
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(notification: NotificationMessage) => void> = [];
  private stateListeners: Array<(state: NotificationState) => void> = [];
  private state: NotificationState = {
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    lastConnectionTime: null
  };

  connect(userId: number, role: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}&role=${role}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected for notifications');
      this.reconnectAttempts = 0;
      this.updateState({
        isConnected: true,
        lastConnectionTime: new Date()
      });
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const notification: NotificationMessage = JSON.parse(event.data);
        this.handleNotification(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.updateState({ isConnected: false });
      this.stopHeartbeat();
      this.attemptReconnect(userId, role);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleNotification(notification: NotificationMessage) {
    if (notification.type === 'ping') {
      this.send({ type: 'pong', timestamp: new Date().toISOString() });
      return;
    }

    if (notification.type === 'pong' || notification.type === 'connection_established') {
      return;
    }

    // Add to notifications list
    const newNotifications = [notification, ...this.state.notifications].slice(0, 50); // Keep last 50
    this.updateState({
      notifications: newNotifications,
      unreadCount: this.state.unreadCount + 1
    });

    // Notify listeners
    this.listeners.forEach(listener => listener(notification));

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  private showBrowserNotification(notification: NotificationMessage) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title || 'MBYC Notification', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type,
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }

  private attemptReconnect(userId: number, role: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(userId, role);
    }, delay);
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

  private updateState(newState: Partial<NotificationState>) {
    this.state = { ...this.state, ...newState };
    this.stateListeners.forEach(listener => listener(this.state));
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

  markAsRead(notificationIndex?: number) {
    if (notificationIndex !== undefined) {
      // Mark specific notification as read
      const notifications = [...this.state.notifications];
      if (notifications[notificationIndex]) {
        notifications[notificationIndex] = { ...notifications[notificationIndex], read: true };
        this.updateState({ notifications, unreadCount: Math.max(0, this.state.unreadCount - 1) });
      }
    } else {
      // Mark all as read
      const notifications = this.state.notifications.map(n => ({ ...n, read: true }));
      this.updateState({ notifications, unreadCount: 0 });
    }
  }

  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
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
  const [state, setState] = useState<NotificationState>(notificationService.getState());
  const [latestNotification, setLatestNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    if (user) {
      notificationService.connect(user.id, user.role);
      notificationService.requestPermission();
    }

    const unsubscribeState = notificationService.subscribeToState(setState);
    const unsubscribeNotifications = notificationService.subscribe(setLatestNotification);

    return () => {
      unsubscribeState();
      unsubscribeNotifications();
    };
  }, [user]);

  useEffect(() => {
    return () => {
      notificationService.disconnect();
    };
  }, []);

  const markAsRead = useCallback((index?: number) => {
    notificationService.markAsRead(index);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAsRead();
  }, []);

  return {
    ...state,
    latestNotification,
    markAsRead,
    markAllAsRead
  };
}