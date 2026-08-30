/*
 * HASAAD PLATFORM — Booking Step 3
 * Design: Order review card + payment summary + contact form + success screen
 * Celebration animation on success
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Star, MapPin, Calendar, Clock, ChevronLeft,
  Shield, CreditCard, Phone, User, Leaf, ArrowLeft, Package,
  BadgeCheck, Sparkles
} from "lucide-react";
import { arabicMonths } from "@/lib/bookingData";
import type { ServiceType, ServicePackage, Provider, TimeSlot } from "@/lib/bookingData";

const SUCCESS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029533510/mqCLLZX4KQJEDX5TmTqCwV/booking-success-bg-9fLyYxM2vPJs47X5uQMV2f.webp";

interface BookingStep3Props {
  service: ServiceType | null;
  pkg: ServicePackage | null;
  provider: Provider | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  location: string;
  farmSize: string;
  notes: string;
  onBack: () => void;
  onConfirm: (details: { contactName: string; contactPhone: string; paymentMethod: "card" | "transfer" | "cash" }) => Promise<{ id: string }>;
}

export default function BookingStep3({
  service,
  pkg,
  provider,
  date,
  timeSlot,
  location,
  farmSize,
  notes,
  onBack,
  onConfirm,
}: BookingStep3Props) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "cash">("card");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const farmSizeLabels: Record<string, string> = {
    "less-1": "أقل من هكتار",
    "1-5": "١ - ٥ هكتار",
    "5-20": "٥ - ٢٠ هكتار",
    "20-100": "٢٠ - ١٠٠ هكتار",
    "more-100": "أكثر من ١٠٠ هكتار",
  };

  const platformFee = pkg ? Math.round(pkg.price * 0.05) : 0;
  const total = pkg ? pkg.price + platformFee : 0;

  const canConfirm = contactName.trim() && contactPhone.trim() && agreed;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await onConfirm({ contactName: contactName.trim(), contactPhone: contactPhone.trim(), paymentMethod });
      setBookingReference(booking.id.toUpperCase());
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "تعذر حفظ الحجز، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {/* Success Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-6 h-48">
          <img src={SUCCESS_IMG} alt="Success" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/90 via-[#2E7D32]/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle className="w-9 h-9 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black mb-1">تم تأكيد الحجز!</h2>
            <p className="text-white/80 text-sm">سيتواصل معك المتخصص قريبًا</p>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="bg-green-50 border-2 border-[#4CAF50] rounded-2xl p-5 mb-5 text-center">
          <div className="text-sm text-gray-500 mb-1">رقم الحجز</div>
          <div className="text-2xl font-black text-[#2E7D32] tracking-wider mb-2">{bookingReference}</div>
          <div className="text-xs text-gray-400">احتفظ بهذا الرقم للمتابعة</div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm space-y-3">
          <div className="font-black text-[#263238] flex items-center gap-2 mb-3">
            <BadgeCheck className="w-4 h-4 text-[#4CAF50]" />
            ملخص الحجز
          </div>
          {[
            { icon: "🌿", label: "الخدمة", value: `${service?.icon} ${service?.name}` },
            { icon: "📦", label: "الباقة", value: pkg?.name },
            { icon: "👤", label: "المتخصص", value: provider?.name },
            {
              icon: "📅",
              label: "الموعد",
              value: date
                ? `${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()} — ${timeSlot?.time}`
                : "",
            },
            { icon: "📍", label: "الموقع", value: location },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-bold text-[#263238] text-left">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="bg-amber-50 rounded-2xl p-5 mb-5">
          <div className="font-black text-[#263238] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
            الخطوات التالية
          </div>
          <div className="space-y-3">
            {[
              { step: "١", text: "سيتصل بك المتخصص خلال ساعة لتأكيد الموعد", time: "خلال ساعة" },
              { step: "٢", text: "ستصلك رسالة واتساب بتفاصيل الزيارة", time: "قبل الزيارة بيوم" },
              { step: "٣", text: "الدفع يتم بعد إتمام الخدمة بنجاح", time: "بعد الخدمة" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#C9A227] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#263238]">{item.text}</div>
                  <div className="text-xs text-[#C9A227] font-bold">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold py-3 rounded-xl"
            onClick={() => window.location.href = "/"}
          >
            العودة للرئيسية
          </Button>
          <Button
            variant="outline"
            className="border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 font-bold py-3 rounded-xl"
            onClick={() => window.location.href = `/provider/${provider?.id}`}
          >
            ملف المتخصص
          </Button>
        </div>
      </div>
    );
  }

  // ── Review Screen ───────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-black text-[#263238] mb-1">مراجعة وتأكيد الطلب</h3>
        <p className="text-gray-500 text-sm">تحقق من تفاصيل طلبك قبل التأكيد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Order Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Provider Card */}
          {provider && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-14 h-14 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-black text-[#263238]">{provider.name}</div>
                <div className="text-[#4CAF50] text-sm font-semibold">{provider.role}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                  <span className="text-sm font-bold">{provider.rating}</span>
                  <span className="text-xs text-gray-400">({provider.reviews} تقييم)</span>
                  <span className="text-gray-300">·</span>
                  <MapPin className="w-3 h-3 text-[#4CAF50]" />
                  <span className="text-xs text-gray-500">{provider.location}</span>
                </div>
              </div>
              {provider.verified && (
                <BadgeCheck className="w-6 h-6 text-[#4CAF50] shrink-0" />
              )}
            </div>
          )}

          {/* Service & Schedule Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="font-bold text-[#263238] text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#4CAF50]" />
              تفاصيل الخدمة
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <span className="text-base">{service?.icon}</span>
                  نوع الخدمة
                </span>
                <span className="font-bold text-[#263238]">{service?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">الباقة</span>
                <span className="font-bold text-[#2E7D32]">{pkg?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  التاريخ
                </span>
                <span className="font-bold text-[#263238]">
                  {date ? `${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  الوقت
                </span>
                <span className="font-bold text-[#263238]">{timeSlot?.time || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  الموقع
                </span>
                <span className="font-bold text-[#263238] text-left max-w-[200px] truncate">{location}</span>
              </div>
              {farmSize && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">المساحة</span>
                  <span className="font-bold text-[#263238]">{farmSizeLabels[farmSize] || farmSize}</span>
                </div>
              )}
              {notes && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">ملاحظات</div>
                  <div className="text-sm text-[#263238] bg-gray-50 rounded-xl p-3">{notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="font-bold text-[#263238] text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#4CAF50]" />
              بيانات التواصل
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute top-3 right-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-gray-50 focus:bg-white transition-all"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  رقم الجوال <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute top-3 right-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-gray-50 focus:bg-white transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="font-bold text-[#263238] text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#4CAF50]" />
              طريقة الدفع
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "card", label: "بطاقة بنكية", icon: "💳" },
                { id: "transfer", label: "تحويل بنكي", icon: "🏦" },
                { id: "cash", label: "نقداً عند الزيارة", icon: "💵" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    paymentMethod === method.id
                      ? "border-[#2E7D32] bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="text-xl mb-1">{method.icon}</div>
                  <div className="text-xs font-bold text-[#263238]">{method.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Price Summary */}
        <div className="space-y-4">
          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
            <div className="font-black text-[#263238] mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#4CAF50]" />
              ملخص التكلفة
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{pkg?.name}</span>
                <span className="font-bold text-[#263238]">
                  {pkg?.price.toLocaleString("ar-SA")} ريال
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">رسوم المنصة (٥٪)</span>
                <span className="font-bold text-[#263238]">
                  {platformFee.toLocaleString("ar-SA")} ريال
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#263238]">الإجمالي</span>
                <span className="text-xl font-black text-[#2E7D32]">
                  {total.toLocaleString("ar-SA")}
                  <span className="text-sm font-medium text-gray-400 mr-1">ريال</span>
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 mb-4">
              {[
                { icon: Shield, text: "دفع آمن ومشفر بالكامل" },
                { icon: CheckCircle, text: "ضمان استرداد المبلغ عند الإلغاء" },
                { icon: BadgeCheck, text: "متخصصون موثقون ومعتمدون" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <badge.icon className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  agreed ? "bg-[#2E7D32] border-[#2E7D32]" : "border-gray-300"
                }`}
              >
                {agreed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
              </div>
              <span className="text-xs text-gray-500 leading-relaxed">
                أوافق على{" "}
                <span className="text-[#2E7D32] font-bold">شروط الخدمة</span>
                {" "}و{" "}
                <span className="text-[#2E7D32] font-bold">سياسة الخصوصية</span>
                {" "}لمنصة حصاد
              </span>
            </label>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm || isSubmitting}
              className="w-full bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-black py-3.5 rounded-xl shadow-md disabled:opacity-40 transition-all text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التأكيد...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  تأكيد الحجز
                </div>
              )}
            </Button>
            {submitError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700" role="alert">{submitError}</p>}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#263238] font-semibold text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          العودة لتعديل الموعد
        </button>
      </div>
    </div>
  );
}
