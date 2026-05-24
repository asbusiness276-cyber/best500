export const SITE_URL = "https://bestbuyunder500.com";

export const articleRoutes = [
  {
    path: "/best-barbecue-grill-under-500/",
    title: "Best Barbecue Grill Under $500 in 2026",
    description: "Compare the best barbecue grill under $500—propane, dual-fuel, and charcoal picks with burners, cooking area, BTU, and build quality for patio and backyard BBQ.",
    category: "Outdoor & Travel"
  },
  {
    path: "/best-electric-wheelchair-under-500/",
    title: "Best Electric Wheelchair Under $500 (2026)",
    description: "Compare the best electric wheelchair under $500 with foldable, lightweight, and long-range picks—motor power, weight capacity, and travel notes.",
    category: "Home & Living"
  },
  {
    path: "/best-gaming-laptop-under-500/",
    title: "Best Gaming Laptop Under $500 in 2026",
    description: "Compare the best gaming laptop under $500 picks with specs, pros, cons, quick picks, and buying tips.",
    category: "Tech & Outdoors"
  },
  {
    path: "/best-gaming-headsets-for-under-500/",
    title: "Best Gaming Headsets Under $500 in 2026",
    description: "Compare the best gaming headsets under $500 with wireless, noise-canceling, audiophile, and developer-friendly picks.",
    category: "Tech & Outdoors"
  },
  {
    path: "/refrigerator-sale-under-500/",
    title: "Refrigerator Sale Under $500 in 2026",
    description: "Compare refrigerator sale under $500 picks for apartments, dorms, offices, and compact kitchens.",
    category: "Home & Living"
  },
  {
    path: "/best-washer-and-dryer-bundles-under-500/",
    title: "Best Washer & Dryer Bundles Under $500 in 2026",
    description: "Compare the best washer and dryer bundles under $500 with portable sets, compact combos, capacity, and apartment-friendly value notes.",
    category: "Home & Living"
  },
  {
    path: "/ham-radio-under-500/",
    title: "Best Ham Radio Under $500 in 2026",
    description: "Compare the best ham radio under $500 picks for mobile, handheld, HF, and dual-band transceivers.",
    category: "Tech & Outdoors"
  },
  {
    path: "/best-watches-mens-under-500/",
    title: "Best Men's Watches Under $500 in 2026",
    description: "Compare the best men's watches under $500 with dress, dive, chronograph, Eco-Drive, and automatic picks.",
    category: "Fashion"
  },
  {
    path: "/gas-go-karts-under-500/",
    title: "Gas Go Karts Under $500 in 2026",
    description: "Compare gas go karts under $500 with gas ATVs, electric drift karts, safety notes, and budget ride-on picks.",
    category: "Sports & Outdoors"
  },
  {
    path: "/electric-dirt-bike-under-500/",
    title: "Electric Dirt Bike Under $500 in 2026",
    description: "Compare electric dirt bikes under $500 with adult and youth picks, motor power, range, hydraulic brakes, and honest Amazon pricing notes.",
    category: "Sports & Outdoors"
  }
];

export const staticRoutes = [
  { path: "/", title: "BestBuyUnder500" },
  { path: "/about/", title: "About BestBuyUnder500" },
  { path: "/contact/", title: "Contact BestBuyUnder500" },
  { path: "/write-for-us/", title: "Write for Us" },
  { path: "/privacy-policy/", title: "Privacy Policy" },
  { path: "/terms-and-conditions/", title: "Terms and Conditions" },
  { path: "/affiliate-disclosure/", title: "Affiliate Disclosure" }
];

export const allRoutes = [...staticRoutes, ...articleRoutes];
