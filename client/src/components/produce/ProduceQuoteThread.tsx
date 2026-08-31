import { useState } from "react";
import { useEffect } from "react";
import { Check, MessageSquareText, Send, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type QuoteThreadProps = {
  quote: { id: string; status: "new" | "negotiating" | "accepted" | "rejected" | "cancelled"; listingTitle: string; requestedQuantity: number; listingUnit: string };
  currentUserId: string;
  counterpartName?: string | null;
  canDecide?: boolean;
  canCancel?: boolean;
};

const STATUS_LABELS: Record<QuoteThreadProps["quote"]["status"], string> = {
  new: "طلب جديد",
  negotiating: "قيد التفاوض",
  accepted: "تم الاتفاق",
  rejected: "مرفوض",
  cancelled: "ملغى",
};
const QUOTE_STEPS = ["طلب التسعير", "التفاوض", "الاتفاق"];

export default function ProduceQuoteThread({ quote, currentUserId, counterpartName, canDecide = false, canCancel = false }: QuoteThreadProps) {
  const utils = trpc.useUtils();
  const [message, setMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const isClosed = quote.status === "accepted" || quote.status === "rejected" || quote.status === "cancelled";
  const activeStep = quote.status === "new" ? 0 : quote.status === "negotiating" ? 1 : 2;
  const resolvedAs = quote.status === "rejected" ? "تم رفض طلب التسعير" : quote.status === "cancelled" ? "تم إلغاء طلب التسعير" : null;
  const messagesQuery = trpc.produceMarketplace.quoteMessages.useQuery({ quoteRequestId: quote.id }, { refetchInterval: isClosed ? false : 8_000 });
  const markMessagesRead = trpc.produceMarketplace.markQuoteMessagesRead.useMutation({
    onSuccess: async () => utils.produceMarketplace.quoteMessages.invalidate({ quoteRequestId: quote.id }),
  });
  const sendMessage = trpc.produceMarketplace.sendQuoteMessage.useMutation({
    onSuccess: async () => {
      setMessage("");
      setProposedPrice("");
      await Promise.all([
        utils.produceMarketplace.quoteMessages.invalidate({ quoteRequestId: quote.id }),
        utils.produceMarketplace.farmerQuoteRequests.invalidate(),
        utils.produceMarketplace.buyerQuoteRequests.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });
  const updateStatus = trpc.produceMarketplace.updateQuoteStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.produceMarketplace.farmerQuoteRequests.invalidate(),
        utils.produceMarketplace.buyerQuoteRequests.invalidate(),
      ]);
      toast.success("تم تحديث حالة التفاوض");
    },
    onError: (error) => toast.error(error.message),
  });

  const hasUnreadIncoming = messagesQuery.data?.some((item) => item.senderId !== currentUserId && !item.readAt) ?? false;
  useEffect(() => {
    if (hasUnreadIncoming && !markMessagesRead.isPending) markMessagesRead.mutate({ quoteRequestId: quote.id });
  }, [hasUnreadIncoming, markMessagesRead, quote.id]);

  const submitMessage = () => {
    const normalized = message.trim();
    if (!normalized) return;
    const parsedPrice = proposedPrice.trim() ? Number(proposedPrice) : null;
    if (parsedPrice !== null && (!Number.isInteger(parsedPrice) || parsedPrice <= 0)) {
      toast.error("أدخل سعر وحدة صحيحاً أو اتركه فارغاً");
      return;
    }
    sendMessage.mutate({ quoteRequestId: quote.id, message: normalized, proposedUnitPrice: parsedPrice });
  };

  return (
    <section className="rounded-2xl border border-[#DFE8DF] bg-[#FBFCF9] p-4" aria-label={`مفاوضة ${quote.listingTitle}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-[#173E2C]">{quote.listingTitle}</p>
          <p className="mt-1 text-xs text-[#66756B]">طلب {quote.requestedQuantity.toLocaleString("ar-SA")} {quote.listingUnit}{counterpartName ? ` · ${counterpartName}` : ""}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${quote.status === "accepted" ? "bg-[#E4F3E6] text-[#21643B]" : quote.status === "rejected" || quote.status === "cancelled" ? "bg-[#F9E5E3] text-[#A44238]" : "bg-[#FFF2D9] text-[#8B601C]"}`}>{STATUS_LABELS[quote.status]}</span>
      </div>

      {resolvedAs ? <div className="mb-3 rounded-xl bg-[#F9E5E3] px-3 py-2 text-sm font-bold text-[#9E4037]">{resolvedAs}</div> : <div className="mb-4" role="progressbar" aria-label="مراحل طلب التسعير" aria-valuemin={1} aria-valuemax={3} aria-valuenow={activeStep + 1} aria-valuetext={QUOTE_STEPS[activeStep]}><div className="relative flex items-start justify-between before:absolute before:left-[12%] before:right-[12%] before:top-2 before:h-0.5 before:bg-[#DCE7DA]"><span className="absolute right-[12%] top-2 h-0.5 bg-[#2E7D32] transition-[width] duration-300" style={{ width: `${activeStep * 38}%` }} /></div>{QUOTE_STEPS.map((step, index) => <div key={step} className="relative z-10 flex w-1/3 flex-col items-center text-center"><span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-extrabold ${index <= activeStep ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-[#C7D6C5] bg-white text-[#77857B]"}`}>{index + 1}</span><span className={`mt-1 text-[11px] font-bold ${index <= activeStep ? "text-[#21643B]" : "text-[#7B877D]"}`}>{step}</span></div>)}</div>}

      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#506555]"><MessageSquareText className="h-4 w-4 text-[#377B4C]" />محادثة التفاوض المباشرة</div>
      <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl bg-white p-3" aria-live="polite">
        {messagesQuery.isLoading && <p className="text-center text-sm text-[#768478]">جاري تحميل الرسائل…</p>}
        {!messagesQuery.isLoading && (messagesQuery.data?.length ?? 0) === 0 && <p className="text-center text-sm text-[#768478]">لم تُرسل رسائل بعد. ابدأ التفاوض بتوضيح الكمية أو السعر المقترح.</p>}
        {messagesQuery.data?.map((item) => {
          const mine = item.senderId === currentUserId;
          return <div key={item.id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${mine ? "mr-auto bg-[#1F6B45] text-white" : "ml-auto bg-[#F0F4EE] text-[#26372D]"}`}>
            <p className="text-[11px] font-bold opacity-75">{mine ? "أنت" : item.senderName || "الطرف الآخر"}</p>
            <p className="mt-0.5 leading-6">{item.message}</p>
            {item.proposedUnitPrice !== null && <p className={`mt-1 text-xs font-bold ${mine ? "text-[#DFF3E2]" : "text-[#21643B]"}`}>سعر مقترح: {item.proposedUnitPrice.toLocaleString("ar-SA")} ر.س / للوحدة</p>}
            {mine && <p className="mt-1 text-[10px] font-medium opacity-70">{item.readAt ? "تمت القراءة" : "تم الإرسال"}</p>}
          </div>;
        })}
      </div>

      {!isClosed && <div className="mt-3 rounded-2xl border border-[#DCE7DA] bg-[#F8FBF7] p-2.5"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); submitMessage(); } }} className="min-h-20 w-full resize-none rounded-xl border border-[#D8E3D7] bg-white p-3 text-sm leading-6 outline-none focus:border-[#2E7D32]" placeholder="اكتب رسالة أو تفاصيل السعر والكمية…" /><div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]"><input value={proposedPrice} onChange={(event) => setProposedPrice(event.target.value.replace(/\D/g, ""))} inputMode="numeric" className="min-h-11 rounded-xl border border-[#D8E3D7] bg-white px-3 text-sm outline-none focus:border-[#2E7D32]" placeholder="سعر/وحدة (اختياري)" /><button type="button" onClick={submitMessage} disabled={sendMessage.isPending || !message.trim()} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1F6B45] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />إرسال</button></div><p className="mt-2 text-[11px] text-[#718075]">للإرسال السريع من لوحة المفاتيح استخدم Ctrl + Enter.</p></div>}

      {(canDecide || canCancel) && !isClosed && <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E6EDE4] pt-3">
        {canDecide && <><button type="button" onClick={() => updateStatus.mutate({ quoteRequestId: quote.id, status: "accepted" })} disabled={updateStatus.isPending} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#E4F3E6] px-3 text-sm font-bold text-[#21643B]"><Check className="h-4 w-4" />قبول العرض</button><button type="button" onClick={() => updateStatus.mutate({ quoteRequestId: quote.id, status: "rejected" })} disabled={updateStatus.isPending} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#F9E5E3] px-3 text-sm font-bold text-[#A44238]"><X className="h-4 w-4" />رفض</button></>}
        {canCancel && <button type="button" onClick={() => updateStatus.mutate({ quoteRequestId: quote.id, status: "cancelled" })} disabled={updateStatus.isPending} className="min-h-10 rounded-xl px-3 text-sm font-bold text-[#66756B] underline">إلغاء الطلب</button>}
      </div>}
    </section>
  );
}
