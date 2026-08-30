import { Link } from "wouter";
import { ArrowLeft, Inbox } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSupport() {
  return <AdminLayout><main className="min-h-full bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8" dir="rtl"><section className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 px-6 py-16 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Inbox className="h-7 w-7" /></div><h1 className="mt-5 text-2xl font-black text-white">صندوق الدعم يعتمد على الاستفسارات الحية</h1><p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">أزيلت التذاكر والمحادثات النموذجية من هذه الصفحة. استخدم صندوق استفسارات التواصل لمراجعة الرسائل الحقيقية وحفظ الردود وحالة المتابعة.</p><Link href="/admin/contact-inquiries" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950">فتح استفسارات التواصل <ArrowLeft className="h-4 w-4" /></Link></section></main></AdminLayout>;
}
