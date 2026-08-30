export const FEATURED_PRODUCTS_AUTOPLAY_INTERVAL_MS = 4500;

export function shouldAutoPlayFeaturedProducts({ isPaused, prefersReducedMotion, productCount }: { isPaused: boolean; prefersReducedMotion: boolean; productCount: number }) {
  return !isPaused && !prefersReducedMotion && productCount > 1;
}

export function shouldResetFeaturedProductsSlider({ scrollLeft, clientWidth, scrollWidth }: { scrollLeft: number; clientWidth: number; scrollWidth: number }) {
  return Math.abs(scrollLeft) + clientWidth >= scrollWidth - 8;
}
