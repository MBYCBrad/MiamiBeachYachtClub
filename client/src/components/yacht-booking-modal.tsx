import React, { useState } from 'react';
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

  // Time slots (4-hour blocks) with actual time ranges displayed
  const timeSlots = [
    { 
      value: '09:00-13:00', 
      label: 'Morning Cruise', 
      timeRange: '9:00 AM - 1:00 PM',
      icon: '🌅', 
      description: 'Perfect for breakfast cruises and peaceful morning waters' 
    },
    { 
      value: '13:00-17:00', 
      label: 'Afternoon Adventure', 
      timeRange: '1:00 PM - 5:00 PM',
      icon: '☀️', 
      description: 'Ideal for lunch cruises and swimming activities' 
    },
    { 
      value: '17:00-21:00', 
      label: 'Sunset Experience', 
      timeRange: '5:00 PM - 9:00 PM',
      icon: '🌅', 
      description: 'Romantic sunset views and evening dining' 
    },
    { 
      value: '21:00-01:00', 
      label: 'Night Party', 
      timeRange: '9:00 PM - 1:00 AM',
      icon: '🌙', 
      description: 'Exclusive nighttime entertainment and city lights' 
    }
  ];

  const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<string, {available: boolean, bookedBy?: string}>>({});

  // Booking steps
  const steps = [
    { id: 1, title: 'Date & Time', completed: currentStep > 1 },
    { id: 2, title: 'Guest Details', completed: currentStep > 2 },
    { id: 3, title: 'Review', completed: currentStep > 3 },
    { id: 4, title: 'Confirmation', completed: false }
  ];

  // Real-time availability check from database
  const checkAllTimeSlotAvailability = async (selectedDate: string) => {
    if (!yacht || !selectedDate) return;

    try {
      const response = await apiRequest('POST', '/api/bookings/check-all-availability', {
        yachtId: yacht.id,
        date: selectedDate
      });
      const result = await response.json();
      
      // Set the raw availability data directly
      setTimeSlotAvailability(result.availability);
      console.log('Real-time availability for', selectedDate, ':', result.availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setTimeSlotAvailability({});
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
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
    }
  }, [isOpen, user?.phone]);

  // Check availability when date changes
  React.useEffect(() => {
    if (bookingData.startDate) {
      checkAllTimeSlotAvailability(bookingData.startDate);
    }
  }, [bookingData.startDate, yacht]);

  // No longer needed - availability is checked instantly when date changes

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest('POST', '/api/bookings', booking);
      return await response.json();
    },
    onSuccess: (newBooking: Booking) => {
      // Invalidate all booking-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/yachts'] });
      
      // Reset availability status so it rechecks on next attempt
      setTimeSlotAvailability({});
      
      setCurrentStep(4);
      toast({
        title: "Booking Confirmed!",
        description: `Your yacht booking #${newBooking.id} has been confirmed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleBookingSubmit = () => {
    if (!yacht || !user || !bookingData.timeSlot || !bookingData.startDate) return;

    // Map time slots to actual times (same as availability check)
    const timeSlotMap: Record<string, { start: string; end: string }> = {
      'morning': { start: '09:00', end: '13:00' },
      'afternoon': { start: '13:00', end: '17:00' },
      'evening': { start: '17:00', end: '21:00' },
      'night': { start: '21:00', end: '01:00' }
    };

    const timeMapping = timeSlotMap[bookingData.timeSlot];
    if (!timeMapping) return;

    const startDate = bookingData.startDate;
    const endDate = bookingData.timeSlot === 'night' ? 
      new Date(new Date(bookingData.startDate).getTime() + 86400000).toISOString().split('T')[0] : 
      bookingData.startDate;
    
    const bookingPayload: InsertBooking = {
      userId: user.id,
      yachtId: yacht.id,
      startTime: new Date(`${startDate}T${timeMapping.start}:00`),
      endTime: new Date(`${endDate}T${timeMapping.end}:00`),
      guestCount: bookingData.guestCount,
      totalPrice: "0.00",
      status: 'confirmed',
      specialRequests: bookingData.specialRequests
    };

    createBookingMutation.mutate(bookingPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">Book Your Yacht</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Yacht Info Header */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={yacht.imageUrl || getYachtImage(yacht.id)}
              alt={yacht.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{yacht.name}</h3>
              <div className="flex items-center text-gray-300 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {yacht.location}
              </div>
              <div className="flex items-center space-x-4 mt-2">
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
              <span className={`ml-2 text-sm ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-600 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Date Selection */}
              <div>
                <Label htmlFor="startDate" className="text-gray-300">Select Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-gray-700/50 border-gray-600 text-white mt-2"
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label className="text-gray-300">Choose Your 4-Hour Time Slot</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {timeSlots.map((slot) => {
                    const slotData = timeSlotAvailability[slot.value];
                    const isAvailable = slotData?.available;
                    const isBooked = slotData?.available === false;
                    const hasDataLoaded = Object.keys(timeSlotAvailability).length > 0;
                    

                    
                    return (
                      <motion.div
                        key={slot.value}
                        whileHover={isAvailable ? { scale: 1.02 } : {}}
                        whileTap={isAvailable ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (isAvailable) {
                            setBookingData({...bookingData, timeSlot: slot.value});
                          }
                        }}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                          isBooked
                            ? 'border-red-500/50 bg-red-500/10 cursor-not-allowed opacity-75'
                            : bookingData.timeSlot === slot.value 
                            ? 'border-purple-500 bg-purple-500/20 cursor-pointer' 
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{slot.icon}</span>
                            <div>
                              <h4 className={`font-medium text-sm ${isBooked ? 'text-gray-500' : 'text-white'}`}>
                                {slot.label}
                              </h4>
                              <p className={`text-xs font-medium ${isBooked ? 'text-gray-500' : 'text-purple-300'}`}>
                                {slot.timeRange}
                              </p>
                              <p className="text-xs text-gray-400">{slot.description}</p>
                            </div>
                          </div>
                        {/* Status Indicators */}
                        <div className="flex flex-col items-end space-y-1">
                          {bookingData.timeSlot === slot.value && isAvailable && (
                            <CheckCircle className="w-5 h-5 text-purple-400" />
                          )}
                          
                          {/* Real-time availability status from database */}
                          {timeSlotAvailability[slot.value] && (
                            <div className={`text-xs px-2 py-1 rounded font-medium ${
                              timeSlotAvailability[slot.value].available
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {timeSlotAvailability[slot.value].available ? 'Available' : 'Already Booked'}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );})}
                </div>
              </div>

              {/* Experience Type & Guest Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Experience Type</Label>
                  <Select value={bookingData.experienceType} onValueChange={(value) => setBookingData({...bookingData, experienceType: value})}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leisure_tour">Leisure Tour</SelectItem>
                      <SelectItem value="swimming_excursion">Swimming & Water Sports</SelectItem>
                      <SelectItem value="dining_experience">Fine Dining Experience</SelectItem>
                      <SelectItem value="corporate_event">Corporate Event</SelectItem>
                      <SelectItem value="celebration">Private Celebration</SelectItem>
                      <SelectItem value="photography">Photography Session</SelectItem>
                      <SelectItem value="fishing_charter">Fishing Charter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guestCount" className="text-gray-300">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    max={yacht.capacity}
                    value={bookingData.guestCount}
                    onChange={(e) => setBookingData({...bookingData, guestCount: parseInt(e.target.value) || 1})}
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max: {yacht.capacity} guests</p>
                </div>
              </div>

              {/* Member Benefit Notice */}
              <Alert className="border-green-500/50 bg-green-500/10">
                <Anchor className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  <strong>Member Benefit:</strong> All yacht bookings are complimentary for MBYC members.
                </AlertDescription>
              </Alert>

              {/* Instant Availability Display */}
              {bookingData.startDate && bookingData.timeSlot && timeSlotAvailability[bookingData.timeSlot] && (
                <Alert className={`${timeSlotAvailability[bookingData.timeSlot]?.available ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <AlertDescription className={timeSlotAvailability[bookingData.timeSlot]?.available ? 'text-green-400' : 'text-red-400'}>
                    {timeSlotAvailability[bookingData.timeSlot]?.available
                      ? '✓ Yacht is available for your selected date and time slot!'
                      : '✗ Sorry, this yacht is not available for the selected date and time. Please choose a different slot.'
                    }
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!timeSlotAvailability[bookingData.timeSlot]?.available || !bookingData.startDate || !bookingData.timeSlot}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue
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
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone" className="text-gray-300">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={bookingData.contactPhone}
                    onChange={(e) => setBookingData({...bookingData, contactPhone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact" className="text-gray-300">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={bookingData.emergencyContact}
                    onChange={(e) => setBookingData({...bookingData, emergencyContact: e.target.value})}
                    placeholder="Emergency contact"
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequests" className="text-gray-300">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  placeholder="Any special requests, dietary restrictions, or celebration details..."
                  className="bg-gray-700/50 border-gray-600 text-white min-h-[80px] mt-2"
                />
              </div>

              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Info className="w-4 h-4 text-blue-400" />
                <AlertDescription className="text-blue-400">
                  All guests must be present at check-in and sign safety waivers before boarding.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-gray-600 text-gray-300">
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!bookingData.contactPhone}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Review Booking
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
              className="space-y-4"
            >
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <p className="text-white">{new Date(bookingData.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Time:</span>
                    <p className="text-white">{timeSlots.find(slot => slot.value === bookingData.timeSlot)?.label}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Guests:</span>
                    <p className="text-white">{bookingData.guestCount} guests</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <p className="text-green-400 font-bold">FREE</p>
                  </div>
                </div>
              </div>

              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <Shield className="w-4 h-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  By confirming, you agree to our Terms of Service and Cancellation Policy. Free cancellation 24+ hours before departure.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-gray-600 text-gray-300">
                  Back
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
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