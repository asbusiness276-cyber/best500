import { affiliateDisclosure } from "../constants/affiliate";

const content: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About BestBuyUnder500",
    body: [
      "BestBuyUnder500.com is a product buying-guide website for readers who want useful, reliable recommendations without wasting time on confusing listings.",
      "We focus on practical products around the $500 budget range and explain the important tradeoffs in plain language: price, features, comfort, performance, durability, and who each product is actually best for.",
      "Our editorial goal is to keep every guide helpful for real buyers. We avoid fake scarcity, pay-to-play rankings, and unsupported claims. Affiliate links may help support the site, but they do not change the price you pay."
    ]
  },
  contact: {
    title: "Contact BestBuyUnder500",
    body: [
      "For corrections, editorial feedback, partnership questions, or general inquiries, contact us at bestbuyunder500@gmail.com.",
      "If you found an outdated price, unavailable product, broken affiliate link, or product detail that should be updated, please include the guide URL and the product name so we can review it quickly.",
      "We aim to keep BestBuyUnder500.com useful, transparent, and reader-friendly as the site grows."
    ]
  },
  "write-for-us": {
    title: "Write for Us",
    body: [
      "Contributor guidelines for guest posts and editorial pitches.",
      "BestBuyUnder500 accepts a limited number of high-quality guest contributions that help readers make better buying decisions on a budget. We prioritize original reporting, hands-on testing notes, transparent research, and clear disclosure.",
      "What we publish: buying guides and comparisons aligned with our site focus, data-backed roundups with specs and pricing context, and evergreen FAQs that match real search intent.",
      "Affiliate links in guest content: BestBuyUnder500 retains affiliate monetization on published pages. Contributors may not embed their own affiliate tags in the body of the article.",
      "If you need to reference a product you sell or represent, you may include one plain URL to your site or product page only in the introduction or conclusion, clearly labeled as your company or project, and only when it adds genuine reader value. We may remove or nofollow links at our discretion for reader trust and FTC alignment.",
      "Editorial standards: original writing not published elsewhere, no undisclosed financial relationships with brands you cover, accurate specs and prices at time of writing, cited sources where applicable, respectful language, and no medical claims for non-medical products.",
      "How to pitch: send a 3-5 bullet outline, 2 sample clips, and your relevant expertise to bestbuyunder500@gmail.com with subject line Write for us - [topic]. We reply only if there is a fit."
    ]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: [
      "BestBuyUnder500.com may collect basic non-personal information such as browser type, device type, pages visited, referral source, and general usage patterns through standard hosting logs or analytics tools.",
      "We use this information to improve site performance, understand which guides are helpful, fix technical issues, and maintain a better reading experience.",
      "Our pages may contain affiliate links. When you click an affiliate link, the merchant or affiliate network may use cookies or tracking parameters to attribute a qualifying purchase.",
      "We do not sell personal information. If you contact us by email, we use your message only to respond to your inquiry or review the issue you reported."
    ]
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    body: [
      "BestBuyUnder500.com content is provided for general informational and educational purposes. Product recommendations are based on available information, supplied product sheets, product details, and editorial judgment at the time of publication.",
      "Prices, coupons, availability, ratings, specifications, and product bundles can change without notice. Always confirm the latest details on the retailer page before making a purchase.",
      "We try to keep guides accurate and useful, but we cannot guarantee that every product will be available, suitable for every reader, or unchanged after publication.",
      "By using this site, you agree to use the information responsibly and make your own final buying decision."
    ]
  },
  "affiliate-disclosure": {
    title: "Affiliate Disclosure",
    body: [
      affiliateDisclosure,
      "Some links on BestBuyUnder500.com are affiliate links. If you click one of these links and make a qualifying purchase, we may earn a commission at no additional cost to you.",
      "Affiliate relationships do not control our editorial rankings. We aim to explain why a product may be useful, who it is best for, and what tradeoffs buyers should consider.",
      "Affiliate links are marked with sponsored/nofollow relationship attributes where they appear."
    ]
  }
};

export function StaticPage({ slug }: { slug: string }) {
  const page = content[slug] || { title: "Page not found", body: ["We could not find this page."] };
  return (
    <main className="mx-auto max-w-4xl px-4 py-14 lg:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">{page.title}</h1>
        <div className="mt-6 space-y-4 text-lg leading-8 text-slate-700">
          {page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {slug === "contact" && (
          <form action="mailto:bestbuyunder500@gmail.com" method="post" encType="text/plain" className="mt-8 grid gap-4 rounded-3xl bg-slate-50 p-5">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">Name</label>
              <input id="name" name="name" required className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
              <input id="email" name="email" type="email" required className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="topic" className="text-sm font-bold text-slate-700">Topic</label>
              <input id="topic" name="topic" placeholder="Correction, partnership, article pitch, or feedback" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
              <textarea id="message" name="message" rows={6} required className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
            </div>
            <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-emerald-600">
              Send Message
            </button>
            <p className="text-sm text-slate-500">This opens your email app and sends the message to bestbuyunder500@gmail.com.</p>
          </form>
        )}
      </div>
    </main>
  );
}
