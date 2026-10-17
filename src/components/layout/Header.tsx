import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Button } from '../ui/Button';
import { LogOut, Plus, BarChart3, Library } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from './ThemeToggle';

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
    isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-zinc-400'
  }`;

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
    <>
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center" aria-label="QuizMaster home">
          <Logo size="sm" compact />
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" end className={navClass}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </NavLink>
            <NavLink to="/library" className={navClass}>
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
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
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 hover:bg-slate-100 sm:pr-3 dark:hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {initials || 'U'}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline dark:text-zinc-200">{user?.name}</span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
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
      {isAuthenticated && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] md:hidden dark:border-white/10 dark:bg-zinc-950/95">
          <div className="grid grid-cols-3">
            <NavLink to="/dashboard" end className={mobileNavClass}>
              <Plus className="h-5 w-5" />
              Create
            </NavLink>
            <NavLink to="/library" className={mobileNavClass}>
              <Library className="h-5 w-5" />
              Library
            </NavLink>
            <NavLink to="/user-dashboard" className={mobileNavClass}>
              <BarChart3 className="h-5 w-5" />
              History
            </NavLink>
          </div>
        </nav>
      )}
    </>
  );
};
