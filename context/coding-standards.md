# Coding standards

Conventions in use across this repo. Match the existing style — don't introduce new patterns without a reason.

## Language & runtime

- **Node ≥ 20**, ES modules only. `package.json` has `"type": "module"`; every file uses `import` / `export`.
- **No TypeScript.** No build step. No bundler. Scripts run directly with `node`.
- **No frameworks.** Plain `fetch`, plain functions, plain objects.
- **JSON imports** use import assertions: `import seeds from "../config/seeds.json" with { type: "json" };`
- **`.js` extension** is required on relative imports (ESM rule). Always include it.
- **Node built-ins** are imported with the `node:` prefix: `import fs from "node:fs/promises"`.

## Module shape

- Each `scripts/*.js` entry point starts with `#!/usr/bin/env node` and a one-line top comment describing what the job does.
- Entry points define an `async function main()` and end with:
  ```js
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  ```
  `publish.js` and `discover.js` extend this to also call `notifyFailed(...)` from Slack before exiting.
- Library modules under `scripts/lib/` export named functions (`export function`, `export const`, `export async function`). No default exports.
- Lib modules are dependency-free of each other where possible — the only cross-lib import is `store.js`, which picks a backend.

## Storage abstraction

- Anything that reads or writes Ideas/Articles goes through [scripts/lib/store.js](scripts/lib/store.js). Don't reach into `sheet.js` or `queue.js` directly from a script.
- Both backends expose the same surface: `getRows(name)`, `appendRows(name, records)`, `tabUrl(name)`, plus a row object with `.get(key)`, `.toJSON()`, `.update(partial)`. New storage features must land on both backends.
- Column names live in [config/schema.js](config/schema.js). When adding a field, update the schema first, then both backends (Sheets requires a header column with the matching name; the JSON backend is freeform).

## Prompts & LLM calls

- **All Claude prompt text lives in [config/prompts.js](config/prompts.js).** Never inline prompt strings in scripts or lib modules — tune copy in `prompts.js`.
- The convention is a `*_SYSTEM` constant + a `*User(...)` builder function per task (e.g. `ARTICLE_SYSTEM` + `articleUser({...})`).
- Claude calls go through the shared `call(...)` helper in [scripts/lib/claude.js](scripts/lib/claude.js). To add a new generation, export a thin wrapper there — don't `fetch` the Anthropic API from elsewhere.
- Model name is pinned in one place: `const MODEL = "claude-opus-4-6"` in `claude.js`.
- LLM outputs that must match a fixed set (categories, CTA banners) are **validated against an allowlist after the call** with a deterministic fallback. Never trust the model to stay inside its set.

## API calls

- Use the global `fetch` (Node ≥ 18). No `axios`, no `node-fetch`.
- Always check `res.ok` and throw with `${status}: ${await res.text()}` (or the parsed `.message`). See `claude.js`, `images.js`, `github.js` for the pattern.
- RSS/XML responses are parsed with `fast-xml-parser`. Use a module-scoped `XMLParser` instance.
- Defensive shape handling for feeds: items may be a single object or an array — normalise with `Array.isArray(x) ? x : [x]`.

## Error handling

- Fail loud at entry points (let errors bubble to `main().catch`).
- Inside libs, throw `Error` with a useful message that includes the upstream status/code where applicable.
- Slack notifications are best-effort: `slack.js` wraps errors in `try/catch` and only `console.warn`s — they must never crash the pipeline.
- The publish flow marks a row `status: "error"` with the message before re-throwing, so the queue self-heals on retry.

## Concurrency

- Use `Promise.all` for independent work. `publish.js` fans out six Claude calls in parallel; `discover.js` fans out per-seed RSS fetches.
- Never parallelise calls that mutate the same Sheets row — the `google-spreadsheet` row cache is not concurrency-safe across saves.

## Naming & formatting

- `camelCase` for variables and functions, `PascalCase` for classes (`RowProxy`, `Row`), `SCREAMING_SNAKE_CASE` for module-level constants and prompt names (`ARTICLE_SYSTEM`, `CATEGORIES`).
- Slugs are lowercase, hyphen-separated, produced only via `slugify(...)` from [scripts/lib/util.js](scripts/lib/util.js).
- Dates use `today()` (ISO `YYYY-MM-DD`) — never `Date.now()` or locale strings in the data layer.
- 2-space indent, double-quoted strings, semicolons on. Match the surrounding file if in doubt.

## Comments

- Default to none. The codebase uses brief top-of-file comments to describe a script's purpose (e.g. `// Weekly discovery job: RSS + Trends + Suggest → Ideas tab.`) and short inline comments only where intent is non-obvious.
- Don't restate what the code does. Don't add JSDoc blocks — there's no type system to feed.

## Content rules (baked into prompts & frontmatter)

- **British English** in every generated word.
- Article body uses `##` for sections, `###` for subsections, no `#` H1 (the H1 is rendered from frontmatter `title`).
- Intro stays link-free; internal links sit in body H2/H3 sections and The Bottom Line.
- Every article ends with `## Frequently Asked Questions` (4–6 H3 questions) then `## The Bottom Line`.
- Frontmatter strings are wrapped with `yamlQuote(...)` in [util.js](scripts/lib/util.js) — single-quoted, internal `'` doubled to `''`. Don't hand-format YAML strings.
- Category must match `CATEGORIES`; CTA banners must match `CTA_BANNERS` (both in `config/prompts.js`).
- Cover images: `1200×630` WebP at quality 80, written by `sharp` in `images.js`.

## Discovery sources

- Each source lives in its own file under [scripts/lib/sources/](scripts/lib/sources/) and exports a single `fetch*` function that returns `{ source, keyword, trend_score, reddit_score }[]`.
- Source name should be the snake_case identifier used downstream (`"reddit"`, `"google_trends"`, `"google_suggest"`, `"google_news"`, `"bing_suggest"`).
- Geo-locked sources (News, Bing, Trends) read `seeds.trendsGeo` (default `GB`).
- The relevance filter `isRelevant(keyword)` in `util.js` gates every source uniformly — change the `TOPIC_TOKENS` / `BLOCK_TOKENS` lists there, not in individual sources.
- New sources must return an empty array on non-OK responses; never throw from a fetcher.

## Testing

- `yarn test` runs `node --test tests/`. Pure-function helpers in `util.js` are the priority — keep `slugify`, `scoreIdea`, `dedupeByKeyword`, `buildFrontmatter` covered when changed.
- Use `node:test` + `node:assert/strict`. No Jest, no Mocha.
- Don't write tests that hit live APIs (Anthropic, Gemini, GitHub, Sheets). Keep IO-bound code out of the assertion path.

## Secrets & config

- Secrets only via environment variables. Never commit `.env`. Local runs use `node --env-file=.env` via the `dev:*` scripts.
- Tunables (seed keywords, subreddits, personas, default category, author bio) live in [config/seeds.json](config/seeds.json). Edit JSON, not code.
- Static link inventory (`SITE_PAGES`), enums (`CATEGORIES`, `CTA_BANNERS`), and prompt text all live in [config/prompts.js](config/prompts.js).

## Git & CI

- CI workflows in [.github/workflows/](.github/workflows/) all follow the same shape: `yarn install --frozen-lockfile` then `yarn run <script>`, with secrets passed through `env:`.
- The publish workflow needs `contents:write` and `pull-requests:write` on the **blog repo's** token, not this repo's.
- Don't add lockfile changes in PRs that aren't dependency-related.
