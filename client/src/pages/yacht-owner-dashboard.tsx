import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3, 
  Anchor, 
  CalendarDays,
  Calendar,
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
  ChevronLeft,
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
  Sparkles,
  User,
  Calculator,
  CheckCircle,
  Heart,
  Save,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  FileText
} from "lucide-react";
import type { PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const maintenanceRecordSchema = z.object({
  taskDescription: z.string().min(1, "Task description is required"),
  priority: z.string().default("medium"),
  estimatedCost: z.string().optional(),
  notes: z.string().optional()
});

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

// StatCard component - copied exactly from admin dashboard
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
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'from-purple-600 to-indigo-600' },
  { id: 'gallery', label: 'Gallery', icon: Camera, color: 'from-purple-600 to-indigo-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-purple-600 to-indigo-600' }
];


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
  const [, setLocation] = useLocation();
  
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
  
  // Maintenance page state
  const [selectedMaintenanceYacht, setSelectedMaintenanceYacht] = useState<number | null>(null);
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('overview');
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<YachtOwnerStats>({
    queryKey: ['/api/yacht-owner/stats'],
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/yachts'],
    enabled: !!user && user.role === 'yacht_owner'
  });

  // Maintenance records data fetching
  const { data: maintenanceRecords = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-maintenance', selectedMaintenanceYacht],
    enabled: !!selectedMaintenanceYacht,
  });

  // Add maintenance record form
  const addMaintenanceForm = useForm<z.infer<typeof maintenanceRecordSchema>>({
    resolver: zodResolver(maintenanceRecordSchema),
    defaultValues: {
      taskDescription: "",
      priority: "medium",
      estimatedCost: "",
      notes: ""
    }
  });

  // Add maintenance record mutation
  const addMaintenanceRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof maintenanceRecordSchema>) => {
      const response = await apiRequest("POST", "/api/yacht-maintenance", {
        ...data,
        yachtId: selectedMaintenanceYacht
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-maintenance', selectedMaintenanceYacht] });
      addMaintenanceForm.reset();
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add maintenance record",
        variant: "destructive",
      });
    }
  });

  const handleAddMaintenanceRecord = (data: z.infer<typeof maintenanceRecordSchema>) => {
    addMaintenanceRecordMutation.mutate(data);
  };

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

  // Add Yacht Dialog - Exact copy from admin dashboard with yacht owner adaptations
  function AddYachtDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      location: '',
      size: '',
      capacity: '',
      description: '',
      imageUrl: '',
      images: [] as string[],
      pricePerHour: '',
      isAvailable: true,
      ownerId: '',
      amenities: '',
      yearMade: '',
      totalCost: ''
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createYachtMutation = useMutation({
      mutationFn: async (data: any) => {
        const yachtData = {
          ...data,
          size: parseInt(data.size),
          capacity: parseInt(data.capacity),
          ownerId: user?.id || parseInt(data.ownerId),
          amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
          images: data.images || [],
          yearMade: data.yearMade && data.yearMade !== '' ? parseInt(data.yearMade) : undefined,
          totalCost: data.totalCost && data.totalCost !== '' ? parseFloat(data.totalCost) : undefined
        };
        const response = await apiRequest("POST", "/api/admin/yachts", yachtData);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/yachts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/stats"] });
        toast({ title: "Success", description: "Yacht created successfully" });
        setIsOpen(false);
        setFormData({ name: '', location: '', size: '', capacity: '', description: '', imageUrl: '', images: [], pricePerHour: '', isAvailable: true, ownerId: user?.id?.toString() || '', amenities: '', yearMade: '', totalCost: '' });
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add New Yacht
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto dialog-content-spacing">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Yacht</DialogTitle>
          </DialogHeader>
          <div className="dialog-form-spacing">
            <div className="form-grid-2">
              <div className="form-field-spacing">
                <Label htmlFor="name" className="form-label text-gray-300">Yacht Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter yacht name"
                />
              </div>
              <div className="form-field-spacing">
                <Label htmlFor="location" className="form-label text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="Marina location"
                />
              </div>
            </div>
            
            <div className="form-grid-2">
              <div className="form-field-spacing">
                <Label htmlFor="size" className="form-label text-gray-300">Size (ft)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="40"
                />
              </div>
              <div className="form-field-spacing">
                <Label htmlFor="capacity" className="form-label text-gray-300">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="12"
                />
              </div>
            </div>
            
            <div className="form-grid-2">
              <div className="form-field-spacing">
                <Label htmlFor="pricePerHour" className="form-label text-gray-300">Price per Hour</Label>
                <Input
                  id="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="500"
                />
              </div>
              <div className="form-field-spacing">
                <Label htmlFor="yearMade" className="form-label text-gray-300">Year Made <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
                <Input
                  id="yearMade"
                  type="number"
                  value={formData.yearMade}
                  onChange={(e) => setFormData({...formData, yearMade: e.target.value})}
                  className="form-input bg-gray-900 border-gray-700 text-white"
                  placeholder="2020"
                />
              </div>
            </div>
            
            <div className="form-field-spacing">
              <Label htmlFor="description" className="form-label text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea bg-gray-900 border-gray-700 text-white"
                placeholder="Yacht description..."
              />
            </div>
            
            <div className="form-field-spacing">
              <Label htmlFor="amenities" className="form-label text-gray-300">Amenities (comma separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="WiFi, Air Conditioning, Sound System"
              />
            </div>
            
            <div className="form-field-spacing">
              <Label htmlFor="totalCost" className="form-label text-gray-300">Total Value/Cost <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="500000"
              />
            </div>
            
            <div className="form-field-spacing">
              <MultiImageUpload
                label="Yacht Gallery"
                onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
                currentImages={formData.images || []}
                maxImages={10}
              />
            </div>
          </div>
          
          <div className="form-button-group">
            <Button 
              onClick={() => createYachtMutation.mutate(formData)}
              disabled={createYachtMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
          <AddYachtDialog />
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

  const renderBookings = () => (
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
            Bookings Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monitor your yacht bookings and guest experiences
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
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
            onClick={() => setLocation('/yacht-owner-calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Overview
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter Bookings
          </Button>
        </motion.div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={bookings?.length.toString() || '0'}
          change={null}
          icon={Anchor}
          gradient="from-purple-500 to-indigo-500"
          delay={0}
        />
        <StatCard
          title="Active Bookings"
          value={bookings?.filter((b: any) => b.status === 'confirmed')?.length.toString() || '0'}
          change={null}
          icon={Activity}
          gradient="from-purple-500 to-indigo-500"
          delay={0.1}
        />
        <StatCard
          title="Pending Review"
          value={bookings?.filter((b: any) => b.status === 'pending')?.length.toString() || '0'}
          change={null}
          icon={Clock}
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <StatCard
          title="Total Revenue"
          value="$12,840"
          change={18}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Bookings List */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Bookings</CardTitle>
          <CardDescription>Latest yacht reservations and guest requests</CardDescription>
        </CardHeader>
        <CardContent>
          {!bookings ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-4">No bookings yet</div>
              <div className="text-gray-500 text-sm">Your yacht bookings will appear here once members make reservations</div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any, index: number) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{booking.user?.username || booking.user?.fullName || 'Guest'}</p>
                      <p className="text-gray-400 text-sm">{booking.yacht?.name || 'Unknown Yacht'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{new Date(booking.startTime).toLocaleDateString()}</p>
                    <Badge className={
                      booking.status === 'confirmed' ? 'bg-green-600' : 
                      booking.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderRevenue = () => (
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
            Revenue Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Track your yacht rental income and performance metrics
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Time Period
          </Button>
        </motion.div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.monthlyRevenue.toFixed(2) || '0.00'}`}
          change={18}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0}
        />
        <StatCard
          title="Monthly Income"
          value={`$${(stats?.monthlyRevenue || 0).toFixed(2)}`}
          change={12}
          icon={TrendingUp}
          gradient="from-purple-500 to-indigo-500"
          delay={0.1}
        />
        <StatCard
          title="Avg Booking Value"
          value="$2,140"
          change={8}
          icon={Calculator}
          gradient="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          change={stats?.occupancyRate ? stats.occupancyRate - 75 : 0}
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Revenue Chart */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Monthly Revenue Trends</CardTitle>
          <CardDescription>Revenue performance over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {!revenueData ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading revenue data...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {revenueData.map((month: any, index: number) => {
                const maxRevenue = Math.max(...revenueData.map((m: any) => m.revenue));
                const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-4"
                  >
                    <span className="text-white font-medium w-16">{month.month}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-20">${month.revenue.toFixed(0)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMaintenance = () => {
    if (selectedMaintenanceYacht) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header with Back Navigation */}
          <div className="flex items-center justify-between mt-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedMaintenanceYacht(null)}
                  className="border-gray-600 hover:border-purple-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Fleet
                </Button>
                <div className="text-sm text-gray-400">
                  Fleet Management → Yacht Maintenance
                </div>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white mb-2 tracking-tight"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
              >
                {yachts?.find(y => y.id === selectedMaintenanceYacht)?.name || 'Yacht'} Maintenance
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-400"
              >
                {yachts?.find(y => y.id === selectedMaintenanceYacht)?.name} - Comprehensive maintenance tracking
              </motion.p>
            </div>
          </div>

          {/* 4-Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'records', label: 'Maintenance Records', icon: FileText },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMaintenanceTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeMaintenanceTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeMaintenanceTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Engine Hours"
                  value="2,450"
                  change={null}
                  icon={Wrench}
                  gradient="from-purple-600 to-indigo-600"
                  delay={0}
                />
                <StatCard
                  title="Last Service"
                  value="15 days ago"
                  change={null}
                  icon={CheckCircle}
                  gradient="from-purple-600 to-blue-600"
                  delay={0.1}
                />
                <StatCard
                  title="Next Service"
                  value="In 45 days"
                  change={null}
                  icon={Calendar}
                  gradient="from-purple-500 to-indigo-500"
                  delay={0.2}
                />
                <StatCard
                  title="Health Score"
                  value="94%"
                  change={3}
                  icon={Heart}
                  gradient="from-purple-500 to-blue-500"
                  delay={0.3}
                />
              </div>
            )}
            
            {activeMaintenanceTab === 'records' && (
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Maintenance History</CardTitle>
                    <CardDescription>Complete maintenance record log</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Maintenance Record</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create a new maintenance record for {yachts?.find(y => y.id === selectedMaintenanceYacht)?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addMaintenanceForm}>
                        <form onSubmit={addMaintenanceForm.handleSubmit(handleAddMaintenanceRecord)} className="space-y-4">
                          <FormField
                            control={addMaintenanceForm.control}
                            name="taskDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Task Description</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., Engine Oil Change, Hull Cleaning"
                                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addMaintenanceForm.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Priority</FormLabel>
                                  <FormControl>
                                    <select 
                                      {...field}
                                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addMaintenanceForm.control}
                              name="estimatedCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Estimated Cost</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="$0.00"
                                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addMaintenanceForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Additional details about the maintenance task..."
                                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <Button 
                              type="submit" 
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              disabled={addMaintenanceRecordMutation.isPending}
                            >
                              {addMaintenanceRecordMutation.isPending ? 'Adding...' : 'Add Record'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceRecords?.length === 0 ? (
                      <div className="text-center py-8">
                        <Wrench className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No maintenance records yet</p>
                        <p className="text-gray-500 text-sm">Click "Add Record" to create the first maintenance entry</p>
                      </div>
                    ) : (
                      maintenanceRecords?.map((record: any, index: number) => (
                        <div key={record.id || index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{record.taskDescription}</p>
                              <p className="text-gray-400 text-sm">
                                {record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : 'No date set'}
                              </p>
                              {record.notes && (
                                <p className="text-gray-500 text-xs mt-1">{record.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {record.estimatedCost ? `$${record.estimatedCost}` : 'Cost TBD'}
                            </p>
                            <Badge 
                              className={`${
                                record.priority === 'urgent' 
                                  ? 'bg-red-600' 
                                  : record.priority === 'high'
                                  ? 'bg-orange-600'
                                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
                              } text-white`}
                            >
                              {record.priority || 'medium'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeMaintenanceTab === 'schedule' && (
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Upcoming Maintenance</CardTitle>
                  <CardDescription>Scheduled maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { task: 'Annual Inspection', date: '2024-08-15', priority: 'high', estimated: '$1,200' },
                      { task: 'Engine Service', date: '2024-07-30', priority: 'medium', estimated: '$800' },
                      { task: 'Electronics Check', date: '2024-09-01', priority: 'low', estimated: '$400' }
                    ].map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{task.task}</p>
                            <p className="text-gray-400 text-sm">{task.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{task.estimated}</p>
                          <Badge className={`${
                            task.priority === 'high' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                            task.priority === 'medium' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                            'bg-gradient-to-r from-purple-600 to-blue-600'
                          } text-white`}>
                            {task.priority} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeMaintenanceTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">This Year</span>
                        <span className="text-white font-bold">$4,750</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Year</span>
                        <span className="text-white font-bold">$3,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Average Monthly</span>
                        <span className="text-white font-bold">$396</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Uptime</span>
                        <span className="text-white font-bold">96.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Efficiency</span>
                        <span className="text-white font-bold">92.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Health Score</span>
                        <span className="text-white font-bold">94.0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Fleet Selection View (copied from admin)
    return (
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
              Fleet Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Manage yacht fleet, maintenance, and specifications
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Filter className="h-4 w-4 mr-2" />
              Filter Fleet
            </Button>
          </motion.div>
        </div>

        {/* Yachts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yachts?.map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedMaintenanceYacht(yacht.id)}
              className="cursor-pointer"
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                    alt={yacht.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${yacht.isAvailable ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30' : 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/30'}`}>
                      {yacht.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-2">
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{yacht.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{yacht.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="text-sm">Size: {yacht.size}ft</span>
                      <span className="text-sm">Capacity: {yacht.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Click for Maintenance</span>
                    <div className="text-purple-400">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderAnalytics = () => (
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
            Analytics Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Advanced insights into yacht performance and business metrics
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Time Period
          </Button>
        </motion.div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings.toString() || '0'}
          change={15}
          icon={TrendingUp}
          gradient="from-purple-500 to-indigo-500"
          delay={0}
        />
        <StatCard
          title="Revenue Growth"
          value="24%"
          change={18}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Customer Rating"
          value="4.8/5"
          change={5}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${stats?.occupancyRate || 0}%`}
          change={stats?.occupancyRate ? stats.occupancyRate - 75 : 0}
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
          delay={0.3}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Yacht Performance</CardTitle>
            <CardDescription>Individual yacht booking and revenue metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yachts && yachts.length > 0 ? yachts.map((yacht: any, index: number) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                >
                  <div>
                    <p className="text-white font-medium">{yacht.name}</p>
                    <p className="text-gray-400 text-sm">{yacht.size}ft yacht</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">85% utilized</p>
                    <p className="text-gray-400 text-sm">12 bookings</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  No yacht data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Booking Trends</CardTitle>
            <CardDescription>Monthly booking patterns and seasonality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'Jan', bookings: 8 },
                { month: 'Feb', bookings: 12 },
                { month: 'Mar', bookings: 15 },
                { month: 'Apr', bookings: 18 },
                { month: 'May', bookings: 22 },
                { month: 'Jun', bookings: 25 }
              ].map((month, index) => {
                const maxBookings = 25;
                const percentage = (month.bookings / maxBookings) * 100;
                
                return (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-4"
                  >
                    <span className="text-white font-medium w-12">{month.month}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-8">{month.bookings}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderGallery = () => (
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
            Yacht Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Showcase your yacht fleet with stunning photography
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter Gallery
          </Button>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {yachts && yachts.length > 0 ? yachts.map((yacht: any, index: number) => (
          <motion.div
            key={yacht.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative overflow-hidden rounded-xl"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl overflow-hidden">
              <div className="h-64 relative">
                <img 
                  src={yacht.imageUrl || '/yacht-placeholder.jpg'} 
                  alt={yacht.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Yacht Info Overlay */}
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-xl mb-1">{yacht.name}</h3>
                  <p className="text-white/80 text-sm">{yacht.size}ft • {yacht.location}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <div className="col-span-full text-center py-12">
            <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-4">No photos in your gallery</div>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Photos
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderCalendar = () => (
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
            Calendar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            View and manage your yacht booking schedule
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Calendar Content */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Booking Schedule</CardTitle>
          <CardDescription>Your yacht reservations and maintenance schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-white font-semibold text-lg">June 2025</h3>
                <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">Month</Button>
                <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">Week</Button>
                <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">Day</Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Calendar Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-gray-400 font-medium">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({ length: 35 }, (_, index) => {
                const day = index - 5; // Start calendar from previous month
                const isCurrentMonth = day > 0 && day <= 30;
                const isToday = day === 26; // Today is June 26
                const hasBooking = [12, 15, 23, 28].includes(day);
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`p-3 h-20 border border-gray-800 rounded-lg cursor-pointer transition-all relative ${
                      isCurrentMonth 
                        ? isToday 
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white' 
                          : 'bg-gray-800/30 hover:bg-gray-700/50 text-white'
                        : 'bg-gray-900/20 text-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 30}
                    </div>
                    {hasBooking && isCurrentMonth && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="w-full h-1 bg-purple-400 rounded-full"></div>
                        <div className="text-xs text-purple-400 mt-1">Booking</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Upcoming Events */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Upcoming Bookings</h4>
              <div className="space-y-3">
                {bookings && bookings.length > 0 ? bookings.slice(0, 3).map((booking: any, index: number) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <Anchor className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{booking.yachtName}</p>
                        <p className="text-gray-400 text-sm">{booking.memberName || 'Guest Booking'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{new Date(booking.startTime).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg mb-2">No upcoming bookings</div>
                    <div className="text-gray-500 text-sm">Your yacht booking schedule will appear here</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => (
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
            Account Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your account preferences and yacht owner settings
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </motion.div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-500" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium">Display Name</label>
              <Input 
                defaultValue={user?.username || ''}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white font-medium">Email Address</label>
              <Input 
                defaultValue={user?.email || ''}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white font-medium">Phone Number</label>
              <Input 
                defaultValue=""
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Enter your phone number"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-500" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure how you receive updates about your yachts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'New Bookings', description: 'Get notified when guests book your yachts' },
              { label: 'Maintenance Alerts', description: 'Receive maintenance reminders and updates' },
              { label: 'Revenue Reports', description: 'Monthly and weekly revenue summaries' },
              { label: 'Guest Reviews', description: 'Notifications when guests leave reviews' }
            ].map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
                <div>
                  <p className="text-white font-medium">{notification.label}</p>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                </div>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-6 bg-purple-500 rounded-full p-1 cursor-pointer"
                >
                  <div className="w-4 h-4 bg-white rounded-full ml-auto transition-all" />
                </motion.div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Protect your account and yacht management access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-800/30">
              <p className="text-white font-medium mb-2">Change Password</p>
              <p className="text-sm text-gray-400 mb-3">Update your account password</p>
              <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
                Update Password
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Disabled</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Anchor className="h-5 w-5 mr-2 text-purple-500" />
              Yacht Management
            </CardTitle>
            <CardDescription>Configure default settings for your yacht listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium">Default Booking Duration</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                <option>4 hours</option>
                <option>8 hours</option>
                <option>Full day</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white font-medium">Auto-approval</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                <option>Manual approval</option>
                <option>Auto-approve all</option>
                <option>Auto-approve returning guests</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
              <div>
                <p className="text-white font-medium">Instant Booking</p>
                <p className="text-sm text-gray-400">Allow guests to book without approval</p>
              </div>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="w-12 h-6 bg-purple-500 rounded-full p-1 cursor-pointer"
              >
                <div className="w-4 h-4 bg-white rounded-full ml-auto transition-all" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
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
      case 'calendar':
        return renderCalendar();
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
