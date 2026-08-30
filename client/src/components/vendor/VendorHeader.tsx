// ===================================================
// Hasaad Platform — Vendor Dashboard Header
// Design: Clean white header with green accents, RTL
// ===================================================

import { useState } from "react";
import { Bell, Search, ChevronDown, Star, Settings, LogOut, User } from "lucide-react";
import { Link } from "wouter";
import { vendorProfile, providerProfile, vendorNotifications } from "@/lib/vendorDashboardData";

interface VendorHeaderProps {
  vendorType: "supplier" | "provider";
  pageTitle: string;
  pageSubtitle?: string;
}

export default function VendorHeader({ vendorType, pageTitle, pageSubtitle }: VendorHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profile = vendorType === "supplier" ? vendorProfile : providerProfile;
  const unread = vendorNotifications.filter((n) => !n.read);

  const notifIcon: Record<string, string> = {
    order: "🛒",
    review: "⭐",
    stock: "📦",
    payment: "💰",
    booking: "📅",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      {/* Page Title */}
      <div>
        <h1 className="text-base font-bold text-[#263238] sm:text-xl">{pageTitle}</h1>
        {pageSubtitle && <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">{pageSubtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="بحث سريع..."
            className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1 text-right"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100"
          >
            <Bell size={18} className="text-gray-600" />
            {unread.length > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-3 top-[4.5rem] z-50 max-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:absolute sm:left-0 sm:top-12 sm:w-80">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[#263238]">الإشعارات</span>
                <span className="text-xs text-[#2E7D32] font-medium cursor-pointer">تحديد الكل كمقروء</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {vendorNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? "bg-green-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{notifIcon[notif.type] || "🔔"}</span>
                      <div className="flex-1">
                        <p className="text-sm text-[#263238] leading-snug">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && <div className="w-2 h-2 bg-[#4CAF50] rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 text-center">
                <Link href="/vendor/notifications" className="text-sm text-[#2E7D32] font-medium hover:underline">
                  عرض كل الإشعارات
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 transition-colors hover:bg-gray-100 sm:px-3"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-7 h-7 rounded-full object-cover border border-[#4CAF50]"
            />
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-[#263238] leading-none truncate max-w-28">
                {profile.name.split(" ").slice(0, 2).join(" ")}
              </p>
              <div className="flex items-center gap-0.5 mt-0.5">
                <Star size={9} className="text-[#C9A227] fill-[#C9A227]" />
                <span className="text-xs text-gray-500">{profile.rating}</span>
              </div>
            </div>
            <ChevronDown size={14} className="hidden text-gray-400 sm:block" />
          </button>

          {showProfile && (
            <div className="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:absolute sm:left-0 sm:top-12 sm:w-52">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-sm text-[#263238]">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.specialty}</p>
              </div>
              <div className="py-2">
                <Link href="/vendor/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <Settings size={15} className="text-gray-400" />
                  إعدادات الحساب
                </Link>
                <Link href={`/provider/${profile.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <User size={15} className="text-gray-400" />
                  عرض الملف الشخصي
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link href="/" className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 transition-colors">
                    <LogOut size={15} />
                    تسجيل الخروج
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
