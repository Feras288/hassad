import { describe, expect, it } from "vitest";
import { getFeaturedProductSliderStep } from "../client/src/lib/featuredProductSlider";

describe("featured product slider", () => {
  it("يحافظ على مسافة تمرير دنيا قابلة للمس على الشاشات الضيقة", () => {
    expect(getFeaturedProductSliderStep(180)).toBe(240);
  });

  it("يمرر جزءاً عملياً من مساحة السلايدر في الشاشات الواسعة", () => {
    expect(getFeaturedProductSliderStep(1200)).toBe(983);
  });
});
