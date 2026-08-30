import { describe, expect, it } from "vitest";
import { getShipmentTrackingUrl } from "../client/src/lib/shipmentTracking";

describe("روابط تتبع الشحن", () => {
  it("يربط رقم SPL بصفحة التتبع الرسمية مع رقم الشحنة", () => {
    expect(getShipmentTrackingUrl("SPL", "ABC 123")).toBe("https://splonline.com.sa/ar/shipmentdetailsstatic/?tid=ABC%20123");
  });

  it("يوجه شركات الشحن المعروفة إلى صفحات التتبع الرسمية", () => {
    expect(getShipmentTrackingUrl("أرامكس", "123")).toContain("aramex.com");
    expect(getShipmentTrackingUrl("سمسا", "123")).toContain("smsaexpress.com");
    expect(getShipmentTrackingUrl("ناقل", "123")).toContain("naqelexpress.com");
  });

  it("لا ينشئ رابطاً دون رقم تتبع أو لشركة غير معروفة", () => {
    expect(getShipmentTrackingUrl("SPL", null)).toBeNull();
    expect(getShipmentTrackingUrl("شركة محلية", "123")).toBeNull();
  });
});
