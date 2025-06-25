import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) {
    console.error("Invalid stored password format:", stored);
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    console.error("Missing hash or salt in stored password");
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // First try to find a regular user
      let user = await storage.getUserByUsername(username);
      if (user && (await comparePasswords(password, user.password))) {
        return done(null, { ...user, userType: 'user' });
      }
      
      // If not found in users, try staff table
      const staff = await storage.getStaffByUsername(username);
      if (staff && (await comparePasswords(password, staff.password))) {
        // Convert staff to user-like object for session compatibility
        const staffAsUser = {
          id: staff.id,
          username: staff.username,
          email: staff.email,
          password: staff.password,
          fullName: staff.fullName,
          role: 'staff', // Mark as staff for routing
          membershipTier: null,
          phone: staff.phone,
          location: staff.location,
          joinedAt: staff.createdAt,
          lastLoginAt: null,
          isActive: staff.status === 'active',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          userType: 'staff', // Additional identifier
          staffRole: staff.role,
          department: staff.department,
          permissions: staff.permissions
        };
        return done(null, staffAsUser);
      }
      
      return done(null, false);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      // First try to find in users table
      let user = await storage.getUser(id);
      if (user) {
        return done(null, { ...user, userType: 'user' });
      }
      
      // If not found in users, try staff table
      const staff = await storage.getStaff(id);
      if (staff) {
        const staffAsUser = {
          id: staff.id,
          username: staff.username,
          email: staff.email,
          password: staff.password,
          fullName: staff.fullName,
          role: 'staff',
          membershipTier: null,
          phone: staff.phone,
          location: staff.location,
          joinedAt: staff.createdAt,
          lastLoginAt: null,
          isActive: staff.status === 'active',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          userType: 'staff',
          staffRole: staff.role,
          department: staff.department,
          permissions: staff.permissions
        };
        return done(null, staffAsUser);
      }
      
      done(null, false);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const userDataToCreate = {
        ...req.body,
        password: await hashPassword(req.body.password),
      };
      
      console.log('Creating user with data:', { ...userDataToCreate, password: '[REDACTED]' });
      
      const user = await storage.createUser(userDataToCreate);
      
      console.log('User created successfully:', { ...user, password: '[REDACTED]' });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error during registration' });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
