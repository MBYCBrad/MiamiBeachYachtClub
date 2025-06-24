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

  // Fetch real staff data from database
  const { data: allStaff = [] } = useQuery<CrewMember[]>({
    queryKey: ['/api/admin/staff'],
  });

  // Filter real staff by roles
  const captains = allStaff.filter(member => member.role === 'captain');
  const firstMates = allStaff.filter(member => member.role === 'coordinator' || member.role === 'first_mate');
  const crewMembers = allStaff.filter(member => member.role === 'crew_member' || member.role === 'staff');

  const handleAssign = () => {
    const assignment = {
      bookingId: booking.id,
      captainId: parseInt(selectedCaptain),
      firstMateId: selectedFirstMate ? parseInt(selectedFirstMate) : null,
      crewMembers: selectedCrew.map(id => parseInt(id)),
      briefingTime: new Date(new Date(booking.startTime).getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before
      assignmentNotes: `Crew assignment for ${booking.yacht?.name || 'yacht'} charter`
    };
    onAssign(assignment);
  };

  return (
    <DialogContent className="bg-gray-900/98 border-gray-700/60 text-white max-w-5xl backdrop-blur-2xl rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-white flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Assign Crew
              </span>
              <div className="text-sm font-normal text-gray-300 mt-1">
                {booking.yacht?.name || 'Royal Serenity'} • {booking.guestCount} guests • {new Date(booking.startTime).toLocaleDateString()}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-2 gap-10">
          {/* Left Side - Enhanced Details */}
          <div className="space-y-6">
            {/* Yacht Details - Sophisticated Card */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-xl p-5 border border-gray-700/40 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
                  <Ship className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Yacht Details</h3>
              </div>
              
              {/* Yacht Image */}
              <div className="mb-4">
                <img 
                  src="/api/media/yachts/1/image" 
                  alt={booking.yacht?.name || 'Royal Serenity'}
                  className="w-full h-24 object-cover rounded-lg border border-gray-700/30"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgNDBMMTIwIDY0SDgwTDEwMCA0MFoiIGZpbGw9IiM2Mzc0OEUiLz4KPHBhdGggZD0iTTgwIDY0SDE2MEw5NSA4OEg0NSIgZmlsbD0iIzYzNzQ4RSIvPgo8L3N2Zz4K';
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium text-sm">Name:</span>
                  <span className="text-white font-semibold text-sm">{booking.yacht?.name || 'Royal Serenity'}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium text-sm">Type:</span>
                  <span className="text-white font-semibold text-sm">Luxury Motor Yacht</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium text-sm">Length:</span>
                  <span className="text-white font-semibold text-sm">65 ft</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium text-sm">Capacity:</span>
                  <span className="text-white font-semibold text-sm">24 guests</span>
                </div>
              </div>
            </div>

            {/* Booking Details - Sophisticated Card */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-2xl p-7 border border-gray-700/40 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-400/30">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Booking Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium">Date:</span>
                  <span className="text-white font-semibold">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium">Time:</span>
                  <span className="text-white font-semibold">{format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium">Duration:</span>
                  <span className="text-white font-semibold">4 hours</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium">Guests:</span>
                  <span className="text-white font-semibold">{booking.guestCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <span className="text-gray-400 font-medium">Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Crew Selection */}
          <div className="space-y-6">
            {/* Captain Selection */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-xl p-5 border border-gray-700/40 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-400/30">
                  <Crown className="w-4 h-4 text-orange-400" />
                </div>
                <label className="text-lg font-bold text-white">
                  Captain <span className="text-red-400">*</span>
                </label>
              </div>
              <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
                <SelectTrigger className="bg-gray-900/70 border-gray-600/60 text-white h-11 rounded-xl hover:border-purple-500/70 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-blue-600/10 transition-all duration-300 text-base font-medium shadow-lg">
                  <SelectValue placeholder="Select captain" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 rounded-xl shadow-2xl z-50">
                  {captains.length > 0 ? captains.map((captain) => (
                    <SelectItem key={captain.id} value={captain.id.toString()} className="text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 py-3 text-base font-medium rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        {captain.username}
                      </div>
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-captains" disabled className="text-gray-400">No captains available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* First Mate Selection */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-xl p-5 border border-gray-700/40 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-400/30">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <label className="text-lg font-bold text-white">First Mate</label>
              </div>
              <Select value={selectedFirstMate} onValueChange={setSelectedFirstMate}>
                <SelectTrigger className="bg-gray-900/70 border-gray-600/60 text-white h-11 rounded-xl hover:border-purple-500/70 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-blue-600/10 transition-all duration-300 text-base font-medium shadow-lg">
                  <SelectValue placeholder="Select first mate (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 rounded-xl shadow-2xl z-50">
                  {firstMates.length > 0 ? firstMates.map((mate) => (
                    <SelectItem key={mate.id} value={mate.id.toString()} className="text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 py-3 text-base font-medium rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        {mate.username}
                      </div>
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-mates" disabled className="text-gray-400">No first mates available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Crew Members */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-xl p-5 border border-gray-700/40 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-2 rounded-lg border border-green-400/30">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <label className="text-lg font-bold text-white">Additional Crew Members</label>
              </div>
              <div className="space-y-3">
                {crewMembers.length > 0 ? crewMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`crew-${member.id}`}
                        checked={selectedCrew.includes(member.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCrew([...selectedCrew, member.id.toString()]);
                          } else {
                            setSelectedCrew(selectedCrew.filter(id => id !== member.id.toString()));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <label htmlFor={`crew-${member.id}`} className="text-white font-medium cursor-pointer text-sm">
                        {member.username}
                      </label>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {member.role.replace('_', ' ')}
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-400 text-center py-4">No additional crew members available</div>
                )}
              </div>
            </div>

            {/* Enhanced Assign Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleAssign}
                disabled={!selectedCaptain}
                className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 text-base border border-purple-500/20 hover:border-purple-400/40"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Crew
              </Button>
            </div>
          </div>
        </div>
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