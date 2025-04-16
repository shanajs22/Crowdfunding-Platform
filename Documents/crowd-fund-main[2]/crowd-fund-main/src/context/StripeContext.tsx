import React, { createContext, useContext, ReactNode, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Replace with your Stripe publishable key
const STRIPE_PUBLIC_KEY = 'pk_test_51YOUR_STRIPE_KEY';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface StripeContextType {
  isProcessingPayment: boolean;
  setIsProcessingPayment: (isProcessing: boolean) => void;
  paymentError: string | null;
  setPaymentError: (error: string | null) => void;
  clearPaymentError: () => void;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const StripeProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const clearPaymentError = () => {
    setPaymentError(null);
  };

  return (
    <StripeContext.Provider
      value={{
        isProcessingPayment,
        setIsProcessingPayment,
        paymentError,
        setPaymentError,
        clearPaymentError,
      }}
    >
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export default StripeProvider; 