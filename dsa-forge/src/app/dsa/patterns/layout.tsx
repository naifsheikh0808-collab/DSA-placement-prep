import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "24 DSA Patterns & Algorithmic Roadmaps",
  description:
    "Master all 24 core and advanced DSA patterns — Two Pointers, Sliding Window, BFS/DFS, Greedy, Dynamic Programming, Tries, and Graphs — ordered by prerequisite mastery.",
  path: "/dsa/patterns",
  keywords: [
    "DSA patterns",
    "coding interview patterns",
    "Two Pointers",
    "Sliding Window",
    "Dynamic Programming roadmap",
    "LeetPrime",
  ],
});

export default function PatternsLayout({ children }: { children: ReactNode }) {
  return children;
}
