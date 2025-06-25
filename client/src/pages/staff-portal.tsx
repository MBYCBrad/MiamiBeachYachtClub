// TEMPORARY FILE - EXACT COPY FROM ADMIN DASHBOARD WITH STAFF API ENDPOINTS
// This will replace the broken staff-portal.tsx file

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Shadcn imports - EXACT COPY FROM ADMIN DASHBOARD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Icons - EXACT COPY FROM ADMIN DASHBOARD
import { 
  Users, Settings, BarChart3, Calendar, Bell, Shield, 
  Plus, Edit, Trash2, Eye, Filter, X, TrendingUp, DollarSign,
  Activity, Star, Anchor, CreditCard, Clock, MapPin, Phone,
  Mail, Zap, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

// Import other components - EXACT COPY FROM ADMIN DASHBOARD
import MessagesDropdown from '@/components/MessagesDropdown';
import AdminNotificationCenter from '@/components/AdminNotificationCenter';

// Types - EXACT COPY FROM ADMIN DASHBOARD
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

interface NavItem {
  id: string;
  label: string;
  icon: any;
  permissions?: string[];
}

export default function StaffPortal() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states - EXACT COPY FROM ADMIN DASHBOARD
  const [userFilters, setUserFilters] = useState({
    role: "all",
    membershipTier: "all", 
    status: "all"
  });

  const [yachtFilters, setYachtFilters] = useState({
    type: "all",
    availability: "all",
    capacity: "all"
  });

  const [serviceFilters, setServiceFilters] = useState({
    category: "all",
    status: "all",
    provider: "all"
  });

  const [eventFilters, setEventFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all"
  });

  const [bookingFilters, setBookingFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all"
  });

  // Data queries using staff API endpoints - EXACT COPY FROM ADMIN DASHBOARD WITH STAFF ENDPOINTS
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/staff/stats'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/users'],
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/yachts'],
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/services'],
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/events'],
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/payments'],
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/bookings'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/staff/analytics'],
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/notifications'],
  });

  // Filter functions - EXACT COPY FROM ADMIN DASHBOARD
  const filteredUsers = useMemo(() => {
    if (activeSection !== 'users') return users;
    
    let filtered = [...users];

    if (userFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === userFilters.role);
    }

    if (userFilters.membershipTier !== 'all') {
      filtered = filtered.filter(user => user.membershipTier === userFilters.membershipTier);
    }

    if (userFilters.status !== 'all') {
      filtered = filtered.filter(user => userFilters.status === 'active');
    }

    return filtered;
  }, [users, userFilters, activeSection]);

  // Process stats data - EXACT COPY FROM ADMIN DASHBOARD
  const adminStats = stats ? {
    totalUsers: stats.totalUsers || 0,
    totalBookings: stats.totalBookings || 0,
    totalRevenue: stats.totalRevenue || 0,
    activeServices: stats.activeServices || 0,
    monthlyGrowth: stats.monthlyGrowth || 0,
    membershipBreakdown: stats.membershipBreakdown || []
  } : {
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    monthlyGrowth: 0,
    membershipBreakdown: []
  };

  // Mobile detection - EXACT COPY FROM ADMIN DASHBOARD
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation items with permissions - EXACT COPY FROM ADMIN DASHBOARD
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, permissions: ['users'] },
    { id: 'yachts', label: 'Yachts', icon: Anchor, permissions: ['yachts'] },
    { id: 'services', label: 'Services', icon: Settings, permissions: ['services'] },
    { id: 'events', label: 'Events', icon: Calendar, permissions: ['events'] },
    { id: 'bookings', label: 'Bookings', icon: Activity, permissions: ['bookings'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, permissions: ['payments'] },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, permissions: ['analytics'] },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell, permissions: ['notifications'] },
    { id: 'crew-management', label: 'Crew Management', icon: Users, permissions: ['crew_management'] },
    { id: 'staff-management', label: 'Staff Management', icon: Shield, permissions: ['users'] },
    { id: 'yacht-maintenance', label: 'Maintenance', icon: Settings, permissions: ['yachts'] },
    { id: 'customer-service', label: 'Customer Service', icon: Phone, permissions: ['customer_service'] },
    { id: 'my-profile', label: 'My Profile', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Filter nav items based on user permissions - EXACT COPY FROM ADMIN DASHBOARD
  const filteredNavItems = navItems.filter(item => {
    if (!item.permissions) return true;
    if (!user?.permissions) return false;
    return item.permissions.some(permission => user.permissions.includes(permission));
  });

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile) return;
    
    if (info.delta.x > 50 && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    } else if (info.delta.x < -50 && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  // EXACT COPY FROM ADMIN DASHBOARD - renderOverview function
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
            Staff Portal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Miami Beach Yacht Club Management Dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: adminStats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
          { title: "Active Bookings", value: adminStats.totalBookings, icon: Activity, color: "from-green-500 to-emerald-500" },
          { title: "Total Revenue", value: `$${adminStats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-purple-500 to-pink-500" },
          { title: "Active Services", value: adminStats.activeServices, icon: Settings, color: "from-orange-500 to-red-500" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl overflow-hidden group hover:bg-gray-800/50 transition-all duration-300">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleSectionChange('users')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-20 flex-col space-y-2"
              >
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              <Button 
                onClick={() => handleSectionChange('bookings')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 h-20 flex-col space-y-2"
              >
                <Activity className="h-6 w-6" />
                <span>View Bookings</span>
              </Button>
              <Button 
                onClick={() => handleSectionChange('analytics')}
                className="bg-gradient-to-r from-orange-600 to-red-600 h-20 flex-col space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // EXACT COPY FROM ADMIN DASHBOARD - renderUsers function
  const renderUsers = () => (
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
            Users
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage Miami Beach Yacht Club members and staff
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className={`border-gray-600 transition-all ${
              showFilters ? 'border-purple-500 bg-purple-500/10' : 'hover:border-purple-500'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <AddUserDialog />
        </motion.div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Role</Label>
                    <Select value={userFilters.role} onValueChange={(value) => setUserFilters({...userFilters, role: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="member">Members</SelectItem>
                        <SelectItem value="yacht_owner">Yacht Owners</SelectItem>
                        <SelectItem value="service_provider">Service Providers</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Membership Tier</Label>
                    <Select value={userFilters.membershipTier} onValueChange={(value) => setUserFilters({...userFilters, membershipTier: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Status</Label>
                    <Select value={userFilters.status} onValueChange={(value) => setUserFilters({...userFilters, status: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setUserFilters({ role: "all", membershipTier: "all", status: "all" })}
                      className="border-gray-600 hover:border-purple-500 w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left p-4 text-gray-300 font-medium">User</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Membership</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                    <th className="text-right p-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any, index: number) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.username}</div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={`${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            user.role === 'yacht_owner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            user.role === 'service_provider' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            user.role === 'staff' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}
                        >
                          {user.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.membershipTier ? (
                          <Badge 
                            className={`${
                              user.membershipTier === 'Platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              user.membershipTier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              user.membershipTier === 'Silver' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                              'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }`}
                          >
                            {user.membershipTier}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-600 hover:border-blue-500">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <EditUserDialog user={user} />
                          <DeleteUserDialog user={user} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Placeholder functions for other sections
  const renderYachts = () => <div>Yachts section coming soon...</div>;
  const renderServices = () => <div>Services section coming soon...</div>;
  const renderEvents = () => <div>Events section coming soon...</div>;
  const renderBookings = () => <div>Bookings section coming soon...</div>;
  const renderPayments = () => <div>Payments section coming soon...</div>;
  const renderAnalytics = () => <div>Analytics section coming soon...</div>;
  const renderNotifications = () => <div>Notifications section coming soon...</div>;
  const renderSettings = () => <div>Settings section coming soon...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" onPanStart={handlePan}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -320 }}
          animate={{ 
            x: sidebarCollapsed ? -320 : 0,
            width: sidebarCollapsed ? 0 : 320
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed left-0 top-0 z-50 h-full bg-gray-950/95 backdrop-blur-xl border-r border-gray-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">MBYC Staff</h1>
                <p className="text-gray-400 text-sm">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <div className="space-y-2">
              {filteredNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl group relative overflow-hidden transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-600/30' 
                        : 'bg-transparent text-gray-400 border-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Zap className="h-4 w-4 text-purple-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Staff User'}</p>
                <p className="text-xs text-gray-400">Staff Member</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessagesDropdown />
                <AdminNotificationCenter />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          animate={{ 
            marginLeft: sidebarCollapsed ? 0 : 320
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 overflow-y-auto p-8 w-full"
        >
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'yachts' && renderYachts()}
            {activeSection === 'services' && renderServices()}
            {activeSection === 'events' && renderEvents()}
            {activeSection === 'bookings' && renderBookings()}
            {activeSection === 'analytics' && renderAnalytics()}
            {activeSection === 'payments' && renderPayments()}
            {activeSection === 'calendar' && <div>Calendar section coming soon...</div>}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'crew-management' && <div>Crew Management section coming soon...</div>}
            {activeSection === 'staff-management' && <div>Staff Management section coming soon...</div>}
            {activeSection === 'yacht-maintenance' && <div>Yacht Maintenance section coming soon...</div>}
            {activeSection === 'customer-service' && <div>Customer Service section coming soon...</div>}
            {activeSection === 'messenger' && <div>Messenger section coming soon...</div>}
            {activeSection === 'my-profile' && <div>My Profile section coming soon...</div>}
            {activeSection === 'settings' && renderSettings()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// EXACT COPY FROM ADMIN DASHBOARD - CRUD Components

// Add User Dialog
function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    membershipTier: 'bronze'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/staff/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/users"] });
      toast({ title: "Success", description: "User created successfully" });
      setIsOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'member', membershipTier: 'bronze' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Enter password"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? 'bronze' : ''})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role === 'member' && (
              <div>
                <Label htmlFor="membershipTier" className="text-gray-300">Membership Tier</Label>
                <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog
function EditUserDialog({ user: userData }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: userData.username || '',
    email: userData.email || '',
    role: userData.role || '',
    membershipTier: userData.membershipTier || ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/staff/users/${userData.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? (formData.membershipTier || 'bronze') : ''})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role === 'member' && (
              <div>
                <Label htmlFor="tier" className="text-gray-300">Membership Tier</Label>
                <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => updateUserMutation.mutate(formData)} 
            disabled={updateUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Dialog
function DeleteUserDialog({ user: userData }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/staff/users/${userData.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-red-500">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {userData.username}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteUserMutation.mutate()} 
            disabled={deleteUserMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}