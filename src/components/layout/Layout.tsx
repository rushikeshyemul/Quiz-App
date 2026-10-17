import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../../context/useAuth';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 ${isAuthenticated ? 'pb-24 md:pb-10' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};
