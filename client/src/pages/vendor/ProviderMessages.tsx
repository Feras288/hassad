import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import { trpc } from "@/lib/trpc";

export default function ProviderMessages() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: conversations = [], isLoading, error } = trpc.serviceMessaging.conversations.useQuery(undefined, { refetchInterval: 15_000 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { data: messages = [], isLoading: messagesLoading } = trpc.serviceMessaging.messages.useQuery({ conversationId: activeId ?? "" }, { enabled: Boolean(activeId), refetchInterval: 8_000 });
  const send = trpc.serviceMessaging.send.useMutation({
    onSuccess: async () => { setDraft(""); await Promise.all([utils.serviceMessaging.messages.invalidate(), utils.serviceMessaging.conversations.invalidate()]); },
    onError: (mutationError) => toast.error("تعذر إرسال الرسالة", { description: mutationError.message }),
  });
  const markRead = trpc.serviceMessaging.markRead.useMutation({ onSuccess: () => utils.serviceMessaging.messages.invalidate() });

  useEffect(() => { if (conversations.length && !activeId) setActiveId(conversations[0].id); }, [conversations, activeId]);
  useEffect(() => { if (activeId && !markRead.isPending && messages.some((message) => !message.readAt)) markRead.mutate({ conversationId: activeId }); }, [activeId, messages, markRead]);
  const active = conversations.find((conversation) => conversation.id === activeId);
  const submit = () => { if (activeId && draft.trim() && !send.isPending) send.mutate({ conversationId: activeId, message: draft.trim() }); };

  return <div className="min-h-screen bg-[#F7F8F4]" dir="rtl"><VendorSidebar vendorType="provider" /><main className="lg:mr-64"><VendorHeader vendorType="provider" pageTitle="الرسائل" pageSubtitle="تواصل مباشرة مع عملاء خدماتك" /><div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6">
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:flex-row">
      <aside className="w-full shrink-0 border-b border-gray-100 md:w-80 md:border-b-0 md:border-l"><div className="border-b border-gray-100 p-4"><p className="text-sm font-bold text-[#2E7D32]">رسائل العملاء</p><h1 className="mt-1 text-xl font-black text-[#263238]">المحادثات</h1></div><div className="max-h-64 overflow-y-auto md:max-h-[calc(100dvh-16rem)]">{isLoading ? <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin text-[#2E7D32]" /> : error ? <p className="p-4 text-sm text-red-700">{error.message}</p> : conversations.length === 0 ? <p className="p-6 text-center text-sm leading-6 text-gray-500">لا توجد محادثات حالياً.</p> : conversations.map((conversation) => <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={`w-full border-b border-gray-50 px-4 py-3 text-right transition-colors ${conversation.id === activeId ? "bg-[#E8F5E9]" : "hover:bg-gray-50"}`}><b className="block text-sm text-[#263238]">عميل #{conversation.customerId}</b><small className="mt-1 block truncate text-xs text-gray-500">{conversation.subject || "استفسار عن خدمة"}</small></button>)}</div></aside>
      <section className="flex min-h-[28rem] min-w-0 flex-1 flex-col">{active ? <><header className="border-b border-gray-100 p-4"><h2 className="font-black text-[#263238]">عميل #{active.customerId}</h2><p className="mt-0.5 text-xs text-gray-500">{active.subject || "محادثة حول خدماتك"}</p></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#FAFBF9] p-4">{messagesLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-[#2E7D32]" /> : messages.length === 0 ? <p className="mt-10 text-center text-sm text-gray-500">ابدأ بالترحيب بالعميل.</p> : messages.map((message) => <div key={message.id} className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${message.senderId === user?.id ? "rounded-tr-sm bg-[#2E7D32] text-white" : "rounded-tl-sm bg-white text-[#263238] shadow-sm ring-1 ring-gray-100"}`}><p>{message.message}</p><time className={`mt-1 block text-[10px] ${message.senderId === user?.id ? "text-white/70" : "text-gray-400"}`}>{new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div></div>)}</div><div className="border-t border-gray-100 p-3"><div className="flex items-end gap-2 rounded-2xl bg-[#F3F6F1] p-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder="اكتب ردك للعميل…" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" /><button onClick={submit} disabled={!draft.trim() || send.isPending} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E7D32] text-white disabled:opacity-40">{send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></div></div></> : <div className="flex flex-1 flex-col items-center justify-center text-center"><MessageCircle className="h-12 w-12 text-[#2E7D32]" /><p className="mt-3 text-sm text-gray-500">اختر محادثة للرد على العميل.</p></div>}</section>
    </div>
  </div></main></div>;
}
