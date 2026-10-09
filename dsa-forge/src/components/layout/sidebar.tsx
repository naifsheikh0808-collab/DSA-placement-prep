"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2, LayoutDashboard, GitBranch, Building2,
  Clock, Dumbbell, Map, TrendingUp, Menu, X, ChevronRight, Sparkles, Layers
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/constants";

const NAVIGATION = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Patterns Explorer", href: "/dsa/patterns", icon: GitBranch },
  { name: "Target Companies", href: "/dsa/companies", icon: Building2 },
  { name: "Question Bank", href: "/dsa/questions", icon: Code2 },
  { name: "Recency / Timeframes", href: "/dsa/timeframes", icon: Clock },
  { name: "Smart Practice", href: "/dsa/practice", icon: Dumbbell },
  { name: "Roadmaps", href: "/dsa/roadmaps", icon: Map },
  { name: "My Progress", href: "/dsa/progress", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">DSAForge</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-[#0c0e17]/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                DSAForge <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">PRO</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Interview Preparation</div>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                DSA Module
              </div>
              <nav className="space-y-1">
                {NAVIGATION.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/15 text-white border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Expansion Modules (Coming Soon) */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Modules</span>
                <span className="text-[9px] text-slate-400">Expandable</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {MODULES.filter((m) => m.id !== "dsa").map((mod) => (
                  <div
                    key={mod.id}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="text-[11px] font-bold text-slate-300">{mod.label}</div>
                    <div className="text-[9px] text-slate-400">Soon</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="mt-auto pt-6">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-500/20 text-xs">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Company Recency
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Problems are continuously sorted by 30-day interview report frequency.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
