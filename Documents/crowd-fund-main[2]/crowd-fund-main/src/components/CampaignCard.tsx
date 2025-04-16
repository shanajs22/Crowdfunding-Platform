
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Campaign } from '@/context/CrowdfundingContext';
import { CalendarDays } from 'lucide-react';
import { formatCurrency, formatDateDistance } from '@/lib/utils';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const percentFunded = (campaign.amountRaised / campaign.goalAmount) * 100;
  const daysLeft = formatDateDistance(campaign.deadline);
  
  return (
    <Link to={`/campaign/${campaign.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
        <div className="aspect-video overflow-hidden bg-muted">
          <img 
            src={campaign.imageUrl || '/placeholder.svg'} 
            alt={campaign.title} 
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </div>
        
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground">{campaign.creatorName}</p>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {campaign.description}
          </p>
          
          <div className="space-y-2">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(percentFunded, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium">{formatCurrency(campaign.amountRaised)}</span>
              <span className="text-muted-foreground">
                {percentFunded.toFixed(0)}% of {formatCurrency(campaign.goalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="w-full flex items-center text-sm text-muted-foreground">
            <CalendarDays size={14} className="mr-1" />
            <span>{daysLeft}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CampaignCard;
