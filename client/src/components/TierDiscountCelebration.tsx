import { useEffect, useState } from "react";
import { BadgeCheck, Sparkles } from "lucide-react";

interface TierDiscountCelebrationProps {
  productName: string;
  savedAmount: number;
  unitPrice: number;
  onDismiss: () => void;
}

const particles = [
  { x: -72, y: -58, color: "#C99224", delay: 0 },
  { x: -38, y: -88, color: "#4CAF50", delay: 40 },
  { x: 8, y: -74, color: "#F3D18A", delay: 80 },
  { x: 52, y: -66, color: "#2E7D32", delay: 120 },
  { x: 78, y: -28, color: "#C99224", delay: 160 },
  { x: 58, y: 22, color: "#A5D6A7", delay: 200 },
  { x: 20, y: 48, color: "#F3D18A", delay: 240 },
  { x: -26, y: 42, color: "#4CAF50", delay: 280 },
  { x: -65, y: 18, color: "#C99224", delay: 320 },
];

export default function TierDiscountCelebration({ productName, savedAmount, unitPrice, onDismiss }: TierDiscountCelebrationProps) {
  const [burst, setBurst] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const frame = window.requestAnimationFrame(() => setBurst(true));
    const timer = window.setTimeout(onDismiss, 3_800);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[100] mx-auto w-fit max-w-[calc(100%-2rem)]" dir="rtl" role="status" aria-live="polite">
      <div className="relative overflow-visible rounded-2xl border border-[#D9BE7A] bg-gradient-to-l from-[#1E6B3F] to-[#2E7D32] px-5 py-4 text-white shadow-[0_16px_36px_rgba(22,101,52,0.28)]">
        {!reducedMotion && particles.map((particle, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: particle.color,
              opacity: burst ? 0 : 1,
              transform: burst ? `translate(${particle.x}px, ${particle.y}px) rotate(${index % 2 ? 100 : -100}deg)` : "translate(0, 0) rotate(0deg)",
              transition: `transform 720ms cubic-bezier(0.23, 1, 0.32, 1) ${particle.delay}ms, opacity 400ms ease-out ${particle.delay + 300}ms`,
            }}
          />
        ))}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#F8D986]">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="flex items-center gap-1 text-sm font-black"><Sparkles className="h-4 w-4 text-[#F8D986]" />وصلت إلى سعر الجملة التالي</p>
            <p className="mt-1 max-w-[280px] text-xs leading-5 text-white/90">تم تطبيق سعر <strong>{unitPrice.toLocaleString("ar-SA")} ريال</strong> على «{productName}» وتوفير <strong>{savedAmount.toLocaleString("ar-SA")} ريال</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
