#!/usr/bin/env node
// Publishing job: pick next `ready` row → Claude Opus 4.6 → image → commit to blog repo.
import {
  generateArticle, generateExcerpt, generateSeoTitle,
  generateSeoDescription, generateCategory, generateCtaBanners
} from "./lib/claude.js";
import { generateCoverImage } from "./lib/images.js";
import {
  writeArticle, imageAbsPath, imageRelUrl, articleRelPath, publishMode
} from "./lib/github.js";
import { getRows, storeName } from "./lib/store.js";
import { notifyPublished, notifyFailed } from "./lib/slack.js";
import { slugify, today, buildFrontmatter } from "./lib/util.js";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
  if (!process.env.GEMINI_API_KEY)    throw new Error("Missing GEMINI_API_KEY");

  console.log(`Backend: ${storeName} | Publish: ${publishMode}`);
  const rows = await getRows("Articles");
  const row = rows.find((r) => (r.get("status") || "").trim() === "ready");
  if (!row) {
    console.log("No items with status=ready.");
    return;
  }

  // Debug: log raw row data to diagnose missing fields
  console.log("Raw row data:", JSON.stringify(row.toJSON()));

  const item = {
    title:       row.get("title"),
    keyword:     row.get("keyword"),
    category:    row.get("category"),
    slug:        row.get("slug"),
    articleDate: row.get("articleDate")
  };

  if (!item.title || !item.keyword) {
    throw new Error(`Row missing required fields — title: "${item.title}", keyword: "${item.keyword}"`);
  }

  console.log(`Publishing: ${item.title}`);

  const slug = item.slug || slugify(item.title);
  const articleDate = item.articleDate || today();

  const internalLinks = rows
    .filter((r) => (r.get("status") || "").trim() === "published" && r.get("slug") && r.get("title"))
    .filter((r) => r.get("slug") !== slug)
    .map((r) => ({ title: r.get("title"), slug: r.get("slug") }))
    .slice(-25);

  try {
    await row.update({ status: "generating" });

    console.log(`  Generating content… (${internalLinks.length} internal links available)`);
    const [body, excerpt, category, seoTitle, seoDescription, ctaBanners] = await Promise.all([
      generateArticle({ ...item, internalLinks }),
      generateExcerpt(item.title),
      generateCategory(item.title, item.keyword),
      generateSeoTitle(item.title),
      generateSeoDescription(item.title),
      generateCtaBanners(item.title, item.keyword)
    ]);

    console.log(`  Category: ${category}`);
    console.log(`  CTA banners: ${ctaBanners.join(", ")}`);

    console.log("  Generating cover image…");
    await generateCoverImage(item.title, imageAbsPath(slug));

    const markdown =
      buildFrontmatter({
        title: item.title,
        slug,
        excerpt,
        cover: imageRelUrl(slug),
        category,
        articleDate,
        seoTitle,
        seoDescription,
        ctaBanners
      }) + "\n" + body + "\n";

    const mdPath = await writeArticle(slug, markdown);

    await row.update({
      status: "published",
      slug,
      category,
      excerpt,
      cover: imageRelUrl(slug),
      markdown_path: articleRelPath(slug),
      publishedAt: today()
    });

    console.log(`✓ Published ${slug}`);
    console.log(`  ${mdPath}`);

    await notifyPublished({ title: item.title, slug, category, prUrl: mdPath });
  } catch (err) {
    await row.update({ status: "error", error: String(err.message || err) });
    await notifyFailed({ title: item.title, error: err.message || err });
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
