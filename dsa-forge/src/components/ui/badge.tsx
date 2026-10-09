import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "easy" | "medium" | "hard" | "pattern" | "outline" | "muted" | "violet";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full tracking-wide transition-all",
        size === "sm" && "px-2.5 py-0.5 text-[11px]",
        size === "md" && "px-3 py-1 text-xs",
        variant === "default" && "bg-slate-800/80 text-slate-300 border border-slate-700/60",
        variant === "easy" && "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        variant === "medium" && "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
        variant === "hard" && "bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
        variant === "violet" && "bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]",
        variant === "pattern" && "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
        variant === "outline" && "bg-transparent text-slate-400 border border-slate-700/80",
        variant === "muted" && "bg-slate-900/90 text-slate-500 border border-slate-800",
        className
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant =
    difficulty === "Easy" ? "easy" : difficulty === "Medium" ? "medium" : "hard";
  return <Badge variant={variant}>{difficulty}</Badge>;
}
