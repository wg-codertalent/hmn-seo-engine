export async function fetchSuggest(seed) {
  const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const suggestions = data[1] || [];
  return suggestions.map((s, i) => ({
    source: "google_suggest",
    keyword: s,
    trend_score: Math.round(60 - (i / suggestions.length) * 40),
    reddit_score: 0
  }));
}
