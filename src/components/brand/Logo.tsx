import React from 'react';

type LogoMarkProps = {
  className?: string;
};

export const LogoMark: React.FC<LogoMarkProps> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#1f6b4a" />
    <text
      x="16"
      y="22.5"
      textAnchor="middle"
      fill="#ffffff"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="20"
      fontWeight="700"
    >
      Q
    </text>
  </svg>
);

type LogoProps = {
  className?: string;
  markClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'light';
  stacked?: boolean;
  compact?: boolean;
};

const markSize = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

const wordSize = {
  sm: 'text-base',
  md: 'text-base',
  lg: 'text-2xl',
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  markClassName,
  size = 'md',
  tone = 'default',
  stacked = false,
  compact = false,
}) => {
  const quizColor = tone === 'light' ? 'text-white' : 'text-slate-900 dark:text-zinc-50';
  const masterColor = tone === 'light' ? 'text-[#7dcea0]' : 'text-[#1f6b4a] dark:text-[#7dcea0]';

  return (
    <span className={`inline-flex items-center ${stacked ? 'flex-col gap-3' : 'gap-2.5'} ${className}`}>
      <LogoMark className={markClassName ?? markSize[size]} />
      <span className={`${wordSize[size]} font-semibold tracking-tight ${quizColor} ${compact ? 'hidden sm:inline' : ''}`}>
        Quiz<span className={masterColor}>Master</span>
      </span>
    </span>
  );
};
