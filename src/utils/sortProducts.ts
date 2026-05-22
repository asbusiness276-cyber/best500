import type { Article, Product } from "../types";

export type ProductSort = Article["defaultSort"];

function featuredId(article: Article): string | undefined {
  return article.featuredProductId || article.quickPicks.find((pick) => !/lowest/i.test(pick.label))?.productId;
}

export function sortProducts(products: Product[], article: Article, sort: ProductSort): Product[] {
  const pinId = featuredId(article);
  const pinned = pinId ? products.find((product) => product.id === pinId) : undefined;
  const rest = pinId ? products.filter((product) => product.id !== pinId) : [...products];

  let ordered: Product[];
  switch (sort) {
    case "price-asc":
      ordered = [...rest].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      ordered = [...rest].sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      ordered = [...rest].sort((a, b) => b.rating - a.rating);
      break;
    default:
      ordered = rest;
  }

  if (!pinned) return ordered;
  if (sort === "price-asc" || sort === "price-desc") return ordered;
  return [pinned, ...ordered.filter((product) => product.id !== pinned.id)];
}
