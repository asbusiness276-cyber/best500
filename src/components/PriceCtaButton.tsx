import { AffiliateLink } from "./AffiliateLink";

export const HOVER_CTAS = [
  "🔥 Buy Now",
  "💰 See Deal",
  "⚡ Grab It",
  "🛒 Shop Now",
  "👀 View Deal",
  "✨ Get It"
] as const;

interface PriceCtaButtonProps {
  href: string;
  price: number;
  productName: string;
  rowIndex?: number;
  compact?: boolean;
}

export function PriceCtaButton({ href, price, productName, rowIndex = 0, compact = false }: PriceCtaButtonProps) {
  const hoverLabel = HOVER_CTAS[rowIndex % HOVER_CTAS.length];
  const textSize = compact ? "text-sm" : "text-base";
  const sizeClasses = compact
    ? "min-w-[112px] max-w-[132px] px-2.5 py-2"
    : "w-full max-w-xs px-5 py-3";
  const wrapClasses = compact ? "inline-flex max-w-[132px]" : "inline-flex w-full max-w-xs";

  return (
    <span className={`price-cta-fire-wrap ${wrapClasses}`}>
      <AffiliateLink
        href={href}
        ariaLabel={`${hoverLabel} for ${productName}`}
        className={`price-cta-fire price-cta-paper group relative inline-flex w-full min-w-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950 font-bold text-white shadow-md ring-1 ring-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60 ${sizeClasses}`}
      >
        <span className="price-cta-paper__fold" aria-hidden="true" />
        <span className="price-cta-fire__glow" aria-hidden="true" />
        <span className="price-cta-fire__ember price-cta-fire__ember--a" aria-hidden="true" />
        <span className="price-cta-fire__ember price-cta-fire__ember--b" aria-hidden="true" />
        <span className="price-cta-fire__shine" aria-hidden="true" />
        <span className="price-cta-fire__content relative z-[2] flex w-full min-w-0 items-center justify-center">
          <span className={`price-cta-fire__price block w-full truncate text-center font-bold ${textSize} transition duration-300 group-hover:opacity-0 group-focus-visible:opacity-0`}>
            ${price}
          </span>
          <span className={`price-cta-fire__cta absolute inset-0 flex min-w-0 items-center justify-center whitespace-nowrap px-1 text-center font-bold ${textSize} leading-snug opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`}>
            {hoverLabel}
          </span>
        </span>
      </AffiliateLink>
    </span>
  );
}
