/**
 * HowItWorksSection — كيف تعمل حصاد
 * Design: Matches reference HTML - centered header + 4 steps
 */

import { Workflow, UserPlus, Search, CreditCard, PackageCheck } from "lucide-react";

const STEPS = [
  { num: "١", icon: UserPlus, title: "سجّل مجاناً", desc: "أنشئ حسابك في دقائق كمزارع، مورد، أو مقدم خدمة." },
  { num: "٢", icon: Search, title: "تصفّح واختر", desc: "ابحث عن المنتجات أو الخدمات التي تحتاجها بسهولة." },
  { num: "٣", icon: CreditCard, title: "اطلب بأمان", desc: "ادفع بأمان عبر وسائل الدفع المعتمدة أو ائتمان الأعمال." },
  { num: "٤", icon: PackageCheck, title: "استلم وقيّم", desc: "استلم طلبك أو الخدمة وقيّم تجربتك لمساعدة الآخرين." },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#FBF9F4] pb-14 sm:pb-20 lg:pb-[88px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1F5EE] text-[#2A6B4F] rounded-full text-[12px] font-semibold mb-3.5">
            <Workflow className="w-3 h-3" />
            كيف تعمل حصاد
          </div>
          <h2 className="mb-3 text-[28px] font-bold leading-[1.25] tracking-[-0.5px] text-[#1A1A17] sm:text-[40px] sm:leading-[1.2] sm:tracking-[-1px]">
            أربع خطوات تفصلك عن مزرعة أنجح
          </h2>
          <p className="text-[16px] text-[#6E6E66] leading-[1.6] max-w-[560px] mx-auto">
            من التسجيل إلى الحصاد — كل شيء مصمم ليكون بسيطاً وموثوقاً.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative text-center sm:text-center">
              {/* Connector line - RTL dashed */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute z-0"
                  style={{
                    top: "32px",
                    right: "60%",
                    width: "80%",
                    height: "2px",
                    backgroundImage: "repeating-linear-gradient(to right, #D4CFC0 0, #D4CFC0 8px, transparent 8px, transparent 18px)"
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white border border-[#E5E1D6] rounded-[20px] grid place-items-center mx-auto mb-4 shadow-[0_2px_4px_rgba(26,26,23,0.04)]">
                  <div className="relative">
                    <step.icon className="w-7 h-7 text-[#1F4D3A]" />
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[#1F4D3A] text-white rounded-full text-[10px] font-bold grid place-items-center"
                      style={{ fontFamily: "'Rubik', sans-serif" }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-[16px] text-[#1A1A17] mb-2">{step.title}</div>
                <div className="text-[14px] text-[#6E6E66] leading-[1.6]">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
