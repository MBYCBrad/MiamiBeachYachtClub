import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { storage } from './storage';
import { twilioService } from './twilio';

export interface NotificationPayload {
  type: 'booking_created' | 'booking_cancelled' | 'booking_updated' | 'service_booked' | 'event_registered';
  userId: number;
  targetUserId?: number; // For yacht owner notifications
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
      
      // Extract user info from query params or headers
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const userId = parseInt(url.searchParams.get('userId') || '0');
      const role = url.searchParams.get('role') || 'member';

      if (!userId) {
        ws.close(1008, 'Missing user ID');
        return;
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
      ws.on('close', () => {
        this.connections.delete(userId);
        console.log(`👋 User ${userId} disconnected from WebSocket`);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        this.connections.delete(userId);
      });

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connection_established',
        message: 'Real-time notifications active',
        timestamp: new Date().toISOString()
      });
    });

    // Start heartbeat to keep connections alive
    this.startHeartbeat();
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
        // Handle subscription to specific notification types
        console.log(`📬 User ${userId} subscribed to ${message.channels?.join(', ') || 'all'} notifications`);
        break;
      default:
        console.log(`📨 Received message from user ${userId}:`, message);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const staleConnections: number[] = [];

      this.connections.forEach((connection, userId) => {
        const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
        
        if (timeSinceLastPing > 60000) { // 1 minute timeout
          staleConnections.push(userId);
        } else if (connection.ws.readyState === WebSocket.OPEN) {
          // Send ping
          this.sendToUser(userId, { 
            type: 'ping', 
            timestamp: now.toISOString() 
          });
        }
      });

      // Clean up stale connections
      staleConnections.forEach(userId => {
        const connection = this.connections.get(userId);
        if (connection) {
          connection.ws.terminate();
          this.connections.delete(userId);
          console.log(`🧹 Cleaned up stale connection for user ${userId}`);
        }
      });
    }, 30000); // Every 30 seconds
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

  async notifyBookingCreated(booking: any) {
    const yacht = await storage.getYacht(booking.yachtId);
    if (!yacht || !yacht.ownerId) return;

    const member = await storage.getUser(booking.userId);
    if (!member) return;

    const notification: NotificationPayload = {
      type: 'booking_created',
      userId: booking.userId,
      targetUserId: yacht.ownerId,
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
      userId: booking.userId,
      targetUserId: yacht.ownerId,
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
      userId: serviceBooking.userId,
      targetUserId: service.providerId,
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
      userId: eventRegistration.userId,
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