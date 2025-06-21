import React, { useState, useEffect } from 'react';
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
import YachtCard from '@/components/yacht-card';
import { 
  Anchor, 
  Plus, 
  Edit, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin,
  Camera,
  CheckCircle,
  XCircle,
  Bell,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertYachtSchema, type Yacht, type Booking, type User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

type YachtFormData = z.infer<typeof insertYachtSchema>;

interface YachtAnalytics {
  totalBookings: number;
  totalHours: number;
  utilization: number;
  revenue: number;
  monthlyStats: Array<{
    month: string;
    bookings: number;
    hours: number;
    revenue: number;
  }>;
}

const YachtOwnerDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [isAddYachtOpen, setIsAddYachtOpen] = useState(false);
  const [isEditYachtOpen, setIsEditYachtOpen] = useState(false);

  // Fetch owner's yachts
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts/owner', user?.id],
    enabled: !!user
  });

  // Fetch bookings for owner's yachts
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/owner', user?.id],
    enabled: !!user
  });

  // Fetch analytics data
  const { data: analytics } = useQuery<Record<number, YachtAnalytics>>({
    queryKey: ['/api/analytics/owner', user?.id],
    enabled: !!user
  });

  // Fetch pending approval requests
  const { data: pendingBookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/pending', user?.id],
    enabled: !!user
  });

  const form = useForm<YachtFormData>({
    resolver: zodResolver(insertYachtSchema),
    defaultValues: {
      name: '',
      size: 50,
      capacity: 8,
      description: '',
      imageUrl: '',
      location: 'Miami Beach Marina',
      amenities: [],
      pricePerHour: '0',
      isAvailable: true
    }
  });

  // Add new yacht mutation
  const addYachtMutation = useMutation({
    mutationFn: async (data: YachtFormData) => {
      const response = await apiRequest('POST', '/api/yachts', {
        ...data,
        ownerId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yachts/owner'] });
      setIsAddYachtOpen(false);
      form.reset();
      toast({
        title: "Yacht Added",
        description: "Your yacht has been successfully added to the fleet."
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

  // Update yacht mutation
  const updateYachtMutation = useMutation({
    mutationFn: async (data: Partial<YachtFormData> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/yachts/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yachts/owner'] });
      setIsEditYachtOpen(false);
      setSelectedYacht(null);
      toast({
        title: "Yacht Updated",
        description: "Your yacht information has been updated."
      });
    }
  });

  // Approve/Reject booking mutations
  const approveBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('PUT', `/api/bookings/${bookingId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Approved",
        description: "The booking has been approved and the member has been notified."
      });
    }
  });

  const rejectBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('PUT', `/api/bookings/${bookingId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected and the member has been notified."
      });
    }
  });

  const onSubmit = (data: YachtFormData) => {
    if (selectedYacht) {
      updateYachtMutation.mutate({ ...data, id: selectedYacht.id });
    } else {
      addYachtMutation.mutate(data);
    }
  };

  const handleEditYacht = (yacht: Yacht) => {
    setSelectedYacht(yacht);
    form.reset({
      name: yacht.name,
      size: yacht.size,
      capacity: yacht.capacity,
      description: yacht.description || '',
      imageUrl: yacht.imageUrl || '',
      location: yacht.location,
      amenities: yacht.amenities || [],
      pricePerHour: yacht.pricePerHour || '0',
      isAvailable: yacht.isAvailable
    });
    setIsEditYachtOpen(true);
  };

  const getBookingsForYacht = (yachtId: number) => {
    return bookings.filter(booking => booking.yachtId === yachtId);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.startTime.toISOString().split('T')[0] === dateStr
    );
  };

  const totalFleetRevenue = yachts.reduce((total, yacht) => {
    const yachtAnalytics = analytics?.[yacht.id];
    return total + (yachtAnalytics?.revenue || 0);
  }, 0);

  const totalFleetBookings = yachts.reduce((total, yacht) => {
    const yachtBookings = getBookingsForYacht(yacht.id);
    return total + yachtBookings.length;
  }, 0);

  const averageUtilization = yachts.length > 0 ? 
    yachts.reduce((total, yacht) => total + (analytics?.[yacht.id]?.utilization || 0), 0) / yachts.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Anchor className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Yacht Owner Portal
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <span>Welcome, {user?.username}</span>
                <div className="text-xs text-gray-400">
                  {yachts.length} yacht{yachts.length !== 1 ? 's' : ''} in fleet
                </div>
              </div>

              {pendingBookings.length > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingBookings.length}
                  </span>
                </div>
              )}

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
          {/* Fleet Overview Cards */}
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Fleet</CardTitle>
                  <Anchor className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{yachts.length}</div>
                  <p className="text-xs text-gray-400">Active yachts</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalFleetBookings}</div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Utilization</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{averageUtilization.toFixed(1)}%</div>
                  <p className="text-xs text-gray-400">Average fleet</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Revenue Share</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${totalFleetRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="fleet" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-purple-800/30">
              <TabsTrigger 
                value="fleet"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <Anchor className="w-4 h-4 mr-2" />
                My Fleet
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
                <Bell className="w-4 h-4 mr-2" />
                Requests {pendingBookings.length > 0 && `(${pendingBookings.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Fleet Management Tab */}
            <TabsContent value="fleet" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Fleet Management</h2>
                <Dialog open={isAddYachtOpen} onOpenChange={setIsAddYachtOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Yacht
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-purple-800/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Yacht</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Add a new yacht to your fleet. All information can be updated later.
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
                                <FormLabel className="text-white">Yacht Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                <FormLabel className="text-white">Marina Location</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Miami Beach Marina">Miami Beach Marina</SelectItem>
                                    <SelectItem value="Star Island Marina">Star Island Marina</SelectItem>
                                    <SelectItem value="Bayfront Marina">Bayfront Marina</SelectItem>
                                    <SelectItem value="Fisher Island Marina">Fisher Island Marina</SelectItem>
                                    <SelectItem value="Key Biscayne Marina">Key Biscayne Marina</SelectItem>
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
                            name="size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Size (feet)</FormLabel>
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
                          <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Guest Capacity</FormLabel>
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
                                <Textarea {...field} value={field.value || ""} className="bg-gray-700 border-gray-600 text-white" />
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
                              <FormLabel className="text-white">Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="https://..." className="bg-gray-700 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddYachtOpen(false)}
                            className="border-gray-600 text-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                            disabled={addYachtMutation.isPending}
                          >
                            Add Yacht
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {yachts.map((yacht, index) => (
                  <YachtCard key={yacht.id} yacht={yacht} index={index} />
                ))}
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
                      onSelect={(date) => date && setSelectedDate(date)}
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
                        const yacht = yachts.find(y => y.id === booking.yachtId);
                        const startTime = new Date(booking.startTime);
                        const endTime = new Date(booking.endTime);

                        return (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{yacht?.name}</h4>
                              <p className="text-gray-400 text-sm">
                                {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Member: {booking.userId} • Status: {booking.status}
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
                    <CardTitle className="text-white flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Fleet Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {yachts.map((yacht) => {
                        const yachtAnalytics = analytics?.[yacht.id];
                        return (
                          <div key={yacht.id} className="flex items-center justify-between">
                            <span className="text-white">{yacht.name}</span>
                            <div className="text-right">
                              <div className="text-white">{yachtAnalytics?.utilization?.toFixed(1) || 0}%</div>
                              <div className="text-gray-400 text-sm">{yachtAnalytics?.totalBookings || 0} bookings</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {yachts.map((yacht) => {
                        const yachtAnalytics = analytics?.[yacht.id];
                        return (
                          <div key={yacht.id} className="flex items-center justify-between">
                            <span className="text-white">{yacht.name}</span>
                            <div className="text-right">
                              <div className="text-white">${yachtAnalytics?.revenue?.toLocaleString() || 0}</div>
                              <div className="text-gray-400 text-sm">{yachtAnalytics?.totalHours || 0} hours</div>
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
                  <CardTitle className="text-white">Pending Booking Requests</CardTitle>
                  <CardDescription className="text-gray-300">
                    Review and manage booking requests for your yachts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => {
                      const yacht = yachts.find(y => y.id === booking.yachtId);
                      const startTime = new Date(booking.startTime);
                      const endTime = new Date(booking.endTime);

                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{yacht?.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {startTime.toLocaleDateString()} • {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Requested by Member #{booking.userId}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveBookingMutation.mutate(booking.id)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveBookingMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectBookingMutation.mutate(booking.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                              disabled={rejectBookingMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingBookings.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        No pending booking requests
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Yacht Dialog */}
      <Dialog open={isEditYachtOpen} onOpenChange={setIsEditYachtOpen}>
        <DialogContent className="bg-gray-800 border-purple-800/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Yacht</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update your yacht information and availability.
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
                      <FormLabel className="text-white">Yacht Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                      <FormLabel className="text-white">Marina Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Miami Beach Marina">Miami Beach Marina</SelectItem>
                          <SelectItem value="Star Island Marina">Star Island Marina</SelectItem>
                          <SelectItem value="Bayfront Marina">Bayfront Marina</SelectItem>
                          <SelectItem value="Fisher Island Marina">Fisher Island Marina</SelectItem>
                          <SelectItem value="Key Biscayne Marina">Key Biscayne Marina</SelectItem>
                        </SelectContent>
                      </Select>
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
                        checked={field.value || false}
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
                  onClick={() => setIsEditYachtOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={updateYachtMutation.isPending}
                >
                  Update Yacht
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YachtOwnerDashboard;