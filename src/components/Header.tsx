import { ChevronDown, Menu, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categoryGroups, getArticlesByCategory } from "../data/articles";

export function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const categoriesWithGuides = useMemo(
    () => categoryGroups.filter((category) => getArticlesByCategory(category).length > 0),
    []
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <a href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-950 sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Tag className="h-5 w-5" />
            </span>
            <span>BestBuy<span className="text-emerald-600">Under500</span><span className="block -mt-1 text-[10px] font-semibold text-slate-500">.com</span></span>
          </a>
          <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-700 md:flex lg:gap-5">
            {categoriesWithGuides.map((category) => {
              const guides = getArticlesByCategory(category);
              return (
                <div className="group relative" key={category}>
                  <button type="button" className="inline-flex items-center gap-1 rounded-full px-2 py-2 hover:bg-emerald-50 hover:text-emerald-700">
                    {category} <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="invisible absolute left-0 top-full w-80 translate-y-2 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {guides.map((article) => (
                      <a key={article.slug} href={`/${article.slug}/`} className="block rounded-xl px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
                        <span className="block font-bold">{article.navLabel}</span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">{article.keyword}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
            <a href="/write-for-us/" className="rounded-full px-2 py-2 hover:bg-emerald-50 hover:text-emerald-700">Write for us</a>
            <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </nav>
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 md:hidden"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[100] min-h-dvh overflow-y-auto bg-white px-4 py-4 md:hidden" role="dialog" aria-modal="true">
          <div className="mb-6 flex items-center justify-between">
            <a href="/" onClick={closeMenu} className="text-lg font-bold text-slate-950">BestBuy<span className="text-emerald-600">Under500</span></a>
            <button type="button" className="rounded-xl border border-slate-200 p-2" aria-label="Close menu" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-5">
            {categoriesWithGuides.map((category) => {
              const guides = getArticlesByCategory(category);
              return (
                <section key={category}>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{category}</h2>
                  <div className="space-y-2">
                    {guides.map((article) => (
                      <a key={article.slug} href={`/${article.slug}/`} onClick={closeMenu} className="block rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-800">
                        {article.navLabel}
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
            <a href="/write-for-us/" onClick={closeMenu} className="block rounded-2xl bg-slate-50 px-4 py-3 font-semibold">Write for us</a>
          </nav>
        </div>
      )}
    </>
  );
}
