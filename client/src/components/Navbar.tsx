/**
 * HASAAD PLATFORM — Navbar
 * Design: Matches reference HTML design exactly
 * Structure: Utility Bar → Main Header (Logo + Search + Actions) → Category Strip
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Truck, Phone, MapPin, Globe, Search, ChevronDown,
  Bell, Clock3, Heart, ShoppingCart, TrendingUp, User, LayoutGrid, Menu, X,
  Sprout, Leaf, BugOff, Droplets, Tractor, Wrench, Warehouse,
  ScanLine, HardHat, House, Store, Wheat
} from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBell from "@/components/NotificationBell";
import { trpc } from "@/lib/trpc";
import { getRecentSearches, mergeRecentSearches, saveRecentSearches } from "@/lib/recentSearches";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";

const CATEGORY_NAV = [
  { label: "البذور والشتلات", href: "/marketplace?category=seeds" },
  { label: "الأسمدة", href: "/marketplace?category=fertilizers" },
  { label: "المبيدات الحيوية", href: "/marketplace?category=pesticides" },
  { label: "أنظمة الري", href: "/marketplace?category=irrigation" },
  { label: "المعدات الزراعية", href: "/marketplace?category=equipment" },
  { label: "مستلزمات الحيوانات", href: "/marketplace?category=livestock" },
  { label: "تشخيص بالذكاء الاصطناعي", href: "/diagnosis", isNew: true },
  { label: "حجز مهندس زراعي", href: "/booking", isNew: true },
  { label: "سوق المحاصيل B2B", href: "/produce-marketplace", isNew: true },
  { label: "العروض", href: "/marketplace?category=offers" },
];

const SEARCH_CATEGORIES = [
  "كل الفئات", "البذور", "الأسمدة", "المبيدات", "الري", "المعدات", "الخدمات"
];

function ProductSearchSuggestions({ query, onSelect }: { query: string; onSelect: () => void }) {
  const normalizedQuery = query.trim();
  const input = useMemo(() => ({ query: normalizedQuery, limit: 6 }), [normalizedQuery]);
  const { data: suggestions = [], isFetching } = trpc.products.suggestions.useQuery(input, {
    enabled: normalizedQuery.length >= 1,
    staleTime: 10_000,
  });

  if (!normalizedQuery) return null;
  return (
    <div className="absolute inset-x-0 top-[calc(100%+8px)] z-[60] overflow-hidden rounded-2xl border border-[#E5E1D6] bg-white py-2 shadow-xl" role="listbox" aria-label="اقتراحات المنتجات">
      {isFetching ? <p className="px-4 py-3 text-sm text-[#77766F]">جارٍ البحث عن منتجات مطابقة…</p> : suggestions.length === 0 ? <p className="px-4 py-3 text-sm text-[#77766F]">لا توجد منتجات مطابقة لـ «{normalizedQuery}»</p> : <>
        <p className="px-4 pb-1 pt-1 text-xs font-bold text-[#5D896E]">منتجات مقترحة</p>
        {suggestions.map((product) => <Link key={product.id} href={`/product/${product.id}`} onClick={onSelect} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F4F8F1]" role="option">
          <img src={product.images[0] || "/hassad-logo.png"} alt="" className="h-10 w-10 rounded-lg border border-[#E5E1D6] object-cover" />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#263238]">{product.name}</span><span className="mt-0.5 block text-xs text-[#77766F]">{product.category} · {product.price.toLocaleString("ar-SA")} ر.س</span></span>
          <Search className="h-4 w-4 shrink-0 text-[#5D896E]" />
        </Link>)}
        <button type="submit" className="mt-1 flex w-full items-center justify-between border-t border-[#F0EEE8] px-4 py-2.5 text-sm font-semibold text-[#1F4D3A] hover:bg-[#F4F8F1]">عرض كل نتائج البحث عن «{normalizedQuery}»<ChevronDown className="h-4 w-4 -rotate-90" /></button>
      </>}
    </div>
  );
}

const QUICK_SEARCHES = ["أسمدة", "بذور", "مبيدات", "أنظمة الري", "طماطم"];

function SearchDiscoveryPanel({ recentSearches, onSearch, onClear }: { recentSearches: string[]; onSearch: (query: string) => void; onClear: () => void }) {
  return <div className="absolute inset-x-0 top-[calc(100%+8px)] z-[60] overflow-hidden rounded-2xl border border-[#E5E1D6] bg-white py-2 shadow-xl" aria-label="عمليات البحث السابقة والمقترحة">
    {recentSearches.length > 0 && <div className="border-b border-[#F0EEE8] px-4 py-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-[#5D896E]"><Clock3 className="h-3.5 w-3.5" />عمليات بحثك الأخيرة</span><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={onClear} className="text-xs font-semibold text-[#8B5C35] hover:underline">مسح السجل</button></div><div className="flex flex-wrap gap-2">{recentSearches.map((query) => <button key={query} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSearch(query)} className="rounded-full bg-[#F4F8F1] px-3 py-1.5 text-sm text-[#305E43] transition-colors hover:bg-[#E4F1DE]">{query}</button>)}</div></div>}
    <div className="px-4 py-3"><span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#5D896E]"><TrendingUp className="h-3.5 w-3.5" />اقتراحات بحث سريعة</span><div className="flex flex-wrap gap-2">{QUICK_SEARCHES.map((query) => <button key={query} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSearch(query)} className="rounded-full border border-[#D6E3D2] bg-white px-3 py-1.5 text-sm text-[#3D3D38] transition-colors hover:border-[#86B999] hover:bg-[#F4F8F1]">{query}</button>)}</div></div>
  </div>;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchCat, setSearchCat] = useState("كل الفئات");
  const [showCatDrop, setShowCatDrop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const { favoritesCount } = useFavorites();
  const { cartCount } = useCart();
  const { isEnglish, toggleLanguage } = useLanguage();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.body.classList.add("has-mobile-bottom-nav");
    return () => document.body.classList.remove("has-mobile-bottom-nav");
  }, []);
  const mobileMenuSwipe = useSwipeToClose({ enabled: mobileOpen, axis: "y", closeDirection: -1, onClose: () => setMobileOpen(false) });

  const runSearch = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;
    const nextRecentSearches = mergeRecentSearches(recentSearches, query);
    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
    setSearchQuery(query);
    setSearchFocused(false);
    navigate(`/marketplace?q=${encodeURIComponent(query)}`);
  };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); runSearch(searchQuery); };
  const openSearch = () => { setRecentSearches(getRecentSearches()); setSearchFocused(true); };
  const clearRecentSearches = () => { setRecentSearches([]); saveRecentSearches([]); };

  return (
    <>
      {/* ===== UTILITY BAR ===== */}
      <div className="bg-[#123528] text-[#DDE7DE] text-[13px] py-2 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center gap-6">
          <div className="flex gap-5">
            <a href="tel:920000000" className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
              <Truck className="w-3.5 h-3.5" />
              شحن مجاني للطلبات فوق ٥٠٠ ريال
            </a>
            <a href="tel:920000000" className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
              <Phone className="w-3.5 h-3.5" />
              الدعم الفني: ٩٢٠٠٠٠٠٠٠
            </a>
            <Link href="/dashboard/orders" className="flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
              <MapPin className="w-3.5 h-3.5" />
              تتبع الطلب
            </Link>
          </div>
          <div className="flex gap-4 items-center opacity-90">
            <Link href="/dashboard" className="hover:opacity-100">مركز المساعدة</Link>
            <Link href="/register?role=vendor" className="hover:opacity-100">كن بائعاً</Link>
            <span className="hover:opacity-100 cursor-pointer">تحميل التطبيق</span>
            <button type="button" onClick={toggleLanguage} className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 transition-colors hover:bg-white/10" aria-label={isEnglish ? "Switch to Arabic" : "Switch to English"}>
              <Globe className="w-3.5 h-3.5" />
              <span>{isEnglish ? "العربية" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className="bg-white border-b border-[#E5E1D6] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 py-2.5 md:grid-cols-[auto_1fr_auto] md:gap-8 md:py-[18px]">

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/hassad-logo.png" alt="حصاد" className="h-9 w-auto object-contain md:h-10" />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:flex items-center bg-[#F4F1EA] border-[1.5px] border-transparent rounded-full p-1 focus-within:bg-white focus-within:border-[#3D8A66] focus-within:shadow-[0_0_0_4px_rgba(61,138,102,0.08)] transition-all max-w-[680px] w-full mx-auto">
              {/* Category Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCatDrop(!showCatDrop)}
                  className="flex items-center gap-1.5 px-3.5 pl-5 h-10 border-l border-[#D4CFC0] text-[#3D3D38] font-medium text-sm whitespace-nowrap"
                >
                  <span>{searchCat}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showCatDrop && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-[#E5E1D6] rounded-xl shadow-lg py-1 min-w-[140px] z-50">
                    {SEARCH_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setSearchCat(cat); setShowCatDrop(false); }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-[#F4F1EA] text-[#3D3D38]"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={openSearch}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder="ابحث عن بذور، أسمدة، مبيدات، خدمات..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] text-[#1A1A17] placeholder-[#94948B] min-w-0 h-10"
              />
              <button
                type="submit"
                className="bg-[#1F4D3A] hover:bg-[#123528] text-white px-[22px] h-10 rounded-full font-semibold text-sm flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                بحث
              </button>
              {searchFocused && (searchQuery.trim() ? <ProductSearchSuggestions query={searchQuery} onSelect={() => setSearchFocused(false)} /> : <SearchDiscoveryPanel recentSearches={recentSearches} onSearch={runSearch} onClear={clearRecentSearches} />)}
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <button className="hidden md:hidden w-11 h-11 rounded-xl grid place-items-center text-[#3D3D38] hover:bg-[#F4F1EA] transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Notification */}
              <div className="relative hidden md:block">
                <NotificationBell isScrolled={true} />
              </div>

              {/* Favorites */}
              <Link href="/dashboard/favorites" className="relative hidden h-11 w-11 place-items-center rounded-xl text-[#3D3D38] transition-colors hover:bg-[#F4F1EA] md:grid">
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#C44536] text-white text-[10px] font-semibold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-xl text-[#3D3D38] transition-colors hover:bg-[#F4F1EA] md:h-11 md:w-11">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#C44536] text-white text-[10px] font-semibold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Sign In */}
              <Link href="/auth" className="hidden items-center gap-2 rounded-xl bg-[#1F4D3A] px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123528] md:flex">
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E5E1D6] text-[#3D3D38] transition-colors hover:bg-[#F4F1EA] md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ===== CATEGORY STRIP ===== */}
        <div className="border-t border-[#E5E1D6] hidden md:block">
          <div className="max-w-[1440px] mx-auto px-8 flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-hide">
            {/* All Categories Button */}
            <Link href="/marketplace" className="ml-2 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#F1F5EE] px-[18px] py-2.5 text-sm font-semibold text-[#1F4D3A]">
              <LayoutGrid className="w-4 h-4" />
              كل الأقسام
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            {CATEGORY_NAV.map(cat => (
              <Link key={cat.label} href={cat.href} className={`shrink-0 whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-[#3D3D38] transition-colors hover:bg-[#F4F1EA] ${cat.isNew ? "flex items-center gap-1.5" : ""}`}>
                {cat.label}
                {cat.isNew && (
                  <span className="inline-block rounded-[4px] bg-[#E08C3B] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    جديد
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {mobileOpen && (
          <div {...mobileMenuSwipe.swipeHandlers} style={mobileMenuSwipe.swipeStyle} className="absolute inset-x-0 top-full max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[#E5E1D6] bg-white px-4 py-4 shadow-[0_18px_36px_rgba(17,50,37,0.14)] md:hidden space-y-1">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#D8E4D5]" aria-hidden="true" />
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative flex bg-[#F4F1EA] rounded-xl px-4 py-2.5 mb-3 gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={openSearch}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder="ابحث..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A17] placeholder-[#94948B]"
              />
              <button type="submit">
                <Search className="w-4 h-4 text-[#3D3D38]" />
              </button>
              {searchFocused && (searchQuery.trim() ? <ProductSearchSuggestions query={searchQuery} onSelect={() => { setSearchFocused(false); setMobileOpen(false); }} /> : <SearchDiscoveryPanel recentSearches={recentSearches} onSearch={(query) => { setMobileOpen(false); runSearch(query); }} onClear={clearRecentSearches} />)}
            </form>
            {CATEGORY_NAV.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#3D3D38] hover:bg-[#F4F1EA]"
              >
                {cat.label}
                {cat.isNew && (
                  <span className="rounded bg-[#E08C3B] px-1.5 py-0.5 text-[10px] font-semibold text-white">جديد</span>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E5E1D6]">
              <Link href="/auth" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white">
                <User className="w-4 h-4" />
                تسجيل الدخول
              </Link>
            </div>
            <button type="button" onClick={toggleLanguage} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D6E3D2] py-3 text-sm font-bold text-[#1F4D3A]">
              <Globe className="h-4 w-4" />
              {isEnglish ? "العربية" : "English"}
            </button>
          </div>
        )}
      </header>
      <nav className="mobile-bottom-nav md:hidden" aria-label="التنقل الرئيسي على الجوال">
        <Link href="/" className="mobile-bottom-nav-item"><House className="h-5 w-5" /><span>الرئيسية</span></Link>
        <Link href="/marketplace" className="mobile-bottom-nav-item"><Store className="h-5 w-5" /><span>السوق</span></Link>
        <Link href="/diagnosis" className="mobile-bottom-nav-item mobile-bottom-nav-item--primary"><ScanLine className="h-5 w-5" /><span>التشخيص</span></Link>
        <Link href="/cart" className="mobile-bottom-nav-item relative"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <span className="absolute right-[calc(50%-14px)] top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#C44536] px-1 text-[9px] font-bold text-white">{cartCount}</span>}<span>السلة</span></Link>
        <Link href="/dashboard" className="mobile-bottom-nav-item"><User className="h-5 w-5" /><span>حسابي</span></Link>
      </nav>
    </>
  );
}
