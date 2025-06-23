import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Plus, 
  Filter, 
  Search,
  Anchor,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';

// Interface definitions
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
  status: 'planned' | 'assigned' | 'active' | 'completed';
  briefingTime: string;
  notes: string;
}

export default function CrewManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  // Fetch staff data (crew members)
  const { data: crewMembers = [], isLoading: crewLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
  });

  // Fetch bookings that need crew assignments
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  // Fetch existing crew assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/crew/assignments'],
  });

  // Create crew assignment mutation
  const createAssignment = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await fetch('/api/crew/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
      toast({ title: "Success", description: "Crew assignment created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create crew assignment", variant: "destructive" });
    },
  });

  const getBookingPriority = (booking: YachtBooking) => {
    const guestCount = booking.guestCount || 0;
    const hasServices = booking.services && booking.services.length > 0;
    
    if (guestCount > 8 || hasServices) return 'high';
    if (guestCount > 4) return 'medium';
    return 'low';
  };

  const filteredCrewMembers = crewMembers.filter((member: CrewMember) => {
    const matchesSearch = member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const upcomingBookings = bookings.filter((booking: YachtBooking) => 
    new Date(booking.startTime) > new Date() && booking.status === 'confirmed'
  );

  if (crewLoading || bookingsLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Rolls Royce Starfield Background */}
      <div className="rolls-royce-starfield"></div>
      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Crew Management
            </h1>
            <p className="text-xl text-gray-300">
              Coordinate yacht crew assignments and staff scheduling
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{crewMembers.length}</p>
                    <p className="text-gray-400">Total Crew</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {crewMembers.filter((member: CrewMember) => member.status === 'active').length}
                    </p>
                    <p className="text-gray-400">Active Crew</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
                    <p className="text-gray-400">Pending Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{assignments.length}</p>
                    <p className="text-gray-400">Active Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search crew members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700/50 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700/50 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700/50 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="captain">Captain</SelectItem>
                <SelectItem value="first mate">First Mate</SelectItem>
                <SelectItem value="crew">Crew Member</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Crew Members List */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Crew Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {filteredCrewMembers.map((member: CrewMember) => (
                  <div key={member.id} className="p-4 border border-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{member.username}</h3>
                      <Badge 
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className={
                          member.status === 'active' ? 'bg-green-600' :
                          member.status === 'inactive' ? 'bg-gray-600' : 'bg-red-600'
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{member.role}</p>
                    <p className="text-sm text-gray-400">{member.email}</p>
                    {member.location && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Bookings Requiring Crew */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pending Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {upcomingBookings.map((booking: YachtBooking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{booking.yacht.name}</h3>
                      <Badge 
                        className={
                          getBookingPriority(booking) === 'high' ? 'bg-red-600' :
                          getBookingPriority(booking) === 'medium' ? 'bg-orange-600' : 'bg-green-600'
                        }
                      >
                        {getBookingPriority(booking)} priority
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.startTime).toLocaleDateString()} at{' '}
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p>Guest: {booking.member.name} ({booking.member.membershipTier})</p>
                      <p>{booking.guestCount} guests • {booking.yacht.size}ft yacht</p>
                    </div>
                    <div className="mt-3">
                      <CrewAssignmentDialog
                        booking={booking}
                        crewMembers={crewMembers}
                        onAssign={createAssignment}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
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
  const [briefingTime, setBriefingTime] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch live staff data from the database
  const { data: staffData = [] } = useQuery({
    queryKey: ['/api/admin/staff'],
  });

  // Filter for maritime roles
  const captains = staffData.filter((member: any) => 
    member.role.toLowerCase().includes('captain')
  );
  const coordinators = staffData.filter((member: any) => 
    member.role.toLowerCase().includes('coordinator') || 
    member.role.toLowerCase().includes('manager')
  );
  const crewMembersList = staffData.filter((member: any) => 
    member.role.toLowerCase().includes('mate') || 
    member.role.toLowerCase().includes('crew') ||
    member.role.toLowerCase().includes('dock')
  );

  const handleAssign = () => {
    if (!selectedCaptain || !selectedCoordinator || selectedCrew.length === 0) {
      return;
    }

    const assignmentData = {
      id: `assignment_${Date.now()}`,
      bookingId: booking.id,
      captainId: selectedCaptain,
      coordinatorId: selectedCoordinator,
      crewMemberIds: selectedCrew,
      status: 'assigned',
      briefingTime,
      notes,
    };

    onAssign.mutate(assignmentData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Assign Crew
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Assign Crew to {booking.yacht.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                <Anchor className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Date & Time</p>
                  <p className="text-white">
                    {new Date(booking.startTime).toLocaleDateString()} at{' '}
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white">
                    {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60))} hours
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Guest Count</p>
                  <p className="text-white">{booking.guestCount} guests</p>
                </div>
                <div>
                  <p className="text-gray-400">Member</p>
                  <p className="text-white">{booking.member.name}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm">Special Requests</p>
                  <p className="text-white text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Captain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Captain *
            </label>
            <Select value={selectedCaptain?.toString()} onValueChange={(value) => setSelectedCaptain(Number(value))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Choose a captain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {captains.map((captain: any) => (
                  <SelectItem key={captain.id} value={captain.id.toString()}>
                    {captain.username} - {captain.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coordinator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Coordinator *
            </label>
            <Select value={selectedCoordinator?.toString()} onValueChange={(value) => setSelectedCoordinator(Number(value))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Choose a coordinator" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {coordinators.map((coordinator: any) => (
                  <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                    {coordinator.username} - {coordinator.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crew Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Crew Members * (Recommended: {Math.ceil(booking.guestCount / 8) + 1} members)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-700 rounded p-2">
              {crewMembersList.map((member: any) => (
                <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCrew.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCrew([...selectedCrew, member.id]);
                      } else {
                        setSelectedCrew(selectedCrew.filter(id => id !== member.id));
                      }
                    }}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm">{member.username} - {member.role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Briefing Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Briefing Time
            </label>
            <Input
              type="datetime-local"
              value={briefingTime}
              onChange={(e) => setBriefingTime(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assignment Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions, safety considerations, etc."
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>

          {/* Assignment Button */}
          <Button
            onClick={handleAssign}
            disabled={!selectedCaptain || !selectedCoordinator || selectedCrew.length === 0 || onAssign.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 px-8"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {onAssign.isPending ? "Assigning..." : "Assign Crew Team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}