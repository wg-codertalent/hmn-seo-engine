# seo-engine

Zero-API SEO content engine for the Endalai blog. Discovers topics, promotes the good ones, and publishes 3 markdown articles per month with cover images — all written by **Claude Opus 4.6**.

## What it does

Three scheduled jobs, each a single Node script:

| Job | Script | Schedule | Purpose |
|---|---|---|---|
| **Discover** | `scripts/discover.js` | Mondays 08:00 UTC | Pull topics from Reddit RSS, Google Trends RSS, Google Suggest → `Ideas` |
| **Promote** | `scripts/promote.js` | Hourly | Turn `approved` ideas into `ready` articles with Claude-generated titles |
| **Publish** | `scripts/publish.js` | 1st / 11th / 21st of each month at 09:00 UTC | Generate article + cover image, commit to blog repo |

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
│       ├── images.js      OpenAI gpt-image-1 cover generation
│       ├── github.js      writes markdown + image into the blog repo
│       ├── sheet.js       Google Sheets backend
│       ├── queue.js       JSON file backend
│       ├── store.js       picks backend at runtime
│       ├── util.js        slugify / scoring / frontmatter
│       └── sources/
│           ├── reddit.js
│           ├── trends.js
│           └── suggest.js
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
cd seo-engine
npm install
cp .env.example .env      # fill in keys for local runs
```

Node 20+ required.

## Environment variables

| Name | Required? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude Opus 4.6 |
| `OPENAI_API_KEY` | yes | Cover images (`gpt-image-1`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | no | Enables Sheets backend |
| `GOOGLE_SHEET_ID` | no | Spreadsheet ID |
| `ARTICLES_DIR` | no | Default `content/articles` |
| `IMAGES_DIR` | no | Default `public/images/uploads` |
| `CATEGORIES_DIR` | no | Default `content/categories` |
| `BLOG_REPO_ROOT` | no | Override blog repo path (defaults to parent directory) |

## Running locally

```bash
npm run discover    # pull fresh ideas
npm run promote     # promote approved → ready
npm run publish     # generate + write the next ready article
npm test            # unit tests for util.js
```

## Deployment mode

This repo is designed to sit **inside** the Endalai blog repo as `seo-engine/`. The publish workflow writes directly to `../content/articles/` and `../public/images/uploads/` and commits them back. To run it as a standalone repo targeting a different blog, set `BLOG_REPO_ROOT`.

## GitHub secrets required

In repo Settings → Secrets → Actions:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (full JSON, optional)
- `GOOGLE_SHEET_ID` (optional)

## Content defaults

All generated articles match the structure of the sample article:

- `layout: article`, `published: true`
- 700–900 words, H2 headings only, closing `## The Bottom Line` section
- Cover image path: `/images/uploads/{slug}.png`
- British English tone
- Category must exist in `/content/categories/`
- Images are photorealistic London / England property shots with no text, letters, or watermarks.

## Extending

- **New discovery source** → add a file in `scripts/lib/sources/`, import it in `discover.js`.
- **New image provider** → swap `scripts/lib/images.js`.
- **New output** (newsletter, social post) → new entry script in `scripts/`, reuse lib modules.
- **Multi-site** → make `config/sites/<name>.json` and pass a `--site` flag.
