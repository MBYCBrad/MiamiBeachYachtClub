import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Ticket, Download, Star } from "lucide-react";
import { format } from "date-fns";

interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  ticketCount: number;
  totalPrice: string;
  registrationDate: string;
  specialRequests?: string;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl?: string;
    ticketPrice: string;
    capacity: number;
    category: string;
  };
}

export default function MyEvents() {
  const { data: eventRegistrations, isLoading } = useQuery({
    queryKey: ["/api/event-registrations"],
  });

  const registrations = eventRegistrations as EventRegistration[] || [];

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
              My Events
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track your event registrations and upcoming experiences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Ticket className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-300">No Events Registered</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't registered for any events yet. Explore our upcoming events and join exciting experiences!
            </p>
            <Button
              onClick={() => window.location.href = '/member-home'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Events
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Events</p>
                        <p className="text-2xl font-bold text-white">{registrations.length}</p>
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
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Tickets</p>
                        <p className="text-2xl font-bold text-white">
                          {registrations.reduce((sum, reg) => sum + reg.ticketCount, 0)}
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
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Spent</p>
                        <p className="text-2xl font-bold text-white">
                          ${registrations.reduce((sum, reg) => sum + parseFloat(reg.totalPrice), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Event Registration Cards */}
            <div className="space-y-6">
              {registrations.map((registration, index) => (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-600/50 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Event Image */}
                        <div className="lg:w-1/3">
                          <img
                            src={(registration.event?.imageUrl) || '/api/media/pexels-mali-42092_1750537277229.jpg'}
                            alt={registration.event?.title || 'Event'}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                        </div>

                        {/* Event Details */}
                        <div className="lg:w-2/3 p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-2">
                                    {registration.event?.title || 'Event'}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className="border-purple-600 text-purple-400 mb-3"
                                  >
                                    {registration.event?.category || 'Event'}
                                  </Badge>
                                </div>
                                <Badge 
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                >
                                  Registered
                                </Badge>
                              </div>

                              <p className="text-gray-300 mb-4 line-clamp-2">
                                {registration.event?.description || 'Event details not available'}
                              </p>

                              {/* Event Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {registration.event?.startTime 
                                      ? format(new Date(registration.event.startTime), 'MMM dd, yyyy')
                                      : format(new Date(registration.registrationDate), 'MMM dd, yyyy')
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {registration.event?.startTime 
                                      ? format(new Date(registration.event.startTime), 'h:mm a')
                                      : 'TBA'
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <MapPin className="w-4 h-4" />
                                  <span>{registration.event?.location || 'Location TBA'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Ticket className="w-4 h-4" />
                                  <span>{registration.ticketCount || 1} {(registration.ticketCount || 1) === 1 ? 'Ticket' : 'Tickets'}</span>
                                </div>
                              </div>

                              {/* Registration Details */}
                              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-white mb-2">Registration Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Guest Name: </span>
                                    <span className="text-white">{registration.guestDetails?.name || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Email: </span>
                                    <span className="text-white">{registration.guestDetails?.email || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Phone: </span>
                                    <span className="text-white">{registration.guestDetails?.phone || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Registered: </span>
                                    <span className="text-white">
                                      {registration.registrationDate 
                                        ? format(new Date(registration.registrationDate), 'MMM dd, yyyy')
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                                {registration.specialRequests && (
                                  <div className="mt-2">
                                    <span className="text-gray-400">Special Requests: </span>
                                    <span className="text-white">{registration.specialRequests}</span>
                                  </div>
                                )}
                              </div>

                              {/* Pricing */}
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                  ${registration.event?.ticketPrice || '0'} x {registration.ticketCount || 1} tickets
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                  ${registration.totalPrice || '0'}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex lg:flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Ticket
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                              >
                                View Event
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