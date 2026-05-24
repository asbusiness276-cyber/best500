/** Category-specific comparison columns and editorial defaults for CSV publish. */

export function categoryFromSlug(slug, keyword = "") {
  const key = `${slug} ${keyword}`.toLowerCase();
  if (/wheelchair/.test(key)) return "wheelchair";
  if (/watch/.test(key)) return "watch";
  if (/ham-radio|ham radio/.test(key)) return "ham-radio";
  if (/washer|dryer/.test(key)) return "washer-dryer";
  if (/headset/.test(key)) return "headset";
  if (/go-kart|go kart/.test(key)) return "go-kart";
  if (/dirt-bike|dirt bike/.test(key)) return "dirt-bike";
  if (/refrigerator|fridge/.test(key)) return "refrigerator";
  if (/laptop/.test(key)) return "laptop";
  if (/barbecue|bbq|grill/.test(key)) return "grill";
  return "generic";
}

export function comparisonColumnsForCategory(category) {
  const map = {
    wheelchair: ["Product", "Price", "Rating", "Best for", "Capacity", "Range", "Foldable", "Motor", "Weight"],
    watch: ["Product", "Price", "Rating", "Best for", "Movement", "Case size", "Water resistance", "Band"],
    "ham-radio": ["Product", "Price", "Rating", "Best for", "Bands", "Power", "Type", "Features"],
    "washer-dryer": ["Product", "Price", "Rating", "Best for", "Capacity", "Type", "Dryer", "Drain"],
    headset: ["Product", "Price", "Rating", "Best for", "Driver", "Connectivity", "Battery", "Mic"],
    "go-kart": ["Product", "Price", "Rating", "Best for", "Engine", "Speed", "Rider age", "Fuel type"],
    "dirt-bike": ["Product", "Price", "Rating", "Best for", "Motor", "Speed", "Range", "Battery"],
    refrigerator: ["Product", "Price", "Rating", "Best for", "Capacity", "Freezer", "Size", "Door"],
    laptop: ["Product", "Price", "Rating", "Best for", "Processor", "Memory", "Storage", "Display"],
    grill: ["Product", "Price", "Rating", "Best for", "Burners", "Heat source", "Cooking area", "Fuel", "Material"],
    generic: ["Product", "Price", "Rating", "Best for", "Key specs"]
  };
  return map[category] || map.generic;
}

export function introParagraphsForCategory(category, keyword) {
  const base = `This BestBuyUnder500.com guide focuses on products that balance price, ratings, and useful features for shoppers staying under $500.`;
  const extras = {
    wheelchair:
      "We compared foldable power chairs on motor power, mile range, weight capacity, fold size, and travel-friendly battery options so you can match a chair to doorways, trunks, and caregiver lifting ability.",
    watch:
      "We organized picks around movement type, water resistance, case size, and band material so you can compare dress, sport, chronograph, Eco-Drive, and automatic watches without guesswork.",
    "ham-radio":
      "We compared mobile, handheld, and HF rigs on band coverage, power output, operating modes, and programming needs for licensed operators shopping near the $500 ceiling.",
    "washer-dryer":
      "We grouped portable laundry sets by washer capacity, dryer size, full-automatic vs twin-tub operation, and apartment-friendly drainage so small-space buyers can compare real laundry formats.",
    headset:
      "We compared sound tuning, mic quality, connection type, noise canceling, and comfort for long gaming, streaming, and desk sessions.",
    "go-kart":
      "We compared gas mini ATVs and electric drift karts on engine or motor size, speed modes, rider age range, and outdoor use so backyard buyers know what they are getting.",
    "dirt-bike":
      "We compared adult and youth e-dirt bikes on motor power, top speed, battery capacity, brakes, and suspension for trail and driveway use.",
    refrigerator:
      "We compared compact refrigerators on total capacity, freezer layout, shelf flexibility, footprint, and quiet operation for apartments, dorms, and offices.",
    laptop:
      "We compared processors, RAM, storage, and display size for school, work, streaming, and light gaming near the $500 mark.",
    grill:
      "We compared burner count, cooking area, fuel type, BTU output, and grate materials so you can match a grill to patio space, party size, and gas vs charcoal preference.",
    generic:
      "Each pick includes price, rating, key specs, and practical buyer notes so you can compare options quickly."
  };
  return [base, extras[category] || extras.generic];
}

export function faqHowChosenAnswer(category) {
  const answers = {
    wheelchair:
      "We filtered listings above $500, removed duplicate ASINs and warranty-plan clutter, then ranked foldable power chairs by buyer rating, price, motor watts, range claims, and weight capacity.",
    watch:
      "We verified each watch stayed under $500, compared movement and wearability specs, and ranked picks by rating, brand reputation, and everyday versatility.",
    "ham-radio":
      "We compared band coverage, power output, form factor, and buyer ratings, then prioritized radios that offer useful features for licensed operators without blowing the budget.",
    "washer-dryer":
      "We compared wash and dry capacity, machine type, drain setup, and ratings, then highlighted bundles that make sense for apartments, dorms, and RVs.",
    headset:
      "We compared audio tuning, mic quality, wireless features, comfort, and ratings to surface headsets that work for gaming, calls, and long desk sessions.",
    "go-kart":
      "We compared engine or motor specs, speed modes, rider age guidance, and safety features, then flagged when a listing is a kart, ATV, or accessory rather than a full ride-on.",
    "dirt-bike":
      "We compared motor power, battery size, speed claims, brakes, and suspension, then noted when live pricing sits slightly above a strict $500 cap.",
    refrigerator:
      "We compared capacity, freezer layout, shelf flexibility, dimensions, and ratings for compact refrigerators that fit small kitchens.",
    laptop:
      "We compared CPU, memory, storage, display, and ratings, prioritizing practical everyday performance over flashy marketing claims.",
    grill:
      "We compared burner layout, cooking area, fuel type, BTU claims, and buyer ratings, then prioritized grills with useful side burners and durable grates under $500.",
    generic:
      "We compared price, rating, and the most useful spec bullets for this category, then ranked picks for overall value under $500."
  };
  return answers[category] || answers.generic;
}

export function metaTitleFromKeyword(keyword) {
  const trimmed = keyword.trim();
  if (/2026/i.test(trimmed)) return trimmed;
  if (/under\s+\$500/i.test(trimmed)) return `${trimmed.replace(/\s+in\s+2026$/i, "")} in 2026`;
  return `${trimmed} Under $500 in 2026`;
}
