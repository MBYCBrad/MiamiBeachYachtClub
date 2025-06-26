import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3, 
  Anchor, 
  CalendarDays, 
  DollarSign, 
  Settings, 
  Crown,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Zap,
  Star,
  Clock,
  Users,
  Eye,
  Edit,
  Plus,
  MapPin,
  Shield,
  Wrench,
  Camera,
  MessageSquare,
  Trash2,
  CreditCard,
  Menu,
  X,
  LogOut,
  Sparkles
} from "lucide-react";
import type { PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { MultiImageUpload } from "@/components/multi-image-upload";

interface YachtOwnerStats {
  totalYachts: number;
  totalBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  occupancyRate: number;
  pendingMaintenance: number;
}

const yachtFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  size: z.number().min(1, "Size must be greater than 0"),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  pricePerHour: z.string().optional(),
  isAvailable: z.boolean().default(true),
  yearMade: z.number().optional(),
  totalCost: z.number().optional()
});

type YachtFormData = z.infer<typeof yachtFormSchema>;

// Edit Yacht Dialog Component
function EditYachtDialog({ yacht }: { yacht: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<YachtFormData>({
    resolver: zodResolver(yachtFormSchema),
    defaultValues: {
      name: yacht.name || "",
      location: yacht.location || "",
      size: yacht.size || 0,
      capacity: yacht.capacity || 0,
      description: yacht.description || "",
      imageUrl: yacht.imageUrl || "",
      images: yacht.images || [],
      amenities: yacht.amenities || [],
      pricePerHour: yacht.pricePerHour || "",
      isAvailable: yacht.isAvailable ?? true,
      yearMade: yacht.yearMade || undefined,
      totalCost: yacht.totalCost ? parseFloat(yacht.totalCost.toString()) : undefined
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: YachtFormData) => {
      const response = await apiRequest("PUT", `/api/yachts/${yacht.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/yachts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yachts"] });
      toast({
        title: "Success",
        description: "Yacht updated successfully",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: YachtFormData) => {
    editMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Yacht</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update yacht information and settings
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Location</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Size (ft)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-gray-800 border-gray-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <MultiImageUpload
                label="Yacht Gallery"
                onImagesUploaded={(images) => {
                  form.setValue('images', images);
                  form.setValue('imageUrl', images[0] || '');
                }}
                currentImages={yacht.images || []}
                maxImages={10}
              />
            </div>

            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Price Per Hour</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-gray-800 border-gray-700 text-white" placeholder="$500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner Only Fields for Maintenance Calculations */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearMade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Year Made <span className="text-xs text-yellow-400">(Maintenance Only)</span></FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        className="bg-gray-800 border-gray-700 text-white" 
                        placeholder="2020"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Total Value/Cost <span className="text-xs text-yellow-400">(Maintenance Only)</span></FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        className="bg-gray-800 border-gray-700 text-white" 
                        placeholder="500000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-white">Available for Booking</FormLabel>
                    <div className="text-sm text-gray-400">
                      Allow members to book this yacht
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {editMutation.isPending ? "Updating..." : "Update Yacht"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Yacht Dialog Component
function DeleteYachtDialog({ yacht }: { yacht: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/yachts/${yacht.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/yachts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yachts"] });
      toast({
        title: "Success",
        description: "Yacht deleted successfully",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Yacht</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete "{yacht.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-600 to-indigo-600' },
  { id: 'fleet', label: 'My Fleet', icon: Anchor, color: 'from-purple-600 to-indigo-600' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-purple-600 to-indigo-600' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-purple-600 to-indigo-600' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'from-purple-600 to-indigo-600' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-purple-600 to-indigo-600' },
  { id: 'gallery', label: 'Gallery', icon: Camera, color: 'from-purple-600 to-indigo-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-purple-600 to-indigo-600' }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
              {title}
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              {value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  +{change}% this month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Sparkle effect */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const YachtCard = ({ yacht, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -8, scale: 1.03 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
      <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-indigo-500/20 relative overflow-hidden">
        {yacht.imageUrl && (
          <img 
            src={`/api/media/${yacht.imageUrl}`} 
            alt={yacht.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge className={`${yacht.isAvailable === false ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
            {yacht.isAvailable === false ? 'Maintenance' : 'Available'}
          </Badge>
        </div>
        
        {/* Rating */}
        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-white text-sm font-medium">4.8</span>
        </div>
        
        {/* Yacht Info */}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-white font-bold text-xl mb-1">{yacht.name}</h3>
          <div className="flex items-center space-x-4 text-purple-300 text-sm">
            <span>{yacht.size}ft</span>
            <span>•</span>
            <span>{yacht.capacity} guests</span>
            <span>•</span>
            <span>{yacht.location}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Monthly Revenue</span>
              <p className="text-white font-bold text-lg">${(yacht.pricePerHour ? parseInt(yacht.pricePerHour) * 120 : 15000).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Bookings</span>
              <p className="text-purple-400 font-bold text-lg">{12 + index * 3}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-purple-500">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
    </Card>
  </motion.div>
);

export default function YachtOwnerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states for different sections - exact copy from admin dashboard
  const [yachtFilters, setYachtFilters] = useState({
    availability: "all",
    size: "all", 
    location: "all",
    priceRange: "all"
  });
  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    timeRange: 'all',
    membershipTier: 'all',
    yachtSize: 'all',
    sortBy: 'date'
  });
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();

  const { data: stats } = useQuery<YachtOwnerStats>({
    queryKey: ['/api/yacht-owner/stats'],
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/yachts'],
    enabled: !!user && user.role === 'yacht_owner'
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/yacht-owner/bookings'],
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/yacht-owner/revenue'],
  });

  // Handle window resize for mobile responsiveness - exact copy from admin dashboard
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar when navigating on mobile - exact copy from admin dashboard
  const handleSectionChange = (sectionId: string) => {
    if (sectionId === 'logout') {
      logoutMutation.mutate();
      return;
    }
    
    setActiveSection(sectionId);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Toggle sidebar - exact copy from admin dashboard
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle swipe gestures for mobile - exact copy from admin dashboard
  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile) return;
    
    const { offset, velocity } = info;
    const threshold = 100;
    const velocityThreshold = 500;

    if (offset.x > threshold || velocity.x > velocityThreshold) {
      setSidebarCollapsed(false);
    } else if (offset.x < -threshold || velocity.x < -velocityThreshold) {
      setSidebarCollapsed(true);
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
            className="text-4xl font-bold text-white mb-2"
          >
            Yacht Owner Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht portfolio and optimize revenue
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </motion.div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Fleet"
          value={stats?.totalYachts || '3'}
          change={null}
          icon={Anchor}
          gradient="from-purple-500 to-indigo-500"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 45000).toLocaleString()}`}
          change={18}
          icon={DollarSign}
          gradient="from-purple-500 to-indigo-500"
          delay={0.1}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || '27'}
          change={23}
          icon={CalendarDays}
          gradient="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats?.avgRating || 4.8}/5`}
          change={5}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Fleet Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              Fleet Performance
            </CardTitle>
            <CardDescription>Revenue and occupancy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Marina Breeze", "Ocean Dreams", "Sunset Voyager"].map((yacht, index) => (
                <div key={yacht} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                      <Anchor className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{yacht}</p>
                      <p className="text-sm text-gray-400">{85 + index * 5}% occupancy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${(15 + index * 5).toLocaleString()}k</p>
                    <p className="text-xs text-green-400">+{12 + index * 3}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest reservations and guest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map((booking, index) => (
                <motion.div
                  key={booking}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                        M{booking}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">Member {booking}</p>
                      <p className="text-sm text-gray-400">Marina Breeze • 3 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${1200 + booking * 300}</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Confirmed
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderFleet = () => (
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
            My Yacht Fleet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yachts, bookings, and maintenance schedules
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add New Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Yachts"
          value="3"
          change={null}
          icon={Anchor}
          gradient="from-purple-500 to-indigo-500"
          delay={0}
        />
        <StatCard
          title="Available Now"
          value="2"
          change={null}
          icon={Activity}
          gradient="from-purple-500 to-indigo-500"
          delay={0.1}
        />
        <StatCard
          title="In Maintenance"
          value="1"
          change={null}
          icon={Wrench}
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Occupancy"
          value="87%"
          change={12}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Owner's Yacht Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {!yachts ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl animate-pulse">
              <div className="h-48 bg-gray-800 rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : yachts && yachts.length > 0 ? (
          // Real yachts owned by this user
          (yachts || []).map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative overflow-hidden"
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={yacht.imageUrl || '/yacht-placeholder.jpg'} 
                    alt={yacht.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Yacht Status */}
                  <div className="absolute top-4 right-4">
                    <Badge className={yacht.isAvailable ? "bg-green-600" : "bg-red-600"}>
                      {yacht.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <EditYachtDialog yacht={yacht} />
                    <DeleteYachtDialog yacht={yacht} />
                  </div>
                  
                  {/* Yacht Info */}
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-xl mb-1">{yacht.name}</h3>
                    <p className="text-white/80 text-sm">{yacht.location}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm line-clamp-2">{yacht.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{yacht.size}ft</div>
                        <div className="text-gray-400 text-sm">Length</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{yacht.capacity}</div>
                        <div className="text-gray-400 text-sm">Guests</div>
                      </div>
                    </div>
                    
                    {yacht.pricePerHour && (
                      <div className="text-center pt-2 border-t border-gray-700">
                        <div className="text-purple-400 font-bold text-lg">{yacht.pricePerHour}/hour</div>
                        <div className="text-gray-400 text-sm">Rental Rate</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          // Empty state - no yachts owned
          <div className="col-span-full text-center py-12">
            <Anchor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-4">No yachts in your fleet</div>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Yacht
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'fleet':
        return renderFleet();
      case 'bookings':
        return renderBookings();
      case 'revenue':
        return renderRevenue();
      case 'maintenance':
        return renderMaintenance();
      case 'analytics':
        return renderAnalytics();
      case 'gallery':
        return renderGallery();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-black"
      onPan={handlePan}
    >
      {/* Hamburger Menu Button - exact copy from admin dashboard */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={toggleSidebar}
            className="fixed top-6 left-6 z-[9999] p-3 bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-700/50 text-white hover:bg-gray-800/80 transition-all shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar - exact copy from admin dashboard */}
        <motion.div
          ref={sidebarRef}
          initial={false}
          animate={{
            x: sidebarCollapsed ? -320 : 0,
            opacity: sidebarCollapsed ? 0 : 1
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed left-0 top-0 w-80 h-full bg-gray-900/50 border-r border-gray-700/50 backdrop-blur-xl z-50 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-indigo-900/20" />
          
          {/* Close button (X) when sidebar is open */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={toggleSidebar}
                className="absolute top-6 right-6 p-3 bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700/50 text-white hover:bg-gray-700/80 transition-all shadow-lg z-10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Logo */}
          <div className="p-8 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1750532808484.png" 
                  alt="MBYC Logo"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Yacht Owner</h2>
                <p className="text-sm text-gray-400">Fleet Management</p>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search fleet features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 pb-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden admin-nav-button ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active background gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Profile - moved to bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-gradient-to-br ring-purple-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold text-2xl">
                    Y
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Yacht Owner'}</p>
                <p className="text-xs text-gray-400">Fleet Manager</p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Messages Icon */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-400 hover:text-white relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full" />
                </Button>
                
                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - exact copy from admin dashboard */}
        <motion.div
          initial={false}
          animate={{
            marginLeft: sidebarCollapsed ? 0 : 320,
            width: sidebarCollapsed ? "100%" : "calc(100% - 320px)"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 min-h-screen bg-black overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-indigo-900/20" />
          
          {/* Main Content */}
          <div className="relative z-10 p-8">
            {renderCurrentSection()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
