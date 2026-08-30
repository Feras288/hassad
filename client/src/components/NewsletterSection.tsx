/**
 * NewsletterSection — بديل عن قسم تحميل التطبيق
 * Design: نشرة بريدية + إحصائيات الثقة + شارات الجوائز
 */

import { useState } from "react";
import { Link } from "wouter";
import { Mail, ArrowLeft, ShieldCheck, Award, Users, TrendingUp, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";

const TRUST_STATS = [
  { icon: Users, num: "+٢٥ ألف", label: "مزارع يثق بحصاد" },
  { icon: ShieldCheck, num: "١٠٠٪", label: "مدفوعات آمنة" },
  { icon: Star, num: "٤.٨/٥", label: "متوسط التقييم" },
  { icon: TrendingUp, num: "+٨٠٠", label: "مورد معتمد" },
];

const BADGES = [
  { text: "شريك رؤية ٢٠٣٠", color: "#1F4D3A" },
  { text: "مرخص من وزارة التجارة", color: "#A67B3F" },
  { text: "بيانات مشفرة SSL", color: "#2A6B4F" },
  { text: "دعم ٢٤/٧", color: "#E08C3B" },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("تم الاشتراك بنجاح! ستصلك أحدث العروض والنصائح الزراعية.");
    setEmail("");
  };

  return (
    <section className="bg-[#FBF9F4] py-14 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Trust Stats Row */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
          {TRUST_STATS.map(s => (
            <div key={s.label} className="bg-white border border-[#E5E1D6] rounded-[16px] p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-[#F1F5EE] rounded-[12px] grid place-items-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-[#1F4D3A]" />
              </div>
              <div>
                <div className="text-[20px] font-bold text-[#1A1A17] leading-[1.2]" style={{ fontFamily: "'Rubik', sans-serif" }}>{s.num}</div>
                <div className="text-[12px] text-[#6E6E66] mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Band */}
        <div
          className="grid grid-cols-1 items-center gap-7 overflow-hidden rounded-[22px] p-5 sm:rounded-[28px] sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-10 lg:p-14"
          style={{ background: "linear-gradient(135deg, #123528 0%, #1F4D3A 60%, #2A6B4F 100%)" }}
        >
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[12px] font-semibold mb-4">
              <Mail className="w-3 h-3" />
              النشرة الزراعية الأسبوعية
            </div>
            <h3 className="mb-3 text-[28px] font-bold leading-[1.25] sm:text-[32px] sm:leading-[1.2]">
              ابقَ على اطلاع بأحدث{" "}
              <span className="text-[#C6E3B8]">العروض والنصائح الزراعية</span>
            </h3>
            <p className="mb-6 text-[15px] leading-[1.7] text-white/70 sm:text-[16px]">
              اشترك في نشرتنا الأسبوعية واحصل على أسعار حصرية، نصائح خبراء زراعيين، وتنبيهات الموسم مباشرة في بريدك.
            </p>
            <form onSubmit={handleSubmit} className="flex max-w-[480px] flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 text-[14px] outline-none focus:bg-white/15 focus:border-white/40 transition-all min-w-0"
              />
              <button
                type="submit"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-[#123528] transition-all hover:-translate-y-px hover:shadow-lg sm:flex-shrink-0"
              >
                اشترك
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[12px] text-white/50 mt-3">لن نشارك بريدك مع أي طرف ثالث. يمكنك إلغاء الاشتراك في أي وقت.</p>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-col lg:flex-nowrap">
            {BADGES.map(b => (
              <div
                key={b.text}
                className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-[12px] px-4 py-3 text-white text-[13px] font-medium whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4 text-[#C6E3B8] flex-shrink-0" />
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
