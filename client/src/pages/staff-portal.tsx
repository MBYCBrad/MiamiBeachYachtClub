import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CalendarPage from "@/pages/calendar-page";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import NotificationDropdown from "@/components/NotificationDropdown";
import StaffMessagesDropdown from "@/components/StaffMessagesDropdown";
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
  Phone
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// StatCard component for dashboard stats
const StatCard = ({ title, value, subtitle, icon: Icon, change, gradient, delay }: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon?: any;
  change?: number;
  gradient?: string;
  delay?: number;
}) => (
  <Card className="bg-gray-900/50 border-gray-700/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {Icon && <Icon className="h-8 w-8 text-purple-400" />}
      </div>
    </CardContent>
  </Card>
);

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
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-indigo-500 to-purple-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-red-500 to-orange-500' },
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-blue-500 to-indigo-500' },
  { id: 'staff-management', label: 'Staff Management', icon: UserCheck, color: 'from-purple-500 to-indigo-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'customer-service', label: 'Customer Service', icon: Phone, color: 'from-emerald-500 to-cyan-500' },

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

// User creation form schema
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['member', 'yacht_owner', 'service_provider', 'admin']),
  membershipTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  isActive: z.boolean().default(true)
});

type CreateUserData = z.infer<typeof createUserSchema>;

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User filters for the users section
  const [userFilters, setUserFilters] = useState({
    role: "all",
    membershipTier: "all",
    status: "all"
  });

  // Filters for all sections
  const [showFilters, setShowFilters] = useState(false);
  const [eventFilters, setEventFilters] = useState({
    status: "all",
    type: "all",
    capacity: "all",
    priceRange: "all",
    dateRange: "all"
  });
  const [bookingFilters, setBookingFilters] = useState({
    status: "all",
    timeRange: "all",
    membershipTier: "all",
    yachtSize: "all",
    sortBy: "date",
    type: "all",
    dateRange: "all"
  });
  const [paymentFilters, setPaymentFilters] = useState({
    type: "all",
    status: "all",
    method: "all",
    dateRange: "all"
  });
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

  // Staff notifications query
  const { data: staffNotifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/staff/notifications'],
    enabled: !!user && user.role === 'staff',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Dialog states
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showAddYachtDialog, setShowAddYachtDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  
  // View and Edit dialog states
  const [showViewUserDialog, setShowViewUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showViewEventDialog, setShowViewEventDialog] = useState(false);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [showViewYachtDialog, setShowViewYachtDialog] = useState(false);
  const [showEditYachtDialog, setShowEditYachtDialog] = useState(false);
  const [showViewServiceDialog, setShowViewServiceDialog] = useState(false);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [showViewBookingDialog, setShowViewBookingDialog] = useState(false);
  const [showEditBookingDialog, setShowEditBookingDialog] = useState(false);
  const [showViewPaymentDialog, setShowViewPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);

  // Selected items for dialogs
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form schemas
  const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["Member", "Yacht Owner", "Service Provider", "Admin"]),
    membershipTier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required")
  });

  type CreateUserData = z.infer<typeof createUserSchema>;

  // Additional form schemas
  const createEventSchema = z.object({
    name: z.string().min(1, "Event name is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    capacity: z.string().transform(Number),
    ticketPrice: z.string().transform(Number),
    location: z.string().min(1, "Location is required"),
  });

  const createYachtSchema = z.object({
    name: z.string().min(1, "Yacht name is required"),
    type: z.string().min(1, "Type is required"),
    description: z.string().min(1, "Description is required"),
    size: z.string().transform(Number),
    capacity: z.string().transform(Number),
    location: z.string().min(1, "Location is required"),
  });

  const createServiceSchema = z.object({
    name: z.string().min(1, "Service name is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    pricePerSession: z.string().transform(Number),
    duration: z.string().transform(Number),
  });

  type CreateEventData = z.infer<typeof createEventSchema>;
  type CreateYachtData = z.infer<typeof createYachtSchema>;
  type CreateServiceData = z.infer<typeof createServiceSchema>;

  // Form for adding users
  const userForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "Member",
      membershipTier: "Bronze",
      firstName: "",
      lastName: ""
    }
  });

  // Additional forms
  const eventForm = useForm<CreateEventData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      date: "",
      time: "",
      capacity: 0,
      ticketPrice: 0,
      location: ""
    }
  });

  const yachtForm = useForm<CreateYachtData>({
    resolver: zodResolver(createYachtSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      size: 0,
      capacity: 0,
      location: ""
    }
  });

  const serviceForm = useForm<CreateServiceData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      pricePerSession: 0,
      duration: 0
    }
  });

  // Mutation for creating users
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User created successfully" });
      setShowAddUserDialog(false);
      userForm.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating user", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Additional mutations
  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({ title: "Event created successfully" });
      setShowAddEventDialog(false);
      eventForm.reset();
    }
  });

  const createYachtMutation = useMutation({
    mutationFn: async (data: CreateYachtData) => {
      const response = await fetch('/api/admin/yachts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create yacht');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
      toast({ title: "Yacht created successfully" });
      setShowAddYachtDialog(false);
      yachtForm.reset();
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: CreateServiceData) => {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({ title: "Service created successfully" });
      setShowAddServiceDialog(false);
      serviceForm.reset();
    }
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

  // API Queries - using staff endpoints where appropriate
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/staff/stats'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/staff/users'],
  });

  const { data: yachts = [] } = useQuery({
    queryKey: ['/api/staff/yachts'],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/staff/services'],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/staff/events'],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/staff/payments'],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/staff/bookings'],
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ['/api/staff/analytics'],
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

  // Form submission handlers
  const onCreateUser = (data: CreateUserData) => {
    createUserMutation.mutate(data);
  };

  const onCreateEvent = (data: CreateEventData) => {
    createEventMutation.mutate(data);
  };

  const onCreateYacht = (data: CreateYachtData) => {
    createYachtMutation.mutate(data);
  };

  const onCreateService = (data: CreateServiceData) => {
    createServiceMutation.mutate(data);
  };

  // Click handlers for making all view/edit icons functional
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewUserDialog(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setShowViewEventDialog(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEditEventDialog(true);
  };

  const handleViewYacht = (yacht: any) => {
    setSelectedYacht(yacht);
    setShowViewYachtDialog(true);
  };

  const handleEditYacht = (yacht: any) => {
    setSelectedYacht(yacht);
    setShowEditYachtDialog(true);
  };

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setShowViewServiceDialog(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowEditServiceDialog(true);
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowViewBookingDialog(true);
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowEditBookingDialog(true);
  };

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowViewPaymentDialog(true);
  };

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowEditPaymentDialog(true);
  };

  const handleViewAnalytics = (analytics: any) => {
    console.log('Viewing analytics details:', analytics);
  };

  const handleEditAnalytics = (analytics: any) => {
    console.log('Editing analytics:', analytics);
  };

  const handleViewNotification = (notification: any) => {
    console.log('Viewing notification:', notification);
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
    if (!services || !Array.isArray(services)) return [];
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
    if (!events || !Array.isArray(events)) return [];
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
    if (!payments || !Array.isArray(payments)) return [];
    
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
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
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

    const filteredUsers = ((users as any[]) || []).filter((user: any) => {
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
              onClick={() => setShowAddUserDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-400 hover:text-white"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleEditUser(user)}
                        >
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
                  {((payments as any[]) || []).map((payment: any, index: number) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{payment.customer || payment.fullName || payment.username || 'Demo Member'}</p>
                          <p className="text-gray-400 text-sm">{payment.customerEmail || payment.email || 'member@mbyc.com'}</p>
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
                            className="text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all duration-200"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {((payments as any[]) || []).length === 0 && (
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
                  <p className="text-2xl font-bold text-white">${((analytics as any)?.totalRevenue)?.toFixed(2) || '0.00'}</p>
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
                  <p className="text-2xl font-bold text-white">{((analytics as any)?.totalUsers) || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{((analytics as any)?.totalBookings) || 0}</p>
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
    if (!staffNotifications) {
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
          {((staffNotifications as any[]) || []).length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No notifications</p>
                <p className="text-gray-500 text-sm">All caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            ((staffNotifications as any[]) || []).map((notification: any, index: number) => (
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
                          notification.priority === 'urgent' ? 'bg-red-500/20' :
                          notification.priority === 'high' ? 'bg-red-500/20' :
                          notification.priority === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <Bell className={`h-5 w-5 ${
                            notification.priority === 'urgent' ? 'text-red-400' :
                            notification.priority === 'high' ? 'text-red-400' :
                            notification.priority === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                            <span>{new Date(notification.created_at).toLocaleTimeString()}</span>
                            <Badge className={`text-xs ${
                              notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
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
                          onClick={() => console.log('Viewing notification:', notification)}
                        >
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

  // EXACT COPY FROM ADMIN DASHBOARD - renderMessages function with complete styling
  const renderMessages = () => {
    const { data: staffConversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
      queryKey: ['/api/staff/conversations'],
      enabled: !!user && user.role === 'staff',
      refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (conversationsLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading conversations...</p>
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
        <div className="flex items-center justify-between mt-16">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-2 tracking-tight"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
            >
              Messages
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Staff communication and member support system
            </motion.p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Active Conversations</p>
                  <p className="text-3xl font-bold text-white">{staffConversations.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">24/7 Support</p>
                  <p className="text-3xl font-bold text-white">Active</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl">
                  <Clock className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Response Time</p>
                  <p className="text-3xl font-bold text-white">5min</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
              Active Conversations
            </CardTitle>
            <CardDescription>Real-time member support and staff communications</CardDescription>
          </CardHeader>
          <CardContent>
            {staffConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No active conversations</h3>
                <p className="text-gray-500 text-center">
                  All member communications will appear here for staff response.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {staffConversations.map((conversation: any, index: number) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            Member #{conversation.participant1_id}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Conversation #{conversation.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
                    {((filteredYachts as any[]) || []).length} of {((yachts as any[]) || []).length || 0} yachts
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
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/30">
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
                        className="text-blue-400 hover:text-white"
                        onClick={() => handleViewYacht(yacht)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={() => handleEditYacht(yacht)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
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
                    {((filteredServices as any[]) || []).length} of {((services as any[]) || []).length || 0} services
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
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-orange-400 hover:text-white"
                      onClick={() => handleViewService(service)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
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
                      status: "all",
                      timeRange: "all",
                      membershipTier: "all",
                      yachtSize: "all",
                      sortBy: "date",
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
                    {((filteredBookings as any[]) || []).length} of {((bookings as any[]) || []).length || 0} bookings
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setBookingFilters({
                      status: "all",
                      timeRange: "all",
                      membershipTier: "all",
                      yachtSize: "all",
                      sortBy: "date",
                      type: "all",
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
          <p className="text-2xl font-bold text-white">{((bookings as any[]) || []).length}</p>
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
            {((bookings as any[]) || []).filter((b: any) => b.status === 'confirmed').length}
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
            {((bookings as any[]) || []).filter((b: any) => b.status === 'pending').length}
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
            {((bookings as any[]) || []).filter((b: any) => b.status === 'cancelled').length}
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all duration-200"
                          onClick={() => handleViewBooking(booking)}
                        >
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
            onClick={() => setShowAddEventDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
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
                      capacity: "all",
                      priceRange: "all",
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
                    {((filteredEvents as any[]) || []).length} of {((events as any[]) || []).length || 0} events
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setEventFilters({
                      status: "all",
                      type: "all",
                      capacity: "all",
                      priceRange: "all",
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
                  capacity: "all",
                  priceRange: "all",
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
                        className="text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all duration-200"
                        onClick={() => handleViewEvent(event)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all duration-200"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
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
                      type: "all",
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
                    {((filteredPayments as any[]) || []).length} of {((payments as any[]) || []).length || 0} payments
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setPaymentFilters({
                      type: "all",
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
            ${Number(Array.isArray(payments) ? payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0).toFixed(2)}
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
            {((payments as any[]) || []).filter((p: any) => p.status === 'completed').length}
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
            {((payments as any[]) || []).filter((p: any) => p.status === 'pending').length}
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
            {((payments as any[]) || []).filter((p: any) => p.status === 'failed').length}
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-emerald-400 hover:text-white"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
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
              value={`$${Number((analytics as any)?.totalRevenue || 0).toFixed(2)}`}
              change={12.5}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-500"
              delay={0}
            />
            <StatCard
              title="Active Bookings"
              value={((analytics as any)?.totalBookings || 0).toString()}
              change={(analytics as any)?.trends?.memberGrowth || 0}
              icon={Activity}
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Active Members"
              value={((analytics as any)?.totalUsers || 0).toString()}
              change={(analytics as any)?.trends?.memberGrowth || 0}
              icon={Users}
              gradient="from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="Customer Satisfaction"
              value={`${(analytics as any)?.realTimeMetrics?.customerSatisfaction || 4.5}/5`}
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
                  {((analytics as any)?.performance?.services || []).slice(0, 5).map((service: any, index: number) => (
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
                  {((analytics as any)?.performance?.yachts || []).slice(0, 5).map((yacht: any, index: number) => (
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
                  {((analytics as any)?.trends?.monthlyBookings || []).map((month: any, index: number) => {
                    const maxBookings = Math.max(...((analytics as any)?.trends?.monthlyBookings || []).map((m: any) => m.bookings));
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
                  {Object.entries((analytics as any)?.demographics?.membershipBreakdown || {}).map(([tier, count]: [string, any], index: number) => {
                    const totalMembers = Object.values((analytics as any)?.demographics?.membershipBreakdown || {}).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
                    const percentage = totalMembers > 0 ? ((count as number) / totalMembers) * 100 : 0;
                    
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
                {((analytics as any)?.performance?.events || []).slice(0, 6).map((event: any, index: number) => (
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
              
              {/* Messages, Notifications, and Logout beside username */}
              <div className="flex items-center space-x-2">
                {/* Messages Navigation Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveSection('messages')}
                  className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-purple-500/20 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300 group"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  {/* Message Badge */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
                </motion.button>
                {/* Staff Notification Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveSection('notifications')}
                  className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-purple-500/20 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300 group"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  {/* Notification Badge */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">5</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 border border-gray-600/50 hover:border-red-500/50 transition-all duration-300 group"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
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
            {activeSection === 'messages' && renderMessages()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'crew-management' && <CrewManagementPage />}
            {activeSection === 'staff-management' && <StaffManagement />}
            {activeSection === 'yacht-maintenance' && <YachtMaintenancePage />}
            {activeSection === 'customer-service' && <CustomerServiceDashboard />}

            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'settings' && renderStaffSettings()}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new user account for the yacht club
            </DialogDescription>
          </DialogHeader>
          
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter first name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter last name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        className="bg-gray-900 border-gray-700 text-white" 
                        placeholder="Enter password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Yacht Owner">Yacht Owner</SelectItem>
                          <SelectItem value="Service Provider">Service Provider</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="membershipTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Membership Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Bronze">Bronze</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddUserDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new yacht club event
            </DialogDescription>
          </DialogHeader>
          <Form {...eventForm}>
            <form onSubmit={eventForm.handleSubmit(onCreateEvent)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eventForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Event Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter event name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eventForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Racing">Racing</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Educational">Educational</SelectItem>
                          <SelectItem value="Charity">Charity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        className="w-full min-h-[100px] p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Enter event description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eventForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Event Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          className="bg-gray-900 border-gray-700 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eventForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Event Time</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="time"
                          className="bg-gray-900 border-gray-700 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={eventForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Max attendees"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eventForm.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Ticket Price</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.01"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Event location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddEventDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Yacht Dialog */}
      <Dialog open={showAddYachtDialog} onOpenChange={setShowAddYachtDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Yacht</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new yacht to the fleet
            </DialogDescription>
          </DialogHeader>
          <Form {...yachtForm}>
            <form onSubmit={yachtForm.handleSubmit(onCreateYacht)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={yachtForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Yacht Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter yacht name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={yachtForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Motor Yacht">Motor Yacht</SelectItem>
                          <SelectItem value="Sailing Yacht">Sailing Yacht</SelectItem>
                          <SelectItem value="Catamaran">Catamaran</SelectItem>
                          <SelectItem value="Sport Fishing">Sport Fishing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={yachtForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        className="w-full min-h-[100px] p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Enter yacht description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={yachtForm.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Size (ft)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Length in feet"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={yachtForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Max guests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={yachtForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Marina location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddYachtDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createYachtMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Service</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new concierge service
            </DialogDescription>
          </DialogHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(onCreateService)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Service Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Enter service name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serviceForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                          <SelectItem value="Culinary">Culinary</SelectItem>
                          <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                          <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Water Sports">Water Sports</SelectItem>
                          <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={serviceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        className="w-full min-h-[100px] p-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Enter service description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="pricePerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Price per Session</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.01"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serviceForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          className="bg-gray-900 border-gray-700 text-white" 
                          placeholder="Duration in minutes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddServiceDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createServiceMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={showViewUserDialog} onOpenChange={setShowViewUserDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">View User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedUser.username || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedUser.fullName || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedUser.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedUser.role || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewUserDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <Input 
                    defaultValue={selectedUser.username}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <Input 
                    defaultValue={selectedUser.fullName}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <Input 
                    defaultValue={selectedUser.email}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-700/50">
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditUserDialog(false)}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Service Dialog */}
      <Dialog open={showViewServiceDialog} onOpenChange={setShowViewServiceDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">View Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Service Name</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedService.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedService.category || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Price Per Session</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    ${selectedService.pricePerSession || selectedService.price || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Duration (hours)</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedService.duration || 'N/A'}
                  </div>
                </div>
              </div>
              {selectedService.description && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedService.description}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewServiceDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditServiceDialog} onOpenChange={setShowEditServiceDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Service Name</label>
                  <Input 
                    defaultValue={selectedService.name}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <Select defaultValue={selectedService.category}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-700/50">
                      <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                      <SelectItem value="Culinary">Culinary</SelectItem>
                      <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Price Per Session</label>
                  <Input 
                    defaultValue={selectedService.pricePerSession}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Duration (hours)</label>
                  <Input 
                    defaultValue={selectedService.duration}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea 
                  defaultValue={selectedService.description}
                  className="w-full mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditServiceDialog(false)}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Update Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Yacht Dialog */}
      <Dialog open={showViewYachtDialog} onOpenChange={setShowViewYachtDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">View Yacht Details</DialogTitle>
          </DialogHeader>
          {selectedYacht && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Yacht Name</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Type</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.type || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Size (ft)</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.size || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Capacity</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.capacity || 'N/A'} guests
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.location || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedYacht.status || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewYachtDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      {selectedEvent && (
        <Dialog open={showViewEventDialog} onOpenChange={setShowViewEventDialog}>
          <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">View Event Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Event Name</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedEvent.title || selectedEvent.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Event Type</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedEvent.eventType || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Date</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedEvent.location || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Capacity</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedEvent.maxCapacity || selectedEvent.capacity || 'N/A'} guests
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Ticket Price</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    ${selectedEvent.ticketPrice || 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                  {selectedEvent.description || 'N/A'}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewEventDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Booking Dialog */}
      <Dialog open={showViewBookingDialog} onOpenChange={setShowViewBookingDialog}>
        <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">View Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Booking Type</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedBooking.type || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedBooking.status || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Date</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedBooking.date || selectedBooking.createdAt || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Member</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedBooking.memberName || selectedBooking.member || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewBookingDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      {selectedPayment && (
        <Dialog open={showViewPaymentDialog} onOpenChange={setShowViewPaymentDialog}>
          <DialogContent className="bg-gray-950 border-gray-700/50 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">View Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Amount</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    ${selectedPayment.amount || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Customer</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedPayment.customer || selectedPayment.fullName || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedPayment.status || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Service/Event</label>
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white">
                    {selectedPayment.serviceEvent || selectedPayment.serviceName || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewPaymentDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <input 
                    type="text" 
                    defaultValue={selectedUser.username || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <input 
                    type="email" 
                    defaultValue={selectedUser.email || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <select 
                    defaultValue={selectedUser.role || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="member">Member</option>
                    <option value="yacht_owner">Yacht Owner</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Membership Tier</label>
                  <select 
                    defaultValue={selectedUser.membershipTier || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditUserDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditUserDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Event Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedEvent.title || selectedEvent.name || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <input 
                    type="text" 
                    defaultValue={selectedEvent.location || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Date</label>
                  <input 
                    type="date" 
                    defaultValue={selectedEvent.date ? new Date(selectedEvent.date).toISOString().split('T')[0] : ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Capacity</label>
                  <input 
                    type="number" 
                    defaultValue={selectedEvent.capacity || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea 
                  defaultValue={selectedEvent.description || ''}
                  rows={3}
                  className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditEventDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditEventDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Yacht Dialog */}
      {selectedYacht && (
        <Dialog open={showEditYachtDialog} onOpenChange={setShowEditYachtDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Yacht</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Yacht Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedYacht.name || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Size (ft)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedYacht.size || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Type</label>
                  <select 
                    defaultValue={selectedYacht.type || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="motor_yacht">Motor Yacht</option>
                    <option value="sailing_yacht">Sailing Yacht</option>
                    <option value="catamaran">Catamaran</option>
                    <option value="luxury_yacht">Luxury Yacht</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Capacity</label>
                  <input 
                    type="number" 
                    defaultValue={selectedYacht.capacity || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Location</label>
                <input 
                  type="text" 
                  defaultValue={selectedYacht.location || ''}
                  className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditYachtDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditYachtDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Service Dialog */}
      {selectedService && (
        <Dialog open={showEditServiceDialog} onOpenChange={setShowEditServiceDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Service Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedService.name || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <select 
                    defaultValue={selectedService.category || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="Beauty & Grooming">Beauty & Grooming</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Wellness & Spa">Wellness & Spa</option>
                    <option value="Photography & Media">Photography & Media</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Water Sports">Water Sports</option>
                    <option value="Concierge & Lifestyle">Concierge & Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Price per Session</label>
                  <input 
                    type="number" 
                    defaultValue={selectedService.pricePerSession || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Duration (min)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedService.duration || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea 
                  defaultValue={selectedService.description || ''}
                  rows={3}
                  className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditServiceDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditServiceDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {selectedBooking && (
        <Dialog open={showEditBookingDialog} onOpenChange={setShowEditBookingDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select 
                    defaultValue={selectedBooking.status || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Guest Count</label>
                  <input 
                    type="number" 
                    defaultValue={selectedBooking.guestCount || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Start Date</label>
                  <input 
                    type="datetime-local" 
                    defaultValue={selectedBooking.startTime ? new Date(selectedBooking.startTime).toISOString().slice(0, 16) : ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">End Date</label>
                  <input 
                    type="datetime-local" 
                    defaultValue={selectedBooking.endTime ? new Date(selectedBooking.endTime).toISOString().slice(0, 16) : ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Special Requests</label>
                <textarea 
                  defaultValue={selectedBooking.specialRequests || ''}
                  rows={3}
                  className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditBookingDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditBookingDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Payment Dialog */}
      {selectedPayment && (
        <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
          <DialogContent className="bg-gray-950 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select 
                    defaultValue={selectedPayment.status || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    defaultValue={selectedPayment.amount || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Currency</label>
                  <select 
                    defaultValue={selectedPayment.currency || 'USD'}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Payment Method</label>
                  <select 
                    defaultValue={selectedPayment.paymentMethod || ''}
                    className="mt-1 w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditPaymentDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowEditPaymentDialog(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}