import type { Article } from "../types";
import { headsetArticle } from "./articles/best-gaming-headsets-for-under-500";
import { hamRadioArticle } from "./articles/ham-radio-under-500";
import { laptopArticle } from "./articles/best-gaming-laptop-under-500";
import { refrigeratorArticle } from "./articles/refrigerator-sale-under-500";

export const articles: Article[] = [laptopArticle, headsetArticle, refrigeratorArticle, hamRadioArticle];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export const categoryGroups = [
  "Home & Living",
  "Fashion",
  "Tech & Outdoors",
  "Tools & Home Improvement",
  "Sports & Outdoors",
  "Outdoor & Travel"
];

export function getArticlesByCategory(category: string): Article[] {
  return articles.filter((article) => article.category === category);
}
