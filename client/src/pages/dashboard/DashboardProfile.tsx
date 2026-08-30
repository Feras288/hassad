// ================================================================
// HASAAD PLATFORM — Dashboard Profile Page
// Design: Modern SaaS, RTL, Dark green #2E7D32, Tajawal font
// Tabs: Personal Info, Addresses, Security, Notifications Prefs
// ================================================================
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  User,
  MapPin,
  Shield,
  Bell,
  Camera,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Home,
  Building2,
  Warehouse,
  Star,
  Phone,
  Mail,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Types ──────────────────────────────────────────────────────
interface Address {
  id: string;
  label: string;
  type: "home" | "farm" | "warehouse" | "other";
  recipient: string;
  phone: string;
  region: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  postalCode?: string;
  isDefault: boolean;
}

// ── Initial Data ───────────────────────────────────────────────
const initialProfile = {
  firstName: "محمد",
  lastName: "بن سعد الغامدي",
  phone: "0501234567",
  email: "mohammed@example.com",
  nationalId: "1234567890",
  farmName: "مزرعة الأمل",
  region: "الرياض",
  city: "الرياض",
  bio: "مزارع متخصص في زراعة القمح والذرة منذ أكثر من 15 عاماً في منطقة الرياض.",
  avatar: "",
  memberSince: "مارس 2023",
  totalOrders: 24,
  totalSpent: "١٢,٤٠٠",
  rating: 4.8,
};

const initialAddresses: Address[] = [
  {
    id: "addr1",
    label: "المزرعة الرئيسية",
    type: "farm",
    recipient: "محمد بن سعد الغامدي",
    phone: "0501234567",
    region: "الرياض",
    city: "الرياض",
    district: "حي الملقا",
    street: "طريق الملك فهد",
    building: "مبنى 12",
    postalCode: "12345",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "المستودع",
    type: "warehouse",
    recipient: "محمد الغامدي",
    phone: "0551234567",
    region: "الرياض",
    city: "الخرج",
    district: "المنطقة الصناعية",
    street: "شارع الصناعة",
    isDefault: false,
  },
];

const saudiRegions = ["الرياض", "مكة المكرمة", "المدينة المنورة", "القصيم", "المنطقة الشرقية", "عسير", "تبوك", "حائل", "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف"];

const addressTypeIcons = {
  home: Home,
  farm: Globe,
  warehouse: Warehouse,
  other: Building2,
};

const addressTypeLabels = {
  home: "المنزل",
  farm: "المزرعة",
  warehouse: "المستودع",
  other: "أخرى",
};

// ── Tab Button ─────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-[#2E7D32] text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Address Card ───────────────────────────────────────────────
function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: (a: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const Icon = addressTypeIcons[address.type];
  return (
    <div className={`relative bg-white rounded-2xl border-2 p-5 transition-all ${
      address.isDefault ? "border-[#2E7D32] shadow-md" : "border-gray-100 hover:border-gray-200"
    }`}>
      {address.isDefault && (
        <span className="absolute top-3 left-3 bg-[#2E7D32] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star size={10} fill="currentColor" /> افتراضي
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          address.isDefault ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-gray-100 text-gray-500"
        }`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{address.label}</div>
          <div className="text-xs text-gray-400">{addressTypeLabels[address.type]}</div>
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User size={13} className="text-gray-400 flex-shrink-0" />
          <span>{address.recipient}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={13} className="text-gray-400 flex-shrink-0" />
          <span dir="ltr">{address.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{address.district}، {address.city}، {address.region}</span>
        </div>
        <div className="text-xs text-gray-400 pr-5">{address.street}{address.building ? `، ${address.building}` : ""}{address.postalCode ? ` — ${address.postalCode}` : ""}</div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="flex-1 text-xs text-[#2E7D32] font-medium hover:bg-[#2E7D32]/5 py-1.5 rounded-lg transition-colors"
          >
            تعيين كافتراضي
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2E7D32] hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Edit2 size={12} /> تعديل
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> حذف
        </button>
      </div>
    </div>
  );
}

// ── Address Form Modal ─────────────────────────────────────────
function AddressModal({
  address,
  onSave,
  onClose,
}: {
  address: Address | null;
  onSave: (a: Address) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Address>(
    address || {
      id: `addr_${Date.now()}`,
      label: "",
      type: "farm",
      recipient: "",
      phone: "",
      region: "الرياض",
      city: "",
      district: "",
      street: "",
      building: "",
      postalCode: "",
      isDefault: false,
    }
  );

  const update = (field: keyof Address, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.label || !form.recipient || !form.phone || !form.city || !form.district || !form.street) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    onSave(form);
    toast.success(address ? "تم تحديث العنوان بنجاح" : "تم إضافة العنوان بنجاح");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-900 text-lg">{address ? "تعديل العنوان" : "إضافة عنوان جديد"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Label & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العنوان *</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="مثال: المزرعة الرئيسية"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العنوان</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] bg-white"
              >
                <option value="farm">مزرعة</option>
                <option value="home">منزل</option>
                <option value="warehouse">مستودع</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
          {/* Recipient & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستلم *</label>
              <input
                type="text"
                value={form.recipient}
                onChange={(e) => update("recipient", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
          </div>
          {/* Region & City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة *</label>
              <select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] bg-white"
              >
                {saudiRegions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
          </div>
          {/* District & Street */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحي *</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الشارع *</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
          </div>
          {/* Building & Postal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم المبنى</label>
              <input
                type="text"
                value={form.building || ""}
                onChange={(e) => update("building", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرمز البريدي</label>
              <input
                type="text"
                value={form.postalCode || ""}
                onChange={(e) => update("postalCode", e.target.value)}
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
          </div>
          {/* Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => update("isDefault", !form.isDefault)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.isDefault ? "bg-[#2E7D32]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isDefault ? "translate-x-0.5" : "translate-x-5"}`} />
            </div>
            <span className="text-sm text-gray-700">تعيين كعنوان افتراضي</span>
          </label>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#2E7D32] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1B5E20] transition-colors"
          >
            {address ? "حفظ التعديلات" : "إضافة العنوان"}
          </button>
          <button
            onClick={onClose}
            className="px-5 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function DashboardProfile() {
  const { language, setLanguage, isEnglish } = useLanguage();
  const [activeTab, setActiveTab] = useState<"info" | "addresses" | "security" | "notifications">("info");
  const [profile, setProfile] = useState(initialProfile);
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState(initialProfile);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [addressModal, setAddressModal] = useState<{ open: boolean; address: Address | null }>({ open: false, address: null });

  // Security state
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [twoFactor, setTwoFactor] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    priceDrops: true,
    sms: true,
    email: false,
    push: true,
  });

  // ── Handlers ──
  const handleSaveInfo = () => {
    setProfile(infoForm);
    setEditingInfo(false);
    toast.success("تم حفظ البيانات الشخصية بنجاح");
  };

  const handleSaveAddress = (addr: Address) => {
    if (addr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).map((a) => (a.id === addr.id ? addr : a))
      );
    }
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === addr.id);
      if (exists) return prev.map((a) => (a.id === addr.id ? addr : a));
      return [...prev, addr];
    });
    setAddressModal({ open: false, address: null });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("تم حذف العنوان");
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("تم تعيين العنوان الافتراضي");
  };

  const handleChangePassword = () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      toast.error("يرجى ملء جميع حقول كلمة المرور");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقتين");
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }
    setPwForm({ current: "", newPw: "", confirm: "" });
    toast.success("تم تغيير كلمة المرور بنجاح");
  };

  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(pwForm.newPw);
  const strengthLabels = ["", "ضعيفة", "مقبولة", "جيدة", "قوية"];
  const strengthColors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  return (
    <DashboardLayout
      title="الملف الشخصي"
      breadcrumb={[{ label: "لوحة التحكم", href: "/dashboard" }, { label: "الملف الشخصي" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-l from-[#1B5E20] via-[#2E7D32] to-[#388E3C] relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
          </div>
          <div className="px-6 pb-5">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#C9A227] border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-2xl">
                  {profile.firstName.charAt(0)}
                </div>
                <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-[#2E7D32] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#1B5E20] transition-colors">
                  <Camera size={13} />
                </button>
              </div>
              {/* Name & Meta */}
              <div className="flex-1 pb-1">
                <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                <p className="text-sm text-gray-500">{profile.farmName} · {profile.city}</p>
              </div>
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6 pb-1">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#2E7D32]">{profile.totalOrders}</div>
                  <div className="text-xs text-gray-400">طلب</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#C9A227]">{profile.totalSpent}</div>
                  <div className="text-xs text-gray-400">ريال</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    {profile.rating}
                  </div>
                  <div className="text-xs text-gray-400">تقييم</div>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={User} label="البيانات الشخصية" />
              <TabButton active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")} icon={MapPin} label="العناوين" badge={addresses.length} />
              <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={Shield} label="الأمان" />
              <TabButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={Bell} label="الإشعارات" />
            </div>
          </div>
        </div>

        {/* ── Tab: Personal Info ── */}
        {activeTab === "info" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">البيانات الشخصية</h3>
              {!editingInfo ? (
                <button
                  onClick={() => { setInfoForm(profile); setEditingInfo(true); }}
                  className="flex items-center gap-2 text-sm text-[#2E7D32] font-medium hover:bg-[#2E7D32]/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Edit2 size={14} /> تعديل
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveInfo}
                    className="flex items-center gap-1.5 text-sm bg-[#2E7D32] text-white font-medium px-4 py-1.5 rounded-lg hover:bg-[#1B5E20] transition-colors"
                  >
                    <Check size={14} /> حفظ
                  </button>
                  <button
                    onClick={() => setEditingInfo(false)}
                    className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={14} /> إلغاء
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">الاسم الأول</label>
                {editingInfo ? (
                  <input
                    type="text"
                    value={infoForm.firstName}
                    onChange={(e) => setInfoForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{profile.firstName}</div>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">اسم العائلة</label>
                {editingInfo ? (
                  <input
                    type="text"
                    value={infoForm.lastName}
                    onChange={(e) => setInfoForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{profile.lastName}</div>
                )}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1.5"><Phone size={13} /> رقم الجوال</label>
                {editingInfo ? (
                  <input
                    type="tel"
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm((p) => ({ ...p, phone: e.target.value }))}
                    dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 flex items-center justify-between">
                    <span dir="ltr">{profile.phone}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> موثق</span>
                  </div>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1.5"><Mail size={13} /> البريد الإلكتروني</label>
                {editingInfo ? (
                  <input
                    type="email"
                    value={infoForm.email}
                    onChange={(e) => setInfoForm((p) => ({ ...p, email: e.target.value }))}
                    dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 flex items-center justify-between">
                    <span dir="ltr">{profile.email}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10} /> غير موثق</span>
                  </div>
                )}
              </div>
              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">اسم المزرعة</label>
                {editingInfo ? (
                  <input
                    type="text"
                    value={infoForm.farmName}
                    onChange={(e) => setInfoForm((p) => ({ ...p, farmName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{profile.farmName}</div>
                )}
              </div>
              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">المنطقة</label>
                {editingInfo ? (
                  <select
                    value={infoForm.region}
                    onChange={(e) => setInfoForm((p) => ({ ...p, region: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] bg-white"
                  >
                    {saudiRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{profile.region}</div>
                )}
              </div>
              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">نبذة تعريفية</label>
                {editingInfo ? (
                  <textarea
                    value={infoForm.bio}
                    onChange={(e) => setInfoForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 leading-relaxed">{profile.bio}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1.5"><Globe size={13} /> {isEnglish ? "Display language" : "لغة العرض"}</label>
                <select value={language} onChange={(event) => { setLanguage(event.target.value as "ar" | "en"); toast.success(isEnglish ? "Display language saved" : "تم حفظ لغة العرض"); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]">
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-400">{isEnglish ? "Your choice is saved to your account and used the next time you sign in." : "يُحفظ الاختيار في حسابك ويُستخدم عند تسجيل الدخول لاحقاً."}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle2 size={14} className="text-[#2E7D32]" />
              عضو منذ {profile.memberSince}
            </div>
          </div>
        )}

        {/* ── Tab: Addresses ── */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">{addresses.length} عنوان محفوظ</h3>
              <button
                onClick={() => setAddressModal({ open: true, address: null })}
                className="flex items-center gap-2 bg-[#2E7D32] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1B5E20] transition-colors shadow-sm"
              >
                <Plus size={16} /> إضافة عنوان
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">لا توجد عناوين محفوظة</p>
                <p className="text-sm text-gray-400 mt-1">أضف عنوانك الأول لتسريع عملية الشراء</p>
                <button
                  onClick={() => setAddressModal({ open: true, address: null })}
                  className="mt-4 bg-[#2E7D32] text-white text-sm px-5 py-2 rounded-xl hover:bg-[#1B5E20] transition-colors"
                >
                  إضافة عنوان
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={(a) => setAddressModal({ open: true, address: a })}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefault}
                  />
                ))}
                {/* Add new card */}
                <button
                  onClick={() => setAddressModal({ open: true, address: null })}
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-[#2E7D32] hover:bg-[#2E7D32]/5 transition-all group min-h-[160px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#2E7D32]/10 flex items-center justify-center transition-colors">
                    <Plus size={20} className="text-gray-400 group-hover:text-[#2E7D32]" />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-[#2E7D32] font-medium transition-colors">إضافة عنوان جديد</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Security ── */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-1">تغيير كلمة المرور</h3>
              <p className="text-sm text-gray-400 mb-5">يُنصح بتغيير كلمة المرور كل 3 أشهر</p>
              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">كلمة المرور الحالية</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={pwForm.current}
                      onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={pwForm.newPw}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.newPw && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-gray-100"}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-500" : strength <= 3 ? "text-blue-500" : "text-green-600"}`}>
                        قوة كلمة المرور: {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 pl-10 ${
                        pwForm.confirm && pwForm.newPw !== pwForm.confirm
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                      }`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                    <p className="text-xs text-red-500 mt-1">كلمتا المرور غير متطابقتين</p>
                  )}
                </div>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 bg-[#2E7D32] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1B5E20] transition-colors"
                >
                  <Lock size={15} /> تغيير كلمة المرور
                </button>
              </div>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${twoFactor ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-gray-400"}`}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">التحقق بخطوتين</h4>
                    <p className="text-sm text-gray-400 mt-0.5">حماية إضافية لحسابك عبر رمز SMS</p>
                  </div>
                </div>
                <div
                  onClick={() => { setTwoFactor(!twoFactor); toast.success(twoFactor ? "تم تعطيل التحقق بخطوتين" : "تم تفعيل التحقق بخطوتين"); }}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${twoFactor ? "bg-[#2E7D32]" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFactor ? "translate-x-0.5" : "translate-x-6"}`} />
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">الجلسات النشطة</h3>
              <div className="space-y-3">
                {[
                  { device: "Chrome — Windows 11", location: "الرياض، السعودية", time: "الآن", current: true },
                  { device: "Safari — iPhone 15", location: "الرياض، السعودية", time: "منذ ساعتين", current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.current ? "bg-green-500" : "bg-gray-300"}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{session.device}</div>
                        <div className="text-xs text-gray-400">{session.location} · {session.time}</div>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">الجلسة الحالية</span>
                    ) : (
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium">إنهاء</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Notifications ── */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="font-bold text-gray-900 text-lg">تفضيلات الإشعارات</h3>

            {/* Notification Types */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">نوع الإشعارات</h4>
              <div className="space-y-3">
                {[
                  { key: "orderUpdates", label: "تحديثات الطلبات", desc: "حالة الطلب، التوصيل، التأكيد" },
                  { key: "promotions", label: "العروض والخصومات", desc: "عروض حصرية وتخفيضات موسمية" },
                  { key: "newProducts", label: "المنتجات الجديدة", desc: "إضافة منتجات من موردين تتابعهم" },
                  { key: "priceDrops", label: "انخفاض الأسعار", desc: "تنبيه عند انخفاض سعر منتج في مفضلتك" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                    <div
                      onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${notifPrefs[key as keyof typeof notifPrefs] ? "bg-[#2E7D32]" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key as keyof typeof notifPrefs] ? "translate-x-0.5" : "translate-x-5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Channels */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">قنوات الإشعار</h4>
              <div className="space-y-3">
                {[
                  { key: "sms", label: "رسائل SMS", desc: "إشعارات عبر الرسائل النصية" },
                  { key: "email", label: "البريد الإلكتروني", desc: "ملخص يومي وتنبيهات مهمة" },
                  { key: "push", label: "إشعارات التطبيق", desc: "إشعارات فورية داخل المنصة" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                    <div
                      onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${notifPrefs[key as keyof typeof notifPrefs] ? "bg-[#2E7D32]" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key as keyof typeof notifPrefs] ? "translate-x-0.5" : "translate-x-5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => toast.success("تم حفظ تفضيلات الإشعارات")}
              className="w-full bg-[#2E7D32] text-white font-semibold py-2.5 rounded-xl hover:bg-[#1B5E20] transition-colors text-sm"
            >
              حفظ التفضيلات
            </button>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {addressModal.open && (
        <AddressModal
          address={addressModal.address}
          onSave={handleSaveAddress}
          onClose={() => setAddressModal({ open: false, address: null })}
        />
      )}
    </DashboardLayout>
  );
}
