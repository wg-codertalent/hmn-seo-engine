import test from "node:test";
import assert from "node:assert/strict";
import { parseSitemap } from "../scripts/lib/sitemap.js";

test("parseSitemap extracts URL, derives topic from slug, and keeps lastmod", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.hostmynest.co.uk/services/airbnb-management</loc>
        <lastmod>2026-04-01</lastmod>
      </url>
      <url>
        <loc>https://www.hostmynest.co.uk/locations/clapham</loc>
      </url>
    </urlset>`;
  const links = parseSitemap(xml);
  assert.equal(links.length, 2);
  assert.deepEqual(links[0], {
    url: "/services/airbnb-management",
    topic: "Airbnb management",
    lastmod: "2026-04-01"
  });
  assert.deepEqual(links[1], {
    url: "/locations/clapham",
    topic: "Clapham",
    lastmod: ""
  });
});

test("parseSitemap handles a single <url> element (non-array)", () => {
  const xml = `<urlset><url><loc>https://www.hostmynest.co.uk/about-us</loc></url></urlset>`;
  const links = parseSitemap(xml);
  assert.equal(links.length, 1);
  assert.equal(links[0].url, "/about-us");
  assert.equal(links[0].topic, "About us");
});

test("parseSitemap strips trailing slash and skips malformed loc values", () => {
  const xml = `<urlset>
    <url><loc>https://www.hostmynest.co.uk/services/</loc></url>
    <url><loc>not-a-url</loc></url>
  </urlset>`;
  const links = parseSitemap(xml);
  assert.equal(links.length, 1);
  assert.equal(links[0].url, "/services");
});
