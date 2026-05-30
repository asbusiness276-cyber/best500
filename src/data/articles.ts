import type { Article } from "../types";
import { headsetArticle } from "./articles/best-gaming-headsets-for-under-500";
import { hamRadioArticle } from "./articles/ham-radio-under-500";
import { laptopArticle } from "./articles/best-gaming-laptop-under-500";
import { refrigeratorArticle } from "./articles/refrigerator-sale-under-500";
import { watchArticle } from "./articles/best-watches-mens-under-500";
import { goKartArticle } from "./articles/gas-go-karts-under-500";
import { washerDryerArticle } from "./articles/best-washer-and-dryer-bundles-under-500";
import { electricDirtBikeArticle } from "./articles/electric-dirt-bike-under-500";
import { bestElectricWheelchairUnder500Article } from "./articles/best-electric-wheelchair-under-500";
import { bestBarbecueGrillUnder500Article } from "./articles/best-barbecue-grill-under-500";
import { best30MphElectricScooterUnder500Article } from "./articles/best-30-mph-electric-scooter-under-500";

export const articles: Article[] = [laptopArticle, headsetArticle, refrigeratorArticle, washerDryerArticle, hamRadioArticle, watchArticle, goKartArticle, electricDirtBikeArticle, bestElectricWheelchairUnder500Article, bestBarbecueGrillUnder500Article, best30MphElectricScooterUnder500Article];

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
