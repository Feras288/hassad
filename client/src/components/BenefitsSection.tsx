/**
 * BenefitsSection — Testimonials
 * Design: Matches reference HTML - muted bg + 3 testimonial cards
 */

import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "وفّرت لي منصة حصاد وقتاً وجهداً كبيرين. الأسمدة تصلني في اليوم التالي، والمهندس الزراعي الذي حجزته من المنصة ساعدني في زيادة إنتاج الطماطم بنسبة ٣٠٪.",
    initials: "س.م",
    name: "سعد المطيري",
    role: "مزارع — القصيم",
    avatarBg: "linear-gradient(135deg, #2A6B4F, #1F4D3A)",
  },
  {
    text: "التشخيص بالذكاء الاصطناعي أنقذ محصولي من الفراولة. اكتشفت الإصابة مبكراً، وطلبت المبيد المناسب من نفس التطبيق. تجربة سلسة واحترافية جداً.",
    initials: "ن.خ",
    name: "نورة الخالدي",
    role: "صاحبة مشروع زراعي — الرياض",
    avatarBg: "linear-gradient(135deg, #3D8A66, #2A6B4F)",
  },
  {
    text: "كمورد لأنظمة الري، فتحت لي حصاد سوقاً كاملاً من العملاء الجدد. لوحة التحكم واضحة، والدعم سريع، والمبيعات تضاعفت خلال ٦ أشهر فقط.",
    initials: "ع.ر",
    name: "عبدالرحمن الرشيد",
    role: "مدير مبيعات — شركة ري متقدمة",
    avatarBg: "linear-gradient(135deg, #E08C3B, #A67B3F)",
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-[#F4F1EA] py-14 sm:py-20 lg:py-[88px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-7 flex flex-col items-start gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#2A6B4F] rounded-full text-[12px] font-semibold mb-3.5">
              <Quote className="w-3 h-3" />
              آراء المزارعين
            </div>
            <h2 className="mb-3 text-[28px] font-bold leading-[1.25] tracking-[-0.5px] text-[#1A1A17] sm:text-[40px] sm:leading-[1.2] sm:tracking-[-1px]">
              مزارعون حقيقيون، نتائج ملموسة
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#6E6E66] sm:text-[16px] sm:leading-[1.6]">
              اسمع من مزارعين وشركات يستخدمون حصاد يومياً لتحسين إنتاجيتهم.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-[20px] border border-[#E5E1D6] bg-white p-5 shadow-[0_2px_4px_rgba(26,26,23,0.04)] sm:p-7">
              <div className="text-[48px] leading-none text-[#D4CFC0] font-serif mb-3">"</div>
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-[#E08C3B] fill-[#E08C3B]" />
                ))}
              </div>
              <p className="text-[15px] text-[#3D3D38] leading-[1.7] mb-5">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full grid place-items-center text-white font-semibold text-[13px] flex-shrink-0" style={{ background: t.avatarBg }}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-[14px] text-[#1A1A17]">{t.name}</div>
                  <div className="text-[12px] text-[#6E6E66]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
