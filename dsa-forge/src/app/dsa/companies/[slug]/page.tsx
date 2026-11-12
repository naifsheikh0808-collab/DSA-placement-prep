import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyBySlug, getCompanyProblems } from "@/lib/db";
import { buildAbsoluteUrl, buildPageMetadata } from "@/lib/seo";
import { CompanyDetailClient } from "./CompanyDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatCompanyDisplayName(name: string): string {
  return name.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const company = getCompanyBySlug(slug);

  if (!company) {
    return buildPageMetadata({
      title: "Company Not Found",
      description: "The requested company could not be found on LeetPrime.",
      path: `/dsa/companies/${encodeURIComponent(slug)}`,
    });
  }

  const displayName = formatCompanyDisplayName(company.name);
  const totalQuestions = getCompanyProblems(company.id).length;

  return buildPageMetadata({
    title: `${displayName} Interview DSA Questions (${totalQuestions}+ Problems)`,
    description: `Practice ${totalQuestions} ${displayName} LeetCode DSA interview questions (${company.easyCount} Easy, ${company.mediumCount} Medium, ${company.hardCount} Hard) sorted by asking frequency, priority score, and 30d/3m/6m recency.`,
    path: `/dsa/companies/${encodeURIComponent(company.normalizedName)}`,
    keywords: [
      `${displayName} LeetCode questions`,
      `${displayName} DSA interview questions`,
      `${displayName} coding interview prep`,
      "company wise DSA",
      "LeetPrime",
    ],
  });
}

async function CompanyServerContent({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const displayName = formatCompanyDisplayName(company.name);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: buildAbsoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Companies",
        item: buildAbsoluteUrl("/dsa/companies"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: buildAbsoluteUrl(`/dsa/companies/${encodeURIComponent(company.normalizedName)}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CompanyDetailClient slug={slug} />
    </>
  );
}

export default function CompanyDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading company details...</div>}>
      <CompanyServerContent params={params} />
    </Suspense>
  );
}
