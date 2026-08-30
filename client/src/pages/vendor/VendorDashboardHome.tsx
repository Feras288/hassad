import { Link } from "wouter";
import { Calendar, CheckCircle2, ClipboardList, Package, WalletCards } from "lucide-react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorDailyQuestionSummary from "@/components/vendor/VendorDailyQuestionSummary";
import { trpc } from "@/lib/trpc";

interface VendorDashboardHomeProps {
  vendorType: "supplier" | "provider";
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Calendar; label: string; value: string | number; tone: string }) {
  return <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Icon className={`h-5 w-5 ${tone}`} /><p className="mt-5 text-2xl font-black text-[#263238]">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></article>;
}

export default function VendorDashboardHome({ vendorType }: VendorDashboardHomeProps) {
  const ordersQuery = trpc.orders.vendorList.useQuery(undefined, { enabled: vendorType === "supplier", retry: false });
  const bookingsQuery = trpc.serviceBookings.providerMine.useQuery(undefined, { enabled: vendorType === "provider", retry: false });
  const isSupplier = vendorType === "supplier";
  const orders = ordersQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const recordCount = isSupplier ? orders.length : bookings.length;
  const loading = isSupplier ? ordersQuery.isLoading : bookingsQuery.isLoading;
  const pendingCount = isSupplier ? orders.filter((order) => order.status === "pending").length : bookings.filter((booking) => booking.status === "requested").length;
  const completedCount = isSupplier ? orders.filter((order) => order.status === "delivered").length : bookings.filter((booking) => booking.status === "completed").length;
  const orderValue = orders.reduce((sum, order) => sum + order.total, 0);

  const recentRecords = isSupplier ? (
    orders.slice(0, 6).map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-bold text-[#263238]">{order.orderNumber}</p><p className="mt-1 text-xs text-gray-500">{order.customerName} · {order.vendorName}</p></div><div className="text-left"><p className="font-bold text-[#2E7D32]">{order.total.toLocaleString("ar-SA")} ر.س</p><p className="mt-1 text-xs text-gray-500">{order.status}</p></div></div>)
  ) : (
    bookings.slice(0, 6).map((booking) => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-bold text-[#263238]">{booking.serviceName}</p><p className="mt-1 text-xs text-gray-500">{booking.contactName} · {new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(booking.scheduledAt))}</p></div><p className="text-sm font-bold text-[#2E7D32]">{booking.status}</p></div>)
  );

  return <div className="flex h-screen overflow-hidden bg-[#F5F1E8]" dir="rtl"><VendorSidebar vendorType={vendorType} /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><VendorHeader vendorType={vendorType} pageTitle="لوحة التحكم" pageSubtitle={`سجلات ${isSupplier ? "الطلبات" : "الحجوزات"} الفعلية لحسابك`} /><main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"><div className="flex flex-wrap gap-3"><Link href={isSupplier ? "/vendor/products/new" : "/vendor/services/new"} className="rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-bold text-white">{isSupplier ? "إضافة منتج" : "إضافة خدمة"}</Link><Link href={isSupplier ? "/vendor/orders" : "/vendor/bookings"} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#263238]">{isSupplier ? "إدارة الطلبات" : "إدارة الحجوزات"}</Link></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={isSupplier ? ClipboardList : Calendar} label={isSupplier ? "إجمالي الطلبات" : "إجمالي الحجوزات"} value={recordCount} tone="text-[#2E7D32]" /><Metric icon={Package} label="بانتظار المراجعة" value={pendingCount} tone="text-amber-600" /><Metric icon={CheckCircle2} label="مكتمل" value={completedCount} tone="text-sky-600" />{isSupplier ? <Metric icon={WalletCards} label="قيمة الطلبات المسجلة" value={`${orderValue.toLocaleString("ar-SA")} ر.س`} tone="text-violet-600" /> : <Metric icon={WalletCards} label="الإيرادات" value="غير متاح" tone="text-violet-600" />}</section>{isSupplier && <VendorDailyQuestionSummary />}{loading ? <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">جارٍ تحميل سجلات الحساب…</p> : <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><header className="flex items-center justify-between border-b border-gray-100 p-5"><h2 className="font-black text-[#263238]">أحدث {isSupplier ? "الطلبات" : "الحجوزات"}</h2><Link href={isSupplier ? "/vendor/orders" : "/vendor/bookings"} className="text-sm font-bold text-[#2E7D32]">عرض الكل</Link></header>{recordCount === 0 ? <div className="p-8 text-center"><p className="font-bold text-[#263238]">لا توجد {isSupplier ? "طلبات" : "حجوزات"} مسجلة بعد</p><p className="mt-2 text-sm text-gray-500">ستظهر السجلات هنا عند إنشائها فعلياً من العملاء.</p></div> : <div className="divide-y divide-gray-100">{recentRecords}</div>}</section>}<section className="rounded-2xl border border-dashed border-[#C9D8C6] bg-white p-5"><h2 className="font-black text-[#263238]">التحليلات</h2><p className="mt-2 text-sm leading-7 text-gray-600">لا تعرض هذه اللوحة نمواً أو زيارات أو رسوماً بيانية حتى تتوفر بيانات تشغيلية موثقة وإجراءات تحليلية مرتبطة بها.</p></section></main></div></div>;
}
