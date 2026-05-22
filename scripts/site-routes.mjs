export const SITE_URL = "https://bestbuyunder500.com";

export const articleRoutes = [
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
