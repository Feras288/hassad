/*
 * Hasaad Platform — Admin supplier account linking.
 * Explicitly protects system administrators from being converted into supplier accounts.
 */
import { useState } from "react";
import { Link2, ShieldCheck, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";

export default function AdminVendorAccountLinks() {
  const utils = trpc.useUtils();
  const accountsQuery = trpc.vendorAccounts.adminList.useQuery();
  const vendorsQuery = trpc.adminManagement.vendors.list.useQuery(undefined, { retry: false });
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const linkMutation = trpc.vendorAccounts.link.useMutation({
    onSuccess: () => { utils.vendorAccounts.adminList.invalidate(); toast.success("تم ربط حساب المورد بنجاح"); },
    onError: () => toast.error("تعذر ربط الحساب"),
  });
  const suppliers = (vendorsQuery.data ?? []).filter((vendor) => vendor.type === "supplier" && vendor.status === "active");

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8" dir="rtl">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7"><div className="flex items-center gap-2 text-emerald-400"><Link2 className="h-4 w-4" /><span className="text-xs font-black">إدارة صلاحيات الموردين</span></div><h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">ربط حسابات الموردين</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">اربط حساب المورد بملفه المعتمد ليتمكن من الرد على أسئلة المزارعين الخاصة بمنتجاته فقط.</p></div>
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100"><ShieldCheck className="ml-2 inline h-4 w-4" />لا تظهر أسئلة المنتج إلا للمورد المرتبط بمعرّف المورد المطابق في الكتالوج.</div>
          {accountsQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-900" />)}</div> : <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="hidden grid-cols-[1.2fr_1.2fr_1.5fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-bold text-slate-500 md:grid"><span>الحساب</span><span>البريد الإلكتروني</span><span>ملف المورد</span><span /></div>
            {(accountsQuery.data ?? []).map((account) => {
              const isAdmin = account.role === "admin";
              const selectedVendorId = assignments[account.id] ?? account.vendorId ?? "";
              return <div key={account.id} className="grid gap-3 border-b border-slate-800 px-4 py-4 last:border-0 md:grid-cols-[1.2fr_1.2fr_1.5fr_auto] md:items-center md:gap-4 md:px-5"><div><p className="flex items-center gap-2 text-sm font-black text-white"><UserRoundCheck className="h-4 w-4 text-emerald-400" />{account.name || "حساب بلا اسم"}</p><p className="mt-1 text-xs text-slate-500">الدور: {account.role === "vendor" ? "مورد" : isAdmin ? "مدير" : "مستخدم"}</p></div><p className="text-sm text-slate-300">{account.email || "—"}</p>{isAdmin ? <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-500">حساب مدير النظام محمي</div> : <select value={selectedVendorId} onChange={(event) => setAssignments((previous) => ({ ...previous, [account.id]: event.target.value }))} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"><option value="">اختر مورداً معتمداً</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} — {supplier.category}</option>)}</select>}{isAdmin ? <span className="text-center text-xs font-bold text-slate-500">محمي</span> : <button disabled={linkMutation.isPending || !selectedVendorId} onClick={() => linkMutation.mutate({ userId: account.id, vendorId: selectedVendorId })} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-slate-950 disabled:opacity-50">ربط الحساب</button>}</div>;
            })}
          </div>}
        </div>
      </div>
    </AdminLayout>
  );
}
