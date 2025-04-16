import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useCrowdfunding } from '@/context/CrowdfundingContext';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import PaymentForm from './PaymentForm';
import { Card, CardContent } from './ui/card';
import { useStripe } from '@/context/StripeContext';
import { ArrowLeft } from 'lucide-react';

interface DonationFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ campaignId, onSuccess }) => {
  const { addDonation } = useCrowdfunding();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { paymentError } = useStripe();
  
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a donation",
        variant: "destructive"
      });
      return;
    }

    if (!amount) {
      toast({
        title: "Error",
        description: "Please provide a donation amount",
        variant: "destructive"
      });
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return;
    }

    // Show payment form when amount is valid
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    const amountNumber = parseFloat(amount);
    
    try {
      await addDonation({
        campaignId,
        donorUid: currentUser?.uid || '',
        donorName: currentUser?.displayName || 'Anonymous',
        amount: amountNumber,
        message: message.trim() || undefined,
      });

      // Reset form
      setAmount('');
      setMessage('');
      setShowPaymentForm(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Your payment was processed, but there was an issue recording your donation.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  // Error display from payment processing
  if (paymentError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        <h4 className="font-medium mb-2">Payment Error</h4>
        <p className="text-sm">{paymentError}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => setShowPaymentForm(false)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (showPaymentForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2"
            onClick={() => setShowPaymentForm(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h3 className="text-lg font-medium">
            Donate {formatCurrency(parseFloat(amount))}
          </h3>
        </div>
        
        {message && (
          <Card className="bg-muted/50 mb-4">
            <CardContent className="p-3">
              <p className="text-sm italic">"{message}"</p>
            </CardContent>
          </Card>
        )}
        
        <PaymentForm 
          amount={parseFloat(amount)}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleProceedToPayment} className="space-y-4">
      {!currentUser && (
        <div className="bg-amber-50 p-3 rounded text-amber-800 text-sm mb-4">
          You need to sign in to donate to this campaign.
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">$</span>
        </div>
        <Input
          type="number"
          placeholder="0.00"
          min="1"
          step="0.01"
          className="pl-7"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || !currentUser}
      >
        Continue to Payment
      </Button>
    </form>
  );
};

export default DonationForm;
