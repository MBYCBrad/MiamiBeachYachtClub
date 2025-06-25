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
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500' },
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-teal-500 to-cyan-500' },
  { id: 'staff-management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'yachts', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-teal-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
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

  // Service filters
  const [serviceFilters, setServiceFilters] = useState({
    category: "all",
    availability: "all",
    priceRange: "all"
  });

  // Event filters
  const [eventFilters, setEventFilters] = useState({
    status: "all",
    capacity: "all",
    priceRange: "all"
  });

  // Payment filters
  const [paymentFilters, setPaymentFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all"
  });

  // Booking filters
  const [bookingFilters, setBookingFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all"
  });

  // API Queries - using staff endpoints where appropriate
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/admin/yachts'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/admin/services'],
  });

  const { data: events } = useQuery({
    queryKey: ['/api/admin/events'],
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/admin/payments'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
  });

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

  // EXACT COPY of Admin Dashboard render functions
  function renderOverview() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
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
            Comprehensive staff management and operations dashboard
          </motion.p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
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
                  <span className="text-green-500 text-sm">+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
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
                  <Calendar className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-purple-400 text-sm">+8% this week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-300">
                  <DollarSign className="h-8 w-8 text-white" />
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
                  ${stats?.totalRevenue?.toLocaleString() || '0'}
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
                  <Sparkles className="h-8 w-8 text-white" />
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
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used staff operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button
                  onClick={() => setActiveSection('users')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <Users className="h-6 w-6 mb-2 text-green-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Users</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('bookings')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <Calendar className="h-6 w-6 mb-2 text-purple-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Bookings</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('yachts')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <Anchor className="h-6 w-6 mb-2 text-blue-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Fleet</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('services')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <Sparkles className="h-6 w-6 mb-2 text-orange-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Services</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('events')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <CalendarDays className="h-6 w-6 mb-2 text-violet-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Events</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('analytics')}
                  variant="outline"
                  className="h-20 bg-gray-800/50 border-gray-700 hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 hover:border-transparent flex flex-col items-center justify-center group transition-all duration-300"
                >
                  <TrendingUp className="h-6 w-6 mb-2 text-pink-500 group-hover:text-white transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

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
            User Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage members, yacht owners, and service providers
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
                Filter Users
                {(userFilters.role !== "all" || userFilters.membershipTier !== "all" || 
                  userFilters.status !== "all") && (
                  <Badge className="ml-2 bg-green-500 text-white text-xs">
                    {Object.values(userFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Users</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserFilters({
                      role: "all",
                      membershipTier: "all",
                      status: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Role</Label>
                    <Select value={userFilters.role} onValueChange={(value) => 
                      setUserFilters(prev => ({ ...prev, role: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Member">Members</SelectItem>
                        <SelectItem value="Yacht Owner">Yacht Owners</SelectItem>
                        <SelectItem value="Service Provider">Service Providers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Membership Tier</Label>
                    <Select value={userFilters.membershipTier} onValueChange={(value) => 
                      setUserFilters(prev => ({ ...prev, membershipTier: value }))
                    }>
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
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={userFilters.status} onValueChange={(value) => 
                      setUserFilters(prev => ({ ...prev, status: value }))
                    }>
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
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredUsers.length} of {users?.length || 0} users
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setUserFilters({
                      role: "all",
                      membershipTier: "all",
                      status: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-green-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
            <p className="text-gray-500 text-center">
              No users match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-green-400 hover:text-green-300 p-0"
                onClick={() => setUserFilters({
                  role: "all",
                  membershipTier: "all",
                  status: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all users.
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
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg font-semibold">
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{user.username}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Role</span>
                      <Badge className={`${
                        user.role === 'Member' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        user.role === 'Yacht Owner' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        user.role === 'Service Provider' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {user.role}
                      </Badge>
                    </div>
                    
                    {user.membershipTier && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Tier</span>
                        <Badge className={`${
                          user.membershipTier === 'Platinum' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30' :
                          user.membershipTier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          user.membershipTier === 'Silver' ? 'bg-gray-300/20 text-gray-300 border-gray-300/30' :
                          'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {user.membershipTier}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <Badge className={`${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {user.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-green-400 hover:text-white">
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
            {activeSection === 'analytics' && <div>Analytics coming soon</div>}
            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'settings' && <div>Settings coming soon</div>}
            {activeSection === 'bookings' && renderBookings()}
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'yacht-maintenance' && <YachtMaintenancePage />}
            {activeSection === 'crew-management' && <CrewManagementPage />}
            {activeSection === 'customer-service' && <CustomerServiceDashboard />}
            {activeSection === 'staff-management' && <StaffManagement />}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'yachts' && renderYachts()}
            {activeSection === 'services' && renderServices()}
            {activeSection === 'events' && <div>Events coming soon</div>}
            {activeSection === 'payments' && <div>Payments coming soon</div>}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}