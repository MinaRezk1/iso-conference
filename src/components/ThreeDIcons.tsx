import React from "react";

// Helper for generating custom drop shadows and lighting filters inside SVGs
const SVGFilters = () => (
  <defs>
    <filter id="shadow-3d" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" floodColor="#000000" />
    </filter>
    <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF2B2" />
      <stop offset="30%" stopColor="#F59E0B" />
      <stop offset="70%" stopColor="#D97706" />
      <stop offset="100%" stopColor="#78350F" />
    </linearGradient>
    <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="30%" stopColor="#CBD5E1" />
      <stop offset="70%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>
    <linearGradient id="bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFEDD5" />
      <stop offset="30%" stopColor="#FB923C" />
      <stop offset="70%" stopColor="#EA580C" />
      <stop offset="100%" stopColor="#7C2D12" />
    </linearGradient>
    <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E0F2FE" />
      <stop offset="30%" stopColor="#60A5FA" />
      <stop offset="70%" stopColor="#2563EB" />
      <stop offset="100%" stopColor="#1E3A8A" />
    </linearGradient>
    <radialGradient id="sphere-shading" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
      <stop offset="50%" stopColor="#888888" stopOpacity="0.3" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
    </radialGradient>
  </defs>
);

export function Trophy3D({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      className={`${className} animate-bounce-slow`}
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
    >
      <SVGFilters />
      
      {/* Base Pedestal */}
      <rect x="20" y="52" width="24" height="6" rx="1.5" fill="#1E293B" />
      <path d="M22 46 L42 46 L38 52 L26 52 Z" fill="#334155" />
      
      {/* Trophy Stem */}
      <rect x="29" y="38" width="6" height="8" rx="1" fill="url(#gold-grad)" />
      
      {/* Trophy Cup Bowl */}
      <path d="M16 14 C16 34, 48 34, 48 14 Z" fill="url(#gold-grad)" />
      
      {/* Glossy Lip rim */}
      <ellipse cx="32" cy="14" rx="16" ry="3" fill="#FFEAA7" opacity="0.8" />
      
      {/* Specular light highlight */}
      <path d="M20 18 C22 28, 30 32, 30 32" stroke="#FFF9DB" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      
      {/* Curved Elegant Handles */}
      <path d="M16 18 C10 18, 10 28, 16 30" stroke="url(#gold-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M48 18 C54 18, 54 28, 48 30" stroke="url(#gold-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />
      
      {/* Inside Bowl Dark shadow depth */}
      <ellipse cx="32" cy="14" rx="14" ry="1.5" fill="#78350F" opacity="0.4" />
    </svg>
  );
}

export function SoccerBall3D({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} select-none`}
    >
      <text 
        x="12" 
        y="12.5" 
        fontSize="18" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        ⚽
      </text>
    </svg>
  );
}

interface Medal3DProps {
  type: "gold" | "silver" | "bronze" | "blue";
  className?: string;
  rankText?: string;
}

export function Medal3D({ type, className = "w-10 h-10", rankText }: Medal3DProps) {
  let grad = "url(#gold-grad)";
  let ribbonColor1 = "#EF4444"; // Red
  let ribbonColor2 = "#3B82F6"; // Blue
  let innerReflect = "#FFEAA7";

  if (type === "silver") {
    grad = "url(#silver-grad)";
    ribbonColor1 = "#475569";
    ribbonColor2 = "#94A3B8";
    innerReflect = "#F1F5F9";
  } else if (type === "bronze") {
    grad = "url(#bronze-grad)";
    ribbonColor1 = "#D97706";
    ribbonColor2 = "#F97316";
    innerReflect = "#FFEDD5";
  } else if (type === "blue") {
    grad = "url(#blue-grad)";
    ribbonColor1 = "#1E3A8A";
    ribbonColor2 = "#3B82F6";
    innerReflect = "#E0F2FE";
  }

  return (
    <svg 
      viewBox="0 0 64 64" 
      className={`${className}`}
      style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.18))" }}
    >
      <SVGFilters />
      
      {/* Hanging Ribbons */}
      <path d="M22 2 L32 24 L26 24 L16 2 Z" fill={ribbonColor1} />
      <path d="M42 2 L32 24 L38 24 L48 2 Z" fill={ribbonColor2} />
      {/* Stripe highlights on ribbon */}
      <path d="M25 2 L32 24 L30 24 L21 2 Z" fill="#FFFFFF" opacity="0.4" />
      <path d="M39 2 L32 24 L34 24 L43 2 Z" fill="#FFFFFF" opacity="0.4" />
      
      {/* Main Medal Outer Circle */}
      <circle cx="32" cy="38" r="18" fill={grad} stroke="#121212" strokeWidth="1" />
      
      {/* Beveled Inner Circle */}
      <circle cx="32" cy="38" r="14" fill={grad} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
      
      {/* Specular metallic crescent reflection */}
      <path d="M20 34 A14 14 0 0 0 44 42" stroke={innerReflect} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      
      {/* Star Icon / Rating Engraving */}
      {rankText ? (
        <text 
          x="32" 
          y="43" 
          fill="#1E293B" 
          fontSize="15" 
          fontWeight="900" 
          fontFamily="serif" 
          textAnchor="middle"
          style={{ textShadow: "1px 1px 0px rgba(255,255,255,0.4)" }}
        >
          {rankText}
        </text>
      ) : (
        <polygon 
          points="32,29 35,35 42,36 37,41 38,48 32,44 26,48 27,41 22,36 29,35" 
          fill="#1E293B" 
          opacity="0.8" 
        />
      )}
    </svg>
  );
}

// Additional 3D visual icons for menu and headings

export function Calendar3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.15))" }}>
      <SVGFilters />
      {/* Back Plate */}
      <rect x="14" y="16" width="36" height="36" rx="4" fill="url(#blue-grad)" />
      {/* Front Page */}
      <rect x="14" y="24" width="36" height="28" rx="2" fill="#FFFFFF" />
      {/* Header Band */}
      <rect x="14" y="16" width="36" height="8" rx="2" fill="#EF4444" />
      
      {/* Binding Rings */}
      <rect x="20" y="10" width="4" height="10" rx="2" fill="#94A3B8" />
      <rect x="40" y="10" width="4" height="10" rx="2" fill="#94A3B8" />
      
      {/* Page Grids (Simulated) */}
      <circle cx="22" cy="30" r="2.5" fill="#CBD5E1" />
      <circle cx="32" cy="30" r="2.5" fill="#CBD5E1" />
      <circle cx="42" cy="30" r="2.5" fill="#60A5FA" />
      
      <circle cx="22" cy="40" r="2.5" fill="#CBD5E1" />
      <circle cx="32" cy="40" r="2.5" fill="#EF4444" />
      <circle cx="42" cy="40" r="2.5" fill="#CBD5E1" />
      
      {/* Glossy diagonal glass cover shine */}
      <path d="M16 26 L48 48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function Music3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.15))" }}>
      <SVGFilters />
      <circle cx="20" cy="44" r="8" fill="url(#bronze-grad)" />
      <circle cx="44" cy="38" r="8" fill="url(#bronze-grad)" />
      
      {/* Glossy stem & connection bar */}
      <path d="M26 44 L26 14 L50 8 L50 38" stroke="url(#gold-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M26 14 L50 8 L50 18 L26 24 Z" fill="url(#gold-grad)" />
      
      {/* Gloss reflection shine */}
      <path d="M28 17 L46 12" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function Book3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.15))" }}>
      <SVGFilters />
      {/* Leather cover bottom */}
      <path d="M10 46 C10 40, 32 40, 32 46 L32 14 C32 8, 10 8, 10 14 Z" fill="#991B1B" />
      <path d="M54 46 C54 40, 32 40, 32 46 L32 14 C32 8, 54 8, 54 14 Z" fill="#7F1D1D" />
      
      {/* Pages */}
      <path d="M12 44 C12 38, 32 38, 32 44 L32 12 C32 6, 12 6, 12 12 Z" fill="#FAF5FF" />
      <path d="M52 44 C52 38, 32 38, 32 44 L32 12 C32 6, 52 6, 52 12 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Shiny Bookmark ribbon */}
      <path d="M32 12 L32 48 L28 42 L32 12 Z" fill="url(#gold-grad)" />
      
      {/* Gloss highlight overlay */}
      <path d="M48 10 C42 12, 34 10, 34 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function Home3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.15))" }}>
      <SVGFilters />
      {/* Main walls */}
      <rect x="16" y="28" width="32" height="26" rx="2" fill="url(#blue-grad)" />
      {/* Roof with linear gradient representing 3D depth */}
      <polygon points="10,28 32,10 54,28" fill="url(#bronze-grad)" stroke="#7C2D12" strokeWidth="1" />
      
      {/* Wooden style door */}
      <rect x="28" y="38" width="10" height="16" rx="1" fill="#78350F" />
      <circle cx="31" cy="46" r="1" fill="#FEF08A" />
      
      {/* Circular Window */}
      <circle cx="32" cy="22" r="4.5" fill="#FFFFFF" stroke="url(#gold-grad)" strokeWidth="1.5" />
      
      {/* Glossy cover shines */}
      <path d="M14 26 L32 12" stroke="#FFEAA7" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export function CopticCross3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" }}>
      <SVGFilters />
      {/* Central circular ring */}
      <circle cx="32" cy="32" r="18" fill="none" stroke="url(#gold-grad)" strokeWidth="3" opacity="0.85" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#FFEAA7" strokeWidth="1" opacity="0.6" />
      
      {/* Vertical beam */}
      <rect x="27" y="6" width="10" height="52" rx="3" fill="url(#gold-grad)" stroke="#78350F" strokeWidth="0.5" />
      {/* Horizontal beam */}
      <rect x="6" y="27" width="52" height="10" rx="3" fill="url(#gold-grad)" stroke="#78350F" strokeWidth="0.5" />
      
      {/* 4 Corner stars/flourishes of the Coptic Cross */}
      <circle cx="21" cy="21" r="3" fill="#FFEAA7" />
      <circle cx="43" cy="21" r="3" fill="#FFEAA7" />
      <circle cx="21" cy="43" r="3" fill="#FFEAA7" />
      <circle cx="43" cy="43" r="3" fill="#FFEAA7" />
      
      {/* Center jewel */}
      <circle cx="32" cy="32" r="4.5" fill="#DC2626" stroke="#FFEAA7" strokeWidth="1" />
      
      {/* Gloss shine */}
      <path d="M29 8 L35 8" stroke="#FFF9DB" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 29 L8 35" stroke="#FFF9DB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
