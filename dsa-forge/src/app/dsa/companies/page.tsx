"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Search, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { getAllCompanies } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FAANG = new Set(["facebook", "meta", "amazon", "apple", "netflix", "google"]);
const MAANG = new Set(["meta", "amazon", "apple", "netflix", "google"]);
const MANGOS = new Set(["meta", "amazon", "netflix", "google", "openai", "oracle", "salesforce"]);
const TIER1 = new Set([
  "google", "amazon", "microsoft", "meta", "apple", "bloomberg", "uber", "linkedin",
  "salesforce", "adobe", "airbnb", "stripe", "coinbase", "snowflake", "databricks", "bytedance", "palantir", "twitter", "atlassian", "nvidia"
]);
const TIER2 = new Set([
  "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "hcl", "tech-mahindra", "ltimindtree", "oracle", "cisco", "intel", "ibm", "dell", "goldman-sachs", "jpmorgan", "morgan-stanley"
]);

type TierFilter = "ALL" | "FAANG" | "MAANG" | "MANGOS" | "TIER 1" | "TIER 2" | "TIER 3";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<TierFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState<number>(15);

  const allCompanies = getAllCompanies();

  // Filter companies
  let filtered = allCompanies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.normalizedName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const norm = c.normalizedName.toLowerCase();
    if (selectedTier === "FAANG") return FAANG.has(norm);
    if (selectedTier === "MAANG") return MAANG.has(norm);
    if (selectedTier === "MANGOS") return MANGOS.has(norm);
    if (selectedTier === "TIER 1") return TIER1.has(norm);
    if (selectedTier === "TIER 2") return TIER2.has(norm);
    if (selectedTier === "TIER 3") return !TIER1.has(norm) && !TIER2.has(norm);

    return true;
  });

  // Requirement 1: Default sorted A-Z by company name
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Requirement 2: Show initial 15 companies
  const visibleCompanies = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 15);
  };

  const tiers: TierFilter[] = ["ALL", "FAANG", "MAANG", "MANGOS", "TIER 1", "TIER 2", "TIER 3"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Company-Specific Preparation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Target Companies
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Explore {allCompanies.length} companies sorted A–Z with reported interview question counts.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(15);
            }}
            className="w-full bg-[#10131f]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Requirement 1: Top Tier Filter Buttons */}
      <div className="p-4 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Company Tiers:
        </span>
        {tiers.map((tier) => {
          const isActive = selectedTier === tier;
          return (
            <button
              key={tier}
              onClick={() => {
                setSelectedTier(tier);
                setVisibleCount(15);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400/40"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5"
              }`}
            >
              {tier}
            </button>
          );
        })}
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCompanies.map((company) => (
          <Link
            key={company.id}
            href={`/dsa/companies/${company.normalizedName}`}
            className="group relative p-6 rounded-2xl bg-[#10131f]/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.18)]"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <Badge variant="violet">
                  {company.easyCount + company.mediumCount + company.hardCount} Questions
                </Badge>
              </div>

              <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                {company.name}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-semibold">{company.easyCount} Easy</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-semibold">{company.mediumCount} Medium</span>
                <span className="text-slate-600">·</span>
                <span className="text-rose-400 font-semibold">{company.hardCount} Hard</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Total Problems: <strong className="text-white">{company.problemCount}</strong>
              </span>
              <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Questions <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Requirement 2: Show More Companies Button at the bottom / 16th position */}
      {hasMore && (
        <div className="pt-4 flex flex-col items-center justify-center space-y-2">
          <Button
            onClick={handleShowMore}
            variant="glass"
            size="lg"
            className="w-full sm:w-auto px-8 border-violet-500/30 hover:border-violet-500/60"
          >
            Show More Companies ({filtered.length - visibleCount} remaining) <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <span className="text-xs text-slate-400">
            Showing {visibleCompanies.length} of {filtered.length} companies
          </span>
        </div>
      )}
    </div>
  );
}
