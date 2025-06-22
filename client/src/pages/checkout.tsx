import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
  serviceData: {
    serviceId: number;
    serviceName: string;
    amount: number;
    bookingDate: string;
    bookingTime: string;
  };
}

function CheckoutForm({ serviceData }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
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
        // Create the service booking in database
        await apiRequest('POST', '/api/service-bookings', {
          serviceId: serviceData.serviceId,
          bookingDate: serviceData.bookingDate,
          status: 'confirmed'
        });

        toast({
          title: "Payment Successful!",
          description: `Your ${serviceData.serviceName} booking has been confirmed.`,
        });
        
        setLocation('/trips');
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Booking Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Service:</span>
            <span>{serviceData.serviceName}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Date & Time:</span>
            <span>{new Date(serviceData.bookingDate).toLocaleDateString()} at {serviceData.bookingTime}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Service fee:</span>
            <span>${(serviceData.amount - 5).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Processing fee:</span>
            <span>$5.00</span>
          </div>
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between font-semibold text-white">
              <span>Total:</span>
              <span>${serviceData.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/')}
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${serviceData.amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [serviceData, setServiceData] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get service booking data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const bookingData = {
      serviceId: parseInt(urlParams.get('serviceId') || '0'),
      serviceName: urlParams.get('serviceName') || '',
      amount: parseFloat(urlParams.get('amount') || '0'),
      bookingDate: urlParams.get('bookingDate') || '',
      bookingTime: urlParams.get('bookingTime') || ''
    };

    if (!bookingData.serviceId || !bookingData.amount) {
      toast({
        title: "Invalid Booking Data",
        description: "Please start the booking process again.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    setServiceData(bookingData);

    // Create payment intent
    apiRequest('POST', '/api/create-payment-intent', {
      amount: Math.round(bookingData.amount * 100), // Convert to cents
      description: `${bookingData.serviceName} booking`,
      metadata: {
        serviceId: bookingData.serviceId,
        bookingDate: bookingData.bookingDate
      }
    })
    .then(res => res.json())
    .then(data => {
      setClientSecret(data.clientSecret);
    })
    .catch(error => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLocation('/');
    });
  }, []);

  if (!clientSecret || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-white">Setting up secure payment...</p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#8b5cf6',
      colorBackground: '#1f2937',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Secure Payment</h1>
          <p className="text-gray-400">Complete your service booking</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance
            }}
          >
            <CheckoutForm serviceData={serviceData} />
          </Elements>
        </div>
      </div>
    </div>
  );
}