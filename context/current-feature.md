# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirements  -->



## Notes
<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-13 — CTA Banners + Sitemap-Based Internal Linking** (branch: `cta-banners-sitemap-linking`). Forced all three CTA banners on every article (removed the per-article Claude selection call). Replaced the static `SITE_PAGES` list and sheet-based published-articles source with sitemap-derived internal links pulled from `sitemap-core.xml`, `sitemap-blog.xml`, and `sitemap-locations.xml`. New `scripts/lib/sitemap.js` + tests; ~86 live link candidates per publish run.
