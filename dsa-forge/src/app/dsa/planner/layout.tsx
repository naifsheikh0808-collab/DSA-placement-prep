import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Smart DSA Study Planner & Interview Roadmap",
  description:
    "Generate a personalized company-targeted DSA study schedule tailored to your target tech company, daily pace, and interview timeline.",
  path: "/dsa/planner",
  keywords: [
    "DSA study planner",
    "interview prep roadmap",
    "LeetCode schedule generator",
    "coding interview plan",
    "LeetPrime",
  ],
});

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
