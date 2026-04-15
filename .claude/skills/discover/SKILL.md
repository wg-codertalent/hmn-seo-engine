---
name: discover
description: Run keyword discovery from Reddit, Trends, and Google Suggest
disable-model-invocation: true
allowed-tools: Bash(node *)
---

Run the keyword discovery stage of the SEO pipeline. Pulls from Reddit, Google Trends, Google Suggest, Google News RSS, and Bing Suggest; filters via `isRelevant()`; Slack digest with Google Sheets review link.

```bash
node scripts/discover.js
```

After running, report:
- How many raw ideas were fetched vs passed the relevance filter
- How many new ideas were added (vs already existing)
- Any errors encountered
