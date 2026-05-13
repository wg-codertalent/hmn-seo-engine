# SEO Engine — Project Overview

Zero-API SEO content engine for the **Host My Nest** blog (London short-term rental & property management). Discovers keywords, promotes the good ones, and publishes ~3 markdown articles per month — written by **Claude Opus 4.6**, illustrated by **Gemini 3 Pro Image**, and delivered as PRs against a separate blog repo.

## What it does

Three independent stages, each a single Node script, scheduled via GitHub Actions:

| Stage | Script | Schedule | Purpose |
|---|---|---|---|
| **Discover** | [scripts/discover.js](scripts/discover.js) | Weekly (Mon 08:00 UTC) | Pull keyword ideas from Reddit RSS, Google Trends, Google Suggest, Google News, Bing Suggest → relevance-filter → score → dedupe → write to `Ideas` |
| **Promote** | [scripts/promote.js](scripts/promote.js) | Hourly | Take `approved` ideas, generate an SEO title via Claude, push to `Articles` queue as `ready` |
| **Publish** | [scripts/publish.js](scripts/publish.js) | 1st / 11th / 21st of each month (09:00 UTC) | Pick next `ready` article → generate body, excerpt, category, CTAs, SEO meta + cover image → open PR on blog repo → notify Slack |

The pipeline is documented visually in [pipeline-flow.png](pipeline-flow.png).

## Tech stack

- **Runtime:** Node ≥ 20, ES modules (`"type": "module"` in [package.json](package.json)), no TypeScript, no bundler
- **LLM:** Claude Opus 4.6 via raw `fetch` to `https://api.anthropic.com/v1/messages` ([scripts/lib/claude.js](scripts/lib/claude.js)) — no SDK
- **Images:** Gemini 3 Pro Image (`gemini-3.1-flash-image-preview`), 16:9 aspect, re-encoded to WebP at 1200×630 via `sharp` ([scripts/lib/images.js](scripts/lib/images.js))
- **Storage:** Pluggable — Google Sheets (`google-spreadsheet` + `google-auth-library`) is primary; JSON files under `data/` are the zero-config fallback. Selected at runtime in [scripts/lib/store.js](scripts/lib/store.js)
- **Delivery:** GitHub REST API — creates branch `cms/articles/<slug>`, single commit with markdown + image blobs, opens PR, labels it `netlify-cms/pending_review` for the Decap CMS editorial workflow ([scripts/lib/github.js](scripts/lib/github.js)). Falls back to local disk if `BLOG_REPO_*` env vars are unset
- **Notifications:** Slack Incoming Webhook ([scripts/lib/slack.js](scripts/lib/slack.js)) — no-ops if `SLACK_WEBHOOK_URL` is unset
- **XML/RSS:** `fast-xml-parser`
- **Tests:** Node's built-in `node:test` runner — pure-function coverage only ([tests/util.test.js](tests/util.test.js))

## Repository layout

```
seo-engine/
├── scripts/
│   ├── discover.js        stage 1 entry
│   ├── promote.js         stage 2 entry
│   ├── publish.js         stage 3 entry
│   └── lib/
│       ├── claude.js      Anthropic Messages API wrapper
│       ├── images.js      Gemini cover image generation + sharp re-encode
│       ├── github.js      Blog-repo PR creation (or local disk fallback)
│       ├── slack.js       Webhook notifier
│       ├── store.js       Backend selector (Sheets vs JSON)
│       ├── sheet.js       Google Sheets backend
│       ├── queue.js       JSON fallback backend
│       ├── util.js        slugify, scoreIdea, dedupeByKeyword, isRelevant, buildFrontmatter
│       └── sources/       reddit · trends · suggest · news · bing
├── config/
│   ├── seeds.json         Subreddits, seed keywords, personas, author bio
│   ├── prompts.js         All Claude prompt text (system + user templates) + CATEGORIES + CTA_BANNERS + SITE_PAGES
│   └── schema.js          Canonical column names + status enums for Ideas & Articles
├── data/                  JSON fallback store (content-ideas.json, content-queue.json)
├── tests/                 node:test unit tests
└── .github/workflows/     discover.yml · promote.yml · publish.yml
```

## Data model

Two logical tables — same shape whether backed by Sheets or JSON. Columns defined in [config/schema.js](config/schema.js).

**Ideas** — flow: `new` → `approved` → `queued` (or `rejected`)
Columns: `id, source, keyword, category, trend_score, reddit_score, final_score, discovered_at, status`

**Articles** — flow: `ready` → `generating` → `published` (or `error`)
Columns: `id, title, keyword, category, slug, status, articleDate, excerpt, cover, markdown_path, notes, publishedAt, error`

Scoring: `final_score = round(trend_score × 0.6 + min(reddit_score, 500) × 0.4)` ([util.js:8-10](scripts/lib/util.js#L8-L10)).

## Target audience

Content is written for three buyer personas defined in [config/seeds.json](config/seeds.json):

1. **Accidental Landlord Alan** (45–55, 1–2 properties) — reassurance, compliance, Renters Reform Bill anxiety
2. **Modern Landlord Maya** (30–45, tech-savvy new investor) — data, tools, calculators, regulations in emerging London zones
3. **Investment Isaac** (55–70, prime-Central portfolio) — yield optimisation, premium positioning, commission transparency

Each persona contributes a list of seed keywords that gets unioned with the general seeds before discovery runs.

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | promote, publish | Claude Opus 4.6 |
| `GEMINI_API_KEY` | publish | Cover images |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | optional | Enables Sheets backend (full JSON blob) |
| `GOOGLE_SHEET_ID` | optional | Spreadsheet ID — required alongside the service account |
| `SLACK_WEBHOOK_URL` | optional | Enables Slack notifications |
| `BLOG_REPO_OWNER` / `BLOG_REPO_NAME` / `BLOG_REPO_TOKEN` | CI | Enables GitHub API publishing (PAT needs `contents:write` + `pull-requests:write`) |
| `BLOG_REPO_BRANCH` | optional | Defaults to `main` |
| `ARTICLES_DIR` | optional | Default `content/articles` |
| `IMAGES_DIR` | optional | Default `public/images/uploads` |
| `BLOG_REPO_ROOT` | optional | Used by the local-disk writer when remote vars are unset |

## Running

```bash
yarn install
yarn dev:discover   # loads .env via node --env-file
yarn dev:promote
yarn dev:pub
yarn test           # node:test on tests/
```

The bare `discover` / `promote` / `pub` scripts skip `.env` loading — GitHub Actions injects secrets through `env:` directly.

## Content defaults

- **Length:** 1,500–2,200 words
- **Structure:** short intro (link-free) → 5–7 `##` H2 sections with optional `###` H3 → `## Frequently Asked Questions` (4–6 H3 Qs, 2–4 sentence answers) → `## The Bottom Line` (key takeaways + soft Host My Nest mention)
- **Internal links:** 5–8 per article, woven through body H2/H3 and The Bottom Line, never in the intro, varied descriptive anchor text, no duplicate URLs. Sourced from `SITE_PAGES` in [config/prompts.js](config/prompts.js) + the last 25 published article slugs
- **Category:** one of the fixed set in `CATEGORIES` (`Hosting Tips`, `Investment Insights`, `Legal & Compliance`, `Property Management`, `Revenue & Pricing Strategy`, `Transformations`); falls back to `Property Management`
- **CTA banners:** subset of `CTA_BANNERS` (`get-my-free-income-projection`, `book-a-call`, `whatsapp-message`); falls back to all three
- **Cover image:** `/images/uploads/<slug>.webp`, 1200×630, photorealistic editorial styled to the title's concrete subject (no text, letters, or watermarks)
- **Tone:** British English throughout
- **Frontmatter:** `layout: article`, `published: true`, single-quoted YAML strings with `''` escaping, author block from `seeds.json`
