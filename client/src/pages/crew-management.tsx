import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Users, Clock, CheckCircle, Activity, AlertTriangle, 
  Crown, Shield, Anchor, Coffee, Utensils, Settings,
  UserPlus, ToggleLeft, Eye, Edit, Pause
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface CrewMember {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  location?: string;
}

interface YachtBooking {
  id: number;
  member: { name: string; membershipTier: string };
  yacht: { name: string; size: number; capacity: number };
  startTime: string;
  endTime: string;
  guestCount: number;
  status: string;
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

// Utility functions
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'planned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'planned': return <Clock className="h-4 w-4" />;
    case 'in-progress': return <Activity className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'active': return <CheckCircle className="h-4 w-4" />;
    case 'inactive': return <Pause className="h-4 w-4" />;
    case 'suspended': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getCrewRoleIcon = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'captain': return <Crown className="h-4 w-4" />;
    case 'first mate': return <Shield className="h-4 w-4" />;
    case 'coordinator': return <Users className="h-4 w-4" />;
    case 'crew': return <Anchor className="h-4 w-4" />;
    case 'steward': return <Coffee className="h-4 w-4" />;
    case 'chef': return <Utensils className="h-4 w-4" />;
    case 'engineer': return <Settings className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

export default function CrewManagementPage() {
  const [selectedBooking, setSelectedBooking] = useState<YachtBooking | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/crew/assignments'],
  });

  // Mutations
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await apiRequest('POST', '/api/crew/assignments', assignmentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
      toast({ title: "Success", description: "Crew assignment created successfully" });
      setAssignmentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (staffLoading || bookingsLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading crew management...</div>
      </div>
    );
  }

  const availableBookings = bookings.filter((booking: YachtBooking) => 
    !assignments.some((assignment: CrewAssignment) => assignment.bookingId === booking.id)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Crew Management</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Coordinate yacht crews and manage assignments for optimal service delivery
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Crew</p>
                  <p className="text-2xl font-bold text-purple-400">{staff.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Assignments</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {assignments.filter((a: CrewAssignment) => a.status === 'in-progress').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Bookings</p>
                  <p className="text-2xl font-bold text-green-400">{availableBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {assignments.filter((a: CrewAssignment) => a.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crew Members Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crew Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((member: CrewMember) => (
                <Card key={member.id} className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCrewRoleIcon(member.role)}
                        <span className="font-medium">{member.username}</span>
                      </div>
                      <Badge className={getStatusColor(member.status)}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1 capitalize">{member.status}</span>
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Role: {member.role}</p>
                      <p>Email: {member.email}</p>
                      {member.phone && <p>Phone: {member.phone}</p>}
                      {member.location && <p>Location: {member.location}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Current Assignments</h2>
          <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Crew Assignment</DialogTitle>
              </DialogHeader>
              <CrewAssignmentForm 
                staff={staff}
                bookings={availableBookings}
                onSubmit={(data) => createAssignmentMutation.mutate(data)}
                isLoading={createAssignmentMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {assignments.map((assignment: CrewAssignment) => (
            <Card key={assignment.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Assignment #{assignment.id}</h3>
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-purple-400 mb-2">Captain</h4>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span>{assignment.captain?.username || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-400 mb-2">Coordinator</h4>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span>{assignment.coordinator?.username || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-400 mb-2">Crew Members</h4>
                    <div className="space-y-1">
                      {assignment.crewMembers?.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 text-sm">
                          {getCrewRoleIcon(member.role)}
                          <span>{member.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {assignment.notes && (
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-300 mb-1">Notes</h4>
                    <p className="text-sm text-gray-400">{assignment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {assignments.length === 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No assignments yet</h3>
                <p className="text-gray-500 mb-4">Create your first crew assignment to get started</p>
                <Button 
                  onClick={() => setAssignmentDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Assignment Form Component
function CrewAssignmentForm({ 
  staff, 
  bookings, 
  onSubmit, 
  isLoading 
}: { 
  staff: CrewMember[]; 
  bookings: YachtBooking[]; 
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const captains = staff.filter(member => member.role.toLowerCase() === 'captain');
  const coordinators = staff.filter(member => member.role.toLowerCase() === 'coordinator');
  const crewMembers = staff.filter(member => 
    !['captain', 'coordinator'].includes(member.role.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBooking || !selectedCaptain || !selectedCoordinator) {
      return;
    }

    onSubmit({
      bookingId: parseInt(selectedBooking),
      captainId: parseInt(selectedCaptain),
      coordinatorId: parseInt(selectedCoordinator),
      crewMemberIds: selectedCrew.map(id => parseInt(id)),
      notes,
      status: 'planned'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Select Booking</label>
        <Select value={selectedBooking} onValueChange={setSelectedBooking}>
          <SelectTrigger className="bg-gray-700 border-gray-600">
            <SelectValue placeholder="Choose a booking..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {bookings.map((booking: YachtBooking) => (
              <SelectItem key={booking.id} value={booking.id.toString()}>
                {booking.yacht.name} - {booking.member.name} ({new Date(booking.startTime).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Captain</label>
          <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select captain..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {captains.map((captain) => (
                <SelectItem key={captain.id} value={captain.id.toString()}>
                  {captain.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Coordinator</label>
          <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select coordinator..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {coordinators.map((coordinator) => (
                <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                  {coordinator.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Additional Crew Members</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {crewMembers.map((member) => (
            <label key={member.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCrew.includes(member.id.toString())}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCrew([...selectedCrew, member.id.toString()]);
                  } else {
                    setSelectedCrew(selectedCrew.filter(id => id !== member.id.toString()));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{member.username} ({member.role})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special instructions or notes..."
          className="bg-gray-700 border-gray-600"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={isLoading || !selectedBooking || !selectedCaptain || !selectedCoordinator}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
        >
          {isLoading ? 'Creating...' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
}