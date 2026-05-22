import { ArrowDown, MapPin, SlidersHorizontal } from "lucide-react";
import type { Article, Product } from "../types";
import type { ProductSort } from "../utils/sortProducts";

interface ArticleDiscoveryPanelProps {
  article: Article;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  jumpLinks: Array<{ label: string; product: Product }>;
}

export function ArticleDiscoveryPanel({ article, sort, onSortChange, jumpLinks }: ArticleDiscoveryPanelProps) {
  return (
    <div id="discovery-panel" className="article-discovery-panel scroll-mt-24 space-y-3">
      <section className="jump-bulletin rounded-2xl border border-slate-700/80 p-4 shadow-lg shadow-slate-900/25">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-slate-500/40 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <MapPin className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Jump to
          </div>
          <a href="#comparison-table" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-white">
            Comparison table <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {jumpLinks.map(({ label, product }) => (
            <a
              key={label}
              href={`#${product.id}`}
              className="jump-bulletin__pin rounded-full border border-emerald-400/30 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-emerald-100 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-700 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <section className="find-match-panel rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-md shadow-slate-200/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-950">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Find your match
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Sort</span>
          {article.sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => onSortChange(option.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                sort === option.value
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
