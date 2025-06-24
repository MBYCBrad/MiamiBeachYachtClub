import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Ship, AlertTriangle, UserCheck, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

// Types
interface CrewAssignment {
  id: string;
  bookingId: number;
  staffIds: number[];
  status: string;
  assignedDate: string;
  specialInstructions?: string;
  captainId?: number;
  firstMateId?: number;
}

interface Booking {
  id: number;
  yacht?: { name: string };
  member?: { name: string };
  membershipTier?: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  location?: string;
}

interface CrewMember {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  certifications?: string[];
  rating?: number;
}

interface AssignCrewDialogProps {
  booking: Booking;
  crew: CrewMember[];
  onAssign: (assignment: any) => void;
}

function AssignCrewDialog({ booking, crew, onAssign }: AssignCrewDialogProps) {
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [selectedFirstMate, setSelectedFirstMate] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  const captains = crew.filter(member => member.role === 'captain' && member.status === 'available');
  const firstMates = crew.filter(member => member.role === 'first_mate' && member.status === 'available');
  const crewMembers = crew.filter(member => member.role === 'crew_member' && member.status === 'available');

  const handleAssign = () => {
    const assignment = {
      bookingId: booking.id,
      captainId: parseInt(selectedCaptain),
      firstMateId: selectedFirstMate ? parseInt(selectedFirstMate) : null,
      crewMembers: selectedCrew.map(id => parseInt(id)),
      briefingTime: new Date(booking.startTime).toISOString(),
      assignmentNotes: `Crew assignment for ${booking.yacht?.name || 'yacht'} charter`
    };
    onAssign(assignment);
  };

  return (
    <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Assign Crew</DialogTitle>
        <div className="text-sm text-gray-400">
          {booking.yacht?.name} • {booking.guestCount} guests
        </div>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Captain *</label>
          <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue placeholder="Select captain" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {captains.map(captain => (
                <SelectItem key={captain.id} value={captain.id.toString()}>
                  {captain.username} • ⭐ {captain.rating}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">First Mate</label>
          <Select value={selectedFirstMate} onValueChange={setSelectedFirstMate}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue placeholder="Select first mate" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {firstMates.map(mate => (
                <SelectItem key={mate.id} value={mate.id.toString()}>
                  {mate.username} • ⭐ {mate.rating}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleAssign}
          disabled={!selectedCaptain}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Assign Crew
        </Button>
      </div>
    </DialogContent>
  );
}

export default function CrewManagementComponent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff data
  const { data: staff = [] } = useQuery<CrewMember[]>({
    queryKey: ['/api/admin/staff'],
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery<CrewAssignment[]>({
    queryKey: ['/api/crew/assignments'],
  });

  // Fetch bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings'],
  });

  // Assign crew mutation
  const assignCrewMutation = useMutation({
    mutationFn: async (assignment: any) => {
      const response = await apiRequest('POST', '/api/crew/assignments', assignment);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Crew assigned successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Assignment failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Filter bookings requiring crew (no existing assignment)
  const bookingsRequiringCrew = bookings.filter(booking => 
    !assignments.some(assignment => assignment.bookingId === booking.id)
  );

  // Split assignments into active and past
  const now = new Date();
  const activeAssignments = assignments.filter(assignment => {
    const booking = bookings.find(b => b.id === assignment.bookingId);
    return booking && new Date(booking.startTime) >= now;
  });

  const pastAssignments = assignments.filter(assignment => {
    const booking = bookings.find(b => b.id === assignment.bookingId);
    return booking && new Date(booking.startTime) < now;
  });

  const handleAssignCrew = (assignment: any) => {
    assignCrewMutation.mutate(assignment);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600 p-2 rounded-lg">
          <Ship className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Crew Management Center</h1>
          <p className="text-gray-400">Real-time crew coordination & yacht service delivery</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-gray-400 text-sm">Bookings</p>
                <p className="text-3xl font-bold">{bookingsRequiringCrew.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-gray-400 text-sm">Crew</p>
                <p className="text-3xl font-bold">{staff.filter(s => s.status === 'available').length}</p>
              </div>
              <UserCheck className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-gray-400 text-sm">Assignments</p>
                <p className="text-3xl font-bold">{activeAssignments.length}</p>
              </div>
              <Ship className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-gray-400 text-sm">Assignments</p>
                <p className="text-3xl font-bold">{bookingsRequiringCrew.length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Requiring Crew */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-xl">Bookings Requiring Crew</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                {bookingsRequiringCrew.length} pending
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Priority-ordered by membership tier</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingsRequiringCrew.map((booking) => (
              <Card key={booking.id} className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        booking.membershipTier === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                        booking.membershipTier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                        booking.membershipTier === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {booking.membershipTier}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-200"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Assign Crew
                        </Button>
                      </DialogTrigger>
                      <AssignCrewDialog 
                        booking={booking} 
                        crew={staff} 
                        onAssign={handleAssignCrew}
                      />
                    </Dialog>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">
                    {booking.yacht?.name || 'Yacht Charter'} • {booking.guestCount} guests
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(booking.startTime), 'M/d/yyyy \'at\' h:mm a')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {booking.location || 'Marina Bay'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {bookingsRequiringCrew.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bookings requiring crew assignments
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crew Members */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-500" />
                <CardTitle className="text-xl">Crew Members</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                All {staff.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {staff.map((member) => (
              <Card key={member.id} className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {member.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{member.username}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {member.status}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400">⭐ {member.rating || 5.0}/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {staff.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No crew members available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
            Active Assignments ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
            Past Assignments ({pastAssignments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activeAssignments.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center text-gray-500">
                No active assignments
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => {
                const booking = bookings.find(b => b.id === assignment.bookingId);
                return (
                  <Card key={assignment.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{booking?.yacht?.name || 'Yacht Charter'}</h3>
                          <p className="text-sm text-gray-400">
                            {booking && format(new Date(booking.startTime), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {pastAssignments.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center text-gray-500">
                No past assignments
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAssignments.map((assignment) => {
                const booking = bookings.find(b => b.id === assignment.bookingId);
                return (
                  <Card key={assignment.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{booking?.yacht?.name || 'Yacht Charter'}</h3>
                          <p className="text-sm text-gray-400">
                            {booking && format(new Date(booking.startTime), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                        <Badge className="bg-gray-500/20 text-gray-400">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}