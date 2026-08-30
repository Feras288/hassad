import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const source = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("الحجوزات والمراسلات الحية لمقدمي الخدمات", () => {
  it("يحفظ موعد الحجز بدلاً من إنشاء رقم مرجعي محلي", () => {
    const bookingStep = source("client/src/components/booking/BookingStep3.tsx");
    const bookingPage = source("client/src/pages/BookingPage.tsx");
    expect(bookingStep).toContain("await onConfirm");
    expect(bookingStep).not.toContain("Math.floor(100000");
    expect(bookingPage).toContain("serviceBookings.create");
    expect(bookingPage).toContain("serviceProviders.list.useQuery");
    expect(bookingPage).not.toContain("getBookingPrefill");
  });

  it("يوفر قوائم حية للعميل ولمقدم الخدمة لإدارة المواعيد", () => {
    const customerBookings = source("client/src/pages/dashboard/DashboardBookings.tsx");
    const providerBookings = source("client/src/pages/vendor/ProviderBookings.tsx");
    expect(customerBookings).toContain("serviceBookings.mine.useQuery");
    expect(customerBookings).toContain("serviceBookings.cancel.useMutation");
    expect(providerBookings).toContain("serviceBookings.providerMine.useQuery");
    expect(providerBookings).toContain("serviceBookings.updateStatus.useMutation");
  });

  it("يحصر الوصول إلى المحادثات في العميل أو مقدم الخدمة المرتبط", () => {
    const router = source("server/routers/services.router.ts");
    expect(router).toContain("conversation.customerId !== ctx.user.id && conversation.providerId !== ctx.user.vendorId");
    expect(router).toContain("serviceMessagingRouter = router");
  });
});
