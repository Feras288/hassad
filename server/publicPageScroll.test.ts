import { describe, expect, it } from "vitest";
import { MARKETPLACE_SCROLL_POSITION_KEY, isPublicPagePath, readSavedMarketplaceScroll, shouldRestoreMarketplaceScroll } from "../client/src/lib/publicPageScroll";

describe("public page scroll policy", () => {
  it("يعيد الصفحات العامة للأعلى ولا يعامل لوحات التحكم كصفحات عامة", () => {
    expect(isPublicPagePath("/marketplace")).toBe(true);
    expect(isPublicPagePath("/product/ap1")).toBe(true);
    expect(isPublicPagePath("/dashboard/orders")).toBe(false);
  });

  it("يستعيد موضع السوق فقط بعد تفاصيل منتج", () => {
    expect(shouldRestoreMarketplaceScroll("/marketplace", "/product/ap1")).toBe(true);
    expect(shouldRestoreMarketplaceScroll("/marketplace", "/diagnosis")).toBe(false);
    expect(shouldRestoreMarketplaceScroll("/diagnosis", "/product/ap1")).toBe(false);
  });

  it("يقرأ موضع سوق صالحاً ويتجاهل القيم غير الصالحة", () => {
    const storage = { getItem: (key: string) => key === MARKETPLACE_SCROLL_POSITION_KEY ? "480" : null } as Storage;
    expect(readSavedMarketplaceScroll(storage)).toBe(480);
    expect(readSavedMarketplaceScroll({ getItem: () => "-3" } as Storage)).toBeNull();
  });
});
