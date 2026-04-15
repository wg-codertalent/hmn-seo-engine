// Bing Suggest — different corpus to Google Suggest so it surfaces queries
// Google hides. Same OpenSearch JSON shape: [query, [suggestions]].
export async function fetchBingSuggest(seed) {
  const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(seed)}&mkt=en-GB&cc=GB`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const suggestions = data[1] || [];
  return suggestions.map((s, i) => ({
    source: "bing_suggest",
    keyword: s,
    trend_score: Math.round(55 - (i / suggestions.length) * 35),
    reddit_score: 0
  }));
}
