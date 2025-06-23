import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { storage } from './storage';
import { twilioService } from './twilio';

export interface NotificationPayload {
  type: 'booking_created' | 'booking_cancelled' | 'booking_updated' | 'service_booked' | 'event_registered' | 
        'yacht_added' | 'service_added' | 'event_added' | 'yacht_updated' | 'service_updated' | 'event_updated' |
        'payment_processed' | 'member_joined' | 'content_updated';
  userId: number;
  targetUserIds?: number[]; // Multiple targets for role-based notifications
  targetRoles?: string[]; // Broadcast to specific roles
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  broadcastToRole?: string; // Broadcast to all users of a specific role
}

export interface ConnectedUser {
  userId: number;
  role: string;
  ws: WebSocket;
  lastPing: Date;
}

export class NotificationService {
  private wss: WebSocketServer | null = null;
  private connections: Map<number, ConnectedUser> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/notifications',
      clientTracking: true
    });

    this.wss.on('connection', (ws, req) => {
      console.log('📱 New WebSocket connection established');
      
      // Extract user info from query params safely
      let userId = 60; // Default to admin
      let role = 'admin';
      
      try {
        if (req.url) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const userIdParam = url.searchParams.get('userId');
          const roleParam = url.searchParams.get('role');
          
          if (userIdParam && !isNaN(parseInt(userIdParam))) {
            userId = parseInt(userIdParam);
          }
          if (roleParam) {
            role = roleParam;
          }
        }
      } catch (error) {
        console.log('Using default user info due to URL parsing error');
      }

      // Store connection
      const connection: ConnectedUser = {
        userId,
        role,
        ws,
        lastPing: new Date()
      };
      
      this.connections.set(userId, connection);
      console.log(`👤 User ${userId} (${role}) connected via WebSocket`);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(userId, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        this.connections.delete(userId);
        console.log(`👋 User ${userId} disconnected from WebSocket (code: ${code}, reason: ${reason})`);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        this.connections.delete(userId);
      });

      // Send welcome message and keep connection alive
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'connection_established',
            message: 'Real-time notifications active',
            timestamp: new Date().toISOString()
          }));
          console.log(`✅ Welcome message sent to user ${userId}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send welcome message to user ${userId}:`, error);
      }
    });

    console.log('🔔 Notification service initialized with WebSocket support');
  }

  private handleClientMessage(userId: number, message: any) {
    switch (message.type) {
      case 'ping':
        const connection = this.connections.get(userId);
        if (connection) {
          connection.lastPing = new Date();
          this.sendToUser(userId, { type: 'pong', timestamp: new Date().toISOString() });
        }
        break;
      case 'subscribe':
        console.log(`📬 User ${userId} subscribed to ${message.channels?.join(', ') || 'all'} notifications`);
        break;
      default:
        console.log(`📨 Received message from user ${userId}:`, message);
    }
  }

  private sendToUser(userId: number, data: any): boolean {
    const connection = this.connections.get(userId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`❌ Failed to send message to user ${userId}:`, error);
      this.connections.delete(userId);
      return false;
    }
  }

  // Send notification to database and WebSocket
  async sendNotification(payload: NotificationPayload) {
    try {
      // Store notification in database
      const notification = await storage.createNotification({
        type: payload.type,
        userId: payload.userId,
        title: this.getNotificationTitle(payload.type),
        message: this.getNotificationMessage(payload),
        data: payload.data,
        priority: payload.priority,
        read: false
      });

      // Send real-time WebSocket notification
      this.sendToUser(payload.userId, {
        type: 'notification',
        data: notification
      });

      return notification;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  }

  private getNotificationTitle(type: string): string {
    switch (type) {
      case 'booking_created': return 'New Yacht Booking';
      case 'service_booked': return 'Service Booked';
      case 'event_registered': return 'Event Registration';
      case 'content_updated': return 'New Content Available';
      default: return 'Notification';
    }
  }

  private getNotificationMessage(payload: NotificationPayload): string {
    switch (payload.type) {
      case 'booking_created':
        return `Your yacht ${payload.data?.yachtName} has been booked`;
      case 'service_booked':
        return `Your service ${payload.data?.serviceName} has been booked`;
      case 'event_registered':
        return `New registration for ${payload.data?.eventTitle}`;
      case 'content_updated':
        return `New ${payload.data?.contentType} available: ${payload.data?.yachtName || payload.data?.serviceName || payload.data?.eventTitle}`;
      default:
        return 'You have a new notification';
    }
  }

  async notifyBookingCreated(booking: any) {
    const yacht = await storage.getYacht(booking.yachtId);
    if (!yacht || !yacht.ownerId) return;

    const member = await storage.getUser(booking.userId);
    if (!member) return;

    const notification: NotificationPayload = {
      type: 'booking_created',
      userId: yacht.ownerId!,
      targetUserIds: yacht.ownerId ? [yacht.ownerId] : [],
      data: {
        bookingId: booking.id,
        yachtName: yacht.name,
        memberName: member.username,
        startDate: booking.startDate,
        endDate: booking.endDate,
        yacht: yacht,
        member: member
      },
      timestamp: new Date(),
      priority: 'high'
    };

    // Send real-time notification to yacht owner
    const sent = this.sendToUser(yacht.ownerId, {
      type: 'new_booking',
      title: 'New Yacht Booking',
      message: `${member.username} booked ${yacht.name}`,
      data: notification.data,
      priority: notification.priority,
      timestamp: notification.timestamp.toISOString()
    });

    // If WebSocket delivery failed, send SMS backup
    if (!sent) {
      const owner = await storage.getUser(yacht.ownerId);
      if (owner) {
        await twilioService.sendYachtAvailabilityAlert(yacht.id, '');
      }
    }

    console.log(`Booking notification sent for yacht ${yacht.name} to owner ${yacht.ownerId}`);
  }

  async notifyBookingCancelled(booking: any) {
    const yacht = await storage.getYacht(booking.yachtId);
    if (!yacht || !yacht.ownerId) return;

    const member = await storage.getUser(booking.userId);
    if (!member) return;

    const notification: NotificationPayload = {
      type: 'booking_cancelled',
      userId: yacht.ownerId!,
      targetUserIds: yacht.ownerId ? [yacht.ownerId] : [],
      data: {
        bookingId: booking.id,
        yachtName: yacht.name,
        memberName: member.username,
        originalStartDate: booking.startDate,
        originalEndDate: booking.endDate
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    this.sendToUser(yacht.ownerId, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${member.username} cancelled booking for ${yacht.name}`,
      data: notification.data,
      priority: notification.priority,
      timestamp: notification.timestamp.toISOString()
    });

    console.log(`Cancellation notification sent for yacht ${yacht.name} to owner ${yacht.ownerId}`);
  }

  async notifyServiceBooked(serviceBooking: any) {
    const service = await storage.getService(serviceBooking.serviceId);
    if (!service || !service.providerId) return;

    const member = await storage.getUser(serviceBooking.userId);
    if (!member) return;

    const notification: NotificationPayload = {
      type: 'service_booked',
      userId: service.providerId!,
      targetUserIds: service.providerId ? [service.providerId] : [],
      data: {
        bookingId: serviceBooking.id,
        serviceName: service.name,
        memberName: member.username,
        bookingDate: serviceBooking.bookingDate,
        totalPrice: serviceBooking.totalPrice
      },
      timestamp: new Date(),
      priority: 'high'
    };

    this.sendToUser(service.providerId, {
      type: 'service_booking',
      title: 'New Service Booking',
      message: `${member.username} booked ${service.name}`,
      data: notification.data,
      priority: notification.priority,
      timestamp: notification.timestamp.toISOString()
    });

    console.log(`Service booking notification sent to provider ${service.providerId}`);
  }

  async notifyEventRegistration(eventRegistration: any) {
    const event = await storage.getEvent(eventRegistration.eventId);
    if (!event) return;

    const member = await storage.getUser(eventRegistration.userId);
    if (!member) return;

    // Notify all admins about new event registrations
    const admins = await storage.getAllUsers();
    const adminUsers = admins.filter(user => user.role === 'admin');

    const notification: NotificationPayload = {
      type: 'event_registered',
      userId: event.hostId!,
      targetUserIds: event.hostId ? [event.hostId] : [],
      data: {
        registrationId: eventRegistration.id,
        eventTitle: event.title,
        memberName: member.username,
        registrationDate: eventRegistration.createdAt
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    adminUsers.forEach(admin => {
      this.sendToUser(admin.id, {
        type: 'event_registration',
        title: '🎉 New Event Registration',
        message: `${member.username} registered for ${event.title}`,
        data: notification.data,
        priority: notification.priority,
        timestamp: notification.timestamp.toISOString()
      });
    });

    console.log(`🔔 Event registration notifications sent to ${adminUsers.length} admins`);
  }

  getConnectionStats() {
    const stats = {
      totalConnections: this.connections.size,
      connectionsByRole: {} as Record<string, number>,
      activeConnections: 0
    };

    this.connections.forEach(connection => {
      stats.connectionsByRole[connection.role] = (stats.connectionsByRole[connection.role] || 0) + 1;
      if (connection.ws.readyState === WebSocket.OPEN) {
        stats.activeConnections++;
      }
    });

    return stats;
  }

  broadcast(data: any, roleFilter?: string) {
    let sentCount = 0;
    this.connections.forEach(connection => {
      if (!roleFilter || connection.role === roleFilter) {
        if (this.sendToUser(connection.userId, data)) {
          sentCount++;
        }
      }
    });
    return sentCount;
  }

  // Send notifications to multiple users (role-based)
  async sendMultiUserNotification(payload: NotificationPayload) {
    try {
      const notifications = [];
      
      // Send to specific target users
      if (payload.targetUserIds && payload.targetUserIds.length > 0) {
        for (const userId of payload.targetUserIds) {
          const userPayload = { ...payload, userId };
          const notification = await this.sendNotification(userPayload);
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('❌ Failed to send multi-user notification:', error);
      throw error;
    }
  }

  // Broadcast to all users of specific roles
  async broadcastToRoles(payload: NotificationPayload) {
    try {
      if (!payload.targetRoles || payload.targetRoles.length === 0) return [];

      const notifications = [];
      
      // Get all users with target roles
      for (const role of payload.targetRoles) {
        const roleUsers = await storage.getUsersByRole(role);
        
        for (const user of roleUsers) {
          const userPayload = { ...payload, userId: user.id };
          const notification = await this.sendNotification(userPayload);
          notifications.push(notification);
          
          // Send real-time update via WebSocket
          const connection = this.connections.get(user.id);
          if (connection && connection.ws.readyState === WebSocket.OPEN) {
            connection.ws.send(JSON.stringify({
              type: 'broadcast',
              data: notification
            }));
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error('❌ Failed to broadcast to roles:', error);
      throw error;
    }
  }

  // Cross-role data synchronization notification
  async notifyDataUpdate(updateType: string, data: any, excludeUserId?: number) {
    try {
      // Broadcast real-time data update to all connected users
      this.connections.forEach((connection, userId) => {
        if (userId !== excludeUserId && connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify({
            type: 'data_update',
            updateType,
            data
          }));
        }
      });

      console.log(`🔄 Data update broadcasted: ${updateType}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to notify data update:', error);
      throw error;
    }
  }

  // Notify yacht owner when their yacht is booked
  async notifyYachtOwner(yachtId: number, bookingData: any) {
    try {
      const yacht = await storage.getYacht(yachtId);
      if (!yacht?.ownerId) return;

      const payload: NotificationPayload = {
        type: 'booking_created',
        userId: yacht.ownerId,
        data: { yachtId, yachtName: yacht.name, ...bookingData },
        timestamp: new Date(),
        priority: 'high'
      };

      return await this.sendNotification(payload);
    } catch (error) {
      console.error('❌ Failed to notify yacht owner:', error);
      throw error;
    }
  }

  // Notify service provider when their service is booked
  async notifyServiceProvider(serviceId: number, bookingData: any) {
    try {
      const service = await storage.getService(serviceId);
      if (!service?.providerId) return;

      const payload: NotificationPayload = {
        type: 'service_booked',
        userId: service.providerId,
        data: { serviceId, serviceName: service.name, ...bookingData },
        timestamp: new Date(),
        priority: 'high'
      };

      return await this.sendNotification(payload);
    } catch (error) {
      console.error('❌ Failed to notify service provider:', error);
      throw error;
    }
  }

  // Notify all members when new content is added
  async notifyMembersOfNewContent(contentType: string, contentData: any) {
    try {
      const payload: NotificationPayload = {
        type: 'content_updated',
        userId: 0,
        targetRoles: ['member'],
        data: { contentType, ...contentData },
        timestamp: new Date(),
        priority: 'medium'
      };

      return await this.broadcastToRoles(payload);
    } catch (error) {
      console.error('❌ Failed to notify members of new content:', error);
      throw error;
    }
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.connections.forEach(connection => {
      connection.ws.close(1001, 'Server shutdown');
    });
    
    this.connections.clear();
    
    if (this.wss) {
      this.wss.close();
    }
    
    console.log('🔔 Notification service shut down');
  }
}

export const notificationService = new NotificationService();