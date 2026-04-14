---
name: discover
description: Run keyword discovery from Reddit, Trends, and Google Suggest
disable-model-invocation: true
allowed-tools: Bash(node *)
---

Run the keyword discovery stage of the SEO pipeline.

```bash
node scripts/discover.js
```

After running, report:
- How many unique ideas were found
- How many new ideas were added (vs already existing)
- Any errors encountered
