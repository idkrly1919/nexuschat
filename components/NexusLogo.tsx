
import React from 'react';

interface NexusLogoProps {
  className?: string;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nexusSilverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1d5db" />
          <stop offset="50%" stopColor="#f9fafb" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
        <linearGradient id="nexusBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
         <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* --- Left Part of "N" --- */}
      {/* Back Blue Part */}
      <path d="M 20 20 H 35 L 55 80 H 40 Z" fill="url(#nexusBlueGradient)" />
      {/* Front Silver Part */}
      <path d="M 35 20 L 50 20 L 70 80 L 55 80 Z" fill="url(#nexusSilverGradient)" />
      
      {/* --- Right Part of "N" --- */}
       {/* Back Silver Part */}
      <path d="M 65 20 H 80 L 60 80 H 45 Z" fill="url(#nexusSilverGradient)" />
      {/* Front Blue Part */}
      <path d="M 50 20 H 65 L 45 80 H 30 Z" fill="url(#nexusBlueGradient)" />

      {/* Glossy Overlay */}
      <path d="M 20 20 H 80 L 30 80 H 20 Z" fill="rgba(255, 255, 255, 0.2)" style={{ mixBlendMode: 'overlay' }} />
    </svg>
  );
};
