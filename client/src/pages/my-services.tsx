import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Clock, Users, Star, Download, Phone, MessageSquare, Eye, StarIcon, AlertCircle, CheckCircle, Timer, Coffee, Sparkles, Heart, Crown, Zap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import type { MediaAsset } from '@shared/schema';
import ServiceExperienceModal from "@/components/service-experience-modal-new";

interface ServiceBooking {
  id: number;
  serviceId: number;
  userId: number;
  bookingDate: string;
  scheduledDate: string;
  status: string;
  totalPrice: string;
  notes?: string;
  service: {
    id: number;
    name: string;
    description: string;
    price: string;
    duration: number;
    imageUrl?: string;
    category: string;
    providerId: number;
    provider?: {
      id: number;
      username: string;
      email: string;
      phone: string;
    };
  };
}

interface MyServicesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MyServices({ currentView, setCurrentView }: MyServicesProps) {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  
  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const { data: serviceBookings, isLoading } = useQuery({
    queryKey: ["/api/service-bookings"],
    refetchInterval: 30000, // Real-time sync every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });

  // Rating mutation
  const rateServiceMutation = useMutation({
    mutationFn: async ({ bookingId, rating, review }: { bookingId: number; rating: number; review: string }) => {
      return await apiRequest('POST', `/api/service-bookings/${bookingId}/rate`, {
        rating,
        review
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Service Rated",
        description: "Thank you for your feedback!",
      });
    }
  });

  // PDF Receipt Generation
  const generatePDFReceipt = (booking: ServiceBooking) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 92, 246); // Purple
      doc.text('Miami Beach Yacht Club', 20, 20);
      doc.setFontSize(16);
      doc.text('Service Receipt', 20, 30);
      
      // Booking Details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Receipt #: ${booking.id}`, 20, 50);
      doc.text(`Service: ${booking.service.name}`, 20, 60);
      doc.text(`Provider: ${booking.service.provider?.username || 'MBYC Staff'}`, 20, 70);
      doc.text(`Date: ${format(new Date(booking.scheduledDate), 'PPP')}`, 20, 80);
      doc.text(`Status: ${booking.status.toUpperCase()}`, 20, 90);
      doc.text(`Total: $${booking.totalPrice}`, 20, 100);
      
      // Service Details
      doc.text('Service Details:', 20, 120);
      doc.text(`Category: ${booking.service.category}`, 20, 130);
      doc.text(`Duration: ${booking.service.duration} minutes`, 20, 140);
      if (booking.notes) {
        doc.text(`Notes: ${booking.notes}`, 20, 150);
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Miami Beach Yacht Club - Premium Concierge Services', 20, 270);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 280);
      
      doc.save(`MBYC-Service-Receipt-${booking.id}.pdf`);
      
      toast({
        title: "Receipt Downloaded",
        description: "Your service receipt has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beauty & Grooming': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Culinary': return <Coffee className="w-5 h-5 text-purple-400" />;
      case 'Wellness & Spa': return <Heart className="w-5 h-5 text-purple-400" />;
      case 'Photography & Media': return <Eye className="w-5 h-5 text-purple-400" />;
      case 'Entertainment': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'Water Sports': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Concierge & Lifestyle': return <Star className="w-5 h-5 text-purple-400" />;
      default: return <Star className="w-5 h-5 text-purple-400" />;
    }
  };

  const bookings = serviceBookings as ServiceBooking[] || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Service Experience Rating Component
  const ServiceRatingDialog = ({ booking }: { booking: ServiceBooking }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmitRating = () => {
      if (rating > 0) {
        rateServiceMutation.mutate({
          bookingId: booking.id,
          rating,
          review
        });
        setIsOpen(false);
        setRating(0);
        setReview("");
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30 text-purple-400"
          >
            <Star className="w-4 h-4 mr-1" />
            Rate Service
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-gradient-animate">Rate Your Service Experience</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Service Info */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-purple-400 mb-2">{booking.service.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {getCategoryIcon(booking.service.category)}
                <span>{booking.service.category}</span>
                <span>•</span>
                <span>{booking.service.provider?.username || 'MBYC Staff'}</span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4">How was your experience?</h4>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-full transition-all ${
                      star <= rating 
                        ? 'text-yellow-400 scale-110' 
                        : 'text-gray-400 hover:text-yellow-300'
                    }`}
                  >
                    <StarIcon className="w-8 h-8" fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                {rating === 0 && "Click to rate"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Share your experience (optional)</label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your service experience..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none h-24"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmitRating}
              disabled={rating === 0 || rateServiceMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {rateServiceMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Video Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          {heroVideo?.url && (
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideo.url} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          {/* Enhanced bottom blur transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gradient-animate mb-4"
          >
            My Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Track your service bookings and concierge experiences
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-6 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{bookings.length}</div>
              <div className="text-sm text-gray-300">Services</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-300">Confirmed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">
                ${bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice || '0'), 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-300">Total Spent</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-300">No Services Booked</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't booked any services yet. Explore our premium concierge services and enhance your yacht experience!
            </p>
            <Button
              onClick={() => window.location.href = '/member-home'}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Browse Services
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Services</p>
                        <p className="text-2xl font-bold text-white">{bookings.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-white">
                          {bookings.filter(booking => booking.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-white">
                          {bookings.filter(booking => ['confirmed', 'pending'].includes(booking.status)).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Spent</p>
                        <p className="text-2xl font-bold text-white">
                          ${bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Service Booking Cards */}
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="bg-gray-900/50 border-gray-700 hover:border-indigo-600/50 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Service Image */}
                        <div className="lg:w-1/3">
                          <div className="relative">
                            <img
                              src={booking.service.imageUrl || '/api/media/pexels-mali-42092_1750537277229.jpg'}
                              alt={booking.service.name}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                            />
                            <div className="absolute top-4 left-4">
                              <div className="text-2xl bg-black/50 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                                {getCategoryIcon(booking.service.category)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="lg:w-2/3 p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-2">
                                    {booking.service.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge 
                                      variant="outline" 
                                      className="border-indigo-600 text-indigo-400 bg-gradient-to-r from-indigo-600/10 to-indigo-600/10"
                                    >
                                      {booking.service.category}
                                    </Badge>
                                    <Badge 
                                      className={`${getStatusColor(booking.status)} text-white capitalize`}
                                    >
                                      {booking.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-300 mb-4 line-clamp-2">
                                {booking.service.description}
                              </p>

                              {/* Booking Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked: {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4" />
                                  <span>Scheduled: {format(new Date(booking.scheduledDate), 'MMM dd, h:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Users className="w-4 h-4" />
                                  <span>Duration: {booking.service.duration} hours</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Star className="w-4 h-4" />
                                  <span>Service ID: #{booking.id}</span>
                                </div>
                              </div>

                              {/* Provider Details */}
                              {booking.service.provider && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                  <h4 className="font-semibold text-white mb-2">Service Provider</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-400">Provider: </span>
                                      <span className="text-white">{booking.service.provider.username}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Email: </span>
                                      <span className="text-white">{booking.service.provider.email}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Phone: </span>
                                      <span className="text-white">{booking.service.provider.phone}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {booking.notes && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                  <h4 className="font-semibold text-white mb-2">Special Requests</h4>
                                  <p className="text-gray-300 text-sm">{booking.notes}</p>
                                </div>
                              )}

                              {/* Pricing */}
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                  Service Price: ${booking.service.price}
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                                  ${booking.totalPrice}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex lg:flex-col gap-2">
                              {booking.status === 'confirmed' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-indigo-600 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-600/20"
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contact Provider
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-indigo-600 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-600/20"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message
                                  </Button>
                                </>
                              )}
                              {booking.status === 'completed' && (
                                <ServiceRatingDialog booking={booking} />
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generatePDFReceipt(booking)}
                                className="border-green-600 text-green-400 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Receipt
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                  <DialogHeader className="flex-shrink-0 pb-4">
                                    <DialogTitle className="text-gradient-animate">Service Experience</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                                    {/* Service Info */}
                                    <div className="flex items-center gap-4">
                                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
                                        {getCategoryIcon(booking.service.category)}
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-semibold text-white">{booking.service.name}</h3>
                                        <p className="text-gray-400">{booking.service.category}</p>
                                      </div>
                                    </div>

                                    {/* Experience Timeline */}
                                    <div className="space-y-4">
                                      <h4 className="font-semibold text-indigo-400">Service Experience Timeline</h4>
                                      
                                      {/* Before Service */}
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mt-1">
                                          <AlertCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-white">Before Service</h5>
                                          <p className="text-gray-300 text-sm mb-2">Service confirmed and scheduled</p>
                                          <div className="text-xs text-gray-400">
                                            Booked: {format(new Date(booking.bookingDate), 'PPP')}
                                          </div>
                                        </div>
                                      </div>

                                      {/* During Service */}
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                                          <Timer className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-white">During Service</h5>
                                          <p className="text-gray-300 text-sm mb-2">Service in progress</p>
                                          <div className="text-xs text-gray-400">
                                            Duration: {booking.service.duration} hours
                                          </div>
                                        </div>
                                      </div>

                                      {/* After Service */}
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-1">
                                          <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-white">After Service</h5>
                                          <p className="text-gray-300 text-sm mb-2">
                                            {booking.status === 'completed' ? 'Service completed successfully' : 'Service pending completion'}
                                          </p>
                                          {booking.status === 'completed' && (
                                            <div className="text-xs text-gray-400">
                                              Rate your experience to help other members
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Provider Information */}
                                    {booking.service.provider && (
                                      <div className="bg-gray-800/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-indigo-400 mb-3">Service Provider Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <span className="text-gray-400 text-sm">Provider:</span>
                                            <p className="text-white font-medium">{booking.service.provider.username}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Contact:</span>
                                            <p className="text-white font-medium">{booking.service.provider.email}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Phone:</span>
                                            <p className="text-white font-medium">{booking.service.provider.phone}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Provider Type:</span>
                                            <p className="text-white font-medium">
                                              {booking.service.provider.id === 60 ? 'MBYC Staff' : '3rd Party Provider'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Service Details */}
                                    <div className="bg-gray-800/50 rounded-lg p-4">
                                      <h4 className="font-semibold text-indigo-400 mb-3">Service Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Service Price:</span>
                                          <span className="text-white">${booking.service.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Total Paid:</span>
                                          <span className="text-white font-semibold">${booking.totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Duration:</span>
                                          <span className="text-white">{booking.service.duration} hours</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Status:</span>
                                          <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                                            {booking.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsExperienceModalOpen(true);
                                }}
                                className={`${
                                  booking.status === 'completed' 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700'
                                } text-white`}
                                disabled={booking.status === 'completed'}
                              >
                                {booking.status === 'completed' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Experience Completed
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Begin Experience
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Service Experience Modal */}
      {isExperienceModalOpen && selectedBooking && (
        <ServiceExperienceModal
          booking={selectedBooking}
          isOpen={isExperienceModalOpen}
          onClose={() => setIsExperienceModalOpen(false)}
        />
      )}
    </div>
  );
}