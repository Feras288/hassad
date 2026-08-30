/*
 * HASAAD PLATFORM — Dashboard Favorites Page
 * Design: Modern SaaS Dashboard, RTL, Green palette
 * Full favorites management: grid/list view, sort, filter, bulk actions
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Heart, ShoppingCart, Trash2, Search, SlidersHorizontal,
  Star, ArrowUpDown, LayoutGrid, List, Package, Share2,
  TrendingDown, Sparkles, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useFavorites } from "@/contexts/FavoritesContext";

type SortOption = "newest" | "oldest" | "name" | "rating";
type ViewMode = "grid" | "list";

const sortLabels: Record<SortOption, string> = {
  newest: "الأحدث إضافةً",
  oldest: "الأقدم إضافةً",
  name: "الاسم (أ-ي)",
  rating: "الأعلى تقييماً",
};

export default function DashboardFavorites() {
  const { favorites, removeFavorite, clearFavorites, favoritesCount } = useFavorites();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = useMemo(() => {
    let list = [...favorites];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "newest":
        list.sort((a, b) => b.addedAt - a.addedAt);
        break;
      case "oldest":
        list.sort((a, b) => a.addedAt - b.addedAt);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [favorites, search, sort]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const removeSelected = () => {
    selectedIds.forEach((id) => removeFavorite(id));
    toast.success(`تم حذف ${selectedIds.size} منتج من المفضلة`);
    setSelectedIds(new Set());
  };

  const handleAddToCart = (name: string) => {
    toast.success(`تمت إضافة "${name}" إلى سلة التسوق`);
  };

  const handleShare = (name: string) => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success(`تم نسخ رابط "${name}"`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              قائمة المفضلة
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {favoritesCount > 0
                ? `${favoritesCount} منتج محفوظ`
                : "لا توجد منتجات محفوظة بعد"}
            </p>
          </div>
          {favoritesCount > 0 && (
            <button
              onClick={() => {
                if (confirm("هل تريد مسح جميع المنتجات من المفضلة؟")) {
                  clearFavorites();
                  toast.info("تم مسح قائمة المفضلة");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              مسح الكل
            </button>
          )}
        </div>

        {/* Empty State */}
        {favoritesCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-black text-gray-700 mb-2">قائمة المفضلة فارغة</h2>
            <p className="text-gray-400 max-w-sm mb-8">
              ابدأ بإضافة المنتجات التي تعجبك إلى المفضلة للوصول إليها بسرعة لاحقاً
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <Package className="w-5 h-5" />
              تصفح المنتجات
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        )}

        {favoritesCount > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في المفضلة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#4CAF50] transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortLabels[sort]}
                </button>
                {showSortMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-44 overflow-hidden">
                    {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSort(key); setShowSortMenu(false); }}
                        className={`w-full text-right px-4 py-2.5 text-sm font-semibold transition-colors ${
                          sort === key
                            ? "bg-green-50 text-[#2E7D32]"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    view === "grid" ? "bg-white shadow-sm text-[#2E7D32]" : "text-gray-400"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    view === "list" ? "bg-white shadow-sm text-[#2E7D32]" : "text-gray-400"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between bg-[#2E7D32]/5 border border-[#2E7D32]/20 rounded-xl px-4 py-3 mb-4">
                <span className="text-sm font-semibold text-[#2E7D32]">
                  تم تحديد {selectedIds.size} منتج
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      selectedIds.forEach((id) => {
                        const p = favorites.find((f) => f.id === id);
                        if (p) handleAddToCart(p.name);
                      });
                      setSelectedIds(new Set());
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-bold rounded-lg hover:bg-[#4CAF50] transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    أضف للسلة
                  </button>
                  <button
                    onClick={removeSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف المحدد
                  </button>
                </div>
              </div>
            )}

            {/* Select All */}
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded accent-[#2E7D32]"
                />
                <span className="text-sm text-gray-500 font-medium">تحديد الكل</span>
              </label>
              <span className="text-sm text-gray-400">
                ({filtered.length} نتيجة)
              </span>
            </div>

            {/* No results */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">لا توجد نتائج لـ "{search}"</p>
              </div>
            )}

            {/* Grid View */}
            {view === "grid" && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative ${
                      selectedIds.has(product.id)
                        ? "border-[#4CAF50] ring-2 ring-[#4CAF50]/20"
                        : "border-gray-100"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 rounded accent-[#2E7D32] cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Image */}
                    <Link href="/product/npk-fertilizer-20-20-20" className="block">
                      <div className="relative h-44 overflow-hidden bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.badge && (
                          <div
                            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-full"
                            style={{ backgroundColor: product.badgeColor }}
                          >
                            {product.badge}
                          </div>
                        )}
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(product.name); }}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#2E7D32] hover:text-white transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); handleShare(product.name); }}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#2E7D32] hover:text-white transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <span className="text-xs text-[#4CAF50] font-semibold mb-1 block">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 mb-2 leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? "text-[#C9A227] fill-[#C9A227]"
                                  : "text-gray-200 fill-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-black text-[#2E7D32]">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through mr-1.5">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFavorite(product.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="إزالة من المفضلة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {view === "list" && filtered.length > 0 && (
              <div className="space-y-3">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl border flex items-center gap-4 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                      selectedIds.has(product.id)
                        ? "border-[#4CAF50] ring-2 ring-[#4CAF50]/20"
                        : "border-gray-100"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 rounded accent-[#2E7D32] cursor-pointer shrink-0"
                    />

                    {/* Image */}
                    <Link href="/product/npk-fertilizer-20-20-20" className="shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#4CAF50] font-semibold">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 mt-0.5 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? "text-[#C9A227] fill-[#C9A227]"
                                  : "text-gray-200 fill-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-[#2E7D32] block">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAddToCart(product.name)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#2E7D32] hover:bg-[#4CAF50] text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        أضف للسلة
                      </button>
                      <button
                        onClick={() => removeFavorite(product.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-100"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-10 bg-gradient-to-l from-[#2E7D32]/5 to-[#4CAF50]/5 border border-[#4CAF50]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2E7D32]/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div>
                  <p className="font-black text-gray-800">اكتشف منتجات مشابهة</p>
                  <p className="text-sm text-gray-500">بناءً على اهتماماتك الزراعية</p>
                </div>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
              >
                <TrendingDown className="w-4 h-4" />
                تصفح السوق
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
