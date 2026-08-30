import { describe, expect, it } from "vitest";
import { shouldAutoPlayFeaturedProducts, shouldResetFeaturedProductsSlider } from "../client/src/lib/featuredProductAutoplay";

describe("featured products autoplay", () => {
  it("يعمل فقط عند وجود منتجات متعددة مع عدم الإيقاف وعدم تفضيل تقليل الحركة", () => {
    expect(shouldAutoPlayFeaturedProducts({ isPaused: false, prefersReducedMotion: false, productCount: 3 })).toBe(true);
    expect(shouldAutoPlayFeaturedProducts({ isPaused: true, prefersReducedMotion: false, productCount: 3 })).toBe(false);
    expect(shouldAutoPlayFeaturedProducts({ isPaused: false, prefersReducedMotion: true, productCount: 3 })).toBe(false);
  });

  it("يعيد السلايدر للبداية بعد بلوغ نهايته", () => {
    expect(shouldResetFeaturedProductsSlider({ scrollLeft: 640, clientWidth: 360, scrollWidth: 1000 })).toBe(true);
    expect(shouldResetFeaturedProductsSlider({ scrollLeft: 450, clientWidth: 360, scrollWidth: 1000 })).toBe(false);
  });
});
