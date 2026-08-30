import type { PriceTier, TierPricingWindow } from "@/lib/tierPricing";
import { getNextTierProgress, isTierPricingActive } from "@/lib/tierPricing";

interface TierDiscountProgressProps extends TierPricingWindow {
  tiers: PriceTier[] | null | undefined;
  quantity: number;
  unit: string;
  compact?: boolean;
}

export default function TierDiscountProgress({ tiers, quantity, unit, compact = false, ...pricingWindow }: TierDiscountProgressProps) {
  if (!tiers?.length || !isTierPricingActive(pricingWindow)) return null;
  const { nextTier, remainingQuantity, progressPercent } = getNextTierProgress(tiers, quantity, pricingWindow);
  if (!nextTier) return <div className={`rounded-xl border border-[#CFE7D1] bg-[#EFF9EE] ${compact ? "px-2.5 py-2" : "px-3 py-2.5"}`}><p className="text-xs font-black text-[#247044]">وصلت إلى أفضل سعر جملة متاح</p></div>;

  return (
    <div className={`rounded-xl border border-[#E8D8B5] bg-[#FFF9EC] ${compact ? "px-2.5 py-2" : "px-3 py-2.5"}`}>
      <div className="flex items-center justify-between gap-3 text-xs"><span className="font-black text-[#76531B]">يتبقى {remainingQuantity.toLocaleString("ar-SA")} {unit} لسعر {nextTier.unitPrice.toLocaleString("ar-SA")} ريال</span><span className="shrink-0 font-bold text-[#96712D]">{progressPercent.toLocaleString("ar-SA")}٪</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0DFB8]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent} aria-label="التقدم نحو سعر الخصم التالي"><div className="h-full rounded-full bg-[#C99224]" style={{ width: `${progressPercent}%` }} /></div>
      {!compact && <p className="mt-1.5 text-[11px] text-[#8A6A31]">أضف الكمية المتبقية ليُطبّق سعر الشريحة تلقائياً.</p>}
    </div>
  );
}
