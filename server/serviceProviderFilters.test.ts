import { describe, expect, it } from "vitest";
import { getProvidersForServiceCategory, getServiceProviderProfileHref } from "../client/src/lib/serviceProviderFilters";

describe("service provider category filter", () => {
  const providers = [
    { id: "a", serviceCategories: ["agronomist"] },
    { id: "b", serviceCategories: ["irrigation", "maintenance"] },
    { id: "c", serviceCategories: ["veterinary"] },
  ];

  it("يعرض مقدمي الخدمات المرتبطين بالفئة المختارة فقط", () => {
    expect(getProvidersForServiceCategory(providers, "irrigation").map((provider) => provider.id)).toEqual(["b"]);
    expect(getProvidersForServiceCategory(providers, "agronomist").map((provider) => provider.id)).toEqual(["a"]);
  });

  it("يعيد قائمة فارغة لفئة لا يوجد لها مقدم خدمة", () => {
    expect(getProvidersForServiceCategory(providers, "soil")).toEqual([]);
  });

  it("ينشئ رابطاً آمناً لصفحة مقدم الخدمة", () => {
    expect(getServiceProviderProfileHref("eng-salem-irrigation")).toBe("/provider/eng-salem-irrigation");
  });
});
