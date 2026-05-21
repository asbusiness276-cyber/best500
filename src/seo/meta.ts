import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "../constants/site";
import type { Article, Product } from "../types";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export function absoluteUrl(path: string): string {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\//, "").replace(/\/?$/, "/")}`;
  return `${SITE_URL}${normalized}`;
}

function absoluteAssetUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function metaForHome(): PageMeta {
  return {
    title: "BestBuyUnder500 | Smart Buying Guides",
    description: "BestBuyUnder500 publishes simple, practical buying guides for shoppers comparing useful products near the $500 budget range.",
    path: "/",
    image: DEFAULT_OG_IMAGE,
    type: "website"
  };
}

export function metaForArticle(article: Article): PageMeta {
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    path: `/${article.slug}/`,
    image: article.heroImage.startsWith("/") ? absoluteAssetUrl(article.heroImage) : article.heroImage,
    type: "article",
    publishedTime: article.publishedTime,
    modifiedTime: article.modifiedTime
  };
}

export function metaForStaticPage(slug: string, title: string): PageMeta {
  const descriptions: Record<string, string> = {
    about: "Learn about BestBuyUnder500, our mission, editorial approach, and how we create practical product buying guides.",
    contact: "Contact BestBuyUnder500 for questions, corrections, partnerships, and editorial feedback.",
    "write-for-us": "Write for BestBuyUnder500 and pitch practical buying-guide ideas for budget-conscious readers.",
    "privacy-policy": "Read the BestBuyUnder500 privacy policy for details about analytics, affiliate links, and visitor information.",
    "terms-and-conditions": "Review the terms and conditions for using BestBuyUnder500.com buying guides and resources.",
    "affiliate-disclosure": "BestBuyUnder500 uses affiliate links and may earn a commission when readers buy through qualifying links."
  };
  return {
    title: `${title} | ${SITE_NAME}`,
    description: descriptions[slug] || `${title} on ${SITE_NAME}.`,
    path: `/${slug}/`,
    image: DEFAULT_OG_IMAGE,
    type: "website"
  };
}

export function buildMetaTags(meta: PageMeta): string {
  const url = absoluteUrl(meta.path);
  const image = meta.image || DEFAULT_OG_IMAGE;
  const articleTags = meta.type === "article"
    ? `<meta property="article:published_time" content="${meta.publishedTime}" />
    <meta property="article:modified_time" content="${meta.modifiedTime}" />`
    : "";
  return `<title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${meta.type || "website"}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#10b981" />
    <link rel="alternate" hreflang="en" href="${url}" />
    <link rel="alternate" hreflang="x-default" href="${url}" />
    ${articleTags}`;
}

export function articleJsonLd(article: Article): object[] {
  const articleUrl = absoluteUrl(`/${article.slug}/`);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: article.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: productJsonLd(product)
    }))
  };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.metaTitle,
      description: article.metaDescription,
      image: article.heroImage.startsWith("/") ? absoluteAssetUrl(article.heroImage) : article.heroImage,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime,
      mainEntityOfPage: articleUrl,
      author: {
        "@type": "Person",
        name: "Navjeet Kamboj",
        url: "https://in.linkedin.com/in/navjeet-kamboj"
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.svg`
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: article.breadcrumb.map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        item: index === 0 ? SITE_URL + "/" : articleUrl
      }))
    },
    itemList
  ];
}

export function productJsonLd(product: Product): object {
  return {
    "@type": "Product",
    name: product.title,
    image: product.image,
    sku: product.asin,
    asin: product.asin,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: product.affiliateUrl
    }
  };
}

export function websiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    }
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
