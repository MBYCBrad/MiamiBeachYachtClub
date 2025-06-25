import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Calendar, 
  FileText, 
  Ship, 
  CreditCard, 
  Shield, 
  Bell, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Bookmark,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Home,
  Anchor,
  Compass,
  Crown,
  Gem,
  Zap,
  Activity,
  Target,
  Briefcase,
  Building,
  Globe
} from 'lucide-react';
import { CalendarPage } from './calendar';
import { CrewManagementPage } from './crew-management';
import { StaffManagement } from './staff-management';
import { YachtMaintenanceFixed } from './yacht-maintenance-fixed';
import { CustomerServiceDashboard } from './customer-service-dashboard';
import { MyProfile } from './profile';

interface StaffPortalProps {}

export function StaffPortal({}: StaffPortalProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get staff profile and permissions
  const { data: staffProfile } = useQuery({
    queryKey: ['/api/staff/profile'],
    enabled: true
  });

  const { data: staffStats } = useQuery({
    queryKey: ['/api/staff/stats'],
    enabled: true
  });

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get staff permissions
  const staffPermissions = staffProfile?.permissions || {};
  
  // Define menu items based on permissions
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, show: true },
    { id: 'users', label: 'User Management', icon: Users, show: staffPermissions.users },
    { id: 'yachts', label: 'Yacht Management', icon: Ship, show: staffPermissions.yachts },
    { id: 'services', label: 'Service Management', icon: Briefcase, show: staffPermissions.services },
    { id: 'events', label: 'Event Management', icon: Calendar, show: staffPermissions.events },
    { id: 'bookings', label: 'Booking Management', icon: FileText, show: staffPermissions.bookings },
    { id: 'payments', label: 'Payment Management', icon: CreditCard, show: staffPermissions.payments },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: staffPermissions.analytics },
    { id: 'calendar', label: 'Calendar', icon: Calendar, show: true },
    { id: 'crew-management', label: 'Crew Management', icon: Users, show: staffPermissions.crew_management },
    { id: 'staff-management', label: 'Staff Management', icon: Shield, show: staffPermissions.users },
    { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Settings, show: staffPermissions.yachts },
    { id: 'customer-service', label: 'Customer Service', icon: Phone, show: staffPermissions.customer_service },
    { id: 'my-profile', label: 'My Profile', icon: User, show: true },
    { id: 'settings', label: 'Settings', icon: Settings, show: true }
  ].filter(item => item.show);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      window.location.href = '/auth';
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Render overview section - copy from admin dashboard
  const renderOverview = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Staff Portal</h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {staffProfile?.fullName || staffProfile?.username}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
              {staffProfile?.role || 'Staff'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Active Users</h3>
            <p className="text-2xl font-bold text-white">{staffStats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-400 mt-1">+12% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Fleet</Badge>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Total Yachts</h3>
            <p className="text-2xl font-bold text-white">{staffStats?.totalYachts || 0}</p>
            <p className="text-sm text-gray-400 mt-1">3 new this month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Revenue</Badge>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-white">${(staffStats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">+8% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Bookings</Badge>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Active Bookings</h3>
            <p className="text-2xl font-bold text-white">{staffStats?.totalBookings || 0}</p>
            <p className="text-sm text-gray-400 mt-1">5 new today</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-950 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common staff tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffPermissions.users && (
                <Button 
                  onClick={() => setActiveSection('users')}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              )}
              {staffPermissions.bookings && (
                <Button 
                  onClick={() => setActiveSection('bookings')}
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Bookings
                </Button>
              )}
              {staffPermissions.customer_service && (
                <Button 
                  onClick={() => setActiveSection('customer-service')}
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Customer Service
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">New member registered</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Ship className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Yacht booking confirmed</p>
                  <p className="text-xs text-gray-400">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <CreditCard className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Payment processed</p>
                  <p className="text-xs text-gray-400">10 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  };

  // Render settings section
  const renderStaffSettings = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Manage your staff portal preferences</p>
        </div>

        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Account Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Update your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch />
                  <span className="text-gray-400">Receive email notifications for important updates</span>
                </div>
              </div>
              <div>
                <Label className="text-white">Dark Mode</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch defaultChecked />
                  <span className="text-gray-400">Use dark theme</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarOpen ? (isMobile ? '100%' : '280px') : '0px',
          opacity: sidebarOpen ? 1 : 0
        }}
        className="bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden z-50 fixed lg:relative h-full"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1750688569645.png" 
                  alt="MBYC Logo"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <h2 className="text-white font-bold">MBYC Staff</h2>
                <p className="text-gray-400 text-sm">{staffProfile?.role || 'Staff Portal'}</p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start text-left h-12 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => {
                setActiveSection(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <motion.div 
          className="flex-1 p-6 overflow-y-auto"
          key={activeSection}
        >
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'crew-management' && <CrewManagementPage />}
            {activeSection === 'staff-management' && <StaffManagement />}
            {activeSection === 'yacht-maintenance' && <YachtMaintenanceFixed />}
            {activeSection === 'customer-service' && <CustomerServiceDashboard />}
            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'settings' && renderStaffSettings()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}