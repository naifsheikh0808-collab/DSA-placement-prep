import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "DSAForge — Crack DSA Interviews by Pattern + Company",
    template: "%s | DSAForge",
  },
  description:
    "Stop solving random questions. Follow a roadmap based on your time, target companies, and the DSA patterns that repeatedly appear in interviews. 659 companies · 3,399 problems.",
  keywords: ["DSA", "interview prep", "LeetCode", "placement preparation", "coding interview", "data structures", "algorithms"],
  openGraph: {
    title: "DSAForge — Crack DSA Interviews by Pattern + Company",
    description: "Pattern-first DSA preparation with company-specific roadmaps.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex min-h-dvh">
          <Suspense fallback={<div className="w-64 bg-zinc-950 border-r border-zinc-800" />}>
            <Sidebar />
          </Suspense>
          {/* Main content — offset by sidebar on desktop */}
          <main className="flex-1 lg:pl-64 min-w-0">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
