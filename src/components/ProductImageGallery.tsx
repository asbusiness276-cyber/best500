import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { Product } from "../types";
import { AffiliateLink } from "./AffiliateLink";
import { HOVER_CTAS } from "./PriceCtaButton";

interface ProductImageGalleryProps {
  product: Product;
  cardIndex?: number;
  eager?: boolean;
  /** When false, show `product.image` only — no carousel or lightbox. */
  enableCarousel?: boolean;
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

function LightboxCta({ href, price, label }: { href: string; price: number; label: string }) {
  return (
    <AffiliateLink
      href={href}
      ariaLabel={`${label} for $${price}`}
      className="group inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white shadow-lg ring-1 ring-slate-800 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60"
    >
      <span className="text-base font-bold tracking-tight">${price}</span>
      <span className="rounded-lg bg-white/10 px-3 py-1.5 text-base font-bold transition group-hover:bg-white/20">{label}</span>
    </AffiliateLink>
  );
}

function ProductImageLightbox({
  product,
  images,
  startIndex,
  cardIndex,
  onClose
}: {
  product: Product;
  images: string[];
  startIndex: number;
  cardIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const touchStart = useRef<number | null>(null);
  const ctaLabel = HOVER_CTAS[cardIndex % HOVER_CTAS.length].replace(/^[^\w]+/, "").trim() || "Check Deal";
  const shortCta = ctaLabel.split(" ").slice(-2).join(" ") || "Check Deal";

  useBodyScrollLock(true);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setIndex((current) => clampIndex(current - 1, images.length));
      if (event.key === "ArrowRight") setIndex((current) => clampIndex(current + 1, images.length));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  const goPrev = useCallback(() => setIndex((current) => clampIndex(current - 1, images.length)), [images.length]);
  const goNext = useCallback(() => setIndex((current) => clampIndex(current + 1, images.length)), [images.length]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${product.shortTitle} images`}>
      <button type="button" className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" aria-label="Close image viewer" onClick={onClose} />
      <div className="relative z-[1] flex max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:mx-4 sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{product.shortTitle}</p>
            <p className="text-xs text-slate-500">{index + 1} / {images.length}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative flex min-h-[52vh] flex-1 items-center justify-center bg-slate-950/5 px-3 py-4 sm:min-h-[420px]"
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (touchStart.current === null || images.length <= 1) return;
            const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
            if (Math.abs(delta) > 48) {
              if (delta < 0) goNext();
              else goPrev();
            }
            touchStart.current = null;
          }}
        >
          <img
            src={images[index]}
            alt={`${product.shortTitle} — image ${index + 1}`}
            className="max-h-[58vh] w-full object-contain sm:max-h-[480px]"
            loading="eager"
            decoding="async"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 md:inline-flex"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 md:inline-flex"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-3">
            {images.map((src, dotIndex) => (
              <button
                key={`${src}-${dotIndex}`}
                type="button"
                aria-label={`Show image ${dotIndex + 1}`}
                aria-current={dotIndex === index ? "true" : undefined}
                onClick={() => setIndex(dotIndex)}
                className={`h-2.5 rounded-full transition ${dotIndex === index ? "w-7 bg-emerald-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
          <LightboxCta href={product.affiliateUrl} price={product.price} label={shortCta} />
        </div>
      </div>
    </div>
  );
}

export function ProductImageGallery({ product, cardIndex = 0, eager = false, enableCarousel = false }: ProductImageGalleryProps) {
  const carouselImages = enableCarousel && product.images?.length ? product.images : [];
  const images = carouselImages.length ? carouselImages : product.image ? [product.image] : [];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const showCarousel = enableCarousel && carouselImages.length > 0;
  const hasMultiple = showCarousel && images.length > 1;

  const goPrev = useCallback(() => setIndex((current) => clampIndex(current - 1, images.length)), [images.length]);
  const goNext = useCallback(() => setIndex((current) => clampIndex(current + 1, images.length)), [images.length]);

  if (!images.length) {
    return <div className="product-gallery flex min-h-[280px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 sm:min-h-[320px]">No image</div>;
  }

  if (!showCarousel) {
    return (
      <div className="product-gallery overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
        <div className="relative flex min-h-[280px] items-center justify-center p-3 sm:min-h-[320px] lg:min-h-[300px]">
          <img
            src={product.image}
            alt={product.shortTitle}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="max-h-[min(72vw,420px)] w-full object-contain p-2 sm:max-h-[360px] lg:max-h-[280px]"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="product-gallery relative overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
        <button
          type="button"
          className="group relative block w-full cursor-zoom-in touch-pan-y"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View larger images of ${product.shortTitle}`}
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (touchStart.current === null || !hasMultiple) return;
            const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
            if (Math.abs(delta) > 48) {
              event.preventDefault();
              if (delta < 0) goNext();
              else goPrev();
              touchStart.current = null;
              return;
            }
            touchStart.current = null;
          }}
        >
          <div className="relative flex min-h-[280px] items-center justify-center p-3 sm:min-h-[320px] lg:min-h-[300px]">
            {images.map((src, slideIndex) => (
              <img
                key={`${src}-${slideIndex}`}
                src={src}
                alt={`${product.shortTitle}${hasMultiple ? ` — image ${slideIndex + 1}` : ""}`}
                loading={eager && slideIndex === 0 ? "eager" : slideIndex === index ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 m-auto max-h-[min(72vw,420px)] w-full object-contain p-2 transition-opacity duration-300 sm:max-h-[360px] lg:max-h-[280px] ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
              />
            ))}
          </div>
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            Enlarge
          </span>
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow ring-1 ring-slate-200 transition hover:bg-emerald-50 md:inline-flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow ring-1 ring-slate-200 transition hover:bg-emerald-50 md:inline-flex"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-slate-900/25 to-transparent px-3 pb-3 pt-8">
              {images.map((src, dotIndex) => (
                <button
                  key={`dot-${src}-${dotIndex}`}
                  type="button"
                  aria-label={`Show image ${dotIndex + 1}`}
                  aria-current={dotIndex === index ? "true" : undefined}
                  onClick={(event) => { event.stopPropagation(); setIndex(dotIndex); }}
                  className={`rounded-full transition ${dotIndex === index ? "h-2.5 w-6 bg-white" : "h-2 w-2 bg-white/70 hover:bg-white"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <ProductImageLightbox
          product={product}
          images={images}
          startIndex={index}
          cardIndex={cardIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
