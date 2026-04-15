# seo-engine

Zero-API SEO content engine for the Endalai blog. Discovers topics, promotes the good ones, and publishes 3 markdown articles per month with cover images — all written by **Claude Opus 4.6**.

## What it does

Three scheduled jobs, each a single Node script:

| Job | Script | Schedule | Purpose |
|---|---|---|---|
| **Discover** | `scripts/discover.js` | Mondays 08:00 UTC | Pull topics from Reddit RSS, Google Trends, Google Suggest, Google News, Bing Suggest → filter for relevance → `Ideas` |
| **Promote** | `scripts/promote.js` | Hourly | Turn `approved` ideas into `ready` articles with Claude-generated titles |
| **Publish** | `scripts/publish.js` | 1st / 11th / 21st of each month at 09:00 UTC | Generate article + cover image, open a PR on the blog repo |

All three workflows live in `.github/workflows/` and run on GitHub Actions.

## Storage

Two interchangeable backends — the scripts don't care which one is active:

- **Google Sheets** (recommended) — set `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_SHEET_ID`. Sheet must have two tabs: `Ideas` and `Articles` with the columns listed in `config/schema.js`.
- **JSON fallback** — `data/content-ideas.json` and `data/content-queue.json`. Used automatically if no sheet credentials are set. Good for local dev and zero-config runs.

## Project layout

```
seo-engine/
├── scripts/
│   ├── discover.js        entry: weekly discovery
│   ├── promote.js         entry: hourly promotion
│   ├── publish.js         entry: 3x/month publishing
│   └── lib/
│       ├── claude.js      Anthropic wrapper (claude-opus-4-6)
│       ├── images.js      Gemini 3 Pro Image cover generation
│       ├── github.js      opens PRs on the blog repo via GitHub API
│       ├── slack.js       Slack webhook notifier (publish + discover)
│       ├── sheet.js       Google Sheets backend (incl. tabUrl helper)
│       ├── queue.js       JSON file backend
│       ├── store.js       picks backend at runtime
│       ├── util.js        slugify / scoring / relevance filter / frontmatter
│       └── sources/
│           ├── reddit.js
│           ├── trends.js
│           ├── suggest.js
│           ├── news.js    Google News RSS (per seed, UK-scoped)
│           └── bing.js    Bing Suggest (UK-scoped)
├── config/
│   ├── seeds.json         seed keywords, subreddits, author bio
│   ├── prompts.js         Claude prompt templates
│   └── schema.js          canonical column names
├── data/                  JSON fallback storage
├── tests/                 node:test unit tests for pure functions
└── .github/workflows/     three cron jobs
```

## Install

```bash
yarn install
cp .env.example .env      # fill in keys for local runs
```

Node 20+ required.

## Environment variables

| Name | Required? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude Opus 4.6 |
| `GEMINI_API_KEY` | yes (publish) | Cover images (Gemini 3 Pro Image / Nano Banana 2) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | no | Enables Sheets backend |
| `GOOGLE_SHEET_ID` | no | Spreadsheet ID |
| `SLACK_WEBHOOK_URL` | no | Enables Slack notifications (publish + discover) |
| `BLOG_REPO_OWNER` | yes (CI) | Blog repo owner for GitHub API publishing |
| `BLOG_REPO_NAME` | yes (CI) | Blog repo name |
| `BLOG_REPO_TOKEN` | yes (CI) | PAT with contents:write on the blog repo |
| `BLOG_REPO_BRANCH` | no | Default `main` |
| `ARTICLES_DIR` | no | Default `content/articles` |
| `IMAGES_DIR` | no | Default `public/images/uploads` |
| `BLOG_REPO_ROOT` | no | Local fallback — where to write when `BLOG_REPO_*` is unset |

## Running locally

```bash
yarn dev:discover   # pull fresh ideas (loads .env)
yarn dev:promote    # promote approved → ready
yarn dev:pub        # generate + write the next ready article
yarn test           # unit tests for util.js
```

The `dev:*` scripts load `.env` via `node --env-file`. The bare `discover` / `promote` / `pub` scripts skip `.env` loading and are used by GitHub Actions (which passes secrets through `env:`).

## Deployment mode

Standalone repo. When `BLOG_REPO_OWNER` / `BLOG_REPO_NAME` / `BLOG_REPO_TOKEN` are set, `publish.js` opens a PR on the target blog repo via the GitHub API (branch `cms/articles/<slug>`, labelled `netlify-cms/pending_review` for the Decap/Netlify CMS editorial workflow). Without those vars, it falls back to writing to local disk relative to `BLOG_REPO_ROOT`.

## GitHub secrets required

In repo Settings → Secrets → Actions:

- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (full JSON)
- `GOOGLE_SHEET_ID`
- `SLACK_WEBHOOK_URL`
- `BLOG_REPO_OWNER`, `BLOG_REPO_NAME`, `BLOG_REPO_TOKEN`, `BLOG_REPO_BRANCH`

## Content defaults

All generated articles match the structure of the sample article:

- `layout: article`, `published: true`
- 1,500–2,200 words, H2/H3 headings, closing `## The Bottom Line` section (this is where internal links live)
- Cover image path: `/images/uploads/{slug}.webp`
- British English tone
- Category must be one of the fixed set in `config/prompts.js` (`CATEGORIES`)
- CTA banners chosen by Claude from the fixed set in `config/prompts.js` (`CTA_BANNERS`)
- Images are photorealistic luxury STR property interiors (penthouses, warehouse lofts, Georgian townhouses, mews houses, serviced apartments, country cottages, riverside apartments) with no text, letters, or watermarks

## Extending

- **New discovery source** → add a file in `scripts/lib/sources/`, import it in `discover.js`.
- **New image provider** → swap `scripts/lib/images.js`.
- **New output** (newsletter, social post) → new entry script in `scripts/`, reuse lib modules.
- **Multi-site** → make `config/sites/<name>.json` and pass a `--site` flag.
