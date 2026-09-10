import React from 'react';

interface TitanLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const TitanLogo: React.FC<TitanLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Minimalist Monolith Glyph */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Squircle Background Badge */}
          <rect
            width="100"
            height="100"
            rx="22"
            fill="#0B1120"
            stroke="#1E293B"
            strokeWidth="2"
          />

          {/* Floating Horizontal Datum / Header Bar */}
          <rect
            x="22"
            y="24"
            width="56"
            height="14"
            rx="4"
            fill="#38BDF8"
          />

          {/* Floating Vertical Foundation / Monolith Pillar */}
          <rect
            x="43"
            y="44"
            width="14"
            height="32"
            rx="4"
            fill="#F8FAFC"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-tech text-sm font-bold tracking-wider text-slate-100 uppercase">
            TITAN_OS
          </span>
          <span className="text-[8px] font-mono text-cyan-500/80 tracking-tight uppercase leading-none">
            ENGINEERING WORKSTATION
          </span>
        </div>
      )}
    </div>
  );
};
