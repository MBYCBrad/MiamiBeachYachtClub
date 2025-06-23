import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum - Specific staff positions
export const UserRole = {
  MEMBER: 'member',
  YACHT_OWNER: 'yacht_owner', 
  SERVICE_PROVIDER: 'service_provider',
  ADMIN: 'admin',
  // Marina & Fleet Operations
  STAFF_MARINA_MANAGER: 'staff_marina_manager',
  STAFF_FLEET_COORDINATOR: 'staff_fleet_coordinator',
  STAFF_DOCK_MASTER: 'staff_dock_master',
  STAFF_YACHT_CAPTAIN: 'staff_yacht_captain',
  STAFF_FIRST_MATE: 'staff_first_mate',
  STAFF_CREW_SUPERVISOR: 'staff_crew_supervisor',
  // Member Services
  STAFF_MEMBER_RELATIONS: 'staff_member_relations',
  STAFF_CONCIERGE_MANAGER: 'staff_concierge_manager',
  STAFF_CONCIERGE_AGENT: 'staff_concierge_agent',
  STAFF_GUEST_SERVICES: 'staff_guest_services',
  STAFF_VIP_COORDINATOR: 'staff_vip_coordinator',
  // Operations & Support
  STAFF_OPERATIONS_MANAGER: 'staff_operations_manager',
  STAFF_BOOKING_COORDINATOR: 'staff_booking_coordinator',
  STAFF_SERVICE_COORDINATOR: 'staff_service_coordinator',
  STAFF_EVENT_COORDINATOR: 'staff_event_coordinator',
  STAFF_SAFETY_OFFICER: 'staff_safety_officer',
  // Finance & Administration
  STAFF_FINANCE_MANAGER: 'staff_finance_manager',
  STAFF_BILLING_SPECIALIST: 'staff_billing_specialist',
  STAFF_ACCOUNTS_MANAGER: 'staff_accounts_manager',
  // Technology & Analytics
  STAFF_IT_SPECIALIST: 'staff_it_specialist',
  STAFF_DATA_ANALYST: 'staff_data_analyst',
  STAFF_SYSTEMS_ADMINISTRATOR: 'staff_systems_administrator'
} as const;

export const MembershipTier = {
  BRONZE: 'bronze',
  SILVER: 'silver', 
  GOLD: 'gold',
  PLATINUM: 'platinum'
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.MEMBER),
  membershipTier: text("membership_tier"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeAccountId: text("stripe_account_id"), // For service providers and yacht owners
  stripeAccountStatus: text("stripe_account_status"), // pending, active, restricted
  phone: text("phone"),
  location: text("location"),
  language: text("language").default("en"),
  notifications: jsonb("notifications").$type<{
    bookings: boolean;
    events: boolean;
    marketing: boolean;
  }>().default({
    bookings: true,
    events: true,
    marketing: false
  }),
  permissions: jsonb("permissions").$type<{
    crew?: boolean;
    customerSupport?: boolean;
    concierge?: boolean;
    management?: boolean;
    analytics?: boolean;
    users?: boolean;
    yachts?: boolean;
    services?: boolean;
    events?: boolean;
    payments?: boolean;
  }>(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const yachts = pgTable("yachts", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id),
  name: text("name").notNull(),
  size: integer("size").notNull(), // in feet
  capacity: integer("capacity").notNull(),
  description: text("description"),
  imageUrl: text("image_url"), // Primary image for backward compatibility
  images: jsonb("images").$type<string[]>().default([]), // Array of image URLs
  location: text("location").notNull(),
  amenities: jsonb("amenities").$type<string[]>(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'photography', 'chef', 'massage', etc.
  description: text("description"),
  imageUrl: text("image_url"),
  pricePerSession: decimal("price_per_session", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in minutes
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  yachtId: integer("yacht_id").references(() => yachts.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  guestCount: integer("guest_count").notNull().default(1),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default('pending'), // 'pending', 'confirmed', 'cancelled'
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  bookingDate: timestamp("booking_date").notNull(),
  status: text("status").notNull().default('pending'),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  ticketCount: integer("ticket_count").notNull().default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  yachtId: integer("yacht_id").references(() => yachts.id),
  eventId: integer("event_id").references(() => events.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'video', 'image', 'audio'
  category: text("category").notNull(), // 'hero_video', 'yacht_gallery', 'service_image', etc.
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type"),
  duration: integer("duration"), // in seconds for videos
  dimensions: jsonb("dimensions").$type<{width: number, height: number}>(),
  isActive: boolean("is_active").default(true),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertYachtSchema = createInsertSchema(yachts).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  startTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  startTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
}).extend({
  bookingDate: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export type CrewMember = typeof crewMembers.$inferSelect;
export type InsertCrewMember = z.infer<typeof insertCrewMemberSchema>;
export type CrewAssignment = typeof crewAssignments.$inferSelect; 
export type InsertCrewAssignment = z.infer<typeof insertCrewAssignmentSchema>;

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  yachtId: integer("yacht_id").references(() => yachts.id),
  serviceId: integer("service_id").references(() => services.id),
  eventId: integer("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id),
  conversationId: text("conversation_id").notNull(), // For grouping messages
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, sms, notification
  status: text("status").notNull().default("sent"), // sent, delivered, read
  twilioSid: text("twilio_sid"), // Twilio message SID for SMS tracking
  metadata: jsonb("metadata").$type<{
    yachtId?: number;
    serviceId?: number;
    bookingId?: number;
    phoneNumber?: string;
    smsStatus?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const crewMembers = pgTable("crew_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // Captain, First Mate, Chef, Steward, Deckhand
  specialization: text("specialization").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  experience: integer("experience").notNull(), // years
  certifications: jsonb("certifications").$type<string[]>().notNull(),
  availability: text("availability").notNull().default("available"), // available, assigned, off-duty
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  currentAssignment: text("current_assignment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crewAssignments = pgTable("crew_assignments", {
  id: text("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  crewMemberIds: jsonb("crew_member_ids").$type<number[]>().notNull(),
  captainId: integer("captain_id").references(() => crewMembers.id).notNull(),
  coordinatorId: integer("coordinator_id").references(() => crewMembers.id).notNull(),
  status: text("status").notNull().default("planned"), // planned, assigned, active, completed
  briefingTime: timestamp("briefing_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCrewMemberSchema = createInsertSchema(crewMembers).omit({
  id: true,
  createdAt: true,
});

export const insertCrewAssignmentSchema = createInsertSchema(crewAssignments).omit({
  createdAt: true,
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'booking_created', 'booking_cancelled', 'service_booked', 'event_registered', 'payment_processed', 'message_received'
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<{
    bookingId?: number;
    yachtId?: number;
    serviceId?: number;
    eventId?: number;
    messageId?: number;
    paymentId?: string;
    amount?: number;
    yachtName?: string;
    serviceName?: string;
    eventTitle?: string;
    senderName?: string;
  }>(),
  priority: text("priority").notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  read: boolean("read").notNull().default(false),
  actionUrl: text("action_url"), // URL to navigate when notification is clicked
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Conversations table for tracking member conversations
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(), // UUID string
  memberId: integer("member_id").references(() => users.id).notNull(),
  memberName: text("member_name").notNull(),
  memberPhone: text("member_phone"),
  membershipTier: text("membership_tier").notNull(),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  status: text("status").notNull().default("active"), // active, pending, resolved, escalated
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  tags: jsonb("tags").$type<string[]>().default([]),
  assignedAgent: integer("assigned_agent").references(() => users.id),
  currentTripId: integer("current_trip_id").references(() => bookings.id),
  metadata: jsonb("metadata").$type<{
    yachtId?: number;
    yachtName?: string;
    tripStartTime?: string;
    tripEndTime?: string;
    lastContactMethod?: string;
    emergencyLevel?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  createdAt: true,
  updatedAt: true,
});

// Phone calls table for tracking Twilio voice calls
export const phoneCalls = pgTable("phone_calls", {
  id: text("id").primaryKey(), // UUID string
  twilioCallSid: text("twilio_call_sid").unique(),
  memberId: integer("member_id").references(() => users.id).notNull(),
  memberName: text("member_name").notNull(),
  memberPhone: text("member_phone").notNull(),
  agentId: integer("agent_id").references(() => users.id),
  callType: text("call_type").notNull(), // inbound, outbound
  status: text("status").notNull().default("ringing"), // ringing, active, ended, missed, failed
  direction: text("direction").notNull(), // inbound, outbound
  duration: integer("duration"), // in seconds
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  reason: text("reason").notNull(), // trip_start, trip_emergency, trip_end, general_inquiry, concierge_request
  tripId: integer("trip_id").references(() => bookings.id),
  yachtId: integer("yacht_id").references(() => yachts.id),
  notes: text("notes"),
  recordingUrl: text("recording_url"),
  cost: decimal("cost", { precision: 10, scale: 4 }), // Twilio call cost
  metadata: jsonb("metadata").$type<{
    twilioStatus?: string;
    errorCode?: string;
    errorMessage?: string;
    callerName?: string;
    location?: string;
    emergencyLevel?: string;
    transferredTo?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPhoneCallSchema = createInsertSchema(phoneCalls).omit({
  createdAt: true,
  updatedAt: true,
});

// Message thread analytics for insights
export const messageAnalytics = pgTable("message_analytics", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  messageCount: integer("message_count").default(0),
  responseTime: integer("response_time"), // Average response time in minutes
  sentiment: text("sentiment"), // positive, neutral, negative
  keywords: jsonb("keywords").$type<string[]>().default([]),
  escalated: boolean("escalated").default(false),
  resolved: boolean("resolved").default(false),
  satisfaction: integer("satisfaction"), // 1-5 rating if provided
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageAnalyticsSchema = createInsertSchema(messageAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Yacht = typeof yachts.$inferSelect;
export type InsertYacht = z.infer<typeof insertYachtSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type PhoneCall = typeof phoneCalls.$inferSelect;
export type InsertPhoneCall = z.infer<typeof insertPhoneCallSchema>;
export type MessageAnalytics = typeof messageAnalytics.$inferSelect;
export type InsertMessageAnalytics = z.infer<typeof insertMessageAnalyticsSchema>;
