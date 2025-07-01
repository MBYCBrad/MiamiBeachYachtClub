import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Ship, Users, Crown, Shield, Clock, MapPin, Eye, Edit, UserPlus, ToggleLeft,
  Star, Calendar, FileText, AlertCircle, CheckCircle, Play, Pause, Square
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Format booking time to show proper business hours instead of raw timestamps
const formatBookingTime = (startTime: string, endTime: string) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Date';
    }
    
    // Check if it's today
    const today = new Date();
    const isToday = start.toDateString() === today.toDateString();
    
    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = start.toDateString() === tomorrow.toDateString();
    
    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
    
    const startTimeStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endTimeStr = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateStr} at ${startTimeStr} - ${endTimeStr}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

// Interfaces for staff portal compatibility
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
  name?: string;
  availability?: 'available' | 'assigned' | 'off-duty';
  rating?: number;
  experience?: number;
}

interface YachtBooking {
  id: number;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  memberName: string;
  memberTier: string;
  memberEmail: string;
  yachtName: string;
  yachtSize: string;
  createdAt: string;
  specialRequests?: string;
  user?: any;
  yacht?: any;
  member?: { name: string; membershipTier: string };
  services?: any[];
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
  booking?: YachtBooking;
  startTime?: string;
  endTime?: string;
  duration?: string;
  isActive?: boolean;
  completedTime?: string;
}

export default function CrewManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [selectedCaptain, setSelectedCaptain] = useState<number | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<number | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<number[]>([]);
  const [briefingTime, setBriefingTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [editDetailsDialog, setEditDetailsDialog] = useState(false);
  const [viewBookingDialog, setViewBookingDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<CrewAssignment | null>(null);

  // Staff portal API endpoints
  const { data: activeBookings = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/bookings'],
    staleTime: 30000,
  });

  const { data: crewMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/staff'],
    staleTime: 30000,
  });

  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ['/api/staff/assignments'],
    staleTime: 30000,
  });



  // Transform booking data for staff portal compatibility
  const transformedBookings = (Array.isArray(activeBookings) ? activeBookings : []).map((booking: any) => ({
    ...booking,
    member: {
      name: booking.memberName,
      membershipTier: booking.memberTier
    },
    yacht: {
      name: booking.yachtName,
      size: booking.yachtSize
    }
  }));

  // Filter crew by role
  const captains = (Array.isArray(crewMembers) ? crewMembers : []).filter((member: CrewMember) => 
    member.role?.toLowerCase().includes('captain') && member.status === 'active'
  );
  
  const coordinators = (Array.isArray(crewMembers) ? crewMembers : []).filter((member: CrewMember) => 
    member.role?.toLowerCase().includes('coordinator') && member.status === 'active'
  );
  
  const otherCrew = (Array.isArray(crewMembers) ? crewMembers : []).filter((member: CrewMember) => 
    !member.role?.toLowerCase().includes('captain') && 
    !member.role?.toLowerCase().includes('coordinator') && 
    member.status === 'active'
  );

  const getBookingPriority = (booking: YachtBooking) => {
    const membershipPriority = {
      'Platinum': 4,
      'Gold': 3, 
      'Silver': 2,
      'Bronze': 1
    };
    return membershipPriority[booking.memberTier as keyof typeof membershipPriority] || 1;
  };

  const prioritizedBookings = transformedBookings
    .filter(booking => booking?.status === 'confirmed')
    .sort((a, b) => getBookingPriority(b) - getBookingPriority(a));

  const createAssignmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/staff/assignments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: "Assignment Created",
        description: "Crew assignment successfully created and scheduled.",
      });
      setShowAssignmentDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Assignment creation failed:', error);
      toast({
        title: "Assignment Failed",
        description: "Could not create crew assignment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/staff/assignments/${id}`, data, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/assignments'] });
      setEditDetailsDialog(false);
    },
    onError: (error: Error) => {
      console.error('Assignment update failed:', error);
    }
  });

  const resetForm = () => {
    setSelectedBooking(null);
    setSelectedCaptain(null);
    setSelectedCoordinator(null);
    setSelectedCrew([]);
    setBriefingTime('');
    setNotes('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl">
              <Ship className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif' }}>
                Crew Management
              </h1>
              <p className="text-lg text-gray-400">Assign crew members to yacht bookings and manage operations</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{crewMembers.length || 0}</p>
                  <p className="text-gray-400 text-sm">Active Crew</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{assignments.length || 0}</p>
                  <p className="text-gray-400 text-sm">Active Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <Ship className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{prioritizedBookings.length || 0}</p>
                  <p className="text-gray-400 text-sm">Pending Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Crown className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{captains.length || 0}</p>
                  <p className="text-gray-400 text-sm">Captains Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Bookings Management */}
        <Card className="bg-gray-900/50 border-gray-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unassigned" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border-gray-700">
                <TabsTrigger value="unassigned" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  Unassigned Bookings
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  Active Bookings
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  Past Bookings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unassigned" className="mt-6">
                {activeBookings.filter((booking: any) => booking.status === 'confirmed' && !booking.crewAssigned).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Unassigned Bookings</h3>
                    <p className="text-gray-500">All yacht bookings have crew assignments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBookings
                      .filter((booking: any) => booking.status === 'confirmed' && !booking.crewAssigned)
                      .map((booking: any) => (
                      <div key={booking.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant="outline" 
                              className="border-gray-600 bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Needs Crew
                            </Badge>
                            <div className="text-white font-medium">
                              {booking.yachtName} - {booking.memberName}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              onClick={() => {
                                setSelectedBooking(booking.id);
                                setShowAssignmentDialog(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Crew
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400 mb-1">Time</div>
                            <div className="text-white">{formatBookingTime(booking.startTime, booking.endTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Guests</div>
                            <div className="text-white">{booking.guestCount} guests</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Member Tier</div>
                            <div className="text-white">{booking.memberTier}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Active Assignments</h3>
                    <p className="text-gray-500">No crew assignments have been created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment: any) => {
                      const booking = assignment.booking || {};
                      return (
                        <div key={assignment.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Badge 
                                variant="outline" 
                                className={`border-gray-600 text-white ${
                                  assignment.status === 'planned' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                                  assignment.status === 'in-progress' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                  'bg-gradient-to-r from-blue-600 to-cyan-600'
                                }`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {assignment.status === 'in-progress' ? 'In Progress' : 
                                 assignment.status === 'completed' ? 'Completed' : 'Planned'}
                              </Badge>
                              <div className="text-white font-medium">
                                Booking #{assignment.bookingId} - Assignment #{assignment.id}
                              </div>
                              {assignment.status === 'in-progress' && (
                                <div className="flex items-center gap-1 text-green-400 text-xs">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                  LIVE
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setViewDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 mb-1">Captain</div>
                              <div className="text-white">{assignment.captain?.username || 'Not assigned'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">Coordinator</div>
                              <div className="text-white">{assignment.coordinator?.username || 'Not assigned'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">Crew Members</div>
                              <div className="text-white">{assignment.crewMembers?.length || 0} assigned</div>
                            </div>
                          </div>
                          
                          {assignment.briefingTime && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="text-gray-400 text-xs mb-1">Briefing Time</div>
                              <div className="text-white text-sm">{new Date(assignment.briefingTime).toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                {activeBookings.filter((booking: any) => booking.status === 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Past Bookings</h3>
                    <p className="text-gray-500">Completed yacht bookings will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBookings
                      .filter((booking: any) => booking.status === 'completed')
                      .map((booking: any) => (
                      <div key={booking.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant="outline" 
                              className="border-gray-600 bg-gray-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </Badge>
                            <div className="text-white font-medium">
                              {booking.yachtName} - {booking.memberName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking.id);
                                setViewBookingDialog(true);
                              }}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <div className="text-gray-400 text-sm">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400 mb-1">Duration</div>
                            <div className="text-white">{formatBookingTime(booking.startTime, booking.endTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Guests</div>
                            <div className="text-white">{booking.guestCount} guests</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Member Tier</div>
                            <div className="text-white">{booking.memberTier}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <CrewAssignmentDialog
            booking={selectedBooking ? transformedBookings.find(b => b.id === selectedBooking) || null : null}
            crewMembers={crewMembers}
            captains={captains}
            coordinators={coordinators}
            otherCrew={otherCrew}
            onAssign={(data) => createAssignmentMutation.mutate(data)}
          />
        </Dialog>

        {/* View Assignment Dialog */}
        <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
          {selectedAssignment && (
            <ViewAssignmentDialog assignment={selectedAssignment} />
          )}
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={editDetailsDialog} onOpenChange={setEditDetailsDialog}>
          {selectedAssignment && (
            <EditAssignmentDialog
              assignment={selectedAssignment}
              crewMembers={crewMembers}
              onUpdate={() => updateAssignmentMutation.mutate({ id: selectedAssignment.id, data: {} })}
            />
          )}
        </Dialog>

        {/* View Booking Dialog */}
        <Dialog open={viewBookingDialog} onOpenChange={setViewBookingDialog}>
          {selectedBooking && (
            <ViewBookingDetailsDialog 
              booking={transformedBookings.find(b => b.id === selectedBooking) || null} 
            />
          )}
        </Dialog>
      </div>
    </div>
  );
}

// Assignment Dialog Components
function CrewAssignmentDialog({ 
  booking, 
  crewMembers, 
  captains, 
  coordinators, 
  otherCrew, 
  onAssign 
}: { 
  booking: YachtBooking | null; 
  crewMembers: CrewMember[];
  captains: CrewMember[];
  coordinators: CrewMember[];
  otherCrew: CrewMember[];
  onAssign: (data: any) => void;
}) {
  const [selectedCaptain, setSelectedCaptain] = useState<number | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<number | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<number[]>([]);
  const [briefingTime, setBriefingTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (booking) {
      const startTime = new Date(booking.startTime);
      const briefing = new Date(startTime.getTime() - 60 * 60 * 1000);
      setBriefingTime(briefing.toISOString().slice(0, 16));
    }
  }, [booking]);

  const handleSubmit = () => {
    if (!booking || !selectedCaptain || !selectedCoordinator) return;

    const assignmentData = {
      bookingId: booking.id,
      captainId: selectedCaptain,
      coordinatorId: selectedCoordinator,
      crewMemberIds: selectedCrew,
      briefingTime,
      notes: notes || 'Standard crew assignment for yacht booking'
    };

    onAssign(assignmentData);
  };

  if (!booking) {
    return (
      <DialogContent className="max-w-md bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-400">Select a Booking</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Please select a booking from the list to assign crew members.</p>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-950 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl text-purple-400 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Assign Crew - {booking.yachtName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Booking Summary */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Yacht</div>
              <div className="text-white font-medium">{booking.yachtName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Member</div>
              <div className="text-white">{booking.memberName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Date & Time</div>
              <div className="text-white">{formatBookingTime(booking.startTime, booking.endTime)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Guests</div>
              <div className="text-white">{booking.guestCount} people</div>
            </div>
          </CardContent>
        </Card>

        {/* Captain Selection */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Yacht Captain *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCaptain?.toString()} onValueChange={(value) => setSelectedCaptain(parseInt(value))}>
              <SelectTrigger className="bg-gray-700 border-gray-700 h-12">
                <SelectValue placeholder="Select yacht captain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {captains.map((captain: CrewMember) => (
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

        {/* Coordinator Selection */}
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
                {coordinators.map((coordinator: CrewMember) => (
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
              {otherCrew.map((member: CrewMember) => (
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
              Special Notes & Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this crew assignment..."
              rows={4}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" className="border-gray-600 text-gray-400">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedCaptain || !selectedCoordinator}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Create Assignment
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function ViewAssignmentDialog({ assignment }: { assignment: CrewAssignment }) {
  if (!assignment) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-950 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl text-purple-400 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Assignment Details
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Assignment Status */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-white">{assignment.status}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Current Status</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{(assignment.crewMembers?.length || 0) + 2}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Total Crew</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{new Date(assignment.briefingTime).toLocaleTimeString()}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Briefing Time</div>
            </div>
          </CardContent>
        </Card>

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
                <div className="text-white font-medium">{assignment.booking.yachtName || 'Unknown Yacht'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Member</div>
                <div className="text-white">{assignment.booking.memberName || 'Unknown Member'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Guests</div>
                <div className="text-white">{assignment.booking.guestCount} people</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Duration</div>
                <div className="text-white">{assignment.duration || 'TBD'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crew Details */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Crew
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-purple-400" />
                  <span className="font-medium text-purple-400">Captain</span>
                </div>
                <div className="text-white font-medium">{assignment.captain?.username || 'Unassigned'}</div>
                <div className="text-gray-400 text-sm">{assignment.captain?.role}</div>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-blue-400">Coordinator</span>
                </div>
                <div className="text-white font-medium">{assignment.coordinator?.username || 'Unassigned'}</div>
                <div className="text-gray-400 text-sm">{assignment.coordinator?.role}</div>
              </div>
            </div>
            
            {assignment.crewMembers.length > 0 && (
              <div>
                <div className="text-gray-400 text-sm mb-2">Additional Crew Members</div>
                <div className="grid grid-cols-2 gap-2">
                  {assignment.crewMembers.map((member: CrewMember) => (
                    <div key={member.id} className="p-2 bg-gray-700/30 rounded flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-white text-sm">{member.username}</div>
                        <div className="text-gray-400 text-xs">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Requests & Notes */}
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
            <div>
              <div className="text-gray-400 text-sm mb-1">Assignment Notes</div>
              <div className="text-white bg-gray-700/30 p-2 rounded text-sm">{assignment.notes || 'No additional notes'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

function EditAssignmentDialog({ 
  assignment, 
  crewMembers, 
  onUpdate 
}: { 
  assignment: CrewAssignment; 
  crewMembers: CrewMember[];
  onUpdate: () => void;
}) {
  const [editedCaptainId, setEditedCaptainId] = useState<number | null>(assignment.captain?.id || null);
  const [editedCoordinatorId, setEditedCoordinatorId] = useState<number | null>(assignment.coordinator?.id || null);
  const [editedCrewMemberIds, setEditedCrewMemberIds] = useState<number[]>(assignment.crewMembers?.map(m => m.id) || []);
  const [editedBriefingTime, setEditedBriefingTime] = useState(assignment.briefingTime);
  const [editedNotes, setEditedNotes] = useState(assignment.notes);
  const [editedStatus, setEditedStatus] = useState<'planned' | 'in-progress' | 'completed'>(assignment.status);

  const captains = crewMembers.filter(member => 
    member.role?.toLowerCase().includes('captain') && member.status === 'active'
  );
  
  const coordinators = crewMembers.filter(member => 
    member.role?.toLowerCase().includes('coordinator') && member.status === 'active'
  );
  
  const otherCrew = crewMembers.filter(member => 
    !member.role?.toLowerCase().includes('captain') && 
    !member.role?.toLowerCase().includes('coordinator') && 
    member.status === 'active'
  );

  const updateAssignmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/staff/assignments/${assignment.id}`, data),
    onSuccess: () => {
      onUpdate();
    },
    onError: (error: Error) => {
      console.error('Assignment update failed:', error);
    }
  });

  const handleUpdate = () => {
    const updateData = {
      captainId: editedCaptainId,
      coordinatorId: editedCoordinatorId,
      crewMemberIds: editedCrewMemberIds,
      briefingTime: editedBriefingTime,
      notes: editedNotes,
      status: editedStatus
    };

    updateAssignmentMutation.mutate(updateData);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-950 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl text-purple-400 flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Edit Assignment
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
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
                <div className="text-white font-medium">{assignment.booking.yachtName || 'Unknown Yacht'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Member</div>
                <div className="text-white">{assignment.booking.memberName || 'Unknown Member'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Guests</div>
                <div className="text-white">{assignment.booking.guestCount} people</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Duration</div>
                <div className="text-white">{assignment.duration || 'TBD'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crew Assignment - Editable */}
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
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <Crown className="h-4 w-4" />
                  <span className="font-medium">Captain</span>
                </div>
                <Select value={editedCaptainId?.toString() || ""} onValueChange={(value) => setEditedCaptainId(parseInt(value))}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600">
                    <SelectValue placeholder="Select Captain" />
                  </SelectTrigger>
                  <SelectContent>
                    {captains.map((captain: CrewMember) => (
                      <SelectItem key={captain.id} value={captain.id.toString()}>
                        {captain.username} ({captain.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Coordinator</span>
                </div>
                <Select value={editedCoordinatorId?.toString() || ""} onValueChange={(value) => setEditedCoordinatorId(parseInt(value))}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators.map((coordinator: CrewMember) => (
                      <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                        {coordinator.username} ({coordinator.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Briefing Time</span>
              </div>
              <input
                type="datetime-local"
                value={editedBriefingTime}
                onChange={(e) => setEditedBriefingTime(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Additional Crew Selection */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Additional Crew Members</div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {otherCrew.map((member: CrewMember) => (
                  <div key={member.id} className="flex items-center space-x-2 p-2 bg-gray-700/30 rounded">
                    <input
                      type="checkbox"
                      id={`edit-crew-${member.id}`}
                      checked={editedCrewMemberIds.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditedCrewMemberIds([...editedCrewMemberIds, member.id]);
                        } else {
                          setEditedCrewMemberIds(editedCrewMemberIds.filter(id => id !== member.id));
                        }
                      }}
                      className="rounded border-gray-700 bg-gray-700 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">{member.username}</p>
                      <p className="text-gray-400 text-xs">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requests & Notes */}
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
            <div>
              <div className="text-gray-400 text-sm mb-1">Assignment Notes</div>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this crew assignment..."
                rows={4}
                className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <ToggleLeft className="h-5 w-5" />
              Assignment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={editedStatus} onValueChange={(value: 'planned' | 'in-progress' | 'completed') => setEditedStatus(value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" className="border-gray-600 text-gray-400">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Update Assignment
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
function ViewBookingDetailsDialog({ booking }: { booking: YachtBooking | null }) {
  if (!booking) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-950 border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl text-purple-400 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Booking Details - {booking.yachtName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Booking Status */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <Badge 
                variant="outline" 
                className="border-gray-600 bg-gray-600 text-white"
              >
                {booking.status || 'Completed'}
              </Badge>
              <div className="text-gray-400 text-sm uppercase tracking-wide mt-2">Current Status</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{booking.guestCount}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Guests</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{booking.memberTier}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Member Tier</div>
            </div>
          </CardContent>
        </Card>

        {/* Yacht Information */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Yacht Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Yacht Name</div>
              <div className="text-white font-medium">{booking.yachtName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Member</div>
              <div className="text-white">{booking.memberName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Booking Duration</div>
              <div className="text-white">{formatBookingTime(booking.startTime, booking.endTime)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Guest Count</div>
              <div className="text-white">{booking.guestCount} people</div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Timeline */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Trip Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-green-400">Start Time</span>
                </div>
                <div className="text-white font-medium">
                  {new Date(booking.startTime).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-400">End Time</span>
                </div>
                <div className="text-white font-medium">
                  {new Date(booking.endTime).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requests */}
        {booking.specialRequests && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Special Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white bg-orange-900/20 p-3 rounded text-sm border border-orange-700/50">
                {booking.specialRequests}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Information */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-indigo-400 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Booking ID</div>
              <div className="text-white font-mono">#{booking.id}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Created Date</div>
              <div className="text-white">
                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Membership Tier</div>
              <div className="text-white capitalize">{booking.memberTier}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Booking Type</div>
              <div className="text-white">Yacht Charter</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}
