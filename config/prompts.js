// All Claude prompt text lives here so it can be tuned without touching logic.

export const CATEGORIES = [
  "Hosting Tips",
  "Investment Insights",
  "Legal & Compliance",
  "Property Management",
  "Revenue & Pricing Strategy",
  "Transformations"
];

export const CTA_BANNERS = [
  "get-my-free-income-projection",
  "book-a-call",
  "whatsapp-message"
];

export const ARTICLE_SYSTEM =
  "You are an expert SEO copywriter for Host My Nest, a short-term rental and property management company in London. " +
  "Write in clear British English. Use H2 (##) for main sections and H3 (###) for subsections, short paragraphs, " +
  "and natural internal-link placeholders where appropriate. " +
  "Output ONLY the markdown article body — no frontmatter, no H1, no preamble.";

export const articleUser = ({ title, keyword, category }) =>
  `Write a 1,500–2,200 word SEO article.
Title: ${title}
Primary keyword: ${keyword}
Category: ${category}
Structure: short intro, 5–7 H2 sections with H3 subsections where appropriate, closing section called '## The Bottom Line'.
In The Bottom Line section, summarise the key takeaways and mention how Host My Nest can help readers with their short-term rental needs — whether it's property management, compliance, pricing optimisation, or guest management. Keep it natural, not salesy.`;

export const EXCERPT_SYSTEM = "You write concise SEO meta descriptions.";
export const excerptUser = (title) =>
  `Write a single-line meta description (max 140 chars, no quotes) for an article titled: ${title}`;

export const TITLE_SYSTEM = "You turn keywords into SEO-friendly blog titles.";
export const titleUser = (keyword) =>
  `Turn this topic into one SEO-friendly blog title (max 65 chars, British English, no clickbait): ${keyword}`;

export const SEO_TITLE_SYSTEM = "You write SEO page titles for blog articles.";
export const seoTitleUser = (title) =>
  `Write a single SEO page title (max 60 chars, include primary keyword, pipe-separated brand suffix) for: ${title}. Brand is Host My Nest. Output ONLY the title, nothing else.`;

export const SEO_DESC_SYSTEM = "You write SEO meta descriptions for blog articles.";
export const seoDescUser = (title) =>
  `Write a single-line SEO meta description (max 155 chars, no quotes, include a call to action) for an article titled: ${title}. The brand is Host My Nest. Output ONLY the description, nothing else.`;

export const CATEGORY_SYSTEM = "You categorise blog articles about short-term rentals and property management.";
export const categoryUser = (title, keyword) =>
  `Pick the single best category for an article titled "${title}" about "${keyword}".
Available categories: ${CATEGORIES.join(", ")}
Output ONLY the category name, nothing else.`;

export const CTA_SYSTEM = "You select relevant call-to-action banners for blog articles.";
export const ctaUser = (title, keyword) =>
  `Pick the relevant CTA banners for an article titled "${title}" about "${keyword}".
Available banners:
- get-my-free-income-projection (for content about earnings, ROI, investment)
- book-a-call (for content about services, management, getting started)
- whatsapp-message (for quick questions, general enquiries)
Select one or more. Output ONLY the banner IDs, one per line, nothing else.`;

export const imagePrompt = (title) =>
  `Beautiful editorial photograph of a stylish short-term rental property in London or the English countryside, ` +
  `relevant to "${title}". Could be a Georgian townhouse in Notting Hill, a Victorian mews in Kensington, ` +
  `a modern Shoreditch loft, a Chelsea apartment, or a Hampstead period home. ` +
  `Bright natural light, tasteful interior or exterior, lifestyle magazine quality, photorealistic, 16:9. ` +
  `ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO SIGNAGE, NO WATERMARKS, NO LOGOS anywhere in the image.`;
