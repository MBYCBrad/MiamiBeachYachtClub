import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

// Inner payment form that uses Stripe hooks
function PaymentFormInner({ 
  selectedServices, 
  onPaymentSuccess, 
  onPaymentError, 
  isProcessing, 
  setIsProcessing 
}: {
  selectedServices: {serviceId: number, price: number, name: string}[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required'
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-white">Total: ${totalAmount}</div>
      </div>
      
      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />
      
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Complete Payment - $${totalAmount}`
        )}
      </button>
    </form>
  );
}

// ServicePaymentForm component for handling Stripe payments
export default function ServicePaymentForm({ 
  selectedServices, 
  onPaymentSuccess, 
  onPaymentError, 
  isProcessing, 
  setIsProcessing 
}: {
  selectedServices: {serviceId: number, price: number, name: string}[];
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: totalAmount,
          description: `Concierge services: ${selectedServices.map(s => s.name).join(', ')}`,
          serviceIds: selectedServices.map(s => s.serviceId)
        });
        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
        setLoading(false);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onPaymentError('Failed to initialize payment');
        setLoading(false);
      }
    };

    if (totalAmount > 0) {
      createPaymentIntent();
    }
  }, [totalAmount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-300">Preparing payment...</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-red-400 text-sm text-center py-4">
        Failed to initialize payment. Please try again.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner
        selectedServices={selectedServices}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
}