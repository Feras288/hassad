import { Bell, CheckCheck, ShoppingBag } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DashboardNotifications() {
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.orders.notifications.mine.useQuery(undefined, { refetchInterval: 20_000 });
  const setRead = trpc.orders.notifications.setRead.useMutation({ onSuccess: () => utils.orders.notifications.mine.invalidate(), onError: () => toast.error("تعذر تحديث الإشعار") });
  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((notification) => !notification.isRead);
  const markAllRead = async () => {
    await Promise.all(unread.map((notification) => setRead.mutateAsync({ id: notification.id, isRead: true })));
    toast.success("تم تعيين جميع الإشعارات كمقروءة");
  };

  return <DashboardLayout breadcrumb={[{ label: "لوحة التحكم", href: "/dashboard" }, { label: "الإشعارات" }]}><main className="max-w-3xl p-4 md:p-6" dir="rtl"><div className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-xl font-black text-gray-800">الإشعارات</h1>{unread.length > 0 && <p className="mt-1 text-sm text-gray-500">{unread.length.toLocaleString("ar-SA")} إشعار غير مقروء</p>}</div>{unread.length > 0 && <button onClick={markAllRead} disabled={setRead.isPending} className="inline-flex items-center gap-2 text-sm font-bold text-[#2E7D32] disabled:opacity-50"><CheckCheck className="h-4 w-4" />تعيين الكل كمقروء</button>}</div><section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">{notificationsQuery.isLoading ? <p className="p-7 text-center text-sm text-gray-500">جارٍ تحميل الإشعارات…</p> : notifications.length === 0 ? <div className="p-12 text-center"><Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" /><h2 className="font-bold text-gray-600">لا توجد إشعارات محفوظة</h2><p className="mt-2 text-sm leading-6 text-gray-500">ستظهر تحديثات الطلبات الفعلية هنا.</p></div> : notifications.map((notification) => <button key={notification.id} onClick={() => !notification.isRead && setRead.mutate({ id: notification.id, isRead: true })} className={`flex w-full items-start gap-4 border-b border-gray-50 p-4 text-right last:border-0 hover:bg-gray-50/60 ${notification.isRead ? "" : "bg-green-50/30"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-100 text-green-700"><ShoppingBag className="h-5 w-5" /></span><span className="min-w-0 flex-1"><b className={`block text-sm ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>{notification.title}</b><span className="mt-1 block text-sm leading-6 text-gray-600">{notification.message}</span><time className="mt-2 block text-xs text-gray-400">{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.createdAt))}</time></span>{!notification.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2E7D32]" />}</button>)}</section></main></DashboardLayout>;
}
