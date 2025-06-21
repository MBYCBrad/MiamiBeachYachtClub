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
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "demo_owner",
        email: "owner@mbyc.com",
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
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // Create luxury yachts
    const yachtData = [
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
      }
    ];

    const createdYachts = await db.insert(yachts).values(yachtData).returning();
    console.log(`✅ Created ${createdYachts.length} luxury yachts`);

    // Create premium services
    const serviceData = [
      {
        name: "Executive Chef Service",
        description: "World-class culinary experiences featuring Michelin-starred chefs who create personalized gourmet menus using the finest ingredients.",
        category: "Culinary",
        pricePerSession: "850.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 127
      },
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
        name: "Luxury Event Planning",
        description: "Exclusive event coordination for yacht parties, corporate gatherings, and special celebrations with premium vendors and personalized service.",
        category: "Events",
        pricePerSession: "1250.00",
        duration: 8,
        providerId: createdUsers.find(u => u.username === "admin")?.id,
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        isAvailable: true,
        rating: "5.0",
        reviewCount: 156
      }
    ];

    const createdServices = await db.insert(services).values(serviceData).returning();
    console.log(`✅ Created ${createdServices.length} premium services`);

    // Create exclusive events
    const eventData = [
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