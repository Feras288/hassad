// ================================================================
// HASAAD PLATFORM — Dashboard Layout
// Design: Sidebar + Main content, RTL, sticky sidebar
// ================================================================

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Menu, MessageCircle, Microscope, ShoppingBag } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function DashboardLayout({ children, title, breadcrumb }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { direction } = useLanguage();
  const [location] = useLocation();
  const mobileNav = [
    { label: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
    { label: "طلباتي", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "الرسائل", href: "/dashboard/messages", icon: MessageCircle },
    { label: "التشخيص", href: "/dashboard/diagnoses", icon: Microscope },
  ];

  return (
    <div className="flex h-screen bg-[#F5F1E8] overflow-hidden" dir={direction}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex-shrink-0">
            <DashboardSidebar
              mobile
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          onMenuToggle={() => setMobileSidebarOpen(true)}
          title={title}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        <nav aria-label="تنقل حساب العميل" className="flex md:hidden shrink-0 items-center justify-around border-t border-[#DDE8D9] bg-white px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(27,94,32,0.08)]">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? location === item.href : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors", active ? "bg-[#EAF5E7] text-[#1F6B45]" : "text-[#77857B]") }>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setMobileSidebarOpen(true)} className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#77857B]">
            <Menu size={20} />
            <span>المزيد</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
