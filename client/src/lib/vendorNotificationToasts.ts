export type ToastCandidateNotification = {
  id: string;
  type: "product_question";
  title: string;
  message: string;
};

export type ToastNotificationPreferences = {
  productQuestionEnabled: boolean;
  inAppToastEnabled: boolean;
};

/** Returns only unseen question notifications when the supplier opted into in-app alerts. */
export function getNewVendorQuestionToastCandidates(
  notifications: ToastCandidateNotification[],
  seenNotificationIds: Set<string>,
  preferences: ToastNotificationPreferences
) {
  if (!preferences.productQuestionEnabled || !preferences.inAppToastEnabled) return [];
  return notifications.filter((notification) => !seenNotificationIds.has(notification.id));
}
