// ================================================================
// HASAAD PLATFORM — Dashboard Order Detail Page
// Dynamic page: /dashboard/orders/:id
// Shows full order info: items, tracking timeline, address, payment
// Works for both real orders (OrdersContext) and static demo orders
// Design: Green (#2E7D32) + Amber (#F9A825) on white, RTL Arabic
// ================================================================
import { useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  ArrowRight, Package, MapPin, CreditCard, Clock,
  CheckCircle2, Truck, XCircle, ShoppingBag,
  Calendar, Star, RefreshCw, Printer, Share2,
  ChevronRight, Phone, Home, AlertCircle, Copy,
} from "lucide-react";
import { useOrders, type PlacedOrder, type OrderStatus, type OrderTrackingStep } from "@/contexts/OrdersContext";
import { orders as staticOrders, type Order } from "@/lib/dashboardData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────
function formatPrice(n: number) {
  return n.toLocaleString("ar-SA") + " ريال";
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const PAYMENT_LABELS: Record<string, string> = {
  card: "بطاقة ائتمانية / مدى",
  stcpay: "STC Pay",
  applepay: "Apple Pay",
  cod: "الدفع عند الاستلام",
};
const PAYMENT_ICONS: Record<string, string> = {
  card: "💳", stcpay: "📱", applepay: "🍎", cod: "💵",
};

function getRealStatusConfig(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType; step: number }> = {
    pending:     { label: "قيد الانتظار",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock,         step: 0 },
    confirmed:   { label: "تم التأكيد",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: CheckCircle2,  step: 1 },
    in_progress: { label: "جاري التوصيل", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Truck,         step: 2 },
    completed:   { label: "مكتمل",         color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: CheckCircle2,  step: 3 },
    cancelled:   { label: "ملغي",          color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: XCircle,       step: -1 },
  };
  return map[status] ?? map.pending;
}

// ─── Real Order Detail View ────────────────────────────────────
function RealOrderDetail({ order }: { order: PlacedOrder }) {
  const { cancelOrder, reorder } = useOrders();
  const { addToCart } = useCart();
  const [, navigate] = useLocation();
  const cfg = getRealStatusConfig(order.status);
  const StatusIcon = cfg.icon;

  const handleReorder = () => {
    const items = reorder(order.id);
    if (items.length > 0) {
      items.forEach(item => addToCart({ id: item.id, name: item.name, price: item.price, priceFormatted: item.price.toLocaleString('ar-SA') + ' ريال', image: item.image ?? '', category: item.category, unit: item.unit, stock: 999 }));
      toast.success('تمت إضافة منتجات الطلب إلى السلة', { action: { label: 'عرض السلة', onClick: () => navigate('/cart') } });
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber).then(() => toast.success("تم نسخ رقم الطلب"));
  };
  const handlePrint = () => {
    const w = window.open('', '_blank')!;
    w.document.write('<html dir="rtl"><head><title>فاتورة - منصة حصاد</title><style>body{font-family:Arial;padding:24px;direction:rtl}h2{color:#2E7D32}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border:1px solid #ddd;padding:10px;text-align:right}th{background:#f5f5f5}.total{font-weight:bold;color:#2E7D32}</style></head><body>');
    w.document.write('<h2>فاتورة - منصة حصاد</h2>');
    w.document.write('<p>رقم الطلب: <strong>' + order.orderNumber + '</strong></p>');
    w.document.write('<p>التاريخ: ' + new Date(order.createdAt).toLocaleDateString('ar-SA') + '</p>');
    w.document.write('<table><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr>');
    order.items.forEach(i => w.document.write('<tr><td>' + i.name + '</td><td>' + i.quantity + ' ' + (i.unit ?? '') + '</td><td>' + i.price.toLocaleString('ar-SA') + ' ريال</td><td>' + (i.price * i.quantity).toLocaleString('ar-SA') + ' ريال</td></tr>'));
    w.document.write('</table><p class="total">الإجمالي: ' + order.total.toLocaleString('ar-SA') + ' ريال</p></body></html>');
    w.document.close();
    w.print();
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `طلب ${order.orderNumber}`, text: `تتبع طلبي على منصة حصاد` });
    } else {
      toast.info("تم نسخ رابط الطلب");
    }
  };
  const handleCancel = () => {
    cancelOrder(order.id);
    toast.success("تم إلغاء الطلب بنجاح");
  };

  const trackingSteps: OrderTrackingStep[] = order.trackingSteps ?? [
    { label: "تم استلام الطلب",    description: "تم تأكيد طلبك بنجاح",           done: true,  active: order.status === "pending" },
    { label: "جاري التجهيز",       description: "يتم تجهيز طلبك الآن",           done: order.status !== "pending",  active: order.status === "confirmed" },
    { label: "في الطريق إليك",     description: "تم تسليم الطلب للشحن",          done: order.status === "in_progress" || order.status === "completed", active: order.status === "in_progress" },
    { label: "تم التوصيل",         description: "استلام الطلب",                   done: order.status === "completed", active: order.status === "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                <StatusIcon className="w-4 h-4" />
                {cfg.label}
              </span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg font-mono">
                {order.orderNumber}
              </span>
              <button onClick={handleCopy} className="text-gray-400 hover:text-[#2E7D32] transition-colors" title="نسخ رقم الطلب">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              تاريخ الطلب: <span className="font-medium text-gray-700">{formatDateTime(order.createdAt)}</span>
            </p>
            {order.estimatedDelivery && order.status !== "cancelled" && order.status !== "completed" && (
              <p className="text-sm text-gray-500 mt-1">
                موعد التوصيل المتوقع: <span className="font-medium text-[#2E7D32]">{order.estimatedDelivery}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2E7D32] border border-gray-200 hover:border-[#2E7D32] px-3 py-2 rounded-xl transition-all">
              <Share2 className="w-4 h-4" /> مشاركة
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2E7D32] border border-gray-200 hover:border-[#2E7D32] px-3 py-2 rounded-xl transition-all">
              <Printer className="w-4 h-4" /> طباعة الفاتورة
            </button>
            {(order.status === "pending" || order.status === "confirmed") && (
              <button onClick={handleCancel} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-xl transition-all">
                <XCircle className="w-4 h-4" /> إلغاء الطلب
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tracking + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          {order.status !== "cancelled" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2E7D32]" />
                تتبع الطلب
              </h2>
              <div className="relative">
                {trackingSteps.map((step, idx) => {
                  const isLast = idx === trackingSteps.length - 1;
                  return (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Connector line */}
                      {!isLast && (
                        <div className={`absolute right-[17px] top-8 w-0.5 h-full -translate-y-0 ${step.done ? "bg-[#2E7D32]" : "bg-gray-200"}`} style={{ height: "calc(100% - 8px)" }} />
                      )}
                      {/* Step icon */}
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        step.done
                          ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                          : step.active
                          ? "bg-white border-[#F9A825] text-[#F9A825] animate-pulse"
                          : "bg-white border-gray-200 text-gray-300"
                      }`}>
                        {step.done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : step.active ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      {/* Step content */}
                      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm ${step.done || step.active ? "text-gray-800" : "text-gray-400"}`}>
                            {step.label}
                            {step.active && (
                              <span className="mr-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">الحالة الآن</span>
                            )}
                          </p>
                          {step.date && (
                            <span className="text-xs text-gray-400">{step.date}</span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${step.done || step.active ? "text-gray-500" : "text-gray-300"}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">تم إلغاء الطلب</p>
                <p className="text-sm text-red-500 mt-0.5">تم إلغاء هذا الطلب. يمكنك إعادة الطلب في أي وقت.</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2E7D32]" />
              المنتجات المطلوبة ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                    {item.vendor && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.vendor}</p>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-xs text-gray-400">×{item.quantity} {item.unit}</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary + Address + Payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2E7D32]" />
              ملخص الفاتورة
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم {order.couponCode && <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded mr-1">{order.couponCode}</span>}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span>{order.shippingCost === 0 ? <span className="text-green-600 font-medium">مجاني</span> : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{formatPrice(order.vat)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2.5 border-t border-gray-100 mt-1">
                <span>الإجمالي</span>
                <span className="text-[#2E7D32]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2E7D32]" />
              طريقة الدفع
            </h2>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span className="text-2xl">{PAYMENT_ICONS[order.paymentMethod] ?? "💳"}</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                <p className="text-xs text-gray-400 mt-0.5">تم الدفع بنجاح</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2E7D32]" />
                عنوان التوصيل
              </h2>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700 font-medium">{order.address.fullName}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {order.address.street}، حي {order.address.district}، {order.address.city}
                    {order.address.building && `، ${order.address.building}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 font-mono">{order.address.phone}</p>
                </div>
                {order.address.notes && (
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-200">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">{order.address.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {order.status === "completed" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                قيّم تجربتك
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => toast.success(`شكراً على تقييمك ${s} نجوم!`)}
                    className="text-amber-400 hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 hover:fill-amber-400" />
                  </button>
                ))}
              </div>
              <button
                onClick={handleReorder}
                className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Static Order Detail View ──────────────────────────────────
function StaticOrderDetail({ order }: { order: Order }) {
  const [, navigate] = useLocation();
  const statusCfg: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    pending:     { label: "قيد الانتظار",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
    confirmed:   { label: "تم التأكيد",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: CheckCircle2 },
    in_progress: { label: "جاري التوصيل", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Truck },
    completed:   { label: "مكتمل",         color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: CheckCircle2 },
    cancelled:   { label: "ملغي",          color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: XCircle },
  };
  const cfg = statusCfg[order.status] ?? statusCfg.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                <StatusIcon className="w-4 h-4" />
                {cfg.label}
              </span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg font-mono">{order.id}</span>
            </div>
            <p className="text-sm text-gray-500">تاريخ الطلب: <span className="font-medium text-gray-700">{order.date}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2E7D32] border border-gray-200 hover:border-[#2E7D32] px-3 py-2 rounded-xl transition-all">
              <Printer className="w-4 h-4" /> طباعة
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking */}
          {order.trackingSteps && order.trackingSteps.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
              <h2 className="font-bold text-gray-800 text-base mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2E7D32]" />
                تتبع الطلب
              </h2>
              <div className="relative">
                {order.trackingSteps.map((step, idx) => {
                  const isLast = idx === order.trackingSteps!.length - 1;
                  return (
                    <div key={idx} className="flex gap-4 relative">
                      {!isLast && (
                        <div className={`absolute right-[17px] top-8 w-0.5 ${step.done ? "bg-[#2E7D32]" : "bg-gray-200"}`} style={{ height: "calc(100% - 8px)" }} />
                      )}
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${step.done ? "bg-[#2E7D32] border-[#2E7D32] text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm ${step.done ? "text-gray-800" : "text-gray-400"}`}>{step.label}</p>
                          {step.date && <span className="text-xs text-gray-400">{step.date}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2E7D32]" />
              تفاصيل الطلب
            </h2>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {order.image ? (
                  <img src={order.image} alt={order.title} className="w-full h-full object-cover rounded-xl" />
                ) : order.type === "service" ? (
                  <Calendar className="w-7 h-7 text-blue-400" />
                ) : (
                  <ShoppingBag className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{order.title}</p>
                <p className="text-sm text-gray-500 mt-1">{order.subtitle}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-lg mt-2 ${order.type === "product" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                  {order.type === "product" ? "منتج" : "خدمة"}
                </span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xl text-gray-800">{order.amount.toLocaleString("ar-SA")}</p>
                <p className="text-xs text-gray-400">ريال سعودي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rating if completed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2E7D32]" />
              ملخص الطلب
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between font-bold text-gray-800">
                <span>الإجمالي</span>
                <span className="text-[#2E7D32]">{order.amount.toLocaleString("ar-SA")} ريال</span>
              </div>
            </div>
          </div>

          {order.status === "completed" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                تقييمك للطلب
              </p>
              {order.rating ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= order.rating! ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                  <span className="text-sm text-gray-600 mr-1">{order.rating}/5</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => toast.success(`شكراً على تقييمك ${s} نجوم!`)}
                      className="text-gray-200 hover:text-amber-400 hover:scale-110 transition-all">
                      <Star className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium py-2.5 rounded-xl transition-colors mt-3"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Not Found State ───────────────────────────────────────────
function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">لم يتم العثور على الطلب</h2>
      <p className="text-gray-400 mb-6">رقم الطلب غير موجود أو تم حذفه</p>
      <Link href="/dashboard/orders" className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-5 py-2.5 rounded-xl transition-colors font-medium">
        <ArrowRight className="w-4 h-4" />
        العودة إلى طلباتي
      </Link>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────
export default function DashboardOrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const { getOrder } = useOrders();

  // Try real orders first, then static
  const realOrder = useMemo(() => getOrder(orderId), [orderId, getOrder]);
  const staticOrder = useMemo(
    () => staticOrders.find((o) => o.id === orderId),
    [orderId]
  );

  const breadcrumb = [
    { label: "لوحة التحكم", href: "/dashboard" },
    { label: "طلباتي", href: "/dashboard/orders" },
    { label: realOrder ? realOrder.orderNumber : staticOrder?.id ?? "تفاصيل الطلب" },
  ];

  return (
    <DashboardLayout breadcrumb={breadcrumb}>
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-[#2E7D32] hover:text-[#2E7D32] transition-all">
          <ArrowRight className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">تفاصيل الطلب</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {realOrder ? realOrder.orderNumber : staticOrder?.id ?? orderId}
          </p>
        </div>
      </div>

      {/* Content */}
      {realOrder ? (
        <RealOrderDetail order={realOrder} />
      ) : staticOrder ? (
        <StaticOrderDetail order={staticOrder} />
      ) : (
        <OrderNotFound />
      )}
    </DashboardLayout>
  );
}
