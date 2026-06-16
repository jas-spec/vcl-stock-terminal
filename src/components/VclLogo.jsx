import React from 'react';

export default function VclLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* V segment */}
      <path 
        d="M20 25L45 80L55 58" 
        stroke="url(#vcl-grad-v)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* C segment (curved around the V and L) */}
      <path 
        d="M80 40C78 25 62 15 48 20C32 25 24 45 32 65C38 78 55 85 70 75" 
        stroke="url(#vcl-grad-c)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* L segment / Uptrend arrow pointing to upper right */}
      <path 
        d="M50 55L75 30H90" 
        stroke="url(#vcl-grad-l)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Arrow Head */}
      <path 
        d="M90 30L82 22M90 30L82 38" 
        stroke="url(#vcl-grad-l)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      <defs>
        <linearGradient id="vcl-grad-v" x1="20" y1="25" x2="55" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="vcl-grad-c" x1="80" y1="15" x2="70" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="vcl-grad-l" x1="50" y1="55" x2="90" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
