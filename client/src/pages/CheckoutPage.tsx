/*
 * HASAAD PLATFORM — Checkout Page (/checkout)
 * Multi-step checkout: Address → Payment → Review → Confirm
 * Design: Clean, professional, step-by-step flow
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import Navbar from "@/components/Navbar";
import {
  ChevronLeft, MapPin, CreditCard, CheckCircle2,
  Truck, Shield, Clock, ChevronDown, Plus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getTieredUnitPrice } from "@/lib/tierPricing";
import { trpc } from "@/lib/trpc";

function formatPrice(n: number) {
  return n.toLocaleString("ar-SA") + " ريال";
}

type Step = "address" | "payment" | "review";

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الظهران", "الطائف", "تبوك", "بريدة", "خميس مشيط",
  "الأحساء", "حائل", "نجران", "أبها", "ينبع", "الجبيل"
];

const PAYMENT_METHODS = [
  { id: "card", label: "بطاقة ائتمانية / مدى", icon: "💳", desc: "Visa, Mastercard, Mada" },
  { id: "stcpay", label: "STC Pay", icon: "📱", desc: "ادفع عبر تطبيق STC Pay" },
  { id: "applepay", label: "Apple Pay", icon: "🍎", desc: "ادفع بسرعة عبر Apple Pay" },
  { id: "cod", label: "الدفع عند الاستلام", icon: "💵", desc: "ادفع نقداً عند وصول الطلب" },
];

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, subtotal, tierSavings, discount, shippingCost, vat, total, appliedCoupon, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addPoints } = useLoyalty();
  const createLiveOrders = trpc.orders.create.useMutation();

  const [step, setStep] = useState<Step>("address");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    street: "",
    building: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    method: "card",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [addressError, setAddressError] = useState<Partial<typeof address>>({});

  const validateAddress = () => {
    const errors: Partial<typeof address> = {};
    if (!address.fullName.trim()) errors.fullName = "الاسم مطلوب";
    if (!address.phone.trim() || address.phone.length < 10) errors.phone = "رقم الجوال غير صحيح";
    if (!address.city) errors.city = "المدينة مطلوبة";
    if (!address.district.trim()) errors.district = "الحي مطلوب";
    if (!address.street.trim()) errors.street = "الشارع مطلوب";
    setAddressError(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (createLiveOrders.isPending) return;
    try {
      const liveOrders = await createLiveOrders.mutateAsync({
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category,
          image: item.image || null,
          unit: item.unit,
          unitPrice: getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item),
          quantity: item.quantity,
          vendorId: item.vendorId ?? "unassigned-supplier",
          vendorName: item.vendorName ?? "مورد منصة حصاد",
        })),
        address: {
          fullName: address.fullName,
          phone: address.phone,
          city: address.city,
          district: address.district,
          street: address.street,
          building: address.building || null,
          notes: address.notes || null,
        },
        paymentMethod: payment.method,
        discount: discount + tierSavings,
        shippingCost,
        vat,
        total,
      });
      const primaryLiveOrder = liveOrders[0];
      const placed = placeOrder({
        id: primaryLiveOrder?.id,
        orderNumber: primaryLiveOrder?.orderNumber,
      items,
      address: {
        fullName: address.fullName,
        phone: address.phone,
        city: address.city,
        district: address.district,
        street: address.street,
        building: address.building,
        notes: address.notes,
      },
      paymentMethod: payment.method,
      subtotal,
      discount,
      shippingCost,
      vat,
      total,
      couponCode: appliedCoupon?.code,
      });
      // منح نقطة ولاء لكل ريال مدفوع
      const earnedPoints = Math.floor(total);
      if (earnedPoints > 0) {
        addPoints(earnedPoints, `طلب رقم ${placed.orderNumber}`);
      }
      clearCart();
      navigate(`/order-confirmation?order=${placed.orderNumber}&id=${placed.id}`);
    } catch (error) {
      toast.error("تعذر تسجيل الطلب", { description: error instanceof Error ? error.message : "تحقق من اتصالك ثم حاول مرة أخرى." });
    }
  };

  const steps = [
    { id: "address", label: "العنوان", icon: MapPin },
    { id: "payment", label: "الدفع", icon: CreditCard },
    { id: "review", label: "المراجعة", icon: CheckCircle2 },
  ] as const;

  const currentStepIdx = steps.findIndex((s) => s.id === step);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-gray-500 text-lg">سلتك فارغة</p>
          <Button asChild className="bg-[#2E7D32] text-white rounded-xl">
            <Link href="/marketplace">تصفح المنتجات</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-5 sm:py-8 md:pt-10">
        {/* Breadcrumb */}
        <div className="mb-5 hidden items-center gap-2 text-sm text-gray-500 sm:flex">
          <Link href="/" className="hover:text-[#2E7D32]">الرئيسية</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-[#2E7D32]">سلة التسوق</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium">إتمام الشراء</span>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center sm:mb-8">
          <div className="flex w-full max-w-md items-center gap-0">
            {steps.map((s, idx) => {
              const done = idx < currentStepIdx;
              const active = s.id === step;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 py-2 transition-all sm:px-4 ${
                    active ? "bg-[#2E7D32] text-white shadow-md" :
                    done ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold hidden sm:block">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 ${done ? "bg-[#2E7D32]" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">

            {/* Step 1: Address */}
            {step === "address" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" />
                  عنوان التوصيل
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">الاسم الكامل *</Label>
                    <Input
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="محمد عبدالله الأحمد"
                      className={`rounded-xl ${addressError.fullName ? "border-red-400" : ""}`}
                    />
                    {addressError.fullName && <p className="text-xs text-red-500">{addressError.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">رقم الجوال *</Label>
                    <Input
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className={`rounded-xl ${addressError.phone ? "border-red-400" : ""}`}
                    />
                    {addressError.phone && <p className="text-xs text-red-500">{addressError.phone}</p>}
                  </div>

                  <div className="space-y-1.5 relative">
                    <Label className="text-sm font-medium text-gray-700">المدينة *</Label>
                    <button
                      type="button"
                      onClick={() => setShowCityDropdown(!showCityDropdown)}
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-sm bg-white hover:border-[#2E7D32] transition-colors ${
                        addressError.city ? "border-red-400" : "border-gray-200"
                      } ${address.city ? "text-gray-800" : "text-gray-400"}`}
                    >
                      <span>{address.city || "اختر المدينة"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCityDropdown && (
                      <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                        {SAUDI_CITIES.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => { setAddress({ ...address, city }); setShowCityDropdown(false); }}
                            className="w-full text-right px-4 py-2 text-sm hover:bg-green-50 hover:text-[#2E7D32] transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                    {addressError.city && <p className="text-xs text-red-500">{addressError.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">الحي *</Label>
                    <Input
                      value={address.district}
                      onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      placeholder="حي النزهة"
                      className={`rounded-xl ${addressError.district ? "border-red-400" : ""}`}
                    />
                    {addressError.district && <p className="text-xs text-red-500">{addressError.district}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">الشارع *</Label>
                    <Input
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="شارع الملك فهد"
                      className={`rounded-xl ${addressError.street ? "border-red-400" : ""}`}
                    />
                    {addressError.street && <p className="text-xs text-red-500">{addressError.street}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">رقم المبنى / الشقة</Label>
                    <Input
                      value={address.building}
                      onChange={(e) => setAddress({ ...address, building: e.target.value })}
                      placeholder="مبنى 12، شقة 3"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">ملاحظات للمندوب (اختياري)</Label>
                    <Input
                      value={address.notes}
                      onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                      placeholder="مثال: اتصل قبل التوصيل"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => { if (validateAddress()) setStep("payment"); }}
                  className="w-full mt-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl py-3 text-base font-bold"
                >
                  متابعة إلى الدفع
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                  طريقة الدفع
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex min-h-[76px] items-center gap-3 rounded-xl border-2 p-3.5 transition-all sm:gap-4 sm:p-4 ${
                        payment.method === m.id
                          ? "border-[#2E7D32] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment.method === m.id}
                        onChange={() => setPayment({ ...payment, method: m.id })}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        payment.method === m.id ? "border-[#2E7D32]" : "border-gray-300"
                      }`}>
                        {payment.method === m.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                        )}
                      </div>
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                        <p className="text-xs text-gray-400">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Card Details */}
                {payment.method === "card" && (
                  <div className="mt-5 p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">رقم البطاقة</Label>
                      <Input
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        dir="ltr"
                        maxLength={19}
                        className="rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">الاسم على البطاقة</Label>
                      <Input
                        value={payment.cardName}
                        onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                        placeholder="MOHAMMED AHMED"
                        dir="ltr"
                        className="rounded-xl uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">تاريخ الانتهاء</Label>
                        <Input
                          value={payment.expiry}
                          onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                          placeholder="MM/YY"
                          dir="ltr"
                          maxLength={5}
                          className="rounded-xl font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">CVV</Label>
                        <Input
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                          placeholder="123"
                          dir="ltr"
                          maxLength={4}
                          type="password"
                          className="rounded-xl font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Shield className="w-3.5 h-3.5 text-green-500" />
                      بياناتك مشفرة بالكامل ومحمية
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("address")}
                    className="flex-1 rounded-xl border-gray-200"
                  >
                    رجوع
                  </Button>
                  <Button
                    onClick={() => setStep("review")}
                    className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold"
                  >
                    مراجعة الطلب
                    <ChevronLeft className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Address Summary */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2E7D32]" />
                      عنوان التوصيل
                    </h3>
                    <button onClick={() => setStep("address")} className="text-xs text-[#2E7D32] hover:underline">تعديل</button>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-500">{address.street}، حي {address.district}، {address.city}</p>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>

                {/* Payment Summary */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#2E7D32]" />
                      طريقة الدفع
                    </h3>
                    <button onClick={() => setStep("payment")} className="text-xs text-[#2E7D32] hover:underline">تعديل</button>
                  </div>
                  <p className="text-sm text-gray-700">
                    {PAYMENT_METHODS.find((m) => m.id === payment.method)?.label}
                    {payment.method === "card" && payment.cardNumber && (
                      <span className="text-gray-400 mr-2 font-mono dir-ltr">
                        **** {payment.cardNumber.slice(-4)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Items Summary */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="font-bold text-gray-800 mb-3">المنتجات ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">الكمية: {item.quantity} {item.unit}</p>
                        </div>
                        <p className="text-sm font-bold text-[#2E7D32]">{formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">التوصيل المتوقع</p>
                    <p className="text-xs text-blue-600 mt-0.5">خلال 3-5 أيام عمل إلى {address.city}</p>
                  </div>
                  <div className="mr-auto flex items-center gap-1 text-xs text-blue-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>3-5 أيام</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("payment")}
                    className="flex-1 rounded-xl border-gray-200"
                  >
                    رجوع
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold py-3"
                  >
                    تأكيد الطلب — {formatPrice(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
              <h3 className="font-bold text-gray-800 mb-4">ملخص الطلب</h3>

              {/* Items mini list */}
              <div className="space-y-2 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    <p className="text-xs text-gray-600 flex-1 line-clamp-1">{item.name}</p>
                    <span className="text-xs font-bold text-gray-700">×{item.quantity}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">+{items.length - 3} منتجات أخرى</p>
                )}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {tierSavings > 0 && <div className="flex justify-between text-green-600"><span>خصم أسعار الكمية</span><span>- {formatPrice(tierSavings)}</span></div>}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>{shippingCost === 0 ? "مجاني" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الضريبة (15%)</span>
                  <span>{formatPrice(vat)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base text-gray-900">
                  <span>الإجمالي</span>
                  <span className="text-[#2E7D32]">{formatPrice(total)}</span>
                </div>
              </div>

              {appliedCoupon && (
                <div className="mt-3 bg-green-50 rounded-xl p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">كود {appliedCoupon.code} مطبّق</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
