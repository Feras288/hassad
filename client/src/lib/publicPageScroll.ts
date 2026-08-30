export const MARKETPLACE_SCROLL_POSITION_KEY = "hasaad_marketplace_scroll_position";

function pathnameOf(location: string) {
  return location.split(/[?#]/, 1)[0] || "/";
}

export function isMarketplacePath(location: string) {
  const path = pathnameOf(location);
  return path === "/marketplace" || path === "/shop";
}

export function isProductDetailPath(location: string) {
  const path = pathnameOf(location);
  return path === "/product" || path.startsWith("/product/");
}

export function isPublicPagePath(location: string) {
  const path = pathnameOf(location);
  return path === "/" || ["/auth", "/login", "/register", "/forgot-password", "/diagnosis", "/booking", "/marketplace", "/shop", "/cart", "/supplier-pending", "/suppliers-map", "/checkout", "/order-confirmation"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) || isProductDetailPath(path) || path === "/provider" || path.startsWith("/provider/");
}

export function shouldRestoreMarketplaceScroll(currentPath: string, previousPath: string | null) {
  return isMarketplacePath(currentPath) && Boolean(previousPath && isProductDetailPath(previousPath));
}

export function readSavedMarketplaceScroll(storage: Pick<Storage, "getItem">) {
  const value = Number(storage.getItem(MARKETPLACE_SCROLL_POSITION_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}
