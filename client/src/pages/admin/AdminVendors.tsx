/**
 * HASAAD PLATFORM — AdminVendors
 * Design: Deep Slate + Accent Green | RTL Arabic
 * Features:
 *   - Vendor table with live commission rate from CommissionContext
 *   - Side detail panel: performance, commission info, custom rate override
 *   - Add/Edit vendor modal with multi-tab form
 */
import { useState } from "react";
import {
  Search, CheckCircle, XCircle, Clock, Store, Star, Package,
  TrendingUp, ShieldCheck, X, Percent, BarChart2, Phone, Mail,
  MapPin, Calendar, ChevronLeft, AlertCircle, ArrowUpRight,
  Edit3, Save, Trash2, Info, Plus, User, Building2, CreditCard,
  Globe, FileText, Upload,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminVendor, VendorStatus } from "@/lib/adminData";
import { useCommission } from "@/contexts/CommissionContext";
import { useAdminVendors, VendorFormData } from "@/contexts/AdminVendorsContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";

const statusConfig: Record<VendorStatus, { label: string; color: string; bg: string; border: string }> = {
  active:    { label: "نشط",              color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  pending:   { label: "بانتظار الموافقة", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30"   },
  suspended: { label: "موقوف",            color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/30"  },
  rejected:  { label: "مرفوض",           color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30"     },
};

const CATEGORIES = [
  "أسمدة", "مبيدات", "بذور", "معدات زراعية", "ري وصرف", "تربة وبيئات نمو",
  "حيوانات ومستلزمات", "خدمات زراعية", "تقنية زراعية", "أخرى",
];

const emptyForm = (): VendorFormData => ({
  name: "", type: "supplier", category: "", status: "pending", verified: false,
  email: "", phone: "", location: "", avatar: "", commission: 8,
  description: "", website: "", crNumber: "", vatNumber: "", bankName: "", bankIban: "",
});

export default function AdminVendors() {
  const { vendors, addVendor, updateVendor, deleteVendor, changeStatus, toggleVerified } = useAdminVendors();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null);
  const { getRate, tiers, customRates, setCustomRate } = useCommission();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<AdminVendor | null>(null);
  const [form, setForm] = useState<VendorFormData>(emptyForm());
  const [modalTab, setModalTab] = useState<"basic" | "contact" | "business" | "financial">("basic");
  const uploadLogo = trpc.adminManagement.uploadImage.useMutation();

  const filtered = vendors.filter((v) => {
    const matchSearch = v.name.includes(search) || v.email.includes(search) || v.category.includes(search);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchType = typeFilter === "all" || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const pendingCount = vendors.filter((v) => v.status === "pending").length;
  const activeCount  = vendors.filter((v) => v.status === "active").length;
  const totalRevenue = vendors.reduce((s, v) => s + v.totalRevenue, 0);

  const handleLogoFile = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      toast.error("اختر صورة PNG أو JPG أو WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الشعار يجب ألا يتجاوز 5 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const uploaded = await uploadLogo.mutateAsync({ fileName: file.name, dataUrl: String(reader.result) });
        setF("avatar", uploaded.url);
        toast.success("تم رفع شعار المورد");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر رفع الشعار");
      }
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditingVendor(null);
    setForm(emptyForm());
    setModalTab("basic");
    setShowModal(true);
  };

  const openEdit = (vendor: AdminVendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      type: vendor.type,
      category: vendor.category,
      status: vendor.status,
      verified: vendor.verified,
      email: vendor.email,
      phone: vendor.phone || "",
      location: vendor.location || "",
      avatar: vendor.avatar || "",
      commission: vendor.commission || 8,
      description: "",
      website: "",
      crNumber: "",
      vatNumber: "",
      bankName: "",
      bankIban: "",
    });
    setModalTab("basic");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("يرجى إدخال اسم البائع"); setModalTab("basic"); return; }
    if (!form.email.trim()) { toast.error("يرجى إدخال البريد الإلكتروني"); setModalTab("contact"); return; }
    if (!form.category) { toast.error("يرجى اختيار الفئة"); setModalTab("basic"); return; }

    if (editingVendor) {
      updateVendor(editingVendor.id, form);
      if (selectedVendor?.id === editingVendor.id) {
        setSelectedVendor(prev => prev ? { ...prev, ...form } : null);
      }
      toast.success(`تم تحديث بيانات ${form.name} بنجاح`);
    } else {
      addVendor(form);
      toast.success(`تمت إضافة البائع ${form.name} بنجاح`);
      setSelectedVendor(null);
    }
    setShowModal(false);
  };

  const handleDelete = (vendor: AdminVendor) => {
    if (!confirm(`هل أنت متأكد من حذف البائع "${vendor.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    deleteVendor(vendor.id);
    if (selectedVendor?.id === vendor.id) setSelectedVendor(null);
    toast.success(`تم حذف البائع ${vendor.name}`);
  };

  const setF = (k: keyof VendorFormData, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">إدارة البائعين والموردين</h1>
            <p className="text-sm text-slate-400 mt-0.5">مراجعة طلبات الانضمام وإدارة حسابات البائعين</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> إضافة بائع
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "إجمالي البائعين",  value: vendors.length,                              color: "text-blue-400",    bg: "bg-blue-400/10",    icon: <Store size={15} /> },
            { label: "نشط",              value: activeCount,                                 color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle size={15} /> },
            { label: "بانتظار الموافقة", value: pendingCount,                                color: "text-amber-400",   bg: "bg-amber-400/10",   icon: <Clock size={15} /> },
            { label: "إجمالي الإيرادات", value: `${(totalRevenue / 1000).toFixed(0)}ك ر.س`, color: "text-purple-400",  bg: "bg-purple-400/10",  icon: <TrendingUp size={15} /> },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Banner */}
        {pendingCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <Clock size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">يوجد {pendingCount} طلب انضمام بائع بانتظار مراجعتك</p>
              <p className="text-xs text-amber-400/70 mt-0.5">راجع الطلبات أدناه وقم بالموافقة أو الرفض</p>
            </div>
          </div>
        )}

        {/* Layout: Table + Detail Panel */}
        <div className="flex gap-5 items-start">
          {/* Table */}
          <div className="flex-1 min-w-0 bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-700/30 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-40">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو البريد..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/50"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">بانتظار الموافقة</option>
                <option value="suspended">موقوف</option>
                <option value="rejected">مرفوض</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                <option value="all">جميع الأنواع</option>
                <option value="supplier">مورد</option>
                <option value="provider">مزود خدمة</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {["البائع", "الفئة", "الإيرادات", "العمولة المطبقة", "الحالة", "إجراءات"].map((h) => (
                      <th key={h} className="text-right text-xs font-semibold text-slate-400 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map((vendor) => {
                    const cfg = statusConfig[vendor.status];
                    const commInfo = getRate(vendor.category, vendor.totalRevenue, vendor.id);
                    const isSelected = selectedVendor?.id === vendor.id;
                    const hasCustom = customRates.some((r) => r.vendorId === vendor.id);
                    return (
                      <tr
                        key={vendor.id}
                        onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#4CAF50]/10 border-r-2 border-r-[#4CAF50]" : "hover:bg-slate-800/30"} ${vendor.status === "pending" ? "bg-amber-500/5" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img src={vendor.avatar} alt={vendor.name} className="w-8 h-8 rounded-xl object-cover" />
                              {vendor.verified && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <ShieldCheck size={8} className="text-white" />
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white leading-tight">{vendor.name}</p>
                              <p className="text-[10px] text-slate-500">{vendor.type === "supplier" ? "مورد" : "مزود خدمة"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{vendor.category}</td>
                        <td className="px-4 py-3 text-xs text-white font-medium">{vendor.totalRevenue.toLocaleString("ar-SA")} ر.س</td>
                        <td className="px-4 py-3">
                          {commInfo ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${commInfo.tierColor}`}>
                                {commInfo.rate}%
                              </span>
                              {hasCustom && (
                                <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">مخصص</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(vendor)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#4CAF50]/20 text-slate-400 hover:text-[#81C784] flex items-center justify-center transition-colors"
                              title="تعديل"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(vendor)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={13} />
                            </button>
                            <ChevronLeft size={14} className={`text-slate-500 transition-transform mr-1 ${isSelected ? "rotate-90 text-[#81C784]" : ""}`} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">لا توجد نتائج مطابقة</div>
            )}
            <div className="px-4 py-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-500">عرض {filtered.length} من {vendors.length} بائع</p>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedVendor && (
            <VendorDetailPanel
              vendor={selectedVendor}
              onClose={() => setSelectedVendor(null)}
              onChangeStatus={changeStatus}
              onEdit={() => openEdit(selectedVendor)}
              onToggleVerified={toggleVerified}
              getRate={getRate}
              tiers={tiers}
              customRates={customRates}
              setCustomRate={setCustomRate}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingVendor ? `تعديل بيانات: ${editingVendor.name}` : "إضافة بائع جديد"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingVendor ? "قم بتحديث بيانات البائع ثم احفظ التغييرات" : "أدخل بيانات البائع الجديد في النموذج أدناه"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700/30 shrink-0">
              {([
                { id: "basic",     label: "الأساسيات",    icon: <User size={13} /> },
                { id: "contact",   label: "التواصل",      icon: <Phone size={13} /> },
                { id: "business",  label: "الأعمال",      icon: <Building2 size={13} /> },
                { id: "financial", label: "المالية",      icon: <CreditCard size={13} /> },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                    modalTab === tab.id
                      ? "border-[#4CAF50] text-[#81C784]"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ── Tab: الأساسيات ── */}
              {modalTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5">اسم البائع / المتجر <span className="text-red-400">*</span></label>
                      <input
                        value={form.name}
                        onChange={(e) => setF("name", e.target.value)}
                        placeholder="مثال: شركة الخير للأسمدة"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">نوع البائع</label>
                      <select
                        value={form.type}
                        onChange={(e) => setF("type", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#4CAF50]/60"
                      >
                        <option value="supplier">مورد منتجات</option>
                        <option value="provider">مزود خدمات</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">الفئة الرئيسية <span className="text-red-400">*</span></label>
                      <select
                        value={form.category}
                        onChange={(e) => setF("category", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#4CAF50]/60"
                      >
                        <option value="">اختر الفئة</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">الحالة الابتدائية</label>
                      <select
                        value={form.status}
                        onChange={(e) => setF("status", e.target.value as VendorStatus)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#4CAF50]/60"
                      >
                        <option value="pending">بانتظار الموافقة</option>
                        <option value="active">نشط</option>
                        <option value="suspended">موقوف</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">نسبة العمولة %</label>
                      <div className="relative">
                        <input
                          type="number" min="0" max="100" step="0.5"
                          value={form.commission}
                          onChange={(e) => setF("commission", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-3 pl-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#4CAF50]/60"
                        />
                        <Percent size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5">نبذة عن البائع</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setF("description", e.target.value)}
                        placeholder="وصف مختصر عن البائع ونشاطه التجاري..."
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60 resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5">شعار المورد</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-dashed border-slate-600 hover:border-[#4CAF50] rounded-xl px-3 py-2.5 text-sm text-slate-300 cursor-pointer transition-colors">
                          <Upload size={15} />
                          {uploadLogo.isPending ? "جارٍ رفع الشعار..." : form.avatar ? "استبدال الشعار" : "رفع صورة الشعار"}
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploadLogo.isPending} onChange={(event) => handleLogoFile(event.target.files?.[0])} />
                        </label>
                        {form.avatar && (
                          <img src={form.avatar} alt="معاينة الشعار" className="w-10 h-10 rounded-xl object-cover border border-slate-700" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">PNG أو JPG أو WEBP حتى 5 ميجابايت.</p>
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setF("verified", !form.verified)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${form.verified ? "bg-[#4CAF50]" : "bg-slate-700"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.verified ? "right-0.5" : "left-0.5"}`} />
                      </button>
                      <span className="text-sm text-slate-300">بائع موثَّق <span className="text-xs text-slate-500">(يظهر شارة التحقق)</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: التواصل ── */}
              {modalTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5">البريد الإلكتروني <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setF("email", e.target.value)}
                          placeholder="vendor@example.com"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">رقم الجوال</label>
                      <div className="relative">
                        <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={form.phone}
                          onChange={(e) => setF("phone", e.target.value)}
                          placeholder="05XXXXXXXX"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">الموقع / المدينة</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={form.location}
                          onChange={(e) => setF("location", e.target.value)}
                          placeholder="الرياض، المملكة العربية السعودية"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5">الموقع الإلكتروني</label>
                      <div className="relative">
                        <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={form.website}
                          onChange={(e) => setF("website", e.target.value)}
                          placeholder="https://vendor-website.com"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: الأعمال ── */}
              {modalTab === "business" && (
                <div className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex gap-2">
                    <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">هذه المعلومات تُستخدم للتحقق من هوية البائع وإصدار الفواتير الضريبية.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">رقم السجل التجاري</label>
                      <div className="relative">
                        <FileText size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={form.crNumber}
                          onChange={(e) => setF("crNumber", e.target.value)}
                          placeholder="1010XXXXXX"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">الرقم الضريبي (VAT)</label>
                      <div className="relative">
                        <FileText size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={form.vatNumber}
                          onChange={(e) => setF("vatNumber", e.target.value)}
                          placeholder="3XXXXXXXXXXXXXXX3"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: المالية ── */}
              {modalTab === "financial" && (
                <div className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex gap-2">
                    <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">معلومات الحساب البنكي لتحويل مستحقات البائع. تُحفظ بشكل آمن ومشفر.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">اسم البنك</label>
                      <input
                        value={form.bankName}
                        onChange={(e) => setF("bankName", e.target.value)}
                        placeholder="مثال: بنك الراجحي"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">رقم الآيبان (IBAN)</label>
                      <input
                        value={form.bankIban}
                        onChange={(e) => setF("bankIban", e.target.value)}
                        placeholder="SA0000000000000000000000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4CAF50]/60"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-700/30 flex items-center justify-between shrink-0">
              <div className="flex gap-1">
                {(["basic", "contact", "business", "financial"] as const).map((t, i) => (
                  <button key={t} onClick={() => setModalTab(t)} className={`w-2 h-2 rounded-full transition-colors ${modalTab === t ? "bg-[#4CAF50]" : "bg-slate-700 hover:bg-slate-600"}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium rounded-xl transition-colors"
                >
                  <Save size={14} />
                  {editingVendor ? "حفظ التعديلات" : "إضافة البائع"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── Vendor Detail Panel ────────────────────────────────
interface PanelProps {
  vendor: AdminVendor;
  onClose: () => void;
  onChangeStatus: (id: string, status: VendorStatus) => void;
  onEdit: () => void;
  onToggleVerified: (id: string) => void;
  getRate: ReturnType<typeof useCommission>["getRate"];
  tiers: ReturnType<typeof useCommission>["tiers"];
  customRates: ReturnType<typeof useCommission>["customRates"];
  setCustomRate: ReturnType<typeof useCommission>["setCustomRate"];
}

function VendorDetailPanel({ vendor, onClose, onChangeStatus, onEdit, onToggleVerified, getRate, tiers, customRates, setCustomRate }: PanelProps) {
  const cfg = statusConfig[vendor.status];
  const commInfo = getRate(vendor.category, vendor.totalRevenue, vendor.id);
  const existingCustom = customRates.find((r) => r.vendorId === vendor.id);

  const [editingCustom, setEditingCustom] = useState(false);
  const [customRateInput, setCustomRateInput] = useState<string>(existingCustom ? String(existingCustom.rate) : "");
  const [customReasonInput, setCustomReasonInput] = useState<string>(existingCustom?.reason ?? "");

  const commissionEarned = commInfo ? Math.round(vendor.totalRevenue * commInfo.rate / 100) : 0;

  const catTiers = tiers.filter((t) =>
    t.category === vendor.category ||
    vendor.category.includes(t.category) ||
    t.category.includes(vendor.category)
  );

  const handleSaveCustom = () => {
    const rate = parseFloat(customRateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error("أدخل نسبة صحيحة بين 0 و 100"); return; }
    if (!customReasonInput.trim()) { toast.error("يرجى إدخال سبب تحديد النسبة المخصصة"); return; }
    setCustomRate(vendor.id, rate, customReasonInput.trim());
    setEditingCustom(false);
    toast.success(`تم تحديد نسبة عمولة مخصصة ${rate}% لـ ${vendor.name}`);
  };

  const handleRemoveCustom = () => {
    setCustomRate(vendor.id, null, "");
    setCustomRateInput(""); setCustomReasonInput(""); setEditingCustom(false);
    toast.success("تم إلغاء النسبة المخصصة — سيُطبَّق معدل الفئة الافتراضي");
  };

  return (
    <div className="w-80 shrink-0 bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-180px)] sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/30 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-white">تفاصيل البائع</h3>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-[#4CAF50]/20 flex items-center justify-center text-slate-400 hover:text-[#81C784] transition-colors" title="تعديل">
            <Edit3 size={13} />
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={vendor.avatar} alt={vendor.name} className="w-14 h-14 rounded-2xl object-cover" />
            {vendor.verified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <ShieldCheck size={10} className="text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{vendor.name}</p>
            <p className="text-[11px] text-slate-400">{vendor.type === "supplier" ? "مورد" : "مزود خدمة"} · {vendor.category}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">معلومات التواصل</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-300"><Mail size={12} className="text-slate-500 shrink-0" /><span className="truncate">{vendor.email}</span></div>
            {vendor.phone && <div className="flex items-center gap-2 text-xs text-slate-300"><Phone size={12} className="text-slate-500 shrink-0" /><span>{vendor.phone}</span></div>}
            {vendor.location && <div className="flex items-center gap-2 text-xs text-slate-300"><MapPin size={12} className="text-slate-500 shrink-0" /><span>{vendor.location}</span></div>}
            <div className="flex items-center gap-2 text-xs text-slate-300"><Calendar size={12} className="text-slate-500 shrink-0" /><span>انضم في {vendor.joinDate}</span></div>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">الأداء</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "المنتجات",  value: vendor.totalProducts,                              icon: <Package size={12} />,   color: "text-blue-400"    },
              { label: "الطلبات",   value: vendor.totalOrders.toLocaleString("ar-SA"),        icon: <BarChart2 size={12} />,  color: "text-purple-400"  },
              { label: "الإيرادات", value: `${(vendor.totalRevenue / 1000).toFixed(1)}ك`,     icon: <TrendingUp size={12} />, color: "text-emerald-400" },
              { label: "التقييم",   value: vendor.rating > 0 ? `${vendor.rating} ★` : "—",   icon: <Star size={12} />,       color: "text-amber-400"   },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800/60 rounded-xl p-3">
                <div className={`flex items-center gap-1 ${m.color} mb-1`}>{m.icon}<span className="text-[10px]">{m.label}</span></div>
                <p className="text-sm font-bold text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">نسبة العمولة</p>
            <Link href="/admin/settings" className="text-[10px] text-[#81C784] hover:underline flex items-center gap-0.5">
              إعدادات العمولة <ArrowUpRight size={10} />
            </Link>
          </div>
          {commInfo ? (
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">النسبة المطبقة حالياً</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-2xl font-black text-white">{commInfo.rate}<span className="text-sm font-normal text-slate-400">%</span></p>
                    {commInfo.isCustom && <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 font-medium">مخصص</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{commInfo.tierLabel}</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">العمولة المُحصَّلة</p>
                  <p className="text-sm font-bold text-[#81C784] mt-0.5">{commissionEarned.toLocaleString("ar-SA")} ر.س</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">من {vendor.totalRevenue.toLocaleString("ar-SA")} ر.س</p>
                </div>
              </div>
              {!commInfo.isCustom && catTiers.length > 1 && (() => {
                const sortedTiers = [...catTiers].sort((a, b) => a.minRevenue - b.minRevenue);
                const currentIdx = sortedTiers.findIndex((t) => t.minRevenue <= vendor.totalRevenue && (t.maxRevenue === null || t.maxRevenue >= vendor.totalRevenue));
                const currentTier = sortedTiers[currentIdx];
                const nextTier = sortedTiers[currentIdx + 1];
                if (!currentTier || !currentTier.maxRevenue) return null;
                const progress = Math.min(100, ((vendor.totalRevenue - currentTier.minRevenue) / (currentTier.maxRevenue - currentTier.minRevenue)) * 100);
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{currentTier.minRevenue.toLocaleString("ar-SA")} ر.س</span>
                      <span>{currentTier.maxRevenue.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4CAF50] to-[#81C784] rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    {nextTier && (
                      <p className="text-[10px] text-slate-400 text-center">
                        متبقي <span className="text-white font-medium">{(currentTier.maxRevenue - vendor.totalRevenue).toLocaleString("ar-SA")} ر.س</span> للانتقال لـ <span className={`font-medium ${nextTier.rate < commInfo.rate ? "text-emerald-400" : "text-amber-400"}`}>{nextTier.rate}%</span>
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-xl p-4 flex items-center gap-2 text-slate-400">
              <AlertCircle size={14} />
              <p className="text-xs">لا توجد فئة عمولة مطابقة. راجع إعدادات العمولة.</p>
            </div>
          )}
        </div>

        {/* Custom Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">نسبة استثنائية مخصصة</p>
            {existingCustom && !editingCustom && (
              <button onClick={() => { setEditingCustom(true); setCustomRateInput(String(existingCustom.rate)); setCustomReasonInput(existingCustom.reason); }}
                className="text-[10px] text-[#81C784] hover:underline flex items-center gap-0.5">
                <Edit3 size={10} /> تعديل
              </button>
            )}
          </div>
          {!existingCustom && !editingCustom && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex gap-2">
              <Info size={13} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">يمكنك تحديد نسبة عمولة خاصة لهذا البائع تتجاوز الفئة الافتراضية.</p>
            </div>
          )}
          {existingCustom && !editingCustom && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-amber-400/70">النسبة المخصصة</p>
                  <p className="text-xl font-black text-amber-400">{existingCustom.rate}<span className="text-sm font-normal">%</span></p>
                </div>
                <button onClick={handleRemoveCustom} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded-lg transition-colors">
                  <Trash2 size={10} /> إلغاء
                </button>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">السبب</p>
                <p className="text-xs text-slate-300 mt-0.5">{existingCustom.reason}</p>
              </div>
              <p className="text-[10px] text-slate-500">حُدِّدت في {new Date(existingCustom.setAt).toLocaleDateString("ar-SA")}</p>
            </div>
          )}
          {!editingCustom && (
            <button onClick={() => setEditingCustom(true)}
              className="w-full flex items-center justify-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl transition-colors border border-slate-700/50">
              <Percent size={13} />
              {existingCustom ? "تعديل النسبة المخصصة" : "تحديد نسبة استثنائية"}
            </button>
          )}
          {editingCustom && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-white">{existingCustom ? "تعديل النسبة المخصصة" : "تحديد نسبة استثنائية"}</p>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">نسبة العمولة %</label>
                <div className="relative">
                  <input type="number" min="0" max="100" step="0.5" value={customRateInput} onChange={(e) => setCustomRateInput(e.target.value)} placeholder="مثال: 7.5"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pr-3 pl-8 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/60 placeholder-slate-600" />
                  <Percent size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">سبب التخصيص <span className="text-red-400">*</span></label>
                <textarea value={customReasonInput} onChange={(e) => setCustomReasonInput(e.target.value)} placeholder="مثال: عقد شراكة استراتيجية..." rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4CAF50]/60 placeholder-slate-600 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveCustom} className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-[#4CAF50] hover:bg-[#43A047] text-white px-3 py-2 rounded-xl transition-colors font-medium">
                  <Save size={12} /> حفظ النسبة
                </button>
                <button onClick={() => { setEditingCustom(false); setCustomRateInput(existingCustom ? String(existingCustom.rate) : ""); setCustomReasonInput(existingCustom?.reason ?? ""); }}
                  className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">إجراءات الحساب</p>
          <div className="grid grid-cols-2 gap-2">
            {vendor.status === "pending" && (
              <>
                <button onClick={() => onChangeStatus(vendor.id, "active")} className="flex items-center justify-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-xl transition-colors font-medium">
                  <CheckCircle size={13} /> موافقة
                </button>
                <button onClick={() => onChangeStatus(vendor.id, "rejected")} className="flex items-center justify-center gap-1.5 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded-xl transition-colors font-medium">
                  <XCircle size={13} /> رفض
                </button>
              </>
            )}
            {vendor.status === "active" && (
              <button onClick={() => onChangeStatus(vendor.id, "suspended")} className="col-span-2 flex items-center justify-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-2 rounded-xl transition-colors font-medium">
                إيقاف مؤقت
              </button>
            )}
            {vendor.status === "suspended" && (
              <button onClick={() => onChangeStatus(vendor.id, "active")} className="col-span-2 flex items-center justify-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-xl transition-colors font-medium">
                <CheckCircle size={13} /> إعادة تفعيل
              </button>
            )}
          </div>
          <button onClick={() => onToggleVerified(vendor.id)} className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-2 rounded-xl transition-colors font-medium border border-blue-500/20">
            <ShieldCheck size={13} /> {vendor.verified ? "إلغاء التوثيق" : "تفعيل التوثيق"}
          </button>
        </div>
      </div>
    </div>
  );
}
