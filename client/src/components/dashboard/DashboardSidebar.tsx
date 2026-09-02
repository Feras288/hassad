// ================================================================
// HASAAD PLATFORM — Dashboard Sidebar
// Design: Modern SaaS, RTL, Dark green #2E7D32, Tajawal font
// ================================================================

import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingBag,
  Microscope,
  Heart,
  Calendar,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Sprout,
  ChevronLeft,
  Store,
  Stethoscope,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications } from "@/lib/dashboardData";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useAuth } from "@/_core/hooks/useAuth";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  badge?: number;
  comingSoon?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navItems: NavGroup[] = [
  {
    group: "الرئيسية",
    items: [
      { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
      { icon: Bell, label: "الإشعارات", path: "/dashboard/notifications", badge: 3 },
      { icon: MessageCircle, label: "الرسائل", path: "/dashboard/messages" },
    ],
  },
  {
    group: "طلباتي",
    items: [
      { icon: ShoppingBag, label: "طلبات المنتجات", path: "/dashboard/orders" },
      { icon: Calendar, label: "مواعيد الخدمات", path: "/dashboard/services" },
    ],
  },
  {
    group: "الزراعة الذكية",
    items: [
      { icon: Microscope, label: "تشخيصاتي", path: "/dashboard/diagnoses" },
      { icon: Sprout, label: "تسويق المحاصيل", path: "/dashboard/produce" },
    ],
  },
  {
    group: "السوق",
    items: [
      { icon: Heart, label: "المفضلة", path: "/dashboard/favorites" },
      { icon: Store, label: "تصفح السوق", path: "/" },
      { icon: Stethoscope, label: "تشخيص جديد", path: "/diagnosis" },
    ],
  },
  {
    group: "المكافآت",
    items: [
      { icon: Star, label: "برنامج الولاء", path: "/dashboard/loyalty" },
    ],
  },
];

export default function DashboardSidebar({ collapsed = false, onToggle, mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { favoritesCount } = useFavorites();
  const { totalUnread: messagesUnread } = useMessages();
  const { points } = useLoyalty();
  const { user } = useAuth();

  const displayName = user?.name?.trim() || "مستخدم حصاد";
  const userInitial = displayName.charAt(0) || "ح";
  const roleLabel =
    user?.role === "admin"
      ? "مدير النظام"
      : user?.role === "vendor"
      ? "مورد معتمد"
      : "مزارع حصاد";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#1B5E20] text-white transition-all duration-300 h-full",
        collapsed ? "w-16" : "w-64",
        mobile && "w-72"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-white/10", collapsed && "justify-center px-2")}>
        <div className="w-9 h-9 bg-[#C9A227] rounded-xl flex items-center justify-center flex-shrink-0">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base leading-tight">حصاد</div>
            <div className="text-xs text-green-300">لوحة تحكم المزارع</div>
          </div>
        )}
        {!mobile && onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {mobile && onClose && (
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Card */}
      {!collapsed && (
        <Link
          href="/dashboard/profile"
          className="mx-3 mt-4 mb-2 p-3 bg-white/10 rounded-xl block hover:bg-white/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{displayName}</div>
              <div className="text-xs text-green-300 truncate">{roleLabel}</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="متصل" />
          </div>
        </Link>
      )}

      {/* Loyalty Points Mini Card */}
      {!collapsed && points > 0 && (
        <Link
          href="/dashboard/loyalty"
          className="mx-3 mb-2 px-3 py-2 bg-[#C9A227]/20 border border-[#C9A227]/30 rounded-xl flex items-center gap-2 hover:bg-[#C9A227]/30 transition-colors"
        >
          <Star className="w-4 h-4 text-[#C9A227] flex-shrink-0" fill="currentColor" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#C9A227] font-semibold">{points.toLocaleString("ar-SA")} نقطة</div>
            <div className="text-xs text-green-300">رصيد الولاء</div>
          </div>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navItems.map((group) => (
          <div key={group.group} className="mb-1">
            {!collapsed && (
              <div className="px-4 py-1.5 text-xs font-semibold text-green-400 uppercase tracking-wider">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const badge =
                item.label === "الإشعارات"
                  ? unreadCount
                  : item.label === "المفضلة"
                  ? favoritesCount || undefined
                  : item.label === "الرسائل"
                  ? messagesUnread || undefined
                  : undefined;
              const isLoyalty = item.label === "برنامج الولاء";

              return (
                <Link
                  key={item.path}
                  href={item.comingSoon ? "#" : item.path}
                  onClick={item.comingSoon ? (e: React.MouseEvent) => { e.preventDefault(); } : onClose}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                    active
                      ? "bg-[#C9A227] text-white shadow-md"
                      : "text-green-100 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-0 mx-1"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-white" : "text-green-300 group-hover:text-white")} size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {/* Show points balance next to loyalty link */}
                      {isLoyalty && points > 0 && !active && (
                        <span className="text-xs bg-[#C9A227]/30 text-[#C9A227] px-1.5 py-0.5 rounded-full font-semibold">
                          {points.toLocaleString("ar-SA")}
                        </span>
                      )}
                      {badge && badge > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                          {badge}
                        </span>
                      )}
                      {item.comingSoon && (
                        <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">قريباً</span>
                      )}
                    </>
                  )}
                  {collapsed && badge && badge > 0 && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-100 hover:bg-white/10 hover:text-white transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Settings size={18} className="text-green-300 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">الإعدادات</span>}
        </Link>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-100 hover:bg-red-500/20 hover:text-red-300 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} className="text-green-300 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">الخروج</span>}
        </Link>
      </div>
    </aside>
  );
}
