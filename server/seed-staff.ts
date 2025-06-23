import { dbStorage } from './storage';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedStaffMembers() {
  console.log('🏢 Adding staff members for crew management...');
  
  // Get admin user to set as creator
  const adminUsers = await dbStorage.getAllUsers();
  const admin = adminUsers.find(u => u.role === 'admin');
  const adminId = admin?.id || 60;

  const staffMembers = [
    // Maritime Operations Staff - Captains
    {
      username: 'captain_rodriguez',
      email: 'captain.rodriguez@mbyc.com',
      password: await hashPassword('password'),
      role: 'Yacht Captain',
      permissions: ['Yacht Management', 'Crew Management', 'Booking Management'],
      createdBy: adminId,
      phone: '+1-305-555-0101',
      location: 'Miami Marina',
      status: 'active' as const
    },
    {
      username: 'captain_martinez',
      email: 'captain.martinez@mbyc.com', 
      password: await hashPassword('password'),
      role: 'Yacht Captain',
      permissions: ['Yacht Management', 'Crew Management', 'Booking Management'],
      createdBy: adminId,
      phone: '+1-305-555-0102',
      location: 'Bay Harbor Marina',
      status: 'active' as const
    },
    
    // Fleet Coordinators
    {
      username: 'fleet_coordinator_smith',
      email: 'fleet.smith@mbyc.com',
      password: await hashPassword('password'),
      role: 'Fleet Coordinator',
      permissions: ['Yacht Management', 'Booking Management', 'Analytics Access'],
      createdBy: adminId,
      phone: '+1-305-555-0103',
      location: 'Central Operations',
      status: 'active' as const
    },
    {
      username: 'marina_manager_jones',
      email: 'marina.jones@mbyc.com',
      password: await hashPassword('password'),
      role: 'Marina Manager',
      permissions: ['Yacht Management', 'Crew Management', 'Operations'],
      createdBy: adminId,
      phone: '+1-305-555-0104',
      location: 'Miami Marina',
      status: 'active' as const
    },

    // Service Coordinators
    {
      username: 'service_coord_wilson',
      email: 'service.wilson@mbyc.com',
      password: await hashPassword('password'),
      role: 'Service Coordinator',
      permissions: ['Service Management', 'Booking Management', 'Customer Service'],
      createdBy: adminId,
      phone: '+1-305-555-0105',
      location: 'Service Center',
      status: 'active' as const
    },
    {
      username: 'concierge_manager_davis',
      email: 'concierge.davis@mbyc.com',
      password: await hashPassword('password'),
      role: 'Concierge Manager',
      permissions: ['Service Management', 'Customer Service', 'Event Management'],
      createdBy: adminId,
      phone: '+1-305-555-0106',
      location: 'Member Services',
      status: 'active' as const
    },
    {
      username: 'operations_manager_brown',
      email: 'ops.brown@mbyc.com',
      password: await hashPassword('password'),
      role: 'Operations Manager',
      permissions: ['Booking Management', 'Crew Management', 'Analytics Access'],
      createdBy: adminId,
      phone: '+1-305-555-0107',
      location: 'Operations Center',
      status: 'active' as const
    },
    {
      username: 'member_relations_garcia',
      email: 'relations.garcia@mbyc.com',
      password: await hashPassword('password'),
      role: 'Member Relations Specialist',
      permissions: ['Customer Service', 'User Management', 'Event Management'],
      createdBy: adminId,
      phone: '+1-305-555-0108',
      location: 'Member Services',
      status: 'active' as const
    },

    // Additional Crew Members
    {
      username: 'first_mate_johnson',
      email: 'mate.johnson@mbyc.com',
      password: await hashPassword('password'),
      role: 'First Mate',
      permissions: ['Crew Management'],
      createdBy: adminId,
      phone: '+1-305-555-0109',
      location: 'Miami Marina',
      status: 'active' as const
    },
    {
      username: 'dock_master_taylor',
      email: 'dock.taylor@mbyc.com',
      password: await hashPassword('password'),
      role: 'Dock Master',
      permissions: ['Yacht Management'],
      createdBy: adminId,
      phone: '+1-305-555-0110',
      location: 'Marina Dock',
      status: 'active' as const
    },
    {
      username: 'safety_officer_lee',
      email: 'safety.lee@mbyc.com',
      password: await hashPassword('password'),
      role: 'Safety Officer',
      permissions: ['Crew Management', 'Operations'],
      createdBy: adminId,
      phone: '+1-305-555-0111',
      location: 'Safety Department',
      status: 'active' as const
    },
    {
      username: 'guest_services_white',
      email: 'guest.white@mbyc.com',
      password: await hashPassword('password'),
      role: 'Guest Services Representative',
      permissions: ['Customer Service', 'Event Management'],
      createdBy: adminId,
      phone: '+1-305-555-0112',
      location: 'Guest Services',
      status: 'active' as const
    }
  ];

  // Create staff members
  for (const staffData of staffMembers) {
    try {
      await dbStorage.createStaffUser(staffData);
      console.log(`✅ Created staff member: ${staffData.username} (${staffData.role})`);
    } catch (error) {
      console.log(`⚠️  Staff member ${staffData.username} may already exist`);
    }
  }

  console.log('🏢 Staff member seeding completed');
}

// Run if called directly
if (require.main === module) {
  seedStaffMembers().catch(console.error);
}