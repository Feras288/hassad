import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSelectAccountType: () => void;
  form: { phone: string; password: string };
  setForm: React.Dispatch<React.SetStateAction<{ phone: string; password: string }>>;
}

export default function LoginForm({
  isLoading,
  onSubmit,
  onSelectAccountType,
  form,
  setForm,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#263238] mb-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          مرحباً بعودتك 👋
        </h1>
        <p className="text-gray-500">سجّل دخولك للوصول إلى حسابك في حصاد</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#263238]">
              كلمة المرور
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-[#4CAF50] hover:text-[#2E7D32] font-medium transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
              required
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/30 disabled:opacity-70"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>تسجيل الدخول</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">أو</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Register link */}
        <button
          type="button"
          onClick={onSelectAccountType}
          className="w-full py-4 bg-white border-2 border-[#2E7D32] text-[#2E7D32] font-bold rounded-xl hover:bg-[#2E7D32]/5 transition-all duration-200 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          <span>إنشاء حساب جديد</span>
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        بتسجيل الدخول، أنت توافق على{" "}
        <span className="text-[#4CAF50] cursor-pointer hover:underline">
          شروط الاستخدام
        </span>{" "}
        و{" "}
        <span className="text-[#4CAF50] cursor-pointer hover:underline">
          سياسة الخصوصية
        </span>
      </p>
    </motion.div>
  );
}
