// ================================================================
// HASAAD PLATFORM — NotificationsContext
// Tracks order status changes and generates real-time notifications
// Persists to localStorage, integrates with OrdersContext
// ================================================================
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useOrders, type OrderStatus } from "./OrdersContext";
import { toast } from "sonner";
import { ShoppingBag, CheckCircle2, Truck, XCircle, Bell } from "lucide-react";
import { useLanguage } from "./LanguageContext";

// ─── Types ─────────────────────────────────────────────────────
export type NotifCategory = "order_status" | "order_placed" | "order_cancelled" | "promo" | "system";

export interface AppNotification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt: number;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
}

// ─── Status Labels ──────────────────────────────────────────────
const STATUS_LABELS: Record<"ar" | "en", Record<OrderStatus, { title: string; body: (num: string) => string }>> = {
  ar: {
    pending: { title: "تم استلام طلبك", body: (num) => `طلبك رقم ${num} قيد المراجعة وسيتم تأكيده قريباً.` },
    confirmed: { title: "تم تأكيد طلبك ✓", body: (num) => `طلبك رقم ${num} مؤكد وجارٍ التجهيز.` },
    in_progress: { title: "طلبك في الطريق 🚚", body: (num) => `طلبك رقم ${num} تم تسليمه للشحن وفي طريقه إليك.` },
    completed: { title: "تم توصيل طلبك ✓", body: (num) => `طلبك رقم ${num} وصل بنجاح. نتمنى أن تكون راضياً!` },
    cancelled: { title: "تم إلغاء الطلب", body: (num) => `طلبك رقم ${num} تم إلغاؤه.` },
  },
  en: {
    pending: { title: "Order received", body: (num) => `Order ${num} is under review and will be confirmed shortly.` },
    confirmed: { title: "Order confirmed", body: (num) => `Order ${num} has been confirmed and is being prepared.` },
    in_progress: { title: "Order on its way", body: (num) => `Order ${num} has been handed to shipping and is on its way.` },
    completed: { title: "Order delivered", body: (num) => `Order ${num} was delivered successfully. We hope you are satisfied!` },
    cancelled: { title: "Order cancelled", body: (num) => `Order ${num} has been cancelled.` },
  },
};

// ─── Toast Icons ────────────────────────────────────────────────
function getToastIcon(status: OrderStatus) {
  switch (status) {
    case "confirmed":   return CheckCircle2;
    case "in_progress": return Truck;
    case "completed":   return CheckCircle2;
    case "cancelled":   return XCircle;
    default:            return ShoppingBag;
  }
}

// ─── Storage ────────────────────────────────────────────────────
const STORAGE_KEY = "hasaad_notifications_v1";

function loadFromStorage(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch { /* ignore */ }
  return [];
}

function saveToStorage(items: AppNotification[]) {
  try {
    // Keep only the latest 50 notifications
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch { /* ignore */ }
}

// ─── Context ────────────────────────────────────────────────────
const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadFromStorage);
  const { orders } = useOrders();
  const { language } = useLanguage();

  // Track previous statuses to detect changes
  const prevStatusRef = useRef<Record<string, OrderStatus>>({});

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      const newNotif: AppNotification = {
        ...n,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // Watch for order status changes
  useEffect(() => {
    orders.forEach((order) => {
      const prevStatus = prevStatusRef.current[order.id];

      // First time we see this order — record it but don't notify (already notified at checkout)
      if (prevStatus === undefined) {
        prevStatusRef.current[order.id] = order.status;
        return;
      }

      // Status changed
      if (prevStatus !== order.status) {
        prevStatusRef.current[order.id] = order.status;

        const statusInfo = STATUS_LABELS[language][order.status];
        if (!statusInfo) return;

        const title = statusInfo.title;
        const body = statusInfo.body(order.orderNumber);

        // Add to notifications list
        addNotification({
          category: order.status === "cancelled" ? "order_cancelled" : "order_status",
          title,
          body,
          orderId: order.id,
          orderNumber: order.orderNumber,
        });

        // Show toast
        const Icon = getToastIcon(order.status);
        toast(title, {
          description: body,
          duration: 5000,
          icon: <Icon className="w-4 h-4 text-[#2E7D32]" />,
          action: {
            label: "عرض الطلب",
            onClick: () => {
              window.location.href = `/dashboard/orders/${order.id}`;
            },
          },
        });
      }
    });
  }, [orders, addNotification, language]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
