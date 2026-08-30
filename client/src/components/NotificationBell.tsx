// ================================================================
// HASAAD PLATFORM — NotificationBell Component
// Navbar bell icon with badge + dropdown panel
// Shows real-time order status notifications
// ================================================================
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  Bell, BellRing, CheckCheck, Trash2, X,
  ShoppingBag, Truck, CheckCircle2, XCircle, Package,
  ChevronRight,
} from "lucide-react";
import { useNotifications, type AppNotification } from "@/contexts/NotificationsContext";

// ─── Helpers ───────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

function getCategoryIcon(n: AppNotification) {
  switch (n.category) {
    case "order_placed":    return ShoppingBag;
    case "order_status":    return n.body.includes("الطريق") ? Truck : CheckCircle2;
    case "order_cancelled": return XCircle;
    default:                return Package;
  }
}

function getCategoryColor(n: AppNotification) {
  switch (n.category) {
    case "order_placed":    return "bg-blue-100 text-blue-600";
    case "order_status":    return n.body.includes("الطريق")
      ? "bg-purple-100 text-purple-600"
      : "bg-green-100 text-green-600";
    case "order_cancelled": return "bg-red-100 text-red-600";
    default:                return "bg-gray-100 text-gray-600";
  }
}

// ─── Single Notification Row ────────────────────────────────────
function NotifRow({
  notif,
  onRead,
  onDelete,
  isScrolled,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  isScrolled: boolean;
}) {
  const Icon = getCategoryIcon(notif);
  const colorClass = getCategoryColor(notif);

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group ${
        notif.read ? "bg-white hover:bg-gray-50" : "bg-green-50/60 hover:bg-green-50"
      }`}
      onClick={() => onRead(notif.id)}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${notif.read ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
            {notif.title}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-[#2E7D32] flex-shrink-0 mt-2" />
      )}
    </div>
  );

  // Wrap in Link if there's an orderId
  if (notif.orderId) {
    return (
      <Link href={`/dashboard/orders/${notif.orderId}`}>
        {content}
      </Link>
    );
  }
  return content;
}

// ─── Main Component ─────────────────────────────────────────────
interface NotificationBellProps {
  isScrolled: boolean;
  forceScrolled?: boolean;
}

export default function NotificationBell({ isScrolled, forceScrolled }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const scrolled = isScrolled || forceScrolled;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
        } ${open ? (scrolled ? "bg-gray-100" : "bg-white/10") : ""}`}
        aria-label="الإشعارات"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 animate-[wiggle_1s_ease-in-out_infinite]" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          style={{ maxHeight: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-sm font-bold text-gray-800">الإشعارات</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                قراءة الكل
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">لا توجد إشعارات</p>
                <p className="text-xs text-gray-400 mt-1">ستظهر هنا إشعارات طلباتك تلقائياً</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <NotifRow
                    key={n.id}
                    notif={n}
                    onRead={markRead}
                    onDelete={deleteNotification}
                    isScrolled={scrolled ?? false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50/50">
              <Link
                href="/dashboard/notifications"
                className="flex items-center gap-1 text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                عرض كل الإشعارات
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  if (window.confirm("هل تريد حذف جميع الإشعارات؟")) {
                    notifications.forEach((n) => deleteNotification(n.id));
                  }
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                مسح الكل
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
