import { 
  users, yachts, services, events, bookings, serviceBookings, eventRegistrations, reviews, mediaAssets, favorites, messages, notifications,
  type User, type InsertUser, type Yacht, type InsertYacht, type Service, type InsertService,
  type Event, type InsertEvent, type Booking, type InsertBooking, type ServiceBooking, 
  type InsertServiceBooking, type EventRegistration, type InsertEventRegistration,
  type Review, type InsertReview, type MediaAsset, type InsertMediaAsset, type Favorite, type InsertFavorite, 
  type Message, type InsertMessage, type Notification, type InsertNotification, UserRole, MembershipTier
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Yacht methods
  getYachts(filters?: { available?: boolean, maxSize?: number, location?: string }): Promise<Yacht[]>;
  getYacht(id: number): Promise<Yacht | undefined>;
  getYachtsByOwner(ownerId: number): Promise<Yacht[]>;
  createYacht(yacht: InsertYacht): Promise<Yacht>;
  updateYacht(id: number, yacht: Partial<InsertYacht>): Promise<Yacht | undefined>;
  deleteYacht(id: number): Promise<boolean>;

  // Service methods
  getServices(filters?: { category?: string, available?: boolean }): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByProvider(providerId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Event methods
  getEvents(filters?: { active?: boolean, upcoming?: boolean }): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByHost(hostId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Booking methods
  getBookings(filters?: { userId?: number, yachtId?: number, status?: string }): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  cancelBooking(id: number): Promise<boolean>;

  // Service Booking methods
  getServiceBookings(filters?: { userId?: number, serviceId?: number, status?: string }): Promise<ServiceBooking[]>;
  getServiceBooking(id: number): Promise<ServiceBooking | undefined>;
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  updateServiceBooking(id: number, booking: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined>;

  // Event Registration methods
  getEventRegistrations(filters?: { userId?: number, eventId?: number }): Promise<EventRegistration[]>;
  getEventRegistration(id: number): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;

  // Review methods
  getReviews(filters?: { targetType?: string, targetId?: number, userId?: number }): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;

  // Media Asset methods
  getMediaAssets(filters?: { type?: string, category?: string, isActive?: boolean }): Promise<MediaAsset[]>;
  getMediaAsset(id: number): Promise<MediaAsset | undefined>;
  getActiveHeroVideo(): Promise<MediaAsset | null>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  updateMediaAsset(id: number, asset: Partial<InsertMediaAsset>): Promise<MediaAsset | null>;
  deleteMediaAsset(id: number): Promise<boolean>;

  // Favorite methods
  getFavorites(userId: number): Promise<Favorite[]>;
  getFavorite(userId: number, targetType: string, targetId: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, targetType: string, targetId: number): Promise<boolean>;

  // Message methods
  getConversations(userId: number): Promise<any[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // Notification methods
  getNotifications(userId: number, filters?: { read?: boolean, type?: string }): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId || null
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Yacht methods
  async getYachts(filters?: { available?: boolean, maxSize?: number, location?: string }): Promise<Yacht[]> {
    let baseQuery = db.select().from(yachts);
    
    if (filters?.available !== undefined) {
      return await baseQuery.where(eq(yachts.isAvailable, filters.available));
    }
    
    return await baseQuery;
  }

  async getYacht(id: number): Promise<Yacht | undefined> {
    const [yacht] = await db.select().from(yachts).where(eq(yachts.id, id));
    return yacht || undefined;
  }

  async getYachtsByOwner(ownerId: number): Promise<Yacht[]> {
    return await db.select().from(yachts).where(eq(yachts.ownerId, ownerId));
  }

  async createYacht(insertYacht: InsertYacht): Promise<Yacht> {
    const [yacht] = await db.insert(yachts).values(insertYacht).returning();
    return yacht;
  }

  async updateYacht(id: number, yachtUpdate: Partial<InsertYacht>): Promise<Yacht | undefined> {
    const [updatedYacht] = await db
      .update(yachts)
      .set(yachtUpdate as any)
      .where(eq(yachts.id, id))
      .returning();
    return updatedYacht || undefined;
  }

  async deleteYacht(id: number): Promise<boolean> {
    const result = await db.delete(yachts).where(eq(yachts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Service methods
  async getServices(filters?: { category?: string, available?: boolean }): Promise<Service[]> {
    let baseQuery = db.select().from(services);
    
    if (filters?.available !== undefined) {
      return await baseQuery.where(eq(services.isAvailable, filters.available));
    }
    
    return await baseQuery;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.providerId, providerId));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Event methods
  async getEvents(filters?: { active?: boolean, upcoming?: boolean }): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventsByHost(hostId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.hostId, hostId));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Booking methods
  async getBookings(filters?: { userId?: number, yachtId?: number, status?: string }): Promise<Booking[]> {
    let baseQuery = db.select().from(bookings);
    
    if (filters?.userId) {
      return await baseQuery.where(eq(bookings.userId, filters.userId));
    }
    
    return await baseQuery;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingUpdate)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async cancelBooking(id: number): Promise<boolean> {
    const result = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Service Booking methods
  async getServiceBookings(filters?: { userId?: number, serviceId?: number, status?: string }): Promise<ServiceBooking[]> {
    let baseQuery = db.select().from(serviceBookings);
    
    if (filters?.userId) {
      return await baseQuery.where(eq(serviceBookings.userId, filters.userId));
    }
    
    return await baseQuery;
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    const [booking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    return booking || undefined;
  }

  async createServiceBooking(insertBooking: InsertServiceBooking): Promise<ServiceBooking> {
    const [booking] = await db.insert(serviceBookings).values(insertBooking).returning();
    return booking;
  }

  async updateServiceBooking(id: number, bookingUpdate: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set(bookingUpdate)
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  // Event Registration methods
  async getEventRegistrations(filters?: { userId?: number, eventId?: number }): Promise<EventRegistration[]> {
    let baseQuery = db.select().from(eventRegistrations);
    
    if (filters?.userId) {
      return await baseQuery.where(eq(eventRegistrations.userId, filters.userId));
    }
    
    return await baseQuery;
  }

  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    const [registration] = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id));
    return registration || undefined;
  }

  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db.insert(eventRegistrations).values(insertRegistration).returning();
    return registration;
  }

  // Review methods
  async getReviews(filters?: { targetType?: string, targetId?: number, userId?: number }): Promise<Review[]> {
    return await db.select().from(reviews);
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  // Media Asset methods
  async getMediaAssets(filters?: { type?: string, category?: string, isActive?: boolean }): Promise<MediaAsset[]> {
    return await db.select().from(mediaAssets);
  }

  async getMediaAsset(id: number): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset || undefined;
  }

  async getActiveHeroVideo(): Promise<MediaAsset | null> {
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(and(
        eq(mediaAssets.category, 'hero'),
        eq(mediaAssets.type, 'video'),
        eq(mediaAssets.isActive, true)
      ));
    return asset || null;
  }

  async createMediaAsset(insertAsset: InsertMediaAsset): Promise<MediaAsset> {
    const [asset] = await db.insert(mediaAssets).values(insertAsset).returning();
    return asset;
  }

  async updateMediaAsset(id: number, assetUpdate: Partial<InsertMediaAsset>): Promise<MediaAsset | null> {
    const [updatedAsset] = await db
      .update(mediaAssets)
      .set(assetUpdate)
      .where(eq(mediaAssets.id, id))
      .returning();
    return updatedAsset || null;
  }

  async deleteMediaAsset(id: number): Promise<boolean> {
    const result = await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Favorite methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavorite(userId: number, targetType: string, targetId: number): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.targetType, targetType),
        eq(favorites.targetId, targetId)
      ));
    return favorite || undefined;
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async deleteFavorite(userId: number, targetType: string, targetId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.targetType, targetType),
        eq(favorites.targetId, targetId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // Additional favorites methods for API compatibility
  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.getFavorites(userId);
  }

  async addFavorite(userId: number, targetType: string, targetId: number): Promise<Favorite> {
    const favoriteData: any = { userId };
    if (targetType === 'yacht') favoriteData.yachtId = targetId;
    else if (targetType === 'service') favoriteData.serviceId = targetId;
    else if (targetType === 'event') favoriteData.eventId = targetId;
    
    return this.createFavorite(favoriteData);
  }

  async removeFavorite(userId: number, targetType: string, targetId: number): Promise<boolean> {
    return this.deleteFavorite(userId, targetType, targetId);
  }

  async isFavorite(userId: number, targetType: string, targetId: number): Promise<boolean> {
    const favorite = await this.getFavorite(userId, targetType, targetId);
    return !!favorite;
  }

  // Message methods
  async getConversations(userId: number): Promise<any[]> {
    const userMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
      .orderBy(desc(messages.createdAt));
    
    return userMessages;
  }

  async getUserConversations(userId: number): Promise<any[]> {
    return this.getConversations(userId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status: 'read' })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  async updateMessageStatus(messageId: number, status: string): Promise<Message | null> {
    const [message] = await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, messageId))
      .returning();
    return message || null;
  }

  // Notification methods
  async getNotifications(userId: number, filters?: { read?: boolean, type?: string }): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (filters?.read !== undefined) {
      query = query.where(eq(notifications.read, filters.read));
    }
    
    if (filters?.type) {
      query = query.where(eq(notifications.type, filters.type));
    }
    
    const results = await query.orderBy(desc(notifications.createdAt));
    return results;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification || undefined;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result.length;
  }
}

export const storage = new DatabaseStorage();