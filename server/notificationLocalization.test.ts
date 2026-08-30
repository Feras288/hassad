import { describe, expect, it } from "vitest";
import { localizeCancellationDecision, localizeOrderStatus, orderStatusEmailTemplate } from "./notificationLocalization";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("توطين إشعارات المستخدم", () => {
  it("ينشئ تحديث الشحن بلغة العميل المفضلة", () => {
    expect(localizeOrderStatus("ar", "shipped", { trackingNumber: "SA123" }).title).toBe("تم شحن الطلب");
    expect(localizeOrderStatus("en", "shipped", { trackingNumber: "SA123", shippingProvider: "SPL" }).message).toContain("Tracking number: SA123 via SPL.");
  });

  it("ينشئ قرار الإلغاء وقالب البريد بالإنكليزية", () => {
    expect(localizeCancellationDecision("en", true, "HS-100").title).toBe("Cancellation approved");
    expect(orderStatusEmailTemplate("en", "HS-100", "delivered").subject).toContain("Order delivered");
  });

  it("يعرض عمود اللغة المفضلة في إدارة المستخدمين", () => {
    const usersPage = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminUsers.tsx"), "utf8");
    expect(usersPage).toContain("اللغة المفضلة");
    expect(usersPage).toContain("user.preferredLanguage");
  });
});
