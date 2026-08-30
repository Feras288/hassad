/*
 * HASAAD PLATFORM — Provider Services Management Page
 * Design: Modern SaaS + Organic Warmth | RTL Arabic
 */
import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";

interface VendorServicesProps {
  vendorType?: "supplier" | "provider";
}

type ServiceStatus = "active" | "inactive" | "pending";
type PriceType = "fixed" | "hourly" | "per_hectare";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType: PriceType;
  status: ServiceStatus;
  bookings: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  duration: string;
  createdAt: string;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "s1",
    title: "زيارة ميدانية وتقييم المزرعة",
    category: "استشارات",
    price: 350,
    priceType: "fixed",
    status: "active",
    bookings: 42,
    rating: 4.9,
    reviewCount: 38,
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=200&fit=crop",
    description: "زيارة ميدانية شاملة للمزرعة لتقييم الوضع الراهن وتقديم توصيات فورية",
    duration: "3-4 ساعات",
    createdAt: "2024-01-10",
  },
  {
    id: "s2",
    title: "خطة زراعية شاملة للموسم",
    category: "تخطيط زراعي",
    price: 1200,
    priceType: "fixed",
    status: "active",
    bookings: 28,
    rating: 4.8,
    reviewCount: 25,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
    description: "إعداد خطة زراعية متكاملة تشمل جدول الزراعة والتسميد والري والحصاد",
    duration: "أسبوع واحد",
    createdAt: "2024-01-15",
  },
  {
    id: "s3",
    title: "متابعة شهرية للمحاصيل",
    category: "متابعة ميدانية",
    price: 800,
    priceType: "fixed",
    status: "active",
    bookings: 15,
    rating: 5.0,
    reviewCount: 14,
    image: "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=200&h=200&fit=crop",
    description: "متابعة دورية شهرية لمراقبة نمو المحاصيل وتقديم التوصيات اللازمة",
    duration: "يوم كامل شهرياً",
    createdAt: "2024-02-01",
  },
  {
    id: "s4",
    title: "تحليل تربة وتوصيات تسميد",
    category: "تحليل تربة",
    price: 250,
    priceType: "fixed",
    status: "active",
    bookings: 67,
    rating: 4.7,
    reviewCount: 61,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
    description: "تحليل شامل لعينات التربة وتقديم توصيات تسميد مخصصة",
    duration: "3-5 أيام عمل",
    createdAt: "2024-02-10",
  },
  {
    id: "s5",
    title: "استشارة عن بُعد (فيديو)",
    category: "استشارات",
    price: 150,
    priceType: "hourly",
    status: "inactive",
    bookings: 8,
    rating: 4.6,
    reviewCount: 7,
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=200&fit=crop",
    description: "جلسة استشارية عبر الفيديو لمناقشة مشاكل المزرعة وتقديم الحلول",
    duration: "ساعة واحدة",
    createdAt: "2024-03-01",
  },
];

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  fixed: "سعر ثابت",
  hourly: "بالساعة",
  per_hectare: "لكل هكتار",
};

const CATEGORIES = ["استشارات", "تحليل تربة", "تخطيط زراعي", "متابعة ميدانية", "خدمات الري", "مكافحة آفات"];

// ─── Service Form Modal ──────────────────────────────────────────────────────
interface ServiceFormModalProps {
  service?: ServiceItem | null;
  onSave: (data: Partial<ServiceItem>) => void;
  onClose: () => void;
}

function ServiceFormModal({ service, onSave, onClose }: ServiceFormModalProps) {
  const isEdit = !!service;
  const [title, setTitle] = useState(service?.title ?? "");
  const [category, setCategory] = useState(service?.category ?? "استشارات");
  const [price, setPrice] = useState(service?.price?.toString() ?? "");
  const [priceType, setPriceType] = useState<PriceType>(service?.priceType ?? "fixed");
  const [description, setDescription] = useState(service?.description ?? "");
  const [duration, setDuration] = useState(service?.duration ?? "");
  const [imageUrl, setImageUrl] = useState(service?.image ?? "");

  const handleSave = () => {
    if (!title.trim()) { toast.error("يرجى إدخال عنوان الخدمة"); return; }
    if (!price || isNaN(Number(price))) { toast.error("يرجى إدخال سعر صحيح"); return; }
    onSave({ title, category, price: Number(price), priceType, description, duration, image: imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-black text-[#263238] text-lg">
            {isEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-[#263238] mb-1.5">عنوان الخدمة *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: زيارة ميدانية وتقييم المزرعة"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
            />
          </div>

          {/* Category + Price Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5">الفئة</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5">نوع السعر</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              >
                <option value="fixed">سعر ثابت</option>
                <option value="hourly">بالساعة</option>
                <option value="per_hectare">لكل هكتار</option>
              </select>
            </div>
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5">السعر (ر.س) *</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="350"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#263238] mb-1.5">مدة الخدمة</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="مثال: 3-4 ساعات"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#263238] mb-1.5">وصف الخدمة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف تفصيلي للخدمة المقدمة..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-[#263238] mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[#4CAF50]" />
              رابط صورة الخدمة
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
            />
            {imageUrl && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                <img src={imageUrl} alt="معاينة" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#2E7D32] text-white py-2.5 rounded-xl font-bold hover:bg-[#1B5E20] transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isEdit ? "حفظ التعديلات" : "إضافة الخدمة"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function VendorServices({ vendorType = "provider" }: VendorServicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [servicesList, setServicesList] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const filtered = servicesList.filter((s) => {
    const matchSearch = !searchQuery || s.title.includes(searchQuery) || s.category.includes(searchQuery);
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setServicesList((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)
    );
    toast.success("تم تحديث حالة الخدمة");
  };

  const deleteService = (id: string) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
    toast.success("تم حذف الخدمة");
  };

  const openEdit = (service: ServiceItem) => {
    setEditingService(service);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleSave = (data: Partial<ServiceItem>) => {
    if (editingService) {
      // Edit mode
      setServicesList((prev) =>
        prev.map((s) => s.id === editingService.id ? { ...s, ...data } : s)
      );
      toast.success("تم تحديث الخدمة بنجاح");
    } else {
      // Add mode
      const newService: ServiceItem = {
        id: `s${Date.now()}`,
        title: data.title ?? "",
        category: data.category ?? "استشارات",
        price: data.price ?? 0,
        priceType: data.priceType ?? "fixed",
        status: "active",
        bookings: 0,
        rating: 0,
        reviewCount: 0,
        image: data.image ?? "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=200&fit=crop",
        description: data.description ?? "",
        duration: data.duration ?? "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setServicesList((prev) => [newService, ...prev]);
      toast.success("تم إضافة الخدمة بنجاح");
    }
    setShowModal(false);
    setEditingService(null);
  };

  const stats = {
    total: servicesList.length,
    active: servicesList.filter((s) => s.status === "active").length,
    totalBookings: servicesList.reduce((sum, s) => sum + s.bookings, 0),
    avgRating: servicesList.filter((s) => s.rating > 0).length > 0
      ? (servicesList.filter((s) => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) / servicesList.filter((s) => s.rating > 0).length).toFixed(1)
      : "—",
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]/30 flex" dir="rtl">
      <VendorSidebar vendorType={vendorType} />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          vendorType={vendorType}
          pageTitle="إدارة خدماتي"
          pageSubtitle="أضف وعدّل خدماتك الزراعية"
        />

        <main className="flex-1 p-4 md:p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "إجمالي الخدمات", value: stats.total, color: "text-[#2E7D32]", bg: "bg-green-50" },
              { label: "خدمات نشطة", value: stats.active, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "إجمالي الحجوزات", value: stats.totalBookings, color: "text-[#C9A227]", bg: "bg-amber-50" },
              { label: "متوسط التقييم", value: stats.avgRating, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters + Add Button */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الخدمات..."
                className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    filterStatus === f
                      ? "bg-[#2E7D32] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" ? "الكل" : f === "active" ? "نشط" : "غير نشط"}
                </button>
              ))}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#2E7D32] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1B5E20] transition-colors"
            >
              <Plus size={16} />
              إضافة خدمة
            </button>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      service.status === "active"
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}>
                      {service.status === "active" ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                    <Star size={10} className="text-[#C9A227] fill-[#C9A227]" />
                    <span className="text-white text-xs font-bold">{service.rating > 0 ? service.rating : "—"}</span>
                    <span className="text-white/60 text-xs">({service.reviewCount})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="text-xs font-bold text-[#4CAF50] bg-green-50 px-2 py-0.5 rounded-full">
                    {service.category}
                  </span>
                  <h3 className="font-black text-[#263238] text-sm mt-2 mb-1 leading-snug">{service.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{service.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-[#2E7D32]">
                        {service.price.toLocaleString("ar-SA")} ر.س
                      </span>
                      <span className="text-xs text-gray-400 mr-1">
                        / {PRICE_TYPE_LABELS[service.priceType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Toggle Status */}
                      <button
                        onClick={() => toggleStatus(service.id)}
                        title={service.status === "active" ? "إيقاف الخدمة" : "تفعيل الخدمة"}
                        className="w-8 h-8 bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        {service.status === "active"
                          ? <ToggleRight size={16} className="text-[#4CAF50]" />
                          : <ToggleLeft size={16} />
                        }
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(service)}
                        title="تعديل الخدمة"
                        className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteService(service.id)}
                        title="حذف الخدمة"
                        className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bookings */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>{service.bookings} حجز</span>
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <button
              onClick={openAdd}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-3 hover:border-[#4CAF50] hover:bg-green-50/30 transition-all group min-h-64"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#4CAF50]/10 rounded-2xl flex items-center justify-center transition-colors">
                <Plus size={22} className="text-gray-400 group-hover:text-[#2E7D32]" />
              </div>
              <p className="text-sm font-medium text-gray-500 group-hover:text-[#2E7D32]">
                إضافة خدمة جديدة
              </p>
            </button>
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <Briefcase size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد خدمات تطابق البحث</p>
            </div>
          )}
        </main>
      </div>

      {/* Service Form Modal */}
      {showModal && (
        <ServiceFormModal
          service={editingService}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingService(null); }}
        />
      )}
    </div>
  );
}
