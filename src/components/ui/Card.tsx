import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${
        hover ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:hover:border-white/20 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
