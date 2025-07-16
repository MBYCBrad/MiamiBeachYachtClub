import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface MembershipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
}

const CheckoutForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription through our API
      const response = await apiRequest("POST", "/api/membership/upgrade-to-platinum");
      const data = await response.json();

      if (data.clientSecret) {
        // Confirm the payment
        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        });

        if (result.error) {
          onError(result.error.message || 'Payment failed');
        } else {
          toast({
            title: "Upgrade Successful!",
            description: "Welcome to Platinum membership! Your new benefits are now active.",
          });
          
          // Refresh user data
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          onSuccess();
        }
      } else {
        onError('Failed to create subscription');
      }
    } catch (error: any) {
      onError(error.message || 'Upgrade failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            },
            hidePostalCode: false,
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3"
      >
        {isProcessing ? 'Processing...' : 'Complete Platinum Upgrade'}
      </Button>
    </form>
  );
};

export default function MembershipUpgradeModal({ isOpen, onClose, currentTier }: MembershipUpgradeModalProps) {
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  // Fetch Platinum pricing from database
  const { data: platinumPricing, isLoading: isPricingLoading } = useQuery({
    queryKey: ['/api/membership/pricing/platinum'],
    enabled: isOpen,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const platinumBenefits = [
    "Access to premium yachts (70-100ft)",
    "Priority booking with flexible cancellation",
    "Complimentary concierge services",
    "Exclusive Platinum member events",
    "24/7 dedicated support",
    "Marina privileges at premium locations",
    "Guest privileges for friends and family",
    "Monthly yacht maintenance included"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Upgrade to Platinum Membership
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showPayment ? (
            <>
              <div className="text-center space-y-2">
                <p className="text-gray-300">
                  Current Tier: <span className="font-semibold text-white capitalize">{currentTier}</span>
                </p>
                {isPricingLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-12 bg-gray-700 rounded w-48 mx-auto"></div>
                    <div className="h-6 bg-gray-700 rounded w-32 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-white">
                      ${platinumPricing?.monthlyPrice?.toLocaleString() || '10,000'}
                      <span className="text-lg text-gray-400">/month</span>
                    </p>
                    {platinumPricing?.initiationFee && (
                      <p className="text-lg text-yellow-400 font-semibold">
                        + ${platinumPricing.initiationFee.toLocaleString()} initiation fee
                      </p>
                    )}
                  </>
                )}
                <p className="text-gray-400">Unlock premium yacht access and exclusive benefits</p>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Platinum Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {(platinumPricing?.benefits || platinumBenefits).map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPayment(true)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3"
                >
                  Continue to Payment
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Complete Your Upgrade</h3>
                <p className="text-gray-400">Enter your payment details to activate Platinum membership</p>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
              </Elements>

              <div className="flex justify-center">
                <Button
                  onClick={() => setShowPayment(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Back to Benefits
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}