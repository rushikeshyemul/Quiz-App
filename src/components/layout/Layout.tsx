import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};