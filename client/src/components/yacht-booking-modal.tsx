import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, Star, Shield, CheckCircle, X, Info, Anchor } from 'lucide-react';
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
import type { Yacht, Booking, InsertBooking } from "@shared/schema";
import ServicePaymentForm from './service-payment-form';

// Interface definitions for yacht booking modal



interface YachtBookingModalProps {
  yacht: Yacht;
  isOpen: boolean;
  onClose: () => void;
}

const YACHT_IMAGES = [
  "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg",
  "/api/media/pexels-goumbik-296278_1750537277229.jpg",
  "/api/media/pexels-mali-42092_1750537277229.jpg",
  "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
  "/api/media/pexels-pixabay-163236_1750537277230.jpg",
  "/api/media/pexels-mali-42091_1750537294323.jpg"
];

const getYachtImage = (yachtId: number) => {
  return YACHT_IMAGES[(yachtId - 1) % YACHT_IMAGES.length];
};

export default function YachtBookingModal({ yacht, isOpen, onClose }: YachtBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Booking state
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    timeSlot: '',
    guestCount: 1,
    specialRequests: '',
    contactPhone: user?.phone || '',
    emergencyContact: '',
    experienceType: 'leisure_tour'
  });

  const [selectedServices, setSelectedServices] = useState<{serviceId: number, price: number, name: string}[]>([]);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<string, {available: boolean, bookedBy?: string}>>({});

  // Fetch only yacht add-on services (not location services)
  const { data: services = [] } = useQuery<any[]>({
    queryKey: ['/api/services'],
    enabled: currentStep === 3,
    select: (data) => data.filter(service => service.serviceType === 'yacht'), // Only yacht add-on services
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

  const steps = [
    { id: 1, title: 'Date & Time', completed: currentStep > 1 },
    { id: 2, title: 'Guest Details', completed: currentStep > 2 },
    { id: 3, title: 'Concierge Services', completed: currentStep > 3 },
    { id: 4, title: 'Review', completed: currentStep > 4 },
    { id: 5, title: 'Confirmation', completed: false }
  ];

  // Check availability for all time slots on a specific date
  const checkAllTimeSlotAvailability = async (date: string) => {
    if (!yacht || !date) return;

    try {
      const response = await apiRequest('POST', '/api/bookings/check-all-availability', {
        yachtId: yacht.id,
        date: date
      });
      const data = await response.json();
      console.log('Real-time availability for', date, ':', data.availability);
      setTimeSlotAvailability(data.availability || {});
    } catch (error) {
      console.error('Error checking availability:', error);
      setTimeSlotAvailability({});
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setBookingData({
        startDate: '',
        timeSlot: '',
        guestCount: 1,
        specialRequests: '',
        contactPhone: user?.phone || '',
        emergencyContact: '',
        experienceType: 'leisure_tour'
      });
      setTimeSlotAvailability({});
      setSelectedServices([]);
      setPaymentCompleted(false);
      setPaymentProcessing(false);
      setPaymentIntentId('');
    }
  }, [isOpen, user?.phone]);

  // Check availability when date changes
  useEffect(() => {
    if (bookingData.startDate) {
      checkAllTimeSlotAvailability(bookingData.startDate);
    }
  }, [bookingData.startDate, yacht]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (booking: any) => {
      // Convert Date objects to ISO strings for API
      const apiBooking = {
        ...booking,
        startTime: booking.startTime instanceof Date ? booking.startTime.toISOString() : booking.startTime,
        endTime: booking.endTime instanceof Date ? booking.endTime.toISOString() : booking.endTime
      };
      const response = await apiRequest('POST', '/api/bookings', apiBooking);
      return await response.json();
    },
    onSuccess: async (newBooking: Booking) => {
      // Create service bookings if any services were selected and payment completed
      if (selectedServices.length > 0 && paymentCompleted) {
        try {
          for (const service of selectedServices) {
            await apiRequest('POST', '/api/service-bookings', {
              userId: user!.id,
              serviceId: service.serviceId,
              yachtBookingId: newBooking.id, // Link to yacht booking
              bookingDate: new Date(bookingData.startDate).toISOString(),
              location: `${yacht.name} - Yacht Add-on Service`,
              guestCount: bookingData.guestCount,
              status: 'confirmed',
              totalPrice: service.price.toString(),
              specialRequests: `Associated with yacht booking #${newBooking.id} for ${yacht.name}. Payment ID: ${paymentIntentId}`
            });
          }
        } catch (error) {
          console.error('Error creating service bookings:', error);
        }
      }

      // Invalidate queries to refresh data across all systems
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });

      toast({
        title: "Booking Confirmed!",
        description: `Your yacht booking for ${yacht.name} has been confirmed.`,
      });

      setCurrentStep(5);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleBookingSubmit = async () => {
    if (!yacht || !user || !bookingData.timeSlot || !bookingData.startDate) return;

    // Map time slots to actual times
    const timeSlotMap: Record<string, { start: string; end: string }> = {
      'morning': { start: '09:00', end: '13:00' },
      'afternoon': { start: '13:00', end: '17:00' },
      'evening': { start: '17:00', end: '21:00' },
      'night': { start: '21:00', end: '01:00' }
    };

    const timeMapping = timeSlotMap[bookingData.timeSlot];
    if (!timeMapping) return;

    // Ensure proper date formatting
    const baseDate = new Date(bookingData.startDate);
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(parseInt(timeMapping.start.split(':')[0]), parseInt(timeMapping.start.split(':')[1]), 0, 0);
    
    const endDateTime = new Date(baseDate);
    if (bookingData.timeSlot === 'night' && timeMapping.end === '01:00') {
      // Night slot ends next day at 1 AM
      endDateTime.setDate(endDateTime.getDate() + 1);
      endDateTime.setHours(1, 0, 0, 0);
    } else {
      endDateTime.setHours(parseInt(timeMapping.end.split(':')[0]), parseInt(timeMapping.end.split(':')[1]), 0, 0);
    }
    
    const bookingPayload = {
      userId: user.id,
      yachtId: yacht.id,
      startTime: startDateTime,
      endTime: endDateTime,
      guestCount: bookingData.guestCount,
      totalPrice: "0.00",
      status: 'confirmed',
      specialRequests: bookingData.specialRequests
    };

    createBookingMutation.mutate(bookingPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">Book Your Yacht</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Yacht Header */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={getYachtImage(yacht.id)} 
                alt={yacht.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{yacht.name}</h3>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {yacht.size}ft
                </Badge>
                <div className="flex items-center text-gray-300 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  Up to {yacht.capacity} guests
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-300 text-sm ml-1">4.9</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">FREE</div>
              <div className="text-xs text-gray-400">with membership</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-purple-600 text-white' 
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
          {currentStep === 1 && (
            <motion.div
              key="step1"
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
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Experience Type</Label>
                  <Select value={bookingData.experienceType} onValueChange={(value) => setBookingData(prev => ({ ...prev, experienceType: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="leisure_tour">Leisure Tour</SelectItem>
                      <SelectItem value="swimming_watersports">Swimming & Water Sports</SelectItem>
                      <SelectItem value="fine_dining">Fine Dining Experience</SelectItem>
                      <SelectItem value="corporate_event">Corporate Event</SelectItem>
                      <SelectItem value="private_celebration">Private Celebration</SelectItem>
                      <SelectItem value="photography_session">Photography Session</SelectItem>
                      <SelectItem value="fishing_charter">Fishing Charter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bookingData.startDate && (
                <div className="space-y-3">
                  <Label className="text-white font-medium">Select Time Slot (4-hour duration)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'morning', label: 'Morning Cruise', time: '9:00 AM - 1:00 PM', icon: '🌅' },
                      { id: 'afternoon', label: 'Afternoon Cruise', time: '1:00 PM - 5:00 PM', icon: '☀️' },
                      { id: 'evening', label: 'Evening Cruise', time: '5:00 PM - 9:00 PM', icon: '🌆' },
                      { id: 'night', label: 'Night Cruise', time: '9:00 PM - 1:00 AM', icon: '🌙' }
                    ].map((slot) => {
                      const availability = timeSlotAvailability[slot.id];
                      const isAvailable = availability?.available !== false;
                      const isSelected = bookingData.timeSlot === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => isAvailable && setBookingData(prev => ({ ...prev, timeSlot: slot.id }))}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20'
                              : isAvailable
                                ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                                : 'border-red-500/50 bg-red-500/10 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{slot.icon}</span>
                              <div>
                                <div className="font-medium text-white">{slot.label}</div>
                                <div className="text-sm text-purple-300">{slot.time}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={isAvailable ? 'bg-green-600/20 text-green-300 border-green-500/30' : 'bg-red-600/20 text-red-300 border-red-500/30'}>
                                {isAvailable ? 'Available' : 'Already Booked'}
                              </Badge>
                              {!isAvailable && availability?.bookedBy && (
                                <div className="text-xs text-gray-400 mt-1">by {availability.bookedBy}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <div></div>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!bookingData.startDate || !bookingData.timeSlot}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Guest Details
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-white font-medium">Number of Guests</Label>
                  <Select value={bookingData.guestCount.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, guestCount: parseInt(value) }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 z-50">
                      {Array.from({ length: yacht.capacity }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white font-medium">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingData.contactPhone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency" className="text-white font-medium">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    type="tel"
                    value={bookingData.emergencyContact}
                    onChange={(e) => setBookingData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests" className="text-white font-medium">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Any special requests or dietary restrictions..."
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-gray-600 text-gray-300">
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!bookingData.contactPhone || !bookingData.emergencyContact}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Services
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Optional Concierge Services</h3>
                <p className="text-gray-400">Enhance your yacht experience with premium services</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const isSelected = selectedServices.some(s => s.serviceId === service.id);
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedServices(prev => prev.filter(s => s.serviceId !== service.id));
                        } else {
                          setSelectedServices(prev => [...prev, {
                            serviceId: service.id,
                            price: parseFloat(service.pricePerSession || '0'),
                            name: service.name
                          }]);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{serviceCategories[service.category] || '🛎️'}</span>
                          <div>
                            <h4 className="font-medium text-white">{service.name}</h4>
                            <p className="text-sm text-gray-400">{service.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-400">${service.pricePerSession}</div>
                          <div className="text-xs text-gray-400">per service</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-2">Selected Services</h4>
                  <div className="space-y-1">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{service.name}</span>
                        <span className="text-purple-400">${service.price}</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-500/30 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Total Add-ons:</span>
                        <span className="text-purple-400">${selectedServices.reduce((sum, s) => sum + s.price, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Alert className="border-green-500/50 bg-green-500/10">
                <Info className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Your yacht rental is complimentary. Concierge services are optional premium add-ons that will be charged separately.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-gray-600 text-gray-300">
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {selectedServices.length > 0 ? 'Review Booking' : 'Skip Services'}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Review Your Booking</h3>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-400">Yacht:</span>
                    <p className="text-white font-medium">{yacht.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Date:</span>
                    <p className="text-white font-medium">{new Date(bookingData.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Time:</span>
                    <p className="text-white font-medium">
                      {bookingData.timeSlot === 'morning' && '9:00 AM - 1:00 PM'}
                      {bookingData.timeSlot === 'afternoon' && '1:00 PM - 5:00 PM'}
                      {bookingData.timeSlot === 'evening' && '5:00 PM - 9:00 PM'}
                      {bookingData.timeSlot === 'night' && '9:00 PM - 1:00 AM'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Guests:</span>
                    <p className="text-white font-medium">{bookingData.guestCount}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Yacht Rental:</span>
                    <p className="text-green-400 font-bold">FREE</p>
                  </div>
                </div>

                {/* Selected Services Summary & Payment */}
                {selectedServices.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="font-medium text-white mb-2">Selected Concierge Services</h4>
                    <div className="space-y-1 mb-4">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{service.name}</span>
                          <span className="text-purple-400">${service.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-white">Services Total:</span>
                          <span className="text-purple-400">${selectedServices.reduce((sum, s) => sum + s.price, 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Payment Form */}
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                      <h5 className="font-medium text-white mb-3">Payment for Concierge Services</h5>
                      <ServicePaymentForm 
                        selectedServices={selectedServices}
                        onPaymentSuccess={(paymentIntent) => {
                          setPaymentCompleted(true);
                          setPaymentIntentId(paymentIntent.id);
                          toast({
                            title: "Payment Successful",
                            description: `Your payment of $${selectedServices.reduce((sum, s) => sum + s.price, 0)} for concierge services has been processed.`,
                          });
                        }}
                        onPaymentError={(error) => {
                          toast({
                            title: "Payment Failed",
                            description: error,
                            variant: "destructive"
                          });
                        }}
                        isProcessing={paymentProcessing}
                        setIsProcessing={setPaymentProcessing}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <Shield className="w-4 h-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  By confirming, you agree to our Terms of Service and Cancellation Policy. Free cancellation 24+ hours before departure.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-gray-600 text-gray-300">
                  Back
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending || (selectedServices.length > 0 && !paymentCompleted)}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {createBookingMutation.isPending 
                    ? 'Confirming...' 
                    : selectedServices.length > 0 && !paymentCompleted 
                      ? 'Complete Payment First' 
                      : 'Confirm Booking'}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
              <p className="text-gray-300">
                Your yacht booking has been confirmed. Check your email for details.
              </p>
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}