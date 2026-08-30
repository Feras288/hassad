/**
 * ThreePillars — ثلاث ركائز المنصة
 * Design: Matches reference HTML exactly
 * Overlaps hero section with negative margin-top
 */

import { Link } from "wouter";
import { ShoppingBag, ScanSearch, HardHat, ArrowLeft } from "lucide-react";

const PILLARS = [
  {
    icon: ShoppingBag,
    badge: "B2C · B2B",
    title: "سوق المدخلات الزراعية",
    desc: "بذور، أسمدة، مبيدات، معدات، وأنظمة ري من موردين معتمدين — بأسعار الجملة والتجزئة مع ضمان الجودة.",
    features: ["+١٢٠٠٠ منتج", "موردون موثقون", "شحن سريع"],
    cta: "تصفح السوق",
    href: "/marketplace",
    bg: "#1F4D3A",
    tint: "#F1F5EE",
  },
  {
    icon: ScanSearch,
    badge: "مدعوم بالـ AI",
    title: "التشخيص الذكي للمحاصيل",
    desc: "ارفع صورة لنباتك أو محصولك واحصل على تقييم مبدئي فوري لأمراض الأوراق والآفات ونقص العناصر الغذائية.",
    features: ["تحليل فوري", "+٥٠ محصولاً", "توصيات علاجية"],
    cta: "جرّب التشخيص",
    href: "/diagnosis",
    bg: "#2A6B4F",
    tint: "#E8F5EA",
  },
  {
    icon: HardHat,
    badge: "عند الطلب",
    title: "سوق الخدمات الزراعية",
    desc: "احجز مهندسين زراعيين، فنيي ري، أطباء بيطريين، وعمّالاً موثقين — جميعهم بتقييمات ومهارات موثّقة.",
    features: ["+٤٥٠ خبيراً", "تقييمات شفافة", "حجز فوري"],
    cta: "احجز خدمة",
    href: "/booking",
    bg: "#A67B3F",
    tint: "#F0E6D2",
  },
];

export default function ThreePillars() {
  return (
    <section id="pillars" className="relative z-10 mt-4 md:-mt-[60px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group relative block cursor-pointer overflow-hidden rounded-[18px] border border-[#E5E1D6] bg-white p-5 shadow-[0_8px_16px_rgba(26,26,23,0.06),0_24px_48px_rgba(26,26,23,0.08)] transition-all duration-200 hover:-translate-y-1 sm:rounded-[20px] sm:p-8"
            >
                {/* Background radial tint */}
                <div
                  className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none opacity-60"
                  style={{ background: `radial-gradient(circle, ${pillar.tint} 0%, transparent 70%)` }}
                />

                {/* Badge */}
                <div
                  className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:left-6 sm:top-6"
                  style={{ background: pillar.tint, color: pillar.bg }}
                >
                  {pillar.badge}
                </div>

                {/* Icon */}
                <div
                  className="relative mb-4 grid h-12 w-12 place-items-center rounded-[14px] sm:mb-5 sm:h-14 sm:w-14 sm:rounded-[16px]"
                  style={{ background: pillar.bg }}
                >
                  <pillar.icon className="w-[26px] h-[26px] text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-[20px] font-bold text-[#1A1A17] sm:mb-2.5 sm:text-[22px]">{pillar.title}</h3>
                <p className="mb-4 text-[14px] leading-[1.65] text-[#6E6E66] sm:mb-5">{pillar.desc}</p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {pillar.features.map(f => (
                    <span key={f} className="px-2.5 py-1 bg-[#F4F1EA] rounded-[6px] text-[12px] text-[#3D3D38]">
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="flex items-center justify-between pt-5 border-t border-[#E5E1D6] font-semibold text-[14px]"
                  style={{ color: pillar.bg }}
                >
                  <span>{pillar.cta}</span>
                  <ArrowLeft className="w-[18px] h-[18px] group-hover:-translate-x-1.5 transition-transform" />
                </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
