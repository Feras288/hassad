import { useRef, useState } from "react";
import { Crop, LockKeyhole, RotateCcw, RotateCw, UnlockKeyhole, ZoomIn } from "lucide-react";

type CropResult = { fileName: string; dataUrl: string };
type Props = { source: string; fileName: string; onCancel: () => void; onConfirm: (result: CropResult) => void };

const OUTPUT_LONG_EDGE = 1600;
const FIXED_RATIO = 4 / 3;

export default function ProduceImageCropDialog({ source, fileName, onCancel, onConfirm }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [isFixedRatio, setIsFixedRatio] = useState(true);
  const [freeRatio, setFreeRatio] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const targetRatio = isFixedRatio ? FIXED_RATIO : freeRatio;

  const reset = () => { setZoom(1); setPositionX(50); setPositionY(50); setRotation(0); };
  const saveCrop = () => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    setIsSaving(true);
    const quarterTurn = Math.abs(rotation % 180) === 90;
    const sourceRatio = quarterTurn ? 1 / targetRatio : targetRatio;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let cropWidth = imageRatio > sourceRatio ? image.naturalHeight * sourceRatio : image.naturalWidth;
    let cropHeight = imageRatio > sourceRatio ? image.naturalHeight : image.naturalWidth / sourceRatio;
    cropWidth /= zoom;
    cropHeight /= zoom;
    const sourceX = Math.max(0, Math.min(image.naturalWidth - cropWidth, (image.naturalWidth - cropWidth) * (positionX / 100)));
    const sourceY = Math.max(0, Math.min(image.naturalHeight - cropHeight, (image.naturalHeight - cropHeight) * (positionY / 100)));
    const outputWidth = OUTPUT_LONG_EDGE;
    const outputHeight = Math.round(OUTPUT_LONG_EDGE / targetRatio);
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) { setIsSaving(false); return; }
    context.translate(outputWidth / 2, outputHeight / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, quarterTurn ? -outputHeight / 2 : -outputWidth / 2, quarterTurn ? -outputWidth / 2 : -outputHeight / 2, quarterTurn ? outputHeight : outputWidth, quarterTurn ? outputWidth : outputHeight);
    const croppedName = fileName.replace(/\.[^/.]+$/, "") + "-optimized.jpg";
    onConfirm({ fileName: croppedName, dataUrl: canvas.toDataURL("image/jpeg", 0.82) });
  };

  return <div className="fixed inset-0 z-[95] flex items-end bg-black/55 sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-label="اقتصاص صورة المحصول"><div className="w-full max-h-[94vh] overflow-y-auto rounded-t-3xl bg-white p-4 sm:max-w-xl sm:rounded-3xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#377B4C]"><Crop className="h-4 w-4" />ضبط صورة المحصول</p><h2 className="mt-1 text-xl font-extrabold text-[#193C2B]">اقتصص الصورة قبل رفعها</h2><p className="mt-1 text-xs leading-5 text-[#6C7C70]">تُحوّل الصورة إلى JPEG محسّن وتُضغط تلقائياً لتسريع تحميل بطاقات المحاصيل.</p></div><button type="button" onClick={onCancel} className="min-h-10 rounded-xl px-2 text-lg text-[#647269]" aria-label="إلغاء الاقتصاص">×</button></div><div className="relative mx-auto mt-5 max-h-[48vh] overflow-hidden rounded-2xl bg-[#EDF3EA]" style={{ aspectRatio: targetRatio }}><img ref={imageRef} src={source} alt="معاينة اقتصاص صورة المحصول" className="h-full w-full object-cover" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: `${positionX}% ${positionY}%` }} /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/75" /><div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-dashed border-white/80" /><div className="pointer-events-none absolute inset-x-0 bottom-1/3 border-t border-dashed border-white/80" /></div><div className="mt-4 space-y-3 rounded-2xl bg-[#F6FAF4] p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-[#425B48]">نسبة الاقتصاص</p><button type="button" onClick={() => setIsFixedRatio((current) => !current)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-[#2E7043]">{isFixedRatio ? <LockKeyhole className="h-3.5 w-3.5" /> : <UnlockKeyhole className="h-3.5 w-3.5" />}{isFixedRatio ? "نسبة موحدة 4:3" : "قص حر"}</button></div>{!isFixedRatio && <label className="block text-xs font-bold text-[#425B48]">أبعاد القص الحر <span className="float-left text-[#6B7D6F]">{freeRatio.toFixed(1)} : 1</span><input type="range" min="0.65" max="1.8" step="0.05" value={freeRatio} onChange={(event) => setFreeRatio(Number(event.target.value))} className="mt-2 w-full accent-[#287343]" /></label>}<label className="block text-xs font-bold text-[#425B48]">التكبير <span className="float-left text-[#6B7D6F]">{zoom.toFixed(1)}×</span><input type="range" min="1" max="2.5" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-[#287343]" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-[#425B48]">أفقي<input type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} className="mt-2 w-full accent-[#287343]" /></label><label className="text-xs font-bold text-[#425B48]">عمودي<input type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} className="mt-2 w-full accent-[#287343]" /></label></div><div className="flex items-center justify-between border-t border-[#DEE9DB] pt-3"><span className="text-xs font-bold text-[#425B48]">تدوير الصورة</span><div className="flex gap-2"><button type="button" onClick={() => setRotation((current) => current - 90)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-white px-3 text-xs font-bold text-[#2E7043]"><RotateCcw className="h-4 w-4" />90°</button><button type="button" onClick={() => setRotation((current) => current + 90)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-white px-3 text-xs font-bold text-[#2E7043]"><RotateCw className="h-4 w-4" />90°</button></div></div></div><div className="mt-5 flex gap-3"><button type="button" onClick={saveCrop} disabled={isSaving} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F6B45] px-4 text-sm font-extrabold text-white disabled:opacity-60"><ZoomIn className="h-4 w-4" />{isSaving ? "جاري تجهيز الصورة…" : "اعتماد ورفع الصورة"}</button><button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#D7E4D4] px-3 text-sm font-bold text-[#47644E]"><RotateCcw className="h-4 w-4" />إعادة ضبط</button></div></div></div>;
}
