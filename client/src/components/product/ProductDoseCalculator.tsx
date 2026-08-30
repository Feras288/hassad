/*
 * HASAAD PLATFORM — Farm Dose Calculator
 * A transparent estimate: farmers supply the field size and label-recommended dose; no agronomic claim is fabricated.
 */
import { useMemo, useState } from "react";
import { Calculator, Info, Sprout } from "lucide-react";
import type { Product } from "@/lib/productsData";
import { calculateFarmDose, type DoseBasis } from "../../lib/farmDoseCalculator";
import { cropDosePresets } from "@/lib/cropDosePresets";

export default function ProductDoseCalculator({ product }: { product: Product }) {
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<"m2" | "hectare">("m2");
  const [applicationUnit, setApplicationUnit] = useState<"kg" | "liter" | "pack">("kg");
  const [doseBasis, setDoseBasis] = useState<DoseBasis>("per_1000_m2");
  const [dose, setDose] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const estimate = useMemo(() => {
    return calculateFarmDose({ area, areaUnit, dose, applicationUnit, doseBasis, productUnit: product.unit });
  }, [area, areaUnit, dose, applicationUnit, doseBasis, product.unit]);

  const unitLabel = applicationUnit === "kg" ? "كجم" : applicationUnit === "liter" ? "لتر" : "عبوة";

  return (
    <section className="rounded-[26px] border border-[#D9E7D6] bg-white p-5 shadow-[0_10px_30px_rgba(28,73,49,0.04)] sm:p-6" aria-labelledby="dose-calculator-title">
      <div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-black text-[#5D896E]"><Calculator className="h-4 w-4" />حاسبة احتياج المزرعة</p><h2 id="dose-calculator-title" className="mt-1 text-xl font-black text-[#183B29]">قدّر الكمية قبل الطلب</h2><p className="mt-2 max-w-lg text-xs leading-6 text-[#6E7E74]">أدخل مساحة الجزء المراد خدمته والجرعة الموصى بها على عبوة المنتج.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF7EC] text-[#1F6B45]"><Sprout className="h-5 w-5" /></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><label className="text-sm font-bold text-[#3B5143]">مساحة المزرعة<input inputMode="decimal" value={area} onChange={(event) => setArea(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-[#FBFDF9] px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]" placeholder="مثال: 2500" /></label><label className="text-sm font-bold text-[#3B5143]">وحدة المساحة<select value={areaUnit} onChange={(event) => setAreaUnit(event.target.value as "m2" | "hectare")} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-[#FBFDF9] px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]"><option value="m2">متر مربع</option><option value="hectare">هكتار</option></select></label><label className="text-sm font-bold text-[#3B5143]">وحدة الجرعة<select value={applicationUnit} onChange={(event) => setApplicationUnit(event.target.value as "kg" | "liter" | "pack")} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-[#FBFDF9] px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]"><option value="kg">كيلوجرام</option><option value="liter">لتر</option><option value="pack">عبوة</option></select></label><label className="text-sm font-bold text-[#3B5143]">أساس الجرعة<select value={doseBasis} onChange={(event) => setDoseBasis(event.target.value as DoseBasis)} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-[#FBFDF9] px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]"><option value="per_1000_m2">لكل ١٠٠٠ م²</option><option value="per_hectare">لكل هكتار</option></select></label><label className="text-sm font-bold text-[#3B5143]">الجرعة الموصى بها<label className="mr-1 text-xs font-normal text-[#77877D]">{unitLabel} / {doseBasis === "per_hectare" ? "هكتار" : "١٠٠٠ م²"}</label><input inputMode="decimal" value={dose} onChange={(event) => setDose(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-[#FBFDF9] px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]" placeholder="مثال: 3" /></label></div>
      <div className="mt-4 rounded-2xl border border-[#DCE8D9] bg-[#FAFCF9] p-3.5"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-black text-[#264735]">جرعات جاهزة حسب المحصول</p><p className="text-[11px] text-[#728278]">قوالب تقديرية قابلة للتعديل وفق ملصق المنتج</p></div><div className="mt-3 flex flex-wrap gap-2">{cropDosePresets.map((preset) => <button type="button" key={preset.id} aria-pressed={selectedPresetId === preset.id} onClick={() => { setSelectedPresetId(preset.id); setDose(preset.dose); setApplicationUnit(preset.applicationUnit); setDoseBasis(preset.doseBasis); }} className={`rounded-xl border px-3 py-2 text-right transition-colors ${selectedPresetId === preset.id ? "border-[#2C7A4A] bg-[#EAF5E7] text-[#1F6B45]" : "border-[#D7E4D4] bg-white text-[#536A5B] hover:border-[#93B89E]"}`}><span className="block text-xs font-black">{preset.crop}</span><span className="mt-0.5 block text-[10px]">{preset.stage} · {preset.dose} {preset.applicationUnit === "kg" ? "كجم" : preset.applicationUnit === "liter" ? "لتر" : "عبوة"}</span></button>)}</div></div>
      {estimate ? <div className="mt-4 rounded-2xl bg-[#183F2B] p-4 text-white"><p className="text-xs font-bold text-[#B7D9B8]">الكمية التقديرية المطلوبة</p><div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1"><strong className="text-3xl font-black">{estimate.quantity.toLocaleString("ar-SA", { maximumFractionDigits: 1 })} {unitLabel}</strong>{estimate.packages && <span className="pb-1 text-sm text-[#D9EBD9]">≈ {estimate.packages.toLocaleString("ar-SA")} {product.unit}</span>}</div></div> : <div className="mt-4 rounded-2xl border border-dashed border-[#D4E2D1] bg-[#F8FBF6] px-4 py-3 text-sm text-[#6E7E74]">أدخل المساحة ونوع الجرعة والكمية الموصى بها لعرض التقدير.</div>}
      <p className="mt-3 flex gap-2 text-[11px] leading-5 text-[#75847B]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A97922]" />الحساب تقديري بناءً على القيم التي أدخلتها. اتبع تعليمات الملصق واستشر المختص عند اختلاف المحصول أو طريقة التطبيق.</p>
    </section>
  );
}
