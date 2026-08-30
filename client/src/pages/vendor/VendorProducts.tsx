// ===================================================
// Hasaad Platform — Vendor Products Management Page
// Design: Modern SaaS + Organic Warmth | RTL Arabic
// ===================================================

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  MoreVertical,
  Star,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { useVendorProducts } from "@/contexts/VendorProductsContext";

export default function VendorProducts() {
  const [, navigate] = useLocation();
  const { products, deleteProduct, toggleStatus } = useVendorProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Derive unique categories from actual products
  const categorySet = new Set(products.map((p) => p.category));
  const categories = ["all", ...Array.from(categorySet)];

  const statuses = ["all", "active", "low_stock", "out_of_stock", "draft"];

  const statusLabels: Record<string, string> = {
    all: "جميع الحالات",
    active: "نشط",
    low_stock: "مخزون منخفض",
    out_of_stock: "نفد المخزون",
    draft: "مسودة",
    inactive: "غير نشط",
    pending: "قيد المراجعة",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    low_stock: "bg-amber-100 text-amber-700",
    out_of_stock: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
    inactive: "bg-gray-100 text-gray-500",
    pending: "bg-blue-100 text-blue-600",
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.includes(searchQuery) || p.sku.includes(searchQuery);
    const matchCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchStatus =
      selectedStatus === "all" || p.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success("تم حذف المنتج بنجاح");
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
    toast.success("تم تحديث حالة المنتج");
  };

  const summaryCards = [
    { label: "إجمالي المنتجات", value: products.length, icon: Package, color: "bg-[#2E7D32]" },
    { label: "منتجات نشطة", value: products.filter((p) => p.status === "active").length, icon: Eye, color: "bg-blue-600" },
    { label: "مخزون منخفض", value: products.filter((p) => p.status === "low_stock").length, icon: AlertTriangle, color: "bg-amber-500" },
    { label: "نفد المخزون", value: products.filter((p) => p.status === "out_of_stock").length, icon: Package, color: "bg-red-500" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F1E8] overflow-hidden" dir="rtl">
      <VendorSidebar vendorType="supplier" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader
          vendorType="supplier"
          pageTitle="إدارة المنتجات"
          pageSubtitle="أضف وعدّل منتجاتك وتابع مستوى المخزون"
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#263238]">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث باسم المنتج أو رمز SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1 text-right"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 outline-none cursor-pointer pr-8"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "جميع الفئات" : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 outline-none cursor-pointer pr-8"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex-1" />

              {/* Add Product — now links to /vendor/products/new */}
              <Link
                href="/vendor/products/new"
                className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                إضافة منتج
              </Link>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#263238]">
                قائمة المنتجات
                <span className="text-sm font-normal text-gray-500 mr-2">({filtered.length} منتج)</span>
              </h3>
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-gray-400" />
                <span className="text-sm text-gray-500">ترتيب حسب: الأحدث</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">المنتج</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الفئة</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">السعر</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المخزون</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المبيعات</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">التقييم</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الحالة</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">آخر تعديل</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#263238]">{product.name}</p>
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="text-xs bg-[#F5F1E8] text-[#2E7D32] px-2 py-1 rounded-lg font-medium">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-[#263238]">{product.price.toLocaleString("ar-SA")} ر.س</p>
                          {product.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString("ar-SA")} ر.س</p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                            <div
                              className={`h-1.5 rounded-full ${
                                product.stock > 50 ? "bg-green-500" :
                                product.stock > 10 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min((product.stock / 200) * 100, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${
                            product.stock > 50 ? "text-green-600" :
                            product.stock > 10 ? "text-amber-600" : "text-red-600"
                          }`}>{product.stock}</span>
                        </div>
                      </td>

                      {/* Sales */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-[#263238]">{product.sold}</span>
                          <span className={`flex items-center gap-0.5 text-xs ${
                            product.growth >= 0 ? "text-green-600" : "text-red-500"
                          }`}>
                            {product.growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {Math.abs(product.growth)}%
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={13} className="text-[#C9A227] fill-[#C9A227]" />
                          <span className="text-sm font-semibold text-[#263238]">{product.rating || "—"}</span>
                          <span className="text-xs text-gray-400">({product.reviewCount})</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-opacity hover:opacity-80 ${statusColors[product.status] || "bg-gray-100 text-gray-500"}`}
                        >
                          {statusLabels[product.status] || product.status}
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4">
                        {product.updatedAt ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-gray-700">
                              {new Date(product.updatedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {(() => {
                                const diff = Math.floor((Date.now() - new Date(product.updatedAt).getTime()) / 86400000);
                                if (diff === 0) return "اليوم";
                                if (diff === 1) return "أمس";
                                if (diff < 7) return `منذ ${diff} أيام`;
                                if (diff < 30) return `منذ ${Math.floor(diff / 7)} أسابيع`;
                                if (diff < 365) return `منذ ${Math.floor(diff / 30)} أشهر`;
                                return `منذ ${Math.floor(diff / 365)} سنة`;
                              })()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                            className="w-8 h-8 bg-gray-100 hover:bg-[#2E7D32] hover:text-white text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit size={14} />
                          </button>
                          <Link
                            href={`/product/${product.id}`}
                            className="w-8 h-8 bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="w-8 h-8 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Package size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد منتجات مطابقة</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "جرّب تغيير معايير البحث أو الفلاتر"
                      : "ابدأ بإضافة منتجك الأول"}
                  </p>
                  {!searchQuery && selectedCategory === "all" && selectedStatus === "all" && (
                    <Link
                      href="/vendor/products/new"
                      className="inline-flex items-center gap-2 mt-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus size={16} />
                      إضافة منتج جديد
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
