import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Star, MessageCircle, Phone, ChevronRight, Sparkles, DollarSign, MessageSquare, MoreHorizontal, Scissors, UtensilsCrossed, Camera, Waves, Music, Heart, Dumbbell, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Booking, ServiceBooking, EventRegistration, MediaAsset, Yacht, Service } from '@shared/schema';

interface MemberTripsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberTrips({ currentView, setCurrentView }: MemberTripsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

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

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                              <Button
                                size="sm"
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-xl flex-1"
                              >
                                <MessageCircle size={16} className="mr-2" />
                                Message Captain
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl flex-1"
                              >
                                <Phone size={16} className="mr-2" />
                                Contact Marina
                              </Button>
                              <Button
                                size="sm"
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-xl"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Service Bookings */}
                {upcomingServiceBookings.map((booking, index) => (
                  <motion.div
                    key={`service-${booking.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (upcomingYachtBookings.length + index) * 0.1 }}
                  >
                    <Card className="bg-gray-900/50 border-gray-800 hover-lift">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              Service Booking #{booking.id}
                            </h3>
                            <Badge className={`${getStatusColor(booking.status)} border`}>
                              {booking.status}
                            </Badge>
                          </div>
                          <ChevronRight className="text-gray-400" size={20} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-300">
                            <Calendar size={16} className="mr-2" />
                            <span className="text-sm">
                              {booking.bookingDate ? formatDate(booking.bookingDate.toString()) : 'TBD'}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <span className="text-sm font-semibold">
                              ${booking.totalPrice ? parseFloat(booking.totalPrice).toLocaleString() : 'TBD'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            size="sm"
                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-xl"
                          >
                            <MessageCircle size={16} className="mr-2" />
                            Message Provider
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* No upcoming trips */}
                {upcomingYachtBookings.length === 0 && upcomingServiceBookings.length === 0 && (
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

              {/* Past Service Bookings */}
              {pastServiceBookings.map((booking, index) => (
                <motion.div
                  key={`past-service-${booking.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (pastYachtBookings.length + index) * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Service Booking #{booking.id}
                          </h3>
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border">
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-sm text-gray-300">Rate Service</span>
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* No past trips */}
              {pastYachtBookings.length === 0 && pastServiceBookings.length === 0 && (
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
    </div>
  );
}