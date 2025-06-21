import { db } from "./db";
import { users, yachts, services, events } from "@shared/schema";
import { UserRole, MembershipTier } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("🌊 Seeding Miami Beach Yacht Club database...");

  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("✅ Database already seeded");
      return;
    }

    // Create demo users with different roles and membership tiers
    const hashedPassword = await hashPassword("password");
    
    const userData = [
      {
        username: "admin",
        email: "admin@mbyc.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "demo_member",
        email: "member@mbyc.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.PLATINUM,
        phone: "+1 (305) 555-0123",
        location: "Miami Beach, FL",
        language: "en",
        notifications: {
          bookings: true,
          events: true,
          marketing: false
        }
      },
      {
        username: "bronze_member",
        email: "bronze@mbyc.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.BRONZE
      },
      {
        username: "silver_member",
        email: "silver@mbyc.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.SILVER
      },
      {
        username: "gold_member",
        email: "gold@mbyc.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "demo_owner",
        email: "owner@mbyc.com",
        password: hashedPassword,
        role: UserRole.YACHT_OWNER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "yacht_owner_1",
        email: "owner1@mbyc.com",
        password: hashedPassword,
        role: UserRole.YACHT_OWNER,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "yacht_owner_2",
        email: "owner2@mbyc.com",
        password: hashedPassword,
        role: UserRole.YACHT_OWNER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "demo_provider",
        email: "provider@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.SILVER
      },
      {
        username: "chef_service",
        email: "chef@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "spa_provider",
        email: "spa@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "security_provider",
        email: "security@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "entertainment_provider",
        email: "entertainment@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.SILVER
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // Create luxury yachts for all membership tiers
    const yachtData = [
      // Bronze/Silver Member Yachts (35-50 feet)
      {
        name: "Marina Breeze",
        description: "Elegant 40-foot yacht perfect for intimate gatherings. Features comfortable seating, basic amenities, and stunning bay views.",
        size: 40,
        capacity: 8,
        pricePerDay: "1250.00",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        location: "Miami Beach Marina",
        ownerId: createdUsers.find(u => u.username === "yacht_owner_2")?.id,
        isAvailable: true,
        amenities: ["Sun Deck", "Basic Kitchen", "Sound System", "Fishing Equipment"]
      },
      {
        name: "Coastal Star",
        description: "Beautiful 45-foot vessel ideal for day trips and sunset cruises. Well-maintained with essential amenities for comfortable sailing.",
        size: 45,
        capacity: 10,
        pricePerDay: "1650.00",
        imageUrl: "https://images.unsplash.com/photo-1570459027562-4cf76d341c85?w=800",
        location: "Bayfront Marina",
        ownerId: createdUsers.find(u => u.username === "yacht_owner_2")?.id,
        isAvailable: true,
        amenities: ["Dining Area", "Restroom Facilities", "Safety Equipment", "Cooler Storage"]
      },
      // Gold Member Yachts (55-75 feet)
      {
        name: "Azure Elegance",
        description: "Stunning 75-foot luxury yacht featuring state-of-the-art amenities, spacious decks, and panoramic ocean views. Perfect for exclusive gatherings and memorable celebrations.",
        size: 75,
        capacity: 12,
        pricePerDay: "2850.00",
        imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
        location: "Miami Beach Marina",
        ownerId: createdUsers.find(u => u.username === "demo_owner")?.id,
        isAvailable: true,
        amenities: ["Luxury Interior", "Professional Crew", "Gourmet Kitchen", "Entertainment System", "Water Sports Equipment"]
      },
      {
        name: "Golden Horizon",
        description: "Sophisticated 65-foot yacht with premium finishes and professional crew. Ideal for corporate events and special celebrations.",
        size: 65,
        capacity: 14,
        pricePerDay: "2450.00",
        imageUrl: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
        location: "Star Island Marina",
        ownerId: createdUsers.find(u => u.username === "yacht_owner_1")?.id,
        isAvailable: true,
        amenities: ["Master Cabin", "Full Bar", "Water Toys", "Professional Sound", "Air Conditioning"]
      },
      // Platinum Member Yachts (80+ feet)
      {
        name: "Ocean Majesty",
        description: "Magnificent 85-foot mega yacht with luxury accommodations, professional crew, and world-class dining facilities. Experience the ultimate in maritime luxury.",
        size: 85,
        capacity: 16,
        pricePerDay: "3750.00",
        imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
        location: "Star Island Marina",
        ownerId: createdUsers.find(u => u.username === "demo_owner")?.id,
        isAvailable: true,
        amenities: ["Master Suite", "Jacuzzi", "Professional Chef", "Water Toys", "Premium Bar"]
      },
      {
        name: "Platinum Dream",
        description: "Exclusive 95-foot super yacht offering unparalleled luxury and sophistication. Features multiple decks, premium amenities, and exceptional service standards.",
        size: 95,
        capacity: 20,
        pricePerDay: "4850.00",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        location: "Fisher Island Club",
        ownerId: createdUsers.find(u => u.username === "admin")?.id,
        isAvailable: true,
        amenities: ["Multiple Decks", "Helicopter Pad", "Spa Services", "Cinema Room", "Business Center"]
      },
      {
        name: "Royal Serenity",
        description: "Ultra-luxury 110-foot super yacht with world-class amenities, multiple suites, and 24/7 concierge service. The pinnacle of maritime elegance.",
        size: 110,
        capacity: 24,
        pricePerDay: "6850.00",
        imageUrl: "https://images.unsplash.com/photo-1567662378494-47b22a2ae96a?w=800",
        location: "Fisher Island Club",
        ownerId: createdUsers.find(u => u.username === "yacht_owner_1")?.id,
        isAvailable: true,
        amenities: ["Presidential Suite", "Spa & Wellness", "Fine Dining", "Helicopter Service", "Personal Butler"]
      },
      {
        name: "Diamond Vista",
        description: "Spectacular 120-foot mega yacht featuring cutting-edge technology, luxury accommodations, and unmatched service. Perfect for high-profile events.",
        size: 120,
        capacity: 28,
        pricePerDay: "7950.00",
        imageUrl: "https://images.unsplash.com/photo-1561207424-7e27d2cf9657?w=800",
        location: "Miami Yacht & Biscayne Bay",
        ownerId: createdUsers.find(u => u.username === "admin")?.id,
        isAvailable: true,
        amenities: ["Multiple Master Suites", "Conference Facilities", "Gym & Spa", "Wine Cellar", "Infinity Pool"]
      }
    ];

    const createdYachts = await db.insert(yachts).values(yachtData).returning();
    console.log(`✅ Created ${createdYachts.length} luxury yachts`);

    // Create comprehensive premium services across all categories
    const serviceData = [
      // Culinary Services
      {
        name: "Executive Chef Service",
        description: "World-class culinary experiences featuring Michelin-starred chefs who create personalized gourmet menus using the finest ingredients.",
        category: "Culinary",
        pricePerSession: "850.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "chef_service")?.id,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 127
      },
      {
        name: "Private Sommelier & Wine Pairing",
        description: "Expert wine selection and pairing services with rare vintages and premium spirits for sophisticated dining experiences.",
        category: "Culinary",
        pricePerSession: "450.00",
        duration: 3,
        providerId: createdUsers.find(u => u.username === "chef_service")?.id,
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 94
      },
      {
        name: "Gourmet Catering & Bar Service",
        description: "Complete catering services with professional bartenders, premium ingredients, and customized menus for all occasions.",
        category: "Culinary",
        pricePerSession: "650.00",
        duration: 6,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 203
      },
      
      // Maintenance & Technical Services
      {
        name: "Professional Yacht Detailing",
        description: "Comprehensive yacht maintenance and detailing services ensuring your vessel remains in pristine condition with premium care and attention to detail.",
        category: "Maintenance",
        pricePerSession: "425.00",
        duration: 6,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 89
      },
      {
        name: "Marine Engine & Systems Service",
        description: "Expert mechanical services for yacht engines, electrical systems, and navigation equipment by certified marine technicians.",
        category: "Maintenance",
        pricePerSession: "750.00",
        duration: 8,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 156
      },
      {
        name: "Interior Design & Refurbishment",
        description: "Luxury yacht interior design services with premium materials, custom furnishings, and sophisticated aesthetic upgrades.",
        category: "Maintenance",
        pricePerSession: "1850.00",
        duration: 12,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        isAvailable: true,
        rating: "4.6",
        reviewCount: 71
      },

      // Wellness & Spa Services
      {
        name: "Onboard Spa & Wellness Treatments",
        description: "Professional spa services including massages, facials, and wellness treatments delivered directly to your yacht.",
        category: "Wellness",
        pricePerSession: "385.00",
        duration: 2,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 324
      },
      {
        name: "Personal Fitness & Yoga Instruction",
        description: "Private fitness training and yoga sessions on deck with certified instructors and premium equipment.",
        category: "Wellness",
        pricePerSession: "285.00",
        duration: 1,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 187
      },

      // Event Planning & Entertainment
      {
        name: "Luxury Event Planning",
        description: "Exclusive event coordination for yacht parties, corporate gatherings, and special celebrations with premium vendors and personalized service.",
        category: "Events",
        pricePerSession: "1250.00",
        duration: 8,
        providerId: createdUsers.find(u => u.username === "entertainment_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        isAvailable: true,
        rating: "5.0",
        reviewCount: 156
      },
      {
        name: "Live Entertainment & DJ Services",
        description: "Professional musicians, DJs, and performers for yacht parties and special events with premium sound systems.",
        category: "Entertainment",
        pricePerSession: "950.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "entertainment_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 245
      },
      {
        name: "Photography & Videography",
        description: "Professional yacht photography and videography services for events, celebrations, and marketing purposes.",
        category: "Photography",
        pricePerSession: "750.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "entertainment_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 198
      },

      // Security & Safety Services
      {
        name: "Executive Security & Protection",
        description: "Professional security services with trained maritime security personnel for high-profile guests and events.",
        category: "Security",
        pricePerSession: "1450.00",
        duration: 8,
        providerId: createdUsers.find(u => u.username === "security_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 112
      },
      {
        name: "Safety Inspection & Certification",
        description: "Comprehensive safety inspections and certification services ensuring compliance with maritime regulations.",
        category: "Safety",
        pricePerSession: "650.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "security_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 87
      }
    ];

    const createdServices = await db.insert(services).values(serviceData).returning();
    console.log(`✅ Created ${createdServices.length} premium services`);

    // Create comprehensive exclusive events across all categories
    const eventData = [
      // Upcoming Premium Events
      {
        title: "Sunset Cocktail Cruise",
        description: "Join us for an elegant evening aboard our flagship yacht as we cruise through the stunning waters of Biscayne Bay. Enjoy premium cocktails and gourmet hors d'oeuvres while watching the sun set over Miami's skyline.",
        startTime: new Date("2025-07-15T18:00:00Z"),
        endTime: new Date("2025-07-15T21:00:00Z"),
        location: "Miami Beach Marina",
        capacity: 50,
        ticketPrice: "185.00",
        imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
        hostId: createdUsers.find(u => u.username === "demo_member")?.id,
        isActive: true
      },
      {
        title: "Wine Tasting & Jazz Evening",
        description: "An exclusive wine tasting event featuring rare vintages from premier wineries around the world. Live jazz music creates the perfect ambiance for this sophisticated gathering.",
        startTime: new Date("2025-07-22T19:00:00Z"),
        endTime: new Date("2025-07-22T22:00:00Z"),
        location: "Star Island Private Club",
        capacity: 35,
        ticketPrice: "295.00",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Platinum Members Gala",
        description: "An ultra-exclusive black-tie gala aboard our most luxurious super yacht. Features world-class entertainment, Michelin-starred dining, and networking opportunities with Miami's elite.",
        startTime: new Date("2025-08-05T19:30:00Z"),
        endTime: new Date("2025-08-06T01:00:00Z"),
        location: "Fisher Island Club",
        capacity: 120,
        ticketPrice: "750.00",
        imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Corporate Yacht Charter Showcase",
        description: "Exclusive corporate event showcasing our premium yacht charter services. Perfect for business networking with luxury amenities and professional presentations.",
        startTime: new Date("2025-07-28T16:00:00Z"),
        endTime: new Date("2025-07-28T20:00:00Z"),
        location: "Miami Yacht & Biscayne Bay",
        capacity: 80,
        ticketPrice: "395.00",
        imageUrl: "https://images.unsplash.com/photo-1567662378494-47b22a2ae96a?w=800",
        hostId: createdUsers.find(u => u.username === "yacht_owner_1")?.id,
        isActive: true
      },
      {
        title: "Summer Regatta Weekend",
        description: "Annual summer regatta featuring competitive sailing, luxury yacht exhibitions, and celebration parties. Multi-day event with accommodations on participating yachts.",
        startTime: new Date("2025-08-12T09:00:00Z"),
        endTime: new Date("2025-08-14T18:00:00Z"),
        location: "Biscayne Bay Racing Circuit",
        capacity: 200,
        ticketPrice: "1250.00",
        imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Wellness & Spa Retreat",
        description: "Rejuvenating wellness weekend featuring onboard spa treatments, yoga sessions, healthy gourmet cuisine, and meditation workshops in a serene marine environment.",
        startTime: new Date("2025-07-31T10:00:00Z"),
        endTime: new Date("2025-08-01T16:00:00Z"),
        location: "Key Biscayne Anchorage",
        capacity: 40,
        ticketPrice: "850.00",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        hostId: createdUsers.find(u => u.username === "spa_provider")?.id,
        isActive: true
      },
      {
        title: "Culinary Excellence Series",
        description: "Monthly culinary event featuring guest celebrity chefs, wine pairings, and interactive cooking demonstrations aboard our luxury fleet.",
        startTime: new Date("2025-08-20T18:30:00Z"),
        endTime: new Date("2025-08-20T22:30:00Z"),
        location: "Star Island Marina",
        capacity: 60,
        ticketPrice: "425.00",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        hostId: createdUsers.find(u => u.username === "chef_service")?.id,
        isActive: true
      },
      {
        title: "New Member Welcome Reception",
        description: "Exclusive welcome event for new club members featuring club orientation, networking opportunities, and introductions to premium services and amenities.",
        startTime: new Date("2025-07-10T17:00:00Z"),
        endTime: new Date("2025-07-10T20:00:00Z"),
        location: "Miami Beach Marina",
        capacity: 75,
        ticketPrice: "125.00",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        hostId: createdUsers.find(u => u.username === "demo_member")?.id,
        isActive: true
      },
      {
        title: "Photography & Social Media Workshop",
        description: "Learn professional yacht photography techniques and social media best practices from industry experts. Includes hands-on sessions and portfolio development.",
        startTime: new Date("2025-08-25T14:00:00Z"),
        endTime: new Date("2025-08-25T17:00:00Z"),
        location: "Bayfront Marina",
        capacity: 25,
        ticketPrice: "195.00",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        hostId: createdUsers.find(u => u.username === "entertainment_provider")?.id,
        isActive: true
      },
      {
        title: "Annual Charity Auction Gala",
        description: "Premier charity fundraising event featuring luxury auction items, celebrity appearances, and exclusive experiences. All proceeds support marine conservation efforts.",
        startTime: new Date("2025-09-15T19:00:00Z"),
        endTime: new Date("2025-09-16T00:00:00Z"),
        location: "Fisher Island Club",
        capacity: 150,
        ticketPrice: "500.00",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      }
    ];

    const createdEvents = await db.insert(events).values(eventData).returning();
    console.log(`✅ Created ${createdEvents.length} exclusive events`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("Login credentials:");
    console.log("- admin / password (Admin Dashboard)");
    console.log("- demo_member / password (Member Dashboard)");
    console.log("- demo_owner / password (Yacht Owner Dashboard)");
    console.log("- demo_provider / password (Service Provider Dashboard)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}