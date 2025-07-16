import { pgTable, serial, text, integer, decimal, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role and membership tier definitions
export const UserRole = {
  MEMBER: "member",
  YACHT_OWNER: "yacht_owner", 
  SERVICE_PROVIDER: "service_provider",
  ADMIN: "admin"
} as const;

// Staff role definitions - separate from user roles
export const StaffRole = {
  MARINA_MANAGER: "Marina Manager",
  FLEET_COORDINATOR: "Fleet Coordinator",
  DOCK_MASTER: "Dock Master",
  YACHT_CAPTAIN: "Yacht Captain",
  FIRST_MATE: "First Mate",
  CREW_SUPERVISOR: "Crew Supervisor",
  MEMBER_RELATIONS: "Member Relations Specialist",
  CONCIERGE_MANAGER: "Concierge Manager",
  CONCIERGE_AGENT: "Concierge Agent",
  GUEST_SERVICES: "Guest Services Representative",
  VIP_COORDINATOR: "VIP Coordinator",
  OPERATIONS_MANAGER: "Operations Manager",
  BOOKING_COORDINATOR: "Booking Coordinator",
  SERVICE_COORDINATOR: "Service Coordinator",
  EVENT_COORDINATOR: "Event Coordinator",
  SAFETY_OFFICER: "Safety Officer",
  FINANCE_MANAGER: "Finance Manager",
  BILLING_SPECIALIST: "Billing Specialist",
  ACCOUNTS_MANAGER: "Accounts Manager",
  IT_SPECIALIST: "IT Specialist",
  DATA_ANALYST: "Data Analyst",
  SYSTEMS_ADMIN: "Systems Administrator"
} as const;

export const MembershipTier = {
  BRONZE: "bronze",
  SILVER: "silver", 
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  MARINER_GOLD: "mariner_gold",
  MARINER_PLATINUM: "mariner_platinum", 
  MARINER_DIAMOND: "mariner_diamond"
} as const;

export const MembershipPackage = {
  FULL: "full",
  MARINERS: "mariners"
} as const;

// Predefined locations for Miami Beach area services
export const MARINA_LOCATIONS = [
  "Miami Beach Marina",
  "Island Gardens Deep Harbour",
  "Bayfront Park Marina",
  "Crandon Park Marina",
  "Dinner Key Marina",
  "Haulover Marine Center",
  "Miamarina at Bayside",
  "Rickenbacker Marina",
  "Watson Island Marina",
  "Coconut Grove Marina"
] as const;

export const EXTERNAL_LOCATIONS = [
  "Miami Beach",
  "South Beach", 
  "Downtown Miami",
  "Brickell",
  "Coconut Grove",
  "Key Biscayne",
  "Coral Gables",
  "Aventura",
  "Bal Harbour",
  "Fisher Island"
] as const;

export const SERVICE_AREAS = [
  "Miami-Dade County",
  "Broward County",
  "Monroe County (Keys)",
  "Palm Beach County"
] as const;

// Core tables
export const users: any = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  fullName: text("full_name"),
  role: text("role").notNull(),
  membershipTier: text("membership_tier"),
  membershipPackage: text("membership_package"), // regular or mariners
  membershipStatus: text("membership_status").default("active"),
  profileImage: text("profile_image"),
  language: text("language").default("en"),
  location: text("location"),
  bio: text("bio"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  themePreference: text("theme_preference").default("ocean"),
  customTheme: jsonb("custom_theme"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const yachts = pgTable("yachts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  size: integer("size").notNull(),
  capacity: integer("capacity").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  description: text("description"),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  rating: text("rating"), // Average rating from yacht experience reviews
  // Admin/Owner only fields for maintenance calculations
  yearMade: integer("year_made"), // For depreciation calculations
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }), // Purchase/market value for maintenance planning
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  pricePerSession: decimal("price_per_session", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // in minutes
  serviceType: text("service_type").notNull().default("location"), // "yacht" or "location"
  deliveryType: text("delivery_type").notNull().default("location"), // "location", "marina", "yacht", "external_location"
  serviceAreas: jsonb("service_areas").$type<string[]>().default([]), // Available cities/areas for location services
  requiresAddress: boolean("requires_address").default(true), // Whether member needs to provide address
  marinaLocation: text("marina_location"), // Specific marina location for marina services
  businessAddress: text("business_address"), // Business address for external_location services
  proximityMiles: integer("proximity_miles").default(10), // Service radius in miles for "come to you" services
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  images: jsonb("images").$type<string[]>().default([]),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  images: jsonb("images").$type<string[]>().default([]),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  guestCount: integer("guest_count").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("confirmed"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).default("0.00"),
  // Crew assignment fields for automated status management
  assignedCaptain: integer("assigned_captain").references(() => users.id),
  assignedFirstMate: integer("assigned_first_mate").references(() => users.id),
  assignedCrew: jsonb("assigned_crew").$type<number[]>().default([]), // Array of staff IDs
  crewAssignedAt: timestamp("crew_assigned_at"),
  automaticStatusEnabled: boolean("automatic_status_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  yachtBookingId: integer("yacht_booking_id").references(() => bookings.id), // for yacht-specific services
  bookingDate: timestamp("booking_date").notNull(),
  time: text("time"), // Time slot for the service
  duration: integer("duration"), // Service duration in minutes
  location: text("location"), // for location-based services
  customLocation: text("custom_location"), // Custom location address
  serviceAddress: text("service_address"), // Member's chosen address for location services
  deliveryNotes: text("delivery_notes"), // Special delivery instructions
  specialRequests: text("special_requests"),
  guestCount: integer("guest_count").default(1),
  occasion: text("occasion"), // leisure, romantic, celebration, business
  preferredYacht: text("preferred_yacht"), // Preferred yacht name for service
  status: text("status").notNull().default("pending"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  ticketCount: integer("ticket_count").notNull().default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("confirmed"),
  confirmationCode: text("confirmation_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  yachtId: integer("yacht_id").references(() => yachts.id),
  eventId: integer("event_id").references(() => events.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  duration: integer("duration"),
  dimensions: jsonb("dimensions").$type<{width: number, height: number}>(),
  isActive: boolean("is_active").default(true),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  originalName: text("original_name"),
  mimetype: text("mimetype"),
  size: integer("size"),
  path: text("path"),
});

// Support system tables
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password"),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  status: text("status").notNull().default("active"),
  location: text("location"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crewMembers = pgTable("crew_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  specialization: text("specialization").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  experience: integer("experience").notNull(),
  certifications: jsonb("certifications").$type<string[]>().notNull(),
  availability: text("availability").notNull().default("available"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  currentAssignment: text("current_assignment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crewAssignments = pgTable("crew_assignments", {
  id: text("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  crewMemberIds: jsonb("crew_member_ids").$type<number[]>().default([]),
  captainId: integer("captain_id").references(() => staff.id).notNull(),
  coordinatorId: integer("coordinator_id").references(() => staff.id).notNull(),
  status: text("status").notNull().default("planned"),
  briefingTime: timestamp("briefing_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  yachtId: integer("yacht_id").references(() => yachts.id),
  serviceId: integer("service_id").references(() => services.id),
  eventId: integer("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Yacht Maintenance System Tables
export const yachtComponents = pgTable("yacht_components", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentType: text("component_type").notNull(),
  componentName: text("component_name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  installationDate: timestamp("installation_date"),
  warrantyExpiration: timestamp("warranty_expiration"),
  expectedLifespan: integer("expected_lifespan"),
  currentCondition: decimal("current_condition", { precision: 5, scale: 2 }).default("100.00"),
  lastInspectionDate: timestamp("last_inspection_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  maintenanceInterval: integer("maintenance_interval"),
  replacementCost: decimal("replacement_cost", { precision: 10, scale: 2 }),
  criticality: text("criticality").notNull().default("medium"),
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
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }),
  maxSpeed: decimal("max_speed", { precision: 5, scale: 2 }),
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }),
  engineHours: decimal("engine_hours", { precision: 8, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 8, scale: 2 }),
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
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }),
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }),
  waterLevel: decimal("water_level", { precision: 5, scale: 2 }),
  wasteLevel: decimal("waste_level", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  taskType: text("task_type").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("scheduled"),
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
  maintenanceInterval: integer("maintenance_interval"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageMetrics = pgTable("usage_metrics", {
  id: serial("id").primaryKey(),
  yachtId: integer("yacht_id").references(() => yachts.id).notNull(),
  componentId: integer("component_id").references(() => yachtComponents.id),
  tripLogId: integer("trip_log_id").references(() => tripLogs.id),
  metricType: text("metric_type").notNull(),
  metricValue: text("metric_value").notNull(),
  unit: text("unit").notNull(),
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
  overallScore: integer("overall_score").notNull(),
  condition: text("condition").notNull(),
  priority: text("priority").notNull().default("medium"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  recommendedAction: text("recommended_action"),
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
  frequency: text("frequency").notNull(),
  intervalValue: integer("interval_value"),
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
  sweetSpotScore: integer("sweet_spot_score"),
  sweetSpotAnalysis: text("sweet_spot_analysis"),
  optimalSellDate: timestamp("optimal_sell_date"),
  marketCondition: text("market_condition"),
  seasonalFactor: decimal("seasonal_factor", { precision: 3, scale: 2 }),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  validUntil: timestamp("valid_until"),
  assessedBy: text("assessed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication system tables
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id),
  conversationId: text("conversation_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"),
  status: text("status").default("sent"),
  twilioSid: text("twilio_sid"),
  metadata: jsonb("metadata").$type<{
    yachtId?: number;
    tripId?: number;
    urgency?: string;
    location?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
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
  priority: text("priority").notNull().default('medium'),
  read: boolean("read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  memberId: integer("member_id").references(() => users.id).notNull(),
  memberName: text("member_name").notNull(),
  memberPhone: text("member_phone"),
  membershipTier: text("membership_tier").notNull(),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  status: text("status").notNull().default("active"),
  priority: text("priority").notNull().default("medium"),
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

export const phoneCalls = pgTable("phone_calls", {
  id: text("id").primaryKey(),
  memberId: integer("member_id").references(() => users.id).notNull(),
  memberName: text("member_name").notNull(),
  memberPhone: text("member_phone").notNull(),
  agentId: integer("agent_id").references(() => users.id),
  callType: text("call_type").notNull(),
  status: text("status").notNull().default("ringing"),
  direction: text("direction").notNull(),
  duration: integer("duration"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  reason: text("reason").notNull(),
  tripId: integer("trip_id").references(() => bookings.id),
  yachtId: integer("yacht_id").references(() => yachts.id),
  notes: text("notes"),
  recordingUrl: text("recording_url"),
  cost: decimal("cost", { precision: 10, scale: 4 }),
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

export const messageAnalytics = pgTable("message_analytics", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id).notNull(),
  date: text("date").notNull(),
  messageCount: integer("message_count").default(0),
  responseTime: integer("response_time"),
  sentiment: text("sentiment"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  escalated: boolean("escalated").default(false),
  resolved: boolean("resolved").default(false),
  satisfaction: integer("satisfaction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  // Application Type - determines which form was used
  applicationType: text("application_type").notNull().default("member"), // member, yacht_partner, service_provider, event_provider
  // Step 1: Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  occupation: text("occupation").notNull(),
  employer: text("employer"),
  
  // Step 2: Membership Package Selection
  membershipTier: text("membership_tier").notNull(), // bronze, silver, gold, platinum
  membershipPackage: text("membership_package"), // full or mariners
  preferredLocation: text("preferred_location").notNull(),
  expectedUsageFrequency: text("expected_usage_frequency").notNull(),
  primaryUseCase: text("primary_use_case").notNull(),
  groupSize: text("group_size").notNull(),
  
  // Step 3: Financial Information
  annualIncome: text("annual_income").notNull(),
  netWorth: text("net_worth").notNull(),
  liquidAssets: text("liquid_assets").notNull(),
  creditScore: text("credit_score").notNull(),
  bankName: text("bank_name").notNull(),
  hasBoatingExperience: boolean("has_boating_experience").notNull(),
  boatingExperienceYears: integer("boating_experience_years"),
  boatingLicenseNumber: text("boating_license_number"),
  
  // Step 4: References and Final Details
  referenceSource: text("reference_source").notNull(),
  referralName: text("referral_name"),
  preferredStartDate: text("preferred_start_date").notNull(),
  specialRequests: text("special_requests"),
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  emergencyContactRelation: text("emergency_contact_relation").notNull(),
  agreeToTerms: boolean("agree_to_terms").notNull(),
  agreeToBackground: boolean("agree_to_background").notNull(),
  marketingOptIn: boolean("marketing_opt_in").default(false),
  
  // Partner-specific fields (flexible for yacht, service, and event partners)
  fullName: text("full_name"), // For partner applications
  company: text("company"), // For partner applications
  message: text("message"), // Additional message for partners
  details: jsonb("details").$type<{
    // Yacht Partner fields
    yachtName?: string;
    yachtType?: string;
    yachtLength?: string;
    yachtYear?: string;
    homePort?: string;
    experience?: string;
    partnershipType?: string;
    expectedRevenue?: string;
    
    // Service Provider fields
    businessType?: string;
    serviceCategories?: string[];
    deliveryTypes?: string[];
    coverage?: string;
    pricing?: string;
    portfolio?: string;
    
    // Event Provider fields
    eventTypes?: string[];
    capacity?: string;
    budget?: string;
  }>(),
  
  // System fields
  status: text("status").notNull().default("pending"), // pending, approved, rejected, under_review
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  approvalScore: integer("approval_score"), // 1-100 internal scoring
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourRequests = pgTable("tour_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  groupSize: text("group_size").notNull(), // Database stores as text, not integer
  preferredDate: text("preferred_date").notNull(), // Database stores as text, not date
  preferredTime: text("preferred_time").notNull(), // morning, afternoon, evening
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  assignedTo: integer("assigned_to").references(() => users.id),
  scheduledDateTime: timestamp("scheduled_date_time"),
  notes: text("notes"),
  responseNotes: text("response_notes"),
  contactedAt: timestamp("contacted_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  inquiryType: text("inquiry_type").notNull(), // general, membership, events, services, technical, partnerships
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("new"), // new, in_progress, resolved, closed
  assignedTo: integer("assigned_to").references(() => users.id).default(60), // Default to Simon Librati
  source: text("source").default("website"), // website, phone, email, social
  tags: jsonb("tags").$type<string[]>().default([]),
  internalNotes: text("internal_notes"),
  responseNotes: text("response_notes"),
  contactedAt: timestamp("contacted_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYachtSchema = createInsertSchema(yachts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  userId: true, // Omit userId since server sets it automatically
}).extend({
  startTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
  userId: true, // Omit userId since server sets it automatically
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrewMemberSchema = createInsertSchema(crewMembers).omit({
  id: true,
  createdAt: true,
});

export const insertCrewAssignmentSchema = createInsertSchema(crewAssignments).omit({
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPhoneCallSchema = createInsertSchema(phoneCalls).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMessageAnalyticsSchema = createInsertSchema(messageAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Make member-specific fields optional for partner applications
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  occupation: z.string().optional(),
  membershipTier: z.string().optional(),
  preferredLocation: z.string().optional(),
  expectedUsageFrequency: z.string().optional(),
  primaryUseCase: z.string().optional(),
  groupSize: z.string().optional(),
  annualIncome: z.string().optional(),
  netWorth: z.string().optional(),
  liquidAssets: z.string().optional(),
  creditScore: z.string().optional(),
  bankName: z.string().optional(),
  hasBoatingExperience: z.boolean().optional(),
  referenceSource: z.string().optional(),
  preferredStartDate: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  agreeToTerms: z.boolean().optional(),
  agreeToBackground: z.boolean().optional(),
}).refine((data) => {
  // For member applications, require all fields
  if (data.applicationType === 'member') {
    return data.dateOfBirth && data.address && data.city && data.state && 
           data.zipCode && data.country && data.occupation && data.membershipTier &&
           data.preferredLocation && data.expectedUsageFrequency && data.primaryUseCase &&
           data.groupSize && data.annualIncome && data.netWorth && data.liquidAssets &&
           data.creditScore && data.bankName && data.hasBoatingExperience !== undefined &&
           data.referenceSource && data.preferredStartDate && data.emergencyContactName &&
           data.emergencyContactPhone && data.emergencyContactRelation && 
           data.agreeToTerms && data.agreeToBackground;
  }
  // For partner applications, only require basic fields
  return data.fullName && data.email && data.phone;
}, {
  message: "Required fields missing for application type"
});

export const insertTourRequestSchema = createInsertSchema(tourRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Yacht maintenance insert schemas
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

// Type exports
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
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type CrewMember = typeof crewMembers.$inferSelect;
export type InsertCrewMember = z.infer<typeof insertCrewMemberSchema>;
export type CrewAssignment = typeof crewAssignments.$inferSelect;
export type InsertCrewAssignment = z.infer<typeof insertCrewAssignmentSchema>;
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
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type TourRequest = typeof tourRequests.$inferSelect;
export type InsertTourRequest = z.infer<typeof insertTourRequestSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Yacht maintenance types
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

// Staff types already defined above

// System Settings table for admin configuration
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").unique().notNull(),
  settingValue: text("setting_value"),
  isEncrypted: boolean("is_encrypted").default(false),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;