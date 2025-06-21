import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { 
  insertYachtSchema, insertServiceSchema, insertEventSchema, 
  insertBookingSchema, insertServiceBookingSchema, insertEventRegistrationSchema,
  insertReviewSchema, UserRole, MembershipTier
} from "@shared/schema";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check role
  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Placeholder image service for demo data
  app.get("/api/placeholder/:type", (req, res) => {
    const { type } = req.params;
    const placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a2e"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#9333ea" text-anchor="middle" dy=".3em">
          ${type.charAt(0).toUpperCase() + type.slice(1)} Image
        </text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(placeholderSvg);
  });

  // YACHT ROUTES
  app.get("/api/yachts", async (req, res) => {
    try {
      const { available, maxSize, location } = req.query;
      const filters: any = {};
      
      if (available !== undefined) filters.available = available === 'true';
      if (maxSize) filters.maxSize = parseInt(maxSize as string);
      if (location) filters.location = location as string;

      // Apply membership tier restrictions for members
      if (req.isAuthenticated() && req.user.role === UserRole.MEMBER) {
        const tierLimits = {
          [MembershipTier.BRONZE]: 40,
          [MembershipTier.SILVER]: 55,
          [MembershipTier.GOLD]: 70,
          [MembershipTier.PLATINUM]: Infinity
        };
        const userLimit = tierLimits[req.user.membershipTier as keyof typeof tierLimits] || 40;
        filters.maxSize = Math.min(filters.maxSize || Infinity, userLimit);
      }

      const yachts = await storage.getYachts(filters);
      res.json(yachts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/yachts/:id", async (req, res) => {
    try {
      const yacht = await storage.getYacht(parseInt(req.params.id));
      if (!yacht) {
        return res.status(404).json({ message: "Yacht not found" });
      }
      res.json(yacht);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/yachts", requireAuth, requireRole([UserRole.YACHT_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertYachtSchema.parse(req.body);
      const yacht = await storage.createYacht({
        ...validatedData,
        ownerId: req.user!.role === UserRole.YACHT_OWNER ? req.user!.id : validatedData.ownerId
      });
      res.status(201).json(yacht);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/yachts/owner/:ownerId", requireAuth, async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (req.user!.role !== UserRole.ADMIN && req.user!.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const yachts = await storage.getYachtsByOwner(ownerId);
      res.json(yachts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SERVICE ROUTES
  app.get("/api/services", async (req, res) => {
    try {
      const { category, available } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (available !== undefined) filters.available = available === 'true';

      const services = await storage.getServices(filters);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", requireAuth, requireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService({
        ...validatedData,
        providerId: req.user!.role === UserRole.SERVICE_PROVIDER ? req.user!.id : validatedData.providerId
      });
      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/services/provider/:providerId", requireAuth, async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      if (req.user!.role !== UserRole.ADMIN && req.user!.id !== providerId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const services = await storage.getServicesByProvider(providerId);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // EVENT ROUTES
  app.get("/api/events", async (req, res) => {
    try {
      const { active, upcoming } = req.query;
      const filters: any = {};
      
      if (active !== undefined) filters.active = active === 'true';
      if (upcoming !== undefined) filters.upcoming = upcoming === 'true';

      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // BOOKING ROUTES
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.user!.role === UserRole.MEMBER) {
        filters.userId = req.user!.id;
      } else if (req.query.userId && req.user!.role === UserRole.ADMIN) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.yachtId) {
        filters.yachtId = parseInt(req.query.yachtId as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const bookings = await storage.getBookings(filters);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", requireAuth, requireRole([UserRole.MEMBER, UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Members can only book for themselves
      if (req.user!.role === UserRole.MEMBER) {
        validatedData.userId = req.user!.id;
      }

      // Check yacht availability and membership tier restrictions
      const yacht = await storage.getYacht(validatedData.yachtId!);
      if (!yacht) {
        return res.status(404).json({ message: "Yacht not found" });
      }

      if (req.user!.role === UserRole.MEMBER) {
        const tierLimits = {
          [MembershipTier.BRONZE]: 40,
          [MembershipTier.SILVER]: 55,
          [MembershipTier.GOLD]: 70,
          [MembershipTier.PLATINUM]: Infinity
        };
        const userLimit = tierLimits[req.user!.membershipTier as keyof typeof tierLimits] || 40;
        
        if (yacht.size > userLimit) {
          return res.status(403).json({ 
            message: `Yacht size exceeds your membership tier limit of ${userLimit}ft` 
          });
        }
      }

      const booking = await storage.createBooking({
        ...validatedData,
        totalPrice: "0.00" // Free for members
      });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // SERVICE BOOKING ROUTES
  app.get("/api/service-bookings", requireAuth, async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.user!.role === UserRole.MEMBER) {
        filters.userId = req.user!.id;
      } else if (req.query.userId && req.user!.role === UserRole.ADMIN) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.serviceId) {
        filters.serviceId = parseInt(req.query.serviceId as string);
      }

      const bookings = await storage.getServiceBookings(filters);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-bookings", requireAuth, requireRole([UserRole.MEMBER, UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertServiceBookingSchema.parse(req.body);
      
      if (req.user!.role === UserRole.MEMBER) {
        validatedData.userId = req.user!.id;
      }

      const service = await storage.getService(validatedData.serviceId!);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const booking = await storage.createServiceBooking({
        ...validatedData,
        totalPrice: service.pricePerSession
      });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // EVENT REGISTRATION ROUTES
  app.get("/api/event-registrations", requireAuth, async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.user!.role === UserRole.MEMBER) {
        filters.userId = req.user!.id;
      } else if (req.query.userId && req.user!.role === UserRole.ADMIN) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.eventId) {
        filters.eventId = parseInt(req.query.eventId as string);
      }

      const registrations = await storage.getEventRegistrations(filters);
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/event-registrations", requireAuth, requireRole([UserRole.MEMBER, UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertEventRegistrationSchema.parse(req.body);
      
      if (req.user!.role === UserRole.MEMBER) {
        validatedData.userId = req.user!.id;
      }

      const event = await storage.getEvent(validatedData.eventId!);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const totalPrice = event.ticketPrice 
        ? (parseFloat(event.ticketPrice) * validatedData.ticketCount!).toFixed(2)
        : "0.00";

      const registration = await storage.createEventRegistration({
        ...validatedData,
        totalPrice
      });
      res.status(201).json(registration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // REVIEW ROUTES
  app.get("/api/reviews", async (req, res) => {
    try {
      const { userId, serviceId, yachtId } = req.query;
      const filters: any = {};
      
      if (userId) filters.userId = parseInt(userId as string);
      if (serviceId) filters.serviceId = parseInt(serviceId as string);
      if (yachtId) filters.yachtId = parseInt(yachtId as string);

      const reviews = await storage.getReviews(filters);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...validatedData,
        userId: req.user!.id
      });
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
