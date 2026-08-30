import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("إجراءات صفحة مقدم الخدمات", () => {
  it("يوجه الحجز إلى طلب حي يختار مقدم خدمة معتمداً دون حزم أو أسعار نموذجية", () => {
    const booking = source("client/src/pages/BookingPage.tsx");

    expect(booking).toContain("serviceProviders.list.useQuery");
    expect(booking).toContain("trpc.serviceBookings.create.useMutation");
    expect(booking).not.toContain("getBookingPrefill");
  });

  it("يفتح محادثة داخلية مباشرة مع مقدم الخدمة بدلاً من بريد الدعم", () => {
    const sidebar = source("client/src/components/provider/ProviderSidebar.tsx");
    const messages = source("client/src/pages/dashboard/DashboardMessages.tsx");

    expect(sidebar).toContain("/dashboard/messages?provider=${encodeURIComponent(provider.id)}");
    expect(sidebar).not.toContain("mailto:support@hassad.net");
    expect(messages).toContain("trpc.serviceMessaging.open.useMutation");
    expect(messages).toContain("trpc.serviceMessaging.conversations.useQuery");
    expect(messages).toContain("trpc.serviceMessaging.send.useMutation");
    expect(messages).toContain("navigate(\"/dashboard/messages\", { replace: true })");
  });
});
