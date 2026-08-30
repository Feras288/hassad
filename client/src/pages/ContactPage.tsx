import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleCheckBig, Clock3, Headphones, Mail, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const SUBJECTS = ["استفسار عام", "طلب أو منتج", "خدمة أو حجز", "التعاون والشراكات", "مشكلة تقنية", "أمر آخر"];
const INITIAL_FORM = { name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [inquiryReference, setInquiryReference] = useState("");
  const sendInquiry = trpc.contactInquiries.create.useMutation({
    onSuccess: (inquiry) => {
      setSubmittedName(form.name.trim());
      setInquiryReference(inquiry.id);
      setSubmitted(true);
      setForm(INITIAL_FORM);
      toast.success("تم استلام استفسارك بنجاح", { description: "سيُراجع فريق حصاد رسالتك ويوجهها للمسار المناسب.", position: "bottom-center" });
    },
    onError: () => toast.error("تعذر إرسال الاستفسار حالياً. حاول مرة أخرى.", { position: "bottom-center" }),
  });

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(false); sendInquiry.mutate(form); };

  return <div className="min-h-screen bg-[#F8F6F0]" dir="rtl">
    <Navbar />
    <main>
      <section className="relative overflow-hidden bg-[#173E30] py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 8% 12%, #A8CC93 0, transparent 28%), radial-gradient(circle at 92% 88%, #C9A227 0, transparent 30%)" }} />
        <div className="container relative max-w-5xl"><span className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 px-3 py-1 text-xs font-bold text-[#F5D985]"><MessageCircle className="h-3.5 w-3.5" />تواصل مع حصاد</span><h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">كيف يمكننا مساعدتك؟</h1><p className="mt-4 max-w-2xl text-base leading-8 text-[#D4E4D5]">أرسل استفسارك وسنحفظه ضمن سجل الدعم لتتم مراجعته وتوجيهه إلى المسار المناسب.</p></div>
      </section>
      <section className="container max-w-5xl py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl bg-[#EEF5EA] p-6"><Headphones className="h-8 w-8 text-[#1F6B45]" /><h2 className="mt-4 text-xl font-black text-[#263238]">اختر القناة المناسبة</h2><p className="mt-2 text-sm leading-7 text-[#617168]">أرسل تفاصيل واضحة عن المشكلة أو الطلب، وسنساعدك على الوصول إلى الخطوة التالية.</p></div>
            <a href="mailto:info@hassad.net" className="flex items-center gap-3 rounded-2xl border border-[#E1E9DD] bg-white p-4 transition-colors hover:bg-[#F7FAF5]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF5E7] text-[#1F6B45]"><Mail className="h-5 w-5" /></span><span><span className="block text-sm font-bold text-[#263238]">البريد الإلكتروني</span><span className="mt-0.5 block text-xs text-[#617168]">info@hassad.net</span></span></a>
            <a href="tel:0552144040" className="flex items-center gap-3 rounded-2xl border border-[#E1E9DD] bg-white p-4 transition-colors hover:bg-[#F7FAF5]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF5E7] text-[#1F6B45]"><Phone className="h-5 w-5" /></span><span><span className="block text-sm font-bold text-[#263238]">اتصال مباشر</span><span className="mt-0.5 block text-xs text-[#617168]">0552144040</span></span></a>
          </aside>
          <div className="rounded-2xl border border-[#E1E9DD] bg-white p-5 shadow-[0_5px_20px_rgba(31,77,58,0.05)] sm:p-7">
            <AnimatePresence mode="wait">
            {submitted ? <motion.div key="success" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }} className="flex min-h-[410px] flex-col items-center justify-center text-center" role="status" aria-live="polite"><motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.5, delay: 0.1 }} className="relative grid h-20 w-20 place-items-center rounded-full bg-[#EAF5E7] text-[#1F6B45]"><CheckCircle2 className="h-11 w-11" /><Sparkles className="absolute -right-3 -top-2 h-6 w-6 text-[#C9A227]" /></motion.span><span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#EEF5EA] px-3 py-1 text-xs font-bold text-[#356341]"><CircleCheckBig className="h-3.5 w-3.5" />تم الحفظ بنجاح</span><h2 className="mt-3 text-2xl font-black text-[#263238]">وصل استفسارك{submittedName ? `، ${submittedName}` : ""}</h2><p className="mt-3 max-w-md text-sm leading-7 text-[#617168]">حُفظت رسالتك بوضوح في سجل الدعم، وسيُراجعها فريق حصاد ويوجهها إلى المسار المناسب.</p><div className="mt-5 w-full max-w-md rounded-xl border border-[#D9E8D4] bg-[#F7FBF5] p-4 text-right"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#56705A]">رقم متابعة الاستفسار</span><code className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#1F6B45]">{inquiryReference}</code></div><div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-3 text-sm"><CircleCheckBig className="h-4 w-4 text-[#3B8A52]" /><span className="font-bold text-[#34473B]">استلمنا بياناتك ورسالتك</span><Clock3 className="h-4 w-4 text-[#C19A3B]" /><span className="text-[#617168]">الخطوة التالية: مراجعة الاستفسار وتوجيهه للدعم المناسب</span></div></div><motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSubmitted(false); setInquiryReference(""); }} className="mt-6 rounded-xl border border-[#C9D8C6] px-5 py-3 text-sm font-bold text-[#1F4D3A] transition-colors hover:bg-[#F1F7EF]">إرسال استفسار آخر</motion.button></motion.div> : <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} onSubmit={submit}>
              <div className="mb-6"><h2 className="text-xl font-black text-[#263238]">أرسل استفسارك</h2><p className="mt-1 text-sm text-[#617168]">جميع الحقول أدناه إلزامية لتمكيننا من الرد بدقة.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-[#34473B]">الاسم الكامل<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="rounded-xl border border-[#DCE7D9] px-3 py-2.5 font-normal outline-none focus:border-[#2E7D32]" placeholder="اكتب اسمك" /></label>
                <label className="grid gap-2 text-sm font-bold text-[#34473B]">البريد الإلكتروني<input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="rounded-xl border border-[#DCE7D9] px-3 py-2.5 font-normal outline-none focus:border-[#2E7D32]" placeholder="name@example.com" dir="ltr" /></label>
                <label className="grid gap-2 text-sm font-bold text-[#34473B]">رقم الجوال<input required minLength={7} value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="rounded-xl border border-[#DCE7D9] px-3 py-2.5 font-normal outline-none focus:border-[#2E7D32]" placeholder="05XXXXXXXX" dir="ltr" /></label>
                <label className="grid gap-2 text-sm font-bold text-[#34473B]">موضوع الاستفسار<select required value={form.subject} onChange={(event) => updateField("subject", event.target.value)} className="rounded-xl border border-[#DCE7D9] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2E7D32]">{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-bold text-[#34473B]">الرسالة<textarea required minLength={10} value={form.message} onChange={(event) => updateField("message", event.target.value)} className="min-h-36 resize-y rounded-xl border border-[#DCE7D9] px-3 py-2.5 font-normal leading-7 outline-none focus:border-[#2E7D32]" placeholder="اكتب تفاصيل الاستفسار أو المشكلة التي تواجهها..." /></label>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={sendInquiry.isPending} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1F4D3A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#123528] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{sendInquiry.isPending ? "جارٍ حفظ استفسارك…" : "إرسال الاستفسار"}</motion.button>
            </motion.form>}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <ScrollToTop />
  </div>;
}
