import { describe, expect, it } from "vitest";
import { mapCatalogProductToDetail } from "../client/src/lib/productsData";

describe("mapCatalogProductToDetail", () => {
  it("يحافظ على بيانات المنتج المعتمدة دون اختلاق صور أو تفاصيل اختيارية", () => {
    const product = mapCatalogProductToDetail({
      id: "catalog-1",
      name: "سماد تجريبي",
      nameEn: null,
      sku: "CAT-001",
      category: "الأسمدة",
      brand: null,
      vendor: "مورد اختبار",
      price: 125,
      originalPrice: 150,
      unit: "كيس 25 كجم",
      minOrder: 1,
      stock: 12,
      sold: 120,
      images: [],
      shortDesc: null,
      longDesc: null,
      highlights: null,
      specs: null,
      usageInstructions: null,
      certifications: null,
      tags: null,
      rating: 480,
      reviewCount: 18,
    });

    expect(product.id).toBe("catalog-1");
    expect(product.price).toBe(125);
    expect(product.rating).toBe(4.8);
    expect(product.discount).toBe(17);
    expect(product.images).toHaveLength(0);
    expect(product.supplier.name).toBe("مورد اختبار");
    expect(product.highlights).toEqual([]);
  });
});
