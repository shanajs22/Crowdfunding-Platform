import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCrowdfunding } from '@/context/CrowdfundingContext';
import DonationForm from '@/components/DonationForm';
import DonationList from '@/components/DonationList';
import { formatCurrency, formatDate, formatDateDistance } from '@/lib/utils';
import { CalendarDays, User, AlertTriangle, Users, Clock, Target, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/context/CrowdfundingContext';
import { useAuth } from '@/context/AuthContext';

const CampaignDetails = () => {
  // Hooks must be called in the same order on every render
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaignById: fetchCampaignById, getCampaignDonations: fetchCampaignDonations, loading: contextLoading } = useCrowdfunding();
  const { currentUser } = useAuth();
  
  // State hooks - keep these together and in the same order
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Always define all callback hooks regardless of conditions
  const getCampaignById = useCallback((campaignId: string) => {
    return fetchCampaignById(campaignId);
  }, [fetchCampaignById]);
  
  const getCampaignDonations = useCallback((campaignId: string) => {
    return fetchCampaignDonations(campaignId);
  }, [fetchCampaignDonations]);
  
  const refreshCampaignData = useCallback(async () => {
    if (!id) return;
    
    try {
      const campaignData = await getCampaignById(id);
      if (campaignData) {
        setCampaign(campaignData);
        const donationsData = await getCampaignDonations(id);
        setDonations(donationsData || []);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  }, [id, getCampaignById, getCampaignDonations]);
  
  // Memoize values that are computed from state
  const percentFunded = useMemo(() => {
    if (!campaign) return 0;
    return (campaign.amountRaised / campaign.goalAmount) * 100;
  }, [campaign]);
  
  const isOwner = useMemo(() => {
    if (!currentUser || !campaign) return false;
    return currentUser.uid === campaign.ownerUid;
  }, [currentUser, campaign]);

  // All useEffect hooks must be defined at the top level
  useEffect(() => {
    console.log('Campaign ID from params:', id);
  }, [id]);

  useEffect(() => {
    if (loading || error) {
      console.log('Component state changed:', { 
        loading, 
        contextLoading, 
        error, 
        campaignLoaded: !!campaign,
        donationsCount: donations?.length
      });
    }
  }, [loading, error, contextLoading, campaign, donations?.length]);

  useEffect(() => {
    // Only fetch if we haven't loaded yet
    if (hasLoaded || !id) return;
    
    const fetchCampaignData = async () => {
      try {
        console.log('Fetching campaign data for ID:', id);
        setLoading(true);
        
        const campaignData = await getCampaignById(id);
        console.log('Campaign data received:', campaignData);
        
        if (campaignData) {
          setCampaign(campaignData);
          
          // Fetch donations for this campaign
          console.log('Fetching donations for campaign:', id);
          const donationsData = await getCampaignDonations(id);
          console.log('Donations received:', donationsData);
          setDonations(donationsData || []);
        } else {
          console.error('Campaign not found for ID:', id);
          setError('Campaign not found');
        }
      } catch (err: any) {
        console.error("Error fetching campaign:", err);
        setError(err.message || 'Failed to load campaign details');
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };

    fetchCampaignData();
  }, [id, getCampaignById, getCampaignDonations, hasLoaded]);

  // Render functions - move all conditional rendering logic here
  const renderLoading = () => {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Failed to load campaign'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Campaign ID: {id || 'Not provided'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderCampaign = () => {
    if (!campaign) return null;
    
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to campaigns
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign details - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video">
              <img 
                src={campaign.imageUrl || '/placeholder.svg'} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Campaign Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Created by {campaign.ownerName}</span>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <CalendarDays className="h-4 w-4 sm:ml-0 ml-0" />
                <span>Created on {formatDate(campaign.createdAt)}</span>
              </div>
            </div>
            
            {/* Campaign Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" /> Funding Goal
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(campaign.goalAmount)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Amount Raised
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(campaign.amountRaised)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Campaign Ends
                    </p>
                    <p className="text-2xl font-bold">{formatDateDistance(campaign.deadline)}</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{percentFunded.toFixed(0)}% Funded</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(campaign.amountRaised)} of {formatCurrency(campaign.goalAmount)}
                    </span>
                  </div>
                  <Progress value={percentFunded} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            {/* Campaign Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{campaign.description}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Donations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Donations
                </CardTitle>
                <CardDescription>
                  {donations.length} {donations.length === 1 ? 'person has' : 'people have'} donated to this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donations.length > 0 ? (
                  <DonationList donations={donations} />
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No donations yet. Be the first to contribute!</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Donation form - 1/3 width on desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support this campaign</CardTitle>
                  <CardDescription>
                    Your contribution helps this campaign reach its goal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DonationForm 
                    campaignId={id || ''} 
                    onSuccess={refreshCampaignData}
                  />
                </CardContent>
              </Card>
              
              {isOwner && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Campaign Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      Edit Campaign
                    </Button>
                    <Button className="w-full" variant="destructive">
                      Cancel Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic - ensure no conditional hooks here
  if (!hasLoaded && (loading || contextLoading)) {
    return renderLoading();
  }

  if (error || !campaign) {
    return renderError();
  }

  return renderCampaign();
};

export default CampaignDetails;


