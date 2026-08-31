import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSelectAccountType: () => void;
  form: { email: string; password: string };
  setForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
  onSocialLogin?: (provider: "google") => void;
}

export default function LoginForm({
  isLoading,
  onSubmit,
  onSelectAccountType,
  form,
  setForm,
  onSocialLogin,
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
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#263238] mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/30 disabled:opacity-70 cursor-pointer"
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

        {/* Social Login */}
        {onSocialLogin && (
          <button
            type="button"
            onClick={() => onSocialLogin("google")}
            disabled={isLoading}
            className="w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>الدخول عبر حساب Google</span>
          </button>
        )}

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
          className="w-full py-4 bg-white border-2 border-[#2E7D32] text-[#2E7D32] font-bold rounded-xl hover:bg-[#2E7D32]/5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
