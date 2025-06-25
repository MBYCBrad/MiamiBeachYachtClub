// Ultra-fast direct database query routes for millisecond response times
import type { Express } from "express";
import { pool } from './db';
import { cache } from './cache';
import { ultraFastCache } from './ultra-fast-cache';

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Ultra-fast cached database queries with direct SQL for maximum performance
export function setupFastAdminRoutes(app: Express) {
  
  // Ultra-fast admin routes with precomputed data - instant response
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getUsers());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/yachts", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getYachts());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/services", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getServices());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/events", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getEvents());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/bookings", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getBookings());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/notifications", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=15',
        'Expires': new Date(Date.now() + 15000).toUTCString()
      });
      
      res.json(ultraFastCache.getNotifications());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getAnalytics());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(ultraFastCache.getStats());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/payments", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.set({
        'Cache-Control': 'private, max-age=60',
        'Expires': new Date(Date.now() + 60000).toUTCString()
      });
      
      res.json(ultraFastCache.getPayments());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ultra-fast conversations endpoint
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'service_provider' && !req.user.role?.startsWith('staff')) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const cacheKey = `conversations-${req.user.role}`;
      let conversations = cache.get(cacheKey);
      
      if (!conversations) {
        const result = await pool.query(`
          SELECT 
            'booking_conv_' || b.id as id,
            b."userId" as "memberId",
            u.username as "memberName",
            'booking' as type,
            CASE WHEN b.status = 'confirmed' THEN 'active' ELSE 'pending' END as status,
            b."createdAt" as "lastMessageAt",
            'Yacht booking discussion' as "lastMessage",
            0 as "unreadCount"
          FROM bookings b
          LEFT JOIN users u ON b."userId" = u.id
          ORDER BY b."createdAt" DESC
          LIMIT 10
        `);
        
        conversations = result.rows;
        cache.set(cacheKey, conversations, 15 * 1000); // 15 second cache
      }

      res.set({
        'Cache-Control': 'private, max-age=15',
        'Expires': new Date(Date.now() + 15000).toUTCString()
      });
      
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ultra-fast bookings endpoint
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const cacheKey = `bookings-user-${req.user.id}`;
      let bookings = cache.get(cacheKey);
      
      if (!bookings) {
        const result = await pool.query(`
          SELECT b.*, y.name as "yacht.name", y."yachtType" as "yacht.type"
          FROM bookings b
          LEFT JOIN yachts y ON b."yachtId" = y.id
          WHERE b."userId" = $1
          ORDER BY b."startTime" DESC
        `, [req.user.id]);
        
        bookings = result.rows.map(row => ({
          ...row,
          yacht: { name: row['yacht.name'], type: row['yacht.type'] }
        }));
        
        cache.set(cacheKey, bookings, 30 * 1000); // 30 second cache
      }

      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ultra-fast service bookings endpoint
  app.get("/api/service-bookings", requireAuth, async (req, res) => {
    try {
      const cacheKey = `service-bookings-user-${req.user.id}`;
      let bookings = cache.get(cacheKey);
      
      if (!bookings) {
        const result = await pool.query(`
          SELECT sb.*, s.name as "service.name", s.category as "service.category"
          FROM service_bookings sb
          LEFT JOIN services s ON sb."serviceId" = s.id
          WHERE sb."userId" = $1
          ORDER BY sb."scheduledDate" DESC
        `, [req.user.id]);
        
        bookings = result.rows.map(row => ({
          ...row,
          service: { name: row['service.name'], category: row['service.category'] }
        }));
        
        cache.set(cacheKey, bookings, 30 * 1000); // 30 second cache
      }

      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ultra-fast event registrations endpoint
  app.get("/api/event-registrations", requireAuth, async (req, res) => {
    try {
      const cacheKey = `event-registrations-user-${req.user.id}`;
      let registrations = cache.get(cacheKey);
      
      if (!registrations) {
        const result = await pool.query(`
          SELECT er.*, e.title as "event.title", e."startDate" as "event.startDate"
          FROM event_registrations er
          LEFT JOIN events e ON er."eventId" = e.id
          WHERE er."userId" = $1
          ORDER BY e."startDate" DESC
        `, [req.user.id]);
        
        registrations = result.rows.map(row => ({
          ...row,
          event: { title: row['event.title'], startDate: row['event.startDate'] }
        }));
        
        cache.set(cacheKey, registrations, 60 * 1000); // 1 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=60',
        'Expires': new Date(Date.now() + 60000).toUTCString()
      });
      
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}