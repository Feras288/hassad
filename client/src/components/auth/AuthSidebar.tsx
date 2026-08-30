import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Wrench, Tractor, Star, Shield, Zap } from "lucide-react";

export type AuthMode =
  | "login"
  | "account-type"
  | "register-farmer"
  | "register-provider"
  | "register-supplier";

const FARMER_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663029533510/mqCLLZX4KQJEDX5TmTqCwV/auth-bg-farmer-Vc3P5nbahjab9RUf9tm3Xs.webp";
const PROVIDER_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663029533510/mqCLLZX4KQJEDX5TmTqCwV/auth-bg-provider-LxNkZSGxJf5sEb3KVy8Wn3.webp";

interface AuthSidebarProps {
  mode: AuthMode;
}

export default function AuthSidebar({ mode }: AuthSidebarProps) {
  const bgImage = mode === "register-provider" ? PROVIDER_BG : FARMER_BG;

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#1B5E20]/90 via-[#2E7D32]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                حصاد
              </div>
              <div className="text-xs text-white/70">منصة زراعية متكاملة</div>
            </div>
          </div>
        </Link>

        {/* Main message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {mode === "register-provider" ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <Wrench className="w-4 h-4" />
                  <span>انضم كمقدم خدمة</span>
                </div>
                <h2
                  className="text-4xl font-bold leading-tight"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  وسّع نطاق
                  <br />
                  خدماتك الزراعية
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  انضم لشبكة من أفضل الخبراء الزراعيين وتواصل مع آلاف المزارعين في
                  جميع أنحاء المملكة
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Star, text: "وصول لأكثر من ١٢,٠٠٠ مزارع" },
                    { icon: Shield, text: "دفع آمن ومضمون" },
                    { icon: Zap, text: "إدارة مواعيدك بسهولة" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C9A227]/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#C9A227]" />
                      </div>
                      <span className="text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <Tractor className="w-4 h-4" />
                  <span>منصة المزارع الحديث</span>
                </div>
                <h2
                  className="text-4xl font-bold leading-tight"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  كل ما تحتاجه
                  <br />
                  مزرعتك في مكان واحد
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  سوق المدخلات الزراعية، تشخيص المحاصيل بالذكاء الاصطناعي، وخدمات
                  الخبراء — كلها في حصاد
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Leaf, text: "تشخيص أمراض المحاصيل فوراً" },
                    { icon: Shield, text: "منتجات موثوقة ومعتمدة" },
                    { icon: Star, text: "خبراء زراعيون معتمدون" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C9A227]/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#C9A227]" />
                      </div>
                      <span className="text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "١٢,٠٠٠+", label: "مزارع" },
            { value: "٨٥٠+", label: "مورد" },
            { value: "٩٥٪", label: "رضا العملاء" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <div
                className="text-2xl font-bold text-[#C9A227]"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {value}
              </div>
              <div className="text-xs text-white/70 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
