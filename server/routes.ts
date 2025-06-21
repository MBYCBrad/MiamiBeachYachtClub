import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupTwilioRoutes } from "./twilio";
import { notificationService } from "./notifications";
import { auditService, auditMiddleware } from "./audit";
import { mediaStorageService } from "./media-storage";
import Stripe from "stripe";
import path from "path";
import fs from "fs";
import { 
  insertYachtSchema, insertServiceSchema, insertEventSchema, 
  insertBookingSchema, insertServiceBookingSchema, insertEventRegistrationSchema,
  insertReviewSchema, UserRole, MembershipTier
} from "@shared/schema";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup Twilio concierge routes
  setupTwilioRoutes(app);

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

  // Media asset serving routes
  app.get("/api/media/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = mediaStorageService.getAssetPath(filename);
      
      if (!mediaStorageService.fileExists(filename)) {
        return res.status(404).json({ message: "Media asset not found" });
      }

      const stats = mediaStorageService.getFileStats(filename);
      if (!stats) {
        return res.status(404).json({ message: "File not accessible" });
      }

      // Set appropriate headers for video streaming
      const mimeType = filename.endsWith('.mp4') ? 'video/mp4' : 
                      filename.endsWith('.webm') ? 'video/webm' : 
                      'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Accept-Ranges', 'bytes');

      // Handle range requests for video streaming
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
        res.setHeader('Content-Length', chunksize);

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      }
    } catch (error) {
      console.error('Error serving media asset:', error);
      res.status(500).json({ message: "Error serving media asset" });
    }
  });

  // Get active hero video
  app.get("/api/media/hero/active", async (req, res) => {
    try {
      const heroVideo = await mediaStorageService.getActiveHeroVideo();
      if (!heroVideo) {
        return res.status(404).json({ message: "No active hero video found" });
      }
      res.json(heroVideo);
    } catch (error) {
      console.error('Error fetching active hero video:', error);
      res.status(500).json({ message: "Error fetching hero video" });
    }
  });

  // Get all media assets
  app.get("/api/media", async (req, res) => {
    try {
      const { category, type, isActive } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (type) filters.type = type as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const assets = await mediaStorageService.getAllMediaAssets(filters);
      res.json(assets);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      res.status(500).json({ message: "Error fetching media assets" });
    }
  });

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
      const { available, maxSize, location, startDate, endDate } = req.query;
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

      let yachts = await storage.getYachts(filters);

      // Real-time availability filtering for date ranges
      if (startDate && endDate) {
        const requestStart = new Date(startDate as string);
        const requestEnd = new Date(endDate as string);
        
        const availableYachts = [];
        
        for (const yacht of yachts) {
          const existingBookings = await storage.getBookings({ 
            yachtId: yacht.id,
            status: 'confirmed'
          });
          
          const hasConflict = existingBookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (
              (requestStart >= bookingStart && requestStart < bookingEnd) ||
              (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
              (requestStart <= bookingStart && requestEnd >= bookingEnd)
            );
          });

          if (!hasConflict) {
            availableYachts.push({
              ...yacht,
              availableForDates: true,
              conflictingBookings: 0
            });
          } else {
            // Include yacht but mark as unavailable for transparency
            availableYachts.push({
              ...yacht,
              availableForDates: false,
              conflictingBookings: existingBookings.length
            });
          }
        }
        
        yachts = availableYachts;
      }

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

  app.get("/api/yachts/owner", requireAuth, async (req, res) => {
    try {
      if (req.user!.role !== UserRole.YACHT_OWNER && req.user!.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Access denied" });
      }
      const yachts = await storage.getYachtsByOwner(req.user!.id);
      res.json(yachts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  app.get("/api/services/provider", requireAuth, async (req, res) => {
    try {
      if (req.user!.role !== UserRole.SERVICE_PROVIDER && req.user!.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Access denied" });
      }
      const services = await storage.getServicesByProvider(req.user!.id);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

      // Advanced booking conflict detection
      const existingBookings = await storage.getBookings({ 
        yachtId: validatedData.yachtId!,
        status: 'confirmed'
      });
      
      const startDate = new Date(validatedData.startTime!);
      const endDate = new Date(validatedData.endTime!);
      
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return (
          (startDate >= bookingStart && startDate < bookingEnd) ||
          (endDate > bookingStart && endDate <= bookingEnd) ||
          (startDate <= bookingStart && endDate >= bookingEnd)
        );
      });

      if (hasConflict) {
        return res.status(409).json({ 
          message: "Yacht is not available for the selected dates. Please choose different dates." 
        });
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

      // Send real-time notification to yacht owner
      await notificationService.notifyBookingCreated(booking);

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

      // Send real-time notification to service provider
      await notificationService.notifyServiceBooked(booking);

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

      // Send real-time notification to event host
      await notificationService.notifyEventRegistration(registration);

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

  // USER MANAGEMENT ROUTES (Admin only)
  app.get("/api/users", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // Initialize notification service with WebSocket support
  notificationService.initialize(httpServer);

  // Add notification status endpoint
  app.get("/api/notifications/status", requireAuth, (req, res) => {
    const stats = notificationService.getConnectionStats();
    res.json(stats);
  });

  // ANALYTICS ROUTES - Advanced Business Intelligence
  app.get("/api/analytics/overview", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const totalUsers = (await storage.getAllUsers()).length;
      const totalYachts = (await storage.getYachts()).length;
      const totalServices = (await storage.getServices()).length;
      const totalEvents = (await storage.getEvents()).length;
      const totalBookings = (await storage.getBookings()).length;
      const totalServiceBookings = (await storage.getServiceBookings()).length;
      const totalEventRegistrations = (await storage.getEventRegistrations()).length;

      // Calculate real revenue metrics
      const serviceBookings = await storage.getServiceBookings();
      const eventRegistrations = await storage.getEventRegistrations();
      
      const serviceRevenue = serviceBookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.totalPrice || "0"));
      }, 0);
      
      const eventRevenue = eventRegistrations.reduce((sum, registration) => {
        return sum + (parseFloat(registration.totalPrice || "0"));
      }, 0);
      
      const totalRevenue = serviceRevenue + eventRevenue;

      // Calculate membership tier distribution
      const users = await storage.getAllUsers();
      const membershipDistribution = users.reduce((acc: any, user) => {
        if (user.membershipTier) {
          acc[user.membershipTier] = (acc[user.membershipTier] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate booking trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentBookings = (await storage.getBookings()).filter(booking => 
        booking.createdAt && new Date(booking.createdAt) >= thirtyDaysAgo
      );

      // Calculate top performing yachts
      const bookings = await storage.getBookings();
      const yachtPerformance: { [key: number]: number } = {};
      bookings.forEach(booking => {
        if (booking.yachtId) {
          yachtPerformance[booking.yachtId] = (yachtPerformance[booking.yachtId] || 0) + 1;
        }
      });

      const yachts = await storage.getYachts();
      const topYachts = Object.entries(yachtPerformance)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([yachtId, bookingCount]) => {
          const yacht = yachts.find(y => y.id === parseInt(yachtId));
          return {
            yachtName: yacht?.name || "Unknown Yacht",
            bookingCount,
            yachtSize: yacht?.size || 0
          };
        });

      res.json({
        totalUsers,
        totalYachts,
        totalServices,
        totalEvents,
        totalBookings,
        totalServiceBookings,
        totalEventRegistrations,
        totalRevenue: totalRevenue.toFixed(2),
        serviceRevenue: serviceRevenue.toFixed(2),
        eventRevenue: eventRevenue.toFixed(2),
        membershipDistribution,
        recentBookings: recentBookings.length,
        averageBookingValue: totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : "0",
        topYachts,
        occupancyRate: yachts.length > 0 ? ((totalBookings / (yachts.length * 30)) * 100).toFixed(1) : "0"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Advanced yacht availability calendar endpoint
  app.get("/api/analytics/yacht-calendar/:id", requireAuth, async (req, res) => {
    try {
      const yachtId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const bookings = await storage.getBookings({ yachtId });
      const calendar = [];
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dayBookings = bookings.filter(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          return (bookingStart < dayEnd && bookingEnd > dayStart);
        });

        calendar.push({
          date: currentDate.toISOString().split('T')[0],
          available: dayBookings.length === 0,
          bookings: dayBookings.map(booking => ({
            id: booking.id,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
          }))
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json(calendar);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AUDIT AND COMPLIANCE ROUTES
  app.get("/api/audit/logs", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { userId, resource, action, startDate, endDate, success } = req.query;
      const filters: any = {};
      
      if (userId) filters.userId = parseInt(userId as string);
      if (resource) filters.resource = resource as string;
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (success !== undefined) filters.success = success === 'true';

      const logs = await auditService.getAuditLogs(filters);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/audit/security-events", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const events = await auditService.getSecurityEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/audit/compliance-report", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await auditService.getComplianceReport(start, end);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADVANCED SEARCH AND FILTERING
  app.get("/api/search", requireAuth, async (req, res) => {
    try {
      const { query, type, limit } = req.query;
      const searchTerm = (query as string)?.toLowerCase() || '';
      const maxResults = parseInt(limit as string) || 20;
      const results: any = {
        yachts: [],
        services: [],
        events: [],
        users: []
      };

      if (!type || type === 'yachts') {
        const yachts = await storage.getYachts();
        results.yachts = yachts
          .filter(yacht => 
            yacht.name.toLowerCase().includes(searchTerm) ||
            yacht.description?.toLowerCase().includes(searchTerm) ||
            yacht.location?.toLowerCase().includes(searchTerm)
          )
          .slice(0, maxResults);
      }

      if (!type || type === 'services') {
        const services = await storage.getServices();
        results.services = services
          .filter(service => 
            service.name.toLowerCase().includes(searchTerm) ||
            service.description?.toLowerCase().includes(searchTerm) ||
            service.category?.toLowerCase().includes(searchTerm)
          )
          .slice(0, maxResults);
      }

      if (!type || type === 'events') {
        const events = await storage.getEvents();
        results.events = events
          .filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description?.toLowerCase().includes(searchTerm) ||
            event.location?.toLowerCase().includes(searchTerm)
          )
          .slice(0, maxResults);
      }

      if ((!type || type === 'users') && req.user?.role === UserRole.ADMIN) {
        const users = await storage.getAllUsers();
        results.users = users
          .filter(user => 
            user.username.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm)
          )
          .slice(0, maxResults);
      }

      await auditService.logAction(req, 'search', 'global', undefined, { query: searchTerm, type, resultsCount: Object.values(results).flat().length });
      res.json(results);
    } catch (error: any) {
      await auditService.logAction(req, 'search', 'global', undefined, { query: req.query.query }, false, error.message);
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
