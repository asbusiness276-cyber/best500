import { CheckCircle2, Cpu, ExternalLink, HardDrive, Headphones, MemoryStick, Monitor, Ruler, ShieldCheck, Snowflake, Star, Thermometer, Volume2, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { affiliateDisclosure } from "../constants/affiliate";
import { author } from "../data/author";
import type { Article, Product } from "../types";
import { AffiliateLink } from "../components/AffiliateLink";

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
  const matcher = (terms: string[]) => article.products.find((product) => terms.some((term) => searchableProductText(product).includes(term)));

  if (/wireless|bluetooth|console|pc/.test(query)) return matcher(["wireless", "bluetooth", "2.4ghz", "lightspeed"]) || article.products[index % article.products.length];
  if (/noise|focus|developer|desk|calls|remote/.test(query)) return matcher(["noise", "anc", "microphone", "voice", "call", "focus"]) || article.products[index % article.products.length];
  if (/spatial|audio|gaming|light gaming/.test(query)) return matcher(["spatial", "surround", "7.1", "ryzen", "radeon", "gaming"]) || article.products[index % article.products.length];
  if (/school|student|college|work/.test(query)) return matcher(["student", "school", "battery", "portable", "lightweight"]) || article.products[index % article.products.length];
  if (/fast|charging|upgrade/.test(query)) return matcher(["fast charging", "100w", "upgrade", "expandable"]) || article.products[index % article.products.length];
  if (/apartment|dorm|kitchen/.test(query)) return matcher(["apartment", "compact", "reversible", "shelves"]) || article.products[index % article.products.length];
  if (/quiet|noise|energy/.test(query)) return matcher(["quiet", "39db", "42db", "energy"]) || article.products[index % article.products.length];
  if (/large|capacity/.test(query)) return matcher(["8.5", "9.2", "7.7", "large capacity"]) || article.products[index % article.products.length];
  if (/bottom freezer/.test(query)) return matcher(["bottom freezer"]) || article.products[index % article.products.length];

  return article.products[index % article.products.length];
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

function PriceCta({ href, price, productName, compact = false }: { href: string; price: number; productName: string; compact?: boolean }) {
  return (
    <AffiliateLink
      href={href}
      ariaLabel={`Check current price for ${productName}`}
      className={`group relative inline-flex overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50/80 font-extrabold text-emerald-800 shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${compact ? "min-w-[150px] px-3 py-2 text-base" : "w-full max-w-xs px-5 py-3 text-lg"}`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center opacity-25 transition duration-500 group-hover:translate-x-8 group-hover:opacity-50 group-focus-visible:translate-x-8 group-focus-visible:opacity-50">
        <span className="h-px flex-1 bg-current" />
        <ExternalLink className="mx-3 h-4 w-4" />
        <span className="h-px flex-1 bg-current" />
      </span>
      <span className="relative grid w-full min-w-0 place-items-center">
        <span className="transition duration-200 group-hover:-translate-y-5 group-hover:opacity-0 group-focus-visible:-translate-y-5 group-focus-visible:opacity-0">${price}</span>
        <span className="absolute translate-y-5 whitespace-nowrap text-sm opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Check Current Price
        </span>
      </span>
    </AffiliateLink>
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
  const shortcutPicks = article.filters.map((filter, index) => ({
    label: filter,
    product: productForShortcut(article, filter, index)
  }));
  const specColumns = comparisonSpecs(article);

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
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-950">{article.introHeading}</h2>
            {article.introParagraphs.map((paragraph) => <p key={paragraph} className="text-lg leading-8 text-slate-700">{paragraph}</p>)}
            <div className="flex flex-wrap gap-3">
              {shortcutPicks.map(({ label, product }) => (
                <a
                  key={label}
                  href={`#${product.id}`}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-md"
                >
                  Best for {label}
                </a>
              ))}
            </div>
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Quick picks</h2>
            <div className="mt-4 space-y-4">
              {article.quickPicks.map((pick) => {
                const product = productById(article, pick.productId);
                return product ? (
                  <div key={pick.label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">{pick.label}</p>
                    <p className="mt-1 font-bold text-slate-950">{product.shortTitle}</p>
                    <p className="mt-1 text-sm text-slate-600">{pick.reason}</p>
                    <a href={`#${product.id}`} className="mt-3 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600">
                      View this pick
                    </a>
                  </div>
                ) : null;
              })}
            </div>
          </aside>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-slate-950">Product comparison table</h2>
          <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Product</th>
                  <th className="px-4 py-3 font-bold">Price</th>
                  <th className="px-4 py-3 font-bold">Rating</th>
                  <th className="px-4 py-3 font-bold">Best for</th>
                  {specColumns.map(({ heading, icon: Icon }) => (
                    <th key={heading} className="px-4 py-3 font-bold">
                      <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-600" />{heading}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-bold">Buy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {article.products.map((product) => (
                  <tr key={product.id} className="align-middle hover:bg-emerald-50/40">
                    <td className="min-w-[300px] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.title} className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-contain p-1" loading="lazy" />
                        <div>
                          <p className="font-semibold leading-5 text-slate-950">{product.shortTitle}</p>
                          {product.badge && <p className="mt-1 text-xs font-bold text-emerald-700">{product.badge}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><PriceCta href={product.affiliateUrl} price={product.price} productName={product.title} compact /></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating}</span></td>
                    <td className="min-w-[150px] px-4 py-4 text-slate-700"><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-600" />{product.badge || product.highlightFeature || "Budget pick"}</td>
                    {specColumns.map(({ heading, labels, icon }) => (
                      <td key={heading} className="px-4 py-4">
                        <SpecCell icon={icon} value={specValue(product, labels)} />
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <AmazonCta href={product.affiliateUrl} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-6">
          <h2 className="text-3xl font-bold text-slate-950">Product cards</h2>
          {article.products.map((product, index) => (
            <article id={product.id} key={product.id} className="scroll-mt-24 grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[240px_1fr]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <img src={product.image} alt={product.shortTitle} className="mx-auto h-52 object-contain" loading={index < 2 ? "eager" : "lazy"} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">#{index + 1}</span>
                  {product.badge && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">{product.badge}</span>}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="h-4 w-4 fill-current" /> {product.rating}/5</span>
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">{product.shortTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{product.title}</p>
                <div className="mt-4"><PriceCta href={product.affiliateUrl} price={product.price} productName={product.title} /></div>
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
