import {
  ARTICLE_SYSTEM, articleUser,
  EXCERPT_SYSTEM, excerptUser,
  TITLE_SYSTEM, titleUser,
  SEO_TITLE_SYSTEM, seoTitleUser,
  SEO_DESC_SYSTEM, seoDescUser,
  CATEGORY_SYSTEM, categoryUser,
  CTA_SYSTEM, ctaUser,
  CATEGORIES, CTA_BANNERS
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
  call({ system: ARTICLE_SYSTEM, user: articleUser(brief), maxTokens: 6000 });

export const generateExcerpt = (title) =>
  call({ system: EXCERPT_SYSTEM, user: excerptUser(title), maxTokens: 120 });

export const generateTitle = (keyword) =>
  call({ system: TITLE_SYSTEM, user: titleUser(keyword), maxTokens: 80 });

export const generateSeoTitle = (title) =>
  call({ system: SEO_TITLE_SYSTEM, user: seoTitleUser(title), maxTokens: 80 });

export const generateSeoDescription = (title) =>
  call({ system: SEO_DESC_SYSTEM, user: seoDescUser(title), maxTokens: 200 });

export async function generateCategory(title, keyword) {
  const raw = await call({ system: CATEGORY_SYSTEM, user: categoryUser(title, keyword), maxTokens: 40 });
  const match = CATEGORIES.find((c) => c.toLowerCase() === raw.toLowerCase().trim());
  return match || "Property Management";
}

export async function generateCtaBanners(title, keyword) {
  const raw = await call({ system: CTA_SYSTEM, user: ctaUser(title, keyword), maxTokens: 100 });
  const ids = raw.split("\n").map((l) => l.trim()).filter((l) => CTA_BANNERS.includes(l));
  return ids.length ? ids : CTA_BANNERS;
}
