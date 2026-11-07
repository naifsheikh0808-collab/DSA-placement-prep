"use client";

import { cn } from "@/lib/utils";

interface PrimeAiLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

export function PrimeAiLogo({ size = "md", className, animated = false }: PrimeAiLogoProps) {
  const sizeMap = {
    xs: { box: "w-6 h-6", img: "w-4 h-4", round: "rounded-lg" },
    sm: { box: "w-7 h-7", img: "w-5 h-5", round: "rounded-lg" },
    md: { box: "w-9 h-9", img: "w-6 h-6", round: "rounded-xl" },
    lg: { box: "w-11 h-11", img: "w-8 h-8", round: "rounded-xl" },
    xl: { box: "w-14 h-14", img: "w-10 h-10", round: "rounded-2xl" },
  };

  const { box, img, round } = sizeMap[size];

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
          "relative w-full h-full p-[1.5px] bg-gradient-to-b from-white/30 via-violet-500/40 to-cyan-500/20 shadow-xl overflow-hidden",
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

          {/* Prime AI Custom Logo Mark */}
          <img
            src="/ai-logo.png"
            alt="Prime AI Logo"
            className={cn(
              "relative z-10 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-transform duration-300",
              img,
              animated && "scale-105"
            )}
          />
        </div>
      </div>
    </div>
  );
}
