import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { scrollPageToTop } from "@/lib/pageScroll";
import { MARKETPLACE_SCROLL_POSITION_KEY, isMarketplacePath, isPublicPagePath, readSavedMarketplaceScroll, shouldRestoreMarketplaceScroll } from "@/lib/publicPageScroll";

export default function PublicPageScrollManager() {
  const [location] = useLocation();
  const previousLocationRef = useRef<string | null>(null);

  useEffect(() => {
    const previousLocation = previousLocationRef.current;
    const isPublicPage = isPublicPagePath(location);
    const restoreMarketplacePosition = shouldRestoreMarketplaceScroll(location, previousLocation);

    if (isPublicPage && restoreMarketplacePosition) {
      const savedPosition = readSavedMarketplaceScroll(window.sessionStorage);
      window.scrollTo({ top: savedPosition ?? 0, left: 0, behavior: "auto" });
    } else if (isPublicPage) {
      scrollPageToTop();
      const frame = window.requestAnimationFrame(() => scrollPageToTop());
      previousLocationRef.current = location;
      return () => window.cancelAnimationFrame(frame);
    }

    previousLocationRef.current = location;
    return () => {
      if (isMarketplacePath(location)) {
        window.sessionStorage.setItem(MARKETPLACE_SCROLL_POSITION_KEY, String(window.scrollY));
      }
    };
  }, [location]);

  useEffect(() => () => {
    if (isMarketplacePath(location)) {
      window.sessionStorage.setItem(MARKETPLACE_SCROLL_POSITION_KEY, String(window.scrollY));
    }
  }, [location]);

  return null;
}
