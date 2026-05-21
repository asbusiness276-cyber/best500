import { CheckCircle2, Mail, Tag } from "lucide-react";
import { articles } from "../data/articles";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_0.85fr_1fr] lg:px-6">
        <div>
          <a href="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <Tag className="h-5 w-5" />
            </span>
            BestBuy<span className="text-emerald-300">Under500</span>
          </a>
          <p className="mt-4 max-w-sm leading-7 text-slate-400">
            Practical product recommendations for shoppers who want clear comparisons, honest tradeoffs, and useful picks near the $500 budget range.
          </p>
          <a href="mailto:bestbuyunder500@gmail.com" className="mt-4 inline-flex items-center gap-2 font-semibold text-emerald-300 hover:text-white">
            <Mail className="h-4 w-4" /> bestbuyunder500@gmail.com
          </a>
        </div>

        <nav>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Buying Guides</h2>
          <div className="mt-4 grid gap-3">
            {articles.map((article) => (
              <a key={article.slug} href={`/${article.slug}/`} className="leading-6 text-slate-300 hover:text-emerald-300">
                {article.keyword}
              </a>
            ))}
          </div>
        </nav>

        <nav>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Company & Legal</h2>
          <div className="mt-4 grid gap-3">
            <a href="/about/" className="hover:text-emerald-300">About us</a>
            <a href="/contact/" className="hover:text-emerald-300">Contact</a>
            <a href="/write-for-us/" className="hover:text-emerald-300">Write for us</a>
            <a href="/privacy-policy/" className="hover:text-emerald-300">Privacy policy</a>
            <a href="/terms-and-conditions/" className="hover:text-emerald-300">Terms & conditions</a>
            <a href="/affiliate-disclosure/" className="hover:text-emerald-300">Affiliate disclosure</a>
          </div>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Our Promise</h2>
          <ul className="mt-4 grid gap-3">
            {[
              "Independent editorial buying guides",
              "Relevant product articles only",
              "Clear affiliate disclosure on every guide",
              "No pay-to-play editor's picks"
            ].map((item) => (
              <li key={item} className="flex gap-2 leading-6">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between lg:px-6">
          <p>© 2026 BestBuyUnder500.com. Guides by Navjeet Kamboj.</p>
          <p>As an Amazon Associate, we may earn from qualifying purchases. Prices and availability can change.</p>
        </div>
      </div>
    </footer>
  );
}
