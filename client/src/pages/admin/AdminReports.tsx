import { Link } from "wouter";
import { BarChart3, ClipboardList, Package, Store, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";

const reportCards = [
  { key: "users", label: "المستخدمون", href: "/admin/users", icon: Users, tone: "text-sky-300" },
  { key: "vendors", label: "الموردون", href: "/admin/vendors", icon: Store, tone: "text-amber-300" },
  { key: "products", label: "المنتجات", href: "/admin/products", icon: Package, tone: "text-emerald-300" },
  { key: "orders", label: "الطلبات", href: "/admin/orders", icon: ClipboardList, tone: "text-violet-300" },
] as const;

export default function AdminReports() {
  const usersQuery = trpc.adminManagement.users.list.useQuery(undefined, { retry: false });
  const vendorsQuery = trpc.adminManagement.vendors.list.useQuery(undefined, { retry: false });
  const productsQuery = trpc.products.adminList.useQuery(undefined, { retry: false });
  const ordersQuery = trpc.orders.adminList.useQuery(undefined, { retry: false });
  const values = { users: usersQuery.data?.length ?? 0, vendors: vendorsQuery.data?.length ?? 0, products: productsQuery.data?.length ?? 0, orders: ordersQuery.data?.length ?? 0 };
  const loading = [usersQuery, vendorsQuery, productsQuery, ordersQuery].some((query) => query.isLoading);

  return <AdminLayout><main className="min-h-full bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8" dir="rtl"><div className="mx-auto max-w-6xl"><div className="mb-8"><div className="flex items-center gap-2 text-emerald-300"><BarChart3 className="h-4 w-4" /><span className="text-xs font-black">تقارير تشغيلية</span></div><h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">تقارير المنصة</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">تُحسب هذه المؤشرات من السجلات الحية المتاحة فقط. لا تعرض هذه الصفحة إيرادات أو نمواً أو تحليلات تقديرية.</p></div>{loading ? <p className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">جارٍ تحميل البيانات الحية…</p> : <><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{reportCards.map(({ key, label, href, icon: Icon, tone }) => <Link key={key} href={href} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-600"><Icon className={`h-5 w-5 ${tone}`} /><p className="mt-6 text-3xl font-black text-white">{values[key].toLocaleString("ar-SA")}</p><p className="mt-1 text-sm font-bold text-slate-300">{label}</p></Link>)}</section><section className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6"><h2 className="font-black text-white">التحليلات المتقدمة</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">لا تتوفر بيانات زمنية معتمدة بعد لإنشاء رسوم الإيرادات أو نمو المستخدمين أو أداء الفئات. ستظهر هذه التقارير عند تسجيل بيانات تشغيلية كافية وإضافة إجراءات تحليلية موثقة.</p></section></>}</div></main></AdminLayout>;
}
