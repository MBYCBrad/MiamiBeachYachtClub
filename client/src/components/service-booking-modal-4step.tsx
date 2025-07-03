import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Users, Calendar as CalendarIcon, Home, Building2, Anchor, ArrowRight, ArrowLeft, Check, Star, Phone, Mail, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  pricePerSession: string;
  duration?: number;
  deliveryType: 'yacht' | 'location' | 'marina' | 'external_location';
  serviceAreas?: string[];
  requiresAddress: boolean;
  marinaLocation?: string;
  businessAddress?: string;
  rating: string;
  reviewCount: number;
}

interface ServiceBookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

const deliveryTypeConfig = {
  yacht: {
    icon: Anchor,
    label: "Yacht Add-On",
    description: "Service provided on yacht during charter",
    color: "bg-blue-500"
  },
  location: {
    icon: Home,
    label: "At Your Location",
    description: "Service provider comes to your address",
    color: "bg-green-500"
  },
  marina: {
    icon: Building2,
    label: "At Marina",
    description: "Service provided at marina location",
    color: "bg-purple-500"
  },
  external_location: {
    icon: MapPin,
    label: "Provider Location",
    description: "Visit provider's business location",
    color: "bg-orange-500"
  }
};

const PaymentForm = ({ onPaymentSuccess, totalPrice, serviceData }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your service has been booked!",
        });
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${totalPrice}
          </>
        )}
      </Button>
    </form>
  );
};

export default function ServiceBookingModal({ service, isOpen, onClose, onConfirm }: ServiceBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Get logged-in user information
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    enabled: isOpen
  }) as { data?: any };

  // Step 1: Service Details & Date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [deliveryType, setDeliveryType] = useState<string>(service?.deliveryType || "");
  const [address, setAddress] = useState("");

  // Step 2: Guest Details (pre-filled with user data)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Pre-fill user information when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setGuestName(user?.username || "");
      setGuestEmail(user?.email || "");
      setGuestPhone(user?.phone || "");
      if (user?.location && deliveryType === 'location') {
        setAddress(user.location);
      }
    }
  }, [user, isOpen, deliveryType]);

  // Step 3: Review & Payment Setup
  const [paymentReady, setPaymentReady] = useState(false);

  const steps = [
    { number: 1, title: "Service & Date", icon: CalendarIcon },
    { number: 2, title: "Guest Details", icon: Users },
    { number: 3, title: "Review", icon: Check },
    { number: 4, title: "Payment", icon: CreditCard }
  ];

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  useEffect(() => {
    if (service && deliveryType === "") {
      setDeliveryType(service.deliveryType);
    }
  }, [service, deliveryType]);

  useEffect(() => {
    if (currentStep === 3 && !paymentReady) {
      setupPayment();
    }
  }, [currentStep, paymentReady]);

  const setupPayment = async () => {
    if (!service) return;

    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: parseFloat(service.pricePerSession)
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentReady(true);
    } catch (error) {
      console.error('Payment setup error:', error);
      toast({
        title: "Payment Setup Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!service || !selectedDate) return;

    const bookingData = {
      serviceId: service.id,
      scheduledDate: selectedDate.toISOString(),
      scheduledTime: selectedTime,
      deliveryType,
      address: deliveryType === 'location' ? address : null,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      totalPrice: service.pricePerSession,
      status: 'confirmed'
    };

    try {
      await onConfirm(bookingData);
      toast({
        title: "Service Booked Successfully!",
        description: `Your ${service.name} has been confirmed.`,
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Error",
        description: "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate(new Date());
    setSelectedTime("");
    setDeliveryType("");
    setAddress("");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setSpecialRequests("");
    setPaymentReady(false);
    setClientSecret("");
  };

  const canProceedFromStep1 = selectedDate && selectedTime && (deliveryType !== 'location' || address);
  const canProceedFromStep2 = guestName && guestEmail && guestPhone;

  if (!service) return null;

  const config = deliveryTypeConfig[deliveryType as keyof typeof deliveryTypeConfig];
  const IconComponent = config?.icon || MapPin;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] sm:w-full bg-black border-gray-800 text-white max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <img 
              src={service.imageUrl || '/api/placeholder/80/80'} 
              alt={service.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white truncate">{service.name}</DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 w-fit">
                  {service.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300">{service.rating} ({service.reviewCount})</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-green-400">${service.pricePerSession}</div>
              <div className="text-sm text-gray-400">per session</div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between px-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white' 
                        : 'border-gray-600 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium text-center ${
                      currentStep >= step.number ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 relative">
                      <div className={`h-full transition-all duration-300 ${
                        currentStep > step.number 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                          : 'bg-gray-600'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="mt-8 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto w-full">
            <AnimatePresence mode="wait">
            {/* Step 1: Service Details & Date */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-white">Select Date & Time</h3>
                  
                  <div className="flex flex-col lg:flex-row gap-6 w-full">
                    <div className="space-y-4 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-300 mb-2 block">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 w-fit mx-auto lg:mx-0"
                      />
                    </div>

                    <div className="space-y-6 flex-1 max-w-sm mx-auto lg:mx-0">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-300 mb-2 block">Select Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger className="bg-gray-900/50 border-gray-700 h-12">
                            <SelectValue placeholder="Choose time slot" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time} className="text-white hover:bg-gray-800">
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-300 mb-2 block">Service Type</Label>
                        <div className="bg-gray-900/50 border border-gray-700 rounded-md h-12 px-3 flex items-center">
                          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600">
                            {service.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-300 mb-2 block">Service Delivery</Label>
                        {config && (
                          <Card className="bg-gray-900/50 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-white">{config.label}</div>
                                  <div className="text-sm text-gray-400 mb-2">{config.description}</div>
                                  
                                  {/* Show actual address for provider location and marina services */}
                                  {deliveryType === 'external_location' && service.businessAddress && (
                                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
                                      <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">Visit us at:</span>
                                      </div>
                                      <div className="text-white mt-1">{service.businessAddress}</div>
                                    </div>
                                  )}
                                  
                                  {deliveryType === 'marina' && service.marinaLocation && (
                                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
                                      <div className="flex items-center gap-2 text-gray-300">
                                        <Building2 className="w-4 h-4" />
                                        <span className="font-medium">Marina location:</span>
                                      </div>
                                      <div className="text-white mt-1">{service.marinaLocation}</div>
                                    </div>
                                  )}
                                  
                                  {deliveryType === 'yacht' && (
                                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
                                      <div className="flex items-center gap-2 text-gray-300">
                                        <Anchor className="w-4 h-4" />
                                        <span className="font-medium">During yacht charter:</span>
                                      </div>
                                      <div className="text-white mt-1">Service provided onboard during your yacht experience</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {deliveryType === 'location' && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-300 mb-2 block">Your Address</Label>
                          <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your full address"
                            className="bg-gray-900/50 border-gray-700 h-12"
                          />
                        </div>
                      )}


                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Guest Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-xl font-semibold text-white">Member Information</h3>
                  <Badge className="bg-green-600 text-white text-xs">Pre-filled from your profile</Badge>
                </div>
                
                <div className="w-full max-w-lg space-y-6 mx-auto px-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <Label className="text-sm font-medium text-gray-300">Member Name</Label>
                      </div>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your name from profile"
                        className="bg-gray-900/50 border-gray-700 h-12"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <Label className="text-sm font-medium text-gray-300">Email Address</Label>
                      </div>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Your email from profile"
                        className="bg-gray-900/50 border-gray-700 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <Label className="text-sm font-medium text-gray-300">Phone Number</Label>
                    </div>
                    <Input
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Your phone from profile"
                      className="bg-gray-900/50 border-gray-700 h-12"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">Special Requests (Optional)</Label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests or requirements..."
                      className="bg-gray-900/50 border-gray-700 min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h3 className="text-xl font-semibold mb-6 text-white">Review Your Booking</h3>
                
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{service.name}</h4>
                        <p className="text-gray-400">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">${service.pricePerSession}</div>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery:</span>
                        <span>{config?.label}</span>
                      </div>
                      {address && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-right max-w-[200px]">{address}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Guest:</span>
                        <span>{guestName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span>{guestEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span>{guestPhone}</span>
                      </div>
                    </div>

                    {specialRequests && (
                      <>
                        <Separator className="bg-gray-700" />
                        <div>
                          <span className="text-gray-400">Special Requests:</span>
                          <p className="mt-1 text-sm">{specialRequests}</p>
                        </div>
                      </>
                    )}

                    <Separator className="bg-gray-700" />

                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-green-400">${service.pricePerSession}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Payment</h3>
                
                {clientSecret && paymentReady ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm 
                      onPaymentSuccess={handlePaymentSuccess}
                      totalPrice={service.pricePerSession}
                      serviceData={{ service, selectedDate, selectedTime, deliveryType, guestName, guestEmail, guestPhone }}
                    />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Setting up payment...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-700/50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 h-12 px-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedFromStep1) ||
                (currentStep === 2 && !canProceedFromStep2)
              }
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 px-6 text-sm font-medium"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 h-12 px-6 text-sm font-medium"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}