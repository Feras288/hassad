/*
 * HASAAD PLATFORM — Order Confirmation Page (/order-confirmation)
 * Success state after placing an order — shows real order data from OrdersContext
 * Design: Celebratory, clear, with next steps
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import {
  CheckCircle2, Package, Truck, Clock, Home,
  ShoppingBag, Share2, Download, Bell, MapPin, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/contexts/OrdersContext";
import { getTieredUnitPrice } from "@/lib/tierPricing";

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    orderNum: params.get("order") || "HS-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    orderId: params.get("id") || "",
  };
}

function formatPrice(n: number) {
  return n.toLocaleString("ar-SA") + " ريال";
}

const PAYMENT_LABELS: Record<string, string> = {
  card: "بطاقة ائتمانية",
  stcpay: "STC Pay",
  applepay: "Apple Pay",
  cod: "الدفع عند الاستلام",
};

const STATIC_STEPS = [
  { icon: CheckCircle2, label: "تم استلام الطلب", desc: "تم تأكيد طلبك بنجاح", done: true, active: false },
  { icon: Package, label: "جاري التجهيز", desc: "يتم تجهيز طلبك الآن", done: false, active: true },
  { icon: Truck, label: "في الطريق إليك", desc: "سيصلك خلال 3-5 أيام", done: false, active: false },
  { icon: Home, label: "تم التوصيل", desc: "استلام الطلب", done: false, active: false },
];

export default function OrderConfirmationPage() {
  const [{ orderNum, orderId }] = useState(getQueryParams);
  const [showConfetti, setShowConfetti] = useState(true);
  const { getOrder } = useOrders();
  const realOrder = orderId ? getOrder(orderId) : undefined;

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 4);
  const dateStr = realOrder?.estimatedDelivery ?? estimatedDate.toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const trackingSteps = realOrder?.trackingSteps ?? STATIC_STEPS.map(s => ({
    label: s.label,
    description: s.desc,
    done: s.done,
    active: s.active,
  }));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: ["#2E7D32", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"][i % 5],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12 pt-28">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-[#2E7D32]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم تأكيد طلبك بنجاح! 🎉</h1>
          <p className="text-gray-500">شكراً لثقتك بمنصة حصاد الزراعية</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-500">رقم الطلب:</span>
            <span className="font-bold text-[#2E7D32] font-mono text-base">{orderNum}</span>
          </div>
        </div>

        {/* Real Order Items */}
        {realOrder && realOrder.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2E7D32]" />
              المنتجات المطلوبة ({realOrder.items.length})
            </h2>
            <div className="space-y-2 mb-4">
              {realOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-gray-400 m-2.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category} · ×{item.quantity} {item.unit}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 flex-shrink-0">{formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <Separator className="mb-3" />
            <div className="space-y-1.5 text-sm">
              {realOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم{realOrder.couponCode ? ` (${realOrder.couponCode})` : ""}</span>
                  <span>-{formatPrice(realOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>الشحن</span>
                <span>{realOrder.shippingCost === 0 ? "مجاني 🎉" : formatPrice(realOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>الضريبة (15%)</span>
                <span>{formatPrice(realOrder.vat)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100 mt-1">
                <span>الإجمالي</span>
                <span className="text-[#2E7D32]">{formatPrice(realOrder.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2E7D32]" />
            حالة الطلب
          </h2>
          <div className="relative">
            <div className="absolute right-5 top-6 bottom-6 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {trackingSteps.map((s, idx) => {
                const icons = [CheckCircle2, Package, Truck, Home];
                const Icon = icons[idx] ?? CheckCircle2;
                return (
                  <div key={idx} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      s.done
                        ? "bg-[#2E7D32] text-white"
                        : s.active
                        ? "bg-amber-100 text-amber-600 border-2 border-amber-400"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold text-sm ${
                        s.done ? "text-[#2E7D32]" : s.active ? "text-amber-700" : "text-gray-400"
                      }`}>
                        {s.label}
                        {s.active && <span className="mr-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">الحالة الآن</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{("description" in s ? s.description : "")}</p>
                      {"date" in s && s.date && <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-800">موعد التوصيل المتوقع</p>
            <p className="text-sm text-blue-600 mt-0.5">{dateStr}</p>
            {realOrder && (
              <p className="text-xs text-blue-500 mt-1">
                <MapPin className="w-3 h-3 inline ml-1" />
                {realOrder.address.city}، {realOrder.address.district} · {PAYMENT_LABELS[realOrder.paymentMethod] ?? realOrder.paymentMethod}
              </p>
            )}
            <p className="text-xs text-blue-500 mt-1">سيتم إرسال رسالة نصية عند خروج الطلب للتوصيل</p>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">ماذا يحدث الآن؟</h2>
          <div className="space-y-3">
            {[
              { icon: "📧", text: "سيصلك بريد إلكتروني بتفاصيل طلبك" },
              { icon: "📱", text: "ستصلك رسالة نصية عند شحن الطلب" },
              { icon: "🚚", text: "يمكنك تتبع طلبك من لوحة التحكم" },
              { icon: "⭐", text: "بعد الاستلام، شاركنا تقييمك للمنتجات" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl py-3">
            <Link href="/dashboard/orders">
              <Package className="w-4 h-4 ml-2" />
              تتبع الطلب
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-gray-200 py-3">
            <Link href="/marketplace">
              <ShoppingBag className="w-4 h-4 ml-2" />
              متابعة التسوق
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "طلبي من حصاد", text: `رقم الطلب: ${orderNum}` });
              }
            }}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            مشاركة الطلب
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            تحميل الفاتورة
          </button>
        </div>

        {/* Notification Opt-in */}
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">فعّل الإشعارات</p>
            <p className="text-xs text-amber-600">احصل على تحديثات فورية عن طلبك</p>
          </div>
          <button className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors font-medium">
            تفعيل
          </button>
        </div>
      </div>
    </div>
  );
}
