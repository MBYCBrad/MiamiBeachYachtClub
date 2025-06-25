import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, and, inArray, or, like, gte, lte, isNull, count, sum, avg } from 'drizzle-orm';
import {
  users,
  staff,
  yachts,
  services,
  events,
  bookings,
  serviceBookings,
  eventRegistrations,
  payments,
  mediaAssets,
  favorites,
  conversations,
  messages,
  notifications,
  crews,
  crewAssignments,
  yachtComponents,
  tripLogs,
  maintenanceRecords,
  usageMetrics,
  conditionAssessments,
  maintenanceSchedules,
  conciergeSupport,
  callRecords,
  type SelectUser,
  type InsertUser,
  type SelectStaff,
  type InsertStaff,
  type SelectYacht,
  type InsertYacht,
  type SelectService,
  type InsertService,
  type SelectEvent,
  type InsertEvent,
  type SelectBooking,
  type InsertBooking,
  type SelectServiceBooking,
  type InsertServiceBooking,
  type SelectEventRegistration,
  type InsertEventRegistration,
  type SelectPayment,
  type InsertPayment,
  type SelectMediaAsset,
  type InsertMediaAsset,
  type SelectFavorite,
  type InsertFavorite,
  type SelectConversation,
  type InsertConversation,
  type SelectMessage,
  type InsertMessage,
  type SelectNotification,
  type InsertNotification,
  type SelectCrew,
  type InsertCrew,
  type SelectCrewAssignment,
  type InsertCrewAssignment,
  type SelectYachtComponent,
  type InsertYachtComponent,
  type SelectTripLog,
  type InsertTripLog,
  type SelectMaintenanceRecord,
  type InsertMaintenanceRecord,
  type SelectUsageMetric,
  type InsertUsageMetric,
  type SelectConditionAssessment,
  type InsertConditionAssessment,
  type SelectMaintenanceSchedule,
  type InsertMaintenanceSchedule,
  type SelectConciergeSupport,
  type InsertConciergeSupport,
  type SelectCallRecord,
  type InsertCallRecord
} from '../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage {
  // User Management
  async getUsers(): Promise<SelectUser[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: number): Promise<SelectUser | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<SelectUser | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async createUser(user: InsertUser): Promise<SelectUser> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<SelectUser> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Staff Management
  async getStaff(): Promise<SelectStaff[]> {
    return db.select().from(staff).orderBy(desc(staff.createdAt));
  }

  async getStaffById(id: number): Promise<SelectStaff | null> {
    const result = await db.select().from(staff).where(eq(staff.id, id));
    return result[0] || null;
  }

  async getStaffByUsername(username: string): Promise<SelectStaff | null> {
    const result = await db.select().from(staff).where(eq(staff.username, username));
    return result[0] || null;
  }

  async createStaff(staffData: InsertStaff): Promise<SelectStaff> {
    const result = await db.insert(staff).values(staffData).returning();
    return result[0];
  }

  async updateStaff(id: number, updates: Partial<InsertStaff>): Promise<SelectStaff> {
    const result = await db.update(staff).set(updates).where(eq(staff.id, id)).returning();
    return result[0];
  }

  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Yacht Management
  async getYachts(): Promise<SelectYacht[]> {
    return db.select().from(yachts).orderBy(desc(yachts.createdAt));
  }

  async getYachtById(id: number): Promise<SelectYacht | null> {
    const result = await db.select().from(yachts).where(eq(yachts.id, id));
    return result[0] || null;
  }

  async createYacht(yacht: InsertYacht): Promise<SelectYacht> {
    const result = await db.insert(yachts).values(yacht).returning();
    return result[0];
  }

  async updateYacht(id: number, updates: Partial<InsertYacht>): Promise<SelectYacht> {
    const result = await db.update(yachts).set(updates).where(eq(yachts.id, id)).returning();
    return result[0];
  }

  async deleteYacht(id: number): Promise<void> {
    await db.delete(yachts).where(eq(yachts.id, id));
  }

  // Service Management
  async getServices(): Promise<SelectService[]> {
    return db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getServiceById(id: number): Promise<SelectService | null> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0] || null;
  }

  async createService(service: InsertService): Promise<SelectService> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<SelectService> {
    const result = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Event Management
  async getEvents(): Promise<SelectEvent[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEventById(id: number): Promise<SelectEvent | null> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0] || null;
  }

  async createEvent(event: InsertEvent): Promise<SelectEvent> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<SelectEvent> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Booking Management
  async getBookings(): Promise<SelectBooking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<SelectBooking | null> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0] || null;
  }

  async getBookingsByUserId(userId: number): Promise<SelectBooking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<SelectBooking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<SelectBooking> {
    const result = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Service Booking Management
  async getServiceBookings(): Promise<SelectServiceBooking[]> {
    return db.select().from(serviceBookings).orderBy(desc(serviceBookings.createdAt));
  }

  async getServiceBookingById(id: number): Promise<SelectServiceBooking | null> {
    const result = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    return result[0] || null;
  }

  async createServiceBooking(serviceBooking: InsertServiceBooking): Promise<SelectServiceBooking> {
    const result = await db.insert(serviceBookings).values(serviceBooking).returning();
    return result[0];
  }

  async updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<SelectServiceBooking> {
    const result = await db.update(serviceBookings).set(updates).where(eq(serviceBookings.id, id)).returning();
    return result[0];
  }

  async deleteServiceBooking(id: number): Promise<void> {
    await db.delete(serviceBookings).where(eq(serviceBookings.id, id));
  }

  // Event Registration Management
  async getEventRegistrations(): Promise<SelectEventRegistration[]> {
    return db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.createdAt));
  }

  async getEventRegistrationById(id: number): Promise<SelectEventRegistration | null> {
    const result = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id));
    return result[0] || null;
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<SelectEventRegistration> {
    const result = await db.insert(eventRegistrations).values(registration).returning();
    return result[0];
  }

  async updateEventRegistration(id: number, updates: Partial<InsertEventRegistration>): Promise<SelectEventRegistration> {
    const result = await db.update(eventRegistrations).set(updates).where(eq(eventRegistrations.id, id)).returning();
    return result[0];
  }

  async deleteEventRegistration(id: number): Promise<void> {
    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
  }

  // Payment Management
  async getPayments(): Promise<SelectPayment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentById(id: number): Promise<SelectPayment | null> {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0] || null;
  }

  async createPayment(payment: InsertPayment): Promise<SelectPayment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<SelectPayment> {
    const result = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async deletePayment(id: number): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Media Asset Management
  async getMediaAssets(): Promise<SelectMediaAsset[]> {
    return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  }

  async getMediaAssetById(id: number): Promise<SelectMediaAsset | null> {
    const result = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return result[0] || null;
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<SelectMediaAsset> {
    const result = await db.insert(mediaAssets).values(asset).returning();
    return result[0];
  }

  async updateMediaAsset(id: number, updates: Partial<InsertMediaAsset>): Promise<SelectMediaAsset> {
    const result = await db.update(mediaAssets).set(updates).where(eq(mediaAssets.id, id)).returning();
    return result[0];
  }

  async deleteMediaAsset(id: number): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  // Favorites Management
  async getFavorites(): Promise<SelectFavorite[]> {
    return db.select().from(favorites).orderBy(desc(favorites.createdAt));
  }

  async getFavoritesByUserId(userId: number): Promise<SelectFavorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async createFavorite(favorite: InsertFavorite): Promise<SelectFavorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  // Message Management
  async getConversations(): Promise<SelectConversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async getConversationById(id: string): Promise<SelectConversation | null> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0] || null;
  }

  async createConversation(conversation: InsertConversation): Promise<SelectConversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getMessages(): Promise<SelectMessage[]> {
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getMessagesByConversationId(conversationId: string): Promise<SelectMessage[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<SelectMessage> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Notification Management
  async getNotifications(): Promise<SelectNotification[]> {
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getNotificationsByUserId(userId: number): Promise<SelectNotification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<SelectNotification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async updateNotification(id: number, updates: Partial<InsertNotification>): Promise<SelectNotification> {
    const result = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return result[0];
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Crew Management
  async getCrews(): Promise<SelectCrew[]> {
    return db.select().from(crews).orderBy(desc(crews.createdAt));
  }

  async getCrewById(id: number): Promise<SelectCrew | null> {
    const result = await db.select().from(crews).where(eq(crews.id, id));
    return result[0] || null;
  }

  async createCrew(crew: InsertCrew): Promise<SelectCrew> {
    const result = await db.insert(crews).values(crew).returning();
    return result[0];
  }

  async updateCrew(id: number, updates: Partial<InsertCrew>): Promise<SelectCrew> {
    const result = await db.update(crews).set(updates).where(eq(crews.id, id)).returning();
    return result[0];
  }

  async deleteCrew(id: number): Promise<void> {
    await db.delete(crews).where(eq(crews.id, id));
  }

  // Crew Assignment Management
  async getCrewAssignments(): Promise<SelectCrewAssignment[]> {
    return db.select().from(crewAssignments).orderBy(desc(crewAssignments.createdAt));
  }

  async getCrewAssignmentById(id: string): Promise<SelectCrewAssignment | null> {
    const result = await db.select().from(crewAssignments).where(eq(crewAssignments.id, id));
    return result[0] || null;
  }

  async createCrewAssignment(assignment: InsertCrewAssignment): Promise<SelectCrewAssignment> {
    const result = await db.insert(crewAssignments).values(assignment).returning();
    return result[0];
  }

  async updateCrewAssignment(id: string, updates: Partial<InsertCrewAssignment>): Promise<SelectCrewAssignment> {
    const result = await db.update(crewAssignments).set(updates).where(eq(crewAssignments.id, id)).returning();
    return result[0];
  }

  async deleteCrewAssignment(id: string): Promise<void> {
    await db.delete(crewAssignments).where(eq(crewAssignments.id, id));
  }

  // Admin Statistics
  async getAdminStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [bookingCount] = await db.select({ count: count() }).from(bookings);
    const [serviceCount] = await db.select({ count: count() }).from(services);
    const [eventCount] = await db.select({ count: count() }).from(events);

    return {
      totalUsers: userCount.count,
      totalBookings: bookingCount.count,
      totalServices: serviceCount.count,
      totalEvents: eventCount.count
    };
  }

  // Staff Statistics
  async getStaffStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [bookingCount] = await db.select({ count: count() }).from(bookings);
    const [serviceCount] = await db.select({ count: count() }).from(services);

    return {
      totalUsers: userCount.count,
      totalBookings: bookingCount.count,
      totalServices: serviceCount.count
    };
  }

  // Yacht availability checking
  async checkYachtAvailability(yachtId: number, startTime: Date, endTime: Date): Promise<boolean> {
    const conflictingBookings = await db.select()
      .from(bookings)
      .where(
        and(
          eq(bookings.yachtId, yachtId),
          eq(bookings.status, 'confirmed'),
          or(
            and(gte(bookings.startTime, startTime), lte(bookings.startTime, endTime)),
            and(gte(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
            and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
          )
        )
      );

    return conflictingBookings.length === 0;
  }
}

export const dbStorage = new DatabaseStorage();