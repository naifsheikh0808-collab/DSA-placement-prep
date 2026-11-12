import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Company-Wise LeetCode DSA Questions (659+ Companies)",
  description:
    "Browse 659+ top tech companies (Google, Amazon, Meta, Microsoft, Uber, Bloomberg & more) with frequency-ranked LeetCode DSA questions and real-time 30d/3m/6m recency signals.",
  path: "/dsa/companies",
  keywords: [
    "company wise DSA",
    "LeetCode company wise questions",
    "Google DSA questions",
    "Amazon LeetCode questions",
    "MAANG interview questions",
    "LeetPrime",
  ],
});

export default function CompaniesLayout({ children }: { children: ReactNode }) {
  return children;
}
