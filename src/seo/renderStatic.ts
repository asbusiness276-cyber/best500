import { affiliateDisclosure } from "../constants/affiliate";
import { SITE_NAME } from "../constants/site";
import { articles } from "../data/articles";
import { author } from "../data/author";
import { staticPages } from "../data/routes";
import { HOVER_CTAS } from "../components/PriceCtaButton";
import type { Article, Product } from "../types";
import { articleJsonLd, buildMetaTags, escapeHtml, metaForArticle, metaForHome, metaForStaticPage, websiteJsonLd } from "./meta";

function list(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function productCard(product: Product, index: number): string {
  return `<article>
    <h3>${index + 1}. ${escapeHtml(product.title)}</h3>
    <img src="${product.image}" alt="${escapeHtml(product.title)}" />
    <p>Price: $${product.price} | Rating: ${product.rating}/5</p>
    <p>${escapeHtml(product.highlightFeature || product.specs[0] || "Budget laptop pick")}</p>
    ${list(product.features)}
    <h4>Pros</h4>${list(product.pros)}
    <h4>Cons</h4>${list(product.cons)}
    <a href="${product.affiliateUrl}" rel="nofollow sponsored noopener noreferrer">Check price</a>
  </article>`;
}

export function renderHomeStatic(): string {
  return `<!doctype html><html lang="en"><head>${buildMetaTags(metaForHome())}
  <script type="application/ld+json">${JSON.stringify(websiteJsonLd())}</script></head><body>
  <main id="seo-static" class="seo-crawler-only">
    <h1>${SITE_NAME}</h1>
    <p>Clean, practical buying guides for shoppers comparing useful products near the $500 budget range.</p>
    <section><h2>Latest buying guides</h2>${articles.map((article) => `<article><h3><a href="/${article.slug}/">${escapeHtml(article.keyword)}</a></h3><p>${escapeHtml(article.metaDescription)}</p></article>`).join("")}</section>
  </main></body></html>`;
}

export function renderArticleStatic(article: Article): string {
  return `<!doctype html><html lang="en"><head>${buildMetaTags(metaForArticle(article))}
  ${articleJsonLd(article).map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("")}</head><body>
  <main id="seo-static" class="seo-crawler-only">
    <article>
      <p>${escapeHtml(article.heroBadge)}</p>
      <h1>${escapeHtml(article.heroTitleLine1)} ${escapeHtml(article.heroTitleLine2)}</h1>
      <p>${escapeHtml(article.heroSubtitle)}</p>
      <p>${escapeHtml(article.heroTrustNote)}</p>
      <h2>${escapeHtml(article.introHeading)}</h2>
      ${article.introParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <h2>Quick picks</h2>${list(article.quickPicks.map((pick) => `${pick.label}: ${pick.reason}`))}
      <h2>Comparison table</h2>
      <table><thead><tr>${article.comparisonColumns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>
      ${article.products.map((product, index) => {
        const cta = HOVER_CTAS[index % HOVER_CTAS.length];
        return `<tr><td><img src="${product.image}" alt="${escapeHtml(product.title)}" /> ${escapeHtml(product.shortTitle)}</td><td><a href="${product.affiliateUrl}" rel="nofollow sponsored noopener noreferrer">${escapeHtml(String(product.price))} — ${escapeHtml(cta)}</a></td><td>${product.rating}/5</td><td>${escapeHtml(product.badge || product.highlightFeature || "Budget pick")}</td><td>${escapeHtml(product.specs.join("; "))}</td></tr>`;
      }).join("")}
      </tbody></table>
      <h2>Product reviews</h2>${article.products.map(productCard).join("")}
      <h2>${escapeHtml(article.buyingGuideHeading)}</h2>${article.buyingGuide.map((item) => `<section><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></section>`).join("")}
      <h2>Budget tips</h2>${list(article.budgetTips)}
      <h2>FAQs</h2>${article.faqs.map((faq) => `<section><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></section>`).join("")}
      <aside><h2>Affiliate disclosure</h2><p>${escapeHtml(affiliateDisclosure)}</p></aside>
      <footer><h2>About the author</h2><p>${escapeHtml(author.bio)}</p><p>${escapeHtml(author.name)}, ${escapeHtml(author.role)}</p></footer>
    </article>
  </main></body></html>`;
}

export function renderStaticPage(slug: string): string {
  const page = staticPages.find((item) => item.slug === slug);
  const title = page?.title || "Page";
  const body: Record<string, string[]> = {
    about: [
      "BestBuyUnder500.com is a product buying-guide website for readers who want useful recommendations without confusing listings.",
      "We explain price, features, comfort, performance, durability, and who each product is actually best for."
    ],
    contact: [
      "For corrections, editorial feedback, partnership questions, or general inquiries, contact bestbuyunder500@gmail.com.",
      "Please include the guide URL and product name when reporting an outdated price, unavailable product, or broken link."
    ],
    "write-for-us": [
      "BestBuyUnder500 accepts a limited number of high-quality guest contributions that help readers make better buying decisions on a budget.",
      "Contributors may not embed their own affiliate tags in the body of an article. We may remove or nofollow links at our discretion.",
      "Pitch us at bestbuyunder500@gmail.com with a 3-5 bullet outline, 2 sample clips, and your relevant expertise."
    ],
    "privacy-policy": [
      "BestBuyUnder500 may use basic analytics, affiliate links, and standard hosting logs to operate and improve the site.",
      "We do not sell personal information. Affiliate networks may use cookies or tracking parameters after a link click."
    ],
    "terms-and-conditions": [
      "BestBuyUnder500 content is provided for general informational purposes. Prices, availability, ratings, and product details may change at any time.",
      "Always confirm the latest details on the retailer page before making a purchase."
    ],
    "affiliate-disclosure": [
      affiliateDisclosure,
      "Affiliate relationships do not control our editorial rankings. Affiliate links are marked with sponsored/nofollow relationship attributes."
    ]
  };
  return `<!doctype html><html lang="en"><head>${buildMetaTags(metaForStaticPage(slug, title))}</head><body>
  <main id="seo-static" class="seo-crawler-only"><h1>${escapeHtml(title)}</h1>${(body[slug] || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</main></body></html>`;
}
