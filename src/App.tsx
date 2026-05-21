import { Layout } from "./components/Layout";
import { getArticleBySlug } from "./data/articles";
import { staticPages } from "./data/routes";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StaticPage } from "./pages/StaticPage";

function normalizePath(pathname: string): string {
  if (pathname === "") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function App() {
  const pathname = normalizePath(window.location.pathname);
  const slug = pathname.replace(/^\//, "").replace(/\/$/, "");
  const article = getArticleBySlug(slug);
  const staticPage = staticPages.find((page) => page.slug === slug);

  return (
    <Layout>
      {pathname === "/" ? <HomePage /> : article ? <ArticlePage article={article} /> : staticPage ? <StaticPage slug={staticPage.slug} /> : <NotFoundPage />}
    </Layout>
  );
}
