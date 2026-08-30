// ===================================================
// Hasaad Platform — Vendor Dashboard Sidebar
// Design: Dark green sidebar, golden accents, RTL
// ===================================================

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Briefcase,
  Wrench,
  TrendingUp,
  Users,
  Menu,
  X,
  MessageCircleQuestion,
} from "lucide-react";
import { vendorProfile, providerProfile } from "@/lib/vendorDashboardData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";
import VendorNotificationToastListener from "./VendorNotificationToastListener";

interface VendorSidebarProps {
  vendorType: "supplier" | "provider";
}

export default function VendorSidebar({ vendorType }: VendorSidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = vendorType === "supplier" ? vendorProfile : providerProfile;
  const { user } = useAuth();
  const { isEnglish } = useLanguage();
  const vendorMobileSwipe = useSwipeToClose({ enabled: mobileOpen, axis: "x", closeDirection: isEnglish ? -1 : 1, onClose: () => setMobileOpen(false) });
  const canAccessVendorNotifications = vendorType === "supplier" && user?.role === "vendor" && Boolean(user.vendorId);
  const { data: notifications = [] } = trpc.vendorNotifications.list.useQuery(undefined, {
    enabled: canAccessVendorNotifications,
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
  });
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const supplierNav = [
    { label: "الرئيسية", icon: LayoutDashboard, path: "/vendor/dashboard" },
    { label: "منتجاتي", icon: Package, path: "/vendor/products" },
    { label: "الطلبات", icon: ShoppingBag, path: "/vendor/orders", badge: 23 },
    { label: "التقييمات", icon: Star, path: "/vendor/reviews" },
    { label: "أسئلة المنتجات", icon: MessageCircleQuestion, path: "/vendor/questions" },
    { label: "الإحصائيات", icon: BarChart3, path: "/vendor/analytics" },
    { label: "العملاء", icon: Users, path: "/vendor/customers" },
  ];

  const providerNav = [
    { label: "الرئيسية", icon: LayoutDashboard, path: "/vendor/dashboard" },
    { label: "خدماتي", icon: Briefcase, path: "/provider-dashboard/services" },
    { label: "الحجوزات", icon: ShoppingBag, path: "/provider-dashboard/orders", badge: 0 },
    { label: "الرسائل", icon: MessageCircleQuestion, path: "/provider-dashboard/messages", badge: 0 },
    { label: "التقييمات", icon: Star, path: "/vendor/reviews" },
    { label: "الإحصائيات", icon: BarChart3, path: "/vendor/analytics" },
    { label: "أدواتي", icon: Wrench, path: "/vendor/tools" },
  ];

  const navItems = vendorType === "supplier" ? supplierNav : providerNav;

  const bottomNav = [
    { label: "الإشعارات", icon: Bell, path: "/vendor/notifications", badge: unreadCount },
    { label: "الإعدادات", icon: Settings, path: "/vendor/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ح</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">حصاد</span>
              <p className="text-white/50 text-xs">
                {vendorType === "supplier" ? "لوحة المورد" : "لوحة مقدم الخدمة"}
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">ح</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
        >
          <ChevronLeft
            size={14}
            className={`text-white/70 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Profile Card */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 bg-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A227]"
              />
              {profile.verified && (
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-[#C9A227] rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{profile.name}</p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-[#C9A227] fill-[#C9A227]" />
                <span className="text-white/70 text-xs">{profile.rating}</span>
                <span className="text-white/40 text-xs">({profile.reviewCount})</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-green-400 text-xs">حساب موثق ونشط</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-[#C9A227] text-white shadow-lg shadow-[#C9A227]/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-white" : "text-white/60 group-hover:text-white"} />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className={`absolute top-1 ${isEnglish ? "right-1" : "left-1"} w-2 h-2 bg-red-500 rounded-full`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        {bottomNav.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-[#C9A227] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-white" : "text-white/60 group-hover:text-white"} />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <VendorNotificationToastListener enabled={canAccessVendorNotifications} />
      {/* Mobile app-style quick navigation */}
      <nav data-vendor-mobile-nav aria-label="تنقل لوحة المورد" className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#DDE8D9] bg-white px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(27,94,32,0.08)] lg:hidden">
        {navItems.slice(0, 4).map((item) => {
          const active = location === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={`relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors ${active ? "bg-[#EAF5E7] text-[#1F6B45]" : "text-[#77857B]"}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && <span className={`absolute -top-1 ${isEnglish ? "right-1" : "left-1"} grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] text-white`}>{item.badge}</span>}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMobileOpen(true)} className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#77857B]">
          <Menu size={20} />
          <span>المزيد</span>
        </button>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        {...vendorMobileSwipe.swipeHandlers}
        style={vendorMobileSwipe.swipeStyle}
        className={`lg:hidden fixed top-0 ${isEnglish ? "left-0" : "right-0"} h-full w-72 bg-[#1B5E20] z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : isEnglish ? "-translate-x-full" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className={`absolute top-4 ${isEnglish ? "right-4" : "left-4"} w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center`}
        >
          <X size={16} className="text-white" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col h-screen bg-[#1B5E20] sticky top-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
