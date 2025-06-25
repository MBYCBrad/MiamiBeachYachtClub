import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, or, desc, asc, like, gt, lt, gte, lte, inArray, sql, ne } from 'drizzle-orm';
import ws from "ws";
import bcrypt from 'bcryptjs';
import ConnectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { 
  users, staff, yachts, services, events, bookings, serviceBookings, eventRegistrations,
  reviews, mediaAssets, favorites, messages, conversations, notifications, phoneCalls,
  crewMembers, crewAssignments,
  type User, type InsertUser, type Staff, type InsertStaff, type Yacht, type InsertYacht,
  type Service, type InsertService, type Event, type InsertEvent, type Booking, type InsertBooking,
  type ServiceBooking, type InsertServiceBooking, type EventRegistration, type InsertEventRegistration,
  type Review, type InsertReview, type MediaAsset, type InsertMediaAsset,
  type Favorite, type InsertFavorite, type Message, type InsertMessage,
  type Conversation, type InsertConversation, type Notification, type InsertNotification,
  type PhoneCall, type InsertPhoneCall, type CrewMember, type InsertCrewMember,
  type CrewAssignment, type InsertCrewAssignment
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { users, staff, yachts, services, events, bookings, serviceBookings, eventRegistrations, reviews, mediaAssets, favorites, messages, conversations, notifications, phoneCalls, crewMembers, crewAssignments } });

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

  // Staff methods - completely separate from user methods
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByUsername(username: string): Promise<Staff | undefined>;
  getStaffByUserId(userId: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
  getAllStaff(): Promise<Staff[]>;
  getStaffByRole(role: string): Promise<Staff[]>;
  getStaffByDepartment(department: string): Promise<Staff[]>;

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

  // Favorite methods
  getFavorites(userId: number): Promise<Favorite[]>;
  getFavorite(id: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;

  // Message methods
  getMessages(conversationId: string): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;

  // Conversation methods
  getConversations(userId?: number): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Notification methods
  getNotifications(filters?: { userId?: number, read?: boolean }): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Phone Call methods
  getPhoneCalls(filters?: { memberId?: number, status?: string }): Promise<PhoneCall[]>;
  getPhoneCall(id: string): Promise<PhoneCall | undefined>;
  createPhoneCall(phoneCall: InsertPhoneCall): Promise<PhoneCall>;
  updatePhoneCall(id: string, phoneCall: Partial<InsertPhoneCall>): Promise<PhoneCall | undefined>;

  // Crew methods
  getCrewMembers(): Promise<CrewMember[]>;
  getCrewMember(id: number): Promise<CrewMember | undefined>;
  createCrewMember(crewMember: InsertCrewMember): Promise<CrewMember>;
  updateCrewMember(id: number, crewMember: Partial<InsertCrewMember>): Promise<CrewMember | undefined>;

  // Crew Assignment methods
  getCrewAssignments(filters?: { bookingId?: number, status?: string }): Promise<CrewAssignment[]>;
  getCrewAssignment(id: string): Promise<CrewAssignment | undefined>;
  createCrewAssignment(assignment: InsertCrewAssignment): Promise<CrewAssignment>;
  updateCrewAssignment(id: string, assignment: Partial<InsertCrewAssignment>): Promise<CrewAssignment | undefined>;

  // Admin methods
  getAdminUsers(): Promise<User[]>;
  getAdminYachts(): Promise<Yacht[]>;
  getAdminServices(): Promise<Service[]>;
  getAdminEvents(): Promise<Event[]>;
  getAdminBookings(): Promise<Booking[]>;
  getAdminServiceBookings(): Promise<ServiceBooking[]>;
  getAdminEventRegistrations(): Promise<EventRegistration[]>;
  getAdminPayments(): Promise<any[]>;
  getAdminNotifications(): Promise<Notification[]>;
  deleteUser(id: number): Promise<boolean>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PgSession = ConnectPgSimple(session);
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
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

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password if provided
    const processedData = { ...userData };
    if (processedData.password) {
      const salt = await bcrypt.genSalt(10);
      processedData.password = await bcrypt.hash(processedData.password, salt);
    }

    const [newUser] = await db
      .insert(users)
      .values(processedData as any)
      .returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if provided
    const processedData = { ...userData };
    if (processedData.password) {
      const salt = await bcrypt.genSalt(10);
      processedData.password = await bcrypt.hash(processedData.password, salt);
    }

    const [updatedUser] = await db
      .update(users)
      .set(processedData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId || null
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.username, username));
    return staffMember || undefined;
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.createdBy, userId));
    return staffMember || undefined;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    // Hash password if provided
    const processedData = { ...staffData };
    if (processedData.password) {
      const salt = await bcrypt.genSalt(10);
      processedData.password = await bcrypt.hash(processedData.password, salt);
    }

    const [newStaff] = await db
      .insert(staff)
      .values(processedData as any)
      .returning();
    return newStaff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
    // Hash password if provided
    const processedData = { ...staffData };
    if (processedData.password) {
      const salt = await bcrypt.genSalt(10);
      processedData.password = await bcrypt.hash(processedData.password, salt);
    }

    const [updatedStaff] = await db
      .update(staff)
      .set(processedData as any)
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff || undefined;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async getStaffByRole(role: string): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.role, role));
  }

  async getStaffByDepartment(department: string): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.department, department));
  }

  // Yacht methods
  async getYachts(filters?: { available?: boolean, maxSize?: number, location?: string }): Promise<Yacht[]> {
    let query = db.select().from(yachts);
    
    const conditions = [];
    if (filters?.available !== undefined) {
      conditions.push(eq(yachts.isAvailable, filters.available));
    }
    if (filters?.maxSize) {
      conditions.push(lte(yachts.size, filters.maxSize));
    }
    if (filters?.location) {
      conditions.push(eq(yachts.location, filters.location));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getYacht(id: number): Promise<Yacht | undefined> {
    const [yacht] = await db.select().from(yachts).where(eq(yachts.id, id));
    return yacht || undefined;
  }

  async getYachtsByOwner(ownerId: number): Promise<Yacht[]> {
    return await db.select().from(yachts).where(eq(yachts.ownerId, ownerId));
  }

  async createYacht(yachtData: InsertYacht): Promise<Yacht> {
    const [newYacht] = await db
      .insert(yachts)
      .values(yachtData as any)
      .returning();
    return newYacht;
  }

  async updateYacht(id: number, yachtData: Partial<InsertYacht>): Promise<Yacht | undefined> {
    const [updatedYacht] = await db
      .update(yachts)
      .set(yachtData as any)
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
    let query = db.select().from(services);
    
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(services.category, filters.category));
    }
    if (filters?.available !== undefined) {
      conditions.push(eq(services.isAvailable, filters.available));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.providerId, providerId));
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(serviceData as any)
      .returning();
    return newService;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
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
    let query = db.select().from(events);
    
    const conditions = [];
    if (filters?.active !== undefined) {
      conditions.push(eq(events.isActive, filters.active));
    }
    if (filters?.upcoming) {
      conditions.push(gt(events.startTime, new Date()));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventsByHost(hostId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.hostId, hostId));
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(eventData as any)
      .returning();
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
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
    let query = db.select().from(bookings);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(bookings.userId, filters.userId));
    }
    if (filters?.yachtId) {
      conditions.push(eq(bookings.yachtId, filters.yachtId));
    }
    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingData as any)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData as any)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async cancelBooking(id: number): Promise<boolean> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();
    return !!updatedBooking;
  }

  // Service Booking methods
  async getServiceBookings(filters?: { userId?: number, serviceId?: number, status?: string }): Promise<ServiceBooking[]> {
    let query = db.select().from(serviceBookings);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(serviceBookings.userId, filters.userId));
    }
    if (filters?.serviceId) {
      conditions.push(eq(serviceBookings.serviceId, filters.serviceId));
    }
    if (filters?.status) {
      conditions.push(eq(serviceBookings.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    const [serviceBooking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    return serviceBooking || undefined;
  }

  async createServiceBooking(serviceBookingData: InsertServiceBooking): Promise<ServiceBooking> {
    const [newServiceBooking] = await db
      .insert(serviceBookings)
      .values(serviceBookingData as any)
      .returning();
    return newServiceBooking;
  }

  async updateServiceBooking(id: number, serviceBookingData: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
    const [updatedServiceBooking] = await db
      .update(serviceBookings)
      .set(serviceBookingData)
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedServiceBooking || undefined;
  }

  // Event Registration methods
  async getEventRegistrations(filters?: { userId?: number, eventId?: number }): Promise<EventRegistration[]> {
    let query = db.select().from(eventRegistrations);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(eventRegistrations.userId, filters.userId));
    }
    if (filters?.eventId) {
      conditions.push(eq(eventRegistrations.eventId, filters.eventId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    const [eventRegistration] = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id));
    return eventRegistration || undefined;
  }

  async createEventRegistration(eventRegistrationData: InsertEventRegistration): Promise<EventRegistration> {
    const [newEventRegistration] = await db
      .insert(eventRegistrations)
      .values(eventRegistrationData as any)
      .returning();
    return newEventRegistration;
  }

  // Review methods
  async getReviews(filters?: { targetType?: string, targetId?: number, userId?: number }): Promise<Review[]> {
    let query = db.select().from(reviews);
    
    const conditions = [];
    if (filters?.targetId && filters?.targetType === 'service') {
      conditions.push(eq(reviews.serviceId, filters.targetId));
    }
    if (filters?.targetId && filters?.targetType === 'yacht') {
      conditions.push(eq(reviews.yachtId, filters.targetId));
    }
    if (filters?.targetId && filters?.targetType === 'event') {
      conditions.push(eq(reviews.eventId, filters.targetId));
    }
    if (filters?.userId) {
      conditions.push(eq(reviews.memberId, filters.userId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return newReview;
  }

  // Media Asset methods
  async getMediaAssets(filters?: { type?: string, category?: string, isActive?: boolean }): Promise<MediaAsset[]> {
    return await db.select().from(mediaAssets);
  }

  async getMediaAsset(id: number): Promise<MediaAsset | undefined> {
    const [mediaAsset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return mediaAsset || undefined;
  }

  async getActiveHeroVideo(): Promise<MediaAsset | null> {
    const [heroVideo] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.mimetype, 'video/mp4'))
      .limit(1);
    return heroVideo || null;
  }

  async createMediaAsset(assetData: InsertMediaAsset): Promise<MediaAsset> {
    const [newAsset] = await db
      .insert(mediaAssets)
      .values(assetData)
      .returning();
    return newAsset;
  }

  async updateMediaAsset(id: number, assetData: Partial<InsertMediaAsset>): Promise<MediaAsset | null> {
    const [updatedAsset] = await db
      .update(mediaAssets)
      .set(assetData)
      .where(eq(mediaAssets.id, id))
      .returning();
    return updatedAsset || null;
  }

  // Favorite methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavorite(id: number): Promise<Favorite | undefined> {
    const [favorite] = await db.select().from(favorites).where(eq(favorites.id, id));
    return favorite || undefined;
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db.delete(favorites).where(eq(favorites.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Message methods
  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(messageData as any)
      .returning();
    return newMessage;
  }

  async updateMessage(id: number, messageData: Partial<InsertMessage>): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set(messageData as any)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  // Conversation methods
  async getConversations(userId?: number): Promise<Conversation[]> {
    let query = db.select().from(conversations);
    
    if (userId) {
      query = query.where(eq(conversations.memberId, userId)) as any;
    }
    
    return await query.orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversationData as any)
      .returning();
    return newConversation;
  }

  async updateConversation(id: string, conversationData: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set(conversationData as any)
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }

  // Notification methods
  async getNotifications(filters?: { userId?: number, read?: boolean }): Promise<Notification[]> {
    let query = db.select().from(notifications);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(notifications.userId, filters.userId));
    }
    if (filters?.read !== undefined) {
      conditions.push(eq(notifications.read, filters.read));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notificationData as any)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return !!updatedNotification;
  }

  // Phone Call methods
  async getPhoneCalls(filters?: { memberId?: number, status?: string }): Promise<PhoneCall[]> {
    let query = db.select().from(phoneCalls);
    
    const conditions = [];
    if (filters?.memberId) {
      conditions.push(eq(phoneCalls.memberId, filters.memberId));
    }
    if (filters?.status) {
      conditions.push(eq(phoneCalls.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(phoneCalls.startTime));
  }

  async getPhoneCall(id: string): Promise<PhoneCall | undefined> {
    const [phoneCall] = await db.select().from(phoneCalls).where(eq(phoneCalls.id, id));
    return phoneCall || undefined;
  }

  async createPhoneCall(phoneCallData: InsertPhoneCall): Promise<PhoneCall> {
    const [newPhoneCall] = await db
      .insert(phoneCalls)
      .values(phoneCallData as any)
      .returning();
    return newPhoneCall;
  }

  async updatePhoneCall(id: string, phoneCallData: Partial<InsertPhoneCall>): Promise<PhoneCall | undefined> {
    const [updatedPhoneCall] = await db
      .update(phoneCalls)
      .set(phoneCallData as any)
      .where(eq(phoneCalls.id, id))
      .returning();
    return updatedPhoneCall || undefined;
  }

  // Crew methods
  async getCrewMembers(): Promise<CrewMember[]> {
    return await db.select().from(crewMembers);
  }

  async getCrewMember(id: number): Promise<CrewMember | undefined> {
    const [crewMember] = await db.select().from(crewMembers).where(eq(crewMembers.id, id));
    return crewMember || undefined;
  }

  async createCrewMember(crewMemberData: InsertCrewMember): Promise<CrewMember> {
    const [newCrewMember] = await db
      .insert(crewMembers)
      .values(crewMemberData as any)
      .returning();
    return newCrewMember;
  }

  async updateCrewMember(id: number, crewMemberData: Partial<InsertCrewMember>): Promise<CrewMember | undefined> {
    const [updatedCrewMember] = await db
      .update(crewMembers)
      .set(crewMemberData as any)
      .where(eq(crewMembers.id, id))
      .returning();
    return updatedCrewMember || undefined;
  }

  // Crew Assignment methods
  async getCrewAssignments(filters?: { bookingId?: number, status?: string }): Promise<CrewAssignment[]> {
    let query = db.select().from(crewAssignments);
    
    const conditions = [];
    if (filters?.bookingId) {
      conditions.push(eq(crewAssignments.bookingId, filters.bookingId));
    }
    if (filters?.status) {
      conditions.push(eq(crewAssignments.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getCrewAssignment(id: string): Promise<CrewAssignment | undefined> {
    const [crewAssignment] = await db.select().from(crewAssignments).where(eq(crewAssignments.id, id));
    return crewAssignment || undefined;
  }

  async createCrewAssignment(assignmentData: InsertCrewAssignment): Promise<CrewAssignment> {
    const [newAssignment] = await db
      .insert(crewAssignments)
      .values(assignmentData as any)
      .returning();
    return newAssignment;
  }

  async updateCrewAssignment(id: string, assignmentData: Partial<InsertCrewAssignment>): Promise<CrewAssignment | undefined> {
    const [updatedAssignment] = await db
      .update(crewAssignments)
      .set(assignmentData as any)
      .where(eq(crewAssignments.id, id))
      .returning();
    return updatedAssignment || undefined;
  }

  // Admin methods
  async getAdminUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAdminYachts(): Promise<Yacht[]> {
    return await db.select().from(yachts);
  }

  async getAdminServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getAdminEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getAdminBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getAdminServiceBookings(): Promise<ServiceBooking[]> {
    return await db.select().from(serviceBookings);
  }

  async getAdminEventRegistrations(): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations);
  }

  async getAdminPayments(): Promise<any[]> {
    // Return combined payment data from bookings, service bookings, and event registrations
    const [bookingPayments, servicePayments, eventPayments] = await Promise.all([
      db.select().from(bookings),
      db.select().from(serviceBookings).where(ne(serviceBookings.stripePaymentIntentId, '')),
      db.select().from(eventRegistrations).where(ne(eventRegistrations.stripePaymentIntentId, ''))
    ]);

    return [
      ...bookingPayments.map(b => ({ ...b, type: 'yacht_booking' })),
      ...servicePayments.map(s => ({ ...s, type: 'service_booking' })),
      ...eventPayments.map(e => ({ ...e, type: 'event_registration' }))
    ];
  }

  async getAdminNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
export const dbStorage = new DatabaseStorage();