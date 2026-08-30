/*
 * HASAAD PLATFORM — AdminCategories
 * Design: Deep Slate + Accent Green | RTL Arabic
 * Manage product categories: add, edit, toggle active, delete
 */
import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, X, Check, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminProducts, AdminCategory } from "@/contexts/AdminProductsContext";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["🌿","🌱","🛡️","💧","🧪","🌾","🌻","🔧","🌍","🐄","🍎","🌽","🥕","🍅","🐝","🚜","⚗️","🌡️","🪴","🌊"];
const COLOR_OPTIONS = ["#4CAF50","#8BC34A","#FF9800","#2196F3","#9C27B0","#795548","#FFC107","#607D8B","#F44336","#00BCD4","#E91E63","#3F51B5"];

interface CategoryFormData {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  active: boolean;
}

const emptyForm: CategoryFormData = { name: "", nameEn: "", icon: "🌿", color: "#4CAF50", description: "", active: true };

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useAdminProducts();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  // Compute product counts per category
  const countMap: Record<string, number> = {};
  products.forEach((p) => { countMap[p.category] = (countMap[p.category] || 0) + 1; });

  const openAdd = () => { setForm(emptyForm); setEditId(null); setErrors({}); setShowForm(true); };
  const openEdit = (cat: AdminCategory) => {
    setForm({ name: cat.name, nameEn: cat.nameEn, icon: cat.icon, color: cat.color, description: cat.description || "", active: cat.active });
    setEditId(cat.id);
    setErrors({});
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); };

  const validate = (): boolean => {
    const e: Partial<CategoryFormData> = {};
    if (!form.name.trim()) e.name = "اسم الفئة مطلوب";
    if (!form.nameEn.trim()) e.nameEn = "الاسم الإنجليزي مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      updateCategory(editId, { name: form.name, nameEn: form.nameEn, icon: form.icon, color: form.color, description: form.description, active: form.active });
      toast.success("تم تحديث الفئة بنجاح");
    } else {
      addCategory({ name: form.name, nameEn: form.nameEn, icon: form.icon, color: form.color, description: form.description, active: form.active });
      toast.success("تمت إضافة الفئة بنجاح");
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    const ok = deleteCategory(id);
    if (ok) { toast.success("تم حذف الفئة"); }
    else { toast.error("لا يمكن حذف الفئة — توجد منتجات مرتبطة بها"); }
    setDeleteConfirm(null);
  };

  const handleToggle = (cat: AdminCategory) => {
    updateCategory(cat.id, { active: !cat.active });
    toast.success(cat.active ? "تم تعطيل الفئة" : "تم تفعيل الفئة");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">إدارة الفئات</h1>
            <p className="text-sm text-slate-400 mt-0.5">إضافة وتعديل وحذف فئات المنتجات</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#81C784] hover:bg-[#66BB6A] text-slate-900 font-semibold rounded-xl text-sm transition-all"
          >
            <Plus size={16} />
            إضافة فئة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الفئات", value: categories.length, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "فئات نشطة", value: categories.filter((c) => c.active).length, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "فئات معطلة", value: categories.filter((c) => !c.active).length, color: "text-slate-400", bg: "bg-slate-400/10" },
            { label: "فئات بها منتجات", value: categories.filter((c) => (countMap[c.name] || 0) > 0).length, color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = countMap[cat.name] || 0;
            return (
              <div key={cat.id} className={`bg-slate-900 border rounded-xl p-4 transition-all ${cat.active ? "border-slate-700/50" : "border-slate-700/30 opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{cat.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{cat.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all" title="تعديل">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleToggle(cat)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all" title={cat.active ? "تعطيل" : "تفعيل"}>
                      {cat.active ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{cat.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-400">{count} منتج</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className={`text-xs font-medium ${cat.active ? "text-emerald-400" : "text-slate-500"}`}>
                      {cat.active ? "نشطة" : "معطلة"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-base font-bold text-white">{editId ? "تعديل الفئة" : "إضافة فئة جديدة"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">اسم الفئة (عربي) *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: أسمدة"
                    className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] transition-colors ${errors.name ? "border-red-500" : "border-slate-700"}`}
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">اسم الفئة (إنجليزي) *</label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="e.g. Fertilizers"
                    dir="ltr"
                    className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] transition-colors ${errors.nameEn ? "border-red-500" : "border-slate-700"}`}
                  />
                  {errors.nameEn && <p className="text-xs text-red-400 mt-1">{errors.nameEn}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">وصف الفئة (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر لهذه الفئة..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#81C784] transition-colors resize-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">الأيقونة</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === emoji ? "bg-[#81C784]/20 border-2 border-[#81C784]" : "bg-slate-800 border border-slate-700 hover:border-slate-500"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">اللون</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-110"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-white font-medium">حالة الفئة</p>
                  <p className="text-xs text-slate-400 mt-0.5">الفئات المعطلة لا تظهر للمستخدمين</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? "bg-[#81C784]" : "bg-slate-600"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-700">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-[#81C784] hover:bg-[#66BB6A] text-slate-900 font-semibold rounded-xl text-sm transition-all"
              >
                <Check size={15} />
                {editId ? "حفظ التعديلات" : "إضافة الفئة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-400 mb-5">هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-all">
                إلغاء
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-all">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
