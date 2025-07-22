import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Check,
  Heart,
  Save,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  ImageIcon,
  Inbox,
  Send,
  Timer,
  TrendingDown,
  Target
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { MultiImageUpload } from "@/components/multi-image-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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

// Helper function to calculate unread notification count
const getUnreadNotificationCount = (notificationsData: any[]) => {
  return notificationsData.filter(n => !n.read).length;
};

// StatCard component - copied exactly from admin dashboard
const StatCard = ({ title, value, change, icon: Icon, gradient = "from-purple-600 to-indigo-600", delay = 0 }: any) => (
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
        <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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
        <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-purple-600 to-indigo-600' },
  { id: 'profile', label: 'My Profile', icon: User, color: 'from-purple-600 to-indigo-600' },
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

// Real-time maintenance condition assessments component
const MaintenanceConditionAssessments = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: assessments } = useQuery<any>({
    queryKey: [`/api/maintenance/condition-assessments/${selectedYacht}`],
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Real-time assessments updates
    staleTime: 0,
  });

  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <div className="text-gray-400 text-lg mb-2">No condition assessments on record</div>
        <div className="text-gray-500 text-sm">Assessment data will appear here as inspections are completed</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment: any, index: number) => (
        <div key={assessment.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Assessment #{assessment.id}</p>
              <p className="text-gray-400 text-sm">
                {assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : 'No date'} • 
                {assessment.assessedBy || 'Marine Engineer'}
              </p>
              <p className="text-gray-500 text-xs mt-1">{assessment.notes || 'No notes available'}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-2">
              Condition: {assessment.overallCondition || 'Good'}
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              {assessment.priority || 'medium'} priority
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// Real-time maintenance overview component with authentic database data
const MaintenanceOverview = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: maintenanceOverview, isLoading, error } = useQuery<any>({
    queryKey: [`/api/maintenance/overview/${selectedYacht}`],
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Real-time maintenance overview updates every 30 seconds
    staleTime: 0, // Always refetch to ensure latest maintenance data
  });

  console.log('MaintenanceOverview query:', { selectedYacht, maintenanceOverview, isLoading, error });

  // Show loading or empty state if no data
  if (isLoading || !maintenanceOverview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Engine Hours"
          value="Loading..."
          change={null}
          icon={Wrench}
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Last Service"
          value="Loading..."
          change={null}
          icon={CheckCircle}
          gradient="from-purple-600 to-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Next Service"
          value="Loading..."
          change={null}
          icon={Calendar}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Health Score"
          value="Loading..."
          change={null}
          icon={Heart}
          gradient="from-purple-600 to-indigo-600"
          delay={0.3}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Engine Hours"
        value={maintenanceOverview.totalEngineHours ? `${maintenanceOverview.totalEngineHours}h` : '0h'}
        change={null}
        icon={Wrench}
        gradient="from-purple-600 to-indigo-600"
        delay={0}
      />
      <StatCard
        title="Sun Exposure"
        value={maintenanceOverview.totalSunExposure ? `${maintenanceOverview.totalSunExposure}h` : '0h'}
        change={null}
        icon={CheckCircle}
        gradient="from-purple-600 to-blue-600"
        delay={0.1}
      />
      <StatCard
        title="Total Bookings"
        value={maintenanceOverview.totalBookings || '0'}
        change={null}
        icon={Calendar}
        gradient="from-purple-600 to-indigo-600"
        delay={0.2}
      />
      <StatCard
        title="Health Score"
        value={maintenanceOverview.avgCondition ? `${maintenanceOverview.avgCondition}%` : '85%'}
        change={null}
        icon={Heart}
        gradient="from-purple-600 to-indigo-600"
        delay={0.3}
      />
    </div>
  );
};

// Real-time maintenance schedule component
const MaintenanceSchedule = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: scheduleData = [] } = useQuery<any[]>({
    queryKey: ['/api/maintenance/schedules', selectedYacht],
    enabled: !!selectedYacht,
    refetchInterval: 30000,
    staleTime: 0,
  });

  return (
    <div className="space-y-4">
      {scheduleData.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No maintenance scheduled</p>
          <p className="text-gray-500 text-sm">Schedule upcoming maintenance tasks</p>
        </div>
      ) : (
        scheduleData.map((task: any, index: number) => (
          <div key={task.id || index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{task.taskDescription}</p>
                <p className="text-gray-400 text-sm">
                  {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Date pending'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{task.estimatedCost ? `$${task.estimatedCost}` : 'Cost TBD'}</p>
              <Badge className={`${
                task.priority === 'high' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                task.priority === 'medium' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                'bg-gradient-to-r from-purple-600 to-blue-600'
              } text-white`}>
                {task.priority || 'medium'} priority
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Real-time maintenance cost analysis component
const MaintenanceCostAnalysis = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: costData } = useQuery<any>({
    queryKey: ['/api/maintenance/cost-analysis', selectedYacht],
    enabled: !!selectedYacht,
    refetchInterval: 30000,
    staleTime: 0,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">This Year</span>
        <span className="text-white font-bold">${costData?.thisYear || '0'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Last Year</span>
        <span className="text-white font-bold">${costData?.lastYear || '0'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Average Monthly</span>
        <span className="text-white font-bold">${costData?.averageMonthly || '0'}</span>
      </div>
    </>
  );
};

// Real-time maintenance performance metrics component
const MaintenancePerformanceMetrics = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: performanceData } = useQuery<any>({
    queryKey: ['/api/maintenance/performance-metrics', selectedYacht],
    enabled: !!selectedYacht,
    refetchInterval: 30000,
    staleTime: 0,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Efficiency</span>
        <span className="text-white font-bold">{performanceData?.efficiency || '0'}%</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Health Score</span>
        <span className="text-white font-bold">{performanceData?.healthScore || '0'}%</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-blue-400">Utilization Rate</span>
          <span className="text-blue-400 font-bold">{performanceData?.utilizationRate || '0'}%</span>
        </div>
      </div>
    </>
  );
};

// Real-time maintenance trends component
const MaintenanceTrends = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: trendsData } = useQuery<any>({
    queryKey: ['/api/maintenance/trends', selectedYacht],
    enabled: !!selectedYacht,
    refetchInterval: 30000,
    staleTime: 0,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Work Orders</span>
        <span className="text-white font-bold">{trendsData?.workOrders || '0'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Avg Response Time</span>
        <span className="text-white font-bold">{trendsData?.avgResponseTime || '0 hrs'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Completion Rate</span>
        <span className="text-white font-bold">{trendsData?.completionRate || '0'}%</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-yellow-400">Preventive %</span>
          <span className="text-yellow-400 font-bold">{trendsData?.preventivePercent || '0'}%</span>
        </div>
      </div>
    </>
  );
};

// Real-time component health overview component
const ComponentHealthOverview = ({ selectedYacht }: { selectedYacht: number | null }) => {
  const { data: componentData = [] } = useQuery<any[]>({
    queryKey: ['/api/maintenance/components', selectedYacht],
    enabled: !!selectedYacht,
    refetchInterval: 30000,
    staleTime: 0,
  });

  if (!componentData || componentData.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No component data available</p>
        <p className="text-gray-500 text-sm">Component health monitoring requires maintenance records</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {componentData.map((component: any, index: number) => (
        <div key={index} className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                stroke="currentColor" strokeWidth="8" fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50" cy="50" r="40"
                stroke="url(#gradient-${index})" strokeWidth="8" fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (component.health || 0) / 100)}`}
                className="transition-all duration-1000 ease-in-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{component.health || 0}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">{component.name || 'Unknown'}</p>
        </div>
      ))}
    </div>
  );
};

// Add Yacht Dialog Component - Extracted outside to prevent re-renders
interface AddYachtDialogProps {
  user: any;
  dialogOpen: boolean;
  handleCloseDialog: () => void;
}

const AddYachtDialog = React.memo(({ user, dialogOpen, handleCloseDialog }: AddYachtDialogProps) => {
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
        name: data.name,
        location: data.location,
        description: data.description,
        size: parseInt(data.size),
        capacity: parseInt(data.capacity),
        ownerId: user?.id || (data.ownerId && data.ownerId !== '' ? parseInt(data.ownerId) : undefined),
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        images: data.images || [],
        pricePerHour: data.pricePerHour && data.pricePerHour !== '' ? parseFloat(data.pricePerHour) : undefined,
        isAvailable: data.isAvailable,
        yearMade: data.yearMade && data.yearMade !== '' ? parseInt(data.yearMade) : undefined,
        totalCost: data.totalCost && data.totalCost !== '' ? parseFloat(data.totalCost) : undefined
      };
      
      // Remove undefined values to avoid schema validation issues
      Object.keys(yachtData).forEach(key => {
        if ((yachtData as any)[key] === undefined) {
          delete (yachtData as any)[key];
        }
      });
      
      const response = await apiRequest("POST", "/api/yachts", yachtData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/yachts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yacht-owner/stats"] });
      toast({ title: "Success", description: "Yacht created successfully" });
      handleCloseDialog();
      setFormData({ name: '', location: '', size: '', capacity: '', description: '', imageUrl: '', images: [], pricePerHour: '', isAvailable: true, ownerId: user?.id?.toString() || '', amenities: '', yearMade: '', totalCost: '' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (!dialogOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Do nothing - don't close on backdrop click
        }
      }}
    >
      <div 
        className="bg-gray-950 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="sticky top-0 bg-gray-950 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Add New Yacht</h2>
          <button
            onClick={handleCloseDialog}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300 mb-2 block">Yacht Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter yacht name"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-300 mb-2 block">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Marina location"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size" className="text-gray-300 mb-2 block">Size (ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="40"
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-gray-300 mb-2 block">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="12"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerHour" className="text-gray-300 mb-2 block">Price per Hour</Label>
              <Input
                id="pricePerHour"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="500"
              />
            </div>
            <div>
              <Label htmlFor="yearMade" className="text-gray-300 mb-2 block">Year Made <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="yearMade"
                type="number"
                value={formData.yearMade}
                onChange={(e) => setFormData({...formData, yearMade: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="2020"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300 mb-2 block">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Yacht description..."
            />
          </div>
          
          <div>
            <Label htmlFor="amenities" className="text-gray-300 mb-2 block">Amenities (comma separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="WiFi, Air Conditioning, Sound System"
            />
          </div>
          
          <div>
            <Label htmlFor="totalCost" className="text-gray-300 mb-2 block">Total Value/Cost <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
            <Input
              id="totalCost"
              type="number"
              step="0.01"
              value={formData.totalCost}
              onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="500000"
            />
          </div>
          
          <div>
            <MultiImageUpload
              label="Yacht Gallery"
              onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
              currentImages={formData.images || []}
              maxImages={10}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              className="rounded border-gray-600"
            />
            <Label htmlFor="isAvailable" className="text-gray-300">Available for booking</Label>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gray-950 border-t border-gray-700 p-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={handleCloseDialog}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createYachtMutation.mutate(formData)} 
            disabled={createYachtMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
          </Button>
        </div>
      </div>
    </div>
  );
});

AddYachtDialog.displayName = 'AddYachtDialog';

export default function YachtOwnerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
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
    status: "all",
    timeRange: "all",
    yacht: "all"
  });

  const [calendarFilters, setCalendarFilters] = useState({
    status: "all",
    dateRange: "all",
    yacht: "all"
  });
  
  // Maintenance page state
  const [selectedMaintenanceYacht, setSelectedMaintenanceYacht] = useState<number | null>(null);
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('overview');
  
  // Fleet filter dropdown state
  const [showFleetFilter, setShowFleetFilter] = useState(false);
  
  // Booking detail modal state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();
  
  // Profile state hooks - moved to top level to fix React Hook errors
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<YachtOwnerStats>({
    queryKey: ['/api/yacht-owner/stats'],
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/yachts'],
    enabled: !!user && user.role === 'yacht_owner'
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/bookings'],
    refetchInterval: 30000, // Changed to 30 seconds to reduce re-renders
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: revenueData = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/revenue'],
    refetchInterval: 30000, // Changed to 30 seconds to reduce re-renders
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter yachts based on current filter settings
  const filteredYachts = useMemo(() => {
    if (!yachts) return [];
    
    return yachts.filter((yacht: any) => {
      // Filter by availability
      if (yachtFilters.availability !== 'all') {
        const isAvailable = yacht.isAvailable;
        if (yachtFilters.availability === 'available' && !isAvailable) return false;
        if (yachtFilters.availability === 'unavailable' && isAvailable) return false;
      }
      
      // Filter by size
      if (yachtFilters.size !== 'all') {
        const size = parseInt(yacht.size) || 0;
        if (yachtFilters.size === 'small' && size >= 50) return false;
        if (yachtFilters.size === 'medium' && (size < 50 || size > 80)) return false;
        if (yachtFilters.size === 'large' && size <= 80) return false;
      }
      
      // Filter by location
      if (yachtFilters.location !== 'all') {
        if (yacht.location !== yachtFilters.location) return false;
      }
      
      return true;
    });
  }, [yachts, yachtFilters]);

  // Filter bookings based on calendar filter settings
  const calendarFilteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter((booking: any) => {
      // Filter by status
      if (calendarFilters.status !== 'all') {
        if (booking.status !== calendarFilters.status) return false;
      }
      
      // Filter by date range
      if (calendarFilters.dateRange !== 'all') {
        const bookingDate = new Date(booking.startTime);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (calendarFilters.dateRange === 'today') {
          const isToday = bookingDate.toDateString() === new Date().toDateString();
          if (!isToday) return false;
        }
        if (calendarFilters.dateRange === 'week') {
          if (bookingDate < startOfWeek) return false;
        }
        if (calendarFilters.dateRange === 'month') {
          if (bookingDate < startOfMonth) return false;
        }
        if (calendarFilters.dateRange === 'upcoming') {
          if (bookingDate < new Date()) return false;
        }
      }
      
      // Filter by yacht
      if (calendarFilters.yacht !== 'all') {
        if (booking.yachtId.toString() !== calendarFilters.yacht) return false;
      }
      
      return true;
    });
  }, [bookings, calendarFilters]);

  // Maintenance records data fetching
  const { data: maintenanceRecords = [] } = useQuery<any[]>({
    queryKey: ['/api/maintenance/records', selectedMaintenanceYacht],
    enabled: !!selectedMaintenanceYacht,
    refetchInterval: 30000, // Real-time maintenance records updates every 30 seconds
    staleTime: 0, // Always refetch to ensure latest maintenance data
  });

  // Real-time profile data fetching with enhanced error handling
  const { data: profileDataReal = {}, refetch: refetchProfile, isError: profileError, error: profileErrorDetails } = useQuery<any>({
    queryKey: ['/api/user/profile'],
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
  });

  // Handle profile data loading effects
  useEffect(() => {
    if (profileDataReal && Object.keys(profileDataReal).length > 0) {
      console.log('Profile data loaded from API:', profileDataReal);
    }
  }, [profileDataReal]);

  useEffect(() => {
    if (profileError) {
      console.error('Profile data loading error:', profileErrorDetails);
    }
  }, [profileError, profileErrorDetails]);

  // Real-time notifications data fetching with enhanced performance
  const { data: notifications = [], isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/notifications'],
    staleTime: 30000, // Cache for 30 seconds for performance
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Real-time notification mutations with instant cache invalidation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/yacht-owner/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      // Immediate cache invalidation for real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-owner/notifications'] });
      refetchNotifications(); // Force immediate refetch
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/yacht-owner/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      // Immediate cache invalidation for real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-owner/notifications'] });
      refetchNotifications(); // Force immediate refetch
    }
  });

  // Add real-time notifications logging for debugging
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      console.log(`Real-time notifications loaded: ${notifications.length} total, ${getUnreadNotificationCount(notifications)} unread`);
    }
  }, [notifications]);

  // Real-time settings data fetching and state management
  const { data: settingsData = {}, refetch: refetchSettings } = useQuery<any>({
    queryKey: ['/api/user/settings'],
    staleTime: 0,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
  });

  // Settings state for real-time updates
  const [settingsState, setSettingsState] = useState({
    notifications: {
      newBookings: true,
      maintenanceAlerts: true,
      revenueReports: true,
      guestReviews: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'members',
      showRevenue: false,
      showFleetSize: true,
      showContactInfo: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  // Update settings state when data loads from API
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      console.log('Settings data loaded from API:', settingsData);
      setSettingsState(prev => ({ ...prev, ...settingsData }));
    }
  }, [settingsData]);

  // Settings update mutation with real-time sync
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      console.log('Updating settings:', updatedSettings);
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Settings update failed: ${response.status} - ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Settings updated successfully:', data);
      toast({ 
        title: "Settings updated successfully",
        description: "Your preferences have been saved"
      });
      
      // Update local state immediately
      setSettingsState(prev => ({ ...prev, ...data }));
      
      // Invalidate cache for real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      refetchSettings();
    },
    onError: (error: any) => {
      console.error('Settings update failed:', error);
      toast({ 
        title: "Error updating settings", 
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive" 
      });
    }
  });

  // Handle individual setting changes with real-time updates
  const handleSettingChange = (category: string, setting: string, value: any) => {
    console.log(`Setting ${category}.${setting} changing to:`, value);
    
    const updatedSettings = { 
      ...settingsState,
      [category]: {
        ...settingsState[category as keyof typeof settingsState],
        [setting]: value
      }
    };
    
    setSettingsState(updatedSettings);
    
    // Auto-save after 500ms for immediate feedback
    setTimeout(() => {
      updateSettingsMutation.mutate(updatedSettings);
    }, 500);
  };

  // Notifications filter state - moved to top level
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'urgent'>('all');

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

  // Filter bookings based on current filter settings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter((booking: any) => {
      // Filter by status
      if (bookingFilters.status !== 'all') {
        if (booking.status !== bookingFilters.status) return false;
      }
      
      // Filter by time range
      if (bookingFilters.timeRange !== 'all') {
        const bookingDate = new Date(booking.startTime);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (bookingFilters.timeRange === 'today' && daysDiff !== 0) return false;
        if (bookingFilters.timeRange === 'week' && daysDiff > 7) return false;
        if (bookingFilters.timeRange === 'month' && daysDiff > 30) return false;
        if (bookingFilters.timeRange === 'upcoming' && daysDiff >= 0) return false;
      }
      
      // Filter by yacht
      if (bookingFilters.yacht !== 'all') {
        if (booking.yachtId !== parseInt(bookingFilters.yacht)) return false;
      }
      
      return true;
    });
  }, [bookings, bookingFilters]);

  // Real-time messaging hooks for yacht owner - moved to top level
  const [ownerSelectedConversation, setOwnerSelectedConversation] = useState<string | null>(null);
  const [ownerNewMessage, setOwnerNewMessage] = useState("");
  
  // Fetch yacht owner conversations with admin with proper typing
  const { data: ownerConversations = [], isLoading: ownerConversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/conversations'],
    enabled: !!user,
    refetchInterval: 3000, // Real-time updates every 3 seconds
  });
  
  // Fetch messages for selected conversation with proper typing
  const { data: ownerMessages = [], isLoading: ownerMessagesLoading } = useQuery<any[]>({
    queryKey: [`/api/yacht-owner/messages/${ownerSelectedConversation}`],
    enabled: !!ownerSelectedConversation,
    refetchInterval: 2000, // Real-time message updates
  });
  
  // Send message mutation
  const ownerSendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string }) => {
      const response = await apiRequest('POST', '/api/yacht-owner/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/yacht-owner/messages/${ownerSelectedConversation}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-owner/conversations'] });
      setOwnerNewMessage("");
    },
  });
  
  // Auto-select first conversation when available
  useEffect(() => {
    if (Array.isArray(ownerConversations) && ownerConversations.length > 0 && !ownerSelectedConversation) {
      setOwnerSelectedConversation(ownerConversations[0].id);
    }
  }, [ownerConversations, ownerSelectedConversation]);
  
  const handleOwnerSendMessage = () => {
    if (!ownerNewMessage.trim() || !ownerSelectedConversation) return;
    
    ownerSendMessageMutation.mutate({
      conversationId: ownerSelectedConversation,
      content: ownerNewMessage.trim()
    });
  };

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

  // Add Yacht Dialog - Using useRef to maintain state
  const dialogStateRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpenDialog = useCallback(() => {
    console.log('Opening dialog');
    dialogStateRef.current = true;
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    console.log('Closing dialog');
    dialogStateRef.current = false;
    setDialogOpen(false);
  }, []);

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
        

      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Fleet"
          value={stats?.totalYachts || '3'}
          change={null}
          icon={Anchor}
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 45000).toLocaleString()}`}
          change={18}
          icon={DollarSign}
          gradient="from-purple-600 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || '27'}
          change={23}
          icon={CalendarDays}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats?.avgRating || 4.8}/5`}
          change={5}
          icon={Star}
          gradient="from-purple-600 to-indigo-600"
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
              {!yachts ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-700 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-16"></div>
                          <div className="h-3 bg-gray-700 rounded w-10"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : yachts.length === 0 ? (
                <div className="text-center py-8">
                  <Anchor className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No yachts in your fleet yet</p>
                </div>
              ) : (
                yachts.slice(0, 3).map((yacht: any, index: number) => {
                  const yachtBookings = bookings?.filter((b: any) => b.yachtId === yacht.id) || [];
                  const occupancyRate = yachtBookings.length > 0 ? Math.round((yachtBookings.filter((b: any) => b.status === 'confirmed').length / yachtBookings.length) * 100) : 0;
                  const revenue = yachtBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0), 0);
                  
                  return (
                    <div key={yacht.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                          <Anchor className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{yacht.name}</p>
                          <p className="text-sm text-gray-400">{occupancyRate}% occupancy</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{yachtBookings.length} bookings</p>
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
              <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest reservations and guest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!bookings ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-700 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                        <div className="h-6 bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No bookings yet</p>
                </div>
              ) : (
                bookings.slice(0, 3).map((booking: any, index: number) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingModal(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                          {booking.user?.username?.charAt(0)?.toUpperCase() || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{booking.user?.username || booking.user?.fullName || 'Guest'}</p>
                        <p className="text-sm text-gray-400">{booking.yacht?.name || 'Unknown Yacht'} • {booking.guestCount || 0} guests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{booking.totalPrice ? `$${booking.totalPrice}` : 'Free'}</p>
                      <Badge className={
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
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
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30"
            onClick={handleOpenDialog}
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Yacht
          </Button>
          <DropdownMenu open={showFleetFilter} onOpenChange={setShowFleetFilter}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-80 bg-gray-950 border-gray-700 text-white p-4"
              align="end"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Availability Status</label>
                  <Select 
                    value={yachtFilters.availability} 
                    onValueChange={(value) => setYachtFilters(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="all">All Yachts</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Yacht Size</label>
                  <Select 
                    value={yachtFilters.size} 
                    onValueChange={(value) => setYachtFilters(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="small">Small (Under 50ft)</SelectItem>
                      <SelectItem value="medium">Medium (50-80ft)</SelectItem>
                      <SelectItem value="large">Large (Over 80ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
                  <Select 
                    value={yachtFilters.location} 
                    onValueChange={(value) => setYachtFilters(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Miami Marina">Miami Marina</SelectItem>
                      <SelectItem value="Port of Miami">Port of Miami</SelectItem>
                      <SelectItem value="Bayfront Park">Bayfront Park</SelectItem>
                      <SelectItem value="Star Island">Star Island</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setYachtFilters({
                        availability: "all",
                        size: "all", 
                        location: "all",
                        priceRange: "all"
                      });
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setShowFleetFilter(false)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Yachts"
          value={filteredYachts?.length?.toString() || (stats?.totalYachts || 0).toString()}
          change={null}
          icon={Anchor}
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Available Now"
          value={(filteredYachts?.filter((y: any) => y.isAvailable)?.length || 0).toString()}
          change={null}
          icon={Activity}
          gradient="from-purple-600 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="In Maintenance"
          value={(stats?.pendingMaintenance || 0).toString()}
          change={null}
          icon={Wrench}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Avg Occupancy"
          value={`${stats?.occupancyRate || 0}%`}
          change={null}
          icon={TrendingUp}
          gradient="from-purple-600 to-indigo-600"
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
        ) : filteredYachts && filteredYachts.length > 0 ? (
          // Real yachts owned by this user (filtered)
          filteredYachts.map((yacht: any, index: number) => (
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
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                      <EditYachtDialog yacht={yacht} />
                      <DeleteYachtDialog yacht={yacht} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : yachts && yachts.length > 0 ? (
          // No results after filtering
          <div className="col-span-full text-center py-12">
            <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-4">No yachts match your filters</div>
            <div className="text-gray-500 text-sm mb-4">Try adjusting your filter criteria to see more results</div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setYachtFilters({
                  availability: "all",
                  size: "all", 
                  location: "all",
                  priceRange: "all"
                });
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Clear All Filters
            </Button>
          </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                <Filter className="h-4 w-4 mr-2" />
                Filter Bookings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-950 border-gray-700 text-white">
              <div className="p-4 space-y-4">
                <div>
                  <DropdownMenuLabel className="text-white font-medium">Status</DropdownMenuLabel>
                  <Select value={bookingFilters.status} onValueChange={(value) => setBookingFilters({...bookingFilters, status: value})}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-700">
                      <SelectItem value="all" className="text-white hover:bg-gray-800">All Statuses</SelectItem>
                      <SelectItem value="confirmed" className="text-white hover:bg-gray-800">Confirmed</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-gray-800">Pending</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-800">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-white hover:bg-gray-800">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <DropdownMenuLabel className="text-white font-medium">Time Range</DropdownMenuLabel>
                  <Select value={bookingFilters.timeRange} onValueChange={(value) => setBookingFilters({...bookingFilters, timeRange: value})}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-700">
                      <SelectItem value="all" className="text-white hover:bg-gray-800">All Time</SelectItem>
                      <SelectItem value="today" className="text-white hover:bg-gray-800">Today</SelectItem>
                      <SelectItem value="week" className="text-white hover:bg-gray-800">This Week</SelectItem>
                      <SelectItem value="month" className="text-white hover:bg-gray-800">This Month</SelectItem>
                      <SelectItem value="upcoming" className="text-white hover:bg-gray-800">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <DropdownMenuLabel className="text-white font-medium">Yacht</DropdownMenuLabel>
                  <Select value={bookingFilters.yacht} onValueChange={(value) => setBookingFilters({...bookingFilters, yacht: value})}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-gray-700">
                      <SelectItem value="all" className="text-white hover:bg-gray-800">All Yachts</SelectItem>
                      {yachts?.map((yacht: any) => (
                        <SelectItem key={yacht.id} value={yacht.id.toString()} className="text-white hover:bg-gray-800">
                          {yacht.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenuSeparator className="bg-gray-700" />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setBookingFilters({
                      status: "all",
                      timeRange: "all",
                      yacht: "all"
                    });
                  }}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={filteredBookings?.length.toString() || '0'}
          change={null}
          icon={Anchor}
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Active Bookings"
          value={filteredBookings?.filter((b: any) => b.status === 'confirmed')?.length.toString() || '0'}
          change={null}
          icon={Activity}
          gradient="from-purple-600 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="Pending Review"
          value={filteredBookings?.filter((b: any) => b.status === 'pending')?.length.toString() || '0'}
          change={null}
          icon={Clock}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(revenueData || []).reduce((sum: number, item: any) => sum + (item.revenue || 0), 0).toFixed(2)}`}
          change={null}
          icon={DollarSign}
          gradient="from-purple-600 to-indigo-600"
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
          ) : filteredBookings.length === 0 ? (
            bookings && bookings.length > 0 ? (
              // No results after filtering
              <div className="text-center py-12">
                <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-4">No bookings match your filters</div>
                <div className="text-gray-500 text-sm mb-4">Try adjusting your filter criteria to see more results</div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setBookingFilters({
                      status: "all",
                      timeRange: "all",
                      yacht: "all"
                    });
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              // Empty state - no bookings at all
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-4">No bookings yet</div>
                <div className="text-gray-500 text-sm">Your yacht bookings will appear here once members make reservations</div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking: any, index: number) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowBookingModal(true);
                  }}
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
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Monthly Income"
          value={`$${(stats?.monthlyRevenue || 0).toFixed(2)}`}
          change={12}
          icon={TrendingUp}
          gradient="from-purple-600 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="Avg Booking Value"
          value="$2,140"
          change={8}
          icon={Calculator}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          change={stats?.occupancyRate ? stats.occupancyRate - 75 : 0}
          icon={Activity}
          gradient="from-purple-600 to-indigo-600"
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
                { id: 'assessments', label: 'Assessments', icon: CheckCircle },
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
            {activeMaintenanceTab === 'overview' && <MaintenanceOverview selectedYacht={selectedMaintenanceYacht} />}
            
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
                  <MaintenanceSchedule selectedYacht={selectedMaintenanceYacht} />
                </CardContent>
              </Card>
            )}

            {activeMaintenanceTab === 'assessments' && (
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Condition Assessments</CardTitle>
                    <CardDescription>Yacht condition evaluation reports</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Add Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Condition Assessment</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create a new condition assessment for {yachts?.find(y => y.id === selectedMaintenanceYacht)?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-white text-sm font-medium">Condition Rating</label>
                          <select className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-600 rounded-md text-white">
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium">Priority Level</label>
                          <select className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-600 rounded-md text-white">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium">Assessment Notes</label>
                          <Textarea 
                            placeholder="Detailed assessment findings..."
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                            Save Assessment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <MaintenanceConditionAssessments selectedYacht={selectedMaintenanceYacht} />
                </CardContent>
              </Card>
            )}

            {activeMaintenanceTab === 'analytics' && (
              <div className="space-y-8">
                {/* Cost Analysis Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                        Cost Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <MaintenanceCostAnalysis selectedYacht={selectedMaintenanceYacht} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-purple-400" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <MaintenancePerformanceMetrics selectedYacht={selectedMaintenanceYacht} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                        Maintenance Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <MaintenanceTrends selectedYacht={selectedMaintenanceYacht} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Component Health Overview */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-400" />
                      Component Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComponentHealthOverview selectedYacht={selectedMaintenanceYacht} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Fleet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-gray-900 border-gray-700">
                <div className="p-4 space-y-4">
                  {/* Availability Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Availability Status
                    </label>
                    <Select
                      value={yachtFilters.availability}
                      onValueChange={(value) => setYachtFilters(prev => ({ ...prev, availability: value }))}
                    >
                      <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Yacht Size Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Yacht Size
                    </label>
                    <Select
                      value={yachtFilters.size}
                      onValueChange={(value) => setYachtFilters(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                        <SelectValue placeholder="All Sizes" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="small">Small (40-60ft)</SelectItem>
                        <SelectItem value="medium">Medium (61-80ft)</SelectItem>
                        <SelectItem value="large">Large (81-100ft)</SelectItem>
                        <SelectItem value="mega">Mega (100ft+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Location
                    </label>
                    <Select
                      value={yachtFilters.location}
                      onValueChange={(value) => setYachtFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Miami Beach Marina">Miami Beach Marina</SelectItem>
                        <SelectItem value="Sunset Harbor">Sunset Harbor</SelectItem>
                        <SelectItem value="South Beach Marina">South Beach Marina</SelectItem>
                        <SelectItem value="Key Biscayne">Key Biscayne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters Button */}
                  <Button
                    onClick={() => {
                      setYachtFilters({
                        availability: "all",
                        size: "all",
                        location: "all",
                        priceRange: "all"
                      });
                    }}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        {/* Yachts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYachts && filteredYachts.length === 0 ? (
            yachts && yachts.length > 0 ? (
              // No results after filtering
              <div className="col-span-full text-center py-12">
                <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-4">No yachts match your filters</div>
                <div className="text-gray-500 text-sm mb-4">Try adjusting your filter criteria to see more results</div>
                <Button 
                  onClick={() => setYachtFilters({ availability: "all", size: "all", location: "all", priceRange: "all" })}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              // No yachts in database
              <div className="col-span-full text-center py-12">
                <Anchor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">No yachts in your fleet</div>
                <div className="text-gray-500 text-sm">Add yachts to your fleet to get started</div>
              </div>
            )
          ) : (
            filteredYachts?.map((yacht: any, index: number) => (
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
            ))
          )}
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
          gradient="from-purple-600 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Revenue Growth"
          value={`${stats?.monthlyRevenue ? ((stats.monthlyRevenue / (stats.monthlyRevenue * 0.8)) - 1) * 100 : 0}%`}
          change={stats?.monthlyRevenue ? Math.round(((stats.monthlyRevenue / (stats.monthlyRevenue * 0.8)) - 1) * 100) : 0}
          icon={DollarSign}
          gradient="from-purple-600 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          title="Avg Revenue/Month"
          value={`$${(revenueData || []).length > 0 ? ((revenueData || []).reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) / (revenueData || []).length).toFixed(0) : '0'}`}
          change={null}
          icon={Star}
          gradient="from-purple-600 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${stats?.occupancyRate || 0}%`}
          change={stats?.occupancyRate ? stats.occupancyRate - 75 : 0}
          icon={Activity}
          gradient="from-purple-600 to-indigo-600"
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
              {yachts && yachts.length > 0 ? yachts.map((yacht: any, index: number) => {
                const yachtBookings = bookings?.filter((b: any) => b.yachtId === yacht.id) || [];
                const occupancyRate = yachtBookings.length > 0 ? Math.round((yachtBookings.filter((b: any) => b.status === 'confirmed').length / yachtBookings.length) * 100) : 0;
                const revenue = yachtBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0), 0);
                
                return (
                  <motion.div
                    key={yacht.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                  >
                    <div>
                      <p className="text-white font-medium">{yacht.name}</p>
                      <p className="text-gray-400 text-sm">{yacht.size}ft yacht • ${revenue.toFixed(0)} revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold">
                        {occupancyRate}% utilized
                      </p>
                      <p className="text-gray-400 text-sm">
                        {yachtBookings.length} bookings
                      </p>
                    </div>
                  </motion.div>
                );
              }) : (
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
              {!revenueData || revenueData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No booking trend data available yet
                </div>
              ) : (revenueData || []).map((monthData: any, index: number) => {
                const maxBookings = Math.max(...(revenueData || []).map(r => r.bookings || 0));
                const percentage = maxBookings > 0 ? ((monthData.bookings || 0) / maxBookings) * 100 : 0;
                
                return (
                  <motion.div
                    key={monthData.month}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-4"
                  >
                    <span className="text-white font-medium w-16">{monthData.month}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-12">{monthData.bookings || 0}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                <Filter className="h-4 w-4 mr-2" />
                Filter Calendar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-900 border-gray-700">
              <div className="p-4 space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Booking Status
                  </label>
                  <Select
                    value={calendarFilters.status}
                    onValueChange={(value) => setCalendarFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Date Range
                  </label>
                  <Select
                    value={calendarFilters.dateRange}
                    onValueChange={(value) => setCalendarFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Yacht Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Yacht
                  </label>
                  <Select
                    value={calendarFilters.yacht}
                    onValueChange={(value) => setCalendarFilters(prev => ({ ...prev, yacht: value }))}
                  >
                    <SelectTrigger className="w-full border-gray-600 text-gray-300 bg-gray-800">
                      <SelectValue placeholder="All Yachts" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Yachts</SelectItem>
                      {yachts?.map((yacht: any) => (
                        <SelectItem key={yacht.id} value={yacht.id.toString()}>
                          {yacht.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                <Button
                  onClick={() => {
                    setCalendarFilters({
                      status: "all",
                      dateRange: "all",
                      yacht: "all"
                    });
                  }}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <h3 className="text-white font-semibold text-lg">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
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
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const startOfCalendar = new Date(startOfMonth);
                startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
                
                const currentDate = new Date(startOfCalendar);
                currentDate.setDate(currentDate.getDate() + index);
                
                const day = currentDate.getDate();
                const isCurrentMonth = currentDate.getMonth() === today.getMonth();
                const isToday = currentDate.toDateString() === today.toDateString();
                
                // Check if this date has bookings from real data
                const dateBookings = bookings?.filter((booking: any) => {
                  const bookingDate = new Date(booking.startTime);
                  return bookingDate.toDateString() === currentDate.toDateString();
                }) || [];
                const hasBooking = dateBookings.length > 0;
                
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
                      {day}
                    </div>
                    {hasBooking && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="w-full h-1 bg-purple-400 rounded-full"></div>
                        <div className="text-xs text-purple-400 mt-1">{dateBookings.length} booking{dateBookings.length > 1 ? 's' : ''}</div>
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
                {calendarFilteredBookings && calendarFilteredBookings.length > 0 ? (
                  calendarFilteredBookings.slice(0, 3).map((booking: any, index: number) => (
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
                ))
                ) : (
                  bookings && bookings.length > 0 ? (
                    // No results after filtering
                    <div className="text-center py-8">
                      <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No bookings match your filters</div>
                      <div className="text-gray-500 text-sm mb-4">Try adjusting your filter criteria to see more results</div>
                      <Button 
                        onClick={() => setCalendarFilters({ status: "all", dateRange: "all", yacht: "all" })}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    // No bookings in database
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No upcoming bookings</div>
                      <div className="text-gray-500 text-sm">Your yacht booking schedule will appear here</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Helper functions for notifications
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('booking')) return <Calendar className="h-4 w-4" />;
    if (type.includes('yacht')) return <Anchor className="h-4 w-4" />;
    if (type.includes('maintenance')) return <Wrench className="h-4 w-4" />;
    if (type.includes('payment')) return <DollarSign className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  // Notifications render function - NO HOOKS - uses data from top level
  const renderNotifications = () => {
    // Filter notifications based on current filter
    const filteredNotifications = (notifications as any[]).filter((notification: any) => {
      if (notificationFilter === 'unread') return !notification.read;
      if (notificationFilter === 'urgent') return notification.priority === 'urgent';
      return true;
    });

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
              className="text-5xl font-bold text-white mb-2"
              style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" }}
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
          {filteredNotifications.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No notifications</p>
                <p className="text-gray-500 text-sm">All caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: any, index: number) => (
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
                            <span>{new Date(notification.createdAt || notification.created_at).toLocaleDateString()}</span>
                            <span>{new Date(notification.createdAt || notification.created_at).toLocaleTimeString()}</span>
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
                        {/* View Actions Dropdown Form */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-950 border-gray-700 p-4 w-80">
                            <div className="space-y-4">
                              <div className="border-b border-gray-700 pb-2">
                                <h4 className="text-white font-medium">Notification Actions</h4>
                                <p className="text-sm text-gray-400">Choose an action for this notification</p>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Quick Actions</label>
                                  <select 
                                    className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm"
                                    onChange={(e) => {
                                      const action = e.target.value;
                                      if (action === 'mark_read') {
                                        markAsReadMutation.mutate(notification.id);
                                        toast({ title: "Notification marked as read" });
                                      } else if (action === 'view_details') {
                                        if (notification.data?.yachtId) {
                                          setActiveSection('fleet');
                                        } else if (notification.data?.serviceId) {
                                          setActiveSection('bookings');
                                        } else {
                                          setActiveSection('overview');
                                        }
                                      } else if (action === 'copy_message') {
                                        navigator.clipboard.writeText(notification.message);
                                        toast({ title: "Notification copied to clipboard" });
                                      }
                                    }}
                                  >
                                    <option value="">Select Action...</option>
                                    <option value="mark_read">Mark as Read</option>
                                    <option value="view_details">View Details</option>
                                    <option value="copy_message">Copy Message</option>
                                  </select>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Add Note (Optional)</label>
                                  <textarea 
                                    className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm resize-none"
                                    rows={2}
                                    placeholder="Add a note about this notification..."
                                  />
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Priority Level</label>
                                  <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                                    <option value="low">Low Priority</option>
                                    <option value="medium" selected={notification.priority === 'medium'}>Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </div>
                                
                                <div className="flex space-x-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-1"
                                    onClick={() => {
                                      markAsReadMutation.mutate(notification.id);
                                      toast({ title: "Changes saved" });
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete Actions Dropdown Form */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                              <X className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-950 border-gray-700 p-4 w-80">
                            <div className="space-y-4">
                              <div className="border-b border-gray-700 pb-2">
                                <h4 className="text-white font-medium">Delete Notification</h4>
                                <p className="text-sm text-gray-400">Choose how to handle this notification</p>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Delete Options</label>
                                  <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                                    <option value="">Select Action...</option>
                                    <option value="mark_read">Mark as Read Only</option>
                                    <option value="archive">Archive Notification</option>
                                    <option value="delete">Delete Permanently</option>
                                  </select>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Reason (Optional)</label>
                                  <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                                    <option value="">Select Reason...</option>
                                    <option value="resolved">Issue Resolved</option>
                                    <option value="duplicate">Duplicate Notification</option>
                                    <option value="spam">Spam/Irrelevant</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-gray-300">Additional Notes</label>
                                  <textarea 
                                    className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm resize-none"
                                    rows={2}
                                    placeholder="Any additional notes about deletion..."
                                  />
                                </div>
                                
                                <div className="flex space-x-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                                    onClick={() => {
                                      markAsReadMutation.mutate(notification.id);
                                      toast({ title: "Notification marked as read" });
                                    }}
                                  >
                                    Mark as Read
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                    onClick={() => {
                                      deleteNotificationMutation.mutate(notification.id);
                                      toast({ title: "Notification deleted" });
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

  const renderMessages = () => {
    
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
              Messages
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Direct communication with Miami Beach Yacht Club Admin
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Real-time messaging</span>
            </div>
          </motion.div>
        </div>

        {/* Real-time Chat Interface */}
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
              Chat with MBYC Admin
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Simon Librati</span>
              </div>
            </CardTitle>
            <CardDescription>Direct real-time messaging with Miami Beach Yacht Club administration</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {ownerMessagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : !Array.isArray(ownerMessages) || ownerMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No messages yet. Start a conversation with MBYC Admin!</p>
                  </div>
                ) : (
                  Array.isArray(ownerMessages) && ownerMessages.map((message: any, index: number) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.senderId === user?.id 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.createdAt), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex space-x-2">
                <Input
                  value={ownerNewMessage}
                  onChange={(e) => setOwnerNewMessage(e.target.value)}
                  placeholder="Type your message to MBYC Admin..."
                  className="flex-1 bg-gray-800 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleOwnerSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleOwnerSendMessage}
                  disabled={!ownerNewMessage.trim() || ownerSendMessageMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {ownerSendMessageMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      </motion.div>
    );
  };

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
          <Button 
            size="sm" 
            onClick={() => updateSettingsMutation.mutate(settingsState)}
            disabled={updateSettingsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save All Changes'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchSettings()}
            className="border-gray-600 hover:border-purple-500"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Real-time Settings Grid with Database Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Notification Settings - Real-time Database Driven */}
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
              { key: 'newBookings', label: 'New Bookings', description: 'Get notified when guests book your yachts' },
              { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Receive maintenance reminders and updates' },
              { key: 'revenueReports', label: 'Revenue Reports', description: 'Monthly and weekly revenue summaries' },
              { key: 'guestReviews', label: 'Guest Reviews', description: 'Notifications when guests leave reviews' },
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via text message' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
                <div>
                  <p className="text-white font-medium">{notification.label}</p>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                </div>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('notifications', notification.key, !settingsState.notifications[notification.key as keyof typeof settingsState.notifications])}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${
                    settingsState.notifications[notification.key as keyof typeof settingsState.notifications] 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                      : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                    settingsState.notifications[notification.key as keyof typeof settingsState.notifications] 
                      ? 'ml-auto' 
                      : 'ml-0'
                  }`} />
                </motion.div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Settings - Real-time Database Driven */}
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
                <Badge className={`${settingsState.security.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-500/20'} text-white border-gray-500/30`}>
                  {settingsState.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
              <Button 
                size="sm" 
                onClick={() => handleSettingChange('security', 'twoFactorEnabled', !settingsState.security.twoFactorEnabled)}
                className={settingsState.security.twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}
              >
                {settingsState.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">Login Alerts</p>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('security', 'loginAlerts', !settingsState.security.loginAlerts)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${
                    settingsState.security.loginAlerts ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                    settingsState.security.loginAlerts ? 'ml-auto' : 'ml-0'
                  }`} />
                </motion.div>
              </div>
              <p className="text-sm text-gray-400">Get notified of new login attempts</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-medium">Session Timeout (minutes)</label>
              <select 
                value={settingsState.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings - Real-time Database Driven */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-500" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control your profile visibility and data sharing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium">Profile Visibility</label>
              <select 
                value={settingsState.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="members">Members Only</option>
                <option value="private">Private - Only me</option>
              </select>
            </div>
            
            {[
              { key: 'showRevenue', label: 'Show Revenue Data', description: 'Display revenue information in profile' },
              { key: 'showFleetSize', label: 'Show Fleet Size', description: 'Display number of yachts owned' },
              { key: 'showContactInfo', label: 'Show Contact Info', description: 'Display phone and email publicly' }
            ].map((privacy) => (
              <div key={privacy.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
                <div>
                  <p className="text-white font-medium">{privacy.label}</p>
                  <p className="text-sm text-gray-400">{privacy.description}</p>
                </div>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('privacy', privacy.key, !settingsState.privacy[privacy.key as keyof typeof settingsState.privacy])}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${
                    settingsState.privacy[privacy.key as keyof typeof settingsState.privacy] 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                      : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                    settingsState.privacy[privacy.key as keyof typeof settingsState.privacy] 
                      ? 'ml-auto' 
                      : 'ml-0'
                  }`} />
                </motion.div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences Settings - Real-time Database Driven */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Anchor className="h-5 w-5 mr-2 text-purple-500" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your yacht owner dashboard experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium">Language</label>
              <select 
                value={settingsState.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-medium">Timezone</label>
              <select 
                value={settingsState.preferences.timezone}
                onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">GMT</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-medium">Currency</label>
              <select 
                value={settingsState.preferences.currency}
                onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-medium">Date Format</label>
              <select 
                value={settingsState.preferences.dateFormat}
                onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Status Indicator */}
      {updateSettingsMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Saving settings...</span>
          </div>
        </div>
      )}
    </motion.div>
  );



  
  
  // Update local state when real data loads with comprehensive mapping
  useEffect(() => {
    console.log('Profile data effect triggered with:', profileDataReal);
    if (profileDataReal && Object.keys(profileDataReal).length > 0) {
      const updatedProfileData = {
        username: profileDataReal.username || user?.username || '',
        email: profileDataReal.email || user?.email || '',
        fullName: profileDataReal.fullName || profileDataReal.full_name || user?.fullName || '',
        phone: profileDataReal.phone || user?.phone || '',
        location: profileDataReal.location || user?.location || '',
        bio: profileDataReal.bio || user?.bio || '',
        avatarUrl: profileDataReal.avatarUrl || profileDataReal.profileImage || user?.profileImage || ''
      };
      
      console.log('Setting profile data to:', updatedProfileData);
      setProfileData(updatedProfileData);
    } else if (user) {
      // Fallback to user data if profile API hasn't loaded yet
      console.log('Using fallback user data:', user);
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatarUrl: user.profileImage || ''
      });
    }
  }, [profileDataReal, user]);
  
  // Real-time profile update mutation with comprehensive error handling
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Profile update mutation called with data:', data);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log('Profile update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Profile update failed:', errorData);
        throw new Error(`Profile update failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Profile update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Profile update mutation succeeded:', data);
      toast({ 
        title: "Profile updated successfully",
        description: "Your changes have been saved to the database"
      });
      
      // Update local state immediately for instant UI feedback
      setProfileData(prev => ({ ...prev, ...data }));
      
      // Invalidate all profile-related caches for real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Refetch profile data to ensure synchronization
      refetchProfile();
    },
    onError: (error: any) => {
      console.error('Profile update mutation failed:', error);
      toast({ 
        title: "Error updating profile", 
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive" 
      });
    }
  });
  
  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      setProfileData(prev => ({ ...prev, avatarUrl: data.url }));
      updateProfileMutation.mutate({ avatarUrl: data.url });
      setUploading(false);
      // Force refresh user data to ensure avatar updates everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({ title: "Avatar upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
    }
  });
  
  const handleInputChange = (field: string, value: string) => {
    console.log(`Profile field '${field}' changing to:`, value);
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Auto-save after 1 second of no changes for real-time updates
    if (profileSaveTimeoutRef.current) {
      clearTimeout(profileSaveTimeoutRef.current);
    }
    profileSaveTimeoutRef.current = setTimeout(() => {
      console.log(`Auto-saving profile field '${field}' with value:`, value);
      updateProfileMutation.mutate({ [field]: value });
    }, 1000);
  };
  
  const handleSave = () => {
    console.log('Manual save triggered with profile data:', profileData);
    updateProfileMutation.mutate(profileData);
    setIsEditing(false);
  };
  
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      uploadAvatarMutation.mutate(file);
    } else {
      toast({ title: "File too large", description: "Please select a file under 10MB", variant: "destructive" });
    }
  };

  // Profile render function - now with hooks moved to top level
  const renderProfile = () => {
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>My Profile</h1>
            <p className="text-lg text-gray-400">Manage your yacht owner account and preferences</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 hover:border-gray-500 text-gray-300"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar and Basic Info */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              {/* Avatar Section */}
              <div className="relative mb-6">
                <motion.div
                  whileHover={isEditing ? { scale: 1.05 } : {}}
                  className={`relative inline-block ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={handleAvatarClick}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-purple-500/30">
                    {profileData.avatarUrl ? (
                      <img 
                        src={profileData.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profileData.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 shadow-lg"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </motion.div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-center"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white">{profileData.fullName || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <p className="text-purple-400 font-medium">@{profileData.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    Yacht Owner
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Information */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                {isEditing ? (
                  <Input
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter your email"
                    type="email"
                  />
                ) : (
                  <p className="text-white">{profileData.email || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                {isEditing ? (
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-white">{profileData.phone || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                {isEditing ? (
                  <Input
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-white">{profileData.location || 'Not set'}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Bio and Additional Info */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-500" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profileData.bio || 'No bio set'}</p>
                )}
              </div>
              
              {/* Account Stats */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <h4 className="text-white font-medium">Account Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">
                      {profileDataReal?.createdAt ? new Date(profileDataReal.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Type</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      Yacht Owner
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fleet Size</span>
                    <span className="text-white">{stats?.totalYachts || 0} Yachts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  };

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
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      case 'notifications':
        return renderNotifications();
      case 'messages':
        return renderMessages();
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
            className="fixed top-6 left-6 z-[9999] p-3 bg-gradient-to-br from-purple-600 to-indigo-600 backdrop-blur-md rounded-xl border border-purple-500/50 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <img 
              src="/api/media/MBYC-LOGO-WHITE_1750978675231.png?v=2" 
              alt="MBYC"
              className="h-8 w-8 object-contain"
            />
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
          className="fixed left-0 top-0 w-80 h-full bg-black border-r border-gray-700/50 backdrop-blur-xl z-50 flex flex-col"
        >
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

          {/* Spacer to prevent Overview from being squished */}
          <div className="p-6 flex-shrink-0">
            {/* Empty space for proper spacing */}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-6 pb-24 space-y-2">
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
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50 bg-gray-950">
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
                {/* Notifications Icon */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveSection('notifications')}
                  className="text-purple-400 hover:text-white relative"
                >
                  <Bell className="h-4 w-4" />
                  {(() => {
                    const unreadCount = getUnreadNotificationCount(notifications as any[]);
                    return unreadCount > 0 ? (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    ) : null;
                  })()}
                </Button>
                
                {/* Messages Icon with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-purple-400 hover:text-white relative"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-950 border-gray-700 p-4 w-96">
                    <div className="space-y-4">
                      <div className="border-b border-gray-700 pb-2">
                        <h4 className="text-white font-medium">Messages & Communication</h4>
                        <p className="text-sm text-gray-400">Send messages and manage communications</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex flex-col space-y-2">
                          <label className="text-sm text-gray-300">Message Type</label>
                          <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                            <option value="">Select Message Type...</option>
                            <option value="admin">Message Admin</option>
                            <option value="member">Message Member</option>
                            <option value="staff">Message Staff</option>
                            <option value="support">Contact Support</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <label className="text-sm text-gray-300">Recipient</label>
                          <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                            <option value="">Select Recipient...</option>
                            <option value="admin">MBYC Admin</option>
                            <option value="concierge">Concierge Service</option>
                            <option value="maintenance">Maintenance Team</option>
                            <option value="customer_service">Customer Service</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <label className="text-sm text-gray-300">Subject</label>
                          <input 
                            type="text"
                            className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm"
                            placeholder="Enter message subject..."
                          />
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <label className="text-sm text-gray-300">Message</label>
                          <textarea 
                            className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm resize-none"
                            rows={4}
                            placeholder="Type your message here..."
                          />
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <label className="text-sm text-gray-300">Priority Level</label>
                          <select className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm">
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-1"
                            onClick={() => {
                              toast({ title: "Message sent successfully" });
                            }}
                          >
                            Send Message
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:border-purple-500"
                            onClick={() => setActiveSection('messages')}
                          >
                            View All Messages
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
          <div className="absolute inset-0 bg-black" />
          
          {/* Main Content */}
          <div className="relative z-10 p-8">
            {renderCurrentSection()}
          </div>
        </motion.div>
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Booking Details</h3>
                  <p className="text-gray-400 text-sm">Booking #{selectedBooking.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Yacht Information */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Anchor className="h-5 w-5 mr-2 text-purple-400" />
                    Yacht Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Yacht Name</p>
                      <p className="text-white font-medium">{selectedBooking.yacht?.name || 'Unknown Yacht'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Size</p>
                      <p className="text-white font-medium">{selectedBooking.yacht?.size || 'N/A'}ft</p>
                    </div>
                  </div>
                </div>

                {/* Member Information */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-400" />
                    Member Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Member Name</p>
                      <p className="text-white font-medium">{selectedBooking.user?.username || selectedBooking.user?.fullName || 'Guest'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Guest Count</p>
                      <p className="text-white font-medium">{selectedBooking.guestCount || 'N/A'} guests</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-purple-400" />
                    Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Start Date & Time</p>
                      <p className="text-white font-medium">
                        {new Date(selectedBooking.startTime).toLocaleDateString()} at {new Date(selectedBooking.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">End Date & Time</p>
                      <p className="text-white font-medium">
                        {new Date(selectedBooking.endTime).toLocaleDateString()} at {new Date(selectedBooking.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <Badge className={
                        selectedBooking.status === 'confirmed' ? 'bg-green-600' : 
                        selectedBooking.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                      }>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Price</p>
                      <p className="text-white font-medium">{selectedBooking.totalPrice || 'Free for Members'}</p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
                      Special Requests
                    </h4>
                    <p className="text-gray-300">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={() => {
                      // Contact member functionality
                      toast({ title: "Contact feature coming soon" });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Member
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-600 hover:bg-gray-800"
                    onClick={() => {
                      // Calendar integration
                      toast({ title: "Calendar sync coming soon" });
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Yacht Dialog - Rendered at root level to prevent re-render issues */}
      <AddYachtDialog 
        user={user}
        dialogOpen={dialogOpen}
        handleCloseDialog={handleCloseDialog}
      />
    </motion.div>
  );
}
