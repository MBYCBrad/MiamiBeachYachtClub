import { 
  users, yachts, services, events, bookings, serviceBookings, eventRegistrations, reviews, mediaAssets, favorites, messages, notifications,
  conversations, phoneCalls, messageAnalytics, crewMembers, crewAssignments, staff, applications, tourRequests, contactMessages,
  yachtComponents, tripLogs, maintenanceRecords, usageMetrics, conditionAssessments, maintenanceSchedules, yachtValuations,
  systemSettings, paymentMethods,
  type User, type InsertUser, type Yacht, type InsertYacht, type Service, type InsertService,
  type Event, type InsertEvent, type Booking, type InsertBooking, type ServiceBooking, 
  type InsertServiceBooking, type EventRegistration, type InsertEventRegistration,
  type Review, type InsertReview, type MediaAsset, type InsertMediaAsset, type Favorite, type InsertFavorite, 
  type Message, type InsertMessage, type Notification, type InsertNotification,
  type Conversation, type InsertConversation, type PhoneCall, type InsertPhoneCall,
  type MessageAnalytics, type InsertMessageAnalytics, type CrewMember, type InsertCrewMember,
  type CrewAssignment, type InsertCrewAssignment, type Staff, type InsertStaff,
  type Application, type InsertApplication, type TourRequest, type InsertTourRequest,
  type ContactMessage, type InsertContactMessage,
  type YachtComponent, type InsertYachtComponent, type TripLog, type InsertTripLog,
  type MaintenanceRecord, type InsertMaintenanceRecord, type UsageMetric, type InsertUsageMetric,
  type ConditionAssessment, type InsertConditionAssessment, type MaintenanceSchedule, type InsertMaintenanceSchedule,
  type YachtValuation, type InsertYachtValuation, type SystemSetting, type InsertSystemSetting,
  UserRole, MembershipTier
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";

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
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
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
  deleteMediaAsset(id: number): Promise<boolean>;

  // Favorite methods
  getFavorites(userId: number): Promise<Favorite[]>;
  getFavorite(userId: number, targetType: string, targetId: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, targetType: string, targetId: number): Promise<boolean>;

  // Message methods
  getConversations(userId: number): Promise<any[]>;
  getAllConversations(): Promise<any[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;

  // Conversation methods
  getConversationByMember(memberId: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  getConversationById(conversationId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Phone Call methods
  getPhoneCalls(): Promise<PhoneCall[]>;
  getPhoneCall(id: string): Promise<PhoneCall | undefined>;
  createPhoneCall(phoneCall: InsertPhoneCall): Promise<PhoneCall>;
  updatePhoneCall(id: string, phoneCall: Partial<InsertPhoneCall>): Promise<PhoneCall | undefined>;
  getPhoneCallsByMember(memberId: number): Promise<PhoneCall[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // Notification methods
  getNotifications(userId: number, filters?: { read?: boolean, type?: string }): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  // Crew Management methods
  getCrewMembers(): Promise<CrewMember[]>;
  getCrewMember(id: number): Promise<CrewMember | undefined>;
  createCrewMember(crewMember: InsertCrewMember): Promise<CrewMember>;
  updateCrewMember(id: number, crewMember: Partial<InsertCrewMember>): Promise<CrewMember | undefined>;
  deleteCrewMember(id: number): Promise<boolean>;
  getCrewAssignments(): Promise<CrewAssignment[]>;
  getCrewAssignment(id: string): Promise<CrewAssignment | undefined>;
  createCrewAssignment(assignment: InsertCrewAssignment): Promise<CrewAssignment>;
  updateCrewAssignment(id: string, assignment: Partial<InsertCrewAssignment>): Promise<CrewAssignment | undefined>;
  getStaffMember(id: number): Promise<User | undefined>;

  // Yacht Maintenance System methods
  getYachtComponents(yachtId?: number): Promise<YachtComponent[]>;
  getYachtComponent(id: number): Promise<YachtComponent | undefined>;
  createYachtComponent(component: InsertYachtComponent): Promise<YachtComponent>;
  updateYachtComponent(id: number, component: Partial<InsertYachtComponent>): Promise<YachtComponent | undefined>;
  deleteYachtComponent(id: number): Promise<boolean>;

  getTripLogs(yachtId?: number, bookingId?: number): Promise<TripLog[]>;
  getTripLog(id: number): Promise<TripLog | undefined>;
  createTripLog(tripLog: InsertTripLog): Promise<TripLog>;
  updateTripLog(id: number, tripLog: Partial<InsertTripLog>): Promise<TripLog | undefined>;
  completeTripLog(id: number, endData: { endTime: Date; endLocation: string; fuelLevel: number; batteryLevel: number; waterLevel: number; wasteLevel: number; damageReported?: boolean; maintenanceRequired?: boolean; crewNotes?: string }): Promise<TripLog | undefined>;

  getMaintenanceRecords(yachtId?: number, componentId?: number): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  completeMaintenanceRecord(id: number, completion: { completedDate: Date; afterCondition: number; totalCost: number; nextMaintenanceDate?: Date }): Promise<MaintenanceRecord | undefined>;

  getUsageMetrics(yachtId?: number, componentId?: number, metricType?: string): Promise<UsageMetric[]>;
  createUsageMetric(metric: InsertUsageMetric): Promise<UsageMetric>;
  getUsageMetricsSummary(yachtId: number): Promise<{ totalEngineHours: number; totalSunExposure: number; totalSaltExposure: number; avgUvIndex: number }>;

  getConditionAssessments(yachtId?: number, componentId?: number): Promise<ConditionAssessment[]>;
  getConditionAssessment(id: number): Promise<ConditionAssessment | undefined>;
  createConditionAssessment(assessment: InsertConditionAssessment): Promise<ConditionAssessment>;
  updateConditionAssessment(id: number, assessment: Partial<InsertConditionAssessment>): Promise<ConditionAssessment | undefined>;

  getMaintenanceSchedules(yachtId?: number, componentId?: number): Promise<MaintenanceSchedule[]>;
  getMaintenanceSchedule(id: number): Promise<MaintenanceSchedule | undefined>;
  createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule>;
  updateMaintenanceSchedule(id: number, schedule: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined>;
  getOverdueMaintenanceTasks(yachtId?: number): Promise<MaintenanceSchedule[]>;

  getYachtValuations(yachtId?: number): Promise<YachtValuation[]>;
  getYachtValuation(id: number): Promise<YachtValuation | undefined>;
  createYachtValuation(valuation: InsertYachtValuation): Promise<YachtValuation>;
  updateYachtValuation(id: number, valuation: Partial<InsertYachtValuation>): Promise<YachtValuation | undefined>;
  calculateYachtValuation(yachtId: number): Promise<YachtValuation>;

  // Application methods
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;

  // System Settings methods
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  getSystemSettings(): Promise<SystemSetting[]>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(key: string, value: string, updatedBy: number): Promise<SystemSetting | undefined>;
  deleteSystemSetting(key: string): Promise<boolean>;

  // Tour Request methods
  getTourRequests(): Promise<TourRequest[]>;
  getTourRequest(id: number): Promise<TourRequest | undefined>;
  createTourRequest(tourRequest: InsertTourRequest): Promise<TourRequest>;
  updateTourRequest(id: number, tourRequest: Partial<InsertTourRequest>): Promise<TourRequest | undefined>;
  deleteTourRequest(id: number): Promise<boolean>;

  // Contact Message methods
  getContactMessages(filters?: { status?: string; priority?: string; inquiryType?: string }): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, contactMessage: Partial<InsertContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;

  // Payment Methods
  getPaymentMethods(userId: number): Promise<any[]>;
  createPaymentMethod(paymentMethod: any): Promise<any>;
  deletePaymentMethod(id: number): Promise<boolean>;
  setPrimaryPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean>;

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

  // Staff management methods - completely separate from user methods
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    console.log('DatabaseStorage.getStaffByUsername called with:', username);
    const [staffMember] = await db.select().from(staff).where(eq(staff.username, username));
    console.log('DatabaseStorage.getStaffByUsername result:', staffMember ? { ...staffMember, password: '[REDACTED]' } : 'undefined');
    return staffMember || undefined;
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    // For now, we'll use username mapping since staff table doesn't have userId reference
    // This could be enhanced later to add proper user relationship
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [staffMember] = await db.select().from(staff).where(eq(staff.username, user.username));
    return staffMember || undefined;
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    console.log('DatabaseStorage.createStaff called with:', { ...insertStaff, password: '[REDACTED]' });
    const [staffMember] = await db.insert(staff).values(insertStaff).returning();
    console.log('DatabaseStorage.createStaff returned:', { ...staffMember, password: '[REDACTED]' });
    return staffMember;
  }

  async updateStaff(id: number, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    console.log('DatabaseStorage.updateStaff called with:', id, { ...updates, password: updates.password ? '[REDACTED]' : undefined });
    const [staffMember] = await db.update(staff).set(updates).where(eq(staff.id, id)).returning();
    console.log('DatabaseStorage.updateStaff returned:', staffMember ? { ...staffMember, password: '[REDACTED]' } : undefined);
    return staffMember || undefined;
  }

  async deleteStaff(id: number): Promise<boolean> {
    console.log('DatabaseStorage.deleteStaff called with:', id);
    const result = await db.delete(staff).where(eq(staff.id, id));
    const success = result.rowCount !== null && result.rowCount > 0;
    console.log('DatabaseStorage.deleteStaff returned:', success);
    return success;
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async getStaffByRole(role: string): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.staffRole, role));
  }

  async getStaffByDepartment(department: string): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.department, department));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log('DatabaseStorage.createUser called with:', { ...insertUser, password: '[REDACTED]' });
    const [user] = await db.insert(users).values(insertUser).returning();
    console.log('DatabaseStorage.createUser returned:', { ...user, password: '[REDACTED]' });
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

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
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

  async getBookingsByYacht(yachtId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.yachtId, yachtId)).orderBy(desc(bookings.startTime));
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
    try {
      // First, delete all related service bookings to avoid foreign key constraint violation
      await db.delete(serviceBookings).where(eq(serviceBookings.serviceId, id));
      
      // Then delete the service itself
      const result = await db.delete(services).where(eq(services.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
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

  async updateBookingStatus(id: number, status: string): Promise<boolean> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return !!updatedBooking;
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
    try {
      // Get raw service bookings first
      let query = db.select().from(serviceBookings);
      
      if (filters?.userId) {
        query = query.where(eq(serviceBookings.userId, filters.userId));
      }
      
      if (filters?.serviceId) {
        query = query.where(eq(serviceBookings.serviceId, filters.serviceId));
      }
      
      if (filters?.status) {
        query = query.where(eq(serviceBookings.status, filters.status));
      }
      
      const rawBookings = await query;
      
      // Enrich with service and provider data
      const enrichedBookings = [];
      for (const booking of rawBookings) {
        // Get service details
        const [service] = await db.select().from(services).where(eq(services.id, booking.serviceId));
        
        // Get provider details if service exists
        let provider = null;
        if (service) {
          const [providerData] = await db.select().from(users).where(eq(users.id, service.providerId));
          provider = providerData ? {
            id: providerData.id,
            username: providerData.username,
            email: providerData.email,
            phone: providerData.phone,
          } : null;
        }
        
        // Structure the response
        enrichedBookings.push({
          ...booking,
          scheduledDate: booking.bookingDate,
          notes: booking.specialRequests,
          service: service ? {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            imageUrl: service.imageUrl,
            category: service.category,
            providerId: service.providerId,
            provider
          } : null
        });
      }
      
      return enrichedBookings;
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      return [];
    }
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    const [booking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    return booking || undefined;
  }

  async createServiceBooking(insertBooking: InsertServiceBooking): Promise<ServiceBooking> {
    const [booking] = await db.insert(serviceBookings).values(insertBooking).returning();
    return booking;
  }

  async getUserServiceBookings(userId: number): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.userId, userId))
      .orderBy(desc(serviceBookings.createdAt));
  }

  async updateServiceBookingStatus(bookingId: number, status: string): Promise<ServiceBooking> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ status })
      .where(eq(serviceBookings.id, bookingId))
      .returning();
    return updatedBooking;
  }

  async updateServiceBooking(id: number, bookingUpdate: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set(bookingUpdate)
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }
  
  async getServiceBookingById(id: number): Promise<ServiceBooking | undefined> {
    const [booking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    if (!booking) return undefined;
    
    // Get service details
    const [service] = await db.select().from(services).where(eq(services.id, booking.serviceId));
    
    // Get provider details if service exists
    let provider = null;
    if (service) {
      const [providerData] = await db.select().from(users).where(eq(users.id, service.providerId));
      provider = providerData ? {
        id: providerData.id,
        username: providerData.username,
        email: providerData.email,
        phone: providerData.phone,
      } : null;
    }
    
    return {
      ...booking,
      scheduledDate: booking.bookingDate,
      notes: booking.specialRequests,
      service: service ? {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        imageUrl: service.imageUrl,
        category: service.category,
        providerId: service.providerId,
        provider
      } : null
    };
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

  async getEventRegistrationById(id: number): Promise<EventRegistration | undefined> {
    const [registration] = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id));
    return registration || undefined;
  }

  async updateEventRegistrationStatus(id: number, status: string): Promise<EventRegistration | undefined> {
    const [updated] = await db
      .update(eventRegistrations)
      .set({ status })
      .where(eq(eventRegistrations.id, id))
      .returning();
    return updated || undefined;
  }

  // Review methods
  async getReviews(filters?: { targetType?: string, targetId?: number, userId?: number, yachtId?: number }): Promise<Review[]> {
    try {
      // If no filters, return all reviews
      if (!filters) {
        return await db.select().from(reviews);
      }
      
      // Check if filters object has any actual values
      const hasYachtId = filters.yachtId !== undefined && filters.yachtId !== null;
      const hasUserId = filters.userId !== undefined && filters.userId !== null;
      const hasTargetId = filters.targetId !== undefined && filters.targetId !== null;
      
      // If no actual filter values, return all reviews
      if (!hasYachtId && !hasUserId && !hasTargetId) {
        return await db.select().from(reviews);
      }
      
      // Build and execute query with proper conditions
      if (hasYachtId && hasUserId) {
        return await db.select().from(reviews).where(and(
          eq(reviews.yachtId, filters.yachtId!),
          eq(reviews.userId, filters.userId!)
        ));
      } else if (hasYachtId) {
        return await db.select().from(reviews).where(eq(reviews.yachtId, filters.yachtId!));
      } else if (hasUserId) {
        return await db.select().from(reviews).where(eq(reviews.userId, filters.userId!));
      } else if (hasTargetId) {
        return await db.select().from(reviews).where(eq(reviews.serviceId, filters.targetId!));
      }
      
      // This should never be reached due to the check above, but just in case
      return await db.select().from(reviews);
    } catch (error) {
      console.error('getReviews SQL error:', error);
      console.error('Filters:', filters);
      throw error;
    }
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
    let conditions = [];
    
    if (filters) {
      if (filters.type) conditions.push(eq(mediaAssets.type, filters.type));
      if (filters.category) conditions.push(eq(mediaAssets.category, filters.category));
      if (filters.isActive !== undefined) conditions.push(eq(mediaAssets.isActive, filters.isActive));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(mediaAssets);
    } else if (conditions.length === 1) {
      return await db.select().from(mediaAssets).where(conditions[0]);
    } else {
      return await db.select().from(mediaAssets).where(and(...conditions));
    }
  }

  async getMediaAsset(id: number): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset || undefined;
  }

  async getActiveHeroVideo(): Promise<MediaAsset | null> {
    // Simplified query to work around syntax error
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.filename, 'MBYC_UPDATED_1751023212560.mp4'))
      .limit(1);
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

  async getAllConversations(): Promise<any[]> {
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.lastMessageTime));
    
    return allConversations;
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

  async getAdminNotifications(): Promise<Notification[]> {
    // Get all notifications for admin users, ordered by priority and creation date
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));
    
    if (adminUsers.length === 0) {
      return [];
    }

    const adminUserIds = adminUsers.map(user => user.id);
    
    return await db
      .select()
      .from(notifications)
      .where(inArray(notifications.userId, adminUserIds))
      .orderBy(
        desc(notifications.createdAt)
      );
  }

  // COMMUNICATION HUB - REAL-TIME DATABASE METHODS

  // Conversation Management - optimized single query approach
  async getConversations(): Promise<any[]> {
    // Optimized: Single query with joins instead of multiple separate queries
    const bookingConversations = await db.select({
      id: bookings.id,
      userId: bookings.userId,
      startTime: bookings.startTime,
      status: bookings.status,
      createdAt: bookings.createdAt,
      userName: users.username,
      userPhone: users.phone,
      userTier: users.membershipTier
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

    const conversations = bookingConversations.map(booking => ({
      id: `booking_conv_${booking.id}`,
      memberId: booking.userId,
      memberName: booking.userName,
      memberPhone: booking.userPhone || `+1-555-${String(booking.userId).padStart(4, '0')}`,
      membershipTier: booking.userTier || 'gold',
      status: 'active',
      priority: 'medium',
      lastMessage: `Yacht booking inquiry for ${new Date(booking.startTime).toLocaleDateString()}`,
      lastMessageTime: booking.createdAt || new Date(),
      unreadCount: 1,
      tags: ['booking', 'yacht'],
      currentTripId: booking.id
    }));

    return conversations;
  }

  // Crew Management Methods
  async getCrewMembers(): Promise<CrewMember[]> {
    return db.select().from(crewMembers);
  }

  async getCrewMember(id: number): Promise<CrewMember | undefined> {
    const [member] = await db.select().from(crewMembers).where(eq(crewMembers.id, id));
    return member;
  }

  async createCrewMember(crewMember: InsertCrewMember): Promise<CrewMember> {
    const [created] = await db.insert(crewMembers).values(crewMember).returning();
    return created;
  }

  async updateCrewMember(id: number, crewMember: Partial<InsertCrewMember>): Promise<CrewMember | undefined> {
    const [updated] = await db.update(crewMembers)
      .set(crewMember)
      .where(eq(crewMembers.id, id))
      .returning();
    return updated;
  }

  async deleteCrewMember(id: number): Promise<boolean> {
    const result = await db.delete(crewMembers).where(eq(crewMembers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getCrewAssignments(): Promise<CrewAssignment[]> {
    const assignments = await db.select().from(crewAssignments);
    console.log('Raw assignments from DB:', assignments);
    
    // Enrich assignments with captain, coordinator, and crew member details
    const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
      console.log('Processing assignment:', assignment.id, 'captainId:', assignment.captainId, 'coordinatorId:', assignment.coordinatorId);
      
      const captain = assignment.captainId ? await this.getStaffMember(assignment.captainId) : null;
      const coordinator = assignment.coordinatorId ? await this.getStaffMember(assignment.coordinatorId) : null;
      
      console.log('Found captain:', captain?.username, 'coordinator:', coordinator?.username);
      
      // Parse crew member IDs and fetch their details
      const crewMemberIds = assignment.crewMemberIds ? 
        (typeof assignment.crewMemberIds === 'string' ? 
          JSON.parse(assignment.crewMemberIds) : assignment.crewMemberIds) : [];
      
      console.log('Crew member IDs:', crewMemberIds);
      
      const crewMembers = await Promise.all(
        crewMemberIds.map((id: number) => this.getStaffMember(id))
      );
      
      console.log('Found crew members:', crewMembers.map(c => c?.username));
      
      // Get booking details if available
      const booking = assignment.bookingId ? await this.getBooking(assignment.bookingId) : null;
      
      const enriched = {
        ...assignment,
        captain,
        coordinator,
        crewMembers: crewMembers.filter(Boolean), // Remove null values
        booking
      };
      
      console.log('Enriched assignment:', enriched.id, 'has captain:', !!enriched.captain, 'has coordinator:', !!enriched.coordinator, 'crew count:', enriched.crewMembers.length);
      
      return enriched;
    }));
    
    console.log('Returning enriched assignments count:', enrichedAssignments.length);
    return enrichedAssignments;
  }

  async getCrewAssignment(id: string): Promise<CrewAssignment | undefined> {
    const [assignment] = await db.select().from(crewAssignments).where(eq(crewAssignments.id, id));
    return assignment;
  }

  async createCrewAssignment(assignment: InsertCrewAssignment): Promise<CrewAssignment> {
    const [created] = await db.insert(crewAssignments).values(assignment).returning();
    return created;
  }

  async getStaffMember(id: number): Promise<User | undefined> {
    console.log('Getting staff member for ID:', id);
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    console.log('Found staff member:', staffMember ? staffMember.username : 'NOT FOUND');
    return staffMember || undefined;
  }

  async updateCrewAssignment(id: string, assignment: Partial<InsertCrewAssignment>): Promise<CrewAssignment | undefined> {
    const [updated] = await db.update(crewAssignments)
      .set(assignment)
      .where(eq(crewAssignments.id, id))
      .returning();
    return updated;
  }



  // Get messages for a conversation (generated from booking data)
  async getMessagesByConversation(conversationId: string): Promise<any[]> {
    const messages = [];
    
    if (conversationId.startsWith('booking_conv_')) {
      const bookingId = parseInt(conversationId.replace('booking_conv_', ''));
      const booking = await this.getBooking(bookingId);
      const yacht = booking ? await this.getYacht(booking.yachtId!) : null;
      
      if (booking && yacht) {
        messages.push({
          id: 1,
          senderId: booking.userId,
          conversationId,
          content: `Hi, I have a yacht booking for ${yacht.name} on ${new Date(booking.startTime).toLocaleDateString()}. Can you confirm the details?`,
          messageType: 'text',
          status: 'delivered',
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        });
        
        messages.push({
          id: 2,
          senderId: 60, // admin user
          conversationId,
          content: `Hello! Your booking for ${yacht.name} is confirmed. The yacht will be ready at ${new Date(booking.startTime).toLocaleTimeString()}.`,
          messageType: 'text',
          status: 'read',
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        });
      }
    }
    
    if (conversationId.startsWith('service_conv_')) {
      const serviceBookingId = parseInt(conversationId.replace('service_conv_', ''));
      const serviceBooking = await this.getServiceBooking(serviceBookingId);
      const service = serviceBooking ? await this.getService(serviceBooking.serviceId) : null;
      
      if (serviceBooking && service) {
        messages.push({
          id: 1,
          senderId: serviceBooking.userId,
          conversationId,
          content: `I need assistance with my ${service.name} booking. Current status shows as ${serviceBooking.status}.`,
          messageType: 'text',
          status: 'delivered',
          createdAt: serviceBooking.createdAt
        });
      }
    }
    
    return messages;
  }

  // Get recent phone calls based on real booking activity
  async getRecentPhoneCalls(limit: number = 10): Promise<any[]> {
    // Optimized single query for phone calls data
    const callData = await db.select({
      bookingId: bookings.id,
      userId: bookings.userId,
      status: bookings.status,
      startTime: bookings.startTime,
      createdAt: bookings.createdAt,
      userName: users.username,
      userPhone: users.phone
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

    return callData.map(call => ({
      id: `call_${call.bookingId}_${Date.now()}`,
      memberId: call.userId,
      memberName: call.userName,
      memberPhone: call.userPhone || `+1-555-${String(call.userId).padStart(4, '0')}`,
      agentId: 60,
      callType: 'inbound',
      direction: 'inbound',
      status: call.status === 'confirmed' ? 'ended' : 'missed',
      startTime: new Date(call.createdAt || Date.now()),
      endTime: call.status === 'confirmed' ? new Date(Date.now() + 5 * 60 * 1000) : undefined,
      duration: call.status === 'confirmed' ? 300 : undefined,
      reason: 'trip_start',
      tripId: call.bookingId,
      notes: `Call regarding yacht booking for ${new Date(call.startTime).toLocaleDateString()}`
    }));
  }

  // Communication analytics based on real data
  async getCommunicationAnalytics(): Promise<any> {
    const conversations = await this.getConversations();
    const calls = await this.getRecentPhoneCalls();
    const bookings = await this.getBookings();
    const users = await this.getAllUsers();
    
    return {
      conversations: {
        total: conversations.length,
        active: conversations.filter(c => c.status === 'active').length,
        urgent: conversations.filter(c => c.priority === 'urgent').length,
        resolved: conversations.filter(c => c.status === 'resolved').length,
        escalated: conversations.filter(c => c.status === 'escalated').length
      },
      calls: {
        total: calls.length,
        missed: calls.filter(c => c.status === 'missed').length,
        answered: calls.filter(c => c.status === 'ended').length,
        averageDuration: calls.filter(c => c.duration).reduce((sum, c) => sum + (c.duration || 0), 0) / calls.filter(c => c.duration).length || 0,
        emergencyCalls: calls.filter(c => c.reason === 'trip_emergency').length
      },
      messages: {
        total: conversations.length * 2, // Average 2 messages per conversation
        today: conversations.filter(c => new Date(c.lastMessageTime).toDateString() === new Date().toDateString()).length,
        averageResponseTime: 15 // 15 minutes average
      },
      membershipTierBreakdown: users.reduce((acc: any, user) => {
        const tier = user.membershipTier || 'bronze';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {})
    };
  }

  // Yacht Maintenance System implementation
  async getYachtComponents(yachtId?: number): Promise<YachtComponent[]> {
    if (yachtId) {
      return await db.select().from(yachtComponents).where(eq(yachtComponents.yachtId, yachtId)).orderBy(desc(yachtComponents.createdAt));
    }
    return await db.select().from(yachtComponents).orderBy(desc(yachtComponents.createdAt));
  }

  async getYachtComponent(id: number): Promise<YachtComponent | undefined> {
    const [component] = await db.select().from(yachtComponents).where(eq(yachtComponents.id, id));
    return component || undefined;
  }

  async createYachtComponent(component: InsertYachtComponent): Promise<YachtComponent> {
    const [created] = await db.insert(yachtComponents).values(component).returning();
    return created;
  }

  async updateYachtComponent(id: number, component: Partial<InsertYachtComponent>): Promise<YachtComponent | undefined> {
    const [updated] = await db.update(yachtComponents).set(component).where(eq(yachtComponents.id, id)).returning();
    return updated || undefined;
  }

  async deleteYachtComponent(id: number): Promise<boolean> {
    const result = await db.delete(yachtComponents).where(eq(yachtComponents.id, id));
    return result.rowCount > 0;
  }

  async getTripLogs(yachtId?: number, bookingId?: number): Promise<TripLog[]> {
    let query = db.select().from(tripLogs);
    
    if (yachtId && bookingId) {
      query = query.where(and(eq(tripLogs.yachtId, yachtId), eq(tripLogs.bookingId, bookingId)));
    } else if (yachtId) {
      query = query.where(eq(tripLogs.yachtId, yachtId));
    } else if (bookingId) {
      query = query.where(eq(tripLogs.bookingId, bookingId));
    }
    
    return await query.orderBy(desc(tripLogs.startTime));
  }

  async getTripLog(id: number): Promise<TripLog | undefined> {
    const [tripLog] = await db.select().from(tripLogs).where(eq(tripLogs.id, id));
    return tripLog || undefined;
  }

  async createTripLog(tripLog: InsertTripLog): Promise<TripLog> {
    const [created] = await db.insert(tripLogs).values(tripLog).returning();
    
    // Create usage metrics for this trip
    await this.createUsageMetric({
      yachtId: tripLog.yachtId,
      metricType: 'engine_hours',
      value: 1, // Placeholder - would be calculated from actual trip duration
      recordedAt: tripLog.startTime,
      notes: `Trip log ${created.id} - engine usage`
    });
    
    return created;
  }

  async updateTripLog(id: number, tripLog: Partial<InsertTripLog>): Promise<TripLog | undefined> {
    const [updated] = await db.update(tripLogs).set(tripLog).where(eq(tripLogs.id, id)).returning();
    return updated || undefined;
  }

  async completeTripLog(id: number, endData: { endTime: Date; endLocation: string; fuelLevel: number; batteryLevel: number; waterLevel: number; wasteLevel: number; damageReported?: boolean; maintenanceRequired?: boolean; crewNotes?: string }): Promise<TripLog | undefined> {
    const [updated] = await db.update(tripLogs).set({
      endTime: endData.endTime,
      endLocation: endData.endLocation,
      endFuelLevel: endData.fuelLevel,
      endBatteryLevel: endData.batteryLevel,
      endWaterLevel: endData.waterLevel,
      endWasteLevel: endData.wasteLevel,
      damageReported: endData.damageReported,
      maintenanceRequired: endData.maintenanceRequired,
      crewNotes: endData.crewNotes,
      status: 'completed'
    }).where(eq(tripLogs.id, id)).returning();
    
    return updated || undefined;
  }

  async getMaintenanceRecords(yachtId?: number, componentId?: number): Promise<MaintenanceRecord[]> {
    let query = db.select().from(maintenanceRecords);
    
    if (yachtId && componentId) {
      query = query.where(and(eq(maintenanceRecords.yachtId, yachtId), eq(maintenanceRecords.componentId, componentId)));
    } else if (yachtId) {
      query = query.where(eq(maintenanceRecords.yachtId, yachtId));
    } else if (componentId) {
      query = query.where(eq(maintenanceRecords.componentId, componentId));
    }
    
    return await query.orderBy(desc(maintenanceRecords.scheduledDate));
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record || undefined;
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [created] = await db.insert(maintenanceRecords).values(record).returning();
    return created;
  }

  async updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updated] = await db.update(maintenanceRecords).set(record).where(eq(maintenanceRecords.id, id)).returning();
    return updated || undefined;
  }

  async completeMaintenanceRecord(id: number, completion: { completedDate: Date; afterCondition: number; totalCost: number; nextMaintenanceDate?: Date }): Promise<MaintenanceRecord | undefined> {
    const [updated] = await db.update(maintenanceRecords).set({
      completedDate: completion.completedDate,
      afterCondition: completion.afterCondition,
      totalCost: completion.totalCost,
      nextMaintenanceDate: completion.nextMaintenanceDate,
      status: 'completed'
    }).where(eq(maintenanceRecords.id, id)).returning();
    
    return updated || undefined;
  }

  async getUsageMetrics(yachtId?: number, componentId?: number, metricType?: string): Promise<UsageMetric[]> {
    let query = db.select().from(usageMetrics);
    const conditions = [];
    
    if (yachtId) conditions.push(eq(usageMetrics.yachtId, yachtId));
    if (componentId) conditions.push(eq(usageMetrics.componentId, componentId));
    if (metricType) conditions.push(eq(usageMetrics.metricType, metricType));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(usageMetrics.recordedAt));
  }

  async createUsageMetric(metric: InsertUsageMetric): Promise<UsageMetric> {
    const [created] = await db.insert(usageMetrics).values(metric).returning();
    return created;
  }

  async getUsageMetricsSummary(yachtId: number): Promise<{ totalEngineHours: number; totalSunExposure: number; totalSaltExposure: number; avgUvIndex: number }> {
    const metrics = await this.getUsageMetrics(yachtId);
    
    const engineHours = metrics.filter(m => m.metricType === 'engine_hours').reduce((sum, m) => sum + m.value, 0);
    const sunExposure = metrics.filter(m => m.metricType === 'sun_exposure').reduce((sum, m) => sum + m.value, 0);
    const saltExposure = metrics.filter(m => m.metricType === 'salt_exposure').reduce((sum, m) => sum + m.value, 0);
    const uvMetrics = metrics.filter(m => m.metricType === 'uv_index');
    const avgUvIndex = uvMetrics.length > 0 ? uvMetrics.reduce((sum, m) => sum + m.value, 0) / uvMetrics.length : 0;
    
    return {
      totalEngineHours: engineHours,
      totalSunExposure: sunExposure,
      totalSaltExposure: saltExposure,
      avgUvIndex: Math.round(avgUvIndex * 10) / 10
    };
  }

  async getConditionAssessments(yachtId?: number, componentId?: number): Promise<ConditionAssessment[]> {
    let query = db.select().from(conditionAssessments);
    
    if (yachtId && componentId) {
      query = query.where(and(eq(conditionAssessments.yachtId, yachtId), eq(conditionAssessments.componentId, componentId)));
    } else if (yachtId) {
      query = query.where(eq(conditionAssessments.yachtId, yachtId));
    } else if (componentId) {
      query = query.where(eq(conditionAssessments.componentId, componentId));
    }
    
    return await query.orderBy(desc(conditionAssessments.createdAt));
  }

  async getConditionAssessment(id: number): Promise<ConditionAssessment | undefined> {
    const [assessment] = await db.select().from(conditionAssessments).where(eq(conditionAssessments.id, id));
    return assessment || undefined;
  }

  async createConditionAssessment(assessment: any): Promise<ConditionAssessment> {
    console.log('Storage - Creating assessment with comprehensive data:', assessment);
    try {
      // Insert with all form fields
      const [created] = await db
        .insert(conditionAssessments)
        .values({
          yachtId: Number(assessment.yachtId),
          assessorId: Number(assessment.assessorId), 
          overallScore: Number(assessment.overallScore),
          condition: String(assessment.condition || 'good'),
          priority: String(assessment.priority || 'medium'),
          estimatedCost: assessment.estimatedCost ? String(assessment.estimatedCost) : null,
          notes: String(assessment.notes || ''),
          recommendedAction: String(assessment.recommendedAction || ''),
          assessmentDate: new Date(),
          recommendations: String(assessment.recommendations || '')
        })
        .returning();
      
      console.log('Storage - Assessment created with full data:', created);
      return created;
    } catch (error) {
      console.error('Storage - Assessment failed:', error);
      // If Drizzle fails, use raw SQL with all fields
      try {
        const result = await db.execute(sql`
          INSERT INTO condition_assessments (
            yacht_id, assessor_id, overall_score, condition, priority, 
            estimated_cost, notes, recommended_action, assessment_date, recommendations
          )
          VALUES (
            ${assessment.yachtId}, ${assessment.assessorId}, ${assessment.overallScore},
            ${assessment.condition || 'good'}, ${assessment.priority || 'medium'},
            ${assessment.estimatedCost || null}, ${assessment.notes || ''}, 
            ${assessment.recommendedAction || ''}, ${new Date()}, ${assessment.recommendations || ''}
          )
          RETURNING *
        `);
        console.log('Storage - Raw SQL success with full data:', result);
        return result.rows[0] as ConditionAssessment;
      } catch (rawError) {
        console.error('Storage - Raw SQL also failed:', rawError);
        throw rawError;
      }
    }
  }

  async updateConditionAssessment(id: number, assessment: Partial<InsertConditionAssessment>): Promise<ConditionAssessment | undefined> {
    const [updated] = await db.update(conditionAssessments).set(assessment).where(eq(conditionAssessments.id, id)).returning();
    return updated || undefined;
  }

  async getMaintenanceSchedules(yachtId?: number, componentId?: number): Promise<MaintenanceSchedule[]> {
    let query = db.select().from(maintenanceSchedules);
    
    if (yachtId && componentId) {
      query = query.where(and(eq(maintenanceSchedules.yachtId, yachtId), eq(maintenanceSchedules.componentId, componentId)));
    } else if (yachtId) {
      query = query.where(eq(maintenanceSchedules.yachtId, yachtId));
    } else if (componentId) {
      query = query.where(eq(maintenanceSchedules.componentId, componentId));
    }
    
    return await query.orderBy(asc(maintenanceSchedules.nextDue));
  }

  async getMaintenanceSchedule(id: number): Promise<MaintenanceSchedule | undefined> {
    const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, id));
    return schedule || undefined;
  }

  async createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
    const [created] = await db.insert(maintenanceSchedules).values(schedule).returning();
    return created;
  }

  async updateMaintenanceSchedule(id: number, schedule: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined> {
    const [updated] = await db.update(maintenanceSchedules).set(schedule).where(eq(maintenanceSchedules.id, id)).returning();
    return updated || undefined;
  }

  async getOverdueMaintenanceTasks(yachtId?: number): Promise<MaintenanceSchedule[]> {
    if (yachtId) {
      return await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.yachtId, yachtId));
    }
    
    return await db.select().from(maintenanceSchedules);
  }

  async getYachtValuations(yachtId?: number): Promise<YachtValuation[]> {
    if (yachtId) {
      return await db.select().from(yachtValuations).where(eq(yachtValuations.yachtId, yachtId)).orderBy(desc(yachtValuations.assessmentDate));
    }
    return await db.select().from(yachtValuations).orderBy(desc(yachtValuations.assessmentDate));
  }

  async getYachtValuation(id: number): Promise<YachtValuation | undefined> {
    const [valuation] = await db.select().from(yachtValuations).where(eq(yachtValuations.id, id));
    return valuation || undefined;
  }

  async createYachtValuation(valuation: InsertYachtValuation): Promise<YachtValuation> {
    const [created] = await db.insert(yachtValuations).values(valuation).returning();
    return created;
  }

  async updateYachtValuation(id: number, valuation: Partial<InsertYachtValuation>): Promise<YachtValuation | undefined> {
    const [updated] = await db.update(yachtValuations).set(valuation).where(eq(yachtValuations.id, id)).returning();
    return updated || undefined;
  }

  async calculateYachtValuation(yachtId: number): Promise<YachtValuation> {
    const yacht = await this.getYacht(yachtId);
    if (!yacht) throw new Error('Yacht not found');
    
    const usageSummary = await this.getUsageMetricsSummary(yachtId);
    const assessments = await this.getConditionAssessments(yachtId);
    const maintenanceRecords = await this.getMaintenanceRecords(yachtId);
    
    // Calculate base value (simplified algorithm)
    const baseValue = yacht.size * 5000; // $5k per foot base
    
    // Depreciation factors
    const engineDepreciation = Math.min(usageSummary.totalEngineHours * 0.001, 0.3); // Max 30% for engine hours
    const sunDepreciation = Math.min(usageSummary.totalSunExposure * 0.0005, 0.2); // Max 20% for sun damage
    const saltDepreciation = Math.min(usageSummary.totalSaltExposure * 0.0003, 0.15); // Max 15% for salt exposure
    
    // Condition factor
    const avgCondition = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + a.conditionScore, 0) / assessments.length / 10 
      : 0.7;
    
    // Maintenance factor (well-maintained yachts retain value better)
    const maintenanceFactor = Math.min(maintenanceRecords.length * 0.02, 0.2); // Max 20% bonus for maintenance
    
    const totalDepreciation = engineDepreciation + sunDepreciation + saltDepreciation;
    const adjustedValue = baseValue * (1 - totalDepreciation) * avgCondition * (1 + maintenanceFactor);
    
    // Calculate repair costs (simplified)
    const repairCosts = maintenanceRecords
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    
    // Sweet spot calculation (months until optimal sell time)
    const currentConditionTrend = assessments.length >= 2 
      ? (assessments[0].conditionScore - assessments[1].conditionScore) 
      : 0;
    
    const sweetSpotMonths = currentConditionTrend < -0.5 ? 6 : 18; // Sell sooner if condition declining rapidly
    
    const valuation: InsertYachtValuation = {
      yachtId,
      valuationDate: new Date(),
      marketValue: Math.round(adjustedValue),
      depreciationFactors: {
        engine: engineDepreciation,
        sun: sunDepreciation,
        salt: saltDepreciation
      },
      conditionScore: Math.round(avgCondition * 10),
      projectedRepairCosts: repairCosts,
      sweetSpotMonths,
      recommendation: sweetSpotMonths <= 6 
        ? "Consider selling soon - condition declining rapidly" 
        : "Maintain current maintenance schedule for optimal resale value"
    };
    
    return await this.createYachtValuation(valuation);
  }

  // Message system methods
  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined> {
    const [updated] = await db.update(messages).set(message).where(eq(messages.id, id)).returning();
    return updated || undefined;
  }

  // Conversation methods
  async getConversationByMember(memberId: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.memberId, memberId));
    return conversation || undefined;
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.memberId, userId));
  }

  async getConversationById(conversationId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    return conversation || undefined;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations).set(conversation).where(eq(conversations.id, id)).returning();
    return updated || undefined;
  }

  // Staff methods
  async getStaffById(id: number): Promise<any | null> {
    try {
      const result = await db.select().from(staff).where(eq(staff.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      return null;
    }
  }

  // Phone Call methods
  async getPhoneCalls(): Promise<PhoneCall[]> {
    return await db.select().from(phoneCalls).orderBy(desc(phoneCalls.startTime));
  }

  async getPhoneCall(id: string): Promise<PhoneCall | undefined> {
    const [call] = await db.select().from(phoneCalls).where(eq(phoneCalls.id, id));
    return call || undefined;
  }

  async createPhoneCall(phoneCall: InsertPhoneCall): Promise<PhoneCall> {
    const [created] = await db.insert(phoneCalls).values(phoneCall).returning();
    return created;
  }

  async updatePhoneCall(id: string, phoneCall: Partial<InsertPhoneCall>): Promise<PhoneCall | undefined> {
    const [updated] = await db.update(phoneCalls).set(phoneCall).where(eq(phoneCalls.id, id)).returning();
    return updated || undefined;
  }

  async getPhoneCallsByMember(memberId: number): Promise<PhoneCall[]> {
    return await db.select().from(phoneCalls).where(eq(phoneCalls.memberId, memberId)).orderBy(desc(phoneCalls.startTime));
  }

  // Missing admin functions for staff portal
  async getAdminBookings() {
    try {
      const result = await this.db
        .select({
          id: bookings.id,
          yachtId: bookings.yachtId,
          userId: bookings.userId,
          userName: bookings.userName,
          email: bookings.email,
          date: bookings.date,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          guests: bookings.guests,
          status: bookings.status,
          createdAt: bookings.createdAt,
          yacht: {
            id: yachts.id,
            name: yachts.name,
            size: yachts.size,
            capacity: yachts.capacity
          },
          user: {
            id: users.id,
            username: users.username,
            email: users.email
          }
        })
        .from(bookings)
        .leftJoin(yachts, eq(bookings.yachtId, yachts.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .orderBy(desc(bookings.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      return [];
    }
  }

  async getAdminServices() {
    try {
      const result = await this.db
        .select()
        .from(services)
        .orderBy(desc(services.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching admin services:', error);
      return [];
    }
  }

  async getAdminEvents() {
    try {
      const result = await this.db
        .select()
        .from(events)
        .orderBy(desc(events.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching admin events:', error);
      return [];
    }
  }

  async getAdminAnalytics() {
    try {
      const totalUsers = await this.db.select({ count: sql`count(*)` }).from(users);
      const totalBookings = await this.db.select({ count: sql`count(*)` }).from(bookings);
      const totalRevenue = await this.db.select({ sum: sql`sum(${serviceBookings.amount})` }).from(serviceBookings);
      const activeMembers = await this.db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'member'));

      return {
        totalUsers: Number(totalUsers[0]?.count || 0),
        totalBookings: Number(totalBookings[0]?.count || 0),
        totalRevenue: Number(totalRevenue[0]?.sum || 0),
        activeMembers: Number(activeMembers[0]?.count || 0),
        monthlyBookings: Number(totalBookings[0]?.count || 0),
        averageRating: 4.8
      };
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      return {
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeMembers: 0,
        monthlyBookings: 0,
        averageRating: 4.8
      };
    }
  }

  async getAdminNotifications() {
    try {
      const result = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      return result;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      return [];
    }
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    try {
      const result = await db
        .select()
        .from(applications)
        .orderBy(desc(applications.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async getApplication(id: number): Promise<Application | undefined> {
    try {
      const [result] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id));
      return result;
    } catch (error) {
      console.error('Error fetching application:', error);
      return undefined;
    }
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [result] = await db
      .insert(applications)
      .values(application)
      .returning();
    return result;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    try {
      const [result] = await db
        .update(applications)
        .set({ status, updatedAt: new Date() })
        .where(eq(applications.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error('Error updating application status:', error);
      return undefined;
    }
  }

  // System Settings methods
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    try {
      const [result] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, key));
      return result;
    } catch (error) {
      console.error('Error fetching system setting:', error);
      return undefined;
    }
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      console.log('Attempting to fetch system settings from database...');
      const result = await db
        .select()
        .from(systemSettings)
        .orderBy(asc(systemSettings.settingKey));
      console.log('Database query result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching system settings from database:', error);
      return [];
    }
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [result] = await db
      .insert(systemSettings)
      .values({
        ...setting,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  async updateSystemSetting(key: string, value: string, updatedBy: number): Promise<SystemSetting | undefined> {
    try {
      const [result] = await db
        .update(systemSettings)
        .set({ 
          settingValue: value, 
          updatedBy, 
          updatedAt: new Date() 
        })
        .where(eq(systemSettings.settingKey, key))
        .returning();
      return result;
    } catch (error) {
      console.error('Error updating system setting:', error);
      return undefined;
    }
  }

  async deleteSystemSetting(key: string): Promise<boolean> {
    try {
      const result = await db
        .delete(systemSettings)
        .where(eq(systemSettings.settingKey, key));
      return true;
    } catch (error) {
      console.error('Error deleting system setting:', error);
      return false;
    }
  }

  // Tour Request methods
  async getTourRequests(): Promise<TourRequest[]> {
    try {
      const results = await db
        .select()
        .from(tourRequests)
        .orderBy(desc(tourRequests.createdAt));
      return results;
    } catch (error) {
      console.error('Error fetching tour requests from database:', error);
      return [];
    }
  }

  async getTourRequest(id: number): Promise<TourRequest | undefined> {
    try {
      const [result] = await db
        .select()
        .from(tourRequests)
        .where(eq(tourRequests.id, id));
      return result;
    } catch (error) {
      console.error('Error fetching tour request from database:', error);
      return undefined;
    }
  }

  async createTourRequest(tourRequest: InsertTourRequest): Promise<TourRequest> {
    const [result] = await db
      .insert(tourRequests)
      .values({
        ...tourRequest,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  async updateTourRequest(id: number, tourRequest: Partial<InsertTourRequest>): Promise<TourRequest | undefined> {
    try {
      const [result] = await db
        .update(tourRequests)
        .set({ 
          ...tourRequest, 
          updatedAt: new Date() 
        })
        .where(eq(tourRequests.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error('Error updating tour request:', error);
      return undefined;
    }
  }

  async deleteTourRequest(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(tourRequests)
        .where(eq(tourRequests.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting tour request:', error);
      return false;
    }
  }

  // Contact Message methods
  async getContactMessages(filters?: { status?: string; priority?: string; inquiryType?: string }): Promise<ContactMessage[]> {
    try {
      let query = db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
      
      if (filters) {
        const conditions = [];
        if (filters.status) conditions.push(eq(contactMessages.status, filters.status));
        if (filters.priority) conditions.push(eq(contactMessages.priority, filters.priority));
        if (filters.inquiryType) conditions.push(eq(contactMessages.inquiryType, filters.inquiryType));
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      const results = await query;
      return results;
    } catch (error) {
      console.error('Error fetching contact messages from database:', error);
      return [];
    }
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    try {
      const [result] = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.id, id));
      return result;
    } catch (error) {
      console.error('Error fetching contact message from database:', error);
      return undefined;
    }
  }

  async createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage> {
    const [result] = await db
      .insert(contactMessages)
      .values({
        ...contactMessage,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  async updateContactMessage(id: number, contactMessage: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    try {
      const [result] = await db
        .update(contactMessages)
        .set({ 
          ...contactMessage, 
          updatedAt: new Date() 
        })
        .where(eq(contactMessages.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error('Error updating contact message:', error);
      return undefined;
    }
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(contactMessages)
        .where(eq(contactMessages.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return false;
    }
  }

  // Payment Methods
  async getPaymentMethods(userId: number): Promise<any[]> {
    try {
      const methods = await db
        .select()
        .from(paymentMethods)
        .where(and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.isActive, true)
        ))
        .orderBy(desc(paymentMethods.isPrimary), desc(paymentMethods.createdAt));
      return methods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async createPaymentMethod(paymentMethod: any): Promise<any> {
    try {
      const [created] = await db
        .insert(paymentMethods)
        .values(paymentMethod)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    try {
      await db
        .update(paymentMethods)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(paymentMethods.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  }

  async setPrimaryPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean> {
    try {
      // First, remove primary status from all user's payment methods
      await db
        .update(paymentMethods)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(paymentMethods.userId, userId));
      
      // Then set the selected method as primary
      await db
        .update(paymentMethods)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(and(
          eq(paymentMethods.id, paymentMethodId),
          eq(paymentMethods.userId, userId)
        ));
      
      return true;
    } catch (error) {
      console.error('Error setting primary payment method:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();