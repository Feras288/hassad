/*
 * HASAAD PLATFORM — Product Preview Modal
 * Design: Deep Slate Admin | Faithful replica of the storefront product detail page
 * Shows exactly how the product will appear to customers before saving
 */
import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, Share2,
  CheckCircle, AlertTriangle, Award, FileText, Settings, BookOpen,
  Leaf, Eye, TrendingUp, Package, Tag, Truck, RotateCcw
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface ImageItem {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProductSpec {
  label: string;
  value: string;
}

export interface PreviewData {
  name: string;
  nameEn: string;
  sku: string;
  category: string;
  brand: string;
  vendor: string;
  price: string;
  originalPrice: string;
  unit: string;
  minOrder: string;
  stock: string;
  status: string;
  shortDesc: string;
  longDesc: string;
  highlights: string[];
  specs: ProductSpec[];
  usageInstructions: string[];
  certifications: string[];
  tags: string[];
  images: ImageItem[];
}

interface ProductPreviewModalProps {
  data: PreviewData;
  onClose: () => void;
}

const infoTabs = [
  { id: "description", label: "الوصف", icon: FileText },
  { id: "specs",       label: "المواصفات", icon: Settings },
  { id: "usage",       label: "طريقة الاستخدام", icon: BookOpen },
  { id: "certifications", label: "الشهادات", icon: Award },
];

export default function ProductPreviewModal({ data, onClose }: ProductPreviewModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [qty, setQty] = useState(Number(data.minOrder) || 1);

  const images = data.images.length > 0
    ? data.images
    : [{ id: "placeholder", url: "", isPrimary: true }];

  const price = parseFloat(data.price) || 0;
  const originalPrice = parseFloat(data.originalPrice) || 0;
  const discount = originalPrice > price && originalPrice > 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const filledHighlights = data.highlights.filter(h => h.trim());
  const filledSpecs = data.specs.filter(s => s.label.trim() && s.value.trim());
  const filledUsage = data.usageInstructions.filter(u => u.trim());
  const filledCerts = data.certifications.filter(c => c.trim());
  const filledTags = data.tags.filter(t => t.trim());

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-4 px-2">
      <div className="relative w-full max-w-5xl bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Header Bar ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1a2332] px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold text-white">معاينة المنتج</span>
            <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full">
              هذا ما سيراه العملاء في المتجر
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Simulated Navbar ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2E7D32] rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#263238] text-base">حصاد</span>
            <span className="text-[10px] text-gray-400 hidden sm:block">منصة زراعية متكاملة</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">السوق</span>
            <span className="text-xs text-gray-400 hidden sm:block">تشخيص المحاصيل</span>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="p-5 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="hover:text-[#2E7D32] cursor-pointer">الرئيسية</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="hover:text-[#2E7D32] cursor-pointer">السوق الزراعي</span>
            <ChevronLeft className="w-3 h-3" />
            {data.category && <><span className="hover:text-[#2E7D32] cursor-pointer">{data.category}</span><ChevronLeft className="w-3 h-3" /></>}
            <span className="text-[#263238] font-medium truncate max-w-[160px]">{data.name || "اسم المنتج"}</span>
          </nav>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Gallery ── */}
            <div className="lg:col-span-5">
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square mb-3 shadow-sm">
                {images[activeImage]?.url ? (
                  <img
                    src={images[activeImage].url}
                    alt={data.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <Package className="w-16 h-16 mb-2" />
                    <span className="text-sm">لا توجد صورة</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                    -{discount}%
                  </div>
                )}
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setActiveImage(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        i === activeImage ? "border-[#2E7D32] shadow-md" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {img.url ? (
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info + Purchase Card ── */}
            <div className="lg:col-span-7 space-y-4">
              {/* Product Header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {data.category && (
                    <span className="text-xs font-bold text-[#4CAF50] bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      {data.category}
                    </span>
                  )}
                  {data.brand && (
                    <span className="text-xs text-gray-400">{data.brand}</span>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-xl font-black text-[#263238] leading-tight mb-1">
                  {data.name || <span className="text-gray-300">اسم المنتج</span>}
                </h1>
                {data.nameEn && (
                  <p className="text-sm text-gray-400 mb-3" dir="ltr">{data.nameEn}</p>
                )}

                {/* Rating placeholder */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= 4 ? "fill-[#C9A227] text-[#C9A227]" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">4.0 (معاينة)</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="w-3.5 h-3.5" />
                    120+ مشاهدة
                  </span>
                </div>

                {/* Short Description */}
                {data.shortDesc && (
                  <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                    {data.shortDesc}
                  </p>
                )}
              </div>

              {/* Purchase Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                {/* Price */}
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-3xl font-black text-[#2E7D32]">
                      {price > 0 ? `${price.toLocaleString("ar-SA")} ر` : <span className="text-gray-300 text-xl">السعر غير محدد</span>}
                    </p>
                    {data.unit && <p className="text-xs text-gray-400 mt-0.5">لكل {data.unit}</p>}
                  </div>
                  {originalPrice > price && originalPrice > 0 && (
                    <div className="pb-1">
                      <p className="text-sm text-gray-400 line-through">{originalPrice.toLocaleString("ar-SA")} ر</p>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        وفر {discount}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {parseInt(data.stock) > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-emerald-600 font-medium">
                        متوفر في المخزون ({parseInt(data.stock).toLocaleString("ar-SA")} {data.unit || "وحدة"})
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm text-red-500 font-medium">نفد المخزون</span>
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">الكمية</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(q => Math.max(Number(data.minOrder) || 1, q - 1))}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                    >-</button>
                    <span className="w-10 text-center font-black text-[#263238]">{qty}</span>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold transition-colors"
                    >+</button>
                    <span className="text-xs text-gray-400">الحد الأدنى: {data.minOrder || 1}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#C9A227] hover:bg-[#b8911e] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <ShoppingBag className="w-4 h-4" />
                    أضف إلى السلة
                  </button>
                  <button className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Vendor */}
                {data.vendor && (
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                    <div className="w-9 h-9 bg-[#2E7D32]/10 rounded-xl flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-[#2E7D32]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">البائع</p>
                      <p className="text-sm font-bold text-[#263238]">{data.vendor}</p>
                    </div>
                  </div>
                )}

                {/* Shipping & Return */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    <Truck className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#263238]">شحن سريع</p>
                      <p className="text-[10px] text-gray-400">2-5 أيام عمل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    <RotateCcw className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#263238]">إرجاع مجاني</p>
                      <p className="text-[10px] text-gray-400">خلال 14 يوم</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Info Tabs ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {infoTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#2E7D32] text-[#2E7D32] bg-green-50/50"
                      : "border-transparent text-gray-500 hover:text-[#2E7D32] hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="space-y-5">
                  {data.shortDesc && (
                    <p className="text-gray-600 leading-relaxed text-base">{data.shortDesc}</p>
                  )}
                  {data.longDesc && (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{data.longDesc}</p>
                  )}
                  {filledHighlights.length > 0 && (
                    <div>
                      <h4 className="font-black text-[#263238] mb-4 text-base flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                        المميزات الرئيسية
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filledHighlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 bg-green-50/60 rounded-xl p-3.5 border border-green-100">
                            <div className="w-5 h-5 rounded-full bg-[#4CAF50] flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle className="w-3 h-3 text-white fill-white" />
                            </div>
                            <span className="text-sm text-[#263238] font-medium">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {filledTags.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#263238] mb-3 text-sm">الكلمات المفتاحية</h4>
                      <div className="flex flex-wrap gap-2">
                        {filledTags.map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!data.shortDesc && !data.longDesc && filledHighlights.length === 0 && (
                    <div className="text-center py-8 text-gray-300">
                      <FileText className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">لم يتم إدخال وصف المنتج بعد</p>
                    </div>
                  )}
                </div>
              )}

              {/* Specs Tab */}
              {activeTab === "specs" && (
                <div>
                  {filledSpecs.length > 0 ? (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#2E7D32]" />
                        <h4 className="font-black text-[#263238]">المواصفات التقنية</h4>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-gray-100">
                        {filledSpecs.map((spec, i) => (
                          <div key={i} className={`flex items-center ${i % 2 === 0 ? "bg-gray-50/80" : "bg-white"}`}>
                            <div className="w-2/5 px-5 py-3.5 border-l border-gray-100">
                              <span className="text-sm font-bold text-[#263238]">{spec.label}</span>
                            </div>
                            <div className="w-3/5 px-5 py-3.5">
                              <span className="text-sm text-gray-600">{spec.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {data.sku && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">رقم المنتج (SKU)</p>
                            <p className="text-sm font-bold text-[#263238] font-mono">{data.sku}</p>
                          </div>
                        )}
                        {data.brand && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">الشركة المصنّعة</p>
                            <p className="text-sm font-bold text-[#263238]">{data.brand}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-300">
                      <Settings className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">لم يتم إدخال مواصفات المنتج بعد</p>
                    </div>
                  )}
                </div>
              )}

              {/* Usage Tab */}
              {activeTab === "usage" && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      يُرجى قراءة تعليمات الاستخدام بعناية قبل التطبيق. ارتدِ معدات الحماية المناسبة عند التعامل مع المنتج.
                    </p>
                  </div>
                  {filledUsage.length > 0 ? (
                    <div>
                      <h4 className="font-black text-[#263238] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#2E7D32]" />
                        تعليمات الاستخدام
                      </h4>
                      <div className="space-y-3">
                        {filledUsage.map((instruction, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-8 h-8 bg-[#2E7D32] text-white rounded-full flex items-center justify-center text-sm font-black shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-xl p-4">
                              <p className="text-sm text-[#263238] leading-relaxed">{instruction}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-300">
                      <BookOpen className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">لم يتم إدخال تعليمات الاستخدام بعد</p>
                    </div>
                  )}
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === "certifications" && (
                <div className="space-y-5">
                  {filledCerts.length > 0 ? (
                    <>
                      <p className="text-gray-500 text-sm">هذا المنتج حاصل على الشهادات والاعتمادات التالية</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filledCerts.map((cert, i) => (
                          <div key={i} className="flex flex-col items-center text-center p-5 bg-gradient-to-b from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                              <Award className="w-7 h-7 text-[#C9A227]" />
                            </div>
                            <p className="text-sm font-bold text-[#263238] leading-snug">{cert}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-300">
                      <Award className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">لم يتم إدخال شهادات المنتج بعد</p>
                    </div>
                  )}
                  <div className="bg-[#F5F1E8] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#263238] mb-1">ضمان الأصالة</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          جميع المنتجات المعروضة في منصة حصاد تمر بعملية تحقق صارمة للتأكد من أصالتها وصلاحيتها.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Preview Footer Note ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">هذه معاينة فقط</p>
              <p className="text-xs text-amber-600 mt-0.5">
                الصفحة الفعلية قد تختلف قليلاً بسبب التقييمات والمنتجات المرتبطة التي تُحمَّل من البيانات الحية. احفظ المنتج لنشره في المتجر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
