// ================================================================
// HASAAD PLATFORM — Dashboard Diagnoses Page
// Design: Full diagnosis history with filters and detail cards
// ================================================================

import { useState } from "react";
import { Link } from "wouter";
import {
  Microscope, Plus, Search, AlertTriangle,
  CheckCircle2, Eye, ShoppingCart, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  diagnosisRecords, severityConfig, diagnosisStatusConfig,
  DiagnosisRecord,
} from "@/lib/dashboardData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

const severityFilters = [
  { key: "all", label: "الكل" },
  { key: "critical", label: "حرجة" },
  { key: "high", label: "عالية" },
  { key: "medium", label: "متوسطة" },
  { key: "low", label: "منخفضة" },
];

const statusFilters = [
  { key: "all", label: "جميع الحالات" },
  { key: "monitoring", label: "تحت المراقبة" },
  { key: "treated", label: "تم العلاج" },
  { key: "untreated", label: "لم يُعالج" },
];

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? "#2E7D32" : value >= 75 ? "#C9A227" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-left">{value}٪</span>
    </div>
  );
}

function DiagnosisDetailCard({ record }: { record: DiagnosisRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const sev = severityConfig[record.severity];
  const sta = diagnosisStatusConfig[record.status];

  return (
    <>
    {showDetail && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
        <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative h-52">
            <img src={record.imageUrl} alt={record.cropName} className="w-full h-full object-cover" />
            <button onClick={() => setShowDetail(false)} className="absolute top-3 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white">
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{record.diseaseName}</h3>
                <p className="text-sm text-gray-500">{record.cropName} • {record.date}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${severityConfig[record.severity].color}`}>{severityConfig[record.severity].label}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-800 leading-relaxed">{record.recommendation}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>دقة التشخيص: <strong className="text-gray-700">{record.confidence}%</strong></span>
              <span>•</span>
              <span>{record.id}</span>
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={record.imageUrl} alt={record.cropName} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-gray-800 text-base">{record.diseaseName}</h3>
                <p className="text-sm text-gray-500">{record.cropName}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sev.color}`}>
                  {sev.icon} {sev.label}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sta.color}`}>
                  {sta.label}
                </span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">دقة التشخيص</span>
              </div>
              <ConfidenceBar value={record.confidence} />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{record.date}</span>
              <span>•</span>
              <span>{record.id}</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">{record.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Expandable Products */}
      {record.productsRecommended.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
          >
            <span>المنتجات الموصى بها ({record.productsRecommended.length})</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="px-5 py-4 bg-gray-50/50">
              <div className="space-y-2">
                {record.productsRecommended.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-sm font-medium text-gray-700">{product}</span>
                    </div>
                    <button
                      onClick={() => toast.success(`تمت إضافة ${product} للسلة`)}
                      className="flex items-center gap-1.5 text-xs bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      أضف للسلة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex border-t border-gray-50">
        <button
          onClick={() => setShowDetail(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:text-[#2E7D32] hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          عرض التفاصيل
        </button>
        <div className="w-px bg-gray-100" />
        <Link href="/diagnosis" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-[#2E7D32] hover:bg-green-50 transition-colors font-medium">
            <Microscope className="w-4 h-4" />
            تشخيص جديد
          </Link>
      </div>
    </div>
    </>
  );
}

export default function DashboardDiagnoses() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = diagnosisRecords.filter((r) => {
    const matchSeverity = severityFilter === "all" || r.severity === severityFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch = !search || r.cropName.includes(search) || r.diseaseName.includes(search);
    return matchSeverity && matchStatus && matchSearch;
  });

  const stats = {
    total: diagnosisRecords.length,
    treated: diagnosisRecords.filter((r) => r.status === "treated").length,
    monitoring: diagnosisRecords.filter((r) => r.status === "monitoring").length,
    critical: diagnosisRecords.filter((r) => r.severity === "critical").length,
  };

  return (
    <DashboardLayout
      breadcrumb={[
        { label: "لوحة التحكم", href: "/dashboard" },
        { label: "تشخيصاتي" },
      ]}
    >
      <div className="p-4 md:p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">سجل التشخيصات</h1>
            <p className="text-sm text-gray-500 mt-0.5">{diagnosisRecords.length} تشخيص منذ الانضمام</p>
          </div>
          <Link href="/diagnosis" className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              تشخيص جديد
            </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي التشخيصات", value: stats.total, color: "bg-blue-50 text-blue-700" },
            { label: "تم العلاج", value: stats.treated, color: "bg-green-50 text-green-700" },
            { label: "تحت المراقبة", value: stats.monitoring, color: "bg-yellow-50 text-yellow-700" },
            { label: "حالات حرجة", value: stats.critical, color: "bg-red-50 text-red-700" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="ابحث بنوع المحصول أو المرض..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              dir="rtl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
            dir="rtl"
          >
            {statusFilters.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Severity Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {severityFilters.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSeverityFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                severityFilter === tab.key
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#2E7D32] hover:text-[#2E7D32]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Diagnoses Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filtered.map((record) => (
              <DiagnosisDetailCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Microscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-600 mb-1">لا توجد تشخيصات</h3>
            <p className="text-sm text-gray-400 mb-4">لم يتم العثور على تشخيصات تطابق الفلتر</p>
            <Link href="/diagnosis" className="inline-flex items-center gap-2 bg-[#2E7D32] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1B5E20] transition-colors">
                <Plus className="w-4 h-4" />
                ابدأ تشخيصاً جديداً
              </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
