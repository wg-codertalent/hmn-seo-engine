import { XMLParser } from "fast-xml-parser";

const xml = new XMLParser({ ignoreAttributes: false, processEntities: false });

const SITEMAPS = [
  "https://www.hostmynest.co.uk/sitemap-core.xml",
  "https://www.hostmynest.co.uk/sitemap-blog.xml",
  "https://www.hostmynest.co.uk/sitemap-locations.xml"
];

function topicFromPath(pathname) {
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last) return "Home";
  const words = last.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function pathFromLoc(loc) {
  try {
    const pathname = new URL(loc).pathname;
    return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  } catch {
    return null;
  }
}

// Exported for testing. Parses a sitemap XML string into { url, topic, lastmod } entries.
export function parseSitemap(xmlText) {
  const parsed = xml.parse(xmlText);
  const urls = parsed.urlset?.url || [];
  const list = Array.isArray(urls) ? urls : [urls];
  return list
    .filter((u) => u && u.loc)
    .map((u) => {
      const url = pathFromLoc(u.loc);
      if (!url) return null;
      return { url, topic: topicFromPath(url), lastmod: u.lastmod || "" };
    })
    .filter(Boolean);
}

async function fetchSitemap(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "seo-engine/0.1" } });
    if (!res.ok) {
      console.warn(`Sitemap ${url} responded ${res.status}`);
      return [];
    }
    return parseSitemap(await res.text());
  } catch (err) {
    console.warn(`Failed to fetch sitemap ${url}: ${err.message}`);
    return [];
  }
}

export async function fetchInternalLinks() {
  const groups = await Promise.all(SITEMAPS.map(fetchSitemap));
  const seen = new Set();
  const links = [];
  for (const group of groups) {
    const sorted = [...group].sort((a, b) => String(b.lastmod).localeCompare(String(a.lastmod)));
    for (const link of sorted) {
      if (seen.has(link.url)) continue;
      seen.add(link.url);
      links.push({ url: link.url, topic: link.topic });
    }
  }
  return links;
}
