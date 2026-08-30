/*
 * HASAAD PLATFORM — Product Questions
 * Public product Q&A with a pending review path and supplier-published replies.
 */
import { useMemo, useState } from "react";
import { ChevronDown, Loader2, MessageCircleQuestion, Search, Send, Store, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ProductQuestions({ productId }: { productId: string }) {
  const utils = trpc.useUtils();
  const questionsQuery = trpc.productQuestions.publicList.useQuery({ productId }, { staleTime: 30_000 });
  const [formOpen, setFormOpen] = useState(false);
  const [askerName, setAskerName] = useState("");
  const [question, setQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const feedbackToken = useMemo(() => {
    const key = "hassad-question-feedback-token";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(key, created);
    return created;
  }, []);
  const askMutation = trpc.productQuestions.ask.useMutation({
    onSuccess: () => { setAskerName(""); setQuestion(""); setFormOpen(false); toast.success("تم إرسال سؤالك للمورد", { description: "سيظهر الرد في هذه الصفحة بعد نشره." }); utils.productQuestions.publicList.invalidate({ productId }); },
    onError: () => toast.error("تعذر إرسال السؤال", { description: "تأكد من كتابة اسمك وسؤال واضح." }),
  });
  const rateMutation = trpc.productQuestions.rateAnswer.useMutation({
    onSuccess: () => { utils.productQuestions.publicList.invalidate({ productId }); toast.success("شكراً لملاحظتك"); },
    onError: () => toast.error("تعذر حفظ التقييم، حاول مرة أخرى"),
  });
  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("ar-SA");
    const questions = (questionsQuery.data ?? []).filter((item) => !term || `${item.question} ${item.answer ?? ""} ${item.answererName ?? ""}`.toLocaleLowerCase("ar-SA").includes(term));
    return [...questions].sort((first, second) => sortBy === "helpful" ? (second.helpfulCount - second.notHelpfulCount) - (first.helpfulCount - first.notHelpfulCount) : Number(new Date(second.answeredAt ?? second.createdAt)) - Number(new Date(first.answeredAt ?? first.createdAt)));
  }, [questionsQuery.data, search, sortBy]);

  return <section className="rounded-[26px] border border-[#D9E7D6] bg-white p-5 shadow-[0_10px_30px_rgba(28,73,49,0.04)] sm:p-7" aria-labelledby="product-questions-title"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-black text-[#5D896E]"><MessageCircleQuestion className="h-4 w-4" />استفسارات المزارعين</p><h2 id="product-questions-title" className="mt-1 text-xl font-black text-[#183B29]">أسئلة وأجوبة عن المنتج</h2><p className="mt-2 text-xs leading-6 text-[#6E7E74]">ردود مباشرة من المورد لمساعدتك قبل الشراء.</p></div><button type="button" onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1F6B45] px-4 py-2.5 text-sm font-black text-[#1F6B45] hover:bg-[#EEF7EC]"><MessageCircleQuestion className="h-4 w-4" />اطرح سؤالاً</button></div>
    {formOpen && <form onSubmit={(event) => { event.preventDefault(); askMutation.mutate({ productId, askerName, question }); }} className="mt-5 rounded-2xl bg-[#F4F8F2] p-4"><div className="grid gap-3 sm:grid-cols-[180px_1fr]"><label className="text-sm font-bold text-[#3B5143]">اسمك<input required value={askerName} onChange={(event) => setAskerName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#D8E5D5] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]" placeholder="الاسم الأول" /></label><label className="text-sm font-bold text-[#3B5143]">سؤالك<textarea required minLength={8} value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-1.5 min-h-20 w-full resize-none rounded-xl border border-[#D8E5D5] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2C7A4A]" placeholder="مثال: هل يناسب هذا المنتج الري بالتنقيط؟" /></label></div><div className="mt-3 flex justify-end"><button disabled={askMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#1F6B45] px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">{askMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{askMutation.isPending ? "جاري الإرسال" : "إرسال السؤال"}</button></div></form>}
    <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-[#F5F9F3] p-2.5 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E8075]" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-[#D8E5D5] bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-[#2C7A4A]" placeholder="ابحث في الأسئلة والإجابات..." /></label><select value={sortBy} onChange={(event) => setSortBy(event.target.value as "recent" | "helpful")} className="rounded-xl border border-[#D8E5D5] bg-white px-3 py-2.5 text-sm font-bold text-[#405C4B] outline-none"><option value="recent">الأحدث أولاً</option><option value="helpful">الأكثر فائدة</option></select></div>
    <div className="mt-4 divide-y divide-[#E8F0E6]">{questionsQuery.isLoading ? Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-[#F3F7F1]" />) : visibleQuestions.length > 0 ? visibleQuestions.map((item) => <details key={item.id} className="group py-4"><summary className="flex cursor-pointer list-none items-start justify-between gap-4"><div><p className="text-sm font-black text-[#284635]">{item.question}</p><p className="mt-1 text-xs text-[#7A887F]">سؤال من {item.askerName}</p></div><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[#4D6D5B] transition-transform group-open:rotate-180" /></summary><div className="mt-3 rounded-xl border-r-4 border-[#D19A32] bg-[#FFF9EB] px-4 py-3"><p className="flex items-center gap-1.5 text-xs font-bold text-[#9A6A1A]"><Store className="h-3.5 w-3.5" />رد {item.answererName || item.vendorName}</p><p className="mt-2 text-sm leading-7 text-[#4A5B50]">{item.answer}</p><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F0E5C6] pt-3"><span className="ml-1 text-xs font-bold text-[#7A673A]">هل كانت الإجابة مفيدة؟</span><button type="button" disabled={rateMutation.isPending} onClick={() => rateMutation.mutate({ questionId: item.id, feedbackToken, isHelpful: true })} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-[#2B714A] shadow-sm hover:bg-[#EAF5E7] disabled:opacity-50"><ThumbsUp className="h-3.5 w-3.5" />نعم {item.helpfulCount > 0 && `(${item.helpfulCount})`}</button><button type="button" disabled={rateMutation.isPending} onClick={() => rateMutation.mutate({ questionId: item.id, feedbackToken, isHelpful: false })} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-[#766A57] shadow-sm hover:bg-[#F7F0E3] disabled:opacity-50"><ThumbsDown className="h-3.5 w-3.5" />لا</button></div></div></details>) : questionsQuery.data && questionsQuery.data.length > 0 ? <div className="rounded-2xl border border-dashed border-[#D5E4D2] bg-[#FAFCF9] px-4 py-7 text-center text-sm text-[#6E7E74]">لا توجد نتائج مطابقة لعبارة البحث.</div> : <div className="rounded-2xl border border-dashed border-[#D5E4D2] bg-[#FAFCF9] px-4 py-7 text-center text-sm text-[#6E7E74]">لا توجد أسئلة منشورة بعد. كن أول من يستفسر من المورد.</div>}</div>
  </section>;
}
