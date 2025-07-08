import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Star, Sparkles, Check, CreditCard } from "lucide-react";
import { format, addDays } from "date-fns";
import type { Service } from "@shared/schema";

interface ServiceBookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceBookingModal({ service, isOpen, onClose }: ServiceBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [bookingData, setBookingData] = useState({
    // Step 1: Date & Time
    date: "",
    time: "",
    duration: service.duration || 60,
    location: "on_yacht", // on_yacht, at_marina, custom_location
    customLocation: "",
    
    // Step 2: Experience Details
    guestCount: 1,
    specialRequests: "",
    preferredYacht: "",
    occasion: "leisure",
    
    // Step 3: Payment & Review
    paymentMethod: "card"
  });

  const steps = [
    { number: 1, title: "Schedule", icon: Calendar },
    { number: 2, title: "Details", icon: User },
    { number: 3, title: "Review", icon: Check }
  ];

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Generate dates for next 30 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  // Create service booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/service-bookings', {
        serviceId: service.id,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        location: bookingData.location,
        customLocation: bookingData.customLocation,
        guestCount: bookingData.guestCount,
        specialRequests: bookingData.specialRequests,
        preferredYacht: bookingData.preferredYacht,
        occasion: bookingData.occasion,
        status: 'pending',
        totalPrice: parseFloat(service.pricePerSession)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Experience Booked!",
        description: `Your ${service.name} experience has been confirmed.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book service",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setCurrentStep(1);
    setBookingData({
      date: "",
      time: "",
      duration: service.duration || 60,
      location: "on_yacht",
      customLocation: "",
      guestCount: 1,
      specialRequests: "",
      preferredYacht: "",
      occasion: "leisure",
      paymentMethod: "card"
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit booking
      createBookingMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return bookingData.date && bookingData.time && 
               (bookingData.location !== 'custom_location' || bookingData.customLocation);
      case 2:
        return bookingData.guestCount > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-black border border-purple-600/20">
        {/* Header with Service Info */}
        <div className="relative bg-gradient-to-b from-purple-900/20 to-black p-6 border-b border-purple-600/20">
          <div className="flex items-start gap-4">
            <img 
              src={service.imageUrl} 
              alt={service.name}
              className="w-24 h-24 rounded-lg object-cover border-2 border-purple-600/30"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{service.name}</h2>
              <p className="text-purple-300 mb-2">{service.category} Experience</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-300">{service.rating || '5.0'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{service.duration || 60} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold">${service.pricePerSession}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <motion.div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.number ? 'text-purple-400' : 'text-gray-500'
                  }`}
                  animate={{
                    scale: currentStep === step.number ? 1.1 : 1,
                  }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > step.number 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent' 
                      : currentStep === step.number
                      ? 'border-purple-400 bg-purple-600/20'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium hidden sm:block">{step.title}</span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Schedule */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Schedule Your Experience
                    </h3>
                    
                    {/* Date Selection */}
                    <div className="mb-6">
                      <Label className="text-gray-300 mb-2 block">Select Date</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {generateDates().slice(0, 14).map((date) => (
                          <Button
                            key={date.toISOString()}
                            variant="outline"
                            onClick={() => setBookingData({ ...bookingData, date: format(date, 'yyyy-MM-dd') })}
                            className={`p-2 h-auto flex-col ${
                              bookingData.date === format(date, 'yyyy-MM-dd')
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white'
                                : 'border-purple-600/30 text-gray-300 hover:bg-purple-600/20'
                            }`}
                          >
                            <span className="text-xs">{format(date, 'EEE')}</span>
                            <span className="text-lg font-semibold">{format(date, 'd')}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="mb-6">
                      <Label className="text-gray-300 mb-2 block">Select Time</Label>
                      <Select value={bookingData.time} onValueChange={(value) => setBookingData({ ...bookingData, time: value })}>
                        <SelectTrigger className="bg-gray-900/50 border-purple-600/30 text-white">
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-purple-600/30">
                          {generateTimeSlots().map((slot) => (
                            <SelectItem key={slot} value={slot} className="text-gray-300 hover:bg-purple-600/20">
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Selection */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">Service Location</Label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { value: 'on_yacht', label: 'On Yacht', icon: '🛥️' },
                          { value: 'at_marina', label: 'At Marina', icon: '⚓' },
                          { value: 'custom_location', label: 'Custom', icon: '📍' }
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            onClick={() => setBookingData({ ...bookingData, location: option.value })}
                            className={`p-4 h-auto ${
                              bookingData.location === option.value
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white'
                                : 'border-purple-600/30 text-gray-300 hover:bg-purple-600/20'
                            }`}
                          >
                            <span className="text-2xl mb-1">{option.icon}</span>
                            <span className="text-sm">{option.label}</span>
                          </Button>
                        ))}
                      </div>
                      
                      {bookingData.location === 'custom_location' && (
                        <Input
                          placeholder="Enter custom location address"
                          value={bookingData.customLocation}
                          onChange={(e) => setBookingData({ ...bookingData, customLocation: e.target.value })}
                          className="bg-gray-900/50 border-purple-600/30 text-white placeholder:text-gray-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experience Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Experience Details
                  </h3>

                  {/* Guest Count */}
                  <div>
                    <Label className="text-gray-300 mb-2 block">Number of Guests</Label>
                    <Select 
                      value={bookingData.guestCount.toString()} 
                      onValueChange={(value) => setBookingData({ ...bookingData, guestCount: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-purple-600/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-purple-600/30">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-gray-300 hover:bg-purple-600/20">
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occasion */}
                  <div>
                    <Label className="text-gray-300 mb-2 block">Occasion</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'leisure', label: 'Leisure', icon: '🌴' },
                        { value: 'romantic', label: 'Romantic', icon: '💑' },
                        { value: 'celebration', label: 'Celebration', icon: '🎉' },
                        { value: 'business', label: 'Business', icon: '💼' },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant="outline"
                          onClick={() => setBookingData({ ...bookingData, occasion: option.value })}
                          className={`p-3 h-auto justify-start ${
                            bookingData.occasion === option.value
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white'
                              : 'border-purple-600/30 text-gray-300 hover:bg-purple-600/20'
                          }`}
                        >
                          <span className="text-xl mr-2">{option.icon}</span>
                          <span>{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Yacht */}
                  <div>
                    <Label className="text-gray-300 mb-2 block">Preferred Yacht (Optional)</Label>
                    <Input
                      placeholder="Enter yacht name or leave blank for any available"
                      value={bookingData.preferredYacht}
                      onChange={(e) => setBookingData({ ...bookingData, preferredYacht: e.target.value })}
                      className="bg-gray-900/50 border-purple-600/30 text-white placeholder:text-gray-500"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label className="text-gray-300 mb-2 block">Special Requests</Label>
                    <Textarea
                      placeholder="Any special requirements or preferences for your experience..."
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      className="bg-gray-900/50 border-purple-600/30 text-white placeholder:text-gray-500 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-purple-400" />
                    Review & Confirm
                  </h3>

                  {/* Booking Summary */}
                  <div className="bg-purple-900/10 border border-purple-600/30 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-purple-300 mb-3">Booking Summary</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white font-medium">{service.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{bookingData.date && format(new Date(bookingData.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{bookingData.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">
                          {bookingData.location === 'on_yacht' ? 'On Yacht' : 
                           bookingData.location === 'at_marina' ? 'At Marina' : 
                           bookingData.customLocation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Guests:</span>
                        <span className="text-white">{bookingData.guestCount}</span>
                      </div>
                      {bookingData.preferredYacht && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Preferred Yacht:</span>
                          <span className="text-white">{bookingData.preferredYacht}</span>
                        </div>
                      )}
                      {bookingData.specialRequests && (
                        <div className="pt-3 border-t border-purple-600/20">
                          <span className="text-gray-400 block mb-1">Special Requests:</span>
                          <span className="text-white text-sm">{bookingData.specialRequests}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-purple-600/20">
                      <div className="flex justify-between items-center">
                        <span className="text-lg text-white font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          ${service.pricePerSession}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-gray-900/30 rounded-lg p-4 text-xs text-gray-400">
                    <p className="mb-2">By confirming this booking, you agree to:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Arrive 15 minutes before your scheduled time</li>
                      <li>• 24-hour cancellation policy applies</li>
                      <li>• Service provider contact details will be shared after booking</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-purple-600/20 bg-gradient-to-t from-black to-transparent">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={currentStep > 1 ? handleBack : onClose}
              className="border-purple-600/30 text-purple-400 hover:bg-purple-600/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || createBookingMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 disabled:opacity-50"
            >
              {createBookingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : currentStep === 3 ? (
                <>
                  Confirm Booking
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}