import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import AdminNotificationCenter from "@/components/AdminNotificationCenter";
import MessagesDropdown from "@/components/MessagesDropdown";
import StaffBookingsPage from "@/components/StaffBookingsPage";
import StaffServicesPage from "@/components/StaffServicesPage";
import StaffEventsPage from "@/components/StaffEventsPage";
import StaffAnalyticsPage from "@/components/StaffAnalyticsPage";
import MyProfile from "./my-profile";
import { useLocation } from 'wouter';
import { 
  BarChart3, 
  Phone,
  Calendar,
  Settings,
  User,
  LogOut,
  Shield,
  Menu,
  ChevronRight,
  Bell,
  MessageSquare,
  Sparkles,
  CalendarDays,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StaffStats {
  totalTasks: number;
  completedTasks: number;
  activeCalls: number;
  responseTime: number;
  customerSatisfaction: number;
}

const StaffDashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff stats data
  const { data: staffStats } = useQuery<StaffStats>({
    queryKey: ["/api/staff/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/staff/stats");
      return response.json();
    },
  });

  // Staff navigation - identical to admin structure
  const staffSidebarItems = useMemo(() => {
    const permissions = user?.permissions || [];
    const items = [
      { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500' }
    ];

    if (permissions.includes('customer_service') || permissions.includes('phone_calls')) {
      items.push({ id: 'customer-service', label: 'Customer Service', icon: Phone, color: 'from-green-500 to-emerald-500' });
    }

    if (permissions.includes('bookings')) {
      items.push({ id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' });
    }

    if (permissions.includes('services')) {
      items.push({ id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' });
    }

    if (permissions.includes('events')) {
      items.push({ id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500' });
    }

    if (permissions.includes('analytics')) {
      items.push({ id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' });
    }

    // Always include profile and logout
    items.push(
      { id: 'my-profile', label: 'My Profile', icon: User, color: 'from-purple-500 to-indigo-500' },
      { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
      { id: 'logout', label: 'Log Out', icon: LogOut, color: 'from-red-500 to-red-600' }
    );

    return items;
  }, [user?.permissions]);

  // Identical StatCard component from admin
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle sidebar item clicks
  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'logout') {
      handleLogout();
    } else {
      setActiveSection(itemId);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) setShowNotifications(false);
      if (showMessages) setShowMessages(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showMessages]);

  // Overview content - Staff specific stats
  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Staff Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            Staff Dashboard
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2"
          >
            Welcome back, {user?.username} - {user?.role}
          </motion.p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Real-time Notifications */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-purple-500 bg-gray-900/50"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">
                3
              </Badge>
            </Button>
            
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 z-50"
              >
                <AdminNotificationCenter userId={user?.id} />
              </motion.div>
            )}
          </motion.div>

          {/* Real-time Messages */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-blue-500 bg-gray-900/50"
              onClick={() => setShowMessages(!showMessages)}
            >
              <MessageSquare className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1">
                5
              </Badge>
            </Button>
            
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 z-50"
              >
                <MessagesDropdown userId={user?.id} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Staff Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Tasks"
          value={staffStats?.totalTasks || 12}
          change={8}
          icon={Activity}
          gradient="from-purple-500 to-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Completed Today"
          value={staffStats?.completedTasks || 8}
          change={15}
          icon={CheckCircle}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Active Calls"
          value={staffStats?.activeCalls || 3}
          change={null}
          icon={Phone}
          gradient="from-blue-500 to-cyan-500"
          delay={0.3}
        />
        <StatCard
          title="Response Time"
          value={`${staffStats?.responseTime || 2.1}min`}
          change={-12}
          icon={Clock}
          gradient="from-orange-500 to-red-500"
          delay={0.4}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-400" />
              Recent Staff Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Member Call Completed', description: 'Assisted VIP member with yacht booking', time: '5min ago', icon: Phone, color: 'from-green-500 to-emerald-500' },
              { title: 'Service Request Processed', description: 'Coordinated yacht cleaning service', time: '12min ago', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
              { title: 'Event Registration', description: 'Added member to sunset cruise event', time: '25min ago', icon: Calendar, color: 'from-purple-500 to-indigo-500' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-700/40 transition-all duration-300 group"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color} group-hover:scale-110 transition-transform`}>
                  <activity.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-400">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'customer-service':
        return <CustomerServiceDashboard />;
      case 'bookings':
        return <StaffBookingsPage />;
      case 'services':
        return <StaffServicesPage />;
      case 'events':
        return <StaffEventsPage />;
      case 'analytics':
        return <StaffAnalyticsPage />;
      case 'my-profile':
        return <MyProfile />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Sidebar - Identical to Admin */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gray-900/50 border-r border-gray-700/50 backdrop-blur-xl transition-all duration-300 flex flex-col`}
        >
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-white">MBYC Staff</h2>
                  <p className="text-xs text-gray-400">Management Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {staffSidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleSidebarClick(item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30' 
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} transition-transform group-hover:scale-110`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  )}
                </div>
                
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5`}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Collapse Button */}
          <div className="p-4 border-t border-gray-700/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full border-gray-600 hover:border-purple-500"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;