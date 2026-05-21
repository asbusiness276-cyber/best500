import { articles } from "./articles";

export const staticPages = [
  { slug: "about", title: "About BestBuyUnder500" },
  { slug: "contact", title: "Contact BestBuyUnder500" },
  { slug: "write-for-us", title: "Write for Us" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-and-conditions", title: "Terms and Conditions" },
  { slug: "affiliate-disclosure", title: "Affiliate Disclosure" }
];

export const allRoutes = [
  "/",
  ...articles.map((article) => `/${article.slug}/`),
  ...staticPages.map((page) => `/${page.slug}/`)
];
