/**
 * AIDiagnosisSection — مطابق للتصميم المرفق
 * Layout: Two-column (content + upload widget)
 * Gradient background with radial decoration
 */

import { Link } from "wouter";
import { ScanSearch, Check, Info, CloudUpload, Image, Camera, Carrot, Leaf, Trees, Wheat } from "lucide-react";
import { useLocation } from "wouter";

const FEATURES = [
  { title: "كشف الأمراض والآفات", desc: "التعرف على أكثر من ١٥٠ مرضاً وآفة شائعة تصيب المحاصيل الرئيسية." },
  { title: "تحليل نقص العناصر الغذائية", desc: "تحديد أعراض نقص النيتروجين والفوسفور والبوتاسيوم والعناصر الصغرى." },
  { title: "توصيات وإحالة", desc: "اقتراح منتجات مناسبة من المتجر أو حجز مهندس زراعي للفحص الميداني." },
];

const SAMPLES = [
  { icon: Leaf, label: "ورقة طماطم", color: "text-[#BD4E43]", glow: "bg-[#F8E4E0]", surface: "from-[#FFF8F5] to-[#FBE6E1]" },
  { icon: Trees, label: "ورقة نخيل", color: "text-[#2A6B4F]", glow: "bg-[#DDEEE3]", surface: "from-[#F7FCF6] to-[#DFEEE2]" },
  { icon: Carrot, label: "جذور وخضروات", color: "text-[#D47A31]", glow: "bg-[#FBE8D5]", surface: "from-[#FFF9F2] to-[#F9E6D0]" },
  { icon: Wheat, label: "حبوب ومحاصيل", color: "text-[#A97725]", glow: "bg-[#F7EDCC]", surface: "from-[#FFFDF5] to-[#F4E6BE]" },
];

export default function AIDiagnosisSection() {
  const [, navigate] = useLocation();

  return (
    <section className="bg-[#FBF9F4] py-14 sm:py-20 lg:py-[88px]" id="diagnosis">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div
          className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[22px] p-5 sm:rounded-[28px] sm:p-8 lg:grid-cols-2 lg:gap-[60px] lg:p-[60px]"
          style={{ background: "linear-gradient(135deg, #F1F5EE 0%, #F0E6D2 100%)" }}
        >
          {/* Decorative radial */}
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(61,138,102,0.15) 0%, transparent 70%)" }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#2A6B4F] rounded-full text-[12px] font-semibold mb-3.5">
              <ScanSearch className="w-3 h-3" />
              تشخيص فوري بالذكاء الاصطناعي
            </div>
            <h2 className="mb-4 text-[30px] font-bold leading-[1.25] tracking-[-0.6px] text-[#1A1A17] sm:text-[44px] sm:leading-[1.15] sm:tracking-[-1.2px]">
              افحص صحة محاصيلك{" "}
              <span className="text-[#1F4D3A]">بصورة واحدة.</span>
            </h2>
            <p className="mb-6 text-[15px] leading-[1.7] text-[#3D3D38] sm:mb-7 sm:text-[17px] sm:leading-[1.6]">
              ارفع صورة واضحة للنبات أو الورقة المصابة، وسيقوم نموذج الذكاء الاصطناعي بتحليلها فوراً وتقديم تقييم مبدئي مع توصيات مفصلة.
            </p>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-3.5">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-3.5">
                  <div className="w-7 h-7 bg-[#2A6B4F] rounded-full grid place-items-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="pt-0.5">
                    <div className="font-semibold text-[15px] mb-0.5">{f.title}</div>
                    <div className="text-[13px] text-[#6E6E66] leading-[1.5]">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-[13px] leading-[1.5]"
              style={{ background: "rgba(224,140,59,0.1)", border: "1px solid rgba(224,140,59,0.2)", color: "#3A2E1F" }}
            >
              <Info className="w-[18px] h-[18px] text-[#E08C3B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A1A17]">ملاحظة مهمة:</strong> التشخيص الذكي يقدم{" "}
                <strong className="text-[#1A1A17]">تقييماً مبدئياً</strong> فقط لأغراض الاسترشاد. للحالات الحرجة، ننصح بحجز مهندس زراعي مختص للفحص الميداني والتشخيص النهائي.
              </div>
            </div>
          </div>

          {/* Upload Widget */}
          <div className="relative z-10 rounded-[18px] bg-white p-4 shadow-[0_8px_16px_rgba(26,26,23,0.06),0_24px_48px_rgba(26,26,23,0.08)] sm:rounded-[20px] sm:p-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-[#F4F1EA] p-1 rounded-[10px] mb-5">
              <button className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium bg-white text-[#1F4D3A] shadow-[0_1px_2px_rgba(26,26,23,0.04)]">
                <Image className="w-3.5 h-3.5 inline-block ml-1.5" />
                رفع صورة
              </button>
              <button className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium text-[#6E6E66]">
                <Camera className="w-3.5 h-3.5 inline-block ml-1.5" />
                التقاط بالكاميرا
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => navigate("/diagnosis")}
              className="mb-4 cursor-pointer rounded-[14px] border-2 border-dashed border-[#D4CFC0] p-5 text-center transition-all hover:border-[#3D8A66] hover:bg-[#F1F5EE] sm:p-8"
            >
              <div className="w-14 h-14 bg-[#F1F5EE] rounded-[14px] grid place-items-center mx-auto mb-3">
                <CloudUpload className="w-7 h-7 text-[#1F4D3A]" />
              </div>
              <div className="font-semibold text-[15px] text-[#1A1A17] mb-1">اسحب الصورة هنا أو انقر للاختيار</div>
              <div className="text-[13px] text-[#6E6E66] mb-4">JPG، PNG بحد أقصى ١٠ ميجابايت — استخدم صور واضحة للحصول على تشخيص دقيق</div>
              <button
                onClick={() => navigate("/diagnosis")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F4D3A] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#123528] transition-colors"
              >
                اختر صورة من جهازك
              </button>
            </div>

            {/* Sample images */}
            <div className="flex flex-col items-end gap-2 border-t border-[#EEEAE1] pt-4 text-right sm:flex-row sm:items-center sm:justify-between sm:gap-3" dir="rtl">
              <span dir="rtl" className="text-[13px] font-medium text-[#6E6E66] whitespace-nowrap">أو جرّب صورة نموذجية:</span>
              <div dir="rtl" className="flex w-full items-center justify-end gap-2 sm:w-auto">
                {SAMPLES.map(s => {
                  const Icon = s.icon;
                  return (
                  <button
                    key={s.label}
                    onClick={() => navigate("/diagnosis")}
                    title={s.label}
                    aria-label={`جرّب صورة نموذجية: ${s.label}`}
                    className={`group relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-white/80 bg-gradient-to-br ${s.surface} shadow-[0_3px_8px_rgba(26,26,23,0.08)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_7px_14px_rgba(26,26,23,0.12)] active:scale-95 sm:h-12 sm:w-12`}
                  >
                    <span className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${s.glow} opacity-90`} />
                    <span className="absolute inset-1 rounded-lg border border-white/70" />
                    <Icon className={`relative z-10 h-6 w-6 ${s.color}`} strokeWidth={1.9} />
                  </button>
                );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
