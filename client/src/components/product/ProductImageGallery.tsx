/*
 * HASAAD PLATFORM — Product Image Gallery
 * Design: "مزرعة واضحة" — معرض منتج mobile-first بصور بارزة وأزرار ظاهرة للمزارع.
 * Interactive image gallery with thumbnails, zoom, and lightbox — RTL-aware.
 */

import { useState, useCallback, useRef } from "react";
import { ZoomIn, X, ChevronRight, ChevronLeft, Expand, ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
  badgeColor?: string;
  discount?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  badge,
  badgeColor,
  discount,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const touchStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const ignoreClickRef = useRef(false);
  const activeImage = images[activeIndex];
  const canShowActiveImage = Boolean(activeImage) && !failedImages.includes(activeIndex);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, [isZoomed]);

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || images.length < 2) return;
    touchStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    ignoreClickRef.current = true;
    if (deltaX < 0) next(); else prev();
    window.setTimeout(() => { ignoreClickRef.current = false; }, 0);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[#E0E9DE] bg-[#F4F7F1] sm:aspect-square sm:rounded-[22px]">
          {/* Badges */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {badge && (
              <span
                className="rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: badgeColor || "#C9A227" }}
              >
                {badge}
              </span>
            )}
            {discount && (
            <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                خصم {discount}٪
              </span>
            )}
          </div>

          {/* Main Image with zoom */}
          <div
            className={`h-full w-full overflow-hidden touch-pan-y ${canShowActiveImage ? "cursor-zoom-in" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerEnd}
            onPointerCancel={() => { touchStartRef.current = null; }}
            onClick={() => { if (canShowActiveImage && !ignoreClickRef.current) setLightboxOpen(true); }}
          >
            {canShowActiveImage ? <img
              src={activeImage}
              alt={`${productName} - صورة ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={() => setFailedImages((current) => current.includes(activeIndex) ? current : [...current, activeIndex])}
              style={isZoomed ? { transform: "scale(2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            /> : <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-[#718078]"><ImageOff className="h-8 w-8" /><p className="text-sm font-semibold">لم يضف المورد صورة للمنتج بعد</p></div>}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="الصورة السابقة"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition-all duration-200 hover:scale-105 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 text-[#263238]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="الصورة التالية"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition-all duration-200 hover:scale-105 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 text-[#263238]" />
              </button>
            </>
          )}

          {/* Expand button */}
          {canShowActiveImage && <button
            onClick={() => setLightboxOpen(true)}
            aria-label="تكبير الصورة"
            className="absolute bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition-all duration-200 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
          >
            <Expand className="w-4 h-4 text-[#263238]" />
          </button>}

          {/* Zoom hint */}
          <div className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 text-xs text-white transition-all duration-200 group-hover:opacity-100 md:flex md:opacity-0">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>تكبير</span>
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white">
              {activeIndex + 1}/{images.length}
            </div>
          )}
          {images.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center md:hidden">
              <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white">اسحب للتبديل بين الصور</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="scroll-snap-x flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`عرض الصورة ${i + 1}`}
                className={`scroll-snap-start h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-20 ${
                  activeIndex === i
                    ? "border-[#2E7D32] shadow-md scale-105"
                    : "border-gray-200 hover:border-[#4CAF50] opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={failedImages.includes(i) ? "" : img}
                  alt={`${productName} - مصغرة ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setFailedImages((current) => current.includes(i) ? current : [...current, i])}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter in lightbox */}
          <div className="absolute top-4 right-1/2 translate-x-1/2 bg-white/10 text-white text-sm px-4 py-2 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>

          <div
            className="relative max-w-4xl w-full max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage ?? ""}
              alt={productName}
              className="w-full h-full object-contain rounded-xl"
              onError={() => setFailedImages((current) => current.includes(activeIndex) ? current : [...current, activeIndex])}
              style={{ maxHeight: "85vh" }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeIndex === i ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  {failedImages.includes(i) ? <div className="flex h-full w-full items-center justify-center bg-white/10"><ImageOff className="h-4 w-4 text-white/70" /></div> : <img src={img} alt="" className="w-full h-full object-cover" onError={() => setFailedImages((current) => current.includes(i) ? current : [...current, i])} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
