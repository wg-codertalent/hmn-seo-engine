// Canonical column names shared by the Google Sheet adapter and the JSON fallback.
export const IDEAS_COLUMNS = [
  "id",
  "source",
  "keyword",
  "category",
  "trend_score",
  "reddit_score",
  "final_score",
  "discovered_at",
  "status"
];

export const ARTICLES_COLUMNS = [
  "id",
  "title",
  "keyword",
  "category",
  "slug",
  "status",
  "articleDate",
  "excerpt",
  "cover",
  "markdown_path",
  "notes",
  "publishedAt",
  "error"
];

export const ARTICLE_STATUSES = ["ready", "generating", "published", "error"];
export const IDEA_STATUSES = ["new", "approved", "queued", "rejected"];
