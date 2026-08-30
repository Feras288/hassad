// ===================================================
// Hasaad Platform — Vendor Customers Management Page
// Design: Modern SaaS + Organic Warmth | RTL Arabic
// ===================================================
import { useState } from "react";
import {
  Users,
  Search,
  Star,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Phone,
  MessageSquare,
  ChevronDown,
  Award,
} from "lucide-react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";

interface VendorCustomersProps {
  vendorType?: "supplier" | "provider";
}

const customers = [
  {
    id: "c1",
    name: "أحمد محمد الغامدي",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    phone: "0501234567",
    location: "الرياض",
    totalOrders: 12,
    totalSpent: 8450,
    lastOrder: "2024-04-08",
    rating: 5,
    tier: "ذهبي",
    joinDate: "2023-06-15",
  },
  {
    id: "c2",
    name: "سالم عبدالرحمن العتيبي",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    phone: "0557654321",
    location: "القصيم",
    totalOrders: 8,
    totalSpent: 15600,
    lastOrder: "2024-04-07",
    rating: 4,
    tier: "بلاتيني",
    joinDate: "2023-03-20",
  },
  {
    id: "c3",
    name: "فهد ناصر الدوسري",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    phone: "0509876543",
    location: "المدينة المنورة",
    totalOrders: 5,
    totalSpent: 4750,
    lastOrder: "2024-04-05",
    rating: 5,
    tier: "فضي",
    joinDate: "2023-09-10",
  },
  {
    id: "c4",
    name: "محمد علي الزهراني",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face",
    phone: "0543219876",
    location: "جدة",
    totalOrders: 18,
    totalSpent: 32400,
    lastOrder: "2024-04-03",
    rating: 5,
    tier: "بلاتيني",
    joinDate: "2022-11-05",
  },
  {
    id: "c5",
    name: "عبدالله سعد المطيري",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    phone: "0561234567",
    location: "الدمام",
    totalOrders: 3,
    totalSpent: 4920,
    lastOrder: "2024-04-01",
    rating: 3,
    tier: "برونزي",
    joinDate: "2024-01-20",
  },
  {
    id: "c6",
    name: "خالد إبراهيم الشمري",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    phone: "0578901234",
    location: "حائل",
    totalOrders: 6,
    totalSpent: 7080,
    lastOrder: "2024-03-30",
    rating: 4,
    tier: "ذهبي",
    joinDate: "2023-07-12",
  },
];

const tierConfig: Record<string, { color: string; bg: string; icon: string }> = {
  بلاتيني: { color: "text-purple-700", bg: "bg-purple-100", icon: "💎" },
  ذهبي: { color: "text-[#C9A227]", bg: "bg-amber-100", icon: "🥇" },
  فضي: { color: "text-gray-600", bg: "bg-gray-100", icon: "🥈" },
  برونزي: { color: "text-amber-700", bg: "bg-amber-50", icon: "🥉" },
};

export default function VendorCustomers({ vendorType = "supplier" }: VendorCustomersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"spent" | "orders" | "recent">("spent");

  const filtered = customers
    .filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.name.includes(searchQuery) ||
        c.location.includes(searchQuery) ||
        c.phone.includes(searchQuery);
      const matchTier = filterTier === "all" || c.tier === filterTier;
      return matchSearch && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === "spent") return b.totalSpent - a.totalSpent;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
    });

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = Math.round(totalRevenue / customers.reduce((s, c) => s + c.totalOrders, 0));

  return (
    <div className="min-h-screen bg-[#F5F1E8]/30 flex" dir="rtl">
      <VendorSidebar vendorType={vendorType} />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          vendorType={vendorType}
          pageTitle="إدارة العملاء"
          pageSubtitle="تتبع عملائك وتحليل سلوكهم الشرائي"
        />
        <main className="flex-1 space-y-5 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "إجمالي العملاء", value: totalCustomers, icon: Users, color: "bg-[#2E7D32]" },
              { label: "إجمالي الإيرادات", value: `${totalRevenue.toLocaleString("ar-SA")} ر.س`, icon: TrendingUp, color: "bg-blue-600" },
              { label: "متوسط قيمة الطلب", value: `${avgOrderValue.toLocaleString("ar-SA")} ر.س`, icon: ShoppingBag, color: "bg-[#C9A227]" },
              { label: "عملاء بلاتينيون", value: customers.filter((c) => c.tier === "بلاتيني").length, icon: Award, color: "bg-purple-600" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#263238]">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
            <div className="flex-1 min-w-48 relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الهاتف أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none sm:flex-none"
            >
              <option value="all">كل المستويات</option>
              <option value="بلاتيني">بلاتيني</option>
              <option value="ذهبي">ذهبي</option>
              <option value="فضي">فضي</option>
              <option value="برونزي">برونزي</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none sm:flex-none"
            >
              <option value="spent">الأعلى إنفاقاً</option>
              <option value="orders">الأكثر طلبات</option>
              <option value="recent">الأحدث نشاطاً</option>
            </select>
          </div>

          {/* Customers Table */}
          <div className="space-y-3 md:hidden">
            {filtered.map((customer) => {
              const tier = tierConfig[customer.tier] || tierConfig["برونزي"];
              return (
                <article key={customer.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img src={customer.avatar} alt={customer.name} className="h-11 w-11 shrink-0 rounded-full border-2 border-gray-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0"><p className="truncate text-sm font-black text-[#263238]">{customer.name}</p><p className="mt-0.5 text-xs text-gray-500">{customer.phone}</p></div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${tier.bg} ${tier.color}`}>{tier.icon} {customer.tier}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[#F7FAF5] p-2.5 text-center">
                        <div><p className="text-[10px] text-gray-400">الطلبات</p><p className="mt-0.5 text-sm font-black text-[#263238]">{customer.totalOrders}</p></div>
                        <div><p className="text-[10px] text-gray-400">الإنفاق</p><p className="mt-0.5 text-xs font-black text-[#2E7D32]">{customer.totalSpent.toLocaleString("ar-SA")} ر.س</p></div>
                        <div><p className="text-[10px] text-gray-400">التقييم</p><div className="mt-1 flex justify-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={11} className={index < customer.rating ? "fill-[#C9A227] text-[#C9A227]" : "fill-gray-200 text-gray-200"} />)}</div></div>
                      </div>
                      <div className="mt-3 flex items-center justify-between"><span className="text-[11px] text-gray-400">آخر طلب: {customer.lastOrder}</span><div className="flex gap-2"><button aria-label={`مراسلة ${customer.name}`} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><MessageSquare size={16} /></button><button aria-label={`طلبات ${customer.name}`} className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-[#2E7D32]"><ShoppingBag size={16} /></button></div></div>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><Users size={32} className="mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">لا يوجد عملاء يطابقون البحث</p></div>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">العميل</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المستوى</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الطلبات</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">إجمالي الإنفاق</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">آخر طلب</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">التقييم</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((customer) => {
                    const tier = tierConfig[customer.tier] || tierConfig["برونزي"];
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={customer.avatar}
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                            />
                            <div>
                              <p className="text-sm font-semibold text-[#263238]">{customer.name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone size={10} />
                                {customer.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${tier.bg} ${tier.color}`}>
                            {tier.icon} {customer.tier}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#263238]">{customer.totalOrders}</p>
                          <p className="text-xs text-gray-400">طلب</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#2E7D32]">
                            {customer.totalSpent.toLocaleString("ar-SA")} ر.س
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{customer.lastOrder}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < customer.rating
                                    ? "text-[#C9A227] fill-[#C9A227]"
                                    : "text-gray-200 fill-gray-200"
                                }
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                              <MessageSquare size={14} />
                            </button>
                            <button className="w-8 h-8 bg-green-50 text-[#2E7D32] rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors">
                              <ShoppingBag size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-10 text-center">
                <Users size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا يوجد عملاء يطابقون البحث</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
