import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const db = readFileSync(resolve(process.cwd(), "server/db/connection.ts"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/routers/auth.router.ts"), "utf8");
const settings = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminSettings.tsx"), "utf8");

describe("اللغة الافتراضية للحسابات الجديدة", () => {
  it("يخزن إعداد المنصة ويستخدمه عند إدراج مستخدم جديد", () => {
    expect(schema).toContain('mysqlTable("platform_settings"');
    expect(db).toContain("getPlatformDefaultLanguage");
    expect(db).toContain("values.preferredLanguage = defaultLanguage");
  });

  it("يحمي تعديل الإعداد ويترجم تبويبات الإدارة وفق اللغة", () => {
    expect(router).toContain("updateDefaultRegistrationLanguage: adminProcedure");
    expect(settings).toContain("اللغة الافتراضية للحسابات الجديدة");
    expect(settings).toContain("labelEn: \"General settings\"");
    expect(settings).toContain("isEnglish ? s.labelEn : s.labelAr");
  });
});
