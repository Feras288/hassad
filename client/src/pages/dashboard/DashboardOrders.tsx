// ================================================================
// HASAAD PLATFORM — Live Customer Order Tracking
// ================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Loader2, MapPin, Package, Search, ShoppingBag, ShoppingCart, Star, Truck, XCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getShipmentTrackingUrl } from "@/lib/shipmentTracking";
import { trpc } from "@/lib/trpc";

const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const statusMeta: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "بانتظار التأكيد", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "مؤكد", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  processing: { label: "قيد التجهيز", color: "bg-violet-50 text-violet-700 border-violet-200", icon: Package },
  shipped: { label: "في الطريق", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Truck },
  delivered: { label: "تم التوصيل", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const formatMoney = (amount: number) => `${amount.toLocaleString("ar-SA")} ريال`;
const formatDate = (date: Date | null) => date ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) : "—";

export default function DashboardOrders() {
  const utils = trpc.useUtils();
  const { data: orders = [], isLoading, error } = trpc.orders.mine.useQuery(undefined, { refetchInterval: 30_000 });
  const { data: notifications = [] } = trpc.orders.notifications.mine.useQuery(undefined, { refetchInterval: 30_000 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellationOrderId, setCancellationOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState("");
  const announcedNotificationIds = useRef(new Set<string>());
  const setNotificationRead = trpc.orders.notifications.setRead.useMutation({ onSuccess: () => utils.orders.notifications.mine.invalidate() });
  const requestCancellation = trpc.orders.requestCancellation.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.orders.mine.invalidate(), utils.orders.notifications.mine.invalidate()]);
      setCancellationOrderId(null);
      setCancellationReason("");
      toast.success("تم إرسال طلب الإلغاء للمورد", { description: "سيصلك إشعار عند الموافقة أو الرفض." });
    },
    onError: (mutationError) => toast.error("تعذر إرسال طلب الإلغاء", { description: mutationError.message }),
  });
  const rateDelivery = trpc.orders.rateDelivery.useMutation({
    onSuccess: async () => {
      await utils.orders.mine.invalidate();
      setRatingOrderId(null);
      setDeliveryRating(0);
      setDeliveryComment("");
      toast.success("شكراً لتقييمك تجربة التوصيل");
    },
    onError: (mutationError) => toast.error("تعذر حفظ التقييم", { description: mutationError.message }),
  });

  useEffect(() => {
    const unread = notifications.filter((notification) => !notification.isRead);
    const newNotification = unread.find((notification) => !announcedNotificationIds.current.has(notification.id));
    unread.forEach((notification) => announcedNotificationIds.current.add(notification.id));
    if (newNotification) toast.info(newNotification.title, { description: newNotification.message });
  }, [notifications]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const text = `${order.orderNumber} ${order.vendorName} ${order.items.map((item) => item.name).join(" ")}`.toLocaleLowerCase("ar-SA");
    const matchesQuery = !query.trim() || text.includes(query.trim().toLocaleLowerCase("ar-SA"));
    const matchesFilter = filter === "all" || (filter === "active" && !["delivered", "cancelled"].includes(order.status)) || order.status === filter;
    return matchesQuery && matchesFilter;
  }), [orders, query, filter]);

  const filters = [
    { key: "all", label: "الكل", count: orders.length },
    { key: "active", label: "جارية", count: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length },
    { key: "delivered", label: "تم التوصيل", count: orders.filter((order) => order.status === "delivered").length },
    { key: "cancelled", label: "ملغية", count: orders.filter((order) => order.status === "cancelled").length },
  ] as const;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);
  const cancellationOrder = orders.find((order) => order.id === cancellationOrderId) ?? null;
  const ratingOrder = orders.find((order) => order.id === ratingOrderId) ?? null;

  return (
    <DashboardLayout breadcrumb={[{ label: "لوحة التحكم", href: "/dashboard" }, { label: "طلباتي" }]}>
      <div className="space-y-5 p-4 md:p-6" dir="rtl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold text-[#5A866B]">متابعة حية</p><h1 className="mt-1 text-2xl font-black text-[#203A2C]">طلباتي</h1><p className="mt-1 text-sm text-gray-500">تابع التجهيز والشحن ورقم التتبع من المورد مباشرة.</p></div>
          <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1B5E20]"><ShoppingCart className="h-4 w-4" />طلب جديد</Link>
        </div>

        {unreadNotifications.length > 0 && <section className="rounded-2xl border border-[#D5E8D2] bg-[#F2F9F0] p-4"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2E7D32] text-white"><Bell className="h-5 w-5" /></div><div><p className="font-black text-[#1F4D3A]">لديك {unreadNotifications.length} تحديثات جديدة للطلبات</p><div className="mt-2 space-y-1">{unreadNotifications.slice(0, 3).map((notification) => <button key={notification.id} onClick={() => setNotificationRead.mutate({ id: notification.id, isRead: true })} className="block text-right text-sm text-[#496858] hover:text-[#1F4D3A]"><span className="font-bold">{notification.title}: </span>{notification.message}</button>)}</div></div></div><button onClick={() => unreadNotifications.forEach((notification) => setNotificationRead.mutate({ id: notification.id, isRead: true }))} className="shrink-0 text-xs font-bold text-[#2E7D32] hover:underline">تحديد الكل كمقروء</button></div></section>}

        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"><label className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5"><Search className="h-4 w-4 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث برقم الطلب أو اسم المنتج أو المورد..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">{filters.map((item) => <button key={item.key} onClick={() => setFilter(item.key)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-colors ${filter === item.key ? "bg-[#2E7D32] text-white" : "border border-gray-200 text-gray-600 hover:border-[#2E7D32]"}`}>{item.label} <span className="mr-1 opacity-80">{item.count}</span></button>)}</div></div>

        {isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#2E7D32]" /></div> : error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">تعذر تحميل طلباتك. سجّل الدخول ثم أعد المحاولة.</div> : <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderStatus = order.status as OrderStatus;
            const status = statusMeta[orderStatus];
            const StatusIcon = status.icon;
            const isExpanded = expandedOrderId === order.id;
            const completeIndex = statusFlow.indexOf(orderStatus as typeof statusFlow[number]);
            const trackingUrl = getShipmentTrackingUrl(order.shippingProvider, order.trackingNumber);
            const canRequestCancellation = ["pending", "confirmed", "processing"].includes(order.status) && order.cancellationStatus !== "requested";
            const progressPercent = completeIndex >= 0 ? Math.round((completeIndex / (statusFlow.length - 1)) * 100) : 0;
            const cancellationPending = order.cancellationStatus === "requested";
            return <article key={order.id} className="overflow-hidden rounded-2xl border border-[#DCE8DA] bg-white shadow-sm"><div className="p-4 sm:p-5"><div className="flex gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#EAF5E7] text-[#2E7D32]">{order.items[0]?.image ? <img src={order.items[0].image} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-[#263238]">{order.items[0]?.name ?? "طلب منتجات"}{order.items.length > 1 && <span className="mr-1 text-xs font-normal text-gray-400">+ {order.items.length - 1}</span>}</p><p className="mt-1 text-xs text-gray-500">من {order.vendorName} · {order.orderNumber}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold ${status.color}`}><StatusIcon className="h-3 w-3" />{status.label}</span></div><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500"><span>{formatDate(order.createdAt)}</span><span className="font-bold text-[#2E7D32]">{formatMoney(order.total)}</span>{order.trackingNumber && (trackingUrl ? <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#2E7D32] hover:underline">تتبع: <b dir="ltr">{order.trackingNumber}</b><ExternalLink className="h-3 w-3" /></a> : <span>رقم التتبع: <b dir="ltr">{order.trackingNumber}</b></span>)}</div></div></div>
              {orderStatus === "cancelled" ? <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-bold text-red-700"><XCircle className="h-5 w-5 shrink-0" />تم إلغاء هذا الطلب؛ توقف مسار الشحن.</div> : <section className="mt-5 rounded-xl border border-[#DCE8DA] bg-[#FAFDF9] p-3" aria-label="تقدم الطلب"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#5A866B]">تقدم الطلب</p><p className="mt-0.5 text-sm font-black text-[#203A2C]">{cancellationPending ? "طلب الإلغاء قيد مراجعة المورد" : status.label}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black transition-colors duration-300 motion-reduce:transition-none ${cancellationPending ? "bg-amber-100 text-amber-800" : "bg-[#E4F3E1] text-[#1F6B35]"}`}>{progressPercent}%</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E2ECE0]" role="progressbar" aria-label="نسبة إتمام الطلب" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent} aria-valuetext={`${progressPercent}% — ${cancellationPending ? "طلب الإلغاء قيد المراجعة" : status.label}`}><div className={`h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${cancellationPending ? "bg-amber-500" : "bg-[#2E7D32]"}`} style={{ width: `${progressPercent}%` }} /></div><div className="mt-3 flex justify-between gap-1">{statusFlow.map((item, index) => <div key={item} className="flex min-w-0 flex-1 flex-col items-center"><div className={`grid h-5 w-5 place-items-center rounded-full transition-colors duration-300 motion-reduce:transition-none ${index <= completeIndex ? (cancellationPending ? "bg-amber-500 text-white" : "bg-[#2E7D32] text-white") : "bg-gray-100 text-gray-300"}`}>{index <= completeIndex ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</div><span className={`mt-1 text-center text-[9px] leading-3 transition-colors duration-300 motion-reduce:transition-none ${index <= completeIndex ? (cancellationPending ? "font-bold text-amber-700" : "font-bold text-[#2E7D32]") : "text-gray-400"}`}>{statusMeta[item].label}</span></div>)}</div>{cancellationPending && <p className="mt-3 text-xs leading-5 text-amber-800">يبقى المسار عند مرحلته الحالية حتى يرد المورد على طلب الإلغاء.</p>}</section>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3"><span className="text-xs text-gray-500">{order.cancellationStatus === "requested" ? "طلب الإلغاء قيد مراجعة المورد" : order.cancellationStatus === "rejected" ? "رُفض طلب الإلغاء؛ يمكنك إرسال طلب جديد إن لم يُشحن الطلب" : order.estimatedDelivery ? `الموعد المتوقع: ${formatDate(order.estimatedDelivery)}` : "سيحدّث المورد موعد التوصيل"}</span><div className="flex items-center gap-3">{canRequestCancellation && <button onClick={() => { setCancellationOrderId(order.id); setCancellationReason(""); }} className="text-xs font-bold text-red-600 hover:text-red-700">طلب إلغاء</button>}<button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="inline-flex items-center gap-1 text-sm font-bold text-[#2E7D32]">{isExpanded ? "إخفاء التفاصيل" : "عرض سجل التتبع"}{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></div></div>
            </div>
            {isExpanded && <div className="border-t border-[#E4EEE1] bg-[#F9FCF8] p-4 sm:p-5"><div className="grid gap-5 lg:grid-cols-2"><div><p className="text-sm font-black text-[#263238]">تحديثات الشحن</p><div className="mt-3 space-y-3">{order.trackingEvents.map((event) => <div key={event.id} className="flex gap-3"><div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2E7D32]" /><div><p className="text-sm font-bold text-[#263238]">{event.title}</p><p className="mt-0.5 text-xs leading-5 text-gray-600">{event.message}</p><p className="mt-1 text-[10px] text-gray-400">{formatDate(event.createdAt)}</p></div></div>)}</div></div><div className="rounded-xl border border-[#DCE8DA] bg-white p-4"><p className="text-sm font-black text-[#263238]">بيانات التوصيل</p><p className="mt-2 flex items-center gap-1 text-xs text-gray-600"><MapPin className="h-3.5 w-3.5 text-[#2E7D32]" />{order.deliveryAddress.city}، {order.deliveryAddress.district}، {order.deliveryAddress.street}</p>{order.shippingProvider && <p className="mt-2 text-xs text-gray-600">شركة الشحن: <b>{order.shippingProvider}</b></p>}{order.trackingNumber && (trackingUrl ? <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline">تتبع الشحنة: <span dir="ltr">{order.trackingNumber}</span><ExternalLink className="h-3.5 w-3.5" /></a> : <p className="mt-1 text-xs text-gray-600">رقم التتبع: <b dir="ltr">{order.trackingNumber}</b></p>)}{orderStatus === "delivered" && (order.deliveryRating ? <div className="mt-4 rounded-xl bg-[#F3F9F1] p-3"><p className="text-xs font-bold text-[#315F3A]">تقييمك لتجربة التوصيل</p><div className="mt-1 flex items-center gap-1 text-[#D39B2A]">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4" fill={index < order.deliveryRating!.rating ? "currentColor" : "none"} />)}<span className="mr-1 text-xs font-black text-[#315F3A]">{order.deliveryRating.rating}/5</span></div>{order.deliveryRating.comment && <p className="mt-2 text-xs leading-5 text-gray-600">{order.deliveryRating.comment}</p>}</div> : <button type="button" onClick={() => { setRatingOrderId(order.id); setDeliveryRating(0); setDeliveryComment(""); }} className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#D7E8D3] bg-[#F7FBF5] px-3 py-3 text-right text-sm font-bold text-[#2E7D32] hover:bg-[#EEF7EB]"><span>كيف كانت تجربة التوصيل؟</span><span className="inline-flex items-center gap-1 text-xs"><Star className="h-4 w-4" />قيّمها</span></button>)}<div className="mt-4 border-t border-gray-100 pt-3"><p className="text-xs font-bold text-gray-600">المنتجات</p>{order.items.map((item) => <div key={item.id} className="mt-2 flex items-center justify-between text-xs"><span>{item.name} × {item.quantity}</span><span className="font-bold text-[#2E7D32]">{formatMoney(item.unitPrice * item.quantity)}</span></div>)}</div></div></div></div>}</article>
          })}
          {filteredOrders.length === 0 && <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-gray-300" /><h2 className="mt-3 font-black text-gray-700">لا توجد طلبات حية</h2><p className="mt-1 text-sm text-gray-500">{query ? "لم نجد طلباً يطابق بحثك." : "عند إتمام طلب جديد سيظهر هنا مع مسار الشحن."}</p><Link href="/marketplace" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-sm font-bold text-white"><ShoppingCart className="h-4 w-4" />تصفح السوق</Link></div>}
        </div>}
        {cancellationOrder && <div className="fixed inset-0 z-60 flex items-end bg-black/45 sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title"><div className="w-full rounded-t-[28px] bg-white p-5 sm:max-w-lg sm:rounded-[28px] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#5A866B]">طلب إلغاء</p><h2 id="cancel-order-title" className="mt-1 text-xl font-black text-[#203A2C]">إرسال طلب إلغاء للمورد</h2></div><button type="button" onClick={() => setCancellationOrderId(null)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" aria-label="إغلاق"><XCircle className="h-5 w-5" /></button></div><p className="mt-4 rounded-xl bg-[#F7FAF5] p-3 text-sm leading-6 text-gray-600">سيُراجع المورد طلب إلغاء <b>{cancellationOrder.orderNumber}</b> قبل الموافقة عليه أو رفضه. لا يُلغى الطلب تلقائياً.</p><label className="mt-4 block text-sm font-bold text-[#34483C]">سبب طلب الإلغاء<textarea autoFocus value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} placeholder="مثال: تم إدخال الكمية بشكل غير صحيح" className="mt-2 min-h-24 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /></label><div className="mt-5 flex gap-2"><button type="button" onClick={() => setCancellationOrderId(null)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600">تراجع</button><button type="button" disabled={requestCancellation.isPending || cancellationReason.trim().length < 5} onClick={() => requestCancellation.mutate({ orderId: cancellationOrder.id, reason: cancellationReason.trim() })} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-50">{requestCancellation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}إرسال الطلب</button></div></div></div>}
        {ratingOrder && <div className="fixed inset-0 z-60 flex items-end bg-black/45 sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="delivery-rating-title"><div className="w-full rounded-t-[28px] bg-white p-5 sm:max-w-lg sm:rounded-[28px] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#5A866B]">طلب مستلم</p><h2 id="delivery-rating-title" className="mt-1 text-xl font-black text-[#203A2C]">قيّم تجربة التوصيل</h2></div><button type="button" onClick={() => setRatingOrderId(null)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" aria-label="إغلاق"><XCircle className="h-5 w-5" /></button></div><p className="mt-4 rounded-xl bg-[#F7FAF5] p-3 text-sm leading-6 text-gray-600">يساعد تقييمك الفعلي لطلب <b>{ratingOrder.orderNumber}</b> على تحسين تجربة التوصيل. يُسمح بتقييم واحد لكل طلب مستلم.</p><div className="mt-5" role="radiogroup" aria-label="تقييم تجربة التوصيل"><p className="text-sm font-bold text-[#34483C]">كم تقيّم تجربة التوصيل؟</p><div className="mt-3 flex items-center gap-2" dir="ltr">{Array.from({ length: 5 }, (_, index) => { const value = index + 1; return <button key={value} type="button" autoFocus={value === 1} role="radio" aria-checked={deliveryRating === value} aria-label={`${value} من 5`} onClick={() => setDeliveryRating(value)} className={`rounded-xl p-2 transition-transform duration-150 motion-reduce:transition-none ${value <= deliveryRating ? "scale-110 text-[#D39B2A]" : "text-gray-300 hover:text-[#D39B2A]"}`}><Star className="h-8 w-8" fill={value <= deliveryRating ? "currentColor" : "none"} /></button>; })}<span className="mr-2 text-sm font-black text-[#315F3A]">{deliveryRating ? `${deliveryRating}/5` : "اختر التقييم"}</span></div></div><label className="mt-5 block text-sm font-bold text-[#34483C]">ملاحظة اختيارية<textarea value={deliveryComment} onChange={(event) => setDeliveryComment(event.target.value)} maxLength={500} placeholder="شاركنا ملاحظتك عن الالتزام بالموعد وحالة الطلب..." className="mt-2 min-h-24 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2E7D32]" /></label><div className="mt-5 flex gap-2"><button type="button" onClick={() => setRatingOrderId(null)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600">لاحقاً</button><button type="button" disabled={rateDelivery.isPending || deliveryRating === 0} onClick={() => rateDelivery.mutate({ orderId: ratingOrder.id, rating: deliveryRating, comment: deliveryComment.trim() || undefined })} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] py-3 text-sm font-bold text-white disabled:opacity-50">{rateDelivery.isPending && <Loader2 className="h-4 w-4 animate-spin" />}إرسال التقييم</button></div></div></div>}
      </div>
    </DashboardLayout>
  );
}
