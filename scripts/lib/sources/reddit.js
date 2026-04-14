import { XMLParser } from "fast-xml-parser";

const xml = new XMLParser({ ignoreAttributes: false });

export async function fetchReddit(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/top/.rss?t=week`;
  const res = await fetch(url, { headers: { "user-agent": "seo-engine/0.1" } });
  if (!res.ok) return [];
  const parsed = xml.parse(await res.text());
  const entries = parsed.feed?.entry || [];
  return (Array.isArray(entries) ? entries : [entries]).map((e) => ({
    source: "reddit",
    keyword: (e.title?.["#text"] || e.title || "").toString().trim(),
    trend_score: 0,
    reddit_score: 50
  }));
}
