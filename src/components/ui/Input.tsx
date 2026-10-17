import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && visible ? 'text' : type}
          className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            isPassword ? 'pr-11' : ''
          } ${
            error ? 'border-red-400' : 'border-slate-300 dark:border-white/10'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
