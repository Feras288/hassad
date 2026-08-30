// ===================================================
// Hasaad Platform — Vendor Store Settings Page
// Design: Modern SaaS + Organic Warmth | RTL Arabic
// ===================================================
import { useEffect, useState } from "react";
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  Camera,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { vendorProfile, providerProfile } from "@/lib/vendorDashboardData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface VendorSettingsProps {
  vendorType?: "supplier" | "provider";
}

type SettingsTab = "store" | "personal" | "security" | "notifications" | "payment";

export default function VendorSettings({ vendorType = "supplier" }: VendorSettingsProps) {
  const profile = vendorType === "supplier" ? vendorProfile : providerProfile;
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store form state
  const [storeForm, setStoreForm] = useState({
    name: profile.name,
    specialty: profile.specialty,
    location: profile.location,
    phone: "0501234567",
    email: "info@hasaad-store.com",
    website: "www.hasaad-store.com",
    description:
      vendorType === "supplier"
        ? "شركة متخصصة في توفير المستلزمات الزراعية عالية الجودة من أسمدة ومبيدات وبذور ومعدات ري للمزارعين في المملكة العربية السعودية."
        : "مهندس زراعي متخصص في الإنتاج النباتي وإدارة المزارع، أقدم خدمات استشارية واحترافية لمساعدة المزارعين على تحسين إنتاجيتهم.",
    workingHours: "8:00 ص - 6:00 م",
    workingDays: "السبت - الخميس",
  });

  const utils = trpc.useUtils();
  const { user } = useAuth();
  const { language, setLanguage, direction, isEnglish } = useLanguage();
  const canAccessVendorNotifications = vendorType === "supplier" && user?.role === "vendor" && Boolean(user.vendorId);
  const { data: savedPreferences, isLoading: isLoadingPreferences } = trpc.vendorNotificationPreferences.get.useQuery(undefined, { enabled: canAccessVendorNotifications });
  const [notificationPreferences, setNotificationPreferences] = useState({ productQuestionEnabled: true, inAppToastEnabled: true });
  useEffect(() => {
    if (savedPreferences) setNotificationPreferences({ productQuestionEnabled: savedPreferences.productQuestionEnabled, inAppToastEnabled: savedPreferences.inAppToastEnabled });
  }, [savedPreferences]);
  const saveNotificationPreferences = trpc.vendorNotificationPreferences.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ تفضيلات الإشعارات");
      utils.vendorNotificationPreferences.get.invalidate();
    },
    onError: () => toast.error("تعذر حفظ تفضيلات الإشعارات، حاول مرة أخرى"),
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "store", label: vendorType === "supplier" ? "إعدادات المتجر" : "إعدادات الملف", icon: Store },
    { id: "personal", label: "البيانات الشخصية", icon: User },
    { id: "security", label: "الأمان وكلمة المرور", icon: Shield },
    { id: "notifications", label: "الإشعارات", icon: Bell },
    { id: "payment", label: "طرق الدفع والسحب", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8]/30 flex" dir={direction}>
      <VendorSidebar vendorType={vendorType} />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          vendorType={vendorType}
          pageTitle="الإعدادات"
          pageSubtitle="إدارة بيانات حسابك ومتجرك"
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-[#2E7D32] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Store Settings Tab */}
            {activeTab === "store" && (
              <div className="space-y-6">
                {/* Store Cover & Logo */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="h-32 bg-gradient-to-l from-[#2E7D32] to-[#4CAF50] relative">
                    <button className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 text-[#263238] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
                      <Camera size={13} />
                      تغيير صورة الغلاف
                    </button>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10 mb-4">
                      <div className="relative">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                        />
                        <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-[#2E7D32] rounded-lg flex items-center justify-center shadow-md">
                          <Camera size={13} className="text-white" />
                        </button>
                      </div>
                      <div className="pb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#263238]">{profile.name}</h3>
                          {profile.verified && (
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                              <CheckCircle size={11} />
                              موثق
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={12} className="text-[#C9A227] fill-[#C9A227]" />
                          <span className="text-sm text-gray-600">{profile.rating} ({profile.reviewCount} تقييم)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">
                          {vendorType === "supplier" ? "اسم المتجر / الشركة" : "الاسم الكامل"}
                        </label>
                        <input
                          type="text"
                          value={storeForm.name}
                          onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">التخصص / الفئة</label>
                        <input
                          type="text"
                          value={storeForm.specialty}
                          onChange={(e) => setStoreForm({ ...storeForm, specialty: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">نبذة تعريفية</label>
                        <textarea
                          rows={3}
                          value={storeForm.description}
                          onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">
                          <MapPin size={13} className="inline ml-1" />
                          الموقع
                        </label>
                        <input
                          type="text"
                          value={storeForm.location}
                          onChange={(e) => setStoreForm({ ...storeForm, location: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">
                          <Globe size={13} className="inline ml-1" />
                          الموقع الإلكتروني
                        </label>
                        <input
                          type="text"
                          value={storeForm.website}
                          onChange={(e) => setStoreForm({ ...storeForm, website: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">
                          <Clock size={13} className="inline ml-1" />
                          ساعات العمل
                        </label>
                        <input
                          type="text"
                          value={storeForm.workingHours}
                          onChange={(e) => setStoreForm({ ...storeForm, workingHours: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#263238] mb-1.5">أيام العمل</label>
                        <input
                          type="text"
                          value={storeForm.workingDays}
                          onChange={(e) => setStoreForm({ ...storeForm, workingDays: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#263238] mb-4">حالة التوثيق</h3>
                  <div className="space-y-3">
                    {[
                      { label: "التحقق من الهوية", status: true, desc: "تم التحقق من هويتك الوطنية" },
                      { label: "التحقق من رقم الهاتف", status: true, desc: "تم التحقق من رقم +966 50 123 4567" },
                      { label: "التحقق من البريد الإلكتروني", status: true, desc: "info@hasaad-store.com موثق" },
                      {
                        label: vendorType === "supplier" ? "وثائق السجل التجاري" : "الشهادات المهنية",
                        status: vendorType === "supplier",
                        desc: vendorType === "supplier" ? "تم رفع وثائق السجل التجاري" : "يرجى رفع شهاداتك المهنية",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {item.status ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <AlertCircle size={18} className="text-amber-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#263238]">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        {!item.status && (
                          <button className="text-xs text-[#2E7D32] font-medium hover:underline">
                            رفع الآن
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#263238] mb-5">البيانات الشخصية وبيانات التواصل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#263238] mb-1.5">
                      <Phone size={13} className="inline ml-1" />
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#263238] mb-1.5">
                      <Mail size={13} className="inline ml-1" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#263238] mb-1.5">المدينة</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white">
                      <option>الرياض</option>
                      <option>جدة</option>
                      <option>الدمام</option>
                      <option>القصيم</option>
                      <option>المدينة المنورة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#263238] mb-1.5">اللغة المفضلة</label>
                    <select aria-label={isEnglish ? "Display language" : "لغة العرض"} value={language} onChange={(event) => { setLanguage(event.target.value as "ar" | "en"); toast.success(isEnglish ? "Display language saved" : "تم حفظ لغة العرض"); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#263238] mb-5">
                    <Lock size={16} className="inline ml-2" />
                    تغيير كلمة المرور
                  </h3>
                  <div className="space-y-4 max-w-md">
                    {["كلمة المرور الحالية", "كلمة المرور الجديدة", "تأكيد كلمة المرور الجديدة"].map(
                      (label, i) => (
                        <div key={i}>
                          <label className="block text-sm font-medium text-[#263238] mb-1.5">{label}</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] pl-10"
                              dir="ltr"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                    <button
                      onClick={() => toast.success("تم تغيير كلمة المرور بنجاح")}
                      className="bg-[#2E7D32] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-colors"
                    >
                      تحديث كلمة المرور
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#263238] mb-4">المصادقة الثنائية</h3>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div>
                      <p className="text-sm font-medium text-[#263238]">التحقق برسالة SMS</p>
                      <p className="text-xs text-gray-500 mt-0.5">إرسال رمز تحقق عند كل تسجيل دخول</p>
                    </div>
                    <div className="w-12 h-6 bg-[#2E7D32] rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#263238] mb-5">إعدادات الإشعارات</h3>
                {!canAccessVendorNotifications ? <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">تفضيلات إشعارات المورد متاحة للحسابات المرتبطة بملف مورد معتمد.</div> : isLoadingPreferences ? <p className="text-sm text-gray-500">جارٍ تحميل التفضيلات…</p> : <div className="space-y-5">
                  <p className="text-sm text-gray-500">تُحفظ هذه التفضيلات لحساب المورد الحالي وتُطبّق تلقائياً على الإشعارات القادمة.</p>
                  {[
                    { key: "productQuestionEnabled" as const, label: "أسئلة المنتجات", desc: "إنشاء إشعار عند ورود سؤال جديد على أحد منتجاتك" },
                    { key: "inAppToastEnabled" as const, label: "تنبيه منبثق داخل اللوحة", desc: "إظهار تنبيه فوري أثناء تصفحك لوحة المورد" },
                  ].map((item) => <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-100">
                    <div><p className="text-sm font-medium text-[#263238]">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                    <button onClick={() => setNotificationPreferences((current) => ({ ...current, [item.key]: !current[item.key] }))} role="switch" aria-checked={notificationPreferences[item.key]} className={`w-11 h-6 rounded-full relative transition-colors ${notificationPreferences[item.key] ? "bg-[#2E7D32]" : "bg-gray-200"}`}>
                      <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notificationPreferences[item.key] ? "left-0.5" : "right-0.5"}`} />
                    </button>
                  </div>)}
                  <div className="flex justify-end pt-2"><button onClick={() => saveNotificationPreferences.mutate(notificationPreferences)} disabled={saveNotificationPreferences.isPending} className="flex items-center gap-2 bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B5E20] disabled:opacity-60"><Save size={15} />{saveNotificationPreferences.isPending ? "جارٍ الحفظ…" : "حفظ تفضيلات الإشعارات"}</button></div>
                </div>}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#263238] mb-4">حساب الإيرادات</h3>
                  <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#C9A227]/20 mb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">الرصيد المتاح للسحب</p>
                        <p className="text-3xl font-bold text-[#2E7D32] mt-1">
                          {(42500).toLocaleString("ar-SA")} ر.س
                        </p>
                      </div>
                      <button className="bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-colors">
                        طلب سحب
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "إجمالي الإيرادات", value: "284,750 ر.س", color: "text-[#2E7D32]" },
                      { label: "قيد المعالجة", value: "12,300 ر.س", color: "text-amber-600" },
                      { label: "تم السحب", value: "229,950 ر.س", color: "text-gray-600" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl">
                        <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#263238]">حسابات الاستلام</h3>
                    <button className="text-sm text-[#2E7D32] font-medium hover:underline">
                      + إضافة حساب
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { bank: "بنك الراجحي", iban: "SA44 2000 0001 2345 6789 1234", primary: true },
                      { bank: "البنك الأهلي", iban: "SA03 8000 0000 6080 1016 7519", primary: false },
                    ].map((account, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          account.primary
                            ? "border-[#4CAF50] bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <CreditCard size={18} className="text-[#2E7D32]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#263238]">{account.bank}</p>
                            <p className="text-xs text-gray-500 font-mono" dir="ltr">
                              {account.iban}
                            </p>
                          </div>
                        </div>
                        {account.primary && (
                          <span className="text-xs bg-[#2E7D32] text-white px-2 py-0.5 rounded-full">
                            رئيسي
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {(activeTab === "store" || activeTab === "personal") && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#2E7D32] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1B5E20] transition-colors disabled:opacity-60"
                >
                  <Save size={16} />
                  {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
