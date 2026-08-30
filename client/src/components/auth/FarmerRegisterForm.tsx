import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Tractor,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface FarmerFormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmName: string;
  farmType: string;
  region: string;
  farmSize: string;
  crops: string;
}

interface FarmerRegisterFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBackToAccountType: () => void;
  onBackToLogin: () => void;
  form: FarmerFormState;
  setForm: React.Dispatch<React.SetStateAction<FarmerFormState>>;
  step: number;
  setStep: (step: number) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}

const farmTypes = [
  "مزرعة نخيل",
  "مزرعة حبوب",
  "مزرعة خضروات",
  "مزرعة فاكهة",
  "مزرعة مختلطة",
  "مزرعة حيوانات",
  "مشتل",
  "أخرى",
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

export default function FarmerRegisterForm({
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
}: FarmerRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      key="register-farmer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step === 1 ? onBackToAccountType() : setStep(1))}
          className="flex items-center gap-2 text-gray-500 hover:text-[#2E7D32] transition-colors text-sm"
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
                  s <= step ? "w-8 bg-[#4CAF50]" : "w-4 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center">
            <Tractor className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#263238]"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {step === 1 ? "بياناتك الشخصية" : "بيانات مزرعتك"}
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1 ? "أدخل معلوماتك الأساسية" : "أخبرنا عن مزرعتك"}
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
                  placeholder="محمد بن عبدالله الغامدي"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
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
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                البريد الإلكتروني{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
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
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
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
                  className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
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
            {/* Farm name */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                اسم المزرعة
              </label>
              <div className="relative">
                <Leaf className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="مزرعة الأمل"
                  value={form.farmName}
                  onChange={(e) =>
                    setForm({ ...form, farmName: e.target.value })
                  }
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Farm type */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                نوع المزرعة
              </label>
              <select
                value={form.farmType}
                onChange={(e) =>
                  setForm({ ...form, farmType: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all appearance-none"
                required
              >
                <option value="">اختر نوع المزرعة</option>
                {farmTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all appearance-none"
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

            {/* Farm size */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                مساحة المزرعة (هكتار){" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <input
                type="number"
                placeholder="مثال: 50"
                value={form.farmSize}
                onChange={(e) =>
                  setForm({ ...form, farmSize: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
                min="0"
              />
            </div>

            {/* Main crops */}
            <div>
              <label className="block text-sm font-semibold text-[#263238] mb-2">
                المحاصيل الرئيسية{" "}
                <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: قمح، نخيل، طماطم"
                value={form.crops}
                onChange={(e) => setForm({ ...form, crops: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms
                    ? "bg-[#4CAF50] border-[#4CAF50]"
                    : "border-gray-300"
                }`}
              >
                {agreedToTerms && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                أوافق على{" "}
                <span className="text-[#4CAF50] hover:underline cursor-pointer">
                  شروط الاستخدام
                </span>{" "}
                و{" "}
                <span className="text-[#4CAF50] hover:underline cursor-pointer">
                  سياسة الخصوصية
                </span>
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || (step === 2 && !agreedToTerms)}
          className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/30 disabled:opacity-70 mt-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {step === 1 ? "التالي: بيانات المزرعة" : "إنشاء الحساب"}
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
