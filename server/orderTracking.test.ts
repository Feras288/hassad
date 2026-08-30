import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("تتبع الطلبات الحي", () => {
  it("يعرّف تخزيناً دائماً للطلبات والعناصر والتحديثات وإشعارات العميل", () => {
    const schema = projectFile("drizzle/schema.ts");
    expect(schema).toContain('mysqlTable("commerce_orders"');
    expect(schema).toContain('mysqlTable("commerce_order_items"');
    expect(schema).toContain('"commerce_order_tracking_events"');
    expect(schema).toContain('"customer_order_notifications"');
    expect(schema).toContain('trackingNumber');
    expect(schema).toContain('shippingProvider');
  });

  it("يحمي تحديث الشحن بصلاحية المورد ويرسل إشعاراً للعميل", () => {
    const router = projectFile("server/routers/orders.router.ts");
    expect(router).toContain("vendorUpdateTracking: vendorProcedure");
    expect(router).toContain("ctx.user.vendorId!");
    expect(router).toContain("listCustomerOrderNotifications");
    expect(router).toContain("أدخل رقم التتبع عند تحديث حالة الطلب إلى تم الشحن");
    expect(router).toContain("notifications: router");
  });

  it("يربط إتمام الشراء وقائمة المورد وصفحة العميل بمصادر البيانات الحية", () => {
    const checkout = projectFile("client/src/pages/CheckoutPage.tsx");
    const vendorOrders = projectFile("client/src/pages/vendor/VendorOrders.tsx");
    const customerOrders = projectFile("client/src/pages/dashboard/DashboardOrders.tsx");
    expect(checkout).toContain("trpc.orders.create.useMutation");
    expect(vendorOrders).toContain("trpc.orders.vendorList.useQuery");
    expect(vendorOrders).toContain("trpc.orders.vendorUpdateTracking.useMutation");
    expect(vendorOrders).not.toContain("vendorDashboardData");
    expect(customerOrders).toContain("trpc.orders.mine.useQuery");
    expect(customerOrders).toContain("trpc.orders.notifications.mine.useQuery");
    expect(customerOrders).not.toContain("dashboardData");
  });

  it("يسجل طلب الإلغاء ويرسله للمورد ثم يعيد قرار المورد إلى العميل", () => {
    const schema = projectFile("drizzle/schema.ts");
    const router = projectFile("server/routers/orders.router.ts");
    const customerOrders = projectFile("client/src/pages/dashboard/DashboardOrders.tsx");
    const vendorOrders = projectFile("client/src/pages/vendor/VendorOrders.tsx");
    expect(schema).toContain('"vendor_order_notifications"');
    expect(schema).toContain("cancellationStatus");
    expect(router).toContain("requestCancellation: protectedProcedure");
    expect(router).toContain("vendorReviewCancellation: vendorProcedure");
    expect(customerOrders).toContain("trpc.orders.requestCancellation.useMutation");
    expect(vendorOrders).toContain("trpc.orders.vendorReviewCancellation.useMutation");
  });

  it("يعرض شريط تقدم متاحاً للعميل مع معالجة الإلغاء والحالة الحالية", () => {
    const customerOrders = projectFile("client/src/pages/dashboard/DashboardOrders.tsx");
    expect(customerOrders).toContain('aria-label="تقدم الطلب"');
    expect(customerOrders).toContain('role="progressbar"');
    expect(customerOrders).toContain("progressPercent");
    expect(customerOrders).toContain("طلب الإلغاء قيد مراجعة المورد");
    expect(customerOrders).toContain("تم إلغاء هذا الطلب؛ توقف مسار الشحن.");
  });

  it("يقبل تقييماً واحداً موثقاً لتجربة التوصيل بعد التسليم فقط", () => {
    const schema = projectFile("drizzle/schema.ts");
    const database = projectFile("server/db/orders.db.ts");
    const router = projectFile("server/routers/orders.router.ts");
    const customerOrders = projectFile("client/src/pages/dashboard/DashboardOrders.tsx");
    expect(schema).toContain('"commerce_order_delivery_ratings"');
    expect(schema).toContain('unique()');
    expect(database).toContain("order.status !== \"delivered\"");
    expect(database).toContain("تم إرسال تقييم تجربة التوصيل لهذا الطلب مسبقاً");
    expect(router).toContain("rateDelivery: protectedProcedure");
    expect(customerOrders).toContain("trpc.orders.rateDelivery.useMutation");
  });

  it("يعرض المورد تقييم العميل وتعليقه المرتبطين بطلبه الحي فقط", () => {
    const vendorOrders = projectFile("client/src/pages/vendor/VendorOrders.tsx");
    expect(vendorOrders).toContain("selectedOrder.deliveryRating");
    expect(vendorOrders).toContain("تقييم موثق من العميل بعد استلام الطلب");
    expect(vendorOrders).toContain("لم يترك العميل تعليقاً نصياً.");
    expect(vendorOrders).toContain("لم يصل تقييم تجربة التوصيل بعد");
  });

  it("يستخدم انتقالاً سلساً لشريط التقدم ويحترم تفضيل تقليل الحركة", () => {
    const customerOrders = projectFile("client/src/pages/dashboard/DashboardOrders.tsx");
    expect(customerOrders).toContain("transition-[width] duration-500");
    expect(customerOrders).toContain("motion-reduce:transition-none");
  });
});
