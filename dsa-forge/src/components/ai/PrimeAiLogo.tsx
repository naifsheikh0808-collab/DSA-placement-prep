"use client";

import { cn } from "@/lib/utils";

interface PrimeAiLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

export function PrimeAiLogo({ size = "md", className, animated = false }: PrimeAiLogoProps) {
  const sizeMap = {
    xs: { box: "w-6 h-6", svg: 16, round: "rounded-lg" },
    sm: { box: "w-7 h-7", svg: 18, round: "rounded-lg" },
    md: { box: "w-9 h-9", svg: 22, round: "rounded-xl" },
    lg: { box: "w-11 h-11", svg: 28, round: "rounded-xl" },
    xl: { box: "w-14 h-14", svg: 36, round: "rounded-2xl" },
  };

  const { box, svg, round } = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center flex-shrink-0 group select-none",
        box,
        className
      )}
    >
      {/* Ambient Pulsing Glow Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 blur-md opacity-40 transition-opacity duration-500",
          round,
          animated ? "animate-pulse" : "group-hover:opacity-75"
        )}
      />

      {/* Cyber Prism Outer Frame */}
      <div
        className={cn(
          "relative w-full h-full p-[1.5px] bg-gradient-to-b from-white/30 via-violet-500/40 to-cyan-500/20 shadow-xl",
          round
        )}
      >
        {/* Core Glass Body */}
        <div
          className={cn(
            "w-full h-full bg-gradient-to-br from-[#1b1538] via-[#120f26] to-[#0b0f1f] flex items-center justify-center overflow-hidden border border-white/10",
            round
          )}
        >
          {/* Holographic Angular Mesh Light Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-400/25 via-transparent to-cyan-400/10 pointer-events-none" />

          {/* Prime AI Emblem: Custom Faceted Quantum Monogram */}
          <svg
            width={svg}
            height={svg}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("relative z-10 transition-transform duration-300", animated && "scale-105")}
          >
            <defs>
              {/* Primary Neon Gradient */}
              <linearGradient id="primeGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* Accent Core Spark Gradient */}
              <linearGradient id="sparkGrad" x1="12" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E0E7FF" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>

              {/* Holographic Shadow Filter */}
              <filter id="primeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Geometric Outer Hex-Faceted Diamond */}
            <path
              d="M16 3L26 8.5V23.5L16 29L6 23.5V8.5L16 3Z"
              stroke="url(#primeGrad)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="opacity-70"
            />

            {/* Inner Cyber-Spoke Connectors */}
            <path
              d="M16 3V11M26 8.5L19 12.5M26 23.5L19 19.5M16 29V21M6 23.5L13 19.5M6 8.5L13 12.5"
              stroke="#818CF8"
              strokeWidth="1"
              strokeOpacity="0.4"
            />

            {/* Central Stylized "P" Faceted Core */}
            <path
              d="M12 9H17.5C19.9853 9 22 11.0147 22 13.5C22 15.9853 19.9853 18 17.5 18H14.5V23H12V9Z"
              fill="url(#sparkGrad)"
              filter="url(#primeGlow)"
            />

            {/* Inner P Loop Cutout Accent */}
            <path
              d="M14.5 11.2H17.2C18.47 11.2 19.5 12.23 19.5 13.5C19.5 14.77 18.47 15.8 17.2 15.8H14.5V11.2Z"
              fill="#120f26"
            />

            {/* Radiant Spark Star at Crest */}
            <circle cx="21" cy="8.5" r="1.5" fill="#38BDF8" className="animate-ping opacity-75" />
            <circle cx="21" cy="8.5" r="1.2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
}
