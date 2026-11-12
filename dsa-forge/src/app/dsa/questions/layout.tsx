import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "DSA Question Bank — 3,426+ LeetCode Pro Problems",
  description:
    "Search and filter 3,426+ company-tagged LeetCode Pro DSA problems by difficulty, algorithmic pattern, company frequency, and recency window (30 days, 3 months, 6 months).",
  path: "/dsa/questions",
  keywords: [
    "DSA question bank",
    "LeetCode Pro problems",
    "company tagged LeetCode",
    "coding interview practice",
    "LeetPrime",
  ],
});

export default function QuestionsLayout({ children }: { children: ReactNode }) {
  return children;
}
