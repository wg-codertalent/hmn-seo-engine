import seeds from "../../config/seeds.json" with { type: "json" };

export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const today = () => new Date().toISOString().slice(0, 10);

export function scoreIdea({ trend_score = 0, reddit_score = 0 }) {
  return Math.round(trend_score * 0.6 + Math.min(reddit_score, 500) * 0.4);
}

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
