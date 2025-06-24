// Ultra-fast direct database query routes for millisecond response times
import type { Express } from "express";
import { pool } from './db';
import { cache } from './cache';

// Ultra-fast cached database queries with direct SQL for maximum performance
export function setupFastRoutes(app: Express) {
  
  // Ultra-fast admin routes with direct SQL and aggressive caching
  app.get("/api/admin/users", async (req, res) => {
    try {
      const cacheKey = 'admin-users-fast';
      let users = cache.get(cacheKey);
      
      if (!users) {
        const result = await pool.query(`
          SELECT id, username, email, role, "membershipTier", "isActive", "createdAt" 
          FROM users 
          ORDER BY "createdAt" DESC 
          LIMIT 100
        `);
        users = result.rows;
        cache.set(cacheKey, users, 2 * 60 * 1000); // 2 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=120',
        'Expires': new Date(Date.now() + 120000).toUTCString()
      });
      
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/yachts", async (req, res) => {
    try {
      const cacheKey = 'admin-yachts-fast';
      let yachts = cache.get(cacheKey);
      
      if (!yachts) {
        const result = await pool.query(`
          SELECT id, name, location, "yachtType", size, capacity, "pricePerHour", "isAvailable"
          FROM yachts 
          ORDER BY name
        `);
        yachts = result.rows;
        cache.set(cacheKey, yachts, 5 * 60 * 1000); // 5 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=300',
        'Expires': new Date(Date.now() + 300000).toUTCString()
      });
      
      res.json(yachts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/services", async (req, res) => {
    try {
      const cacheKey = 'admin-services-fast';
      let services = cache.get(cacheKey);
      
      if (!services) {
        const result = await pool.query(`
          SELECT s.*, u.username as "providerName"
          FROM services s
          LEFT JOIN users u ON s."providerId" = u.id
          ORDER BY s.name
        `);
        services = result.rows;
        cache.set(cacheKey, services, 5 * 60 * 1000); // 5 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=300',
        'Expires': new Date(Date.now() + 300000).toUTCString()
      });
      
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/events", async (req, res) => {
    try {
      const cacheKey = 'admin-events-fast';
      let events = cache.get(cacheKey);
      
      if (!events) {
        const result = await pool.query(`
          SELECT e.*, u.username as "hostName"
          FROM events e
          LEFT JOIN users u ON e."hostId" = u.id
          ORDER BY e."startDate" DESC
        `);
        events = result.rows;
        cache.set(cacheKey, events, 5 * 60 * 1000); // 5 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=300',
        'Expires': new Date(Date.now() + 300000).toUTCString()
      });
      
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const cacheKey = 'admin-bookings-fast';
      let bookings = cache.get(cacheKey);
      
      if (!bookings) {
        const result = await pool.query(`
          SELECT 
            b.id, b."startTime", b."endTime", b.status, b."totalPrice", b."guestCount",
            u.username as "member.name",
            y.name as "yacht.name", y."yachtType" as "yacht.type"
          FROM bookings b
          LEFT JOIN users u ON b."userId" = u.id
          LEFT JOIN yachts y ON b."yachtId" = y.id
          ORDER BY b."startTime" DESC
          LIMIT 50
        `);
        
        bookings = result.rows.map(row => ({
          id: row.id,
          startTime: row.startTime,
          endTime: row.endTime,
          status: row.status,
          totalPrice: row.totalPrice,
          guestCount: row.guestCount,
          member: { name: row['member.name'] },
          yacht: { name: row['yacht.name'], type: row['yacht.type'] }
        }));
        
        cache.set(cacheKey, bookings, 1 * 60 * 1000); // 1 minute cache for real-time data
      }

      res.set({
        'Cache-Control': 'private, max-age=60',
        'Expires': new Date(Date.now() + 60000).toUTCString()
      });
      
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const cacheKey = 'admin-notifications-fast';
      let notifications = cache.get(cacheKey);
      
      if (!notifications) {
        const result = await pool.query(`
          SELECT id, "userId", type, title, message, priority, "isRead", "createdAt"
          FROM notifications
          ORDER BY "createdAt" DESC
          LIMIT 20
        `);
        notifications = result.rows;
        cache.set(cacheKey, notifications, 30 * 1000); // 30 second cache for real-time
      }

      res.set({
        'Cache-Control': 'private, max-age=30',
        'Expires': new Date(Date.now() + 30000).toUTCString()
      });
      
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const cacheKey = 'admin-analytics-fast';
      let analytics = cache.get(cacheKey);
      
      if (!analytics) {
        // Get counts directly from database with single query
        const result = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM users) as "totalUsers",
            (SELECT COUNT(*) FROM bookings) as "totalBookings",
            (SELECT COALESCE(SUM(CAST("totalPrice" as numeric)), 0) FROM bookings WHERE status = 'confirmed') as "totalRevenue",
            (SELECT COUNT(*) FROM services WHERE "isAvailable" = true) as "activeServices"
        `);
        
        const stats = result.rows[0];
        analytics = {
          overview: {
            totalRevenue: Math.round(parseFloat(stats.totalRevenue || '0')),
            recentBookings: parseInt(stats.totalBookings || '0'),
            activeMembers: parseInt(stats.totalUsers || '0'),
            completionRate: 98.5
          },
          growth: {
            revenue: 15.3,
            bookings: 12.7,
            members: 8.9
          },
          metrics: {
            avgBookingValue: stats.totalBookings > 0 ? Math.round(parseFloat(stats.totalRevenue || '0') / parseInt(stats.totalBookings)) : 0,
            memberSatisfaction: 4.8,
            systemUptime: 99.9
          }
        };
        
        cache.set(cacheKey, analytics, 5 * 60 * 1000); // 5 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=300',
        'Expires': new Date(Date.now() + 300000).toUTCString()
      });
      
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const cacheKey = 'admin-stats-fast';
      let stats = cache.get(cacheKey);
      
      if (!stats) {
        const result = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM users) as "totalUsers",
            (SELECT COUNT(*) FROM bookings) + (SELECT COUNT(*) FROM service_bookings) + (SELECT COUNT(*) FROM event_registrations) as "totalBookings",
            (SELECT COALESCE(SUM(CAST("totalPrice" as numeric)), 0) FROM bookings WHERE status = 'confirmed') as "totalRevenue",
            (SELECT COUNT(*) FROM services WHERE "isAvailable" = true) as "activeServices"
        `);
        
        const data = result.rows[0];
        stats = {
          totalUsers: parseInt(data.totalUsers || '0'),
          totalBookings: parseInt(data.totalBookings || '0'),
          totalRevenue: Math.round(parseFloat(data.totalRevenue || '0')),
          activeServices: parseInt(data.activeServices || '0'),
          monthlyGrowth: 15,
          bookingGrowth: 12,
          revenueGrowth: 18,
          serviceGrowth: 5,
          membershipBreakdown: [
            { tier: 'Bronze', count: 5, percentage: 25 },
            { tier: 'Silver', count: 8, percentage: 40 },
            { tier: 'Gold', count: 5, percentage: 25 },
            { tier: 'Platinum', count: 2, percentage: 10 }
          ]
        };
        
        cache.set(cacheKey, stats, 5 * 60 * 1000); // 5 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=300',
        'Expires': new Date(Date.now() + 300000).toUTCString()
      });
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/payments", async (req, res) => {
    try {
      const cacheKey = 'admin-payments-fast';
      let payments = cache.get(cacheKey);
      
      if (!payments) {
        // Get recent payments from bookings and service bookings
        const result = await pool.query(`
          SELECT 
            'booking-' || id as id,
            'Yacht Booking' as type,
            "totalPrice" as amount,
            status,
            "createdAt" as date,
            'stripe' as method
          FROM bookings 
          WHERE "totalPrice" IS NOT NULL AND "totalPrice" != '0'
          UNION ALL
          SELECT 
            'service-' || id as id,
            'Service Booking' as type,
            "totalPrice" as amount,
            status,
            "createdAt" as date,
            'stripe' as method
          FROM service_bookings 
          WHERE "totalPrice" IS NOT NULL AND "totalPrice" != '0'
          ORDER BY date DESC
          LIMIT 20
        `);
        
        payments = result.rows;
        cache.set(cacheKey, payments, 2 * 60 * 1000); // 2 minute cache
      }

      res.set({
        'Cache-Control': 'private, max-age=120',
        'Expires': new Date(Date.now() + 120000).toUTCString()
      });
      
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}