import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("group transition-transform hover:scale-105", className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Dreamcoin Logo"
    >
      <defs>
        <linearGradient id="gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      <g>
        <path 
            d="M50 5 L95 40 L80 95 L20 95 L5 40 Z" 
            fill="url(#gem-gradient)" 
            className="opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ filter: 'url(#glow)' }}
        />
        <path d="M50 5 L5 40 L20 95 L80 95 L95 40 Z" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" className="opacity-70" />
        <path d="M50 5 L50 95" stroke="hsl(var(--accent) / 0.3)" strokeWidth="1.5" strokeDasharray="5" />
        <path d="M5 40 L95 40" stroke="hsl(var(--accent) / 0.3)" strokeWidth="1.5" strokeDasharray="5" />
        <path d="M20 95 L50 40 L80 95" stroke="hsl(var(--accent) / 0.3)" strokeWidth="1.5" strokeDasharray="5" />
         <text
          x="50"
          y="65"
          fontFamily="var(--font-geist-mono)"
          fontWeight="bold"
          fontSize="42"
          fill="hsl(var(--primary-foreground))"
          textAnchor="middle"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          className="tracking-tighter"
        >
          DC
        </text>
      </g>
    </svg>
  );
}
