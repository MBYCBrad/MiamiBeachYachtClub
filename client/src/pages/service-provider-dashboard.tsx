import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  MoreVertical,
  Eye,
  Filter,
  Sparkles,
  LogOut,
  User,
  Package,
  BookOpen,
  BarChart3,
  Settings,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import { MultiImageUpload } from "@/components/multi-image-upload";

// Service form schema
const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  pricePerSession: z.string().min(1, "Price is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute").default(60),
  isAvailable: z.boolean().default(true)
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

// Add Service Dialog Component
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                {createMutation.isPending ? "Creating..." : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Service Dialog Component
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  console.log('Service images uploaded:', images);
                  form.setValue('imageUrl', images[0] || '');
                }}
                currentImages={service.imageUrl ? [service.imageUrl] : []}
                maxImages={5}
              />
              {/* Debug info */}
              <div className="text-xs text-gray-500">
                Debug: Service imageUrl = {service.imageUrl || 'none'}, 
                currentImages = {JSON.stringify(service.imageUrl ? [service.imageUrl] : [])}
              </div>
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

export default function ServiceProviderDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
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

  const renderOverview = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.025em' }}>
            Overview
          </h1>
          <p className="text-lg text-gray-400">Welcome back, {user?.username}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Services", value: stats?.totalServices || 0, icon: Package, color: "text-purple-400" },
            { title: "Active Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "text-blue-400" },
            { title: "Monthly Revenue", value: `$${stats?.monthlyRevenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-green-400" },
            { title: "Average Rating", value: stats?.avgRating?.toFixed(1) || "0.0", icon: Star, color: "text-yellow-400" },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-950 border-gray-800 hover:bg-gray-900 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className={`text-2xl font-bold text-white`}>{stat.value}</div>
                  </div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Service Categories */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Service Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Beauty & Grooming', 'Culinary', 'Wellness & Spa', 'Photography & Media', 'Entertainment', 'Water Sports', 'Concierge & Lifestyle'].map((category, index) => {
              const categoryServices = services?.filter(s => s.category === category) || [];
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-950 border-gray-800 hover:bg-gray-900 transition-all duration-300 cursor-pointer" onClick={() => setActiveSection('services')}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{category}</h3>
                          <p className="text-gray-400 text-sm">{categoryServices.length} services</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Add Service", icon: Plus, action: () => { setActiveSection('services'); } },
              { label: "View Bookings", icon: Calendar, action: () => setActiveSection('bookings') },
              { label: "Messages", icon: MessageSquare, action: () => setActiveSection('messages') },
              { label: "Settings", icon: Settings, action: () => setActiveSection('settings') },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={action.action}
                className="bg-gray-950 border border-gray-800 rounded-lg p-4 hover:bg-gray-900 transition-all duration-300 flex items-center space-x-3"
              >
                <action.icon className="h-5 w-5 text-purple-400" />
                <span className="text-white">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {!services ? (
          // Loading state
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-gray-950 border-gray-800 animate-pulse">
              <div className="h-48 bg-gray-800 rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : services && Array.isArray(services) && services.length > 0 ? (
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
              <Card className="bg-gray-950 border-gray-800 hover:bg-gray-900 transition-all duration-500 hover:border-purple-500/30">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={service.imageUrl ? 
                      (service.imageUrl.startsWith('/api/media/') ? service.imageUrl : `/api/media/${service.imageUrl}`) 
                      : '/service-placeholder.jpg'
                    } 
                    alt={service.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/service-placeholder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Service Status */}
                  <Badge className={`absolute top-4 left-4 ${
                    service.isAvailable 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                  
                  {/* Service Actions */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditServiceDialog service={service} />
                    <DeleteServiceDialog service={service} />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-purple-400 font-medium">
                        {service.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        ${service.pricePerSession}
                      </p>
                      <p className="text-xs text-gray-400">
                        {service.duration}min
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">
                        {service.rating || '4.8'} ({service.reviews || '12'} reviews)
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          // No services state
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Services Yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Start building your service portfolio by creating your first yacht concierge service
            </p>
            <AddServiceDialog />
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-950 border-r border-gray-800 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Service Provider</h2>
                <p className="text-gray-400 text-sm">{user?.username}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'services', label: 'Services', icon: Package },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              size="sm"
              className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'services' && renderServices()}
          {activeSection === 'overview' && renderOverview()}
          {activeSection !== 'services' && activeSection !== 'overview' && (
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
              <p className="text-gray-400">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}