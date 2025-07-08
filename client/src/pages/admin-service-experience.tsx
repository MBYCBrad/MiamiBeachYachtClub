import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Users, Star, Download, Phone, MessageSquare, Eye, StarIcon, AlertCircle, CheckCircle, Timer, Coffee, Sparkles, Heart, Crown, Zap, TrendingUp, DollarSign, Activity, Award } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MediaAsset } from '@shared/schema';

interface AdminServiceExperienceProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function AdminServiceExperience({ currentView, setCurrentView }: AdminServiceExperienceProps) {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  // Fetch hero video
  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  // Fetch all service bookings (admin view)
  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/service-bookings"],
    refetchInterval: 30000, // Real-time sync every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });

  // Fetch all services for provider info
  const { data: allServices = [] } = useQuery({
    queryKey: ["/api/services"],
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Fetch all users for member info
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      return await apiRequest('PUT', `/api/admin/service-bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Status Updated",
        description: "Service booking status updated successfully",
      });
    }
  });

  // Admin intervention mutation
  const adminInterventionMutation = useMutation({
    mutationFn: async ({ bookingId, action, notes }: { bookingId: number; action: string; notes?: string }) => {
      return await apiRequest('POST', `/api/admin/service-bookings/${bookingId}/intervention`, { action, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-bookings'] });
      toast({
        title: "Intervention Recorded",
        description: "Admin intervention has been logged",
      });
    }
  });

  // Get filtered bookings
  const filteredBookings = allBookings.filter((booking: any) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;
    if (providerFilter !== "all" && booking.service?.providerId?.toString() !== providerFilter) return false;
    return true;
  });

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'beauty & grooming': return '💄';
      case 'culinary': return '🍽️';
      case 'wellness & spa': return '🧘';
      case 'photography & media': return '📸';
      case 'entertainment': return '🎵';
      case 'water sports': return '🏄';
      case 'concierge & lifestyle': return '🎩';
      default: return '⭐';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-gradient-to-r from-green-600 to-green-500';
      case 'pending': return 'bg-gradient-to-r from-yellow-600 to-yellow-500';
      case 'completed': return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'cancelled': return 'bg-gradient-to-r from-red-600 to-red-500';
      case 'in_progress': return 'bg-gradient-to-r from-blue-600 to-blue-500';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-500';
    }
  };

  // Get service experience phase
  const getServicePhase = (booking: any) => {
    const now = new Date();
    const scheduledDate = new Date(booking.scheduledDate);
    const serviceEnd = new Date(scheduledDate.getTime() + (booking.service?.duration || 2) * 60 * 60 * 1000);

    if (booking.status === 'completed') return 'after';
    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.status === 'in_progress' || (now >= scheduledDate && now <= serviceEnd)) return 'during';
    if (now < scheduledDate) return 'before';
    return 'after';
  };

  // Admin Service Experience Dashboard
  const AdminServiceExperienceDialog = ({ booking }: { booking: any }) => {
    const [newStatus, setNewStatus] = useState(booking.status);
    const [interventionNotes, setInterventionNotes] = useState("");
    const phase = getServicePhase(booking);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-600 text-purple-400 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage Experience
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-gradient-animate">Admin Service Experience Management</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Service Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-xl">
                      {getCategoryIcon(booking.service?.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{booking.service?.name}</h3>
                      <p className="text-sm text-gray-400">{booking.service?.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Member</h3>
                      <p className="text-sm text-gray-400">{booking.member?.username || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Revenue</h3>
                      <p className="text-sm text-gray-400">${booking.totalPrice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Experience Timeline */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Service Experience Timeline</h3>
              
              <div className="space-y-4">
                {/* Before Service */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'before' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'before' ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Before Service</h4>
                      {phase === 'before' && <Badge className="bg-yellow-500 text-black">Current Phase</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">Service confirmed and scheduled</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Booked:</span>
                        <span className="text-white ml-2">{format(new Date(booking.bookingDate), 'PPP')}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Scheduled:</span>
                        <span className="text-white ml-2">{format(new Date(booking.scheduledDate), 'PPP p')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* During Service */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'during' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'during' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">During Service</h4>
                      {phase === 'during' && <Badge className="bg-blue-500 text-white">Current Phase</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">Service delivery in progress</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">{booking.service?.duration || 2} hours</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white ml-2">{booking.service?.provider?.username || 'MBYC Staff'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* After Service */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'after' ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'after' ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">After Service</h4>
                      {phase === 'after' && <Badge className="bg-green-500 text-white">Current Phase</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {booking.status === 'completed' ? 'Service completed successfully' : 'Service completion pending'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Rating:</span>
                        <span className="text-white ml-2">{booking.rating ? `${booking.rating}/5 stars` : 'Not rated'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Review:</span>
                        <span className="text-white ml-2">{booking.review ? 'Provided' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Admin Controls</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <Textarea
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    placeholder="Add admin notes or intervention details..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: newStatus })}
                  disabled={newStatus === booking.status}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Update Status
                </Button>
                
                <Button 
                  onClick={() => adminInterventionMutation.mutate({ bookingId: booking.id, action: 'quality_check', notes: interventionNotes })}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Quality Check
                </Button>
                
                <Button 
                  onClick={() => adminInterventionMutation.mutate({ bookingId: booking.id, action: 'escalation', notes: interventionNotes })}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Escalate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Video Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          {heroVideo?.url && (
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideo.url} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gradient-animate mb-4"
          >
            Service Experience Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Comprehensive service experience management with real-time sync
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-6 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{allBookings.length}</div>
              <div className="text-sm text-gray-300">Total Bookings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {allBookings.filter((b: any) => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                ${allBookings.reduce((sum: number, booking: any) => sum + parseFloat(booking.totalPrice || '0'), 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-300">Total Revenue</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by Provider" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="60">MBYC Staff</SelectItem>
              {Array.from(new Set(allBookings.map((b: any) => b.service?.providerId))).filter(id => id && id !== 60).map((providerId: any) => (
                <SelectItem key={providerId} value={providerId.toString()}>
                  {allUsers.find((u: any) => u.id === providerId)?.username || `Provider ${providerId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Experience Cards */}
        <div className="space-y-6">
          {filteredBookings.map((booking: any, index: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-600/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
                        {getCategoryIcon(booking.service?.category)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{booking.service?.name}</h3>
                        <p className="text-gray-400">{booking.service?.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                        {booking.status}
                      </Badge>
                      <Badge variant="outline" className="border-purple-600 text-purple-400">
                        {getServicePhase(booking)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Member</p>
                      <p className="text-white font-semibold">{booking.member?.username || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Scheduled</p>
                      <p className="text-white font-semibold">{format(new Date(booking.scheduledDate), 'PPP p')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Revenue</p>
                      <p className="text-white font-semibold">${booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <AdminServiceExperienceDialog booking={booking} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}