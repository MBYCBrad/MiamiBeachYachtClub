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
    secret: process.env.SESSION_SECRET || 'mbyc-development-secret-key-2025',
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
      try {
        console.log('Login attempt for username:', username);
        
        // First try to find in users table
        const user = await storage.getUserByUsername(username);
        if (user) {
          console.log('Found user in users table:', user.username);
          if (await comparePasswords(password, user.password)) {
            console.log('User password verified successfully');
            return done(null, user);
          } else {
            console.log('User password verification failed');
          }
        } else {
          console.log('User not found in users table, checking staff table');
        }
        
        // If not found in users, try staff table
        const staffMember = await storage.getStaffByUsername(username);
        if (staffMember) {
          console.log('Found staff member:', staffMember.username, 'with role:', staffMember.role);
          console.log('Staff password exists:', !!staffMember.password, 'length:', staffMember.password?.length);
          if (staffMember.password && staffMember.password.trim() !== '') {
            console.log('Staff member has password, verifying...');
            if (await comparePasswords(password, staffMember.password)) {
              console.log('Staff password verified successfully');
              // Convert staff to user-like object for session compatibility
              const staffAsUser = {
                ...staffMember,
                role: 'staff', // Mark as staff for routing
                staffRole: staffMember.role, // Keep original staff role
              };
              return done(null, staffAsUser);
            } else {
              console.log('Staff password verification failed');
            }
          } else {
            console.log('Staff member has no password set or password is empty');
          }
        } else {
          console.log('Staff member not found');
        }
        
        console.log('Authentication failed for username:', username);
        return done(null, false);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      // First try to find in users table
      const user = await storage.getUser(id);
      if (user) {
        return done(null, user);
      }
      
      // If not found in users, try staff table
      const staffMember = await storage.getStaff(id);
      if (staffMember) {
        const staffAsUser = {
          ...staffMember,
          role: 'staff',
          staffRole: staffMember.role,
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

  app.post("/api/login", (req, res, next) => {
    console.log('Login endpoint hit with username:', req.body.username);
    passport.authenticate("local", (err, user, info) => {
      console.log('Passport authenticate callback - err:', err, 'user:', user ? { ...user, password: '[REDACTED]' } : null, 'info:', info);
      
      if (err) {
        console.error('Passport authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Authentication failed - no user returned');
        return res.status(401).send("Unauthorized");
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Session login error:', loginErr);
          return next(loginErr);
        }
        console.log('Login successful for user:', user.username);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res, next) => {
    console.log('Logout request received for user:', req.user?.username);
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error('Session destroy error:', sessionErr);
        }
        
        // Clear all possible session cookies
        res.clearCookie('connect.sid', { 
          path: '/', 
          httpOnly: true, 
          secure: false, // Set to true in production with HTTPS
          sameSite: 'lax' 
        });
        res.clearCookie('session', { path: '/' });
        res.clearCookie('sessionid', { path: '/' });
        
        // Add headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        console.log('Session destroyed and cookies cleared, redirecting to /');
        res.redirect('/');
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
