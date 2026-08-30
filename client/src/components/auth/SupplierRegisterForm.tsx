import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Store,
  Briefcase,
  Hash,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Package,
  Bug,
  Wrench,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";

interface SupplierFormState {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  crNumber: string;
  vatNumber: string;
  region: string;
  city: string;
  category: string;
  productTypes: string;
  website: string;
  description: string;
}

interface SupplierRegisterFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBackToAccountType: () => void;
  onBackToLogin: () => void;
  form: SupplierFormState;
  setForm: React.Dispatch<React.SetStateAction<SupplierFormState>>;
  step: number;
  setStep: (step: number) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}

const regions = [
  "الرياض",
  "مكة المكرمة",
  "المدينة المنورة",
  "القصيم",
  "المنطقة الشرقية",
  "عسير",
  "تبوك",
  "حائل",
  "الجوف",
  "نجران",
  "جازان",
  "الباحة",
  "الحدود الشمالية",
];

const supplierCategories = [
  { id: "seeds", label: "بذور ومحاصيل", icon: Leaf },
  { id: "fertilizers", label: "أسمدة ومغذيات", icon: Package },
  { id: "pesticides", label: "مبيدات ومكافحة", icon: Bug },
  { id: "equipment", label: "معدات وأدوات", icon: Wrench },
  { id: "irrigation", label: "ري وتقنيات المياه", icon: Droplets },
  { id: "other", label: "أخرى", icon: Store },
];

export default function SupplierRegisterForm({
  isLoading,
  onSubmit,
  onBackToAccountType,
  onBackToLogin,
  form,
  setForm,
  step,
  setStep,
  agreedToTerms,
  setAgreedToTerms,
}: SupplierRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      key="register-supplier"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step === 1 ? onBackToAccountType() : setStep(step - 1))}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1565C0] transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4" />
          <span>{step === 1 ? "تغيير نوع الحساب" : "الخطوة السابقة"}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">الخطوة {step} من 3</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "w-8 bg-[#1565C0]" : "w-4 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#E3F2FD] rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-[#1565C0]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#263238]"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {step === 1
                ? "بيانات الشركة"
                : step === 2
                ? "بيانات المسؤول"
                : "تفاصيل النشاط"}
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1
                ? "أدخل معلومات شركتك أو منشأتك"
                : step === 2
                ? "بيانات الشخص المسؤول والدخول"
                : "أخبرنا عن منتجاتك وتخصصك"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {step === 1 && (
          <>
            {/* Company name */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                اسم الشركة / المنشأة
              </label>
              <div className="relative">
                <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="شركة الأمل للمستلزمات الزراعية"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* CR Number */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                رقم السجل التجاري
              </label>
              <div className="relative">
                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="1010XXXXXXX"
                  value={form.crNumber}
                  onChange={(e) =>
                    setForm({ ...form, crNumber: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* VAT Number */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                الرقم الضريبي{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="3XXXXXXXXXXXXXXXX3"
                  value={form.vatNumber}
                  onChange={(e) =>
                    setForm({ ...form, vatNumber: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                المنطقة
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={form.region}
                  onChange={(e) =>
                    setForm({ ...form, region: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all appearance-none"
                  required
                >
                  <option value="">اختر المنطقة</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                المدينة
              </label>
              <input
                type="text"
                placeholder="الرياض"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                required
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Contact name */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                اسم المسؤول
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="أحمد بن محمد العتيبي"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                رقم الجوال
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                البريد الإلكتروني للشركة
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="info@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="٨ أحرف على الأقل"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد كتابة كلمة المرور"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Product category */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-3">
                فئة المنتجات الرئيسية
              </label>
              <div className="grid grid-cols-2 gap-2">
                {supplierCategories.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, category: id })
                    }
                    className={`p-3 rounded-xl border-2 text-right flex items-center gap-2 transition-all ${
                      form.category === id
                        ? "border-[#1565C0] bg-[#E3F2FD]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        form.category === id
                          ? "text-[#1565C0]"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        form.category === id
                          ? "text-[#263238]"
                          : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product types */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                أنواع المنتجات التي تبيعها
              </label>
              <input
                type="text"
                placeholder="مثال: أسمدة نيتروجينية، بذور قمح، مبيدات حشرية"
                value={form.productTypes}
                onChange={(e) =>
                  setForm({ ...form, productTypes: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                الموقع الإلكتروني{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                نبذة عن الشركة
              </label>
              <textarea
                placeholder="اكتب نبذة مختصرة عن شركتك ومنتجاتك..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-all resize-none"
                required
              />
            </div>

            {/* Upload docs */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                وثائق الشركة{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("رفع الوثائق سيكون متاحاً بعد إنشاء الحساب")
                }
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1565C0] hover:text-[#1565C0] transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>رفع السجل التجاري أو الوثائق (PDF)</span>
              </button>
            </div>

            {/* Notice */}
            <div className="bg-[#E3F2FD] border border-[#1565C0]/30 rounded-xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-[#1565C0] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#263238]/80">
                سيتم مراجعة طلبك خلال <strong>٤٨ ساعة</strong> من قِبل فريق حصاد
                وإشعارك بالموافقة عبر الجوال والبريد الإلكتروني
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms
                    ? "bg-[#1565C0] border-[#1565C0]"
                    : "border-gray-300"
                }`}
              >
                {agreedToTerms && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                أوافق على{" "}
                <span className="text-[#1565C0] hover:underline cursor-pointer">
                  شروط الموردين
                </span>{" "}
                و{" "}
                <span className="text-[#1565C0] hover:underline cursor-pointer">
                  سياسة الخصوصية
                </span>
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || (step === 3 && !agreedToTerms)}
          className="w-full py-4 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#1565C0]/30 disabled:opacity-70 mt-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {step === 1
                  ? "التالي: بيانات المسؤول"
                  : step === 2
                  ? "التالي: تفاصيل النشاط"
                  : "تقديم طلب التسجيل"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        لديك حساب بالفعل؟{" "}
        <button
          onClick={onBackToLogin}
          className="text-[#4CAF50] font-semibold hover:underline"
        >
          سجّل دخولك
        </button>
      </p>
    </motion.div>
  );
}
