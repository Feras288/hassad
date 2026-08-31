import { useMemo, useState } from "react";
import { Edit3, Plus, Search, ShieldCheck, UserRound, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type UserForm = { name: string; email: string; role: "user" | "vendor" | "admin"; vendorId: string };
const emptyForm: UserForm = { name: "", email: "", role: "user", vendorId: "" };

const roleLabels: Record<UserForm["role"], string> = { user: "عميل", vendor: "مورد", admin: "مدير" };
const languageLabels = { ar: "العربية", en: "English" } as const;

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const usersQuery = trpc.adminManagement.users.list.useQuery();
  const vendorsQuery = trpc.adminManagement.vendors.list.useQuery();
  const createUser = trpc.adminManagement.users.create.useMutation({ onSuccess: () => utils.adminManagement.users.list.invalidate() });
  const updateUser = trpc.adminManagement.users.update.useMutation({ onSuccess: () => utils.adminManagement.users.list.invalidate() });
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const users = useMemo(() => (usersQuery.data ?? []).filter((user) => `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase().includes(search.toLowerCase())), [usersQuery.data, search]);
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (user: NonNullable<typeof usersQuery.data>[number]) => {
    setEditingId(user.id);
    setForm({ name: user.name ?? "", email: user.email ?? "", role: user.role, vendorId: user.vendorId ?? "" });
    setShowModal(true);
  };
  const save = async () => {
    if (form.name.trim().length < 2 || !form.email.includes("@")) { toast.error("أدخل الاسم والبريد الإلكتروني الصحيحين"); return; }
    if (form.role === "vendor" && !form.vendorId) { toast.error("اختر ملف المورد المرتبط بالحساب"); return; }
    try {
      if (editingId) await updateUser.mutateAsync({ id: editingId, updates: { name: form.name.trim(), email: form.email.trim(), role: form.role, vendorId: form.vendorId || null } });
      else await createUser.mutateAsync({ name: form.name.trim(), email: form.email.trim(), role: form.role, vendorId: form.vendorId || null });
      toast.success(editingId ? "تم تعديل بيانات المستخدم" : "تمت إضافة المستخدم كسجل دعوة");
      setShowModal(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ المستخدم"); }
  };

  return <AdminLayout>
    <div className="p-6 space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-4"><div><h1 className="text-xl font-bold text-white">إدارة المستخدمين</h1><p className="text-sm text-slate-400 mt-0.5">إضافة وتعديل حسابات العملاء والموردين والمديرين</p></div><button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#81C784] px-4 py-2 text-sm font-bold text-slate-900 hover:bg-[#A5D6A7]"><Plus size={16}/>إضافة مستخدم</button></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4"><p className="text-xs text-slate-400">إجمالي السجلات</p><p className="mt-1 text-2xl font-black text-white">{usersQuery.data?.length ?? 0}</p></div><div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4"><p className="text-xs text-slate-400">الموردون</p><p className="mt-1 text-2xl font-black text-emerald-400">{usersQuery.data?.filter((user) => user.role === "vendor").length ?? 0}</p></div><div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4"><p className="text-xs text-slate-400">المديرون</p><p className="mt-1 text-2xl font-black text-blue-400">{usersQuery.data?.filter((user) => user.role === "admin").length ?? 0}</p></div></div>
      <div className="relative max-w-lg"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو البريد..." className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pr-9 pl-3 text-sm text-white placeholder-slate-500 focus:border-[#81C784] focus:outline-none"/></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-slate-700/60 text-right text-xs text-slate-400"><th className="px-4 py-3">المستخدم</th><th className="px-4 py-3">الدور</th><th className="px-4 py-3">اللغة المفضلة</th><th className="px-4 py-3">المورد المرتبط</th><th className="px-4 py-3">تاريخ التسجيل</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/40"><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[#A5D6A7]">{user.role === "admin" ? <ShieldCheck size={15}/> : <UserRound size={15}/>}</span><div><p className="font-semibold text-white">{user.name || "بدون اسم"}</p><p className="text-xs text-slate-500">{user.email || "—"}</p></div></div></td><td className="px-4 py-3"><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{roleLabels[user.role]}</span></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${user.preferredLanguage === "en" ? "bg-blue-500/10 text-blue-300" : "bg-emerald-500/10 text-emerald-300"}`}>{languageLabels[user.preferredLanguage ?? "ar"]}</span></td><td className="px-4 py-3 text-xs text-slate-400">{vendorsQuery.data?.find((vendor) => vendor.id === user.vendorId)?.name ?? "—"}</td><td className="px-4 py-3 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString("ar-SA")}</td><td className="px-4 py-3"><button onClick={() => openEdit(user)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#A5D6A7] hover:bg-[#81C784]/10"><Edit3 size={13}/>تعديل</button></td></tr>)}</tbody></table>{users.length === 0 && <div className="py-12 text-center text-sm text-slate-500">لا توجد حسابات مطابقة</div>}</div>
    </div>
    {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-700 p-5"><h2 className="font-bold text-white">{editingId ? "تعديل المستخدم" : "إضافة مستخدم"}</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button></div><div className="space-y-4 p-5"><label className="block text-xs text-slate-400">الاسم<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-[#81C784] focus:outline-none"/></label><label className="block text-xs text-slate-400">البريد الإلكتروني<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-[#81C784] focus:outline-none"/></label><label className="block text-xs text-slate-400">الدور<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserForm["role"], vendorId: event.target.value === "vendor" ? form.vendorId : "" })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-[#81C784] focus:outline-none"><option value="user">عميل</option><option value="vendor">مورد</option><option value="admin">مدير</option></select></label>{form.role === "vendor" && <label className="block text-xs text-slate-400">ملف المورد<select value={form.vendorId} onChange={(event) => setForm({ ...form, vendorId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-[#81C784] focus:outline-none"><option value="">اختر المورد</option>{(vendorsQuery.data ?? []).map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>}<p className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs text-blue-300">تُنشأ الحسابات الجديدة كسجلات دعوة، ويرتبط الدخول لاحقاً عبر حساب المنصة.</p></div><div className="flex gap-3 border-t border-slate-700 p-5"><button onClick={() => setShowModal(false)} className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm text-slate-300">إلغاء</button><button onClick={save} disabled={createUser.isPending || updateUser.isPending} className="flex-1 rounded-xl bg-[#81C784] py-2.5 text-sm font-bold text-slate-900 disabled:opacity-60">{createUser.isPending || updateUser.isPending ? "جارٍ الحفظ..." : "حفظ"}</button></div></div></div>}
  </AdminLayout>;
}
