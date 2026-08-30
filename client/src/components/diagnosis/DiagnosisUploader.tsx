/*
 * HASAAD PLATFORM — AI Diagnosis Uploader
 * Design: "الحقل الرقمي" — Modern SaaS + Organic Warmth
 * Image upload entry point while diagnosis service integration is pending
 */

import { useState, useRef, useCallback } from "react";
import { Upload, Camera, ImagePlus, X, Leaf, Zap, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029533510/mqCLLZX4KQJEDX5TmTqCwV/ai-diagnosis-hero-dY983rkqi2xqvFHHeXkYEV.webp";
const SCAN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029533510/mqCLLZX4KQJEDX5TmTqCwV/ai-scan-animation-LLM396EBbAar5rGbqW4xVx.webp";

interface DiagnosisUploaderProps {
  onImageSelected: (imageUrl: string) => void;
  onStartAnalysis: (imageUrl: string) => void;
}

export default function DiagnosisUploader({ onImageSelected, onStartAnalysis }: DiagnosisUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى رفع ملف صورة صالح (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى ١٠ ميجابايت");
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    onImageSelected(url);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    if (!selectedImage) {
      toast.error("يرجى رفع صورة أولاً");
      return;
    }
    onStartAnalysis(selectedImage);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]" dir="rtl">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={HERO_IMG} alt="تشخيص المحاصيل" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#1B5E20]/90 via-[#2E7D32]/75 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-[#C9A227] font-bold text-sm tracking-wide">
                  حالة الخدمة
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                التشخيص الزراعي
                <br />
                <span className="text-[#A5D6A7]">قيد التجهيز</span>
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                يمكنك تجربة مسار رفع الصورة فقط. لن يُعرض تحليل أو توصيات حتى يتم ربط خدمة تشخيص موثوقة بالمنصة.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-7 sm:py-10">
        <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">
          {/* Upload Area — Main */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            {/* Upload image */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-[#E8F5E9] rounded-full flex items-center justify-center text-sm font-black text-[#2E7D32]">١</div>
                <h2 className="text-lg font-black text-[#263238]">ارفع صورة النبات</h2>
              </div>

              {!selectedImage ? (
                <>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:p-10 ${
                      isDragging
                        ? "border-[#4CAF50] bg-green-50 scale-[1.01]"
                        : "border-gray-200 hover:border-[#4CAF50] hover:bg-green-50/30"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#4CAF50]" : "bg-[#E8F5E9]"}`}>
                        <Upload className={`w-7 h-7 ${isDragging ? "text-white" : "text-[#2E7D32]"}`} />
                      </div>
                      <div>
                        <p className="text-[#263238] font-bold text-base mb-1">
                          {isDragging ? "أفلت الصورة هنا..." : "اسحب وأفلت الصورة هنا"}
                        </p>
                        <p className="text-gray-400 text-sm">أو انقر للاختيار من الجهاز</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">JPG</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-full">PNG</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-full">WEBP</span>
                        <span className="text-gray-300">|</span>
                        <span>حد أقصى ١٠ ميجابايت</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] font-bold rounded-xl transition-colors"
                    >
                      <ImagePlus className="w-4 h-4" />
                      اختر من المعرض
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FFF8E1] hover:bg-[#FFF3CD] text-[#C9A227] font-bold rounded-xl transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      التقط صورة
                    </button>
                  </div>
                </>
              ) : (
                /* Image Preview */
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                    <img
                      src={selectedImage}
                      alt="الصورة المختارة"
                      className="w-full h-full object-contain"
                    />
                    {/* Scan overlay animation */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4CAF50] to-transparent animate-scan-line" />
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-3 left-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-[#2E7D32]/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#A5D6A7] rounded-full animate-pulse" />
                      جاهز للتحليل
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="mt-3 text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    تغيير الصورة
                  </button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                selectedImage
                  ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Zap className={`w-5 h-5 ${selectedImage ? "text-[#C9A227]" : ""}`} />
              تحقق من جاهزية التشخيص
              {selectedImage && <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <Leaf className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>تنبيه مهم:</strong> هذه الأداة تقدم تقييماً أولياً استرشادياً فقط ولا تُغني عن استشارة مهندس زراعي متخصص. النتائج مبنية على تحليل الصورة وقد لا تكون دقيقة ١٠٠٪ في جميع الحالات.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-[#263238] mb-4 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-[#4CAF50]" />
                حالة الخدمة
              </h3>
              <p className="text-sm leading-7 text-gray-600">لا توجد صور أو نتائج نموذجية. لا يبدأ التحليل حتى يتم ربط خدمة تشخيص فعلية وموثوقة.</p>
            </div>

            {/* AI Info Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#1B5E20] p-5">
              <img src={SCAN_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative">
                <div className="w-10 h-10 bg-[#C9A227] rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-white mb-2">ميزة قيد التجهيز</h3>
                <div className="space-y-2.5 mt-4">
                  {[
                    { step: "١", text: "يُختار مزود تحليل زراعي موثوق" },
                    { step: "٢", text: "تُحدد سياسة الموافقة والخصوصية" },
                    { step: "٣", text: "تُعرض النتائج الموثقة فقط بعد اكتمال الربط" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-[#C9A227] rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <span className="text-white/80 text-xs leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-[#263238] mb-3 text-sm">نصائح للحصول على أفضل نتيجة</h3>
              <ul className="space-y-2">
                {[
                  "التقط الصورة في ضوء طبيعي جيد",
                  "ركّز على الجزء المصاب من النبات",
                  "تأكد من وضوح الصورة وعدم ضبابيتها",
                  "التقط صوراً متعددة لزيادة الدقة",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                    <span className="text-[#4CAF50] font-bold shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
