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

// Yacht Maintenance System Tables - Comprehensive management and analytics
export const yachtComponents = pgTable("yacht_components", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentType: text("component_type").notNull(), // engine, hull, sail, electronics, interior, safety, deck
  componentName: text("component_name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  installationDate: timestamp("installation_date"),
  warrantyExpiration: timestamp("warranty_expiration"),
  expectedLifespan: integer("expected_lifespan"), // in hours/days depending on component
  currentCondition: decimal("current_condition", { precision: 5, scale: 2 }).default("100.00"), // percentage 0-100
  lastInspectionDate: timestamp("last_inspection_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  maintenanceInterval: integer("maintenance_interval"), // in days or hours
  replacementCost: decimal("replacement_cost", { precision: 10, scale: 2 }),
  criticality: text("criticality").notNull().default("medium"), // low, medium, high, critical
  specifications: jsonb("specifications").$type<{
    maxOperatingTemp?: number;
    operatingPressure?: number;
    fuelType?: string;
    voltage?: number;
    capacity?: number;
    dimensions?: string;
    weight?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripLogs = pgTable("trip_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  captainId: integer("captain_id").references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location"),
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }), // nautical miles
  maxSpeed: decimal("max_speed", { precision: 5, scale: 2 }), // knots
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }), // knots
  engineHours: decimal("engine_hours", { precision: 8, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 8, scale: 2 }), // gallons
  weatherConditions: jsonb("weather_conditions").$type<{
    windSpeed?: number;
    windDirection?: string;
    waveHeight?: number;
    temperature?: number;
    visibility?: string;
    precipitation?: string;
  }>(),
  guestCount: integer("guest_count"),
  crewNotes: text("crew_notes"),
  damageReported: boolean("damage_reported").default(false),
  maintenanceRequired: boolean("maintenance_required").default(false),
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }), // percentage
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }), // percentage
  waterLevel: decimal("water_level", { precision: 5, scale: 2 }), // percentage
  wasteLevel: decimal("waste_level", { precision: 5, scale: 2 }), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  taskType: text("task_type").notNull(), // preventive, corrective, emergency, inspection
  category: text("category").notNull(), // engine, hull, electronics, safety, cosmetic
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  estimatedDuration: integer("estimated_duration_hours"),
  actualDuration: integer("actual_duration_hours"),
  assignedTo: text("assigned_to"),
  assignedById: integer("assigned_by_id").references(() => users.id),
  completedBy: text("completed_by"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  partsUsed: jsonb("parts_used").$type<Array<{
    partName: string;
    partNumber?: string;
    quantity: number;
    unitCost: number;
    supplier?: string;
  }>>().default([]),
  workPhotos: jsonb("work_photos").$type<string[]>().default([]),
  workNotes: text("work_notes"),
  qualityCheckPassed: boolean("quality_check_passed"),
  warrantyInfo: text("warranty_info"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  maintenanceInterval: integer("maintenance_interval"), // in days or hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageMetrics = pgTable("usage_metrics", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  metricType: text("metric_type").notNull(), // engine_hours, fuel_consumption, distance, usage_time
  metricValue: text("metric_value").notNull(),
  unit: text("unit").notNull(), // hours, gallons, nautical_miles, minutes
  recordedAt: timestamp("recorded_at").defaultNow(),
  environmentalFactors: jsonb("environmental_factors").$type<{
    saltWaterExposure?: number;
    sunExposureHours?: number;
    roughSeaExposure?: number;
    temperature?: number;
    humidity?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conditionAssessments = pgTable("condition_assessments", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  assessorId: integer("assessor_id").references(() => users.id).notNull(),
  overallScore: integer("overall_score").notNull(), // 1-100
  assessmentDate: timestamp("assessment_date").notNull(),
  conditionDetails: jsonb("condition_details").$type<{
    visualInspection?: number;
    functionalTest?: number;
    performanceMetrics?: number;
    wearAndTear?: number;
  }>(),
  criticalIssues: jsonb("critical_issues").$type<Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    urgency: 'immediate' | 'within_week' | 'within_month' | 'routine';
  }>>().default([]),
  recommendations: text("recommendations"),
  photos: jsonb("photos").$type<string[]>().default([]),
  nextAssessmentDate: timestamp("next_assessment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  taskName: text("task_name").notNull(),
  taskDescription: text("task_description"),
  frequency: text("frequency").notNull(), // daily, weekly, monthly, quarterly, annually, hours_based
  intervalValue: integer("interval_value"), // number of days/hours between maintenance
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due").notNull(),
  priority: text("priority").notNull().default("medium"),
  estimatedDuration: integer("estimated_duration_hours"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  assignedTo: text("assigned_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const yachtValuations = pgTable("yacht_valuations", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  currentMarketValue: decimal("current_market_value", { precision: 12, scale: 2 }).notNull(),
  originalPurchasePrice: decimal("original_purchase_price", { precision: 12, scale: 2 }),
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }),
  totalMaintenanceCost: decimal("total_maintenance_cost", { precision: 12, scale: 2 }).default('0'),
  projectedMaintenanceCost: decimal("projected_maintenance_cost", { precision: 12, scale: 2 }),
  maintenanceVsValueRatio: decimal("maintenance_vs_value_ratio", { precision: 5, scale: 2 }),
  sweetSpotScore: integer("sweet_spot_score"), // 1-100, higher = better time to sell
  sweetSpotAnalysis: text("sweet_spot_analysis"),
  optimalSellDate: timestamp("optimal_sell_date"),
  marketCondition: text("market_condition"), // strong, moderate, weak
  seasonalFactor: decimal("seasonal_factor", { precision: 3, scale: 2 }),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  validUntil: timestamp("valid_until"),
  assessedBy: text("assessed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for yacht maintenance tables
export const insertYachtComponentSchema = createInsertSchema(yachtComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTripLogSchema = createInsertSchema(tripLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.union([z.date(), z.string().transform(str => new Date(str))]),
  completedDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  nextMaintenanceDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertUsageMetricSchema = createInsertSchema(usageMetrics).omit({
  id: true,
  createdAt: true,
}).extend({
  recordedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertConditionAssessmentSchema = createInsertSchema(conditionAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  assessmentDate: z.union([z.date(), z.string().transform(str => new Date(str))]),
  nextAssessmentDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  lastCompleted: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  nextDue: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertYachtValuationSchema = createInsertSchema(yachtValuations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  optimalSellDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  assessmentDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  validUntil: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

// Type exports for yacht maintenance system
export type YachtComponent = typeof yachtComponents.$inferSelect;
export type InsertYachtComponent = z.infer<typeof insertYachtComponentSchema>;
export type TripLog = typeof tripLogs.$inferSelect;
export type InsertTripLog = z.infer<typeof insertTripLogSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type InsertUsageMetric = z.infer<typeof insertUsageMetricSchema>;
export type ConditionAssessment = typeof conditionAssessments.$inferSelect;
export type InsertConditionAssessment = z.infer<typeof insertConditionAssessmentSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
export type YachtValuation = typeof yachtValuations.$inferSelect;
export type InsertYachtValuation = z.infer<typeof insertYachtValuationSchema>;

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

// Staff table for hierarchical staff management
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdBy: integer("created_by").references(() => users.id),
  phone: text("phone"),
  location: text("location"),
  lastLogin: timestamp("last_login"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
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
  captainId: integer("captain_id").references(() => staff.id).notNull(),
  coordinatorId: integer("coordinator_id").references(() => staff.id).notNull(),
  status: text("status").notNull().default("planned"), // planned, assigned, active, completed
  briefingTime: timestamp("briefing_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Yacht Maintenance System Tables
export const yachtComponents = pgTable("yacht_components", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentType: text("component_type").notNull(), // engine, hull, sail, electronics, interior, safety, deck
  componentName: text("component_name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  installationDate: timestamp("installation_date"),
  warrantyExpiration: timestamp("warranty_expiration"),
  expectedLifespan: integer("expected_lifespan"), // in hours/days depending on component
  currentCondition: decimal("current_condition", { precision: 5, scale: 2 }).default("100.00"), // percentage 0-100
  lastInspectionDate: timestamp("last_inspection_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  maintenanceInterval: integer("maintenance_interval"), // in days or hours
  replacementCost: decimal("replacement_cost", { precision: 10, scale: 2 }),
  criticality: text("criticality").notNull().default("medium"), // low, medium, high, critical
  specifications: jsonb("specifications").$type<{
    maxOperatingTemp?: number;
    operatingPressure?: number;
    fuelType?: string;
    voltage?: number;
    capacity?: number;
    dimensions?: string;
    weight?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripLogs = pgTable("trip_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  captainId: integer("captain_id").references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location"),
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }), // nautical miles
  maxSpeed: decimal("max_speed", { precision: 5, scale: 2 }), // knots
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }), // knots
  engineHours: decimal("engine_hours", { precision: 8, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 8, scale: 2 }), // gallons
  weatherConditions: jsonb("weather_conditions").$type<{
    windSpeed?: number;
    windDirection?: string;
    waveHeight?: number;
    temperature?: number;
    visibility?: string;
    precipitation?: string;
  }>(),
  guestCount: integer("guest_count"),
  crewNotes: text("crew_notes"),
  damageReported: boolean("damage_reported").default(false),
  maintenanceRequired: boolean("maintenance_required").default(false),
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }), // percentage
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }), // percentage
  waterLevel: decimal("water_level", { precision: 5, scale: 2 }), // percentage
  wasteLevel: decimal("waste_level", { precision: 5, scale: 2 }), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  maintenanceType: text("maintenance_type").notNull(), // preventive, corrective, emergency, inspection
  severity: text("severity").notNull().default("low"), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0.00"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0.00"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0.00"),
  technicianId: integer("technician_id").references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  partsUsed: jsonb("parts_used").$type<Array<{
    partName: string;
    partNumber?: string;
    quantity: number;
    unitCost: number;
    supplier?: string;
  }>>(),
  beforeCondition: decimal("before_condition", { precision: 5, scale: 2 }),
  afterCondition: decimal("after_condition", { precision: 5, scale: 2 }),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  photos: text("photos").array(),
  warrantyInfo: jsonb("warranty_info").$type<{
    warrantyPeriod?: number; // days
    warrantyProvider?: string;
    warrantyTerms?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageMetrics = pgTable("usage_metrics", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  metricType: text("metric_type").notNull(), // engine_hours, sun_exposure, salt_exposure, wave_impact, usage_hours
  metricValue: decimal("metric_value", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(), // hours, minutes, uv_index, salinity, force_level
  recordedAt: timestamp("recorded_at").defaultNow(),
  environmentalFactors: jsonb("environmental_factors").$type<{
    uvIndex?: number;
    saltWaterExposure?: number; // hours
    temperature?: number;
    humidity?: number;
    windStress?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conditionAssessments = pgTable("condition_assessments", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  assessorId: integer("assessor_id").references(() => users.id).notNull(),
  assessmentType: text("assessment_type").notNull(), // routine, pre_trip, post_trip, damage, inspection
  overallCondition: decimal("overall_condition", { precision: 5, scale: 2 }).notNull(), // 0-100
  visualCondition: decimal("visual_condition", { precision: 5, scale: 2 }), // appearance, scratches, fading
  functionalCondition: decimal("functional_condition", { precision: 5, scale: 2 }), // performance, efficiency
  structuralCondition: decimal("structural_condition", { precision: 5, scale: 2 }), // integrity, safety
  assessmentNotes: text("assessment_notes"),
  issuesFound: jsonb("issues_found").$type<Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    estimated_cost?: number;
    urgency?: 'immediate' | 'urgent' | 'moderate' | 'low';
  }>>(),
  recommendations: jsonb("recommendations").$type<Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimated_cost?: number;
    timeframe?: string;
  }>>(),
  photos: text("photos").array(),
  nextAssessmentDate: timestamp("next_assessment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  taskName: text("task_name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // daily, weekly, monthly, quarterly, annually, hours_based, usage_based
  frequencyValue: integer("frequency_value"), // number of days, hours, or usage cycles
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  estimatedDuration: integer("estimated_duration"), // minutes
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  requiredSkills: text("required_skills").array(),
  isActive: boolean("is_active").default(true),
  autoReschedule: boolean("auto_reschedule").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const yachtValuations = pgTable("yacht_valuations", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  currentMarketValue: decimal("current_market_value", { precision: 12, scale: 2 }).notNull(),
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }), // annual percentage
  maintenanceCostToDate: decimal("maintenance_cost_to_date", { precision: 12, scale: 2 }).default("0.00"),
  projectedMaintenanceCost: decimal("projected_maintenance_cost", { precision: 12, scale: 2 }), // next 12 months
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 2 }), // percentage of time in use
  revenueGenerated: decimal("revenue_generated", { precision: 12, scale: 2 }).default("0.00"),
  totalOperatingCost: decimal("total_operating_cost", { precision: 12, scale: 2 }).default("0.00"),
  profitability: decimal("profitability", { precision: 12, scale: 2 }), // revenue - operating costs
  sellRecommendation: text("sell_recommendation").default("hold"), // sell, hold, upgrade
  sellRecommendationReason: text("sell_recommendation_reason"),
  optimalSellDate: timestamp("optimal_sell_date"),
  estimatedSaleValue: decimal("estimated_sale_value", { precision: 12, scale: 2 }),
  replacementCost: decimal("replacement_cost", { precision: 12, scale: 2 }),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  validUntil: timestamp("valid_until"), // when this valuation expires
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for maintenance system
export const insertYachtComponentSchema = createInsertSchema(yachtComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  installationDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  warrantyExpiration: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  lastInspectionDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  nextMaintenanceDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertTripLogSchema = createInsertSchema(tripLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  completedDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  nextMaintenanceDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertUsageMetricSchema = createInsertSchema(usageMetrics).omit({
  id: true,
  createdAt: true,
}).extend({
  recordedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertConditionAssessmentSchema = createInsertSchema(conditionAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  nextAssessmentDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  lastCompleted: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  nextDue: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertYachtValuationSchema = createInsertSchema(yachtValuations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  optimalSellDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  assessmentDate: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
  validUntil: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

// Type exports for maintenance system
export type YachtComponent = typeof yachtComponents.$inferSelect;
export type InsertYachtComponent = z.infer<typeof insertYachtComponentSchema>;
export type TripLog = typeof tripLogs.$inferSelect;
export type InsertTripLog = z.infer<typeof insertTripLogSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type InsertUsageMetric = z.infer<typeof insertUsageMetricSchema>;
export type ConditionAssessment = typeof conditionAssessments.$inferSelect;
export type InsertConditionAssessment = z.infer<typeof insertConditionAssessmentSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
export type YachtValuation = typeof yachtValuations.$inferSelect;
export type InsertYachtValuation = z.infer<typeof insertYachtValuationSchema>;
