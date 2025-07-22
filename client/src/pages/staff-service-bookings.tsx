import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CalendarDays, Search, Filter, MoreVertical, Calendar, DollarSign, User, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ServiceBooking {
  id: number;
  memberId: number;
  serviceId: number;
  bookingDate: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: string;
  guests: number;
  specialRequests?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  member?: {
    username: string;
    email: string;
    fullName: string;
  };
  service?: {
    name: string;
    category: string;
    provider: string;
    price: number;
  };
}

interface ServiceBookingFilters {
  status: string;
  category: string;
  deliveryType: string;
  dateRange: string;
  search: string;
}

const StaffServiceBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ServiceBookingFilters>({
    status: "all",
    category: "all", 
    deliveryType: "all",
    dateRange: "all",
    search: ""
  });

  // Query for service bookings with real-time sync
  const { data: serviceBookings = [], isLoading } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/staff/service-bookings-management'],
    refetchInterval: 30000, // 30-second refresh for real-time sync
    refetchOnWindowFocus: true,
  });

  // Update service booking status mutation
  const updateServiceBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/staff/service-bookings-management/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/service-bookings-management'] });
      toast({
        title: "Status Updated",
        description: "Service booking status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update service booking status.",
        variant: "destructive",
      });
    },
  });

  // Filter and search service bookings
  const filteredServiceBookings = useMemo(() => {
    let filtered = [...serviceBookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((booking: ServiceBooking) =>
        booking.member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.member?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((booking: ServiceBooking) => booking.status === filters.status);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((booking: ServiceBooking) => booking.service?.category === filters.category);
    }

    // Delivery type filter
    if (filters.deliveryType !== "all") {
      filtered = filtered.filter((booking: ServiceBooking) => booking.deliveryType === filters.deliveryType);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const bookingDate = new Date();
      
      switch (filters.dateRange) {
        case "today":
          bookingDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((booking: ServiceBooking) => {
            const bDate = new Date(booking.deliveryDate);
            bDate.setHours(0, 0, 0, 0);
            return bDate.getTime() === bookingDate.getTime();
          });
          break;
        case "week":
          bookingDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((booking: ServiceBooking) => 
            new Date(booking.deliveryDate) >= bookingDate
          );
          break;
        case "month":
          bookingDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((booking: ServiceBooking) => 
            new Date(booking.deliveryDate) >= bookingDate
          );
          break;
        case "upcoming":
          filtered = filtered.filter((booking: ServiceBooking) => 
            new Date(booking.deliveryDate) >= now
          );
          break;
      }
    }

    return filtered;
  }, [serviceBookings, searchTerm, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateServiceBookingMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            Manage premium yacht concierge service bookings
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Bookings
                {(filters.status !== "all" || filters.category !== "all" || 
                  filters.deliveryType !== "all" || filters.dateRange !== "all") && (
                  <Badge className="ml-2 bg-purple-500 text-white text-xs">
                    {Object.values(filters).filter(v => v !== "all" && v !== "").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Service Bookings</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      status: "all",
                      category: "all",
                      deliveryType: "all",
                      dateRange: "all",
                      search: ""
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Service Category</Label>
                    <Select value={filters.category} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Categories</SelectItem>
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
                    <Label className="text-gray-300 text-sm">Delivery Type</Label>
                    <Select value={filters.deliveryType} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, deliveryType: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="yacht">On Yacht</SelectItem>
                        <SelectItem value="marina">At Marina</SelectItem>
                        <SelectItem value="location">Custom Location</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Date Range</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, dateRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredServiceBookings.length} of {(serviceBookings as ServiceBooking[]).length} bookings
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by member name or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Service Bookings Grid */}
      <div className="grid gap-6">
        {filteredServiceBookings.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No service bookings found</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || Object.values(filters).some(v => v !== "all" && v !== "") 
                  ? "No bookings match your current filter criteria."
                  : "Service bookings will appear here when members book premium services."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServiceBookings.map((booking: ServiceBooking, index: number) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-white text-lg">
                          {booking.service?.name || 'Unknown Service'}
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          {booking.service?.category || 'General'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-600">
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Mark Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="text-green-400 hover:text-green-300"
                            >
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300"
                            >
                              Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">Member</span>
                        </div>
                        <span className="text-white font-medium">
                          {booking.member?.fullName || booking.member?.username || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">Delivery</span>
                        </div>
                        <span className="text-white font-medium">
                          {new Date(booking.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">Time</span>
                        </div>
                        <span className="text-white font-medium">
                          {booking.deliveryTime || 'TBD'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">Type</span>
                        </div>
                        <span className="text-white font-medium">
                          {booking.deliveryType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Standard'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">Amount</span>
                        </div>
                        <span className="text-white font-bold">
                          ${booking.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-gray-300 text-sm">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffServiceBookings;