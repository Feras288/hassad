import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { formatTierOfferCountdown, getTierOfferRemainingMilliseconds, isTierOfferEndingSoon, isTierPricingActive, type TierPricingWindow } from "@/lib/tierPricing";

interface WholesaleOfferBadgeProps extends TierPricingWindow {
  compact?: boolean;
}

export default function WholesaleOfferBadge({ compact = false, ...pricingWindow }: WholesaleOfferBadgeProps) {
  const [now, setNow] = useState(() => new Date());
  const active = isTierPricingActive(pricingWindow, now);
  const endingSoon = isTierOfferEndingSoon(pricingWindow, now);
  const remaining = getTierOfferRemainingMilliseconds(pricingWindow, now);

  useEffect(() => {
    if (!endingSoon) return;
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, [endingSoon]);

  if (!active) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[#C99224] font-black text-white shadow-sm ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}>
      <span>سعر الجملة</span>
      {endingSoon && remaining !== null && <span className="inline-flex items-center gap-0.5 border-r border-white/35 pr-1 text-white" dir="ltr" title="الوقت المتبقي للعرض"><Clock3 className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />{formatTierOfferCountdown(remaining)}</span>}
    </span>
  );
}
