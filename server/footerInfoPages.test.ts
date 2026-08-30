import { describe, expect, it } from "vitest";
import { FOOTER_INFO_PAGES, getFooterInfoPage } from "../client/src/lib/footerInfoPages";
import { FOOTER_LINKS } from "../client/src/components/Footer";

describe("footer information pages", () => {
  it("يعيد صفحة محتوى مهنية لمسار من نحن", () => {
    const page = getFooterInfoPage("about");
    expect(page?.title).toContain("منظومة زراعية");
    expect(page?.sections).toHaveLength(3);
  });

  it("يعيد null لمسار غير معرّف", () => {
    expect(getFooterInfoPage("unknown-page")).toBeNull();
  });

  it("يوفر محتوى منظماً لجميع وجهات الفوتر المعلوماتية", () => {
    const expectedSlugs = ["about", "how-it-works", "stories", "careers", "farmer-guide", "become-vendor", "b2b", "become-provider", "enterprise", "api-integration", "help-center", "return-policy", "shipping-delivery", "terms", "privacy"];
    expect(Object.keys(FOOTER_INFO_PAGES)).toEqual(expect.arrayContaining(expectedSlugs));
    expectedSlugs.forEach((slug) => {
      const page = getFooterInfoPage(slug);
      expect(page?.sections).toHaveLength(3);
      expect(page?.cta.href).toBeTruthy();
    });
  });

  it("يربط جميع روابط الفوتر الداخلية بصفحة معلوماتية أو مسار تنفيذي معروف", () => {
    const operationalRoutes = new Set(["/marketplace", "/diagnosis", "/booking", "/dashboard/orders", "/register?role=vendor", "/auth", "/register?role=provider", "/contact", "/help"]);
    const internalLinks = FOOTER_LINKS.flatMap((column) => column.links).filter((link) => !link.href.startsWith("mailto:"));
    internalLinks.forEach((link) => {
      if (link.href.startsWith("/info/")) {
        expect(getFooterInfoPage(link.href.replace("/info/", ""))).not.toBeNull();
      } else {
        expect(operationalRoutes.has(link.href)).toBe(true);
      }
    });
  });
});
