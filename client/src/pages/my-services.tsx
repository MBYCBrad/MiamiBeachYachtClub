import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Star, Download, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ServiceBooking {
  id: number;
  serviceId: number;
  userId: number;
  bookingDate: string;
  scheduledDate: string;
  status: string;
  totalPrice: string;
  notes?: string;
  service: {
    id: number;
    name: string;
    description: string;
    price: string;
    duration: number;
    imageUrl?: string;
    category: string;
    providerId: number;
    provider?: {
      id: number;
      username: string;
      email: string;
      phone: string;
    };
  };
}

export default function MyServices() {
  const { data: serviceBookings, isLoading } = useQuery({
    queryKey: ["/api/service-bookings"],
  });

  const bookings = serviceBookings as ServiceBooking[] || [];

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'beauty & grooming':
        return '💄';
      case 'culinary':
        return '🍽️';
      case 'wellness & spa':
        return '🧘';
      case 'photography & media':
        return '📸';
      case 'entertainment':
        return '🎵';
      case 'water sports':
        return '🏄';
      case 'concierge & lifestyle':
        return '🎩';
      default:
        return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-purple-900/20 to-black">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Services
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track your service bookings and concierge experiences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-300">No Services Booked</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't booked any services yet. Explore our premium concierge services and enhance your yacht experience!
            </p>
            <Button
              onClick={() => window.location.href = '/member-home'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Services
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Services</p>
                        <p className="text-2xl font-bold text-white">{bookings.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-white">
                          {bookings.filter(booking => booking.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-white">
                          {bookings.filter(booking => ['confirmed', 'pending'].includes(booking.status)).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Spent</p>
                        <p className="text-2xl font-bold text-white">
                          ${bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Service Booking Cards */}
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-600/50 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Service Image */}
                        <div className="lg:w-1/3">
                          <div className="relative">
                            <img
                              src={booking.service.imageUrl || '/api/media/pexels-mali-42092_1750537277229.jpg'}
                              alt={booking.service.name}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                            />
                            <div className="absolute top-4 left-4">
                              <div className="text-2xl bg-black/50 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                                {getCategoryIcon(booking.service.category)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="lg:w-2/3 p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-2">
                                    {booking.service.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge 
                                      variant="outline" 
                                      className="border-purple-600 text-purple-400"
                                    >
                                      {booking.service.category}
                                    </Badge>
                                    <Badge 
                                      className={`${getStatusColor(booking.status)} text-white capitalize`}
                                    >
                                      {booking.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-300 mb-4 line-clamp-2">
                                {booking.service.description}
                              </p>

                              {/* Booking Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked: {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4" />
                                  <span>Scheduled: {format(new Date(booking.scheduledDate), 'MMM dd, h:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Users className="w-4 h-4" />
                                  <span>Duration: {booking.service.duration} hours</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Star className="w-4 h-4" />
                                  <span>Service ID: #{booking.id}</span>
                                </div>
                              </div>

                              {/* Provider Details */}
                              {booking.service.provider && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                  <h4 className="font-semibold text-white mb-2">Service Provider</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-400">Provider: </span>
                                      <span className="text-white">{booking.service.provider.username}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Email: </span>
                                      <span className="text-white">{booking.service.provider.email}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Phone: </span>
                                      <span className="text-white">{booking.service.provider.phone}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {booking.notes && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                  <h4 className="font-semibold text-white mb-2">Special Requests</h4>
                                  <p className="text-gray-300 text-sm">{booking.notes}</p>
                                </div>
                              )}

                              {/* Pricing */}
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                  Service Price: ${booking.service.price}
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                  ${booking.totalPrice}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex lg:flex-col gap-2">
                              {booking.status === 'confirmed' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contact Provider
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message
                                  </Button>
                                </>
                              )}
                              {booking.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Rate Service
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Receipt
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}