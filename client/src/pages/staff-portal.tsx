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
  User,
  Hash,
  Briefcase,
  Plus
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/multi-image-upload";
import CrewManagementPage from "./crew-management";
import StaffManagement from "./staff-management";
import YachtMaintenancePage from "./yacht-maintenance";
import MyProfile from "./my-profile";
import { Overview3DIcon, Users3DIcon, Yacht3DIcon, Services3DIcon, Events3DIcon, Bookings3DIcon, Analytics3DIcon, Payments3DIcon } from '@/components/Animated3DAdminIcons';

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
  { id: 'users', label: 'Users', icon: Users, color: 'from-purple-500 to-pink-500' },
  { id: 'yachts', label: 'Yachts', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Services', icon: Star, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'from-green-500 to-emerald-500' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-cyan-500 to-teal-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-emerald-500 to-cyan-500' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'from-purple-500 to-indigo-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-red-500 to-orange-500' },
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-blue-500 to-indigo-500' },
  { id: 'staff-management', label: 'Staff Management', icon: UserCheck, color: 'from-purple-500 to-indigo-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-emerald-500 to-cyan-500' },
  { id: 'messenger', label: 'Messenger', icon: MessageSquare, color: 'from-blue-500 to-purple-500' },
  { id: 'my-profile', label: 'My Profile', icon: User, color: 'from-purple-500 to-indigo-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const serviceCategories = [
  "Beauty & Grooming",
  "Culinary",
  "Wellness & Spa", 
  "Photography & Media",
  "Entertainment",
  "Water Sports",
  "Concierge & Lifestyle"
];

const membershipTiers = ["Bronze", "Silver", "Gold", "Platinum"];

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User filters for the users section
  const [userFilters, setUserFilters] = useState({
    role: "all",
    membershipTier: "all",
    status: "all"
  });

  // Yacht filters
  const [yachtFilters, setYachtFilters] = useState({
    type: "all",
    availability: "all",
    capacity: "all"
  });

  const [serviceFilters, setServiceFilters] = useState({
    category: "all",
    availability: "all",
    priceRange: "all"
  });

  const [eventFilters, setEventFilters] = useState({
    status: "all",
    capacity: "all",
    priceRange: "all"
  });

  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    timeRange: 'all',
    membershipTier: 'all',
    yachtSize: 'all',
    sortBy: 'date'
  });

  const [paymentFilters, setPaymentFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all"
  });

  // API Queries - using staff endpoints where appropriate
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/staff/stats'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/staff/users'],
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/staff/yachts'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/staff/services'],
  });

  const { data: events } = useQuery({
    queryKey: ['/api/staff/events'],
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/staff/payments'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/staff/bookings'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/staff/analytics'],
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/staff/notifications'],
  });

  // Process stats data to match admin dashboard structure
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





  // Mobile detection
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

  // Swipe gesture handling for mobile
  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile) return;
    
    const threshold = 50;
    if (info.offset.x > threshold && sidebarCollapsed) {
      setSidebarCollapsed(false);
    } else if (info.offset.x < -threshold && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  // Filter functions
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return (users as any[]).filter((user: any) => {
      const roleMatch = userFilters.role === "all" || user.role === userFilters.role;
      const tierMatch = userFilters.membershipTier === "all" || user.membershipTier === userFilters.membershipTier;
      const statusMatch = userFilters.status === "all" || user.status === userFilters.status;
      return roleMatch && tierMatch && statusMatch;
    });
  }, [users, userFilters]);

  const filteredYachts = useMemo(() => {
    if (!yachts) return [];
    return (yachts as any[]).filter((yacht: any) => {
      const typeMatch = yachtFilters.type === "all" || yacht.type === yachtFilters.type;
      const availabilityMatch = yachtFilters.availability === "all" || 
        (yachtFilters.availability === "available" ? yacht.isAvailable : !yacht.isAvailable);
      const capacityMatch = yachtFilters.capacity === "all" ||
        (yachtFilters.capacity === "small" && yacht.capacity <= 8) ||
        (yachtFilters.capacity === "medium" && yacht.capacity > 8 && yacht.capacity <= 15) ||
        (yachtFilters.capacity === "large" && yacht.capacity > 15);
      return typeMatch && availabilityMatch && capacityMatch;
    });
  }, [yachts, yachtFilters]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return (services as any[]).filter((service: any) => {
      const categoryMatch = serviceFilters.category === "all" || service.category === serviceFilters.category;
      const availabilityMatch = serviceFilters.availability === "all" || 
        (serviceFilters.availability === "available" ? service.isAvailable : !service.isAvailable);
      const priceMatch = serviceFilters.priceRange === "all" ||
        (serviceFilters.priceRange === "low" && service.pricePerSession <= 99) ||
        (serviceFilters.priceRange === "medium" && service.pricePerSession > 99 && service.pricePerSession <= 500) ||
        (serviceFilters.priceRange === "high" && service.pricePerSession > 500);
      return categoryMatch && availabilityMatch && priceMatch;
    });
  }, [services, serviceFilters]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return (events as any[]).filter((event: any) => {
      const now = new Date();
      const eventDate = new Date(event.startTime);
      
      const statusMatch = eventFilters.status === "all" ||
        (eventFilters.status === "upcoming" && eventDate > now) ||
        (eventFilters.status === "past" && eventDate < now);
      
      const capacityMatch = eventFilters.capacity === "all" ||
        (eventFilters.capacity === "small" && event.capacity <= 19) ||
        (eventFilters.capacity === "medium" && event.capacity >= 20 && event.capacity <= 50) ||
        (eventFilters.capacity === "large" && event.capacity > 50);
        
      const priceMatch = eventFilters.priceRange === "all" ||
        (eventFilters.priceRange === "free" && (!event.ticketPrice || event.ticketPrice === 0)) ||
        (eventFilters.priceRange === "paid" && event.ticketPrice && event.ticketPrice > 0);
        
      return statusMatch && capacityMatch && priceMatch;
    });
  }, [events, eventFilters]);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return (payments as any[]).filter((payment: any) => {
      const typeMatch = paymentFilters.type === "all" || payment.type === paymentFilters.type;
      const statusMatch = paymentFilters.status === "all" || payment.status === paymentFilters.status;
      
      const now = new Date();
      const paymentDate = new Date(payment.createdAt);
      const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const dateMatch = paymentFilters.dateRange === "all" ||
        (paymentFilters.dateRange === "today" && daysDiff === 0) ||
        (paymentFilters.dateRange === "week" && daysDiff <= 7) ||
        (paymentFilters.dateRange === "month" && daysDiff <= 30);
        
      return typeMatch && statusMatch && dateMatch;
    });
  }, [payments, paymentFilters]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return (bookings as any[]).filter((booking: any) => {
      const typeMatch = bookingFilters.type === "all" || booking.type === bookingFilters.type;
      const statusMatch = bookingFilters.status === "all" || booking.status === bookingFilters.status;
      
      const now = new Date();
      const bookingDate = new Date(booking.createdAt);
      const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const dateMatch = bookingFilters.dateRange === "all" ||
        (bookingFilters.dateRange === "today" && daysDiff === 0) ||
        (bookingFilters.dateRange === "week" && daysDiff <= 7) ||
        (bookingFilters.dateRange === "month" && daysDiff <= 30);
        
      return typeMatch && statusMatch && dateMatch;
    });
  }, [bookings, bookingFilters]);

  // Search functionality
  const searchResults = sidebarItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayItems = searchTerm ? searchResults : sidebarItems;

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // EXACT COPY FROM ADMIN DASHBOARD - renderOverview function with complete styling
  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-16">
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
            Miami Beach Yacht Club Staff Dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 relative z-10"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFilters(!showFilters);
            }}
            className={`border-gray-600 transition-all cursor-pointer relative z-20 ${
              showFilters ? 'border-purple-500 bg-purple-500/10' : 'hover:border-purple-500'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Dynamic Stats Grid - Updates with Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                  Total
                </Badge>
              </motion.div>
            </div>
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats?.totalUsers?.toLocaleString() || '0'}
              </motion.h3>
              <p className="text-gray-400 text-sm">Platform Users</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats?.monthlyGrowth || 0}% from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                <Anchor className="h-8 w-8 text-white" />
              </div>
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  Active
                </Badge>
              </motion.div>
            </div>
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats?.totalBookings?.toLocaleString() || '0'}
              </motion.h3>
              <p className="text-gray-400 text-sm">Total Bookings</p>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-400 text-sm">+8% this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-300">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 transition-colors">
                  Revenue
                </Badge>
              </motion.div>
            </div>
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-white mb-1"
              >
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </motion.h3>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats?.monthlyGrowth || 0}% growth</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 group-hover:from-orange-400 group-hover:to-red-400 transition-all duration-300">
                <Filter className="h-8 w-8 text-white" />
              </div>
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                  Services
                </Badge>
              </motion.div>
            </div>
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {stats?.activeServices?.toLocaleString() || '0'}
              </motion.h3>
              <p className="text-gray-400 text-sm">Active Services</p>
              <div className="flex items-center mt-2">
                <Sparkles className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-orange-400 text-sm">All categories</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Membership Distribution
            </CardTitle>
            <CardDescription>Current membership tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.membershipBreakdown?.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-gray-900/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    tier.tier === 'Platinum' ? 'text-purple-400' :
                    tier.tier === 'Gold' ? 'text-yellow-400' :
                    tier.tier === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{(tier.percentage || 0).toFixed(1)}%</div>
                </motion.div>
              )) || (
                <div className="col-span-4 text-center py-8">
                  <Crown className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No membership data available</p>
                  <p className="text-gray-500 text-sm">Data will appear when members join</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // EXACT COPY from admin dashboard - renderUsers function
  const renderUsers = () => {
    if (!users) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-800 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const filteredUsers = users.filter((user: any) => {
      if (userFilters.role !== 'all' && user.role !== userFilters.role) return false;
      if (userFilters.membershipTier !== 'all' && user.membershipTier !== userFilters.membershipTier) return false;
      if (userFilters.status !== 'all') {
        if (userFilters.status === 'active' && !user.isActive) return false;
        if (userFilters.status === 'inactive' && user.isActive) return false;
      }
      return true;
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
            >
              User Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Manage member accounts and user profiles
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
              <p className="text-gray-500 text-center">
                No users match your current filter criteria.
              </p>
            </div>
          ) : (
            filteredUsers.map((user: any, index: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {user.username}
                          </h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <Badge className={`text-xs mt-1 ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            user.role === 'yacht_owner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            user.role === 'service_provider' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            {user.role?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {user.membershipTier && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Membership</span>
                          <Badge className={`text-xs ${
                            user.membershipTier === 'platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            user.membershipTier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            user.membershipTier === 'silver' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                            'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }`}>
                            {user.membershipTier}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Joined</span>
                        <span className="text-white text-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className={`text-xs ${
                        user.isActive !== false ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  // Exact copy from admin dashboard - renderPayments function
  const renderPayments = () => {
    if (!payments) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading payments...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Payment Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Track transactions, revenue, and payment analytics
            </motion.p>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              Transaction History
            </CardTitle>
            <CardDescription>Real-time payment tracking and revenue analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Customer</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Service/Event</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any, index: number) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{payment.customer?.name || payment.user?.username}</p>
                          <p className="text-gray-400 text-sm">{payment.customer?.email || payment.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{payment.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {payment.type === 'service' && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                                Service
                              </Badge>
                            )}
                            {payment.type === 'event' && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                Event
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-right">
                          <span className="text-green-400 font-bold text-lg">${payment.amount.toFixed(2)}</span>
                          {payment.platformFee > 0 && (
                            <div className="mt-1">
                              <p className="text-gray-400 text-xs">Platform: ${payment.adminRevenue.toFixed(2)}</p>
                              <p className="text-blue-400 text-xs">Provider: ${payment.providerRevenue.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <span className="text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</span>
                          <p className="text-gray-400 text-xs">{new Date(payment.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${
                          payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          payment.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {payments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No transactions found</p>
                  <p className="text-gray-500 text-sm">Payment data will appear here in real-time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Exact copy from admin dashboard - renderAnalytics function
  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading analytics...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Analytics Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Advanced business intelligence and performance metrics
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Members</p>
                  <p className="text-2xl font-bold text-white">{analytics.activeMembers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Bookings</p>
                  <p className="text-2xl font-bold text-white">{analytics.monthlyBookings || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">{analytics.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  };

  // Exact copy from admin dashboard - renderNotifications function
  const renderNotifications = () => {
    if (!notifications) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading notifications...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Notification Center
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              System alerts and real-time notifications
            </motion.p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No notifications</p>
                <p className="text-gray-500 text-sm">All caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification: any, index: number) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          notification.priority === 'high' ? 'bg-red-500/20' :
                          notification.priority === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <Bell className={`h-5 w-5 ${
                            notification.priority === 'high' ? 'text-red-400' :
                            notification.priority === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                            <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                            <Badge className={`text-xs ${
                              notification.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  // Exact copy from admin dashboard - renderSettings function
  const renderStaffSettings = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
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
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Enhanced security for staff access</p>
              </div>
              <div className="w-12 h-6 bg-purple-500 rounded-full p-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-500" />
              System Management
            </CardTitle>
            <CardDescription>Backup and maintenance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-900/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">Database Backup</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">Last backup: 2 hours ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  // Basic placeholders for staff-specific sections
  const renderStaffManagement = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Staff Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage staff members and team coordination
          </motion.p>
        </div>
      </div>
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Staff Management System</p>
          <p className="text-gray-500 text-sm">Team coordination and staff oversight tools</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCrewManagement = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Crew Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Yacht crew scheduling and assignment coordination
          </motion.p>
        </div>
      </div>
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-12 text-center">
          <Anchor className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Crew Assignment System</p>
          <p className="text-gray-500 text-sm">Yacht crew coordination and scheduling tools</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCustomerService = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Customer Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Member support and service coordination
          </motion.p>
        </div>
      </div>
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-12 text-center">
          <Phone className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Customer Support Center</p>
          <p className="text-gray-500 text-sm">Member assistance and service management tools</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderYachts = () => (
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
            Fleet Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht fleet and vessel operations
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Yachts
                {(yachtFilters.type !== "all" || yachtFilters.availability !== "all" || 
                  yachtFilters.capacity !== "all") && (
                  <Badge className="ml-2 bg-blue-500 text-white text-xs">
                    {Object.values(yachtFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Yachts</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setYachtFilters({
                      type: "all",
                      availability: "all",
                      capacity: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Type</Label>
                    <Select value={yachtFilters.type} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Motor Yacht">Motor Yacht</SelectItem>
                        <SelectItem value="Sailing Yacht">Sailing Yacht</SelectItem>
                        <SelectItem value="Catamaran">Catamaran</SelectItem>
                        <SelectItem value="Sport Fishing">Sport Fishing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Availability</Label>
                    <Select value={yachtFilters.availability} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, availability: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Capacity</Label>
                    <Select value={yachtFilters.capacity} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, capacity: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="small">Small (1-8 people)</SelectItem>
                        <SelectItem value="medium">Medium (9-15 people)</SelectItem>
                        <SelectItem value="large">Large (15+ people)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredYachts.length} of {yachts?.length || 0} yachts
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setYachtFilters({
                      type: "all",
                      availability: "all",
                      capacity: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-blue-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Yachts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredYachts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Anchor className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No yachts found</h3>
            <p className="text-gray-500 text-center">
              No yachts match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-blue-400 hover:text-blue-300 p-0"
                onClick={() => setYachtFilters({
                  type: "all",
                  availability: "all",
                  capacity: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all yachts.
            </p>
          </div>
        ) : (
          filteredYachts.map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  {yacht.images && yacht.images.length > 1 ? (
                    <div className="relative h-48 bg-gray-900">
                      <img 
                        src={yacht.images[0] || yacht.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                        alt={yacht.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        {yacht.images.slice(0, 4).map((img: string, idx: number) => (
                          <div key={idx} className="relative">
                            <img 
                              src={img}
                              alt={`${yacht.name} ${idx + 1}`}
                              className="w-8 h-8 object-cover rounded border border-white/20"
                            />
                            {idx === 3 && yacht.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-medium">+{yacht.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={yacht.imageUrl || (yacht.images && yacht.images[0]) || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                      alt={yacht.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-500/30">
                      {yacht.size}ft
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{yacht.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{yacht.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Type</span>
                      <span className="text-white font-medium">{yacht.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Capacity</span>
                      <span className="text-white font-medium">{yacht.capacity} guests</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Location</span>
                      <span className="text-white font-medium">{yacht.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Available
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );

  const renderServices = () => (
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
            Service Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht concierge services and providers
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Services
                {(serviceFilters.category !== "all" || serviceFilters.availability !== "all" || 
                  serviceFilters.priceRange !== "all") && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs">
                    {Object.values(serviceFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Services</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setServiceFilters({
                      category: "all",
                      availability: "all",
                      priceRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Category</Label>
                    <Select value={serviceFilters.category} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Categories</SelectItem>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Availability</Label>
                    <Select value={serviceFilters.availability} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, availability: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Price Range</Label>
                    <Select value={serviceFilters.priceRange} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, priceRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="low">Low ($1-$99)</SelectItem>
                        <SelectItem value="medium">Medium ($100-$500)</SelectItem>
                        <SelectItem value="high">High ($500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredServices.length} of {services?.length || 0} services
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setServiceFilters({
                      category: "all",
                      availability: "all",
                      priceRange: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-orange-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No services found</h3>
            <p className="text-gray-500 text-center">
              No services match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-orange-400 hover:text-orange-300 p-0"
                onClick={() => setServiceFilters({
                  category: "all",
                  availability: "all",
                  priceRange: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all services.
            </p>
          </div>
        ) : (
          filteredServices.map((service: any, index: number) => (
            <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden group">
              <div className="relative">
                {service.images && service.images.length > 1 ? (
                  <div className="relative h-48 bg-gray-900">
                    <img 
                      src={service.images[0] || service.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      {service.images.slice(0, 4).map((img: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img 
                            src={img}
                            alt={`${service.name} ${idx + 1}`}
                            className="w-8 h-8 object-cover rounded border border-white/20"
                          />
                          {idx === 3 && service.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-medium">+{service.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <img 
                    src={service.imageUrl || (service.images && service.images[0]) || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30">
                    {service.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${service.pricePerSession}</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-orange-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );

  const renderBookings = () => (
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
            Booking Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monitor and manage all yacht bookings and reservations
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Bookings
                {(bookingFilters.type !== "all" || bookingFilters.status !== "all" || 
                  bookingFilters.dateRange !== "all") && (
                  <Badge className="ml-2 bg-cyan-500 text-white text-xs">
                    {Object.values(bookingFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Bookings</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBookingFilters({
                      type: "all",
                      status: "all",
                      dateRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Type</Label>
                    <Select value={bookingFilters.type} onValueChange={(value) => 
                      setBookingFilters(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Yacht Booking">Yacht Bookings</SelectItem>
                        <SelectItem value="Service Booking">Service Bookings</SelectItem>
                        <SelectItem value="Event Registration">Event Registrations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={bookingFilters.status} onValueChange={(value) => 
                      setBookingFilters(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Date Range</Label>
                    <Select value={bookingFilters.dateRange} onValueChange={(value) => 
                      setBookingFilters(prev => ({ ...prev, dateRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredBookings.length} of {bookings?.length || 0} bookings
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setBookingFilters({
                      type: "all",
                      status: "all",
                      dateRange: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-cyan-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Total</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Total Bookings</h3>
          <p className="text-2xl font-bold text-white">{bookings?.length || 0}</p>
          <p className="text-cyan-400 text-sm mt-1">All time bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Confirmed</h3>
          <p className="text-2xl font-bold text-white">
            {bookings?.filter((b: any) => b.status === 'confirmed').length || 0}
          </p>
          <p className="text-green-400 text-sm mt-1">Ready to sail</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Pending</h3>
          <p className="text-2xl font-bold text-white">
            {bookings?.filter((b: any) => b.status === 'pending').length || 0}
          </p>
          <p className="text-yellow-400 text-sm mt-1">Awaiting confirmation</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Cancelled</h3>
          <p className="text-2xl font-bold text-white">
            {bookings?.filter((b: any) => b.status === 'cancelled').length || 0}
          </p>
          <p className="text-red-400 text-sm mt-1">Cancelled bookings</p>
        </motion.div>
      </div>

      {/* Real-time Bookings Table */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-cyan-500" />
            Recent Bookings
          </CardTitle>
          <CardDescription>Live booking activity and reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Booking ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.slice(0, 10).map((booking: any, index: number) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 font-mono text-sm">#{booking.id}</span>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                          {booking.type?.split(' ')[0] || 'Booking'}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {(booking.user?.username || booking.member?.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{booking.user?.username || booking.member?.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs">{booking.user?.email || booking.member?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {booking.type === 'Service Booking' ? (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        ) : booking.type === 'Event Registration' ? (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                            <Calendar className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Anchor className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-gray-300 text-sm">{booking.type || 'Yacht Booking'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-white font-medium truncate">
                          {booking.yacht?.name || booking.service?.name || booking.event?.title || 'Booking Details'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString() : 'Unknown time'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {booking.status || 'confirmed'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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
  );

  const renderEvents = () => (
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
            Event Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht club events and experiences
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Events
                {(eventFilters.status !== "all" || eventFilters.type !== "all" || 
                  eventFilters.dateRange !== "all") && (
                  <Badge className="ml-2 bg-violet-500 text-white text-xs">
                    {Object.values(eventFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Events</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventFilters({
                      status: "all",
                      type: "all",
                      dateRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={eventFilters.status} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Type</Label>
                    <Select value={eventFilters.type} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Dining">Dining</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Date Range</Label>
                    <Select value={eventFilters.dateRange} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, dateRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredEvents.length} of {events?.length || 0} events
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setEventFilters({
                      status: "all",
                      type: "all",
                      dateRange: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-violet-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500 text-center">
              No events match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-violet-400 hover:text-violet-300 p-0"
                onClick={() => setEventFilters({
                  status: "all",
                  type: "all",
                  dateRange: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all events.
            </p>
          </div>
        ) : (
          filteredEvents.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  {event.images && event.images.length > 1 ? (
                    <div className="relative h-48 bg-gray-900">
                      <img 
                        src={event.images[0] || event.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        {event.images.slice(0, 4).map((img: string, idx: number) => (
                          <div key={idx} className="relative">
                            <img 
                              src={img}
                              alt={`${event.title} ${idx + 1}`}
                              className="w-8 h-8 object-cover rounded border border-white/20"
                            />
                            {idx === 3 && event.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-medium">+{event.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={event.imageUrl || (event.images && event.images[0]) || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-violet-500/30">
                      {event.maxCapacity} guests
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Date</span>
                      <span className="text-white font-medium">{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Location</span>
                      <span className="text-white font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="text-white font-medium">${event.ticketPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                      {event.eventType}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-violet-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );

  const renderStaffPayments = () => (
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
            Payment Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monitor transactions and financial operations
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Payments
                {(paymentFilters.status !== "all" || paymentFilters.method !== "all" || 
                  paymentFilters.dateRange !== "all") && (
                  <Badge className="ml-2 bg-emerald-500 text-white text-xs">
                    {Object.values(paymentFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Payments</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentFilters({
                      status: "all",
                      method: "all",
                      dateRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={paymentFilters.status} onValueChange={(value) => 
                      setPaymentFilters(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Method</Label>
                    <Select value={paymentFilters.method} onValueChange={(value) => 
                      setPaymentFilters(prev => ({ ...prev, method: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Date Range</Label>
                    <Select value={paymentFilters.dateRange} onValueChange={(value) => 
                      setPaymentFilters(prev => ({ ...prev, dateRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredPayments.length} of {payments?.length || 0} payments
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setPaymentFilters({
                      status: "all",
                      method: "all",
                      dateRange: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-emerald-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Total</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">
            ${payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toFixed(2) || '0.00'}
          </p>
          <p className="text-green-400 text-sm mt-1">All time revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Completed</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Completed</h3>
          <p className="text-2xl font-bold text-white">
            {payments?.filter((p: any) => p.status === 'completed').length || 0}
          </p>
          <p className="text-blue-400 text-sm mt-1">Successful payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Pending</h3>
          <p className="text-2xl font-bold text-white">
            {payments?.filter((p: any) => p.status === 'pending').length || 0}
          </p>
          <p className="text-yellow-400 text-sm mt-1">Awaiting processing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Failed</h3>
          <p className="text-2xl font-bold text-white">
            {payments?.filter((p: any) => p.status === 'failed').length || 0}
          </p>
          <p className="text-red-400 text-sm mt-1">Failed transactions</p>
        </motion.div>
      </div>

      {/* Payments Table */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Live payment activity and financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Method</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.slice(0, 10).map((payment: any, index: number) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 font-mono text-sm">#{payment.stripePaymentIntentId || payment.id}</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          {payment.paymentMethod || 'stripe'}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {(payment.user?.username || payment.member?.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.user?.username || payment.member?.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs">{payment.user?.email || payment.member?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-bold text-lg">${payment.amount.toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">{payment.currency || 'USD'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                          <CreditCard className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm capitalize">{payment.paymentMethod || 'stripe'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : 'Unknown time'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${
                        payment.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        payment.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {payment.status || 'completed'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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
  );

  const renderStaffAnalytics = () => (
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
            className="text-4xl font-bold text-white mb-2"
          >
            Advanced Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Real-time insights into club performance and optimization opportunities
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Time Period
          </Button>
        </motion.div>
      </div>

      {analytics ? (
        <>
          {/* Real-time Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${analytics.overview.totalRevenue.toFixed(2)}`}
              change={analytics.trends.revenueGrowth}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-500"
              delay={0}
            />
            <StatCard
              title="Active Bookings"
              value={analytics.overview.totalBookings.toString()}
              change={analytics.trends.memberGrowth}
              icon={Activity}
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Active Members"
              value={analytics.overview.activeMembers.toString()}
              change={analytics.trends.memberGrowth}
              icon={Users}
              gradient="from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="Customer Satisfaction"
              value={`${analytics.realTimeMetrics.customerSatisfaction}/5`}
              change={12}
              icon={Star}
              gradient="from-yellow-500 to-orange-500"
              delay={0.3}
            />
          </div>

          {/* Performance Metrics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Performance */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Top Service Performance
                </CardTitle>
                <CardDescription>Highest revenue generating services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.services.slice(0, 5).map((service: any, index: number) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                    >
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-gray-400 text-sm">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${service.totalRevenue.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">{service.totalBookings} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Yacht Utilization */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Fleet Utilization
                </CardTitle>
                <CardDescription>Yacht performance and booking rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.yachts.slice(0, 5).map((yacht: any, index: number) => (
                    <motion.div
                      key={yacht.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                    >
                      <div>
                        <p className="text-white font-medium">{yacht.name}</p>
                        <p className="text-gray-400 text-sm">{yacht.size}ft</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{yacht.utilizationRate.toFixed(1)}%</p>
                        <p className="text-gray-400 text-sm">{yacht.totalBookings} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends and Member Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Booking Trends */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Monthly Booking Trends
                </CardTitle>
                <CardDescription>Booking volume over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.monthlyBookings.map((month: any, index: number) => {
                    const maxBookings = Math.max(...analytics.trends.monthlyBookings.map((m: any) => m.bookings));
                    const percentage = maxBookings > 0 ? (month.bookings / maxBookings) * 100 : 0;
                    
                    return (
                      <motion.div
                        key={month.month}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex items-center space-x-4"
                      >
                        <span className="text-white font-medium w-12">{month.month}</span>
                        <div className="flex-1 bg-gray-900 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12">{month.bookings}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Membership Distribution */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-500" />
                  Membership Distribution
                </CardTitle>
                <CardDescription>Member tier breakdown and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.demographics.membershipBreakdown).map(([tier, count]: [string, any], index: number) => {
                    const totalMembers = Object.values(analytics.demographics.membershipBreakdown).reduce((a: any, b: any) => a + b, 0);
                    const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
                    
                    const tierColors = {
                      platinum: 'from-purple-500 to-indigo-500',
                      gold: 'from-yellow-500 to-orange-500',
                      silver: 'from-gray-400 to-gray-500',
                      bronze: 'from-orange-600 to-red-500'
                    };
                    
                    return (
                      <motion.div
                        key={tier}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors] || 'from-gray-500 to-gray-600'}`} />
                          <span className="text-white capitalize font-medium">{tier}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{count}</p>
                          <p className="text-gray-400 text-sm">{percentage.toFixed(1)}%</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Performance */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Event Performance
              </CardTitle>
              <CardDescription>Event capacity and revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.performance.events.slice(0, 6).map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                  >
                    <h4 className="text-white font-medium mb-2">{event.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Capacity</span>
                        <span className="text-white">{event.capacityFilled.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(event.capacityFilled, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-white">${event.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Loading Analytics...</h3>
              <p className="text-gray-400">Fetching real-time data from database</p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Hamburger menu button - fixed top left, hidden when menu is open */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-4 z-[9999] p-3 rounded-xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 text-white hover:bg-gray-800/80 transition-all duration-300"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Close button - animated from right side when menu is open */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.button
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-4 right-4 z-[9999] p-3 rounded-xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 text-white hover:bg-gray-800/80 transition-all duration-300"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          ref={sidebarRef}
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: sidebarCollapsed ? -320 : 0,
            opacity: sidebarCollapsed ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col fixed h-full flex-shrink-0 z-50"
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: -320, right: 0 }}
          onPan={handlePan}
          dragElastic={0.1}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/api/media/MBYC-LOGO-WHITE_1750688569645.png" 
                    alt="MBYC Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Staff Portal</h2>
                  <p className="text-sm text-gray-400">Miami Beach Yacht Club</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6">
            <div className="space-y-2 pb-4">
              {displayItems.map((item, index) => {
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
              <div className="profile-picture-outline h-12 w-12">
                <div className="profile-picture-inner w-full h-full">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Staff User'}</p>
                <p className="text-xs text-gray-400">Staff Member</p>
              </div>
              
              {/* Messages and Notifications beside username */}
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
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'crew-management' && <CrewManagementPage />}
            {activeSection === 'staff-management' && <StaffManagement />}
            {activeSection === 'yacht-maintenance' && <YachtMaintenancePage />}
            {activeSection === 'customer-service' && <CustomerServiceDashboard />}
            {activeSection === 'messenger' && <MessengerDashboard />}
            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'settings' && renderSettings()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}