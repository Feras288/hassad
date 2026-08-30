/*
 * HASAAD PLATFORM — Vendor Edit Product Page
 * Design: Modern SaaS Dashboard, RTL, Green palette
 * Multi-step form pre-filled with existing product data from VendorProductsContext
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useVendorProducts } from "@/contexts/VendorProductsContext";
import {
  ChevronLeft, ChevronRight, Check, Package, DollarSign,
  ImagePlus, FileText, X, Plus, Trash2, Upload, Star,
  Tag, Layers, BarChart2, RefreshCw, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";

const STEPS = [
  { id: 1, label: "المعلومات الأساسية", icon: Package },
  { id: 2, label: "السعر والمخزون", icon: DollarSign },
  { id: 3, label: "الصور", icon: ImagePlus },
  { id: 4, label: "المواصفات والنشر", icon: FileText },
];

const CATEGORIES = [
  { value: "fertilizers", label: "الأسمدة", sub: ["أسمدة NPK", "أسمدة عضوية", "أسمدة ورقية", "أسمدة جذرية"] },
  { value: "seeds", label: "البذور والشتلات", sub: ["بذور خضروات", "بذور حبوب", "شتلات فاكهة", "بذور أعلاف"] },
  { value: "pesticides", label: "المبيدات والمكافحة", sub: ["مبيدات حشرية", "مبيدات فطرية", "مبيدات أعشاب", "مكافحة بيولوجية"] },
  { value: "irrigation", label: "معدات الري", sub: ["ري بالتنقيط", "رشاشات", "مضخات", "أنابيب وتوصيلات"] },
  { value: "machinery", label: "الآلات والمعدات", sub: ["جرارات", "حصادات", "رشاشات آلية", "معدات حراثة"] },
  { value: "packaging", label: "التغليف والتخزين", sub: ["أكياس", "صناديق", "مستودعات", "تبريد"] },
];

// Map Arabic category label back to value key
function categoryLabelToValue(label: string): string {
  const found = CATEGORIES.find(
    (c) => c.label === label || c.value === label
  );
  return found?.value || "";
}

interface FormData {
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  unit: string;
  sku: string;
  description: string;
  keywords: string;
  price: string;
  originalPrice: string;
  minOrder: string;
  weight: string;
  stock: string;
  lowStockAlert: string;
  freeShipping: boolean;
  images: { url: string; isMain: boolean }[];
  specs: { key: string; value: string }[];
  status: "active" | "draft";
  featured: boolean;
}

const defaultForm: FormData = {
  name: "",
  category: "",
  subCategory: "",
  brand: "",
  unit: "",
  sku: "",
  description: "",
  keywords: "",
  price: "",
  originalPrice: "",
  minOrder: "1",
  weight: "",
  stock: "",
  lowStockAlert: "10",
  freeShipping: false,
  images: [],
  specs: [{ key: "", value: "" }],
  status: "active",
  featured: false,
};

export default function VendorEditProduct() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { products, updateProduct } = useVendorProducts();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [notFound, setNotFound] = useState(false);
  const [productName, setProductName] = useState("");

  // Pre-fill form with existing product data
  useEffect(() => {
    if (!productId) { setNotFound(true); return; }
    const product = products.find((p) => p.id === productId);
    if (!product) { setNotFound(true); return; }

    setProductName(product.name);
    setForm({
      name: product.name || "",
      category: categoryLabelToValue(product.category) || product.category || "",
      subCategory: "",
      brand: "",
      unit: product.unit || "",
      sku: product.sku || "",
      description: "",
      keywords: "",
      price: String(product.price || ""),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      minOrder: "1",
      weight: "",
      stock: String(product.stock || ""),
      lowStockAlert: "10",
      freeShipping: false,
      images: product.image ? [{ url: product.image, isMain: true }] : [],
      specs: [{ key: "", value: "" }],
      status: (product.status as "active" | "draft") || "active",
      featured: false,
    });
  }, [productId, products]);

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category);
  const discount =
    form.price && form.originalPrice
      ? Math.round((1 - parseFloat(form.price) / parseFloat(form.originalPrice)) * 100)
      : 0;

  const generateSKU = () => {
    const prefix = form.category ? form.category.slice(0, 3).toUpperCase() : "PRD";
    const rand = Math.floor(Math.random() * 9000) + 1000;
    setForm((f) => ({ ...f, sku: `${prefix}-${rand}` }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { toast.error("أدخل اسم المنتج"); return false; }
      if (!form.category) { toast.error("اختر فئة المنتج"); return false; }
    }
    if (step === 2) {
      if (!form.price) { toast.error("أدخل سعر البيع"); return false; }
      if (!form.stock) { toast.error("أدخل الكمية المتاحة"); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(4, s + 1)); };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: "key" | "value", val: string) =>
    setForm((f) => {
      const specs = [...f.specs];
      specs[i] = { ...specs[i], [field]: val };
      return { ...f, specs };
    });

  const addDemoImage = () => {
    const demoImages = [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80",
      "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&q=80",
    ];
    const url = demoImages[form.images.length % demoImages.length];
    setForm((f) => ({
      ...f,
      images: [...f.images, { url, isMain: f.images.length === 0 }],
    }));
    toast.success("تمت إضافة الصورة");
  };

  const removeImage = (i: number) =>
    setForm((f) => {
      const images = f.images.filter((_, idx) => idx !== i);
      if (images.length > 0 && !images.some((img) => img.isMain)) images[0].isMain = true;
      return { ...f, images };
    });

  const setMainImage = (i: number) =>
    setForm((f) => ({
      ...f,
      images: f.images.map((img, idx) => ({ ...img, isMain: idx === i })),
    }));

  const handleSave = (asDraft = false) => {
    if (!form.name || !form.category || !form.price) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    const mainImage = form.images.find((img) => img.isMain)?.url || form.images[0]?.url;
    const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label || form.category;

    updateProduct(productId!, {
      name: form.name,
      category: categoryLabel,
      sku: form.sku,
      unit: form.unit || "قطعة",
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      stock: parseInt(form.stock) || 0,
      status: asDraft ? "draft" : form.status,
      ...(mainImage ? { image: mainImage } : {}),
    });

    toast.success(
      asDraft ? "تم حفظ التعديلات كمسودة" : `تم تحديث "${form.name}" بنجاح`,
      { description: asDraft ? "يمكنك نشره لاحقاً من قائمة المنتجات" : "تم تحديث بيانات المنتج في السوق" }
    );
    setTimeout(() => navigate("/vendor/products"), 1200);
  };

  // Product not found state
  if (notFound) {
    return (
      <div className="flex min-h-screen bg-gray-50/60" dir="rtl">
        <VendorSidebar vendorType="supplier" />
        <div className="flex-1 flex flex-col min-w-0">
          <VendorHeader pageTitle="تعديل المنتج" vendorType="supplier" />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-gray-800">المنتج غير موجود</h2>
              <p className="text-gray-500 text-sm">لم يتم العثور على المنتج المطلوب تعديله.</p>
              <button
                onClick={() => navigate("/vendor/products")}
                className="px-6 py-2.5 bg-[#2E7D32] text-white rounded-xl font-bold text-sm hover:bg-[#1B5E20] transition-colors"
              >
                العودة لقائمة المنتجات
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/60" dir="rtl">
      <VendorSidebar vendorType="supplier" />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader pageTitle={`تعديل: ${productName}`} vendorType="supplier" />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">

          {/* Edit Banner */}
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">وضع التعديل</p>
              <p className="text-xs text-amber-600">أنت تعدّل بيانات منتج موجود — ستُطبَّق التغييرات فور الحفظ.</p>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done ? "bg-[#2E7D32] text-white" : active ? "bg-[#2E7D32]/10 text-[#2E7D32] ring-2 ring-[#2E7D32]" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-semibold mt-1.5 hidden sm:block ${active ? "text-[#2E7D32]" : done ? "text-gray-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${step > s.id ? "bg-[#2E7D32]" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#2E7D32]" /> المعلومات الأساسية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">اسم المنتج <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="مثال: سماد NPK متوازن 20-20-20"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الفئة الرئيسية <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subCategory: "" }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white">
                    <option value="">اختر الفئة</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الفئة الفرعية</label>
                  <select value={form.subCategory} onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
                    disabled={!selectedCategory}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white disabled:opacity-50">
                    <option value="">اختر الفئة الفرعية</option>
                    {selectedCategory?.sub.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">العلامة التجارية</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="مثال: الخضراء للزراعة"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">وحدة البيع</label>
                  <input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="مثال: كيس 25 كجم، لتر، قطعة"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">رمز SKU</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="مثال: FRT-NPK-001"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                    <button onClick={generateSKU}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> توليد
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">وصف المنتج</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={4} placeholder="اكتب وصفاً تفصيلياً للمنتج يوضح مميزاته وطريقة استخدامه..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الكلمات المفتاحية</label>
                  <input type="text" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                    placeholder="مثال: سماد، NPK، أسمدة مركبة (افصل بفاصلة)"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Price & Stock */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#2E7D32]" /> السعر والمخزون
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">سعر البيع (ريال) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00" min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">السعر الأصلي (قبل الخصم)</label>
                  <div className="relative">
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="0.00" min="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                    {discount > 0 && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        خصم {discount}٪
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الحد الأدنى للطلب</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                    min="1" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الوزن (كجم)</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    placeholder="0.00" min="0" step="0.1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">الكمية المتاحة <span className="text-red-500">*</span></label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="0" min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">تنبيه المخزون المنخفض</label>
                  <input type="number" value={form.lowStockAlert} onChange={(e) => setForm((f) => ({ ...f, lowStockAlert: e.target.value }))}
                    min="1" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                  <p className="text-xs text-gray-400 mt-1">سيتم إشعارك عند وصول المخزون لهذا الحد</p>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm((f) => ({ ...f, freeShipping: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2E7D32]" />
                    <div>
                      <span className="text-sm font-bold text-gray-700">شحن مجاني</span>
                      <p className="text-xs text-gray-400">تفعيل الشحن المجاني لهذا المنتج</p>
                    </div>
                  </label>
                </div>
              </div>
              {form.price && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-[#2E7D32] mb-2">ملخص التسعير</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-black text-[#2E7D32]">{form.price} ر.س</p>
                      <p className="text-xs text-gray-500">سعر البيع</p>
                    </div>
                    {form.originalPrice && discount > 0 && (
                      <div>
                        <p className="text-lg font-black text-red-500">{discount}٪</p>
                        <p className="text-xs text-gray-500">نسبة الخصم</p>
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-black text-gray-700">{form.stock || "—"}</p>
                      <p className="text-xs text-gray-500">وحدة متاحة</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-[#2E7D32]" /> صور المنتج
              </h2>
              <div onClick={form.images.length < 8 ? addDemoImage : undefined}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                  form.images.length < 8 ? "border-[#4CAF50]/40 hover:border-[#4CAF50] hover:bg-green-50/30 cursor-pointer" : "border-gray-200 opacity-50 cursor-not-allowed"
                }`}>
                <Upload className="w-10 h-10 text-[#4CAF50]/60 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600 mb-1">
                  {form.images.length < 8 ? "انقر لإضافة صورة" : "وصلت للحد الأقصى (8 صور)"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — حتى 5 ميجابايت لكل صورة</p>
                <p className="text-xs text-gray-400 mt-1">{form.images.length}/8 صور مضافة</p>
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {form.images.map((img, i) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${img.isMain ? "border-[#2E7D32] ring-2 ring-[#2E7D32]/20" : "border-gray-100"}`}>
                      <img src={img.url} alt="" className="w-full h-28 object-cover" />
                      {img.isMain && (
                        <div className="absolute top-1.5 right-1.5 bg-[#2E7D32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">رئيسية</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100">
                        {!img.isMain && (
                          <button onClick={() => setMainImage(i)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#2E7D32] shadow-sm" title="تعيين كصورة رئيسية">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => removeImage(i)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-red-500 shadow-sm" title="حذف الصورة">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" /> نصائح للصور الاحترافية
                </h4>
                <ul className="text-xs text-amber-700/80 space-y-1">
                  <li>• استخدم خلفية بيضاء أو محايدة للصورة الرئيسية</li>
                  <li>• أضف صوراً من زوايا متعددة (أمام، جانب، خلف)</li>
                  <li>• الدقة المثالية: 800×800 بكسل أو أعلى</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Specs & Publish */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-5">
                  <Layers className="w-5 h-5 text-[#2E7D32]" /> المواصفات التقنية
                </h2>
                <div className="space-y-3">
                  {form.specs.map((spec, i) => (
                    <div key={i} className="flex gap-3">
                      <input type="text" value={spec.key} onChange={(e) => updateSpec(i, "key", e.target.value)}
                        placeholder="مثال: التركيب الكيميائي"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                      <input type="text" value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                        placeholder="القيمة"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
                      <button onClick={() => removeSpec(i)} disabled={form.specs.length === 1}
                        className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addSpec}
                    className="flex items-center gap-2 text-[#2E7D32] text-sm font-bold hover:bg-green-50 px-3 py-2 rounded-xl transition-colors">
                    <Plus className="w-4 h-4" /> إضافة مواصفة
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-5">
                  <BarChart2 className="w-5 h-5 text-[#2E7D32]" /> خيارات النشر
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">حالة المنتج</p>
                    <div className="flex gap-3">
                      <button onClick={() => setForm((f) => ({ ...f, status: "active" }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.status === "active" ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-gray-200 text-gray-600 hover:border-[#2E7D32]/40"}`}>
                        نشط
                      </button>
                      <button onClick={() => setForm((f) => ({ ...f, status: "draft" }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.status === "draft" ? "border-amber-500 bg-amber-500 text-white" : "border-gray-200 text-gray-600 hover:border-amber-400"}`}>
                        مسودة
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">هل تريد نشر المنتج فوراً؟</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2E7D32]" />
                    <div>
                      <span className="text-sm font-bold text-gray-700">منتج مميز</span>
                      <p className="text-xs text-gray-400">يظهر في قسم المنتجات المميزة</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-gray-700 mb-4">ملخص التعديلات</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">الاسم</span><span className="font-bold text-gray-800 text-left max-w-[55%] truncate">{form.name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">الفئة</span><span className="font-bold text-gray-800">{CATEGORIES.find((c) => c.value === form.category)?.label || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">السعر</span><span className="font-bold text-[#2E7D32]">{form.price ? `${form.price} ر.س` : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">المخزون</span><span className="font-bold text-gray-800">{form.stock ? `${form.stock} وحدة` : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">الصور</span><span className="font-bold text-gray-800">{form.images.length} صورة</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">الحالة</span><span className={`font-bold ${form.status === "active" ? "text-[#2E7D32]" : "text-amber-600"}`}>{form.status === "active" ? "نشط" : "مسودة"}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button onClick={prevStep} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" /> السابق
            </button>
            <div className="flex gap-3">
              {step === 4 ? (
                <>
                  <button onClick={() => handleSave(true)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                    حفظ كمسودة
                  </button>
                  <button onClick={() => handleSave(false)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2E7D32] text-white rounded-xl text-sm font-black hover:bg-[#1B5E20] transition-colors shadow-md shadow-green-900/20">
                    <Check className="w-4 h-4" /> حفظ التعديلات
                  </button>
                </>
              ) : (
                <button onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2E7D32] text-white rounded-xl text-sm font-black hover:bg-[#1B5E20] transition-colors shadow-md shadow-green-900/20">
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
