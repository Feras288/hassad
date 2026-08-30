/**
 * B2BSection — قسم الشركات والموردين
 * Design: Matches reference HTML - dark green left + dashboard visual right
 */

import { Link } from "wouter";
import { Building2, Package, Store, FileText, BarChart3, ArrowLeft, TrendingUp, Users, CheckCircle } from "lucide-react";

const BENEFITS = [
  { icon: Package, title: "طلبات بالجملة", desc: "أسعار تنافسية لكميات كبيرة مع خصومات تصاعدية." },
  { icon: Store, title: "افتح متجرك", desc: "صفحة مورد احترافية تصل لآلاف المزارعين." },
  { icon: FileText, title: "فوترة وائتمان", desc: "حلول دفع مرنة وائتمان B2B للعملاء المعتمدين." },
  { icon: BarChart3, title: "تحليلات ذكية", desc: "لوحة تحكم متكاملة لمتابعة المبيعات والأداء." },
];

const CHART_BARS = [35, 45, 40, 55, 48, 62, 58, 72, 68, 82, 78, 95];

export default function B2BSection() {
  return (
    <section className="bg-[#FBF9F4] pb-14 sm:pb-20 lg:pb-[88px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div
          className="grid grid-cols-1 overflow-hidden rounded-[22px] sm:rounded-[28px] lg:grid-cols-2"
          style={{ background: "linear-gradient(135deg, #123528 0%, #1F4D3A 100%)" }}
        >
          {/* Content */}
          <div className="p-5 text-white sm:p-8 lg:p-[60px]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[12px] font-semibold mb-5">
              <Building2 className="w-3 h-3" />
              للشركات والموردين
            </div>
            <h2 className="mb-4 text-[30px] font-bold leading-[1.25] tracking-[-0.5px] sm:text-[40px] sm:leading-[1.2] sm:tracking-[-1px]">
              حلول متكاملة لأعمالك الزراعية.
            </h2>
            <p className="mb-6 text-[15px] leading-[1.7] text-white/75 sm:mb-8 sm:text-[17px] sm:leading-[1.6]">
              سواء كنت شركة زراعية كبيرة أو مورّداً يبحث عن قنوات بيع جديدة، منصة حصاد للأعمال تفتح لك أبواباً جديدة للنمو.
            </p>
            <div className="mb-7 grid grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4">
              {BENEFITS.map(b => (
                <div key={b.title} className="bg-white/10 rounded-[14px] p-4">
                  <div className="w-9 h-9 bg-white/15 rounded-[10px] grid place-items-center mb-3">
                    <b.icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="font-semibold text-[14px] mb-1">{b.title}</div>
                  <div className="text-[12px] text-white/65 leading-[1.5]">{b.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <Link href="/register?role=vendor" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-[#123528] transition-all hover:-translate-y-px hover:shadow-lg">
                كن مورداً معتمداً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/20">
                حساب أعمال
              </Link>
            </div>
          </div>

          {/* Dashboard Visual */}
          <div className="flex items-center justify-center bg-white/5 p-4 sm:p-8">
            <div className="w-full max-w-[380px] rounded-[20px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="font-semibold text-[15px] text-[#1A1A17]">لوحة تحكم المورد</div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[11px] font-semibold">
                  <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full animate-pulse" />
                  مباشر
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { l: "مبيعات هذا الشهر", v: "٨٤٬٥٢٠ ر.س", change: "+١٨٪", icon: TrendingUp },
                  { l: "طلبات نشطة", v: "٤٧", change: "+١٢ جديدة", icon: Package },
                  { l: "تقييم المتجر", v: "٤.٨ ★", change: "٣٤٦ عميل", icon: Users },
                  { l: "منتجات نشطة", v: "١٢٨", change: "معتمدة", icon: CheckCircle },
                ].map(s => (
                  <div key={s.l} className="bg-[#F4F1EA] rounded-[12px] p-3">
                    <div className="text-[11px] text-[#6E6E66] mb-1">{s.l}</div>
                    <div className="text-[16px] font-bold text-[#1A1A17] mb-0.5">{s.v}</div>
                    <div className="flex items-center gap-1 text-[11px] text-[#2A6B4F]">
                      <s.icon className="w-3 h-3" />
                      {s.change}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mini chart */}
              <div>
                <div className="text-[11px] text-[#6E6E66] mb-2">المبيعات — آخر ١٢ أسبوعاً</div>
                <div className="flex items-end gap-1 h-16">
                  {CHART_BARS.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[3px] transition-all"
                      style={{
                        height: `${h}%`,
                        background: i === CHART_BARS.length - 1
                          ? "linear-gradient(180deg, #1F4D3A, #2A6B4F)"
                          : "linear-gradient(180deg, #A0C4A8, #C8DFC9)"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
