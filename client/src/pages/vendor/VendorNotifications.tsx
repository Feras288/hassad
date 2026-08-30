// ===================================================
// Hasaad Platform — Vendor Notifications Page
// Design: Modern SaaS + Organic Warmth | RTL Arabic
// ===================================================
import { useState } from "react";
import {
  Bell,
  MessageCircleQuestion,
  Mail,
  MailOpen,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface VendorNotificationsProps {
  vendorType?: "supplier" | "provider";
}

type NotifFilter = "all" | "unread" | "product_question";

const notifConfig = {
  product_question: { icon: MessageCircleQuestion, color: "text-[#2E7D32]", bg: "bg-green-100" },
};

export default function VendorNotifications({ vendorType = "supplier" }: VendorNotificationsProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const canAccessVendorNotifications = vendorType === "supplier" && user?.role === "vendor" && Boolean(user.vendorId);
  const [filter, setFilter] = useState<NotifFilter>("all");
  const { data: notifications = [], isLoading } = trpc.vendorNotifications.list.useQuery(undefined, { enabled: canAccessVendorNotifications, refetchInterval: 1500, refetchIntervalInBackground: true });
  const refresh = () => utils.vendorNotifications.list.invalidate();
  const markReadMutation = trpc.vendorNotifications.markRead.useMutation({ onSuccess: refresh });
  const markUnreadMutation = trpc.vendorNotifications.markUnread.useMutation({ onSuccess: () => { toast.success("تم تعيين الإشعار كغير مقروء"); refresh(); } });
  const markAllReadMutation = trpc.vendorNotifications.markAllRead.useMutation({ onSuccess: () => { toast.success("تم تحديد جميع الإشعارات كمقروءة"); refresh(); } });
  const deleteMutation = trpc.vendorNotifications.delete.useMutation({ onSuccess: () => { toast.success("تم حذف الإشعار"); refresh(); } });
  const clearMutation = trpc.vendorNotifications.clear.useMutation({ onSuccess: () => { toast.success("تم مسح جميع الإشعارات"); refresh(); } });

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const filterTabs = [
    { id: "all", label: "الكل" },
    { id: "unread", label: `غير مقروء (${unreadCount})` },
    { id: "product_question", label: "الأسئلة" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8]/30 flex" dir="rtl">
      <VendorSidebar vendorType={vendorType} />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          vendorType={vendorType}
          pageTitle="الإشعارات"
          pageSubtitle="متابعة جميع تنبيهات ومستجدات حسابك"
        />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#2E7D32]" />
                <span className="font-bold text-[#263238]">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="flex items-center gap-1.5 text-sm text-[#2E7D32] font-medium hover:underline"
                  >
                    <CheckCheck size={14} />
                    تحديد الكل كمقروء
                  </button>
                )}
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="flex items-center gap-1.5 text-sm text-red-500 font-medium hover:underline"
                >
                  <Trash2 size={14} />
                  مسح الكل
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filter === tab.id
                      ? "bg-[#2E7D32] text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-[#4CAF50] hover:text-[#2E7D32]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {!canAccessVendorNotifications ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Bell size={36} className="text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">اربط هذا الحساب بملف مورد معتمد أولاً</p>
                  <p className="text-sm text-gray-400 mt-1">ستظهر إشعارات الأسئلة هنا بعد ربط الحساب من لوحة الإدارة.</p>
                </div>
              ) : isLoading ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium">جارٍ تحميل الإشعارات…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Bell size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد إشعارات</p>
                  <p className="text-sm text-gray-400 mt-1">ستظهر هنا إشعاراتك الجديدة</p>
                </div>
              ) : (
                filtered.map((notif) => {
                  const config = notifConfig[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) markReadMutation.mutate({ id: notif.id });
                        setLocation("/vendor/questions");
                      }}
                      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                        !notif.isRead
                          ? "border-[#4CAF50]/30 bg-green-50/30"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <config.icon size={18} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-[#263238]">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1.5">{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notif.createdAt))}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notif.isRead) markUnreadMutation.mutate({ id: notif.id });
                                else markReadMutation.mutate({ id: notif.id });
                              }}
                              aria-label={notif.isRead ? "تعيين كغير مقروء" : "تعيين كمقروء"}
                              title={notif.isRead ? "تعيين كغير مقروء" : "تعيين كمقروء"}
                              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-[#2E7D32] hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              {notif.isRead ? <Mail size={13} /> : <MailOpen size={13} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate({ id: notif.id });
                              }}
                              aria-label="حذف الإشعار"
                              title="حذف الإشعار"
                              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
