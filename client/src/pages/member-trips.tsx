import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Star, MessageCircle, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Booking, ServiceBooking, EventRegistration, MediaAsset } from '@shared/schema';

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
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
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
                {/* Yacht Bookings */}
                {upcomingYachtBookings.map((booking, index) => (
                  <motion.div
                    key={`yacht-${booking.id}`}
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
                            <Badge className={`${getStatusColor(booking.status)} border`}>
                              {booking.status}
                            </Badge>
                          </div>
                          <ChevronRight className="text-gray-400" size={20} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-300">
                            <Calendar size={16} className="mr-2" />
                            <span className="text-sm">{formatDate(booking.startTime.toString())}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock size={16} className="mr-2" />
                            <span className="text-sm">{formatTime(booking.startTime.toString())}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Users size={16} className="mr-2" />
                            <span className="text-sm">Party booking</span>
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
                            Message Host
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl"
                          >
                            <Phone size={16} className="mr-2" />
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

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
                          <span className="text-sm">{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Users size={16} className="mr-2" />
                          <span className="text-sm">{booking.guestCount} guests</span>
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