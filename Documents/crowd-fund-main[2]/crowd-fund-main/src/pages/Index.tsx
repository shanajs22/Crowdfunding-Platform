import React, { useEffect } from 'react';
import { useCrowdfunding } from '@/context/CrowdfundingContext';
import CampaignCard from '@/components/CampaignCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const { campaigns, loading, fetchCampaigns } = useCrowdfunding();

  // Load latest campaigns when component mounts
  useEffect(() => {
    fetchCampaigns().catch(err => 
      console.error('Error loading campaigns on homepage:', err)
    );
  }, [fetchCampaigns]);

  // Safely display campaigns, handling the case where there are none
  const displayCampaigns = campaigns.length > 0 
    ? campaigns.slice(0, 6) 
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Fund the projects you believe in
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join our community of backers supporting innovative ideas, creative projects, and meaningful causes.
            </p>
            <Link to="/create">
              <Button size="lg" className="font-medium">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
            <Link to="/explore" className="flex items-center text-primary hover:underline">
              <span>View all</span>
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden h-96 animate-shimmer" />
              ))}
            </div>
          ) : displayCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground mb-4">No campaigns found</p>
              <Link to="/create">
                <Button>Create the first campaign</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-12 md:py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create a Campaign</h3>
              <p className="text-muted-foreground">
                Share your story, set a funding goal, and specify a deadline for your project.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Funded</h3>
              <p className="text-muted-foreground">
                Promote your campaign and receive donations from supporters around the world.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make It Happen</h3>
              <p className="text-muted-foreground">
                Use your funds to bring your project to life and keep your backers updated on your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to fund your project?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who have successfully funded their projects on our platform.
          </p>
          <Link to="/create">
            <Button size="lg" className="font-medium">
              Start Your Campaign
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
