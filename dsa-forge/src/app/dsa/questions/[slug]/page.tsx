import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProblemBySlug } from "@/lib/db";
import { buildAbsoluteUrl, buildPageMetadata } from "@/lib/seo";
import { QuestionDetailClient } from "./QuestionDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const problem = getProblemBySlug(slug);

  if (!problem) {
    return buildPageMetadata({
      title: "Question Not Found",
      description: "The requested DSA problem could not be found on LeetPrime.",
      path: `/dsa/questions/${encodeURIComponent(slug)}`,
    });
  }

  const patternLabel = problem.primaryPattern || "Algorithms";
  const topCompanies = problem.companies
    .slice(0, 4)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(", ");
  const companyNote =
    problem.companyCount > 0
      ? `Asked by ${problem.companyCount} companies${topCompanies ? ` including ${topCompanies}` : ""}.`
      : "High-priority DSA interview question.";

  const prefix = problem.externalId ? `#${problem.externalId} ` : "";

  return buildPageMetadata({
    title: `${prefix}${problem.title} — ${patternLabel} & Companies`,
    description: `${prefix}${problem.title} (${problem.difficulty} · ${patternLabel}). ${companyNote} Practice with timeframe recency, structured notes, and Prime AI hints on LeetPrime.`,
    path: `/dsa/questions/${encodeURIComponent(problem.slug)}`,
    keywords: [
      problem.title,
      `${problem.title} LeetCode`,
      `${problem.title} companies`,
      patternLabel,
      problem.difficulty,
      "LeetPrime",
    ],
  });
}

async function QuestionServerContent({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const prefix = problem.externalId ? `#${problem.externalId} ` : "";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: buildAbsoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Questions",
        item: buildAbsoluteUrl("/dsa/questions"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${prefix}${problem.title}`,
        item: buildAbsoluteUrl(`/dsa/questions/${encodeURIComponent(problem.slug)}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <QuestionDetailClient slug={slug} />
    </>
  );
}

export default function QuestionDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading question details...</div>}>
      <QuestionServerContent params={params} />
    </Suspense>
  );
}
