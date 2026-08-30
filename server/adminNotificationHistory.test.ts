import { describe, expect, it } from "vitest";
import { filterAdminNotificationHistory, getNewUnreadNotificationKeys } from "../client/src/lib/adminNotificationHistory";

const notifications = [
  { id: "contact:today", type: "contact" as const, title: "استفسار ري", message: "استفسار من مزارع", href: "/admin/contact-inquiries", createdAt: new Date("2026-08-16T10:00:00.000Z"), isRead: false, sourceStatus: "new" },
  { id: "availability:week", type: "availability" as const, title: "طلب توفير بذور", message: "طلب من مزارع", href: "/admin/product-requests", createdAt: new Date("2026-08-11T10:00:00.000Z"), isRead: true, sourceStatus: "fulfilled" },
  { id: "contact:old", type: "contact" as const, title: "استفسار قديم", message: "استفسار مؤرشف", href: "/admin/contact-inquiries", createdAt: new Date("2026-07-20T10:00:00.000Z"), isRead: true, sourceStatus: "closed" },
];

describe("سجل إشعارات الإدارة", () => {
  it("يفلتر السجل بالنوع وحالة القراءة والعمر وعبارة البحث", () => {
    const now = new Date("2026-08-16T12:00:00.000Z").getTime();
    expect(filterAdminNotificationHistory(notifications, { query: "", type: "contact", readState: "unread", age: "day" }, now).map((item) => item.id)).toEqual(["contact:today"]);
    expect(filterAdminNotificationHistory(notifications, { query: "بذور", type: "all", readState: "all", age: "all" }, now).map((item) => item.id)).toEqual(["availability:week"]);
    expect(filterAdminNotificationHistory(notifications, { query: "", type: "all", readState: "read", age: "older" }, now).map((item) => item.id)).toEqual(["contact:old"]);
  });

  it("لا يصدر التنبيه الصوتي للحالة الأولى ويحدد الإشعارات الجديدة فقط", () => {
    expect(getNewUnreadNotificationKeys(null, ["contact:today"])).toEqual([]);
    expect(getNewUnreadNotificationKeys(["contact:today"], ["contact:today", "availability:new"])).toEqual(["availability:new"]);
  });
});
