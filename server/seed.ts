import { db } from "./db";
import { users, yachts, services, events, bookings, serviceBookings, eventRegistrations, reviews, mediaAssets, messages, favorites, crewMembers, crewAssignments } from "@shared/schema";
import { UserRole, MembershipTier } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createEventsData(createdUsers: any[]) {
  // Create exclusive MBYC member-only fleet parties
  const eventData = [
    // Monthly Member Group Yacht Parties - All 6 Yachts Together
    {
      title: "White Party Marina Social - All Fleet Event",
      description: "The ultimate MBYC member experience! All 6 yachts line up together in the marina for an exclusive white-themed party. Members move freely between Marina Breeze, Ocean Paradise, Sunset Dreams, Luxury Escape, Sea Goddess, and Captain's Choice. Features synchronized music, floating walkways between yachts, premium open bars on each vessel, and gourmet food stations. Dress code: All white attire required.",
      startTime: new Date("2025-07-26T17:00:00Z"),
      endTime: new Date("2025-07-26T23:00:00Z"),
      location: "MBYC Marina - All 6 Yachts Formation",
      capacity: 180,
      ticketPrice: "295.00",
      imageUrl: "/api/media/pexels-mali-42091_1750537294323.jpg",
      hostId: createdUsers.find(u => u.username === "admin")?.id,
      isActive: true
    },
    {
      title: "Tropical Sunset Fleet Party",
      description: "Monthly tropical-themed celebration with all MBYC yachts anchored together in formation. Members enjoy island-inspired cocktails, Caribbean cuisine, steel drum bands, and limbo contests across the entire fleet. Each yacht features different tropical experiences: tiki bars, reggae music, Hawaiian luau games, and sunset yoga sessions. Complimentary lei greeting and tropical attire encouraged.",
      startTime: new Date("2025-08-16T16:30:00Z"),
      endTime: new Date("2025-08-16T22:30:00Z"),
      location: "MBYC Marina - Full Fleet Formation",
      capacity: 180,
      ticketPrice: "265.00",
      imageUrl: "/api/media/pexels-mali-42092_1750537277229.jpg",
      hostId: createdUsers.find(u => u.username === "admin")?.id,
      isActive: true
    },
    {
      title: "Masquerade Mystery Night - Fleet Social",
      description: "Elegant masquerade ball spanning all 6 yachts with interactive mystery game. Members receive clues leading them between vessels while enjoying champagne, classical music, and gourmet hors d'oeuvres. Professional actors create an immersive mystery experience as members network and solve puzzles across the entire fleet. Venetian masks provided, formal attire required.",
      startTime: new Date("2025-09-13T19:00:00Z"),
      endTime: new Date("2025-09-14T01:00:00Z"),
      location: "MBYC Marina - All Yachts Connected",
      capacity: 180,
      ticketPrice: "385.00",
      imageUrl: "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
      hostId: createdUsers.find(u => u.username === "admin")?.id,
      isActive: true
    },
    {
      title: "Oktoberfest on the Water - Fleet Celebration",
      description: "Bavarian-themed party across all MBYC yachts with authentic German beer, bratwurst, pretzels, and live polka music. Each yacht represents a different German region with specialized food and beer selections. Members participate in yacht-to-yacht beer pong tournaments, traditional folk dancing, and lederhosen contests. Traditional German attire encouraged, authentic beer steins provided.",
      startTime: new Date("2025-10-11T15:00:00Z"),
      endTime: new Date("2025-10-11T21:00:00Z"),
      location: "MBYC Marina - Oktoberfest Fleet Setup",
      capacity: 180,
      ticketPrice: "225.00",
      imageUrl: "/api/media/pexels-pixabay-163236_1750537277230.jpg",
      hostId: createdUsers.find(u => u.username === "admin")?.id,
      isActive: true
    },
    {
      title: "Premium Water Sports Package",
      description: "Elevate your yacht charter with our exclusive water sports collection: jet skis, paddleboards, snorkeling gear, floating loungers, and professional instruction. Includes waterproof camera rental, towel service, and safety equipment. Add dolphin watching excursion to encounter Miami's resident dolphin pods in their natural habitat.",
      startTime: new Date("2025-07-25T11:00:00Z"),
      endTime: new Date("2025-07-25T16:00:00Z"),
      location: "Add-On to Any Yacht Charter",
      capacity: 10,
      ticketPrice: "385.00",
      imageUrl: "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
      hostId: createdUsers.find(u => u.username === "demo_provider")?.id,
      isActive: true
    },
    {
      title: "Onboard Spa & Wellness Experience",
      description: "Transform your yacht into a floating spa sanctuary. Professional massage therapists provide couples massages, aromatherapy treatments, and guided meditation sessions on deck. Includes premium organic spa products, healthy superfood smoothies, yoga mats, and ambient music curation. Ideal for wellness retreats or romantic getaways.",
      startTime: new Date("2025-08-01T14:00:00Z"),
      endTime: new Date("2025-08-01T18:00:00Z"),
      location: "Add-On to Any Yacht Charter",
      capacity: 6,
      ticketPrice: "575.00",
      imageUrl: "/api/media/pexels-pixabay-163236_1750537277230.jpg",
      hostId: createdUsers.find(u => u.username === "spa_provider")?.id,
      isActive: true
    },
    {
      title: "Live Music & Entertainment Package",
      description: "Bring world-class entertainment aboard your charter with our curated musicians: acoustic guitarist for intimate moments, saxophone player for sunset cocktails, or full jazz trio for sophisticated gatherings. Includes premium sound system setup, wireless microphones, and song requests. Perfect for celebrations, corporate events, or romantic evenings.",
      startTime: new Date("2025-08-08T17:00:00Z"),
      endTime: new Date("2025-08-08T22:00:00Z"),
      location: "Add-On to Any Yacht Charter",
      capacity: 20,
      ticketPrice: "750.00",
      imageUrl: "/api/media/pexels-mali-42091_1750537294323.jpg",
      hostId: createdUsers.find(u => u.username === "demo_provider")?.id,
      isActive: true
    },
    {
      title: "Gourmet Picnic & Island Exploration",
      description: "Combine your yacht charter with an exclusive island adventure. We anchor at secluded sandbar or private beach while our team sets up a luxury picnic with gourmet sandwiches, fresh fruit platters, premium cheeses, and chilled rosé. Includes beach games, snorkeling equipment, and professional photography of your island experience.",
      startTime: new Date("2025-08-12T12:00:00Z"),
      endTime: new Date("2025-08-12T17:00:00Z"),
      location: "Private Islands & Sandbars",
      capacity: 15,
      ticketPrice: "445.00",
      imageUrl: "/api/media/pexels-mali-42092_1750537277229.jpg",
      hostId: createdUsers.find(u => u.username === "chef_service")?.id,
      isActive: true
    },
    {
      title: "Celebration & Party Enhancement",
      description: "Turn your yacht charter into an unforgettable celebration with professional party planning, custom decorations matching your theme, premium bar service with signature cocktails, party games, and DJ services. Includes balloon arrangements, custom cake service, and special occasion photography. Perfect for birthdays, bachelorette parties, or milestone celebrations.",
      startTime: new Date("2025-08-18T15:00:00Z"),
      endTime: new Date("2025-08-18T21:00:00Z"),
      location: "Add-On to Any Yacht Charter",
      capacity: 25,
      ticketPrice: "695.00",
      imageUrl: "/api/media/pexels-diego-f-parra-33199-843633%20(1)_1750537277228.jpg",
      hostId: createdUsers.find(u => u.username === "demo_provider")?.id,
      isActive: true
    }
  ];

  const createdEvents = await db.insert(events).values(eventData).returning();
  console.log(`✅ Created ${createdEvents.length} exclusive yacht experiences`);
}

export async function seedDatabase() {
  console.log("🌊 Seeding Miami Beach Yacht Club database...");

  try {
    // Check if database is already seeded
    const existingUsers = await db.select().from(users).limit(1);
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

    // Create comprehensive yacht concierge services across all categories
    const serviceData = [
      // Beauty & Grooming Services
      {
        name: "Onboard Hair Styling & Cuts",
        description: "Professional hair styling, cuts, and color services delivered directly to your yacht by celebrity stylists with premium salon equipment.",
        category: "Beauty & Grooming",
        pricePerSession: "350.00",
        duration: 2,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 156
      },
      {
        name: "Professional Makeup Artist",
        description: "Expert makeup application for special events, photo shoots, or evening occasions using premium cosmetics and techniques.",
        category: "Beauty & Grooming", 
        pricePerSession: "285.00",
        duration: 2,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 98
      },
      {
        name: "Luxury Nail Services",
        description: "Complete manicure and pedicure services with premium products, nail art, gel applications, and spa treatments onboard.",
        category: "Beauty & Grooming",
        pricePerSession: "195.00", 
        duration: 2,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 142
      },

      // Culinary Services
      {
        name: "Executive Chef Service",
        description: "World-class private chefs offering personalized culinary experiences with premium ingredients and exquisite presentation for yacht dining.",
        category: "Culinary",
        pricePerSession: "850.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "chef_service")?.id,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 234
      },
      {
        name: "Gourmet Prepared Meals",
        description: "Pre-prepared gourmet meals designed by Michelin-starred chefs, delivered fresh to your yacht with premium packaging.",
        category: "Culinary",
        pricePerSession: "450.00",
        duration: 1,
        providerId: createdUsers.find(u => u.username === "chef_service")?.id,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800",
        isAvailable: true,
        rating: "4.8", 
        reviewCount: 187
      },
      {
        name: "Premium Catering Service",
        description: "Complete catering solutions for yacht events with professional staff, premium ingredients, and custom menus for any occasion.",
        category: "Culinary",
        pricePerSession: "750.00",
        duration: 6,
        providerId: createdUsers.find(u => u.username === "chef_service")?.id,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 203
      },

      // Wellness & Spa Services
      {
        name: "Therapeutic Massage Therapy",
        description: "Professional massage services including Swedish, deep tissue, and hot stone treatments delivered directly to your yacht.",
        category: "Wellness & Spa",
        pricePerSession: "385.00",
        duration: 2,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 324
      },
      {
        name: "Luxury Spa Treatments",
        description: "Full-service spa treatments including facials, body wraps, aromatherapy, and rejuvenation packages onboard.",
        category: "Wellness & Spa",
        pricePerSession: "485.00",
        duration: 3,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 267
      },
      {
        name: "Personal Training & Fitness",
        description: "Certified personal trainers providing customized fitness programs, yoga, and wellness coaching on deck.",
        category: "Wellness & Spa",
        pricePerSession: "295.00",
        duration: 1,
        providerId: createdUsers.find(u => u.username === "spa_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 145
      },

      // Photography & Videography
      {
        name: "Professional Yacht Photography",
        description: "Expert photographers capturing luxury yacht experiences, events, and lifestyle moments with premium equipment.",
        category: "Photography & Media",
        pricePerSession: "650.00",
        duration: 3,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1554048612-b6a482b22e62?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 178
      },
      {
        name: "Cinematic Videography Services",
        description: "Professional videography for yacht events, luxury lifestyle content, and promotional materials with 4K quality.",
        category: "Photography & Media",
        pricePerSession: "850.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 134
      },

      // Entertainment Services
      {
        name: "Private DJ & Music Services",
        description: "Professional DJs and live music entertainment for yacht parties and special events with premium sound systems.",
        category: "Entertainment",
        pricePerSession: "750.00",
        duration: 6,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 167
      },
      {
        name: "Live Band Performance",
        description: "Professional musicians and bands providing live entertainment for yacht events and celebrations.",
        category: "Entertainment",
        pricePerSession: "1250.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 89
      },

      // Water Sports & Activities
      {
        name: "Water Sports Equipment & Instruction",
        description: "Complete water sports services including jet ski rentals, paddleboarding, snorkeling gear, and professional instruction.",
        category: "Water Sports",
        pricePerSession: "425.00",
        duration: 3,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 203
      },
      {
        name: "Diving & Snorkeling Excursions",
        description: "Guided diving and snorkeling tours with professional instructors, equipment rental, and underwater photography.",
        category: "Water Sports",
        pricePerSession: "650.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 156
      },



      // Concierge & Lifestyle Services  
      {
        name: "Personal Concierge Service",
        description: "Dedicated concierge for restaurant reservations, entertainment booking, shopping, and exclusive access arrangements.",
        category: "Concierge & Lifestyle",
        pricePerSession: "425.00",
        duration: 4,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 256
      },
      {
        name: "Yacht Provisioning Service",
        description: "Complete provisioning with premium groceries, beverages, linens, and amenities stocked before your arrival.",
        category: "Concierge & Lifestyle",
        pricePerSession: "350.00",
        duration: 2,
        providerId: createdUsers.find(u => u.username === "demo_provider")?.id,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 189
      }
    ];

    const createdServices = await db.insert(services).values(serviceData).returning();
    console.log(`✅ Created ${createdServices.length} premium services`);

    // Create exclusive MBYC member-only yacht rental add-on experiences
    const eventData = [
      // Yacht Charter Add-On Experiences
      {
        title: "Private Chef Dinner Party Add-On",
        description: "Transform your yacht charter into a Michelin-starred dining experience. Our executive chef creates a personalized 7-course tasting menu featuring locally-sourced ingredients, premium wagyu beef, fresh lobster, and curated wine pairings. Perfect for intimate celebrations, anniversaries, or impressing business clients during your charter.",
        startTime: new Date("2025-07-15T19:00:00Z"),
        endTime: new Date("2025-07-15T23:00:00Z"),
        location: "Add-On to Any Yacht Charter",
        capacity: 12,
        ticketPrice: "485.00",
        imageUrl: "/api/media/pexels-goumbik-296278_1750537277229.jpg",
        hostId: createdUsers.find(u => u.username === "chef_service")?.id,
        isActive: true
      },
      {
        title: "Sunset Photography Session Add-On",
        description: "Capture magical moments during your yacht charter with our professional photographer specializing in luxury lifestyle and yacht photography. Includes 2-hour session during golden hour, 50+ edited high-resolution images, same-day preview gallery, and complimentary champagne service while shooting. Perfect for proposals, family portraits, or social media content.",
        startTime: new Date("2025-07-20T18:30:00Z"),
        endTime: new Date("2025-07-20T20:30:00Z"),
        location: "Add-On to Any Yacht Charter",
        capacity: 8,
        ticketPrice: "650.00",
        imageUrl: "/api/media/pexels-diego-f-parra-33199-843633%20(1)_1750537277228.jpg",
        hostId: createdUsers.find(u => u.username === "demo_provider")?.id,
        isActive: true
      },
      
      // Monthly Member Group Yacht Parties - All 6 Yachts Together
      {
        title: "White Party Marina Social - All Fleet Event",
        description: "The ultimate MBYC member experience! All 6 yachts line up together in the marina for an exclusive white-themed party. Members move freely between Marina Breeze, Ocean Paradise, Sunset Dreams, Luxury Escape, Sea Goddess, and Captain's Choice. Features synchronized music, floating walkways between yachts, premium open bars on each vessel, and gourmet food stations. Dress code: All white attire required.",
        startTime: new Date("2025-07-26T17:00:00Z"),
        endTime: new Date("2025-07-26T23:00:00Z"),
        location: "MBYC Marina - All 6 Yachts Formation",
        capacity: 180,
        ticketPrice: "295.00",
        imageUrl: "/api/media/pexels-mali-42091_1750537294323.jpg",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Tropical Sunset Fleet Party",
        description: "Monthly tropical-themed celebration with all MBYC yachts anchored together in formation. Members enjoy island-inspired cocktails, Caribbean cuisine, steel drum bands, and limbo contests across the entire fleet. Each yacht features different tropical experiences: tiki bars, reggae music, Hawaiian luau games, and sunset yoga sessions. Complimentary lei greeting and tropical attire encouraged.",
        startTime: new Date("2025-08-16T16:30:00Z"),
        endTime: new Date("2025-08-16T22:30:00Z"),
        location: "MBYC Marina - Full Fleet Formation",
        capacity: 180,
        ticketPrice: "265.00",
        imageUrl: "/api/media/pexels-mali-42092_1750537277229.jpg",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Masquerade Mystery Night - Fleet Social",
        description: "Elegant masquerade ball spanning all 6 yachts with interactive mystery game. Members receive clues leading them between vessels while enjoying champagne, classical music, and gourmet hors d'oeuvres. Professional actors create an immersive mystery experience as members network and solve puzzles across the entire fleet. Venetian masks provided, formal attire required.",
        startTime: new Date("2025-09-13T19:00:00Z"),
        endTime: new Date("2025-09-14T01:00:00Z"),
        location: "MBYC Marina - All Yachts Connected",
        capacity: 180,
        ticketPrice: "385.00",
        imageUrl: "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
        isActive: true
      },
      {
        title: "Oktoberfest on the Water - Fleet Celebration",
        description: "Bavarian-themed party across all MBYC yachts with authentic German beer, bratwurst, pretzels, and live polka music. Each yacht represents a different German region with specialized food and beer selections. Members participate in yacht-to-yacht beer pong tournaments, traditional folk dancing, and lederhosen contests. Traditional German attire encouraged, authentic beer steins provided.",
        startTime: new Date("2025-10-11T15:00:00Z"),
        endTime: new Date("2025-10-11T21:00:00Z"),
        location: "MBYC Marina - Oktoberfest Fleet Setup",
        capacity: 180,
        ticketPrice: "225.00",
        imageUrl: "/api/media/pexels-pixabay-163236_1750537277230.jpg",
        hostId: createdUsers.find(u => u.username === "admin")?.id,
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

    // Create crew member data for real-time database operations
    const crewData = [
      {
        name: "Captain Marcus Rodriguez",
        role: "Captain",
        specialization: "Luxury Yacht Operations",
        rating: "4.9",
        experience: 15,
        certifications: ["Master Mariner License", "STCW 95", "MCA Large Yacht Code"],
        availability: "available",
        phone: "+1-305-555-0101",
        email: "marcus.rodriguez@mbyc.com",
        languages: ["English", "Spanish", "Italian"],
        currentAssignment: null
      },
      {
        name: "First Mate Sarah Chen",
        role: "First Mate",
        specialization: "Navigation & Safety",
        rating: "4.8",
        experience: 8,
        certifications: ["OOW Yacht License", "STCW 95", "Advanced Firefighting"],
        availability: "available",
        phone: "+1-305-555-0102",
        email: "sarah.chen@mbyc.com",
        languages: ["English", "Mandarin"],
        currentAssignment: null
      },
      {
        name: "Chef Antoine Dubois",
        role: "Chef",
        specialization: "Fine Dining & Wine Pairing",
        rating: "4.9",
        experience: 12,
        certifications: ["Culinary Arts Degree", "Wine Sommelier", "Food Safety Certification"],
        availability: "assigned",
        phone: "+1-305-555-0103",
        email: "antoine.dubois@mbyc.com",
        languages: ["English", "French"],
        currentAssignment: "Marina Breeze - VIP Charter"
      },
      {
        name: "Stewardess Maria Santos",
        role: "Steward",
        specialization: "Guest Services & Hospitality",
        rating: "4.7",
        experience: 6,
        certifications: ["STCW 95", "Guest Relations Certificate", "Interior Management"],
        availability: "available",
        phone: "+1-305-555-0104",
        email: "maria.santos@mbyc.com",
        languages: ["English", "Spanish", "Portuguese"],
        currentAssignment: null
      },
      {
        name: "Deckhand James Wilson",
        role: "Deckhand",
        specialization: "Maintenance & Water Sports",
        rating: "4.6",
        experience: 4,
        certifications: ["STCW 95", "Water Sports Instructor", "Tender Operations"],
        availability: "available",
        phone: "+1-305-555-0105",
        email: "james.wilson@mbyc.com",
        languages: ["English"],
        currentAssignment: null
      },
      {
        name: "Captain Isabella Martinez",
        role: "Captain",
        specialization: "Charter Operations",
        rating: "4.8",
        experience: 11,
        certifications: ["Master Mariner License", "STCW 95", "Charter Operations"],
        availability: "assigned",
        phone: "+1-305-555-0106",
        email: "isabella.martinez@mbyc.com",
        languages: ["English", "Spanish"],
        currentAssignment: "Ocean Paradise - Corporate Event"
      }
    ];

    const createdCrewMembers = await db.insert(crewMembers).values(crewData).returning();
    console.log(`✅ Created ${createdCrewMembers.length} crew members for real-time operations`);

    // Create crew assignments for yacht bookings
    const assignmentData = [
      {
        id: "assignment_1",
        bookingId: createdBookings[0]?.id || 1,
        captainId: createdCrewMembers[0]?.id || 1,
        coordinatorId: createdCrewMembers[1]?.id || 2,
        crewMemberIds: [createdCrewMembers[2]?.id || 3, createdCrewMembers[3]?.id || 4],
        status: "assigned" as const,
        briefingTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        notes: "VIP charter service - ensure premium amenities are prepared"
      },
      {
        id: "assignment_2", 
        bookingId: createdBookings[1]?.id || 2,
        captainId: createdCrewMembers[5]?.id || 6,
        coordinatorId: createdCrewMembers[1]?.id || 2,
        crewMemberIds: [createdCrewMembers[4]?.id || 5],
        status: "planned" as const,
        briefingTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: "Corporate event - prepare conference setup and catering coordination"
      }
    ];

    const createdAssignments = await db.insert(crewAssignments).values(assignmentData).returning();
    console.log(`✅ Created ${createdAssignments.length} crew assignments for coordination`);

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