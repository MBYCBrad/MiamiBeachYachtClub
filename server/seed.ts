import { db } from "./db";
import { users, yachts, services, events, reviews } from "@shared/schema";
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
    // Clear existing data
    await db.delete(reviews);
    await db.delete(events);
    await db.delete(services);
    await db.delete(yachts);
    await db.delete(users);

    // Create users with different roles and membership tiers
    const hashedPassword = await hashPassword("password123");
    
    const userData = [
      {
        username: "admin",
        email: "admin@mbyc.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "sophia_martinez",
        email: "sophia@luxurylifestyle.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "james_harrison",
        email: "james@harrisonyachts.com",
        password: hashedPassword,
        role: UserRole.YACHT_OWNER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "elena_rodriguez",
        email: "elena@oceanservices.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.SILVER
      },
      {
        username: "michael_chen",
        email: "michael@techcorp.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.GOLD
      },
      {
        username: "isabella_wright",
        email: "isabella@wrightfamily.com",
        password: hashedPassword,
        role: UserRole.MEMBER,
        membershipTier: MembershipTier.PLATINUM
      },
      {
        username: "captain_anderson",
        email: "captain@mbyc.com",
        password: hashedPassword,
        role: UserRole.SERVICE_PROVIDER,
        membershipTier: MembershipTier.GOLD
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create luxury yachts
    const yachtData = [
      {
        ownerId: createdUsers.find(u => u.username === "james_harrison")?.id,
        name: "Serenity Princess",
        size: 120,
        capacity: 12,
        description: "A magnificent 120-foot luxury yacht featuring state-of-the-art amenities, spacious decks, and elegant interior design. Perfect for hosting exclusive events and intimate gatherings.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        location: "Miami Beach Marina",
        amenities: ["Jacuzzi", "Sun Deck", "Master Suite", "Chef's Kitchen", "Entertainment System", "Water Sports Equipment"],
        pricePerHour: "850.00",
        isAvailable: true
      },
      {
        ownerId: createdUsers.find(u => u.username === "isabella_wright")?.id,
        name: "Ocean Majesty",
        size: 95,
        capacity: 10,
        description: "An exquisite 95-foot yacht offering unparalleled luxury and comfort. Features panoramic ocean views and premium amenities for the ultimate maritime experience.",
        imageUrl: "https://images.unsplash.com/photo-1572126735628-6c8ec627b09e?w=800",
        location: "Star Island Marina",
        amenities: ["Sky Lounge", "Wine Cellar", "Infinity Pool", "Helipad", "Spa", "Gym"],
        pricePerHour: "675.00",
        isAvailable: true
      },
      {
        ownerId: createdUsers.find(u => u.username === "michael_chen")?.id,
        name: "Azure Dreams",
        size: 75,
        capacity: 8,
        description: "A sleek 75-foot modern yacht with contemporary design and cutting-edge technology. Ideal for day trips and sunset cruises around Miami's coastline.",
        imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800",
        location: "Bayfront Marina",
        amenities: ["Smart Home System", "Gourmet Kitchen", "Outdoor Bar", "Diving Platform", "Sound System"],
        pricePerHour: "425.00",
        isAvailable: true
      },
      {
        ownerId: createdUsers.find(u => u.username === "sophia_martinez")?.id,
        name: "Platinum Wave",
        size: 140,
        capacity: 16,
        description: "The crown jewel of our fleet - a 140-foot superyacht featuring world-class amenities and unmatched elegance. Perfect for large celebrations and corporate events.",
        imageUrl: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800",
        location: "Fisher Island Marina",
        amenities: ["Grand Ballroom", "Cinema", "Beach Club", "Multiple Jacuzzis", "Tender Garage", "Full Crew"],
        pricePerHour: "1200.00",
        isAvailable: true
      },
      {
        ownerId: createdUsers.find(u => u.username === "james_harrison")?.id,
        name: "Emerald Escape",
        size: 65,
        capacity: 6,
        description: "An intimate 65-foot yacht perfect for romantic getaways and small family adventures. Features elegant interiors and modern conveniences.",
        imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800",
        location: "Key Biscayne Marina",
        amenities: ["Private Master Suite", "Cozy Lounge", "Fishing Equipment", "Kayaks", "Snorkeling Gear"],
        pricePerHour: "320.00",
        isAvailable: true
      }
    ];

    const createdYachts = await db.insert(yachts).values(yachtData).returning();
    console.log(`✅ Created ${createdYachts.length} luxury yachts`);

    // Create premium services
    const serviceData = [
      {
        providerId: createdUsers.find(u => u.username === "elena_rodriguez")?.id,
        name: "Executive Chef Service",
        category: "Catering",
        description: "World-class culinary experiences featuring Michelin-starred chefs specializing in Mediterranean and contemporary cuisine. Custom menus available for any occasion.",
        price: "300.00",
        duration: 4,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        isAvailable: true
      },
      {
        providerId: createdUsers.find(u => u.username === "captain_anderson")?.id,
        name: "Professional Captain Service",
        category: "Navigation",
        description: "Certified maritime professionals with decades of experience navigating Miami waters. Ensure safe and memorable journeys with expert local knowledge.",
        price: "200.00",
        duration: 8,
        imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800",
        isAvailable: true
      },
      {
        providerId: createdUsers.find(u => u.username === "elena_rodriguez")?.id,
        name: "Luxury Spa & Wellness",
        category: "Wellness",
        description: "Transform your yacht into a floating spa with certified massage therapists, aromatherapy, and premium wellness treatments.",
        price: "250.00",
        duration: 3,
        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
        isAvailable: true
      },
      {
        providerId: createdUsers.find(u => u.username === "captain_anderson")?.id,
        name: "Water Sports Adventure",
        category: "Recreation",
        description: "Complete water sports package including jet skis, diving equipment, parasailing, and professional instruction for all skill levels.",
        price: "180.00",
        duration: 4,
        imageUrl: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
        isAvailable: true
      },
      {
        providerId: createdUsers.find(u => u.username === "elena_rodriguez")?.id,
        name: "Event Planning & Coordination",
        category: "Events",
        description: "Full-service event planning for weddings, corporate gatherings, and celebrations. From intimate dinners to grand celebrations.",
        price: "400.00",
        duration: 6,
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        isAvailable: true
      },
      {
        providerId: createdUsers.find(u => u.username === "captain_anderson")?.id,
        name: "Sunset Photography Session",
        category: "Photography",
        description: "Professional yacht photography capturing your special moments against Miami's stunning skyline and golden hour lighting.",
        price: "350.00",
        duration: 2,
        imageUrl: "https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=800",
        isAvailable: true
      }
    ];

    const createdServices = await db.insert(services).values(serviceData).returning();
    console.log(`✅ Created ${createdServices.length} premium services`);

    // Create exclusive events
    const eventData = [
      {
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        name: "Miami Yacht Week Gala",
        description: "The most prestigious yacht club event of the year featuring live entertainment, gourmet dining, and networking with Miami's elite. Black-tie attire required.",
        startDate: new Date("2025-07-15T19:00:00Z"),
        endDate: new Date("2025-07-15T23:00:00Z"),
        location: "MBYC Grand Ballroom & Marina",
        capacity: 200,
        ticketPrice: "450.00",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        category: "Gala"
      },
      {
        hostId: createdUsers.find(u => u.username === "sophia_martinez")?.id,
        name: "Sunset Wine Tasting Cruise",
        description: "An elegant evening aboard our luxury fleet featuring premium wines from renowned vineyards, paired with artisanal canapés and panoramic sunset views.",
        startDate: new Date("2025-06-28T17:30:00Z"),
        endDate: new Date("2025-06-28T21:00:00Z"),
        location: "Departing from Miami Beach Marina",
        capacity: 50,
        ticketPrice: "195.00",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        category: "Wine Tasting"
      },
      {
        hostId: createdUsers.find(u => u.username === "michael_chen")?.id,
        name: "Tech Innovators Yacht Mixer",
        description: "Connect with Miami's leading tech entrepreneurs and innovators in an exclusive maritime setting. Features keynote speakers and startup showcases.",
        startDate: new Date("2025-07-08T18:00:00Z"),
        endDate: new Date("2025-07-08T22:00:00Z"),
        location: "Bayfront Marina - Private Fleet",
        capacity: 75,
        ticketPrice: "275.00",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        category: "Networking"
      },
      {
        hostId: createdUsers.find(u => u.username === "isabella_wright")?.id,
        name: "Art & Ocean Charity Auction",
        description: "Support marine conservation through art with this exclusive auction featuring works by renowned maritime artists. Proceeds benefit ocean preservation.",
        startDate: new Date("2025-08-12T16:00:00Z"),
        endDate: new Date("2025-08-12T20:00:00Z"),
        location: "Star Island Marina - Art Pavilion",
        capacity: 120,
        ticketPrice: "350.00",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        category: "Charity"
      },
      {
        hostId: createdUsers.find(u => u.username === "james_harrison")?.id,
        name: "Midsummer Regatta Championships",
        description: "Annual yacht racing competition featuring the finest vessels and most skilled sailors in South Florida. Spectator packages include premium viewing and dining.",
        startDate: new Date("2025-07-21T09:00:00Z"),
        endDate: new Date("2025-07-21T17:00:00Z"),
        location: "Biscayne Bay Racing Circuit",
        capacity: 300,
        ticketPrice: "125.00",
        imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
        category: "Racing"
      }
    ];

    const createdEvents = await db.insert(events).values(eventData).returning();
    console.log(`✅ Created ${createdEvents.length} exclusive events`);

    // Create reviews for services and yachts
    const reviewData = [
      {
        userId: createdUsers.find(u => u.username === "sophia_martinez")?.id,
        serviceId: createdServices.find(s => s.name === "Executive Chef Service")?.id,
        rating: 5,
        comment: "Absolutely extraordinary culinary experience! The chef created a Mediterranean feast that exceeded all expectations. Every course was perfectly executed and beautifully presented."
      },
      {
        userId: createdUsers.find(u => u.username === "michael_chen")?.id,
        yachtId: createdYachts.find(y => y.name === "Serenity Princess")?.id,
        rating: 5,
        comment: "The Serenity Princess is truly magnificent. The amenities are world-class and the crew provided impeccable service throughout our corporate event. Highly recommended!"
      },
      {
        userId: createdUsers.find(u => u.username === "isabella_wright")?.id,
        serviceId: createdServices.find(s => s.name === "Luxury Spa & Wellness")?.id,
        rating: 5,
        comment: "What a unique and relaxing experience! Having a spa treatment while cruising the beautiful Miami coastline was absolutely magical. The therapists were professional and skilled."
      },
      {
        userId: createdUsers.find(u => u.username === "james_harrison")?.id,
        yachtId: createdYachts.find(y => y.name === "Ocean Majesty")?.id,
        rating: 4,
        comment: "Beautiful yacht with stunning views. The sky lounge and infinity pool were highlights. Minor suggestions for improvement in the sound system, but overall excellent experience."
      },
      {
        userId: createdUsers.find(u => u.username === "sophia_martinez")?.id,
        serviceId: createdServices.find(s => s.name === "Water Sports Adventure")?.id,
        rating: 5,
        comment: "Incredible water sports package! The instructors were knowledgeable and safety-focused. Jet skiing and parasailing were the highlights of our day. Perfect for adventure seekers!"
      }
    ];

    const createdReviews = await db.insert(reviews).values(reviewData).returning();
    console.log(`✅ Created ${createdReviews.length} authentic reviews`);

    console.log("🎉 Miami Beach Yacht Club database seeding completed successfully!");
    console.log("🔐 Default login credentials:");
    console.log("   Admin: admin / password123");
    console.log("   Member: sophia_martinez / password123");
    console.log("   Yacht Owner: james_harrison / password123");
    console.log("   Service Provider: elena_rodriguez / password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}