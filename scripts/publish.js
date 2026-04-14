#!/usr/bin/env node
// Publishing job: pick next `ready` row → Claude Opus 4.6 → image → commit to blog repo.
import { generateArticle, generateExcerpt } from "./lib/claude.js";
import { generateCoverImage } from "./lib/images.js";
import {
  validateCategory, writeArticle, imageAbsPath, imageRelUrl, articleRelPath
} from "./lib/github.js";
import { getRows, storeName } from "./lib/store.js";
import { slugify, today, buildFrontmatter } from "./lib/util.js";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
  if (!process.env.OPENAI_API_KEY)    throw new Error("Missing OPENAI_API_KEY");

  console.log(`Backend: ${storeName}`);
  const rows = await getRows("Articles");
  const row = rows.find((r) => (r.get("status") || "").trim() === "ready");
  if (!row) {
    console.log("No items with status=ready.");
    return;
  }

  const item = {
    title:       row.get("title"),
    keyword:     row.get("keyword"),
    category:    row.get("category"),
    slug:        row.get("slug"),
    articleDate: row.get("articleDate")
  };

  console.log(`Publishing: ${item.title}`);
  await validateCategory(item.category);

  const slug = item.slug || slugify(item.title);
  const articleDate = item.articleDate || today();

  try {
    await row.update({ status: "generating" });

    const [body, excerpt] = await Promise.all([
      generateArticle(item),
      generateExcerpt(item.title)
    ]);

    await generateCoverImage(item.title, imageAbsPath(slug));

    const markdown =
      buildFrontmatter({
        title: item.title,
        slug,
        excerpt,
        cover: imageRelUrl(slug),
        category: item.category,
        articleDate
      }) + "\n" + body + "\n";

    const mdPath = await writeArticle(slug, markdown);

    await row.update({
      status: "published",
      slug,
      excerpt,
      cover: imageRelUrl(slug),
      markdown_path: articleRelPath(slug),
      publishedAt: today()
    });

    console.log(`✓ Published ${slug}`);
    console.log(`  ${mdPath}`);
    console.log(`  ${imageAbsPath(slug)}`);
  } catch (err) {
    await row.update({ status: "error", error: String(err.message || err) });
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
