import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, Clock, MapPin, Ship, UserCheck, Calendar, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CrewManagement() {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedCaptain, setSelectedCaptain] = useState<number | null>(null);
  const [selectedFirstMate, setSelectedFirstMate] = useState<number | null>(null);
  const [additionalCrew, setAdditionalCrew] = useState<number[]>([]);
  const [briefingTime, setBriefingTime] = useState('');
  const [briefingLocation, setBriefingLocation] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const crewData = useQuery({
    queryKey: ['/api/admin/staff'],
    enabled: true
  });

  const assignmentsData = useQuery({
    queryKey: ['/api/crew/assignments'],
    enabled: true
  });

  const bookingsData = useQuery({
    queryKey: ['/api/admin/bookings'],
    enabled: true
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await apiRequest('POST', '/api/crew/assignments', assignmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crew/assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
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
    setSelectedBookingId(null);
    setSelectedCaptain(null);
    setSelectedFirstMate(null);
    setAdditionalCrew([]);
    setBriefingTime('');
    setBriefingLocation('');
    setAssignmentNotes('');
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
      captainId: selectedCaptain,
      firstMateId: selectedFirstMate,
      crewMemberIds: additionalCrew,
      briefingTime,
      briefingLocation,
      notes: assignmentNotes,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const crew = crewData.data || [];
  const assignments = assignmentsData.data || [];
  const bookings = bookingsData.data || [];

  // Filter crew by role
  const captains = crew.filter(member => member.role === 'captain');
  const firstMates = crew.filter(member => member.role === 'first_mate');
  const crewMembers = crew.filter(member => member.role === 'crew_member');

  // Filter bookings
  const unassignedBookings = bookings.filter(booking => 
    !assignments.some(assignment => assignment.bookingId === booking.id)
  );
  
  const activeAssignments = assignments.filter(assignment => {
    const booking = bookings.find(b => b.id === assignment.bookingId);
    return booking && new Date(booking.startTime) > new Date();
  });
  
  const pastAssignments = assignments.filter(assignment => {
    const booking = bookings.find(b => b.id === assignment.bookingId);
    return booking && new Date(booking.startTime) <= new Date();
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Crew Management
          </h1>
          <p className="text-gray-400 text-lg">Manage yacht crew assignments and scheduling</p>
        </div>

        <div className="grid gap-6">
          {/* Unassigned Bookings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Unassigned Bookings ({unassignedBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {unassignedBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No unassigned bookings</p>
                ) : (
                  unassignedBookings.map((booking) => (
                    <div key={booking.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white">Booking #{booking.id}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <Ship className="w-4 h-4" />
                              {booking.yacht?.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {booking.guestCount} guests
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Member: {booking.member?.name}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setIsAssignDialogOpen(true);
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assign Crew
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Assignments */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Assignments ({activeAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {activeAssignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active assignments</p>
                ) : (
                  activeAssignments.map((assignment) => {
                    const booking = bookings.find(b => b.id === assignment.bookingId);
                    const captain = crew.find(c => c.id === assignment.captainId);
                    
                    return (
                      <div key={assignment.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-white">Booking #{assignment.bookingId}</h3>
                            <Badge className="bg-green-600 text-white">Active</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Captain:</span>
                              <span className="ml-2 text-white">{captain?.username || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Yacht:</span>
                              <span className="ml-2 text-white">{booking?.yacht?.name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date:</span>
                              <span className="ml-2 text-white">
                                {booking ? format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className="ml-2 text-white">{assignment.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Assignments */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Past Assignments ({pastAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {pastAssignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No past assignments</p>
                ) : (
                  pastAssignments.map((assignment) => {
                    const booking = bookings.find(b => b.id === assignment.bookingId);
                    const captain = crew.find(c => c.id === assignment.captainId);
                    
                    return (
                      <div key={assignment.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 opacity-75">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-white">Booking #{assignment.bookingId}</h3>
                            <Badge variant="secondary" className="bg-gray-600 text-gray-300">Completed</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Captain:</span>
                              <span className="ml-2 text-gray-300">{captain?.username || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Yacht:</span>
                              <span className="ml-2 text-gray-300">{booking?.yacht?.name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date:</span>
                              <span className="ml-2 text-gray-300">
                                {booking ? format(new Date(booking.startTime), 'MMM dd, yyyy') : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className="ml-2 text-gray-300">{assignment.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Dialog - Original Detailed Form */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Create Crew Assignment
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Select Booking */}
              <div>
                <Label className="text-lg font-semibold text-white mb-3 block">
                  Select Booking
                </Label>
                <Select value={selectedBookingId?.toString() || ''} onValueChange={(value) => setSelectedBookingId(Number(value))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                    <SelectValue placeholder="Choose a booking" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {unassignedBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id.toString()}>
                        Booking #{booking.id} - {booking.yacht?.name} - {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Captain Selection */}
              <div>
                <Label className="text-lg font-semibold text-white mb-3 block">
                  Captain *
                </Label>
                <Select value={selectedCaptain?.toString() || ''} onValueChange={(value) => setSelectedCaptain(Number(value))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                    <SelectValue placeholder="Select captain" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {captains.map((captain) => (
                      <SelectItem key={captain.id} value={captain.id.toString()}>
                        {captain.username} - {captain.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Mate Selection */}
              <div>
                <Label className="text-lg font-semibold text-white mb-3 block">
                  First Mate
                </Label>
                <Select value={selectedFirstMate?.toString() || 'none'} onValueChange={(value) => setSelectedFirstMate(value === 'none' ? null : Number(value))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                    <SelectValue placeholder="Select first mate (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="none">None</SelectItem>
                    {firstMates.map((mate) => (
                      <SelectItem key={mate.id} value={mate.id.toString()}>
                        {mate.username} - {mate.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Crew Members */}
              <div>
                <Label className="text-lg font-semibold text-white mb-3 block">
                  Additional Crew Members
                </Label>
                <div className="space-y-3">
                  {additionalCrew.map((crewId, index) => (
                    <div key={index} className="flex gap-2">
                      <Select value={crewId > 0 ? crewId.toString() : ''} onValueChange={(value) => {
                        const newCrew = [...additionalCrew];
                        newCrew[index] = Number(value);
                        setAdditionalCrew(newCrew);
                      }}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1">
                          <SelectValue placeholder="Select crew member" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {crewMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.username} - {member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCrew = additionalCrew.filter((_, i) => i !== index);
                          setAdditionalCrew(newCrew);
                        }}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdditionalCrew([...additionalCrew, crewMembers[0]?.id || 1])}
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Crew Member
                  </Button>
                </div>
              </div>

              {/* Briefing Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-semibold text-white mb-3 block">
                    Briefing Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={briefingTime}
                    onChange={(e) => setBriefingTime(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                    placeholder="mm/dd/yyyy, --:-- --"
                  />
                </div>
                <div>
                  <Label className="text-lg font-semibold text-white mb-3 block">
                    Briefing Location
                  </Label>
                  <Input
                    placeholder="Marina, dock number, etc."
                    value={briefingLocation}
                    onChange={(e) => setBriefingLocation(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                  />
                </div>
              </div>

              {/* Assignment Notes */}
              <div>
                <Label className="text-lg font-semibold text-white mb-3 block">
                  Assignment Notes
                </Label>
                <Textarea
                  placeholder="Special instructions, requirements, etc."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white resize-none h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button
                  onClick={handleCreateAssignment}
                  disabled={createAssignmentMutation.isPending || !selectedCaptain || !selectedBookingId}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-200 flex-1 h-12"
                >
                  {createAssignmentMutation.isPending ? 'Creating Assignment...' : 'Create Assignment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    resetForm();
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 h-12 px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}