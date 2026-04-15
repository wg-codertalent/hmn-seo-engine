# SEO Engine

Zero-API SEO content engine for the Host My Nest blog. Discovers keywords, generates articles with Claude Opus 4.6, and publishes to a blog repo.

## Flow Diagram

![Pipeline Flow](pipeline-flow.png)

## Pipeline

Three stages, each a standalone Node script:

1. **Discover** (`yarn discover`) — pulls keyword ideas from Reddit RSS, Google Trends, and Google Suggest. Dedupes against existing ideas and appends new ones.
2. **Promote** (`yarn promote`) — takes ideas with `status: approved`, generates an SEO title via Claude, and adds them to the Articles sheet/queue as `ready`.
3. **Publish** (`yarn publish`) — picks the next `ready` article, generates body + excerpt (Claude) + cover image (OpenAI), writes markdown with frontmatter, and commits to the blog repo.

## Tech Stack

- Node >= 20, ES modules (`"type": "module"`)
- Claude Opus 4.6 via raw `fetch` to the Anthropic Messages API (`scripts/lib/claude.js`)
- Gemini 3 Pro Image (Nano Banana 2) for cover images (`scripts/lib/images.js`)
- Google Sheets as primary data store, JSON files as fallback (`scripts/lib/store.js`)
- No frameworks — plain scripts with shared libs under `scripts/lib/`

## Project Structure

```
config/
  seeds.json       # subreddits, seed keywords, geo, default category, author
  prompts.js       # all Claude prompt text (system + user templates)
  schema.js        # column definitions for Ideas and Articles tables
scripts/
  discover.js      # stage 1
  promote.js       # stage 2
  publish.js       # stage 3
  lib/
    claude.js      # Claude API wrapper (generateArticle, generateExcerpt, generateTitle)
    images.js      # OpenAI image generation
    github.js      # blog repo file writing + validation
    store.js       # storage adapter (Google Sheets or JSON fallback)
    sheet.js       # Google Sheets backend
    queue.js       # JSON file backend
    util.js        # slugify, today, scoreIdea, dedupeByKeyword, buildFrontmatter
    sources/
      reddit.js    # Reddit RSS scraper
      trends.js    # Google Trends RSS
      suggest.js   # Google Suggest autocomplete
data/
  content-ideas.json   # JSON fallback for Ideas
  content-queue.json   # JSON fallback for Articles
tests/
  util.test.js    # node --test
```

## Environment Variables

- `ANTHROPIC_API_KEY` — required for promote and publish stages
- `GEMINI_API_KEY` — required for publish stage (cover images via Gemini 3 Pro Image)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` + `GOOGLE_SHEET_ID` — optional, enables Google Sheets backend

## Data Model

**Ideas** statuses: `new` → `approved` → `queued` (or `rejected`)
**Articles** statuses: `ready` → `generating` → `published` (or `error`)

## Conventions

- British English in all generated content
- Prompts live in `config/prompts.js` — tune copy there, not in scripts
- All scoring: `final_score = trend_score * 0.6 + min(reddit_score, 500) * 0.4`
- Tests: `yarn test` (Node built-in test runner)

## Custom Skills

Slash commands available in Claude Code:

- `/pipeline [discover|promote|publish|all]` — run one or all pipeline stages
- `/discover` — run keyword discovery
- `/promote` — promote approved ideas
- `/publish` — publish next ready article
