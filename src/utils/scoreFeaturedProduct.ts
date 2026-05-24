import type { Product } from "../types";

/** Tie-break: lower price is better when scores are equal. */
export function scoreProduct(product: Product): number {
  let score = 0;

  score += product.rating * 100;
  if (product.rating >= 4.8) score += 50;
  else if (product.rating >= 4.5) score += 30;
  else if (product.rating >= 4.0) score += 10;

  score += product.pros.length * 5;
  score += Math.min(product.specs.length, 6) * 3;
  if (product.highlightFeature) score += 5;
  if (product.badge && !/lowest/i.test(product.badge)) score += 8;

  if (product.price <= 500) {
    score += 20;
    if (product.price <= 400) score += 10;
    if (product.price <= 300) score += 5;
  } else {
    score -= 40;
  }

  return score;
}

export function pickBestProduct(products: Product[]): Product {
  return [...products].sort((a, b) => {
    const diff = scoreProduct(b) - scoreProduct(a);
    if (diff !== 0) return diff;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.price - b.price;
  })[0];
}

export function bestPickBadge(product: Product): "Best pick" | "Best buy pick" {
  return product.price <= 500 ? "Best pick" : "Best buy pick";
}

export function reorderFeaturedProduct(products: Product[]): Product[] {
  if (products.length === 0) return products;

  const winner = pickBestProduct(products);
  const winnerBadge = bestPickBadge(winner);
  const lowest = [...products].sort((a, b) => a.price - b.price)[0];

  const rest = products.filter((p) => p.id !== winner.id);
  const winnerCopy: Product = {
    ...winner,
    badge: winnerBadge
  };

  const mapped = rest.map((p) => {
    const next = { ...p };
    if (next.badge === winnerBadge || /best (buy )?pick|best overall/i.test(next.badge || "")) {
      delete next.badge;
    }
    return next;
  });

  if (lowest && lowest.id !== winner.id) {
    const idx = mapped.findIndex((p) => p.id === lowest.id);
    if (idx >= 0 && !mapped[idx].badge) {
      mapped[idx] = { ...mapped[idx], badge: "Lowest price" };
    }
  }

  return [winnerCopy, ...mapped];
}
