import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import CalendarPage from "@/pages/calendar-page";
import MessengerDashboard from "@/pages/messenger-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import NotificationDropdown from "@/components/NotificationDropdown";
import MessagesDropdown from "@/components/MessagesDropdown";

import CrewManagementPage from "./crew-management";
import StaffManagement from "./staff-management";
import YachtMaintenancePage from "./yacht-maintenance";
import MyProfile from "./my-profile";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import { 
  Menu, LogOut, Bell, MessageCircle, BarChart3, Users, Anchor, Calendar, 
  CalendarDays, DollarSign, TrendingUp, Sparkles, Crown, Activity, Plus, 
  Edit, Eye, Filter, Download, FileText, CreditCard, Package, Settings,
  Search, ChevronDown, X, Ship, Wrench, UserCog, Phone, Shield, Star,
  MapPin, Clock, AlertTriangle, CheckCircle, XCircle, Info
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// EXACT COPY from admin dashboard - Form schemas
const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  membershipTier: z.string().optional(),
});

const createYachtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  length: z.number().min(1, "Length must be greater than 0"),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  pricePerHour: z.number().min(0, "Price must be non-negative"),
  location: z.string().min(1, "Location is required"),
});

const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  duration: z.number().min(1, "Duration must be greater than 0"),
});

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  price: z.number().min(0, "Price must be non-negative"),
});

type CreateUserData = z.infer<typeof createUserSchema>;
type CreateYachtData = z.infer<typeof createYachtSchema>;
type CreateServiceData = z.infer<typeof createServiceSchema>;
type CreateEventData = z.infer<typeof createEventSchema>;

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

export default function StaffPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // EXACT COPY from admin dashboard - State management
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showAddYachtDialog, setShowAddYachtDialog] = useState(false);
  const [showEditYachtDialog, setShowEditYachtDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // EXACT COPY from admin dashboard - Data fetching
  const { data: stats } = useQuery({
    queryKey: ['/api/staff/stats'],
    queryFn: () => apiRequest('/api/staff/stats'),
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('/api/admin/users'),
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/yachts'],
    queryFn: () => apiRequest('/api/yachts'),
  });

  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => apiRequest('/api/services'),
  });

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events'),
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/admin/bookings'],
    queryFn: () => apiRequest('/api/admin/bookings'),
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/admin/payments'],
    queryFn: () => apiRequest('/api/admin/payments'),
  });

  // EXACT COPY from admin dashboard - Forms
  const createUserForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "",
      membershipTier: "",
    },
  });

  const createYachtForm = useForm<CreateYachtData>({
    resolver: zodResolver(createYachtSchema),
    defaultValues: {
      name: "",
      type: "",
      length: 0,
      capacity: 0,
      pricePerHour: 0,
      location: "",
    },
  });

  const createServiceForm = useForm<CreateServiceData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      duration: 0,
    },
  });

  const createEventForm = useForm<CreateEventData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: 0,
      price: 0,
    },
  });

  // EXACT COPY from admin dashboard - Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      return apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/stats'] });
      setShowAddUserDialog(false);
      createUserForm.reset();
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const createYachtMutation = useMutation({
    mutationFn: async (data: CreateYachtData) => {
      return apiRequest('/api/admin/yachts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
      setShowAddYachtDialog(false);
      createYachtForm.reset();
      toast({ title: "Yacht created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create yacht", variant: "destructive" });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: CreateServiceData) => {
      return apiRequest('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setShowAddServiceDialog(false);
      createServiceForm.reset();
      toast({ title: "Service created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create service", variant: "destructive" });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      return apiRequest('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowAddEventDialog(false);
      createEventForm.reset();
      toast({ title: "Event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  // EXACT COPY from admin dashboard - Event handlers
  const onCreateUser = (data: CreateUserData) => {
    createUserMutation.mutate(data);
  };

  const onCreateYacht = (data: CreateYachtData) => {
    createYachtMutation.mutate(data);
  };

  const onCreateService = (data: CreateServiceData) => {
    createServiceMutation.mutate(data);
  };

  const onCreateEvent = (data: CreateEventData) => {
    createEventMutation.mutate(data);
  };

  // EXACT COPY from admin dashboard - renderOverview function
  const renderOverview = () => (
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
            Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Real-time yacht club analytics and member insights
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
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
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
                  <p className="text-3xl font-bold text-white mb-2">{stats?.totalUsers || 0}</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400 font-medium">+{stats?.monthlyGrowth || 0}%</span>
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
                  <p className="text-3xl font-bold text-white mb-2">{stats?.totalBookings || 0}</p>
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
                  <p className="text-3xl font-bold text-white mb-2">${(stats?.totalRevenue || 0).toLocaleString()}</p>
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
                  <p className="text-3xl font-bold text-white mb-2">{stats?.activeServices || 0}</p>
                  <div className="flex items-center text-sm">
                    <Sparkles className="h-4 w-4 text-orange-400 mr-1" />
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
      {stats?.membershipBreakdown && stats.membershipBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Crown className="h-5 w-5 mr-2 text-purple-500" />
                Membership Distribution
              </CardTitle>
              <CardDescription>Real-time breakdown of membership tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.membershipBreakdown.map((tier: any, index: number) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, scale: 0.8 }}
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
  const renderUsers = () => (
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
        {users && users.length > 0 ? (
          users.map((user: any, index: number) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{user.fullName || user.username}</h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditUserDialog(true);
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-purple-600/10 hover:border-purple-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Role</span>
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Membership</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {user.membershipTier || 'None'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${user.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`text-sm ${user.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Phone</span>
                        <span className="text-gray-300 text-sm">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
            <p className="text-gray-500 text-center">
              Add users to get started with user management.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // EXACT COPY from admin dashboard - renderYachts function
  const renderYachts = () => (
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
            Fleet Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht fleet and vessel specifications
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
            onClick={() => setShowAddYachtDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {yachts && yachts.length > 0 ? (
          yachts.map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4 flex items-center justify-center overflow-hidden">
                    {yacht.images && yacht.images.length > 0 ? (
                      <img 
                        src={yacht.images[0]} 
                        alt={yacht.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Anchor className="h-8 w-8 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">{yacht.name}</h3>
                      <p className="text-gray-400 text-sm">{yacht.type} • {yacht.length}ft</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedYacht(yacht);
                          setShowEditYachtDialog(true);
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-blue-600/10 hover:border-blue-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Capacity</span>
                      <span className="text-white text-sm font-medium">{yacht.capacity} guests</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Location</span>
                      <span className="text-gray-300 text-sm">{yacht.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="text-white text-sm font-medium">${yacht.pricePerHour}/hour</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <Badge 
                        className={`${
                          yacht.status === 'available' 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                            : 'bg-gradient-to-r from-red-600 to-orange-600'
                        } text-white border-0`}
                      >
                        {yacht.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Anchor className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No yachts found</h3>
            <p className="text-gray-500 text-center">
              Add yachts to your fleet to get started.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // EXACT COPY from admin dashboard - Main component structure
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750687226929.png" 
                alt="MBYC" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Miami Beach Yacht Club</h1>
              <p className="text-sm text-gray-400">Staff Portal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <MessagesDropdown />
          <NotificationDropdown />
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.fullName || user?.username}</div>
              <div className="text-xs text-gray-400">System Admin</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
              A
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50"
            >
              <div className="p-6 space-y-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveView('overview')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeView === 'overview' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveView('users')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeView === 'users' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveView('yachts')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeView === 'yachts' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Anchor className="h-5 w-5" />
                    <span>Fleet Management</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          animate={{
            marginLeft: sidebarCollapsed ? 0 : 320,
            width: sidebarCollapsed ? "100%" : "calc(100% - 320px)"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 p-8 space-y-8"
        >
          {activeView === 'overview' && renderOverview()}
          {activeView === 'users' && renderUsers()}
          {activeView === 'yachts' && renderYachts()}
        </motion.div>
      </div>

      {/* EXACT COPY from admin dashboard - All Dialogs */}
      {showAddUserDialog && (
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="max-w-md bg-gray-950 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={createUserForm.handleSubmit(onCreateUser)} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  {...createUserForm.register("username")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {createUserForm.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">{createUserForm.formState.errors.username.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...createUserForm.register("email")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {createUserForm.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">{createUserForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...createUserForm.register("password")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {createUserForm.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">{createUserForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  {...createUserForm.register("fullName")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <Select value={createUserForm.watch("role")} onValueChange={(value) => createUserForm.setValue("role", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="membershipTier" className="text-gray-300">Membership Tier</Label>
                <Select value={createUserForm.watch("membershipTier")} onValueChange={(value) => createUserForm.setValue("membershipTier", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showEditUserDialog && selectedUser && (
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="max-w-md bg-gray-950 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Username</Label>
                <Input value={selectedUser.username} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input value={selectedUser.email || ''} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Role</Label>
                <Input value={selectedUser.role} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Membership Tier</Label>
                <Input value={selectedUser.membershipTier || 'None'} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowEditUserDialog(false)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showAddYachtDialog && (
        <Dialog open={showAddYachtDialog} onOpenChange={setShowAddYachtDialog}>
          <DialogContent className="max-w-md bg-gray-950 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Yacht</DialogTitle>
            </DialogHeader>
            <form onSubmit={createYachtForm.handleSubmit(onCreateYacht)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Yacht Name</Label>
                <Input
                  id="name"
                  {...createYachtForm.register("name")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {createYachtForm.formState.errors.name && (
                  <p className="text-red-400 text-sm mt-1">{createYachtForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="type" className="text-gray-300">Type</Label>
                <Input
                  id="type"
                  {...createYachtForm.register("type")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="length" className="text-gray-300">Length (ft)</Label>
                <Input
                  id="length"
                  type="number"
                  {...createYachtForm.register("length", { valueAsNumber: true })}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...createYachtForm.register("capacity", { valueAsNumber: true })}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="pricePerHour" className="text-gray-300">Price Per Hour</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  {...createYachtForm.register("pricePerHour", { valueAsNumber: true })}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-gray-300">Location</Label>
                <Input
                  id="location"
                  {...createYachtForm.register("location")}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddYachtDialog(false)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={createYachtMutation.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showEditYachtDialog && selectedYacht && (
        <Dialog open={showEditYachtDialog} onOpenChange={setShowEditYachtDialog}>
          <DialogContent className="max-w-md bg-gray-950 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Yacht</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Yacht Name</Label>
                <Input value={selectedYacht.name} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Type</Label>
                <Input value={selectedYacht.type} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Length</Label>
                <Input value={`${selectedYacht.length} ft`} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Capacity</Label>
                <Input value={`${selectedYacht.capacity} guests`} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Price Per Hour</Label>
                <Input value={`$${selectedYacht.pricePerHour}`} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div>
                <Label className="text-gray-300">Location</Label>
                <Input value={selectedYacht.location} readOnly className="bg-gray-900 border-gray-600 text-white" />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowEditYachtDialog(false)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}