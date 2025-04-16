import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CrowdfundingProvider } from "@/context/CrowdfundingContext";
import StripeProvider from "@/context/StripeContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CampaignDetails from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import ExplorePage from "./pages/ExplorePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import { app } from "./lib/firebase";
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Donations from './pages/Donations';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

const App = () => {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is properly initialized
    try {
      if (app) {
        console.log("Firebase initialized successfully");
        setFirebaseInitialized(true);
      } else {
        console.error("Firebase app is undefined");
        setInitError("Firebase initialization failed");
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setInitError("Firebase initialization error");
    }
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive text-destructive-foreground p-4 rounded-md max-w-md">
          <h1 className="text-xl font-bold mb-2">Application Error</h1>
          <p>{initError}</p>
          <p className="mt-4 text-sm">
            Check your Firebase configuration in the .env file and ensure all values are correct.
          </p>
        </div>
      </div>
    );
  }

  if (!firebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CrowdfundingProvider>
            <StripeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/campaign/:id" element={<CampaignDetails />} />
                      <Route path="/create" element={
                        <ProtectedRoute>
                          <CreateCampaign />
                        </ProtectedRoute>
                      } />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Dashboard routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/campaigns" element={
                        <ProtectedRoute>
                          <Campaigns />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/donations" element={
                        <ProtectedRoute>
                          <Donations />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <footer className="bg-muted py-6 px-4 md:px-6">
                    <div className="container mx-auto text-center text-sm text-muted-foreground">
                      <p>© 2025 FundMyProject. All rights reserved.</p>
                    </div>
                  </footer>
                </div>
              </BrowserRouter>
            </StripeProvider>
          </CrowdfundingProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
