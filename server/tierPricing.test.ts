import { describe, expect, it } from "vitest";
import { calculateTierSavings, formatTierOfferCountdown, getNextPriceTier, getNextTierProgress, getTierOfferRemainingMilliseconds, getTieredUnitPrice, hasReachedHigherDiscountTier, isTierOfferEndingSoon, isTierPricingActive, normalizePriceTiers } from "../client/src/lib/tierPricing";

describe("tiered product pricing", () => {
  const tiers = [
    { minQuantity: 5, unitPrice: 45 },
    { minQuantity: 50, unitPrice: 30 },
  ];

  it("selects the correct unit price for each quantity threshold", () => {
    expect(getTieredUnitPrice(50, tiers, 1)).toBe(50);
    expect(getTieredUnitPrice(50, tiers, 5)).toBe(45);
    expect(getTieredUnitPrice(50, tiers, 49)).toBe(45);
    expect(getTieredUnitPrice(50, tiers, 50)).toBe(30);
  });

  it("returns the next attainable tier and the full quantity-based saving", () => {
    expect(getNextPriceTier(tiers, 1)).toEqual({ minQuantity: 5, unitPrice: 45 });
    expect(getNextPriceTier(tiers, 5)).toEqual({ minQuantity: 50, unitPrice: 30 });
    expect(getNextPriceTier(tiers, 50)).toBeNull();
    expect(calculateTierSavings(50, tiers, 5)).toBe(25);
    expect(calculateTierSavings(50, tiers, 50)).toBe(1000);
  });

  it("normalizes invalid, duplicate, and unordered tier input defensively", () => {
    expect(normalizePriceTiers([{ minQuantity: 50, unitPrice: 30 }, { minQuantity: 5, unitPrice: 45 }, { minQuantity: 5, unitPrice: 40 }, { minQuantity: 1, unitPrice: 49 }])).toEqual(tiers);
  });

  it("applies tiers only inside their configured offer period and reports progress to the next tier", () => {
    const now = new Date("2026-08-15T12:00:00Z");
    const activeWindow = { tierPricingStartsAt: new Date("2026-08-01T00:00:00Z"), tierPricingEndsAt: new Date("2026-08-31T23:59:59Z") };
    const expiredWindow = { tierPricingEndsAt: new Date("2026-08-10T23:59:59Z") };
    expect(isTierPricingActive(activeWindow, now)).toBe(true);
    expect(isTierPricingActive(expiredWindow, now)).toBe(false);
    expect(getTieredUnitPrice(50, tiers, 5, activeWindow, now)).toBe(45);
    expect(getTieredUnitPrice(50, tiers, 5, expiredWindow, now)).toBe(50);
    expect(getNextPriceTier(tiers, 3, activeWindow, now)).toEqual({ minQuantity: 5, unitPrice: 45 });
    expect(getNextTierProgress(tiers, 3, activeWindow, now)).toMatchObject({ remainingQuantity: 2, progressPercent: 60, nextTier: { minQuantity: 5, unitPrice: 45 } });
  });

  it("marks a live offer ending within 72 hours and formats its countdown", () => {
    const now = new Date("2026-08-15T12:00:00Z");
    const endingSoon = { tierPricingStartsAt: new Date("2026-08-14T12:00:00Z"), tierPricingEndsAt: new Date("2026-08-17T11:00:00Z") };
    const endingLater = { tierPricingEndsAt: new Date("2026-08-20T12:00:00Z") };
    expect(isTierOfferEndingSoon(endingSoon, now)).toBe(true);
    expect(isTierOfferEndingSoon(endingLater, now)).toBe(false);
    expect(getTierOfferRemainingMilliseconds(endingSoon, now)).toBe(169_200_000);
    expect(formatTierOfferCountdown(2 * 86_400_000 + 3_600_000)).toBe("2ي 1س");
    expect(formatTierOfferCountdown(3_723_000)).toBe("01:02:03");
  });

  it("detects only upward quantity changes that unlock a lower unit price", () => {
    expect(hasReachedHigherDiscountTier(50, tiers, 4, 5)).toBe(true);
    expect(hasReachedHigherDiscountTier(50, tiers, 5, 6)).toBe(false);
    expect(hasReachedHigherDiscountTier(50, tiers, 5, 4)).toBe(false);
    expect(hasReachedHigherDiscountTier(50, tiers, 49, 50)).toBe(true);
  });
});
