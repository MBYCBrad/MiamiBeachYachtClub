import { db } from "./db";
import { users } from "@shared/schema";
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
      console.log("✅ Database already seeded with users");
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
    console.log("Login credentials:");
    console.log("- admin / password (Admin Dashboard)");
    console.log("- demo_member / password (Member Dashboard)");
    console.log("- demo_owner / password (Yacht Owner Dashboard)");
    console.log("- demo_provider / password (Service Provider Dashboard)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}