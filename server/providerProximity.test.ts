import { describe, expect, it } from "vitest";
import { coordinatesForProviderCity, distanceInKilometers, rankProvidersByDistance } from "../client/src/lib/providerProximity";

describe("ترتيب مقدمي الخدمات حسب القرب", () => {
  it("يحسب مسافة تقريبية موجبة بين مدن مختلفة", () => {
    const riyadh = coordinatesForProviderCity("الرياض");
    const jeddah = coordinatesForProviderCity("جدة");

    expect(riyadh).not.toBeNull();
    expect(jeddah).not.toBeNull();
    expect(distanceInKilometers(riyadh!, jeddah!)).toBeGreaterThan(700);
  });

  it("يرتب مقدمي الخدمات من الأقرب إلى الأبعد عند توفر موقع المستخدم", () => {
    const riyadh = coordinatesForProviderCity("الرياض")!;
    const ranked = rankProvidersByDistance([
      { id: "jeddah", location: "جدة" },
      { id: "riyadh", location: "الرياض" },
      { id: "dammam", location: "الدمام" },
    ], riyadh);

    expect(ranked.map(provider => provider.id)).toEqual(["riyadh", "dammam", "jeddah"]);
    expect(ranked[0]?.distanceKm).toBe(0);
  });

  it("يحافظ على ترتيب القائمة ولا يخترع مسافات دون إذن الموقع", () => {
    const ranked = rankProvidersByDistance([{ id: "riyadh", location: "الرياض" }, { id: "jeddah", location: "جدة" }], null);

    expect(ranked.map(provider => provider.id)).toEqual(["riyadh", "jeddah"]);
    expect(ranked.every(provider => provider.distanceKm === null)).toBe(true);
  });
});
