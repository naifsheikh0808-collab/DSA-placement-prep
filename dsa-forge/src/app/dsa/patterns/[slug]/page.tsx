import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPatternBySlug } from "@/lib/db";
import { buildAbsoluteUrl, buildPageMetadata } from "@/lib/seo";
import { PatternDetailClient } from "./PatternDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    return buildPageMetadata({
      title: "Pattern Not Found",
      description: "The requested DSA pattern roadmap could not be found on LeetPrime.",
      path: `/dsa/patterns/${encodeURIComponent(slug)}`,
    });
  }

  return buildPageMetadata({
    title: `${pattern.name} DSA Pattern Roadmap & Practice Problems`,
    description: `${pattern.description} Master ${pattern.name} with ${pattern.questions.length} curated prerequisite-ordered problems and ${pattern.questionCount}+ company-tagged questions across ${pattern.companyCoverage} tech companies.`,
    path: `/dsa/patterns/${encodeURIComponent(pattern.slug)}`,
    keywords: [
      `${pattern.name} DSA`,
      `${pattern.name} LeetCode problems`,
      `${pattern.name} pattern roadmap`,
      "DSA patterns",
      "LeetPrime",
    ],
  });
}

async function PatternServerContent({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: buildAbsoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Patterns",
        item: buildAbsoluteUrl("/dsa/patterns"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pattern.name,
        item: buildAbsoluteUrl(`/dsa/patterns/${encodeURIComponent(pattern.slug)}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PatternDetailClient slug={slug} />
    </>
  );
}

export default function PatternDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading pattern details...</div>}>
      <PatternServerContent params={params} />
    </Suspense>
  );
}
