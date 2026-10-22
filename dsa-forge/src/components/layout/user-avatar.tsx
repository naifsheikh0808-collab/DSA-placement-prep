"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const ICON_CLASSES: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

function initials(name?: string | null, email?: string | null): string {
  const source = (name || email || "").trim();
  if (!source) return "G";
  const parts = source.split(/[\s.@_-]+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Profile avatar / account switcher.
 *
 * Signed in -> shows the Google profile picture (or initials fallback).
 * Guest     -> shows a neutral user glyph.
 * Clicking opens a menu to sign in, jump to progress, or sign out.
 */
export function UserAvatar({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignIn = async () => {
    setBusy(true);
    setOpen(false);
    try {
      await signInWithGoogle();
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
  };

  const isGuest = !user;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        id="user-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `Account: ${user.displayName || user.email}` : "Guest mode — sign in"}
        title={user ? user.displayName || user.email || "Signed in" : "Guest Mode — click to sign in"}
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 border border-white/15 shadow-lg shadow-violet-600/20 transition-all duration-200 hover:scale-105 hover:border-violet-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
          SIZE_CLASSES[size]
        )}
      >
        {loading ? (
          <Loader2 className={cn("animate-spin text-white", ICON_CLASSES[size])} />
        ) : user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : user ? (
          <span
            className={cn(
              "font-extrabold text-white drop-shadow",
              size === "lg" ? "text-xl" : size === "md" ? "text-sm" : "text-[11px]"
            )}
          >
            {initials(user.displayName, user.email)}
          </span>
        ) : (
          <User className={cn("text-white/90", ICON_CLASSES[size])} />
        )}

        {/* Guest badge — makes the signed-out state explicit. */}
        {isGuest && !loading && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0c0e17]" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#12131f] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Identity */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-br from-violet-950/50 to-transparent">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-violet-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  {user ? (
                    <span className="text-xs font-extrabold text-white">
                      {initials(user.displayName, user.email)}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white/90" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {user ? user.displayName || "Google User" : "Guest Explorer"}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user ? user.email : "Not synced to cloud"}
                </div>
              </div>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border">
              {user ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Signed in
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Guest mode
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dsa/progress"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.07] hover:text-white transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-violet-400" /> My Progress
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={handleSignIn}
                disabled={busy}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-colors disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                  />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>

          {!user && (
            <p className="px-4 py-2.5 text-[10px] text-slate-500 leading-relaxed border-t border-white/10">
              Progress is stored locally. Sign in to back it up to the cloud and
              continue on any device.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
