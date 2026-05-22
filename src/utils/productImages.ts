import type { Product } from "../types";

/** Primary image first; falls back to `image` when `images` is empty. */
export function getProductImages(product: Product): string[] {
  if (product.images?.length) {
    return product.images;
  }
  return product.image ? [product.image] : [];
}

export function productPrimaryImage(product: Product): string {
  return getProductImages(product)[0] || product.image;
}
