
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrowdfunding } from '@/context/CrowdfundingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CreateCampaign = () => {
  const { addCampaign } = useCrowdfunding();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !creatorName || !goalAmount || !deadline) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const goalAmountNumber = parseFloat(goalAmount);
    if (isNaN(goalAmountNumber) || goalAmountNumber <= 0) {
      toast({
        title: "Invalid goal amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newCampaign = {
        title,
        description,
        creatorName,
        goalAmount: goalAmountNumber,
        deadline: deadline.toISOString(),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop',
      };
      
      addCampaign(newCampaign);
      
      toast({
        title: "Campaign created!",
        description: "Your crowdfunding campaign has been successfully created.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Create a New Campaign</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the name of your campaign"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="creatorName">Creator Name *</Label>
            <Input
              id="creatorName"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your name or organization"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your campaign, what you're raising funds for, and how the money will be used"
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Campaign Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter URL for your campaign image (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use a default image
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalAmount">Funding Goal (USD) *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="goalAmount"
                type="number"
                min="1"
                step="1"
                className="pl-7"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Campaign Deadline *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
