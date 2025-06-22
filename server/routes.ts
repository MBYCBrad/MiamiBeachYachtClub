import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupTwilioRoutes } from "./twilio";
import { setupPaymentRoutes } from "./payments";
import { notificationService } from "./notifications";
import { auditService, auditMiddleware } from "./audit";
import { mediaStorageService } from "./media-storage";
import Stripe from "stripe";
import path from "path";
import fs from "fs";
import { 
  insertYachtSchema, insertServiceSchema, insertEventSchema, 
  insertBookingSchema, insertServiceBookingSchema, insertEventRegistrationSchema,
  insertReviewSchema, insertMessageSchema, UserRole, MembershipTier
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
  
  // Setup payment routes with Stripe Connect
  setupPaymentRoutes(app);

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

  // Media asset serving routes with aggressive caching
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

      // Aggressive caching headers for media assets
      const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const isVideo = filename.match(/\.(mp4|webm|mov)$/i);
      
      if (isImage) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
        res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
      } else if (isVideo) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      }

      // Set appropriate headers for video streaming
      const mimeType = filename.endsWith('.mp4') ? 'video/mp4' : 
                      filename.endsWith('.webm') ? 'video/webm' : 
                      filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                      filename.endsWith('.png') ? 'image/png' :
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

  // Video specific route for better video streaming
  app.get("/api/media/video/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = mediaStorageService.getAssetPath(filename);
      
      if (!mediaStorageService.fileExists(filename)) {
        return res.status(404).json({ message: "Video not found" });
      }

      const stats = mediaStorageService.getFileStats(filename);
      if (!stats) {
        return res.status(404).json({ message: "Video not accessible" });
      }

      // Set video-specific headers
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');

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
        res.setHeader('Content-Length', stats.size);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      }
    } catch (error) {
      console.error('Error serving video:', error);
      res.status(500).json({ message: "Error serving video" });
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
      // Add aggressive caching headers for yacht data
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60'); // 5 minutes with stale cache
      res.setHeader('ETag', `"yachts-${Date.now()}"`);
      
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
      // Add caching headers for services
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('ETag', `"services-${Date.now()}"`);
      
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
      // Add caching headers for events
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('ETag', `"events-${Date.now()}"`);
      
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

  // YACHT OWNER ROUTES
  app.get("/api/yacht-owner/stats", requireAuth, requireRole([UserRole.YACHT_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      const ownerId = req.user!.id;
      
      // Get yacht owner's yachts
      const allYachts = await storage.getYachts();
      const ownerYachts = allYachts.filter(y => y.ownerId === ownerId);
      
      // Get bookings for owner's yachts
      const yachtIds = ownerYachts.map(y => y.id);
      const allBookings = await storage.getBookings();
      const ownerBookings = allBookings.filter(b => b.yachtId && yachtIds.includes(b.yachtId));
      
      // Calculate revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentBookings = ownerBookings.filter(b => new Date(b.startTime) >= thirtyDaysAgo);
      
      const monthlyRevenue = recentBookings.reduce((total, booking) => {
        const yacht = ownerYachts.find(y => y.id === booking.yachtId);
        if (yacht && yacht.pricePerHour) {
          const hours = 8; // Assume 8-hour day bookings
          return total + (parseInt(yacht.pricePerHour) * hours);
        }
        return total;
      }, 0);
      
      const stats = {
        totalYachts: ownerYachts.length,
        totalBookings: ownerBookings.length,
        monthlyRevenue,
        avgRating: 4.8, // Would calculate from reviews
        occupancyRate: ownerBookings.length > 0 ? Math.round((ownerBookings.length / (ownerYachts.length * 30)) * 100) : 0,
        pendingMaintenance: ownerYachts.filter(y => !y.isAvailable).length
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching yacht owner stats:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/yacht-owner/yachts", requireAuth, requireRole([UserRole.YACHT_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      const ownerId = req.user!.id;
      const allYachts = await storage.getYachts();
      const ownerYachts = allYachts.filter(y => y.ownerId === ownerId);
      res.json(ownerYachts);
    } catch (error: any) {
      console.error('Error fetching owner yachts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/yacht-owner/bookings", requireAuth, requireRole([UserRole.YACHT_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      const ownerId = req.user!.id;
      const allYachts = await storage.getYachts();
      const ownerYachts = allYachts.filter(y => y.ownerId === ownerId);
      const yachtIds = ownerYachts.map(y => y.id);
      
      const allBookings = await storage.getBookings();
      const ownerBookings = allBookings.filter(b => b.yachtId && yachtIds.includes(b.yachtId));
      
      // Enhance bookings with yacht and user info
      const enhancedBookings = await Promise.all(
        ownerBookings.map(async (booking) => {
          const yacht = ownerYachts.find(y => y.id === booking.yachtId);
          const user = await storage.getUser(booking.userId);
          return {
            ...booking,
            yacht,
            user
          };
        })
      );
      
      res.json(enhancedBookings);
    } catch (error: any) {
      console.error('Error fetching owner bookings:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/yacht-owner/revenue", requireAuth, requireRole([UserRole.YACHT_OWNER, UserRole.ADMIN]), async (req, res) => {
    try {
      const ownerId = req.user!.id;
      const allYachts = await storage.getYachts();
      const ownerYachts = allYachts.filter(y => y.ownerId === ownerId);
      const yachtIds = ownerYachts.map(y => y.id);
      
      const allBookings = await storage.getBookings();
      const ownerBookings = allBookings.filter(b => b.yachtId && yachtIds.includes(b.yachtId));
      
      // Generate monthly revenue data
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthBookings = ownerBookings.filter(b => {
          const bookingDate = new Date(b.startTime);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });
        
        const revenue = monthBookings.reduce((total, booking) => {
          const yacht = ownerYachts.find(y => y.id === booking.yachtId);
          if (yacht && yacht.pricePerHour) {
            return total + (parseInt(yacht.pricePerHour) * 8);
          }
          return total;
        }, 0);
        
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          bookings: monthBookings.length
        });
      }
      
      res.json(monthlyData);
    } catch (error: any) {
      console.error('Error fetching revenue data:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // SERVICE PROVIDER ROUTES
  app.get("/api/service-provider/stats", requireAuth, requireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]), async (req, res) => {
    try {
      const providerId = req.user!.id;
      
      // Get service provider's services
      const allServices = await storage.getServices();
      const providerServices = allServices.filter(s => s.providerId === providerId);
      
      // Get bookings for provider's services
      const serviceIds = providerServices.map(s => s.id);
      const allServiceBookings = await storage.getServiceBookings();
      const providerBookings = allServiceBookings.filter(b => b.serviceId && serviceIds.includes(b.serviceId));
      
      // Calculate revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentBookings = providerBookings.filter(b => new Date(b.bookingDate) >= thirtyDaysAgo);
      
      const monthlyRevenue = recentBookings.reduce((total, booking) => {
        const service = providerServices.find(s => s.id === booking.serviceId);
        if (service && service.pricePerSession) {
          return total + parseFloat(service.pricePerSession);
        }
        return total;
      }, 0);
      
      const stats = {
        totalServices: providerServices.length,
        totalBookings: providerBookings.length,
        monthlyRevenue,
        avgRating: 4.8, // Would calculate from reviews
        completionRate: Math.round((providerBookings.filter(b => b.status === 'completed').length / Math.max(providerBookings.length, 1)) * 100),
        activeClients: new Set(providerBookings.map(b => b.userId)).size
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching service provider stats:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-provider/services", requireAuth, requireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]), async (req, res) => {
    try {
      const providerId = req.user!.id;
      const allServices = await storage.getServices();
      const providerServices = allServices.filter(s => s.providerId === providerId);
      res.json(providerServices);
    } catch (error: any) {
      console.error('Error fetching provider services:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-provider/bookings", requireAuth, requireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]), async (req, res) => {
    try {
      const providerId = req.user!.id;
      const allServices = await storage.getServices();
      const providerServices = allServices.filter(s => s.providerId === providerId);
      const serviceIds = providerServices.map(s => s.id);
      
      const allServiceBookings = await storage.getServiceBookings();
      const providerBookings = allServiceBookings.filter(b => b.serviceId && serviceIds.includes(b.serviceId));
      
      // Enhance bookings with service and user info
      const enhancedBookings = await Promise.all(
        providerBookings.map(async (booking) => {
          const service = providerServices.find(s => s.id === booking.serviceId);
          const user = await storage.getUser(booking.userId);
          return {
            ...booking,
            service,
            user
          };
        })
      );
      
      res.json(enhancedBookings);
    } catch (error: any) {
      console.error('Error fetching provider bookings:', error);
      res.status(500).json({ message: error.message });
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

  // Get yacht availability for date - enhanced check-availability endpoint
  app.post("/api/bookings/check-all-availability", requireAuth, async (req, res) => {
    try {
      const { yachtId, date } = req.body;
      
      if (!yachtId || !date) {
        return res.status(400).json({ message: "Missing yacht ID or date" });
      }

      // Get all confirmed bookings for this yacht
      const existingBookings = await storage.getBookings({ 
        yachtId: parseInt(yachtId),
        status: 'confirmed'
      });
      
      // Filter bookings that overlap with the requested date
      const requestDate = new Date(date);
      const nextDay = new Date(requestDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const relevantBookings = existingBookings.filter(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return (
          (bookingStart >= requestDate && bookingStart < nextDay) ||
          (bookingEnd > requestDate && bookingEnd <= nextDay) ||
          (bookingStart <= requestDate && bookingEnd >= nextDay)
        );
      });

      // Define time slots
      const timeSlots = [
        { name: 'morning', start: '09:00', end: '13:00' },
        { name: 'afternoon', start: '13:00', end: '17:00' },
        { name: 'evening', start: '17:00', end: '21:00' },
        { name: 'night', start: '21:00', end: '01:00' }
      ];

      const availability: Record<string, { available: boolean; bookedBy?: string }> = {};
      
      for (const slot of timeSlots) {
        const slotStart = new Date(`${date}T${slot.start}:00`);
        const slotEnd = slot.name === 'night' 
          ? new Date(`${date}T23:59:59`)
          : new Date(`${date}T${slot.end}:00`);
        
        // Check if any booking conflicts with this slot
        const conflictingBooking = relevantBookings.find(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });
        
        if (conflictingBooking) {
          // Get the user who made the booking
          const booker = await storage.getUser(conflictingBooking.userId);
          availability[slot.name] = {
            available: false,
            bookedBy: booker?.username || 'Another member'
          };
        } else {
          availability[slot.name] = { available: true };
        }
      }

      res.json({ availability });
    } catch (error: any) {
      console.error('Availability check error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Check yacht availability (legacy endpoint for individual checks)
  app.post("/api/bookings/check-availability", requireAuth, async (req, res) => {
    try {
      const { yachtId, startDate, startTime, endDate, endTime } = req.body;
      
      if (!yachtId || !startDate || !startTime || !endDate || !endTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Construct full datetime strings
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      // Get existing confirmed bookings for this yacht
      const existingBookings = await storage.getBookings({ 
        yachtId: parseInt(yachtId),
        status: 'confirmed'
      });
      
      const requestStart = new Date(startDateTime);
      const requestEnd = new Date(endDateTime);
      
      // Check for conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        // Two time ranges overlap if:
        // 1. New booking starts before existing ends AND
        // 2. New booking ends after existing starts
        return requestStart < bookingEnd && requestEnd > bookingStart;
      });
      res.json({ available: !hasConflict });
    } catch (error: any) {
      console.error('Availability check error:', error);
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

  // USER PROFILE UPDATE ROUTE (for authenticated users to update their own profile)
  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;
      
      // Only allow certain fields to be updated by the user themselves
      const allowedFields = ['username', 'email', 'phone', 'location', 'language', 'notifications'];
      const filteredUpdates: any = {};
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      
      const updatedUser = await storage.updateUser(userId, filteredUpdates);
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

  // FAVORITES ROUTES - Real-time database integration
  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const userFavorites = await storage.getUserFavorites(req.user!.id);
      res.json(userFavorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const { yachtId, serviceId, eventId } = req.body;
      
      if (!yachtId && !serviceId && !eventId) {
        return res.status(400).json({ message: "Must specify yachtId, serviceId, or eventId" });
      }

      const favorite = await storage.addFavorite({
        userId: req.user!.id,
        yachtId: yachtId || null,
        serviceId: serviceId || null,
        eventId: eventId || null
      });

      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/favorites", requireAuth, async (req, res) => {
    try {
      const { yachtId, serviceId, eventId } = req.query;
      
      const success = await storage.removeFavorite(
        req.user!.id,
        yachtId ? parseInt(yachtId as string) : undefined,
        serviceId ? parseInt(serviceId as string) : undefined,
        eventId ? parseInt(eventId as string) : undefined
      );

      if (success) {
        res.json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/check", requireAuth, async (req, res) => {
    try {
      const { yachtId, serviceId, eventId } = req.query;
      
      const isFavorite = await storage.isFavorite(
        req.user!.id,
        yachtId ? parseInt(yachtId as string) : undefined,
        serviceId ? parseInt(serviceId as string) : undefined,
        eventId ? parseInt(eventId as string) : undefined
      );

      res.json({ isFavorite });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // MESSAGES ROUTES - Real-time messaging with Twilio integration
  app.get("/api/messages/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/:conversationId", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });

      const message = await storage.createMessage(messageData);
      
      // Send real-time notification (if notification service supports it)
      try {
        if (notificationService && typeof notificationService.broadcast === 'function') {
          notificationService.broadcast({
            type: 'message',
            data: message
          });
        }
      } catch (error) {
        console.log('Notification service not available:', error);
      }

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const message = await storage.updateMessageStatus(parseInt(id), status);
      
      if (message) {
        res.json(message);
      } else {
        res.status(404).json({ message: "Message not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ADMIN API ROUTES - Complete dashboard functionality
  app.get("/api/admin/stats", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const yachts = await storage.getYachts();
      const services = await storage.getServices();
      const events = await storage.getEvents();
      const bookings = await storage.getBookings();
      const serviceBookings = await storage.getServiceBookings();
      const eventRegistrations = await storage.getEventRegistrations();

      // Calculate revenue from bookings and service bookings
      const totalRevenue = [...bookings, ...serviceBookings, ...eventRegistrations]
        .reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);

      // Calculate membership breakdown
      const membershipBreakdown = ['Bronze', 'Silver', 'Gold', 'Platinum'].map(tier => {
        const count = users.filter(user => user.membershipTier === tier).length;
        return {
          tier,
          count,
          percentage: users.length > 0 ? Math.round((count / users.length) * 100) : 0
        };
      });

      const stats = {
        totalUsers: users.length,
        totalBookings: bookings.length + serviceBookings.length + eventRegistrations.length,
        totalRevenue: Math.round(totalRevenue),
        activeServices: services.filter(s => s.isAvailable !== false).length,
        monthlyGrowth: 15,
        membershipBreakdown
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/yachts", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const yachts = await storage.getYachts();
      res.json(yachts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/services", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/events", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/payments", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      const serviceBookings = await storage.getServiceBookings();
      const eventRegistrations = await storage.getEventRegistrations();

      // Combine all payment transactions
      const payments = [
        ...bookings.map(b => ({
          id: `booking-${b.id}`,
          type: 'Yacht Booking',
          amount: parseFloat(b.totalPrice || '0'),
          status: b.status,
          date: b.createdAt,
          customer: `User ${b.userId}`
        })),
        ...serviceBookings.map(sb => ({
          id: `service-${sb.id}`,
          type: 'Service Booking', 
          amount: parseFloat(sb.totalPrice || '0'),
          status: sb.status,
          date: sb.createdAt,
          customer: `User ${sb.userId}`
        })),
        ...eventRegistrations.map(er => ({
          id: `event-${er.id}`,
          type: 'Event Registration',
          amount: parseFloat(er.totalPrice || '0'),
          status: er.status,
          date: er.createdAt,
          customer: `User ${er.userId}`
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(parseInt(id), updates);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/yachts/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const yacht = await storage.updateYacht(parseInt(id), updates);
      res.json(yacht);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/services/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const service = await storage.updateService(parseInt(id), updates);
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/events/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const event = await storage.updateEvent(parseInt(id), updates);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
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

  // Admin user management endpoints
  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user: ' + error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user: ' + error.message });
    }
  });

  // Admin yacht management endpoints
  app.put("/api/admin/yachts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const yachtId = parseInt(req.params.id);
      const updateData = req.body;
      const yacht = await storage.updateYacht(yachtId, updateData);
      res.json(yacht);
    } catch (error: any) {
      console.error('Error updating yacht:', error);
      res.status(500).json({ message: 'Error updating yacht: ' + error.message });
    }
  });

  // Admin service management endpoints
  app.put("/api/admin/services/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const serviceId = parseInt(req.params.id);
      const updateData = req.body;
      const service = await storage.updateService(serviceId, updateData);
      res.json(service);
    } catch (error: any) {
      console.error('Error updating service:', error);
      res.status(500).json({ message: 'Error updating service: ' + error.message });
    }
  });

  // Admin event management endpoints
  app.put("/api/admin/events/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const eventId = parseInt(req.params.id);
      const updateData = req.body;
      const event = await storage.updateEvent(eventId, updateData);
      res.json(event);
    } catch (error: any) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Error updating event: ' + error.message });
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
