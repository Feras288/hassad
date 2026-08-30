import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const switcher = readFileSync(resolve(process.cwd(), "client/src/components/LanguageSwitcher.tsx"), "utf8");
const settings = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminSettings.tsx"), "utf8");

describe("لغة لوحة الإدارة", () => {
  it("تخفي الزر العائم ضمن مسارات الإدارة", () => {
    expect(switcher).toContain('location === "/admin" || location.startsWith("/admin/")');
    expect(switcher).toContain("return null");
  });

  it("تتيح تغيير اللغة المحفوظة من الإعدادات", () => {
    expect(settings).toContain("لغة عرض لوحة الإدارة");
    expect(settings).toContain("useLanguage");
    expect(settings).toContain("updateDisplayLanguage");
    expect(settings).toContain("setLanguage(nextLanguage)");
  });
});
