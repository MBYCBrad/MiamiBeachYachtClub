import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Shield,
  MessageSquare,
  Phone,
  Settings,
  TrendingUp,
  Activity,
  Eye,
  Edit
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
    owner?: {
      id: number;
      username: string;
      email: string;
      phone: string;
    };
  };
  member: {
    id: number;
    username: string;
    email: string;
    phone: string;
    membershipTier: string;
  };
}

interface AdminYachtExperienceProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function AdminYachtExperience({ currentView, setCurrentView }: AdminYachtExperienceProps) {
  const [selectedPhase, setSelectedPhase] = useState<'before' | 'during' | 'after'>('before');
  const [selectedBooking, setSelectedBooking] = useState<YachtBooking | null>(null);
  const [interventionNotes, setInterventionNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch yacht bookings
  const { data: yachtBookings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/yacht-bookings'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      return apiRequest('PUT', `/api/admin/yacht-bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/yacht-bookings'] });
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

  // Admin intervention mutation
  const adminInterventionMutation = useMutation({
    mutationFn: async ({ bookingId, action, notes }: { bookingId: number; action: string; notes: string }) => {
      return apiRequest('POST', `/api/admin/yacht-bookings/${bookingId}/intervention`, { action, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/yacht-bookings'] });
      setInterventionNotes('');
      toast({
        title: "Success",
        description: "Admin intervention logged successfully",
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
      case 'before': return 'Pre-Departure Management';
      case 'during': return 'Active Charter Monitoring';
      case 'after': return 'Post-Charter & Reviews';
      default: return 'Yacht Experience';
    }
  };

  const getPhaseIcon = (phase: 'before' | 'during' | 'after') => {
    switch (phase) {
      case 'before': return <Calendar className="w-5 h-5" />;
      case 'during': return <Navigation className="w-5 h-5" />;
      case 'after': return <Star className="w-5 h-5" />;
      default: return <Anchor className="w-5 h-5" />;
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
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{format(new Date(booking.startTime), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{booking.guestCount} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{booking.yacht.location}</span>
          </div>
        </div>

        {/* Member Information */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-medium text-purple-400 mb-2">Member Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <p className="text-white">{booking.member.username}</p>
            </div>
            <div>
              <span className="text-gray-400">Tier:</span>
              <p className="text-white capitalize">{booking.member.membershipTier}</p>
            </div>
          </div>
        </div>

        {/* Yacht Owner Information */}
        {booking.yacht.owner && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-2">Yacht Owner</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Owner:</span>
                <p className="text-white">{booking.yacht.owner.username}</p>
              </div>
              <div>
                <span className="text-gray-400">Contact:</span>
                <p className="text-white">{booking.yacht.owner.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Experience Type & Special Requests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 capitalize">{booking.experienceType}</span>
          </div>
          {booking.specialRequests && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h4 className="font-medium text-purple-400 mb-1">Special Requests</h4>
              <p className="text-gray-300 text-sm">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* After Service - Rating & Review */}
        {selectedPhase === 'after' && booking.rating && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-purple-400 mb-2">Member Rating & Review</h4>
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateBookingStatusMutation.mutate({ 
              bookingId: booking.id, 
              status: selectedPhase === 'before' ? 'confirmed' : selectedPhase === 'during' ? 'in_progress' : 'completed' 
            })}
            className="border-purple-600 text-purple-400 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {selectedPhase === 'before' ? 'Confirm' : selectedPhase === 'during' ? 'Mark Active' : 'Complete'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-600 text-orange-400 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-red-600/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Intervene
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-gradient-animate">Admin Intervention</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Intervention Type</Label>
                  <select className="w-full mt-1 bg-gray-800 border-gray-600 rounded-md p-2 text-white">
                    <option value="status_override">Status Override</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="safety_concern">Safety Concern</option>
                    <option value="equipment_issue">Equipment Issue</option>
                    <option value="weather_delay">Weather Delay</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <Textarea
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    placeholder="Describe the intervention and actions taken..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none h-24"
                  />
                </div>
                <Button 
                  onClick={() => adminInterventionMutation.mutate({ 
                    bookingId: booking.id, 
                    action: 'admin_intervention', 
                    notes: interventionNotes 
                  })}
                  disabled={!interventionNotes.trim() || adminInterventionMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  {adminInterventionMutation.isPending ? 'Logging...' : 'Log Intervention'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBooking(booking)}
            className="border-blue-600 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20"
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
              <h1 className="text-4xl font-bold text-white">Yacht Experience Management</h1>
              <p className="text-gray-400">Monitor and manage yacht charters throughout their lifecycle</p>
            </div>
          </div>
          
          {/* Phase Tabs */}
          <Tabs value={selectedPhase} onValueChange={(value) => setSelectedPhase(value as 'before' | 'during' | 'after')}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="before" className="data-[state=active]:bg-purple-600">
                <Calendar className="w-4 h-4 mr-2" />
                Before Charter
              </TabsTrigger>
              <TabsTrigger value="during" className="data-[state=active]:bg-purple-600">
                <Navigation className="w-4 h-4 mr-2" />
                During Charter
              </TabsTrigger>
              <TabsTrigger value="after" className="data-[state=active]:bg-purple-600">
                <Star className="w-4 h-4 mr-2" />
                After Charter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Phase Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              {getPhaseIcon(selectedPhase)}
            </div>
            <h2 className="text-2xl font-bold text-white">{getPhaseTitle(selectedPhase)}</h2>
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