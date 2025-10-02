import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Dreamcoin Logo"
    >
      <defs>
        <linearGradient id="gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g className="transform transition-transform group-hover:scale-110">
        <path d="M50 5 L95 40 L80 95 L20 95 L5 40 Z" fill="url(#gem-gradient)" />
        <path d="M50 5 L5 40 L20 95 L80 95 L95 40 Z" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
        <path d="M50 5 L50 95" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="4" />
        <path d="M5 40 L95 40" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="4" />
        <path d="M20 95 L50 40 L80 95" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="4" />
         <text
          x="50"
          y="62"
          fontFamily='"Press Start 2P", cursive'
          fontWeight="bold"
          fontSize="36"
          fill="hsl(var(--accent-foreground))"
          textAnchor="middle"
          stroke="hsl(var(--background))"
          strokeWidth="1.5"
        >
          DC
        </text>
      </g>
    </svg>
  );
}
