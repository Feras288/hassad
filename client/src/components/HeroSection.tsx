/**
 * HeroSection — مطابق للتصميم المرفق
 * Layout: Two-column grid (content left + visual right)
 * Visual: 3 floating cards (product + AI diagnosis + service provider)
 * Stats bar at bottom of content
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Sparkles, ArrowLeft, ScanLine, Check, Star, X, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

/** Fallback stats are intentionally zeroed out — real values come from the database via admin settings. */
const EMPTY_STATS = [
  { value: 0, suffixAr: "", suffixEn: "", labelAr: "مزارع نشط", labelEn: "Active farms" },
  { value: 0, suffixAr: "", suffixEn: "", labelAr: "مورد موثوق", labelEn: "Trusted suppliers" },
  { value: 0, suffixAr: "", suffixEn: "", labelAr: "منتج زراعي", labelEn: "Agricultural products" },
  { value: 0, suffixAr: "", suffixEn: "", labelAr: "خبير ومهندس", labelEn: "Experts & engineers" },
];

function AnimatedHeroStat({ stat, isVisible, isEnglish }: { stat: typeof EMPTY_STATS[number]; isVisible: boolean; isEnglish: boolean }) {
  const [count, setCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (prefersReducedMotion) {
      setCount(stat.value);
      return;
    }

    const duration = 900;
    const startedAt = performance.now();
    let frameId = 0;
    const updateCount = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - (1 - progress) ** 3;
      setCount(Math.round(stat.value * easedProgress));
      if (progress < 1) frameId = window.requestAnimationFrame(updateCount);
    };
    frameId = window.requestAnimationFrame(updateCount);
    return () => window.cancelAnimationFrame(frameId);
  }, [isVisible, prefersReducedMotion, stat.value]);

  return (
      <div className="min-w-0 rounded-xl bg-white/[0.035] px-1.5 py-3 sm:bg-transparent sm:px-0 sm:py-2">
        <div className="whitespace-nowrap text-[16px] font-bold leading-[1.2] tracking-[-0.5px] text-white sm:text-[28px]" style={{ fontFamily: "'Rubik', sans-serif" }}>
        +{count.toLocaleString(isEnglish ? "en-US" : "ar-SA")}{(isEnglish ? stat.suffixEn : stat.suffixAr) && <span className={isEnglish ? "ml-0.5" : "mr-0.5"}> {isEnglish ? stat.suffixEn : stat.suffixAr}</span>}
      </div>
      <div className="mt-1 whitespace-nowrap text-[9px] text-[#C9D9CD] sm:text-[13px]">{isEnglish ? stat.labelEn : stat.labelAr}</div>
    </div>
  );
}

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [areStatsVisible, setAreStatsVisible] = useState(false);
  const { language } = useLanguage();
  const heroStatsSettings = trpc.platformPreferences.heroStats.useQuery();
  const effectiveStats = heroStatsSettings.data?.stats ?? EMPTY_STATS;
  const showStats = heroStatsSettings.data?.enabled ?? true;

  useEffect(() => {
    const statsElement = statsRef.current;
    if (!statsElement || !("IntersectionObserver" in window)) {
      setAreStatsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setAreStatsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(statsElement);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative overflow-hidden py-9 pb-16 text-white sm:py-14 sm:pb-12 md:py-[72px] md:pb-[88px]"
      style={{
        background: "linear-gradient(135deg, #123528 0%, #1F4D3A 60%, #2A6B4F 100%)"
      }}
    >
      {/* Background decorative radials */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.06) 0, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(107,142,78,0.4) 0, transparent 50%)
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent 0 30px, rgba(255,255,255,0.015) 30px 31px)"
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[60px]">

          {/* ===== LEFT: Content ===== */}
          <div>
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:mb-6 sm:px-3.5 sm:text-[13px]">
              <Sparkles className="w-3.5 h-3.5 text-[#E08C3B]" />
              منصة زراعية متكاملة — من البذرة إلى الحصاد
            </div>

            {/* Headline */}
            <h1
              className="mb-4 text-[34px] font-bold leading-[1.2] tracking-[-0.8px] sm:text-[46px] sm:leading-[1.16] md:mb-5 md:text-[56px] md:tracking-[-1.5px]"
              style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif", textWrap: "balance" }}
            >
              كل ما تحتاجه{" "}
              <span className="relative inline-block text-[#C6E3B8]">
                مزرعتك
                <span className="absolute bottom-1 right-0 w-full h-2 bg-[rgba(198,227,184,0.25)] rounded-[4px] -z-10" />
              </span>
              <br />
              في مكان واحد.
            </h1>

            {/* Lead */}
            <p className="mb-6 max-w-[540px] text-[14px] leading-7 text-[#DDE7DE] sm:mb-8 sm:text-[17px] sm:leading-[1.65] md:mb-9 md:text-[18px]">
              سوق موثوق للمدخلات الزراعية، تشخيص فوري للمحاصيل بالذكاء الاصطناعي، وشبكة من المهندسين والفنيين والخدمات — كل ذلك بلغتك وبين يديك.
            </p>

            {/* CTA Buttons */}
            <div className="mb-7 grid grid-cols-1 gap-2.5 sm:mb-10 sm:flex sm:flex-wrap sm:gap-3">
              <Link href="/marketplace" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[15px] font-semibold text-[#123528] transition-all hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] sm:px-[26px]">
                ابدأ التسوق الآن
                <ArrowLeft className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/diagnosis" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/10 sm:px-[26px]">
                <ScanLine className="h-[18px] w-[18px]" />
                جرّب التشخيص الذكي
              </Link>
            </div>

            {/* Stats */}
            {showStats && <div ref={statsRef} data-hero-mobile-stats className="mx-auto grid w-full max-w-[640px] grid-cols-4 gap-1.5 text-center sm:mx-0 sm:max-w-none sm:gap-8 sm:text-right">
              {effectiveStats.map(stat => <AnimatedHeroStat key={`${stat.labelAr}-${stat.labelEn}`} stat={stat} isVisible={areStatsVisible} isEnglish={language === "en"} />)}
            </div>}
          </div>

          {/* ===== RIGHT: Visual Cards ===== */}
          <div className="relative h-[480px] hidden lg:block">

            {/* Main Product Card */}
            <div
              className="absolute bg-white text-[#1A1A17] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
              style={{ top: 20, right: 40, width: 340 }}
            >
            {/* Image placeholder */}
            <div
              className="relative grid place-items-center text-[#1F4D3A]"
              style={{
                aspectRatio: "4/3",
                background: "#1F4D3A"
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=680&q=85&fit=crop"
                alt="منتجات زراعية"
                className="w-full h-full object-cover"
              />
            </div>
              <div className="px-5 py-[18px]">
                <div className="font-semibold text-[16px] mb-3">بذور طماطم هجينة — صنف الفيصل</div>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[18px] text-[#1F4D3A]" style={{ fontFamily: "'Rubik', sans-serif" }}>
                    ٨٥ <span className="text-[12px] font-medium text-[#6E6E66]">ر.س / كيس</span>
                  </div>
                  <button className="flex items-center gap-1.5 bg-[#1F4D3A] text-white px-3.5 py-2 rounded-[10px] text-[13px] font-medium">
                    <span className="text-lg leading-none">+</span>
                    أضف
                  </button>
                </div>
              </div>
            </div>

            {/* AI Diagnosis Card — floating */}
            <div
              className="absolute bg-white text-[#1A1A17] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-5"
              style={{
                bottom: 40, left: 20, width: 300,
                animation: "floaty 6s ease-in-out infinite"
              }}
            >
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-[10px] grid place-items-center text-white" style={{ background: "linear-gradient(135deg, #3D8A66, #1F4D3A)" }}>
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[14px]">التشخيص الذكي</div>
                  <div className="text-[11px] text-[#6E6E66]">تحليل صورة النبات</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-[#F1F5EE] rounded-[10px] mb-2.5">
                <div className="w-6 h-6 bg-[#2A6B4F] rounded-full grid place-items-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-[12px] text-[#6E6E66]">تم رصد المؤشرات</div>
                  <div className="text-[13px] font-semibold text-[#1F4D3A]">اصفرار — نقص نيتروجين محتمل</div>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[#6E6E66] mb-1.5">
                <span>مستوى الثقة</span>
                <span className="font-semibold" style={{ fontFamily: "'Rubik', sans-serif" }}>٨٧٪</span>
              </div>
              <div className="h-1.5 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="h-full w-[87%] rounded-full" style={{ background: "linear-gradient(90deg, #6B8E4E, #2A6B4F)" }} />
              </div>
            </div>

            {/* Service Provider Card — floating */}
            <div
              className="absolute bg-white text-[#1A1A17] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-5"
              style={{
                top: 260, right: 0, width: 260,
                animation: "floaty 7s ease-in-out infinite",
                animationDelay: "-2s"
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center text-white font-semibold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #A67B3F, #D4B888)" }}
                >
                  م.أ
                </div>
                <div>
                  <div className="font-semibold text-[14px]">م. أحمد الشمري</div>
                  <div className="text-[12px] text-[#6E6E66]">مهندس زراعي</div>
                  <div className="flex items-center gap-1 mt-1 text-[12px]">
                    <Star className="w-3 h-3 text-[#E08C3B] fill-[#E08C3B]" />
                    <span className="font-semibold" style={{ fontFamily: "'Rubik', sans-serif" }}>٤.٩</span>
                    <span className="text-[#94948B]">(١٢٤)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVideo(false)} className="absolute -top-10 left-0 text-white/80 hover:text-white flex items-center gap-2 text-sm">
              <X className="w-5 h-5" /> إغلاق
            </button>
            <div className="rounded-2xl overflow-hidden aspect-video bg-black">
              <iframe src="https://www.youtube.com/embed/K4TOrB7at0Y?autoplay=1&rel=0" className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title="فيديو تعريفي" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
