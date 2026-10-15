import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Button } from '../ui/Button';
import { LogOut, BookOpen, Plus, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium ${
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/10'
  }`;

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50">QuizMaster</span>
        </Link>

        {isAuthenticated && (
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" end className={navClass}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </NavLink>
            <NavLink to="/user-dashboard" className={navClass}>
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </NavLink>
          </nav>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate('/user-dashboard')}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {initials || 'U'}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline dark:text-zinc-200">{user?.name}</span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
