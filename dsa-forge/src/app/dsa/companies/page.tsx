"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Search, ArrowRight, ChevronDown, Sparkles, Tag } from "lucide-react";
import { getAllCompanies } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FAANG  = new Set(["facebook", "meta", "amazon", "apple", "netflix", "google"]);
const MAANG  = new Set(["meta", "amazon", "apple", "netflix", "google"]);
const MANGOS = new Set(["meta", "amazon", "netflix", "google", "openai", "oracle", "salesforce"]);

// Tier 1: FAANG/MAANG + elite product MNCs + top Indian unicorns + HFTs/Quant funds
const TIER1 = new Set([
  // FAANG/MAANG core
  "google", "amazon", "microsoft", "meta", "apple", "netflix",
  // Elite Global Tech
  "nvidia", "uber", "linkedin", "salesforce", "adobe", "airbnb", "atlassian",
  "stripe", "databricks", "figma", "snowflake", "coinbase", "palantir",
  "bytedance", "twitter", "openai", "anthropic", "deepmind", "spacex",
  "shopify", "cloudflare", "datadog", "canva", "okta", "servicenow", "workday",
  "intuit", "autodesk", "doordash", "lyft", "instacart", "spotify", "dropbox",
  "reddit", "pinterest", "twilio", "roblox", "riot-games", "epic-games",
  "duolingo", "notion", "discord", "asana", "hubspot", "rubrik", "crowdstrike",
  "palo-alto-networks", "mongodb", "confluent", "cockroach-labs",
  // HFT / Quant (Tier 0 but labelled as Tier 1 for student placement context)
  "jane-street", "two-sigma", "jump-trading", "citadel", "de-shaw", "tower-research",
  "graviton", "optiver", "akuna-capital", "drw", "imc", "hrt", "sig", "peak6",
  "squarepoint-capital", "millennium", "point72", "worldquant", "bridgewater-associates",
  // Top Indian Product Unicorns
  "flipkart", "swiggy", "zomato", "phonepe", "zepto", "razorpay", "dream11",
  "postman", "cred", "meesho", "groww", "freshworks", "zoho", "paytm",
  "ola", "oyo", "nykaa", "sharechat", "hotstar", "myntra", "cars24",
  "blinkit", "delhivery", "juspay", "cashfree", "razorpay", "darwinbox",
  "innovaccer", "clevertap", "moengage", "browserstack", "postman", "chargebee",
  "sentry", "glean", "scaler",
  // Global Product Giants (well-known, high prestige)
  "grab", "gojek", "tiktok", "coupang", "tokopedia", "shopee", "agoda",
  "booking.com", "bookingcom", "expedia", "tripadvisor", "airwallex", "wise", "revolut",
  "robinhood", "chime", "affirm", "plaid", "marqeta", "rippling", "gusto",
  "anduril", "scale-ai", "applied-intuition", "waymo", "cruise-automation",
  "aurora", "mobileye", "nuro", "rivian", "tesla",
  "samsung", "qualcomm", "broadcom", "amd", "huawei", "baidu", "alibaba", "tencent",
  "walmart-labs", "target",
]);

// Tier 2: Enterprise tech, FinTech banks, established mid-tier, larger Indian IT (non-WITCH)
const TIER2 = new Set([
  // Finance / Banks (Tech roles)
  "goldman-sachs", "jpmorgan", "morgan-stanley", "visa", "mastercard", "american-express",
  "barclays", "deutsche-bank", "hsbc", "bny-mellon", "blackrock", "fidelity", "capital-one",
  "wells-fargo", "bank-of-america", "citi", "rbc", "ubs", "blackstone", "natwest",
  "aqr-capital-management", "societe-generale", "bnp-paribas", "nasdaq", "cme-group",
  "interactive-brokers", "msci", "factset", "bloomberg",
  // Enterprise / Legacy Tech MNCs
  "oracle", "cisco", "intel", "ibm", "dell", "sap", "vmware", "qualys",
  "akamai", "nutanix", "netapp", "splunk", "commvault", "symantec", "veritas",
  "fortinet", "f5-networks", "citrix", "opentext", "teradata", "informatica",
  "tableau", "microstrategy", "cloudera", "singlestore", "couchbase", "yugabyte",
  "synopsys", "cadence", "ansys", "mathworks", "national-instruments", "garmin",
  "arista-networks", "juniper", "ericsson", "nokia", "siemens", "schneider-electric",
  "honeywell", "ge-digital", "ge-healthcare", "general-electric", "general-motors",
  "boeing", "hp", "hpe", "amd", "texas-instruments", "broadcom", "mobileye",
  "western-digital", "pure-storage", "netapp", "cohesity", "rubrik", "druva",
  "commvault", "veeam", "veritas",
  // Indian IT (non-WITCH, decent product exposure)
  "ltimindtree", "mindtree", "mphasis", "hexaware", "nagarro", "globallogic",
  "persistent-systems", "thoughtworks", "publicis-sapient", "epam-systems",
  "luxoft", "altimetrik", "hashedin", "fractal-analytics", "tiger-analytics",
  "analytics-quotient", "quantiphi", "sigmoid",
  // Mid-tier Global Product Companies
  "paypal", "ebay", "yelp", "zillow", "wayfair", "grubhub", "doordash",
  "poshmark", "fiverr", "groupon", "houzz", "redfin", "zillow", "tripadvisor",
  "booking.com", "bookingcom", "expedia", "airbus", "maersk",
  "unity", "ubisoft", "activision", "zynga", "ea", "epic-games", "roblox",
  "shopify", "wix", "squarespace", "godaddy",
  "zendesk", "freshworks", "servicenow", "atlassian", "okta", "docusign",
  "box", "dropbox", "evernote", "zoom", "twitch", "vimeo", "hulu", "disney",
  "warnermedia", "comcast", "att", "verizon", "tesco", "walmart",
  "rakuten", "mercari", "zalando", "delivery-hero",
  "paycom", "adp", "workday", "sap", "oracle", "salesforce",
  "veeva", "cerner", "epic-systems", "athenahealth", "oscar-health", "flatiron-health",
  "optum", "cigna", "usaa", "liberty-mutual", "state-farm",
  "qualtrics", "gainsight", "amplitude", "mixpanel", "liveramp", "criteo",
  "pubmatic", "quantcast", "the-trade-desk", "appnexus",
  "snowflake", "databricks", "confluent", "mongodb", "cockroach-labs", "yugabyte",
  "samsara", "motive", "toast", "gusto", "rippling",
  "affirm", "chime", "robinhood", "plaid", "marqeta", "sofi", "remitly",
  "navan", "tripactions", "concur",
  "peloton", "strava", "nike", "starbucks", "mcdonalds",
  "udemy", "coursera", "duolingo", "chegg",
  "indeedcom", "indeed", "glassdoor", "ziprecruiter", "linkedin",
  "ola", "rapido", "swiggy", "zomato", "oyo", "paytm", "nykaa",
  "airtel", "jio", "kotak-mahindra-bank", "axis-bank", "hdfc", "icici",
  "national-payments-coorperation-india",
  "tech-mahindra", "hcl",
  // Other well-known product companies
  "atlassian", "canva", "xero", "seek", "realestate-com-au",
  "traveloka", "grab", "tokopedia", "gojek", "shopee", "lazada",
  "coupang", "baemin", "kakao", "naver", "line",
  "meituan", "didi", "netease", "jd",
  "okx", "coinswitch-kuber", "wazirx", "bitgo",
  "klarna", "adyen", "mollie", "checkout",
  "figma", "miro", "notion", "airtable", "coda",
  "grammarly", "jasper", "copy-ai",
  "sentry", "datadog", "new-relic", "dynatrace", "pagerduty",
  "harness", "hashicorp", "chef", "puppet", "ansible",
  "cloudflare", "fastly", "akamai",
  "twilio", "sendgrid", "vonage", "agora",
  "segment", "amplitude", "mixpanel", "heap",
  "hotjar", "userleap", "pendo",
]);

// ─── Tier 1 category buckets ───────────────────────────────────────────────
const T1_FAANG_MAANG = new Set([
  "google", "amazon", "microsoft", "meta", "apple", "netflix",
]);
const T1_ELITE_GLOBAL = new Set([
  "nvidia", "uber", "linkedin", "salesforce", "adobe", "airbnb", "atlassian",
  "stripe", "databricks", "figma", "snowflake", "coinbase", "palantir",
  "bytedance", "twitter", "shopify", "cloudflare", "datadog", "canva",
  "okta", "servicenow", "workday", "intuit", "autodesk", "doordash", "lyft",
  "instacart", "spotify", "dropbox", "reddit", "pinterest", "twilio",
  "roblox", "riot-games", "epic-games", "duolingo", "notion", "discord",
  "asana", "hubspot", "rubrik", "crowdstrike", "palo-alto-networks",
  "mongodb", "confluent", "cockroach-labs", "samsung", "qualcomm",
  "broadcom", "amd", "huawei", "baidu", "alibaba", "tencent", "walmart-labs", "target",
]);
const T1_HFT_QUANT = new Set([
  "jane-street", "two-sigma", "jump-trading", "citadel", "de-shaw", "tower-research",
  "graviton", "optiver", "akuna-capital", "drw", "imc", "hrt", "sig", "peak6",
  "squarepoint-capital", "millennium", "point72", "worldquant", "bridgewater-associates",
]);
const T1_INDIAN_UNICORNS = new Set([
  "flipkart", "swiggy", "zomato", "phonepe", "zepto", "razorpay", "dream11",
  "postman", "cred", "meesho", "groww", "freshworks", "zoho", "paytm",
  "ola", "oyo", "nykaa", "sharechat", "hotstar", "myntra", "cars24",
  "blinkit", "delhivery", "juspay", "cashfree", "darwinbox",
  "innovaccer", "clevertap", "moengage", "browserstack", "chargebee",
  "sentry", "glean", "scaler",
]);
const T1_AI_AUTONOMOUS = new Set([
  "openai", "anthropic", "deepmind", "waymo", "cruise-automation",
  "aurora", "mobileye", "nuro", "rivian", "tesla", "spacex",
  "anduril", "scale-ai", "applied-intuition",
]);
const T1_GLOBAL_PRODUCT = new Set([
  "grab", "gojek", "tiktok", "coupang", "tokopedia", "shopee", "agoda",
  "bookingcom", "expedia", "tripadvisor", "airwallex", "wise", "revolut",
  "robinhood", "chime", "affirm", "plaid", "marqeta", "rippling", "gusto",
]);

// ─── Tier 2 category buckets ───────────────────────────────────────────────
const T2_BANKS_FINANCE = new Set([
  "goldman-sachs", "jpmorgan", "morgan-stanley", "visa", "mastercard", "american-express",
  "barclays", "deutsche-bank", "hsbc", "bny-mellon", "blackrock", "fidelity", "capital-one",
  "wells-fargo", "bank-of-america", "citi", "rbc", "ubs", "blackstone", "natwest",
  "aqr-capital-management", "societe-generale", "bnp-paribas", "nasdaq", "cme-group",
  "interactive-brokers", "msci", "factset", "bloomberg",
]);
const T2_ENTERPRISE_TECH = new Set([
  "oracle", "cisco", "intel", "ibm", "dell", "sap", "vmware", "qualys",
  "akamai", "nutanix", "netapp", "splunk", "commvault", "symantec", "veritas",
  "fortinet", "f5-networks", "citrix", "opentext", "teradata", "informatica",
  "tableau", "microstrategy", "cloudera", "singlestore", "couchbase", "yugabyte",
  "synopsys", "cadence", "mathworks", "national-instruments", "garmin",
  "arista-networks", "ericsson", "nokia", "siemens", "schneider-electric",
  "honeywell", "ge-digital", "ge-healthcare", "general-electric", "general-motors",
  "boeing", "hp", "hpe", "texas-instruments", "western-digital",
  "pure-storage", "cohesity", "rubrik", "druva",
]);
const T2_INDIAN_IT = new Set([
  "ltimindtree", "mindtree", "mphasis", "hexaware", "nagarro", "globallogic",
  "persistent-systems", "thoughtworks", "publicis-sapient", "epam-systems",
  "luxoft", "altimetrik", "hashedin", "fractal-analytics", "tiger-analytics",
  "analytics-quotient", "quantiphi", "sigmoid", "tech-mahindra", "hcl",
]);
const T2_MID_GLOBAL = new Set([
  "paypal", "ebay", "yelp", "zillow", "wayfair", "grubhub", "poshmark",
  "fiverr", "groupon", "houzz", "redfin", "tripadvisor", "expedia", "airbus", "maersk",
  "unity", "ubisoft", "activision", "zynga", "wix", "squarespace", "godaddy",
  "zendesk", "docusign", "box", "dropbox", "zoom", "twitch", "vimeo",
  "hulu", "disney", "warnermedia", "comcast", "att", "verizon", "tesco", "walmart",
  "rakuten", "mercari", "zalando", "traveloka", "kakao", "naver", "line",
  "meituan", "netease", "jd",
]);
const T2_INDIAN_PRODUCT = new Set([
  "ola", "swiggy", "zomato", "oyo", "paytm", "nykaa", "sharechat",
  "airtel", "jio", "kotak-mahindra-bank", "axis-bank",
  "national-payments-coorperation-india",
  "qualtrics", "gainsight", "amplitude", "mixpanel", "liveramp", "criteo",
  "pubmatic", "quantcast", "the-trade-desk",
  "samsara", "motive", "toast", "gusto", "rippling",
  "sofi", "remitly", "navan", "tripactions",
  "veeva", "cerner", "epic-systems", "athenahealth", "oscar-health",
  "flatiron-health", "optum", "usaa", "liberty-mutual", "state-farm",
  "udemy", "coursera", "glassdoor", "ziprecruiter",
  "okx", "coinswitch-kuber", "bitgo", "adp", "paycom",
]);

// ─── Tier 3 category buckets ───────────────────────────────────────────────
const T3_SERVICE_OUTSOURCING = new Set([
  "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini",
  "deloitte", "ey", "pwc", "kpmg", "bcg", "mckinsey", "exl", "ust",
  "amdocs", "brillio", "virtusa", "wissen",
]);

// ─── Sub-category config per tier ─────────────────────────────────────────
type SubCategory = { label: string; set: Set<string> | "rest" | null };

const TIER_SUBCATEGORIES: Record<string, SubCategory[]> = {
  "TIER 1": [
    { label: "All",               set: null },
    { label: "FAANG / MAANG",     set: T1_FAANG_MAANG },
    { label: "Elite Global Tech", set: T1_ELITE_GLOBAL },
    { label: "HFT / Quant",       set: T1_HFT_QUANT },
    { label: "Indian Unicorns",   set: T1_INDIAN_UNICORNS },
    { label: "AI / Autonomous",   set: T1_AI_AUTONOMOUS },
    { label: "Global Product",    set: T1_GLOBAL_PRODUCT },
  ],
  "TIER 2": [
    { label: "All",                 set: null },
    { label: "Banks / Finance",     set: T2_BANKS_FINANCE },
    { label: "Enterprise Tech",     set: T2_ENTERPRISE_TECH },
    { label: "Mid-tier Indian IT",  set: T2_INDIAN_IT },
    { label: "Mid-tier Global",     set: T2_MID_GLOBAL },
    { label: "Indian Product",      set: T2_INDIAN_PRODUCT },
  ],
  "TIER 3": [
    { label: "All",                   set: null },
    { label: "Service / Outsourcing", set: T3_SERVICE_OUTSOURCING },
    { label: "Smaller / Niche",       set: "rest" },
  ],
};

type TierFilter = "ALL" | "FAANG" | "MAANG" | "MANGOS" | "TIER 1" | "TIER 2" | "TIER 3";

export default function CompaniesPage() {
  const [search,       setSearch]       = useState("");
  const [selectedTier, setSelectedTier] = useState<TierFilter>("ALL");
  const [selectedCat,  setSelectedCat]  = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState<number>(15);

  const allCompanies = getAllCompanies();

  // Filter companies
  const filtered = allCompanies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.normalizedName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const norm = c.normalizedName.toLowerCase();

    // Top-level tier filter
    let passesTier = true;
    if      (selectedTier === "FAANG")  passesTier = FAANG.has(norm);
    else if (selectedTier === "MAANG")  passesTier = MAANG.has(norm);
    else if (selectedTier === "MANGOS") passesTier = MANGOS.has(norm);
    else if (selectedTier === "TIER 1") passesTier = TIER1.has(norm);
    else if (selectedTier === "TIER 2") passesTier = TIER2.has(norm);
    else if (selectedTier === "TIER 3") passesTier = !TIER1.has(norm) && !TIER2.has(norm);
    if (!passesTier) return false;

    // Sub-category filter
    if (selectedCat !== "All" && TIER_SUBCATEGORIES[selectedTier]) {
      const bucket = TIER_SUBCATEGORIES[selectedTier].find((s) => s.label === selectedCat);
      if (bucket && bucket.set !== null) {
        if (bucket.set === "rest") return !T3_SERVICE_OUTSOURCING.has(norm);
        return (bucket.set as Set<string>).has(norm);
      }
    }

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
  const subCategories = TIER_SUBCATEGORIES[selectedTier] ?? null;

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

      {/* Tier Filter + Sub-category panel */}
      <div className="rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden">
        {/* Row 1: Tier buttons */}
        <div className="p-4 flex flex-wrap items-center gap-2">
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
                  setSelectedCat("All");
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

        {/* Row 2: Sub-category buttons (visible only for TIER 1 / 2 / 3) */}
        {subCategories && (
          <div className="border-t border-white/[0.06] px-4 py-3 flex flex-wrap items-center gap-2 bg-white/[0.015]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-violet-500/70" /> Category:
            </span>
            {subCategories.map(({ label }) => {
              const isActive = selectedCat === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setSelectedCat(label);
                    setVisibleCount(15);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/10"
                      : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 border border-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
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
