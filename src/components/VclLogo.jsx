
export default function VclLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Package box base */}
      <path 
        d="M15 38L50 20L85 38L85 75L50 93L15 75Z" 
        stroke="url(#vcl-inv-grad-box)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        fill="url(#vcl-inv-fill)"
        fillOpacity="0.08"
      />
      {/* Box center line */}
      <path 
        d="M50 55L50 93" 
        stroke="url(#vcl-inv-grad-mid)" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />
      {/* Box top fold left */}
      <path 
        d="M15 38L50 55L85 38" 
        stroke="url(#vcl-inv-grad-top)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        strokeLinecap="round" 
      />
      {/* Upward arrow (inventory in) */}
      <path 
        d="M50 8L50 32" 
        stroke="url(#vcl-inv-grad-arrow)" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      <path 
        d="M38 18L50 8L62 18" 
        stroke="url(#vcl-inv-grad-arrow)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      <defs>
        <linearGradient id="vcl-inv-grad-box" x1="15" y1="20" x2="85" y2="93" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="vcl-inv-fill" x1="15" y1="20" x2="85" y2="93" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="vcl-inv-grad-mid" x1="50" y1="55" x2="50" y2="93" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="vcl-inv-grad-top" x1="15" y1="38" x2="85" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="vcl-inv-grad-arrow" x1="50" y1="8" x2="50" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
