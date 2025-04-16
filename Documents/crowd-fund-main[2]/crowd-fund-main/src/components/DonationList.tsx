import React from 'react';
import { Donation } from '@/context/CrowdfundingContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { MessageSquare } from 'lucide-react';

interface DonationListProps {
  donations: Donation[];
}

const DonationList: React.FC<DonationListProps> = ({ donations }) => {
  if (donations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>No donations yet. Be the first to support this campaign!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {donations.slice().reverse().map((donation) => (
        <DonationCard key={donation.id} donation={donation} />
      ))}
    </div>
  );
};

const DonationCard: React.FC<{ donation: Donation }> = ({ donation }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <div className="font-medium">{donation.donorName}</div>
          <div className="text-primary font-semibold">{formatCurrency(donation.amount)}</div>
        </div>
        
        {donation.message && (
          <div className="text-sm text-muted-foreground mt-1">{donation.message}</div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          {formatDate(donation.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationList;
