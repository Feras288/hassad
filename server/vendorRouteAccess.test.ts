import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

describe("حماية مسارات المورد", () => {
  it("تمنع المدير أو الحساب غير المرتبط من فتح واجهات المورد", () => {
    expect(appSource).toContain("function SupplierRouteGuard");
    expect(appSource).toContain('if (user?.role === "admin") return <Redirect to="/admin" />;');
    expect(appSource).toContain('if (!user.vendorId) return <Redirect to="/supplier-pending" />;');
    expect(appSource).toContain('<SupplierRouteGuard><VendorCustomers vendorType="supplier" /></SupplierRouteGuard>');
    expect(appSource).toContain('<SupplierRouteGuard><VendorProductQuestions /></SupplierRouteGuard>');
  });
});
