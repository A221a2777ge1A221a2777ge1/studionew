import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="African Tycoon Logo"
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(45, 100%, 60%)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g className="transform transition-transform group-hover:scale-105">
        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(var(--primary))" />
        <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="4" />
        <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" fill="hsl(var(--background))" />
        <path d="M50 25 L75 37.5 L75 62.5 L50 75 L25 62.5 L25 37.5 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="2" />
        <text
          x="50"
          y="56"
          fontFamily="Poppins, sans-serif"
          fontWeight="bold"
          fontSize="24"
          fill="hsl(var(--primary))"
          textAnchor="middle"
        >
          AT
        </text>
      </g>
    </svg>
  );
}
