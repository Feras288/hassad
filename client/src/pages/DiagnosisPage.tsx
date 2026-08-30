/*
 * HASAAD PLATFORM — AI Crop Diagnosis Page
 * Design: "الحقل الرقمي" — Modern SaaS + Organic Warmth
 *
 * Three-phase flow:
 * 1. Upload: Select crop type + upload/drag image
 * 2. Processing: Animated AI analysis steps
 * 3. Results: Full diagnosis report with treatments & recommendations
 *
 * RTL Arabic layout, mobile-responsive
 */

import { useState, useCallback } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import DiagnosisUploader from "@/components/diagnosis/DiagnosisUploader";

type Phase = "upload" | "unavailable";

export default function DiagnosisPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [uploadedImage, setUploadedImage] = useState<string>("");

  const handleImageSelected = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl);
  }, []);

  const handleStartAnalysis = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl);
    setPhase("unavailable");
  }, []);

  const handleReset = useCallback(() => {
    setPhase("upload");
    setUploadedImage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />

      <main>
        {phase === "upload" && (
          <DiagnosisUploader
            onImageSelected={handleImageSelected}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {phase === "unavailable" && <section className="mx-auto flex min-h-[58vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><CircleAlert className="h-7 w-7" /></div><h1 className="mt-5 text-2xl font-black text-[#263238]">التشخيص الذكي غير متاح بعد</h1><p className="mt-3 max-w-lg text-sm leading-7 text-gray-600">لم تُربط خدمة تحليل زراعي موثوقة بالمنصة حالياً؛ لذلك لا نعرض نتيجة تقديرية أو نموذجية لصورتك.</p>{uploadedImage && <p className="mt-2 text-xs text-gray-400">لم تُحفظ الصورة كتشخيص داخل الحساب.</p>}<button onClick={handleReset} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2E7D32] px-4 py-3 text-sm font-bold text-white"><RotateCcw className="h-4 w-4" />العودة وإضافة صورة أخرى</button></section>}
      </main>

      <ScrollToTop />
    </div>
  );
}
