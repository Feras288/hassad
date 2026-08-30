import { motion } from "framer-motion";
import { ChevronRight, Tractor, Wrench, Store } from "lucide-react";
import { AuthMode } from "./AuthSidebar";

interface AccountTypeSelectProps {
  onSelect: (mode: AuthMode) => void;
  onBackToLogin: () => void;
}

export default function AccountTypeSelect({
  onSelect,
  onBackToLogin,
}: AccountTypeSelectProps) {
  return (
    <motion.div
      key="account-type"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBackToLogin}
        className="flex items-center gap-2 text-gray-500 hover:text-[#2E7D32] mb-6 transition-colors text-sm"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة لتسجيل الدخول</span>
      </button>

      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#263238] mb-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          أنشئ حسابك
        </h1>
        <p className="text-gray-500">اختر نوع حسابك للبدء في تجربة حصاد</p>
      </div>

      <div className="space-y-4">
        {/* Farmer card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("register-farmer")}
          className="w-full p-6 bg-white border-2 border-transparent hover:border-[#4CAF50] rounded-2xl text-right transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#E8F5E9] group-hover:bg-[#4CAF50] rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <Tractor className="w-7 h-7 text-[#2E7D32] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className="text-lg font-bold text-[#263238]"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  مزارع
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#4CAF50] transition-colors rotate-180" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                اشترِ المدخلات الزراعية، شخّص محاصيلك بالذكاء الاصطناعي، واحجز
                خدمات الخبراء
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["سوق المدخلات", "تشخيص المحاصيل", "حجز الخدمات"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Provider card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("register-provider")}
          className="w-full p-6 bg-white border-2 border-transparent hover:border-[#C9A227] rounded-2xl text-right transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#FFF8E1] group-hover:bg-[#C9A227] rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <Wrench className="w-7 h-7 text-[#C9A227] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className="text-lg font-bold text-[#263238]"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  مقدم خدمة
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C9A227] transition-colors rotate-180" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                قدّم خدماتك الزراعية المتخصصة لآلاف المزارعين وابنِ سمعتك المهنية
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["مهندس زراعي", "طبيب بيطري", "تقني ري", "مكافحة آفات"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#FFF8E1] text-[#C9A227] px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Supplier card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("register-supplier")}
          className="w-full p-6 bg-white border-2 border-transparent hover:border-[#1565C0] rounded-2xl text-right transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#E3F2FD] group-hover:bg-[#1565C0] rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <Store className="w-7 h-7 text-[#1565C0] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-lg font-bold text-[#263238]"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    مورد / شركة
                  </h3>
                  <span className="text-xs bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full font-semibold">
                    جديد
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1565C0] transition-colors rotate-180" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                بيع منتجاتك الزراعية لآلاف المزارعين والشركات عبر سوق حصاد
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["بيع المنتجات", "إدارة المخزون", "تقارير المبيعات"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#E3F2FD] text-[#1565C0] px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
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
