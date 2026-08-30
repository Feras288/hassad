import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("تجربة الجوال التطبيقية", () => {
  it("توفّر تنقلاً ثابتاً مناسباً للمس في الواجهات العامة ولوحات التحكم", () => {
    const navbar = source("client/src/components/Navbar.tsx");
    const customerDashboard = source("client/src/components/dashboard/DashboardLayout.tsx");
    const vendorSidebar = source("client/src/components/vendor/VendorSidebar.tsx");
    const adminLayout = source("client/src/components/admin/AdminLayout.tsx");

    expect(navbar).toContain("mobile-bottom-nav");
    expect(customerDashboard).toContain('aria-label="تنقل حساب العميل"');
    expect(vendorSidebar).toContain("data-vendor-mobile-nav");
    expect(adminLayout).toContain("data-admin-mobile-nav");
  });

  it("يعرض السوق والسلة والعملاء كبطاقات أو لوحات ملائمة للشاشات الصغيرة", () => {
    const marketplace = source("client/src/pages/MarketplacePage.tsx");
    const cart = source("client/src/pages/CartPage.tsx");
    const customers = source("client/src/pages/vendor/VendorCustomers.tsx");

    expect(marketplace).toContain("trpc.products.list.useQuery");
    expect(marketplace).toContain("grid-cols-2");
    expect(cart).toContain("md:pt-10");
    expect(customers).toContain("space-y-3 md:hidden");
    expect(customers).toContain("hidden overflow-x-auto md:block");
  });

  it("يحافظ على مناطق لمس آمنة ومساحة أسفل التنقل الثابت", () => {
    const globalStyles = source("client/src/index.css");
    expect(globalStyles).toContain("touch-action: manipulation");
    expect(globalStyles).toContain("safe-area-inset-bottom");
    expect(globalStyles).toContain("data-vendor-mobile-nav");
    expect(globalStyles).toContain("data-admin-mobile-nav");
  });

  it("يدعم سحب القوائم واللوحات للإغلاق مع تأثير لمس خفيف", () => {
    const swipeHook = source("client/src/hooks/useSwipeToClose.ts");
    const cartDrawer = source("client/src/components/CartDrawer.tsx");
    const navbar = source("client/src/components/Navbar.tsx");
    const vendorSidebar = source("client/src/components/vendor/VendorSidebar.tsx");
    const adminLayout = source("client/src/components/admin/AdminLayout.tsx");
    const marketplace = source("client/src/pages/MarketplacePage.tsx");
    const globalStyles = source("client/src/index.css");

    expect(swipeHook).toContain("useSwipeToClose");
    expect(swipeHook).toContain("threshold = 72");
    expect(cartDrawer).toContain("cartSwipe.swipeHandlers");
    expect(navbar).toContain("mobileMenuSwipe.swipeHandlers");
    expect(vendorSidebar).toContain("vendorMobileSwipe.swipeHandlers");
    expect(adminLayout).toContain("adminMobileSwipe.swipeHandlers");
    expect(marketplace).toContain("filterSheetSwipe.swipeHandlers");
    expect(globalStyles).toContain("button:not(:disabled):active");
    expect(globalStyles).toContain(".touch-card:active");
  });

  it("يحافظ على صفحة المنتج ضمن عرض الجوال ويضع إجراءات الشراء فوق التنقل السفلي", () => {
    const productDetail = source("client/src/pages/ProductDetail.tsx");

    expect(productDetail).toContain("product-detail-page min-h-screen overflow-x-hidden");
    expect(productDetail).toContain("grid min-w-0");
    expect(productDetail).toContain("bottom-[calc(4.35rem+env(safe-area-inset-bottom))]");
    expect(productDetail).toContain("pb-[11.5rem]");
  });

  it("يدعم سحب صور المنتج وبطاقات مشابهة ذات مناطق لمس واضحة", () => {
    const gallery = source("client/src/components/product/ProductImageGallery.tsx");
    const relatedProducts = source("client/src/components/product/RelatedProducts.tsx");

    expect(gallery).toContain("handlePointerEnd");
    expect(gallery).toContain("Math.abs(deltaX) < 48");
    expect(gallery).toContain("اسحب للتبديل بين الصور");
    expect(relatedProducts).toContain("snap-x snap-mandatory");
    expect(relatedProducts).toContain("h-10 w-10");
  });

  it("يحافظ على مساحة مريحة وأعمدة قابلة للقراءة في أقسام الصفحة الرئيسية للجوال", () => {
    const hero = source("client/src/components/HeroSection.tsx");
    const pillars = source("client/src/components/ThreePillars.tsx");
    const marketplace = source("client/src/components/MarketplaceSection.tsx");
    const diagnosis = source("client/src/components/AIDiagnosisSection.tsx");
    const services = source("client/src/components/ServicesSection.tsx");

    expect(hero).toContain("pb-16");
    expect(pillars).toContain("mt-4 md:-mt-[60px]");
    expect(marketplace).toContain("grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8");
    expect(diagnosis).toContain("rounded-[22px] p-5");
    expect(services).toContain("overflow-x-auto px-4");
  });

  it("يعرض إحصاءات البطل في صف مركزي واحد على الجوال", () => {
    const hero = source("client/src/components/HeroSection.tsx");

    expect(hero).toContain("data-hero-mobile-stats");
    expect(hero).toContain("grid-cols-4");
    expect(hero).toContain("mx-auto");
    expect(hero).toContain("text-center");
    expect(hero).not.toContain("divide-x-reverse");
    expect(hero).toContain("gap-1.5");
    expect(hero).toContain("AnimatedHeroStat");
    expect(hero).toContain("IntersectionObserver");
  });

  it("يعرض تحميل الجوال وسلايدر المنتجات الثمانية دون عبارة سحب إضافية", () => {
    const home = source("client/src/pages/Home.tsx");
    const marketplace = source("client/src/components/MarketplaceSection.tsx");
    const services = source("client/src/components/ServicesSection.tsx");

    expect(home).toContain("data-home-mobile-skeleton");
    expect(home).toContain("isInitialMobileLoading");
    expect(marketplace).toContain("trpc.products.featured.useQuery");
    expect(marketplace).not.toContain("const allProducts: Product[] = [");
    expect(services).toContain("data-services-tab-scroll-indicator");
  });

  it("يحافظ على اتجاه عربي واضح لواجهة التشخيص دون نتائج نموذجية", () => {
    const diagnosis = source("client/src/components/AIDiagnosisSection.tsx");

    expect(diagnosis).toContain('dir="rtl"');
    expect(diagnosis).not.toContain("SAMPLE_IMAGES");
  });
});
