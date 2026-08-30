import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCheck, ChevronLeft, ChevronRight, CircleCheck, Clock3, Filter, Inbox, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { AdminNotificationHistoryFilters, AdminNotificationRecord, filterAdminNotificationHistory } from "@/lib/adminNotificationHistory";

const PAGE_SIZE = 15;

function formatNotificationTime(value: Date | string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} ي`;
}

export default function AdminNotifications() {
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const historyQuery = trpc.adminNotifications.history.useQuery(undefined, { retry: false, refetchInterval: 30_000 });
  const [filters, setFilters] = useState<AdminNotificationHistoryFilters>({ query: "", type: "all", readState: "all", age: "all" });
  const [page, setPage] = useState(1);
  const notifications = historyQuery.data ?? [];
  const filtered = useMemo(() => filterAdminNotificationHistory(notifications, filters), [notifications, filters]);
  const unreadNotifications = filtered.filter((notification) => !notification.isRead);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageNotifications = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const setReadMutation = trpc.adminNotifications.setRead.useMutation({
    onSuccess: () => {
      utils.adminNotifications.list.invalidate();
      utils.adminNotifications.history.invalidate();
    },
    onError: () => toast.error("تعذر تحديث حالة الإشعار"),
  });
  const markAllMutation = trpc.adminNotifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.adminNotifications.list.invalidate();
      utils.adminNotifications.history.invalidate();
      toast.success("تم تحديد الإشعارات المعروضة كمقروءة");
    },
    onError: () => toast.error("تعذر تحديث الإشعارات"),
  });

  useEffect(() => { setPage(1); }, [filters]);

  const openNotification = (notification: AdminNotificationRecord) => {
    if (!notification.isRead) setReadMutation.mutate({ notificationKey: notification.id, isRead: true });
    setLocation(notification.href);
  };

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8" dir="rtl">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400"><Bell className="h-4 w-4" /><span className="text-xs font-bold">مركز المتابعة</span></div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">سجل الإشعارات</h1>
              <p className="mt-2 text-sm text-slate-400">تابع الاستفسارات وطلبات التوفير الحالية والسابقة، ثم انتقل مباشرة إلى القسم المعني.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3"><p className="text-xs text-emerald-200">غير مقروءة ضمن النتائج</p><p className="mt-1 text-2xl font-black text-white">{unreadNotifications.length}</p></div>
              <button
                type="button"
                disabled={unreadNotifications.length === 0 || markAllMutation.isPending}
                onClick={() => markAllMutation.mutate({ notificationKeys: unreadNotifications.map((notification) => notification.id) })}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              ><CheckCheck className="h-4 w-4" />تحديد النتائج كمقروءة</button>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pr-9 pl-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400" placeholder="ابحث بعنوان الإشعار أو اسم المزارع..." /></div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0"><Filter className="h-4 w-4 shrink-0 text-slate-500" />{([ ["all", "الكل"], ["contact", "الاستفسارات"], ["availability", "طلبات التوفير"] ] as const).map(([type, label]) => <button key={type} onClick={() => setFilters((current) => ({ ...current, type }))} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${filters.type === type ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{label}</button>)}</div>
            </div>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">{([ ["all", "كل الحالات"], ["unread", "غير مقروءة"], ["read", "مقروءة"] ] as const).map(([readState, label]) => <button key={readState} onClick={() => setFilters((current) => ({ ...current, readState }))} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${filters.readState === readState ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{label}</button>)}</div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0"><Clock3 className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500" />{([ ["all", "كل الفترات"], ["day", "آخر 24 ساعة"], ["week", "آخر أسبوع"], ["older", "أقدم من أسبوع"] ] as const).map(([age, label]) => <button key={age} onClick={() => setFilters((current) => ({ ...current, age }))} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${filters.age === age ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{label}</button>)}</div>
            </div>
          </div>

          {historyQuery.isLoading ? <div className="grid gap-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-900" />)}</div> : historyQuery.isError ? <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-16 text-center"><AlertTriangle className="mx-auto h-9 w-9 text-amber-300" /><p className="mt-3 text-sm font-bold text-slate-200">لا يمكن عرض سجل الإشعارات بهذا الحساب</p><p className="mt-2 text-xs leading-6 text-slate-400">سجّل الدخول بحساب مدير النظام للوصول إلى سجل المتابعة.</p></div> : pageNotifications.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center"><Inbox className="mx-auto h-9 w-9 text-slate-600" /><p className="mt-3 text-sm font-bold text-slate-300">لا توجد إشعارات مطابقة</p><p className="mt-2 text-xs text-slate-500">جرّب تغيير عبارة البحث أو معايير التصفية.</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">{pageNotifications.map((notification) => <div key={notification.id} className={`flex items-stretch gap-2 border-b border-slate-800 px-4 py-4 last:border-b-0 sm:px-5 ${notification.isRead ? "bg-transparent" : "bg-emerald-500/5"}`}><button type="button" onClick={() => openNotification(notification)} className="flex min-w-0 flex-1 items-start gap-3 text-right"><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.type === "availability" ? "bg-amber-500/15 text-amber-300" : "bg-sky-500/15 text-sky-300"}`}>{notification.type === "availability" ? <AlertTriangle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-black text-white">{notification.title}</span>{!notification.isRead && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">غير مقروء</span>}<span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">{notification.type === "availability" ? "طلب توفير" : "استفسار"}</span></span><span className="mt-1 block text-xs text-slate-400">{notification.message}</span><span className="mt-2 flex items-center gap-2 text-[11px] text-slate-500"><span>{formatNotificationTime(notification.createdAt)}</span><span>•</span><span>{new Date(notification.createdAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</span></span></span></button>{!notification.isRead ? <button type="button" title="تحديد كمقروء" disabled={setReadMutation.isPending} onClick={() => setReadMutation.mutate({ notificationKey: notification.id, isRead: true })} className="self-center rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-emerald-300 disabled:opacity-40"><CheckCheck className="h-4 w-4" /></button> : <span className="self-center rounded-xl p-2.5 text-emerald-400"><CircleCheck className="h-4 w-4" /></span>}</div>)}</div>}

          {filtered.length > PAGE_SIZE && <div className="mt-5 flex items-center justify-between"><p className="text-xs text-slate-500">عرض {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} من {filtered.length}</p><div className="flex gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40"><ChevronRight className="h-4 w-4" />السابق</button><button type="button" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40">التالي<ChevronLeft className="h-4 w-4" /></button></div></div>}
        </div>
      </div>
    </AdminLayout>
  );
}
