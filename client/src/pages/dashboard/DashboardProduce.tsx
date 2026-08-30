import { ChangeEvent, useState } from "react";
import { ChevronLeft, ChevronRight, FileCheck2, GripVertical, ImagePlus, MessageSquareText, PauseCircle, Pencil, PlayCircle, Plus, Sprout, Star, Wheat } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProduceQuoteThread from "@/components/produce/ProduceQuoteThread";
import ProduceQuoteAlerts from "@/components/produce/ProduceQuoteAlerts";
import ProduceImageCropDialog from "@/components/produce/ProduceImageCropDialog";
import { trpc } from "@/lib/trpc";
import { isHeicImage, isSupportedProduceImage, prepareProduceImage } from "@/lib/prepareProduceImage";

type Certificate = { name: string; url: string };
type CropTarget = { source: string; fileName: string };
type ProduceListingForm = { title: string; cropType: string; variety: string; grade: string; location: string; harvestDate: string; availableQuantity: string; unit: string; minOrderQuantity: string; priceMode: "request_quote" | "visible_to_b2b"; wholesalePrice: string; description: string; images: string[]; qualityCertificates: Certificate[]; status: "draft" | "published" | "paused" | "sold_out" | "archived" };

const emptyListing: ProduceListingForm = { title: "", cropType: "", variety: "", grade: "", location: "", harvestDate: "", availableQuantity: "", unit: "كجم", minOrderQuantity: "", priceMode: "request_quote", wholesalePrice: "", description: "", images: [], qualityCertificates: [], status: "published" };
const listingStatus: Record<string, { label: string; className: string }> = { draft: { label: "مسودة", className: "bg-[#EDF0EB] text-[#637066]" }, published: { label: "منشور", className: "bg-[#E4F3E6] text-[#21643B]" }, paused: { label: "موقوف", className: "bg-[#FFF2D9] text-[#8B601C]" }, sold_out: { label: "نفدت الكمية", className: "bg-[#F9E5E3] text-[#A44238]" }, archived: { label: "مؤرشف", className: "bg-[#EDF0EB] text-[#637066]" } };

export default function DashboardProduce() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProduceListingForm>(emptyListing);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  const enabledQuery = trpc.produceMarketplace.enabled.useQuery();
  const listingsQuery = trpc.produceMarketplace.myListings.useQuery(undefined, { enabled: Boolean(user) });
  const quoteRequestsQuery = trpc.produceMarketplace.farmerQuoteRequests.useQuery(undefined, { enabled: Boolean(user) });
  const updateField = <K extends keyof ProduceListingForm>(field: K, value: ProduceListingForm[K]) => setForm((current) => ({ ...current, [field]: value }));
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= form.images.length) return;
    const images = [...form.images];
    const [image] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, image);
    updateField("images", images);
  };
  const setCoverImage = (index: number) => moveImage(index, 0);

  const uploadImage = trpc.produceMarketplace.uploadListingImage.useMutation({
    onSuccess: ({ url }) => { setForm((current) => ({ ...current, images: [...current.images, url].slice(0, 5) })); toast.success("تم رفع الصورة بعد ضبط أبعادها"); },
    onError: (error) => toast.error(error.message),
  });
  const uploadCertificate = trpc.produceMarketplace.uploadQualityCertificate.useMutation({
    onSuccess: (certificate) => { setForm((current) => ({ ...current, qualityCertificates: [...current.qualityCertificates, certificate].slice(0, 5) })); toast.success("تم رفع شهادة الجودة"); },
    onError: (error) => toast.error(error.message),
  });
  const createListing = trpc.produceMarketplace.createListing.useMutation({
    onSuccess: async () => { setForm(emptyListing); setFormOpen(false); toast.success("تم حفظ عرض المحصول"); await Promise.all([utils.produceMarketplace.myListings.invalidate(), utils.produceMarketplace.listings.invalidate()]); },
    onError: (error) => toast.error(error.message),
  });
  const updateListing = trpc.produceMarketplace.updateListing.useMutation({
    onSuccess: async () => { await Promise.all([utils.produceMarketplace.myListings.invalidate(), utils.produceMarketplace.listings.invalidate()]); toast.success("تم تحديث حالة العرض"); },
    onError: (error) => toast.error(error.message),
  });
  const saveListing = trpc.produceMarketplace.updateListing.useMutation({
    onSuccess: async () => { setForm(emptyListing); setEditingListingId(null); setFormOpen(false); toast.success("تم حفظ تعديلات عرض المحصول"); await Promise.all([utils.produceMarketplace.myListings.invalidate(), utils.produceMarketplace.listings.invalidate()]); },
    onError: (error) => toast.error(error.message),
  });

  const readFile = async (event: ChangeEvent<HTMLInputElement>, kind: "image" | "certificate") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const accepted = kind === "image" ? isSupportedProduceImage(file) : isSupportedProduceImage(file) || file.type === "application/pdf";
    const maxBytes = kind === "image" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!accepted || file.size > maxBytes) {
      toast.error(kind === "image" ? "اختر صورة HEIC أو PNG أو JPG أو WEBP بحجم لا يتجاوز 15 ميجابايت" : "ارفع شهادة PDF أو صورة بحجم لا يتجاوز 5 ميجابايت");
      return;
    }
    let preparedFile = file;
    try {
      if (kind === "image" && isHeicImage(file)) {
        toast.info("جاري تحويل صورة HEIC قبل الاقتصاص…");
        preparedFile = await prepareProduceImage(file);
      }
    } catch {
      toast.error("تعذر تحويل صورة HEIC. جرّب اختيار نسخة JPG من الهاتف.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      if (kind === "image") setCropTarget({ source: dataUrl, fileName: preparedFile.name });
      else uploadCertificate.mutate({ fileName: preparedFile.name, dataUrl });
    };
    reader.readAsDataURL(preparedFile);
  };
  const submitListing = () => {
    const quantity = Number(form.availableQuantity);
    const minimum = Number(form.minOrderQuantity);
    const price = form.wholesalePrice ? Number(form.wholesalePrice) : null;
    if (!form.title.trim() || !form.cropType.trim() || !form.location.trim() || !Number.isInteger(quantity) || !Number.isInteger(minimum) || form.images.length === 0) {
      toast.error("أكمل بيانات المحصول والكمية والحد الأدنى والموقع وأضف صورة واحدة على الأقل");
      return;
    }
    const payload = { title: form.title.trim(), cropType: form.cropType.trim(), variety: form.variety.trim() || null, grade: form.grade.trim() || null, location: form.location.trim(), harvestDate: form.harvestDate ? new Date(`${form.harvestDate}T12:00:00`) : null, availableQuantity: quantity, unit: form.unit.trim(), minOrderQuantity: minimum, priceMode: form.priceMode, wholesalePrice: price, description: form.description.trim() || null, images: form.images, qualityCertificates: form.qualityCertificates, status: form.status };
    if (editingListingId) saveListing.mutate({ id: editingListingId, updates: payload });
    else createListing.mutate(payload);
  };

  return <DashboardLayout title="تسويق المحاصيل" breadcrumb={[{ label: "الرئيسية", href: "/dashboard" }, { label: "تسويق المحاصيل" }]}> 
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {user && <ProduceQuoteAlerts />}
      {!enabledQuery.isLoading && !enabledQuery.data && <div className="mb-5 rounded-2xl border border-[#F1D9A8] bg-[#FFF9EC] p-5 text-[#755019]"><h1 className="font-extrabold">خدمة تسويق المحاصيل متوقفة حالياً</h1><p className="mt-1 text-sm leading-6">يمكنك مراجعة عروضك السابقة، لكن لا يمكن إضافة أو نشر عروض جديدة إلى أن تعيد الإدارة تشغيل الخدمة.</p></div>}
      <section className="overflow-hidden rounded-3xl bg-[#173E2C] p-5 text-white sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold"><Wheat className="h-4 w-4 text-[#F2C76D]" />سوق المحاصيل B2B</div><h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">اعرض محصولك لمشتري الجملة</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[#D7E5DA]">أضف الكمية والموقع والصور وشهادات الجودة، واختر تسعيراً بالتفاوض أو سعراً حصرياً للحسابات المعتمدة.</p></div><button type="button" onClick={() => { setForm(emptyListing); setEditingListingId(null); setFormOpen(true); }} disabled={!enabledQuery.data} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-[#173E2C] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" />إضافة عرض محصول</button></div></section>
      <section className="mt-7"><div className="flex items-end justify-between"><div><p className="text-sm font-bold text-[#408157]">عروضي</p><h2 className="mt-1 text-xl font-extrabold text-[#193C2B]">إدارة المحاصيل المعروضة</h2></div><span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#41634D]">{(listingsQuery.data?.length ?? 0).toLocaleString("ar-SA")} عرض</span></div><div className="mt-4 grid gap-4 md:grid-cols-2">{listingsQuery.isLoading && Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-3xl bg-[#E8EEE5]" />)}{!listingsQuery.isLoading && (listingsQuery.data?.length ?? 0) === 0 && <div className="rounded-3xl border border-dashed border-[#C9D8C7] bg-white p-8 text-center md:col-span-2"><Sprout className="mx-auto h-10 w-10 text-[#719779]" /><p className="mt-3 font-bold text-[#193C2B]">لم تضف عروض محاصيل بعد</p><p className="mt-1 text-sm text-[#66756B]">ابدأ بعرض محصول واحد للوصول إلى الشركات والتجار والمطاعم المعتمدة.</p></div>}{listingsQuery.data?.map((listing) => { const status = listingStatus[listing.status] ?? listingStatus.draft; return <article key={listing.id} className="rounded-3xl border border-[#DFE8DD] bg-white p-4"><div className="flex gap-3"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#E9F0E4]">{listing.images[0] ? <img src={listing.images[0]} alt={`غلاف ${listing.title}`} className="h-full w-full object-cover" /> : <Wheat className="m-6 h-8 w-8 text-[#5D9468]" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate font-extrabold text-[#193C2B]">{listing.title}</h3><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span></div><p className="mt-1 text-sm text-[#66756B]">{listing.availableQuantity.toLocaleString("ar-SA")} {listing.unit} · الحد الأدنى {listing.minOrderQuantity.toLocaleString("ar-SA")} {listing.unit}</p><p className="mt-1 text-xs text-[#849087]">{listing.location} · {listing.priceMode === "request_quote" ? "طلب تسعير" : "سعر ظاهر للحسابات المعتمدة"}</p>{(listing.qualityCertificates?.length ?? 0) > 0 && <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#277043]"><FileCheck2 className="h-3.5 w-3.5" />{listing.qualityCertificates?.length} شهادة جودة مرفوعة</p>}</div></div><div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF2EC] pt-3"><button type="button" onClick={() => { setEditingListingId(listing.id); setForm({ title: listing.title, cropType: listing.cropType, variety: listing.variety ?? "", grade: listing.grade ?? "", location: listing.location, harvestDate: listing.harvestDate ? new Date(listing.harvestDate).toISOString().slice(0, 10) : "", availableQuantity: String(listing.availableQuantity), unit: listing.unit, minOrderQuantity: String(listing.minOrderQuantity), priceMode: listing.priceMode, wholesalePrice: listing.wholesalePrice ? String(listing.wholesalePrice) : "", description: listing.description ?? "", images: listing.images, qualityCertificates: listing.qualityCertificates ?? [], status: listing.status }); setFormOpen(true); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#EEF7ED] px-3 text-sm font-bold text-[#21643B]"><Pencil className="h-4 w-4" />تحرير الصور</button>{listing.status === "published" ? <button type="button" onClick={() => updateListing.mutate({ id: listing.id, updates: { status: "paused" } })} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#FFF2D9] px-3 text-sm font-bold text-[#8B601C]"><PauseCircle className="h-4 w-4" />إيقاف العرض</button> : <button type="button" onClick={() => updateListing.mutate({ id: listing.id, updates: { status: "published" } })} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#E4F3E6] px-3 text-sm font-bold text-[#21643B]"><PlayCircle className="h-4 w-4" />نشر العرض</button>}<span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#F4F6F2] px-3 text-sm font-bold text-[#66756B]"><MessageSquareText className="h-4 w-4" />طلبات التسعير في الأسفل</span></div></article>; })}</div></section>
      <section className="mt-8 rounded-3xl border border-[#DFE8DD] bg-white p-4 sm:p-6"><div><p className="text-sm font-bold text-[#408157]">طلبات تسعير العملاء</p><h2 className="mt-1 text-xl font-extrabold text-[#193C2B]">المفاوضات الواردة</h2><p className="mt-1 text-sm text-[#66756B]">تظهر الطلبات الجديدة هنا؛ تواصل مع المشتري وقدّم سعراً للوحدة ثم اقبل أو ارفض الاتفاق.</p></div><div className="mt-5 space-y-4">{quoteRequestsQuery.isLoading && <div className="h-36 animate-pulse rounded-2xl bg-[#F0F4EE]" />}{!quoteRequestsQuery.isLoading && (quoteRequestsQuery.data?.length ?? 0) === 0 && <p className="rounded-2xl bg-[#F7F9F5] p-5 text-center text-sm text-[#6B7A6E]">لا توجد طلبات تسعير حتى الآن.</p>}{user && quoteRequestsQuery.data?.map((quote) => <ProduceQuoteThread key={quote.id} quote={quote} currentUserId={user.id} counterpartName={quote.buyerBusinessName} canDecide />)}</div></section>
    </div>
    {formOpen && <div className="fixed inset-0 z-[80] flex items-end bg-black/45 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={editingListingId ? "تحرير صور عرض المحصول" : "إضافة عرض محصول"}><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-2xl sm:rounded-3xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-[#193C2B]">{editingListingId ? "تحرير عرض المحصول" : "إضافة عرض محصول"}</h2><p className="mt-1 text-sm text-[#66756B]">{editingListingId ? "أضف الصور أو احذفها أو اختر الغلاف ثم احفظ التعديلات." : "تصل بيانات العرض فقط إلى المشترين التجاريين عبر سوق المحاصيل."}</p></div><button type="button" onClick={() => { setFormOpen(false); setEditingListingId(null); }} className="rounded-xl p-2 text-[#66756B]" aria-label="إغلاق">×</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="عنوان العرض" value={form.title} onChange={(value) => updateField("title", value)} placeholder="مثال: طماطم طازجة للتموين" /><Field label="نوع المحصول" value={form.cropType} onChange={(value) => updateField("cropType", value)} placeholder="طماطم، تمر، بطاطس…" /><Field label="الصنف (اختياري)" value={form.variety} onChange={(value) => updateField("variety", value)} /><Field label="درجة الجودة (اختياري)" value={form.grade} onChange={(value) => updateField("grade", value)} placeholder="أولى، ممتاز، عضوي…" /><Field label="موقع التوفر" value={form.location} onChange={(value) => updateField("location", value)} placeholder="الرياض، القصيم…" /><label className="text-sm font-bold text-[#34483A]">تاريخ الحصاد (اختياري)<input type="date" value={form.harvestDate} onChange={(event) => updateField("harvestDate", event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#D5E2D4] px-3 text-sm" /></label><Field label="الكمية المتاحة" value={form.availableQuantity} onChange={(value) => updateField("availableQuantity", value.replace(/\D/g, ""))} inputMode="numeric" /><Field label="وحدة القياس" value={form.unit} onChange={(value) => updateField("unit", value)} placeholder="كجم، طن، صندوق" /><Field label="الحد الأدنى للطلب" value={form.minOrderQuantity} onChange={(value) => updateField("minOrderQuantity", value.replace(/\D/g, ""))} inputMode="numeric" /><label className="text-sm font-bold text-[#34483A]">طريقة التسعير<select value={form.priceMode} onChange={(event) => updateField("priceMode", event.target.value as ProduceListingForm["priceMode"])} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#D5E2D4] bg-white px-3 text-sm"><option value="request_quote">طلب تسعير وتفاوض</option><option value="visible_to_b2b">سعر جملة للحسابات المعتمدة</option></select></label>{form.priceMode === "visible_to_b2b" && <Field label="سعر الجملة للوحدة" value={form.wholesalePrice} onChange={(value) => updateField("wholesalePrice", value.replace(/\D/g, ""))} inputMode="numeric" />}</div><label className="mt-3 block text-sm font-bold text-[#34483A]">وصف العرض (اختياري)<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className="mt-1.5 min-h-24 w-full rounded-xl border border-[#D5E2D4] p-3 text-sm" placeholder="اذكر التعبئة، جاهزية التسليم، أو أي تفاصيل مهمة…" /></label><UploadGroup title="صور المحصول" help="تدعم صور HEIC من الهاتف. اضبط أبعاد كل صورة قبل الرفع، واسحبها لإعادة ترتيبها أو استخدم الأزرار على الجوال؛ الصورة الأولى هي غلاف العرض." items={form.images.map((url, index) => ({ name: index === 0 ? "صورة الغلاف" : `صورة ${index + 1}`, url }))} onRemove={(url) => updateField("images", form.images.filter((item) => item !== url))} onChange={(event) => { void readFile(event, "image"); }} accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" disabled={uploadImage.isPending} icon={<ImagePlus className="h-5 w-5" />} sortable onMove={moveImage} onSetCover={setCoverImage} draggedIndex={draggedImageIndex} onDragStart={setDraggedImageIndex} onDragEnd={() => setDraggedImageIndex(null)} /><UploadGroup title="شهادات الجودة الزراعية (اختياري)" help="ارفع شهادة عضوية أو فحص جودة أو منشأ بصيغة PDF أو صورة؛ تظهر للمشتري داخل تفاصيل العرض." items={form.qualityCertificates} onRemove={(url) => updateField("qualityCertificates", form.qualityCertificates.filter((item) => item.url !== url))} onChange={(event) => { void readFile(event, "certificate"); }} accept="application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" disabled={uploadCertificate.isPending} icon={<FileCheck2 className="h-5 w-5" />} /><div className="mt-5 flex gap-3"><button type="button" onClick={submitListing} disabled={createListing.isPending || saveListing.isPending || uploadImage.isPending || uploadCertificate.isPending} className="min-h-12 flex-1 rounded-xl bg-[#1F6B45] text-sm font-bold text-white disabled:opacity-60">{createListing.isPending || saveListing.isPending ? "جاري الحفظ…" : editingListingId ? "حفظ تعديلات الصور" : "حفظ ونشر العرض"}</button><button type="button" onClick={() => { setFormOpen(false); setEditingListingId(null); }} className="min-h-12 rounded-xl border border-[#D5E2D4] px-4 text-sm font-bold text-[#637066]">إلغاء</button></div></div></div>}
    {cropTarget && <ProduceImageCropDialog source={cropTarget.source} fileName={cropTarget.fileName} onCancel={() => setCropTarget(null)} onConfirm={({ fileName, dataUrl }) => { setCropTarget(null); uploadImage.mutate({ fileName, dataUrl }); }} />}
  </DashboardLayout>;
}

function Field({ label, value, onChange, placeholder, inputMode }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; inputMode?: "numeric" | "text" }) { return <label className="text-sm font-bold text-[#34483A]">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#D5E2D4] px-3 text-sm" /></label>; }

function UploadGroup({ title, help, items, onRemove, onChange, accept, disabled, icon, sortable = false, onMove, onSetCover, draggedIndex, onDragStart, onDragEnd }: { title: string; help: string; items: Certificate[]; onRemove: (url: string) => void; onChange: (event: ChangeEvent<HTMLInputElement>) => void; accept: string; disabled: boolean; icon: React.ReactNode; sortable?: boolean; onMove?: (fromIndex: number, toIndex: number) => void; onSetCover?: (index: number) => void; draggedIndex?: number | null; onDragStart?: (index: number) => void; onDragEnd?: () => void }) { return <div className="mt-4"><p className="text-sm font-bold text-[#34483A]">{title}</p><div className="mt-2 flex flex-wrap gap-2">{items.map((item, index) => <div key={item.url} draggable={sortable} onDragStart={() => sortable && onDragStart?.(index)} onDragOver={(event) => { if (sortable) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); if (sortable && draggedIndex !== null && draggedIndex !== undefined) onMove?.(draggedIndex, index); onDragEnd?.(); }} onDragEnd={onDragEnd} className={`flex min-h-24 w-36 flex-col justify-between rounded-xl border bg-[#F6FAF4] p-2 ${sortable ? "cursor-grab touch-manipulation active:cursor-grabbing" : ""} ${draggedIndex === index ? "border-[#2E7D32] opacity-50" : "border-[#D9E6D6]"}`}><div className="flex items-center gap-1">{sortable && <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#6E8E74]" />}<span className="truncate text-[10px] font-bold text-[#386746]">{item.name}</span></div>{sortable && <><div className="mt-2 flex items-center gap-1"><button type="button" onClick={() => onMove?.(index, index - 1)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#356C43] disabled:opacity-35" aria-label={`نقل ${item.name} إلى السابق`}><ChevronRight className="h-3.5 w-3.5" /></button><button type="button" onClick={() => onMove?.(index, index + 1)} disabled={index === items.length - 1} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#356C43] disabled:opacity-35" aria-label={`نقل ${item.name} إلى التالي`}><ChevronLeft className="h-3.5 w-3.5" /></button><span className="mr-auto text-[9px] font-bold text-[#6A7A6D]">{index === 0 ? "الغلاف" : index + 1}</span></div><button type="button" onClick={() => onSetCover?.(index)} disabled={index === 0} className="mt-1 inline-flex min-h-7 items-center gap-1 self-start text-[10px] font-bold text-[#286A3D] disabled:opacity-60"><Star className="h-3.5 w-3.5" fill={index === 0 ? "currentColor" : "none"} />{index === 0 ? "الغلاف الرئيسي" : "تعيين كغلاف"}</button></>}<button type="button" onClick={() => onRemove(item.url)} className="mt-1 self-start text-[11px] font-bold text-[#9D4B42]">حذف</button></div>)}{items.length < 5 && <label className="flex h-24 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#9DBAA2] text-[#447A50]">{icon}<span className="mt-1 text-[10px]">رفع صورة</span><input type="file" accept={accept} className="sr-only" onChange={onChange} disabled={disabled} /></label>}</div><p className="mt-2 text-xs leading-5 text-[#728078]">{help}</p></div>; }
