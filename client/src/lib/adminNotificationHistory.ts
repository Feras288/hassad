export type AdminNotificationType = "contact" | "availability";
export type AdminNotificationRecord = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
  createdAt: Date | string;
  isRead: boolean;
  sourceStatus: string;
};

export type AdminNotificationHistoryFilters = {
  query: string;
  type: "all" | AdminNotificationType;
  readState: "all" | "read" | "unread";
  age: "all" | "day" | "week" | "older";
};

export function filterAdminNotificationHistory(
  notifications: AdminNotificationRecord[],
  filters: AdminNotificationHistoryFilters,
  now = Date.now(),
) {
  const query = filters.query.trim().toLocaleLowerCase("ar-SA");
  const day = 24 * 60 * 60 * 1000;
  return notifications.filter((notification) => {
    const age = Math.max(0, now - new Date(notification.createdAt).getTime());
    const matchesType = filters.type === "all" || notification.type === filters.type;
    const matchesReadState = filters.readState === "all"
      || (filters.readState === "read" && notification.isRead)
      || (filters.readState === "unread" && !notification.isRead);
    const matchesAge = filters.age === "all"
      || (filters.age === "day" && age <= day)
      || (filters.age === "week" && age > day && age <= 7 * day)
      || (filters.age === "older" && age > 7 * day);
    const haystack = `${notification.title} ${notification.message} ${notification.type} ${notification.sourceStatus}`.toLocaleLowerCase("ar-SA");
    return matchesType && matchesReadState && matchesAge && (!query || haystack.includes(query));
  });
}

export function getNewUnreadNotificationKeys(previousKeys: string[] | null, currentKeys: string[]) {
  if (!previousKeys) return [];
  const previous = new Set(previousKeys);
  return currentKeys.filter((key) => !previous.has(key));
}

export function playAdminNotificationTone() {
  if (typeof window === "undefined" || document.hidden || typeof window.AudioContext === "undefined") return;
  try {
    const context = new window.AudioContext();
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    const start = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, start);
    oscillator.frequency.exponentialRampToValueAtTime(880, start + 0.1);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.17);
    oscillator.addEventListener("ended", () => { void context.close(); }, { once: true });
  } catch {
    // Some browsers require a user gesture before sound playback; the visual alert remains available.
  }
}
