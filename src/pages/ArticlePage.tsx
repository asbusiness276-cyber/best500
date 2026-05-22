import { useMemo, useState } from "react";
import { CheckCircle2, Cpu, ExternalLink, HardDrive, Headphones, MemoryStick, Monitor, Ruler, ShieldCheck, Snowflake, Star, Thermometer, Volume2, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { affiliateDisclosure } from "../constants/affiliate";
import { author } from "../data/author";
import type { Article, Product } from "../types";
import { AffiliateLink } from "../components/AffiliateLink";
import { ArticleDiscoveryPanel } from "../components/ArticleDiscoveryPanel";
import { ProductImageGallery } from "../components/ProductImageGallery";
import { PriceCtaButton } from "../components/PriceCtaButton";
import { productPrimaryImage } from "../utils/productImages";
import { sortProducts, type ProductSort } from "../utils/sortProducts";

function productById(article: Article, id: string): Product | undefined {
  return article.products.find((product) => product.id === id);
}

function searchableProductText(product: Product): string {
  return [product.title, product.shortTitle, product.badge, product.highlightFeature, ...product.specs, ...product.features, ...product.pros]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function productForShortcut(article: Article, label: string, index: number): Product {
  const query = label.toLowerCase();
  const fallback = article.products[index % article.products.length];
  const matcher = (terms: string[]) => article.products.find((product) => terms.some((term) => searchableProductText(product).includes(term)));

  const titleMatch = article.products.find((product) => {
    const short = product.shortTitle.toLowerCase();
    return short.includes(query) || query.split(/\s+/).every((word) => word.length > 2 && short.includes(word));
  });
  if (titleMatch) return titleMatch;

  const badgeMatch = article.products.find((product) => product.badge?.toLowerCase() === query);
  if (badgeMatch) return badgeMatch;

  const partialBadge = article.products.find((product) => product.badge && query.includes(product.badge.toLowerCase()));
  if (partialBadge) return partialBadge;

  if (/top rated|highest rated|best rated/.test(query)) {
    return [...article.products].sort((a, b) => b.rating - a.rating)[0] || fallback;
  }
  if (/best value|best budget|lowest price|cheapest/.test(query)) {
    return article.products.find((product) => /best value|lowest|budget|under \$500/i.test(product.badge || ""))
      || [...article.products].sort((a, b) => a.price - b.price)[0]
      || fallback;
  }
  if (/best for gaming|gaming pick|light gaming/.test(query)) {
    return matcher(["gaming", "ryzen", "radeon", "surround", "7.1"]) || fallback;
  }
  if (/large screen|17\.3|big display/.test(query)) {
    return matcher(["17.3", "17-inch", "16-inch", "large display"]) || fallback;
  }
  if (/1tb|big storage|large storage/.test(query)) {
    return matcher(["1tb", "1024"]) || fallback;
  }
  if (/ryzen 7|strong cpu/.test(query)) {
    return matcher(["ryzen 7", "7735", "5700u"]) || fallback;
  }
  if (/wireless|bluetooth|console|pc/.test(query)) return matcher(["wireless", "bluetooth", "2.4ghz", "lightspeed"]) || fallback;
  if (/noise|focus|developer|desk|calls|remote/.test(query)) return matcher(["noise", "anc", "microphone", "voice", "call", "focus"]) || fallback;
  if (/spatial|audio|surround/.test(query)) return matcher(["spatial", "surround", "7.1"]) || fallback;
  if (/school|student|college|work/.test(query)) return matcher(["student", "school", "battery", "portable", "lightweight"]) || fallback;
  if (/fast|charging|upgrade|usb-c/.test(query)) return matcher(["fast charging", "100w", "upgrade", "expandable", "usb-c"]) || fallback;
  if (/apartment|dorm|kitchen|office/.test(query)) return matcher(["apartment", "compact", "reversible", "shelves"]) || fallback;
  if (/quiet|energy|efficient/.test(query)) return matcher(["quiet", "39db", "42db", "energy"]) || fallback;
  if (/large|capacity|9\.2|8\.5/.test(query)) return matcher(["8.5", "9.2", "7.7", "large capacity"]) || fallback;
  if (/bottom freezer/.test(query)) return matcher(["bottom freezer"]) || fallback;
  if (/bundle|keyboard|mouse/.test(query)) return matcher(["bundle", "keyboard", "mouse"]) || fallback;
  if (/audiophile|premium audio|sennheiser/.test(query)) return matcher(["audiophile", "sennheiser", "hd"]) || fallback;
  if (/frost.?free|no frost/.test(query)) return matcher(["frost", "no frost"]) || fallback;
  if (/reversible|flex door/.test(query)) return matcher(["reversible"]) || fallback;
  if (/crisper|produce/.test(query)) return matcher(["crisper", "produce"]) || fallback;

  return fallback;
}

function specValue(product: Product, labels: string[]): string {
  const spec = product.specs.find((item) => labels.some((label) => item.toLowerCase().startsWith(label.toLowerCase())));
  return spec ? spec.replace(/^[^:]+:\s*/, "") : "Check listing";
}

function comparisonSpecs(article: Article): Array<{ heading: string; labels: string[]; icon: LucideIcon }> {
  if (article.keyword.toLowerCase().includes("headset")) {
    return [
      { heading: "Connection", labels: ["Connection"], icon: Wifi },
      { heading: "Audio", labels: ["Audio", "Sound"], icon: Volume2 },
      { heading: "Noise / Mic", labels: ["Noise control", "Mic"], icon: Headphones }
    ];
  }

  if (article.keyword.toLowerCase().includes("refrigerator")) {
    return [
      { heading: "Capacity", labels: ["Capacity"], icon: Ruler },
      { heading: "Freezer", labels: ["Freezer"], icon: Snowflake },
      { heading: "Temperature", labels: ["Temperature"], icon: Thermometer },
      { heading: "Storage", labels: ["Storage"], icon: HardDrive }
    ];
  }

  return [
    { heading: "Processor", labels: ["Processor"], icon: Cpu },
    { heading: "Memory", labels: ["Memory"], icon: MemoryStick },
    { heading: "Storage", labels: ["Storage"], icon: HardDrive },
    { heading: "Display", labels: ["Display"], icon: Monitor }
  ];
}

function SpecCell({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex min-w-[130px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
      {value}
    </span>
  );
}

function AmazonCta({ href, compact = false }: { href: string; compact?: boolean }) {
  return (
    <AffiliateLink
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 font-bold text-white shadow-sm transition hover:bg-emerald-600 ${compact ? "px-4 py-2 text-sm" : "px-5 py-3 text-sm"}`}
    >
      <ExternalLink className="h-4 w-4" />
      <span className="group-hover:hidden">Buy on Amazon</span>
      <span className="hidden group-hover:inline">Check Best Deal</span>
    </AffiliateLink>
  );
}

export function ArticlePage({ article }: { article: Article }) {
  const [sort, setSort] = useState<ProductSort>(article.defaultSort);
  const shortcutPicks = article.filters.map((filter, index) => ({
    label: filter,
    product: productForShortcut(article, filter, index)
  }));
  const sortedProducts = useMemo(() => sortProducts(article.products, article, sort), [article, sort]);
  const specColumns = comparisonSpecs(article);
  const featuredId = article.featuredProductId || article.quickPicks.find((pick) => !/lowest/i.test(pick.label))?.productId;

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-16">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">{article.heroBadge}</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {article.heroTitleLine1}<span className="block text-emerald-700">{article.heroTitleLine2}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{article.heroSubtitle}</p>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{article.heroTrustNote}</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
            <img src={article.heroImage} alt={article.keyword} className="mx-auto aspect-video w-full object-cover" />
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-950">{article.introHeading}</h2>
            {article.introParagraphs.map((paragraph) => <p key={paragraph} className="text-lg leading-8 text-slate-700">{paragraph}</p>)}
          </div>
          <aside className="lg:sticky lg:top-[4.5rem] lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Quick picks</h2>
              <p className="mt-1 text-sm text-slate-600">Editor shortcuts for fast decisions.</p>
              <ul className="mt-4 divide-y divide-slate-200/80">
                {article.quickPicks.map((pick) => {
                  const product = productById(article, pick.productId);
                  return product ? (
                    <li key={pick.label} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{pick.label}</p>
                      <p className="mt-1 text-sm font-bold leading-snug text-slate-950">{product.shortTitle}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{pick.reason}</p>
                      <a href={`#${product.id}`} className="mt-2 inline-flex text-xs font-bold text-emerald-700 hover:text-emerald-900">
                        View pick →
                      </a>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </aside>
        </section>

        <section className="mt-8 space-y-4">
          <ArticleDiscoveryPanel article={article} sort={sort} onSortChange={setSort} jumpLinks={shortcutPicks} />
          <h2 id="comparison-table" className="text-3xl font-bold text-slate-950 scroll-mt-28">Product comparison table</h2>
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Product</th>
                  <th className="min-w-[132px] px-4 py-3 font-bold">Price</th>
                  <th className="px-4 py-3 font-bold">Rating</th>
                  <th className="px-4 py-3 font-bold">Best for</th>
                  {specColumns.map(({ heading, icon: Icon }) => (
                    <th key={heading} className="px-4 py-3 font-bold">
                      <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-600" />{heading}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map((product, rowIndex) => (
                  <tr key={product.id} className="align-middle hover:bg-emerald-50/40">
                    <td className="min-w-[300px] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={productPrimaryImage(product)} alt={product.title} className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-contain p-1" loading="lazy" />
                        <div>
                          <p className="font-semibold leading-5 text-slate-950">{product.shortTitle}</p>
                          {product.id === featuredId && <p className="mt-1 text-xs font-bold text-amber-700">Featured pick</p>}
                          {product.badge && product.id !== featuredId && <p className="mt-1 text-xs font-bold text-emerald-700">{product.badge}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="min-w-[132px] px-4 py-4"><PriceCtaButton href={product.affiliateUrl} price={product.price} productName={product.title} rowIndex={rowIndex} compact /></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating}</span></td>
                    <td className="min-w-[150px] px-4 py-4 text-slate-700"><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-600" />{product.badge || product.highlightFeature || "Budget pick"}</td>
                    {specColumns.map(({ heading, labels, icon }) => (
                      <td key={heading} className="px-4 py-4">
                        <SpecCell icon={icon} value={specValue(product, labels)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-6">
          <h2 className="text-3xl font-bold text-slate-950">Product cards</h2>
          {sortedProducts.map((product, index) => (
            <article id={product.id} key={product.id} className="scroll-mt-28 grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,280px)_1fr] xl:grid-cols-[minmax(0,300px)_1fr]">
              <ProductImageGallery product={product} cardIndex={index} eager={index < 2} enableCarousel={article.enableImageCarousel === true && Boolean(product.images?.length)} />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">#{index + 1}</span>
                  {product.id === featuredId && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Featured</span>}
                  {product.badge && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">{product.badge}</span>}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="h-4 w-4 fill-current" /> {product.rating}/5</span>
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">{product.shortTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{product.title}</p>
                <div className="mt-4"><PriceCtaButton href={product.affiliateUrl} price={product.price} productName={product.title} rowIndex={index} /></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-bold text-slate-950">Key features</h4>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                      {product.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}
                    </ul>
                  </div>
                  <div className="grid gap-4">
                    <div><h4 className="font-bold text-slate-950">Pros</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{product.pros.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div><h4 className="font-bold text-slate-950">Cons</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{product.cons.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  </div>
                </div>
                <div className="mt-5"><AmazonCta href={product.affiliateUrl} /></div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-3xl font-bold text-slate-950">{article.buyingGuideHeading}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {article.buyingGuide.map((item) => (
              <section key={item.title} className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-slate-950">Budget tips</h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {article.budgetTips.map((tip) => <li key={tip} className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700">{tip}</li>)}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-slate-950">FAQs</h2>
          <div className="mt-5 grid gap-4">
            {article.faqs.map((faq) => (
              <section key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-bold text-slate-950">{faq.question}</h3>
                <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>

        <aside className="mt-12 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-slate-950">Affiliate disclosure</h2>
          <p className="mt-2 leading-7 text-slate-700">{affiliateDisclosure}</p>
        </aside>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-950">About the author</h2>
          <p className="mt-2 leading-7 text-slate-700">{author.bio}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-emerald-700">
            <a href={author.linkedIn}>LinkedIn</a>
            <a href={author.instagram}>Instagram</a>
            <a href={`mailto:${author.email}`}>{author.email}</a>
          </div>
        </section>
      </article>
    </main>
  );
}
