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
  "and weave in contextually relevant internal links to related Host My Nest pages and articles from the supplied list. " +
  "Output ONLY the markdown article body — no frontmatter, no H1, no preamble.";

export const articleUser = ({ title, keyword, category, internalLinks = [] }) => {
  const linkBlock = internalLinks.length
    ? `\n\nInternal links available — pick 5–8 of the most topically relevant ones and weave them naturally throughout the article as inline markdown links, e.g. [anchor text](${internalLinks[0].url}). Rules: place links contextually where they genuinely help the reader (body H2/H3 sections and The Bottom Line are all fair game); keep the intro link-free for punch; use varied, descriptive anchor text (never the bare URL); never link the same URL twice; aim for at least 2–3 links inside the body sections before The Bottom Line so link equity is distributed, not clustered.
${internalLinks.map((l) => `- ${l.url} — ${l.topic}`).join("\n")}`
    : "";

  return `Write a 1,500–2,200 word SEO article.
Title: ${title}
Primary keyword: ${keyword}
Category: ${category}
Structure: short intro, 5–7 H2 sections with H3 subsections where appropriate, a '## Frequently Asked Questions' section with 4–6 H3 questions (each answered in 2–4 concise sentences — questions should reflect genuine things readers would ask about this topic and include long-tail keyword variations), closing section called '## The Bottom Line'.
In The Bottom Line section, summarise the key takeaways and mention how Host My Nest can help readers with their short-term rental needs — whether it's property management, compliance, pricing optimisation, or guest management. Keep it natural, not salesy.${linkBlock}`;
};

export const EXCERPT_SYSTEM = "You write concise SEO meta descriptions.";
export const excerptUser = (title) =>
  `Write a single-line meta description (max 140 chars, no quotes) for an article titled: ${title}`;

export const TITLE_SYSTEM = "You turn keywords into SEO-friendly blog titles.";
export const titleUser = (keyword) =>
  `Turn this topic into one SEO-friendly blog title (max 65 chars, British English, no clickbait): ${keyword}`;

export const SEO_TITLE_SYSTEM = "You write SEO page titles for blog articles.";
export const seoTitleUser = (title) =>
  `Write a single SEO page title (max 60 chars, include primary keyword, no brand suffix) for: ${title}. Output ONLY the title, nothing else.`;

export const SEO_DESC_SYSTEM = "You write SEO meta descriptions for blog articles.";
export const seoDescUser = (title) =>
  `Write a single-line SEO meta description (max 155 chars, no quotes, include a call to action) for an article titled: ${title}. The brand is Host My Nest. Output ONLY the description, nothing else.`;

export const CATEGORY_SYSTEM = "You categorise blog articles about short-term rentals and property management.";
export const categoryUser = (title, keyword) =>
  `Pick the single best category for an article titled "${title}" about "${keyword}".
Available categories: ${CATEGORIES.join(", ")}
Output ONLY the category name, nothing else.`;

export const imagePrompt = (title) =>
  `Editorial photograph for a blog article titled "${title}". The scene must visually echo the specific subject of that title ` +
  `while staying clearly within the world of short-term rentals, Airbnb hosting, and property management in the UK. ` +
  `Read the title and choose the most fitting concrete subject — for example: if it's about pricing or revenue, a host ` +
  `at a laptop reviewing a booking calendar with a styled rental visible behind them; if it's about cleaning or turnovers, ` +
  `a freshly made bed or spotless kitchen mid-changeover with linens and toiletries laid out; if it's about compliance, ` +
  `regulation, or licensing, paperwork, keys and a front door of a London property; if it's about guest experience or welcome ` +
  `packs, a thoughtfully arranged welcome tray, fresh flowers, and a handwritten note on a kitchen island; if it's about ` +
  `investment or buy-to-let, exterior of a London townhouse or new-build apartment block with a 'to let' or sold context; ` +
  `if it's about a specific London area or neighbourhood, a recognisable street or skyline of that area with residential ` +
  `properties; if it's about interior styling or transformations, a tastefully staged living room or bedroom mid-styling. ` +
  `If the title is more general, default to a bright, well-styled interior of a London short-term rental. Bright natural ` +
  `light, tasteful decor, lifestyle magazine quality, photorealistic, shallow depth of field where appropriate. The image ` +
  `must contain no text, signage, watermarks, or logos of any kind.`;
