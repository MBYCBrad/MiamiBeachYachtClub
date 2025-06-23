import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = {
  MEMBER: 'member',
  YACHT_OWNER: 'yacht_owner', 
  SERVICE_PROVIDER: 'service_provider',
  ADMIN: 'admin'
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
  images: jsonb("images").$type<string[]>().default([]),
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
