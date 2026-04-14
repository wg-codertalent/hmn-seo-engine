import {
  ARTICLE_SYSTEM, articleUser,
  EXCERPT_SYSTEM, excerptUser,
  TITLE_SYSTEM, titleUser
} from "../../config/prompts.js";

const MODEL = "claude-opus-4-6";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

async function call({ system, user, maxTokens = 2500 }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text.trim();
}

export const generateArticle = (brief) =>
  call({ system: ARTICLE_SYSTEM, user: articleUser(brief), maxTokens: 2500 });

export const generateExcerpt = (title) =>
  call({ system: EXCERPT_SYSTEM, user: excerptUser(title), maxTokens: 120 });

export const generateTitle = (keyword) =>
  call({ system: TITLE_SYSTEM, user: titleUser(keyword), maxTokens: 80 });
