import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { createCampaign, getCampaigns, getCampaignById as fetchCampaignById, createDonation, getCampaignDonations as fetchCampaignDonations } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export interface Campaign {
  creatorName: string;
  id: string;
  title: string;
  description: string;
  ownerUid: string;
  ownerName: string;
  goalAmount: number;
  amountRaised: number;
  deadline: Timestamp | string;
  createdAt: Timestamp | string;
  imageUrl: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorUid: string;
  donorName: string;
  amount: number;
  message?: string;
  createdAt: Timestamp | string;
}

interface CrowdfundingContextType {
  campaigns: Campaign[];
  donations: Map<string, Donation[]>;
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'amountRaised' | 'createdAt'>) => Promise<string | undefined>;
  addDonation: (donation: Omit<Donation, 'id' | 'createdAt'>) => Promise<string | undefined>;
  getCampaignById: (id: string) => Promise<Campaign | null>;
  getCampaignDonations: (campaignId: string) => Promise<Donation[]>;
  clearError: () => void;
}

const CrowdfundingContext = createContext<CrowdfundingContextType | undefined>(undefined);

export const CrowdfundingProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignCache, setCampaignCache] = useState<Map<string, Campaign>>(new Map());
  const [donations, setDonations] = useState<Map<string, Donation[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Use useCallback to prevent unnecessary rerenders in consuming components
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const campaignsData = await getCampaigns();
      
      // Log data for debugging
      console.log('Raw campaigns data from Firestore:', campaignsData);
      
      // Ensure all fields needed for search exist
      const normalizedCampaigns = campaignsData.map(campaign => ({
        ...campaign,
        // Ensure these fields exist for safe search operations
        title: campaign.title || '',
        description: campaign.description || '',
        ownerName: campaign.ownerName || '',
      }));
      
      // Update the campaign cache with fresh data
      const newCache = new Map<string, Campaign>();
      normalizedCampaigns.forEach(campaign => {
        if (campaign.id) {
          newCache.set(campaign.id, campaign as Campaign);
        }
      });
      setCampaignCache(newCache);
      
      setCampaigns(normalizedCampaigns as Campaign[]);
      setError(null);
      return normalizedCampaigns;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all campaigns when the component mounts
  useEffect(() => {
    console.log('CrowdfundingProvider mounted, fetching initial campaigns');
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'amountRaised' | 'createdAt'>) => {
    if (!currentUser) {
      setError('You must be logged in to create a campaign');
      return undefined;
    }

    setLoading(true);
    try {
      // Make sure deadlines are properly converted to dates
      let deadline = campaignData.deadline;
      if (typeof deadline === 'string') {
        deadline = new Date(deadline);
      }
      
      const campaignId = await createCampaign({
        ...campaignData,
        ownerUid: currentUser.uid,
        ownerName: currentUser.displayName || 'Anonymous',
        deadline: deadline instanceof Date ? deadline : new Date(),
      });
      
      // Refresh campaigns after adding
      await fetchCampaigns();
      setError(null);
      return campaignId;
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
      console.error('Error creating campaign:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const addDonation = async (donationData: Omit<Donation, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      setError('You must be logged in to donate');
      return undefined;
    }

    setLoading(true);
    try {
      const donationId = await createDonation({
        ...donationData,
        donorUid: currentUser.uid,
        donorName: currentUser.displayName || 'Anonymous',
      });
      
      // Refresh campaigns after donation
      await fetchCampaigns();
      
      // Update donations for the affected campaign
      await getCampaignDonations(donationData.campaignId);
      
      setError(null);
      return donationId;
    } catch (err: any) {
      setError(err.message || 'Failed to create donation');
      console.error('Error creating donation:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const getCampaignById = useCallback(async (id: string): Promise<Campaign | null> => {
    if (!id) {
      console.error('Invalid campaign ID provided (empty)');
      setError('Invalid campaign ID');
      return null;
    }
    
    // First check the cache
    if (campaignCache.has(id)) {
      console.log(`Campaign ${id} found in cache`);
      return campaignCache.get(id) || null;
    }
    
    // Try to find in the already loaded campaigns
    const existingCampaign = campaigns.find(c => c.id === id);
    if (existingCampaign) {
      console.log(`Campaign ${id} found in loaded campaigns`);
      // Update cache
      setCampaignCache(prev => new Map(prev).set(id, existingCampaign));
      return existingCampaign;
    }
    
    // If not in cache or loaded campaigns, fetch from Firestore
    console.log(`Campaign ${id} not in cache, fetching from Firestore`);
    setLoading(true);
    try {
      const campaign = await fetchCampaignById(id);
      
      if (!campaign) {
        console.log(`Campaign ${id} not found in Firestore`);
        return null;
      }
      
      // Normalize the campaign data
      const normalizedCampaign = {
        ...campaign,
        title: campaign.title || '',
        description: campaign.description || '',
        ownerName: campaign.ownerName || '',
      } as Campaign;
      
      // Update cache with the newly fetched campaign
      setCampaignCache(prev => new Map(prev).set(id, normalizedCampaign));
      
      console.log(`Campaign ${id} fetched successfully:`, normalizedCampaign);
      setError(null);
      return normalizedCampaign;
    } catch (err: any) {
      console.error(`Error fetching campaign ${id}:`, err);
      setError(err.message || 'Failed to fetch campaign');
      return null;
    } finally {
      setLoading(false);
    }
  }, [campaigns, campaignCache, setLoading, setError]);

  const getCampaignDonations = async (campaignId: string) => {
    if (!campaignId) {
      setError('Invalid campaign ID');
      return [];
    }
    
    setLoading(true);
    try {
      const campaignDonations = await fetchCampaignDonations(campaignId);
      
      // Update the donations map with the fetched donations
      setDonations(prev => {
        const newMap = new Map(prev);
        newMap.set(campaignId, campaignDonations as Donation[]);
        return newMap;
      });
      
      setError(null);
      return campaignDonations as Donation[];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donations');
      console.error('Error fetching donations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <CrowdfundingContext.Provider
      value={{
        campaigns,
        donations,
        loading,
        error,
        fetchCampaigns,
        addCampaign,
        addDonation,
        getCampaignById,
        getCampaignDonations,
        clearError
      }}
    >
      {children}
    </CrowdfundingContext.Provider>
  );
};

export const useCrowdfunding = () => {
  const context = useContext(CrowdfundingContext);
  if (context === undefined) {
    throw new Error('useCrowdfunding must be used within a CrowdfundingProvider');
  }
  return context;
};
