import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getNewVendorQuestionToastCandidates } from "@/lib/vendorNotificationToasts";

export default function VendorNotificationToastListener({ enabled }: { enabled: boolean }) {
  const [, setLocation] = useLocation();
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const hasInitialSnapshot = useRef(false);
  const { data: preferences } = trpc.vendorNotificationPreferences.get.useQuery(undefined, { enabled, staleTime: 10000 });
  const { data: notifications = [] } = trpc.vendorNotifications.list.useQuery(undefined, {
    enabled,
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!enabled || !preferences) return;
    const currentIds = new Set(notifications.map((notification) => notification.id));
    if (!hasInitialSnapshot.current) {
      seenNotificationIds.current = currentIds;
      hasInitialSnapshot.current = true;
      return;
    }
    const newQuestionNotifications = getNewVendorQuestionToastCandidates(notifications, seenNotificationIds.current, preferences);
    seenNotificationIds.current = currentIds;
    newQuestionNotifications.forEach((notification) => {
      toast.info(notification.title, {
        description: notification.message,
        action: { label: "فتح الأسئلة", onClick: () => setLocation("/vendor/questions") },
      });
    });
  }, [enabled, notifications, preferences, setLocation]);

  return null;
}
