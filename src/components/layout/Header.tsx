import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Button } from '../ui/Button';
import { LogOut, User, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuizMaster
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <button
                  onClick={() => navigate('/user-dashboard')}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium cursor-pointer"
                >
                  {user?.name}
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};