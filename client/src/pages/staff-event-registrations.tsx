import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Eye, 
  CheckCircle, 
  UserPlus,
  Users,
  DollarSign,
  Ticket,
  Sparkles
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  guestCount: number;
  totalPrice: string;
  status: string;
  notes?: string;
  createdAt: string;
  member?: {
    id: number;
    name: string;
    email: string;
    membershipTier: string;
  };
  event?: {
    id: number;
    title: string;
    type: string;
    date: string;
    time?: string;
    location: string;
    description?: string;
    price: string;
    imageUrl?: string;
  };
}

function EventRegistrationStatus({ registration }: { registration: EventRegistration }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'attended':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Badge className={getStatusColor(registration.status)}>
      {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1) || 'Unknown'}
    </Badge>
  );
}

export default function StaffEventRegistrations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [registrationTab, setRegistrationTab] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch event registrations using staff endpoint
  const { data: eventRegistrations = [], isLoading } = useQuery({
    queryKey: ['/api/staff/event-registrations'],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/staff/event-registrations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/event-registrations'] });
    },
  });

  // Filter registrations based on search, status, and tab
  const filteredRegistrations = eventRegistrations.filter((registration: EventRegistration) => {
    const matchesSearch = searchTerm === '' || 
      registration.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.member?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    
    // Tab filtering
    let matchesTab = true;
    if (registrationTab === 'upcoming') {
      matchesTab = registration.event?.date ? new Date(registration.event.date) > new Date() : false;
    } else if (registrationTab === 'past') {
      matchesTab = registration.event?.date ? new Date(registration.event.date) < new Date() : false;
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 mt-16"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">Event Registrations</h1>
          <p className="text-lg text-gray-400">Manage member event registrations and attendance tracking</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by member name, email, or event title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Registrations */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Ticket className="h-5 w-5 mr-2 text-purple-500" />
            Event Registrations ({filteredRegistrations.length})
          </CardTitle>
          <CardDescription>Manage member event registrations and attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={registrationTab} onValueChange={(v) => setRegistrationTab(v as any)}>
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                All Registrations
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                Past Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value={registrationTab} className="mt-6">
              <AnimatePresence>
                {filteredRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRegistrations.map((registration: EventRegistration, index: number) => (
                      <motion.div
                        key={registration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {registration.member?.name}
                                </h3>
                                <p className="text-gray-400">{registration.member?.email}</p>
                                <p className="text-purple-400 text-sm capitalize">
                                  {registration.member?.membershipTier} Member
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-gray-400 text-sm">Event</p>
                                <p className="text-white font-medium">{registration.event?.title}</p>
                                <p className="text-gray-400 text-sm flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {registration.event?.location}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Date & Time</p>
                                <p className="text-white font-medium">
                                  {registration.event?.date ? 
                                    new Date(registration.event.date).toLocaleDateString() : 
                                    'N/A'
                                  }
                                </p>
                                {registration.event?.time && (
                                  <p className="text-gray-400 text-sm flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {registration.event.time}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Guests</p>
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm">
                                  {registration.guestCount || 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Total</p>
                                <p className="text-white font-medium">${registration.totalPrice || 0}</p>
                              </div>
                            </div>
                            
                            {registration.notes && (
                              <div className="p-3 bg-gray-900/50 rounded-lg mb-4">
                                <p className="text-gray-400 text-sm mb-1">Special Requests</p>
                                <p className="text-white text-sm">{registration.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-3 ml-4">
                            <EventRegistrationStatus registration={registration} />
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                                onClick={() => {
                                  setSelectedRegistration(registration);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {registration.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-400 hover:text-green-300"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    id: registration.id, 
                                    status: 'confirmed' 
                                  })}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {registration.status === 'confirmed' && registration.event?.date && new Date(registration.event.date) < new Date() && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-400 hover:text-purple-300"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    id: registration.id, 
                                    status: 'attended' 
                                  })}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Sparkles className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-400 mb-2">No event registrations found</p>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' || registrationTab !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Event registrations will appear here when members sign up'
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Registration Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-gray-950 border-purple-500/20 text-white max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Event Registration Details
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Complete registration information and event details
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-3 overflow-y-auto max-h-[calc(80vh-100px)] pr-2">
              {/* Registration Info */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <Ticket className="h-4 w-4 mr-2 text-purple-400" />
                  Registration Information
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div>
                    <Label className="text-sm text-gray-400">Registration ID</Label>
                    <p className="text-white font-medium">#{selectedRegistration.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Status</Label>
                    <div className="mt-1">
                      <EventRegistrationStatus registration={selectedRegistration} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Registration Date</Label>
                    <p className="text-white font-medium">
                      {selectedRegistration.createdAt ? 
                        new Date(selectedRegistration.createdAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Tickets</Label>
                    <p className="text-white font-medium">{selectedRegistration.guestCount || 1}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700/50" />

              {/* Member Information */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-400" />
                  Member Information
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div>
                    <Label className="text-sm text-gray-400">Member Name</Label>
                    <p className="text-white font-medium">{selectedRegistration.member?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Email</Label>
                    <p className="text-white font-medium">{selectedRegistration.member?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Member ID</Label>
                    <p className="text-white font-medium">#{selectedRegistration.member?.id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Membership Type</Label>
                    <p className="text-white font-medium capitalize">
                      {selectedRegistration.member?.membershipTier || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700/50" />

              {/* Event Information */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  Event Information
                </h3>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm text-gray-400">Event Name</Label>
                      <p className="text-white font-medium">{selectedRegistration.event?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Event Type</Label>
                      <p className="text-white font-medium capitalize">
                        {selectedRegistration.event?.type || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Date & Time</Label>
                      <div className="flex items-center space-x-2 text-white font-medium">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span>
                          {selectedRegistration.event?.date ? 
                            new Date(selectedRegistration.event.date).toLocaleDateString() : 
                            'N/A'
                          }
                        </span>
                        {selectedRegistration.event?.time && (
                          <>
                            <Clock className="h-4 w-4 text-purple-400 ml-2" />
                            <span>{selectedRegistration.event.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Location</Label>
                      <div className="flex items-center space-x-2 text-white font-medium">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span>{selectedRegistration.event?.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRegistration.event?.description && (
                    <div>
                      <Label className="text-sm text-gray-400">Description</Label>
                      <p className="text-white mt-1 leading-relaxed">
                        {selectedRegistration.event.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-700/50" />

              {/* Payment Information */}
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-purple-400" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div>
                    <Label className="text-sm text-gray-400">Ticket Price</Label>
                    <p className="text-white font-medium">
                      ${selectedRegistration.event?.price || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Total Amount</Label>
                    <p className="text-white font-medium">
                      ${selectedRegistration.totalPrice || '0.00'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Payment Status</Label>
                    <Badge className={`${
                      selectedRegistration.status === 'confirmed' ? 
                        'bg-green-500/20 text-green-400 border-green-500/30' :
                      selectedRegistration.status === 'pending' ?
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {selectedRegistration.status === 'confirmed' ? 'Paid' : 
                       selectedRegistration.status === 'pending' ? 'Pending' : 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Payment Method</Label>
                    <p className="text-white font-medium">
                      {selectedRegistration.status === 'confirmed' ? 'Credit Card' : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedRegistration.notes && (
                <>
                  <Separator className="bg-gray-700/50" />
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">Special Requests</h3>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <p className="text-white text-sm leading-relaxed">
                        {selectedRegistration.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}