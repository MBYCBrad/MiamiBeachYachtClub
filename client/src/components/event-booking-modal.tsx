import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Clock, CreditCard, CheckCircle, ArrowLeft, ArrowRight, X, Star, Heart } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface EventBookingModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationData {
  eventId: number;
  ticketCount: number;
  specialRequests?: string;
  totalPrice: string;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

type BookingStep = 'tickets' | 'details' | 'payment';

// 3-Step Event Registration Component
const EventRegistrationForm = ({ event, onClose }: { event: Event; onClose: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<BookingStep>('tickets');
  const [ticketCount, setTicketCount] = useState(1);
  const [guestName, setGuestName] = useState(user?.firstName || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const ticketPrice = parseFloat(event.ticketPrice);
  const totalPrice = ticketPrice * ticketCount;

  // Create payment intent when moving to payment step
  const createPaymentIntent = async () => {
    try {
      setIsLoadingPayment(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalPrice,
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          ticketCount,
          guestName,
          guestEmail
        }
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment system",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  // Event registration mutation
  const registerMutation = useMutation({
    mutationFn: async (bookingData: RegistrationData) => {
      const response = await apiRequest("POST", "/api/event-registrations", bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: `You've successfully registered for ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegistration = () => {
    const bookingData: RegistrationData = {
      eventId: event.id,
      ticketCount,
      specialRequests: specialRequests || undefined,
      totalPrice: totalPrice.toFixed(2),
      guestDetails: {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
      },
    };

    registerMutation.mutate(bookingData);
  };

  const handleNext = () => {
    if (currentStep === 'tickets') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      if (!guestName || !guestEmail || !guestPhone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('payment');
      createPaymentIntent();
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('tickets');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'tickets':
        return <TicketSelection ticketCount={ticketCount} setTicketCount={setTicketCount} event={event} totalPrice={totalPrice} />;
      case 'details':
        return (
          <GuestDetails
            guestName={guestName}
            setGuestName={setGuestName}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            guestPhone={guestPhone}
            setGuestPhone={setGuestPhone}
            specialRequests={specialRequests}
            setSpecialRequests={setSpecialRequests}
          />
        );
      case 'payment':
        return (
          <PaymentStep
            clientSecret={clientSecret}
            isLoadingPayment={isLoadingPayment}
            onPaymentSuccess={handleRegistration}
            totalPrice={totalPrice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <img
          src={event.imageUrl || `/api/media/pexels-mali-42092_1750537277229.jpg`}
          alt={event.title}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.startTime), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.startTime), 'h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {(['tickets', 'details', 'payment'] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === step
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : index < (['tickets', 'details', 'payment'] as const).indexOf(currentStep)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {index < (['tickets', 'details', 'payment'] as const).indexOf(currentStep) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </motion.div>
            {index < 2 && (
              <div className={`w-16 h-1 mx-2 ${
                index < (['tickets', 'details', 'payment'] as const).indexOf(currentStep)
                  ? 'bg-green-600'
                  : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
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

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={currentStep === 'tickets' ? onClose : handleBack}
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 'tickets' ? 'Cancel' : 'Back'}
        </Button>
        
        {currentStep !== 'payment' && (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Step 1: Ticket Selection
const TicketSelection = ({ ticketCount, setTicketCount, event, totalPrice }: {
  ticketCount: number;
  setTicketCount: (count: number) => void;
  event: Event;
  totalPrice: number;
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Select Tickets</h3>
      <p className="text-gray-400">Choose the number of tickets for this event</p>
    </div>

    <div className="space-y-4">
      <div>
        <Label htmlFor="ticketCount" className="text-white text-lg">Number of Tickets</Label>
        <Select value={ticketCount.toString()} onValueChange={(value) => setTicketCount(parseInt(value))}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600 z-50">
            {Array.from({ length: Math.min(10, event.capacity) }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-700">
                {num} {num === 1 ? 'Ticket' : 'Tickets'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300">Price per ticket</span>
          <span className="text-white font-semibold">${event.ticketPrice}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300">Quantity</span>
          <span className="text-white font-semibold">{ticketCount}</span>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-white">Total Amount</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Step 2: Guest Details
const GuestDetails = ({ guestName, setGuestName, guestEmail, setGuestEmail, guestPhone, setGuestPhone, specialRequests, setSpecialRequests }: {
  guestName: string;
  setGuestName: (name: string) => void;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
  guestPhone: string;
  setGuestPhone: (phone: string) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Guest Information</h3>
      <p className="text-gray-400">Please provide your contact details</p>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guestName" className="text-white">Full Name *</Label>
          <Input
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white mt-2"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="guestPhone" className="text-white">Phone Number *</Label>
          <Input
            id="guestPhone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white mt-2"
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guestEmail" className="text-white">Email Address *</Label>
        <Input
          id="guestEmail"
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white mt-2"
          placeholder="Enter your email address"
          required
        />
      </div>

      <div>
        <Label htmlFor="specialRequests" className="text-white">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white mt-2"
          placeholder="Any special requests, dietary requirements, or accessibility needs..."
          rows={4}
        />
      </div>
    </div>
  </div>
);

// Step 3: Payment
const PaymentStep = ({ clientSecret, isLoadingPayment, onPaymentSuccess, totalPrice }: {
  clientSecret: string;
  isLoadingPayment: boolean;
  onPaymentSuccess: () => void;
  totalPrice: number;
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Complete Payment</h3>
      <p className="text-gray-400">Secure payment processing</p>
      <div className="mt-4">
        <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          ${totalPrice.toFixed(2)}
        </span>
      </div>
    </div>

    {clientSecret && !isLoadingPayment ? (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    ) : (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    )}
  </div>
);

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onPaymentSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <PaymentElement className="text-white" />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Registration
          </div>
        )}
      </Button>
    </form>
  );
};

export default function EventBookingModal({ event, isOpen, onClose }: EventBookingModalProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Event Registration</DialogTitle>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Event Registration
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <EventRegistrationForm event={event} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}