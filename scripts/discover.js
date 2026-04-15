#!/usr/bin/env node
// Weekly discovery job: RSS + Trends + Suggest → Ideas tab.
import seeds from "../config/seeds.json" with { type: "json" };
import { fetchReddit } from "./lib/sources/reddit.js";
import { fetchTrends } from "./lib/sources/trends.js";
import { fetchSuggest } from "./lib/sources/suggest.js";
import { fetchNews } from "./lib/sources/news.js";
import { fetchBingSuggest } from "./lib/sources/bing.js";
import { dedupeByKeyword, isRelevant, today } from "./lib/util.js";
import { getRows, appendRows, tabUrl, storeName } from "./lib/store.js";
import { notifyDiscovered, notifyFailed } from "./lib/slack.js";

async function main() {
  console.log(`Backend: ${storeName}`);
  console.log("Fetching Reddit RSS…");
  const reddit = (await Promise.all(seeds.subreddits.map(fetchReddit))).flat();

  console.log("Fetching Google Trends RSS…");
  const trends = await fetchTrends(seeds.trendsGeo);

  console.log("Fetching Google Suggest…");
  const suggest = (await Promise.all(seeds.seedKeywords.map(fetchSuggest))).flat();

  console.log("Fetching Google News RSS…");
  const news = (await Promise.all(seeds.seedKeywords.map((k) => fetchNews(k, seeds.trendsGeo)))).flat();

  console.log("Fetching Bing Suggest…");
  const bing = (await Promise.all(seeds.seedKeywords.map(fetchBingSuggest))).flat();

  const raw = [...reddit, ...trends, ...suggest, ...news, ...bing];
  const relevant = raw.filter((i) => isRelevant(i.keyword));
  console.log(`Relevance filter: ${relevant.length}/${raw.length} passed.`);
  const scored = dedupeByKeyword(relevant);
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

  const reviewUrl = await tabUrl("Ideas");

  if (!fresh.length) {
    console.log("No new ideas — all already present.");
    await notifyDiscovered({ count: 0, total: scored.length, reviewUrl });
    return;
  }

  await appendRows("Ideas", fresh);
  console.log(`✓ Added ${fresh.length} new ideas.`);

  const top = [...fresh].sort((a, b) => b.final_score - a.final_score);
  await notifyDiscovered({ count: fresh.length, total: scored.length, top, reviewUrl });
}

main().catch(async (err) => {
  console.error(err);
  await notifyFailed({ title: "Discover", error: err.message || err });
  process.exit(1);
});
