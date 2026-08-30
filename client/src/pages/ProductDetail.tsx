/**
 * HASAAD PLATFORM — Product Detail
 * Mobile-first purchasing layout with an uncluttered visual hierarchy.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  Award,
  ChevronLeft,
  Droplets,
  Home,
  Leaf,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  SearchX,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductPurchaseCard from "@/components/product/ProductPurchaseCard";
import ProductInfoTabs from "@/components/product/ProductInfoTabs";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductDoseCalculator from "@/components/product/ProductDoseCalculator";
import ProductQuestions from "@/components/product/ProductQuestions";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { mapCatalogProductToDetail } from "@/lib/productsData";
import { trpc } from "@/lib/trpc";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-label={`تقييم ${rating} من 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(rating) ? "fill-[#D19A32] text-[#D19A32]" : "fill-[#E5E9E4] text-[#E5E9E4]"}`}
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { isEnglish } = useLanguage();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { addToCart, isInCart } = useCart();
  const [showMobileAction, setShowMobileAction] = useState(false);
  const [alternativeSearch, setAlternativeSearch] = useState("");
  const [requestForm, setRequestForm] = useState({ requesterName: "", phone: "", city: "", quantity: "", notes: "" });

  const catalogQuery = trpc.products.byId.useQuery(
    { id: params.id ?? "" },
    { enabled: Boolean(params.id), staleTime: 30_000 }
  );
  const isUnknownProduct = Boolean(params.id && catalogQuery.data === null);
  const isLoadingLiveProduct = catalogQuery.isLoading;
  const suggestionsQuery = trpc.products.featured.useQuery({ limit: 8 }, { enabled: isUnknownProduct, staleTime: 30_000 });
  const productSource = catalogQuery.data ? mapCatalogProductToDetail(catalogQuery.data) : null;
  const product = productSource && (isEnglish
    ? {
        ...productSource,
        name: productSource.nameEn || productSource.name,
        shortDesc: productSource.shortDescEn ?? productSource.shortDesc,
        longDesc: productSource.longDescEn ?? productSource.longDesc,
        highlights: productSource.highlightsEn?.length ? productSource.highlightsEn : productSource.highlights,
        specs: productSource.specsEn?.length ? productSource.specsEn : productSource.specs,
        usageInstructions: productSource.usageInstructionsEn?.length ? productSource.usageInstructionsEn : productSource.usageInstructions,
        certifications: productSource.certificationsEn?.length ? productSource.certificationsEn : productSource.certifications,
        tags: productSource.tagsEn?.length ? productSource.tagsEn : productSource.tags,
      }
    : productSource);

  const createAvailabilityRequest = trpc.productAvailabilityRequests.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلب توفير المنتج", { description: "سيتواصل معك فريق حصاد بعد مراجعة الطلب." });
      setRequestForm({ requesterName: "", phone: "", city: "", quantity: "", notes: "" });
    },
    onError: () => toast.error("تعذر إرسال الطلب", { description: "تحقق من البيانات ثم حاول مرة أخرى." }),
  });

  const suggestions = useMemo(() => (suggestionsQuery.data ?? []).slice(0, 3), [suggestionsQuery.data]);
  const inCart = isInCart(product?.id ?? "");
  const cartItem = () => ({
    id: product?.id ?? "",
    name: product?.name ?? "",
    price: product?.price ?? 0,
    priceFormatted: product?.priceFormatted ?? "",
    originalPrice: product?.originalPrice,
    priceTiers: product?.priceTiers ?? [],
    tierPricingStartsAt: product?.tierPricingStartsAt,
    tierPricingEndsAt: product?.tierPricingEndsAt,
    image: product?.images[0] ?? "",
    category: product?.category ?? "",
    unit: product?.unit ?? "",
    stock: product?.stock ?? 0,
    vendorName: product?.supplier.name ?? "",
    vendorId: product?.supplier.id ?? "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const onScroll = () => setShowMobileAction(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [params.id]);

  const handleMobileCart = () => {
    if (!product) return;
    if (inCart) return navigate("/cart");
    addToCart(cartItem());
    toast.success("تمت إضافة المنتج إلى السلة");
  };

  const handleMobileBuy = () => {
    if (!product) return;
    addToCart(cartItem());
    navigate("/checkout");
  };

  const submitAvailabilityRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createAvailabilityRequest.mutate({
      requestedProduct: alternativeSearch.trim() || params.id || "منتج غير متاح",
      sourceProductId: params.id ?? null,
      requesterName: requestForm.requesterName,
      phone: requestForm.phone,
      email: null,
      city: requestForm.city.trim() || null,
      quantity: requestForm.quantity.trim() || null,
      notes: requestForm.notes.trim() || null,
    });
  };

  if (isLoadingLiveProduct) {
    return (
      <div className="min-h-screen bg-[#F8FAF6]">
        <Navbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
          <div className="h-4 w-40 animate-pulse rounded bg-[#E5ECE2]" />
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[420px] animate-pulse rounded-[24px] bg-[#EDF3EA]" />
            <div className="h-[380px] animate-pulse rounded-[24px] bg-[#E5ECE2]" />
          </div>
        </main>
      </div>
    );
  }

  if (isUnknownProduct) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#F8FAF6] text-[#1A2F25]">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:pb-14 sm:pt-10">
          <section className="rounded-[24px] border border-[#DCE8DA] bg-white p-5 text-center shadow-[0_14px_42px_rgba(28,73,49,0.07)] sm:p-9">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF7EC] text-[#1F6B45]"><SearchX className="h-7 w-7" /></div>
            <p className="mt-4 text-xs font-bold text-[#5A866B]">رابط منتج غير متاح</p>
            <h1 className="mt-1 text-2xl font-black text-[#183A2A]">دعنا نساعدك في إيجاد بديل مناسب</h1>
            <p className="mt-3 text-sm leading-7 text-[#65736B]">ابحث في السوق أو أرسل طلب توفير، وسنقترح مورداً مناسباً لاحتياج مزرعتك.</p>
            <form onSubmit={(event) => { event.preventDefault(); navigate(alternativeSearch.trim() ? `/marketplace?q=${encodeURIComponent(alternativeSearch.trim())}` : "/marketplace"); }} className="mt-5 flex gap-2 rounded-2xl border border-[#D5E3D3] bg-[#F8FBF6] p-2">
              <input value={alternativeSearch} onChange={(event) => setAlternativeSearch(event.target.value)} placeholder="ابحث عن بديل..." className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
              <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1F4D3A] text-white"><Search className="h-4 w-4" /></button>
            </form>
          </section>
          <form onSubmit={submitAvailabilityRequest} className="mt-4 space-y-3 rounded-[24px] border border-[#DCE8DA] bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-black text-[#1F6B45]"><Send className="h-4 w-4" />اطلب توفير المنتج</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required value={requestForm.requesterName} onChange={(event) => setRequestForm((current) => ({ ...current, requesterName: event.target.value }))} placeholder="الاسم الكامل" className="rounded-xl border border-[#D8E4D5] px-3 py-3 text-sm outline-none focus:border-[#2C7A4A]" />
              <input required type="tel" value={requestForm.phone} onChange={(event) => setRequestForm((current) => ({ ...current, phone: event.target.value }))} placeholder="رقم الجوال" className="rounded-xl border border-[#D8E4D5] px-3 py-3 text-sm outline-none focus:border-[#2C7A4A]" />
              <input value={requestForm.city} onChange={(event) => setRequestForm((current) => ({ ...current, city: event.target.value }))} placeholder="المدينة" className="rounded-xl border border-[#D8E4D5] px-3 py-3 text-sm outline-none focus:border-[#2C7A4A]" />
              <input value={requestForm.quantity} onChange={(event) => setRequestForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="الكمية المطلوبة" className="rounded-xl border border-[#D8E4D5] px-3 py-3 text-sm outline-none focus:border-[#2C7A4A]" />
            </div>
            <textarea value={requestForm.notes} onChange={(event) => setRequestForm((current) => ({ ...current, notes: event.target.value }))} placeholder="ملاحظات إضافية" className="min-h-20 w-full rounded-xl border border-[#D8E4D5] px-3 py-3 text-sm outline-none focus:border-[#2C7A4A]" />
            <button disabled={createAvailabilityRequest.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F6B45] py-3.5 text-sm font-black text-white disabled:opacity-60"><Send className="h-4 w-4" />إرسال طلب التوفير</button>
          </form>
          {suggestions.length > 0 && <section className="mt-7"><h2 className="mb-3 text-lg font-black">بدائل مقترحة</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{suggestions.map((item) => <Link key={item.id} href={`/product/${item.id}`} className="overflow-hidden rounded-2xl border border-[#DCE8DA] bg-white"><img src={item.images[0] || ""} alt={item.name} className="h-28 w-full object-cover" /><div className="p-3"><p className="line-clamp-2 text-sm font-black">{item.name}</p><p className="mt-2 text-sm font-black text-[#1F6B45]">{item.price.toLocaleString("ar-SA")} ريال</p></div></Link>)}</div></section>}
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] text-[#1A2F25]">
        <Navbar />
        <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
          <SearchX className="h-10 w-10 text-[#5A866B]" />
          <h1 className="mt-4 text-xl font-black">تعذر تحميل المنتج</h1>
          <p className="mt-2 text-sm leading-7 text-[#65736B]">جرّب العودة إلى السوق أو أعد المحاولة لاحقاً.</p>
          <Link href="/marketplace" className="mt-5 rounded-xl bg-[#1F4D3A] px-4 py-3 text-sm font-black text-white">العودة إلى السوق</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const farmFitTags = product.tags.slice(0, 4);
  const primarySpecs = product.specs.slice(0, 4);

  return (
    <div className="product-detail-page min-h-screen overflow-x-hidden bg-[#F8FAF6] text-[#193326]">
      <Navbar />
      <main className="pb-[11.5rem] pt-3 lg:pb-16 lg:pt-5">
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-xs text-[#718078] sm:text-sm">
            <Link href="/" className="flex items-center gap-1"><Home className="h-3.5 w-3.5" />الرئيسية</Link><ChevronLeft className="h-3.5 w-3.5 shrink-0" />
            <Link href="/marketplace">السوق الزراعي</Link><ChevronLeft className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/marketplace?category=${encodeURIComponent(product.categorySlug)}`}>{product.category}</Link><ChevronLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-semibold text-[#405047]">{product.name}</span>
          </nav>

          <section className="mt-3 overflow-hidden rounded-[24px] border border-[#D8E5D5] bg-white shadow-[0_14px_38px_rgba(24,63,43,0.08)] sm:mt-5 sm:rounded-[30px]">
            <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 p-3 sm:p-6 lg:p-7">
                <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.7fr)] xl:items-start xl:gap-7">
                  <div className="min-w-0"><ProductImageGallery images={product.images} productName={product.name} badge={product.badge} badgeColor={product.badgeColor} discount={product.discount} /></div>
                  <div className="min-w-0 px-1 pb-2 sm:px-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#EAF5E7] px-3 py-1 text-xs font-black text-[#216141]">{product.category}</span>{product.badge && <span className="rounded-full bg-[#FFF1D8] px-3 py-1 text-xs font-black text-[#A86F18]">{product.badge}</span>}<span className="text-xs font-semibold text-[#758078]">{product.brand}</span></div>
                    <h1 className="mt-3 text-[26px] font-black leading-[1.3] tracking-[-0.03em] text-[#173B29] sm:mt-4 sm:text-[38px]">{product.name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><a href="#reviews" className="flex items-center gap-2 font-bold text-[#345542]"><StarRating rating={product.rating} />{product.rating}<span className="font-normal text-[#77857D]">({product.reviewCount} تقييم)</span></a><span className="flex items-center gap-1.5 text-[#6C7B72]"><PackageCheck className="h-4 w-4 text-[#3C8B5A]" />{product.soldCount} مبيعة</span></div>
                    <p className="mt-4 text-sm leading-7 text-[#53645A] sm:mt-5 sm:text-[15px] sm:leading-8">{product.shortDesc}</p>
                    <div className="mt-4 rounded-2xl bg-[#F0F7ED] p-3.5 sm:mt-6 sm:p-4"><div className="flex items-center gap-2 text-sm font-black text-[#1F6B45]"><Leaf className="h-4 w-4" />قرار سريع لمزرعتك</div><div className="mt-3 flex flex-wrap gap-2">{farmFitTags.map((tag) => <span key={tag} className="rounded-xl border border-[#D3E5CF] bg-white px-2.5 py-1.5 text-xs font-bold text-[#3B5D4B]">{tag}</span>)}</div></div>
                  </div>
                </div>
              </div>
              <aside className="min-w-0 border-t border-[#DFEADD] bg-[#FBFDF9] p-3 sm:p-5 lg:border-r lg:border-t-0 lg:p-6"><ProductPurchaseCard product={product} /></aside>
            </div>
          </section>

          <div className="mt-4 grid min-w-0 gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
            <div className="min-w-0 space-y-4 sm:space-y-6">
              <section className="rounded-[22px] border border-[#DCE8DA] bg-white p-4 sm:rounded-[26px] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-black text-[#5C8A6D]">دليل الاستخدام</p><h2 className="mt-1 text-lg font-black sm:text-xl">كيف تستفيد من المنتج؟</h2></div><Droplets className="h-6 w-6 text-[#1F6B45]" /></div><div className="mt-4 grid gap-2.5 sm:grid-cols-2">{product.usageInstructions.slice(0, 4).map((instruction, index) => <div key={instruction} className="flex gap-3 rounded-2xl bg-[#F7FAF5] p-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1F6B45] text-xs font-black text-white">{index + 1}</span><p className="text-sm leading-6 text-[#46584D]">{instruction}</p></div>)}</div></section>
              <ProductDoseCalculator product={product} />
              <section className="overflow-hidden rounded-[22px] border border-[#DCE8DA] bg-white sm:rounded-[26px]"><div className="border-b border-[#E5EEE2] px-4 py-4 sm:px-6 sm:py-5"><p className="text-xs font-black text-[#5C8A6D]">مواصفات واضحة</p><h2 className="mt-1 text-lg font-black sm:text-xl">ما الذي ستحصل عليه؟</h2></div><div className="divide-y divide-[#E8F0E6]">{primarySpecs.map((spec) => <div key={spec.label} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6"><span className="min-w-0 text-sm font-semibold text-[#718078]">{spec.label}</span><span className="min-w-0 text-left text-sm font-black text-[#193C2A]">{spec.value}</span></div>)}</div></section>
              <ProductInfoTabs product={product} />
              <ProductQuestions productId={product.id} />
            </div>
            <aside className="order-first min-w-0 space-y-4 lg:order-none"><section className="rounded-[22px] border border-[#DCE8DA] bg-white p-4 sm:rounded-[24px] sm:p-5"><p className="text-xs font-bold text-[#6E8376]">المورد المعتمد</p><div className="mt-3 flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#EAF5E7]"><img src={product.supplier.logo} alt={product.supplier.name} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><h2 className="truncate text-sm font-black">{product.supplier.name}</h2>{product.supplier.verified && <Award className="h-4 w-4 shrink-0 text-[#D19A32]" />}</div><p className="mt-1 flex items-center gap-1 text-xs text-[#738078]"><MapPin className="h-3.5 w-3.5 text-[#3C8B5A]" />{product.supplier.location}</p><div className="mt-2 flex items-center gap-1.5"><StarRating rating={product.supplier.rating} /><span className="text-xs font-bold">{product.supplier.rating}</span></div></div></div><Link href="/dashboard/messages" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#1F6B45] py-3 text-sm font-black text-[#1F6B45]"><MessageCircle className="h-4 w-4" />راسل المورد</Link></section><section className="rounded-[22px] bg-[#183F2B] p-4 text-white sm:rounded-[24px] sm:p-5"><Sparkles className="h-5 w-5 text-[#E8B75C]" /><h2 className="mt-3 text-base font-black">هل تحتاج مشورة قبل الشراء؟</h2><p className="mt-2 text-xs leading-6 text-[#C8DDC8]">ارفع صورة لمحصولك واحصل على توصيات أدق قبل طلب المنتج.</p><Link href="/diagnosis" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#F0C66D]">ابدأ التشخيص الذكي<ChevronLeft className="h-4 w-4" /></Link></section></aside>
          </div>

          <section id="reviews" className="mt-7 min-w-0 sm:mt-10"><ProductReviews product={product} /></section>
          <section className="mt-7 min-w-0 sm:mt-10"><RelatedProducts products={product.relatedProducts} /></section>
        </div>
      </main>
      <div className={`fixed inset-x-0 bottom-[calc(4.35rem+env(safe-area-inset-bottom))] z-30 border-t border-[#D7E4D5] bg-white/95 px-3 py-2.5 shadow-[0_-9px_26px_rgba(18,56,36,0.12)] backdrop-blur transition-transform duration-200 lg:hidden ${showMobileAction ? "translate-y-0" : "translate-y-[140%]"}`}>
        <div className="mx-auto flex max-w-xl items-center gap-2"><div className="min-w-0 flex-1"><p className="truncate text-[11px] text-[#77857D]">{product.unit}</p><p className="text-lg font-black text-[#1F6B45]">{product.priceFormatted}</p></div><button onClick={handleMobileCart} className="min-h-11 rounded-xl border border-[#1F6B45] px-3 text-xs font-black text-[#1F6B45]">{inCart ? "السلة" : "أضف"}</button><button onClick={handleMobileBuy} className="flex min-h-11 items-center gap-1.5 rounded-xl bg-[#D19A32] px-4 text-sm font-black text-white"><ShoppingBag className="h-4 w-4" />اشتر الآن</button></div>
      </div>
      <Footer />
    </div>
  );
}
