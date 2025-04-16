import React, { useState, useEffect } from 'react';
import { useCrowdfunding } from '@/context/CrowdfundingContext';
import CampaignCard from '@/components/CampaignCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Campaign } from '@/context/CrowdfundingContext';
import { Link } from 'react-router-dom';

const ExplorePage = () => {
  const { campaigns, loading, fetchCampaigns } = useCrowdfunding();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch campaigns when component mounts
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await fetchCampaigns();
        setIsInitialized(true);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };
    
    loadCampaigns();
  }, [fetchCampaigns]);
  
  // Initialize filteredCampaigns with all campaigns when campaigns data loads
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      console.log('Campaigns loaded successfully:', campaigns.length, 'campaigns found');
      if (!searchTerm.trim()) {
        setFilteredCampaigns(campaigns);
      }
    } else if (isInitialized) {
      console.log('No campaigns found in database');
      setFilteredCampaigns([]);
    }
  }, [campaigns, isInitialized, searchTerm]);
  
  // Apply filtering whenever searchTerm changes
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return;
    
    if (!searchTerm.trim()) {
      // If search is empty, show all campaigns
      setFilteredCampaigns(campaigns);
      return;
    }
    
    try {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      const filtered = campaigns.filter((campaign) => {
        // Safely check properties with optional chaining
        const title = campaign?.title?.toLowerCase() || '';
        const description = campaign?.description?.toLowerCase() || '';
        const ownerName = campaign?.ownerName?.toLowerCase() || '';
        
        return (
          title.includes(normalizedSearchTerm) || 
          description.includes(normalizedSearchTerm) || 
          ownerName.includes(normalizedSearchTerm)
        );
      });
      
      console.log(`Search term: "${normalizedSearchTerm}" - Found ${filtered.length} matches`);
      setFilteredCampaigns(filtered);
    } catch (error) {
      console.error('Error filtering campaigns:', error);
      // Fall back to showing all campaigns if filtering fails
      setFilteredCampaigns(campaigns);
    }
  }, [campaigns, searchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);
  };
  
  const clearSearch = () => {
    console.log('Clearing search');
    setSearchTerm('');
  };
  
  const hasNoResults = !loading && isInitialized && filteredCampaigns.length === 0;
  const showEmptyState = hasNoResults && !searchTerm.trim();
  const showNoSearchResults = hasNoResults && searchTerm.trim() !== '';
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Explore Campaigns</h1>
      
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <Input
          className="pl-10 pr-10"
          placeholder="Search campaigns by title, description or creator..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden h-96 animate-shimmer" />
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No campaigns found. Be the first to create one!
          </p>
          <Link to="/create">
            <Button>Create Campaign</Button>
          </Link>
        </div>
      ) : showNoSearchResults ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No campaigns found matching "{searchTerm}"
          </p>
          <Button onClick={clearSearch} variant="outline" size="sm">
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
