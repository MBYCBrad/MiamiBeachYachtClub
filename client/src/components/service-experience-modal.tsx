import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, Star, Shield, CheckCircle, X, Info, Camera, Phone, MessageSquare, Timer, Award, Heart, Smile, ThumbsUp, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ServiceExperienceModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

interface ExperienceData {
  currentProcess: number;
  currentStep: number;
  serviceRating: number;
  providerRating: number;
  overallRating: number;
  writtenReview: string;
  experiencePhotos: string[];
  qualityFeedback: string;
  completionNotes: string;
  readyConfirmed: boolean;
  experienceStarted: boolean;
  experienceCompleted: boolean;
}

const PROCESS_TITLES = [
  "Service Preparation",
  "Experience Journey", 
  "Review & Rating"
];

const STEP_TITLES = {
  1: [
    "Service Overview",
    "Meet Your Provider", 
    "Preparation Guide",
    "Location & Timing",
    "Ready Check"
  ],
  2: [
    "Experience Started",
    "Journey Progress",
    "Quality Check",
    "Service Completion",
    "Experience Summary"
  ],
  3: [
    "Rate Service",
    "Rate Provider", 
    "Written Review",
    "Photo Upload",
    "Review Complete"
  ]
};

export default function ServiceExperienceModal({ booking, isOpen, onClose }: ServiceExperienceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Experience state
  const [experienceData, setExperienceData] = useState<ExperienceData>({
    currentProcess: 1,
    currentStep: 1,
    serviceRating: 0,
    providerRating: 0,
    overallRating: 0,
    writtenReview: '',
    experiencePhotos: [],
    qualityFeedback: '',
    completionNotes: '',
    readyConfirmed: false,
    experienceStarted: false,
    experienceCompleted: false
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setExperienceData({
        currentProcess: 1,
        currentStep: 1,
        serviceRating: 0,
        providerRating: 0,
        overallRating: 0,
        writtenReview: '',
        experiencePhotos: [],
        qualityFeedback: '',
        completionNotes: '',
        readyConfirmed: false,
        experienceStarted: false,
        experienceCompleted: false
      });
    }
  }, [isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beauty & Grooming': return '💄';
      case 'Culinary': return '🍽️';
      case 'Wellness & Spa': return '🧘';
      case 'Photography & Media': return '📸';
      case 'Entertainment': return '🎭';
      case 'Water Sports': return '🏄';
      case 'Concierge & Lifestyle': return '🏆';
      default: return '✨';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const nextStep = () => {
    setExperienceData(prev => {
      if (prev.currentStep < 5) {
        return { ...prev, currentStep: prev.currentStep + 1 };
      } else if (prev.currentProcess < 3) {
        return { ...prev, currentProcess: prev.currentProcess + 1, currentStep: 1 };
      }
      return prev;
    });
  };

  const prevStep = () => {
    setExperienceData(prev => {
      if (prev.currentStep > 1) {
        return { ...prev, currentStep: prev.currentStep - 1 };
      } else if (prev.currentProcess > 1) {
        return { ...prev, currentProcess: prev.currentProcess - 1, currentStep: 5 };
      }
      return prev;
    });
  };

  const renderStarRating = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`w-8 h-8 transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  // Process 1: Service Preparation
  const renderProcess1 = () => {
    const { currentStep } = experienceData;
    
    switch (currentStep) {
      case 1: // Service Overview
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-2xl">
                    {getCategoryIcon(booking.service.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{booking.service.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{booking.service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-purple-600 text-purple-400">
                        {booking.service.category}
                      </Badge>
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Booking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Service Date</p>
                      <p className="text-white font-medium">{format(new Date(booking.scheduledDate), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Service Time</p>
                      <p className="text-white font-medium">{format(new Date(booking.scheduledDate), 'h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-white font-medium">{booking.service.duration} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Guests</p>
                      <p className="text-white font-medium">{booking.guestCount} people</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Meet Your Provider
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Your Service Provider</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {booking.service.provider?.username?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white text-lg">
                      {booking.service.provider?.username || 'Professional Provider'}
                    </h5>
                    <p className="text-sm text-gray-400 mb-2">Certified {booking.service.category} Specialist</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">4.9 (127 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Provider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/20"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Provider Expertise</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Experience Level</span>
                    <span className="text-white font-medium">Expert (5+ years)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Certifications</span>
                    <span className="text-white font-medium">Licensed & Insured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Specialties</span>
                    <span className="text-white font-medium">{booking.service.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Preparation Guide
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Preparation Instructions</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                    <div>
                      <h5 className="font-medium text-white">Arrive 15 minutes early</h5>
                      <p className="text-sm text-gray-400">Please arrive at the marina 15 minutes before your scheduled service time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                    <div>
                      <h5 className="font-medium text-white">Bring valid ID</h5>
                      <p className="text-sm text-gray-400">You'll need to present a valid ID for security verification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                    <div>
                      <h5 className="font-medium text-white">Dress appropriately</h5>
                      <p className="text-sm text-gray-400">Wear comfortable clothing suitable for yacht activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">4</div>
                    <div>
                      <h5 className="font-medium text-white">Bring necessary items</h5>
                      <p className="text-sm text-gray-400">Bring any specific items mentioned in your service confirmation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">What to Expect</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Professional {booking.service.category} service</p>
                      <p className="text-sm text-gray-400">High-quality service delivered by certified professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Luxury yacht setting</p>
                      <p className="text-sm text-gray-400">Enjoy your service in an exclusive maritime environment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Personalized attention</p>
                      <p className="text-sm text-gray-400">Tailored service experience based on your preferences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Location & Timing
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Meeting Location</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Miami Beach Marina</p>
                    <p className="text-sm text-gray-400">Dock 12, Gate A - Marina Reception</p>
                    <p className="text-sm text-gray-400 mt-2">Your service provider will meet you at the reception area</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Service Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {format(new Date(booking.scheduledDate), 'h:mm')}
                    </div>
                    <div>
                      <p className="text-white font-medium">Service Start</p>
                      <p className="text-sm text-gray-400">Meet your provider and begin experience</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {format(new Date(new Date(booking.scheduledDate).getTime() + (booking.service.duration * 60 * 60 * 1000)), 'h:mm')}
                    </div>
                    <div>
                      <p className="text-white font-medium">Service End</p>
                      <p className="text-sm text-gray-400">Complete experience and review</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Emergency: (305) 555-0123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Marina Security: (305) 555-0124</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Ready Check
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Ready to Begin?</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${experienceData.readyConfirmed ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="text-white">I have read and understood the preparation instructions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">I have my valid ID ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">I am dressed appropriately for the service</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">I know the meeting location and time</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => setExperienceData(prev => ({ ...prev, readyConfirmed: !prev.readyConfirmed }))}
                    className={`w-full ${experienceData.readyConfirmed ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
                  >
                    {experienceData.readyConfirmed ? 'Confirmed - Ready to Start!' : 'Confirm Ready'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Process 2: Experience Journey
  const renderProcess2 = () => {
    const { currentStep } = experienceData;
    
    switch (currentStep) {
      case 1: // Experience Started
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-600/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Experience Started!</h4>
                    <p className="text-sm text-green-300">Your {booking.service.category} service has begun</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Provider</span>
                    <span className="text-white font-medium">{booking.service.provider?.username || 'Professional Provider'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Started At</span>
                    <span className="text-white font-medium">{format(new Date(), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Duration</span>
                    <span className="text-white font-medium">{booking.service.duration} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Service Details</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                    <div>
                      <h5 className="font-medium text-white">Initial Setup</h5>
                      <p className="text-sm text-gray-400">Your provider is setting up the service environment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                    <div>
                      <h5 className="font-medium text-gray-400">Service Delivery</h5>
                      <p className="text-sm text-gray-400">Main service experience will begin shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                    <div>
                      <h5 className="font-medium text-gray-400">Completion</h5>
                      <p className="text-sm text-gray-400">Service wrap-up and review</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Journey Progress
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Experience in Progress</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Service setup completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                    <span className="text-white">Main service experience ongoing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                    <span className="text-gray-400">Service completion pending</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Service Progress: 60% Complete</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Current Activity</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Delivering {booking.service.category} Service</h5>
                    <p className="text-sm text-gray-400">Your provider is currently delivering the main service experience</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Elapsed Time</span>
                    <span className="text-white font-medium">1.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Remaining Time</span>
                    <span className="text-white font-medium">{booking.service.duration - 1.5} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Quality Check
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Quality Check</h4>
                <p className="text-gray-300 mb-4">How is your service experience so far?</p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Service Quality</Label>
                    <div className="mt-2">
                      {renderStarRating(experienceData.serviceRating, (rating) => 
                        setExperienceData(prev => ({ ...prev, serviceRating: rating }))
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Additional Feedback</Label>
                    <Textarea
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      placeholder="Share any feedback about your experience so far..."
                      value={experienceData.qualityFeedback}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, qualityFeedback: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">Need Assistance?</h4>
                <p className="text-sm text-gray-300 mb-4">If you need any adjustments or have concerns, contact your provider</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Provider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/20"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Service Completion
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-600/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Service Completed!</h4>
                    <p className="text-sm text-green-300">Your {booking.service.category} service is now complete</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Duration</span>
                    <span className="text-white font-medium">{booking.service.duration} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completed At</span>
                    <span className="text-white font-medium">{format(new Date(), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Provider</span>
                    <span className="text-white font-medium">{booking.service.provider?.username || 'Professional Provider'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Service Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Service setup completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Main service experience delivered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Service completion confirmed</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-white">Completion Notes</Label>
                  <Textarea
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                    placeholder="Any final notes about your experience..."
                    value={experienceData.completionNotes}
                    onChange={(e) => setExperienceData(prev => ({ ...prev, completionNotes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Experience Summary
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Experience Summary</h4>
                    <p className="text-sm text-purple-300">Your complete service experience overview</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">Service Details</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white">{booking.service.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{booking.service.duration}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{format(new Date(booking.scheduledDate), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">Quality Feedback</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service Rating:</span>
                        <div className="flex">
                          {[...Array(experienceData.serviceRating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white">{booking.service.provider?.username || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Ready for Review</h4>
                <p className="text-gray-300 mb-4">Your service experience is complete. Would you like to leave a detailed review?</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setExperienceData(prev => ({ ...prev, experienceCompleted: true }))}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex-1"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    Skip for Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Process 3: Review & Rating
  const renderProcess3 = () => {
    const { currentStep } = experienceData;
    
    switch (currentStep) {
      case 1: // Rate Service
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Rate Your Service</h4>
                <p className="text-gray-300 mb-6">How would you rate your {booking.service.category} experience?</p>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {renderStarRating(experienceData.serviceRating, (rating) => 
                        setExperienceData(prev => ({ ...prev, serviceRating: rating }))
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {experienceData.serviceRating === 0 && "Select a rating"}
                      {experienceData.serviceRating === 1 && "Poor - Service did not meet expectations"}
                      {experienceData.serviceRating === 2 && "Fair - Service was below average"}
                      {experienceData.serviceRating === 3 && "Good - Service met expectations"}
                      {experienceData.serviceRating === 4 && "Very Good - Service exceeded expectations"}
                      {experienceData.serviceRating === 5 && "Excellent - Outstanding service experience"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Service Quality</h5>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < experienceData.serviceRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Overall Experience</h5>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < experienceData.serviceRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Service Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Name</span>
                    <span className="text-white font-medium">{booking.service.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Category</span>
                    <span className="text-white font-medium">{booking.service.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Duration</span>
                    <span className="text-white font-medium">{booking.service.duration} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Date</span>
                    <span className="text-white font-medium">{format(new Date(booking.scheduledDate), 'PPP')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Rate Provider
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Rate Your Provider</h4>
                <p className="text-gray-300 mb-6">How would you rate your service provider's performance?</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {booking.service.provider?.username?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white">
                        {booking.service.provider?.username || 'Professional Provider'}
                      </h5>
                      <p className="text-sm text-gray-400">Certified {booking.service.category} Specialist</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {renderStarRating(experienceData.providerRating, (rating) => 
                        setExperienceData(prev => ({ ...prev, providerRating: rating }))
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {experienceData.providerRating === 0 && "Select a rating"}
                      {experienceData.providerRating === 1 && "Poor - Provider was unprofessional"}
                      {experienceData.providerRating === 2 && "Fair - Provider was below average"}
                      {experienceData.providerRating === 3 && "Good - Provider met expectations"}
                      {experienceData.providerRating === 4 && "Very Good - Provider exceeded expectations"}
                      {experienceData.providerRating === 5 && "Excellent - Outstanding provider performance"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Professionalism</h5>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < experienceData.providerRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Communication</h5>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < experienceData.providerRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-2">Expertise</h5>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < experienceData.providerRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Written Review
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Write Your Review</h4>
                <p className="text-gray-300 mb-6">Share your experience to help other members</p>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Overall Rating</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {renderStarRating(experienceData.overallRating, (rating) => 
                        setExperienceData(prev => ({ ...prev, overallRating: rating }))
                      )}
                      <span className="text-sm text-gray-400">
                        {experienceData.overallRating > 0 && `${experienceData.overallRating} out of 5 stars`}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Review Title</Label>
                    <Input
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      placeholder="Give your review a title..."
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Your Review</Label>
                    <Textarea
                      className="mt-2 bg-gray-700 border-gray-600 text-white min-h-[120px]"
                      placeholder="Tell other members about your experience. What did you like? What could be improved?"
                      value={experienceData.writtenReview}
                      onChange={(e) => setExperienceData(prev => ({ ...prev, writtenReview: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">What went well?</Label>
                      <Select>
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select highlights" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professionalism">Professional service</SelectItem>
                          <SelectItem value="timing">Great timing</SelectItem>
                          <SelectItem value="quality">High quality</SelectItem>
                          <SelectItem value="location">Perfect location</SelectItem>
                          <SelectItem value="communication">Clear communication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Service Category</Label>
                      <Input
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                        value={booking.service.category}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Review Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service Rating</span>
                    <div className="flex">
                      {[...Array(experienceData.serviceRating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Provider Rating</span>
                    <div className="flex">
                      {[...Array(experienceData.providerRating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Rating</span>
                    <div className="flex">
                      {[...Array(experienceData.overallRating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Photo Upload
        return (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Add Photos</h4>
                <p className="text-gray-300 mb-6">Share photos from your experience (optional)</p>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Drag & drop photos here or click to upload</p>
                    <Button
                      variant="outline"
                      className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                    >
                      Choose Photos
                    </Button>
                  </div>
                  
                  {experienceData.experiencePhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {experienceData.experiencePhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo} alt={`Experience ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Photo Guidelines</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Photos should be relevant to your service experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">High-quality images are preferred</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Respect privacy of other guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Maximum 10 photos per review</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Review Complete
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-600/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Review Complete!</h4>
                    <p className="text-sm text-green-300">Thank you for sharing your experience</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">Review Summary</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Overall Rating</span>
                        <div className="flex">
                          {[...Array(experienceData.overallRating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Service</span>
                        <span className="text-white font-medium">{booking.service.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Provider</span>
                        <span className="text-white font-medium">{booking.service.provider?.username || 'Professional Provider'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Date</span>
                        <span className="text-white font-medium">{format(new Date(booking.scheduledDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">Your Review</h5>
                    <p className="text-gray-300 text-sm">{experienceData.writtenReview || 'No written review provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">What's Next?</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Your review will be published after moderation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">You'll receive loyalty points for your review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Your feedback helps improve our services</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex-1"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Back to Services
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Book Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCurrentProcess = () => {
    switch (experienceData.currentProcess) {
      case 1:
        return renderProcess1();
      case 2:
        return renderProcess2();
      case 3:
        return renderProcess3();
      default:
        return renderProcess1();
    }
  };

  const canGoNext = () => {
    const { currentProcess, currentStep } = experienceData;
    
    if (currentProcess === 1 && currentStep === 5) {
      return experienceData.readyConfirmed;
    }
    if (currentProcess === 2 && currentStep === 5) {
      return experienceData.experienceCompleted;
    }
    if (currentProcess === 3 && currentStep === 1) {
      return experienceData.serviceRating > 0;
    }
    if (currentProcess === 3 && currentStep === 2) {
      return experienceData.providerRating > 0;
    }
    if (currentProcess === 3 && currentStep === 3) {
      return experienceData.overallRating > 0 && experienceData.writtenReview.length > 10;
    }
    
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Service Experience Journey
          </DialogTitle>
        </DialogHeader>
        
        {/* Process Progress */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((process) => (
              <div key={process} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  experienceData.currentProcess === process
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : experienceData.currentProcess > process
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {experienceData.currentProcess > process ? <CheckCircle className="w-5 h-5" /> : process}
                </div>
                <span className={`text-sm font-medium ${
                  experienceData.currentProcess === process
                    ? 'text-purple-400'
                    : experienceData.currentProcess > process
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}>
                  {PROCESS_TITLES[process - 1]}
                </span>
                {process < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    experienceData.currentProcess > process ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                onClick={() => setExperienceData(prev => ({ ...prev, currentStep: step }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  experienceData.currentStep === step
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : experienceData.currentStep > step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {experienceData.currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Title */}
        <div className="flex-shrink-0 text-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {STEP_TITLES[experienceData.currentProcess]?.[experienceData.currentStep - 1]}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Process {experienceData.currentProcess} of 3 • Step {experienceData.currentStep} of 5
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${experienceData.currentProcess}-${experienceData.currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentProcess()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={experienceData.currentProcess === 1 && experienceData.currentStep === 1}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {experienceData.currentProcess === 3 && experienceData.currentStep === 5 ? (
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Complete Experience
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canGoNext()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {experienceData.currentProcess === 3 && experienceData.currentStep === 4 ? 'Submit Review' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}