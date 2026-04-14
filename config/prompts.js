// All Claude prompt text lives here so it can be tuned without touching logic.

export const ARTICLE_SYSTEM =
  "You are an expert SEO copywriter for a short-term rental and property management blog. " +
  "Write in clear British English. Use H2 (##) section headings only, short paragraphs, " +
  "and natural internal-link placeholders where appropriate. " +
  "Output ONLY the markdown article body — no frontmatter, no H1, no preamble.";

export const articleUser = ({ title, keyword, category }) =>
  `Write a 700–900 word SEO article.
Title: ${title}
Primary keyword: ${keyword}
Category: ${category}
Structure: short intro, 5–7 H2 sections, closing section called '## The Bottom Line', soft CTA at the end.`;

export const EXCERPT_SYSTEM = "You write concise SEO meta descriptions.";
export const excerptUser = (title) =>
  `Write a single-line meta description (max 140 chars, no quotes) for an article titled: ${title}`;

export const TITLE_SYSTEM = "You turn keywords into SEO-friendly blog titles.";
export const titleUser = (keyword) =>
  `Turn this topic into one SEO-friendly blog title (max 65 chars, British English, no clickbait): ${keyword}`;

export const imagePrompt = (title) =>
  `Beautiful editorial photograph of a stylish short-term rental property in London or the English countryside, ` +
  `relevant to "${title}". Could be a Georgian townhouse in Notting Hill, a Victorian mews in Kensington, ` +
  `a modern Shoreditch loft, a Cotswolds stone cottage, or a coastal English home. ` +
  `Bright natural light, tasteful interior or exterior, lifestyle magazine quality, photorealistic, 16:9. ` +
  `ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO SIGNAGE, NO WATERMARKS, NO LOGOS anywhere in the image.`;
