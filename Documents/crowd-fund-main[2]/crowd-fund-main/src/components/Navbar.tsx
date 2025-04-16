import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Home, Plus, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './ui/use-toast';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-4 md:px-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src='/images/fund.png'
            alt="FundMyProject Logo"
            className="h-10 w-10 rounded-md object-cover"
          />
          <span className="text-xl font-bold text-gray-800">FundMyProject</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/explore">
            <Button variant="ghost">Explore</Button>
          </Link>
          
          {currentUser ? (
            <>
              <Link to="/create">
                <Button className="flex items-center gap-1">
                  <Plus size={16} />
                  <span>Start a Campaign</span>
                </Button>
              </Link>
              
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="flex items-center gap-1">
                  <LogIn size={16} />
                  <span>Login</span>
                </Button>
              </Link>
              
              <Link to="/register">
                <Button className="flex items-center gap-1">
                  <UserPlus size={16} />
                  <span>Register</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
