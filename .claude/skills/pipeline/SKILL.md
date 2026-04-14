---
name: pipeline
description: Run the full SEO pipeline (discover, promote, publish) or a specific stage
disable-model-invocation: true
argument-hint: "[stage: discover|promote|publish|all]"
allowed-tools: Bash(node *)
---

Run the SEO content pipeline. The user can specify a stage or run all three in order.

## Stages

1. **discover** — fetch keyword ideas from Reddit, Google Trends, and Google Suggest
2. **promote** — generate titles for approved ideas and move them to the Articles queue
3. **publish** — generate article + cover image + commit to blog repo

## Instructions

- If `$ARGUMENTS` is empty or `all`, run all three stages in order: discover → promote → publish
- If `$ARGUMENTS` is a specific stage name, run only that stage
- Before running, confirm the required env vars are set (ANTHROPIC_API_KEY, OPENAI_API_KEY for publish)
- Show the output of each stage clearly
- If any stage fails, stop and report the error — do not continue to the next stage

## Commands

```bash
node scripts/discover.js   # Stage 1
node scripts/promote.js    # Stage 2
node scripts/publish.js    # Stage 3
```
