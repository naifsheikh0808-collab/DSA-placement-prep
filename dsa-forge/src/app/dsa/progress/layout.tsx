import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your Progress & Mastery Tracker",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return children;
}
