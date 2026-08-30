import { CalendarCheck, CheckCircle2, Clock3, Loader2, MapPin, Phone, XCircle } from "lucide-react";
import { toast } from "sonner";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import { trpc } from "@/lib/trpc";

const statusMeta = {
  requested: { label: "طلب جديد", className: "bg-amber-50 text-amber-800 border-amber-200" },
  confirmed: { label: "موعد مؤكد", className: "bg-blue-50 text-blue-800 border-blue-200" },
  completed: { label: "مكتمل", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  cancelled: { label: "ألغي من العميل", className: "bg-gray-100 text-gray-700 border-gray-200" },
  declined: { label: "تم الاعتذار", className: "bg-red-50 text-red-800 border-red-200" },
} as const;

export default function ProviderBookings() {
  const utils = trpc.useUtils();
  const { data: bookings = [], isLoading, error } = trpc.serviceBookings.providerMine.useQuery(undefined, { refetchInterval: 30_000 });
  const updateBooking = trpc.serviceBookings.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.serviceBookings.providerMine.invalidate();
      toast.success("تم تحديث حالة الموعد");
    },
    onError: (mutationError) => toast.error("تعذر تحديث الموعد", { description: mutationError.message }),
  });

  const updateStatus = (bookingId: string, status: "confirmed" | "completed" | "declined") => updateBooking.mutate({ bookingId, status, providerNote: null });

  return (
    <div className="min-h-screen bg-[#F7F8F4]" dir="rtl">
      <VendorSidebar vendorType="provider" />
      <main className="lg:mr-64">
        <VendorHeader vendorType="provider" pageTitle="الحجوزات" pageSubtitle="راجع المواعيد المؤكدة والطلبات الجديدة" />
        <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-bold text-[#2E7D32]">إدارة المواعيد</p><h1 className="mt-1 text-2xl font-black text-[#263238]">طلبات الحجز</h1></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-gray-600 shadow-sm"><CalendarCheck className="h-4 w-4 text-[#2E7D32]" />{bookings.length} موعد</span>
          </div>
          {isLoading ? <div className="grid gap-4 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-white" />)}</div> : error ? <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">تعذر تحميل الحجوزات: {error.message}</div> : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2E7D32]/30 bg-white p-12 text-center"><CalendarCheck className="mx-auto h-10 w-10 text-[#2E7D32]" /><h2 className="mt-3 text-lg font-black text-[#263238]">لا توجد طلبات حجز حالياً</h2><p className="mt-2 text-sm text-gray-500">ستظهر هنا طلبات العملاء عند حجز خدماتك.</p></div>
          ) : <div className="grid gap-4 lg:grid-cols-2">{bookings.map((booking) => {
            const meta = statusMeta[booking.status];
            return <article key={booking.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-[#263238]">{booking.serviceName}</h2><p className="mt-1 text-sm text-gray-500">{booking.packageName} · {booking.contactName}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span></div>
              <div className="mt-4 space-y-2 rounded-xl bg-[#F8FAF7] p-3 text-sm text-gray-600"><p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#2E7D32]" />{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.scheduledAt))}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#2E7D32]" />{booking.location}</p><a href={`tel:${booking.contactPhone}`} className="flex items-center gap-2 font-bold text-[#2E7D32]"><Phone className="h-4 w-4" />{booking.contactPhone}</a></div>
              {booking.notes && <p className="mt-3 text-sm leading-6 text-gray-600">ملاحظات العميل: {booking.notes}</p>}
              {booking.status === "requested" && <div className="mt-4 flex gap-2"><button onClick={() => updateStatus(booking.id, "confirmed")} disabled={updateBooking.isPending} className="min-h-10 rounded-xl bg-[#2E7D32] px-3 text-sm font-bold text-white disabled:opacity-50">تأكيد الموعد</button><button onClick={() => updateStatus(booking.id, "declined")} disabled={updateBooking.isPending} className="min-h-10 rounded-xl px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">اعتذار</button></div>}
              {booking.status === "confirmed" && <button onClick={() => updateStatus(booking.id, "completed")} disabled={updateBooking.isPending} className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-300 px-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />تأكيد إتمام الخدمة</button>}
            </article>;
          })}</div>}
        </div>
      </main>
    </div>
  );
}
