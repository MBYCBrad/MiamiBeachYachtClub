import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, Star, CheckCircle, X, CreditCard, Anchor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, Yacht } from "@shared/schema";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

interface ServiceBookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ service, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Booking state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    timeSlot: '',
    guestCount: 1,
    specialRequests: '',
    location: '',
    yachtBookingId: null as number | null,
    contactPhone: user?.phone || '',
    emergencyContact: ''
  });

  const [clientSecret, setClientSecret] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch user's yacht bookings if this is a yacht-specific service
  const { data: yachtBookings = [] } = useQuery<any[]>({
    queryKey: ['/api/bookings/user', user?.id],
    enabled: service.serviceType === 'yacht' && isOpen && !!user,
  });

  // Fetch available yachts for yacht-specific services
  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
    enabled: service.serviceType === 'yacht' && isOpen,
  });

  const serviceCategories: Record<string, string> = {
    'beauty_grooming': '💅',
    'culinary': '👨‍🍳',
    'wellness_spa': '🧘‍♀️',
    'photography_media': '📸',
    'entertainment': '🎭',
    'water_sports': '🏄‍♂️',
    'concierge_lifestyle': '🛎️'
  };

  // Different step flows based on service type
  const yachtServiceSteps = [
    { id: 1, title: 'Service Details', completed: currentStep > 1 },
    { id: 2, title: 'Select Yacht', completed: currentStep > 2 },
    { id: 3, title: 'Date & Time', completed: currentStep > 3 },
    { id: 4, title: 'Payment', completed: currentStep > 4 },
    { id: 5, title: 'Confirmation', completed: false }
  ];

  const locationServiceSteps = [
    { id: 1, title: 'Date & Location', completed: currentStep > 1 },
    { id: 2, title: 'Service Details', completed: currentStep > 2 },
    { id: 3, title: 'Payment', completed: currentStep > 3 },
    { id: 4, title: 'Confirmation', completed: false }
  ];

  const steps = service.serviceType === 'yacht' ? yachtServiceSteps : locationServiceSteps;
  const maxSteps = service.serviceType === 'yacht' ? 5 : 4;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setBookingData({
        bookingDate: '',
        timeSlot: '',
        guestCount: 1,
        specialRequests: '',
        location: service.serviceType === 'location' ? 'Miami Beach Yacht Club' : '',
        yachtBookingId: null,
        contactPhone: user?.phone || '',
        emergencyContact: ''
      });
      setClientSecret('');
      setPaymentCompleted(false);
      setPaymentProcessing(false);
    }
  }, [isOpen, user?.phone, service.serviceType]);

  // Create payment intent when moving to payment step (different step for each service type)
  useEffect(() => {
    const paymentStep = service.serviceType === 'yacht' ? 4 : 3;
    if (currentStep === paymentStep && !clientSecret) {
      createPaymentIntent();
    }
  }, [currentStep, service.serviceType]);

  const createPaymentIntent = async () => {
    try {
      const response = await apiRequest('POST', '/api/create-service-payment-intent', {
        serviceId: service.id,
        amount: parseFloat(service.pricePerSession),
        providerId: service.providerId
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Setup Error",
        description: "Failed to set up payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Create service booking mutation
  const createServiceBookingMutation = useMutation({
    mutationFn: async (booking: any) => {
      const response = await apiRequest('POST', '/api/service-bookings', booking);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      
      toast({
        title: "Service Booked Successfully!",
        description: `Your ${service.name} booking has been confirmed.`,
      });

      setCurrentStep(maxSteps);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create service booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const maxSteps = service.serviceType === 'yacht' ? 5 : 4;

  const handleNext = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingSubmit = async () => {
    if (!user || !paymentCompleted) return;

    const bookingPayload = {
      userId: user.id,
      serviceId: service.id,
      yachtBookingId: bookingData.yachtBookingId,
      bookingDate: new Date(bookingData.bookingDate).toISOString(),
      location: bookingData.location,
      guestCount: bookingData.guestCount,
      specialRequests: bookingData.specialRequests,
      status: 'confirmed',
      totalPrice: service.pricePerSession
    };

    createServiceBookingMutation.mutate(bookingPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-700 text-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">Book Service</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Service Header */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={service.imageUrl || '/api/placeholder/64/64'} 
                alt={service.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{service.name}</h3>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {serviceCategories[service.category]} {service.category.replace('_', ' ')}
                </Badge>
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration} minutes
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-300 text-sm ml-1">{service.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">${service.pricePerSession}</div>
              <div className="text-xs text-gray-400">per session</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                  : step.completed 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                {step.completed ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-purple-300' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 - Different for Yacht vs Location Services */}
          {currentStep === 1 && service.serviceType === 'yacht' && (
            <motion.div
              key="yacht-step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-white">Service Details & Contact Information</h3>
                <p className="text-gray-300">First, let's get your service details and contact information</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Guest Count</Label>
                  <Select value={bookingData.guestCount.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, guestCount: parseInt(value) }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-white font-medium">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={bookingData.contactPhone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Your phone number"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-white font-medium">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special requirements or preferences..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && service.serviceType === 'location' && (
            <motion.div
              key="location-step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white font-medium">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, bookingDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Time Slot</Label>
                  <Select value={bookingData.timeSlot} onValueChange={(value) => setBookingData(prev => ({ ...prev, timeSlot: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6:00 PM - 9:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {service.serviceType === 'yacht' ? (
                <div className="space-y-4">
                  <Label className="text-white font-medium">Select Yacht or Existing Booking</Label>
                  
                  {yachtBookings.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Existing Yacht Bookings</Label>
                      <Select 
                        value={bookingData.yachtBookingId?.toString() || ''} 
                        onValueChange={(value) => setBookingData(prev => ({ ...prev, yachtBookingId: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select existing booking" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {yachtBookings.map((booking: any) => (
                            <SelectItem key={booking.id} value={booking.id.toString()}>
                              {booking.yacht?.name} - {new Date(booking.startTime).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="text-center text-gray-400">or</div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Available Yachts</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {yachts.map((yacht) => (
                        <Card key={yacht.id} className="bg-gray-800/50 border-gray-600 hover:border-purple-500 cursor-pointer transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Anchor className="w-8 h-8 text-purple-400" />
                              <div>
                                <div className="font-medium text-white">{yacht.name}</div>
                                <div className="text-sm text-gray-400">{yacht.size}ft • Up to {yacht.capacity} guests</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white font-medium">Service Location</Label>
                  <Input
                    id="location"
                    value={bookingData.location}
                    onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter service location"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleNext}
                  disabled={!bookingData.bookingDate || !bookingData.timeSlot || (service.serviceType === 'location' && !bookingData.location)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Next: Service Details
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2 - Yacht Selection (only for yacht services) */}
          {currentStep === 2 && service.serviceType === 'yacht' && (
            <motion.div
              key="yacht-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-white">Select Yacht</h3>
                <p className="text-gray-300">Choose a yacht for your {service.name} service</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yachts.map((yacht) => (
                  <Card 
                    key={yacht.id} 
                    className={`bg-gray-800/50 border-gray-600 hover:border-purple-500 cursor-pointer transition-all ${
                      selectedYacht?.id === yacht.id ? 'border-purple-500 bg-purple-600/10' : ''
                    }`}
                    onClick={() => setSelectedYacht(yacht)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={yacht.imageUrl || '/api/placeholder/80/80'} 
                          alt={yacht.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white text-lg">{yacht.name}</div>
                          <div className="text-sm text-gray-400">{yacht.size}ft • Up to {yacht.capacity} guests</div>
                          <div className="text-sm text-gray-300 mt-1">{yacht.location}</div>
                          <Badge className="bg-green-600/20 text-green-300 border-green-500/30 mt-2">
                            Available
                          </Badge>
                        </div>
                        {selectedYacht?.id === yacht.id && (
                          <CheckCircle className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!selectedYacht}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Next: Date & Time
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 - Date & Time (only for yacht services) */}
          {currentStep === 3 && service.serviceType === 'yacht' && (
            <motion.div
              key="yacht-step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-white">Date & Time</h3>
                <p className="text-gray-300">Schedule your {service.name} service on {selectedYacht?.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white font-medium">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, bookingDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Time Slot</Label>
                  <Select value={bookingData.timeSlot} onValueChange={(value) => setBookingData(prev => ({ ...prev, timeSlot: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6:00 PM - 9:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!bookingData.bookingDate || !bookingData.timeSlot}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Next: Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2 for Location Services - Service Details */}
          {currentStep === 2 && service.serviceType === 'location' && (
            <motion.div
              key="service-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guestCount" className="text-white font-medium">Number of Guests</Label>
                  <Select value={bookingData.guestCount.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, guestCount: parseInt(value) }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Guest{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-white font-medium">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={bookingData.contactPhone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Your phone number"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-white font-medium">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special requirements or requests for this service..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Next: Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Step - Step 3 for Location, Step 4 for Yacht */}
          {((currentStep === 3 && service.serviceType === 'location') || (currentStep === 4 && service.serviceType === 'yacht')) && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Service:</span>
                    <span className="text-white">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Date:</span>
                    <span className="text-white">{bookingData.bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Time:</span>
                    <span className="text-white">{bookingData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Guests:</span>
                    <span className="text-white">{bookingData.guestCount}</span>
                  </div>
                  {service.serviceType === 'yacht' && selectedYacht && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Yacht:</span>
                      <span className="text-white">{selectedYacht.name} ({selectedYacht.size}ft)</span>
                    </div>
                  )}
                  {service.serviceType === 'location' && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Location:</span>
                      <span className="text-white">{bookingData.location}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">${service.pricePerSession}</span>
                    </div>
                  </div>
                </div>
              </div>

              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <ServicePaymentForm 
                    onPaymentSuccess={() => {
                      setPaymentCompleted(true);
                      handleNext();
                    }}
                    processing={paymentProcessing}
                    setProcessing={setPaymentProcessing}
                  />
                </Elements>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* Confirmation Step - Step 4 for Location, Step 5 for Yacht */}
          {((currentStep === 4 && service.serviceType === 'location') || (currentStep === 5 && service.serviceType === 'yacht')) && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Service Booked Successfully!</h3>
                <p className="text-gray-300">
                  Your {service.name} booking has been confirmed for {bookingData.bookingDate}.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">What's Next?</h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>• You'll receive a confirmation email shortly</p>
                  <p>• The service provider will contact you to confirm details</p>
                  <p>• Check your trips page for booking details</p>
                </div>
              </div>

              <Button 
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete booking when payment is successful */}
        {paymentCompleted && currentStep === 4 && (
          <div className="mt-6">
            {handleBookingSubmit()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Payment form component
const ServicePaymentForm: React.FC<{
  onPaymentSuccess: () => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}> = ({ onPaymentSuccess, processing, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required'
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Your service has been booked!",
      });
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800/30 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      >
        {processing ? 'Processing...' : 'Complete Payment'}
      </Button>
    </form>
  );
};

export default ServiceBookingModal;