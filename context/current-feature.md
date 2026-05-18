# Current Feature

Phase 1 — Prompt hardening to reduce factual errors in generated articles.

## Status

In Progress

## Goals

1. Soften the length requirement in `articleUser` — change "1,500–2,200 words" to "aim for 1,200–1,800 words; do not pad with invented specifics, statistics, or examples to hit a length".
2. Add a no-invented-specifics rule to `ARTICLE_SYSTEM` — forbid invented numbers, prices, percentages, dates, statistics, named regulations, council policies, tax figures, or quoted research. Hedge instead.
3. Rewrite the FAQ instruction — questions answerable generically without specifics; allow 3–5 sentence answers so there's room to qualify claims.
4. Create `config/facts.json` with grounded context (current year, HMN's real services, London areas covered, UK STR realities). Inject into the user prompt as a "Ground truth" block.
5. Tighten the internal-link rule — substantive factual or service claims should link to a relevant HMN page or be phrased generically. Links support claims, not just decorate.
6. Drop "expert" from the persona in `ARTICLE_SYSTEM`.

## Notes

- Phase 1 is prompt-side only. No new deps, no flow changes.
- Phase 2 (automated fact-checker with Claude web search, `awaiting_review` status, PR/Slack report) is out of scope and will follow separately.
- `config/facts.json` values must come from the user — do not invent HMN services or coverage areas.
- Files in scope: `config/prompts.js` (all six edits), `config/facts.json` (new).
- Acceptance: run `yarn pub` on three `ready` rows across different categories (Legal & Compliance, Revenue & Pricing, Hosting Tips) and confirm no invented UK figures, percentages, named regulations, or council policies; hedging present where specifics would have been invented.

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-13 — CTA Banners + Sitemap-Based Internal Linking** (branch: `cta-banners-sitemap-linking`). Forced all three CTA banners on every article (removed the per-article Claude selection call). Replaced the static `SITE_PAGES` list and sheet-based published-articles source with sitemap-derived internal links pulled from `sitemap-core.xml`, `sitemap-blog.xml`, and `sitemap-locations.xml`. New `scripts/lib/sitemap.js` + tests; ~86 live link candidates per publish run.
