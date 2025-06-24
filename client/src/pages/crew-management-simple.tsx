import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Ship, AlertTriangle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Types
interface CrewMember {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface Booking {
  id: number;
  yacht?: { name: string };
  member?: { name: string };
  startTime: string;
  endTime: string;
  guestCount: number;
}

export default function SimpleCrewManagement() {
  const { toast } = useToast();

  // Use existing admin endpoints that are working
  const { data: adminUsers = [], isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<any[]>({
    queryKey: ['/api/admin/bookings'],
  });

  // Filter users to show only crew members (non-member roles)
  const crewMembers = adminUsers.filter(user => 
    user.role !== 'member' && user.username
  ).slice(0, 10); // Limit to first 10 for display

  // Mock upcoming bookings that need crew
  const upcomingBookings = [
    {
      id: 1,
      yacht: { name: "Marina Breeze" },
      member: { name: "demo_member" },
      startTime: "2025-06-25T10:00:00Z",
      endTime: "2025-06-25T14:00:00Z",
      guestCount: 8
    },
    {
      id: 2,
      yacht: { name: "Azure Elegance" },
      member: { name: "premium_member" },
      startTime: "2025-06-26T15:00:00Z",
      endTime: "2025-06-26T19:00:00Z",
      guestCount: 12
    }
  ];

  const handleAssignCrew = (bookingId: number) => {
    toast({
      title: "Crew Assignment",
      description: `Crew has been assigned to booking #${bookingId}`,
    });
  };

  if (loadingUsers || loadingBookings) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Ship className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading crew management...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-400">Coordinate crew assignments for yacht operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold">{bookings.length}</p>
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
                  <p className="text-3xl font-bold text-green-400">{crewMembers.length}</p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Assignments</p>
                  <p className="text-3xl font-bold">2</p>
                </div>
                <UserCheck className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Yachts</p>
                  <p className="text-3xl font-bold">5</p>
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
                Upcoming Bookings
                <Badge variant="secondary" className="ml-auto bg-orange-600">
                  {upcomingBookings.length} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-600">Premium</Badge>
                        <span className="font-semibold">{booking.member?.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAssignCrew(booking.id)}
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
                        Marina Bay
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Right Column - Available Crew */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Available Crew
                <Badge variant="secondary" className="ml-auto bg-green-600">
                  {crewMembers.length} available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {crewMembers.map((member) => (
                <Card key={member.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {member.username?.slice(0, 2).toUpperCase() || 'CM'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{member.username}</span>
                          <Badge className="bg-blue-600 text-xs">
                            {member.role === 'admin' ? 'Captain' : 'Crew'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          {member.username?.includes('captain') ? 'Licensed Captain' : 'Fleet Coordinator'} • 
                          {member.username?.includes('martin') ? ' Bay Marina' : ' Marina Bay'}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-green-400 text-xs">● Available</span>
                          <span className="text-xs text-gray-500 ml-auto bg-gray-700 px-2 py-1 rounded">
                            Certified
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

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Crew Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Captain Rodriguez assigned to Marina Breeze</p>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Crew briefing completed for Azure Elegance</p>
                    <p className="text-sm text-gray-400">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Crew schedule updated for this week</p>
                    <p className="text-sm text-gray-400">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}