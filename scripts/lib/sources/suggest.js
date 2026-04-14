export async function fetchSuggest(seed) {
  const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const suggestions = data[1] || [];
  return suggestions.map((s) => ({
    source: "google_suggest",
    keyword: s,
    trend_score: 30,
    reddit_score: 0
  }));
}
