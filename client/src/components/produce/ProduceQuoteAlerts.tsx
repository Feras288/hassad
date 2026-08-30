import { useEffect, useRef } from "react";
import { BellRing, Check, MessageSquareText, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const iconByType = { new_request: BellRing, new_message: MessageSquareText, status_change: RefreshCcw };

export default function ProduceQuoteAlerts() {
  const utils = trpc.useUtils();
  const initialized = useRef(false);
  const notifiedIds = useRef(new Set<string>());
  const notifications = trpc.produceMarketplace.quoteNotifications.useQuery(undefined, { refetchInterval: 10_000, staleTime: 5_000 });
  const markRead = trpc.produceMarketplace.markQuoteNotificationRead.useMutation({ onSuccess: async () => utils.produceMarketplace.quoteNotifications.invalidate() });
  const unread = (notifications.data ?? []).filter((item) => !item.isRead);

  useEffect(() => {
    if (!notifications.data) return;
    if (!initialized.current) {
      notifications.data.forEach((item) => notifiedIds.current.add(item.id));
      initialized.current = true;
      return;
    }
    unread.filter((item) => !notifiedIds.current.has(item.id)).forEach((item) => {
      notifiedIds.current.add(item.id);
      toast.info(item.title, { description: item.message, duration: 7000 });
    });
  }, [notifications.data, unread]);

  if (notifications.isLoading || unread.length === 0) return null;
  return <section className="mb-5 rounded-2xl border border-[#CFE2CE] bg-[#F5FBF3] p-3" aria-label="تنبيهات التفاوض الجديدة"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-[#267342]" /><p className="text-sm font-extrabold text-[#1D5C32]">{unread.length.toLocaleString("ar-SA")} تنبيه تفاوض جديد</p></div><span className="rounded-full bg-[#277543] px-2 py-0.5 text-[11px] font-bold text-white">B2B</span></div><div className="mt-3 space-y-2">{unread.slice(0, 3).map((item) => { const Icon = iconByType[item.type]; return <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5"><div className="flex min-w-0 gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3B8253]" /><div><p className="text-sm font-bold text-[#294331]">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-[#65766A]">{item.message}</p></div></div><button type="button" onClick={() => markRead.mutate({ id: item.id })} disabled={markRead.isPending} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[#286A3D]" aria-label="تحديد التنبيه كمقروء"><Check className="h-4 w-4" />مقروء</button></div>; })}</div></section>;
}
