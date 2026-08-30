import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("التجربة الثنائية اللغة", () => {
  it("يركب مزود اللغة وزر التبديل حول جميع مسارات المنصة", () => {
    const app = projectFile("client/src/App.tsx");
    expect(app).toContain("LanguageProvider");
    expect(app).toContain("LanguageSwitcher");
  });

  it("يبدل لغة الوثيقة واتجاهها ويحفظ اختيار العميل دون تجاوز العربية الافتراضية", () => {
    const context = projectFile("client/src/contexts/LanguageContext.tsx");
    expect(context).toContain('root.lang = isEnglish ? "en" : "ar"');
    expect(context).toContain('root.dir = isEnglish ? "ltr" : "rtl"');
    expect(context).toContain('const MANUAL_LANGUAGE_KEY = "hassad-language-preference"');
    expect(context).toContain('localStorage.getItem(MANUAL_LANGUAGE_KEY) === "en" ? "en" : "ar"');
    expect(context).toContain('if (saveAsPreference) localStorage.setItem(MANUAL_LANGUAGE_KEY, nextLanguage)');
    expect(context).toContain("MutationObserver");
  });

  it("يؤجل ترجمة النصوص الجديدة ضمن إطارات قصيرة ولا يراقب تغير النصوص والخصائص باستمرار", () => {
    const context = projectFile("client/src/contexts/LanguageContext.tsx");
    expect(context).toContain("performance.now() - startedAt < 7");
    expect(context).toContain("requestAnimationFrame(flushWork)");
    expect(context).toContain('observer.observe(document.body, { childList: true, subtree: true })');
    expect(context).not.toContain("characterData: true");
    expect(context).not.toContain("attributes: true");
  });

  it("يوفر قاموساً إنكليزياً واسعاً للنصوص الثابتة في المنصة", () => {
    const dictionary = JSON.parse(projectFile("client/src/i18n/english.json")) as Record<string, string>;
    expect(Object.keys(dictionary).length).toBeGreaterThan(3000);
    expect(dictionary["سوق المدخلات الزراعية"]).toBe("Agricultural Inputs Marketplace");
    expect(dictionary["التشخيص الذكي للمحاصيل"]).toBe("Smart crop diagnosis");
    expect(dictionary["تقييم تجربة التوصيل"]).toBe("Delivery experience rating");
  });

  it("يوحّد الأرقام العربية إلى أرقام لاتينية عند اختيار الإنجليزية", () => {
    const context = projectFile("client/src/contexts/LanguageContext.tsx");
    expect(context).toContain("function normalizeEnglishNumerals");
    expect(context).toContain('.replace(/[٠-٩]/g');
    expect(context).toContain('.replaceAll("٬", ",")');
  });

  it("يطبق خطاً إنكليزياً وتصحيحات تخطيط LTR وزر تبديل مرئي", () => {
    const styles = projectFile("client/src/index.css");
    expect(styles).toContain('html[lang="en"] body');
    expect(styles).toContain("font-family: 'Inter'");
    expect(styles).toContain('html[dir="ltr"] .text-right');
    expect(styles).toContain(".language-switcher");
  });

  it("يحوّل هياكل لوحات الإدارة والمورد إلى اتجاه وتموضع مناسبين للإنكليزية", () => {
    const adminLayout = projectFile("client/src/components/admin/AdminLayout.tsx");
    const vendorSidebar = projectFile("client/src/components/vendor/VendorSidebar.tsx");
    const dashboardLayout = projectFile("client/src/components/dashboard/DashboardLayout.tsx");
    const dashboardHeader = projectFile("client/src/components/dashboard/DashboardHeader.tsx");
    expect(adminLayout).toContain("const { direction, isEnglish } = useLanguage()");
    expect(adminLayout).toContain("dir={direction}");
    expect(vendorSidebar).toContain("const { isEnglish } = useLanguage()");
    expect(vendorSidebar).toContain('isEnglish ? "left-0" : "right-0"');
    expect(dashboardLayout).toContain("const { direction } = useLanguage()");
    expect(dashboardLayout).toContain("dir={direction}");
    expect(dashboardHeader).toContain("const { direction, isEnglish } = useLanguage()");
  });
});
