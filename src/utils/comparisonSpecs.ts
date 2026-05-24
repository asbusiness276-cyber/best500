import {
  Battery,
  Cpu,
  Gauge,
  HardDrive,
  Headphones,
  MemoryStick,
  Monitor,
  Radio,
  Ruler,
  Snowflake,
  Thermometer,
  Volume2,
  Wifi,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Article, Product } from "../types";

export type ComparisonSpecColumn = { heading: string; labels: string[]; icon: LucideIcon };

export function specValue(product: Product, labels: string[]): string {
  const spec = product.specs.find((item) => labels.some((label) => item.toLowerCase().startsWith(label.toLowerCase())));
  if (!spec) return "Check listing";
  const colon = spec.indexOf(":");
  return colon >= 0 ? spec.slice(colon + 1).trim() : spec;
}

export function comparisonSpecColumns(article: Article): ComparisonSpecColumn[] {
  const slug = article.slug;
  const keyword = article.keyword.toLowerCase();

  if (slug.includes("electric-wheelchair") || keyword.includes("wheelchair")) {
    return [
      { heading: "Capacity", labels: ["Capacity"], icon: Gauge },
      { heading: "Range", labels: ["Range"], icon: Battery },
      { heading: "Foldable", labels: ["Foldable"], icon: Ruler },
      { heading: "Motor", labels: ["Motor", "Speed"], icon: Zap },
      { heading: "Weight", labels: ["Weight"], icon: Ruler }
    ];
  }

  if (slug.includes("watch") || keyword.includes("watch")) {
    return [
      { heading: "Movement", labels: ["Movement"], icon: Gauge },
      { heading: "Case size", labels: ["Case size"], icon: Ruler },
      { heading: "Water resistance", labels: ["Water resistance", "Water"], icon: Thermometer },
      { heading: "Band", labels: ["Band"], icon: Ruler }
    ];
  }

  if (slug.includes("ham-radio") || keyword.includes("ham radio")) {
    return [
      { heading: "Bands", labels: ["Bands"], icon: Radio },
      { heading: "Power", labels: ["Power"], icon: Zap },
      { heading: "Type", labels: ["Type", "Modes"], icon: Headphones },
      { heading: "Features", labels: ["Feature", "Channels"], icon: Wifi }
    ];
  }

  if (slug.includes("washer") || slug.includes("dryer") || keyword.includes("washer")) {
    return [
      { heading: "Capacity", labels: ["Washer capacity", "Capacity"], icon: Gauge },
      { heading: "Type", labels: ["Type"], icon: Ruler },
      { heading: "Dryer", labels: ["Dryer capacity"], icon: Snowflake },
      { heading: "Drain", labels: ["Drain", "Tub"], icon: Thermometer }
    ];
  }

  if (slug.includes("headset") || keyword.includes("headset")) {
    return [
      { heading: "Driver", labels: ["Driver", "Audio", "Sound"], icon: Volume2 },
      { heading: "Connectivity", labels: ["Connection"], icon: Wifi },
      { heading: "Battery", labels: ["Battery"], icon: Battery },
      { heading: "Mic", labels: ["Mic", "Noise control"], icon: Headphones }
    ];
  }

  if (slug.includes("go-kart") || keyword.includes("go kart")) {
    return [
      { heading: "Engine", labels: ["Engine", "Power", "Motors"], icon: Zap },
      { heading: "Speed", labels: ["Speed"], icon: Gauge },
      { heading: "Rider age", labels: ["Ages"], icon: Ruler },
      { heading: "Fuel type", labels: ["Type", "Power"], icon: Thermometer }
    ];
  }

  if (slug.includes("dirt-bike") || keyword.includes("dirt bike")) {
    return [
      { heading: "Motor", labels: ["Motor"], icon: Zap },
      { heading: "Speed", labels: ["Top speed", "Speed"], icon: Gauge },
      { heading: "Range", labels: ["Range"], icon: Battery },
      { heading: "Battery", labels: ["Battery"], icon: Battery }
    ];
  }

  if (slug.includes("refrigerator") || keyword.includes("refrigerator")) {
    return [
      { heading: "Capacity", labels: ["Capacity"], icon: Ruler },
      { heading: "Freezer", labels: ["Freezer"], icon: Snowflake },
      { heading: "Size", labels: ["Size"], icon: Ruler },
      { heading: "Door", labels: ["Door", "Temperature"], icon: Thermometer }
    ];
  }

  if (slug.includes("laptop") || keyword.includes("laptop")) {
    return [
      { heading: "Processor", labels: ["Processor"], icon: Cpu },
      { heading: "Memory", labels: ["Memory"], icon: MemoryStick },
      { heading: "Storage", labels: ["Storage"], icon: HardDrive },
      { heading: "Display", labels: ["Display"], icon: Monitor }
    ];
  }

  if (slug.includes("barbecue") || slug.includes("grill") || keyword.includes("barbecue") || keyword.includes("grill")) {
    return [
      { heading: "Burners", labels: ["Burners"], icon: Zap },
      { heading: "Heat source", labels: ["Heat source"], icon: Thermometer },
      { heading: "Cooking area", labels: ["Cooking area"], icon: Ruler },
      { heading: "Fuel", labels: ["Fuel"], icon: Gauge },
      { heading: "Material", labels: ["Material"], icon: Snowflake }
    ];
  }

  return [
    { heading: "Processor", labels: ["Processor"], icon: Cpu },
    { heading: "Memory", labels: ["Memory"], icon: MemoryStick },
    { heading: "Storage", labels: ["Storage"], icon: HardDrive },
    { heading: "Display", labels: ["Display"], icon: Monitor }
  ];
}

export function fullComparisonColumns(article: Article): string[] {
  return ["Product", "Price", "Rating", "Best for", ...comparisonSpecColumns(article).map((column) => column.heading)];
}
