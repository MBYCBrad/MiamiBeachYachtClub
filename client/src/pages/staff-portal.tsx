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
  Plus,
  ChevronLeft
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  
  // Dialog states
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isAddYachtDialogOpen, setIsAddYachtDialogOpen] = useState(false);
  const [isEditYachtDialogOpen, setIsEditYachtDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Form data
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
  
  const [newYachtData, setNewYachtData] = useState({
    name: '',
    type: '',
    size: '',
    capacity: '',
    location: '',
    amenities: [] as string[],
    images: [] as string[],
    description: '',
    ownerId: ''
  });
  
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    providerId: ''
  });
  
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    price: '',
    hostId: ''
  });
  
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

  // Payment mutations
  const updatePaymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiRequest(`/api/staff/payments/${paymentData.id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/payments'] });
      setIsEditPaymentDialogOpen(false);
      setSelectedPayment(null);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/payments/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/payments'] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    }
  });

  // Booking mutations
  const updateBookingMutation = useMutation({
    mutationFn: (bookingData: any) => apiRequest(`/api/staff/bookings/${bookingData.id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-registrations'] });
      setIsEditBookingDialogOpen(false);
      setSelectedBooking(null);
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/staff/bookings/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-registrations'] });
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
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
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);

  // Yacht dialog states
  const [isViewYachtDialogOpen, setIsViewYachtDialogOpen] = useState(false);

  // Service dialog states
  const [isViewServiceDialogOpen, setIsViewServiceDialogOpen] = useState(false);

  // Event dialog states
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  
  // Payment dialog states
  const [isViewPaymentDialogOpen, setIsViewPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Booking dialog states
  const [isViewBookingDialogOpen, setIsViewBookingDialogOpen] = useState(false);
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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

// View User Dialog - EXACT COPY from admin dashboard
function ViewUserDialog({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-500" />
            User Details
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* User Avatar and Basic Info */}
          <div className="col-span-2 flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-white">{user.username}</h3>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${
                  user.membershipTier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  user.membershipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  user.membershipTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                  'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {user.membershipTier}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {user.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <Label className="text-gray-300 font-medium">Personal Information</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">Full Name</Label>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Email Address</Label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Phone</Label>
                <p className="text-white">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Location</Label>
                <p className="text-white">{user.location || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <Label className="text-gray-300 font-medium">Account Information</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">User ID</Label>
                <p className="text-white font-mono">#{user.id}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Member Since</Label>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Account Status</Label>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Last Active</Label>
                <p className="text-white">Recently</p>
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div className="col-span-2">
            <Label className="text-gray-300 font-medium">Membership Details</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Membership Tier</Label>
                <p className="text-white font-semibold">{user.membershipTier}</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Role</Label>
                <p className="text-white font-semibold capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Language</Label>
                <p className="text-white font-semibold">{user.language || 'English'}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="col-span-2">
            <Label className="text-gray-300 font-medium">Additional Information</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">Stripe Customer ID</Label>
                <p className="text-white font-mono text-sm">{user.stripeCustomerId || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Subscription Status</Label>
                <p className="text-white">{user.stripeSubscriptionId ? 'Active Subscription' : 'No Active Subscription'}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add User Dialog - EXACT COPY from admin dashboard
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="username" className="form-label text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter username"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="email" className="form-label text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="password" className="form-label text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="form-input bg-gray-900 border-gray-700 text-white"
              placeholder="Enter password"
            />
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="role" className="form-label text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? 'bronze' : ''})}>
                <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
              <div className="form-field-spacing">
                <Label htmlFor="membershipTier" className="form-label text-gray-300">Membership Tier</Label>
                <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                  <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
        
        <div className="form-button-group">
          <Button 
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog - EXACT COPY from admin dashboard
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="username" className="form-label text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="email" className="form-label text-gray-300">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="role" className="form-label text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? (formData.membershipTier || 'bronze') : ''})}>
                <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
              <div className="form-field-spacing">
                <Label htmlFor="tier" className="form-label text-gray-300">Membership Tier</Label>
                <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                  <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
        
        <div className="form-button-group">
          <Button 
            onClick={() => updateUserMutation.mutate(formData)} 
            disabled={updateUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Dialog - EXACT COPY from admin dashboard
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
              User Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Manage member accounts, roles, and access permissions
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <AddUserDialog />
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Users
            </Button>
          </motion.div>
        </div>

        {/* User Filter Controls */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Role</Label>
                <Select value={userFilters.role} onValueChange={(value) => setUserFilters(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="yacht_owner">Yacht Owners</SelectItem>
                    <SelectItem value="service_provider">Service Providers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Membership Tier</Label>
                <Select value={userFilters.membershipTier} onValueChange={(value) => setUserFilters(prev => ({ ...prev, membershipTier: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Status</Label>
                <Select value={userFilters.status} onValueChange={(value) => setUserFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
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
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
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
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                            {user.username}
                          </h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <Badge className={`text-xs mt-1 ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            user.role === 'yacht_owner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            user.role === 'service_provider' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            {user.role?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {user.membershipTier && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Membership</span>
                          <Badge className={`text-xs ${
                            user.membershipTier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            user.membershipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            user.membershipTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
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
                        <ViewUserDialog user={user} />
                        <EditUserDialog user={user} />
                        <DeleteUserDialog user={user} />
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Active
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

  // EXACT COPY from admin dashboard - renderYachts function
  const renderYachts = () => {
    if (!yachts) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-6">
                  <div className="h-40 bg-gray-800 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
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
              Manage yacht fleet, specifications, and availability
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
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <Anchor className="h-4 w-4 mr-2" />
              Add Yacht
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Fleet
            </Button>
          </motion.div>
        </div>

        {/* Yacht Filter Controls */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Type</Label>
                <Select value={yachtFilters.type} onValueChange={(value) => setYachtFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="motor">Motor Yacht</SelectItem>
                    <SelectItem value="sailing">Sailing Yacht</SelectItem>
                    <SelectItem value="catamaran">Catamaran</SelectItem>
                    <SelectItem value="sport">Sport Yacht</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Availability</Label>
                <Select value={yachtFilters.availability} onValueChange={(value) => setYachtFilters(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Capacity</Label>
                <Select value={yachtFilters.capacity} onValueChange={(value) => setYachtFilters(prev => ({ ...prev, capacity: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small (≤8)</SelectItem>
                    <SelectItem value="medium">Medium (9-15)</SelectItem>
                    <SelectItem value="large">Large (16+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Sort By</Label>
                <Select value="name" onValueChange={() => {}}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yachts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYachts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Anchor className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No yachts found</h3>
              <p className="text-gray-500 text-center">
                No yachts match your current filter criteria.
              </p>
            </div>
          ) : (
            filteredYachts.map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                      alt={yacht.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${yacht.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {yacht.isAvailable ? 'Available' : 'In Use'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {yacht.name}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {yacht.location}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white ml-1">{yacht.size}ft</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Capacity:</span>
                        <span className="text-white ml-1">{yacht.capacity} guests</span>
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
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">ID: #{yacht.id}</p>
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

  // EXACT COPY from admin dashboard - renderServices function
  const renderServices = () => {
    if (!services) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-6">
                  <div className="h-40 bg-gray-800 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
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
              Manage premium yacht concierge services and providers
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Add Service
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 hover:border-green-500 text-gray-300 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Services
            </Button>
          </motion.div>
        </div>

        {/* Service Filter Controls */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Category</Label>
                <Select value={serviceFilters.category} onValueChange={(value) => setServiceFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="beauty & grooming">Beauty & Grooming</SelectItem>
                    <SelectItem value="culinary">Culinary</SelectItem>
                    <SelectItem value="wellness & spa">Wellness & Spa</SelectItem>
                    <SelectItem value="photography & media">Photography & Media</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="water sports">Water Sports</SelectItem>
                    <SelectItem value="concierge & lifestyle">Concierge & Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Availability</Label>
                <Select value={serviceFilters.availability} onValueChange={(value) => setServiceFilters(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Price Range</Label>
                <Select value={serviceFilters.priceRange} onValueChange={(value) => setServiceFilters(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Low ($0-$100)</SelectItem>
                    <SelectItem value="medium">Medium ($100-$500)</SelectItem>
                    <SelectItem value="high">High ($500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Sort By</Label>
                <Select value="name" onValueChange={() => {}}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No services found</h3>
              <p className="text-gray-500 text-center">
                No services match your current filter criteria.
              </p>
            </div>
          ) : (
            filteredServices.map((service: any, index: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.imageUrl || '/api/media/pexels-cottonbro-4004374_1750537359646.jpg'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${service.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">${service.basePrice}</p>
                        <p className="text-xs text-gray-400">Base Price</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{service.provider?.name || 'System Service'}</p>
                        <p className="text-xs text-gray-500">Provider</p>
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
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">ID: #{service.id}</p>
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

  // EXACT COPY from admin dashboard - renderEvents function
  const renderEvents = () => {
    if (!events) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-6">
                  <div className="h-40 bg-gray-800 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
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
              Manage exclusive yacht club events and experiences
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </motion.div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No events found</h3>
              <p className="text-gray-500 text-center">
                No events match your current filter criteria.
              </p>
            </div>
          ) : (
            filteredEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {new Date(event.startTime) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.startTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400">
                          <Users className="h-4 w-4 inline mr-1" />
                          {event.capacity} guests
                        </div>
                        <div className="text-white font-bold">
                          ${event.ticketPrice}
                        </div>
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
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">ID: #{event.id}</p>
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

  // Complete the main render function and other sections
  const renderMain = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'yachts':
        return renderYachts();
      case 'services':
        return renderServices();
      case 'events':
        return renderEvents();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: sidebarCollapsed ? -200 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 flex flex-col relative z-10`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">MBYC Staff</h1>
                    <p className="text-xs text-gray-400">Operations Portal</p>
                  </div>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <item.icon className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.role?.replace('_', ' ')}</p>
                </div>
              )}
              <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem className="text-gray-300 hover:text-white">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            className="h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 flex items-center justify-between px-6"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search staff operations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <AdminNotificationCenter />
              <MessagesDropdown />
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              {renderMain()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Dialog Components */}
      <AddUserDialog />
      {selectedUser && <ViewUserDialog user={selectedUser} />}
      {selectedUser && <EditUserDialog user={selectedUser} />}
      {selectedUser && <DeleteUserDialog user={selectedUser} />}
    </div>
  );
}

