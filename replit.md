# Monaco Bay Yacht Club - Full Stack Application

## Overview

Monaco Bay Yacht Club (MBYC) is a luxury yacht membership platform built as a full-stack web application. The system provides a comprehensive yacht booking and management experience with tiered membership access, premium services, and exclusive events. The application serves multiple user types including members, yacht owners, service providers, and administrators.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom luxury yacht club theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **API Design**: RESTful API with role-based access control
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM (Live Database Connected)
- **Schema**: Comprehensive relational schema with users, yachts, services, events, bookings, and reviews
- **Migrations**: Drizzle Kit for schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL
- **Storage**: DatabaseStorage class replacing in-memory storage with PostgreSQL persistence

## Key Components

### User Management System
- Multi-role authentication (Member, Yacht Owner, Service Provider, Admin)
- Tiered membership system (Bronze, Silver, Gold, Platinum)
- Stripe integration for subscription management
- Session-based authentication with secure password hashing

### Yacht Booking System
- Fleet management with yacht specifications and amenities
- Availability tracking and reservation system
- Membership tier-based yacht size restrictions
- Image galleries and detailed yacht information

### Premium Services Platform
- Service provider marketplace for yacht-related services
- Booking system for professional services (catering, maintenance, etc.)
- Rating and review system for service quality assurance

### Events & Experiences
- Exclusive yacht club events and experiences
- Event registration and capacity management
- Ticket pricing and guest management

### Responsive Design
- Mobile-first responsive design
- Bottom navigation for mobile experience
- Luxury dark theme with purple and blue accent colors
- Image-heavy design showcasing yacht lifestyle

## Data Flow

### Authentication Flow
1. User registration with role and membership tier selection
2. Passport.js local strategy authentication
3. Session creation and storage in PostgreSQL
4. Role-based route protection and feature access

### Booking Flow
1. User browses available yachts with membership tier filtering
2. Yacht selection triggers availability check
3. Booking creation with user and yacht association
4. Confirmation and status tracking

### Service Integration
1. Service providers register and create service listings
2. Members browse and book services with rating visibility
3. Booking management and completion tracking
4. Review and rating submission post-service

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **Authentication**: passport and passport-local with express-session
- **UI Components**: Comprehensive Radix UI component library
- **Payments**: @stripe/stripe-js and @stripe/react-stripe-js
- **State Management**: @tanstack/react-query for server state
- **Form Handling**: react-hook-form with @hookform/resolvers

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Development server with HMR and build optimization
- **ESBuild**: Backend bundling for production deployment
- **Tailwind CSS**: Utility-first styling with PostCSS

## Deployment Strategy

### Development Environment
- Replit-hosted development with live reloading
- Vite development server on port 5000
- PostgreSQL database provisioning through Replit modules
- Environment variable management for database and session secrets

### Production Build
- Vite builds frontend to `dist/public`
- ESBuild bundles backend server to `dist/index.js`
- Static file serving through Express for SPA routing
- Autoscale deployment target for production hosting

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in shared TypeScript files
- Database push commands for development iteration

## Changelog

```
Changelog:
- June 21, 2025. Initial setup
- June 21, 2025. PostgreSQL database successfully integrated and connected
  - DatabaseStorage class implemented replacing in-memory storage
  - All database tables created and operational
  - API endpoints verified working with live database
- June 21, 2025. Production-ready MBYC application completed
  - Complete role-based dashboard system implemented (Member, Yacht Owner, Service Provider, Admin)
  - Advanced membership tier system with token-based yacht booking mechanism
  - Comprehensive Stripe payment integration for services and events
  - Twilio concierge service integration for premium member support
  - Full authentication system with registration and login
  - Advanced yacht filtering based on membership tier restrictions
  - Service marketplace with provider management and booking system
  - Event management with registration and payment processing
  - Admin dashboard with full BI analytics and user management
  - Cross-platform React architecture for web deployment
  - Production-ready backend API with comprehensive routes and validation
- June 21, 2025. Dynamic video storage system implemented
  - Database-driven media asset management with PostgreSQL storage
  - Video streaming API with range request support for optimal performance
  - Hero video system with dynamic loading and fallback states
  - Media storage service with file management and serving capabilities
  - React Query integration for efficient video asset caching
  - Seamless video background system with loading states and error handling
- June 21, 2025. Enhanced 3D animated navigation icons implemented
  - Complete 3D animated icon system for bottom navigation
  - Explore icon redesigned as detailed nautical anchor with water ripple effects
  - All icons display colors from start and animate only when clicked/active
  - Purple/blue hamburger menu matching brand colors
  - Smooth motion animations with proper state management and performance optimization
- June 21, 2025. Profile page completely redesigned for MBYC Coin collection focus
  - Clean, organized dark mode UI centered around gamified coin collection system
  - Simplified hero section with MBYC Coin counter prominently displayed
  - Events section transformed to show coin rewards for participation
  - Services section redesigned to highlight coin earnings from bookings
  - Removed overwhelming complex animations and features for clean user experience
  - Simple savings summary replaced complex analytics showcase
  - Profile now encourages engagement through clear coin collection mechanics
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```