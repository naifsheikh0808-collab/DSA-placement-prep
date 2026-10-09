import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className,
      loading,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2.5 text-xs",
          size === "lg" && "px-6 py-3 text-sm font-bold",
          variant === "primary" &&
            "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border border-violet-400/30",
          variant === "secondary" &&
            "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/60",
          variant === "ghost" &&
            "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
          variant === "outline" &&
            "bg-transparent hover:bg-violet-500/10 text-violet-300 border border-violet-500/40 hover:border-violet-500/70",
          variant === "glass" &&
            "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 backdrop-blur-md",
          variant === "danger" &&
            "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
