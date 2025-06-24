import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Clock, Settings, Plus, Ship, User, CheckCircle } from 'lucide-react';
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

export default function CrewManagementPage() {
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [selectedFirstMate, setSelectedFirstMate] = useState<string>('');
  const [selectedCrewMembers, setSelectedCrewMembers] = useState<string[]>([]);
  const [briefingTime, setBriefingTime] = useState<string>('');
  const [briefingLocation, setBriefingLocation] = useState<string>('Miami Marina Gate 3');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch crew assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/crew/assignments'],
    staleTime: 1 * 60 * 1000,
    retry: 3,
  });

  // Fetch staff data
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch yachts data
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: ['/api/admin/yachts'],
    staleTime: 5 * 60 * 1000,
  });

  // Filter crew members by role with safe access
  const availableCaptains = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member?.role && ['captain', 'Captain', 'Yacht Captain'].includes(member.role)
  );

  const availableFirstMates = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member?.role && ['first_mate', 'First Mate', 'first mate'].includes(member.role)
  );

  const availableCrewMembers = (Array.isArray(staff) ? staff : []).filter((member: StaffMember) =>
    member?.role && !['admin', 'captain', 'Captain', 'first_mate', 'First Mate'].includes(member.role)
  );

  // Create crew assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await apiRequest('POST', '/api/crew/assignments', assignmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
      toast({
        title: "Assignment Created",
        description: "Crew assignment has been successfully created.",
      });
      setIsAssignDialogOpen(false);
      resetForm();
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
    setBriefingLocation('Miami Marina Gate 3');
    setAssignmentNotes('');
    setSelectedBooking('');
  };

  const handleCreateAssignment = () => {
    if (!selectedCaptain || !selectedBooking) {
      toast({
        title: "Missing Information",
        description: "Please select a captain and booking.",
        variant: "destructive",
      });
      return;
    }

    const assignmentData = {
      bookingId: parseInt(selectedBooking),
      captainId: parseInt(selectedCaptain),
      firstMateId: selectedFirstMate ? parseInt(selectedFirstMate) : null,
      crewMemberIds: selectedCrewMembers.map(id => parseInt(id)),
      briefingTime: briefingTime || new Date().toISOString(),
      briefingLocation,
      assignmentNotes,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const handleCrewMemberToggle = (memberId: string) => {
    setSelectedCrewMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (assignmentsLoading || staffLoading || yachtsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading crew management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Crew Management</h1>
              <p className="text-gray-300">Assign and manage yacht crew for upcoming charters</p>
            </div>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create Crew Assignment</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Booking Selection */}
                  <div>
                    <Label htmlFor="booking" className="text-sm font-medium text-gray-300">
                      Select Booking
                    </Label>
                    <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Choose a booking..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="8">Marina Breeze - demo_member (June 23, 2025)</SelectItem>
                        <SelectItem value="9">Azure Elegance - member_2 (June 24, 2025)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Captain Selection */}
                  <div>
                    <Label htmlFor="captain" className="text-sm font-medium text-gray-300">
                      Captain
                    </Label>
                    <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select captain..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {availableCaptains.map((captain: StaffMember) => (
                          <SelectItem key={captain.id} value={captain.id.toString()}>
                            {captain.username || captain.email || `Captain ${captain.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* First Mate Selection */}
                  <div>
                    <Label htmlFor="firstMate" className="text-sm font-medium text-gray-300">
                      First Mate (Optional)
                    </Label>
                    <Select value={selectedFirstMate} onValueChange={setSelectedFirstMate}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select first mate..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {availableFirstMates.map((firstMate: StaffMember) => (
                          <SelectItem key={firstMate.id} value={firstMate.id.toString()}>
                            {firstMate.username || firstMate.email || `First Mate ${firstMate.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Crew Members Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-3 block">
                      Additional Crew Members
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {availableCrewMembers.map((member: StaffMember) => (
                        <div
                          key={member.id}
                          onClick={() => handleCrewMemberToggle(member.id.toString())}
                          className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedCrewMembers.includes(member.id.toString())
                              ? 'bg-purple-600/20 border-purple-500'
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          }`}
                        >
                          <span className="text-sm text-white">
                            {member.username || member.email || `Crew ${member.id}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Briefing Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="briefingTime" className="text-sm font-medium text-gray-300">
                        Briefing Time
                      </Label>
                      <Input
                        id="briefingTime"
                        type="datetime-local"
                        value={briefingTime}
                        onChange={(e) => setBriefingTime(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="briefingLocation" className="text-sm font-medium text-gray-300">
                        Briefing Location
                      </Label>
                      <Input
                        id="briefingLocation"
                        value={briefingLocation}
                        onChange={(e) => setBriefingLocation(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Assignment Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-300">
                      Assignment Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Special instructions or notes for the crew..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateAssignment}
                      disabled={createAssignmentMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {createAssignmentMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Assignment
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAssignDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
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
                  <p className="text-gray-400 text-sm">Upcoming Charters</p>
                  <p className="text-white text-2xl font-bold">
                    {assignments.filter((a: CrewAssignment) => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crew Assignments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Current Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No crew assignments yet</p>
                  <p className="text-gray-500">Create your first assignment to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment: CrewAssignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white text-lg font-semibold">
                              {assignment.booking.yachtName}
                            </h3>
                            <Badge className={`${getStatusColor(assignment.status)} text-white border-0`}>
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-gray-300">
                            {formatDateTime(assignment.booking.startTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Member</p>
                          <p className="text-white font-semibold">{assignment.booking.memberName}</p>
                        </div>
                      </div>

                      {/* Crew Details */}
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

                      {/* Additional Info */}
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
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}