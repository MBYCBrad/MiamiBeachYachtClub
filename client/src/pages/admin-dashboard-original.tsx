import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CalendarPage from "@/pages/calendar-page";
import MessengerDashboard from "@/pages/messenger-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import AdminNotificationCenter from "@/components/AdminNotificationCenter";
import MessagesDropdown from "@/components/MessagesDropdown";
import { 
  BarChart3, 
  Users, 
  Anchor, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  Shield,
  TrendingUp,
  UserCheck,
  Wallet,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  Star,
  DollarSign,
  Clock,
  MapPin,
  Eye,
  Edit,
  Database,
  Save,
  RotateCcw,
  Trash2,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  MessageSquare,
  Ship,
  BellRing,
  Dot,
  Wrench,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/multi-image-upload";
import CrewManagementPage from "./crew-management";
import StaffManagement from "./staff-management";
import YachtMaintenancePage from "./yacht-maintenance";
import MyProfile from "./my-profile";

interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  monthlyGrowth: number;
  membershipBreakdown: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'yachts', label: 'Yachts', icon: Anchor, color: 'from-teal-500 to-green-500' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'from-pink-500 to-purple-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-teal-500' },
  { id: 'crew-management', label: 'Crew Management', icon: User, color: 'from-blue-500 to-indigo-500' },
  { id: 'staff-management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500' },
  { id: 'messenger', label: 'Messenger', icon: MessageSquare, color: 'from-blue-500 to-purple-500' },
  { id: 'profile', label: 'My Profile', icon: User, color: 'from-gray-500 to-gray-600' }
];

const AdminDashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats data
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return response.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/analytics");
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  const { data: yachts = [] } = useQuery({
    queryKey: ["/api/admin/yachts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/yachts");
      return response.json();
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/admin/services"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/services");
      return response.json();
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/admin/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/events");
      return response.json();
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/bookings");
      return response.json();
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/payments");
      return response.json();
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
          Overview
        </h1>
        <p className="text-lg text-gray-400">Miami Beach Yacht Club Management Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Members</p>
                  <p className="text-3xl font-bold text-white">{adminStats?.totalUsers || 0}</p>
                  <p className="text-sm text-green-400">+{adminStats?.monthlyGrowth || 0}%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active Bookings</p>
                  <p className="text-3xl font-bold text-white">{adminStats?.totalBookings || 0}</p>
                  <p className="text-sm text-blue-400">+20</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white">${adminStats?.totalRevenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-green-400">+100%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Filtered Transactions</p>
                  <p className="text-3xl font-bold text-white">18</p>
                  <p className="text-sm text-orange-400">+0%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Filter className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Membership Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-400" />
              Membership Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current membership tier breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {adminStats?.membershipBreakdown?.map((tier, index) => (
                <div key={tier.tier} className="text-center">
                  <div className="text-2xl font-bold text-white">{tier.count}</div>
                  <div className="text-sm text-gray-400 capitalize">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{tier.percentage}%</div>
                </div>
              )) || (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">14</div>
                    <div className="text-sm text-gray-400">Bronze</div>
                    <div className="text-xs text-gray-500">52%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-sm text-gray-400">Silver</div>
                    <div className="text-xs text-gray-500">30%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Gold</div>
                    <div className="text-xs text-gray-500">0%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Platinum</div>
                    <div className="text-xs text-gray-500">0%</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Live database transactions and member interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings?.slice(0, 5).map((booking: any, index: number) => (
                <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/30">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">New Yacht Booking</p>
                    <p className="text-gray-400 text-sm">{booking.member?.name} booked {booking.yacht?.name}</p>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-400 py-8">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'calendar':
        return <CalendarPage />;
      case 'customer-service':
        return <CustomerServiceDashboard />;
      case 'yacht-maintenance':
        return <YachtMaintenancePage />;
      case 'crew-management':
        return <CrewManagementPage />;
      case 'staff-management':
        return <StaffManagement />;
      case 'messenger':
        return <MessengerDashboard />;
      case 'profile':
        return <MyProfile />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <img 
                  src="/api/media/logo" 
                  alt="MBYC Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'block';
                  }}
                />
                <Anchor className="h-6 w-6 text-white hidden" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Miami Beach Yacht Club</p>
              </div>
            </div>
          </div>

          {/* Right side - Notifications, Messages, Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-white relative"
              >
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">11</span>
                </div>
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 z-50">
                  <AdminNotificationCenter userId={user?.id} />
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessages(!showMessages)}
                className="text-gray-400 hover:text-white"
              >
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </Button>
              
              {showMessages && (
                <div className="absolute right-0 top-full mt-2 w-96 z-50">
                  <MessagesDropdown userId={user?.id} />
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-white">A</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-20">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-20 bottom-0 w-72 bg-gray-900/50 border-r border-gray-800 backdrop-blur-sm overflow-y-auto z-40"
            >
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start admin-nav-button ${
                        activeSection === item.id 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Messages Section */}
                <div className="mt-8 p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm text-center">No conversations yet</p>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    View All Messages
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${!sidebarCollapsed ? 'ml-72' : 'ml-0'}`}>
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;