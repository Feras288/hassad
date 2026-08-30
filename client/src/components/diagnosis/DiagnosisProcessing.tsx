/*
 * HASAAD PLATFORM — AI Diagnosis Processing Screen
 * Animated processing steps with progress indicators
 * Simulates real AI analysis pipeline
 */

import { useState, useEffect } from "react";
import { Cpu, Search, Database, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface DiagnosisProcessingProps {
  imageUrl: string;
  cropType: string;
  onComplete: () => void;
}

const PROCESSING_STEPS = [
  {
    id: 1,
    icon: Search,
    title: "تحليل الصورة",
    description: "فحص جودة الصورة وتحديد مناطق الاهتمام",
    duration: 1200,
    color: "#4CAF50",
    bg: "#E8F5E9",
  },
  {
    id: 2,
    icon: Cpu,
    title: "معالجة بالذكاء الاصطناعي",
    description: "تشغيل نموذج التعلم العميق على الصورة",
    duration: 2000,
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    id: 3,
    icon: Database,
    title: "مقارنة قاعدة البيانات",
    description: "مطابقة الأنماط مع ٥٠٠+ مرض زراعي موثق",
    duration: 1500,
    color: "#C9A227",
    bg: "#FFF8E1",
  },
  {
    id: 4,
    icon: FileText,
    title: "إعداد التقرير",
    description: "توليد التوصيات والخطة العلاجية المخصصة",
    duration: 1000,
    color: "#0288D1",
    bg: "#E1F5FE",
  },
];

export default function DiagnosisProcessing({ imageUrl, cropType, onComplete }: DiagnosisProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    // Animate scan line
    const scanInterval = setInterval(() => {
      setScanLine((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 30);

    // Process steps sequentially
    let totalElapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    PROCESSING_STEPS.forEach((step, index) => {
      const startTimer = setTimeout(() => {
        setCurrentStep(index);
      }, totalElapsed);
      timers.push(startTimer);

      totalElapsed += step.duration;

      const completeTimer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index]);
        setProgress(Math.round(((index + 1) / PROCESSING_STEPS.length) * 100));
      }, totalElapsed - 200);
      timers.push(completeTimer);
    });

    // Complete
    const doneTimer = setTimeout(() => {
      clearInterval(scanInterval);
      onComplete();
    }, totalElapsed + 300);
    timers.push(doneTimer);

    return () => {
      clearInterval(scanInterval);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  const CROP_LABELS: Record<string, string> = {
    tomato: "طماطم", wheat: "قمح", palm: "نخيل",
    cucumber: "خيار", pepper: "فلفل", potato: "بطاطس",
    corn: "ذرة", other: "نبات",
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center py-16 px-4" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top: Image with scan animation */}
          <div className="relative bg-[#1B5E20] p-8 flex items-center justify-center" style={{ minHeight: "280px" }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute border border-white rounded-full"
                  style={{
                    width: `${(i + 1) * 80}px`,
                    height: `${(i + 1) * 80}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>

            {/* Image container with scan effect */}
            <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src={imageUrl}
                alt="الصورة قيد التحليل"
                className="w-full h-full object-cover"
              />
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4CAF50] to-transparent transition-all duration-100"
                style={{ top: `${scanLine}%`, opacity: progress < 100 ? 1 : 0 }}
              />
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "linear-gradient(rgba(76,175,80,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(76,175,80,0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Corner markers */}
              {[
                "top-2 right-2 border-t-2 border-r-2",
                "top-2 left-2 border-t-2 border-l-2",
                "bottom-2 right-2 border-b-2 border-r-2",
                "bottom-2 left-2 border-b-2 border-l-2",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 border-[#4CAF50] ${cls}`} />
              ))}
            </div>

            {/* Status badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4CAF50]" />
              جارٍ تحليل {CROP_LABELS[cropType] || "النبات"}...
            </div>

            {/* Floating data points */}
            {[
              { top: "15%", right: "8%", label: "RGB" },
              { top: "35%", left: "8%", label: "AI" },
              { bottom: "20%", right: "10%", label: "٩٤٪" },
            ].map((point, i) => (
              <div
                key={i}
                className="absolute bg-[#4CAF50]/90 text-white text-xs font-black px-2 py-1 rounded-lg animate-pulse"
                style={{ top: point.top, right: point.right, bottom: point.bottom, left: point.left, animationDelay: `${i * 0.3}s` }}
              >
                {point.label}
              </div>
            ))}
          </div>

          {/* Bottom: Progress */}
          <div className="p-8">
            {/* Overall Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#263238]">تقدم التحليل</span>
                <span className="text-sm font-black text-[#2E7D32]">{progress}٪</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-[#4CAF50] to-[#2E7D32] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {PROCESSING_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index && !isCompleted;
                const isPending = index > currentStep;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                      isCompleted
                        ? "bg-green-50 border border-green-100"
                        : isCurrent
                        ? "bg-gray-50 border border-gray-200 shadow-sm"
                        : "opacity-40"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isCompleted ? "bg-[#4CAF50]" : isCurrent ? step.bg : "bg-gray-100"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: step.color }} />
                      ) : (
                        <StepIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isCompleted ? "text-[#2E7D32]" : isCurrent ? "text-[#263238]" : "text-gray-400"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {isCompleted && (
                        <span className="text-xs font-bold text-[#4CAF50] bg-green-100 px-2 py-1 rounded-full">
                          مكتمل
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs font-bold text-[#C9A227] bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                          جارٍ...
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs text-gray-300 px-2 py-1">
                          انتظار
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom note */}
            <p className="text-center text-xs text-gray-400 mt-6">
              يستغرق التحليل عادةً ٥-١٠ ثوانٍ • النتائج للاسترشاد فقط
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
