import { Calendar, CheckCircle2, ClipboardList, Package, WalletCards } from "lucide-react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { trpc } from "@/lib/trpc";

interface VendorAnalyticsProps {
  vendorType?: "supplier" | "provider";
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Calendar; label: string; value: string | number; tone: string }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Icon className={`h-5 w-5 ${tone}`} /><p className="mt-5 text-2xl font-black text-[#263238]">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>;
}

export default function VendorAnalytics({ vendorType = "supplier" }: VendorAnalyticsProps) {
  const isSupplier = vendorType === "supplier";
  const ordersQuery = trpc.orders.vendorList.useQuery(undefined, { enabled: isSupplier, retry: false });
  const bookingsQuery = trpc.serviceBookings.providerMine.useQuery(undefined, { enabled: !isSupplier, retry: false });
  const orders = ordersQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const loading = isSupplier ? ordersQuery.isLoading : bookingsQuery.isLoading;
  const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);
  const pending = isSupplier ? orders.filter((order) => order.status === "pending").length : bookings.filter((booking) => booking.status === "requested").length;
  const completed = isSupplier ? orders.filter((order) => order.status === "delivered").length : bookings.filter((booking) => booking.status === "completed").length;

  return <div className="flex h-screen overflow-hidden bg-[#F5F1E8]" dir="rtl"><VendorSidebar vendorType={vendorType} /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><VendorHeader vendorType={vendorType} pageTitle="التحليلات" pageSubtitle="مؤشرات مبنية على السجلات الفعلية" /><main className="flex-1 overflow-y-auto p-4 sm:p-6"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-black text-[#263238]">ملخص الأداء</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">تُعرض هذه المؤشرات من الطلبات أو الحجوزات المسجلة فعلياً للحساب. لا توجد رسوم نمو أو زيارات أو تقديرات غير موثقة.</p>{loading ? <div className="mt-6 h-32 animate-pulse rounded-2xl bg-white" /> : <><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={isSupplier ? ClipboardList : Calendar} label={isSupplier ? "إجمالي الطلبات" : "إجمالي الحجوزات"} value={isSupplier ? orders.length : bookings.length} tone="text-[#2E7D32]" /><Metric icon={Package} label="قيد المراجعة" value={pending} tone="text-amber-600" /><Metric icon={CheckCircle2} label="مكتمل" value={completed} tone="text-sky-600" />{isSupplier ? <Metric icon={WalletCards} label="قيمة الطلبات المسجلة" value={`${totalOrderValue.toLocaleString("ar-SA")} ر.س`} tone="text-violet-600" /> : <Metric icon={WalletCards} label="الإيرادات" value="غير متاح" tone="text-violet-600" />}</section><section className="mt-6 rounded-2xl border border-dashed border-[#C9D8C6] bg-white p-6"><h2 className="font-black text-[#263238]">لا توجد تحليلات زمنية بعد</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">ستُضاف الرسوم والمؤشرات المتقدمة فقط عند توفر بيانات تشغيلية موثقة وإجراءات تحليلية مرتبطة بها.</p></section></>}</div></main></div></div>;
}
