import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CalendarPage from "@/pages/calendar-page";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import CrewManagementPage from "./crew-management";
import StaffManagement from "./staff-management";
import YachtMaintenancePage from "./yacht-maintenance-fixed";
import MyProfile from "./my-profile";
import { 
  BarChart3, 
  Users, 
  Anchor, 
  CalendarDays, 
  CreditCard, 
  Shield,
  TrendingUp,
  Activity,
  Bell,
  Filter,
  ChevronRight,
  Calendar,
  Star,
  DollarSign,
  LogOut,
  Menu,
  X,
  Ship,
  Wrench,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  { id: 'users', label: 'User Management', icon: Users, color: 'from-emerald-500 to-green-500' },
  { id: 'yachts', label: 'Fleet Management', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Service Management', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Event Management', icon: Star, color: 'from-yellow-500 to-orange-500' },
  { id: 'payments', label: 'Payment Management', icon: CreditCard, color: 'from-pink-500 to-rose-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-red-500 to-pink-500' },
  { id: 'customer_service', label: 'Customer Service', icon: Phone, color: 'from-teal-500 to-cyan-500' },
  { id: 'crew_management', label: 'Crew Management', icon: Ship, color: 'from-slate-500 to-gray-500' },
  { id: 'staff_management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500' }
];

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch staff profile data
  const { data: staffProfile } = useQuery({
    queryKey: ['/api/staff/profile'],
    enabled: !!user
  });

  // Fetch staff stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/staff/stats']
  });

  // Get accessible menu items based on staff permissions
  const accessibleMenuItems = useMemo(() => {
    if (!staffProfile?.permissions) return sidebarItems.filter(item => item.id === 'overview' || item.id === 'calendar');
    
    const permissionMap: Record<string, string[]> = {
      'users': ['users', 'staff_management'],
      'yachts': ['yachts'],
      'services': ['services'],
      'events': ['events'],
      'bookings': ['bookings'],
      'payments': ['payments'],
      'analytics': ['analytics'],
      'notifications': ['notifications'],
      'customer_service': ['customer_service'],
      'crew_management': ['crew_management']
    };

    return sidebarItems.filter(item => {
      if (item.id === 'overview' || item.id === 'calendar') return true;
      
      for (const [permission, menuIds] of Object.entries(permissionMap)) {
        if (menuIds.includes(item.id) && staffProfile.permissions.includes(permission)) {
          return true;
        }
      }
      return false;
    });
  }, [staffProfile]);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth';
    }
  };

  const renderOverview = () => (
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
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Miami Beach Yacht Club operations dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg">
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
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg">
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
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg">
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
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active Services</p>
                  <p className="text-2xl font-bold text-white">{stats?.activeServices || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Membership Breakdown */}
      {stats?.membershipBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Membership Breakdown</CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of members across tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.membershipBreakdown.map((tier) => (
                  <div key={tier.tier} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{tier.count}</div>
                    <div className="text-sm font-medium text-gray-300 mb-2">{tier.tier}</div>
                    <div className="text-xs text-gray-500">{tier.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'calendar':
        return <CalendarPage />;
      case 'customer_service':
        return <CustomerServiceDashboard />;
      case 'crew_management':
        return <CrewManagementPage />;
      case 'staff_management':
        return <StaffManagement />;
      case 'yachts':
        return <YachtMaintenancePage />;
      case 'profile':
        return <MyProfile />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Access Restricted</p>
              <p className="text-gray-500 text-sm">You don't have permission to access this section</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('/api/media/pexels-pixabay-163236_1750537277230.jpg')] opacity-5 bg-cover bg-center" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-gray-800 z-50"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/api/media/MBYC-LOGO-WHITE_1750687226929.png" 
                      alt="MBYC" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Staff Portal</h1>
                    <p className="text-sm text-gray-400">Miami Beach YC</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {accessibleMenuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 admin-nav-button ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Staff Profile */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {staffProfile?.username?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {staffProfile?.username || 'Staff Member'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {staffProfile?.role || 'Staff'}
                    </p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hamburger Menu Button */}
        <AnimatePresence>
          {sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarCollapsed(false)}
              className="fixed top-6 left-6 z-[9999] bg-gray-900/90 backdrop-blur-xl border border-gray-700 text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Close Button */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.button
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => setSidebarCollapsed(true)}
              className="fixed top-6 right-6 z-[9999] bg-gray-900/90 backdrop-blur-xl border border-gray-700 text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          animate={{
            marginLeft: sidebarCollapsed ? 0 : 320,
            width: sidebarCollapsed ? '100%' : 'calc(100% - 320px)'
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 overflow-hidden"
        >
          <div className="p-8 mt-16">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}