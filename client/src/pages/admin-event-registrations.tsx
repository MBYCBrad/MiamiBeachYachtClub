import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Ticket,
  Sparkles,
  Star,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Event Registration Status Component
const EventRegistrationStatus = ({ registration }: { registration: any }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
      icon: AlertCircle,
      label: 'Pending'
    },
    confirmed: { 
      color: 'bg-green-500/20 text-green-400 border-green-500/30', 
      icon: CheckCircle,
      label: 'Confirmed'
    },
    cancelled: { 
      color: 'bg-red-500/20 text-red-400 border-red-500/30', 
      icon: XCircle,
      label: 'Cancelled'
    },
    attended: { 
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', 
      icon: Star,
      label: 'Attended'
    }
  };

  const config = statusConfig[registration.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center space-x-1 px-2 py-1`}>
      <Icon className="h-3 w-3" />
      <span className="capitalize text-xs font-medium">{config.label}</span>
    </Badge>
  );
};

export default function AdminEventRegistrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [registrationTab, setRegistrationTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const { toast } = useToast();

  // Fetch event registrations
  const { data: registrations = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/event-registrations'],
    staleTime: 15000,
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  });

  // Fetch events for filtering
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/events'],
    staleTime: 30000
  });

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/admin/event-registrations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/event-registrations'] });
      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully",
        className: "border-purple-500/30 bg-purple-950/50"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update registration status",
        variant: "destructive"
      });
    }
  });

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.member?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(reg => reg.eventId === parseInt(eventFilter));
    }

    // Tab filter (upcoming/past)
    const now = new Date();
    if (registrationTab === 'upcoming') {
      filtered = filtered.filter(reg => new Date(reg.event?.date) >= now);
    } else if (registrationTab === 'past') {
      filtered = filtered.filter(reg => new Date(reg.event?.date) < now);
    }

    // Sort by event date (upcoming first)
    filtered.sort((a, b) => 
      new Date(a.event?.date || 0).getTime() - new Date(b.event?.date || 0).getTime()
    );

    return filtered;
  }, [registrations, searchTerm, statusFilter, eventFilter, registrationTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingCount = registrations.filter(reg => 
      new Date(reg.event?.date) >= now && reg.status === 'confirmed'
    ).length;
    const totalRevenue = registrations
      .filter(reg => reg.status === 'confirmed' || reg.status === 'attended')
      .reduce((sum, reg) => sum + (reg.totalPrice || 0), 0);
    const attendanceRate = registrations.length > 0
      ? (registrations.filter(reg => reg.status === 'attended').length / registrations.length * 100).toFixed(1)
      : 0;

    return {
      total: registrations.length,
      upcoming: upcomingCount,
      revenue: totalRevenue,
      attendance: attendanceRate
    };
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}>
          Event Registrations
        </h1>
        <p className="text-lg text-gray-400">
          Manage member registrations for yacht club events and experiences
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Registrations</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Events</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.upcoming}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mt-1">${stats.revenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Attendance Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.attendance}%</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">
              Registration Management
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Member</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Event</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Date & Time</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Guests</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Total</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((registration, index) => (
                      <motion.tr
                        key={registration.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{registration.member?.name}</p>
                            <p className="text-gray-400 text-sm">{registration.member?.membershipTier} Member</p>
                            <p className="text-gray-500 text-xs">{registration.member?.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {registration.event?.imageUrl && (
                              <img 
                                src={registration.event.imageUrl} 
                                alt={registration.event.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium">{registration.event?.title}</p>
                              <p className="text-gray-400 text-sm flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {registration.event?.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {new Date(registration.event?.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-sm flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(registration.event?.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm">
                              {registration.guestCount || 1}
                            </div>
                            <p className="text-gray-400 text-xs mt-1">Guests</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">${registration.totalPrice || 0}</p>
                        </td>
                        <td className="py-4 px-4">
                          <EventRegistrationStatus registration={registration} />
                        </td>
                        <td className="py-4 px-4">
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
                            {registration.status === 'confirmed' && new Date(registration.event?.date) < new Date() && (
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
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No event registrations found</p>
                    <p className="text-gray-500 text-sm">
                      Event registrations will appear here when members sign up for yacht club events
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Registration Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-black border-purple-500/20 text-white max-w-2xl max-h-[80vh] overflow-hidden">
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

              <div className="flex justify-between items-center pt-3 border-t border-gray-700/50 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/50 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => {
                    // Navigate to messages with the member
                    window.location.href = `/messages?member=${selectedRegistration.member?.id}&name=${encodeURIComponent(selectedRegistration.member?.name || 'Member')}`;
                    setViewDialogOpen(false);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Member
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}