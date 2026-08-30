export interface PriceTier {
  minQuantity: number;
  unitPrice: number;
}

export type TierPricingDate = Date | string | number | null | undefined;

export interface TierPricingWindow {
  tierPricingStartsAt?: TierPricingDate;
  tierPricingEndsAt?: TierPricingDate;
}

function toTimestamp(value: TierPricingDate) {
  if (value == null) return null;
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function isTierPricingActive(window: TierPricingWindow = {}, now = new Date()) {
  const nowTimestamp = now.getTime();
  const startsAt = toTimestamp(window.tierPricingStartsAt);
  const endsAt = toTimestamp(window.tierPricingEndsAt);
  return (!startsAt || nowTimestamp >= startsAt) && (!endsAt || nowTimestamp <= endsAt);
}

export function getTierOfferRemainingMilliseconds(window: TierPricingWindow = {}, now = new Date()) {
  if (!isTierPricingActive(window, now)) return null;
  const endsAt = toTimestamp(window.tierPricingEndsAt);
  if (!endsAt) return null;
  const remaining = endsAt - now.getTime();
  return remaining > 0 ? remaining : null;
}

export function isTierOfferEndingSoon(window: TierPricingWindow = {}, now = new Date(), thresholdMs = 72 * 60 * 60 * 1000) {
  const remaining = getTierOfferRemainingMilliseconds(window, now);
  return remaining !== null && remaining <= thresholdMs;
}

export function formatTierOfferCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0 ? `${days}ي ${hours}س` : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function normalizePriceTiers(tiers: PriceTier[] | null | undefined): PriceTier[] {
  const seen = new Set<number>();
  return (tiers ?? [])
    .filter((tier) => Number.isInteger(tier.minQuantity) && tier.minQuantity > 1 && Number.isInteger(tier.unitPrice) && tier.unitPrice >= 0)
    .sort((a, b) => a.minQuantity - b.minQuantity)
    .filter((tier) => (seen.has(tier.minQuantity) ? false : (seen.add(tier.minQuantity), true)));
}

export function getActivePriceTiers(tiers: PriceTier[] | null | undefined, window: TierPricingWindow = {}, now = new Date()) {
  return isTierPricingActive(window, now) ? normalizePriceTiers(tiers) : [];
}

/** Returns the applicable unit price for the requested quantity, falling back to the regular product price. */
export function getTieredUnitPrice(basePrice: number, tiers: PriceTier[] | null | undefined, quantity: number, window: TierPricingWindow = {}) {
  return getActivePriceTiers(tiers, window).reduce((currentPrice, tier) => quantity >= tier.minQuantity ? tier.unitPrice : currentPrice, basePrice);
}

export function hasReachedHigherDiscountTier(basePrice: number, tiers: PriceTier[] | null | undefined, previousQuantity: number, nextQuantity: number, window: TierPricingWindow = {}) {
  if (nextQuantity <= previousQuantity) return false;
  return getTieredUnitPrice(basePrice, tiers, nextQuantity, window) < getTieredUnitPrice(basePrice, tiers, previousQuantity, window);
}

export function getNextPriceTier(tiers: PriceTier[] | null | undefined, quantity: number, window: TierPricingWindow = {}) {
  return getActivePriceTiers(tiers, window).find((tier) => tier.minQuantity > quantity) ?? null;
}

export function calculateTierSavings(basePrice: number, tiers: PriceTier[] | null | undefined, quantity: number, window: TierPricingWindow = {}) {
  return Math.max(0, basePrice - getTieredUnitPrice(basePrice, tiers, quantity, window)) * quantity;
}

export function getNextTierProgress(tiers: PriceTier[] | null | undefined, quantity: number, window: TierPricingWindow = {}) {
  const activeTiers = getActivePriceTiers(tiers, window);
  const nextTier = activeTiers.find((tier) => tier.minQuantity > quantity) ?? null;
  if (!nextTier) return { nextTier: null, remainingQuantity: 0, progressPercent: activeTiers.length > 0 ? 100 : 0 };
  const currentTier = [...activeTiers].reverse().find((tier) => tier.minQuantity <= quantity);
  const previousThreshold = currentTier?.minQuantity ?? 0;
  const range = Math.max(1, nextTier.minQuantity - previousThreshold);
  return { nextTier, remainingQuantity: nextTier.minQuantity - quantity, progressPercent: Math.max(0, Math.min(100, Math.round(((quantity - previousThreshold) / range) * 100))) };
}
