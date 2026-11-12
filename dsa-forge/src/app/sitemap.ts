import type { MetadataRoute } from "next";
import { PATTERNS, TOP_COMPANIES, TOP_PROBLEMS } from "@/lib/data/seed";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/dsa/companies`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dsa/patterns`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dsa/questions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dsa/planner`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const patternRoutes: MetadataRoute.Sitemap = PATTERNS.map((pattern) => ({
    url: `${SITE_URL}/dsa/patterns/${encodeURIComponent(pattern.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const companyRoutes: MetadataRoute.Sitemap = TOP_COMPANIES.map((company) => ({
    url: `${SITE_URL}/dsa/companies/${encodeURIComponent(company.normalizedName)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const questionRoutes: MetadataRoute.Sitemap = TOP_PROBLEMS.map((problem) => ({
    url: `${SITE_URL}/dsa/questions/${encodeURIComponent(problem.slug)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...patternRoutes,
    ...companyRoutes,
    ...questionRoutes,
  ];
}
