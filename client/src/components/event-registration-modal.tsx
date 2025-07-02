import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Ticket
} from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  ticketPrice: string;
  hostId?: number;
  isActive?: boolean;
}

interface EventRegistrationModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const STEPS = {
  DETAILS: 1,
  TICKETS: 2,
  PAYMENT: 3,
  CONFIRMATION: 4
};

function PaymentForm({ 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentError 
}: { 
  totalAmount: number; 
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required'
    });

    setIsProcessing(false);

    if (error) {
      onPaymentError(error.message || 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3"
      >
        {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  const [ticketCount, setTicketCount] = useState(1);
  const [attendeeDetails, setAttendeeDetails] = useState({
    primaryAttendee: "",
    email: "",
    phone: "",
    specialRequests: ""
  });
  const [clientSecret, setClientSecret] = useState("");
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate total amount
  const ticketPrice = event ? parseFloat(event.ticketPrice || "0") : 0;
  const totalAmount = ticketPrice * ticketCount;

  // Create payment intent when reaching payment step
  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error("Event not found");
      
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalAmount,
        metadata: {
          eventId: event.id,
          ticketCount,
          attendeeEmail: attendeeDetails.email
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create event registration
  const registerMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      if (!event) throw new Error("Event not found");
      
      const response = await apiRequest("POST", "/api/event-registrations", {
        eventId: event.id,
        ticketCount,
        totalPrice: totalAmount.toFixed(2),
        stripePaymentIntentId: paymentIntentId,
        status: 'confirmed'
      });
      return response.json();
    },
    onSuccess: (registration) => {
      setRegistrationId(registration.id);
      setCurrentStep(STEPS.CONFIRMATION);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/event-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      toast({
        title: "Registration Successful!",
        description: `You've successfully registered for ${event?.title}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (currentStep === STEPS.DETAILS) {
      setCurrentStep(STEPS.TICKETS);
    } else if (currentStep === STEPS.TICKETS) {
      setCurrentStep(STEPS.PAYMENT);
      createPaymentIntent.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.TICKETS) {
      setCurrentStep(STEPS.DETAILS);
    } else if (currentStep === STEPS.PAYMENT) {
      setCurrentStep(STEPS.TICKETS);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    registerMutation.mutate(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const resetModal = () => {
    setCurrentStep(STEPS.DETAILS);
    setTicketCount(1);
    setAttendeeDetails({
      primaryAttendee: "",
      email: "",
      phone: "",
      specialRequests: ""
    });
    setClientSecret("");
    setRegistrationId(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!event) return null;

  const formatEventDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM do, yyyy 'at' h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Register for {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {Object.values(STEPS).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < STEPS.CONFIRMATION && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Event Details */}
            {currentStep === STEPS.DETAILS && (
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {event.imageUrl && (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-400 mb-4">{event.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span>{formatEventDate(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span>Up to {event.capacity} guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-purple-400" />
                            <span>${event.ticketPrice} per ticket</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Primary Attendee Name *</Label>
                    <Input
                      value={attendeeDetails.primaryAttendee}
                      onChange={(e) => setAttendeeDetails(prev => ({ ...prev, primaryAttendee: e.target.value }))}
                      placeholder="Enter primary attendee name"
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Email Address *</Label>
                      <Input
                        type="email"
                        value={attendeeDetails.email}
                        onChange={(e) => setAttendeeDetails(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Phone Number</Label>
                      <Input
                        type="tel"
                        value={attendeeDetails.phone}
                        onChange={(e) => setAttendeeDetails(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Ticket Selection */}
            {currentStep === STEPS.TICKETS && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Select Your Tickets</h3>
                  <p className="text-gray-400">Choose the number of tickets for your group</p>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">General Admission</h4>
                        <p className="text-sm text-gray-400">${event.ticketPrice} per person</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600">
                        <Ticket className="w-4 h-4 mr-1" />
                        Available
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Number of Tickets</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          disabled={ticketCount <= 1}
                          className="w-8 h-8 p-0 border-gray-600"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{ticketCount}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                          disabled={ticketCount >= 10}
                          className="w-8 h-8 p-0 border-gray-600"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-green-400">${totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {ticketCount} ticket{ticketCount > 1 ? 's' : ''} × ${event.ticketPrice}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === STEPS.PAYMENT && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Payment Information</h3>
                  <p className="text-gray-400">Complete your registration with secure payment</p>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Registration Total</span>
                      <span className="text-2xl font-bold text-green-400">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {event.title} • {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>

                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      totalAmount={totalAmount}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  </Elements>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === STEPS.CONFIRMATION && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Registration Confirmed!</h3>
                  <p className="text-gray-400 mb-4">
                    Your registration for {event.title} has been successfully processed.
                  </p>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registration ID:</span>
                          <span className="font-mono">#{registrationId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Event:</span>
                          <span>{event.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span>{formatEventDate(event.startTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tickets:</span>
                          <span>{ticketCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Paid:</span>
                          <span className="font-semibold text-green-400">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <p className="text-sm text-gray-400 mt-4">
                    A confirmation email has been sent to {attendeeDetails.email}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          {currentStep < STEPS.CONFIRMATION && (
            <div className="flex justify-between pt-4">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={currentStep === STEPS.DETAILS}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep < STEPS.PAYMENT && (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === STEPS.DETAILS && (!attendeeDetails.primaryAttendee || !attendeeDetails.email)) ||
                    createPaymentIntent.isPending
                  }
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {createPaymentIntent.isPending ? "Loading..." : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}

          {currentStep === STEPS.CONFIRMATION && (
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}