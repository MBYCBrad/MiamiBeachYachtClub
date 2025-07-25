import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// WebSocket hooks temporarily removed to prevent connection errors
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  MessageSquare,
  Clock,
  History,
  CreditCard,
  Bell,
  X,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Shield
} from "lucide-react";
import MessagesPage from './messages-page';
import NotificationsPage from './notifications-page';
import ProfilePage from './profile-page';
import { MultiImageUpload } from "@/components/multi-image-upload";
import { Sparkles as SparklesIcon, Palette, ChefHat, Dumbbell, Camera, Music, Anchor } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Service form schema
const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  category: z.string().min(1, "Category is required"),
  serviceType: z.string().min(1, "Service type is required"),
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
      serviceType: "yacht",
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
    onSuccess: (newService) => {
      // Immediate optimistic update - add service to cache
      queryClient.setQueryData(["/api/service-provider/services"], (old: any) => {
        if (!old) return [newService];
        return [...old, newService];
      });
      
      // Also invalidate to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/stats"] });
      
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
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30">
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
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="yacht">Yacht Add-on Service (on yacht during charter)</SelectItem>
                      <SelectItem value="marina">Marina Service (at marina before boarding)</SelectItem>
                      <SelectItem value="location">Location Service (provider comes to member address)</SelectItem>
                      <SelectItem value="external_location">External Location (member visits business address)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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



// Delete Service Dialog Component
function DeleteServiceButton({ service }: { service: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/services/${service.id}`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/service-provider/services"] });
      
      // Snapshot the previous value
      const previousServices = queryClient.getQueryData(["/api/service-provider/services"]);
      
      // Optimistically update to remove the service
      queryClient.setQueryData(["/api/service-provider/services"], (old: any) => {
        if (!old) return old;
        return old.filter((s: any) => s.id !== service.id);
      });
      
      // Return a context object with the snapshotted value
      return { previousServices };
    },
    onSuccess: () => {
      // Invalidate queries to ensure we have fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/stats"] });
      
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousServices) {
        queryClient.setQueryData(["/api/service-provider/services"], context.previousServices);
      }
      
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/stats"] });
    }
  });

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30"
      onClick={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    >
      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

// View Service Dialog Component
function ViewServiceDialog({ service }: { service: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-400">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-400" />
            View Service Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete information about {service.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Image */}
          {service.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}
          
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-sm font-medium">Service Name</Label>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white">{service.name}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm font-medium">Category</Label>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {service.category}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <Label className="text-gray-300 text-sm font-medium">Description</Label>
            <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-white leading-relaxed">{service.description}</p>
            </div>
          </div>
          
          {/* Pricing & Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300 text-sm font-medium">Price per Session</Label>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white font-bold text-lg">${service.pricePerSession}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm font-medium">Duration</Label>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white">{service.duration} minutes</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm font-medium">Availability</Label>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg">
                <Badge className={service.isAvailable ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white opacity-60'}>
                  {service.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Additional Images Gallery */}
          {service.images && service.images.length > 1 && (
            <div>
              <Label className="text-gray-300 text-sm font-medium">Service Gallery</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {service.images.map((img: string, idx: number) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    <img 
                      src={img}
                      alt={`${service.name} ${idx + 1}`}
                      className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Service Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Bookings</p>
              <p className="text-white text-xl font-bold">{service.bookingCount || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-white text-xl font-bold">{service.rating || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-600 hover:border-gray-500">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Service Dialog Component
function EditServiceDialog({ service }: { service: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || "",
      category: service?.category || "",
      serviceType: service?.serviceType || "yacht",
      description: service?.description || "",
      imageUrl: service?.imageUrl || "",
      images: service?.images || [],
      pricePerSession: service?.pricePerSession || "",
      duration: service?.duration || 60,
      isAvailable: service?.isAvailable ?? true
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const serviceData = {
        ...data,
        duration: data.duration || 60,
        pricePerSession: data.pricePerSession || "0"
      };
      const response = await apiRequest("PUT", `/api/services/${service.id}`, serviceData);
      return response.json();
    },
    onSuccess: (updatedService) => {
      // Immediate optimistic update - update service in cache
      queryClient.setQueryData(["/api/service-provider/services"], (old: any) => {
        if (!old) return old;
        return old.map((s: any) => s.id === service.id ? { ...s, ...updatedService } : s);
      });
      
      // Also invalidate to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider/stats"] });
      
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
    updateMutation.mutate(data);
  };

  // Reset form when service changes
  React.useEffect(() => {
    if (service && open) {
      form.reset({
        name: service.name || "",
        category: service.category || "",
        serviceType: service.serviceType || "yacht",
        description: service.description || "",
        imageUrl: service.imageUrl || "",
        images: service.images || [],
        pricePerSession: service.pricePerSession || "",
        duration: service.duration || 60,
        isAvailable: service.isAvailable ?? true
      });
    }
  }, [service, open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500 text-gray-300 hover:text-purple-400">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your yacht concierge service details
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
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="yacht">Yacht Add-on Service (on yacht during charter)</SelectItem>
                      <SelectItem value="marina">Marina Service (at marina before boarding)</SelectItem>
                      <SelectItem value="location">Location Service (provider comes to member address)</SelectItem>
                      <SelectItem value="external_location">External Location (member visits business address)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  form.setValue('imageUrl', images[0] || '');
                }}
                currentImages={form.getValues('imageUrl') ? [form.getValues('imageUrl')] : []}
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
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-600/30"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Service"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceProviderStats {
  totalServices: number;
  totalBookings: number;
  monthlyRevenue: number;
  monthlyGrossRevenue: number;
  lifetimeRevenue: number;
  lifetimeGrossRevenue: number;
  pendingPayouts: number;
  platformFeesDeducted: number;
  avgRating: number;
  totalReviews: number;
  completionRate: number;
  activeClients: number;
  completedBookings: number;
  pendingBookings: number;
  nextPayoutDate: string;
  payoutFrequency: string;
}

// Category icons mapping
const categoryIcons = {
  'Beauty & Grooming': Palette,
  'Culinary': ChefHat,
  'Wellness & Spa': Dumbbell,
  'Photography & Media': Camera,
  'Entertainment': Music,
  'Water Sports': Anchor,
  'Concierge & Lifestyle': SparklesIcon
};

export default function ServiceProviderDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logoutMutation } = useAuth();
  
  // Initialize services WebSocket for real-time service updates
  // useServicesWebSocket(); // Temporarily disabled
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [viewingService, setViewingService] = useState<any>(null);
  const [serviceFilters, setServiceFilters] = useState({
    category: "all",
    availability: "all",
    priceRange: "all"
  });

  // Settings state management with real-time synchronization
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch user settings with 30-second refresh interval
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    refetchInterval: 30000, // Real-time settings sync every 30 seconds
    staleTime: 0, // Always refetch to ensure latest settings
  });

  // Initialize local settings when data loads
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await apiRequest("PUT", "/api/user/settings", updatedSettings);
      return response.json();
    },
    onSuccess: (data) => {
      // Update cache immediately
      queryClient.setQueryData(['/api/user/settings'], data);
      setLocalSettings(data);
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  // Helper function to update specific setting
  const updateSetting = (section: string, key: string, value: any) => {
    if (!localSettings) return;
    
    const updatedSettings = {
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [key]: value
      }
    };
    
    setLocalSettings(updatedSettings);
    updateSettingsMutation.mutate(updatedSettings);
  };

  const { data: stats } = useQuery<ServiceProviderStats>({
    queryKey: ['/api/service-provider/stats'],
    refetchInterval: 15000, // Real-time stats updates every 15 seconds for service providers
    staleTime: 0, // Always refetch to ensure latest statistics
  });

  const { data: services } = useQuery({
    queryKey: ['/api/service-provider/services'],
    refetchInterval: 30000, // Service provider services update every 30 seconds
    staleTime: 0, // Always refetch to ensure latest service availability
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/service-provider/bookings'],
    refetchInterval: 15000, // Service providers get faster updates (15 seconds) for booking management
    staleTime: 0, // Always refetch to ensure latest booking data
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['/api/service-provider/payments'],
    refetchInterval: 15000, // Real-time payment updates every 15 seconds for service providers
    staleTime: 0, // Always refetch to ensure latest payment data
  });

  const serviceCategories = ["Beauty & Grooming", "Culinary", "Wellness & Spa", "Photography & Media", "Entertainment", "Water Sports", "Concierge & Lifestyle"];

  const filteredServices = services?.filter((service: any) => {
    if (serviceFilters.category !== "all" && service.category !== serviceFilters.category) return false;
    if (serviceFilters.availability !== "all") {
      const isAvailable = service.isAvailable;
      if (serviceFilters.availability === "available" && !isAvailable) return false;
      if (serviceFilters.availability === "unavailable" && isAvailable) return false;
    }
    if (serviceFilters.priceRange !== "all") {
      const price = parseFloat(service.pricePerSession);
      if (serviceFilters.priceRange === "low" && price > 99) return false;
      if (serviceFilters.priceRange === "medium" && (price < 100 || price > 500)) return false;
      if (serviceFilters.priceRange === "high" && price < 500) return false;
    }
    return true;
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

        {/* Enhanced Stats Grid with Real-time Payment Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Total Services", 
              value: stats?.totalServices || 0, 
              icon: Package,
              subtitle: "Active services" 
            },
            { 
              title: "Net Revenue (30 days)", 
              value: `$${stats?.monthlyRevenue?.toFixed(2) || "0.00"}`, 
              icon: DollarSign,
              subtitle: `Gross: $${stats?.monthlyGrossRevenue?.toFixed(2) || "0.00"}`,
              trend: "up"
            },
            { 
              title: "Pending Payouts", 
              value: `$${stats?.pendingPayouts?.toFixed(2) || "0.00"}`, 
              icon: Clock,
              subtitle: stats?.nextPayoutDate || "Next payout: TBD",
              trend: "neutral"
            },
            { 
              title: "Lifetime Earnings", 
              value: `$${stats?.lifetimeRevenue?.toFixed(2) || "0.00"}`, 
              icon: Target,
              subtitle: `${stats?.completedBookings || 0} completed`,
              trend: "up"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-950 border-gray-800 hover:bg-gray-900 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    {stat.trend && (
                      <div className={`p-1 rounded ${
                        stat.trend === 'up' ? 'bg-green-500/20' : 
                        stat.trend === 'down' ? 'bg-red-500/20' : 'bg-gray-500/20'
                      }`}>
                        {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-400" />}
                        {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                        {stat.trend === 'neutral' && <Clock className="h-3 w-3 text-gray-400" />}
                      </div>
                    )}
                  </div>
                  <div className="mb-1">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{stat.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Revenue Breakdown</h3>
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gross Revenue (30 days)</span>
                  <span className="text-white font-semibold">${stats?.monthlyGrossRevenue?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fees (15%)</span>
                  <span className="text-white font-semibold">-${stats?.platformFeesDeducted?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Net Revenue</span>
                    <span className="text-white font-bold text-lg">${stats?.monthlyRevenue?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Service Performance</h3>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="text-white font-semibold">{stats?.avgRating?.toFixed(1) || "0.0"} ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="text-white font-semibold">{stats?.totalReviews || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-white font-semibold">{stats?.completionRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Clients</span>
                  <span className="text-white font-semibold">{stats?.activeClients || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRevenue = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-2 tracking-tight"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
        >
          Revenue & Payments
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-400"
        >
          Track your earnings, payouts, and payment history
        </motion.p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">${stats?.lifetimeRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-400">Lifetime Earnings</p>
              <p className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">+{stats?.completedBookings || 0} completed bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">${stats?.pendingPayouts?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-400">Pending Payouts</p>
              <p className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Next payout: {stats?.nextPayoutDate || "TBD"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">${stats?.monthlyRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-gray-400">This Month (Net)</p>
              <p className="text-xs text-purple-400">After 15% platform fee</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Payment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium p-3">Service</th>
                    <th className="text-left text-gray-400 font-medium p-3">Date</th>
                    <th className="text-left text-gray-400 font-medium p-3">Gross Amount</th>
                    <th className="text-left text-gray-400 font-medium p-3">Platform Fee</th>
                    <th className="text-left text-gray-400 font-medium p-3">Net Payout</th>
                    <th className="text-left text-gray-400 font-medium p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment: any) => (
                    <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{payment.serviceName}</p>
                          <p className="text-gray-400 text-sm">Booking #{payment.bookingId}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-white font-semibold">
                        ${payment.grossAmount?.toFixed(2)}
                      </td>
                      <td className="p-3 text-red-400 font-medium">
                        -${payment.platformFee?.toFixed(2)}
                      </td>
                      <td className="p-3 text-green-400 font-bold">
                        ${payment.netAmount?.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No payment history yet</p>
              <p className="text-gray-500 text-sm">Complete your first booking to see payments here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Gross Revenue (All Time)</span>
              <span className="text-white font-semibold">${stats?.lifetimeGrossRevenue?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Platform Fees Deducted</span>
              <span className="text-white font-semibold">-$${((stats?.lifetimeGrossRevenue || 0) * 0.15).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Net Lifetime Earnings</span>
                <span className="text-white font-bold text-lg">${stats?.lifetimeRevenue?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gross Revenue</span>
                  <span className="text-white">${stats?.monthlyGrossRevenue?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fees</span>
                  <span className="text-white">-${stats?.platformFeesDeducted?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-white">Net Revenue</span>
                  <span className="text-white">${stats?.monthlyRevenue?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Weekly Payouts</p>
                <p className="text-gray-400 text-sm">Automatic payouts every Friday</p>
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                Active
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Next Payout Date</span>
                <span className="text-white font-medium">{stats?.nextPayoutDate || "Friday, July 25, 2025"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payout Method</span>
                <span className="text-white font-medium">Bank Transfer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processing Time</span>
                <span className="text-white font-medium">1-2 business days</span>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-4">
              <Settings className="h-4 w-4 mr-2" />
              Update Payout Settings
            </Button>
          </CardContent>
        </Card>
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
            My Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge services and availability
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddServiceDialog />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Services
                {(serviceFilters.category !== "all" || serviceFilters.availability !== "all" || 
                  serviceFilters.priceRange !== "all") && (
                  <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs">
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
        {filteredServices?.length === 0 ? (
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
          filteredServices?.map((service: any, index: number) => (
            <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
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
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/30">
                    {service.category}
                  </Badge>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge className={`${service.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${service.pricePerSession}</span>
                  <div className="flex items-center space-x-2">
                    <ViewServiceDialog service={service} />
                    <EditServiceDialog service={service} />
                    <DeleteServiceButton service={service} />
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
      <div className="flex items-center justify-between mt-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Service Bookings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge service bookings and client experiences
          </motion.p>
        </div>
        

      </div>

      {/* Dynamic Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-white mt-1">{bookings?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Services</p>
                  <p className="text-2xl font-bold text-white mt-1">{bookings?.filter(b => b.status === 'confirmed')?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-white mt-1">{bookings?.filter(b => b.status === 'pending')?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">${bookings?.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-white mt-1">4.9/5</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-500" />
              Service Booking Management
            </CardTitle>
            <CardDescription>Manage your yacht concierge service bookings and client interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Member</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Service</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Date & Time</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Price</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings?.map((booking: any, index: number) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{booking.user?.username || booking.user?.fullName || 'Unknown Member'}</p>
                          <p className="text-gray-400 text-sm">{booking.user?.email || 'No email'}</p>
                          <p className="text-gray-500 text-xs">{booking.user?.membershipTier || 'Standard'} Member</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{booking.service?.name || 'Unknown Service'}</p>
                          <p className="text-gray-400 text-sm">{booking.service?.category || 'Service'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {booking.bookingTime || new Date(booking.createdAt || booking.bookingDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm">
                            ${booking.amount || booking.totalAmount || booking.price || '0'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          booking.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Message client functionality
                              console.log('Opening message to client:', booking.user?.username || booking.user?.fullName);
                              setActiveSection('messages');
                            }}
                            className="text-purple-400 hover:text-white"
                            title="Message Client"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // View booking details functionality
                              console.log('Viewing booking details:', {
                                id: booking.id,
                                service: booking.service?.name,
                                client: booking.user?.username || booking.user?.fullName,
                                status: booking.status,
                                amount: booking.amount || booking.totalAmount || booking.price
                              });
                            }}
                            className="text-gray-400 hover:text-white"
                            title="View Booking Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Add notes or update booking functionality
                              console.log('Adding notes/updating booking:', booking.id);
                              // Could open a modal to add notes or update service details
                            }}
                            className="text-gray-400 hover:text-green-400"
                            title="Add Notes/Update"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {(!bookings || bookings.length === 0) && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No service bookings found</p>
                  <p className="text-gray-500 text-sm">Client bookings for your services will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAnalytics = () => {
    const totalRevenue = bookings?.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) || 0;
    const monthlyRevenue = totalRevenue; // Simplified for demo
    const avgBookingValue = bookings?.length ? totalRevenue / bookings.length : 0;
    const topService = services?.reduce((top, service) => {
      const serviceBookings = bookings?.filter(b => b.serviceId === service.id) || [];
      const currentTop = top.bookings || 0;
      return serviceBookings.length > currentTop ? { ...service, bookings: serviceBookings.length } : top;
    }, {} as any);

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
              Analytics Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Deep insights into your service performance and business metrics
            </motion.p>
          </div>
          

        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                      <p className="text-purple-400 text-sm">+15.3%</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Booking Value</p>
                    <p className="text-2xl font-bold text-white mt-1">${avgBookingValue.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                      <p className="text-purple-400 text-sm">+8.7%</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.avgRating || '4.8'}/5</p>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-purple-400 mr-1" />
                      <p className="text-purple-400 text-sm">Excellent</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.completionRate || '95'}%</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                      <p className="text-purple-400 text-sm">Excellent</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">Revenue trending upward</p>
                    <p className="text-purple-400 font-semibold mt-2">+15.3% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-500" />
                  Service Performance
                </CardTitle>
                <CardDescription>Your most popular services and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services?.slice(0, 4).map((service: any, index: number) => {
                    const serviceBookings = bookings?.filter(b => b.serviceId === service.id) || [];
                    const percentage = services.length ? (serviceBookings.length / bookings?.length * 100) || 0 : 0;
                    
                    return (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{service.name}</p>
                            <p className="text-gray-400 text-xs">{serviceBookings.length} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{percentage.toFixed(1)}%</p>
                          <div className="w-16 h-2 bg-gray-700 rounded-full mt-1">
                            <div 
                              className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Client Demographics & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Client Demographics
                </CardTitle>
                <CardDescription>Membership tier breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Platinum', 'Gold', 'Silver', 'Bronze'].map((tier, index) => {
                    const tierClients = bookings?.filter(b => b.user?.membershipTier === tier.toLowerCase()) || [];
                    const percentage = bookings?.length ? (tierClients.length / bookings.length * 100) || 0 : 0;
                    
                    return (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                          <span className="text-white text-sm">{tier}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold">{percentage.toFixed(1)}%</span>
                          <div className="w-12 h-2 bg-gray-700 rounded-full mt-1">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performing Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-500" />
                  Top Performer
                </CardTitle>
                <CardDescription>Your best performing service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    {topService?.category && categoryIcons[topService.category as keyof typeof categoryIcons] && 
                      React.createElement(categoryIcons[topService.category as keyof typeof categoryIcons], { 
                        className: "h-8 w-8 text-white" 
                      })
                    }
                  </div>
                  <div>
                    <p className="text-white font-semibold">{topService?.name || 'No services yet'}</p>
                    <p className="text-gray-400 text-sm">{topService?.category || 'Category'}</p>
                    <p className="text-purple-400 font-bold mt-2">{topService?.bookings || 0} bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Growth Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">New Clients</span>
                    <div className="flex items-center space-x-2">
                      <ArrowUpRight className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-semibold">+23%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Repeat Bookings</span>
                    <div className="flex items-center space-x-2">
                      <ArrowUpRight className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-semibold">+18%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Avg Session</span>
                    <div className="flex items-center space-x-2">
                      <ArrowUpRight className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-semibold">2.4h</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Response Time</span>
                    <div className="flex items-center space-x-2">
                      <ArrowDownRight className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-semibold">-15min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  };





  const renderSettings = () => {
    if (!localSettings) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              Settings
            </h1>
            <p className="text-lg text-gray-400">Loading your preferences...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            Settings
          </h1>
          <p className="text-lg text-gray-400">Manage your preferences and account settings</p>
        </div>

        {/* Notification Preferences */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-500" />
              Service Notifications
            </CardTitle>
            <CardDescription>Choose how you want to be notified about your service business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">New Bookings</Label>
                  <p className="text-sm text-gray-400">Get notified when members book your services</p>
                </div>
                <Switch 
                  checked={localSettings.notifications?.newBookings || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'newBookings', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Service Reviews</Label>
                  <p className="text-sm text-gray-400">Notifications when you receive new reviews</p>
                </div>
                <Switch 
                  checked={localSettings.notifications?.guestReviews || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'guestReviews', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Revenue Reports</Label>
                  <p className="text-sm text-gray-400">Weekly earning summaries and payout notifications</p>
                </div>
                <Switch 
                  checked={localSettings.notifications?.revenueReports || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'revenueReports', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={localSettings.notifications?.emailNotifications || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">SMS Notifications</Label>
                  <p className="text-sm text-gray-400">Receive urgent updates via text message</p>
                </div>
                <Switch 
                  checked={localSettings.notifications?.smsNotifications || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Privacy & Visibility
            </CardTitle>
            <CardDescription>Control who can see your information and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base text-white">Service Profile Visibility</Label>
                <Select 
                  value={localSettings.privacy?.profileVisibility || 'members'}
                  onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="public" className="text-white">Public - Visible to everyone</SelectItem>
                    <SelectItem value="members" className="text-white">Members Only - Visible to MBYC members</SelectItem>
                    <SelectItem value="private" className="text-white">Private - Hidden from search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Show Revenue Stats</Label>
                  <p className="text-sm text-gray-400">Display earnings and booking statistics</p>
                </div>
                <Switch 
                  checked={localSettings.privacy?.showRevenue || false}
                  onCheckedChange={(checked) => updateSetting('privacy', 'showRevenue', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Show Contact Information</Label>
                  <p className="text-sm text-gray-400">Allow members to see your contact details</p>
                </div>
                <Switch 
                  checked={localSettings.privacy?.showContactInfo || false}
                  onCheckedChange={(checked) => updateSetting('privacy', 'showContactInfo', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={localSettings.security?.twoFactorEnabled || false}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base text-white">Session Timeout</Label>
                <Select 
                  value={localSettings.security?.sessionTimeout?.toString() || '30'}
                  onValueChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="15" className="text-white">15 minutes</SelectItem>
                    <SelectItem value="30" className="text-white">30 minutes</SelectItem>
                    <SelectItem value="60" className="text-white">1 hour</SelectItem>
                    <SelectItem value="120" className="text-white">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Login Alerts</Label>
                  <p className="text-sm text-gray-400">Get notified of new login attempts</p>
                </div>
                <Switch 
                  checked={localSettings.security?.loginAlerts || false}
                  onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Payout Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
              Payment Processing
            </CardTitle>
            <CardDescription>Your Stripe Connect integration and payout preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stripe Connection Status */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-white font-medium">Platform Connected</p>
                  <p className="text-gray-400 text-sm">Using Miami Beach Yacht Club payment processing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 mb-1">Platform Fee</p>
                <p className="text-white font-medium">15% per transaction</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 mb-1">Payout Schedule</p>
                <p className="text-white font-medium">Weekly (Every Friday)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-500" />
              App Preferences
            </CardTitle>
            <CardDescription>Customize your dashboard experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base text-white">Language</Label>
                <Select 
                  value={localSettings.preferences?.language || 'en'}
                  onValueChange={(value) => updateSetting('preferences', 'language', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="en" className="text-white">English</SelectItem>
                    <SelectItem value="es" className="text-white">Español</SelectItem>
                    <SelectItem value="fr" className="text-white">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base text-white">Timezone</Label>
                <Select 
                  value={localSettings.preferences?.timezone || 'America/New_York'}
                  onValueChange={(value) => updateSetting('preferences', 'timezone', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="America/New_York" className="text-white">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago" className="text-white">Central Time</SelectItem>
                    <SelectItem value="America/Denver" className="text-white">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles" className="text-white">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base text-white">Currency</Label>
                <Select 
                  value={localSettings.preferences?.currency || 'USD'}
                  onValueChange={(value) => updateSetting('preferences', 'currency', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                    <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-950 border-r border-gray-800 min-h-screen relative flex flex-col">
          {/* Top section with navigation */}
          <div className="flex-1 p-6">
            <div className="flex items-center space-x-3 mb-8">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-600/20"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.username?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
              )}
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
                { id: 'revenue', label: 'Revenue', icon: CreditCard },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'My Profile', icon: User },
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
          
          {/* User Profile - Bottom Section */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center space-x-3">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-600/20"
                />
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
              )}
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
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'services' && renderServices()}
          {activeSection === 'bookings' && renderBookings()}
          {activeSection === 'analytics' && renderAnalytics()}
          {activeSection === 'revenue' && renderRevenue()}
          {activeSection === 'settings' && renderSettings()}
          {activeSection === 'messages' && <MessagesPage />}
          {activeSection === 'notifications' && <NotificationsPage />}
          {activeSection === 'profile' && <ProfilePage />}
        </div>
      </div>
    </div>
  );
}