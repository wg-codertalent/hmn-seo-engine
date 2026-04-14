---
name: promote
description: Promote approved ideas to the Articles queue with generated titles
disable-model-invocation: true
allowed-tools: Bash(node *)
---

Run the promotion stage of the SEO pipeline.

```bash
node scripts/promote.js
```

After running, report:
- How many ideas were promoted
- The generated titles
- Any errors encountered
