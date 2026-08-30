import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const productPage = readFileSync(new URL("../client/src/pages/admin/AdminProducts.tsx", import.meta.url), "utf8");
const vendorPage = readFileSync(new URL("../client/src/pages/admin/AdminVendors.tsx", import.meta.url), "utf8");
const adminLayout = readFileSync(new URL("../client/src/components/admin/AdminLayout.tsx", import.meta.url), "utf8");
const adminHome = readFileSync(new URL("../client/src/pages/admin/AdminHome.tsx", import.meta.url), "utf8");

describe("تفعيل إدارة الأدمن", () => {
  it("يربط المنتج بمورد مسجل ووحدة بيع ومخزون مطلوب", () => {
    expect(productPage).toContain("المورد المسجل *");
    expect(productPage).toContain("اختر مورداً مسجلاً للمنتج");
    expect(productPage).toContain("وحدة البيع *");
    expect(productPage).toContain("المخزون مطلوب");
  });

  it("يرفع شعار المورد بدلاً من طلب رابط صورة", () => {
    expect(vendorPage).toContain("رفع صورة الشعار");
    expect(vendorPage).toContain("uploadImage");
    expect(vendorPage).not.toContain("https://example.com/logo.png");
  });

  it("يفعل عناصر هيدر الإدارة الأساسية بدل أزرار بلا إجراء", () => {
    expect(adminLayout).toContain("runAdminSearch");
    expect(adminLayout).toContain('setLocation("/admin/product-requests")');
    expect(adminLayout).toContain('href: "/admin/contact-inquiries"');
    expect(adminLayout).toContain('setLocation("/admin/settings")');
  });

  it("يعرض قائمة إشعارات الإدارة مع عداد وإجراءات تحديد القراءة", () => {
    expect(adminLayout).toContain("trpc.adminNotifications.list.useQuery");
    expect(adminLayout).toContain("markAllNotificationsRead");
    expect(adminLayout).toContain("markNotificationRead");
    expect(adminLayout).toContain("تحديد الكل كمقروء");
    expect(adminLayout).toContain("DropdownMenuContent");
  });

  it("يوفر تصفية إشعارات الهيدر ورابطاً ظاهراً إلى سجل الإشعارات الكامل", () => {
    expect(adminLayout).toContain("notificationTypeFilter");
    expect(adminLayout).toContain("سجل الإشعارات");
    expect(adminLayout).toContain('setLocation("/admin/notifications")');
    expect(adminLayout).toContain("playAdminNotificationTone");
  });

  it("يعرض لوحة إدارة رئيسية مبنية على استعلامات حية بدلاً من بيانات تجريبية", () => {
    expect(adminHome).toContain("trpc.adminManagement.users.list.useQuery");
    expect(adminHome).toContain("trpc.adminManagement.vendors.list.useQuery");
    expect(adminHome).toContain("trpc.products.adminList.useQuery");
    expect(adminHome).not.toContain("adminRevenueData");
  });
});
