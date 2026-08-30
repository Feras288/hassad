// ================================================================
// HASAAD PLATFORM — Dashboard Header
// Design: Modern SaaS, RTL, Clean white topbar
// ================================================================

import { Bell, Search, Menu, Plus, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { notifications } from "@/lib/dashboardData";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function DashboardHeader({ onMenuToggle, title, breadcrumb }: DashboardHeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [searchFocused, setSearchFocused] = useState(false);
  const [, navigate] = useLocation();
  const { direction, isEnglish } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Title / Breadcrumb */}
      <div className="flex-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft className={`w-3.5 h-3.5 text-gray-400 ${isEnglish ? "rotate-180" : ""}`} />}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-[#2E7D32] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 font-semibold">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-base font-bold text-gray-800 truncate">{title || "لوحة التحكم"}</h1>
        )}
      </div>

      {/* Search */}
      <div className={`hidden md:flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2 transition-all duration-200 ${searchFocused ? "border-[#2E7D32] bg-white shadow-sm w-64" : "border-gray-200 w-48"}`}>
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="بحث..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          dir={direction}
        />
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/marketplace')}
        className="hidden md:flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>طلب جديد</span>
      </button>

      {/* Notifications */}
      <Link
        href="/dashboard/notifications"
        className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className={`absolute top-1 ${isEnglish ? "right-1" : "left-1"} w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold leading-none`}>
            {unreadCount}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer">
        م
      </div>
    </header>
  );
}
