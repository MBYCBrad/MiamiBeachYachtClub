import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Ship, AlertTriangle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

export default function CrewManagement() {
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

  // Mock bookings data that need crew assignment
  const mockBookings: Booking[] = [
    {
      id: 1,
      yacht: { name: "Platinum Dream" },
      member: { name: "demo_member" },
      membershipTier: "platinum",
      startTime: "2025-07-01T17:00:00Z",
      endTime: "2025-07-01T21:00:00Z",
      guestCount: 12,
      location: "Marina Bay"
    },
    {
      id: 2,
      yacht: { name: "Azure Elegance" },
      member: { name: "demo_member" },
      membershipTier: "platinum", 
      startTime: "2025-06-29T13:00:00Z",
      endTime: "2025-06-29T17:00:00Z",
      guestCount: 10,
      location: "Marina Bay"
    },
    {
      id: 3,
      yacht: { name: "Ocean Majesty" },
      member: { name: "demo_member" },
      membershipTier: "platinum",
      startTime: "2025-07-02T09:00:00Z", 
      endTime: "2025-07-02T13:00:00Z",
      guestCount: 8,
      location: "Marina Bay"
    }
  ];

  // Get unassigned bookings
  const unassignedBookings = mockBookings.filter(booking => 
    !assignments.some(assignment => assignment.bookingId === booking.id)
  );

  // Get assignments by status
  const activeAssignments = assignments.filter(assignment => assignment.status === 'confirmed');
  const pastAssignments = assignments.filter(assignment => assignment.status === 'completed');

  const handleAssignCrew = (booking: Booking) => {
    // Navigate to assign crew page with booking data
    console.log('Assigning crew for booking:', booking.id);
    toast({ title: "Opening crew assignment for booking " + booking.id });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Ship className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Crew Management Center</h1>
          </div>
          <p className="text-gray-400">Real-time crew coordination & yacht service delivery</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-gray-400 text-sm">Bookings</p>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Crew</p>
                  <p className="text-3xl font-bold text-green-400">{staff.length}</p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Assignments</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <UserCheck className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Schedule</p>
                  <p className="text-3xl font-bold">4</p>
                </div>
                <Ship className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Bookings Requiring Crew */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Bookings Requiring Crew
                <Badge variant="secondary" className="ml-auto bg-orange-600">
                  {unassignedBookings.length} pending
                </Badge>
              </CardTitle>
              <p className="text-gray-400 text-sm">Priority-ordered by membership tier</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {unassignedBookings.map((booking) => (
                <Card key={booking.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-600">{booking.membershipTier}</Badge>
                        <span className="font-semibold">{booking.member?.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAssignCrew(booking)}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Assign Crew
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{booking.yacht?.name} • {booking.guestCount} guests</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(booking.startTime), 'M/d/yyyy \'at\' h:mm a')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {booking.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Right Column - Crew Members */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Crew Members
                <Badge variant="secondary" className="ml-auto bg-green-600">
                  All {staff.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staff.map((member) => (
                <Card key={member.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {member.username?.slice(0, 2).toUpperCase() || 'CM'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold text-lg">{member.username}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          {member.role === 'admin' && member.username?.includes('captain') ? 'Yacht Captain' : 'Fleet Coordinator'} • 
                          {member.username?.includes('martin') ? ' Bay Marina' : ' Marina Bay'}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium">5.0/5</span>
                          <span className="text-xs text-gray-500 ml-auto bg-gray-700 px-2 py-1 rounded">
                            Certified Professional
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Assignment Management Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
                Active Assignments ({activeAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-gray-700">
                Past Assignments ({pastAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                All Assignments ({assignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="grid gap-4">
                {activeAssignments.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-6 text-center text-gray-400">
                      No active assignments
                    </CardContent>
                  </Card>
                ) : (
                  activeAssignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Assignment #{assignment.id}</h3>
                            <p className="text-gray-400">Booking ID: {assignment.bookingId}</p>
                          </div>
                          <Badge className="bg-green-600">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              <div className="grid gap-4">
                {pastAssignments.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-6 text-center text-gray-400">
                      No past assignments
                    </CardContent>
                  </Card>
                ) : (
                  pastAssignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Assignment #{assignment.id}</h3>
                            <p className="text-gray-400">Booking ID: {assignment.bookingId}</p>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {assignments.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-6 text-center text-gray-400">
                      No assignments found
                    </CardContent>
                  </Card>
                ) : (
                  assignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Assignment #{assignment.id}</h3>
                            <p className="text-gray-400">Booking ID: {assignment.bookingId}</p>
                          </div>
                          <Badge className={assignment.status === 'confirmed' ? 'bg-green-600' : 'bg-gray-600'}>
                            {assignment.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}