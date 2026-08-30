// ===================================================
// Hasaad Platform — Live Vendor Order Fulfillment
// ===================================================
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock, Loader2, MapPin, Package, Search, Send, Star, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { trpc } from "@/lib/trpc";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof statuses)[number];

const statusLabels: Record<OrderStatus, string> = {
  pending: "انتظار التأكيد",
  confirmed: "مؤكد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-violet-50 text-violet-700 border-violet-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("ar-SA")} ر.س`;
const formatDate = (date: Date | null) => date ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) : "—";

export default function VendorOrders() {
  const utils = trpc.useUtils();
  const { data: orders = [], isLoading, error } = trpc.orders.vendorList.useQuery(undefined, { refetchInterval: 30_000 });
  const { data: cancellationNotifications = [] } = trpc.orders.vendorCancellationNotifications.list.useQuery(undefined, { refetchInterval: 30_000 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [note, setNote] = useState("");
  const [cancellationResponse, setCancellationResponse] = useState("");

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = search.trim().toLocaleLowerCase("ar-SA");
    const matchesSearch = !query || `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLocaleLowerCase("ar-SA").includes(query);
    return matchesSearch && (statusFilter === "all" || order.status === statusFilter);
  }), [orders, search, statusFilter]);

  useEffect(() => {
    if (!selectedOrder) return;
    setStatus(selectedOrder.status as OrderStatus);
    setTrackingNumber(selectedOrder.trackingNumber ?? "");
    setShippingProvider(selectedOrder.shippingProvider ?? "");
    setEstimatedDelivery(selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toISOString().slice(0, 10) : "");
    setNote("");
  }, [selectedOrder]);

  const updateTracking = trpc.orders.vendorUpdateTracking.useMutation({
    onSuccess: async (updatedOrder) => {
      await utils.orders.vendorList.invalidate();
      setSelectedOrderId(updatedOrder.id);
      toast.success("تم تحديث حالة الطلب", { description: "سيظهر التحديث فوراً للعميل في تتبع الطلب." });
    },
    onError: (mutationError) => toast.error("تعذر تحديث الطلب", { description: mutationError.message }),
  });
  const reviewCancellation = trpc.orders.vendorReviewCancellation.useMutation({
    onSuccess: async (updatedOrder) => {
      await Promise.all([utils.orders.vendorList.invalidate(), utils.orders.vendorCancellationNotifications.list.invalidate()]);
      setSelectedOrderId(updatedOrder.id);
      setCancellationResponse("");
      toast.success("تم إرسال قرار طلب الإلغاء للعميل");
    },
    onError: (mutationError) => toast.error("تعذر مراجعة طلب الإلغاء", { description: mutationError.message }),
  });
  const setCancellationNotificationRead = trpc.orders.vendorCancellationNotifications.setRead.useMutation({ onSuccess: () => utils.orders.vendorCancellationNotifications.list.invalidate() });

  const saveTracking = () => {
    if (!selectedOrder) return;
    updateTracking.mutate({
      orderId: selectedOrder.id,
      status,
      trackingNumber: trackingNumber.trim() || null,
      shippingProvider: shippingProvider.trim() || null,
      estimatedDelivery: estimatedDelivery ? new Date(`${estimatedDelivery}T12:00:00`) : null,
      note: note.trim() || null,
    });
  };

  const summary = [
    { label: "بانتظار التأكيد", value: orders.filter((order) => order.status === "pending").length, icon: Clock, color: "bg-amber-500" },
    { label: "قيد التجهيز", value: orders.filter((order) => order.status === "processing").length, icon: Package, color: "bg-violet-500" },
    { label: "في الشحن", value: orders.filter((order) => order.status === "shipped").length, icon: Truck, color: "bg-indigo-500" },
    { label: "تم تسليمها", value: orders.filter((order) => order.status === "delivered").length, icon: CheckCircle2, color: "bg-emerald-500" },
  ];
  const pendingCancellationNotifications = cancellationNotifications.filter((notification) => !notification.isRead);

  return (
    <div className="flex min-h-screen bg-[#F5F1E8]" dir="rtl">
      <VendorSidebar vendorType="supplier" />
      <div className="min-w-0 flex-1">
        <VendorHeader vendorType="supplier" pageTitle="إدارة الطلبات" pageSubtitle="حدّث التجهيز والشحن، وسيصل كل تحديث للعميل فوراً." />
        <main className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summary.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-xl ${item.color}`}><item.icon className="h-5 w-5 text-white" /></div><div><p className="text-2xl font-black text-[#263238]">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div></div>)}
          </div>

          {pendingCancellationNotifications.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white"><Bell className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-black text-amber-900">طلبات إلغاء بانتظار قرارك</p>{pendingCancellationNotifications.slice(0, 3).map((notification) => <button key={notification.id} onClick={() => { setSelectedOrderId(notification.orderId); setCancellationNotificationRead.mutate({ id: notification.id, isRead: true }); }} className="mt-1 block text-right text-sm text-amber-800 hover:underline">{notification.message}</button>)}</div></div></section>}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.72fr)]">
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="space-y-3 border-b border-gray-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"><Search className="h-4 w-4 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث برقم الطلب أو العميل..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none"><option value="all">جميع الحالات</option>{statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select>
                </div>
                <p className="text-xs text-gray-500">{filteredOrders.length} طلب حي</p>
              </div>

              {isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#2E7D32]" /></div> : error ? <div className="p-8 text-center text-sm text-red-600">تعذر تحميل الطلبات. تأكد من أن حسابك مرتبط بملف المورد.</div> : <div className="divide-y divide-gray-100">
                {filteredOrders.map((order) => <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`flex w-full items-start gap-3 px-4 py-4 text-right transition-colors hover:bg-[#F8FBF6] ${selectedOrderId === order.id ? "border-r-4 border-[#2E7D32] bg-[#F2F8F0]" : ""}`}>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF5E7] text-[#2E7D32]"><Package className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#263238]">{order.customerName}</p><p className="mt-0.5 font-mono text-xs text-gray-500">{order.orderNumber}</p></div><span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusStyles[order.status as OrderStatus]}`}>{statusLabels[order.status as OrderStatus]}</span></div><p className="mt-2 truncate text-xs text-gray-500">{order.items.map((item) => item.name).join("، ")}</p><div className="mt-2 flex items-center justify-between text-xs"><span className="font-bold text-[#2E7D32]">{formatMoney(order.total)}</span><span className="text-gray-400">{formatDate(order.createdAt)}</span></div></div>
                </button>)}
                {filteredOrders.length === 0 && <div className="p-12 text-center"><Package className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm text-gray-500">لا توجد طلبات مطابقة حالياً.</p></div>}
              </div>}
            </section>

            <aside className="min-h-[460px] rounded-2xl border border-gray-100 bg-white shadow-sm">
              {!selectedOrder ? <div className="grid h-full min-h-[460px] place-items-center p-8 text-center"><div><Truck className="mx-auto h-10 w-10 text-[#9AB59D]" /><h2 className="mt-4 font-black text-[#263238]">اختر طلباً لبدء المتابعة</h2><p className="mt-2 text-sm leading-6 text-gray-500">أضف رقم التتبع وحدّث الحالة ليظهر المسار للعميل.</p></div></div> : <div className="space-y-5 p-5">
                <div className="border-b border-gray-100 pb-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#5A866B]">طلب حي</p><h2 className="mt-1 font-black text-[#263238]">{selectedOrder.orderNumber}</h2></div><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[selectedOrder.status as OrderStatus]}`}>{statusLabels[selectedOrder.status as OrderStatus]}</span></div><div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm"><p className="font-bold text-[#263238]">{selectedOrder.customerName}</p><div className="mt-1 flex items-center gap-2 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" />{selectedOrder.deliveryAddress.city}، {selectedOrder.deliveryAddress.district}</div><p className="mt-1 text-xs text-gray-500">{selectedOrder.customerPhone}</p></div></div>

                {selectedOrder.deliveryRating ? <section className="rounded-2xl border border-[#D7E8D3] bg-[#F5FAF3] p-4" aria-label="تقييم العميل لتجربة التوصيل"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#254F30]">تقييم تجربة التوصيل</p><p className="mt-1 text-xs text-[#5A7860]">تقييم موثق من العميل بعد استلام الطلب</p></div><div className="flex items-center gap-1 text-[#D39B2A]" aria-label={`${selectedOrder.deliveryRating.rating} من 5 نجوم`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4" fill={index < selectedOrder.deliveryRating!.rating ? "currentColor" : "none"} />)}<span className="mr-1 text-sm font-black text-[#315F3A]">{selectedOrder.deliveryRating.rating}/5</span></div></div>{selectedOrder.deliveryRating.comment ? <p className="mt-3 rounded-xl border border-[#E0ECDD] bg-white px-3 py-2.5 text-sm leading-6 text-gray-700">{selectedOrder.deliveryRating.comment}</p> : <p className="mt-3 text-xs text-[#5A7860]">لم يترك العميل تعليقاً نصياً.</p>}<p className="mt-3 text-[11px] text-gray-400">أُرسل في {formatDate(selectedOrder.deliveryRating.createdAt)}</p></section> : selectedOrder.status === "delivered" ? <section className="rounded-2xl border border-dashed border-[#D7E8D3] bg-[#FAFDF9] p-4 text-center"><Star className="mx-auto h-5 w-5 text-[#9AB59D]" /><p className="mt-2 text-sm font-bold text-[#4D6653]">لم يصل تقييم تجربة التوصيل بعد</p><p className="mt-1 text-xs text-gray-500">سيظهر هنا عند إرسال العميل تقييمه لهذا الطلب المستلم.</p></section> : null}

                {selectedOrder.cancellationStatus === "requested" && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-black text-amber-900">طلب إلغاء من العميل</p><p className="mt-2 text-xs leading-6 text-amber-800"><span className="font-bold">السبب: </span>{selectedOrder.cancellationReason}</p><label className="mt-3 block text-xs font-bold text-amber-900">رد المورد (اختياري)<textarea value={cancellationResponse} onChange={(event) => setCancellationResponse(event.target.value)} placeholder="اكتب توضيحاً للعميل" className="mt-1.5 min-h-18 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-normal outline-none" /></label><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={reviewCancellation.isPending} onClick={() => reviewCancellation.mutate({ orderId: selectedOrder.id, approve: false, response: cancellationResponse.trim() || null })} className="rounded-xl border border-amber-300 bg-white py-2.5 text-xs font-bold text-amber-800 disabled:opacity-50">رفض الطلب</button><button type="button" disabled={reviewCancellation.isPending} onClick={() => reviewCancellation.mutate({ orderId: selectedOrder.id, approve: true, response: cancellationResponse.trim() || null })} className="rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white disabled:opacity-50">{reviewCancellation.isPending ? "جارٍ الحفظ..." : "الموافقة على الإلغاء"}</button></div></section>}

                <div><p className="mb-2 text-sm font-black text-[#263238]">تحديث الشحن والحالة</p><div className="grid grid-cols-2 gap-2">{statuses.map((item) => <button type="button" key={item} disabled={selectedOrder.cancellationStatus === "requested"} onClick={() => setStatus(item)} className={`rounded-xl px-2 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${status === item ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{statusLabels[item]}</button>)}</div></div>
                <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-gray-600">شركة الشحن<input list="shipping-provider-options" value={shippingProvider} onChange={(event) => setShippingProvider(event.target.value)} placeholder="مثال: سمسا" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /><datalist id="shipping-provider-options"><option value="SPL" /><option value="أرامكس" /><option value="سمسا" /><option value="ناقل" /><option value="DHL" /></datalist></label><label className="text-xs font-bold text-gray-600">رقم التتبع{status === "shipped" && <span className="text-red-500"> *</span>}<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="رقم بوليصة الشحن" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /></label></div>
                <label className="block text-xs font-bold text-gray-600">موعد التوصيل المتوقع<input type="date" value={estimatedDelivery} onChange={(event) => setEstimatedDelivery(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /></label>
                <label className="block text-xs font-bold text-gray-600">ملاحظة للعميل<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="مثال: تم تسليم الشحنة لشركة النقل اليوم" className="mt-1.5 min-h-20 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /></label>
                <button type="button" disabled={updateTracking.isPending || selectedOrder.cancellationStatus === "requested"} onClick={saveTracking} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] py-3 text-sm font-black text-white disabled:opacity-60">{updateTracking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{selectedOrder.cancellationStatus === "requested" ? "راجع طلب الإلغاء أولاً" : updateTracking.isPending ? "جارٍ الحفظ..." : "حفظ التحديث وإشعار العميل"}</button>

                <div className="border-t border-gray-100 pt-4"><p className="mb-3 text-sm font-black text-[#263238]">سجل التتبع</p><div className="space-y-3">{selectedOrder.trackingEvents.map((event) => <div key={event.id} className="flex gap-3"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2E7D32]" /><div><p className="text-xs font-bold text-[#263238]">{event.title}</p><p className="mt-0.5 text-xs leading-5 text-gray-500">{event.message}</p><p className="mt-1 text-[10px] text-gray-400">{formatDate(event.createdAt)}</p></div></div>)}</div></div>
              </div>}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
