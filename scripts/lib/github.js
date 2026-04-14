import fs from "node:fs/promises";
import path from "node:path";

// Resolves the blog repo root. In same-repo mode we assume seo-engine lives
// one level down from the blog root. Override with BLOG_REPO_ROOT if needed.
function blogRoot() {
  if (process.env.BLOG_REPO_ROOT) return process.env.BLOG_REPO_ROOT;
  return path.resolve(process.cwd(), "..");
}

function paths() {
  const root = blogRoot();
  return {
    articles:   path.join(root, process.env.ARTICLES_DIR   || "content/articles"),
    images:     path.join(root, process.env.IMAGES_DIR     || "public/images/uploads"),
    categories: path.join(root, process.env.CATEGORIES_DIR || "content/categories")
  };
}

export async function validateCategory(category) {
  const { categories } = paths();
  const files = await fs.readdir(categories).catch(() => []);
  if (!files.length) return; // category dir not found — skip validation
  const valid = files.map((f) => f.replace(/\.(md|ya?ml|json)$/, ""));
  if (!valid.includes(category)) {
    throw new Error(`Category "${category}" not found. Valid: ${valid.join(", ")}`);
  }
}

export async function writeArticle(slug, markdown) {
  const { articles } = paths();
  await fs.mkdir(articles, { recursive: true });
  const abs = path.join(articles, `${slug}.md`);
  await fs.writeFile(abs, markdown);
  return abs;
}

export async function writeImage(slug, buffer) {
  const { images } = paths();
  await fs.mkdir(images, { recursive: true });
  const abs = path.join(images, `${slug}.png`);
  await fs.writeFile(abs, buffer);
  return abs;
}

export function imageAbsPath(slug) {
  return path.join(paths().images, `${slug}.webp`);
}

export function imageRelUrl(slug) {
  return `/images/uploads/${slug}.webp`;
}

export function articleRelPath(slug) {
  return `${process.env.ARTICLES_DIR || "content/articles"}/${slug}.md`;
}
