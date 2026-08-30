/*
 * HASAAD PLATFORM — AdminLayout
 * Design: Deep Slate + Accent Green | RTL Arabic
 * Sidebar-first layout with persistent navigation and top bar
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Tag,
  ShoppingCart,
  BarChart3,
  Ticket,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Shield,
  TrendingUp,
  AlertTriangle,
  LogOut,
  ChevronRight,
  MapPin,
  PackageSearch,
  Link2,
  Newspaper,
  MessageSquare,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getNewUnreadNotificationKeys, playAdminNotificationTone } from "@/lib/adminNotificationHistory";
import { trpc } from "@/lib/trpc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  badgeColor?: string;
  notificationBadge?: boolean;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "لوحة التحكم",
    icon: <LayoutDashboard size={18} />,
    href: "/admin",
  },
  {
    label: "المستخدمون",
    icon: <Users size={18} />,
    href: "/admin/users",
  },
  {
    label: "البائعون والموردون",
    icon: <Store size={18} />,
    href: "/admin/vendors",
  },
  {
    label: "ربط حسابات الموردين",
    icon: <Link2 size={18} />,
    href: "/admin/vendor-accounts",
  },
  {
    label: "المنتجات",
    icon: <Package size={18} />,
    href: "/admin/products",
  },
  {
    label: "الفئات",
    icon: <Tag size={18} />,
    href: "/admin/categories",
  },
  {
    label: "المحتوى والمقالات",
    icon: <Newspaper size={18} />,
    href: "/admin/articles",
  },
  {
    label: "الطلبات",
    icon: <ShoppingCart size={18} />,
    href: "/admin/orders",
  },
  {
    label: "طلبات التوفير",
    icon: <PackageSearch size={18} />,
    href: "/admin/product-requests",
  },
  {
    label: "التقارير والإحصائيات",
    icon: <BarChart3 size={18} />,
    href: "/admin/reports",
  },
  {
    label: "الدعم الفني",
    icon: <Ticket size={18} />,
    href: "/admin/support",
  },
  {
    label: "استفسارات التواصل",
    icon: <MessageSquare size={18} />,
    href: "/admin/contact-inquiries",
  },
  {
    label: "سجل الإشعارات",
    icon: <Bell size={18} />,
    href: "/admin/notifications",
    notificationBadge: true,
  },
  {
    label: "الإعدادات",
    icon: <Settings size={18} />,
    href: "/admin/settings",
  },
  {
    label: "خريطة الموردين",
    icon: <MapPin size={18} />,
    href: "/suppliers-map",
  },
];

function formatNotificationTime(value: Date | string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} ي`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { direction, isEnglish } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notificationTypeFilter, setNotificationTypeFilter] = useState<"all" | "contact" | "availability">("all");
  const adminMobileSwipe = useSwipeToClose({ enabled: mobileOpen, axis: "x", closeDirection: isEnglish ? -1 : 1, onClose: () => setMobileOpen(false) });
  const previousUnreadNotificationKeysRef = useRef<string[] | null>(null);
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.adminNotifications.list.useQuery(undefined, {
    enabled: user?.role === "admin",
    retry: false,
    refetchInterval: 30_000,
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);
  const visibleNotifications = notifications.filter((notification) => notificationTypeFilter === "all" || notification.type === notificationTypeFilter);
  const unreadNotificationKeyString = unreadNotifications.map((notification) => notification.id).sort().join("|");
  const markNotificationRead = trpc.adminNotifications.setRead.useMutation({
    onSuccess: () => utils.adminNotifications.list.invalidate(),
  });
  const markAllNotificationsRead = trpc.adminNotifications.markAllRead.useMutation({
    onSuccess: () => utils.adminNotifications.list.invalidate(),
  });

  useEffect(() => {
    if (!notificationsQuery.isSuccess) return;
    const unreadKeys = unreadNotificationKeyString ? unreadNotificationKeyString.split("|") : [];
    if (getNewUnreadNotificationKeys(previousUnreadNotificationKeysRef.current, unreadKeys).length > 0) {
      playAdminNotificationTone();
    }
    previousUnreadNotificationKeysRef.current = unreadKeys;
  }, [notificationsQuery.isSuccess, unreadNotificationKeyString]);

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const runAdminSearch = () => {
    const query = adminSearch.trim().toLowerCase();
    if (!query) return;
    const destination = query.includes("مستخدم") || query.includes("user") ? "/admin/users"
      : query.includes("مورد") || query.includes("بائع") || query.includes("vendor") ? "/admin/vendors"
      : query.includes("فئ") || query.includes("category") ? "/admin/categories"
      : query.includes("طلب") || query.includes("order") ? "/admin/orders"
      : query.includes("استفسار") || query.includes("دعم") || query.includes("support") ? "/admin/contact-inquiries"
      : "/admin/products";
    setLocation(destination);
  };

  const openNotification = (notification: (typeof notifications)[number]) => {
    if (!notification.isRead) {
      markNotificationRead.mutate({ notificationKey: notification.id, isRead: true });
    }
    setNotificationMenuOpen(false);
    setLocation(notification.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-xl flex items-center justify-center shadow-lg">
          <Shield size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">حصاد — أدمن</p>
            <p className="text-slate-400 text-[10px]">لوحة الإدارة الشاملة</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          (() => {
            const itemBadge = item.notificationBadge ? unreadNotifications.length : item.badge;
            return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
              isActive(item.href)
                ? "bg-[#4CAF50]/20 text-[#81C784]"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <span className={`shrink-0 ${isActive(item.href) ? "text-[#81C784]" : "text-slate-500 group-hover:text-white"}`}>
              {item.icon}
            </span>
            {sidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {itemBadge !== undefined && itemBadge > 0 && (
                  <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${item.badgeColor || "bg-slate-600"}`}>
                    {itemBadge}
                  </span>
                )}
              </>
            )}
            {!sidebarOpen && itemBadge !== undefined && itemBadge > 0 && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${item.badgeColor || "bg-slate-600"}`} />
            )}
          </Link>
            );
          })()
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all text-sm">
          <ChevronRight size={18} className="rotate-180" />
          {sidebarOpen && <span>العودة للموقع</span>}
        </Link>
        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
          <LogOut size={18} />
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden" dir={direction}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 ${isEnglish ? "border-r" : "border-l"} border-slate-700/50 transition-all duration-300 shrink-0 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside {...adminMobileSwipe.swipeHandlers} style={adminMobileSwipe.swipeStyle} className={`absolute ${isEnglish ? "left-0 border-r" : "right-0 border-l"} top-0 bottom-0 flex w-[84vw] max-w-72 flex-col border-slate-700/50 bg-slate-900`}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-700/50 bg-slate-900 px-3 sm:gap-4 sm:px-4">
          {/* Toggle Sidebar */}
          <button
            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-700 hover:text-white sm:h-8 sm:w-8 sm:rounded-lg"
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="max-w-sm flex-1">
            <div className="relative">
              <Search size={14} className={`absolute ${isEnglish ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-slate-500`} />
              <input
                type="text"
                placeholder="بحث في لوحة الإدارة..."
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") runAdminSearch(); }}
                className={`w-full rounded-xl border border-slate-700 bg-slate-800 ${isEnglish ? "pl-9 pr-3" : "pr-9 pl-3"} py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-[#4CAF50]/50 focus:outline-none sm:rounded-lg sm:py-1.5 sm:text-sm`}
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isEnglish ? "ml-auto" : "mr-auto"}`}>
            {/* Alerts */}
            <button onClick={() => setLocation("/admin/product-requests")} title="طلبات تحتاج مراجعة" className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <AlertTriangle size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {/* Notifications */}
            <DropdownMenu open={notificationMenuOpen} onOpenChange={setNotificationMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button title="إشعارات الإدارة" className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <Bell size={16} />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[9px] leading-4 text-white font-bold text-center ring-2 ring-slate-900">
                      {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={10} className="w-[min(92vw,25rem)] border-slate-700 bg-slate-900 p-0 text-slate-100 shadow-2xl">
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">الإشعارات</p>
                    <p className="text-[11px] text-slate-400">{unreadNotifications.length > 0 ? `${unreadNotifications.length} غير مقروءة` : "تمت قراءة جميع الإشعارات"}</p>
                  </div>
                  <button
                    type="button"
                    disabled={unreadNotifications.length === 0 || markAllNotificationsRead.isPending}
                    onClick={() => markAllNotificationsRead.mutate({ notificationKeys: unreadNotifications.map((notification) => notification.id) })}
                    className="text-[11px] font-semibold text-[#81C784] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  >
                    تحديد الكل كمقروء
                  </button>
                </div>
                <DropdownMenuSeparator className="m-0 bg-slate-700" />
                <div className="flex gap-1 overflow-x-auto px-3 py-2">
                  {([ ["all", "الكل"], ["contact", "استفسارات"], ["availability", "طلبات التوفير"] ] as const).map(([type, label]) => <button key={type} type="button" onClick={() => setNotificationTypeFilter(type)} className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors ${notificationTypeFilter === type ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}>{label}</button>)}
                </div>
                <div className="max-h-96 overflow-y-auto py-1">
                  {notificationsQuery.isLoading ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">يجري تحميل أحدث التنبيهات…</div>
                  ) : visibleNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Inbox size={22} className="mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">لا توجد تنبيهات مطابقة لهذا النوع</p>
                    </div>
                  ) : visibleNotifications.map((notification) => (
                    <div key={notification.id} className={`flex items-stretch gap-1 border-b border-slate-800 last:border-0 ${notification.isRead ? "bg-transparent" : "bg-[#4CAF50]/8"}`}>
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-right hover:bg-slate-800/80 transition-colors"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notification.type === "availability" ? "bg-amber-500/15 text-amber-300" : "bg-sky-500/15 text-sky-300"}`}>
                          {notification.type === "availability" ? <AlertTriangle size={15} /> : <MessageSquare size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            {!notification.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#81C784]" />}
                            <span className="truncate text-xs font-semibold text-slate-100">{notification.title}</span>
                          </span>
                          <span className="mt-1 block truncate text-[11px] text-slate-400">{notification.message}</span>
                          <span className="mt-1 block text-[10px] text-slate-500">{formatNotificationTime(notification.createdAt)}</span>
                        </span>
                      </button>
                      {!notification.isRead && (
                        <button
                          type="button"
                          title="تحديد كمقروء"
                          disabled={markNotificationRead.isPending}
                          onClick={() => markNotificationRead.mutate({ notificationKey: notification.id, isRead: true })}
                          className="self-center mr-1 h-8 w-8 shrink-0 rounded-lg text-slate-500 hover:bg-slate-700 hover:text-[#81C784] disabled:opacity-40 transition-colors"
                        >
                          <CheckCheck size={15} className="mx-auto" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <DropdownMenuSeparator className="m-0 bg-slate-700" />
                <button type="button" onClick={() => { setNotificationMenuOpen(false); setLocation("/admin/notifications"); }} className="w-full px-4 py-3 text-right text-xs font-semibold text-[#81C784] hover:bg-slate-800 hover:text-white transition-colors">
                  عرض سجل الإشعارات الكامل
                </button>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-slate-400">مباشر</span>
            </div>

            {/* Admin Avatar */}
            <button onClick={() => setLocation("/admin/settings")} title="إعدادات مدير النظام" className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-slate-700 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-full flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="text-xs text-slate-300 hidden sm:block">{user?.name || "مدير النظام"}</span>
              <ChevronDown size={12} className="text-slate-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-20 lg:pb-0">
          {children}
        </main>

        <nav data-admin-mobile-nav aria-label="تنقل لوحة الإدارة" className="flex lg:hidden shrink-0 items-center justify-around border-t border-slate-700 bg-slate-900 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.22)]">
          {[
            { label: "الرئيسية", href: "/admin", icon: <LayoutDashboard size={20} /> },
            { label: "المستخدمون", href: "/admin/users", icon: <Users size={20} /> },
            { label: "المنتجات", href: "/admin/products", icon: <Package size={20} /> },
            { label: "الطلبات", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
          ].map((item) => {
            const active = item.href === "/admin" ? location === item.href : location.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors ${active ? "bg-[#4CAF50]/20 text-[#81C784]" : "text-slate-400"}`}>{item.icon}<span>{item.label}</span></Link>;
          })}
          <button type="button" onClick={() => setMobileOpen(true)} className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-400"><Menu size={20} /><span>المزيد</span></button>
        </nav>
      </div>
    </div>
  );
}
