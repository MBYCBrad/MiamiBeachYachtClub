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
  AlertTriangle, CheckCircle2, UserPlus, Settings, 
  Anchor, Waves, Crown, Shield, Coffee, Utensils
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: number;
  name: string;
  role: string;
  specialization: string;
  rating: number;
  experience: number;
  certifications: string[];
  availability: 'available' | 'assigned' | 'off-duty';
  phone: string;
  email: string;
  avatar?: string;
  languages: string[];
  currentAssignment?: string;
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
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<YachtBooking | null>(null);
  const [crewFilter, setCrewFilter] = useState("all");
  const [assignmentDialog, setAssignmentDialog] = useState(false);

  // Fetch active bookings requiring crew assignment
  const { data: activeBookings = [] } = useQuery<YachtBooking[]>({
    queryKey: ["/api/admin/bookings"],
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available crew members
  const { data: crewMembers = [] } = useQuery<CrewMember[]>({
    queryKey: ["/api/crew/members"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch crew assignments
  const { data: crewAssignments = [] } = useQuery<CrewAssignment[]>({
    queryKey: ["/api/crew/assignments"],
    staleTime: 2 * 60 * 1000,
  });

  const createCrewAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await apiRequest("POST", "/api/crew/assignments", assignmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/members"] });
      toast({
        title: "Crew Assignment Created",
        description: "Crew successfully assigned to booking",
      });
      setAssignmentDialog(false);
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
        description: "Crew assignment status updated successfully",
      });
    },
  });

  const filteredCrewMembers = crewMembers.filter(member => 
    crewFilter === "all" || member.availability === crewFilter
  );

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
    return membershipPriority[booking.member.membershipTier as keyof typeof membershipPriority] || 1;
  };

  const prioritizedBookings = activeBookings
    .filter(booking => booking.status === 'confirmed')
    .sort((a, b) => getBookingPriority(b) - getBookingPriority(a));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/yacht-pattern.svg')] opacity-5"></div>
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0] 
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Ship className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Crew Management Center</h1>
              <p className="text-slate-300">Real-time crew coordination & yacht service delivery</p>
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
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Bookings</p>
                  <p className="text-2xl font-bold text-white">{prioritizedBookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Available Crew</p>
                  <p className="text-2xl font-bold text-white">
                    {crewMembers.filter(m => m.availability === 'available').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Assignments</p>
                  <p className="text-2xl font-bold text-white">{crewAssignments.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Service Quality</p>
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Bookings Requiring Crew */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
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
                <CardDescription className="text-slate-400">
                  Priority-ordered by membership tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {prioritizedBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
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
                        <p className="text-slate-300 text-sm">{booking.yacht.name} • {booking.guestCount} guests</p>
                      </div>
                      <Dialog open={assignmentDialog && selectedBooking?.id === booking.id} onOpenChange={setAssignmentDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Crew
                          </Button>
                        </DialogTrigger>
                        <CrewAssignmentDialog 
                          booking={booking}
                          crewMembers={crewMembers}
                          onAssign={createCrewAssignmentMutation}
                        />
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Marina Bay
                      </div>
                    </div>

                    {booking.services.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-400 mb-2">Concierge Services ({booking.services.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.services.slice(0, 3).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {service.name}
                            </Badge>
                          ))}
                          {booking.services.length > 3 && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              +{booking.services.length - 3} more
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
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Crew Members</CardTitle>
                  <Select value={crewFilter} onValueChange={setCrewFilter}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Crew</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="off-duty">Off Duty</SelectItem>
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
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCrewRoleIcon(member.role)}
                          <span className="font-medium text-white">{member.name}</span>
                          <Badge 
                            className={`text-xs ${
                              member.availability === 'available' ? 'bg-green-600' :
                              member.availability === 'assigned' ? 'bg-blue-600' : 'bg-slate-600'
                            }`}
                          >
                            {member.availability}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-2">{member.role} • {member.specialization}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            {member.rating}/5
                          </div>
                          <span>{member.experience}+ yrs</span>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        </div>

                        {member.currentAssignment && (
                          <div className="mt-2 text-xs text-blue-400">
                            Currently: {member.currentAssignment}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Crew Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Active Crew Assignments
              </CardTitle>
              <CardDescription className="text-slate-400">
                Monitor ongoing yacht service deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crewAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        className={`${
                          assignment.status === 'active' ? 'bg-green-600' :
                          assignment.status === 'assigned' ? 'bg-blue-600' :
                          assignment.status === 'planned' ? 'bg-orange-600' : 'bg-slate-600'
                        }`}
                      >
                        {assignment.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCrewStatusMutation.mutate({
                          assignmentId: assignment.id,
                          status: assignment.status === 'planned' ? 'assigned' : 'active'
                        })}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white">
                        <Crown className="h-4 w-4 text-purple-400" />
                        Captain: {assignment.captain.name}
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Shield className="h-4 w-4 text-blue-400" />
                        Coordinator: {assignment.coordinator.name}
                      </div>
                      <div className="text-slate-400">
                        Crew Size: {assignment.crewMembers.length} members
                      </div>
                      <div className="text-slate-400">
                        Briefing: {new Date(assignment.briefingTime).toLocaleTimeString()}
                      </div>
                    </div>

                    {assignment.notes && (
                      <div className="mt-3 p-2 bg-slate-600/30 rounded text-xs text-slate-300">
                        {assignment.notes}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
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

  const availableCrew = crewMembers.filter(m => m.availability === 'available');
  const captains = availableCrew.filter(m => m.role === 'Captain');
  const coordinators = availableCrew.filter(m => m.role === 'First Mate' || m.role === 'Coordinator');
  const otherCrew = availableCrew.filter(m => !['Captain', 'First Mate', 'Coordinator'].includes(m.role));

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

  return (
    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Assign Crew to Booking</DialogTitle>
        <DialogDescription className="text-slate-400">
          {booking.yacht.name} • {booking.member.name} • {booking.guestCount} guests
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Captain Selection */}
        <div className="space-y-2">
          <Label className="text-white">Captain *</Label>
          <Select value={selectedCaptain?.toString()} onValueChange={(value) => setSelectedCaptain(parseInt(value))}>
            <SelectTrigger className="bg-slate-700 border-slate-600">
              <SelectValue placeholder="Select captain" />
            </SelectTrigger>
            <SelectContent>
              {captains.map((captain) => (
                <SelectItem key={captain.id} value={captain.id.toString()}>
                  {captain.name} • {captain.rating}/5 • {captain.experience}yrs
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Coordinator Selection */}
        <div className="space-y-2">
          <Label className="text-white">Service Coordinator *</Label>
          <Select value={selectedCoordinator?.toString()} onValueChange={(value) => setSelectedCoordinator(parseInt(value))}>
            <SelectTrigger className="bg-slate-700 border-slate-600">
              <SelectValue placeholder="Select coordinator" />
            </SelectTrigger>
            <SelectContent>
              {coordinators.map((coord) => (
                <SelectItem key={coord.id} value={coord.id.toString()}>
                  {coord.name} • {coord.role} • {coord.rating}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Crew */}
        <div className="space-y-2">
          <Label className="text-white">Additional Crew</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {otherCrew.map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
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
                  className="rounded border-slate-600 bg-slate-700"
                />
                <label htmlFor={`crew-${member.id}`} className="text-sm text-slate-300">
                  {member.name} • {member.role} • {member.rating}/5
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Briefing Time */}
        <div className="space-y-2">
          <Label className="text-white">Briefing Time</Label>
          <Input
            type="datetime-local"
            value={briefingTime}
            onChange={(e) => setBriefingTime(e.target.value)}
            className="bg-slate-700 border-slate-600"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-white">Assignment Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions, service requirements, guest preferences..."
            className="bg-slate-700 border-slate-600"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleAssign}
            disabled={!selectedCaptain || !selectedCoordinator || onAssign.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {onAssign.isPending ? "Assigning..." : "Assign Crew"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}