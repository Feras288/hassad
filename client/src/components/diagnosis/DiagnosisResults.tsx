/*
 * HASAAD PLATFORM — AI Diagnosis Results Screen
 * Full results display: disease info, severity, treatments, recommendations
 * RTL Arabic layout with rich visual hierarchy
 */

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle, Info,
  Leaf, FlaskConical, Microscope, ShieldCheck,
  ChevronDown, ChevronUp, ShoppingCart, Phone,
  RotateCcw, Share2, Download, Star, ArrowLeft,
  Thermometer, Wind, Droplets, TrendingDown,
  X, Calendar, User, MapPin, Clock
} from "lucide-react";
import { DiagnosisResult } from "@/lib/diagnosisData";
import { toast } from "sonner";
import { Link } from "wouter";

interface DiagnosisResultsProps {
  result: DiagnosisResult;
  imageUrl: string;
  onReset: () => void;
}

const TREATMENT_ICONS: Record<string, React.ElementType> = {
  chemical: FlaskConical,
  organic: Leaf,
  biological: Microscope,
  cultural: ShieldCheck,
};

// ─── PDF Report Generator ───────────────────────────────────────────────────
function generatePDFReport(result: DiagnosisResult, imageUrl: string) {
  const date = new Date().toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>تقرير التشخيص — ${result.diseaseName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Cairo', sans-serif; background: #F5F1E8; color: #263238; direction: rtl; }
  .page { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; }
  .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; padding: 32px 40px; }
  .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .logo { font-size: 28px; font-weight: 900; color: #C9A227; }
  .report-id { font-size: 12px; color: rgba(255,255,255,0.6); font-family: monospace; }
  .disease-title { font-size: 26px; font-weight: 900; margin-bottom: 4px; }
  .scientific { font-size: 14px; color: rgba(255,255,255,0.7); font-style: italic; margin-bottom: 16px; }
  .badges { display: flex; gap: 12px; flex-wrap: wrap; }
  .badge { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 700; }
  .content { padding: 32px 40px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 16px; font-weight: 900; color: #1B5E20; border-right: 4px solid #C9A227; padding-right: 12px; margin-bottom: 14px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .metric { background: #F5F1E8; border-radius: 12px; padding: 14px; text-align: center; }
  .metric-label { font-size: 11px; color: #78909C; margin-bottom: 4px; }
  .metric-value { font-size: 15px; font-weight: 900; color: #263238; }
  .description { font-size: 14px; line-height: 1.8; color: #455A64; }
  .list-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; font-size: 13px; color: #455A64; }
  .bullet { color: #4CAF50; font-weight: 900; margin-top: 2px; }
  .treatment { background: #F5F1E8; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
  .treatment-name { font-size: 14px; font-weight: 700; color: #263238; margin-bottom: 6px; }
  .treatment-detail { font-size: 12px; color: #78909C; }
  .action { background: #FFF8E1; border: 1px solid #FFD54F; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; font-size: 13px; color: #5D4037; display: flex; gap: 8px; }
  .action-num { background: #F59E0B; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; }
  .footer { background: #1B5E20; color: white; padding: 20px 40px; text-align: center; }
  .footer-brand { font-size: 18px; font-weight: 900; color: #C9A227; margin-bottom: 4px; }
  .footer-text { font-size: 12px; color: rgba(255,255,255,0.6); }
  .confidence-bar { background: #E8F5E9; border-radius: 20px; height: 10px; margin-top: 6px; overflow: hidden; }
  .confidence-fill { height: 100%; background: #4CAF50; border-radius: 20px; width: ${result.confidence}%; }
  .image-section { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 28px; }
  .crop-image { width: 140px; height: 140px; object-fit: cover; border-radius: 14px; border: 3px solid #E8F5E9; flex-shrink: 0; }
  .image-info { flex: 1; }
  @media print { body { background: white; } .page { box-shadow: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="logo">حصاد</div>
      <div class="report-id">رقم التحليل: ${result.analysisId}</div>
    </div>
    <div class="disease-title">${result.diseaseName}</div>
    <div class="scientific">${result.scientificName}</div>
    <div class="badges">
      <div class="badge">🌱 ${result.cropType}</div>
      <div class="badge">⚠️ ${result.severityLabel}</div>
      <div class="badge">🎯 دقة التشخيص: ${result.confidence}٪</div>
      <div class="badge">📅 ${date}</div>
    </div>
  </div>

  <div class="content">
    <!-- Image + Confidence -->
    <div class="image-section">
      <img src="${imageUrl}" class="crop-image" alt="الصورة المشخصة" />
      <div class="image-info">
        <div class="section-title" style="margin-bottom:10px;">دقة التشخيص</div>
        <div style="font-size:32px;font-weight:900;color:#2E7D32;">${result.confidence}٪</div>
        <div class="confidence-bar"><div class="confidence-fill"></div></div>
        <div style="font-size:12px;color:#78909C;margin-top:6px;">
          ${result.confidence >= 90 ? "تشخيص عالي الثقة" : result.confidence >= 75 ? "تشخيص جيد" : "يُنصح بمراجعة خبير"}
        </div>
        <div style="margin-top:12px;font-size:13px;color:#455A64;">
          <strong>الإلحاح:</strong> ${result.urgencyLabel}
        </div>
      </div>
    </div>

    <!-- Metrics -->
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">شدة الإصابة</div>
        <div class="metric-value">${result.severityLabel}</div>
      </div>
      <div class="metric">
        <div class="metric-label">المساحة المصابة</div>
        <div class="metric-value">${result.affectedArea > 0 ? result.affectedArea + "٪" : "لا يوجد"}</div>
      </div>
      <div class="metric">
        <div class="metric-label">خطر الانتشار</div>
        <div class="metric-value">${result.spreadRiskLabel}</div>
      </div>
      <div class="metric">
        <div class="metric-label">خسارة المحصول</div>
        <div class="metric-value">${result.estimatedYieldLoss}</div>
      </div>
    </div>

    <!-- Description -->
    <div class="section">
      <div class="section-title">وصف المرض</div>
      <p class="description">${result.description}</p>
    </div>

    <!-- Symptoms -->
    ${result.symptoms.length > 0 ? `
    <div class="section">
      <div class="section-title">الأعراض الملاحظة</div>
      ${result.symptoms.map(s => `<div class="list-item"><span class="bullet">●</span><span>${s}</span></div>`).join("")}
    </div>` : ""}

    <!-- Causes -->
    ${result.causes.length > 0 ? `
    <div class="section">
      <div class="section-title">أسباب الإصابة</div>
      ${result.causes.map(c => `<div class="list-item"><span class="bullet" style="color:#C9A227;">◆</span><span>${c}</span></div>`).join("")}
    </div>` : ""}

    <!-- Immediate Actions -->
    ${result.immediateActions.length > 0 ? `
    <div class="section">
      <div class="section-title">الإجراءات الفورية المطلوبة</div>
      ${result.immediateActions.map((a, i) => `<div class="action"><div class="action-num">${i + 1}</div><span>${a}</span></div>`).join("")}
    </div>` : ""}

    <!-- Treatments -->
    ${result.treatments.length > 0 ? `
    <div class="section">
      <div class="section-title">خطة العلاج</div>
      ${result.treatments.map(t => `
        <div class="treatment">
          <div class="treatment-name">${t.name} <span style="font-size:11px;color:#78909C;">(${t.typeLabel})</span></div>
          <div class="treatment-detail">الجرعة: ${t.dosage} &nbsp;|&nbsp; التكرار: ${t.frequency}</div>
          <div class="treatment-detail" style="margin-top:4px;color:#B45309;">ملاحظة: ${t.notes}</div>
        </div>`).join("")}
    </div>` : ""}

    <!-- Prevention -->
    ${result.preventionTips.length > 0 ? `
    <div class="section">
      <div class="section-title">نصائح الوقاية</div>
      ${result.preventionTips.map(p => `<div class="list-item"><span class="bullet">✓</span><span>${p}</span></div>`).join("")}
    </div>` : ""}

    <!-- Disclaimer -->
    <div style="background:#E8F5E9;border-radius:12px;padding:14px;margin-top:20px;">
      <p style="font-size:12px;color:#2E7D32;line-height:1.7;">
        <strong>تنبيه:</strong> هذا التقرير مُولَّد بواسطة نظام الذكاء الاصطناعي في منصة حصاد. للحصول على تشخيص دقيق ومعتمد، يُنصح بمراجعة مهندس زراعي متخصص.
        <br/>رقم التحليل: <strong>${result.analysisId}</strong> &nbsp;|&nbsp; تاريخ التقرير: <strong>${date}</strong>
      </p>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">منصة حصاد الزراعية</div>
    <div class="footer-text">hassad.net &nbsp;|&nbsp; info@hassad.net &nbsp;|&nbsp; 0552144040</div>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    toast.error("يرجى السماح بفتح النوافذ المنبثقة لتحميل التقرير");
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast.success("جاري فتح التقرير للطباعة أو الحفظ كـ PDF");
}

// ─── Share Results ───────────────────────────────────────────────────────────
function shareResults(result: DiagnosisResult) {
  const text = `تشخيص حصاد الزراعي 🌱\n\nالمحصول: ${result.cropType}\nالمرض: ${result.diseaseName}\nدقة التشخيص: ${result.confidence}٪\nشدة الإصابة: ${result.severityLabel}\n\nرقم التحليل: ${result.analysisId}\nمنصة حصاد — hassad.net`;

  if (navigator.share) {
    navigator.share({ title: "تقرير تشخيص حصاد", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("تم نسخ ملخص التشخيص إلى الحافظة");
    }).catch(() => {
      toast.error("تعذّر نسخ النص");
    });
  }
}

// ─── Consultation Modal ──────────────────────────────────────────────────────
function ConsultationModal({ result, onClose }: { result: DiagnosisResult; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setSubmitted(true);
    toast.success("تم إرسال طلب الاستشارة بنجاح! سيتواصل معك خبيرنا قريباً");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-lg">احجز استشارة زراعية</h3>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-sm">
            <p className="text-white/70 text-xs mb-1">التشخيص المرفق</p>
            <p className="font-bold">{result.diseaseName}</p>
            <p className="text-white/60 text-xs">{result.cropType} · دقة {result.confidence}٪</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
            </div>
            <h4 className="font-black text-[#263238] text-lg mb-2">تم إرسال طلبك!</h4>
            <p className="text-gray-500 text-sm mb-6">سيتواصل معك أحد خبرائنا الزراعيين المعتمدين خلال 24 ساعة على الرقم المُدخل.</p>
            <button onClick={onClose} className="w-full bg-[#2E7D32] text-white py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition-colors">
              حسناً
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#4CAF50]" /> الاسم الكامل *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#4CAF50]" /> رقم الجوال *
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                type="tel"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4CAF50]" /> الموعد المفضل *
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#4CAF50]" /> ملاحظات إضافية
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: موقع المزرعة، وصف إضافي للمشكلة..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] resize-none"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">سيتواصل معك خبيرنا خلال 24 ساعة لتأكيد الموعد</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 bg-[#2E7D32] text-white py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition-colors">
                إرسال الطلب
              </button>
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DiagnosisResults({ result, imageUrl, onReset }: DiagnosisResultsProps) {
  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"treatments" | "prevention" | "products">("treatments");
  const [showConsultation, setShowConsultation] = useState(false);

  const isHealthy = result.severity === "low" && result.affectedArea === 0;

  const SeverityIcon = isHealthy ? CheckCircle2 : result.severity === "critical" ? XCircle : AlertTriangle;

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-16" dir="rtl">
      {/* Results Header Banner */}
      <div
        className="py-8 px-4"
        style={{
          background: isHealthy
            ? "linear-gradient(135deg, #1B5E20, #2E7D32)"
            : result.severity === "critical"
            ? "linear-gradient(135deg, #B71C1C, #C62828)"
            : result.severity === "high"
            ? "linear-gradient(135deg, #BF360C, #D84315)"
            : "linear-gradient(135deg, #E65100, #F57C00)",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onReset}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              تشخيص جديد
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => shareResults(result)}
                title="مشاركة النتائج"
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => generatePDFReport(result, imageUrl)}
                title="تحميل التقرير PDF"
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Image thumbnail */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl">
                <img src={imageUrl} alt="الصورة المشخصة" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: result.severityColor }}
              >
                <SeverityIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Result summary */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-white/70 text-sm">{result.cropType}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 text-sm font-mono">{result.analysisId}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                {result.diseaseName}
              </h1>
              <p className="text-white/70 text-sm italic mb-3">{result.scientificName}</p>
              <div className="flex flex-wrap items-center gap-3">
                {/* Confidence */}
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                  <div className="w-2 h-2 bg-[#A5D6A7] rounded-full animate-pulse" />
                  <span className="text-white text-sm font-bold">دقة التشخيص: {result.confidence}٪</span>
                </div>
                {/* Urgency */}
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: `${result.urgencyColor}30`, border: `1px solid ${result.urgencyColor}60` }}
                >
                  <span className="text-white text-sm font-bold">{result.urgencyLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: Thermometer,
                  label: "شدة الإصابة",
                  value: result.severityLabel,
                  color: result.severityColor,
                  bg: `${result.severityColor}15`,
                },
                {
                  icon: TrendingDown,
                  label: "المساحة المصابة",
                  value: result.affectedArea > 0 ? `${result.affectedArea}٪` : "لا يوجد",
                  color: result.affectedArea > 50 ? "#EF4444" : result.affectedArea > 20 ? "#F59E0B" : "#10B981",
                  bg: result.affectedArea > 50 ? "#FEE2E2" : result.affectedArea > 20 ? "#FEF3C7" : "#D1FAE5",
                },
                {
                  icon: Wind,
                  label: "خطر الانتشار",
                  value: result.spreadRiskLabel,
                  color: result.spreadRisk === "high" ? "#EF4444" : result.spreadRisk === "medium" ? "#F59E0B" : "#10B981",
                  bg: result.spreadRisk === "high" ? "#FEE2E2" : result.spreadRisk === "medium" ? "#FEF3C7" : "#D1FAE5",
                },
                {
                  icon: Droplets,
                  label: "خسارة المحصول",
                  value: result.estimatedYieldLoss,
                  color: "#6B7280",
                  bg: "#F3F4F6",
                },
              ].map((metric, i) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: metric.bg }}
                    >
                      <MetricIcon className="w-5 h-5" style={{ color: metric.color }} />
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                    <p className="text-sm font-black" style={{ color: metric.color }}>{metric.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-black text-[#263238] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#4CAF50]" />
                وصف المرض
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{result.description}</p>

              {result.symptoms.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-[#263238] mb-3">الأعراض الملاحظة</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.symptoms.map((symptom, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#EF4444] font-bold shrink-0 mt-0.5">●</span>
                        {symptom}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.causes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-[#263238] mb-3">أسباب الإصابة</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.causes.map((cause, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#C9A227] font-bold shrink-0 mt-0.5">◆</span>
                        {cause}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Immediate Actions */}
            {result.immediateActions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h2 className="font-black text-amber-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  الإجراءات الفورية المطلوبة
                </h2>
                <div className="space-y-2">
                  {result.immediateActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-amber-100">
                      <span className="w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-amber-900 font-medium">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Treatments / Prevention / Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab Bar */}
              <div className="flex border-b border-gray-100">
                {[
                  { id: "treatments" as const, label: "خطة العلاج", count: result.treatments.length },
                  { id: "prevention" as const, label: "الوقاية", count: result.preventionTips.length },
                  { id: "products" as const, label: "المنتجات الموصى بها", count: result.recommendedProducts.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-3 text-sm font-bold transition-all duration-200 relative ${
                      activeTab === tab.id
                        ? "text-[#2E7D32]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`mr-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-gray-400"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Treatments Tab */}
                {activeTab === "treatments" && (
                  <div className="space-y-3">
                    {result.treatments.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-[#4CAF50] mx-auto mb-3" />
                        <p className="text-gray-500">لا يلزم علاج. النبات بصحة جيدة!</p>
                      </div>
                    ) : (
                      result.treatments.map((treatment, i) => {
                        const TreatIcon = TREATMENT_ICONS[treatment.type] || Leaf;
                        const isExpanded = expandedTreatment === i;
                        return (
                          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedTreatment(isExpanded ? null : i)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-right"
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${treatment.typeColor}15` }}
                              >
                                <TreatIcon className="w-5 h-5" style={{ color: treatment.typeColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${treatment.typeColor}15`, color: treatment.typeColor }}
                                  >
                                    {treatment.typeLabel}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-[#263238]">{treatment.name}</p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                                <div className="pt-4 space-y-3">
                                  <p className="text-sm text-gray-600 leading-relaxed">{treatment.name}</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                                      <p className="text-xs text-gray-400 mb-1">الجرعة</p>
                                      <p className="text-sm font-bold text-[#263238]">{treatment.dosage}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                                      <p className="text-xs text-gray-400 mb-1">التكرار</p>
                                      <p className="text-sm font-bold text-[#263238]">{treatment.frequency}</p>
                                    </div>
                                  </div>
                                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                    <p className="text-xs text-amber-700">
                                      <strong>ملاحظة:</strong> {treatment.notes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Prevention Tab */}
                {activeTab === "prevention" && (
                  <div className="space-y-2">
                    {result.preventionTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                        <ShieldCheck className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
                        <span className="text-sm text-[#263238]">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <div className="space-y-3">
                    {result.recommendedProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#4CAF50]/30 hover:bg-green-50/20 transition-all group">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {product.badge && (
                            <span className="text-xs font-bold text-[#4CAF50] bg-green-100 px-2 py-0.5 rounded-full mb-1 inline-block">
                              {product.badge}
                            </span>
                          )}
                          <p className="text-sm font-bold text-[#263238] truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-[#C9A227] fill-[#C9A227]" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                            <span className="text-xs text-gray-400 mr-1">{product.rating}</span>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-base font-black text-[#2E7D32] mb-2">{product.price}</p>
                          <button
                            onClick={() => toast.success(`تمت إضافة "${product.name}" للسلة`)}
                            className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-[#4CAF50] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            أضف للسلة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Confidence Gauge */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <h3 className="font-black text-[#263238] mb-4">دقة التشخيص</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E8F5E9" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={result.confidence >= 90 ? "#4CAF50" : result.confidence >= 75 ? "#C9A227" : "#EF4444"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.confidence / 100) * 314} 314`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#263238]">{result.confidence}</span>
                  <span className="text-xs text-gray-400">٪</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {result.confidence >= 90 ? "تشخيص عالي الثقة" : result.confidence >= 75 ? "تشخيص جيد" : "يُنصح بمراجعة خبير"}
              </p>
            </div>

            {/* Expert Consultation CTA */}
            {result.expertConsultation && (
              <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white">
                <div className="w-10 h-10 bg-[#C9A227] rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black mb-2">استشر مهندساً زراعياً</h3>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  للحصول على تشخيص دقيق وخطة علاجية مخصصة، تواصل مع أحد خبرائنا الزراعيين المعتمدين
                </p>
                <button
                  onClick={() => setShowConsultation(true)}
                  className="w-full bg-[#C9A227] hover:bg-[#b8911f] text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  احجز استشارة الآن
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Healthy Plant Card */}
            {isHealthy && (
              <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white text-center">
                <CheckCircle2 className="w-12 h-12 text-[#A5D6A7] mx-auto mb-3" />
                <h3 className="font-black mb-2">نبات سليم!</h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  لم يتم اكتشاف أي أمراض. استمر في برنامج الرعاية الحالي
                </p>
              </div>
            )}

            {/* New Diagnosis */}
            <button
              onClick={onReset}
              className="w-full py-4 border-2 border-[#2E7D32] text-[#2E7D32] font-bold rounded-2xl hover:bg-[#2E7D32] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              تشخيص صورة أخرى
            </button>

            {/* History note */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                رقم التحليل: <span className="font-mono font-bold text-[#263238]">{result.analysisId}</span>
                <br />
                <span className="text-gray-300">احتفظ بهذا الرقم للمرجعية</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {showConsultation && (
        <ConsultationModal result={result} onClose={() => setShowConsultation(false)} />
      )}
    </div>
  );
}
