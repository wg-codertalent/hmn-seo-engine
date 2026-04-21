import test from "node:test";
import assert from "node:assert/strict";
import { slugify, scoreIdea, dedupeByKeyword, buildFrontmatter } from "../scripts/lib/util.js";

test("slugify", () => {
  assert.equal(slugify("Hello World!"), "hello-world");
  assert.equal(slugify("  Airbnb 2025 —  Tips  "), "airbnb-2025-tips");
});

test("scoreIdea weights trend 60% / reddit 40%", () => {
  assert.equal(scoreIdea({ trend_score: 100, reddit_score: 0 }), 60);
  assert.equal(scoreIdea({ trend_score: 0, reddit_score: 100 }), 40);
  assert.equal(scoreIdea({ trend_score: 0, reddit_score: 1000 }), 200); // capped at 500
});

test("dedupeByKeyword keeps highest score and drops short keywords", () => {
  const out = dedupeByKeyword([
    { keyword: "airbnb london", trend_score: 10, reddit_score: 0 },
    { keyword: "Airbnb London", trend_score: 50, reddit_score: 0 },
    { keyword: "cat", trend_score: 99, reddit_score: 0 }
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].final_score, 30);
});

test("buildFrontmatter produces expected shape", () => {
  const fm = buildFrontmatter({
    title: "Test",
    slug: "test",
    excerpt: "An excerpt",
    cover: "/images/uploads/test.png",
    category: "Property Management",
    articleDate: "2026-04-07"
  });
  assert.match(fm, /^---\nlayout: article\n/);
  assert.match(fm, /title: 'Test'\n/);
  assert.match(fm, /published: true\n/);
  assert.match(fm, /author:\n {2}name: /);
});
