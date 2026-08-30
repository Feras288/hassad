/*
 * HASAAD PLATFORM — AdminSettings
 * Design: Deep Slate + Accent Green | RTL Arabic
 * Sections: Commission, Return Policy, Platform General, Payment, Notifications
 */
import { useEffect, useState } from "react";
import {
  Settings, Percent, RotateCcw, Globe, CreditCard, Bell,
  Save, ChevronLeft, Info, Plus, Trash2, CheckCircle, Shield,
  AlertTriangle, Clock, DollarSign, Package, Truck, Store, Wheat, UserRoundCheck,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

// ─── Types ─────────────────────────────────────────────
interface CommissionTier {
  id: string;
  label: string;
  category: string;
  rate: number;
  minRevenue: number;
  maxRevenue: number | null;
}

interface ReturnPolicy {
  id: string;
  category: string;
  returnDays: number;
  condition: string;
  refundMethod: string;
  notes: string;
  enabled: boolean;
}

type HeroStatsDraft = {
  enabled: boolean;
  stats: Array<{ value: number; suffixAr: string; suffixEn: string; labelAr: string; labelEn: string }>;
};

const fallbackHeroStats: HeroStatsDraft = {
  enabled: true,
  stats: [
    { value: 25, suffixAr: "ألف", suffixEn: "K", labelAr: "مزارع نشط", labelEn: "Active farms" },
    { value: 800, suffixAr: "", suffixEn: "", labelAr: "مورد موثوق", labelEn: "Trusted suppliers" },
    { value: 12, suffixAr: "ألف", suffixEn: "K", labelAr: "منتج زراعي", labelEn: "Agricultural products" },
    { value: 450, suffixAr: "", suffixEn: "", labelAr: "خبير ومهندس", labelEn: "Experts & engineers" },
  ],
};

// ─── Initial Data ───────────────────────────────────────
const initialCommissions: CommissionTier[] = [
  { id: "c1", label: "الفئة الأساسية", category: "أسمدة ومبيدات", rate: 10, minRevenue: 0, maxRevenue: 50000 },
  { id: "c2", label: "الفئة المتوسطة", category: "أسمدة ومبيدات", rate: 8, minRevenue: 50001, maxRevenue: 200000 },
  { id: "c3", label: "الفئة المتميزة", category: "أسمدة ومبيدات", rate: 6, minRevenue: 200001, maxRevenue: null },
  { id: "c4", label: "البذور والشتلات", category: "بذور وشتلات", rate: 10, minRevenue: 0, maxRevenue: null },
  { id: "c5", label: "معدات الري", category: "معدات الري", rate: 8, minRevenue: 0, maxRevenue: null },
  { id: "c6", label: "الأدوات والمعدات", category: "أدوات ومعدات", rate: 9, minRevenue: 0, maxRevenue: null },
  { id: "c7", label: "الخدمات الزراعية", category: "خدمات", rate: 15, minRevenue: 0, maxRevenue: null },
];

const initialReturnPolicies: ReturnPolicy[] = [
  {
    id: "r1", category: "الأسمدة والمبيدات", returnDays: 14,
    condition: "المنتج غير مفتوح وبحالته الأصلية",
    refundMethod: "استرداد كامل للمبلغ", notes: "لا يُقبل إرجاع المبيدات المفتوحة لأسباب السلامة", enabled: true,
  },
  {
    id: "r2", category: "البذور والشتلات", returnDays: 7,
    condition: "البذور غير مفتوحة والشتلات سليمة",
    refundMethod: "استرداد كامل أو استبدال", notes: "لا يُقبل إرجاع الشتلات بعد الزراعة", enabled: true,
  },
  {
    id: "r3", category: "معدات الري", returnDays: 30,
    condition: "المعدة غير مستخدمة أو بها عيب مصنعي",
    refundMethod: "استرداد كامل أو إصلاح مجاني", notes: "يشمل ضمان المصنع لمدة سنة", enabled: true,
  },
  {
    id: "r4", category: "الأدوات والمعدات", returnDays: 21,
    condition: "المنتج بحالته الأصلية مع الفاتورة",
    refundMethod: "استرداد كامل للمبلغ", notes: "", enabled: true,
  },
  {
    id: "r5", category: "الخدمات الزراعية", returnDays: 3,
    condition: "لم يتم تقديم الخدمة بعد",
    refundMethod: "استرداد كامل", notes: "بعد تقديم الخدمة يُطبق سياسة الضمان فقط", enabled: true,
  },
];

// ─── Section Tabs ───────────────────────────────────────
const sections = [
  { id: "commission", labelAr: "نسب العمولة", labelEn: "Commission rates", icon: <Percent size={16} /> },
  { id: "returns", labelAr: "سياسات الإرجاع", labelEn: "Return policies", icon: <RotateCcw size={16} /> },
  { id: "general", labelAr: "الإعدادات العامة", labelEn: "General settings", icon: <Globe size={16} /> },
  { id: "payment", labelAr: "طرق الدفع", labelEn: "Payment methods", icon: <CreditCard size={16} /> },
  { id: "notifications", labelAr: "الإشعارات", labelEn: "Notifications", icon: <Bell size={16} /> },
];

// ─── Sub-components ─────────────────────────────────────
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400 mt-0.5">{description}</p>
    </div>
  );
}

function SaveBar({ onSave, dirty }: { onSave: () => void; dirty: boolean }) {
  if (!dirty) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-2xl px-6 py-3 shadow-2xl">
      <span className="text-sm text-slate-300">لديك تغييرات غير محفوظة</span>
      <button onClick={onSave}
        className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
        <Save size={15} /> حفظ التغييرات
      </button>
    </div>
  );
}

// ─── Commission Section ─────────────────────────────────
function CommissionSection() {
  const [tiers, setTiers] = useState<CommissionTier[]>(initialCommissions);
  const [dirty, setDirty] = useState(false);

  const update = (id: string, field: keyof CommissionTier, value: number | string | null) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    setDirty(true);
  };

  const remove = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
    setDirty(true);
  };

  const add = () => {
    setTiers((prev) => [...prev, {
      id: `c${Date.now()}`, label: "فئة جديدة", category: "عام", rate: 10, minRevenue: 0, maxRevenue: null,
    }]);
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    toast.success("تم حفظ نسب العمولة بنجاح");
  };

  return (
    <div>
      <SectionHeader
        title="إدارة نسب العمولة"
        description="حدد نسبة العمولة التي تأخذها المنصة من كل فئة من البائعين. يمكنك تحديد نسب متدرجة بحسب حجم المبيعات."
      />

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 mb-6">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          نسب العمولة تُطبَّق على إجمالي قيمة الطلب قبل الضريبة. البائعون الذين يتجاوزون حد الإيرادات ينتقلون تلقائياً للفئة التالية في الشهر التالي.
        </p>
      </div>

      {/* Tiers Table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["اسم الفئة", "التصنيف", "نسبة العمولة %", "الحد الأدنى للإيرادات", "الحد الأقصى للإيرادات", ""].map((h) => (
                  <th key={h} className="text-right text-xs font-semibold text-slate-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <input value={tier.label} onChange={(e) => update(tier.id, "label", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <input value={tier.category} onChange={(e) => update(tier.id, "category", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="50" step="0.5"
                        value={tier.rate}
                        onChange={(e) => update(tier.id, "rate", parseFloat(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-20 text-center" />
                      <span className="text-slate-400 text-sm">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <input type="number" min="0"
                        value={tier.minRevenue}
                        onChange={(e) => update(tier.id, "minRevenue", parseInt(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-28" />
                      <span className="text-slate-500 text-xs">ر.س</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0"
                        value={tier.maxRevenue ?? ""}
                        placeholder="غير محدود"
                        onChange={(e) => update(tier.id, "maxRevenue", e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-28 placeholder-slate-600" />
                      <span className="text-slate-500 text-xs">ر.س</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(tier.id)}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-700/30">
          <button onClick={add}
            className="flex items-center gap-2 text-sm text-[#81C784] hover:text-[#4CAF50] transition-colors">
            <Plus size={15} /> إضافة فئة جديدة
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "متوسط العمولة", value: `${(tiers.reduce((s, t) => s + t.rate, 0) / tiers.length).toFixed(1)}%`, color: "text-emerald-400" },
          { label: "أعلى عمولة", value: `${Math.max(...tiers.map((t) => t.rate))}%`, color: "text-amber-400" },
          { label: "أدنى عمولة", value: `${Math.min(...tiers.map((t) => t.rate))}%`, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <SaveBar onSave={save} dirty={dirty} />
    </div>
  );
}

// ─── Return Policy Section ──────────────────────────────
function ReturnPolicySection() {
  const [policies, setPolicies] = useState<ReturnPolicy[]>(initialReturnPolicies);
  const [dirty, setDirty] = useState(false);
  const [globalDays, setGlobalDays] = useState(14);
  const [autoApprove, setAutoApprove] = useState(false);
  const [requirePhoto, setRequirePhoto] = useState(true);

  const update = (id: string, field: keyof ReturnPolicy, value: string | number | boolean) => {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    toast.success("تم حفظ سياسات الإرجاع بنجاح");
  };

  const refundMethods = ["استرداد كامل للمبلغ", "استرداد كامل أو استبدال", "استرداد كامل أو إصلاح مجاني", "رصيد في المحفظة", "استبدال فقط"];

  return (
    <div>
      <SectionHeader
        title="سياسات الإرجاع والاسترداد"
        description="حدد شروط الإرجاع لكل فئة من المنتجات ومدة قبول طلبات الاسترداد."
      />

      {/* Global Settings */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Globe size={15} className="text-[#81C784]" /> الإعدادات العامة للإرجاع
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs text-slate-400 mb-2">الحد الأقصى الافتراضي لأيام الإرجاع</label>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="90" value={globalDays}
                onChange={(e) => { setGlobalDays(parseInt(e.target.value)); setDirty(true); }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-24 text-center" />
              <span className="text-slate-400 text-sm">يوم</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">يُطبَّق على الفئات غير المحددة</p>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">الموافقة التلقائية على طلبات الإرجاع</label>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { setAutoApprove(!autoApprove); setDirty(true); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoApprove ? "bg-[#4CAF50]" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${autoApprove ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-sm text-slate-300">{autoApprove ? "مفعّل" : "معطّل"}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">الموافقة التلقائية للطلبات المستوفية للشروط</p>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">إلزامية إرفاق صورة عند الإرجاع</label>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { setRequirePhoto(!requirePhoto); setDirty(true); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${requirePhoto ? "bg-[#4CAF50]" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${requirePhoto ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-sm text-slate-300">{requirePhoto ? "مطلوبة" : "اختيارية"}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">يساعد في تسريع قرار الموافقة</p>
          </div>
        </div>
      </div>

      {/* Per-Category Policies */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className={`bg-slate-900 border rounded-2xl p-5 transition-all ${policy.enabled ? "border-slate-700/50" : "border-slate-700/20 opacity-60"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center">
                  <Package size={15} className="text-[#81C784]" />
                </div>
                <h3 className="text-sm font-semibold text-white">{policy.category}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${policy.enabled ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                  {policy.enabled ? "مفعّل" : "معطّل"}
                </span>
                <button onClick={() => update(policy.id, "enabled", !policy.enabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${policy.enabled ? "bg-[#4CAF50]" : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${policy.enabled ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">مدة قبول الإرجاع</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="90" value={policy.returnDays}
                    onChange={(e) => update(policy.id, "returnDays", parseInt(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-20 text-center" />
                  <span className="text-slate-400 text-xs">يوم</span>
                </div>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs text-slate-400 mb-1.5">طريقة الاسترداد</label>
                <select value={policy.refundMethod}
                  onChange={(e) => update(policy.id, "refundMethod", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#4CAF50]/50">
                  {refundMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5">شرط قبول الإرجاع</label>
                <input value={policy.condition}
                  onChange={(e) => update(policy.id, "condition", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50" />
              </div>
              <div className="lg:col-span-4">
                <label className="block text-xs text-slate-400 mb-1.5">ملاحظات إضافية (اختياري)</label>
                <input value={policy.notes}
                  onChange={(e) => update(policy.id, "notes", e.target.value)}
                  placeholder="أضف ملاحظات أو استثناءات خاصة..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#4CAF50]/50" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SaveBar onSave={save} dirty={dirty} />
    </div>
  );
}

// ─── General Settings Section ───────────────────────────
function GeneralSection() {
  const { language, setLanguage } = useLanguage();
  const utils = trpc.useUtils();
  const defaultRegistrationLanguage = trpc.platformPreferences.defaultRegistrationLanguage.useQuery();
  const heroStatsSettings = trpc.platformPreferences.heroStats.useQuery();
  const produceMarketplaceEnabled = trpc.produceMarketplace.enabled.useQuery();
  const buyerProfiles = trpc.produceMarketplace.adminBuyerProfiles.useQuery();
  const updateProduceMarketplaceEnabled = trpc.produceMarketplace.updateEnabled.useMutation({
    onSuccess: async (_, variables) => {
      await produceMarketplaceEnabled.refetch();
      toast.success(variables.enabled ? "تم تشغيل سوق المحاصيل" : "تم إيقاف سوق المحاصيل");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateBuyerStatus = trpc.produceMarketplace.adminUpdateBuyerStatus.useMutation({
    onSuccess: async () => {
      await buyerProfiles.refetch();
      toast.success("تم تحديث حالة حساب الجملة");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateDefaultRegistrationLanguage = trpc.platformPreferences.updateDefaultRegistrationLanguage.useMutation({
    onSuccess: (_, variables) => {
      defaultRegistrationLanguage.refetch();
      toast.success(variables.preferredLanguage === "ar" ? "تم حفظ العربية كلغة افتراضية للحسابات الجديدة" : "تم حفظ الإنجليزية كلغة افتراضية للحسابات الجديدة");
    },
    onError: () => toast.error("تعذر حفظ اللغة الافتراضية للحسابات الجديدة"),
  });
  const updateHeroStats = trpc.platformPreferences.updateHeroStats.useMutation({
    onSuccess: async () => {
      await utils.platformPreferences.heroStats.invalidate();
      toast.success("تم حفظ إعدادات إحصاءات الصفحة الرئيسية");
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ إحصاءات الصفحة الرئيسية"),
  });
  const [heroStatsDraft, setHeroStatsDraft] = useState<HeroStatsDraft>(fallbackHeroStats);
  const [heroStatsDirty, setHeroStatsDirty] = useState(false);

  useEffect(() => {
    if (!heroStatsSettings.data) return;
    setHeroStatsDraft({ enabled: heroStatsSettings.data.enabled, stats: heroStatsSettings.data.stats.map((stat) => ({ ...stat })) });
    setHeroStatsDirty(false);
  }, [heroStatsSettings.data]);
  const [settings, setSettings] = useState({
    platformName: "حصاد",
    platformNameEn: "Hasaad",
    supportEmail: "support@hasaad.com",
    supportPhone: "920012345",
    vatNumber: "310123456700003",
    vatRate: 15,
    minOrderAmount: 50,
    maxOrderAmount: 50000,
    freeShippingThreshold: 500,
    maintenanceMode: false,
    allowGuestCheckout: true,
    requirePhoneVerification: true,
    autoApproveVendors: false,
  });
  const [dirty, setDirty] = useState(false);

  const update = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    toast.success("تم حفظ الإعدادات العامة بنجاح");
  };

  const updateDisplayLanguage = (nextLanguage: "ar" | "en") => {
    setLanguage(nextLanguage);
    toast.success(nextLanguage === "ar" ? "تم حفظ العربية كلغة عرض" : "تم حفظ الإنجليزية كلغة عرض");
  };

  const updateHeroStat = (index: number, field: keyof HeroStatsDraft["stats"][number], value: string | number) => {
    setHeroStatsDraft((current) => ({ ...current, stats: current.stats.map((stat, statIndex) => statIndex === index ? { ...stat, [field]: value } : stat) }));
    setHeroStatsDirty(true);
  };

  const toggleHeroStats = () => {
    setHeroStatsDraft((current) => ({ ...current, enabled: !current.enabled }));
    setHeroStatsDirty(true);
  };

  return (
    <div>
      <SectionHeader title="الإعدادات العامة للمنصة" description="إعدادات المنصة الأساسية والمعلومات التجارية" />

      <div className="space-y-5">
        {/* Platform Info */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={15} className="text-[#81C784]" /> معلومات المنصة
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { key: "platformName", label: "اسم المنصة (عربي)", type: "text" },
              { key: "platformNameEn", label: "اسم المنصة (إنجليزي)", type: "text" },
              { key: "supportEmail", label: "البريد الإلكتروني للدعم", type: "email" },
              { key: "supportPhone", label: "رقم هاتف الدعم", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                <input type={f.type} value={(settings as any)[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Globe size={15} className="text-[#81C784]" /> لغة عرض لوحة الإدارة
          </h3>
          <p className="text-xs text-slate-400 mb-4">اختر لغة الواجهة. يتم حفظ الاختيار في حسابك وتطبيق اتجاه العرض المناسب تلقائياً.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {[
              { value: "ar" as const, title: "العربية", description: "اتجاه من اليمين إلى اليسار" },
              { value: "en" as const, title: "English", description: "Left-to-right layout" },
            ].map((option) => {
              const selected = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateDisplayLanguage(option.value)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-right transition-colors ${selected ? "border-[#4CAF50] bg-[#4CAF50]/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{option.title}</span>
                    <span className="block text-xs text-slate-400 mt-1">{option.description}</span>
                  </span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-[#4CAF50]" : "border-slate-500"}`}>
                    {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Shield size={15} className="text-[#81C784]" /> اللغة الافتراضية للحسابات الجديدة
          </h3>
          <p className="text-xs text-slate-400 mb-4">تُطبّق هذه اللغة عند إنشاء حساب جديد، ويمكن للمستخدم تغييرها لاحقاً من إعدادات حسابه.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {[
              { value: "ar" as const, title: "العربية", description: "اللغة الافتراضية المقترحة" },
              { value: "en" as const, title: "English", description: "Default language for new accounts" },
            ].map((option) => {
              const selected = (defaultRegistrationLanguage.data ?? "ar") === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={updateDefaultRegistrationLanguage.isPending}
                  onClick={() => updateDefaultRegistrationLanguage.mutate({ preferredLanguage: option.value })}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-right transition-colors disabled:opacity-60 ${selected ? "border-[#4CAF50] bg-[#4CAF50]/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{option.title}</span>
                    <span className="block text-xs text-slate-400 mt-1">{option.description}</span>
                  </span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-[#4CAF50]" : "border-slate-500"}`}>
                    {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Globe size={15} className="text-[#81C784]" /> إحصاءات الصفحة الرئيسية</h3>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">تحكم في ظهور شريط الإحصاءات في قسم البطل وعدّل الرقم والعنوان بالعربية والإنجليزية. تُعرض القيم المحفوظة مباشرة للزوار.</p>
            </div>
            <button type="button" disabled={heroStatsSettings.isLoading} onClick={toggleHeroStats} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors disabled:opacity-60 ${heroStatsDraft.enabled ? "bg-[#4CAF50] text-white hover:bg-[#43A047]" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${heroStatsDraft.enabled ? "bg-white" : "bg-slate-400"}`} />{heroStatsDraft.enabled ? "الشريط ظاهر" : "الشريط مخفي"}
            </button>
          </div>
          <div className={`mt-5 grid gap-3 sm:grid-cols-2 ${heroStatsDraft.enabled ? "" : "opacity-60"}`}>
            {heroStatsDraft.stats.map((stat, index) => <div key={`${index}-${stat.labelAr}`} className="rounded-xl bg-slate-800/70 p-3.5">
              <p className="mb-3 text-xs font-bold text-[#81C784]">المؤشر {index + 1}</p>
              <div className="grid grid-cols-[1fr_0.65fr] gap-2">
                <label className="block text-xs text-slate-400">الرقم<input type="number" min="0" max="10000000" value={stat.value} onChange={(event) => updateHeroStat(index, "value", Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-[#4CAF50]/50 focus:outline-none" /></label>
                <label className="block text-xs text-slate-400">اللاحقة<input value={stat.suffixAr} onChange={(event) => updateHeroStat(index, "suffixAr", event.target.value)} placeholder="مثل: ألف" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-[#4CAF50]/50 focus:outline-none" /></label>
              </div>
              <label className="mt-2 block text-xs text-slate-400">العنوان بالعربية<input value={stat.labelAr} onChange={(event) => updateHeroStat(index, "labelAr", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-[#4CAF50]/50 focus:outline-none" /></label>
              <div dir="ltr" className="mt-2 grid grid-cols-[0.65fr_1fr] gap-2">
                <label className="block text-xs text-slate-400">Suffix<input value={stat.suffixEn} onChange={(event) => updateHeroStat(index, "suffixEn", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-[#4CAF50]/50 focus:outline-none" /></label>
                <label className="block text-xs text-slate-400">English title<input value={stat.labelEn} onChange={(event) => updateHeroStat(index, "labelEn", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-[#4CAF50]/50 focus:outline-none" /></label>
              </div>
            </div>)}
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" disabled={!heroStatsDirty || updateHeroStats.isPending} onClick={() => updateHeroStats.mutate(heroStatsDraft)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4CAF50] px-4 text-sm font-bold text-white transition-colors hover:bg-[#43A047] disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} />{updateHeroStats.isPending ? "جارٍ الحفظ..." : "حفظ إعدادات الإحصاءات"}</button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Wheat size={16} className="text-[#F2C76D]" /> سوق المحاصيل B2B</h3>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">عند الإيقاف، لا يمكن للمزارعين نشر عروض أو للمشترين طلب تسعير. تبقى العروض وطلبات التفاوض محفوظة دون حذف.</p>
            </div>
            <button type="button" disabled={produceMarketplaceEnabled.isLoading || updateProduceMarketplaceEnabled.isPending} onClick={() => updateProduceMarketplaceEnabled.mutate({ enabled: !produceMarketplaceEnabled.data })} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors disabled:opacity-60 ${produceMarketplaceEnabled.data ? "bg-[#4CAF50] text-white hover:bg-[#43A047]" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${produceMarketplaceEnabled.data ? "bg-white" : "bg-slate-400"}`} />{produceMarketplaceEnabled.data ? "الخدمة مفعّلة" : "الخدمة متوقفة"}
            </button>
          </div>
          <div className="mt-5 border-t border-slate-700/60 pt-4">
            <div className="flex items-center gap-2"><UserRoundCheck size={15} className="text-[#81C784]" /><h4 className="text-sm font-semibold text-white">طلبات اعتماد مشتري الجملة</h4></div>
            <p className="mt-1 text-xs text-slate-400">اعتمد فقط الشركات والتجار والمطاعم الذين تم التحقق من بياناتهم.</p>
            <div className="mt-3 space-y-2">
              {buyerProfiles.isLoading && <div className="h-12 animate-pulse rounded-xl bg-slate-800" />}
              {!buyerProfiles.isLoading && (buyerProfiles.data?.length ?? 0) === 0 && <p className="rounded-xl bg-slate-800/60 px-3 py-3 text-xs text-slate-400">لا توجد طلبات اعتماد حتى الآن.</p>}
              {buyerProfiles.data?.map((profile) => <div key={profile.id} className="flex flex-col gap-3 rounded-xl bg-slate-800/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-white">{profile.businessName} <span className="text-slate-400">— {profile.businessType === "company" ? "شركة" : profile.businessType === "trader" ? "تاجر / موزع" : "مطعم"}</span></p><p className="mt-1 text-xs text-slate-400">{profile.contactName} · {profile.phone} · {profile.email || "لا يوجد بريد"}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${profile.status === "approved" ? "bg-[#4CAF50]/15 text-[#81C784]" : profile.status === "pending" ? "bg-amber-400/15 text-amber-300" : "bg-red-400/15 text-red-300"}`}>{profile.status === "approved" ? "معتمد" : profile.status === "pending" ? "قيد المراجعة" : profile.status === "suspended" ? "موقوف" : "مرفوض"}</span>{profile.status !== "approved" && <button type="button" disabled={updateBuyerStatus.isPending} onClick={() => updateBuyerStatus.mutate({ id: profile.id, status: "approved" })} className="min-h-8 rounded-lg bg-[#4CAF50] px-2.5 text-xs font-bold text-white">اعتماد</button>}{profile.status !== "rejected" && <button type="button" disabled={updateBuyerStatus.isPending} onClick={() => updateBuyerStatus.mutate({ id: profile.id, status: "rejected" })} className="min-h-8 rounded-lg bg-red-400/15 px-2.5 text-xs font-bold text-red-300">رفض</button>}</div></div>)}
            </div>
          </div>
        </div>

        {/* Tax & Orders */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-[#81C784]" /> الضريبة والطلبات
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الرقم الضريبي</label>
              <input value={settings.vatNumber} onChange={(e) => update("vatNumber", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">نسبة ضريبة القيمة المضافة %</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" max="30" value={settings.vatRate}
                  onChange={(e) => update("vatRate", parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-20 text-center" />
                <span className="text-slate-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">حد الشحن المجاني (ر.س)</label>
              <input type="number" value={settings.freeShippingThreshold}
                onChange={(e) => update("freeShippingThreshold", parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الحد الأدنى للطلب (ر.س)</label>
              <input type="number" value={settings.minOrderAmount}
                onChange={(e) => update("minOrderAmount", parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الحد الأقصى للطلب (ر.س)</label>
              <input type="number" value={settings.maxOrderAmount}
                onChange={(e) => update("maxOrderAmount", parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/50 w-full" />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Settings size={15} className="text-[#81C784]" /> خيارات التشغيل
          </h3>
          <div className="space-y-4">
            {[
              { key: "maintenanceMode", label: "وضع الصيانة", desc: "إيقاف المنصة مؤقتاً وعرض صفحة الصيانة للزوار", danger: true },
              { key: "allowGuestCheckout", label: "السماح بالشراء بدون تسجيل", desc: "يتيح للزوار إتمام الطلبات دون إنشاء حساب" },
              { key: "requirePhoneVerification", label: "إلزامية التحقق من الهاتف", desc: "يجب على المستخدمين تأكيد رقم هاتفهم عند التسجيل" },
              { key: "autoApproveVendors", label: "الموافقة التلقائية على البائعين", desc: "تفعيل حسابات البائعين الجدد فوراً دون مراجعة يدوية", danger: true },
            ].map((toggle) => (
              <div key={toggle.key} className={`flex items-center justify-between p-3 rounded-xl ${toggle.danger && (settings as any)[toggle.key] ? "bg-red-500/5 border border-red-500/20" : "bg-slate-800/50"}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{toggle.label}</p>
                    {toggle.danger && <AlertTriangle size={13} className="text-amber-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{toggle.desc}</p>
                </div>
                <button onClick={() => update(toggle.key, !(settings as any)[toggle.key])}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${(settings as any)[toggle.key] ? (toggle.danger ? "bg-red-500" : "bg-[#4CAF50]") : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(settings as any)[toggle.key] ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SaveBar onSave={save} dirty={dirty} />
    </div>
  );
}

// ─── Payment Section ────────────────────────────────────
function PaymentSection() {
  const [methods, setMethods] = useState([
    { id: "pm1", name: "بطاقة ائتمانية / مدى", icon: "💳", enabled: true, fee: 0 },
    { id: "pm2", name: "محفظة STC Pay", icon: "📱", enabled: true, fee: 0 },
    { id: "pm3", name: "تحويل بنكي", icon: "🏦", enabled: true, fee: 0 },
    { id: "pm4", name: "الدفع عند الاستلام", icon: "💵", enabled: false, fee: 15 },
    { id: "pm5", name: "تمويل تقسيط (تمارا)", icon: "🔄", enabled: false, fee: 2.5 },
    { id: "pm6", name: "Apple Pay", icon: "🍎", enabled: true, fee: 0 },
  ]);
  const [dirty, setDirty] = useState(false);

  const toggle = (id: string) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
    setDirty(true);
  };

  const save = () => { setDirty(false); toast.success("تم حفظ إعدادات طرق الدفع"); };

  return (
    <div>
      <SectionHeader title="طرق الدفع المتاحة" description="تفعيل أو تعطيل طرق الدفع المتاحة للمشترين في المنصة" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div key={method.id} className={`bg-slate-900 border rounded-2xl p-5 flex items-center gap-4 transition-all ${method.enabled ? "border-slate-700/50" : "border-slate-700/20 opacity-60"}`}>
            <span className="text-2xl">{method.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{method.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {method.fee > 0 ? `رسوم إضافية: ${method.fee}%` : "بدون رسوم إضافية"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${method.enabled ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                {method.enabled ? "مفعّل" : "معطّل"}
              </span>
              <button onClick={() => toggle(method.id)}
                className={`relative w-11 h-6 rounded-full transition-colors ${method.enabled ? "bg-[#4CAF50]" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${method.enabled ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar onSave={save} dirty={dirty} />
    </div>
  );
}

// ─── Notifications Section ──────────────────────────────
function NotificationsSection() {
  const [notifs, setNotifs] = useState([
    { id: "n1", event: "طلب جديد", channels: { email: true, sms: true, push: true } },
    { id: "n2", event: "طلب بائع جديد", channels: { email: true, sms: false, push: true } },
    { id: "n3", event: "تذكرة دعم جديدة", channels: { email: true, sms: false, push: true } },
    { id: "n4", event: "منتج بانتظار المراجعة", channels: { email: true, sms: false, push: false } },
    { id: "n5", event: "طلب إرجاع جديد", channels: { email: true, sms: true, push: true } },
    { id: "n6", event: "مستخدم جديد", channels: { email: false, sms: false, push: false } },
    { id: "n7", event: "تقرير يومي", channels: { email: true, sms: false, push: false } },
  ]);
  const [dirty, setDirty] = useState(false);

  const toggle = (id: string, channel: "email" | "sms" | "push") => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, channels: { ...n.channels, [channel]: !n.channels[channel] } } : n)));
    setDirty(true);
  };

  const save = () => { setDirty(false); toast.success("تم حفظ إعدادات الإشعارات"); };

  return (
    <div>
      <SectionHeader title="إعدادات الإشعارات" description="حدد القنوات التي يُرسَل عبرها كل نوع من الإشعارات لمدير النظام" />
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">الحدث</th>
              <th className="text-center text-xs font-semibold text-slate-400 px-4 py-3">البريد الإلكتروني</th>
              <th className="text-center text-xs font-semibold text-slate-400 px-4 py-3">رسالة نصية SMS</th>
              <th className="text-center text-xs font-semibold text-slate-400 px-4 py-3">إشعار فوري</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {notifs.map((n) => (
              <tr key={n.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-sm text-white">{n.event}</td>
                {(["email", "sms", "push"] as const).map((ch) => (
                  <td key={ch} className="px-4 py-3 text-center">
                    <button onClick={() => toggle(n.id, ch)}
                      className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors ${n.channels[ch] ? "bg-[#4CAF50] text-white" : "bg-slate-700 text-slate-600"}`}>
                      {n.channels[ch] && <CheckCircle size={12} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SaveBar onSave={save} dirty={dirty} />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("commission");
  const { isEnglish } = useLanguage();

  const renderSection = () => {
    switch (activeSection) {
      case "commission": return <CommissionSection />;
      case "returns": return <ReturnPolicySection />;
      case "general": return <GeneralSection />;
      case "payment": return <PaymentSection />;
      case "notifications": return <NotificationsSection />;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">إعدادات المنصة</h1>
          <p className="text-sm text-slate-400 mt-0.5">إدارة جميع إعدادات منصة حصاد من مكان واحد</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Nav */}
          <aside className="w-52 shrink-0">
            <nav className="space-y-1">
              {sections.map((s) => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-right ${
                    activeSection === s.id
                      ? "bg-[#4CAF50]/20 text-[#81C784]"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}>
                  <span className={activeSection === s.id ? "text-[#81C784]" : "text-slate-500"}>{s.icon}</span>
                  {isEnglish ? s.labelEn : s.labelAr}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {renderSection()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
