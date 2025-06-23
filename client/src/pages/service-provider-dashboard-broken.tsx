import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Briefcase, 
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
  Utensils,
  Scissors,
  Heart,
  Camera,
  Music,
  Waves,
  Coffee,
  MessageSquare,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiImageUpload } from "@/components/multi-image-upload";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

// Service form schema - matching the working yacht pattern
const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  pricePerSession: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").default(60),
  isAvailable: z.boolean().default(true)
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

// Add Service Dialog Component - exact pattern from working yacht system
function AddServiceDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      imageUrl: "",
      images: [],
      pricePerSession: "",
      duration: 60,
      isAvailable: true
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const serviceData = {
        ...data,
        providerId: user?.id,
        duration: data.duration || 60,
        pricePerSession: data.pricePerSession || "0"
      };
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ServiceFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/30">
          <Plus className="h-4 w-4 mr-2" />
          Create New Service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new yacht concierge service to your offerings
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
                    <FormLabel className="text-white">Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Price Per Session</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" placeholder="150" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <MultiImageUpload
                label="Service Gallery"
                onImagesUploaded={(images) => {
                  form.setValue('images', images);
                  form.setValue('imageUrl', images[0] || '');
                }}
                currentImages={[]}
                maxImages={5}
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
                      Allow members to book this service
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
              <Button type="submit" disabled={createMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
                {createMutation.isPending ? "Creating..." : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Service Dialog Component - exact pattern from working yacht system
function EditServiceDialog({ service }: { service: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service.name || "",
      category: service.category || "",
      description: service.description || "",
      imageUrl: service.imageUrl || "",
      images: service.images || [],
      pricePerSession: service.pricePerSession || "",
      duration: service.duration || 60,
      isAvailable: service.isAvailable ?? true
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await apiRequest("PUT", `/api/services/${service.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service updated successfully",
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

  const onSubmit = (data: ServiceFormData) => {
    editMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update service information and settings
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
                    <FormLabel className="text-white">Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Price Per Session</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <MultiImageUpload
                label="Service Gallery"
                onImagesUploaded={(images) => {
                  form.setValue('images', images);
                  form.setValue('imageUrl', images[0] || '');
                }}
                currentImages={service.images || []}
                maxImages={5}
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
                      Allow members to book this service
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
              <Button type="submit" disabled={editMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
                {editMutation.isPending ? "Updating..." : "Update Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Service Dialog Component
function DeleteServiceDialog({ service }: { service: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/services/${service.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
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
          <DialogTitle className="text-white">Delete Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete "{service.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => deleteMutation.mutate()} 
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceProviderStats {
  totalServices: number;
  totalBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  completionRate: number;
  activeClients: number;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'My Services', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-emerald-500 to-teal-500' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { id: 'clients', label: 'Clients', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-indigo-500' },
  { id: 'profile', label: 'Profile', icon: Crown, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const serviceCategories = [
  {
    id: 'beauty_grooming',
    name: 'Beauty & Grooming',
    icon: Scissors,
    color: 'from-pink-500 to-rose-500',
    services: [
      'Hair Styling & Cuts',
      'Makeup Artist',
      'Manicure & Pedicure',
      'Massage Therapy',
      'Personal Styling'
    ]
  },
  {
    id: 'culinary',
    name: 'Culinary Services',
    icon: Utensils,
    color: 'from-orange-500 to-red-500',
    services: [
      'Private Chef',
      'Bartender Services',
      'Wine Sommelier',
      'Catering & Events',
      'Specialty Cuisine'
    ]
  },
  {
    id: 'wellness_spa',
    name: 'Wellness & Spa',
    icon: Heart,
    color: 'from-green-500 to-emerald-500',
    services: [
      'Spa Treatments',
      'Yoga Instructor',
      'Fitness Trainer',
      'Meditation Guide',
      'Wellness Coaching'
    ]
  },
  {
    id: 'photography_media',
    name: 'Photography & Media',
    icon: Camera,
    color: 'from-purple-500 to-indigo-500',
    services: [
      'Professional Photography',
      'Videography',
      'Drone Services',
      'Social Media Content',
      'Event Documentation'
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Music,
    color: 'from-blue-500 to-cyan-500',
    services: [
      'Live Music Performance',
      'DJ Services',
      'Entertainment Host',
      'Cultural Experiences',
      'Party Planning'
    ]
  },
  {
    id: 'water_sports',
    name: 'Water Sports',
    icon: Waves,
    color: 'from-teal-500 to-blue-500',
    services: [
      'Diving Instruction',
      'Water Sports Equipment',
      'Fishing Guide',
      'Jet Ski Rental',
      'Snorkeling Tours'
    ]
  },
  {
    id: 'concierge_lifestyle',
    name: 'Concierge & Lifestyle',
    icon: Coffee,
    color: 'from-amber-500 to-orange-500',
    services: [
      'Personal Concierge',
      'Transportation',
      'Shopping Services',
      'Event Planning',
      'VIP Experiences'
    ]
  }
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

// Duplicate function removed - using the proper implementation below

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const serviceData = {
        ...data,
        duration: data.duration ? parseInt(data.duration) : null,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : null,
        images: data.images || []
      };
      const response = await apiRequest("POST", "/api/service-provider/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service created successfully" });
      setIsOpen(false);
      setFormData({ name: '', category: 'Beauty & Grooming', description: '', pricePerSession: '', duration: '', isAvailable: true, images: [] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Service</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter service name"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter service description"
            />
          </div>
          <div>
            <Label htmlFor="pricePerSession" className="text-gray-300">Price per Session ($)</Label>
            <Input
              id="pricePerSession"
              value={formData.pricePerSession}
              onChange={(e) => setFormData({...formData, pricePerSession: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter price"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter duration"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-gray-300">Service Images (Up to 10)</Label>
            <MultiImageUpload
              onImagesUploaded={(images) => setFormData({...formData, images})}
              maxImages={10}
            />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="isAvailable" className="text-gray-300">Available for booking</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => createServiceMutation.mutate(formData)} 
            disabled={createServiceMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {createServiceMutation.isPending ? "Creating..." : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Service Component
function EditServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: service.name || '',
    category: service.category || '',
    description: service.description || '',
    pricePerSession: service.pricePerSession || '',
    duration: service.duration || 0,
    isAvailable: service.isAvailable ?? true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/service-provider/services/${service.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service updated successfully" });
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
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-gray-300">Price per Session</Label>
              <Input
                id="price"
                value={formData.pricePerSession}
                onChange={(e) => setFormData({...formData, pricePerSession: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="$150"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-gray-300">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateServiceMutation.mutate(formData)} 
            disabled={updateServiceMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateServiceMutation.isPending ? "Updating..." : "Update Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Service Component
function DeleteServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteServiceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/service-provider/services/${service.id}`);
    },
    onSuccess: () => {
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service deleted successfully" });
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
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {service.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteServiceMutation.mutate()} 
            disabled={deleteServiceMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ServiceCategoryCard = ({ category, index }: any) => {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative overflow-hidden"
    >
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
        <div className={`h-32 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Icon */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          
          {/* Category Info */}
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
            <p className="text-white/80 text-sm">{category.services.length} service types</p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {category.services.slice(0, 3).map((service: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
                  <span>{service}</span>
                </div>
              ))}
              {category.services.length > 3 && (
                <div className="text-xs text-gray-400 pl-4">
                  +{category.services.length - 3} more services
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-purple-500">
                <Eye className="h-4 w-4 mr-2" />
                View Services
              </Button>
              <Button size="sm" className={`bg-gradient-to-r ${category.color}`}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      </Card>
    </motion.div>
  );
};

const BookingCard = ({ booking, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 + index * 0.1 }}
    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
  >
    <div className="flex items-center space-x-4">
      <Avatar className="h-12 w-12 ring-2 ring-purple-500/20 group-hover:ring-purple-400/40 transition-all">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
          {booking.clientName?.charAt(0) || 'C'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-white font-medium">{booking.clientName}</p>
        <p className="text-sm text-gray-400">{booking.serviceName} • {booking.date}</p>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-white font-bold">${booking.amount}</p>
        <Badge className={`${
          booking.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>
          {booking.status}
        </Badge>
      </div>
      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  </motion.div>
);

export default function ServiceProviderDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logoutMutation } = useAuth();

  const { data: stats } = useQuery<ServiceProviderStats>({
    queryKey: ['/api/service-provider/stats'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/service-provider/services'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/service-provider/bookings'],
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
            Service Provider Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge services and client relationships
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddServiceDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </motion.div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Services"
          value={stats?.totalServices || '8'}
          change={null}
          icon={Briefcase}
          gradient="from-purple-500 to-pink-500"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 12500).toLocaleString()}`}
          change={25}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Client Bookings"
          value={stats?.totalBookings || '34'}
          change={18}
          icon={CalendarDays}
          gradient="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats?.avgRating || 4.9}/5`}
          change={3}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Service Performance & Recent Bookings */}
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
              Service Performance
            </CardTitle>
            <CardDescription>Top performing service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceCategories.slice(0, 4).map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{category.name}</p>
                        <p className="text-sm text-gray-400">{3 + index} active services</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${(2 + index).toLocaleString()}k</p>
                      <p className="text-xs text-green-400">+{15 + index * 5}%</p>
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
              <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest client service requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { clientName: 'Marina Guest', serviceName: 'Private Chef', date: 'Today 3:00 PM', amount: 450, status: 'confirmed' },
                { clientName: 'Yacht Elite', serviceName: 'Spa Treatment', date: 'Tomorrow 10:00 AM', amount: 320, status: 'pending' },
                { clientName: 'Ocean Luxury', serviceName: 'Photography', date: 'Dec 23, 2:00 PM', amount: 280, status: 'completed' }
              ].map((booking, index) => (
                <BookingCard key={index} booking={booking} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
            className="text-4xl font-bold text-white mb-2"
          >
            Service Portfolio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge service offerings across all categories
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddServiceDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Your Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {!services ? (
          // Loading state
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl animate-pulse">
              <div className="h-48 bg-gray-800 rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : services && services.length > 0 ? (
          // Real services from database
          services.map((service: any, index: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative overflow-hidden"
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={service.imageUrl || '/service-placeholder.jpg'} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Service Status */}
                  <div className="absolute top-4 right-4">
                    <Badge className={service.isAvailable ? "bg-green-600" : "bg-red-600"}>
                      {service.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <EditServiceDialog service={service} />
                    <DeleteServiceDialog service={service} />
                  </div>
                  
                  {/* Service Info */}
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-xl mb-1">{service.name}</h3>
                    <p className="text-white/80 text-sm">{service.category}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-white font-bold text-lg">{service.pricePerSession}</div>
                      <div className="text-gray-400 text-sm">{service.duration}h duration</div>
                    </div>
                    
                    {service.rating && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{service.rating}</span>
                        <span className="text-gray-400 text-sm">({service.reviewCount} reviews)</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No services found</div>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
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
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/20" />
          
          {/* Logo */}
          <div className="p-8 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Service Provider</h2>
                <p className="text-sm text-gray-400">Concierge Management</p>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
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
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white shadow-lg' 
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
                        <Zap className="h-4 w-4 text-purple-400" />
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
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  SP
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Service Provider'}</p>
                <p className="text-xs text-gray-400">Concierge Specialist</p>
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
            {activeSection === 'services' && renderServices()}
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
                      Manage client bookings and service schedules
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Calendar View
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </motion.div>
                </div>

                {/* Booking Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Today's Bookings"
                    value="3"
                    change={null}
                    icon={Clock}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0}
                  />
                  <StatCard
                    title="This Week"
                    value="12"
                    change={25}
                    icon={CalendarDays}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Pending"
                    value="5"
                    change={null}
                    icon={Clock}
                    gradient="from-yellow-500 to-orange-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Completed"
                    value="28"
                    change={18}
                    icon={Activity}
                    gradient="from-green-500 to-emerald-500"
                    delay={0.3}
                  />
                </div>

                {/* Bookings List */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
                      All Bookings
                    </CardTitle>
                    <CardDescription>Complete booking history and upcoming appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(bookings as any[])?.length ? (bookings as any[]).map((booking: any, index: number) => (
                        <BookingCard key={booking.id || index} booking={booking} index={index} />
                      )) : (
                        [
                          { id: 1, clientName: 'Marina Elite', serviceName: 'Private Chef Service', date: 'Today 3:00 PM', amount: 450, status: 'confirmed' },
                          { id: 2, clientName: 'Ocean Luxury', serviceName: 'Spa Treatment', date: 'Tomorrow 10:00 AM', amount: 320, status: 'pending' },
                          { id: 3, clientName: 'Yacht Dreams', serviceName: 'Photography Session', date: 'Dec 23, 2:00 PM', amount: 280, status: 'completed' },
                          { id: 4, clientName: 'Sea Breeze', serviceName: 'Fitness Training', date: 'Dec 24, 9:00 AM', amount: 200, status: 'confirmed' },
                          { id: 5, clientName: 'Blue Waters', serviceName: 'Entertainment', date: 'Dec 25, 7:00 PM', amount: 600, status: 'pending' }
                        ].map((booking, index) => (
                          <BookingCard key={booking.id} booking={booking} index={index} />
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
                      Track earnings and optimize service pricing
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
                      Date Range
                    </Button>
                  </motion.div>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Monthly Revenue"
                    value="$12,850"
                    change={28}
                    icon={DollarSign}
                    gradient="from-green-500 to-emerald-500"
                    delay={0}
                  />
                  <StatCard
                    title="Average Per Service"
                    value="$385"
                    change={12}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Total Earnings"
                    value="$48,290"
                    change={null}
                    icon={Star}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Payout Pending"
                    value="$3,240"
                    change={null}
                    icon={Clock}
                    gradient="from-yellow-500 to-orange-500"
                    delay={0.3}
                  />
                </div>

                {/* Revenue Charts and Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                        Revenue by Service Category
                      </CardTitle>
                      <CardDescription>Performance across different service types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {serviceCategories.slice(0, 5).map((category, index) => {
                          const revenue = [4200, 3800, 3200, 2800, 2400][index];
                          const percentage = Math.round((revenue / 12850) * 100);
                          
                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                                    <category.icon className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-white font-medium">{category.name}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold">${revenue.toLocaleString()}</p>
                                  <p className="text-xs text-gray-400">{percentage}%</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                                  style={{ width: `${percentage}%` }}
                                />
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
                        <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                        Recent Transactions
                      </CardTitle>
                      <CardDescription>Latest payment and payout history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { client: 'Marina Elite', service: 'Private Chef', amount: 450, date: 'Dec 22', status: 'paid' },
                          { client: 'Ocean Luxury', service: 'Spa Treatment', amount: 320, date: 'Dec 21', status: 'paid' },
                          { client: 'Yacht Dreams', service: 'Photography', amount: 280, date: 'Dec 20', status: 'pending' },
                          { client: 'Sea Breeze', service: 'Fitness Training', amount: 200, date: 'Dec 19', status: 'paid' },
                          { client: 'Blue Waters', service: 'Entertainment', amount: 600, date: 'Dec 18', status: 'paid' }
                        ].map((transaction, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                                <DollarSign className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{transaction.client}</p>
                                <p className="text-sm text-gray-400">{transaction.service} • {transaction.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">${transaction.amount}</p>
                              <Badge className={transaction.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            {activeSection === 'clients' && (
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
                      Client Management
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Build relationships and manage client preferences
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-orange-500">
                      <Search className="h-4 w-4 mr-2" />
                      Search Clients
                    </Button>
                  </motion.div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Clients"
                    value="47"
                    change={15}
                    icon={Users}
                    gradient="from-orange-500 to-red-500"
                    delay={0}
                  />
                  <StatCard
                    title="Active This Month"
                    value="23"
                    change={8}
                    icon={Activity}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Repeat Clients"
                    value="31"
                    change={null}
                    icon={Star}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Client Satisfaction"
                    value="4.9/5"
                    change={2}
                    icon={Heart}
                    gradient="from-green-500 to-emerald-500"
                    delay={0.3}
                  />
                </div>

                {/* Client List */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="h-5 w-5 mr-2 text-orange-500" />
                      Client Directory
                    </CardTitle>
                    <CardDescription>Manage your client relationships and service history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { name: 'Marina Elite', avatar: 'ME', services: 8, spent: 3400, rating: 5.0, lastService: '2 days ago', tier: 'Platinum' },
                        { name: 'Ocean Luxury', avatar: 'OL', services: 12, spent: 4850, rating: 4.9, lastService: '1 week ago', tier: 'Gold' },
                        { name: 'Yacht Dreams', avatar: 'YD', services: 6, spent: 2200, rating: 4.8, lastService: '3 days ago', tier: 'Silver' },
                        { name: 'Sea Breeze', avatar: 'SB', services: 4, spent: 1600, rating: 5.0, lastService: '5 days ago', tier: 'Bronze' },
                        { name: 'Blue Waters', avatar: 'BW', services: 15, spent: 6200, rating: 4.9, lastService: '1 day ago', tier: 'Platinum' },
                        { name: 'Coral Bay', avatar: 'CB', services: 7, spent: 2800, rating: 4.7, lastService: '1 week ago', tier: 'Gold' }
                      ].map((client, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="group relative overflow-hidden"
                        >
                          <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/60 transition-all duration-300 hover:border-orange-500/30">
                            <CardContent className="p-6">
                              <div className="text-center space-y-4">
                                <Avatar className="h-16 w-16 mx-auto ring-2 ring-orange-500/20 group-hover:ring-orange-400/40 transition-all">
                                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-lg">
                                    {client.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                  <h3 className="text-white font-bold text-lg">{client.name}</h3>
                                  <Badge className={`mt-1 ${
                                    client.tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                    client.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                    client.tier === 'Silver' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                                    'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                  }`}>
                                    {client.tier}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-400">Services</p>
                                    <p className="text-white font-semibold">{client.services}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Total Spent</p>
                                    <p className="text-white font-semibold">${client.spent.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Rating</p>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                      <p className="text-white font-semibold">{client.rating}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Last Service</p>
                                    <p className="text-white font-semibold">{client.lastService}</p>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-orange-500">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Message
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Animated background gradient */}
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                      Deep insights into service performance and growth opportunities
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-violet-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Time Period
                    </Button>
                  </motion.div>
                </div>

                {/* Analytics KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Conversion Rate"
                    value="68%"
                    change={12}
                    icon={TrendingUp}
                    gradient="from-violet-500 to-indigo-500"
                    delay={0}
                  />
                  <StatCard
                    title="Avg Response Time"
                    value="2.3h"
                    change={-15}
                    icon={Clock}
                    gradient="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <StatCard
                    title="Client Retention"
                    value="89%"
                    change={8}
                    icon={Heart}
                    gradient="from-green-500 to-emerald-500"
                    delay={0.2}
                  />
                  <StatCard
                    title="Service Quality"
                    value="4.9/5"
                    change={3}
                    icon={Star}
                    gradient="from-yellow-500 to-orange-500"
                    delay={0.3}
                  />
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-violet-500" />
                        Booking Trends
                      </CardTitle>
                      <CardDescription>Service booking patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          { month: 'Jul 2024', bookings: 28, revenue: 8200 },
                          { month: 'Aug 2024', bookings: 32, revenue: 9400 },
                          { month: 'Sep 2024', bookings: 35, revenue: 10800 },
                          { month: 'Oct 2024', bookings: 41, revenue: 12200 },
                          { month: 'Nov 2024', bookings: 38, revenue: 11600 },
                          { month: 'Dec 2024', bookings: 45, revenue: 13500 }
                        ].map((data, index) => {
                          const maxBookings = 45;
                          const width = (data.bookings / maxBookings) * 100;
                          
                          return (
                            <div key={data.month} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{data.month}</span>
                                <div className="text-right">
                                  <p className="text-white font-bold">{data.bookings} bookings</p>
                                  <p className="text-xs text-gray-400">${data.revenue.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${width}%` }}
                                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                />
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
                        <Users className="h-5 w-5 mr-2 text-violet-500" />
                        Client Insights
                      </CardTitle>
                      <CardDescription>Client behavior and preferences analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 rounded-xl bg-gray-800/30">
                            <div className="text-2xl font-bold text-white mb-1">73%</div>
                            <div className="text-xs text-gray-400">Repeat Clients</div>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-gray-800/30">
                            <div className="text-2xl font-bold text-white mb-1">4.2</div>
                            <div className="text-xs text-gray-400">Avg Services/Client</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-white font-medium">Most Popular Services</h4>
                          {[
                            { service: 'Private Chef', bookings: 28, percentage: 85 },
                            { service: 'Spa Treatment', bookings: 24, percentage: 72 },
                            { service: 'Photography', bookings: 19, percentage: 58 },
                            { service: 'Entertainment', bookings: 15, percentage: 45 },
                            { service: 'Fitness Training', bookings: 12, percentage: 36 }
                          ].map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm">{item.service}</span>
                                <span className="text-gray-400 text-xs">{item.bookings} bookings</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.percentage}%` }}
                                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-violet-500" />
                      Key Performance Indicators
                    </CardTitle>
                    <CardDescription>Comprehensive view of your service provider metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Revenue Growth',
                          metrics: [
                            { label: 'This Month', value: '+28%', color: 'text-green-400' },
                            { label: 'Last 3 Months', value: '+18%', color: 'text-green-400' },
                            { label: 'Year to Date', value: '+45%', color: 'text-green-400' }
                          ]
                        },
                        {
                          title: 'Service Quality',
                          metrics: [
                            { label: 'Avg Rating', value: '4.9/5', color: 'text-yellow-400' },
                            { label: 'Reviews Count', value: '127', color: 'text-blue-400' },
                            { label: 'Satisfaction', value: '96%', color: 'text-green-400' }
                          ]
                        },
                        {
                          title: 'Operational Efficiency',
                          metrics: [
                            { label: 'Response Time', value: '2.3h', color: 'text-blue-400' },
                            { label: 'Completion Rate', value: '98%', color: 'text-green-400' },
                            { label: 'Cancellation Rate', value: '2%', color: 'text-orange-400' }
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
            {activeSection === 'profile' && (
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
                      Provider Profile
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Manage your professional profile and certifications
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-pink-600 to-rose-600">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 hover:border-pink-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Account
                    </Button>
                  </motion.div>
                </div>

                {/* Profile Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl lg:col-span-1">
                    <CardContent className="p-8 text-center">
                      <Avatar className="h-32 w-32 mx-auto mb-6 ring-4 ring-pink-500/20">
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-4xl">
                          SP
                        </AvatarFallback>
                      </Avatar>
                      
                      <h2 className="text-2xl font-bold text-white mb-2">{user?.username || 'Service Provider'}</h2>
                      <p className="text-gray-400 mb-4">Luxury Yacht Concierge Specialist</p>
                      
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white font-bold">4.9</span>
                        <span className="text-gray-400">(127 reviews)</span>
                      </div>
                      
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-6">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Provider
                      </Badge>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Member Since</span>
                          <span className="text-white">Jan 2023</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Response Rate</span>
                          <span className="text-white">98%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Services Completed</span>
                          <span className="text-white">247</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Crown className="h-5 w-5 mr-2 text-pink-500" />
                        Professional Information
                      </CardTitle>
                      <CardDescription>Your professional details and service offerings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Full Name</label>
                          <Input 
                            defaultValue="Alexandra Marina"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Phone Number</label>
                          <Input 
                            defaultValue="+1 (555) 987-6543"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Location</label>
                          <Input 
                            defaultValue="Miami Beach, FL"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Years Experience</label>
                          <Input 
                            defaultValue="8 years"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Professional Bio</label>
                        <textarea 
                          className="w-full h-24 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white resize-none"
                          defaultValue="Luxury yacht concierge specialist with 8+ years of experience providing world-class services to high-end clientele. Expert in culinary experiences, wellness treatments, and personalized yacht lifestyle management."
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Specializations</label>
                        <div className="flex flex-wrap gap-2">
                          {['Private Chef', 'Spa Services', 'Photography', 'Entertainment', 'Wellness'].map((spec, index) => (
                            <Badge key={index} className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Certifications & Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-pink-500" />
                        Certifications & Licenses
                      </CardTitle>
                      <CardDescription>Professional credentials and qualifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'Certified Yacht Concierge Professional', issuer: 'IYCA', date: '2023', verified: true },
                          { name: 'Food Safety & Hygiene Certificate', issuer: 'ServSafe', date: '2024', verified: true },
                          { name: 'Spa Therapy Certification', issuer: 'ISPA', date: '2022', verified: true },
                          { name: 'First Aid & CPR Certified', issuer: 'Red Cross', date: '2024', verified: true }
                        ].map((cert, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                                <Shield className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{cert.name}</p>
                                <p className="text-sm text-gray-400">{cert.issuer} • {cert.date}</p>
                              </div>
                            </div>
                            {cert.verified && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Verified
                              </Badge>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Star className="h-5 w-5 mr-2 text-pink-500" />
                        Recent Reviews
                      </CardTitle>
                      <CardDescription>Client feedback and testimonials</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { client: 'Marina Elite', rating: 5, comment: 'Exceptional service! The private chef experience was unforgettable.', date: '2 days ago' },
                          { client: 'Ocean Luxury', rating: 5, comment: 'Professional, punctual, and exceeded our expectations.', date: '1 week ago' },
                          { client: 'Yacht Dreams', rating: 4, comment: 'Great photography session, beautiful results!', date: '2 weeks ago' }
                        ].map((review, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="p-4 rounded-xl bg-gray-800/30"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">{review.client}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{review.comment}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            {activeSection === 'settings' && (
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
                      Account Settings
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-gray-400"
                    >
                      Configure availability, notifications, and account preferences
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-gray-600 to-slate-600">
                      <Settings className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </motion.div>
                </div>

                {/* Settings Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        Availability Settings
                      </CardTitle>
                      <CardDescription>Manage your working hours and availability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-3 block">Working Days</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                            <div key={day} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                defaultChecked={index < 6}
                                className="rounded border-gray-600 bg-gray-800"
                              />
                              <span className="text-white text-sm">{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Start Time</label>
                          <Input 
                            type="time"
                            defaultValue="08:00"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">End Time</label>
                          <Input 
                            type="time"
                            defaultValue="18:00"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input type="checkbox" className="rounded border-gray-600 bg-gray-800" />
                          <span className="text-white text-sm">Accept bookings with less than 24h notice</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                          <span className="text-white text-sm">Auto-decline conflicting bookings</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-gray-500" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Control how you receive updates and alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">New Booking Requests</p>
                            <p className="text-xs text-gray-400">Get notified when clients request your services</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Booking Confirmations</p>
                            <p className="text-xs text-gray-400">Notifications for confirmed bookings</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Payment Notifications</p>
                            <p className="text-xs text-gray-400">Updates on payments and payouts</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Review Alerts</p>
                            <p className="text-xs text-gray-400">When clients leave reviews</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Marketing Updates</p>
                            <p className="text-xs text-gray-400">Platform updates and promotional offers</p>
                          </div>
                          <input type="checkbox" className="rounded border-gray-600 bg-gray-800" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Notification Method</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="notification_method" defaultChecked className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Email + SMS</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="notification_method" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Email Only</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="notification_method" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">SMS Only</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                        Payment & Billing
                      </CardTitle>
                      <CardDescription>Manage payment methods and billing information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Preferred Payout Method</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_method" defaultChecked className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Bank Transfer (ACH)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_method" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">PayPal</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_method" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Check</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Payout Schedule</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_schedule" defaultChecked className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Weekly</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_schedule" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Bi-weekly</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" name="payout_schedule" className="border-gray-600 bg-gray-800" />
                            <span className="text-white text-sm">Monthly</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Current Balance</span>
                          <span className="text-green-400 font-bold">$3,240.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Next Payout</span>
                          <span className="text-white text-sm">Friday, Dec 29</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-gray-500" />
                        Security & Privacy
                      </CardTitle>
                      <CardDescription>Account security and privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Change Password</label>
                        <div className="space-y-3">
                          <Input 
                            type="password"
                            placeholder="Current password"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                          <Input 
                            type="password"
                            placeholder="New password"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                          <Input 
                            type="password"
                            placeholder="Confirm new password"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-400">Add an extra layer of security</p>
                          </div>
                          <Button size="sm" variant="outline" className="border-gray-600 hover:border-green-500">
                            Enable
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Profile Visibility</p>
                            <p className="text-xs text-gray-400">Control who can see your profile</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Show Real Name</p>
                            <p className="text-xs text-gray-400">Display your real name to clients</p>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}