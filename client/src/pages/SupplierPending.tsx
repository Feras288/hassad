import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, FileSearch, ShieldCheck, Rocket,
  Phone, Mail, MessageCircle, ChevronRight, RefreshCw,
  Building2, AlertCircle, Store, ArrowRight, Copy, Check,
  Edit3, Upload, X, FileText, Image, Paperclip, Hash,
  CreditCard, MapPin, Globe, User, Lock, Eye, EyeOff,
  Briefcase, Package, Leaf, Wrench, Droplets, Bug, CheckCheck
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  {
    id: 1, icon: FileSearch, title: "مراجعة البيانات",
    desc: "يقوم فريق حصاد بمراجعة بيانات شركتك والتحقق من السجل التجاري",
    duration: "خلال ساعة", color: "blue",
  },
  {
    id: 2, icon: ShieldCheck, title: "التحقق من الهوية",
    desc: "التحقق من صحة المستندات والتأكد من مطابقتها للمعلومات المُدخلة",
    duration: "خلال 24 ساعة", color: "amber",
  },
  {
    id: 3, icon: Building2, title: "مراجعة النشاط التجاري",
    desc: "تقييم فئة المنتجات والتأكد من توافقها مع معايير منصة حصاد",
    duration: "خلال 24 ساعة", color: "purple",
  },
  {
    id: 4, icon: Rocket, title: "تفعيل الحساب",
    desc: "إشعارك بالموافقة وتفعيل لوحة تحكم المورد الخاصة بك",
    duration: "خلال 48 ساعة", color: "green",
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string; badgeText: string }> = {
  blue:   { bg: "bg-[#E3F2FD]",  border: "border-[#1565C0]/30", icon: "text-[#1565C0]",  badge: "bg-[#E3F2FD]",  badgeText: "text-[#1565C0]"  },
  amber:  { bg: "bg-[#FFF8E1]",  border: "border-[#C9A227]/30", icon: "text-[#C9A227]",  badge: "bg-[#FFF8E1]",  badgeText: "text-[#C9A227]"  },
  purple: { bg: "bg-[#F3E5F5]",  border: "border-[#7B1FA2]/30", icon: "text-[#7B1FA2]",  badge: "bg-[#F3E5F5]",  badgeText: "text-[#7B1FA2]"  },
  green:  { bg: "bg-[#E8F5E9]",  border: "border-[#2E7D32]/30", icon: "text-[#2E7D32]",  badge: "bg-[#E8F5E9]",  badgeText: "text-[#2E7D32]"  },
};

const regions = [
  "الرياض", "مكة المكرمة", "المدينة المنورة", "القصيم", "الشرقية",
  "عسير", "تبوك", "حائل", "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف"
];

type DialogTab = "info" | "docs";

interface UploadedFile { name: string; size: string; type: "pdf" | "image" | "other"; docId?: string; }

interface RequiredDoc {
  id: string;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string;
}

const REQUIRED_DOCS: RequiredDoc[] = [
  {
    id: "cr",
    label: "السجل التجاري",
    description: "صورة واضحة من السجل التجاري الساري المفعول",
    required: true,
    acceptedFormats: "PDF أو صورة",
  },
  {
    id: "zakat",
    label: "شهادة الزكاة والدخل",
    description: "شهادة سارية من هيئة الزكاة والضريبة والجمارك",
    required: true,
    acceptedFormats: "PDF أو صورة",
  },
  {
    id: "id",
    label: "هوية المسؤول الوطنية",
    description: "صورة من الهوية الوطنية أو الإقامة للمسؤول المُسجَّل",
    required: true,
    acceptedFormats: "PDF أو صورة",
  },
  {
    id: "bank",
    label: "خطاب بنكي / IBAN",
    description: "خطاب من البنك يُثبت رقم الحساب أو شهادة الآيبان",
    required: false,
    acceptedFormats: "PDF أو صورة",
  },
  {
    id: "extra",
    label: "مستندات داعمة إضافية",
    description: "أي وثائق تدعم طلبك (عقود، شهادات، تراخيص)",
    required: false,
    acceptedFormats: "PDF أو صورة",
  },
];

export default function SupplierPending() {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTab, setDialogTab] = useState<DialogTab>("info");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable form state starts empty until a live registration profile is connected.
  const [form, setForm] = useState({
    companyName: "",
    crNumber: "",
    vatNumber: "",
    region: "",
    city: "",
    contactName: "",
    phone: "",
    email: "",
    password: "",
    category: "",
    productTypes: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    if (showDialog) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showDialog]);

  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
      type: f.type.startsWith("image/") ? "image" : f.type === "application/pdf" ? "pdf" : "other",
      docId: pendingDocId || undefined,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setPendingDocId(null);
    toast.success(`تم رفع ${files.length} ملف بنجاح`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocUploadClick = (docId: string) => {
    setPendingDocId(docId);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const getDocFiles = (docId: string) => uploadedFiles.filter(f => f.docId === docId);
  const isDocUploaded = (docId: string) => uploadedFiles.some(f => f.docId === docId);
  const requiredDocsCount = REQUIRED_DOCS.filter(d => d.required).length;
  const uploadedRequiredCount = REQUIRED_DOCS.filter(d => d.required && isDocUploaded(d.id)).length;

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowDialog(false);
      toast.success("تم حفظ التعديلات بنجاح — سيتم مراجعة بياناتك المحدّثة");
    }, 1600);
  };

  const categoryOptions = [
    { id: "seeds", label: "بذور ومحاصيل", icon: Leaf },
    { id: "fertilizers", label: "أسمدة ومغذيات", icon: Package },
    { id: "pesticides", label: "مبيدات ومكافحة", icon: Bug },
    { id: "equipment", label: "معدات وأدوات", icon: Wrench },
    { id: "irrigation", label: "ري وتقنيات المياه", icon: Droplets },
    { id: "other", label: "أخرى", icon: Store },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F5E9] flex flex-col"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-[#2E7D32] font-bold text-xl">
          <Store className="w-6 h-6" />
          <span>حصاد</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4 text-[#1565C0]" />
          <span>وقت الانتظار المتوقع: أقل من 48 ساعة</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-3xl mx-auto w-full gap-8">

        {/* Hero status card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white rounded-3xl shadow-lg border border-[#1565C0]/10 overflow-hidden"
        >
          {/* Status banner */}
          <div className="bg-gradient-to-l from-[#1565C0] to-[#1976D2] px-8 py-6 flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <div className="text-white flex-1">
              <h1 className="text-2xl font-bold mb-1">طلبك قيد المراجعة</h1>
              <p className="text-white/80 text-sm">
                استلمنا طلب تسجيلك بنجاح — سيتواصل معك فريقنا خلال 48 ساعة
              </p>
            </div>
          </div>

          <div className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-[#263238]">لم يصدر رقم متابعة بعد</p>
              <p className="mt-1 text-xs leading-6 text-gray-400">سيظهر رقم المتابعة فقط بعد حفظ طلب التسجيل ومراجعته من الإدارة.</p>
            </div>
            <div className="flex items-center gap-2 bg-[#FFF8E1] border border-[#C9A227]/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#263238]">الحالة الحالية</p>
                <p className="text-sm font-bold text-[#C9A227]">في انتظار المراجعة</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">تقدم المراجعة</span>
              <span className="text-xs font-bold text-[#1565C0]">25%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "25%" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                className="h-2 rounded-full bg-gradient-to-l from-[#1565C0] to-[#42A5F5]"
              />
            </div>
            <div className="flex justify-between mt-2">
              {["استلام الطلب", "مراجعة البيانات", "التحقق", "التفعيل"].map((label, i) => (
                <span key={i} className={`text-xs ${i === 0 ? "text-[#1565C0] font-semibold" : "text-gray-400"}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== Edit / Upload CTA ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full bg-white rounded-2xl border-2 border-dashed border-[#1565C0]/30 p-6 flex flex-col sm:flex-row items-center gap-5"
        >
          <div className="w-14 h-14 bg-[#E3F2FD] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Edit3 className="w-7 h-7 text-[#1565C0]" />
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h3 className="font-bold text-[#263238] mb-1">هل تريد تعديل بياناتك أو إضافة مستندات؟</h3>
            <p className="text-sm text-gray-500">
              يمكنك تحديث معلومات شركتك أو رفع مستندات إضافية <strong>قبل بدء المراجعة</strong> لتسريع عملية الموافقة.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={() => { setDialogTab("docs"); setShowDialog(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-[#1565C0]/40 text-[#1565C0] rounded-xl text-sm font-semibold hover:bg-[#E3F2FD] transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>رفع مستندات</span>
            </button>
            <button
              onClick={() => { setDialogTab("info"); setShowDialog(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-[#1565C0] text-white rounded-xl text-sm font-semibold hover:bg-[#0D47A1] transition-colors shadow-sm shadow-[#1565C0]/20"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل البيانات</span>
            </button>
          </div>
        </motion.div>

        {/* Steps timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <h2 className="text-lg font-bold text-[#263238] mb-4 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-[#1565C0]" />
            خطوات المراجعة
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, index) => {
              const colors = colorMap[step.color];
              const isActive = index === 0;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index + 0.3 }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    isActive
                      ? `${colors.bg} ${colors.border} border shadow-sm`
                      : "bg-white border-gray-100 border opacity-60"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? colors.bg : "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${isActive ? colors.icon : "text-gray-400"}`} />
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-0.5 h-4 rounded-full ${isActive ? "bg-gray-300" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm ${isActive ? "text-[#263238]" : "text-gray-400"}`}>{step.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isActive ? `${colors.badge} ${colors.badgeText}` : "bg-gray-100 text-gray-400"
                      }`}>
                        {isActive ? "جارٍ الآن" : step.duration}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isActive ? "text-gray-600" : "text-gray-400"}`}>{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-bold text-[#263238] mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#2E7D32]" />
            بعد الموافقة ستتمكن من
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "إضافة منتجاتك وتسعيرها",
              "استقبال الطلبات من المزارعين",
              "إدارة المخزون والشحن",
              "عرض منتجاتك على خريطة الموردين",
              "الوصول لتقارير المبيعات",
              "التواصل المباشر مع العملاء",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                </div>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full bg-gradient-to-l from-[#E8F5E9] to-[#F0F7FF] rounded-2xl border border-[#2E7D32]/10 p-6"
        >
          <h2 className="text-base font-bold text-[#263238] mb-1">هل لديك استفسار؟</h2>
          <p className="text-sm text-gray-500 mb-4">فريق الدعم متاح للمساعدة في أي وقت</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:0552144040"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#2E7D32] text-white rounded-xl text-sm font-semibold hover:bg-[#1B5E20] transition-colors shadow-sm shadow-[#2E7D32]/20"
            >
              <Phone className="w-4 h-4" />
              <span>0552144040</span>
            </a>
            <a
              href="mailto:info@hassad.net"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#1565C0] border border-[#1565C0]/30 rounded-xl text-sm font-semibold hover:bg-[#E3F2FD] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>info@hassad.net</span>
            </a>
            <button
              onClick={() => { window.location.href = 'mailto:support@hassad.net?subject=دعم مباشر - طلب تسجيل مورد'; }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>دردشة مباشرة</span>
            </button>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-4 pb-4"
        >
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/auth" className="text-sm text-[#1565C0] hover:underline">تسجيل الدخول بحساب آخر</Link>
        </motion.div>
      </div>

      {/* ===== Edit / Upload Dialog ===== */}
      <AnimatePresence>
        {showDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDialog(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Dialog panel */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
              dir="rtl"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {/* Dialog header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-[#263238]">تعديل بيانات التسجيل</h2>
                  <p className="text-sm text-gray-500 mt-0.5">يمكنك التعديل قبل بدء عملية المراجعة</p>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
                {[
                  { id: "info" as DialogTab, label: "بيانات الشركة", icon: Building2 },
                  { id: "docs" as DialogTab, label: "المستندات", icon: Paperclip },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDialogTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      dialogTab === tab.id
                        ? "bg-[#1565C0] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.id === "docs" && uploadedFiles.length > 0 && (
                      <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {uploadedFiles.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Dialog body — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* ---- Tab: Company Info ---- */}
                {dialogTab === "info" && (
                  <>
                    {/* Section: Company */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-4">
                      <h3 className="text-sm font-bold text-[#263238] flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#1565C0]" />
                        بيانات الشركة
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">اسم الشركة / المنشأة</label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={e => setForm({ ...form, companyName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">رقم السجل التجاري</label>
                          <div className="relative">
                            <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={form.crNumber}
                              onChange={e => setForm({ ...form, crNumber: e.target.value })}
                              className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">الرقم الضريبي <span className="text-gray-400">(اختياري)</span></label>
                          <div className="relative">
                            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={form.vatNumber}
                              onChange={e => setForm({ ...form, vatNumber: e.target.value })}
                              className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">المنطقة</label>
                          <div className="relative">
                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              value={form.region}
                              onChange={e => setForm({ ...form, region: e.target.value })}
                              className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all appearance-none"
                            >
                              {regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">المدينة</label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Contact */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-4">
                      <h3 className="text-sm font-bold text-[#263238] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#1565C0]" />
                        بيانات المسؤول
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">اسم المسؤول</label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={form.contactName}
                            onChange={e => setForm({ ...form, contactName: e.target.value })}
                            className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">رقم الجوال</label>
                          <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={e => setForm({ ...form, phone: e.target.value })}
                              className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">البريد الإلكتروني</label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">تغيير كلمة المرور <span className="text-gray-400">(اتركه فارغاً إن لم تريد التغيير)</span></label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="كلمة مرور جديدة"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full pr-9 pl-10 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section: Activity */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-4">
                      <h3 className="text-sm font-bold text-[#263238] flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#1565C0]" />
                        تفاصيل النشاط
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">فئة المنتجات الرئيسية</label>
                        <div className="grid grid-cols-3 gap-2">
                          {categoryOptions.map(({ id, label, icon: Icon }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setForm({ ...form, category: id })}
                              className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                                form.category === id
                                  ? "border-[#1565C0] bg-[#E3F2FD]"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${form.category === id ? "text-[#1565C0]" : "text-gray-400"}`} />
                              <span className={`text-xs font-medium text-center leading-tight ${form.category === id ? "text-[#263238]" : "text-gray-500"}`}>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">أنواع المنتجات</label>
                        <input
                          type="text"
                          value={form.productTypes}
                          onChange={e => setForm({ ...form, productTypes: e.target.value })}
                          className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">الموقع الإلكتروني <span className="text-gray-400">(اختياري)</span></label>
                        <div className="relative">
                          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={form.website}
                            onChange={e => setForm({ ...form, website: e.target.value })}
                            className="w-full pr-9 pl-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">نبذة عن الشركة</label>
                        <textarea
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] text-sm focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ---- Tab: Documents ---- */}
                {dialogTab === "docs" && (
                  <div className="space-y-4">

                    {/* Progress summary */}
                    <div className={`rounded-2xl p-4 flex items-center gap-4 ${
                      uploadedRequiredCount === requiredDocsCount
                        ? "bg-[#E8F5E9] border border-[#2E7D32]/30"
                        : "bg-[#E3F2FD] border border-[#1565C0]/20"
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        uploadedRequiredCount === requiredDocsCount ? "bg-[#2E7D32]" : "bg-[#1565C0]"
                      }`}>
                        {uploadedRequiredCount === requiredDocsCount
                          ? <CheckCheck className="w-6 h-6 text-white" />
                          : <FileText className="w-6 h-6 text-white" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#263238]">
                          {uploadedRequiredCount === requiredDocsCount
                            ? "✅ جميع المستندات الإلزامية مكتملة!"
                            : `${uploadedRequiredCount} من ${requiredDocsCount} مستندات إلزامية مرفوعة`
                          }
                        </p>
                        <div className="mt-2 w-full bg-white/60 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              uploadedRequiredCount === requiredDocsCount ? "bg-[#2E7D32]" : "bg-[#1565C0]"
                            }`}
                            style={{ width: `${(uploadedRequiredCount / requiredDocsCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Required docs checklist */}
                    <div className="space-y-2">
                      {REQUIRED_DOCS.map(doc => {
                        const docFiles = getDocFiles(doc.id);
                        const uploaded = isDocUploaded(doc.id);
                        return (
                          <div
                            key={doc.id}
                            className={`rounded-2xl border transition-all ${
                              uploaded
                                ? "bg-[#E8F5E9] border-[#2E7D32]/30"
                                : doc.required
                                ? "bg-white border-gray-200"
                                : "bg-[#FAFAFA] border-gray-100"
                            }`}
                          >
                            <div className="flex items-start gap-3 p-4">
                              {/* Status icon */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                uploaded ? "bg-[#2E7D32]" : doc.required ? "bg-gray-100" : "bg-gray-50"
                              }`}>
                                {uploaded
                                  ? <CheckCircle2 className="w-5 h-5 text-white" />
                                  : <FileText className={`w-4 h-4 ${doc.required ? "text-gray-400" : "text-gray-300"}`} />
                                }
                              </div>

                              {/* Doc info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-sm font-bold ${
                                    uploaded ? "text-[#2E7D32]" : "text-[#263238]"
                                  }`}>{doc.label}</p>
                                  {doc.required && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      uploaded
                                        ? "bg-[#2E7D32]/10 text-[#2E7D32]"
                                        : "bg-red-50 text-red-500"
                                    }`}>
                                      {uploaded ? "مكتمل" : "إلزامي"}
                                    </span>
                                  )}
                                  {!doc.required && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">
                                      اختياري
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">الصيغ المقبولة: {doc.acceptedFormats}</p>

                                {/* Uploaded files for this doc */}
                                {docFiles.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {docFiles.map((file, fi) => {
                                      const globalIndex = uploadedFiles.findIndex(f => f === file);
                                      return (
                                        <div key={fi} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-1.5">
                                          {file.type === "pdf"
                                            ? <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                            : <Image className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                          }
                                          <span className="text-xs text-[#263238] truncate flex-1">{file.name}</span>
                                          <span className="text-xs text-gray-400">{file.size}</span>
                                          <button
                                            onClick={() => removeFile(globalIndex)}
                                            className="p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Upload button */}
                              <button
                                onClick={() => handleDocUploadClick(doc.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${
                                  uploaded
                                    ? "bg-white border border-[#2E7D32]/30 text-[#2E7D32] hover:bg-[#E8F5E9]"
                                    : doc.required
                                    ? "bg-[#1565C0] text-white hover:bg-[#0D47A1] shadow-sm shadow-[#1565C0]/20"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploaded ? "استبدال" : "رفع"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* General upload for unclassified files */}
                    <div
                      onClick={() => { setPendingDocId("extra"); setTimeout(() => fileInputRef.current?.click(), 50); }}
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">رفع ملف إضافي</p>
                        <p className="text-xs text-gray-400">PDF، JPG، PNG — الحد الأقصى 10 MB</p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Dialog footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-[#1565C0]/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ التعديلات</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
