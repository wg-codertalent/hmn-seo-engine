import { XMLParser } from "fast-xml-parser";

const xml = new XMLParser({ ignoreAttributes: false });

export async function fetchTrends(geo = "GB") {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const parsed = xml.parse(await res.text());
  const items = parsed.rss?.channel?.item || [];
  return (Array.isArray(items) ? items : [items]).map((i) => ({
    source: "google_trends",
    keyword: (i.title || "").toString().trim(),
    trend_score:
      parseInt(String(i["ht:approx_traffic"] || "0").replace(/[^0-9]/g, ""), 10) || 20,
    reddit_score: 0
  }));
}
