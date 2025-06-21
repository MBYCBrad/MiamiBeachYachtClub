import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  Plus, 
  Edit, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  Award,
  BarChart3,
  MessageSquare,
  Camera
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertServiceSchema, type Service, type ServiceBooking, type User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

type ServiceFormData = z.infer<typeof insertServiceSchema>;

interface ServiceAnalytics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  monthlyStats: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

const SERVICE_CATEGORIES = [
  'Chef & Catering',
  'Spa & Wellness', 
  'Photography',
  'Entertainment',
  'Water Sports',
  'Hair & Beauty',
  'Massage Therapy',
  'Personal Training',
  'Event Planning',
  'Cleaning & Maintenance',
  'Navigation & Captain Services',
  'Concierge Services'
];

const ServiceProviderDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);

  // Fetch provider's services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services/provider', user?.id],
    enabled: !!user
  });

  // Fetch service bookings
  const { data: bookings = [] } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/service-bookings/provider', user?.id],
    enabled: !!user
  });

  // Fetch analytics data
  const { data: analytics } = useQuery<Record<number, ServiceAnalytics>>({
    queryKey: ['/api/analytics/services', user?.id],
    enabled: !!user
  });

  // Fetch pending booking requests
  const { data: pendingBookings = [] } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/service-bookings/pending', user?.id],
    enabled: !!user
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      pricePerSession: '0',
      duration: 2,
      imageUrl: '',
      isAvailable: true
    }
  });

  // Add new service mutation
  const addServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await apiRequest('POST', '/api/services', {
        ...data,
        providerId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
      setIsAddServiceOpen(false);
      form.reset();
      toast({
        title: "Service Added",
        description: "Your service has been successfully added to the marketplace."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFormData> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/services/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
      setIsEditServiceOpen(false);
      setSelectedService(null);
      toast({
        title: "Service Updated",
        description: "Your service information has been updated."
      });
    }
  });

  // Accept/Decline booking mutations
  const acceptBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('PUT', `/api/service-bookings/${bookingId}/accept`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Booking Accepted",
        description: "The booking has been accepted and the member has been notified."
      });
    }
  });

  const declineBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('PUT', `/api/service-bookings/${bookingId}/decline`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Booking Declined",
        description: "The booking has been declined and the member has been notified."
      });
    }
  });

  const onSubmit = (data: ServiceFormData) => {
    if (selectedService) {
      updateServiceMutation.mutate({ ...data, id: selectedService.id });
    } else {
      addServiceMutation.mutate(data);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    form.reset({
      name: service.name,
      category: service.category,
      description: service.description || '',
      pricePerSession: service.pricePerSession || '0',
      duration: service.duration || 2,
      imageUrl: service.imageUrl || '',
      isAvailable: service.isAvailable
    });
    setIsEditServiceOpen(true);
  };

  const getBookingsForService = (serviceId: number) => {
    return bookings.filter(booking => booking.serviceId === serviceId);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.datetime.toISOString().split('T')[0] === dateStr
    );
  };

  const totalRevenue = services.reduce((total, service) => {
    const serviceAnalytics = analytics?.[service.id];
    return total + (serviceAnalytics?.totalRevenue || 0);
  }, 0);

  const totalBookings = services.reduce((total, service) => {
    const serviceBookings = getBookingsForService(service.id);
    return total + serviceBookings.length;
  }, 0);

  const averageRating = services.length > 0 ? 
    services.reduce((total, service) => total + (parseFloat(service.rating || '0')), 0) / services.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Star className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Service Provider Portal
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <span>Welcome, {user?.username}</span>
                <div className="text-xs text-gray-400">
                  {services.length} service{services.length !== 1 ? 's' : ''} • ⭐ {averageRating.toFixed(1)} rating
                </div>
              </div>

              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Performance Overview Cards */}
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Services</CardTitle>
                  <Star className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{services.length}</div>
                  <p className="text-xs text-gray-400">Active listings</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalBookings}</div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Average Rating</CardTitle>
                  <Award className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">⭐ {averageRating.toFixed(1)}</div>
                  <p className="text-xs text-gray-400">Customer satisfaction</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-purple-800/30">
              <TabsTrigger 
                value="services"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <Star className="w-4 h-4 mr-2" />
                My Services
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="requests"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Requests {pendingBookings.length > 0 && `(${pendingBookings.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Services Management Tab */}
            <TabsContent value="services" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Service Management</h2>
                <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-purple-800/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Service</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Create a new service listing for the MBYC marketplace.
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
                                  <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {SERVICE_CATEGORIES.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="pricePerSession"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Price per Session ($)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-700 border-gray-600 text-white" />
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
                                <FormLabel className="text-white">Duration (hours)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    className="bg-gray-700 border-gray-600 text-white" 
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
                                <Textarea {...field} className="bg-gray-700 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Service Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." className="bg-gray-700 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddServiceOpen(false)}
                            className="border-gray-600 text-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                            disabled={addServiceMutation.isPending}
                          >
                            Add Service
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const serviceBookings = getBookingsForService(service.id);
                  const serviceAnalytics = analytics?.[service.id];

                  return (
                    <Card key={service.id} className="bg-gray-800/50 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <img 
                          src={service.imageUrl || '/service-placeholder.jpg'} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={service.isAvailable ? "bg-green-600" : "bg-red-600"}>
                            {service.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditService(service)}
                            className="border-white/20 bg-black/50 text-white hover:bg-white/20"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white">{service.name}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {service.category} • {service.duration}hrs
                        </CardDescription>
                        <div className="flex items-center text-sm text-yellow-400">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          {service.rating || '0.0'} ({service.reviewCount || 0} reviews)
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white">${service.pricePerSession}/session</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Bookings:</span>
                            <span className="text-white">{serviceBookings.length} this month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="text-white">${serviceAnalytics?.totalRevenue?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Bookings Calendar Tab */}
            <TabsContent value="bookings" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Booking Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border border-gray-600"
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Bookings for {selectedDate?.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getBookingsForDate(selectedDate || new Date()).map((booking) => {
                        const service = services.find(s => s.id === booking.serviceId);
                        const bookingTime = new Date(booking.datetime);

                        return (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{service?.name}</h4>
                              <p className="text-gray-400 text-sm">
                                {bookingTime.toLocaleTimeString()} • {service?.duration}hrs
                              </p>
                              <p className="text-gray-400 text-sm">
                                Member: {booking.userId} • ${service?.pricePerSession}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-green-600' :
                                booking.status === 'pending' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}

                      {getBookingsForDate(selectedDate || new Date()).length === 0 && (
                        <p className="text-gray-400 text-center py-8">
                          No bookings for this date
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Service Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {services.map((service) => {
                        const serviceAnalytics = analytics?.[service.id];
                        return (
                          <div key={service.id} className="flex items-center justify-between">
                            <span className="text-white">{service.name}</span>
                            <div className="text-right">
                              <div className="text-white">{serviceAnalytics?.totalBookings || 0} bookings</div>
                              <div className="text-gray-400 text-sm">⭐ {service.rating || '0.0'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {services.map((service) => {
                        const serviceAnalytics = analytics?.[service.id];
                        return (
                          <div key={service.id} className="flex items-center justify-between">
                            <span className="text-white">{service.name}</span>
                            <div className="text-right">
                              <div className="text-white">${serviceAnalytics?.totalRevenue?.toLocaleString() || 0}</div>
                              <div className="text-gray-400 text-sm">${service.pricePerSession}/session</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Booking Requests Tab */}
            <TabsContent value="requests" className="mt-6">
              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Pending Service Requests</CardTitle>
                  <CardDescription className="text-gray-300">
                    Review and manage service booking requests from members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => {
                      const service = services.find(s => s.id === booking.serviceId);
                      const bookingTime = new Date(booking.datetime);

                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{service?.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {bookingTime.toLocaleDateString()} • {bookingTime.toLocaleTimeString()}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Duration: {service?.duration}hrs • Payment: ${service?.pricePerSession}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Requested by Member #{booking.userId}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => acceptBookingMutation.mutate(booking.id)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={acceptBookingMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => declineBookingMutation.mutate(booking.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                              disabled={declineBookingMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingBookings.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        No pending service requests
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="bg-gray-800 border-purple-800/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Service</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update your service information and availability.
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
                        <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Price ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-gray-700 border-gray-600 text-white" />
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Available for bookings
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditServiceOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={updateServiceMutation.isPending}
                >
                  Update Service
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderDashboard;