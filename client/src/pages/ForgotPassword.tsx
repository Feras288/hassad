/**
 * ForgotPassword — صفحة استعادة كلمة المرور لمنصة حصاد
 * Design: Split-screen layout — متوافق مع تصميم AuthPage
 * Colors: #2E7D32 (dark green), #4CAF50 (medium green), #C9A227 (golden wheat), #F5F1E8 (soft beige)
 * Steps: 1) إدخال رقم الجوال/البريد → 2) رمز التحقق OTP → 3) كلمة مرور جديدة → 4) نجاح
 */

import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2,
  RefreshCw, ShieldCheck, KeyRound, Leaf, ChevronRight, Store
} from "lucide-react";
import { toast } from "sonner";

const BG_IMAGE = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80";

type Step = "contact" | "otp" | "new-password" | "success";

// OTP Input component
function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value];
    next[i] = val.slice(-1);
    onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted.split(""));
      refs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
            ${value[i]
              ? "border-[#4CAF50] bg-green-50 text-[#2E7D32]"
              : "border-gray-200 bg-white text-[#263238] focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
            }`}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("contact");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedContact, setMaskedContact] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const maskContact = (val: string, type: "phone" | "email") => {
    if (type === "phone") {
      return val.slice(0, 3) + "****" + val.slice(-3);
    }
    const [user, domain] = val.split("@");
    return user.slice(0, 2) + "***@" + domain;
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error("يرجى إدخال رقم الجوال أو البريد الإلكتروني");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMaskedContact(maskContact(contact, contactType));
      setCountdown(60);
      setStep("otp");
      toast.success("تم إرسال رمز التحقق بنجاح");
    }, 1500);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("يرجى إدخال رمز التحقق كاملاً (6 أرقام)");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Demo: accept any 6-digit code
      setStep("new-password");
    }, 1200);
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    setOtp(Array(6).fill(""));
    setCountdown(60);
    toast.success("تم إعادة إرسال رمز التحقق");
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "ضعيفة", color: "bg-red-400" };
    if (score === 2) return { level: 2, label: "متوسطة", color: "bg-amber-400" };
    if (score === 3) return { level: 3, label: "جيدة", color: "bg-blue-400" };
    return { level: 4, label: "قوية", color: "bg-[#4CAF50]" };
  };

  const strength = passwordStrength(newPassword);

  const stepConfig = {
    contact: { num: 1, title: "إدخال بيانات التواصل" },
    otp: { num: 2, title: "التحقق من الهوية" },
    "new-password": { num: 3, title: "كلمة مرور جديدة" },
    success: { num: 4, title: "تم بنجاح" },
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>

      {/* ===== Right Panel: Background Image ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={BG_IMAGE} alt="حصاد" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#1B5E20]/90 via-[#2E7D32]/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">حصاد</span>
          </Link>

          {/* Center Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black leading-tight mb-4">
                استعادة<br />
                <span className="text-[#C9A227]">حسابك</span><br />
                بكل سهولة
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                نحن هنا لمساعدتك في استعادة الوصول إلى حسابك بأمان وسرعة
              </p>
            </div>

            {/* Steps indicator */}
            <div className="space-y-4">
              {[
                { icon: Phone, label: "أدخل رقم جوالك أو بريدك الإلكتروني" },
                { icon: ShieldCheck, label: "تحقق من رمز التحقق المُرسَل" },
                { icon: KeyRound, label: "أنشئ كلمة مرور جديدة وآمنة" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${
                  stepConfig[step].num > i + 1 ? "opacity-100" :
                  stepConfig[step].num === i + 1 ? "opacity-100 scale-105" : "opacity-40"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    stepConfig[step].num > i + 1 ? "bg-[#C9A227]" :
                    stepConfig[step].num === i + 1 ? "bg-white/20 backdrop-blur-sm" : "bg-white/10"
                  }`}>
                    {stepConfig[step].num > i + 1
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : <item.icon className="w-5 h-5 text-white" />
                    }
                  </div>
                  <span className="text-sm font-medium text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Leaf className="w-4 h-4" />
            <span>منصة حصاد — المدخلات الزراعية والخدمات</span>
          </div>
        </div>
      </div>

      {/* ===== Left Panel: Form ===== */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#F5F1E8] min-h-screen">

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#2E7D32] font-bold text-xl">
              <Store className="w-6 h-6" />
              <span>حصاد</span>
          </Link>
          <Link href="/login" className="text-sm text-[#4CAF50] font-medium">تسجيل الدخول</Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">

            {/* Back to login */}
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors mb-8 group">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                العودة لتسجيل الدخول
            </Link>

            {/* Progress bar */}
            {step !== "success" && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">الخطوة {stepConfig[step].num} من 3</span>
                  <span className="text-xs font-semibold text-[#2E7D32]">{stepConfig[step].title}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-[#4CAF50] to-[#2E7D32] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stepConfig[step].num / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ===== STEP 1: Contact Input ===== */}
              {step === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-[#2E7D32]" />
                      </div>
                      <h1 className="text-2xl font-black text-[#263238] mb-2">نسيت كلمة المرور؟</h1>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        أدخل رقم جوالك أو بريدك الإلكتروني المسجّل وسنرسل لك رمز التحقق
                      </p>
                    </div>

                    {/* Toggle: Phone / Email */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                      <button
                        type="button"
                        onClick={() => { setContactType("phone"); setContact(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          contactType === "phone"
                            ? "bg-white text-[#2E7D32] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        رقم الجوال
                      </button>
                      <button
                        type="button"
                        onClick={() => { setContactType("email"); setContact(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          contactType === "email"
                            ? "bg-white text-[#2E7D32] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </button>
                    </div>

                    <form onSubmit={handleSendCode} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#263238] mb-2">
                          {contactType === "phone" ? "رقم الجوال" : "البريد الإلكتروني"}
                        </label>
                        <div className="relative">
                          {contactType === "phone"
                            ? <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            : <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          }
                          <input
                            type={contactType === "phone" ? "tel" : "email"}
                            placeholder={contactType === "phone" ? "05XXXXXXXX" : "example@email.com"}
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                            dir={contactType === "phone" ? "ltr" : "rtl"}
                            className="w-full pr-12 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>إرسال رمز التحقق</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 2: OTP Verification ===== */}
              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#E3F2FD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-[#1565C0]" />
                      </div>
                      <h1 className="text-2xl font-black text-[#263238] mb-2">رمز التحقق</h1>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        أرسلنا رمز مكوّن من 6 أرقام إلى
                        <br />
                        <span className="font-bold text-[#263238] text-base" dir="ltr">{maskedContact}</span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <OTPInput value={otp} onChange={setOtp} />

                      <button
                        type="submit"
                        disabled={isLoading || otp.join("").length < 6}
                        className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>تحقق من الرمز</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Resend */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          لم تستلم الرمز؟{" "}
                          {countdown > 0 ? (
                            <span className="font-semibold text-gray-400">
                              إعادة الإرسال بعد {countdown}ث
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              className="font-semibold text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
                            >
                              إعادة الإرسال
                            </button>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setStep("contact"); setOtp(Array(6).fill("")); }}
                        className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        تغيير رقم الجوال أو البريد
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 3: New Password ===== */}
              {step === "new-password" && (
                <motion.div
                  key="new-password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#FFF8E1] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#C9A227]" />
                      </div>
                      <h1 className="text-2xl font-black text-[#263238] mb-2">كلمة مرور جديدة</h1>
                      <p className="text-sm text-gray-500">
                        أنشئ كلمة مرور قوية وآمنة لحسابك
                      </p>
                    </div>

                    <form onSubmit={handleSetPassword} className="space-y-5">
                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-semibold text-[#263238] mb-2">
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full pr-12 pl-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Password Strength */}
                        {newPassword && (
                          <div className="mt-2 space-y-1.5">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map(i => (
                                <div
                                  key={i}
                                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                    i <= strength.level ? strength.color : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">
                              قوة كلمة المرور:{" "}
                              <span className={`font-semibold ${
                                strength.level <= 1 ? "text-red-500" :
                                strength.level === 2 ? "text-amber-500" :
                                strength.level === 3 ? "text-blue-500" : "text-[#4CAF50]"
                              }`}>
                                {strength.label}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-semibold text-[#263238] mb-2">
                          تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full pr-12 pl-12 py-3.5 bg-white border rounded-xl text-[#263238] placeholder-gray-400 focus:outline-none transition-all ${
                              confirmPassword && confirmPassword !== newPassword
                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                                : confirmPassword && confirmPassword === newPassword
                                ? "border-[#4CAF50] focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
                                : "border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          {confirmPassword && confirmPassword === newPassword && (
                            <CheckCircle2 className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4CAF50]" />
                          )}
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-xs text-red-500 mt-1.5">كلمتا المرور غير متطابقتين</p>
                        )}
                      </div>

                      {/* Tips */}
                      <div className="bg-[#F5F1E8] rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-[#263238] mb-2">متطلبات كلمة المرور:</p>
                        {[
                          { check: newPassword.length >= 8, label: "8 أحرف على الأقل" },
                          { check: /[A-Z]/.test(newPassword), label: "حرف كبير واحد على الأقل" },
                          { check: /[0-9]/.test(newPassword), label: "رقم واحد على الأقل" },
                        ].map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              req.check ? "bg-[#4CAF50]" : "bg-gray-300"
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <span className={`text-xs transition-colors ${req.check ? "text-[#2E7D32] font-medium" : "text-gray-500"}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                        className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>حفظ كلمة المرور الجديدة</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 4: Success ===== */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-12 h-12 text-[#4CAF50]" />
                    </motion.div>

                    <h1 className="text-2xl font-black text-[#263238] mb-3">
                      تم تغيير كلمة المرور!
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      تم تحديث كلمة مرور حسابك بنجاح.
                      <br />
                      يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20"
                      >
                        <span>تسجيل الدخول الآن</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <Link href="/" className="block w-full text-center py-3 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors font-medium">
                          العودة للصفحة الرئيسية
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
