import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Staff portal menu items - filtered by permissions
const allStaffMenuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500', permission: 'dashboard_access' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500', permission: 'booking_management' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500', permission: 'calendar_access' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500', permission: 'customer_service' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500', permission: 'maintenance_access' },
  { id: 'fleet', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500', permission: 'fleet_management' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500', permission: 'service_management' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500', permission: 'event_management' },
  { id: 'members', label: 'Members', icon: Users, color: 'from-green-500 to-emerald-500', permission: 'member_access' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500', permission: 'analytics_access' },
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
  const { data: staffMember } = useQuery<StaffMember>({
    queryKey: ['/api/staff/profile'],
    enabled: !!user
  });

  // Fetch staff statistics
  const { data: staffStats } = useQuery<StaffStats>({
    queryKey: ['/api/staff/stats'],
    enabled: !!user
  });

  // Filter menu items based on staff permissions
  const allowedMenuItems = allStaffMenuItems.filter(item => {
    if (!staffMember?.permissions) return item.id === 'overview' || item.id === 'my-profile';
    return staffMember.permissions.includes(item.permission) || item.id === 'my-profile';
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {staffMember?.fullName?.split(' ')[0] || 'Staff'}
                </h2>
                <p className="text-gray-400">
                  {staffMember?.role || 'Staff Member'} • {staffMember?.department || 'Operations'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Tasks"
                  value={staffStats?.totalTasks || 12}
                  change={8}
                  icon={Activity}
                  gradient="from-purple-500 to-indigo-500"
                  delay={0}
                />
                <StatCard
                  title="Completed Today"
                  value={staffStats?.completedToday || 8}
                  change={15}
                  icon={Star}
                  gradient="from-green-500 to-emerald-500"
                  delay={0.1}
                />
                <StatCard
                  title="Pending Tasks"
                  value={staffStats?.pendingTasks || 4}
                  change={null}
                  icon={Clock}
                  gradient="from-amber-500 to-orange-500"
                  delay={0.2}
                />
                <StatCard
                  title="Active Projects"
                  value={staffStats?.activeProjects || 3}
                  change={25}
                  icon={MapPin}
                  gradient="from-blue-500 to-cyan-500"
                  delay={0.3}
                />
              </div>

              {/* Recent Activity */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    <span>Recent Activity</span>
                  </CardTitle>
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

          {/* Placeholder for other sections */}
          {!['overview', 'my-profile'].includes(activeSection) && (
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