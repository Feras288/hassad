export function getFeaturedProductSliderStep(viewportWidth: number) {
  return Math.max(240, Math.floor(viewportWidth * 0.82));
}
