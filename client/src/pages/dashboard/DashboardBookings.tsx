import { CalendarDays, CheckCircle2, Clock3, Loader2, MapPin, MessageCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { trpc } from "@/lib/trpc";

const statusMeta = {
  requested: { label: "بانتظار تأكيد مقدم الخدمة", className: "bg-amber-50 text-amber-800 border-amber-200", icon: Clock3 },
  confirmed: { label: "تم تأكيد الموعد", className: "bg-blue-50 text-blue-800 border-blue-200", icon: CheckCircle2 },
  completed: { label: "اكتملت الخدمة", className: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "ملغي", className: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle },
  declined: { label: "اعتذر مقدم الخدمة", className: "bg-red-50 text-red-800 border-red-200", icon: XCircle },
} as const;

export default function DashboardBookings() {
  const utils = trpc.useUtils();
  const { data: bookings = [], isLoading, error } = trpc.serviceBookings.mine.useQuery(undefined, { refetchInterval: 30_000 });
  const cancelBooking = trpc.serviceBookings.cancel.useMutation({
    onSuccess: async () => {
      await utils.serviceBookings.mine.invalidate();
      toast.success("تم إلغاء طلب الحجز");
    },
    onError: (mutationError) => toast.error("تعذر إلغاء الحجز", { description: mutationError.message }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#2E7D32]">خدماتي الزراعية</p>
            <h1 className="mt-1 text-2xl font-black text-[#263238]">الحجوزات والمواعيد</h1>
            <p className="mt-1 text-sm text-gray-500">تابع حالة موعدك وتفاصيل الخدمة من مكان واحد.</p>
          </div>
          <Link href="/booking" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2E7D32] px-4 text-sm font-bold text-white">حجز خدمة جديدة</Link>
        </header>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">تعذر تحميل الحجوزات: {error.message}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2E7D32]/30 bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-[#2E7D32]" />
            <h2 className="mt-3 text-lg font-black text-[#263238]">لا توجد حجوزات حتى الآن</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">اختر مقدم خدمة وخدمة مناسبة لتُحفظ تفاصيل الموعد هنا عند تأكيد طلبك.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {bookings.map((booking) => {
              const meta = statusMeta[booking.status];
              const StatusIcon = meta.icon;
              return (
                <article key={booking.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {booking.providerAvatar ? <img src={booking.providerAvatar} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 font-black text-[#2E7D32]">خ</div>}
                      <div className="min-w-0">
                        <h2 className="truncate font-black text-[#263238]">{booking.serviceName}</h2>
                        <p className="mt-0.5 truncate text-sm text-gray-500">{booking.providerName} · {booking.packageName}</p>
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</span>
                  </div>
                  <div className="mt-4 grid gap-2 rounded-xl bg-[#F8FAF7] p-3 text-sm text-gray-600">
                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#2E7D32]" />{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.scheduledAt))}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#2E7D32]" />{booking.location}</span>
                  </div>
                  {booking.providerNote && <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">ملاحظة مقدم الخدمة: {booking.providerNote}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/dashboard/messages?provider=${encodeURIComponent(booking.providerId)}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#2E7D32]/30 px-3 text-sm font-bold text-[#2E7D32]"><MessageCircle className="h-4 w-4" />مراسلة مقدم الخدمة</Link>
                    {booking.status === "requested" && <button onClick={() => cancelBooking.mutate({ bookingId: booking.id })} disabled={cancelBooking.isPending} className="min-h-10 rounded-xl px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">إلغاء الطلب</button>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
