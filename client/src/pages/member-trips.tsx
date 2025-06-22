import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Star, MessageCircle, Phone, ChevronRight, Sparkles, DollarSign, MessageSquare, MoreHorizontal, Scissors, UtensilsCrossed, Camera, Waves, Music, Heart, Dumbbell, Coffee, Send, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Booking, ServiceBooking, EventRegistration, MediaAsset, Yacht, Service } from '@shared/schema';

interface MemberTripsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberTrips({ currentView, setCurrentView }: MemberTripsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [captainMessage, setCaptainMessage] = useState('');
  const [marinaMessage, setMarinaMessage] = useState('');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState<'captain' | 'marina'>('captain');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const { data: yachtBookings = [], isLoading: yachtLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings', { status: 'confirmed' }]
  });

  const { data: serviceBookings = [], isLoading: serviceLoading } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/service-bookings', { status: 'confirmed' }]
  });

  const { data: eventRegistrations = [], isLoading: eventLoading } = useQuery<EventRegistration[]>({
    queryKey: ['/api/event-registrations', { status: 'confirmed' }]
  });

  // Fetch yacht details for comprehensive display
  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts']
  });

  // Fetch service details for service breakdown
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  // Helper function to get yacht details by ID
  const getYachtById = (yachtId: number | null) => {
    if (!yachtId) return null;
    return yachts.find(yacht => yacht.id === yachtId);
  };

  // Helper function to get service details by ID
  const getServiceById = (serviceId: number | null) => {
    if (!serviceId) return null;
    return services.find(service => service.id === serviceId);
  };

  // Helper function to get services for a user on the same day as booking
  const getServicesForBooking = (booking: Booking) => {
    const bookingDate = new Date(booking.startTime).toDateString();
    return serviceBookings.filter(sb => 
      sb.userId === booking.userId && 
      new Date(sb.bookingDate).toDateString() === bookingDate
    );
  };

  // Service category icons mapping
  const getServiceIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Beauty & Grooming': Scissors,
      'Culinary': UtensilsCrossed,
      'Wellness & Spa': Heart,
      'Photography & Media': Camera,
      'Entertainment': Music,
      'Water Sports': Waves,
      'Concierge & Lifestyle': Coffee
    };
    return iconMap[category] || Coffee;
  };

  // Message Captain mutation
  const messageCaptainMutation = useMutation({
    mutationFn: async ({ bookingId, message }: { bookingId: number; message: string }) => {
      const response = await apiRequest('POST', '/api/concierge', {
        message: `CAPTAIN MESSAGE for Booking #${bookingId}: ${message}`,
        priority: 'high',
        category: 'yacht_booking'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the captain successfully",
      });
      setIsMessageDialogOpen(false);
      setCaptainMessage('');
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Contact Marina mutation
  const contactMarinaMutation = useMutation({
    mutationFn: async ({ bookingId, message }: { bookingId: number; message: string }) => {
      const response = await apiRequest('POST', '/api/concierge', {
        message: `MARINA CONTACT for Booking #${bookingId}: ${message}`,
        priority: 'medium',
        category: 'yacht_booking'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Marina Contacted",
        description: "Your message has been sent to the marina successfully",
      });
      setIsMessageDialogOpen(false);
      setMarinaMessage('');
    },
    onError: () => {
      toast({
        title: "Contact Failed",
        description: "Failed to contact marina. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!selectedBooking) return;
    
    const message = messageType === 'captain' ? captainMessage : marinaMessage;
    if (!message.trim()) return;

    if (messageType === 'captain') {
      messageCaptainMutation.mutate({ bookingId: selectedBooking.id, message });
    } else {
      contactMarinaMutation.mutate({ bookingId: selectedBooking.id, message });
    }
  };

  const openMessageDialog = (booking: Booking, type: 'captain' | 'marina') => {
    setSelectedBooking(booking);
    setMessageType(type);
    setIsMessageDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const upcomingYachtBookings = yachtBookings.filter(booking => isUpcoming(booking.startTime));
  const pastYachtBookings = yachtBookings.filter(booking => !isUpcoming(booking.startTime));
  
  const upcomingServiceBookings = serviceBookings.filter(booking => 
    booking.bookingDate && isUpcoming(booking.bookingDate)
  );
  const pastServiceBookings = serviceBookings.filter(booking => 
    booking.bookingDate && !isUpcoming(booking.bookingDate)
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Video Cover Header */}
      <div className="relative h-96 overflow-hidden">
        {/* Hero Video Background */}
        {heroVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

        {/* Header Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gradient-animate mb-4"
          >
            Your Trips
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Manage your yacht bookings and exclusive experiences
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{upcomingYachtBookings.length}</div>
              <div className="text-sm text-gray-300">Upcoming Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{pastYachtBookings.length}</div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 rounded-xl">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {(yachtLoading || serviceLoading || eventLoading) ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl h-32 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Enhanced Yacht Bookings with Comprehensive Details */}
                {upcomingYachtBookings.map((booking, index) => {
                  const yacht = getYachtById(booking.yachtId);
                  const bookingServices = getServicesForBooking(booking);
                  const servicesTotal = bookingServices.reduce((sum, sb) => sum + parseFloat(sb.totalPrice || '0'), 0);
                  
                  return (
                    <motion.div
                      key={`yacht-${booking.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="mb-6"
                    >
                      <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-0">
                          {/* Enhanced Header with Yacht Image */}
                          <div className="relative h-48 bg-gradient-to-r from-purple-900 to-blue-900">
                            <div className="absolute inset-0 bg-black/40"></div>
                            <img 
                              src={yacht?.imageUrl || "/api/media/pexels-mali-42092_1750537277229.jpg"}
                              alt={yacht?.name || "Yacht"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                              <Badge className="bg-green-600/30 text-green-300 border border-green-500/50 backdrop-blur-sm">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <h3 className="text-2xl font-bold text-white mb-1">{yacht?.name || "Luxury Yacht"}</h3>
                              <p className="text-blue-200 text-sm">{yacht?.size}ft • Luxury Yacht • Booking #{booking.id}</p>
                            </div>
                          </div>

                          <div className="p-6">
                            {/* Trip Details Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-purple-600/20 rounded-lg">
                                    <Calendar size={18} className="text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-sm">Date</p>
                                    <p className="text-white font-semibold">{formatDate(booking.startTime.toString())}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-600/20 rounded-lg">
                                    <Clock size={18} className="text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-sm">Time</p>
                                    <p className="text-white font-semibold">{formatTime(booking.startTime.toString())} - {formatTime(booking.endTime.toString())}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-cyan-600/20 rounded-lg">
                                    <Users size={18} className="text-cyan-400" />
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-sm">Guests</p>
                                    <p className="text-white font-semibold">{booking.guestCount} people</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-green-600/20 rounded-lg">
                                    <DollarSign size={18} className="text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-sm">Yacht Cost</p>
                                    <p className="text-green-400 font-bold text-lg">FREE</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Yacht Specifications */}
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                                <Waves className="mr-2 text-blue-400" size={20} />
                                Yacht Specifications
                              </h4>
                              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/20">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{yacht?.size}ft</p>
                                    <p className="text-gray-400 text-sm">Length</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-cyan-400">{yacht?.capacity}</p>
                                    <p className="text-gray-400 text-sm">Max Capacity</p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <p className="text-white text-center"><span className="text-gray-400">Type:</span> Luxury Yacht</p>
                                  {yacht?.location && <p className="text-white text-center mt-1"><span className="text-gray-400">Location:</span> {yacht.location}</p>}
                                </div>
                              </div>
                            </div>

                            {/* Concierge Services Section - Only show if services exist */}
                            {bookingServices.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                                  <Sparkles className="mr-2 text-yellow-400" size={20} />
                                  Concierge Services Added
                                </h4>
                                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20">
                                  <div className="grid grid-cols-1 gap-3">
                                    {bookingServices.map((serviceBooking) => {
                                      const service = getServiceById(serviceBooking.serviceId);
                                      const ServiceIcon = service && service.category ? getServiceIcon(service.category) : Coffee;
                                      
                                      return (
                                        <div key={serviceBooking.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                          <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                              <ServiceIcon size={16} className="text-purple-400" />
                                            </div>
                                            <div>
                                              <p className="text-white font-medium">{service?.name || "Premium Service"}</p>
                                              <p className="text-gray-400 text-sm">{service?.category || "Concierge"}</p>
                                            </div>
                                          </div>
                                          <p className="text-green-400 font-semibold">${parseFloat(serviceBooking.totalPrice || '0').toFixed(0)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="flex justify-between items-center">
                                      <p className="text-white font-semibold">Services Total:</p>
                                      <p className="text-green-400 font-bold text-lg">${servicesTotal.toFixed(0)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Special Requests */}
                            {booking.specialRequests && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                                  <MessageSquare className="mr-2 text-blue-400" size={18} />
                                  Special Requests
                                </h4>
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                  <p className="text-blue-200">{booking.specialRequests}</p>
                                </div>
                              </div>
                            )}

                            {/* Enhanced Action Center */}
                            <div className="space-y-4">
                              <div className="flex space-x-3">
                                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => openMessageDialog(booking, 'captain')}
                                      className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-blue-400 border border-blue-500/30 rounded-xl flex-1 h-12 transition-all duration-300 hover:scale-105"
                                    >
                                      <MessageCircle size={18} className="mr-2" />
                                      <div className="text-left">
                                        <div className="font-semibold">Message Captain</div>
                                        <div className="text-xs text-blue-300">Direct communication</div>
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => openMessageDialog(booking, 'marina')}
                                      className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 text-green-400 border border-green-500/30 rounded-xl flex-1 h-12 transition-all duration-300 hover:scale-105"
                                    >
                                      <Phone size={18} className="mr-2" />
                                      <div className="text-left">
                                        <div className="font-semibold">Contact Marina</div>
                                        <div className="text-xs text-green-300">Marina services</div>
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button
                                  className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-400 border border-purple-500/30 rounded-xl flex-1 h-10 transition-all duration-300 hover:scale-105"
                                >
                                  <Headphones size={16} className="mr-2" />
                                  24/7 Concierge
                                </Button>
                                <Button
                                  className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 hover:from-orange-600/30 hover:to-yellow-600/30 text-orange-400 border border-orange-500/30 rounded-xl flex-1 h-10 transition-all duration-300 hover:scale-105"
                                >
                                  <Star size={16} className="mr-2" />
                                  Rate Experience
                                </Button>
                                <Button
                                  className="bg-gradient-to-r from-gray-600/20 to-slate-600/20 hover:from-gray-600/30 hover:to-slate-600/30 text-gray-400 border border-gray-500/30 rounded-xl h-10 px-3 transition-all duration-300 hover:scale-105"
                                >
                                  <MoreHorizontal size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* No upcoming trips */}
                {upcomingYachtBookings.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No upcoming trips</h3>
                    <p className="text-gray-500 mb-6">Book your next luxury yacht experience</p>
                    <Button
                      onClick={() => setCurrentView('explore')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl px-8"
                    >
                      Explore Yachts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="space-y-4">
              {/* Past Yacht Bookings */}
              {pastYachtBookings.map((booking, index) => (
                <motion.div
                  key={`past-yacht-${booking.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Yacht Booking #{booking.id}
                          </h3>
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border">
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-sm text-gray-300">Rate Experience</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-300">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm">{formatDate(booking.startTime.toString())}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Users size={16} className="mr-2" />
                          <span className="text-sm">Private booking</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 rounded-xl"
                        >
                          <Star size={16} className="mr-2" />
                          Leave Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
                        >
                          Book Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* No past trips */}
              {pastYachtBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No past trips</h3>
                  <p className="text-gray-500">Your completed bookings will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Messaging Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="bg-gray-900/95 border-gray-800 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-3">
              {messageType === 'captain' ? (
                <>
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <MessageCircle className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <div className="font-bold">Message Captain</div>
                    <div className="text-sm text-gray-400">Direct communication with your yacht captain</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Phone className="text-green-400" size={20} />
                  </div>
                  <div>
                    <div className="font-bold">Contact Marina</div>
                    <div className="text-sm text-gray-400">Reach out to marina services and support</div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {selectedBooking && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedBooking.yachtId === 1 ? 'MB' : 'YC'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Marina Breeze</div>
                    <div className="text-gray-400 text-sm">Booking #{selectedBooking.id}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-white font-medium">Your Message</label>
              <Textarea
                value={messageType === 'captain' ? captainMessage : marinaMessage}
                onChange={(e) => messageType === 'captain' ? setCaptainMessage(e.target.value) : setMarinaMessage(e.target.value)}
                placeholder={
                  messageType === 'captain' 
                    ? "Send a message to your yacht captain..."
                    : "Contact the marina about your booking..."
                }
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 min-h-[120px] rounded-lg resize-none"
                rows={5}
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleSendMessage}
                disabled={
                  !(messageType === 'captain' ? captainMessage.trim() : marinaMessage.trim()) ||
                  messageCaptainMutation.isPending ||
                  contactMarinaMutation.isPending
                }
                className={`
                  ${messageType === 'captain' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  } 
                  text-white border-0 rounded-xl flex-1 h-12 font-semibold transition-all duration-300
                `}
              >
                {(messageCaptainMutation.isPending || contactMarinaMutation.isPending) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send size={18} />
                    <span>Send Message</span>
                  </div>
                )}
              </Button>
              
              <Button
                onClick={() => setIsMessageDialogOpen(false)}
                className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-700 rounded-xl px-6 h-12"
              >
                Cancel
              </Button>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Sparkles className="text-purple-400 mt-0.5" size={16} />
                <div className="text-sm">
                  <div className="text-purple-300 font-medium">Premium Concierge Service</div>
                  <div className="text-purple-400/80 text-xs mt-1">
                    Your message will be delivered instantly via our luxury concierge service. 
                    Response typically within 15 minutes during business hours.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}