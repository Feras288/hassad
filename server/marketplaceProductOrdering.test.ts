import { describe, expect, it } from "vitest";
import { orderMarketplaceProducts } from "../client/src/lib/marketplaceProductOrdering";

describe("marketplace product ordering", () => {
  const products = [
    { id: "a", rating: 4.5, reviews: 20, price: 20, discount: 0, freeShipping: false },
    { id: "b", rating: 4.2, reviews: 12, price: 30, discount: 10, freeShipping: true },
    { id: "c", rating: 4.9, reviews: 9, price: 40, discount: 5, freeShipping: false },
  ];

  it("يقدّم المنتجات ذات الشحن المجاني عند اختيار فرز الشحن", () => {
    expect(orderMarketplaceProducts(products, "free-shipping").map((product) => product.id)).toEqual(["b", "c", "a"]);
  });

  it("يرتب أفضل قيمة باستخدام الخصم والشحن والتقييم", () => {
    expect(orderMarketplaceProducts(products, "best-deal")[0].id).toBe("b");
  });

  it("لا يغير مصفوفة الإدخال أثناء الترتيب", () => {
    orderMarketplaceProducts(products, "rating");
    expect(products.map((product) => product.id)).toEqual(["a", "b", "c"]);
  });
});
