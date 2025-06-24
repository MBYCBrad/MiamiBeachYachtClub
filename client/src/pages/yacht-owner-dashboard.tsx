import { useState } from "react";
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
  Sparkles,
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
  Trash2
} from "lucide-react";
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
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
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
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { id: 'fleet', label: 'My Fleet', icon: Anchor, color: 'from-emerald-500 to-teal-500' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-purple-500 to-pink-500' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-indigo-500' },
  { id: 'gallery', label: 'Gallery', icon: Camera, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-emerald-500/30">
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
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
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
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-emerald-500/30">
      <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative overflow-hidden">
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
          <div className="flex items-center space-x-4 text-emerald-300 text-sm">
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
              <p className="text-emerald-400 font-bold text-lg">{12 + index * 3}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-emerald-500">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
    </Card>
  </motion.div>
);

export default function YachtOwnerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
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
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
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
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 45000).toLocaleString()}`}
          change={18}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
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
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
              Fleet Performance
            </CardTitle>
            <CardDescription>Revenue and occupancy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Marina Breeze", "Ocean Dreams", "Sunset Voyager"].map((yacht, index) => (
                <div key={yacht} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
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
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
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
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add New Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
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
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="Available Now"
          value="2"
          change={null}
          icon={Activity}
          gradient="from-green-500 to-emerald-500"
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
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-emerald-500/30">
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
                        <div className="text-emerald-400 font-bold text-lg">{yacht.pricePerHour}/hour</div>
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
            <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Yacht
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 min-h-screen relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-teal-900/20" />
          
          {/* Logo */}
          <div className="p-8 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                <Crown className="h-8 w-8 text-white" />
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
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
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
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-white shadow-lg' 
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
                    
                    <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color}` : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Zap className="h-4 w-4 text-emerald-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                  YO
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Yacht Owner'}</p>
                <p className="text-xs text-gray-400">Fleet Manager</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => logoutMutation.mutate()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'fleet' && renderFleet()}
            {activeSection === 'bookings' && (
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
                      Booking Management
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Manage yacht reservations and guest communications
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Calendar View
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Bookings
                    </Button>
                  </motion.div>
                </div>

                {/* Booking Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Active Bookings"
                    value={(bookings as any[])?.length || "0"}
                    change={null}
                    icon={CalendarDays}
                    gradient="from-emerald-500 to-teal-500"
                    delay={0}
                  />
                  <StatCard
                    title="This Month"
                    value="8"
                    change={25}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Occupancy Rate"
                    value="73%"
                    change={12}
                    icon={Activity}
                    gradient="from-green-500 to-emerald-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Avg Duration"
                    value="3.2 days"
                    change={null}
                    icon={Clock}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.3}
                  />
                </div>

                {/* Booking Timeline */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-emerald-500" />
                      Upcoming Bookings
                    </CardTitle>
                    <CardDescription>Scheduled yacht reservations and guest details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(bookings as any[])?.length ? (bookings as any[]).map((booking: any, index: number) => (
                        <motion.div
                          key={booking.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex items-center justify-between p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                        >
                          <div className="flex items-center space-x-6">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                              <Anchor className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-lg">{booking.yacht?.name || 'Yacht'}</p>
                              <p className="text-gray-400">Guest: {booking.user?.username || 'Guest'}</p>
                              <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-white font-bold text-xl">${(booking.totalPrice || 2500).toLocaleString()}</p>
                              <Badge className={`${
                                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}>
                                {booking.status || 'confirmed'}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )) : (
                        [
                          { id: 1, yacht: 'Ocean Paradise', guest: 'Marina Elite', dates: 'Dec 24-26', amount: 4500, status: 'confirmed' },
                          { id: 2, yacht: 'Sea Breeze', guest: 'Yacht Dreams', dates: 'Dec 28-30', amount: 3200, status: 'pending' },
                          { id: 3, yacht: 'Wave Runner', guest: 'Blue Waters', dates: 'Jan 2-4', amount: 2800, status: 'confirmed' }
                        ].map((booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="flex items-center justify-between p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                          >
                            <div className="flex items-center space-x-6">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                                <Anchor className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{booking.yacht}</p>
                                <p className="text-gray-400">Guest: {booking.guest}</p>
                                <p className="text-sm text-gray-500">{booking.dates}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-white font-bold text-xl">${booking.amount.toLocaleString()}</p>
                                <Badge className={booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {activeSection === 'revenue' && (
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
                      Revenue Analytics
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Track earnings, pricing optimization, and financial reports
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-green-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Time Period
                    </Button>
                  </motion.div>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Monthly Revenue"
                    value={`$${(revenueData as any[])?.reduce((sum, month) => sum + month.revenue, 0).toLocaleString() || '48,290'}`}
                    change={22}
                    icon={DollarSign}
                    gradient="from-green-500 to-emerald-500"
                    delay={0}
                  />
                  <StatCard
                    title="Average Per Day"
                    value="$1,548"
                    change={8}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Occupancy Revenue"
                    value="$35,620"
                    change={15}
                    icon={Activity}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Growth Rate"
                    value="+28%"
                    change={null}
                    icon={TrendingUp}
                    gradient="from-emerald-500 to-teal-500"
                    delay={0.3}
                  />
                </div>

                {/* Revenue Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                        Monthly Revenue Trends
                      </CardTitle>
                      <CardDescription>Revenue performance over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {(revenueData as any[])?.length ? (revenueData as any[]).map((data: any, index: number) => {
                          const maxRevenue = Math.max(...(revenueData as any[]).map((d: any) => d.revenue));
                          const width = (data.revenue / maxRevenue) * 100;
                          
                          return (
                            <div key={data.month} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{data.month}</span>
                                <div className="text-right">
                                  <p className="text-white font-bold">${data.revenue.toLocaleString()}</p>
                                  <p className="text-xs text-gray-400">{data.bookings || 0} bookings</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${width}%` }}
                                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                />
                              </div>
                            </div>
                          );
                        }) : (
                          [
                            { month: 'Jul 2024', revenue: 12400, bookings: 8 },
                            { month: 'Aug 2024', revenue: 15200, bookings: 10 },
                            { month: 'Sep 2024', revenue: 18600, bookings: 12 },
                            { month: 'Oct 2024', revenue: 22100, bookings: 14 },
                            { month: 'Nov 2024', revenue: 19800, bookings: 13 },
                            { month: 'Dec 2024', revenue: 24500, bookings: 16 }
                          ].map((data, index) => {
                            const maxRevenue = 24500;
                            const width = (data.revenue / maxRevenue) * 100;
                            
                            return (
                              <div key={data.month} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-medium">{data.month}</span>
                                  <div className="text-right">
                                    <p className="text-white font-bold">${data.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">{data.bookings} bookings</p>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Anchor className="h-5 w-5 mr-2 text-green-500" />
                        Fleet Performance
                      </CardTitle>
                      <CardDescription>Revenue breakdown by yacht</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(yachts as any[])?.length ? (yachts as any[]).map((yacht: any, index: number) => {
                          const revenue = [12500, 8900, 6700][index] || 5000;
                          const occupancy = [85, 72, 65][index] || 60;
                          
                          return (
                            <motion.div
                              key={yacht.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + index * 0.1 }}
                              className="p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                                    <Anchor className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{yacht.name}</p>
                                    <p className="text-xs text-gray-400">{yacht.size}ft • {yacht.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold">${revenue.toLocaleString()}</p>
                                  <p className="text-xs text-green-400">{occupancy}% occupied</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${occupancy}%` }}
                                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                />
                              </div>
                            </motion.div>
                          );
                        }) : (
                          [
                            { name: 'Ocean Paradise', size: 85, location: 'Miami Marina', revenue: 12500, occupancy: 85 },
                            { name: 'Sea Breeze', size: 75, location: 'Key Biscayne', revenue: 8900, occupancy: 72 },
                            { name: 'Wave Runner', size: 65, location: 'South Beach', revenue: 6700, occupancy: 65 }
                          ].map((yacht, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + index * 0.1 }}
                              className="p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                                    <Anchor className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{yacht.name}</p>
                                    <p className="text-xs text-gray-400">{yacht.size}ft • {yacht.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold">${yacht.revenue.toLocaleString()}</p>
                                  <p className="text-xs text-green-400">{yacht.occupancy}% occupied</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${yacht.occupancy}%` }}
                                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                />
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                      Financial Summary
                    </CardTitle>
                    <CardDescription>Comprehensive financial overview and projections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Revenue Streams',
                          metrics: [
                            { label: 'Charter Bookings', value: '$35,620', color: 'text-green-400' },
                            { label: 'Premium Services', value: '$8,450', color: 'text-blue-400' },
                            { label: 'Event Hosting', value: '$4,220', color: 'text-purple-400' }
                          ]
                        },
                        {
                          title: 'Operating Costs',
                          metrics: [
                            { label: 'Maintenance', value: '$6,200', color: 'text-orange-400' },
                            { label: 'Insurance', value: '$2,800', color: 'text-red-400' },
                            { label: 'Marina Fees', value: '$1,950', color: 'text-yellow-400' }
                          ]
                        },
                        {
                          title: 'Net Performance',
                          metrics: [
                            { label: 'Gross Revenue', value: '$48,290', color: 'text-green-400' },
                            { label: 'Operating Costs', value: '$10,950', color: 'text-red-400' },
                            { label: 'Net Profit', value: '$37,340', color: 'text-emerald-400' }
                          ]
                        }
                      ].map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="space-y-4"
                        >
                          <h4 className="text-white font-semibold text-lg">{section.title}</h4>
                          <div className="space-y-3">
                            {section.metrics.map((metric, metricIndex) => (
                              <div key={metricIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                                <span className="text-gray-400 text-sm">{metric.label}</span>
                                <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {activeSection === 'maintenance' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Wrench className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Maintenance Hub</h2>
                  <p className="text-gray-400">Schedule service, track repairs, and manage yacht upkeep</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'analytics' && (
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
                      Performance Analytics
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Deep insights into fleet performance and optimization opportunities
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Analytics Period
                    </Button>
                  </motion.div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Fleet Utilization"
                    value="78%"
                    change={12}
                    icon={Activity}
                    gradient="from-emerald-500 to-teal-500"
                    delay={0}
                  />
                  <StatCard
                    title="Revenue per Yacht"
                    value="$9,430"
                    change={18}
                    icon={DollarSign}
                    gradient="from-green-500 to-emerald-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Booking Rate"
                    value="85%"
                    change={8}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Customer Satisfaction"
                    value="4.8/5"
                    change={5}
                    icon={Star}
                    gradient="from-yellow-500 to-orange-500"
                    delay={0.3}
                  />
                </div>

                {/* Analytics Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-emerald-500" />
                        Fleet Performance Trends
                      </CardTitle>
                      <CardDescription>Monthly performance metrics across your fleet</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          { metric: 'Utilization Rate', data: [72, 75, 78, 81, 85, 78], color: 'from-emerald-500 to-teal-500' },
                          { metric: 'Revenue Growth', data: [15, 22, 18, 28, 32, 25], color: 'from-green-500 to-emerald-500' },
                          { metric: 'Booking Conversion', data: [68, 72, 75, 80, 85, 82], color: 'from-blue-500 to-cyan-500' },
                          { metric: 'Customer Retention', data: [85, 87, 89, 92, 94, 91], color: 'from-purple-500 to-pink-500' }
                        ].map((trend, index) => {
                          const currentValue = trend.data[trend.data.length - 1];
                          const maxValue = Math.max(...trend.data);
                          const width = (currentValue / maxValue) * 100;
                          
                          return (
                            <div key={trend.metric} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{trend.metric}</span>
                                <span className="text-white font-bold">{currentValue}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${width}%` }}
                                  transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
                                  className={`h-3 rounded-full bg-gradient-to-r ${trend.color}`}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>6 months ago</span>
                                <span>Current</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="h-5 w-5 mr-2 text-emerald-500" />
                        Guest Analytics
                      </CardTitle>
                      <CardDescription>Guest behavior and booking patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 rounded-xl bg-gray-800/30">
                            <div className="text-2xl font-bold text-white mb-1">73%</div>
                            <div className="text-xs text-gray-400">Repeat Guests</div>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-gray-800/30">
                            <div className="text-2xl font-bold text-white mb-1">3.2</div>
                            <div className="text-xs text-gray-400">Avg Days/Booking</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-white font-medium">Peak Booking Periods</h4>
                          {[
                            { period: 'Summer Season', bookings: 45, percentage: 90 },
                            { period: 'Holiday Weekends', bookings: 38, percentage: 76 },
                            { period: 'Winter Months', bookings: 25, percentage: 50 },
                            { period: 'Spring Break', bookings: 32, percentage: 64 }
                          ].map((period, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm">{period.period}</span>
                                <span className="text-gray-400 text-xs">{period.bookings} bookings</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${period.percentage}%` }}
                                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Optimization Insights */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-emerald-500" />
                      Optimization Opportunities
                    </CardTitle>
                    <CardDescription>AI-powered insights to maximize your fleet performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Pricing Optimization',
                          insights: [
                            { text: 'Increase weekend rates by 15% (high demand)', impact: 'High', color: 'text-green-400' },
                            { text: 'Lower weekday rates by 8% (boost utilization)', impact: 'Medium', color: 'text-yellow-400' },
                            { text: 'Premium packages for holidays', impact: 'High', color: 'text-green-400' }
                          ]
                        },
                        {
                          title: 'Fleet Utilization',
                          insights: [
                            { text: 'Wave Runner underutilized (65%)', impact: 'Medium', color: 'text-yellow-400' },
                            { text: 'Ocean Paradise peak performer', impact: 'Low', color: 'text-blue-400' },
                            { text: 'Consider seasonal repositioning', impact: 'Medium', color: 'text-yellow-400' }
                          ]
                        },
                        {
                          title: 'Guest Experience',
                          insights: [
                            { text: 'Add premium concierge services', impact: 'High', color: 'text-green-400' },
                            { text: 'Extend booking windows', impact: 'Medium', color: 'text-yellow-400' },
                            { text: 'Loyalty program implementation', impact: 'High', color: 'text-green-400' }
                          ]
                        }
                      ].map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="space-y-4"
                        >
                          <h4 className="text-white font-semibold text-lg">{section.title}</h4>
                          <div className="space-y-3">
                            {section.insights.map((insight, insightIndex) => (
                              <div key={insightIndex} className="p-3 rounded-lg bg-gray-800/30 border-l-4 border-emerald-500">
                                <p className="text-white text-sm mb-1">{insight.text}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">Impact:</span>
                                  <span className={`text-xs font-medium ${insight.color}`}>{insight.impact}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {activeSection === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Yacht Gallery</h2>
                  <p className="text-gray-400">Manage yacht photos, virtual tours, and marketing content</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Fleet Settings</h2>
                  <p className="text-gray-400">Configure yacht availability, pricing, and booking policies</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}