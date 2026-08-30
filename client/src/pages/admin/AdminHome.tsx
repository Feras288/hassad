/**
 * HASAAD PLATFORM — AdminHome
 * Live operational overview driven by the same records managed in the admin panel.
 */
import { Link } from "wouter";
import { AlertTriangle, Box, ClipboardList, FileQuestion, Inbox, Package, Store, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";

function LiveCard({ label, value, hint, href, icon: Icon, tone }: { label: string; value: number; hint: string; href: string; icon: typeof Users; tone: string }) {
  return <Link href={href} className="group rounded-2xl border border-slate-700/50 bg-slate-900 p-5 transition-colors hover:border-[#81C784]/50 hover:bg-slate-800/80">
    <div className="flex items-start justify-between gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><span className="text-2xl font-bold text-white">{value.toLocaleString("ar-SA")}</span></div>
    <p className="mt-4 text-sm font-bold text-slate-100 group-hover:text-[#9ADB9D]">{label}</p><p className="mt-1 text-xs text-slate-500">{hint}</p>
  </Link>;
}

export default function AdminHome() {
  const usersQuery = trpc.adminManagement.users.list.useQuery(undefined, { retry: false });
  const vendorsQuery = trpc.adminManagement.vendors.list.useQuery(undefined, { retry: false });
  const productsQuery = trpc.products.adminList.useQuery(undefined, { retry: false });
  const categoriesQuery = trpc.adminManagement.categories.list.useQuery(undefined, { retry: false });
  const inquiriesQuery = trpc.contactInquiries.adminList.useQuery(undefined, { retry: false });
  const requestsQuery = trpc.productAvailabilityRequests.adminList.useQuery(undefined, { retry: false });

  const users = usersQuery.data ?? [];
  const vendors = vendorsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const inquiries = inquiriesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const loading = [usersQuery, vendorsQuery, productsQuery, categoriesQuery, inquiriesQuery, requestsQuery].some((query) => query.isLoading);
  const pendingVendors = vendors.filter((vendor) => vendor.status === "pending").length;
  const pendingProducts = products.filter((product) => product.status === "pending_review").length;
  const openInquiries = inquiries.filter((inquiry) => inquiry.status === "new" || inquiry.status === "in_progress").length;
  const openRequests = requests.filter((request) => request.status === "new" || request.status === "contacted").length;

  return <AdminLayout><div className="space-y-6 p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-xl font-bold text-white">لوحة التحكم الرئيسية</h1><p className="mt-1 text-sm text-slate-400">ملخص مباشر لسجلات المنصة التي تديرها من هذه اللوحة.</p></div>{loading && <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-400">جارٍ تحديث البيانات…</span>}</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <LiveCard label="المستخدمون" value={users.length} hint="إدارة وإضافة الحسابات" href="/admin/users" icon={Users} tone="bg-blue-400/10 text-blue-300" />
      <LiveCard label="الموردون والبائعون" value={vendors.length} hint={`${pendingVendors} بانتظار المراجعة`} href="/admin/vendors" icon={Store} tone="bg-amber-400/10 text-amber-300" />
      <LiveCard label="منتجات الكتالوج" value={products.length} hint={`${pendingProducts} بانتظار المراجعة`} href="/admin/products" icon={Package} tone="bg-purple-400/10 text-purple-300" />
      <LiveCard label="الفئات" value={categories.length} hint="إضافة وتحرير وتنشيط الفئات" href="/admin/categories" icon={Box} tone="bg-emerald-400/10 text-emerald-300" />
      <LiveCard label="استفسارات التواصل" value={openInquiries} hint="تحتاج متابعة أو رداً" href="/admin/contact-inquiries" icon={Inbox} tone="bg-sky-400/10 text-sky-300" />
      <LiveCard label="طلبات التوفير" value={openRequests} hint="طلبات منتجات قيد المتابعة" href="/admin/product-requests" icon={FileQuestion} tone="bg-rose-400/10 text-rose-300" />
    </div>
    <div className="grid gap-4 lg:grid-cols-2"><section className="rounded-2xl border border-slate-700/50 bg-slate-900 p-5"><div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-[#81C784]" /><h2 className="font-bold text-white">بدء إدارة البيانات</h2></div><p className="mt-2 text-sm leading-7 text-slate-400">ابدأ بإضافة مورد مسجل، ثم أضف منتجاً مرتبطاً به وحدد وحدة البيع والمخزون. بعد اعتماد المنتج يظهر مباشرة في الكتالوج العام.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/admin/vendors" className="rounded-lg bg-[#81C784] px-3 py-2 text-xs font-bold text-slate-950">إضافة مورد</Link><Link href="/admin/products" className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200">إضافة منتج</Link><Link href="/admin/categories" className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200">إدارة الفئات</Link></div></section><section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-300" /><h2 className="font-bold text-white">إجراءات تحتاج مراجعة</h2></div><p className="mt-2 text-sm leading-7 text-slate-400">المؤشرات هنا تُحسب من الطلبات الحية؛ لا تُعرض إيرادات أو طلبات افتراضية حتى تتوافر سجلات فعلية.</p><div className="mt-4 grid grid-cols-2 gap-3"><Link href="/admin/vendors" className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-center"><p className="text-lg font-bold text-amber-300">{pendingVendors}</p><p className="text-[11px] text-slate-500">موردون معلقون</p></Link><Link href="/admin/products" className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-center"><p className="text-lg font-bold text-purple-300">{pendingProducts}</p><p className="text-[11px] text-slate-500">منتجات للمراجعة</p></Link></div></section></div>
  </div></AdminLayout>;
}
