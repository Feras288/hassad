import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(
  resolve(process.cwd(), "client/src/App.tsx"),
  "utf8"
);

/** Extracts the JSX for a single <Route path="..."> block, tolerant of Prettier's line wrapping. */
function extractRouteBlock(path: string): string {
  const marker = `path="${path}"`;
  const start = appSource.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  const end = appSource.indexOf("</Route>", start);
  expect(end).toBeGreaterThan(start);
  return appSource.slice(start, end);
}

describe("حماية مسارات المورد", () => {
  it("تمنع المدير أو الحساب غير المرتبط من فتح واجهات المورد", () => {
    expect(appSource).toContain("function SupplierRouteGuard");
    expect(appSource).toContain(
      'if (user?.role === "admin") return <Redirect to="/admin" />;'
    );
    expect(appSource).toContain(
      'if (!user.vendorId) return <Redirect to="/supplier-pending" />;'
    );

    const customersRoute = extractRouteBlock("/vendor/customers");
    expect(customersRoute).toContain("SupplierRouteGuard");
    expect(customersRoute).toContain("VendorCustomers");

    const questionsRoute = extractRouteBlock("/vendor/questions");
    expect(questionsRoute).toContain("SupplierRouteGuard");
    expect(questionsRoute).toContain("VendorProductQuestions");
  });
});
