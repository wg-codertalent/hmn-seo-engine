#!/usr/bin/env node
// Hourly promotion job: approved Ideas → Articles queue as `ready`.
import seeds from "../config/seeds.json" with { type: "json" };
import { generateTitle } from "./lib/claude.js";
import { getRows, appendRows, storeName } from "./lib/store.js";
import { today } from "./lib/util.js";

async function main() {
  console.log(`Backend: ${storeName}`);
  const ideas = await getRows("Ideas");
  const approved = ideas.filter((r) => (r.get("status") || "").trim() === "approved");
  if (!approved.length) {
    console.log("No approved ideas.");
    return;
  }

  const newArticles = [];
  for (const row of approved) {
    const keyword = row.get("keyword");
    console.log(`Promoting: ${keyword}`);
    const title = await generateTitle(keyword);
    newArticles.push({
      title,
      keyword,
      category: row.get("category") || seeds.defaultCategory,
      status: "ready",
      articleDate: today()
    });
    await row.update({ status: "queued" });
  }

  await appendRows("Articles", newArticles);
  console.log(`✓ Promoted ${newArticles.length} ideas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
