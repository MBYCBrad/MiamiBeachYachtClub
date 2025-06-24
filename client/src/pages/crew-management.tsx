import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Ship, MapPin, Clock, Star, Phone, Calendar, 
  AlertTriangle, CheckCircle2, UserPlus, Edit, 
  Anchor, Waves, Crown, Shield, Coffee, Utensils,
  Sparkles, FileText, Eye, History, Plus, Play, Pause, CheckCircle, Settings
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions?: string[];
  phone?: string;
  location?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  // Compatibility fields for existing code
  name?: string;
  availability?: 'available' | 'assigned' | 'off-duty';
  rating?: number;
  experience?: number;
}

interface YachtBooking {
  id: number;
  member: { name: string; membershipTier: string };
  yacht: { name: string; size: number; capacity: number };
  startTime: string;
  endTime: string;
  guestCount: number;
  services: any[];
  status: string;
  specialRequests?: string;
}

interface CrewAssignment {
  id: string;
  bookingId: number;
  crewMembers: CrewMember[];
  captain: CrewMember;
  coordinator: CrewMember;
  status: 'planned' | 'in-progress' | 'completed';
  briefingTime: string;
  notes: string;
}

export default function CrewManagementPage() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<YachtBooking | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<CrewAssignment | null>(null);
  const [crewFilter, setCrewFilter] = useState("all");
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [editDetailsDialog, setEditDetailsDialog] = useState(false);

  // Fetch active bookings requiring crew assignment
  const { data: activeBookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery<YachtBooking[]>({
    queryKey: ["/api/admin/bookings"],
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available staff members who can serve as crew
  const { data: crewMembers = [], isLoading: crewLoading, error: crewError } = useQuery<CrewMember[]>({
    queryKey: ["/api/admin/staff"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch crew assignments
  const { data: crewAssignments = [], isLoading: assignmentsLoading, error: assignmentsError } = useQuery<CrewAssignment[]>({
    queryKey: ["/api/crew/assignments"],
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = bookingsLoading || crewLoading || assignmentsLoading;
  const hasError = bookingsError || crewError || assignmentsError;

  const createCrewAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      console.log('Frontend - Sending assignment data:', assignmentData);
      const res = await apiRequest("POST", "/api/crew/assignments", assignmentData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create crew assignment');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      toast({
        title: "Crew Assignment Created",
        description: "Crew successfully assigned to booking",
      });
      setAssignmentDialog(false);
    },
    onError: (error: Error) => {
      console.error('Frontend - Assignment creation failed:', error);
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCrewStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/crew/assignments/${assignmentId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/assignments"] });
      toast({
        title: "Status Updated",
        description: "Trip status updated successfully",
      });
    },
  });

  const filteredCrewMembers = (crewMembers || []).filter(member => 
    crewFilter === "all" || member?.status === crewFilter
  );

  // Process active and past assignments based on time and status with enhanced booking data
  const now = new Date();
  
  // Enhanced active assignments with full booking details
  const activeAssignments = (crewAssignments || []).map(assignment => {
    const booking = activeBookings.find(b => b.id === assignment.bookingId);
    if (!booking) return null;
    
    const endTime = new Date(booking.endTime);
    const startTime = new Date(booking.startTime);
    
    // Calculate proper briefing time (30 minutes before start time)
    const briefingTime = new Date(startTime.getTime() - 30 * 60 * 1000);
    
    // Only include if booking hasn't ended and isn't completed
    if (endTime > now && assignment.status !== 'completed') {
      return {
        ...assignment,
        booking,
        briefingTime: briefingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))}h`,
        isActive: startTime <= now && endTime > now
      };
    }
    return null;
  }).filter(Boolean);

  // Enhanced past assignments with full booking details
  const pastAssignments = (crewAssignments || []).map(assignment => {
    const booking = activeBookings.find(b => b.id === assignment.bookingId);
    if (!booking) {
      // Include completed assignments even without booking data
      if (assignment.status === 'completed') {
        return {
          ...assignment,
          booking: null,
          briefingTime: new Date(assignment.briefingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completedTime: 'Historical Record'
        };
      }
      return null;
    }
    
    const endTime = new Date(booking.endTime);
    const startTime = new Date(booking.startTime);
    const briefingTime = new Date(startTime.getTime() - 30 * 60 * 1000);
    
    // Include if booking has ended or is completed
    if (endTime <= now || assignment.status === 'completed') {
      return {
        ...assignment,
        booking,
        briefingTime: briefingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))}h`,
        completedTime: endTime.toLocaleString()
      };
    }
    return null;
  }).filter(Boolean);

  // Function to get the next status in the progression
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'planned': return 'in-progress';
      case 'in-progress': return 'completed';
      default: return currentStatus;
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'in-progress': return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'completed': return 'bg-gradient-to-r from-green-600 to-emerald-600';
      default: return 'bg-gray-600';
    }
  };

  const getCrewRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'captain': return <Crown className="h-4 w-4" />;
      case 'first mate': return <Shield className="h-4 w-4" />;
      case 'chef': return <Utensils className="h-4 w-4" />;
      case 'steward': return <Coffee className="h-4 w-4" />;
      case 'deckhand': return <Anchor className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getBookingPriority = (booking: YachtBooking) => {
    const membershipPriority = {
      'Platinum': 4,
      'Gold': 3, 
      'Silver': 2,
      'Bronze': 1
    };
    return membershipPriority[booking.member?.membershipTier as keyof typeof membershipPriority] || 1;
  };

  const prioritizedBookings = (activeBookings || [])
    .filter(booking => booking?.status === 'confirmed' && booking?.member)
    .sort((a, b) => getBookingPriority(b) - getBookingPriority(a));

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
          <p className="text-gray-200">Loading crew management system...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-400 text-6xl">⚠️</div>
          <p className="text-red-200">Error loading crew management data</p>
          <p className="text-gray-400 text-sm">Please refresh the page or contact support</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>Crew Management Center</h1>
              <p className="text-gray-300">Real-time crew coordination & yacht service delivery</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Bookings</p>
                  <p className="text-2xl font-bold text-white">{prioritizedBookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Crew</p>
                  <p className="text-2xl font-bold text-white">
                    {(crewMembers || []).filter(m => m.status === 'active').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Assignments</p>
                  <p className="text-2xl font-bold text-white">{(crewAssignments || []).length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Service Quality</p>
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active Bookings Requiring Crew */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    <CardTitle className="text-white">Bookings Requiring Crew</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
                    {prioritizedBookings.length} pending
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  Priority-ordered by membership tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {prioritizedBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={`${
                              booking.member.membershipTier === 'Platinum' ? 'bg-purple-600' :
                              booking.member.membershipTier === 'Gold' ? 'bg-yellow-600' :
                              booking.member.membershipTier === 'Silver' ? 'bg-gray-600' : 'bg-amber-700'
                            } text-white`}
                          >
                            {booking.member.membershipTier}
                          </Badge>
                          <span className="text-white font-medium">{booking.member.name}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{booking.yacht.name} • {booking.guestCount} guests</p>
                      </div>
                      <Dialog open={assignmentDialog && selectedBooking?.id === booking.id} onOpenChange={setAssignmentDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-8 h-8 p-0"
                            onClick={() => setSelectedBooking(booking)}
                            title="Assign Crew"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <CrewAssignmentDialog 
                          booking={booking}
                          crewMembers={crewMembers}
                          onAssign={createCrewAssignmentMutation}
                        />
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Marina Bay
                      </div>
                    </div>

                    {(booking.services || []).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2">Concierge Services ({(booking.services || []).length})</p>
                        <div className="flex flex-wrap gap-1">
                          {(booking.services || []).slice(0, 3).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-gray-700 text-gray-300">
                              {service.name}
                            </Badge>
                          ))}
                          {(booking.services || []).length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                              +{(booking.services || []).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Crew Members */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Crew Members</CardTitle>
                  <Select value={crewFilter} onValueChange={setCrewFilter}>
                    <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Crew</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredCrewMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                          {(member.username || 'UN').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCrewRoleIcon(member.role)}
                          <span className="font-medium text-white">{member.username || 'Unknown'}</span>
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              member.status === 'active' ? 'bg-green-400' :
                              member.status === 'inactive' ? 'bg-blue-400' : 'bg-gray-400'
                            }`}
                            title={member.status}
                          />
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">{member.role} • {member.location || 'Marina Bay'}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            5.0/5
                          </div>
                          <span>Certified Professional</span>
                          {member.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Bookings and Past Bookings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Active Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-400" />
                  Active Bookings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor ongoing yacht trips and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {activeAssignments.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-600/50 transition-all duration-300"
                    >
                      {/* Header with status and actions */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(assignment.status)} px-3 py-1 text-xs font-medium`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(assignment.status)}
                              {assignment.status}
                            </div>
                          </Badge>
                          {assignment.isActive && (
                            <div className="flex items-center gap-1 text-green-400 text-xs">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              LIVE
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog open={viewDetailsDialog && selectedAssignment?.id === assignment.id} onOpenChange={setViewDetailsDialog}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-400 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white w-8 h-8 p-0"
                                title="View Details"
                                onClick={() => setSelectedAssignment(assignment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <ViewAssignmentDialog assignment={assignment} />
                          </Dialog>
                          <Dialog open={editDetailsDialog && selectedAssignment?.id === assignment.id} onOpenChange={setEditDetailsDialog}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-400 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white w-8 h-8 p-0"
                                title="Edit Assignment"
                                onClick={() => setSelectedAssignment(assignment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <EditAssignmentDialog 
                              assignment={assignment} 
                              crewMembers={crewMembers}
                              onUpdate={() => {
                                queryClient.invalidateQueries({ queryKey: ["/api/crew/assignments"] });
                                setEditDetailsDialog(false);
                              }}
                            />
                          </Dialog>
                        </div>
                      </div>

                      {/* Booking Information */}
                      {assignment.booking && (
                        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Ship className="h-4 w-4 text-blue-400" />
                            <span className="text-white font-medium">
                              {assignment.booking.yacht?.name || `Yacht #${assignment.booking.yachtId}`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Member</div>
                              <div className="text-white">{assignment.booking.member?.name || 'Unknown Member'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Guests</div>
                              <div className="text-white">{assignment.booking.guestCount} people</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Duration</div>
                              <div className="text-white">{assignment.duration}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Trip Time</div>
                              <div className="text-white">{assignment.startTime} - {assignment.endTime}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crew Assignment Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-white">
                          <Crown className="h-4 w-4 text-purple-400" />
                          <span className="font-medium">Captain:</span>
                          <span>{assignment.captain?.username || 'Not Assigned'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <span className="font-medium">Coordinator:</span>
                          <span>{assignment.coordinator?.username || 'Not Assigned'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Users className="h-4 w-4 text-green-400" />
                          <span className="font-medium">Crew Size:</span>
                          <span>{(assignment.crewMembers || []).length} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium">Briefing Time:</span>
                          <span className="text-purple-400">{assignment.briefingTime}</span>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {assignment.booking?.specialRequests && (
                        <div className="mt-3 p-2 bg-indigo-900/20 rounded text-xs">
                          <div className="text-indigo-400 font-medium mb-1">Special Requests:</div>
                          <div className="text-gray-300">{assignment.booking.specialRequests}</div>
                        </div>
                      )}

                      {/* Assignment Notes */}
                      {assignment.notes && (
                        <div className="mt-3 p-2 bg-gray-600/30 rounded text-xs">
                          <div className="text-gray-400 font-medium mb-1">Assignment Notes:</div>
                          <div className="text-gray-300">{assignment.notes}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {activeAssignments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active bookings</p>
                      <p className="text-sm mt-1">Active yacht trips will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Past Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-green-400" />
                  Past Bookings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Completed yacht trips and service records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {pastAssignments.length > 0 ? (
                    pastAssignments.map((assignment) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getStatusColor(assignment.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(assignment.status)}
                              {assignment.status}
                            </div>
                          </Badge>
                          <Badge variant="outline" className="text-gray-400 border-gray-600">
                            Trip Completed
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Crown className="h-4 w-4 text-purple-400" />
                            Captain: {assignment.captain?.username || 'Not Assigned'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Shield className="h-4 w-4 text-blue-400" />
                            Coordinator: {assignment.coordinator?.username || 'Not Assigned'}
                          </div>
                          <div className="text-gray-500">
                            Crew Size: {(assignment.crewMembers || []).length} members
                          </div>
                          <div className="text-gray-500">
                            Completed: {new Date(assignment.briefingTime).toLocaleDateString()}
                          </div>
                        </div>

                        {assignment.notes && (
                          <div className="mt-3 p-2 bg-gray-600/20 rounded text-xs text-gray-400">
                            {assignment.notes}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No completed trips yet</p>
                      <p className="text-sm mt-1">Completed bookings will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

// Crew Assignment Dialog Component
function CrewAssignmentDialog({ 
  booking, 
  crewMembers, 
  onAssign 
}: { 
  booking: YachtBooking; 
  crewMembers: CrewMember[]; 
  onAssign: any;
}) {
  const [selectedCaptain, setSelectedCaptain] = useState<number | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<number | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<number[]>([]);
  // Calculate briefing time exactly 1 hour before booking start time
  const calculateBriefingTime = () => {
    if (!booking.startTime) return "";
    
    try {
      const bookingStart = new Date(booking.startTime);
      // Subtract 1 hour (3600000 milliseconds)
      const briefingTime = new Date(bookingStart.getTime() - 3600000);
      
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = briefingTime.getFullYear();
      const month = String(briefingTime.getMonth() + 1).padStart(2, '0');
      const day = String(briefingTime.getDate()).padStart(2, '0');
      const hours = String(briefingTime.getHours()).padStart(2, '0');
      const minutes = String(briefingTime.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const [briefingTime, setBriefingTime] = useState(calculateBriefingTime());
  const [notes, setNotes] = useState("");

  // Fetch live staff data from the database
  const { data: staffData = [] } = useQuery({
    queryKey: ['/api/admin/staff'],
    staleTime: 5 * 60 * 1000,
  });

  // Show all staff members from database (no status filtering since we want all available crew)
  const availableCrew = (staffData || []);
  
  const captains = availableCrew.filter((m: any) => 
    ['Yacht Captain', 'Marina Manager', 'Fleet Coordinator'].includes(m.role)
  );
  
  const coordinators = availableCrew.filter((m: any) => 
    ['Service Coordinator', 'Concierge Manager', 'Operations Manager', 'Member Relations Specialist'].includes(m.role)
  );
  
  // Show ALL crew members except captains, coordinators, and admin - everyone else is selectable crew
  const otherCrew = availableCrew.filter((m: any) => 
    !['admin'].includes(m.role) && 
    !captains.some(c => c.id === m.id) && 
    !coordinators.some(c => c.id === m.id)
  );



  const handleAssign = () => {
    if (!selectedCaptain || !selectedCoordinator) {
      return;
    }

    const assignmentData = {
      bookingId: booking.id,
      captainId: selectedCaptain,
      coordinatorId: selectedCoordinator,
      crewMemberIds: selectedCrew,
      briefingTime,
      notes,
      status: 'planned'
    };

    onAssign.mutate(assignmentData);
  };

  // Fetch yacht details for this booking
  const { data: yachts = [] } = useQuery({
    queryKey: ['/api/admin/yachts'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all services to match with booking services
  const { data: services = [] } = useQuery({
    queryKey: ['/api/admin/services'],
    staleTime: 5 * 60 * 1000,
  });

  const yacht = yachts.find((y: any) => y.id === booking.yachtId);
  const bookingServices = (booking.services || []).map((serviceId: number) => 
    services.find((s: any) => s.id === serviceId)
  ).filter(Boolean);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Date not specified';
      
      // Handle different date formats
      let date = new Date(dateString);
      
      // If invalid, try parsing MM/DD/YYYY format
      if (isNaN(date.getTime()) && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Convert MM/DD/YYYY to YYYY-MM-DD
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        }
      }
      
      // If still invalid, try other common formats
      if (isNaN(date.getTime())) {
        console.warn('Unable to parse date:', dateString);
        return dateString; // Return original string if can't parse
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'Time not specified';
      
      // Handle full datetime strings
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      // Handle time-only strings (HH:MM format)
      if (timeString.includes(':')) {
        const date = new Date(`2000-01-01T${timeString}`);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'Invalid Time';
    }
  };

  const getTimeSlotName = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 9 && hour < 13) return 'Morning Cruise';
    if (hour >= 13 && hour < 17) return 'Afternoon Cruise';
    if (hour >= 17 && hour < 21) return 'Evening Cruise';
    return 'Night Cruise';
  };

  return (
    <DialogContent className="bg-gray-900 border-slate-700 text-white max-w-6xl max-h-[95vh] overflow-y-auto">
      <DialogHeader className="space-y-3 pb-6">
        <DialogTitle className="text-2xl font-bold text-purple-400">Crew Assignment Center</DialogTitle>
        <DialogDescription className="text-gray-300 text-base">
          Comprehensive crew coordination for premium yacht experience
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Booking Details */}
        <div className="space-y-6">
          {/* Yacht & Booking Information */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Yacht & Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Yacht</p>
                  <p className="text-white font-semibold">{yacht?.name || booking.yacht?.name || 'Loading...'}</p>
                  <p className="text-gray-300 text-sm">{yacht?.size || booking.yacht?.size}ft • {yacht?.capacity || booking.yacht?.capacity} guests max</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">{yacht?.location || booking.yacht?.location || 'Miami Marina'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-white font-semibold">
                    {booking.date ? formatDate(booking.date) : 
                     booking.startTime ? formatDate(booking.startTime) : 
                     'Date not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Time Slot</p>
                  <p className="text-white">
                    {booking.startTime ? getTimeSlotName(booking.startTime) : 'Night Cruise'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {booking.startTime && booking.endTime ? 
                      `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` : 
                      'Time not specified'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Member</p>
                  <p className="text-white font-semibold">{booking.member?.name || booking.member?.username || 'Unknown Member'}</p>
                  <p className="text-gray-300 text-sm">{booking.member?.membershipTier || 'Gold'} Member</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Guest Count</p>
                  <p className="text-white text-2xl font-bold">{booking.guestCount}</p>
                </div>
              </div>

              {booking.specialRequests && (
                <div>
                  <p className="text-gray-400 text-sm">Special Requests</p>
                  <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Services Ordered */}
          {bookingServices.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Premium Services Included ({bookingServices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookingServices.map((service: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{service?.name}</p>
                        <p className="text-gray-400 text-sm">{service?.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">${service?.price}</p>
                        <p className="text-gray-400 text-xs">Premium Service</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Yacht Specifications */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Yacht Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Length</p>
                  <p className="text-white">{yacht?.size || booking.yacht?.size || '50'} feet</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="text-white">{yacht?.type || booking.yacht?.type || 'Motor Yacht'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Capacity</p>
                  <p className="text-white">{yacht?.capacity || booking.yacht?.capacity || '12'} guests</p>
                </div>
                <div>
                  <p className="text-gray-400">Crew Required</p>
                  <p className="text-white">{Math.ceil((yacht?.capacity || booking.yacht?.capacity || 12) / 8) + 1} members</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Key Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {(yacht?.amenities || booking.yacht?.amenities || ['Deck Space', 'Sound System', 'Kitchen', 'Bathroom', 'Seating', 'Navigation']).slice(0, 6).map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Crew Assignment */}
        <div className="space-y-6">
          {/* Captain Selection */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Captain Assignment *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCaptain?.toString()} onValueChange={(value) => setSelectedCaptain(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-700 h-12">
                  <SelectValue placeholder="Select experienced captain" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {captains.map((captain) => (
                    <SelectItem 
                      key={captain.id} 
                      value={captain.id.toString()}
                      className="hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 focus:bg-gradient-to-r focus:from-purple-600 focus:to-blue-600"
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{captain.username || 'Unknown'}</span>
                        <span className="text-sm text-gray-400">{captain.role} • {captain.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Service Coordinator Selection */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Service Coordinator *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCoordinator?.toString()} onValueChange={(value) => setSelectedCoordinator(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-700 h-12">
                  <SelectValue placeholder="Select service coordinator" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {coordinators.map((coordinator) => (
                    <SelectItem 
                      key={coordinator.id} 
                      value={coordinator.id.toString()}
                      className="hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 focus:bg-gradient-to-r focus:from-purple-600 focus:to-blue-600"
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{coordinator.username || 'Unknown'}</span>
                        <span className="text-sm text-gray-400">{coordinator.role} • {coordinator.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Additional Crew Selection */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Additional Crew Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {otherCrew.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    <input
                      type="checkbox"
                      id={`crew-${member.id}`}
                      checked={selectedCrew.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCrew([...selectedCrew, member.id]);
                        } else {
                          setSelectedCrew(selectedCrew.filter(id => id !== member.id));
                        }
                      }}
                      className="rounded border-gray-700 bg-gray-700 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{member.username || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{member.role} • {member.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pre-Departure Briefing */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pre-Departure Briefing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="briefing-time" className="text-white">Staff Meeting Time</Label>
                  <Input
                    id="briefing-time"
                    type="datetime-local"
                    value={briefingTime}
                    onChange={(e) => setBriefingTime(e.target.value)}
                    className="bg-gray-700 border-gray-700 mt-1"
                  />
                  <p className="text-gray-400 text-xs mt-1">Auto-set to 1 hour before departure for crew coordination</p>
                </div>
                
                <div>
                  <Label className="text-white">Meeting Location</Label>
                  <div className="mt-1 p-3 bg-gray-700/50 rounded-lg border border-gray-700">
                    <p className="text-white font-medium">Miami Marina - Main Gate</p>
                    <p className="text-gray-300 text-sm">401 Biscayne Blvd, Miami, FL 33132</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Meet at the main gate entrance 1 hour early for staff briefing and equipment check
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Notes & Instructions */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Crew Instructions & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="• Safety protocols and guest preferences&#10;• Service delivery requirements&#10;• Special dietary needs or allergies&#10;• Equipment setup instructions&#10;• Emergency contact information&#10;• Member VIP status notes"
                className="bg-gray-700 border-gray-700 min-h-[120px] text-sm"
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onAssign.mutate({ cancel: true })}
              className="bg-gray-700 border-gray-700 text-white hover:bg-gray-600"
            >
              Cancel Assignment
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedCaptain || !selectedCoordinator || onAssign.isPending}
              className="bg-purple-600 hover:bg-purple-700 px-8"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {onAssign.isPending ? "Assigning..." : "Assign Crew Team"}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// View Assignment Details Dialog
function ViewAssignmentDialog({ assignment }: { assignment: CrewAssignment }) {
  return (
    <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-white text-xl flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-400" />
          Assignment Details
        </DialogTitle>
        <DialogDescription className="text-gray-400">
          Complete crew assignment information
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Assignment Status */}
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(assignment.status)} text-white`}>
            {getStatusIcon(assignment.status)}
            <span className="ml-1 capitalize">{assignment.status}</span>
          </Badge>
        </div>

        {/* Booking Information */}
        {assignment.booking && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Yacht</div>
                <div className="text-white font-medium">{assignment.booking.yacht?.name || `Yacht #${assignment.booking.yachtId}`}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Member</div>
                <div className="text-white">{assignment.booking.member?.name || 'Unknown Member'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Guests</div>
                <div className="text-white">{assignment.booking.guestCount} people</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Duration</div>
                <div className="text-white">{assignment.duration}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crew Details */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crew Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Crown className="h-4 w-4" />
                  <span className="font-medium">Captain</span>
                </div>
                <div className="text-white">{assignment.captain?.username || 'Not Assigned'}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Coordinator</span>
                </div>
                <div className="text-white">{assignment.coordinator?.username || 'Not Assigned'}</div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Briefing Time</span>
              </div>
              <div className="text-purple-400">{assignment.briefingTime}</div>
            </div>

            {(assignment.crewMembers || []).length > 0 && (
              <div>
                <div className="text-gray-400 text-sm mb-2">Additional Crew ({(assignment.crewMembers || []).length})</div>
                <div className="grid grid-cols-2 gap-2">
                  {(assignment.crewMembers || []).map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {getCrewRoleIcon(member.role || 'crew')}
                      <span className="text-white">{member.username}</span>
                      <span className="text-gray-400">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Requests & Notes */}
        {(assignment.booking?.specialRequests || assignment.notes) && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignment.booking?.specialRequests && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Special Requests</div>
                  <div className="text-white bg-indigo-900/20 p-2 rounded text-sm">{assignment.booking.specialRequests}</div>
                </div>
              )}
              {assignment.notes && (
                <div>
                  <div className="text-gray-400 text-sm mb-1">Assignment Notes</div>
                  <div className="text-white bg-gray-700/30 p-2 rounded text-sm">{assignment.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );
}

// Edit Assignment Dialog
function EditAssignmentDialog({ 
  assignment, 
  crewMembers, 
  onUpdate 
}: { 
  assignment: CrewAssignment; 
  crewMembers: CrewMember[]; 
  onUpdate: () => void;
}) {
  const [editedNotes, setEditedNotes] = useState(assignment.notes || "");
  const [editedBriefingTime, setEditedBriefingTime] = useState(assignment.briefingTime || "");
  const [editedStatus, setEditedStatus] = useState(assignment.status || "planned");
  
  const { toast } = useToast();

  const updateAssignmentMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest("PATCH", `/api/crew/assignments/${assignment.id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment Updated",
        description: "Crew assignment has been updated successfully",
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateAssignmentMutation.mutate({
      notes: editedNotes,
      briefingTime: editedBriefingTime,
      status: editedStatus,
    });
  };

  return (
    <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-white text-xl flex items-center gap-2">
          <Edit className="h-5 w-5 text-purple-400" />
          Edit Assignment
        </DialogTitle>
        <DialogDescription className="text-gray-400">
          Update crew assignment details
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Status Update */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-400">Assignment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={editedStatus} onValueChange={setEditedStatus}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Briefing Time */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Briefing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="datetime-local"
              value={editedBriefingTime}
              onChange={(e) => setEditedBriefingTime(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assignment Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Add notes about this crew assignment..."
              rows={4}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={updateAssignmentMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {updateAssignmentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-700">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
}