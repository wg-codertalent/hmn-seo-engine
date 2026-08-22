import seeds from "../../config/seeds.json" with { type: "json" };

export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const today = () => new Date().toISOString().slice(0, 10);

export function scoreIdea({ trend_score = 0, reddit_score = 0 }) {
  return Math.round(trend_score * 0.6 + Math.min(reddit_score, 500) * 0.4);
}

const TOPIC_TOKENS = [
  "airbnb", "bnb", "superhost",
  "short term rental", "short-term rental",
  "holiday let", "holiday rental", "holiday home",
  "short term let", "short-term let", "short let",
  "buy-to-let", "buy to let",
  "vacation rental", "serviced apartment", "serviced accommodation",
  "furnished rental", "rental property", "rental income",
  "host", "hosting", "guest",
  "landlord", "tenant", "lettings", "letting agent",
  "renters rights", "renter's rights", "tenants rights",
  "renters reform",
  "property management", "property investment"
];

// Geo/locale modifiers and navigational junk that mostly surface in Suggest.
const BLOCK_TOKENS = [
  "login", "sign in", "reddit",
  "ontario", "toronto", "vancouver", "montreal",
  "australia", "sydney", "melbourne",
  "new zealand", "auckland",
  "nyc", "new york", "los angeles", "las vegas", "chicago", "florida", "texas", "miami",
  "oklahoma", "okc", "kansas city", "kcmo", "knoxville", "akron", "ohio",
  "singapore", "dubai", "bali"
];

export function isRelevant(keyword) {
  const k = String(keyword || "").toLowerCase();
  if (!k) return false;
  if (BLOCK_TOKENS.some((t) => k.includes(t))) return false;
  return TOPIC_TOKENS.some((t) => k.includes(t));
}

// Transient HTTP statuses worth retrying (server-side blips + rate limits).
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

// fetch() with exponential-backoff retries on transient failures. Retries on
// network errors and retryable statuses; returns the Response for the caller to
// handle (including a final non-ok one once retries are exhausted).
export async function fetchRetry(url, options, { tries = 4, base = 500 } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, options);
    } catch (err) {
      if (attempt >= tries) throw err; // network error — retry or give up
      await sleep(base * 2 ** (attempt - 1));
      continue;
    }
    if (!RETRYABLE_STATUS.has(res.status) || attempt >= tries) return res;
    await sleep(base * 2 ** (attempt - 1));
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function dedupeByKeyword(items) {
  const seen = new Map();
  for (const i of items) {
    const key = (i.keyword || "").toLowerCase().trim();
    if (!key || key.length < 6) continue;
    const scored = { ...i, final_score: scoreIdea(i) };
    const existing = seen.get(key);
    if (!existing || existing.final_score < scored.final_score) seen.set(key, scored);
  }
  return [...seen.values()].sort((a, b) => b.final_score - a.final_score);
}

function yamlQuote(str) {
  if (!str) return '""';
  // Strip any surrounding quotes the LLM may have added
  const clean = str.replace(/^["']|["']$/g, "").trim();
  // Always use single quotes — escape internal single quotes by doubling them
  return `'${clean.replace(/'/g, "''")}'`;
}

export function buildFrontmatter({ title, slug, excerpt, cover, category, articleDate, seoTitle, seoDescription, ctaBanners }) {
  const { author } = seeds;
  const banners = (ctaBanners || ["get-my-free-income-projection", "book-a-call", "whatsapp-message"])
    .map((b) => `  - ${b}`)
    .join("\n");
  return `---
layout: article
title: ${yamlQuote(title)}
slug: ${slug}
excerpt: >
  ${(excerpt || "").replace(/^["']|["']$/g, "").trim()}
cover: ${cover}
category: ${category}
articleDate: ${articleDate}
published: true
ctaBanners:
${banners}
seoTitle: ${yamlQuote(seoTitle)}
seoDescription: ${yamlQuote(seoDescription)}
author:
  name: ${author.name}
  bio: >
    ${author.bio}
---
`;
}
