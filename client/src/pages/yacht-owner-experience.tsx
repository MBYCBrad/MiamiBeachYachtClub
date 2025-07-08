import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Anchor,
  Navigation,
  Waves,
  DollarSign,
  TrendingUp,
  Activity,
  MessageSquare,
  Phone,
  Settings,
  Eye,
  Edit,
  Fuel,
  Wrench
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface YachtBooking {
  id: number;
  userId: number;
  yachtId: number;
  startTime: string;
  endTime: string;
  status: string;
  guestCount: number;
  specialRequests?: string;
  experienceType: string;
  totalPrice: string;
  bookingDate: string;
  scheduledDate: string;
  rating?: number;
  review?: string;
  yacht: {
    id: number;
    name: string;
    type: string;
    capacity: number;
    length: number;
    imageUrl?: string;
    location: string;
    ownerId: number;
  };
  member: {
    id: number;
    username: string;
    email: string;
    phone: string;
    membershipTier: string;
  };
}

interface YachtOwnerExperienceProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function YachtOwnerExperience({ currentView, setCurrentView }: YachtOwnerExperienceProps) {
  const [selectedPhase, setSelectedPhase] = useState<'before' | 'during' | 'after'>('before');
  const [selectedBooking, setSelectedBooking] = useState<YachtBooking | null>(null);
  const [preparationNotes, setPreparationNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch yacht owner bookings
  const { data: yachtBookings = [], isLoading } = useQuery({
    queryKey: ['/api/yacht-owner/bookings'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, notes }: { bookingId: number; status: string; notes?: string }) => {
      return apiRequest('PUT', `/api/yacht-owner/bookings/${bookingId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-owner/bookings'] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Yacht preparation update mutation
  const yachtPreparationMutation = useMutation({
    mutationFn: async ({ bookingId, phase, notes, preparationDetails }: { bookingId: number; phase: string; notes: string; preparationDetails: any }) => {
      return apiRequest('POST', `/api/yacht-owner/bookings/${bookingId}/preparation`, { phase, notes, preparationDetails });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yacht-owner/bookings'] });
      setPreparationNotes('');
      toast({
        title: "Success",
        description: "Yacht preparation logged successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'confirmed': return 'bg-blue-600';
      case 'in_progress': return 'bg-purple-600';
      case 'completed': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPhaseBookings = (phase: 'before' | 'during' | 'after') => {
    return yachtBookings.filter((booking: YachtBooking) => {
      const now = new Date();
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      switch (phase) {
        case 'before':
          return now < startTime && ['pending', 'confirmed'].includes(booking.status);
        case 'during':
          return now >= startTime && now <= endTime && booking.status === 'in_progress';
        case 'after':
          return now > endTime && ['completed', 'cancelled'].includes(booking.status);
        default:
          return false;
      }
    });
  };

  const getPhaseTitle = (phase: 'before' | 'during' | 'after') => {
    switch (phase) {
      case 'before': return 'Pre-Charter Preparation';
      case 'during': return 'Active Charter Management';
      case 'after': return 'Post-Charter Review & Feedback';
      default: return 'Yacht Charter Management';
    }
  };

  const getPhaseDescription = (phase: 'before' | 'during' | 'after') => {
    switch (phase) {
      case 'before': return 'Prepare your yacht for upcoming charters';
      case 'during': return 'Monitor active charters and handle any issues';
      case 'after': return 'Review completed charters and member feedback';
      default: return 'Manage yacht charter experiences';
    }
  };

  const renderBookingCard = (booking: YachtBooking) => (
    <Card key={booking.id} className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{booking.yacht.name}</CardTitle>
              <p className="text-sm text-gray-400">{booking.yacht.type} • {booking.yacht.length}ft</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Charter Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{booking.guestCount} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 capitalize">{booking.experienceType}</span>
          </div>
        </div>

        {/* Member Information */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-medium text-purple-400 mb-2">Charter Member</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Member:</span>
              <p className="text-white">{booking.member.username}</p>
            </div>
            <div>
              <span className="text-gray-400">Tier:</span>
              <p className="text-white capitalize">{booking.member.membershipTier}</p>
            </div>
            <div>
              <span className="text-gray-400">Contact:</span>
              <p className="text-white">{booking.member.phone}</p>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <p className="text-white">{booking.member.email}</p>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-1">Special Requests</h4>
            <p className="text-gray-300 text-sm">{booking.specialRequests}</p>
          </div>
        )}

        {/* Before Charter - Preparation Checklist */}
        {selectedPhase === 'before' && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-2">Yacht Preparation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Safety equipment checked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Fuel tank filled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Cleaning completed</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Provisioning pending</span>
              </div>
            </div>
          </div>
        )}

        {/* During Charter - Live Monitoring */}
        {selectedPhase === 'during' && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-2">Charter Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Current location: {booking.yacht.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Charter in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">All systems operational</span>
              </div>
            </div>
          </div>
        )}

        {/* After Charter - Rating & Review */}
        {selectedPhase === 'after' && booking.rating && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-2">Charter Rating & Review</h4>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < booking.rating! ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300">({booking.rating}/5)</span>
            </div>
            {booking.review && (
              <p className="text-gray-300 text-sm italic">"{booking.review}"</p>
            )}
          </div>
        )}

        {/* Revenue Information */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-medium text-purple-400 mb-2">Charter Revenue</h4>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Revenue Share: ${booking.totalPrice}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {selectedPhase === 'before' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-600 text-purple-400 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Log Preparation
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-gradient-animate">Yacht Preparation Update</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Preparation Phase</Label>
                    <select className="w-full mt-1 bg-gray-800 border-gray-600 rounded-md p-2 text-white">
                      <option value="cleaning">Cleaning & Maintenance</option>
                      <option value="provisioning">Provisioning</option>
                      <option value="safety_check">Safety Equipment Check</option>
                      <option value="fueling">Fueling</option>
                      <option value="final_inspection">Final Inspection</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preparation Notes</Label>
                    <Textarea
                      value={preparationNotes}
                      onChange={(e) => setPreparationNotes(e.target.value)}
                      placeholder="Describe the preparation completed..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none h-24"
                    />
                  </div>
                  <Button 
                    onClick={() => yachtPreparationMutation.mutate({ 
                      bookingId: booking.id, 
                      phase: 'preparation', 
                      notes: preparationNotes,
                      preparationDetails: {}
                    })}
                    disabled={!preparationNotes.trim() || yachtPreparationMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {yachtPreparationMutation.isPending ? 'Logging...' : 'Log Preparation'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateBookingStatusMutation.mutate({ 
              bookingId: booking.id, 
              status: selectedPhase === 'before' ? 'confirmed' : selectedPhase === 'during' ? 'in_progress' : 'completed' 
            })}
            className="border-green-600 text-green-400 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {selectedPhase === 'before' ? 'Mark Ready' : selectedPhase === 'during' ? 'Update Status' : 'Mark Complete'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Member
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBooking(booking)}
            className="border-indigo-600 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-black min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Yacht Charter Management</h1>
              <p className="text-gray-400">Manage your yacht charters from preparation to completion</p>
            </div>
          </div>
          
          {/* Phase Tabs */}
          <Tabs value={selectedPhase} onValueChange={(value) => setSelectedPhase(value as 'before' | 'during' | 'after')}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="before" className="data-[state=active]:bg-purple-600">
                <Wrench className="w-4 h-4 mr-2" />
                Preparation
              </TabsTrigger>
              <TabsTrigger value="during" className="data-[state=active]:bg-purple-600">
                <Navigation className="w-4 h-4 mr-2" />
                Active Charter
              </TabsTrigger>
              <TabsTrigger value="after" className="data-[state=active]:bg-purple-600">
                <Star className="w-4 h-4 mr-2" />
                Post-Charter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Phase Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{getPhaseTitle(selectedPhase)}</h2>
              <p className="text-gray-400">{getPhaseDescription(selectedPhase)}</p>
            </div>
          </div>

          {/* Bookings Grid */}
          <div className="grid gap-6">
            {getPhaseBookings(selectedPhase).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Anchor className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No {selectedPhase} charters</h3>
                <p className="text-gray-500">No yacht charters in the {selectedPhase} phase at this time</p>
              </div>
            ) : (
              getPhaseBookings(selectedPhase).map(renderBookingCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}