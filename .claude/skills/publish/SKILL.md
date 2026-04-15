---
name: publish
description: Publish the next ready article with AI-generated content and cover image
disable-model-invocation: true
allowed-tools: Bash(node *)
---

Run the publishing stage of the SEO pipeline.

Requires `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` environment variables.

```bash
node scripts/publish.js
```

After running, report:
- Which article was published (title and slug)
- The markdown file path and image path
- Any errors encountered
