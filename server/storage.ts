import { 
  users, yachts, services, events, bookings, serviceBookings, eventRegistrations, reviews,
  type User, type InsertUser, type Yacht, type InsertYacht, type Service, type InsertService,
  type Event, type InsertEvent, type Booking, type InsertBooking, type ServiceBooking, 
  type InsertServiceBooking, type EventRegistration, type InsertEventRegistration,
  type Review, type InsertReview, UserRole, MembershipTier
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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
  getEventRegistrations(filters?: { userId?: number, eventId?: number, status?: string }): Promise<EventRegistration[]>;
  getEventRegistration(id: number): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined>;

  // Review methods
  getReviews(filters?: { userId?: number, serviceId?: number, yachtId?: number }): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private yachts: Map<number, Yacht>;
  private services: Map<number, Service>;
  private events: Map<number, Event>;
  private bookings: Map<number, Booking>;
  private serviceBookings: Map<number, ServiceBooking>;
  private eventRegistrations: Map<number, EventRegistration>;
  private reviews: Map<number, Review>;
  private currentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.yachts = new Map();
    this.services = new Map();
    this.events = new Map();
    this.bookings = new Map();
    this.serviceBookings = new Map();
    this.eventRegistrations = new Map();
    this.reviews = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.seedInitialData();
  }

  private seedInitialData() {
    // Add sample yachts with proper typing
    const sampleYachts = [
      {
        name: "Serenity",
        size: 85,
        location: "Miami Beach Marina",
        capacity: 12,
        description: "Luxury motor yacht with spacious deck and modern amenities",
        imageUrl: "/api/placeholder/yacht1",
        amenities: ["Air Conditioning", "WiFi", "Full Kitchen", "Bar", "Sound System"] as string[],
        pricePerHour: "750",
        isAvailable: true,
        ownerId: null as number | null
      },
      {
        name: "Ocean Breeze", 
        size: 65,
        location: "Star Island Marina",
        capacity: 8,
        description: "Elegant sailing yacht perfect for sunset cruises",
        imageUrl: "/api/placeholder/yacht2", 
        amenities: ["WiFi", "Kitchen", "Bar", "Sound System"] as string[],
        pricePerHour: "550",
        isAvailable: true,
        ownerId: null as number | null
      },
      {
        name: "Blue Diamond",
        size: 120,
        location: "Fisher Island Marina", 
        capacity: 20,
        description: "Premium mega yacht with jacuzzi and helicopter pad",
        imageUrl: "/api/placeholder/yacht3",
        amenities: ["Air Conditioning", "WiFi", "Full Kitchen", "Bar", "Jacuzzi", "Helicopter Pad"] as string[],
        pricePerHour: "1200",
        isAvailable: true,
        ownerId: null as number | null
      }
    ];

    sampleYachts.forEach(yacht => {
      const id = this.currentId++;
      this.yachts.set(id, { ...yacht, id, createdAt: new Date() });
    });

    // Add sample services
    const sampleServices = [
      {
        name: "Private Chef Service",
        category: "Catering",
        description: "Professional chef for gourmet dining experience",
        imageUrl: "/api/placeholder/chef",
        pricePerSession: "500",
        duration: 4,
        isAvailable: true,
        providerId: null as number | null,
        rating: "4.8",
        reviewCount: 45
      },
      {
        name: "Massage Therapy",
        category: "Wellness", 
        description: "Relaxing massage therapy on board",
        imageUrl: "/api/placeholder/massage",
        pricePerSession: "200",
        duration: 2,
        isAvailable: true,
        providerId: null as number | null,
        rating: "4.9",
        reviewCount: 32
      },
      {
        name: "Yacht Maintenance",
        category: "Maintenance",
        description: "Professional yacht cleaning and maintenance", 
        imageUrl: "/api/placeholder/maintenance",
        pricePerSession: "300",
        duration: 3,
        isAvailable: true,
        providerId: null as number | null,
        rating: "4.7",
        reviewCount: 28
      }
    ];

    sampleServices.forEach(service => {
      const id = this.currentId++;
      this.services.set(id, { ...service, id, createdAt: new Date() });
    });

    // Add sample events
    const sampleEvents = [
      {
        title: "Sunset Wine Tasting",
        location: "Miami Bay",
        capacity: 50,
        description: "Exclusive wine tasting event with panoramic sunset views",
        imageUrl: "/api/placeholder/wine-event",
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        ticketPrice: "85",
        isActive: true,
        hostId: null as number | null
      },
      {
        title: "Members Regatta",
        location: "Biscayne Bay",
        capacity: 100,
        description: "Annual sailing competition for yacht club members",
        imageUrl: "/api/placeholder/regatta",
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        ticketPrice: "125",
        isActive: true,
        hostId: null as number | null
      },
      {
        title: "New Year's Gala",
        location: "Club Marina",
        capacity: 200,
        description: "Elegant New Year's celebration with live music and fireworks",
        imageUrl: "/api/placeholder/gala", 
        startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        ticketPrice: "250",
        isActive: true,
        hostId: null as number | null
      }
    ];

    sampleEvents.forEach(event => {
      const id = this.currentId++;
      this.events.set(id, { ...event, id, createdAt: new Date() });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || UserRole.MEMBER,
      membershipTier: insertUser.membershipTier ?? MembershipTier.BRONZE,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...userUpdate
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || user.stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Yacht methods
  async getYachts(filters?: { available?: boolean, maxSize?: number, location?: string }): Promise<Yacht[]> {
    let yachts = Array.from(this.yachts.values());
    
    if (filters?.available !== undefined) {
      yachts = yachts.filter(yacht => yacht.isAvailable === filters.available);
    }
    if (filters?.maxSize) {
      yachts = yachts.filter(yacht => yacht.size <= filters.maxSize!);
    }
    if (filters?.location) {
      yachts = yachts.filter(yacht => yacht.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    
    return yachts;
  }

  async getYacht(id: number): Promise<Yacht | undefined> {
    return this.yachts.get(id);
  }

  async getYachtsByOwner(ownerId: number): Promise<Yacht[]> {
    return Array.from(this.yachts.values()).filter(yacht => yacht.ownerId === ownerId);
  }

  async createYacht(insertYacht: InsertYacht): Promise<Yacht> {
    const id = this.currentId++;
    const yacht: Yacht = { 
      ...insertYacht, 
      id, 
      ownerId: insertYacht.ownerId ?? null,
      description: insertYacht.description ?? null,
      imageUrl: insertYacht.imageUrl ?? null,
      amenities: insertYacht.amenities ? [...insertYacht.amenities] : null,
      pricePerHour: insertYacht.pricePerHour ?? null,
      isAvailable: insertYacht.isAvailable ?? true,
      createdAt: new Date() 
    };
    this.yachts.set(id, yacht);
    return yacht;
  }

  async updateYacht(id: number, yachtUpdate: Partial<InsertYacht>): Promise<Yacht | undefined> {
    const yacht = this.yachts.get(id);
    if (!yacht) return undefined;
    
    const updatedYacht: Yacht = { 
      ...yacht, 
      ...yachtUpdate,
      amenities: yacht.amenities // Keep original amenities for now
    };
    this.yachts.set(id, updatedYacht);
    return updatedYacht;
  }

  async deleteYacht(id: number): Promise<boolean> {
    return this.yachts.delete(id);
  }

  // Service methods
  async getServices(filters?: { category?: string, available?: boolean }): Promise<Service[]> {
    let services = Array.from(this.services.values());
    
    if (filters?.category) {
      services = services.filter(service => service.category === filters.category);
    }
    if (filters?.available !== undefined) {
      services = services.filter(service => service.isAvailable === filters.available);
    }
    
    return services;
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.providerId === providerId);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentId++;
    const service: Service = { 
      ...insertService, 
      id, 
      providerId: insertService.providerId ?? null,
      description: insertService.description ?? null,
      imageUrl: insertService.imageUrl ?? null,
      isAvailable: insertService.isAvailable ?? true,
      pricePerSession: insertService.pricePerSession ?? null,
      duration: insertService.duration ?? null,
      createdAt: new Date(),
      rating: null,
      reviewCount: 0
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Event methods
  async getEvents(filters?: { active?: boolean, upcoming?: boolean }): Promise<Event[]> {
    let events = Array.from(this.events.values());
    
    if (filters?.active !== undefined) {
      events = events.filter(event => event.isActive === filters.active);
    }
    if (filters?.upcoming) {
      const now = new Date();
      events = events.filter(event => event.startTime > now);
    }
    
    return events;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByHost(hostId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.hostId === hostId);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      description: insertEvent.description ?? null,
      imageUrl: insertEvent.imageUrl ?? null,
      hostId: insertEvent.hostId ?? null,
      ticketPrice: insertEvent.ticketPrice ?? null,
      isActive: insertEvent.isActive ?? true,
      createdAt: new Date() 
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Booking methods
  async getBookings(filters?: { userId?: number, yachtId?: number, status?: string }): Promise<Booking[]> {
    let bookings = Array.from(this.bookings.values());
    
    if (filters?.userId) {
      bookings = bookings.filter(booking => booking.userId === filters.userId);
    }
    if (filters?.yachtId) {
      bookings = bookings.filter(booking => booking.yachtId === filters.yachtId);
    }
    if (filters?.status) {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }
    
    return bookings;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: insertBooking.status || "pending",
      userId: insertBooking.userId ?? null,
      yachtId: insertBooking.yachtId ?? null,
      totalPrice: insertBooking.totalPrice ?? null,
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingUpdate };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async cancelBooking(id: number): Promise<boolean> {
    const booking = this.bookings.get(id);
    if (!booking) return false;
    
    const cancelledBooking = { ...booking, status: 'cancelled' };
    this.bookings.set(id, cancelledBooking);
    return true;
  }

  // Service Booking methods
  async getServiceBookings(filters?: { userId?: number, serviceId?: number, status?: string }): Promise<ServiceBooking[]> {
    let bookings = Array.from(this.serviceBookings.values());
    
    if (filters?.userId) {
      bookings = bookings.filter(booking => booking.userId === filters.userId);
    }
    if (filters?.serviceId) {
      bookings = bookings.filter(booking => booking.serviceId === filters.serviceId);
    }
    if (filters?.status) {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }
    
    return bookings;
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    return this.serviceBookings.get(id);
  }

  async createServiceBooking(insertBooking: InsertServiceBooking): Promise<ServiceBooking> {
    const id = this.currentId++;
    const booking: ServiceBooking = { 
      ...insertBooking, 
      id, 
      status: insertBooking.status || "pending",
      userId: insertBooking.userId ?? null,
      serviceId: insertBooking.serviceId ?? null,
      totalPrice: insertBooking.totalPrice ?? null,
      stripePaymentIntentId: insertBooking.stripePaymentIntentId ?? null,
      createdAt: new Date() 
    };
    this.serviceBookings.set(id, booking);
    return booking;
  }

  async updateServiceBooking(id: number, bookingUpdate: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
    const booking = this.serviceBookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingUpdate };
    this.serviceBookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Event Registration methods
  async getEventRegistrations(filters?: { userId?: number, eventId?: number, status?: string }): Promise<EventRegistration[]> {
    let registrations = Array.from(this.eventRegistrations.values());
    
    if (filters?.userId) {
      registrations = registrations.filter(reg => reg.userId === filters.userId);
    }
    if (filters?.eventId) {
      registrations = registrations.filter(reg => reg.eventId === filters.eventId);
    }
    if (filters?.status) {
      registrations = registrations.filter(reg => reg.status === filters.status);
    }
    
    return registrations;
  }

  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    return this.eventRegistrations.get(id);
  }

  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const id = this.currentId++;
    const registration: EventRegistration = { 
      ...insertRegistration, 
      id, 
      status: insertRegistration.status || "pending",
      userId: insertRegistration.userId ?? null,
      eventId: insertRegistration.eventId ?? null,
      totalPrice: insertRegistration.totalPrice ?? null,
      stripePaymentIntentId: insertRegistration.stripePaymentIntentId ?? null,
      ticketCount: insertRegistration.ticketCount || 1,
      createdAt: new Date() 
    };
    this.eventRegistrations.set(id, registration);
    return registration;
  }

  async updateEventRegistration(id: number, regUpdate: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined> {
    const registration = this.eventRegistrations.get(id);
    if (!registration) return undefined;
    
    const updatedRegistration = { ...registration, ...regUpdate };
    this.eventRegistrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  // Review methods
  async getReviews(filters?: { userId?: number, serviceId?: number, yachtId?: number }): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());
    
    if (filters?.userId) {
      reviews = reviews.filter(review => review.userId === filters.userId);
    }
    if (filters?.serviceId) {
      reviews = reviews.filter(review => review.serviceId === filters.serviceId);
    }
    if (filters?.yachtId) {
      reviews = reviews.filter(review => review.yachtId === filters.yachtId);
    }
    
    return reviews;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      userId: insertReview.userId ?? null,
      yachtId: insertReview.yachtId ?? null,
      serviceId: insertReview.serviceId ?? null,
      eventId: insertReview.eventId ?? null,
      comment: insertReview.comment ?? null,
      createdAt: new Date() 
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
