import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Star, MessageCircle, Phone, ChevronDown, 
  CheckCircle, User, Shield, Navigation, Anchor, Trophy, ArrowRight, PlayCircle, 
  FileText, ThumbsUp, Zap, Crown, Compass, Loader2, Sailboat, Scissors, 
  UtensilsCrossed, Camera, Waves, Music, Heart, Coffee, Send, Timer, Gem, Plus,
  CloudSun, Wifi, Wine, Sun, LifeBuoy, ChevronRight, Sparkles, AlertCircle,
  DollarSign, Package, Utensils, Mail, Activity, Paperclip, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDistanceToNow, format, isToday, isTomorrow, isYesterday } from 'date-fns';
import type { Booking, ServiceBooking, MediaAsset, Yacht, Service } from '@shared/schema';

interface MemberTripsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberTrips({ currentView, setCurrentView }: MemberTripsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const [expandedServices, setExpandedServices] = useState<number[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedTripForRating, setSelectedTripForRating] = useState<Booking | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAdventureDetails, setShowAdventureDetails] = useState(false);
  const [showEndTripForm, setShowEndTripForm] = useState(false);
  const [selectedAdventureBooking, setSelectedAdventureBooking] = useState<Booking | null>(null);
  const [endTripStep, setEndTripStep] = useState(1);
  const [endTripRating, setEndTripRating] = useState(0);
  const [endTripNotes, setEndTripNotes] = useState('');
  const { toast } = useToast();

  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const { data: yachtBookings = [], isLoading: yachtLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings']
  });

  const { data: serviceBookings = [], error: serviceBookingsError } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/service-bookings'],
    retry: false,
    onError: (error) => {
      console.log('Service bookings temporarily unavailable:', error);
    }
  });

  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts']
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  // Update current time every 30 seconds to check phase transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Yacht rating mutation
  const rateYachtMutation = useMutation({
    mutationFn: async ({ bookingId, rating, review }: { bookingId: number; rating: number; review: string }) => {
      const response = await apiRequest('POST', '/api/bookings/rate', {
        bookingId,
        rating,
        review: review.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setShowRatingDialog(false);
      setSelectedTripForRating(null);
      setRating(0);
      setReviewText('');
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback! Your yacht rating helps improve our charter experiences.",
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

  // Helper functions
  const getYachtById = (yachtId: number | null) => {
    if (!yachtId) return null;
    return yachts.find(yacht => yacht.id === yachtId);
  };

  // Yacht experience phase helper
  const getYachtExperiencePhase = (booking: Booking) => {
    const now = currentTime; // Use currentTime state for real-time updates
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now < startTime) {
      return 'before'; // Pre-charter phase
    } else if (now >= startTime && now <= endTime) {
      return 'during'; // Active charter phase
    } else {
      return 'after'; // Post-charter phase
    }
  };

  // Get phase title and description
  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'before':
        return {
          title: 'Pre-Charter Preparation',
          description: 'Your yacht experience is being prepared',
          icon: <Calendar className="w-5 h-5" />,
          color: 'blue'
        };
      case 'during':
        return {
          title: 'The Adventure has begun',
          description: 'Your luxury yacht experience is now active',
          icon: <Navigation className="w-5 h-5" />,
          color: 'purple'
        };
      case 'after':
        return {
          title: 'Charter Complete',
          description: 'Rate your yacht experience',
          icon: <Star className="w-5 h-5" />,
          color: 'green'
        };
      default:
        return {
          title: 'Charter Status',
          description: 'Yacht experience timeline',
          icon: <Anchor className="w-5 h-5" />,
          color: 'gray'
        };
    }
  };

  const getServiceById = (serviceId: number | null) => {
    if (!serviceId) return null;
    return services.find(service => service.id === serviceId);
  };

  const getServicesForBooking = (booking: Booking) => {
    // Match services by booking date for same user
    const bookingDate = new Date(booking.startTime).toDateString();
    return serviceBookings.filter(sb => {
      // Check if service booking is for same user and same date
      const sameUserAndDate = sb.userId === booking.userId && 
        new Date(sb.bookingDate).toDateString() === bookingDate;
      
      // Also check if service booking is within 1 day of yacht booking (for related services)
      const timeDiff = Math.abs(new Date(sb.bookingDate).getTime() - new Date(booking.startTime).getTime());
      const oneDayMs = 24 * 60 * 60 * 1000;
      const nearBookingDate = sb.userId === booking.userId && timeDiff <= oneDayMs;
      
      return sameUserAndDate || nearBookingDate;
    });
  };

  const getServiceIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Beauty & Grooming': Scissors,
      'Culinary': UtensilsCrossed,
      'Wellness & Spa': Heart,
      'Photography & Media': Camera,
      'Entertainment': Music,
      'Water Sports': Waves,
      'Concierge & Lifestyle': Crown
    };
    return iconMap[category] || Coffee;
  };

  const getServiceDescription = (service: Service) => {
    // Return actual description from database if available
    return service.description || `Premium ${service.category.toLowerCase()} service designed to enhance your luxury yacht experience.`;
  };

  const onboardingSteps = [
    {
      title: 'Welcome Aboard!',
      description: 'Your luxury yacht experience begins now',
      icon: Anchor,
      content: 'Congratulations on your upcoming yacht adventure! Our team is preparing everything for an unforgettable experience.',
    },
    {
      title: 'Pre-Boarding Checklist',
      description: 'Essential items and preparation',
      icon: CheckCircle,
      content: 'Please bring: Valid ID, comfortable attire, sunscreen, and any personal items. We provide towels, refreshments, and safety equipment.',
    },
    {
      title: 'Safety Briefing',
      description: 'Your safety is our priority',
      icon: Shield,
      content: 'Our certified captain will conduct a safety briefing covering life jackets, emergency procedures, and yacht protocols.',
    },
    {
      title: 'Meet Your Crew',
      description: 'Professional maritime experts',
      icon: Users,
      content: 'Your dedicated crew includes a certified captain, first mate, and concierge team committed to exceptional service.',
    },
    {
      title: 'Ready to Sail',
      description: 'Adventure awaits',
      icon: Navigation,
      content: 'Everything is prepared for your departure. Contact your captain for any last-minute questions or special requests.',
    }
  ];



  // Rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async (data: { bookingId: number; rating: number; review: string }) => {
      return apiRequest('POST', '/api/bookings/rate', data);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setShowRatingDialog(false);
      setRating(0);
      setReviewText('');
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: () => {
      toast({
        title: "Review Failed",
        description: "Unable to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Formatting functions
  const formatDateSmart = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startFormatted = format(start, 'h:mm a');
    const endFormatted = format(end, 'h:mm a');
    return `${startFormatted} - ${endFormatted}`;
  };

  const getDurationHours = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const toggleServiceExpansion = (serviceId: number) => {
    setExpandedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const startOnboarding = (booking: Booking) => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  const startRating = (booking: Booking) => {
    setSelectedTripForRating(booking);
    setShowRatingDialog(true);
  };

  const startYachtRating = (booking: Booking) => {
    setSelectedTripForRating(booking);
    setShowRatingDialog(true);
  };

  // Separate upcoming and past bookings using currentTime for real-time updates
  const upcomingYachtBookings = yachtBookings.filter(booking => new Date(booking.startTime) > currentTime);
  const pastYachtBookings = yachtBookings.filter(booking => new Date(booking.startTime) <= currentTime);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Cinematic Video Header */}
      <div className="relative h-96 overflow-hidden">
        {heroVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            Your Yacht Adventures
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Luxury yacht experiences crafted for perfection
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{upcomingYachtBookings.length}</div>
              <div className="text-sm text-gray-300">Upcoming Adventures</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{pastYachtBookings.length}</div>
              <div className="text-sm text-gray-300">Memories Created</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Trip Content */}
      <div className="px-4 -mt-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 rounded-xl backdrop-blur-sm">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
            >
              <PlayCircle size={16} className="mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
            >
              <Trophy size={16} className="mr-2" />
              Past Adventures
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            {yachtLoading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-gray-800/30 rounded-xl border-0">
                    <CardContent className="p-8">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-20 bg-gray-700 rounded"></div>
                          <div className="h-20 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingYachtBookings.map((booking, index) => {
                  const yacht = getYachtById(booking.yachtId);
                  const bookedServices = getServicesForBooking(booking);
                  const timeUntilTrip = formatDistanceToNow(new Date(booking.startTime), { addSuffix: true });
                  
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <Card className="bg-black/95 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-500 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-8">
                          {/* Trip Header with Yacht Image */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-6">
                              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-xl">
                                {yacht?.imageUrl ? (
                                  <img 
                                    src={yacht.imageUrl} 
                                    alt={yacht.name || 'Yacht'}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                    <Sailboat className="text-white" size={32} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                <div className="absolute bottom-1 right-1">
                                  <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-3xl font-bold text-white mb-2">
                                  {yacht?.name || `Yacht Booking #${booking.id}`}
                                </h3>
                                <div className="flex items-center space-x-4">
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                                    <CheckCircle size={14} className="mr-1" />
                                    Confirmed
                                  </Badge>
                                  <span className="text-sm text-gray-300 font-medium">{timeUntilTrip}</span>
                                  {yacht && (
                                    <Badge variant="outline" className="text-purple-300 border-purple-500/40">
                                      {yacht.size}ft • {yacht.capacity} guests
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Dynamic Phase Button */}
                            {(() => {
                              const phase = getYachtExperiencePhase(booking);
                              
                              if (phase === 'before') {
                                return (
                                  <Button
                                    onClick={() => {
                                      // Move to Step 2: Active adventure phase
                                      setCurrentTime(new Date(booking.startTime));
                                      setSelectedAdventureBooking(booking);
                                      setShowAdventureDetails(true);
                                      toast({
                                        title: "The Adventure has begun!",
                                        description: "Your luxury yacht experience is now active.",
                                      });
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center gap-2"
                                  >
                                    <Sailboat className="w-4 h-4" />
                                    Begin Experience
                                  </Button>
                                );
                              } else if (phase === 'during') {
                                return (
                                  <Button
                                    onClick={() => {
                                      setSelectedAdventureBooking(booking);
                                      setShowAdventureDetails(true);
                                    }}
                                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Adventure Details
                                  </Button>
                                );
                              } else if (phase === 'after') {
                                return (
                                  <Button
                                    onClick={() => {
                                      setSelectedAdventureBooking(booking);
                                      setShowEndTripForm(true);
                                      setEndTripStep(1);
                                    }}
                                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white flex items-center gap-2"
                                  >
                                    <Star className="w-4 h-4" />
                                    End Trip
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Yacht Experience Timeline */}
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Timer className="w-5 h-5 text-purple-400" />
                              Charter Experience Timeline
                            </h4>
                            <div className="relative">
                              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                              
                              {/* Before Charter Phase */}
                              <div className="relative flex items-start gap-4 pb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                  getYachtExperiencePhase(booking) === 'before' 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400' 
                                    : 'bg-gray-800 border-gray-600'
                                }`}>
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-white font-medium">Pre-Charter Preparation</h5>
                                  <p className="text-gray-400 text-sm">Yacht preparation and final arrangements</p>
                                  {getYachtExperiencePhase(booking) === 'before' && (
                                    <div className="mt-2">
                                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                        <Timer className="w-3 h-3 mr-1" />
                                        Current Phase
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* During Charter Phase */}
                              <div className="relative flex items-start gap-4 pb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                  getYachtExperiencePhase(booking) === 'during' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400' 
                                    : 'bg-gray-800 border-gray-600'
                                }`}>
                                  <Navigation className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-white font-medium">The Adventure has begun</h5>
                                  <p className="text-gray-400 text-sm">Your luxury yacht experience is now active</p>
                                  {getYachtExperiencePhase(booking) === 'during' && (
                                    <div className="mt-2">
                                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse">
                                        <Activity className="w-3 h-3 mr-1" />
                                        In Progress
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* After Charter Phase */}
                              <div className="relative flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                  getYachtExperiencePhase(booking) === 'after' 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400' 
                                    : 'bg-gray-800 border-gray-600'
                                }`}>
                                  <Star className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-white font-medium">Post-Charter Review</h5>
                                  <p className="text-gray-400 text-sm">Rate your yacht experience</p>
                                  {getYachtExperiencePhase(booking) === 'after' && (
                                    <div className="mt-2">
                                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Complete
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* The Adventure has begun - Live Experience Dashboard */}
                          {getYachtExperiencePhase(booking) === 'during' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6 }}
                              className="mb-6"
                            >
                              {/* Adventure Banner */}
                              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/30 p-8 mb-6">
                                {/* Animated background particles */}
                                <div className="absolute inset-0">
                                  {[...Array(20)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                                      initial={{ 
                                        x: Math.random() * 100 + '%',
                                        y: Math.random() * 100 + '%',
                                      }}
                                      animate={{
                                        x: [null, Math.random() * 100 + '%'],
                                        y: [null, Math.random() * 100 + '%'],
                                      }}
                                      transition={{
                                        duration: Math.random() * 10 + 10,
                                        repeat: Infinity,
                                        ease: "linear"
                                      }}
                                    />
                                  ))}
                                </div>

                                <div className="relative z-10">
                                  <motion.h3 
                                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  >
                                    The Adventure has begun!
                                  </motion.h3>
                                  <p className="text-xl text-white/90 mb-6">
                                    Your luxury yacht experience is now active on {yacht?.name}
                                  </p>
                                  
                                  {/* Real-time Status Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <motion.div 
                                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <Navigation className="w-6 h-6 text-purple-400" />
                                        <Badge className="bg-green-500/20 text-green-300 text-xs animate-pulse">LIVE</Badge>
                                      </div>
                                      <div className="text-2xl font-bold text-white">Active</div>
                                      <div className="text-sm text-gray-300">Charter Status</div>
                                    </motion.div>

                                    <motion.div 
                                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <MapPin className="w-6 h-6 text-blue-400 mb-2" />
                                      <div className="text-2xl font-bold text-white">Miami Beach</div>
                                      <div className="text-sm text-gray-300">Current Location</div>
                                    </motion.div>

                                    <motion.div 
                                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <Timer className="w-6 h-6 text-yellow-400 mb-2" />
                                      <div className="text-2xl font-bold text-white">
                                        {(() => {
                                          const now = currentTime;
                                          const end = new Date(booking.endTime);
                                          const hoursRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
                                          const minutesRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60)) % 60);
                                          return `${hoursRemaining}h ${minutesRemaining}m`;
                                        })()}
                                      </div>
                                      <div className="text-sm text-gray-300">Time Remaining</div>
                                    </motion.div>

                                    <motion.div 
                                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <Users className="w-6 h-6 text-green-400 mb-2" />
                                      <div className="text-2xl font-bold text-white">{booking.guestCount}</div>
                                      <div className="text-sm text-gray-300">Guests Onboard</div>
                                    </motion.div>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-6 flex items-center justify-between group transition-all duration-200"
                                  onClick={() => {
                                    toast({
                                      title: "Emergency Contact",
                                      description: "Connecting to yacht captain...",
                                    });
                                  }}
                                >
                                  <div className="flex items-center">
                                    <Phone className="w-8 h-8 mr-4" />
                                    <div className="text-left">
                                      <div className="text-lg font-semibold">Contact Captain</div>
                                      <div className="text-sm opacity-90">Direct line to your captain</div>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 flex items-center justify-between group transition-all duration-200"
                                  onClick={() => {
                                    toast({
                                      title: "Concierge Service",
                                      description: "Your request has been sent to the concierge team.",
                                    });
                                  }}
                                >
                                  <div className="flex items-center">
                                    <Sparkles className="w-8 h-8 mr-4" />
                                    <div className="text-left">
                                      <div className="text-lg font-semibold">Request Service</div>
                                      <div className="text-sm opacity-90">Get immediate assistance</div>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl p-6 flex items-center justify-between group transition-all duration-200"
                                  onClick={() => {
                                    toast({
                                      title: "Weather Update",
                                      description: "Perfect sailing conditions! Clear skies, 75°F, light breeze.",
                                    });
                                  }}
                                >
                                  <div className="flex items-center">
                                    <CloudSun className="w-8 h-8 mr-4" />
                                    <div className="text-left">
                                      <div className="text-lg font-semibold">Weather Status</div>
                                      <div className="text-sm opacity-90">Current conditions</div>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                              </div>

                              {/* Live Experience Features */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Yacht Live Info */}
                                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <Sailboat className="w-6 h-6 mr-2 text-purple-400" />
                                    Your Yacht Details
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                      <span className="text-gray-300">Captain</span>
                                      <span className="text-white font-medium">Captain Rodriguez</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                      <span className="text-gray-300">Crew Members</span>
                                      <span className="text-white font-medium">3 Professional Staff</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                      <span className="text-gray-300">Safety Equipment</span>
                                      <Badge className="bg-green-500/20 text-green-300">All Checked</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                      <span className="text-gray-300">Emergency Contact</span>
                                      <span className="text-white font-medium">+1 (305) 555-0199</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Live Amenities */}
                                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                                    Available Amenities
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { icon: <Wifi className="w-5 h-5" />, name: "High-Speed WiFi", status: "Active" },
                                      { icon: <Music className="w-5 h-5" />, name: "Sound System", status: "Ready" },
                                      { icon: <Wine className="w-5 h-5" />, name: "Premium Bar", status: "Stocked" },
                                      { icon: <Utensils className="w-5 h-5" />, name: "Full Kitchen", status: "Available" },
                                      { icon: <Waves className="w-5 h-5" />, name: "Water Sports", status: "Ready" },
                                      { icon: <Sun className="w-5 h-5" />, name: "Sun Deck", status: "Open" },
                                    ].map((amenity, idx) => (
                                      <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                                      >
                                        <div className="text-purple-400 mr-3">{amenity.icon}</div>
                                        <div className="flex-1">
                                          <div className="text-white text-sm font-medium">{amenity.name}</div>
                                          <div className="text-green-400 text-xs">{amenity.status}</div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Safety Information */}
                              <motion.div 
                                className="mt-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30"
                                whileHover={{ scale: 1.01 }}
                              >
                                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                                  <AlertCircle className="w-6 h-6 mr-2 text-orange-400" />
                                  Important Safety Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-start">
                                    <Shield className="w-5 h-5 text-orange-400 mr-2 mt-0.5" />
                                    <div>
                                      <div className="text-white font-medium">Emergency Services</div>
                                      <div className="text-gray-300">Coast Guard: 911 or VHF Channel 16</div>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <LifeBuoy className="w-5 h-5 text-orange-400 mr-2 mt-0.5" />
                                    <div>
                                      <div className="text-white font-medium">Life Jackets</div>
                                      <div className="text-gray-300">Located in marked storage compartments</div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}

                          {/* Trip Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
                              <div className="flex items-center text-purple-300 mb-2">
                                <Calendar size={18} className="mr-2" />
                                <span className="font-medium">Date</span>
                              </div>
                              <div className="text-white font-semibold">{formatDateSmart(booking.startTime.toString())}</div>
                              <div className="text-gray-400 text-sm">
                                {format(new Date(booking.startTime), 'EEEE')}
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                              <div className="flex items-center text-gray-300 mb-2">
                                <Clock size={18} className="mr-2" />
                                <span className="font-medium">Time</span>
                              </div>
                              <div className="text-white font-semibold">
                                {formatTimeRange(booking.startTime.toString(), booking.endTime.toString())}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {getDurationHours(booking.startTime.toString(), booking.endTime.toString())} hours
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
                              <div className="flex items-center text-green-300 mb-2">
                                <Users size={18} className="mr-2" />
                                <span className="font-medium">Party</span>
                              </div>
                              <div className="text-white font-semibold">{booking.guestCount} guests</div>
                              <div className="text-gray-400 text-sm">Private charter</div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-4 border border-yellow-500/20">
                              <div className="flex items-center text-yellow-300 mb-2">
                                <MapPin size={18} className="mr-2" />
                                <span className="font-medium">Marina</span>
                              </div>
                              <div className="text-white font-semibold">{yacht?.location || 'Miami Marina'}</div>
                              <div className="text-gray-400 text-sm">{yacht?.size}ft vessel</div>
                            </div>
                          </div>

                          {/* Yacht Specifications */}
                          {yacht && (
                            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-xl p-5 mb-6 border border-gray-700/30">
                              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Compass size={18} className="mr-2 text-purple-400" />
                                Yacht Specifications
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-400">{yacht.size}ft</div>
                                  <div className="text-xs text-gray-400">Length</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-400">{yacht.capacity}</div>
                                  <div className="text-xs text-gray-400">Max Guests</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-400">Luxury</div>
                                  <div className="text-xs text-gray-400">Class</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-yellow-400">Premium</div>
                                  <div className="text-xs text-gray-400">Service</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Premium Concierge Services Experience */}
                          {bookedServices.length > 0 && (
                            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-xl p-6 mb-6 border border-yellow-500/20 shadow-xl">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xl font-bold text-white flex items-center">
                                  <Crown size={20} className="mr-2 text-yellow-400" />
                                  Premium Concierge Services
                                </h4>
                                <div className="flex items-center space-x-3">
                                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
                                    {bookedServices.length} Services Included
                                  </Badge>
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                                    ${bookedServices.reduce((total, sb) => {
                                      const service = getServiceById(sb.serviceId);
                                      const price = service?.pricePerSession;
                                      return total + (price ? parseFloat(String(price)) : 0);
                                    }, 0).toFixed(0)} Total Value
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {bookedServices.map((serviceBooking) => {
                                  const service = getServiceById(serviceBooking.serviceId);
                                  if (!service) return null;
                                  
                                  const ServiceIcon = getServiceIcon(service.category);
                                  const isExpanded = expandedServices.includes(service.id);
                                  
                                  return (
                                    <div key={service.id} className="border border-gray-700/30 rounded-lg overflow-hidden">
                                      <div 
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all duration-200"
                                        onClick={() => toggleServiceExpansion(service.id)}
                                      >
                                        <div className="flex items-center space-x-4">
                                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-yellow-500/40 shadow-lg">
                                            {service.imageUrl ? (
                                              <img 
                                                src={service.imageUrl} 
                                                alt={service.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-yellow-500/30 to-orange-500/20 flex items-center justify-center">
                                                <ServiceIcon size={24} className="text-yellow-300" />
                                              </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-bold text-white text-xl mb-1">{service.name}</h5>
                                            <div className="flex items-center space-x-2">
                                              <Badge variant="outline" className="text-xs text-yellow-300 border-yellow-500/40">
                                                {service.category}
                                              </Badge>
                                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                                Paid & Confirmed
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <div className="text-right">
                                            <div className="text-2xl font-bold text-green-400">${service.pricePerSession}</div>
                                            <div className="text-xs text-gray-400">Premium Service</div>
                                          </div>
                                          <ChevronDown 
                                            size={18} 
                                            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                          />
                                        </div>
                                      </div>
                                      
                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="px-4 pb-4 border-t border-gray-700/30">
                                              <div className="mt-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg">
                                                <p className="text-gray-300 leading-relaxed mb-3">
                                                  {getServiceDescription(service)}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                    <span className="flex items-center">
                                                      <Timer size={12} className="mr-1" />
                                                      {service.duration ? `${service.duration} min` : '1-2 hours'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                      <Gem size={12} className="mr-1" />
                                                      Premium quality
                                                    </span>
                                                  </div>
                                                  <Badge variant="outline" className="text-xs text-green-300 border-green-500/30">
                                                    Confirmed
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Special Requests */}
                          {booking.specialRequests && booking.specialRequests.trim() && (
                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 mb-6 border border-blue-500/20">
                              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                                <FileText size={18} className="mr-2 text-blue-400" />
                                Special Requests
                              </h4>
                              <div className="bg-gray-800/50 p-4 rounded-lg">
                                <p className="text-gray-300 leading-relaxed">{booking.specialRequests}</p>
                              </div>
                            </div>
                          )}


                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {upcomingYachtBookings.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                      <Sailboat size={32} className="text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-300 mb-2">No upcoming adventures</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Ready to embark on your next luxury yacht experience? Explore our premium fleet and book your perfect getaway.
                    </p>
                    <Button
                      onClick={() => setCurrentView('explore')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl px-8 py-3"
                    >
                      <Compass size={18} className="mr-2" />
                      Explore Yacht Fleet
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            <div className="space-y-6">
              {pastYachtBookings.map((booking, index) => {
                const yacht = getYachtById(booking.yachtId);
                const bookedServices = getServicesForBooking(booking);
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/30 hover:border-gray-600/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                              <Trophy size={24} className="text-yellow-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {yacht?.name || `Yacht Adventure #${booking.id}`}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  Completed
                                </Badge>
                                <span className="text-sm text-gray-400">
                                  {formatDateSmart(booking.startTime.toString())}
                                </span>
                              </div>
                            </div>
                          </div>
                          {booking.rating ? (
                            <div className="flex items-center gap-2">
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
                          ) : (
                            <Button
                              onClick={() => startYachtRating(booking)}
                              className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 text-yellow-400 border border-yellow-600/30"
                            >
                              <Star size={16} className="mr-2" />
                              Rate Experience
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-semibold text-white">{formatDateSmart(booking.startTime.toString())}</div>
                            <div className="text-xs text-gray-400">Date</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-semibold text-white">
                              {getDurationHours(booking.startTime.toString(), booking.endTime.toString())}h
                            </div>
                            <div className="text-xs text-gray-400">Duration</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-semibold text-white">{booking.guestCount}</div>
                            <div className="text-xs text-gray-400">Guests</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-semibold text-white">{bookedServices.length}</div>
                            <div className="text-xs text-gray-400">Services</div>
                          </div>
                        </div>

                        {bookedServices.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-3">Services enjoyed:</p>
                            <div className="flex flex-wrap gap-2">
                              {bookedServices.map((serviceBooking) => {
                                const service = getServiceById(serviceBooking.serviceId);
                                return service ? (
                                  <Badge key={service.id} variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                                    {service.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Yacht Rating & Review Display */}
                        {booking.rating && booking.review && (
                          <div className="mb-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700/40">
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              Your Yacht Experience Review
                            </h5>
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
                            <p className="text-gray-300 text-sm italic">"{booking.review}"</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          {!booking.rating && (
                            <Button
                              onClick={() => startYachtRating(booking)}
                              className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 text-yellow-400 border border-yellow-600/30 rounded-xl"
                            >
                              <Star size={16} className="mr-2" />
                              Share Review
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
                            onClick={() => setCurrentView('explore')}
                          >
                            <Plus size={16} className="mr-2" />
                            Book Similar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {pastYachtBookings.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-500/30">
                    <Trophy size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-2">No past adventures yet</h3>
                  <p className="text-gray-500">Your completed yacht experiences will appear here</p>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Onboarding Experience */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: '#000000', background: '#000000', borderColor: '#333333', border: '1px solid #333333' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl text-center">
              {onboardingSteps[onboardingStep]?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                {onboardingSteps[onboardingStep] && React.createElement(onboardingSteps[onboardingStep].icon, {
                  size: 32,
                  className: "text-white"
                })}
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-lg text-purple-300 mb-2">
                {onboardingSteps[onboardingStep]?.description}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {onboardingSteps[onboardingStep]?.content}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{onboardingStep + 1} of {onboardingSteps.length}</span>
              </div>
              <Progress value={(onboardingStep + 1) / onboardingSteps.length * 100} className="h-2" />
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                disabled={onboardingStep === 0}
                className="border-gray-600 text-gray-300"
              >
                Previous
              </Button>
              
              {onboardingStep < onboardingSteps.length - 1 ? (
                <Button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowOnboarding(false)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Ready to Sail!
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Enhanced Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-yellow-500/30 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center space-x-3">
              <Trophy className="text-yellow-400" size={24} />
              <span>Share Your Experience</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="text-center mb-6">
              <p className="text-gray-300 mb-4">How was your luxury yacht adventure?</p>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600 hover:text-gray-500'}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-yellow-400 font-medium">
                  {rating === 5 ? 'Absolutely Exceptional!' : 
                   rating === 4 ? 'Outstanding Experience!' : 
                   rating === 3 ? 'Great Adventure!' : 
                   rating === 2 ? 'Good Experience' : 'Needs Improvement'}
                </p>
              )}
            </div>
            
            <Textarea
              placeholder="Share the highlights of your yacht experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white min-h-[120px] mb-6"
            />
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRatingDialog(false);
                  setRating(0);
                  setReviewText('');
                  setSelectedTripForRating(null);
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedTripForRating && rating > 0) {
                    rateYachtMutation.mutate({
                      bookingId: selectedTripForRating.id,
                      rating,
                      review: reviewText.trim()
                    });
                  }
                }}
                disabled={!selectedTripForRating || rating === 0 || rateYachtMutation.isPending}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                {rateYachtMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adventure Details Dialog - Step 2 */}
      <Dialog open={showAdventureDetails} onOpenChange={setShowAdventureDetails}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-white">
              Adventure Details
            </DialogTitle>
            <Button
              onClick={() => {
                if (selectedAdventureBooking) {
                  setCurrentTime(new Date(selectedAdventureBooking.endTime));
                  setShowAdventureDetails(false);
                  setShowEndTripForm(true);
                  setEndTripStep(1);
                }
              }}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              End Trip
            </Button>
          </div>
          
          {selectedAdventureBooking && (
            <div className="space-y-6">
              {/* 5-6 Step Experience Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h4 className="text-white font-medium">Welcome Aboard</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Captain greeting and safety briefing completed</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h4 className="text-white font-medium">Departure</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Setting sail from Miami Marina</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h4 className="text-white font-medium">Open Waters</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Cruising through beautiful Miami waters</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <h4 className="text-white font-medium">Activities</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Swimming, dining, and entertainment</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <h4 className="text-white font-medium">Sunset Views</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Enjoying spectacular Miami sunset</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    <h4 className="text-white font-medium">Return Journey</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Heading back to marina</p>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-white font-medium mb-2">Time Remaining</h4>
                <div className="text-3xl font-bold text-white">
                  {(() => {
                    const now = currentTime;
                    const end = new Date(selectedAdventureBooking.endTime);
                    const hoursRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
                    const minutesRemaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60)) % 60);
                    return `${hoursRemaining}h ${minutesRemaining}m`;
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* End Trip Form Dialog - Step 3 */}
      <Dialog open={showEndTripForm} onOpenChange={setShowEndTripForm}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogTitle className="text-2xl font-bold text-white mb-4">
            End Trip Experience
          </DialogTitle>
          
          {selectedAdventureBooking && (
            <div className="space-y-6">
              {/* 5-Step Form */}
              {endTripStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Step 1: Overall Experience</h3>
                  <p className="text-gray-400">How would you rate your overall yacht experience?</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setEndTripRating(star)}
                        className={`p-2 ${star <= endTripRating ? 'text-yellow-400' : 'text-gray-400'}`}
                      >
                        <Star className={`w-8 h-8 ${star <= endTripRating ? 'fill-current' : ''}`} />
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEndTripStep(2)}
                    disabled={endTripRating === 0}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {endTripStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Step 2: Captain & Crew</h3>
                  <p className="text-gray-400">Rate the captain and crew service</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-yellow-400"
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEndTripStep(3)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {endTripStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Step 3: Yacht Condition</h3>
                  <p className="text-gray-400">Rate the yacht's condition and amenities</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-yellow-400"
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEndTripStep(4)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {endTripStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Step 4: Value for Experience</h3>
                  <p className="text-gray-400">Rate the overall value of your yacht experience</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-yellow-400"
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEndTripStep(5)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Final Step
                  </Button>
                </div>
              )}

              {endTripStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Step 5: Additional Notes</h3>
                  <p className="text-gray-400">Share any additional feedback about your experience</p>
                  <Textarea
                    value={endTripNotes}
                    onChange={(e) => setEndTripNotes(e.target.value)}
                    placeholder="Tell us about your yacht experience..."
                    className="bg-gray-800 border-gray-700 text-white min-h-24"
                  />
                  <Button
                    onClick={async () => {
                      // Submit the rating
                      try {
                        await rateYachtMutation.mutateAsync({
                          bookingId: selectedAdventureBooking.id,
                          rating: endTripRating,
                          review: endTripNotes
                        });
                        
                        toast({
                          title: "Thank you for your feedback!",
                          description: "Your yacht experience rating has been submitted.",
                        });
                        
                        setShowEndTripForm(false);
                        setEndTripStep(1);
                        setEndTripRating(0);
                        setEndTripNotes('');
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to submit rating. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    Submit Rating
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}