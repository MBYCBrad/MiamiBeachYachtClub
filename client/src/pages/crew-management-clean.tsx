import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Clock, Plus, Ship, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CrewAssignment {
  id: string;
  bookingId: number;
  status: string;
  briefingTime: string;
  briefingLocation: string;
  notes: string;
  captain: {
    id: number;
    username: string;
    role: string;
  } | null;
  firstMate: {
    id: number;
    username: string;
    role: string;
  } | null;
  crewMembers: Array<{
    id: number;
    username: string;
    role: string;
  }>;
  booking: {
    id: number;
    startTime: string;
    endTime: string;
    guestCount: number;
    yachtName: string;
    memberName: string;
  };
}

interface StaffMember {
  id: number;
  username: string;
  role: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface Yacht {
  id: number;
  name: string;
  size: number;
  capacity: number;
}

export default function CrewManagement() {
  const [selectedCaptain, setSelectedCaptain] = useState('');
  const [selectedFirstMate, setSelectedFirstMate] = useState('');
  const [selectedCrewMembers, setSelectedCrewMembers] = useState<string[]>([]);
  const [briefingTime, setBriefingTime] = useState('');
  const [briefingLocation, setBriefingLocation] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/crew/assignments'],
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
  });

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: ['/api/yachts'],
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await apiRequest('POST', '/api/crew/assignments', assignmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
      setIsAssignDialogOpen(false);
      resetForm();
      toast({
        title: "Assignment Created",
        description: "Crew assignment has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to create crew assignment.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedCaptain('');
    setSelectedFirstMate('');
    setSelectedCrewMembers([]);
    setBriefingTime('');
    setBriefingLocation('');
    setAssignmentNotes('');
    setSelectedBookingId(null);
  };

  const handleCreateAssignment = () => {
    if (!selectedBookingId || !selectedCaptain) {
      toast({
        title: "Missing Information",
        description: "Please select a booking and captain.",
        variant: "destructive",
      });
      return;
    }

    const assignmentData = {
      bookingId: selectedBookingId,
      captainId: parseInt(selectedCaptain),
      firstMateId: selectedFirstMate ? parseInt(selectedFirstMate) : null,
      crewMemberIds: selectedCrewMembers.map(id => parseInt(id)),
      briefingTime,
      briefingLocation,
      assignmentNotes,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const availableCaptains = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member.role === 'captain'
  );

  const availableFirstMates = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member.role === 'first_mate'
  );

  const availableCrewMembers = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member.role === 'crew_member'
  );

  const unassignedBookings = (Array.isArray(assignments) ? assignments : [])
    .filter((a: CrewAssignment) => a.status === 'unassigned');

  const assignedBookings = (Array.isArray(assignments) ? assignments : [])
    .filter((a: CrewAssignment) => a.status !== 'unassigned');

  if (assignmentsLoading || staffLoading || yachtsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading crew management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Crew Management</h1>
          <p className="text-gray-400">Assign crew members to yacht bookings and manage schedules</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Total Assignments</p>
                  <p className="text-white text-2xl font-bold">{assignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Active Crew</p>
                  <p className="text-white text-2xl font-bold">{staff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Ship className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Available Yachts</p>
                  <p className="text-white text-2xl font-bold">{yachts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Pending Assignments</p>
                  <p className="text-white text-2xl font-bold">{unassignedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Assignments */}
        {unassignedBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">
                  Pending Crew Assignments ({unassignedBookings.length})
                </CardTitle>
                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Crew
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create Crew Assignment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Select Booking</Label>
                        <Select value={selectedBookingId?.toString() || ''} onValueChange={(value) => setSelectedBookingId(parseInt(value))}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Choose a booking" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {unassignedBookings.map((assignment: CrewAssignment) => (
                              <SelectItem key={assignment.bookingId} value={assignment.bookingId.toString()}>
                                {assignment.booking.yachtName} - {assignment.booking.memberName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">Captain *</Label>
                        <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select captain" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {availableCaptains.map((captain: StaffMember) => (
                              <SelectItem key={captain.id} value={captain.id.toString()}>
                                {captain.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">First Mate</Label>
                        <Select value={selectedFirstMate} onValueChange={setSelectedFirstMate}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select first mate (optional)" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {availableFirstMates.map((firstMate: StaffMember) => (
                              <SelectItem key={firstMate.id} value={firstMate.id.toString()}>
                                {firstMate.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">Additional Crew Members</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {availableCrewMembers.map((member: StaffMember) => (
                            <label key={member.id} className="flex items-center space-x-2 text-white">
                              <input
                                type="checkbox"
                                checked={selectedCrewMembers.includes(member.id.toString())}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCrewMembers([...selectedCrewMembers, member.id.toString()]);
                                  } else {
                                    setSelectedCrewMembers(selectedCrewMembers.filter(id => id !== member.id.toString()));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{member.username}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Briefing Time</Label>
                          <Input
                            type="datetime-local"
                            value={briefingTime}
                            onChange={(e) => setBriefingTime(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Briefing Location</Label>
                          <Input
                            value={briefingLocation}
                            onChange={(e) => setBriefingLocation(e.target.value)}
                            placeholder="Marina, dock number, etc."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Assignment Notes</Label>
                        <Textarea
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                          placeholder="Special instructions, requirements, etc."
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleCreateAssignment}
                          disabled={createAssignmentMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                        >
                          {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAssignDialogOpen(false)}
                          className="border-gray-600 text-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unassignedBookings.map((assignment: CrewAssignment) => (
                    <motion.div
                      key={assignment.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{assignment.booking.yachtName}</h3>
                          <p className="text-gray-400 text-sm">Member: {assignment.booking.memberName}</p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                          Unassigned
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(assignment.booking.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(assignment.booking.startTime).toLocaleTimeString()} - {new Date(assignment.booking.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {assignment.booking.guestCount} Guests
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Assignments */}
        {assignedBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Active Assignments ({assignedBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedBookings.map((assignment: CrewAssignment) => (
                    <motion.div
                      key={assignment.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold">{assignment.booking.yachtName}</h3>
                          <p className="text-gray-400 text-sm">Member: {assignment.booking.memberName}</p>
                        </div>
                        <Badge className="bg-green-600/20 text-green-400">
                          {assignment.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {assignment.captain && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-purple-600 text-white">
                                {(assignment.captain.username || 'C').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">{assignment.captain.username}</p>
                              <p className="text-gray-400 text-sm">Captain</p>
                            </div>
                          </div>
                        )}

                        {assignment.firstMate && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-indigo-600 text-white">
                                {(assignment.firstMate.username || 'F').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">{assignment.firstMate.username}</p>
                              <p className="text-gray-400 text-sm">First Mate</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">
                              {assignment.crewMembers.length} Crew Members
                            </p>
                            <p className="text-gray-400 text-sm">
                              {assignment.booking.guestCount} Guests
                            </p>
                          </div>
                        </div>
                      </div>

                      {(assignment.briefingLocation || assignment.notes) && (
                        <div className="pt-4 border-t border-gray-600">
                          {assignment.briefingLocation && (
                            <p className="text-gray-300 mb-2">
                              <strong>Briefing:</strong> {assignment.briefingLocation}
                            </p>
                          )}
                          {assignment.notes && (
                            <p className="text-gray-300">
                              <strong>Notes:</strong> {assignment.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}