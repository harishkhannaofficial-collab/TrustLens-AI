import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Shield + Lens + Neural AI SVG Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-accent-violet to-accent-cyan p-[1.5px] shadow-lg shadow-brand-500/20`}>
        <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[82%] h-[82%]"
          >
            {/* Outer Shield Path */}
            <path
              d="M16 3L6 7V15C6 22 10.5 27.5 16 29C21.5 27.5 26 22 26 15V7L16 3Z"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="rgba(30, 41, 59, 0.4)"
            />
            {/* Magnifying Lens */}
            <circle
              cx="15"
              cy="14"
              r="5"
              stroke="#a855f7"
              strokeWidth="2"
              fill="rgba(15, 23, 42, 0.7)"
            />
            {/* Lens Handle */}
            <path
              d="M19 18L23 22"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* AI Neural Sparkle Center */}
            <circle cx="15" cy="14" r="1.8" fill="#60a5fa" />
            <path
              d="M15 10V11M15 17V18M11 14H12M18 14H19"
              stroke="#93c5fd"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-white ${textSizes[size]}`}>
            TRUSTLENS
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Understand Before You Deploy
          </span>
        )}
      </div>
    </div>
  );
};
