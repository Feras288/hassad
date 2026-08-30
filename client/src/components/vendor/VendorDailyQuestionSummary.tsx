import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, Clock3, MessageCircleQuestion, Timer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getPendingQuestionPriority } from "@/lib/questionResponsePriority";

export default function VendorDailyQuestionSummary() {
  const { user } = useAuth();
  const canAccessSummary = user?.role === "vendor" && Boolean(user.vendorId);
  const { data: summary, isLoading } = trpc.productQuestions.dailySummary.useQuery(undefined, {
    enabled: canAccessSummary,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  if (!canAccessSummary) return null;
  if (isLoading) {
    return <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-sm text-gray-500">جارٍ إعداد ملخص أسئلة اليوم…</p></div>;
  }
  if (!summary) return null;

  const metrics = [
    { label: "بانتظار الرد", value: summary.totalPending, icon: MessageCircleQuestion, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "وصلت اليوم", value: summary.todayPending, icon: Clock3, color: "text-[#2E7D32]", bg: "bg-green-50" },
    { label: "من أيام سابقة", value: summary.olderPending, icon: Timer, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><MessageCircleQuestion size={19} className="text-[#2E7D32]" /><h2 className="font-bold text-[#263238]">ملخص أسئلة اليوم</h2></div>
          <p className="text-sm text-gray-500 mt-1">رتّب ردودك حسب حداثة السؤال لتسريع خدمة المزارعين.</p>
        </div>
        <Link href="/vendor/questions" className="text-sm text-[#2E7D32] font-semibold whitespace-nowrap hover:underline">إدارة الأسئلة</Link>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metrics.map((metric) => <div key={metric.label} className={`${metric.bg} rounded-xl p-4 flex items-center gap-3`}><div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center"><metric.icon size={18} className={metric.color} /></div><div><p className="text-xl font-bold text-[#263238]">{metric.value.toLocaleString("ar-SA")}</p><p className="text-xs text-gray-600">{metric.label}</p></div></div>)}
        </div>
        {summary.totalPending === 0 ? <div className="mt-4 py-4 text-center bg-green-50 rounded-xl text-sm text-green-800 flex items-center justify-center gap-2"><CheckCircle2 size={17} />لا توجد أسئلة معلقة حالياً، أحسنت المتابعة.</div> : <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {summary.recentQuestions.map((question) => { const priority = getPendingQuestionPriority(question.createdAt); return <Link key={question.id} href="/vendor/questions" className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${priority.isOverdue ? "bg-red-50/40" : ""}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#263238]">{question.askerName}</p><div className="flex items-center gap-2">{priority.isOverdue && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"><AlertTriangle size={12} />تأخر الرد</span>}<span className="text-xs text-gray-400">{new Intl.DateTimeFormat("ar-SA", { dateStyle: "short", timeStyle: "short" }).format(new Date(question.createdAt))}</span></div></div><p className="text-sm text-gray-600 mt-1 line-clamp-1">{question.question}</p></Link>; })}
        </div>}
      </div>
    </section>
  );
}
