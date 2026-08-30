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
- **2026-05-18 — Phase 1 Prompt Hardening for Factual Accuracy** (branch: `prompt-hardening`). Hardened the article generation prompt in `config/prompts.js` to reduce factual hallucinations: softened length (1,500–2,200 → 1,200–1,800 with anti-padding clause), added a no-invented-specifics rule to `ARTICLE_SYSTEM` with explicit hedging guidance, rewrote FAQ rules (3–5 sentence answers, rephrase or hedge figure-dependent questions), tightened the internal-link rule so links support substantive claims rather than decorate, and dropped "expert" from the persona. New `config/facts.json` ships grounded context (current year, HMN services, coverage area, UK STR realities) which is injected into the user prompt as a "Ground truth" block. Prompt-side only — no flow or dependency changes. Phase 2 (automated fact-check pass with Claude web search) deferred.
