import { ArrowRight } from "lucide-react";
import { articles } from "../data/articles";

export function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-white to-emerald-50/50">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
          <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">Independent buying guides</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Smart picks near your budget, explained simply.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            BestBuyUnder500 helps shoppers compare useful products with clean specs, practical tradeoffs, and visible affiliate disclosures.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Published guides</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Latest buying guides</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <a key={article.slug} href={`/${article.slug}/`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img src={article.heroImage} alt={article.keyword} className="aspect-video w-full bg-slate-950 object-cover" loading="lazy" />
              <div className="p-6">
                <p className="text-sm font-semibold text-emerald-700">{article.category}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{article.keyword}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{article.metaDescription}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">Read guide <ArrowRight className="h-4 w-4" /></span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
