#!/usr/bin/env node
// Weekly discovery job: RSS + Trends + Suggest → Ideas tab.
import seeds from "../config/seeds.json" with { type: "json" };
import { fetchReddit } from "./lib/sources/reddit.js";
import { fetchTrends } from "./lib/sources/trends.js";
import { fetchSuggest } from "./lib/sources/suggest.js";
import { dedupeByKeyword, today } from "./lib/util.js";
import { getRows, appendRows, storeName } from "./lib/store.js";

async function main() {
  console.log(`Backend: ${storeName}`);
  console.log("Fetching Reddit RSS…");
  const reddit = (await Promise.all(seeds.subreddits.map(fetchReddit))).flat();

  console.log("Fetching Google Trends RSS…");
  const trends = await fetchTrends(seeds.trendsGeo);

  console.log("Fetching Google Suggest…");
  const suggest = (await Promise.all(seeds.seedKeywords.map(fetchSuggest))).flat();

  const scored = dedupeByKeyword([...reddit, ...trends, ...suggest]);
  console.log(`Found ${scored.length} unique ideas.`);

  const existingRows = await getRows("Ideas");
  const existing = new Set(
    existingRows.map((r) => (r.get("keyword") || "").toLowerCase())
  );
  const fresh = scored
    .filter((i) => !existing.has(i.keyword.toLowerCase()))
    .map((i) => ({
      source: i.source,
      keyword: i.keyword,
      trend_score: i.trend_score,
      reddit_score: i.reddit_score,
      final_score: i.final_score,
      discovered_at: today(),
      status: "new"
    }));

  if (!fresh.length) {
    console.log("No new ideas — all already present.");
    return;
  }

  await appendRows("Ideas", fresh);
  console.log(`✓ Added ${fresh.length} new ideas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
