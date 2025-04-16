import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe as useStripeJs,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useStripe } from '@/context/StripeContext';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripeJs();
  const elements = useElements();
  const { isProcessingPayment, setIsProcessingPayment, setPaymentError } = useStripe();
  const { toast } = useToast();
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!cardComplete) {
      toast({
        title: "Incomplete Card Details",
        description: "Please complete your card information.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    // In a real implementation, you'd call your backend API to create a payment intent
    // For this demo, we'll simulate a successful payment after a short delay
    try {
      // Simulate API call to create payment intent
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Example of how you would confirm the payment with a real payment intent
      // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: elements.getElement(CardElement)!,
      //   },
      // });

      // if (error) {
      //   throw new Error(error.message);
      // }
      
      // if (paymentIntent.status === 'succeeded') {
        // Payment successful
        toast({
          title: "Payment Successful",
          description: `You've successfully donated ${formatCurrency(amount)}. Thank you for your support!`,
        });
        
        onSuccess();
      // }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred processing your payment');
      
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-slate-50">
        <CardElement 
          options={cardStyle}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Your payment is secure. We use Stripe for secure payment processing.</p>
      </div>
      
      <div className="pt-2 space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isProcessingPayment || !cardComplete}
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={onCancel}
          disabled={isProcessingPayment}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm; 