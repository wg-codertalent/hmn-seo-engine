import { XMLParser } from "fast-xml-parser";

const xml = new XMLParser({ ignoreAttributes: false, processEntities: false });

// Google News RSS per seed — surfaces timely UK stories (policy, licensing, regs).
export async function fetchNews(seed, geo = "GB") {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(seed)}&hl=en-${geo}&gl=${geo}&ceid=${geo}:en`;
  const res = await fetch(url, { headers: { "user-agent": "seo-engine/0.1" } });
  if (!res.ok) return [];
  const parsed = xml.parse(await res.text());
  const items = parsed.rss?.channel?.item || [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((i, idx) => {
    // Google News titles look like "Article headline - Publication". Strip the publication.
    const raw = (i.title || "").toString().trim();
    const keyword = raw.replace(/\s+-\s+[^-]+$/, "").trim();
    return {
      source: "google_news",
      keyword,
      trend_score: Math.round(80 - (idx / list.length) * 50),
      reddit_score: 0
    };
  });
}
