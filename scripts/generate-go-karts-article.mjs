import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outFile = path.join(root, "src/data/articles/gas-go-karts-under-500.ts");

const rows = [
  {
    asin: "B0F9Y5YXVB",
    affiliateUrl: "https://www.amazon.com/dp/B0F9Y5YXVB/?tag=visitbest07-20",
    title:
      "Wanan Electric Go Kart with Adjustable Seat, Licensed BMW Drift Kart with Dual Motors, Crazy Go Cart for Kids Ages 6-12, LED Lights, Drift Mode and 2 Speed (Red-36V)",
    shortTitle: "Wanan BMW Licensed Electric Drift Kart",
    brand: "Wanan",
    price: 400,
    rating: 3.4,
    image: "https://m.media-amazon.com/images/I/71D3bGss5yL._AC_SL1500_.jpg",
    specs: ["Power: 36V electric", "Motors: Dual motors", "Ages: 6-12", "Modes: Drift + 2 speed", "Extras: LED lights, adjustable seat"],
    badge: "Licensed drift kart",
    highlight: "36V dual motors"
  },
  {
    asin: "B0GNJC9Z5S",
    affiliateUrl: "https://www.amazon.com/dp/B0GNJC9Z5S/?tag=visitbest07-20",
    title:
      "Blitzshark 36V Kids Go Kart 600W Drift Kart Powerful Electric Pedal Kart Outdoor Race Toy, with 600W Strong Motor, 9AH Big Battery, EVA Tires, Drift/Sports Mode, Brake Pedal, Length Adjustment, Red",
    shortTitle: "Blitzshark 36V 600W Drift Kart",
    brand: "Blitzshark",
    price: 360,
    rating: 4.5,
    image: "https://m.media-amazon.com/images/I/617qcG2+B-L._AC_SL1500_.jpg",
    specs: ["Power: 36V / 600W motor", "Battery: 9Ah", "Tires: EVA", "Modes: Drift / sports", "Feature: Adjustable length, brake pedal"],
    badge: "Best electric value",
    highlight: "600W motor"
  },
  {
    asin: "B0GZ3V1RJP",
    affiliateUrl: "https://www.amazon.com/dp/B0GZ3V1RJP/?tag=visitbest07-20",
    title:
      "Kids Gas ATV, 50CC 2-Stroke Mini Gas 4-Wheeler for Kids, Front & Rear Disc Brakes, Speed Control, up to 143 lbs Weight Capacity",
    shortTitle: "FROSTYRIDER 50cc Gas Kids ATV",
    brand: "FROSTYRIDER",
    price: 399,
    rating: 2,
    image: "https://m.media-amazon.com/images/I/81pHYD9jS3L._AC_SL1500_.jpg",
    specs: ["Engine: 50cc 2-stroke gas", "Brakes: Front & rear disc", "Control: Speed control", "Capacity: Up to 143 lbs", "Type: Mini gas 4-wheeler"],
    badge: "Gas powered pick",
    highlight: "50cc gas engine"
  },
  {
    asin: "B0GSQPWPHC",
    affiliateUrl: "https://www.amazon.com/dp/B0GSQPWPHC/?tag=visitbest07-20",
    title:
      "24V Electric Go Kart, Kids Drift Kart with Dual 85W Motors, 11.2 MPH & 60+ Min Ride Time, Adjustable Seat & 5-Point Seat Belt for Ages 6-12, 150 LBS Max Load (White)",
    shortTitle: "SkyNexus 24V Kids Drift Kart",
    brand: "SkyNexus",
    price: 360,
    rating: 5,
    image: "https://m.media-amazon.com/images/I/61XUqkVNC4L._AC_SL1500_.jpg",
    specs: ["Power: 24V dual 85W motors", "Speed: Up to 11.2 MPH", "Runtime: 60+ minutes", "Safety: 5-point seat belt", "Load: 150 lbs max"],
    badge: "Top rated",
    highlight: "11.2 MPH"
  },
  {
    asin: "B0D7LT8MPW",
    affiliateUrl: "https://www.amazon.com/dp/B0D7LT8MPW/?tag=visitbest07-20",
    title:
      "KerryYoo K61 Go Kart Electric Drift Kart with Length Adjustable Seat, 24V Outdoor Ride on Toy with 4 Speed Mode, Crazy Kart for Kids 6-12 Years Old, Fast 300W Motor, 8.5 MPH, Bluetooth - Gray",
    shortTitle: "KerryYoo K61 24V Drift Kart",
    brand: "KerryYoo",
    price: 370,
    rating: 4.2,
    image: "https://m.media-amazon.com/images/I/61pDeXaHp1L._AC_SL1500_.jpg",
    specs: ["Power: 24V / 300W motor", "Speed: Up to 8.5 MPH", "Modes: 4 speed settings", "Ages: 6-12", "Extras: Bluetooth, adjustable seat"],
    highlight: "4 speed modes"
  },
  {
    asin: "B0GS4P49W7",
    affiliateUrl: "https://www.amazon.com/dp/B0GS4P49W7/?tag=visitbest07-20",
    title:
      "Kids 4 Wheeler 50cc Gas ATV Gas Powered Four Wheeler with Suspension Brakes Gear 10 Inch Tire 15 MPH, Blue",
    shortTitle: "YATORP 50cc Gas Kids 4-Wheeler",
    brand: "YATORP",
    price: 440,
    rating: 5,
    image: "https://m.media-amazon.com/images/I/71CroKC76eL._AC_SL1500_.jpg",
    specs: ["Engine: 50cc gas", "Speed: Up to 15 MPH", "Tires: 10-inch", "Suspension: Yes", "Type: Gas four-wheeler"],
    badge: "Best off-road gas",
    highlight: "15 MPH"
  },
  {
    asin: "B0GMV7B9RM",
    affiliateUrl: "https://www.amazon.com/dp/B0GMV7B9RM/?tag=visitbest07-20",
    title:
      "FRP GA40 Sahara 40 CC 4-Stroke Kids Gas Powered ATV, Kids Gas 4 Wheeler With Front and Rear Disc Brake, Speed Control Weight Support Up to 143 LBS (Blue)",
    shortTitle: "FRP GA40 Sahara 40cc Gas ATV",
    brand: "FRP",
    price: 480,
    rating: 5,
    image: "https://m.media-amazon.com/images/I/61OB99HF72L._AC_SL1001_.jpg",
    specs: [
      "Engine: 40cc 4-stroke gas",
      "Brakes: Front & rear disc",
      "Control: Speed control + key ignition",
      "Capacity: Up to 143 lbs",
      "Safety: Emergency shut-off, shock absorption"
    ],
    badge: "Best gas pick",
    highlight: "40cc 4-stroke",
    featured: true
  },
  {
    asin: "B0GS4KB6JP",
    affiliateUrl: "https://www.amazon.com/dp/B0GS4KB6JP/?tag=visitbest07-20",
    title:
      "Kids ATV 50cc Gas 4 Wheeler Gas Powered Four Wheeler with Speed Control Brakes Gear 31 Mile Range 15 MPH, Red",
    shortTitle: "YATORP 50cc Gas ATV (Red)",
    brand: "YATORP",
    price: 420,
    rating: 4.6,
    image: "https://m.media-amazon.com/images/I/713uK85zxkL._AC_SL1500_.jpg",
    specs: ["Engine: 50cc gas", "Speed: Up to 15 MPH", "Range: Up to 31 miles", "Control: Speed control + brakes", "Type: Gas four-wheeler"],
    highlight: "31-mile range"
  },
  {
    asin: "B0FM86PC1C",
    affiliateUrl: "https://www.amazon.com/dp/B0FM86PC1C/?tag=visitbest07-20",
    title:
      "Ride on Go Kart for Teens, 24v 9Ah Large Battery Dual 300w Extra Powerful Motors, 8MPH Fast Drifting Fun with Music & Horn, Max Load 175 Lbs, Outdoor Ride on Toy for Teens",
    shortTitle: "Amenitlif 24V Teen Go Kart",
    brand: "Amenitlif",
    price: 200,
    rating: 4,
    image: "https://m.media-amazon.com/images/I/71RN5HPFHxL._AC_SL1494_.jpg",
    specs: ["Power: 24V dual 300W motors", "Battery: 9Ah", "Speed: Up to 8 MPH", "Load: 175 lbs max", "Extras: Music + horn"],
    badge: "Lowest price kart",
    highlight: "175 lb load"
  },
  {
    asin: "B0FR4PN2TT",
    affiliateUrl: "https://www.amazon.com/dp/B0FR4PN2TT/?tag=visitbest07-20",
    title:
      "Electric Drift Go Kart for Kids, Go Kart with 200W Dual Motor & 7AH Battery, 8.1MPH Max Speed, 360° Drifting, 5-Point Safety Belt, 110LBS Load,USB/MP3 Player",
    shortTitle: "PeakPursuit Electric Drift Go Kart",
    brand: "PeakPursuit",
    price: 304,
    rating: 3.4,
    image: "https://m.media-amazon.com/images/I/61TR69ROJ-L._AC_SL1500_.jpg",
    specs: ["Power: Dual 200W motors", "Battery: 7Ah", "Speed: Up to 8.1 MPH", "Drift: 360° drifting", "Safety: 5-point belt"],
    highlight: "360° drift"
  },
  {
    asin: "B08FBQN48M",
    affiliateUrl: "https://www.amazon.com/dp/B08FBQN48M/?tag=visitbest07-20",
    title:
      "Razor Ground Force One - Electric Go-Kart for Ages 8+, Up to 12 MPH, Up to 40 Minutes of Continuous Use, Variable Speed Throttle, 24V Rechargeable Battery",
    shortTitle: "Razor Ground Force Electric Go-Kart",
    brand: "Razor",
    price: 408,
    rating: 4.2,
    image: "https://m.media-amazon.com/images/I/71qPSnKBoWL._AC_SL1500_.jpg",
    specs: ["Power: 24V rechargeable", "Speed: Up to 12 MPH", "Runtime: Up to 40 minutes", "Ages: 8+", "Brand: Established ride-on name"],
    badge: "Trusted brand pick",
    highlight: "12 MPH"
  },
  {
    asin: "B0BJFC7GNM",
    affiliateUrl: "https://www.amazon.com/dp/B0BJFC7GNM/?tag=visitbest07-20",
    title:
      "JMCHstore Vent Go kart Thread Gas Cap For Coleman KT196, Hammerhead GTS 150 150cc, Screw on Gas Lid TrailMaster Blazer MID XRX 150cc, 200cc 196cc 212cc Go kart Twist on Fuel Tank Lid",
    shortTitle: "JMCHstore Vent Go-Kart Gas Cap",
    brand: "JMCH Store",
    price: 15,
    rating: 4.3,
    image: "https://m.media-amazon.com/images/I/71vJfFo5B3L._AC_SL1500_.jpg",
    specs: ["Type: Vent gas cap accessory", "Fit: Coleman, Hammerhead, TrailMaster karts", "Feature: Leak-resistant vent tube", "Note: Verify tank opening shape"],
    badge: "Parts & maintenance",
    highlight: "Vent gas cap"
  },
  {
    asin: "B0D6VSV86P",
    affiliateUrl: "https://www.amazon.com/dp/B0D6VSV86P/?tag=visitbest07-20",
    title:
      "50cc Dirt Bike for Adults & Kids, Mini Bike Gas Powered Off Road Trail Bike with Speeds up to 40 MPH for Uphill and Off-Road Conditions, 2-Stroke, Blue, Medium, 14083092",
    shortTitle: "Lamphle 50cc Gas Dirt Bike",
    brand: "Lamphle",
    price: 149,
    rating: 3.1,
    image: "https://m.media-amazon.com/images/I/718RpkqRUHL._AC_SL1500_.jpg",
    specs: ["Engine: 50cc 2-stroke gas", "Speed: Up to 40 MPH", "Use: Off-road / trail", "Type: Mini dirt bike", "Note: Not a seated go-kart frame"],
    badge: "Budget gas ride",
    highlight: "50cc off-road"
  },
  {
    asin: "B0CJM4HWXQ",
    affiliateUrl: "https://www.amazon.com/dp/B0CJM4HWXQ/?tag=visitbest07-20",
    title:
      "Aosom 24V 7.5 MPH Electric Go Kart with Adjustable Seat, Drift Kart Battery Powered Ride on Toy Outdoor with Dual 150W Motors, Slow Start, Music, Honking Horn, Lights, for 6-12 Years Old, White",
    shortTitle: "Aosom 24V Electric Drift Kart",
    brand: "Aosom",
    price: 310,
    rating: 3.7,
    image: "https://m.media-amazon.com/images/I/617ZT2xT3+L._AC_SL1500_.jpg",
    specs: ["Power: 24V dual 150W motors", "Speed: Up to 7.5 MPH", "Ages: 6-12", "Safety: Slow start", "Extras: Music, horn, lights"],
    highlight: "Slow start"
  },
  {
    asin: "B0D7VTTHQ4",
    affiliateUrl: "https://www.amazon.com/dp/B0D7VTTHQ4/?tag=visitbest07-20",
    title:
      "Nasitip 24V Electric Go Kart,300W Powerful Drift Kart for Kids, Electric Pedal Kart,with 300W Strong Motor, Drift/Sport Mode, Big Battery, Eva Tire,Length Adjustmen for Outdoor Racing Toy-Green",
    shortTitle: "Nasitip 24V 300W Drift Kart",
    brand: "Nasitip",
    price: 300,
    rating: 3.7,
    image: "https://m.media-amazon.com/images/I/61EnsOQOyBL._AC_SL1500_.jpg",
    specs: ["Power: 24V / 300W motor", "Modes: Drift / sport", "Tires: EVA", "Feature: Length adjustment", "Use: Outdoor racing toy"],
    highlight: "300W motor"
  },
  {
    asin: "B0DL2W84XQ",
    affiliateUrl: "https://www.amazon.com/dp/B0DL2W84XQ/?tag=visitbest07-20",
    title:
      "24V Go Kart for Kids 6+ Years, 200W*2 Drifting Motors, 7.5 Mph High Speed Drifting Kart Car Riding Vehicle, Extendable Car Length,Max Load 135lbs Outdoor Ride On Racing Toy for Teens Children,Red",
    shortTitle: "Nasitip 24V Extendable Drift Kart",
    brand: "Nasitip",
    price: 240,
    rating: 3.8,
    image: "https://m.media-amazon.com/images/I/71G9hfjv6nL._AC_SL1500_.jpg",
    specs: ["Power: 24V dual 200W motors", "Speed: Up to 7.5 MPH", "Ages: 6+", "Load: 135 lbs max", "Feature: Extendable length"],
    highlight: "Extendable frame"
  }
];

function prosFor(row) {
  const p = [];
  if (row.specs.some((s) => /gas|50cc|40cc/i.test(s))) {
    p.push("Gas power avoids charging downtime for longer outdoor sessions");
  }
  if (row.specs.some((s) => /disc brake|5-point|shut-off|slow start/i.test(s))) {
    p.push("Safety-focused braking or belt features are called out in the listing");
  }
  if (row.rating >= 4.5) p.push("Strong buyer rating compared with other picks in this guide");
  if (row.price <= 250) p.push("Leaves more budget room for helmets, pads, and maintenance");
  if (row.brand === "Razor") p.push("Recognized ride-on brand with familiar support expectations");
  if (row.badge === "Best gas pick") {
    p.push("4-stroke gas engine is easier to live with than many 2-stroke budget ATVs");
    p.push("Useful safety extras include emergency shut-off and speed control");
  }
  if (p.length === 0) {
    p.push("Electric drift features and adjustable sizing suit backyard and driveway play");
  }
  if (p.length === 1) p.push("Fits shoppers comparing go karts for sale under $500 without jumping to $800+ rigs");
  return p.slice(0, 3);
}

function consFor(row) {
  const c = [];
  if (row.rating < 4) c.push("Lower rating than several competing picks in this price band");
  if (/gas cap|accessory/i.test(row.title + row.shortTitle)) {
    c.push("This is a replacement part, not a complete go-kart or ATV");
    return c;
  }
  if (/dirt bike/i.test(row.title)) {
    c.push("Mini dirt-bike layout is different from a low go-kart seating position");
    c.push("Higher claimed speeds demand strict adult supervision and proper safety gear");
    return c;
  }
  if (/electric|24V|36V/i.test(row.specs.join(" ")) && !/gas/i.test(row.specs.join(" "))) {
    c.push("Battery runtime and charge time matter more than top speed on paper");
  }
  if (row.price >= 440) c.push("Price sits close to the $500 ceiling with little room for safety gear");
  if (c.length === 0) c.push("Verify age, weight limit, and local terrain rules before buying");
  return c.slice(0, 3);
}

const products = rows.map((row, index) => {
  const id = `go-kart-${index + 1}`;
  const features = row.specs.slice(0, 5);
  const product = {
    id,
    title: row.title,
    shortTitle: row.shortTitle,
    image: row.image,
    price: row.price,
    rating: row.rating,
    affiliateUrl: row.affiliateUrl,
    asin: row.asin,
    specs: row.specs,
    features,
    pros: prosFor(row),
    cons: consFor(row),
    highlightFeature: row.highlight
  };
  if (row.badge) product.badge = row.badge;
  return product;
});

const featured = products.find((p) => p.id === "go-kart-7");

const ts = `import type { Article, Product } from "../../types";

export const goKartProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const goKartArticle: Article = {
  slug: "gas-go-karts-under-500",
  navLabel: "Gas go karts under $500",
  keyword: "Gas Go Karts Under $500",
  metaTitle: "Gas Go Karts Under $500 in 2026",
  metaDescription:
    "Compare gas go karts under $500 and nearby ride-on picks with gas ATVs, electric drift karts, speed, safety, and real Amazon pricing notes.",
  category: "Sports & Outdoors",
  breadcrumb: ["Home", "Sports & Outdoors", "Gas Go Karts Under $500"],
  heroImage: "/images/featured-go-karts.webp",
  heroBadge: "New go-kart buyer guide",
  heroTitleLine1: "Gas Go Karts",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A practical look at gas powered and electric ride-on karts, mini ATVs, and budget outdoor toys that stay near the $500 mark for kids, teens, and backyard fun.",
  heroTrustNote:
    "Always confirm live Amazon pricing, age limits, local laws, and safety gear before buying any go-kart or ATV.",
  introHeading: "How we picked go karts and ride-ons under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide covers gas go karts under $500 alongside close alternatives: electric drift karts, 50cc gas four-wheelers, and a few honest accessory listings so you can compare real product types instead of warranty-plan noise from the source sheet.",
    "True two-seater gas go karts under $500 are rare at retail, so we highlight single-rider gas ATVs and electric karts where they deliver the most value, and we call out when a listing is a part or dirt bike rather than a kart frame."
  ],
  filters: [
    "Best gas pick",
    "Top rated",
    "Lowest price kart",
    "Gas powered",
    "Electric drift",
    "Kids 6-12",
    "Teen riders",
    "Off-road gas",
    "Trusted brand",
    "Parts & maintenance",
    "FRP GA40",
    "Razor Ground Force"
  ],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs"],
  products: goKartProducts,
  buyingGuideHeading: "What to check before buying gas go karts under $500",
  buyingGuide: [
    {
      title: "Gas vs electric at this price",
      body:
        "Gas powered go karts under $500 usually show up as mini ATVs or four-wheelers with 40cc–50cc engines. Electric drift karts trade fuel for charging time but often include easier speed modes for younger drivers."
    },
    {
      title: "Do not assume two seats",
      body:
        "Cheap go karts under $500 and gas powered go karts under $500 2 seater searches mostly return single-rider frames. If you need a passenger seat, verify seat count and weight limits in photos and specs before buying."
    },
    {
      title: "Match terrain to the frame",
      body:
        "Off road go karts under $500 in this list are usually ATV-style rigs with suspension and larger tires, while low electric karts are better on pavement and smooth driveways."
    },
    {
      title: "Budget for safety gear",
      body:
        "Helmets, gloves, and pads should be part of the real cost. A go karts for sale under $500 deal is not complete if safety gear pushes you well past your target budget."
    }
  ],
  faqs: [
    {
      question: "Can you really find gas go karts under $500?",
      answer:
        "Complete adult-sized gas karts are hard to find new under $500. This guide focuses on kids gas ATVs, electric karts, and related ride-ons that stay near that price on Amazon."
    },
    {
      question: "Are cheap go karts under $500 safe for kids?",
      answer:
        "They can be appropriate with adult supervision, proper safety gear, and realistic speed expectations. Always follow the manufacturer age, weight, and terrain guidance."
    },
    {
      question: "What about two seater go karts under $500?",
      answer:
        "True two-seat gas karts at this price are uncommon. Most listings here are single-rider. If you need two seats, verify the product photos and weight limit instead of relying on search titles alone."
    },
    {
      question: "Is an electric kart better than a gas ATV?",
      answer:
        "Electric karts are quieter and simpler for driveway play. Gas models can run longer outdoors but need fuel, maintenance, and stricter safety habits. Choose based on rider age and where it will be used."
    }
  ],
  quickPicks: [
    { label: "Best gas pick", productId: "${featured?.id || "go-kart-7"}", reason: "40cc 4-stroke gas ATV with disc brakes, speed control, and the strongest gas-focused feature set in the sheet." },
    { label: "Lowest price kart", productId: "go-kart-9", reason: "Useful entry point when you want a ride-on kart frame without spending close to $500." },
    { label: "Top rated electric", productId: "go-kart-4", reason: "High buyer rating with practical speed, runtime, and safety-belt notes for ages 6-12." }
  ],
  budgetTips: [
    "Ignore scraped protection-plan bullet text and compare motor size, brakes, and weight limits instead.",
    "If you need off-road ability, prioritize suspension, tire size, and disc brakes over top speed claims.",
    "For driveway use, electric drift karts can be easier to manage than small gas engines.",
    "Leave room in the budget for a helmet and pads even when the kart itself is under $500."
  ],
  relatedArticles: [],
  featuredProductId: "${featured?.id || "go-kart-7"}",
  sortOptions: [
    { label: "Top rated", value: "rating-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" }
  ],
  defaultSort: "rating-desc",
  publishedTime: "${new Date().toISOString()}",
  modifiedTime: "${new Date().toISOString()}"
};
`;

fs.writeFileSync(outFile, ts);
console.log(`Wrote ${outFile} with ${products.length} products`);
