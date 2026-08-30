import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

type Props = { images: string[]; alt: string };

export default function ProduceImageLightbox({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const isPinching = useRef(false);
  const hasImages = images.length > 0;
  const goTo = (nextIndex: number) => { if (!hasImages) return; setActiveIndex((nextIndex + images.length) % images.length); setZoom(1); };
  const close = () => { setLightboxOpen(false); setZoom(1); };
  const distance = (first: { clientX: number; clientY: number }, second: { clientX: number; clientY: number }) => Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") goTo(activeIndex - 1);
      if (event.key === "ArrowLeft") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, lightboxOpen]);

  if (!hasImages) return null;
  return <><div className="overflow-hidden rounded-2xl bg-[#E8F0E4]"><button type="button" onClick={() => setLightboxOpen(true)} className="group relative block h-72 w-full text-right sm:h-[410px]" aria-label="تكبير صور المحصول"><img src={images[activeIndex]} alt={`${alt} — الصورة ${activeIndex + 1}`} className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#143D2B]/85 px-3 text-xs font-bold text-white"><Maximize2 className="h-4 w-4" />تكبير</span></button></div>{images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="صور المحصول">{images.map((image, index) => <button key={image} type="button" onClick={() => goTo(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${index === activeIndex ? "border-[#287343]" : "border-transparent"}`} aria-label={`عرض الصورة ${index + 1}`} aria-current={index === activeIndex}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}{lightboxOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="عارض صور المحصول" onClick={close}><div className="flex h-full w-full max-w-6xl flex-col" onClick={(event) => event.stopPropagation()}><div className="flex min-h-12 items-center justify-between text-white"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{activeIndex + 1} / {images.length}</span><div className="flex gap-2"><button type="button" onClick={() => setZoom((current) => current > 1 ? 1 : 1.75)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10" aria-label={zoom > 1 ? "تصغير الصورة" : "تكبير الصورة"}>{zoom > 1 ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}</button><button type="button" onClick={close} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10" aria-label="إغلاق العارض"><X className="h-5 w-5" /></button></div></div><div className="relative mt-3 flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden" onTouchStart={(event) => { if (event.touches.length === 2) { pinchStartDistance.current = distance(event.touches[0], event.touches[1]); pinchStartZoom.current = zoom; isPinching.current = true; touchStartX.current = null; return; } if (event.touches.length === 1 && zoom === 1) touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchMove={(event) => { if (event.touches.length !== 2 || pinchStartDistance.current === null) return; event.preventDefault(); const nextZoom = Math.min(3, Math.max(1, pinchStartZoom.current * (distance(event.touches[0], event.touches[1]) / pinchStartDistance.current))); setZoom(nextZoom); }} onTouchEnd={(event) => { if (isPinching.current) { if (event.touches.length < 2) { isPinching.current = false; pinchStartDistance.current = null; } return; } const start = touchStartX.current; const end = event.changedTouches[0]?.clientX; if (zoom === 1 && start !== null && end !== undefined && Math.abs(end - start) >= 56) goTo(end < start ? activeIndex + 1 : activeIndex - 1); touchStartX.current = null; }}><img src={images[activeIndex]} alt={`${alt} — صورة مكبرة ${activeIndex + 1}`} className={`max-h-full max-w-full object-contain transition-transform duration-200 motion-reduce:transition-none ${zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`} style={{ transform: `scale(${zoom})` }} onClick={() => setZoom((current) => current > 1 ? 1 : 1.75)} />{images.length > 1 && <><button type="button" onClick={() => goTo(activeIndex - 1)} className="absolute right-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 text-white sm:right-4" aria-label="الصورة السابقة"><ChevronRight className="h-6 w-6" /></button><button type="button" onClick={() => goTo(activeIndex + 1)} className="absolute left-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 text-white sm:left-4" aria-label="الصورة التالية"><ChevronLeft className="h-6 w-6" /></button></>}</div><p className="mt-3 text-center text-xs text-white/70">قرّب أو باعد بإصبعين للتكبير، واسحب للتنقل عندما تكون الصورة بحجمها الطبيعي</p></div></div>}</>;
}
