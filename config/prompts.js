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

// Static Host My Nest pages the article can link to. Keep anchors short and descriptive.
export const SITE_PAGES = [
  { url: "/services/airbnb-management",           topic: "Airbnb management services" },
  { url: "/services/property-management",         topic: "Property management services" },
  { url: "/services/short-term-rental-management", topic: "Short-term rental management" },
  { url: "/services/personalised-welcome-packs",  topic: "Personalised welcome packs" },
  { url: "/services/interior-design-and-furnishing", topic: "Interior design and furnishing" },
  { url: "/services/photography",                 topic: "Professional property photography" },
  { url: "/services/guest-vetting",               topic: "Guest vetting and screening" },
  { url: "/services/guest-communication",         topic: "24/7 guest communication" },
  { url: "/services/price-optimisation",          topic: "Dynamic pricing and revenue optimisation" },
  { url: "/services",                             topic: "All Host My Nest services" },
  { url: "/locations",                            topic: "London areas we cover" },
  { url: "/earnings-estimator",                   topic: "Free short-term rental income estimator" },
  { url: "/faqs",                                 topic: "Frequently asked questions" },
  { url: "/about-us",                             topic: "About Host My Nest" },
  { url: "/contact",                              topic: "Contact Host My Nest" }
];

export const ARTICLE_SYSTEM =
  "You are an expert SEO copywriter for Host My Nest, a short-term rental and property management company in London. " +
  "Write in clear British English. Use H2 (##) for main sections and H3 (###) for subsections, short paragraphs, " +
  "and weave in contextually relevant internal links to related Host My Nest pages and articles from the supplied list. " +
  "Output ONLY the markdown article body — no frontmatter, no H1, no preamble.";

export const articleUser = ({ title, keyword, category, internalLinks = [] }) => {
  const articleLinks = internalLinks.map((l) => ({ url: `/blog/${l.slug}`, topic: l.title }));
  const allLinks = [...SITE_PAGES, ...articleLinks];

  const linkBlock = `\n\nInternal links available — pick 3–6 of the most topically relevant ones and place them in The Bottom Line section as natural inline markdown links, e.g. [anchor text](${allLinks[0].url}). Rules: only link when it genuinely helps the reader, use varied anchor text (never the bare URL), never link the same URL twice, keep the intro and body sections link-free so all internal links land in The Bottom Line.
${allLinks.map((l) => `- ${l.url} — ${l.topic}`).join("\n")}`;

  return `Write a 1,500–2,200 word SEO article.
Title: ${title}
Primary keyword: ${keyword}
Category: ${category}
Structure: short intro, 5–7 H2 sections with H3 subsections where appropriate, closing section called '## The Bottom Line'.
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

export const CTA_SYSTEM = "You select relevant call-to-action banners for blog articles.";
export const ctaUser = (title, keyword) =>
  `Pick the relevant CTA banners for an article titled "${title}" about "${keyword}".
Available banners:
- get-my-free-income-projection (for content about earnings, ROI, investment)
- book-a-call (for content about services, management, getting started)
- whatsapp-message (for quick questions, general enquiries)
Select one or more. Output ONLY the banner IDs, one per line, nothing else.`;

export const imagePrompt = (title) =>
  `Editorial interior photograph of a luxury Airbnb or short-term rental property, relevant to "${title}". ` +
  `Pick one interior setting from a varied mix of high-end rental property types: a penthouse living room ` +
  `with skyline views, a warehouse-conversion loft with exposed brick and steel beams, a Georgian townhouse ` +
  `drawing room with period features, a contemporary mews house kitchen-diner, a serviced apartment lounge ` +
  `with designer furniture, a boutique studio flat in a restored period building, a country cottage sitting ` +
  `room with beamed ceilings, or a modern riverside apartment with floor-to-ceiling windows. Bright natural ` +
  `light, tasteful high-end decor, styled for guests, lifestyle magazine quality, photorealistic. The image ` +
  `must contain no text, signage, watermarks, or logos of any kind.`;
