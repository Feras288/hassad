import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("إعدادات إحصاءات الصفحة الرئيسية", () => {
  it("يحفظ إعداداً متحققاً من أربعة مؤشرات مع حالة الظهور", () => {
    const db = source("server/db/connection.ts");
    const router = source("server/routers/auth.router.ts");

    expect(db).toContain('"hero_stats_settings"');
    expect(db).toContain("DEFAULT_HERO_STATS_SETTINGS");
    expect(db).toContain("getHeroStatsSettings");
    expect(db).toContain("setHeroStatsSettings");
    expect(router).toContain("heroStats: publicProcedure");
    expect(router).toContain("updateHeroStats: adminProcedure");
    expect(router).toContain("z.array(heroStatSettingSchema).length(4)");
  });

  it("يربط البطل ولوحة الإدارة بالإعداد الحي ويتيح الإخفاء والتعديل", () => {
    const hero = source("client/src/components/HeroSection.tsx");
    const settings = source("client/src/pages/admin/AdminSettings.tsx");

    expect(hero).toContain("platformPreferences.heroStats.useQuery");
    expect(hero).toContain("showStats");
    expect(settings).toContain("إحصاءات الصفحة الرئيسية");
    expect(settings).toContain("toggleHeroStats");
    expect(settings).toContain("updateHeroStats.mutate(heroStatsDraft)");
  });
});
