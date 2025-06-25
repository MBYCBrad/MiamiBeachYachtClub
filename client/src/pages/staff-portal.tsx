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
import YachtMaintenanceFixed from "./yacht-maintenance-fixed";
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
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-blue-500 to-indigo-500' },
  { id: 'staff-management', label: 'Staff Management', icon: UserCheck, color: 'from-purple-500 to-indigo-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-emerald-500 to-cyan-500' },
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

  // Mutations for CRUD operations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest('/api/staff/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/users'] });
      setIsAddUserDialogOpen(false);
      setNewUserData({
        username: '',
        email: '',
        password: '',
        role: 'member',
        membershipTier: 'bronze',
        fullName: '',
        phone: '',
        location: ''
      });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: any) => apiRequest(`/api/staff/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/users'] });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/users/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  // Yacht mutations
  const createYachtMutation = useMutation({
    mutationFn: (yachtData: any) => apiRequest('/api/staff/yachts', {
      method: 'POST',
      body: JSON.stringify(yachtData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/yachts'] });
      setIsAddYachtDialogOpen(false);
      setNewYachtData({
        name: '',
        location: '',
        capacity: '',
        type: '',
        length: '',
        yearMade: '',
        totalCost: '',
        description: '',
        amenities: [],
        ownerId: ''
      });
      toast({
        title: "Success",
        description: "Yacht created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create yacht",
        variant: "destructive",
      });
    }
  });

  const updateYachtMutation = useMutation({
    mutationFn: ({ id, ...yachtData }: any) => apiRequest(`/api/staff/yachts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(yachtData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/yachts'] });
      setIsEditYachtDialogOpen(false);
      setSelectedYacht(null);
      toast({
        title: "Success",
        description: "Yacht updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update yacht",
        variant: "destructive",
      });
    }
  });

  const deleteYachtMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/yachts/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/yachts'] });
      toast({
        title: "Success",
        description: "Yacht deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete yacht",
        variant: "destructive",
      });
    }
  });

  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: (serviceData: any) => apiRequest('/api/staff/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/services'] });
      setIsAddServiceDialogOpen(false);
      setNewServiceData({
        title: '',
        description: '',
        category: '',
        pricePerSession: '',
        duration: '',
        location: '',
        providerId: ''
      });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: (serviceData: any) => apiRequest(`/api/staff/services/${serviceData.id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/services'] });
      setIsEditServiceDialogOpen(false);
      setSelectedService(null);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/services/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/services'] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  });

  // Event mutations
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest('/api/staff/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/events'] });
      setIsAddEventDialogOpen(false);
      setNewEventData({
        title: '',
        description: '',
        eventType: '',
        location: '',
        maxCapacity: '',
        ticketPrice: '',
        eventDate: ''
      });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest(`/api/staff/events/${eventData.id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/events'] });
      setIsEditEventDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/events/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    }
  };

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

  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

  // Dialog states for CRUD operations
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    membershipTier: 'bronze',
    fullName: '',
    phone: '',
    location: ''
  });

  // Yacht dialog states
  const [isAddYachtDialogOpen, setIsAddYachtDialogOpen] = useState(false);
  const [isEditYachtDialogOpen, setIsEditYachtDialogOpen] = useState(false);
  const [isViewYachtDialogOpen, setIsViewYachtDialogOpen] = useState(false);
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [newYachtData, setNewYachtData] = useState({
    name: '',
    location: '',
    capacity: '',
    type: '',
    length: '',
    yearMade: '',
    totalCost: '',
    description: '',
    amenities: [] as string[],
    ownerId: ''
  });

  // Service dialog states
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [isViewServiceDialogOpen, setIsViewServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [newServiceData, setNewServiceData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerSession: '',
    duration: '',
    location: '',
    providerId: ''
  });

  // Event dialog states
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    eventType: '',
    location: '',
    maxCapacity: '',
    ticketPrice: '',
    eventDate: ''
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

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return (bookings as any[]).filter((booking: any) => {
      const statusMatch = bookingFilters.status === "all" || booking.status === bookingFilters.status;
      const tierMatch = bookingFilters.membershipTier === "all" || booking.memberTier === bookingFilters.membershipTier;
      const sizeMatch = bookingFilters.yachtSize === "all" || 
        (bookingFilters.yachtSize === "small" && booking.yachtSize <= 30) ||
        (bookingFilters.yachtSize === "medium" && booking.yachtSize > 30 && booking.yachtSize <= 50) ||
        (bookingFilters.yachtSize === "large" && booking.yachtSize > 50 && booking.yachtSize <= 80) ||
        (bookingFilters.yachtSize === "luxury" && booking.yachtSize > 80);
      
      const timeMatch = bookingFilters.timeRange === "all" ||
        (bookingFilters.timeRange === "today" && new Date(booking.startTime).toDateString() === new Date().toDateString()) ||
        (bookingFilters.timeRange === "week" && new Date(booking.startTime) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (bookingFilters.timeRange === "month" && new Date(booking.startTime) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (bookingFilters.timeRange === "upcoming" && new Date(booking.startTime) >= new Date());

      return statusMatch && tierMatch && sizeMatch && timeMatch;
    }).sort((a: any, b: any) => {
      switch (bookingFilters.sortBy) {
        case 'date':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'yacht':
          return (a.yachtName || '').localeCompare(b.yachtName || '');
        case 'member':
          return (a.memberName || '').localeCompare(b.memberName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });
  }, [bookings, bookingFilters]);

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

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    return payments.filter((payment: any) => {
      // Status filter
      if (paymentFilters.status !== 'all' && payment.status !== paymentFilters.status) {
        return false;
      }
      
      // Method filter
      if (paymentFilters.method !== 'all' && payment.paymentMethod !== paymentFilters.method) {
        return false;
      }
      
      // Search filter
      if (paymentSearchTerm) {
        const searchTerm = paymentSearchTerm.toLowerCase();
        const matchesCustomer = (payment.customer || '').toLowerCase().includes(searchTerm);
        const matchesService = (payment.serviceEvent || '').toLowerCase().includes(searchTerm);
        const matchesId = (payment.stripePaymentIntentId || payment.id.toString()).toLowerCase().includes(searchTerm);
        
        if (!matchesCustomer && !matchesService && !matchesId) {
          return false;
        }
      }
      
      return true;
    });
  }, [payments, paymentFilters, paymentSearchTerm]);



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
            className="border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white bg-gray-900/50 hover:bg-gray-800/80 transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-purple-600/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white mb-2">{adminStats.totalUsers || 0}</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400 font-medium">+{adminStats.monthlyGrowth || 0}%</span>
                    <span className="text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-white mb-2">{adminStats.totalBookings || 0}</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-gray-400">Active reservations</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
                  <CalendarDays className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mb-2">${(adminStats.totalRevenue || 0).toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-emerald-400 mr-1" />
                    <span className="text-emerald-400 font-medium">Revenue streams</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">Active Services</p>
                  <p className="text-3xl font-bold text-white mb-2">{adminStats.activeServices || 0}</p>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-orange-400 mr-1" />
                    <span className="text-gray-400">Premium offerings</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl">
                  <Sparkles className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Membership Breakdown */}
      {adminStats.membershipBreakdown && adminStats.membershipBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Membership Distribution</CardTitle>
              <CardDescription className="text-gray-400">Current membership tier breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {adminStats.membershipBreakdown.map((tier: any, index: number) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="text-2xl font-bold text-white mb-1">{tier.count}</div>
                    <div className="text-sm text-gray-400 mb-2">{tier.tier}</div>
                    <div className="text-xs text-purple-400 font-medium">{tier.percentage}%</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Frequently used staff functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setActiveSection('users')}
                variant="outline"
                className="h-20 flex-col space-y-2 border-gray-600 hover:border-purple-500 bg-gray-800/50 hover:bg-gray-700/80"
              >
                <Users className="h-6 w-6 text-purple-400" />
                <span className="text-white">Manage Users</span>
              </Button>
              
              <Button
                onClick={() => setActiveSection('yachts')}
                variant="outline"
                className="h-20 flex-col space-y-2 border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-700/80"
              >
                <Anchor className="h-6 w-6 text-blue-400" />
                <span className="text-white">Fleet Management</span>
              </Button>
              
              <Button
                onClick={() => setActiveSection('bookings')}
                variant="outline"
                className="h-20 flex-col space-y-2 border-gray-600 hover:border-emerald-500 bg-gray-800/50 hover:bg-gray-700/80"
              >
                <Calendar className="h-6 w-6 text-emerald-400" />
                <span className="text-white">View Bookings</span>
              </Button>
              
              <Button
                onClick={() => setActiveSection('analytics')}
                variant="outline"
                className="h-20 flex-col space-y-2 border-gray-600 hover:border-pink-500 bg-gray-800/50 hover:bg-gray-700/80"
              >
                <TrendingUp className="h-6 w-6 text-pink-400" />
                <span className="text-white">Analytics</span>
              </Button>
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
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
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
            filteredUsers.map((userItem: any, index: number) => (
              <motion.div
                key={userItem.id}
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
                          <AvatarImage src={userItem.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            {userItem.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {userItem.username}
                          </h3>
                          <p className="text-gray-400 text-sm">{userItem.email}</p>
                          <Badge className={`text-xs mt-1 ${
                            userItem.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            userItem.role === 'yacht_owner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            userItem.role === 'service_provider' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            {userItem.role?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {userItem.membershipTier && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Membership</span>
                          <Badge className={`text-xs ${
                            userItem.membershipTier === 'platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            userItem.membershipTier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            userItem.membershipTier === 'silver' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                            'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }`}>
                            {userItem.membershipTier}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Joined</span>
                        <span className="text-white text-sm">
                          {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            setSelectedUser(userItem);
                            setIsViewUserDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            setSelectedUser(userItem);
                            setIsEditUserDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-red-400"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${userItem.username}?`)) {
                              deleteUserMutation.mutate(userItem.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className={`text-xs ${
                        userItem.isActive !== false ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {userItem.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Add User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Add New User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new user account with role and membership settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Role</Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData({...newUserData, role: value})}>
                  <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-600 text-white">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="membershipTier" className="text-white">Membership Tier</Label>
                <Select value={newUserData.membershipTier} onValueChange={(value) => setNewUserData({...newUserData, membershipTier: value})}>
                  <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-600 text-white">
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone</Label>
                <Input
                  id="phone"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={newUserData.location}
                  onChange={(e) => setNewUserData({...newUserData, location: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                  placeholder="Enter location"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="border-gray-600 text-gray-400">
                Cancel
              </Button>
              <Button 
                onClick={() => createUserMutation.mutate(newUserData)}
                disabled={createUserMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">User Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View user information and account details
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Username</Label>
                  <p className="text-white font-medium">{selectedUser.username}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Full Name</Label>
                  <p className="text-white font-medium">{selectedUser.fullName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Role</Label>
                  <Badge className={`${
                    selectedUser.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    selectedUser.role === 'yacht_owner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    selectedUser.role === 'service_provider' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  }`}>
                    {selectedUser.role?.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Membership Tier</Label>
                  <Badge className={`${
                    selectedUser.membershipTier === 'platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    selectedUser.membershipTier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    selectedUser.membershipTier === 'silver' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                    'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {selectedUser.membershipTier || 'bronze'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Status</Label>
                  <Badge className={selectedUser.isActive !== false ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white font-medium">{selectedUser.phone || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Location</Label>
                  <p className="text-white font-medium">{selectedUser.location || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Member Since</Label>
                  <p className="text-white font-medium">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewUserDialogOpen(false)} className="border-gray-600 text-gray-400">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Edit User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update user information and account settings
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username" className="text-white">Username</Label>
                  <Input
                    id="edit-username"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                    className="bg-gray-950 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-white">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="bg-gray-950 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName" className="text-white">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={selectedUser.fullName || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                    className="bg-gray-950 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-white">Role</Label>
                  <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}>
                    <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-600 text-white">
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-membershipTier" className="text-white">Membership Tier</Label>
                  <Select value={selectedUser.membershipTier || 'bronze'} onValueChange={(value) => setSelectedUser({...selectedUser, membershipTier: value})}>
                    <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-600 text-white">
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-white">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    className="bg-gray-950 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-location" className="text-white">Location</Label>
                  <Input
                    id="edit-location"
                    value={selectedUser.location || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, location: e.target.value})}
                    className="bg-gray-950 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-white">Status</Label>
                  <Select value={selectedUser.isActive !== false ? 'active' : 'inactive'} onValueChange={(value) => setSelectedUser({...selectedUser, isActive: value === 'active'})}>
                    <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-600 text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)} className="border-gray-600 text-gray-400">
                Cancel
              </Button>
              <Button 
                onClick={() => updateUserMutation.mutate(selectedUser)}
                disabled={updateUserMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {(payment.customer || payment.fullName || payment.username || 'Demo Member')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{payment.customer || payment.fullName || payment.username || 'Demo Member'}</p>
                            <p className="text-gray-400 text-sm">{payment.customerEmail || payment.email || 'member@mbyc.com'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{payment.serviceEvent || payment.serviceName || payment.description || 'Professional Makeup Artist'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/30 text-xs">
                              {payment.serviceCategory || 'Beauty & Grooming'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-right">
                          <span className="text-green-400 font-bold text-lg">${Number(payment.amount || 0).toFixed(2)}</span>
                          {payment.platformFee > 0 && (
                            <div className="mt-1">
                              <p className="text-gray-400 text-xs">Platform: ${Number(payment.adminRevenue || 0).toFixed(2)}</p>
                              <p className="text-blue-400 text-xs">Provider: ${Number(payment.providerRevenue || 0).toFixed(2)}</p>
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              // View payment details functionality
                              toast({
                                title: "Payment Details",
                                description: `Viewing details for payment ${payment.id}`,
                              });
                            }}
                          >
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
                  <p className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{analytics?.totalBookings || 0}</p>
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
                  <p className="text-2xl font-bold text-white">4.8</p>
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            // View notification details
                            toast({
                              title: "Notification Details",
                              description: `Viewing details for: ${notification.title}`,
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-red-400"
                          onClick={() => {
                            // Delete notification functionality
                            if (confirm(`Are you sure you want to dismiss this notification?`)) {
                              toast({
                                title: "Notification Dismissed",
                                description: "Notification has been removed",
                              });
                            }
                          }}
                        >
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
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleLogout}
            className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                          setSelectedYacht(yacht);
                          setIsViewYachtDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                          setSelectedYacht(yacht);
                          setIsEditYachtDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete yacht ${yacht.name}?`)) {
                            deleteYachtMutation.mutate(yacht.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Yacht Dialog */}
      <Dialog open={isAddYachtDialogOpen} onOpenChange={setIsAddYachtDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Add New Yacht</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new yacht listing for the fleet
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="yacht-name" className="text-white">Yacht Name</Label>
              <Input
                id="yacht-name"
                value={newYachtData.name}
                onChange={(e) => setNewYachtData({...newYachtData, name: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter yacht name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yacht-location" className="text-white">Location</Label>
              <Input
                id="yacht-location"
                value={newYachtData.location}
                onChange={(e) => setNewYachtData({...newYachtData, location: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yacht-type" className="text-white">Type</Label>
              <Select value={newYachtData.type} onValueChange={(value) => setNewYachtData({...newYachtData, type: value})}>
                <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-600 text-white">
                  <SelectItem value="Motor Yacht">Motor Yacht</SelectItem>
                  <SelectItem value="Sailing Yacht">Sailing Yacht</SelectItem>
                  <SelectItem value="Catamaran">Catamaran</SelectItem>
                  <SelectItem value="Sport Fishing">Sport Fishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yacht-capacity" className="text-white">Capacity</Label>
              <Input
                id="yacht-capacity"
                type="number"
                value={newYachtData.capacity}
                onChange={(e) => setNewYachtData({...newYachtData, capacity: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter capacity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yacht-length" className="text-white">Length (ft)</Label>
              <Input
                id="yacht-length"
                type="number"
                value={newYachtData.length}
                onChange={(e) => setNewYachtData({...newYachtData, length: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter length"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yacht-year" className="text-white">Year Made</Label>
              <Input
                id="yacht-year"
                type="number"
                value={newYachtData.yearMade}
                onChange={(e) => setNewYachtData({...newYachtData, yearMade: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter year"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="yacht-description" className="text-white">Description</Label>
              <Input
                id="yacht-description"
                value={newYachtData.description}
                onChange={(e) => setNewYachtData({...newYachtData, description: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddYachtDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => createYachtMutation.mutate(newYachtData)}
              disabled={createYachtMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Yacht Dialog */}
      <Dialog open={isViewYachtDialogOpen} onOpenChange={setIsViewYachtDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Yacht Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View yacht information and specifications
            </DialogDescription>
          </DialogHeader>
          
          {selectedYacht && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Yacht Name</Label>
                <p className="text-white font-medium">{selectedYacht.name}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Location</Label>
                <p className="text-white font-medium">{selectedYacht.location}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Type</Label>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedYacht.type}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Capacity</Label>
                <p className="text-white font-medium">{selectedYacht.capacity} guests</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Length</Label>
                <p className="text-white font-medium">{selectedYacht.size || selectedYacht.length}ft</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Year Made</Label>
                <p className="text-white font-medium">{selectedYacht.yearMade || 'Not specified'}</p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-400">Description</Label>
                <p className="text-white font-medium">{selectedYacht.description || 'No description available'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewYachtDialogOpen(false)} className="border-gray-600 text-gray-400">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Yacht Dialog */}
      <Dialog open={isEditYachtDialogOpen} onOpenChange={setIsEditYachtDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Yacht</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update yacht information and specifications
            </DialogDescription>
          </DialogHeader>
          
          {selectedYacht && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-name" className="text-white">Yacht Name</Label>
                <Input
                  id="edit-yacht-name"
                  value={selectedYacht.name}
                  onChange={(e) => setSelectedYacht({...selectedYacht, name: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-location" className="text-white">Location</Label>
                <Input
                  id="edit-yacht-location"
                  value={selectedYacht.location}
                  onChange={(e) => setSelectedYacht({...selectedYacht, location: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-type" className="text-white">Type</Label>
                <Select value={selectedYacht.type} onValueChange={(value) => setSelectedYacht({...selectedYacht, type: value})}>
                  <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-600 text-white">
                    <SelectItem value="Motor Yacht">Motor Yacht</SelectItem>
                    <SelectItem value="Sailing Yacht">Sailing Yacht</SelectItem>
                    <SelectItem value="Catamaran">Catamaran</SelectItem>
                    <SelectItem value="Sport Fishing">Sport Fishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-capacity" className="text-white">Capacity</Label>
                <Input
                  id="edit-yacht-capacity"
                  type="number"
                  value={selectedYacht.capacity}
                  onChange={(e) => setSelectedYacht({...selectedYacht, capacity: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-length" className="text-white">Length (ft)</Label>
                <Input
                  id="edit-yacht-length"
                  type="number"
                  value={selectedYacht.size || selectedYacht.length}
                  onChange={(e) => setSelectedYacht({...selectedYacht, size: parseInt(e.target.value), length: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-yacht-year" className="text-white">Year Made</Label>
                <Input
                  id="edit-yacht-year"
                  type="number"
                  value={selectedYacht.yearMade || ''}
                  onChange={(e) => setSelectedYacht({...selectedYacht, yearMade: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-yacht-description" className="text-white">Description</Label>
                <Input
                  id="edit-yacht-description"
                  value={selectedYacht.description || ''}
                  onChange={(e) => setSelectedYacht({...selectedYacht, description: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditYachtDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => updateYachtMutation.mutate(selectedYacht)}
              disabled={updateYachtMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {updateYachtMutation.isPending ? "Updating..." : "Update Yacht"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => setIsAddServiceDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
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
                <h3 className="text-xl font-bold text-white mb-2">{service.title || service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${service.pricePerSession}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setSelectedService(service);
                        setIsViewServiceDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setSelectedService(service);
                        setIsEditServiceDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-red-400"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete service ${service.name}?`)) {
                          deleteServiceMutation.mutate(service.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Add New Service</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new concierge service for yacht experiences
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-title" className="text-white">Service Title</Label>
              <Input
                id="service-title"
                value={newServiceData.title}
                onChange={(e) => setNewServiceData({...newServiceData, title: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter service title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-category" className="text-white">Category</Label>
              <Select value={newServiceData.category} onValueChange={(value) => setNewServiceData({...newServiceData, category: value})}>
                <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-600 text-white">
                  <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                  <SelectItem value="Culinary">Culinary</SelectItem>
                  <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                  <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Water Sports">Water Sports</SelectItem>
                  <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-price" className="text-white">Price per Session</Label>
              <Input
                id="service-price"
                type="number"
                value={newServiceData.pricePerSession}
                onChange={(e) => setNewServiceData({...newServiceData, pricePerSession: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-duration" className="text-white">Duration (hours)</Label>
              <Input
                id="service-duration"
                type="number"
                value={newServiceData.duration}
                onChange={(e) => setNewServiceData({...newServiceData, duration: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter duration"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="service-description" className="text-white">Description</Label>
              <Input
                id="service-description"
                value={newServiceData.description}
                onChange={(e) => setNewServiceData({...newServiceData, description: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => createServiceMutation.mutate(newServiceData)}
              disabled={createServiceMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {createServiceMutation.isPending ? "Creating..." : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Service Dialog */}
      <Dialog open={isViewServiceDialogOpen} onOpenChange={setIsViewServiceDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Service Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View service information and pricing
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Service Title</Label>
                <p className="text-white font-medium">{selectedService.title || selectedService.name}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Category</Label>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {selectedService.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Price per Session</Label>
                <p className="text-white font-medium">${selectedService.pricePerSession}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Duration</Label>
                <p className="text-white font-medium">{selectedService.duration || 'Not specified'} hours</p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-400">Description</Label>
                <p className="text-white font-medium">{selectedService.description || 'No description available'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewServiceDialogOpen(false)} className="border-gray-600 text-gray-400">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceDialogOpen} onOpenChange={setIsEditServiceDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Service</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update service information and pricing
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-title" className="text-white">Service Title</Label>
                <Input
                  id="edit-service-title"
                  value={selectedService.title || selectedService.name}
                  onChange={(e) => setSelectedService({...selectedService, title: e.target.value, name: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-category" className="text-white">Category</Label>
                <Select value={selectedService.category} onValueChange={(value) => setSelectedService({...selectedService, category: value})}>
                  <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-600 text-white">
                    <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                    <SelectItem value="Culinary">Culinary</SelectItem>
                    <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                    <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Water Sports">Water Sports</SelectItem>
                    <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-price" className="text-white">Price per Session</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  value={selectedService.pricePerSession}
                  onChange={(e) => setSelectedService({...selectedService, pricePerSession: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-duration" className="text-white">Duration (hours)</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  value={selectedService.duration || ''}
                  onChange={(e) => setSelectedService({...selectedService, duration: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-service-description" className="text-white">Description</Label>
                <Input
                  id="edit-service-description"
                  value={selectedService.description || ''}
                  onChange={(e) => setSelectedService({...selectedService, description: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditServiceDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => updateServiceMutation.mutate(selectedService)}
              disabled={updateServiceMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {updateServiceMutation.isPending ? "Updating..." : "Update Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => setIsAddYachtDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
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
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => setIsAddEventDialogOpen(true)}
          >
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsViewEventDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEditEventDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete event ${event.title}?`)) {
                            deleteEventMutation.mutate(event.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Add New Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new yacht club event or experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-white">Event Title</Label>
              <Input
                id="event-title"
                value={newEventData.title}
                onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter event title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-location" className="text-white">Location</Label>
              <Input
                id="event-location"
                value={newEventData.location}
                onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-type" className="text-white">Event Type</Label>
              <Select value={newEventData.eventType} onValueChange={(value) => setNewEventData({...newEventData, eventType: value})}>
                <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-600 text-white">
                  <SelectItem value="Dining">Dining</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-capacity" className="text-white">Max Capacity</Label>
              <Input
                id="event-capacity"
                type="number"
                value={newEventData.maxCapacity}
                onChange={(e) => setNewEventData({...newEventData, maxCapacity: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter capacity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-price" className="text-white">Ticket Price</Label>
              <Input
                id="event-price"
                type="number"
                value={newEventData.ticketPrice}
                onChange={(e) => setNewEventData({...newEventData, ticketPrice: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter ticket price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-date" className="text-white">Event Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEventData.eventDate}
                onChange={(e) => setNewEventData({...newEventData, eventDate: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="event-description" className="text-white">Description</Label>
              <Input
                id="event-description"
                value={newEventData.description}
                onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                className="bg-gray-950 border-gray-600 text-white"
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => createEventMutation.mutate(newEventData)}
              disabled={createEventMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Event Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View event information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Event Title</Label>
                <p className="text-white font-medium">{selectedEvent.title}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Location</Label>
                <p className="text-white font-medium">{selectedEvent.location}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Event Type</Label>
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                  {selectedEvent.eventType}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Max Capacity</Label>
                <p className="text-white font-medium">{selectedEvent.maxCapacity} guests</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Ticket Price</Label>
                <p className="text-white font-medium">${selectedEvent.ticketPrice}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-400">Event Date</Label>
                <p className="text-white font-medium">{new Date(selectedEvent.eventDate).toLocaleDateString()}</p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-400">Description</Label>
                <p className="text-white font-medium">{selectedEvent.description || 'No description available'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewEventDialogOpen(false)} className="border-gray-600 text-gray-400">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update event information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-title" className="text-white">Event Title</Label>
                <Input
                  id="edit-event-title"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-event-location" className="text-white">Location</Label>
                <Input
                  id="edit-event-location"
                  value={selectedEvent.location}
                  onChange={(e) => setSelectedEvent({...selectedEvent, location: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-event-type" className="text-white">Event Type</Label>
                <Select value={selectedEvent.eventType} onValueChange={(value) => setSelectedEvent({...selectedEvent, eventType: value})}>
                  <SelectTrigger className="bg-gray-950 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-600 text-white">
                    <SelectItem value="Dining">Dining</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-event-capacity" className="text-white">Max Capacity</Label>
                <Input
                  id="edit-event-capacity"
                  type="number"
                  value={selectedEvent.maxCapacity}
                  onChange={(e) => setSelectedEvent({...selectedEvent, maxCapacity: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-event-price" className="text-white">Ticket Price</Label>
                <Input
                  id="edit-event-price"
                  type="number"
                  value={selectedEvent.ticketPrice}
                  onChange={(e) => setSelectedEvent({...selectedEvent, ticketPrice: parseInt(e.target.value)})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-event-date" className="text-white">Event Date</Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, eventDate: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-event-description" className="text-white">Description</Label>
                <Input
                  id="edit-event-description"
                  value={selectedEvent.description || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                  className="bg-gray-950 border-gray-600 text-white"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventDialogOpen(false)} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
            <Button 
              onClick={() => updateEventMutation.mutate(selectedEvent)}
              disabled={updateEventMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );

  const renderStaffPayments = () => {
  console.log('Rendering staff payments, data:', payments);
  return (
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
            ${Number(payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0).toFixed(2)}
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
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Service/Event</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Debug test row */}
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST ID</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST CUSTOMER NAME</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST SERVICE NAME</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">$999.99</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST DATE</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST STATUS</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-bold">TEST ACTIONS</span>
                  </td>
                </tr>
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
                    <td className="py-4 px-4" style={{ zIndex: 9999, position: 'relative' }}>
                      <div className="flex items-center space-x-3" style={{ zIndex: 9999, position: 'relative' }}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center" style={{ zIndex: 9999, position: 'relative' }}>
                          <span className="text-xs font-semibold" style={{ 
                            color: 'white !important', 
                            zIndex: 9999, 
                            position: 'relative',
                            backgroundColor: 'transparent',
                            display: 'block'
                          }}>
                            {(payment.customer || payment.fullName || payment.username || 'Demo Member')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div style={{ 
                            color: '#FFFFFF', 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            textShadow: '0 0 2px black',
                            position: 'relative',
                            zIndex: 99999
                          }}>
                            CUSTOMER: {payment.customer || payment.fullName || payment.username || 'NO DATA'}
                          </div>
                          <div style={{ 
                            color: '#9CA3AF', 
                            fontSize: '12px',
                            textShadow: '0 0 2px black',
                            position: 'relative',
                            zIndex: 99999
                          }}>
                            {payment.customerEmail || 'test@email.com'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4" style={{ zIndex: 9999, position: 'relative' }}>
                      <div>
                        <div style={{ 
                          color: '#FFFFFF', 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          textShadow: '0 0 2px black',
                          position: 'relative',
                          zIndex: 99999
                        }}>
                          SERVICE: {payment.serviceEvent || payment.serviceName || 'NO DATA'}
                        </div>
                        <div style={{ 
                          color: '#9CA3AF', 
                          fontSize: '12px',
                          textShadow: '0 0 2px black',
                          position: 'relative',
                          zIndex: 99999
                        }}>
                          {payment.serviceCategory || 'Test Category'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4" style={{ zIndex: 9999, position: 'relative' }}>
                      <div className="relative" style={{ zIndex: 9999 }}>
                        <p className="font-bold text-lg" style={{ 
                          color: 'white !important', 
                          zIndex: 9999, 
                          position: 'relative',
                          backgroundColor: 'transparent',
                          display: 'block'
                        }}>${Number(payment.amount || 0).toFixed(2)}</p>
                        <p className="text-xs" style={{ 
                          color: '#9CA3AF !important', 
                          zIndex: 9999, 
                          position: 'relative',
                          backgroundColor: 'transparent',
                          display: 'block'
                        }}>{payment.currency || 'USD'}</p>
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
  };

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
              value={`$${Number(analytics?.totalRevenue || 0).toFixed(2)}`}
              change={12.5}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-500"
              delay={0}
            />
            <StatCard
              title="Active Bookings"
              value={(analytics?.totalBookings || 0).toString()}
              change={analytics.trends.memberGrowth}
              icon={Activity}
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Active Members"
              value={(analytics?.totalUsers || 0).toString()}
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
                        <p className="text-white font-bold">${Number(service.totalRevenue || 0).toFixed(2)}</p>
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
                        <p className="text-white font-bold">{Number(yacht.utilizationRate || 0).toFixed(1)}%</p>
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
                          <p className="text-gray-400 text-sm">{Number(percentage || 0).toFixed(1)}%</p>
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
                        <span className="text-white">{Number(event.capacityFilled || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(event.capacityFilled, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-white">${Number(event.totalRevenue || 0).toFixed(2)}</span>
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