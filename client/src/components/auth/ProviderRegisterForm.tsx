import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Wrench,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Droplets,
  Stethoscope,
  Bug,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface ProviderFormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  experience: string;
  region: string;
  bio: string;
  certifications: string;
}

interface ProviderRegisterFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBackToAccountType: () => void;
  onBackToLogin: () => void;
  form: ProviderFormState;
  setForm: React.Dispatch<React.SetStateAction<ProviderFormState>>;
  step: number;
  setStep: (step: number) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}

const providerSpecialties = [
  { id: "agronomist", label: "مهندس زراعي", icon: Leaf },
  { id: "irrigation", label: "تقني ري", icon: Droplets },
  { id: "vet", label: "طبيب بيطري", icon: Stethoscope },
  { id: "pest", label: "أخصائي مكافحة آفات", icon: Bug },
  { id: "equipment", label: "تقني معدات", icon: Wrench },
  { id: "company", label: "شركة زراعية", icon: Building2 },
];

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

export default function ProviderRegisterForm({
  isLoading,
  onSubmit,
  onBackToAccountType,
  onBackToLogin,
  form,
  setForm,
  step,
  setStep,
  selectedSpecialty,
  setSelectedSpecialty,
  agreedToTerms,
  setAgreedToTerms,
}: ProviderRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      key="register-provider"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step === 1 ? onBackToAccountType() : setStep(1))}
          className="flex items-center gap-2 text-gray-500 hover:text-[#C9A227] transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4" />
          <span>{step === 1 ? "تغيير نوع الحساب" : "الخطوة السابقة"}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">الخطوة {step} من 2</span>
          <div className="flex gap-1">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "w-8 bg-[#C9A227]" : "w-4 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#263238]"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {step === 1 ? "بياناتك الشخصية" : "ملفك المهني"}
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1
                ? "أدخل معلوماتك الأساسية"
                : "أخبرنا عن خبرتك وتخصصك"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="م. خالد بن عبدالله الحربي"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all"
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
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all"
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
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all"
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
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all"
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
        ) : (
          <>
            {/* Specialty */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-3">
                التخصص الرئيسي
              </label>
              <div className="grid grid-cols-2 gap-2">
                {providerSpecialties.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(id);
                      setForm({ ...form, specialty: id });
                    }}
                    className={`p-3 rounded-xl border-2 text-right flex items-center gap-2 transition-all ${
                      selectedSpecialty === id
                        ? "border-[#C9A227] bg-[#FFF8E1]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        selectedSpecialty === id
                          ? "text-[#C9A227]"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selectedSpecialty === id
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

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                سنوات الخبرة
              </label>
              <select
                value={form.experience}
                onChange={(e) =>
                  setForm({ ...form, experience: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all appearance-none"
                required
              >
                <option value="">اختر سنوات الخبرة</option>
                <option value="1-3">١ - ٣ سنوات</option>
                <option value="3-5">٣ - ٥ سنوات</option>
                <option value="5-10">٥ - ١٠ سنوات</option>
                <option value="10+">أكثر من ١٠ سنوات</option>
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                منطقة العمل
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={form.region}
                  onChange={(e) =>
                    setForm({ ...form, region: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all appearance-none"
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

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                نبذة مهنية مختصرة
              </label>
              <textarea
                placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all resize-none"
                required
              />
            </div>

            {/* Upload cert */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                الشهادات والمؤهلات{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("رفع الملفات سيكون متاحاً بعد إنشاء الحساب")
                }
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#C9A227] hover:text-[#C9A227] transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>رفع الشهادات (PDF أو صورة)</span>
              </button>
            </div>

            {/* Notice */}
            <div className="bg-[#FFF8E1] border border-[#C9A227]/30 rounded-xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#263238]/80">
                سيتم مراجعة ملفك الشخصي خلال <strong>٢٤ ساعة</strong> وإشعارك
                بالموافقة عبر الجوال
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms
                    ? "bg-[#C9A227] border-[#C9A227]"
                    : "border-gray-300"
                }`}
              >
                {agreedToTerms && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                أوافق على{" "}
                <span className="text-[#C9A227] hover:underline cursor-pointer">
                  شروط مقدمي الخدمات
                </span>{" "}
                و{" "}
                <span className="text-[#C9A227] hover:underline cursor-pointer">
                  سياسة الخصوصية
                </span>
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || (step === 2 && !agreedToTerms)}
          className="w-full py-4 bg-[#C9A227] hover:bg-[#B8911F] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#C9A227]/30 disabled:opacity-70 mt-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {step === 1 ? "التالي: الملف المهني" : "إنشاء الحساب"}
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
