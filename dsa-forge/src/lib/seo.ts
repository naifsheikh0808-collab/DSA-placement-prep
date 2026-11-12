import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://leetprime-pro.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "LeetPrime";

export const SITE_TITLE_DEFAULT =
  "LeetPrime — Beyond LeetCode Pro | Company-Wise DSA & Recency Engine";

export const SITE_DESCRIPTION =
  "LeetPrime includes 3,426+ LeetCode Pro DSA problems organized company-wise across 659 tech companies. Supercharged with interview recency (30d/3m/6m), 24 algorithmic patterns, smart study planner, and Prime AI placement coaching.";

export const SITE_KEYWORDS = [
  "LeetPrime",
  "LeetPrime Pro",
  "LeetCode Pro",
  "DSA",
  "interview prep",
  "company wise DSA",
  "LeetCode company wise questions",
  "DSA patterns",
  "placement preparation",
  "coding interview",
  "data structures and algorithms",
];

/** Builds a clean absolute canonical URL for any route path. */
export function buildAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Shared helper for page-level OpenGraph, Twitter, and canonical metadata. */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = buildAbsoluteUrl(path);

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
