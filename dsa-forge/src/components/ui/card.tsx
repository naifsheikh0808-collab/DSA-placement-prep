import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md p-5 transition-all duration-200",
        hover && "hover:border-violet-500/40 hover:bg-[#141828]/90 hover:shadow-[0_10px_30px_-10px_rgba(124,58,237,0.15)] hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-3", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs", className)}>{children}</div>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "violet",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  accentColor?: "violet" | "emerald" | "amber" | "rose" | "indigo";
}) {
  return (
    <Card hover={false} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-center",
            accentColor === "violet" && "bg-violet-500/10 border-violet-500/20 text-violet-400",
            accentColor === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            accentColor === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
            accentColor === "rose" && "bg-rose-500/10 border-rose-500/20 text-rose-400",
            accentColor === "indigo" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
