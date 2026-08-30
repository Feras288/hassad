import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { trpc } from "@/lib/trpc";

function ProviderAvatar({ src, name }: { src: string | null; name: string }) {
  return src ? <img src={src} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 font-black text-[#2E7D32]">{name.slice(0, 1)}</div>;
}

export default function DashboardMessages() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const providerId = query.get("provider");
  const providerQuery = trpc.serviceProviders.byId.useQuery({ id: providerId ?? "" }, { enabled: Boolean(providerId), retry: false });
  const provider = providerQuery.data;
  const { data: conversations = [], isLoading: conversationsLoading } = trpc.serviceMessaging.conversations.useQuery(undefined, { refetchInterval: 15_000 });
  const openConversation = trpc.serviceMessaging.open.useMutation({
    onSuccess: async (conversation) => {
      await utils.serviceMessaging.conversations.invalidate();
      setActiveConversationId(conversation.id);
      navigate("/dashboard/messages", { replace: true });
    },
    onError: (error) => toast.error("تعذر فتح المحادثة", { description: error.message }),
  });
  const { data: messages = [], isLoading: messagesLoading } = trpc.serviceMessaging.messages.useQuery({ conversationId: activeConversationId ?? "" }, { enabled: Boolean(activeConversationId), refetchInterval: 8_000 });
  const sendMessage = trpc.serviceMessaging.send.useMutation({
    onSuccess: async () => {
      setDraft("");
      await Promise.all([utils.serviceMessaging.messages.invalidate(), utils.serviceMessaging.conversations.invalidate()]);
    },
    onError: (error) => toast.error("تعذر إرسال الرسالة", { description: error.message }),
  });
  const markRead = trpc.serviceMessaging.markRead.useMutation({ onSuccess: () => utils.serviceMessaging.messages.invalidate() });

  useEffect(() => {
    if (provider && !openConversation.isPending && !activeConversationId) {
      openConversation.mutate({ providerId: provider.id, providerName: provider.name, providerAvatar: provider.logoUrl, subject: null });
    }
  }, [provider, activeConversationId, openConversation]);

  useEffect(() => {
    if (conversations.length && !activeConversationId && !providerId) setActiveConversationId(conversations[0].id);
  }, [conversations, activeConversationId, providerId]);

  useEffect(() => {
    if (activeConversationId && messages.some((message) => !message.readAt)) markRead.mutate({ conversationId: activeConversationId });
  }, [activeConversationId, messages, markRead]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const submit = () => {
    if (!activeConversationId || !draft.trim() || sendMessage.isPending) return;
    sendMessage.mutate({ conversationId: activeConversationId, message: draft.trim() });
  };

  return (
    <DashboardLayout title="الرسائل المباشرة" breadcrumb={[{ label: "لوحة التحكم", href: "/dashboard" }, { label: "الرسائل" }]}>
      <div className="flex min-h-[calc(100dvh-10rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:flex-row" dir="rtl">
        <aside className="w-full shrink-0 border-b border-gray-100 md:w-80 md:border-b-0 md:border-l">
          <div className="border-b border-gray-100 p-4"><p className="text-sm font-bold text-[#2E7D32]">تواصل مباشر</p><h1 className="mt-1 text-xl font-black text-[#263238]">الرسائل</h1></div>
          <div className="max-h-64 overflow-y-auto md:max-h-[calc(100dvh-15rem)]">
            {conversationsLoading ? <div className="p-5 text-center text-sm text-gray-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />جارٍ تحميل المحادثات…</div> : conversations.length === 0 ? <div className="p-6 text-center text-sm leading-6 text-gray-500">ابدأ من صفحة مقدم الخدمة لفتح محادثة مباشرة معه.</div> : conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setActiveConversationId(conversation.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors ${conversation.id === activeConversationId ? "bg-[#E8F5E9]" : "hover:bg-gray-50"}`}><ProviderAvatar src={conversation.providerAvatar} name={conversation.providerName} /><span className="min-w-0 flex-1"><b className="block truncate text-sm text-[#263238]">{conversation.providerName}</b><small className="block truncate pt-0.5 text-xs text-gray-500">{conversation.subject || "مراسلة مقدم الخدمة"}</small></span></button>
            ))}
          </div>
        </aside>
        <section className="flex min-h-[28rem] min-w-0 flex-1 flex-col">
          {activeConversation ? <><header className="flex items-center gap-3 border-b border-gray-100 p-4"><ProviderAvatar src={activeConversation.providerAvatar} name={activeConversation.providerName} /><div><h2 className="font-black text-[#263238]">{activeConversation.providerName}</h2><p className="text-xs text-gray-500">محادثة محفوظة داخل منصة حصاد</p></div></header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#FAFBF9] p-4">{messagesLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-[#2E7D32]" /> : messages.length === 0 ? <div className="mx-auto mt-10 max-w-sm text-center text-sm text-gray-500">ابدأ المحادثة وحدد احتياج مزرعتك أو استفسارك عن الخدمة.</div> : messages.map((message) => <div key={message.id} className={`flex ${message.senderId === activeConversation.customerId ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${message.senderId === activeConversation.customerId ? "rounded-tr-sm bg-[#2E7D32] text-white" : "rounded-tl-sm bg-white text-[#263238] shadow-sm ring-1 ring-gray-100"}`}><p>{message.message}</p><time className={`mt-1 block text-[10px] ${message.senderId === activeConversation.customerId ? "text-white/70" : "text-gray-400"}`}>{new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div></div>)}</div>
            <div className="border-t border-gray-100 p-3"><div className="flex items-end gap-2 rounded-2xl bg-[#F3F6F1] p-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder="اكتب رسالتك…" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" /><button onClick={submit} disabled={!draft.trim() || sendMessage.isPending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32] text-white disabled:opacity-40" aria-label="إرسال الرسالة">{sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></div><p className="px-2 pt-2 text-[11px] text-gray-400">Enter للإرسال · Shift + Enter لسطر جديد</p></div></> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle className="h-12 w-12 text-[#2E7D32]" /><h2 className="mt-4 text-lg font-black text-[#263238]">اختر محادثة</h2><p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">اختر مقدم خدمة من القائمة أو افتح محادثة من صفحته الشخصية.</p></div>}
        </section>
      </div>
    </DashboardLayout>
  );
}
