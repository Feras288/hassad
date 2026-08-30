/*
 * HASAAD PLATFORM — Product Availability Requests
 * Admin work queue: request intake, supplier recommendations, notification delivery, and follow-up.
 */
import { useMemo, useState } from "react";
import { BellRing, Building2, CheckCircle2, ClipboardList, Mail, MapPin, MessageSquareText, PackageSearch, Phone, Search, X } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";

const statusConfig = {
  new: { label: "جديد", className: "bg-blue-400/10 text-blue-300" },
  contacted: { label: "تم التواصل", className: "bg-amber-400/10 text-amber-300" },
  sourcing: { label: "جارٍ التوفير", className: "bg-purple-400/10 text-purple-300" },
  fulfilled: { label: "تم التوفير", className: "bg-emerald-400/10 text-emerald-300" },
  closed: { label: "مغلق", className: "bg-slate-400/10 text-slate-300" },
} as const;

type RequestStatus = keyof typeof statusConfig;

export default function AdminProductAvailabilityRequests() {
  const utils = trpc.useUtils();
  const requestsQuery = trpc.productAvailabilityRequests.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | RequestStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState<RequestStatus>("new");
  const [adminNote, setAdminNote] = useState("");
  const matchesQuery = trpc.productAvailabilityRequests.matches.useQuery(
    { requestId: selectedId ?? "pending" },
    { enabled: Boolean(selectedId), staleTime: 30_000 },
  );
  const updateMutation = trpc.productAvailabilityRequests.update.useMutation({
    onSuccess: () => {
      utils.productAvailabilityRequests.adminList.invalidate();
      toast.success("تم تحديث الطلب");
    },
    onError: () => toast.error("تعذر تحديث الطلب"),
  });

  const requests = requestsQuery.data ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar-SA");
    return requests.filter((request) => {
      const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
      const matchesSearch = !query || `${request.requestedProduct} ${request.requesterName} ${request.phone} ${request.city ?? ""}`.toLocaleLowerCase("ar-SA").includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, selectedStatus]);
  const selected = requests.find((request) => request.id === selectedId);
  const newCount = requests.filter((request) => request.status === "new").length;

  const openRequest = (id: string) => {
    const request = requests.find((item) => item.id === id);
    setSelectedId(id);
    setAdminNote(request?.adminNote ?? "");
    setSelectedRequestStatus(request?.status ?? "new");
  };

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8" dir="rtl">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400"><PackageSearch className="h-4 w-4" /><span className="text-xs font-bold">متابعة الطلبات</span></div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">طلبات توفير المنتجات</h1>
              <p className="mt-2 text-sm text-slate-400">طلبات المزارعين للمنتجات غير المتاحة، مع ترشيحات تلقائية للموردين المناسبين.</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3"><p className="text-xs text-emerald-200">طلبات جديدة</p><p className="mt-1 text-2xl font-black text-white">{newCount}</p></div>
          </div>

          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pr-9 pl-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400" placeholder="ابحث باسم المنتج أو المزارع أو الجوال..." /></div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">{(["all", "new", "contacted", "sourcing", "fulfilled", "closed"] as const).map((status) => <button key={status} onClick={() => setSelectedStatus(status)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${selectedStatus === status ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{status === "all" ? "الكل" : statusConfig[status].label}</button>)}</div>
          </div>

          {requestsQuery.isLoading ? <div className="grid gap-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-900" />)}</div> : requestsQuery.isError ? <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-16 text-center"><MessageSquareText className="mx-auto h-9 w-9 text-amber-300" /><p className="mt-3 text-sm font-bold text-slate-200">لا يمكن عرض طلبات التوفير بهذا الحساب</p><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">سجّل الدخول بحساب مدير النظام للوصول إلى بيانات المزارعين وطلبات التوريد.</p></div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center"><ClipboardList className="mx-auto h-9 w-9 text-slate-600" /><p className="mt-3 text-sm font-bold text-slate-300">لا توجد طلبات مطابقة</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-bold text-slate-500 md:grid"><span>المنتج المطلوب</span><span>المزارع</span><span>المدينة والكمية</span><span>الحالة</span><span /></div>
            {filtered.map((request) => <button key={request.id} onClick={() => openRequest(request.id)} className="grid w-full gap-2 border-b border-slate-800 px-4 py-4 text-right transition-colors hover:bg-slate-800/60 last:border-b-0 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] md:items-center md:gap-4 md:px-5"><span><span className="block text-sm font-black text-white">{request.requestedProduct}</span><span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString("ar-SA")}{request.ownerNotificationDelivered && <><span className="text-slate-700">•</span><BellRing className="h-3 w-3 text-emerald-400" />تم الإشعار</>}</span></span><span><span className="block text-sm font-bold text-slate-300">{request.requesterName}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" />{request.phone}</span></span><span className="text-xs text-slate-400"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{request.city || "غير محدد"}</span><span className="mt-1 block">{request.quantity || "الكمية غير محددة"}</span></span><span><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[request.status].className}`}>{statusConfig[request.status].label}</span></span><span className="text-xs font-bold text-emerald-400">عرض</span></button>)}
          </div>}
        </div>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-end bg-black/60 sm:items-center sm:justify-center sm:p-5" dir="rtl">
        <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] bg-slate-900 p-5 shadow-2xl sm:max-w-xl sm:rounded-[26px]">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold text-emerald-400">طلب توفير</p><h2 className="mt-1 text-xl font-black text-white">{selected.requestedProduct}</h2></div><button onClick={() => setSelectedId(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-800/70 p-4 sm:grid-cols-2"><p className="text-sm text-slate-300"><span className="block text-xs text-slate-500">المزارع</span>{selected.requesterName}</p><p className="text-sm text-slate-300"><span className="block text-xs text-slate-500">الجوال</span>{selected.phone}</p><p className="text-sm text-slate-300"><span className="block text-xs text-slate-500">المدينة</span>{selected.city || "غير محدد"}</p><p className="text-sm text-slate-300"><span className="block text-xs text-slate-500">الكمية</span>{selected.quantity || "غير محددة"}</p></div>
          <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs ${selected.ownerNotificationDelivered ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}><BellRing className="h-4 w-4" />{selected.ownerNotificationDelivered ? "تم إرسال إشعار فوري لمدير النظام عند وصول الطلب." : "تم حفظ الطلب، لكن تعذر تأكيد تسليم الإشعار الفوري."}</div>
          {selected.notes && <div className="mt-3 rounded-xl border border-slate-700 p-3 text-sm leading-6 text-slate-300"><span className="mb-1 block text-xs text-slate-500">ملاحظات المزارع</span>{selected.notes}</div>}
          <section className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4" aria-labelledby="matched-suppliers-title">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-400" /><h3 id="matched-suppliers-title" className="text-sm font-black text-white">موردون مقترحون تلقائياً</h3></div><span className="text-xs text-emerald-300">حسب نوع المنتج</span></div>
            {matchesQuery.isLoading ? <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-800" /> : matchesQuery.data && matchesQuery.data.length > 0 ? <div className="mt-3 space-y-2">{matchesQuery.data.map((match) => <div key={match.id} className="rounded-xl bg-slate-800/80 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-100">{match.vendorName}</p><p className="mt-1 text-xs text-slate-400">{match.vendorCategory} • {match.vendorLocation}</p></div><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-black text-emerald-300">{match.matchScore}% تطابق</span></div><p className="mt-2 text-xs text-slate-400">{match.matchReason}</p><div className="mt-2 flex gap-2"><a href={`tel:${match.vendorPhone}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-600"><Phone className="h-3 w-3" />اتصال</a><a href={`mailto:${match.vendorEmail}?subject=${encodeURIComponent(`طلب توفير: ${selected.requestedProduct}`)}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-600"><Mail className="h-3 w-3" />مراسلة</a></div></div>)}</div> : <p className="mt-3 text-xs leading-6 text-slate-400">لا يوجد مورد مطابق نشط حالياً؛ يمكن لفريق التوريد متابعة الطلب يدوياً.</p>}
          </section>
          <div className="mt-4"><label className="text-sm font-bold text-slate-300">حالة المتابعة</label><select value={selectedRequestStatus} onChange={(event) => setSelectedRequestStatus(event.target.value as RequestStatus)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none">{Object.entries(statusConfig).map(([status, config]) => <option key={status} value={status}>{config.label}</option>)}</select></div>
          <div className="mt-4"><label className="text-sm font-bold text-slate-300">ملاحظة داخلية</label><textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none" placeholder="إجراء التوريد أو نتيجة التواصل..." /></div>
          <button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: selected.id, status: selectedRequestStatus, adminNote })} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950 disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />حفظ المتابعة</button>
        </div>
      </div>}
    </AdminLayout>
  );
}
