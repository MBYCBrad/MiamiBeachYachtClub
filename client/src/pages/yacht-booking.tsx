import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, Star, Shield, CheckCircle, ArrowLeft, Info, Anchor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Yacht, Booking, InsertBooking } from "@shared/schema";

interface BookingStep {
  id: number;
  title: string;
  completed: boolean;
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

export default function YachtBooking() {
  const [, params] = useRoute('/yachts/:id/book');
  const yachtId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
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
    experienceType: 'day_cruise'
  });

  // Time slots (4-hour blocks)
  const timeSlots = [
    { value: '09:00-13:00', label: 'Morning Cruise (9:00 AM - 1:00 PM)', icon: '🌅', description: 'Perfect for breakfast cruises and peaceful morning waters' },
    { value: '13:00-17:00', label: 'Afternoon Adventure (1:00 PM - 5:00 PM)', icon: '☀️', description: 'Ideal for lunch cruises and swimming activities' },
    { value: '17:00-21:00', label: 'Sunset Experience (5:00 PM - 9:00 PM)', icon: '🌅', description: 'Romantic sunset views and evening dining' },
    { value: '21:00-01:00', label: 'Night Party (9:00 PM - 1:00 AM)', icon: '🌙', description: 'Exclusive nighttime entertainment and city lights' }
  ];

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Fetch yacht details
  const { data: yacht, isLoading: yachtLoading } = useQuery<Yacht>({
    queryKey: ['/api/yachts', yachtId],
    enabled: !!yachtId
  });

  // Booking steps
  const steps: BookingStep[] = [
    { id: 1, title: 'Select Date & Time Slot', completed: currentStep > 1 },
    { id: 2, title: 'Guest Details', completed: currentStep > 2 },
    { id: 3, title: 'Review Booking', completed: currentStep > 3 },
    { id: 4, title: 'Confirmation', completed: false }
  ];

  // Check availability
  const checkAvailability = async () => {
    if (!yacht || !bookingData.startDate || !bookingData.timeSlot) return;

    setAvailabilityLoading(true);
    try {
      const [startTime, endTime] = bookingData.timeSlot.split('-');
      const response = await apiRequest('POST', '/api/bookings/check-availability', {
        yachtId: yacht.id,
        startDate: bookingData.startDate,
        startTime: startTime,
        endDate: bookingData.startDate, // Same day booking
        endTime: endTime
      });
      const result = await response.json();
      setIsAvailable(result.available);
    } catch (error) {
      setIsAvailable(false);
      toast({
        title: "Error checking availability",
        description: "Please try again",
        variant: "destructive"
      });
    }
    setAvailabilityLoading(false);
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest('POST', '/api/bookings', booking);
      return await response.json();
    },
    onSuccess: (newBooking: Booking) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
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
    if (!yacht || !user || !bookingData.timeSlot) return;

    const [startTime, endTime] = bookingData.timeSlot.split('-');
    
    const bookingPayload: InsertBooking = {
      userId: user.id,
      yachtId: yacht.id,
      startTime: new Date(`${bookingData.startDate}T${startTime}:00`),
      endTime: new Date(`${bookingData.startDate}T${endTime}:00`),
      guestCount: bookingData.guestCount,
      totalPrice: "0.00", // Free for members
      status: 'confirmed',
      specialRequests: bookingData.specialRequests
    };

    createBookingMutation.mutate(bookingPayload);
  };

  if (yachtLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading yacht details...</div>
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yacht not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/yachts/${yacht.id}`)}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to yacht
              </Button>
              <h1 className="text-2xl font-bold text-white">Book {yacht.name}</h1>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-8">
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
                    <div className="w-12 h-px bg-gray-600 ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                        Select Your Date & Time Slot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {timeSlots.map((slot) => (
                            <motion.div
                              key={slot.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setBookingData({...bookingData, timeSlot: slot.value})}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                ${bookingData.timeSlot === slot.value 
                                  ? 'border-purple-500 bg-purple-500/20' 
                                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{slot.icon}</span>
                                  <div>
                                    <h3 className="font-semibold text-white">{slot.label}</h3>
                                    <p className="text-sm text-gray-400">{slot.description}</p>
                                  </div>
                                </div>
                                {bookingData.timeSlot === slot.value && (
                                  <CheckCircle className="w-6 h-6 text-purple-400" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Type */}
                      <div>
                        <Label className="text-gray-300">Experience Type</Label>
                        <Select value={bookingData.experienceType} onValueChange={(value) => setBookingData({...bookingData, experienceType: value})}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day_cruise">Day Cruise</SelectItem>
                            <SelectItem value="sunset_cruise">Sunset Cruise</SelectItem>
                            <SelectItem value="party_cruise">Party Cruise</SelectItem>
                            <SelectItem value="corporate_event">Corporate Event</SelectItem>
                            <SelectItem value="special_occasion">Special Occasion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Guest Count */}
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
                        <p className="text-sm text-gray-400 mt-1">Maximum capacity: {yacht.capacity} guests</p>
                      </div>

                      {/* Member Benefit Notice */}
                      <Alert className="border-green-500/50 bg-green-500/10">
                        <Anchor className="w-4 h-4 text-green-400" />
                        <AlertDescription className="text-green-400">
                          <strong>Member Benefit:</strong> All yacht bookings are complimentary for MBYC members. 
                          Enjoy unlimited access to our luxury fleet with your {user?.membershipTier} membership.
                        </AlertDescription>
                      </Alert>

                      {/* Availability Check */}
                      {bookingData.startDate && bookingData.timeSlot && (
                        <div>
                          <Button
                            onClick={checkAvailability}
                            disabled={availabilityLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {availabilityLoading ? 'Checking...' : 'Check Availability'}
                          </Button>
                          
                          {isAvailable !== null && (
                            <Alert className={`mt-4 ${isAvailable ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                              <AlertDescription className={isAvailable ? 'text-green-400' : 'text-red-400'}>
                                {isAvailable 
                                  ? '✓ Yacht is available for your selected date and time slot!'
                                  : '✗ Sorry, this yacht is not available for the selected date and time. Please choose a different slot.'
                                }
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!isAvailable || !bookingData.startDate || !bookingData.timeSlot}
                      className="bg-purple-600 hover:bg-purple-700 px-8"
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
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-400" />
                        Guest Details & Special Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <Label htmlFor="contactPhone" className="text-gray-300">Contact Phone Number</Label>
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
                          placeholder="Emergency contact number"
                          className="bg-gray-700/50 border-gray-600 text-white mt-2"
                        />
                      </div>

                      {/* Special Requests */}
                      <div>
                        <Label htmlFor="specialRequests" className="text-gray-300">Special Requests or Notes</Label>
                        <Textarea
                          id="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                          placeholder="Any special requests, dietary restrictions, celebration details, or additional services needed..."
                          className="bg-gray-700/50 border-gray-600 text-white min-h-[120px] mt-2"
                        />
                      </div>

                      {/* Guest Information Notice */}
                      <Alert className="border-blue-500/50 bg-blue-500/10">
                        <Info className="w-4 h-4 text-blue-400" />
                        <AlertDescription className="text-blue-400">
                          All guests must be present at check-in and may be required to sign safety waivers before boarding. 
                          Captain will conduct a brief safety orientation before departure.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back to Date & Time
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!bookingData.contactPhone}
                      className="bg-purple-600 hover:bg-purple-700 px-8"
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
                  className="space-y-6"
                >
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                        Review Your Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Booking Summary */}
                      <div className="bg-gray-700/30 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Booking Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 text-sm">Date:</span>
                              <p className="text-white font-medium">{new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Time Slot:</span>
                              <p className="text-white font-medium">
                                {timeSlots.find(slot => slot.value === bookingData.timeSlot)?.label}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Experience:</span>
                              <p className="text-white font-medium capitalize">{bookingData.experienceType.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 text-sm">Guests:</span>
                              <p className="text-white font-medium">{bookingData.guestCount} guests</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Duration:</span>
                              <p className="text-white font-medium">4 hours</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Total Cost:</span>
                              <p className="text-green-400 font-bold text-lg">FREE</p>
                              <p className="text-gray-400 text-xs">Included with {user?.membershipTier} membership</p>
                            </div>
                          </div>
                        </div>
                        
                        {bookingData.specialRequests && (
                          <div className="pt-4 border-t border-gray-600">
                            <span className="text-gray-400 text-sm">Special Requests:</span>
                            <p className="text-white text-sm mt-1 bg-gray-800/50 p-3 rounded">{bookingData.specialRequests}</p>
                          </div>
                        )}
                      </div>

                      {/* Terms and Conditions */}
                      <Alert className="border-yellow-500/50 bg-yellow-500/10">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-400">
                          By confirming this booking, you agree to our Terms of Service and Cancellation Policy. 
                          Free cancellation available if canceled 24+ hours before departure. All guests must follow safety protocols.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back to Details
                    </Button>
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={createBookingMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 px-8"
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
                  className="text-center space-y-6"
                >
                  <Card className="bg-green-500/10 border-green-500/50">
                    <CardContent className="pt-8 pb-8">
                      <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
                      <p className="text-gray-300 mb-6 text-lg">
                        Your yacht booking has been confirmed. You'll receive a confirmation email with all the details shortly.
                      </p>
                      <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                        <p className="text-gray-400 text-sm mb-1">What's Next?</p>
                        <ul className="text-gray-300 text-sm space-y-1 text-left max-w-md mx-auto">
                          <li>• Check your email for detailed instructions</li>
                          <li>• Arrive 15 minutes before departure</li>
                          <li>• Bring valid ID and emergency contact info</li>
                          <li>• Follow captain's safety instructions</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <Button
                          onClick={() => setLocation('/trips')}
                          className="bg-purple-600 hover:bg-purple-700 mr-4"
                        >
                          View My Bookings
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setLocation('/explore')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Book Another Yacht
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Yacht Details */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* Yacht Card */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={yacht.imageUrl || getYachtImage(yacht.id)}
                      alt={yacht.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-3 left-3 bg-purple-600/90 text-white">
                      {yacht.size}ft
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-green-600/90 text-white">
                      FREE
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{yacht.name}</h3>
                    <div className="flex items-center text-gray-300 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {yacht.location}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <Users className="w-4 h-4 mr-1" />
                      Up to {yacht.capacity} guests
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-300 text-sm ml-1">4.9</span>
                      </div>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {user?.membershipTier} Member
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yacht Features */}
              {yacht.amenities && yacht.amenities.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Yacht Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {yacht.amenities.slice(0, 8).map((amenity, index) => (
                        <div key={index} className="flex items-center text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Member Benefits */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Anchor className="w-5 h-5 mr-2 text-purple-400" />
                    Member Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complimentary yacht access
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Professional captain included
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    24/7 concierge support
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Free cancellation (24h notice)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}