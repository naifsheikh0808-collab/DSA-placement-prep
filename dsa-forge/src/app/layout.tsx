import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "LeetPrime — Beyond LeetCode Pro | Company-Wise DSA & Recency Engine",
    template: "%s | LeetPrime",
  },
  description:
    "LeetPrime includes the complete collection of LeetCode Pro DSA problems organized company-wise across Tier 1, Tier 2, and Tier 3 tech giants. Supercharged with extra features that go beyond LeetCode Pro: real-time interview recency (30d/3m/6m), 15 pattern-first mastery roadmaps, and priority scoring.",
  keywords: ["LeetPrime", "LeetCode Pro", "DSA", "interview prep", "LeetCode", "company wise dsa", "placement preparation", "coding interview", "data structures", "algorithms"],
  openGraph: {
    title: "LeetPrime — Beyond LeetCode Pro | Company-Wise DSA & Recency Engine",
    description: "All LeetCode Pro company DSA questions supercharged with real-time recency, patterns & company tiers.",
    type: "website",
  },
};

import { AuthProvider } from "@/context/auth-context";

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
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
