import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CalendarPage from "@/pages/calendar-page";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import YachtMaintenancePage from "@/pages/yacht-maintenance";
import CrewManagementPage from "./crew-management";
import AdminNotificationCenter from "@/components/AdminNotificationCenter";
import StaffManagement from "./staff-management";
import { 
  BarChart3, 
  Users, 
  Anchor, 
  CalendarDays, 
  Settings, 
  Shield,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Calendar,
  Star,
  DollarSign,
  Clock,
  MapPin,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Ship,
  Wrench,
  User,
  Sparkles,
  CreditCard,
  Filter,
  Eye,
  Edit,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface StaffMember {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  permissions: string[] | null;
  status: string;
  phone: string | null;
  location: string | null;
}

interface StaffStats {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  activeProjects: number;
}

// Staff portal menu items - mapped to actual database permissions
const allStaffMenuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500', permission: 'dashboard_access' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500', permission: 'bookings' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500', permission: 'bookings' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500', permission: 'customer_service' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500', permission: 'yachts' },
  { id: 'fleet', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500', permission: 'yachts' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500', permission: 'services' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500', permission: 'events' },
  { id: 'members', label: 'Members', icon: Users, color: 'from-green-500 to-emerald-500', permission: 'users' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500', permission: 'analytics' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-teal-500', permission: 'payments' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-yellow-500 to-amber-500', permission: 'notifications' },
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-indigo-500 to-blue-500', permission: 'crew_management' },
  { id: 'my-profile', label: 'My Profile', icon: User, color: 'from-purple-500 to-indigo-500', permission: 'profile_access' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500', permission: 'settings_access' },
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change !== null && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{change}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    </Card>
  </motion.div>
);

const ActivityCard = ({ activity, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color}`}>
      <activity.icon className="h-4 w-4 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{activity.title}</p>
      <p className="text-gray-400 text-sm">{activity.description}</p>
    </div>
    <span className="text-gray-400 text-sm">{activity.time}</span>
  </motion.div>
);

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current staff member details
  const { data: staffMember, isLoading: staffLoading } = useQuery<StaffMember>({
    queryKey: ['/api/staff/profile'],
    enabled: !!user && user.role === 'staff',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch staff statistics
  const { data: staffStats, isLoading: statsLoading } = useQuery<StaffStats>({
    queryKey: ['/api/staff/stats'],
    enabled: !!user && user.role === 'staff',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Filter menu items based on staff permissions
  const allowedMenuItems = allStaffMenuItems.filter(item => {
    // Always show overview and profile
    if (item.id === 'overview' || item.id === 'my-profile') return true;
    
    // If no permissions available, only show basic items
    if (!staffMember?.permissions) return false;
    
    // Check if user has the specific permission for this menu item
    return staffMember.permissions.includes(item.permission);
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSectionChange = (sectionId: string) => {
    if (sectionId === 'logout') {
      handleLogout();
      return;
    }
    setActiveSection(sectionId);
  };

  // Generate dynamic recent activities based on user permissions
  const generateRecentActivities = () => {
    const activities = [];
    const userPermissions = staffMember?.permissions || [];
    
    if (userPermissions.includes('bookings')) {
      activities.push({
        icon: Calendar,
        title: "VIP yacht booking coordinated",
        description: "Azure Elegance - Premium charter arrangement",
        time: "8 min ago",
        color: "from-blue-500 to-cyan-500"
      });
    }
    
    if (userPermissions.includes('services')) {
      activities.push({
        icon: Sparkles,
        title: "VIP concierge service completed",
        description: "Private chef dinner coordination finalized",
        time: "15 min ago",
        color: "from-purple-500 to-pink-500"
      });
    }
    
    if (userPermissions.includes('events')) {
      activities.push({
        icon: Star,
        title: "Exclusive event coordination",
        description: "Member celebration event planning",
        time: "22 min ago",
        color: "from-green-500 to-emerald-500"
      });
    }
    
    if (userPermissions.includes('yachts')) {
      activities.push({
        icon: Ship,
        title: "Fleet status coordination",
        description: "Marina Breeze readiness verification",
        time: "31 min ago",
        color: "from-amber-500 to-orange-500"
      });
    }
    
    // Ensure at least 3 activities for good UX
    if (activities.length < 3) {
      activities.push({
        icon: MessageSquare,
        title: "Member communication handled",
        description: "Premium support inquiry resolved",
        time: "45 min ago",
        color: "from-indigo-500 to-blue-500"
      });
    }
    
    return activities.slice(0, 4);
  };

  const recentActivities = generateRecentActivities();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Staff Portal
                </h1>
                <p className="text-sm text-gray-400">Miami Beach Yacht Club</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="w-64 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {staffMember?.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{staffMember?.fullName || 'Staff Member'}</p>
                <p className="text-xs text-gray-400">{staffMember?.role || 'Staff'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-64 bg-gray-950 border-r border-gray-800/50 min-h-screen sticky top-16"
            >
              <div className="p-6 space-y-2">
                {allowedMenuItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      activeSection === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-300 ${
                      activeSection === item.id ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
                
                <Separator className="my-4 bg-gray-800" />
                
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: allowedMenuItems.length * 0.05 }}
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
                  <span className="font-medium">Log Out</span>
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Overview
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    {staffMember?.role || 'Staff Member'} • {staffMember?.department || 'Operations'}
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Top Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Tasks</p>
                        <p className="text-3xl font-bold text-white mt-2">{staffStats?.totalTasks || 12}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm">+8%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Completed Today</p>
                        <p className="text-3xl font-bold text-white mt-2">{staffStats?.completedToday || 8}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm">+15%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Pending Tasks</p>
                        <p className="text-3xl font-bold text-white mt-2">{staffStats?.pendingTasks || 4}</p>
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 text-amber-400 mr-1" />
                          <span className="text-amber-400 text-sm">Urgent</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Active Projects</p>
                        <p className="text-3xl font-bold text-white mt-2">{staffStats?.activeProjects || 3}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm">+25%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest staff operations and tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} index={index} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'my-profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">My Profile</h2>
              
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Staff Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg">
                        {staffMember?.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-white">{staffMember?.fullName}</h3>
                      <p className="text-gray-400">{staffMember?.role}</p>
                      <Badge variant="secondary" className="mt-1">
                        {staffMember?.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{staffMember?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white">{staffMember?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Department</label>
                      <p className="text-white">{staffMember?.department}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Location</label>
                      <p className="text-white">{staffMember?.location || 'Not specified'}</p>
                    </div>
                  </div>

                  {staffMember?.permissions && staffMember.permissions.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Permissions</label>
                      <div className="flex flex-wrap gap-2">
                        {staffMember.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-purple-400 border-purple-400">
                            {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    User Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Manage member accounts, permissions, and memberships
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Users Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-500" />
                    Member Directory
                  </CardTitle>
                  <CardDescription>All registered yacht club members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Member</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                  D
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">demo_member</p>
                                <p className="text-sm text-gray-400">demo@mbyc.com</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              PLATINUM
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300 capitalize">Member</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400">June 2025</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Bookings Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Manage yacht reservations, service bookings, and event registrations
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Bookings Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                    All Bookings
                  </CardTitle>
                  <CardDescription>Real-time yacht, service, and event bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Booking ID</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Date & Time</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-white font-medium">#YB001</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                  D
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white">demo_member</p>
                                <p className="text-xs text-gray-400">Premium Member</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Yacht Booking
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-white">June 25, 2025</span>
                              <p className="text-xs text-gray-400">9:00 AM - 1:00 PM</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Confirmed
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Services Section */}
          {activeSection === 'services' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Service Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Manage yacht concierge services and provider operations
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Services Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                    Premium Services
                  </CardTitle>
                  <CardDescription>Yacht concierge and luxury service offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Provider</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Private Chef Service</p>
                                <p className="text-sm text-gray-400">Gourmet dining experience</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none">
                              Culinary
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">Chef Rodriguez</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-medium">$450/hr</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-white">4.9</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Active
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Yachts/Fleet Section */}
          {activeSection === 'yachts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Fleet Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Manage yacht fleet, vessel operations, and maintenance schedules
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Fleet Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Anchor className="h-5 w-5 mr-2 text-purple-500" />
                    Active Fleet
                  </CardTitle>
                  <CardDescription>Yacht fleet status and operational overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Yacht</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Capacity</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Anchor className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Marina Breeze</p>
                                <p className="text-sm text-gray-400">Luxury Motor Yacht</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Motor Yacht
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">Miami Marina</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white">12 guests</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Available
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Wrench className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Event Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Manage yacht club events, experiences, and member celebrations
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </motion.div>
              </div>

              {/* Events Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Exclusive yacht club events and member experiences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Event</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Date & Time</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Capacity</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Registered</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Star className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">VIP Wine Tasting</p>
                                <p className="text-sm text-gray-400">Exclusive premium experience</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-white">July 15, 2025</span>
                              <p className="text-xs text-gray-400">7:00 PM - 10:00 PM</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none">
                              25 max
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-400 font-medium">18/25</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-medium">$125</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Active
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Analytics
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Performance metrics, insights, and business intelligence
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </motion.div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-white mt-2">$124,500</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm">+12.5%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Active Bookings</p>
                        <p className="text-3xl font-bold text-white mt-2">156</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                          <span className="text-blue-400 text-sm">+8.2%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Member Satisfaction</p>
                        <p className="text-3xl font-bold text-white mt-2">4.8</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 text-sm">Excellent</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Fleet Utilization</p>
                        <p className="text-3xl font-bold text-white mt-2">87%</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                          <span className="text-purple-400 text-sm">+5.1%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                        <Anchor className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Key performance indicators and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Analytics data loading...</p>
                    <p className="text-gray-500 text-sm">Real-time metrics will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Payment Management
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Transaction history, revenue tracking, and payment analytics
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </motion.div>
              </div>

              {/* Payments Table */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>Real-time payment processing and revenue tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-white font-medium">#TXN-001</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                  D
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white">demo_member</p>
                                <p className="text-xs text-gray-400">Premium Member</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Private Chef
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-400 font-bold text-lg">$450.00</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-gray-300">June 25, 2025</span>
                              <p className="text-gray-400 text-xs">2:30 PM</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Succeeded
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Calendar Section */}
          {activeSection === 'calendar' && (
            <CalendarPage />
          )}

          {/* Customer Service Section */}
          {activeSection === 'customer_service' && (
            <CustomerServiceDashboard />
          )}

          {/* Yacht Maintenance Section */}
          {activeSection === 'yacht_maintenance' && (
            <YachtMaintenancePage />
          )}

          {/* Crew Management Section */}
          {activeSection === 'crew_management' && (
            <CrewManagementPage />
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <AdminNotificationCenter />
          )}

          {/* Staff Management Section */}
          {activeSection === 'staff-management' && (
            <StaffManagement />
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white mb-2 tracking-tight"
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    System Settings
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400"
                  >
                    Configure system preferences and operational parameters
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </motion.div>
              </div>

              {/* Settings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-purple-500" />
                      General Settings
                    </CardTitle>
                    <CardDescription>System configuration and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Maintenance Mode</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Disabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto Backup</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Debug Mode</span>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Disabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-purple-500" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Alert preferences and thresholds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Email Alerts</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">SMS Notifications</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Push Notifications</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Enabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-500" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Authentication and access control</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Two-Factor Auth</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Required
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Session Timeout</span>
                      <span className="text-gray-300">24 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Password Policy</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Strong
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Status */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-500" />
                    System Status
                  </CardTitle>
                  <CardDescription>Real-time system health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Database className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white font-medium">Database</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                        Operational
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white font-medium">API Server</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                        Running
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white font-medium">Security</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                        Secure
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Bell className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white font-medium">Notifications</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Remaining placeholder sections */}
          {!['overview', 'my-profile', 'users', 'bookings', 'services', 'yachts', 'events', 'analytics', 'payments', 'calendar', 'customer-service', 'yacht-maintenance', 'crew_management', 'notifications', 'staff-management', 'settings'].includes(activeSection) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {allowedMenuItems.find(item => item.id === activeSection)?.label} Section
              </h3>
              <p className="text-gray-400">This section is under development</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}