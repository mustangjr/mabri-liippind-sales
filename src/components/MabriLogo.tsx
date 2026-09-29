import React from 'react';

interface MabriLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const MabriLogo: React.FC<MabriLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor,
}) => {
  const heightMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
    xl: 'h-14',
  };

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      {/* Mabri Monogram Mark */}
      <svg
        viewBox="0 0 160 120"
        className={`${heightMap[size]} w-auto aspect-[4/3] flex-shrink-0 drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left sky-blue pillar */}
        <path
          d="M 0 35 L 38 12 L 38 108 A 12 12 0 0 1 26 120 L 12 120 A 12 12 0 0 1 0 108 Z"
          fill="#67C8F7"
        />
        {/* Right sky-blue pillar */}
        <path
          d="M 122 12 L 160 35 L 160 108 A 12 12 0 0 1 148 120 L 134 120 A 12 12 0 0 1 122 108 Z"
          fill="#67C8F7"
        />
        {/* Deep blue chevron V */}
        <path
          d="M 0 0 L 52 0 L 80 82 L 108 0 L 160 0 L 106 120 L 54 120 Z"
          fill="#1C2B88"
        />
      </svg>

      {/* Mabri Wordmark */}
      {showText && (
        <span
          className={`font-semibold tracking-tight font-heading leading-none ${
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'
          } ${textColor ? textColor : 'text-slate-900 dark:text-white'}`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Mabri
        </span>
      )}
    </div>
  );
};
