import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Clock, MapPin, Star, Shield, CheckCircle, X, Phone, MessageSquare, Award, Heart, Calendar, Users, FileText, Camera, Sparkles, CheckSquare, Timer, Activity, PartyPopper } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ServiceExperienceModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  { id: 1, title: "Before Experience", description: "Preparation Phase" },
  { id: 2, title: "During Experience", description: "Active Service" },
  { id: 3, title: "After Experience", description: "Review & Completion" }
];

const STEPS = {
  1: ["Service Confirmation", "Provider Details", "Preparation Checklist"],
  2: ["Service Started", "Experience Progress", "Quality Check"],
  3: ["Service Summary", "Rate Experience", "Final Review"]
};

export default function ServiceExperienceModal({ booking, isOpen, onClose }: ServiceExperienceModalProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceRating, setServiceRating] = useState(0);
  const [providerRating, setProviderRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [writtenReview, setWrittenReview] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Update experience progress in real-time
  const updateExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/service-bookings/${booking.id}/experience`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      // Notify admin and service provider in real-time
      apiRequest('POST', '/api/notifications', {
        type: 'service_experience_update',
        recipientId: 60, // Admin Simon Librati
        message: `Service experience updated: ${booking.service?.name} - Stage ${currentStage}, Step ${currentStep}`,
        metadata: { bookingId: booking.id, stage: currentStage, step: currentStep }
      });
    }
  });

  // Complete service and submit review
  const completeServiceMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      // First update booking status to completed
      await apiRequest('PATCH', `/api/service-bookings/${booking.id}`, {
        status: 'completed',
        experienceCompleted: true
      });
      
      // Then submit the review
      return await apiRequest('POST', '/api/service-reviews', {
        ...reviewData,
        bookingId: booking.id,
        serviceId: booking.serviceId,
        userId: booking.userId
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Completed",
        description: "Thank you for your feedback!",
      });
      
      // Notify admin and service provider
      apiRequest('POST', '/api/notifications', {
        type: 'service_completed',
        recipientId: 60, // Admin Simon Librati
        message: `Service completed with ${overallRating} star rating: ${booking.service?.name}`,
        metadata: { bookingId: booking.id, rating: overallRating }
      });
      
      if (booking.service?.providerId) {
        apiRequest('POST', '/api/notifications', {
          type: 'service_review',
          recipientId: booking.service.providerId,
          message: `New ${overallRating} star review for ${booking.service?.name}`,
          metadata: { bookingId: booking.id, rating: overallRating }
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-reviews'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete service. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update progress when stage/step changes
  useEffect(() => {
    if (isOpen && booking?.id) {
      updateExperienceMutation.mutate({
        stage: currentStage,
        step: currentStep,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentStage, currentStep]);

  const renderStarRating = (rating: number, setRating: (rating: number) => void, label?: string) => {
    return (
      <div className="space-y-2">
        {label && <Label className="text-white text-base">{label}</Label>}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-all hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="text-sm text-gray-400">{rating} out of 5 stars</span>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    // Before Experience - Stage 1
    if (currentStage === 1) {
      switch (currentStep) {
        case 1: // Service Confirmation
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Service Confirmed</h3>
                <p className="text-gray-300">Your premium experience is booked and ready</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Booking Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Service</span>
                      <span className="text-white font-medium">{booking.service?.name || 'Premium Service'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Date & Time</span>
                      <span className="text-white font-medium">
                        {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'MMM d, yyyy h:mm a') : 'Today'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Duration</span>
                      <span className="text-white font-medium">{booking.duration || 2} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Location</span>
                      <span className="text-white font-medium">{booking.location || 'Miami Beach Marina'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Booking ID</span>
                      <span className="text-white font-medium">#{booking.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">What Happens Next</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <span className="text-white">Your service provider will prepare everything for your experience</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <span className="text-white">You'll receive updates as your service time approaches</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span className="text-white">Track your experience in real-time through this dashboard</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 2: // Provider Details
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Meet Your Provider</h3>
                <p className="text-gray-300">Get to know who will be serving you</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">{booking.service?.provider?.username || 'Professional Provider'}</h4>
                      <p className="text-gray-300">{booking.service?.category || 'Premium Service Provider'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">5.0 rating • 127 reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Provider Highlights</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Verified Professional</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">Top Rated Provider</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">Fully Insured & Licensed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Contact Information</h5>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/20"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Provider
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 3: // Preparation Checklist
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Preparation Checklist</h3>
                <p className="text-gray-300">Make sure everything is ready for your experience</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Before Your Service</h4>
                  <div className="space-y-3">
                    {[
                      "Confirm your availability for the scheduled time",
                      "Ensure the service location is accessible",
                      "Review any special requests you've made",
                      "Have payment method ready if additional services needed",
                      "Prepare any questions for your provider"
                    ].map((item, index) => (
                      <label key={index} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedItems[item] || false}
                          onChange={(e) => setCheckedItems({ ...checkedItems, [item]: e.target.checked })}
                          className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-white">{item}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2 text-white">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>Arrive 10 minutes early to ensure smooth start</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>Communicate any changes immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>Keep your phone handy for provider updates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">All Set!</p>
                <p className="text-gray-300 text-sm">You're ready for your premium experience</p>
              </div>
            </div>
          );
      }
    }

    // During Experience - Stage 2
    if (currentStage === 2) {
      switch (currentStep) {
        case 1: // Service Started
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Service Started</h3>
                <p className="text-gray-300">Your premium experience is now in progress</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status</span>
                      <Badge className="bg-green-600 text-white animate-pulse">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Started At</span>
                      <span className="text-white font-medium">{format(new Date(), 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Provider</span>
                      <span className="text-white font-medium">{booking.service?.provider?.username || 'Professional Provider'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Expected Duration</span>
                      <span className="text-white font-medium">{booking.duration || 2} hours</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Service Timer</p>
                        <p className="text-gray-300 text-sm">00:15:32 elapsed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Live Updates</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                      <div>
                        <p className="text-white text-sm">Service started successfully</p>
                        <p className="text-gray-400 text-xs">{format(new Date(), 'h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">Provider has arrived at location</p>
                        <p className="text-gray-400 text-xs">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 2: // Experience Progress
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Enjoying Your Experience</h3>
                <p className="text-gray-300">We hope you're having an amazing time!</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Service Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white">50% Complete</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                        <Timer className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-medium">01:00:00</p>
                        <p className="text-gray-400 text-sm">Time Elapsed</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-white font-medium">01:00:00</p>
                        <p className="text-gray-400 text-sm">Time Remaining</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-400" />
                    Capture the Moment
                  </h4>
                  <p className="text-gray-300 mb-4">Want to share photos from your experience?</p>
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Need Assistance?</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600/20"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 3: // Quality Check
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Quality Check</h3>
                <p className="text-gray-300">How's everything going so far?</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Quick Feedback</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-gray-300 mb-4">Rate your experience so far</p>
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          😞 Not Good
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                        >
                          😐 Okay
                        </Button>
                        <Button
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600/20"
                        >
                          😊 Great!
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label className="text-white mb-2">Any concerns? (Optional)</Label>
                      <Textarea
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Let us know if you need anything..."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Service Checklist</h4>
                  <div className="space-y-3">
                    {[
                      "Service is being delivered as expected",
                      "Provider is professional and courteous",
                      "Quality meets MBYC standards",
                      "I'm satisfied with the experience so far"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-gray-300 mb-4">Ready to complete your service?</p>
                <Button
                  onClick={() => {
                    setCurrentStage(3);
                    setCurrentStep(1);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8"
                >
                  Complete Service
                </Button>
              </div>
            </div>
          );
      }
    }

    // After Experience - Stage 3
    if (currentStage === 3) {
      switch (currentStep) {
        case 1: // Service Summary
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Service Complete!</h3>
                <p className="text-gray-300">Thank you for choosing MBYC premium services</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Service Summary</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Service</span>
                      <span className="text-white font-medium">{booking.service?.name || 'Premium Service'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Provider</span>
                      <span className="text-white font-medium">{booking.service?.provider?.username || 'Professional Provider'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Duration</span>
                      <span className="text-white font-medium">2 hours 15 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Completed At</span>
                      <span className="text-white font-medium">{format(new Date(), 'h:mm a')}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Service Delivered Successfully</p>
                        <p className="text-gray-300 text-sm">All service requirements have been met</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <PartyPopper className="w-5 h-5 text-purple-400" />
                    Thank You!
                  </h4>
                  <p className="text-white">
                    We hope you enjoyed your premium experience. Your feedback helps us maintain 
                    the highest standards of service excellence at Miami Beach Yacht Club.
                  </p>
                </CardContent>
              </Card>
            </div>
          );

        case 2: // Rate Experience
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h3>
                <p className="text-gray-300">Your feedback matters to us</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 space-y-6">
                  {renderStarRating(serviceRating, setServiceRating, "Service Quality")}
                  <p className="text-gray-400 text-sm">How was the overall quality of the service?</p>
                  
                  <div className="border-t border-gray-700 pt-6">
                    {renderStarRating(providerRating, setProviderRating, "Provider Performance")}
                    <p className="text-gray-400 text-sm">How professional was your service provider?</p>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-6">
                    {renderStarRating(overallRating, setOverallRating, "Overall Experience")}
                    <p className="text-gray-400 text-sm">How likely are you to recommend this service?</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-amber-600/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-amber-400" />
                    <h4 className="font-semibold text-white">Rating Guide</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
                      <span className="text-white">Exceptional - Exceeded expectations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">⭐⭐⭐⭐</span>
                      <span className="text-white">Great - Met all expectations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">⭐⭐⭐</span>
                      <span className="text-white">Good - Room for improvement</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 3: // Final Review
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Final Review</h3>
                <p className="text-gray-300">Share your experience with other members</p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-white mb-3">Your Ratings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Service Quality</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < serviceRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Provider Performance</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < providerRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Overall Experience</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < overallRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg font-medium">Write Your Review</Label>
                    <p className="text-gray-400 text-sm mb-3">Help other members by sharing details about your experience</p>
                    <Textarea
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                      placeholder="What did you love about this service? Any suggestions for improvement?"
                      value={writtenReview}
                      onChange={(e) => setWrittenReview(e.target.value)}
                    />
                  </div>

                  <div className="mt-6 space-y-3">
                    <h5 className="font-medium text-white">Review Guidelines</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Be specific about what made your experience great</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Mention any standout moments or exceptional service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Provide constructive feedback if applicable</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => {
                    completeServiceMutation.mutate({
                      serviceRating,
                      providerRating,
                      overallRating,
                      writtenReview
                    });
                  }}
                  disabled={completeServiceMutation.isPending || overallRating === 0}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3 text-lg"
                >
                  {completeServiceMutation.isPending ? 'Submitting...' : 'Submit Review & Complete'}
                </Button>
              </div>
            </div>
          );
      }
    }

    return null;
  };

  const canProceed = () => {
    // Always allow proceeding in Before and During stages
    if (currentStage === 1 || currentStage === 2) {
      return true;
    }
    
    // In After stage, check specific requirements
    if (currentStage === 3) {
      if (currentStep === 2) {
        // Must have at least overall rating
        return overallRating > 0;
      }
      if (currentStep === 3) {
        // Must have all ratings to submit final review
        return serviceRating > 0 && providerRating > 0 && overallRating > 0;
      }
    }
    
    return true;
  };

  const scrollToTop = () => {
    const contentDiv = document.querySelector('.service-experience-content');
    if (contentDiv) {
      contentDiv.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStage < 3) {
      setCurrentStage(currentStage + 1);
      setCurrentStep(1);
    }
    // Scroll to top after navigation
    setTimeout(scrollToTop, 100);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      setCurrentStep(3);
    }
    // Scroll to top after navigation
    setTimeout(scrollToTop, 100);
  };

  const getTotalStep = () => {
    return (currentStage - 1) * 3 + currentStep;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Service Experience Journey
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Stages */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-center gap-4">
            {STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStage === stage.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : currentStage > stage.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStage > stage.id ? <CheckCircle className="w-5 h-5" /> : stage.id}
                </div>
                {index < STAGES.length - 1 && (
                  <div className={`w-20 h-1 mx-2 ${
                    currentStage > stage.id ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <h4 className="font-semibold text-white">{STAGES[currentStage - 1]?.title}</h4>
            <p className="text-sm text-gray-400">
              Step {currentStep} of 3: {STEPS[currentStage]?.[currentStep - 1]}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 service-experience-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStage}-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex justify-between items-center pt-6 mt-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStage === 1 && currentStep === 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === getTotalStep() ? 'bg-purple-600' : 
                  index + 1 < getTotalStep() ? 'bg-green-600' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStage === 3 && currentStep === 3 ? (
            <Button
              onClick={() => {
                if (overallRating > 0) {
                  completeServiceMutation.mutate({
                    serviceRating,
                    providerRating,
                    overallRating,
                    writtenReview
                  });
                }
              }}
              disabled={!canProceed() || completeServiceMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {completeServiceMutation.isPending ? 'Completing...' : 'Complete Service'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}