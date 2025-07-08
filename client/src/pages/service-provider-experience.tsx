import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Users, Star, Download, Phone, MessageSquare, Eye, StarIcon, AlertCircle, CheckCircle, Timer, Coffee, Sparkles, Heart, Crown, Zap, TrendingUp, DollarSign, Activity, Award, Briefcase, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MediaAsset } from '@shared/schema';

interface ServiceProviderExperienceProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function ServiceProviderExperience({ currentView, setCurrentView }: ServiceProviderExperienceProps) {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  // Fetch hero video
  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  // Fetch service provider bookings
  const { data: providerBookings = [], isLoading } = useQuery({
    queryKey: ["/api/service-provider/bookings"],
    refetchInterval: 30000, // Real-time sync every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });

  // Fetch provider services
  const { data: providerServices = [] } = useQuery({
    queryKey: ["/api/service-provider/services"],
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Update booking status from provider side
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, notes }: { bookingId: number; status: string; notes?: string }) => {
      return await apiRequest('PUT', `/api/service-provider/bookings/${bookingId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-provider/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Status Updated",
        description: "Service booking status updated successfully",
      });
    }
  });

  // Service delivery update mutation
  const serviceDeliveryMutation = useMutation({
    mutationFn: async ({ bookingId, phase, notes, deliveryDetails }: { bookingId: number; phase: string; notes?: string; deliveryDetails?: any }) => {
      return await apiRequest('POST', `/api/service-provider/bookings/${bookingId}/delivery`, { phase, notes, deliveryDetails });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-provider/bookings'] });
      toast({
        title: "Delivery Updated",
        description: "Service delivery information updated",
      });
    }
  });

  // Get filtered bookings
  const filteredBookings = providerBookings.filter((booking: any) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;
    if (phaseFilter !== "all" && getServicePhase(booking) !== phaseFilter) return false;
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
  function getServicePhase(booking: any) {
    const now = new Date();
    const scheduledDate = new Date(booking.scheduledDate);
    const serviceEnd = new Date(scheduledDate.getTime() + (booking.service?.duration || 2) * 60 * 60 * 1000);

    if (booking.status === 'completed') return 'after';
    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.status === 'in_progress' || (now >= scheduledDate && now <= serviceEnd)) return 'during';
    if (now < scheduledDate) return 'before';
    return 'after';
  }

  // Service Provider Experience Management
  const ServiceProviderExperienceDialog = ({ booking }: { booking: any }) => {
    const [newStatus, setNewStatus] = useState(booking.status);
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [preparationNotes, setPreparationNotes] = useState("");
    const phase = getServicePhase(booking);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-600 text-purple-400 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Manage Service
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-gradient-animate">Service Provider Experience Management</DialogTitle>
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
                      <p className="text-sm text-gray-400">{booking.user?.username || 'Unknown'}</p>
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
                      <h3 className="font-semibold text-white">Payment</h3>
                      <p className="text-sm text-gray-400">${booking.totalPrice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Delivery Experience Timeline */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Service Delivery Experience</h3>
              
              <div className="space-y-4">
                {/* Before Service - Preparation Phase */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'before' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'before' ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Preparation Phase</h4>
                      {phase === 'before' && <Badge className="bg-yellow-500 text-black">Active</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Prepare for service delivery</p>
                    
                    {phase === 'before' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Scheduled:</span>
                            <span className="text-white ml-2">{format(new Date(booking.scheduledDate), 'PPP p')}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-2">{booking.service?.duration || 2} hours</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <h5 className="font-medium text-white mb-2">Preparation Checklist</h5>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Review member requirements: {booking.specialRequests || 'None specified'}</li>
                            <li>• Prepare materials and equipment</li>
                            <li>• Confirm arrival time and location</li>
                            <li>• Contact member if needed</li>
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed', notes: preparationNotes })}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                          >
                            Confirm Ready
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled', notes: preparationNotes })}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            Cancel Service
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* During Service - Delivery Phase */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'during' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'during' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Service Delivery</h4>
                      {phase === 'during' && <Badge className="bg-blue-500 text-white">In Progress</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Active service delivery to member</p>
                    
                    {phase === 'during' && (
                      <div className="space-y-3">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                          <h5 className="font-medium text-white mb-2">Service in Progress</h5>
                          <p className="text-sm text-gray-300">Ensure high-quality service delivery and member satisfaction</p>
                        </div>
                        
                        <Textarea
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Add delivery notes or updates..."
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none h-20"
                        />
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => serviceDeliveryMutation.mutate({ bookingId: booking.id, phase: 'during', notes: deliveryNotes })}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Update Progress
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: 'completed', notes: deliveryNotes })}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Service
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* After Service - Completion Phase */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${phase === 'after' ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${phase === 'after' ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Service Completed</h4>
                      {phase === 'after' && <Badge className="bg-green-500 text-white">Completed</Badge>}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Service delivery completed successfully</p>
                    
                    {phase === 'after' && (
                      <div className="space-y-3">
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                          <h5 className="font-medium text-white mb-2">Service Summary</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Completed:</span>
                              <span className="text-white ml-2">{booking.completedAt ? format(new Date(booking.completedAt), 'PPP p') : 'Recently'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Member Rating:</span>
                              <span className="text-white ml-2">
                                {booking.rating ? (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    {booking.rating}/5
                                  </span>
                                ) : (
                                  'Pending'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {booking.review && (
                          <div className="bg-gray-700/50 rounded-lg p-3">
                            <h5 className="font-medium text-white mb-2">Member Review</h5>
                            <p className="text-sm text-gray-300">"{booking.review}"</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => serviceDeliveryMutation.mutate({ bookingId: booking.id, phase: 'after', notes: 'Follow-up with member' })}
                            size="sm"
                            variant="outline"
                            className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Follow Up
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-600/20"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Actions */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Provider Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Status</label>
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
                  <label className="block text-sm font-medium mb-2">Service Notes</label>
                  <Textarea
                    value={preparationNotes}
                    onChange={(e) => setPreparationNotes(e.target.value)}
                    placeholder="Add service notes or updates..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => updateBookingStatusMutation.mutate({ bookingId: booking.id, status: newStatus, notes: preparationNotes })}
                  disabled={newStatus === booking.status}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Update Status
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Member
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
            Service Delivery Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Manage your service delivery experience with real-time member sync
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-6 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{providerBookings.length}</div>
              <div className="text-sm text-gray-300">Total Bookings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {providerBookings.filter((b: any) => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {providerBookings.length > 0 ? (
                  providerBookings.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / providerBookings.filter((b: any) => b.rating).length || 0
                ).toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-300">Avg Rating</div>
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

          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by Phase" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Phases</SelectItem>
              <SelectItem value="before">Before Service</SelectItem>
              <SelectItem value="during">During Service</SelectItem>
              <SelectItem value="after">After Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Delivery Cards */}
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Member</p>
                      <p className="text-white font-semibold">{booking.user?.username || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Scheduled</p>
                      <p className="text-white font-semibold">{format(new Date(booking.scheduledDate), 'PPP p')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Payment</p>
                      <p className="text-white font-semibold">${booking.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rating</p>
                      <p className="text-white font-semibold">
                        {booking.rating ? (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {booking.rating}/5
                          </span>
                        ) : (
                          'Pending'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <ServiceProviderExperienceDialog booking={booking} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {providerBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-300">No Service Bookings</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You don't have any service bookings yet. Member bookings will appear here for you to manage the complete service experience.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}