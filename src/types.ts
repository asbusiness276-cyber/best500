export interface Product {
  id: string;
  title: string;
  shortTitle: string;
  image: string;
  price: number;
  rating: number;
  affiliateUrl: string;
  asin: string;
  specs: string[];
  features: string[];
  pros: string[];
  cons: string[];
  badge?: string;
  highlightFeature?: string;
}

export interface Article {
  slug: string;
  navLabel: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  breadcrumb: string[];
  heroImage: string;
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroTrustNote: string;
  introHeading: string;
  introParagraphs: string[];
  filters: string[];
  comparisonColumns: string[];
  products: Product[];
  buyingGuideHeading: string;
  buyingGuide: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  quickPicks: Array<{ label: string; productId: string; reason: string }>;
  budgetTips: string[];
  relatedArticles: string[];
  sortOptions: Array<{ label: string; value: "recommended" | "price-asc" | "rating-desc" }>;
  defaultSort: "recommended" | "price-asc" | "rating-desc";
  publishedTime: string;
  modifiedTime: string;
}
