import { describe, expect, it } from "vitest";
import { getMarketplaceCategoryCount } from "../client/src/lib/marketplaceCategories";

describe("marketplace category counts", () => {
  const products = [{ category: "أسمدة" }, { category: "أسمدة" }, { category: "بذور" }];

  it("يعيد إجمالي المنتجات عند اختيار كل الفئات", () => {
    expect(getMarketplaceCategoryCount(products, "الكل")).toBe(3);
  });

  it("يعيد عدد المنتجات في الفئة المحددة فقط", () => {
    expect(getMarketplaceCategoryCount(products, "أسمدة")).toBe(2);
    expect(getMarketplaceCategoryCount(products, "معدات الري")).toBe(0);
  });
});
