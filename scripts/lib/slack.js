// Slack Incoming Webhook notifier. No-ops if SLACK_WEBHOOK_URL is unset.
export async function notifySlack(text, blocks) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, ...(blocks ? { blocks } : {}) })
    });
    if (!res.ok) console.warn(`Slack webhook ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.warn(`Slack notify failed: ${err.message || err}`);
  }
}

export async function notifyPublished({ title, slug, category, prUrl }) {
  const isUrl = prUrl && /^https?:\/\//.test(prUrl);
  const linkLine = isUrl ? `<${prUrl}|View PR>` : `_${prUrl}_`;
  const text = `✅ Published: ${title}`;
  await notifySlack(text, [
    { type: "section", text: { type: "mrkdwn", text: `*✅ Published:* ${title}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Slug:*\n${slug}` },
        { type: "mrkdwn", text: `*Category:*\n${category || "—"}` }
      ]
    },
    { type: "section", text: { type: "mrkdwn", text: linkLine } }
  ]);
}

export async function notifyDiscovered({ count, total, top = [], reviewUrl }) {
  const reviewBlock = reviewUrl
    ? [{ type: "section", text: { type: "mrkdwn", text: `<${reviewUrl}|Review in Google Sheets →>` } }]
    : [];
  if (!count) {
    await notifySlack("🔍 Discover: no new ideas this run.", [
      { type: "section", text: { type: "mrkdwn", text: "*🔍 Discover:* no new ideas this run." } },
      ...reviewBlock
    ]);
    return;
  }
  const topList = top
    .slice(0, 5)
    .map((i) => `• ${i.keyword} _(${i.source}, score ${i.final_score})_`)
    .join("\n");
  await notifySlack(`🔍 Discover: ${count} new ideas`, [
    { type: "section", text: { type: "mrkdwn", text: `*🔍 Discover:* ${count} new ideas added (from ${total} unique).` } },
    ...(topList ? [{ type: "section", text: { type: "mrkdwn", text: `*Top picks:*\n${topList}` } }] : []),
    ...reviewBlock
  ]);
}

export async function notifyFailed({ title, error }) {
  const text = `❌ Publish failed: ${title || "(no title)"}`;
  await notifySlack(text, [
    { type: "section", text: { type: "mrkdwn", text: `*❌ Publish failed:* ${title || "(no title)"}` } },
    { type: "section", text: { type: "mrkdwn", text: `\`\`\`${String(error).slice(0, 500)}\`\`\`` } }
  ]);
}
