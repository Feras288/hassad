/*
 * HASAAD PLATFORM — Admin Products Management
 * Design: Deep Slate + Accent Green | RTL Arabic
 * Full product form: basic info, description, specs, usage, images (upload from device)
 */
import { useState, useRef, useCallback } from "react";
import {
  Search, Package, CheckCircle, Eye, Flag, Plus, Pencil, Trash2,
  X, AlertTriangle, ChevronDown, Star, Upload, Crown, BookOpen,
  ClipboardList, Wrench, ImagePlus,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductPreviewModal, { type PreviewData } from "@/components/admin/ProductPreviewModal";
import { useAdminProducts } from "@/contexts/AdminProductsContext";
import { useAdminVendors } from "@/contexts/AdminVendorsContext";
import { trpc } from "@/lib/trpc";
import { AdminProduct, ProductSpec, ProductStatus } from "@/lib/adminData";
import { toast } from "sonner";
import { Link } from "wouter";

// ─── Status Config ────────────────────────────────────────
const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  active:         { label: "نشط",               color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  inactive:       { label: "غير نشط",           color: "text-slate-400",   bg: "bg-slate-400/10 border-slate-400/30" },
  pending_review: { label: "بانتظار المراجعة",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  rejected:       { label: "مرفوض",             color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30" },
  out_of_stock:   { label: "نفد المخزون",       color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
};

// ─── Types ────────────────────────────────────────────────
interface ImageItem {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProductFormData {
  name: string;
  nameEn: string;
  sku: string;
  category: string;
  brand: string;
  vendor: string;
  vendorId: string;
  price: string;
  originalPrice: string;
  priceTiers: Array<{ minQuantity: string; unitPrice: string }>;
  tierPricingStartsAt: string;
  tierPricingEndsAt: string;
  unit: string;
  minOrder: string;
  stock: string;
  status: ProductStatus;
  flagged: boolean;
  flagReason: string;
  shortDesc: string;
  longDesc: string;
  highlights: string[];
  specs: ProductSpec[];
  usageInstructions: string[];
  certifications: string[];
  tags: string[];
  shortDescEn: string;
  longDescEn: string;
  highlightsEn: string[];
  specsEn: ProductSpec[];
  usageInstructionsEn: string[];
  certificationsEn: string[];
  tagsEn: string[];
  images: ImageItem[];
}

const emptyForm: ProductFormData = {
  name: "", nameEn: "", sku: "", category: "", brand: "",
  vendor: "", vendorId: "", price: "", originalPrice: "", priceTiers: [], tierPricingStartsAt: "", tierPricingEndsAt: "",
  unit: "", minOrder: "1", stock: "", status: "active",
  flagged: false, flagReason: "",
  shortDesc: "", longDesc: "",
  highlights: [""],
  specs: [{ label: "", value: "" }],
  usageInstructions: [""],
  certifications: [""],
  tags: [],
  shortDescEn: "", longDescEn: "",
  highlightsEn: [""],
  specsEn: [{ label: "", value: "" }],
  usageInstructionsEn: [""],
  certificationsEn: [""],
  tagsEn: [],
  images: [],
};

// ─── Helpers ──────────────────────────────────────────────
function productToForm(p: AdminProduct): ProductFormData {
  const imgs = (p.images?.length ? p.images : p.image ? [p.image] : []).map((url, i) => ({
    id: `img-${i}`,
    url,
    isPrimary: i === 0,
  }));
  return {
    name: p.name, nameEn: p.nameEn ?? "", sku: p.sku,
    category: p.category, brand: p.brand ?? "",
    vendor: p.vendor, vendorId: p.vendorId,
    price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    priceTiers: (p.priceTiers ?? []).map((tier) => ({ minQuantity: String(tier.minQuantity), unitPrice: String(tier.unitPrice) })),
    tierPricingStartsAt: p.tierPricingStartsAt ? new Date(p.tierPricingStartsAt).toISOString().slice(0, 10) : "",
    tierPricingEndsAt: p.tierPricingEndsAt ? new Date(p.tierPricingEndsAt).toISOString().slice(0, 10) : "",
    unit: p.unit ?? "", minOrder: p.minOrder ? String(p.minOrder) : "1",
    stock: String(p.stock), status: p.status,
    flagged: p.flagged ?? false, flagReason: p.flagReason ?? "",
    shortDesc: p.shortDesc ?? "", longDesc: p.longDesc ?? "",
    highlights: p.highlights?.length ? p.highlights : [""],
    specs: p.specs?.length ? p.specs : [{ label: "", value: "" }],
    usageInstructions: p.usageInstructions?.length ? p.usageInstructions : [""],
    certifications: p.certifications?.length ? p.certifications : [""],
    tags: p.tags ?? [],
    shortDescEn: p.shortDescEn ?? "", longDescEn: p.longDescEn ?? "",
    highlightsEn: p.highlightsEn?.length ? p.highlightsEn : [""],
    specsEn: p.specsEn?.length ? p.specsEn : [{ label: "", value: "" }],
    usageInstructionsEn: p.usageInstructionsEn?.length ? p.usageInstructionsEn : [""],
    certificationsEn: p.certificationsEn?.length ? p.certificationsEn : [""],
    tagsEn: p.tagsEn ?? [],
    images: imgs,
  };
}

function formToProduct(form: ProductFormData) {
  const imageUrls = [...form.images.map(i => i.url)];
  const primaryIdx = form.images.findIndex(i => i.isPrimary);
  if (primaryIdx > 0) {
    const [primary] = imageUrls.splice(primaryIdx, 1);
    imageUrls.unshift(primary);
  }
  return {
    name: form.name.trim(),
    nameEn: form.nameEn.trim() || undefined,
    sku: form.sku.trim(),
    category: form.category,
    brand: form.brand.trim() || undefined,
    vendor: form.vendor.trim(),
    vendorId: form.vendorId.trim() || "v-admin",
    price: parseFloat(form.price) || 0,
    originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
    priceTiers: form.priceTiers.map((tier) => ({ minQuantity: parseInt(tier.minQuantity), unitPrice: parseFloat(tier.unitPrice) })).filter((tier) => Number.isInteger(tier.minQuantity) && tier.minQuantity > 1 && Number.isInteger(tier.unitPrice) && tier.unitPrice >= 0),
    tierPricingStartsAt: form.tierPricingStartsAt ? new Date(`${form.tierPricingStartsAt}T00:00:00`) : null,
    tierPricingEndsAt: form.tierPricingEndsAt ? new Date(`${form.tierPricingEndsAt}T23:59:59.999`) : null,
    unit: form.unit.trim() || undefined,
    minOrder: parseInt(form.minOrder) || 1,
    stock: parseInt(form.stock) || 0,
    status: form.status,
    images: imageUrls,
    image: imageUrls[0],
    shortDesc: form.shortDesc.trim() || undefined,
    longDesc: form.longDesc.trim() || undefined,
    highlights: form.highlights.filter(h => h.trim()),
    specs: form.specs.filter(s => s.label.trim() && s.value.trim()),
    usageInstructions: form.usageInstructions.filter(u => u.trim()),
    certifications: form.certifications.filter(c => c.trim()),
    tags: form.tags,
    shortDescEn: form.shortDescEn.trim() || undefined,
    longDescEn: form.longDescEn.trim() || undefined,
    highlightsEn: form.highlightsEn.filter(h => h.trim()),
    specsEn: form.specsEn.filter(s => s.label.trim() && s.value.trim()),
    usageInstructionsEn: form.usageInstructionsEn.filter(u => u.trim()),
    certificationsEn: form.certificationsEn.filter(c => c.trim()),
    tagsEn: form.tagsEn,
    flagged: form.flagged,
    flagReason: form.flagReason.trim() || undefined,
  };
}

// ─── Image Upload Zone ────────────────────────────────────
function ImageUploadZone({ images, onChange }: {
  images: ImageItem[];
  onChange: (imgs: ImageItem[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const uploadImage = trpc.adminManagement.uploadImage.useMutation();

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const uploaded = await uploadImage.mutateAsync({ fileName: file.name, dataUrl: String(e.target?.result) });
          onChange([...images, {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url: uploaded.url,
            isPrimary: images.length === 0,
          }]);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "تعذر رفع صورة المنتج");
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, onChange]);

  const setPrimary = (id: string) => {
    onChange(images.map(img => ({ ...img, isPrimary: img.id === id })));
  };

  const removeImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    if (filtered.length > 0 && !filtered.some(i => i.isPrimary)) {
      filtered[0] = { ...filtered[0], isPrimary: true };
    }
    onChange(filtered);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? "border-[#81C784] bg-[#81C784]/5" : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-3 text-slate-500" size={28} />
        <p className="text-slate-400 text-sm mb-1">اسحب وأفلت الصور هنا أو انقر للاختيار من جهازك</p>
        <p className="text-slate-600 text-xs">PNG, JPG, WEBP — حتى 10 صور</p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => processFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img) => (
              <div key={img.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  img.isPrimary ? "border-[#81C784]" : "border-slate-700 hover:border-slate-500"
                }`}
                onClick={() => setPrimary(img.id)}
              >
                <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                {img.isPrimary && (
                  <div className="absolute top-1.5 right-1.5 bg-[#81C784] rounded-full p-0.5">
                    <Crown size={9} className="text-slate-900" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  {!img.isPrimary && (
                    <span className="text-[10px] bg-[#81C784]/90 text-slate-900 px-2 py-0.5 rounded-full font-semibold">
                      رئيسية
                    </span>
                  )}
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="text-[10px] bg-red-500/90 text-white px-2 py-0.5 rounded-full hover:bg-red-500">
                    حذف
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-all">
              <Plus size={20} />
            </button>
          </div>
          <p className="text-slate-600 text-xs text-center">
            انقر على الصورة لتعيينها كصورة رئيسية — الإطار الأخضر يشير للصورة الرئيسية
          </p>
        </>
      )}
    </div>
  );
}

// ─── Dynamic List ─────────────────────────────────────────
function DynamicList({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 font-medium">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            placeholder={placeholder}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
          <button type="button" onClick={() => items.length > 1 && onChange(items.filter((_, idx) => idx !== i))}
            className="text-slate-600 hover:text-red-400 transition-colors p-1">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])}
        className="text-xs text-[#81C784] hover:text-[#66BB6A] flex items-center gap-1">
        <Plus size={11} /> إضافة عنصر
      </button>
    </div>
  );
}

// ─── Dynamic Specs ────────────────────────────────────────
function DynamicSpecs({ specs, onChange, label = "المواصفات التقنية" }: { specs: ProductSpec[]; onChange: (v: ProductSpec[]) => void; label?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 font-medium">{label}</label>
      {specs.map((spec, i) => (
        <div key={i} className="flex gap-2">
          <input value={spec.label}
            onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            placeholder="الخاصية (مثال: الوزن)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
          <input value={spec.value}
            onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], value: e.target.value }; onChange(n); }}
            placeholder="القيمة (مثال: 25 كجم)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
          <button type="button" onClick={() => specs.length > 1 && onChange(specs.filter((_, idx) => idx !== i))}
            className="text-slate-600 hover:text-red-400 transition-colors p-1">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...specs, { label: "", value: "" }])}
        className="text-xs text-[#81C784] hover:text-[#66BB6A] flex items-center gap-1">
        <Plus size={11} /> إضافة مواصفة
      </button>
    </div>
  );
}

// ─── Tags Input ───────────────────────────────────────────
function TagsInput({ tags, onChange, label = "الوسوم (Tags)" }: { tags: string[]; onChange: (t: string[]) => void; label?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) { onChange([...tags, val]); setInput(""); }
  };
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 font-medium">{label}</label>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="اكتب وسماً ثم اضغط Enter"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all">
          <Plus size={14} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5 text-xs text-slate-300">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}
                className="text-slate-500 hover:text-red-400">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────
type TabKey = "basic" | "content" | "specs" | "usage" | "images";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "basic",   label: "الأساسيات", icon: <Package size={13} /> },
  { key: "content", label: "الوصف",     icon: <BookOpen size={13} /> },
  { key: "specs",   label: "المواصفات", icon: <ClipboardList size={13} /> },
  { key: "usage",   label: "الاستخدام", icon: <Wrench size={13} /> },
  { key: "images",  label: "الصور",     icon: <ImagePlus size={13} /> },
];

function ProductFormModal({ editId, initialForm, categories, vendors, onClose, onSave }: {
  editId: string | null;
  initialForm: ProductFormData;
  categories: { id: string; name: string }[];
  vendors: Array<{ id: string; name: string; status: string }>;
  onClose: () => void;
  onSave: (data: ReturnType<typeof formToProduct>, id: string | null) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const [tab, setTab] = useState<TabKey>("basic");
  const [showPreview, setShowPreview] = useState(false);

  const buildPreviewData = (): PreviewData => ({
    name: form.name,
    nameEn: form.nameEn,
    sku: form.sku,
    category: form.category,
    brand: form.brand,
    vendor: form.vendor,
    price: form.price,
    originalPrice: form.originalPrice,
    unit: form.unit,
    minOrder: form.minOrder,
    stock: form.stock,
    status: form.status,
    shortDesc: form.shortDesc,
    longDesc: form.longDesc,
    highlights: form.highlights,
    specs: form.specs,
    usageInstructions: form.usageInstructions,
    certifications: form.certifications,
    tags: form.tags,
    images: form.images,
  });

  const set = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!form.name.trim()) { toast.error("اسم المنتج مطلوب"); setTab("basic"); return false; }
    if (!form.sku.trim()) { toast.error("رمز SKU مطلوب"); setTab("basic"); return false; }
    if (!form.category) { toast.error("الفئة مطلوبة"); setTab("basic"); return false; }
    if (!form.vendor || !form.vendorId) { toast.error("اختر مورداً مسجلاً للمنتج"); setTab("basic"); return false; }
    if (!form.price || isNaN(parseFloat(form.price))) { toast.error("السعر مطلوب"); setTab("basic"); return false; }
    const basePrice = parseFloat(form.price);
    const tiers = form.priceTiers.map((tier) => ({ minQuantity: parseInt(tier.minQuantity), unitPrice: parseFloat(tier.unitPrice) }));
    if (tiers.some((tier) => !Number.isInteger(tier.minQuantity) || tier.minQuantity < 2 || !Number.isInteger(tier.unitPrice) || tier.unitPrice < 0 || tier.unitPrice >= basePrice)) { toast.error("تحقق من شرائح السعر: كمية صحيحة وسعر أقل من السعر الأساسي"); setTab("basic"); return false; }
    if (tiers.some((tier, index) => index > 0 && (tier.minQuantity <= tiers[index - 1].minQuantity || tier.unitPrice >= tiers[index - 1].unitPrice))) { toast.error("رتّب الشرائح تصاعدياً واجعل السعر ينخفض مع زيادة الكمية"); setTab("basic"); return false; }
    if (form.tierPricingStartsAt && form.tierPricingEndsAt && form.tierPricingEndsAt < form.tierPricingStartsAt) { toast.error("يجب أن يكون تاريخ نهاية عرض الكمية بعد تاريخ البداية"); setTab("basic"); return false; }
    if (form.stock === "" || isNaN(parseInt(form.stock))) { toast.error("المخزون مطلوب"); setTab("basic"); return false; }
    if (!form.unit) { toast.error("اختر وحدة البيع"); setTab("basic"); return false; }
    if (form.images.length === 0) { toast.error("أضف صورة واحدة للمنتج على الأقل"); setTab("images"); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await onSave(formToProduct(form), editId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="text-base font-bold text-white">
            {editId ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 flex-shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                tab === t.key
                  ? "border-[#81C784] text-[#81C784] bg-[#81C784]/5"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}>
              {t.icon} {t.label}
              {t.key === "images" && form.images.length > 0 && (
                <span className="bg-[#81C784]/20 text-[#81C784] rounded-full px-1.5 text-[9px]">{form.images.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* ── Basic ── */}
          {tab === "basic" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">اسم المنتج (عربي) *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="مثال: سماد NPK متوازن 20-20-20"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">اسم المنتج (إنجليزي)</label>
                  <input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)}
                    placeholder="Product name in English" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">رمز SKU *</label>
                  <input value={form.sku} onChange={(e) => set("sku", e.target.value)}
                    placeholder="FRT-NPK-001" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الفئة *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]">
                    <option value="">اختر الفئة</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">العلامة التجارية</label>
                  <input value={form.brand} onChange={(e) => set("brand", e.target.value)}
                    placeholder="مثال: الخضراء للزراعة"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">المورد المسجل *</label>
                  <select value={form.vendorId} onChange={(e) => {
                    const selected = vendors.find((vendor) => vendor.id === e.target.value);
                    set("vendorId", selected?.id ?? "");
                    set("vendor", selected?.name ?? "");
                  }} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]">
                    <option value="">اختر المورد</option>
                    {vendors.filter((vendor) => vendor.status === "active" || vendor.id === form.vendorId).map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">السعر (ريال) *</label>
                  <input value={form.price} onChange={(e) => set("price", e.target.value)}
                    type="number" min="0" placeholder="0.00" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">السعر الأصلي (قبل الخصم)</label>
                  <input value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)}
                    type="number" min="0" placeholder="0.00" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">وحدة البيع *</label>
                  <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]">
                    <option value="">اختر وحدة البيع</option>
                    {['كيس', 'حبة', 'كيلو', 'طن', 'لتر', 'عبوة', 'صندوق', 'متر', 'وحدة'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الحد الأدنى للطلب</label>
                  <input value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)}
                    type="number" min="1" placeholder="1" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">المخزون *</label>
                  <input value={form.stock} onChange={(e) => set("stock", e.target.value)}
                    type="number" min="0" placeholder="0" dir="ltr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الحالة</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]">
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rounded-xl border border-[#81C784]/25 bg-[#81C784]/5 p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#A5D6A7]">أسعار الكمية المتدرجة</p><p className="mt-1 text-xs leading-5 text-slate-400">يطبّق أقل سعر مناسب تلقائياً عند بلوغ كمية الشريحة. يجب أن يكون سعر كل شريحة أقل من السعر الأساسي والسابق.</p></div><button type="button" onClick={() => set("priceTiers", [...form.priceTiers, { minQuantity: "", unitPrice: "" }])} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#81C784] px-2.5 py-1.5 text-xs font-black text-slate-900 hover:bg-[#A5D6A7]"><Plus size={13} />إضافة شريحة</button></div>
                {form.priceTiers.length === 0 ? <p className="mt-3 text-xs text-slate-500">لا توجد أسعار كمية مخصصة؛ سيُطبق السعر الأساسي على جميع الكميات.</p> : <><div className="mt-3 space-y-2">{form.priceTiers.map((tier, index) => <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input value={tier.minQuantity} onChange={(event) => { const next = [...form.priceTiers]; next[index] = { ...tier, minQuantity: event.target.value }; set("priceTiers", next); }} type="number" min="2" placeholder="من كمية" dir="ltr" className="min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" /><input value={tier.unitPrice} onChange={(event) => { const next = [...form.priceTiers]; next[index] = { ...tier, unitPrice: event.target.value }; set("priceTiers", next); }} type="number" min="0" placeholder="سعر الوحدة" dir="ltr" className="min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" /><button type="button" onClick={() => set("priceTiers", form.priceTiers.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg px-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400" aria-label="حذف شريحة السعر"><Trash2 size={15} /></button></div>)}</div><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"><label className="text-xs text-slate-400">بداية العرض<input value={form.tierPricingStartsAt} onChange={(event) => set("tierPricingStartsAt", event.target.value)} type="date" className="mt-1.5 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]" /></label><label className="text-xs text-slate-400">نهاية العرض<input value={form.tierPricingEndsAt} onChange={(event) => set("tierPricingEndsAt", event.target.value)} type="date" min={form.tierPricingStartsAt || undefined} className="mt-1.5 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81C784]" /></label></div><p className="mt-2 text-[11px] leading-5 text-slate-500">اترك التاريخين فارغين لتطبيق سعر الكمية دائماً. عند تحديدهما، يعمل العرض من بداية اليوم حتى نهاية تاريخ الانتهاء.</p></>}
              </div>
              <div className="border border-red-500/20 rounded-lg p-3 bg-red-500/5 space-y-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.flagged} onChange={(e) => set("flagged", e.target.checked)}
                    className="accent-red-500 w-3.5 h-3.5" />
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-red-400" /> تمييز المنتج كمشكلة
                  </span>
                </label>
                {form.flagged && (
                  <input value={form.flagReason} onChange={(e) => set("flagReason", e.target.value)}
                    placeholder="سبب التمييز..."
                    className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                )}
              </div>
            </div>
          )}

          {/* ── Content ── */}
          {tab === "content" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">وصف مختصر</label>
                <textarea value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)}
                  placeholder="وصف مختصر يظهر في بطاقة المنتج (1-2 جملة)" rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">وصف تفصيلي</label>
                <textarea value={form.longDesc} onChange={(e) => set("longDesc", e.target.value)}
                  placeholder="وصف شامل ومفصل للمنتج يظهر في صفحة تفاصيل المنتج" rows={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] resize-none" />
              </div>
              <DynamicList label="أبرز المميزات (Highlights)" items={form.highlights}
                onChange={(v) => set("highlights", v)} placeholder="مثال: ذوبانية عالية 100٪" />
              <TagsInput tags={form.tags} onChange={(v) => set("tags", v)} />
              <div className="border-t border-slate-700/60 pt-4 space-y-4" dir="ltr">
                <div><p className="text-sm font-bold text-[#A5D6A7]">English product content</p><p className="mt-1 text-xs text-slate-500">Optional approved English copy shown to visitors who select English.</p></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Short description</label><textarea value={form.shortDescEn} onChange={(e) => set("shortDescEn", e.target.value)} placeholder="Short product description for the product card" rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] resize-none" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Detailed description</label><textarea value={form.longDescEn} onChange={(e) => set("longDescEn", e.target.value)} placeholder="Detailed product information for the product page" rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] resize-none" /></div>
                <DynamicList label="English highlights" items={form.highlightsEn} onChange={(v) => set("highlightsEn", v)} placeholder="Example: High solubility" />
                <TagsInput label="English tags" tags={form.tagsEn} onChange={(v) => set("tagsEn", v)} />
              </div>
            </div>
          )}

          {/* ── Specs ── */}
          {tab === "specs" && (
            <div className="space-y-4">
              <p className="text-slate-500 text-xs">أضف المواصفات التقنية للمنتج مثل الوزن والتركيبة والأبعاد.</p>
              <DynamicSpecs specs={form.specs} onChange={(v) => set("specs", v)} />
              <div className="border-t border-slate-700/60 pt-4" dir="ltr"><DynamicSpecs label="English specifications" specs={form.specsEn} onChange={(v) => set("specsEn", v)} /></div>
            </div>
          )}

          {/* ── Usage ── */}
          {tab === "usage" && (
            <div className="space-y-4">
              <DynamicList label="تعليمات الاستخدام" items={form.usageInstructions}
                onChange={(v) => set("usageInstructions", v)}
                placeholder="مثال: للرش الورقي: ذوّب 2-3 جم في لتر ماء" />
              <DynamicList label="الشهادات والاعتمادات" items={form.certifications}
                onChange={(v) => set("certifications", v)}
                placeholder="مثال: وزارة البيئة والمياه والزراعة" />
              <div className="border-t border-slate-700/60 pt-4 space-y-4" dir="ltr">
                <DynamicList label="English usage instructions" items={form.usageInstructionsEn} onChange={(v) => set("usageInstructionsEn", v)} placeholder="Example: Dilute before use" />
                <DynamicList label="English certifications" items={form.certificationsEn} onChange={(v) => set("certificationsEn", v)} placeholder="Example: Registered with ..." />
              </div>
            </div>
          )}

          {/* ── Images ── */}
          {tab === "images" && (
            <ImageUploadZone images={form.images} onChange={(imgs) => set("images", imgs)} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/50 flex-shrink-0">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-white transition-colors">إلغاء</button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm transition-all border border-slate-600"
            >
              <Eye size={14} />
              معاينة
            </button>
            <button onClick={handleSave}
              className="px-5 py-2 bg-[#81C784] hover:bg-[#66BB6A] text-slate-900 font-semibold rounded-xl text-sm transition-all">
              {editId ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </div>
        </div>
      </div>
      {showPreview && (
        <ProductPreviewModal
          data={buildPreviewData()}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, changeProductStatus } = useAdminProducts();
  const { vendors } = useAdminVendors();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || p.sku.includes(search) || p.vendor.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchFlag = !flaggedOnly || p.flagged;
    return matchSearch && matchStatus && matchFlag;
  });

  const openAdd = () => { setEditId(null); setFormInitial(emptyForm); setShowForm(true); };
  const openEdit = (p: AdminProduct) => { setEditId(p.id); setFormInitial(productToForm(p)); setShowForm(true); };

  const handleSave = async (data: ReturnType<typeof formToProduct>, id: string | null) => {
    try {
      if (id) {
        await updateProduct(id, { ...data, updatedAt: new Date().toISOString().split("T")[0] });
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await addProduct(data);
        toast.success("تمت إضافة المنتج بنجاح وظهر في قائمة الإدارة");
      }
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ المنتج");
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success("تم حذف المنتج");
    setDeleteConfirm(null);
    setOpenMenu(null);
  };

  const handleStatusChange = (id: string, status: ProductStatus) => {
    changeProductStatus(id, status);
    setOpenMenu(null);
    toast.success("تم تحديث حالة المنتج");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">إدارة المنتجات</h1>
            <p className="text-sm text-slate-400 mt-0.5">إضافة وتعديل وإدارة حالة المنتجات</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/categories">
              <span className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-all cursor-pointer">
                إدارة الفئات
              </span>
            </Link>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#81C784] hover:bg-[#66BB6A] text-slate-900 font-semibold rounded-xl text-sm transition-all">
              <Plus size={16} /> إضافة منتج
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "إجمالي المنتجات", value: products.length, color: "text-blue-400", bg: "bg-blue-400/10", icon: <Package size={15} /> },
            { label: "نشط", value: products.filter(p => p.status === "active").length, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle size={15} /> },
            { label: "بانتظار المراجعة", value: products.filter(p => p.status === "pending_review").length, color: "text-amber-400", bg: "bg-amber-400/10", icon: <Eye size={15} /> },
            { label: "مُبلَّغ عنها", value: products.filter(p => p.flagged).length, color: "text-red-400", bg: "bg-red-400/10", icon: <Flag size={15} /> },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو SKU أو البائع..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784]" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#81C784]">
            <option value="all">جميع الحالات</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all ${
              flaggedOnly ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            }`}>
            <Flag size={14} /> المُبلَّغ عنها فقط
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">المنتج</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">الفئة</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">السعر</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">المخزون</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">التقييم</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">الحالة</th>
                  <th className="text-right text-xs text-slate-400 font-medium px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : filtered.map((p) => {
                  const sc = statusConfig[p.status];
                  const primaryImg = p.images?.[0] ?? p.image;
                  return (
                    <tr key={p.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={primaryImg} alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-700 border border-slate-700" />
                            {(p.images?.length ?? 0) > 1 && (
                              <span className="absolute -bottom-1 -left-1 bg-[#81C784] text-slate-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {p.images!.length}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white font-medium text-sm truncate max-w-40">{p.name}</p>
                              {p.flagged && <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />}
                            </div>
                            <p className="text-slate-500 text-xs">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{p.category}</td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{p.price.toLocaleString("ar-SA")} ر</span>
                        {p.unit && <span className="text-slate-500 text-xs block">{p.unit}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.stock === 0 ? "text-red-400" : p.stock < 20 ? "text-amber-400" : "text-slate-300"}>
                          {p.stock.toLocaleString("ar-SA")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.reviewCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-slate-300 text-xs">{p.rating.toFixed(1)}</span>
                            <span className="text-slate-600 text-xs">({p.reviewCount})</span>
                          </div>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                            {sc.label} <ChevronDown size={10} />
                          </button>
                          {openMenu === p.id && (
                            <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 min-w-36 overflow-hidden">
                              {Object.entries(statusConfig).map(([k, v]) => (
                                <button key={k} onClick={() => handleStatusChange(p.id, k as ProductStatus)}
                                  className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-700 transition-colors ${v.color} ${p.status === k ? "bg-slate-700/50" : ""}`}>
                                  {v.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-[#81C784] hover:bg-[#81C784]/10 rounded-lg transition-all" title="تعديل">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="حذف">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProductFormModal
          editId={editId}
          initialForm={formInitial}
          categories={categories}
          vendors={vendors}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-red-400 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 text-sm mb-4">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-all">
                إلغاء
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
