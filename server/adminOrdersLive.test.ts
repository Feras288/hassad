import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("طلبات الإدارة الحية", () => {
  it("يعرض قائمة الطلبات وينشئ الطلبات من إجراءات محمية للإدارة", () => {
    const router = source("server/routers/orders.router.ts");
    const database = source("server/db/orders.db.ts");

    expect(router).toContain("adminList: adminProcedure.query(() => listCommerceOrdersForAdmin())");
    expect(router).toContain("adminCreate: adminProcedure.input(adminOrderCreateSchema)");
    expect(router).toContain("adminUpdateStatus: adminProcedure.input");
    expect(database).toContain("listCommerceOrdersForAdmin");
    expect(database).toContain("updateCommerceOrderStatusForAdmin");
  });

  it("يتحقق من المورد ومن تطابق المنتجات معه قبل حفظ الطلب الإداري", () => {
    const router = source("server/routers/orders.router.ts");

    expect(router).toContain("اختر مورداً معتمداً ونشطاً لإنشاء الطلب");
    expect(router).toContain("جميع المنتجات نشطة وتتبع المورد المختار");
    expect(router).toContain("deliveryAddress: input.address");
  });

  it("تستهلك واجهة الإدارة البيانات الحية ولا تعود إلى بيانات الطلبات الثابتة", () => {
    const page = source("client/src/pages/admin/AdminOrders.tsx");

    expect(page).toContain("trpc.orders.adminList.useQuery");
    expect(page).toContain("trpc.orders.adminCreate.useMutation");
    expect(page).toContain("trpc.orders.adminUpdateStatus.useMutation");
    expect(page).not.toContain("adminOrders, AdminOrder");
  });

  it("يعرض بيانات الشحن ورابط التتبع عند توفرهما", () => {
    const page = source("client/src/pages/admin/AdminOrders.tsx");

    expect(page).toContain("getShipmentTrackingUrl");
    expect(page).toContain("الشحن والتتبع");
    expect(page).toContain("رقم التتبع");
    expect(page).toContain("موعد التسليم المتوقع");
  });

  it("يصدر النتائج المفلترة بترميز CSV مناسب للعربية وExcel", () => {
    const page = source("client/src/pages/admin/AdminOrders.tsx");

    expect(page).toContain("const exportOrders");
    expect(page).toContain("\\uFEFF");
    expect(page).toContain("text/csv;charset=utf-8;");
    expect(page).toContain("hassad-orders-");
  });
});
