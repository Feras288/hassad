/**
 * MarketplaceSection — مطابق للتصميم المرفق
 * Sections: Categories grid (8 cols) + Featured products (4 cols)
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutGrid, Flame, Sprout, Leaf, BugOff, Droplets, Tractor, Wrench, Warehouse, FlaskConical, Star, Heart, BadgeCheck, Plus, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, PackageOpen, RefreshCw } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getFeaturedProductSliderStep } from "@/lib/featuredProductSlider";
import { FEATURED_PRODUCTS_AUTOPLAY_INTERVAL_MS, shouldAutoPlayFeaturedProducts, shouldResetFeaturedProductsSlider } from "@/lib/featuredProductAutoplay";
import { isTierPricingActive, type PriceTier } from "@/lib/tierPricing";
import WholesaleOfferBadge from "@/components/WholesaleOfferBadge";

const CATEGORIES = [
  { icon: Sprout, name: "البذور والشتلات", count: "١٬٢٤٠ منتج", slug: "seeds" },
  { icon: Leaf, name: "الأسمدة", count: "٨٥٠ منتج", slug: "fertilizers" },
  { icon: BugOff, name: "المبيدات", count: "٦٧٠ منتج", slug: "pesticides" },
  { icon: Droplets, name: "أنظمة الري", count: "٤٢٠ منتج", slug: "irrigation" },
  { icon: Tractor, name: "المعدات الثقيلة", count: "١٩٠ منتج", slug: "equipment" },
  { icon: Wrench, name: "الأدوات اليدوية", count: "٧٤٠ منتج", slug: "tools" },
  { icon: FlaskConical, name: "مستلزمات المواشي", count: "٥٦٠ منتج", slug: "livestock" },
  { icon: Warehouse, name: "البيوت المحمية", count: "٩٨ منتج", slug: "greenhouse" },
];

const LEGACY_PRODUCTS = [
  {
    id: "tomato-seeds-f1",
    icon: Sprout,
    badge: "خصم ١٥٪",
    badgeStyle: "bg-[#E08C3B]",
    supplier: "مؤسسة الوادي الأخضر",
    name: "بذور طماطم هجينة عالية الإنتاج — صنف الفيصل",
    rating: 4.8, reviews: 246,
    price: 85, priceFormatted: "٨٥", oldPrice: "١٠٠", unit: "ر.س",
    category: "البذور والشتلات",
    href: "/product/npk-fertilizer-20-20-20",
    image: "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&q=80",
  },
  {
    id: "npk-fertilizer",
    icon: Leaf,
    badge: "جملة B2B",
    badgeStyle: "bg-[#1F4D3A]",
    supplier: "شركة نماء للأسمدة",
    name: "سماد نيتروجيني NPK ٢٠-٢٠-٢٠ — كيس ٥٠ كجم",
    rating: 4.9, reviews: 512,
    price: 245, priceFormatted: "٢٤٥", oldPrice: null, unit: "ر.س / كيس",
    category: "الأسمدة",
    href: "/product/npk-fertilizer-20-20-20",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
  },
  {
    id: "drip-irrigation",
    icon: Droplets,
    badge: null,
    badgeStyle: "",
    supplier: "مؤسسة الري الحديث",
    name: "نظام ري بالتنقيط متكامل — لمساحة ١٠٠٠م²",
    rating: 4.7, reviews: 98,
    price: 1450, priceFormatted: "١٬٤٥٠", oldPrice: null, unit: "ر.س",
    category: "أنظمة الري",
    href: "/product",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80",
  },
  {
    id: "organic-pesticide",
    icon: BugOff,
    badge: "جديد",
    badgeStyle: "bg-[#E08C3B]",
    supplier: "الشركة السعودية للحماية",
    name: "مبيد حشري عضوي آمن — عبوة ١ لتر",
    rating: 4.6, reviews: 134,
    price: 120, priceFormatted: "١٢٠", oldPrice: null, unit: "ر.س",
    category: "المبيدات",
    href: "/product",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80",
  },
];

type FeaturedProduct = {
  id: string;
  badge?: string;
  badgeStyle: string;
  supplier: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  priceTiers?: PriceTier[];
  tierPricingStartsAt?: Date | null;
  tierPricingEndsAt?: Date | null;
  priceFormatted: string;
  oldPrice?: string;
  unit: string;
  category: string;
  href: string;
  image: string;
  stock: number;
};

const currency = new Intl.NumberFormat("ar-SA");
const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85&auto=format&fit=crop";

function toFeaturedProduct(product: {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  originalPrice: number | null;
  priceTiers: PriceTier[] | null;
  tierPricingStartsAt: Date | null;
  tierPricingEndsAt: Date | null;
  unit: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  images: string[];
}): FeaturedProduct {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isBestSeller = product.sold >= 100;

  return {
    id: product.id,
    badge: discount ? `خصم ${currency.format(discount)}٪` : isBestSeller ? "الأكثر طلباً" : undefined,
    badgeStyle: discount ? "bg-[#C65A45]" : "bg-[#1F4D3A]",
    supplier: product.vendor,
    name: product.name,
    rating: product.rating / 100,
    reviews: product.reviewCount,
    price: product.price,
    priceTiers: product.priceTiers ?? undefined,
    tierPricingStartsAt: product.tierPricingStartsAt,
    tierPricingEndsAt: product.tierPricingEndsAt,
    priceFormatted: currency.format(product.price),
    oldPrice: product.originalPrice ? currency.format(product.originalPrice) : undefined,
    unit: product.unit,
    category: product.category,
    href: `/product/${product.id}`,
    image: product.images[0] || FALLBACK_PRODUCT_IMAGE,
    stock: product.stock,
  };
}

export default function MarketplaceSection() {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const featuredSliderRef = useRef<HTMLDivElement>(null);
  const [isFeaturedSliderPaused, setIsFeaturedSliderPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const featuredQuery = trpc.products.featured.useQuery({ limit: 8 }, { staleTime: 30_000 });
  const featuredProducts = featuredQuery.data?.map(toFeaturedProduct) ?? [];

  const scrollFeaturedProducts = (direction: "next" | "previous") => {
    const slider = featuredSliderRef.current;
    if (!slider) return;
    const step = getFeaturedProductSliderStep(slider.clientWidth);
    slider.scrollBy({ left: direction === "next" ? -step : step, behavior: "smooth" });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!shouldAutoPlayFeaturedProducts({ isPaused: isFeaturedSliderPaused, prefersReducedMotion, productCount: featuredProducts.length })) return;
    const autoplay = window.setInterval(() => {
      const slider = featuredSliderRef.current;
      if (!slider) return;
      if (shouldResetFeaturedProductsSlider({ scrollLeft: slider.scrollLeft, clientWidth: slider.clientWidth, scrollWidth: slider.scrollWidth })) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      slider.scrollBy({ left: -getFeaturedProductSliderStep(slider.clientWidth), behavior: "smooth" });
    }, FEATURED_PRODUCTS_AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(autoplay);
  }, [featuredProducts.length, isFeaturedSliderPaused, prefersReducedMotion]);

  const handleAddToCart = (e: React.MouseEvent, p: FeaturedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: p.id, name: p.name, price: p.price, priceFormatted: `${p.priceFormatted} ر.س`, priceTiers: p.priceTiers, tierPricingStartsAt: p.tierPricingStartsAt, tierPricingEndsAt: p.tierPricingEndsAt, image: p.image, unit: p.unit, category: p.category, stock: p.stock, vendorName: p.supplier });
    toast.success(`تمت إضافة "${p.name}" إلى السلة`);
  };

  return (
    <>
      {/* ===== CATEGORIES ===== */}
      <section className="bg-[#FBF9F4] py-14 sm:py-20 lg:py-[88px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-7 flex flex-col items-start gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1F5EE] text-[#2A6B4F] rounded-full text-[12px] font-semibold mb-3.5">
                <LayoutGrid className="w-3 h-3" />
                تصفّح حسب الفئة
              </div>
              <h2 className="mb-3 text-[28px] font-bold leading-[1.25] tracking-[-0.5px] text-[#1A1A17] sm:text-[40px] sm:leading-[1.2] sm:tracking-[-1px]">
                فئات مختارة لكل احتياجات مزرعتك
              </h2>
              <p className="text-[15px] leading-[1.7] text-[#6E6E66] sm:text-[16px] sm:leading-[1.6]">
                من البذور إلى المعدات، تسوّق من فئات منظمة تسهّل عليك العثور على ما تحتاجه بسرعة.
              </p>
            </div>
            <Link href="/marketplace" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-2.5 text-[14px] font-semibold text-[#1F4D3A] transition-colors hover:bg-[#F1F5EE]">
              كل الفئات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate(`/marketplace?category=${cat.slug}`)}
                className="min-h-[132px] rounded-[14px] border border-[#E5E1D6] bg-white px-3 py-4 text-center transition-all hover:border-[#3D8A66] hover:bg-[#F1F5EE] hover:-translate-y-0.5 sm:min-h-0 sm:py-5"
              >
                <div className="mx-auto mb-2.5 grid h-11 w-11 place-items-center rounded-[14px] bg-[#F4F1EA] text-[#1F4D3A] sm:h-12 sm:w-12">
                  <cat.icon className="w-[22px] h-[22px]" />
                </div>
                <div className="text-[13px] font-medium text-[#3D3D38] mb-0.5">{cat.name}</div>
                <div className="text-[11px] text-[#94948B]">{cat.count}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-[#FBF9F4] pb-14 sm:pb-20 lg:pb-[88px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-7 flex flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1F5EE] text-[#2A6B4F] rounded-full text-[12px] font-semibold mb-3.5">
                <Flame className="w-3 h-3" />
                الأكثر مبيعاً
              </div>
              <h2 className="mb-3 text-[28px] font-bold leading-[1.25] tracking-[-0.5px] text-[#1A1A17] sm:text-[40px] sm:leading-[1.2] sm:tracking-[-1px]">
                منتجات مختارة يثق بها المزارعون
              </h2>
              <p className="text-[15px] leading-[1.7] text-[#6E6E66] sm:text-[16px] sm:leading-[1.6]">
                أفضل المنتجات مبيعاً هذا الشهر من موردين معتمدين، بأعلى تقييمات المستخدمين.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => scrollFeaturedProducts("previous")} className="grid h-10 w-10 place-items-center rounded-xl border border-[#DDE7DA] bg-white text-[#1F4D3A] transition-colors hover:bg-[#F1F5EE]" aria-label="المنتجات السابقة"><ChevronRight className="h-4 w-4" /></button>
              <button onClick={() => scrollFeaturedProducts("next")} className="grid h-10 w-10 place-items-center rounded-xl border border-[#DDE7DA] bg-white text-[#1F4D3A] transition-colors hover:bg-[#F1F5EE]" aria-label="المنتجات التالية"><ChevronLeft className="h-4 w-4" /></button>
              <Link href="/marketplace" className="hidden items-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-2.5 text-[14px] font-semibold text-[#1F4D3A] transition-colors hover:bg-[#F1F5EE] sm:inline-flex">
                عرض كل المنتجات
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {featuredQuery.isLoading ? (
            <div className="flex gap-3 overflow-hidden" aria-label="جاري تحميل المنتجات المميزة">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-[0_0_clamp(140px,42vw,220px)] animate-pulse overflow-hidden rounded-[14px] border border-[#E5E1D6] bg-white sm:flex-[0_0_clamp(165px,29vw,230px)] lg:flex-[0_0_clamp(180px,20vw,245px)] xl:flex-[0_0_clamp(190px,18vw,260px)] 2xl:flex-[0_0_clamp(200px,15vw,280px)]">
                  <div className="aspect-[4/3] bg-[#EEF2EB]" />
                  <div className="space-y-3 p-4"><div className="h-3 w-1/3 rounded bg-[#EEF2EB]" /><div className="h-4 rounded bg-[#EEF2EB]" /><div className="h-4 w-3/4 rounded bg-[#EEF2EB]" /></div>
                </div>
              ))}
            </div>
          ) : featuredQuery.isError ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D4CFC0] bg-white px-6 text-center">
              <p className="text-sm font-semibold text-[#3D3D38]">تعذّر تحميل المنتجات المميزة حالياً</p>
              <button onClick={() => featuredQuery.refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#F1F5EE] px-3 py-2 text-xs font-bold text-[#1F4D3A]"><RefreshCw className="h-3.5 w-3.5" />إعادة المحاولة</button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D4CFC0] bg-white px-6 text-center">
              <PackageOpen className="h-8 w-8 text-[#7B9180]" />
              <p className="mt-3 text-sm font-semibold text-[#3D3D38]">لا توجد منتجات معتمدة للعرض حالياً</p>
              <Link href="/marketplace" className="mt-3 text-sm font-bold text-[#1F4D3A]">تصفح السوق الزراعي</Link>
            </div>
          ) : (
          <>
          <div ref={featuredSliderRef} onMouseEnter={() => setIsFeaturedSliderPaused(true)} onMouseLeave={() => setIsFeaturedSliderPaused(false)} onFocusCapture={() => setIsFeaturedSliderPaused(true)} onBlurCapture={() => setIsFeaturedSliderPaused(false)} className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 pt-1 scrollbar-none scroll-smooth" aria-label="سلايدر المنتجات المختارة" aria-roledescription="carousel">
            {featuredProducts.map(product => (
              <article
                key={product.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(product.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(product.href);
                  }
                }}
                className="group block flex-[0_0_clamp(140px,42vw,220px)] snap-start cursor-pointer overflow-hidden rounded-[14px] border border-[#E5E1D6] bg-white transition-all hover:-translate-y-0.5 hover:border-[#D4CFC0] hover:shadow-[0_2px_4px_rgba(26,26,23,0.04),0_8px_24px_rgba(26,26,23,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6B4F] focus-visible:ring-offset-2 sm:flex-[0_0_clamp(165px,29vw,230px)] lg:flex-[0_0_clamp(180px,20vw,245px)] xl:flex-[0_0_clamp(190px,18vw,260px)] 2xl:flex-[0_0_clamp(200px,15vw,280px)]"
              >
                  {/* Image */}
                  <div className="relative" style={{ aspectRatio: "4/3" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(event) => { event.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }} />
                    {product.badge && (
                      <span className={`absolute top-3 left-3 ${product.badgeStyle} text-white text-[11px] font-semibold px-2.5 py-1 rounded-[6px]`}>
                        {product.badge}
                      </span>
                    )}
                    {!!product.priceTiers?.length && isTierPricingActive(product) && <span className="absolute right-3 top-3"><WholesaleOfferBadge {...product} /></span>}
                    <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite({ id: product.id, name: product.name, price: product.priceFormatted, image: product.image, badge: product.badge || "", badgeColor: "#E08C3B", category: product.category, rating: product.rating, reviews: product.reviews, addedAt: Date.now() }); }}
                      className="absolute bottom-3 left-3 w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-full grid place-items-center text-[#3D3D38] hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-1 text-[11px] text-[#6E6E66] mb-1.5">
                      <span>{product.supplier}</span>
                      <BadgeCheck className="w-3 h-3 text-[#2A6B4F]" />
                    </div>
                    <div className="text-[15px] font-semibold text-[#1A1A17] mb-2 leading-[1.4] line-clamp-2 min-h-[42px]">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= Math.floor(product.rating) ? "text-[#E08C3B] fill-[#E08C3B]" : "text-[#E5E1D6] fill-[#E5E1D6]"}`} />
                        ))}
                      </div>
                      <span className="text-[12px] font-medium text-[#6E6E66]">{product.rating}</span>
                      <span className="text-[12px] text-[#94948B]">({product.reviews})</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#E5E1D6]">
                      <div>
                        <span className="text-[20px] font-bold text-[#1F4D3A] tracking-[-0.5px]">{product.priceFormatted}</span>
                        <span className="text-[12px] text-[#6E6E66] font-medium mr-1">{product.unit}</span>
                        {product.oldPrice && (
                          <span className="text-[12px] text-[#94948B] line-through mr-1">{product.oldPrice} ر.س</span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleAddToCart(e, product); }}
                        className="w-10 h-10 bg-[#1F4D3A] hover:bg-[#123528] text-white rounded-xl grid place-items-center transition-colors"
                      >
                        <Plus className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
              </article>
            ))}
          </div>
          </>
          )}
        </div>
      </section>
    </>
  );
}
