import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Clock, MapPin, Star, Shield, CheckCircle, X, Phone, MessageSquare, Award, Heart } from 'lucide-react';
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

const STEPS = [
  { id: 1, title: "Before Experience", description: "Service preparation and details" },
  { id: 2, title: "During Experience", description: "Live experience tracking" },
  { id: 3, title: "After Experience", description: "Review and completion" }
];

export default function ServiceExperienceModal({ booking, isOpen, onClose }: ServiceExperienceModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [experienceCompleted, setExperienceCompleted] = useState(false);
  const [serviceRating, setServiceRating] = useState(0);
  const [providerRating, setProviderRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [writtenReview, setWrittenReview] = useState('');
  const { toast } = useToast();

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return await apiRequest('POST', '/api/service-reviews', reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const renderStarRating = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Before Experience
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Your Service is Confirmed</h3>
              <p className="text-gray-300">Everything is ready for your premium experience</p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
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
                    <span className="text-gray-300">Date & Time</span>
                    <span className="text-white font-medium">
                      {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'MMM d, yyyy') : 'Today'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Duration</span>
                    <span className="text-white font-medium">{booking.duration || 2} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <Badge className="bg-green-600 text-white">Confirmed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">What to Expect</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Fully licensed and insured provider</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Premium quality service guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Direct communication with provider</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // During Experience
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Experience in Progress</h3>
              <p className="text-gray-300">Your service provider is delivering an amazing experience</p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Status</span>
                    <Badge className="bg-green-600 text-white">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Provider</span>
                    <span className="text-white font-medium">{booking.service?.provider?.username || 'Professional Provider'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service</span>
                    <span className="text-white font-medium">{booking.service?.name || 'Premium Service'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-600/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Provider
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => {
                  setExperienceCompleted(true);
                  setCurrentStep(3);
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3"
              >
                Mark as Complete
              </Button>
            </div>
          </div>
        );

      case 3: // After Experience
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Experience Complete!</h3>
              <p className="text-gray-300">How was your service experience?</p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-lg font-medium">Service Quality</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {renderStarRating(serviceRating, setServiceRating)}
                      <span className="text-sm text-gray-400">
                        {serviceRating > 0 && `${serviceRating} out of 5 stars`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg font-medium">Provider Performance</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {renderStarRating(providerRating, setProviderRating)}
                      <span className="text-sm text-gray-400">
                        {providerRating > 0 && `${providerRating} out of 5 stars`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg font-medium">Overall Experience</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {renderStarRating(overallRating, setOverallRating)}
                      <span className="text-sm text-gray-400">
                        {overallRating > 0 && `${overallRating} out of 5 stars`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg font-medium">Share Your Experience</Label>
                    <Textarea
                      className="mt-2 bg-gray-700 border-gray-600 text-white min-h-[100px]"
                      placeholder="Tell other members about your experience..."
                      value={writtenReview}
                      onChange={(e) => setWrittenReview(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => {
                  submitReviewMutation.mutate({
                    bookingId: booking.id,
                    serviceRating,
                    providerRating,
                    overallRating,
                    writtenReview
                  });
                }}
                disabled={submitReviewMutation.isPending || overallRating === 0}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return experienceCompleted;
      case 3:
        return overallRating > 0;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Service Experience
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <h4 className="font-semibold text-white">{STEPS[currentStep - 1]?.title}</h4>
            <p className="text-sm text-gray-400">{STEPS[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
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
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}