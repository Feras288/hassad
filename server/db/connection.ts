import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { InsertUser, platformSettings, users } from "../../drizzle/schema";
import { ENV } from "../_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: Partial<InsertUser> & { id?: string; email?: string }): Promise<void> {
  if (!user.id && !user.email) {
    throw new Error("User id or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "image", "loginMethod", "vendorId"] as const;
    type TextField = (typeof textFields)[number];

    textFields.forEach((field) => {
      const value = user[field];
      if (value !== undefined) {
        updateSet[field] = value ?? null;
      }
    });

    if (user.role !== undefined) {
      updateSet.role = user.role;
    }

    if (user.preferredLanguage !== undefined) {
      updateSet.preferredLanguage = user.preferredLanguage;
    }

    updateSet.updatedAt = new Date();

    if (user.id) {
      await db
        .update(users)
        .set(updateSet)
        .where(eq(users.id, user.id));
    } else if (user.email) {
      await db
        .update(users)
        .set(updateSet)
        .where(eq(users.email, user.email));
    }
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

export async function getUserById(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPlatformDefaultLanguage(
  dbOverride?: NonNullable<Awaited<ReturnType<typeof getDb>>>
): Promise<"ar" | "en"> {
  const db = dbOverride ?? (await getDb());
  if (!db) return "ar";
  const rows = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, "default_registration_language"))
    .limit(1);
  return rows[0]?.value === "en" ? "en" : "ar";
}

export async function setPlatformDefaultLanguage(
  language: "ar" | "en"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db
    .insert(platformSettings)
    .values({ key: "default_registration_language", value: language })
    .onDuplicateKeyUpdate({ set: { value: language } });
}

/** The account-level display language is intentionally separate from the browser fallback. */
export async function getAccountLanguagePreference(
  userId: string
): Promise<"ar" | "en"> {
  const db = await getDb();
  if (!db) return "ar";
  const result = await db
    .select({ preferredLanguage: users.preferredLanguage })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0]?.preferredLanguage ?? "ar";
}

export async function updateAccountLanguagePreference(
  userId: string,
  preferredLanguage: "ar" | "en"
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(users)
    .set({ preferredLanguage, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return { preferredLanguage };
}

export type HeroStatSetting = {
  value: number;
  suffixAr: string;
  suffixEn: string;
  labelAr: string;
  labelEn: string;
};

export type HeroStatsSettings = {
  enabled: boolean;
  stats: HeroStatSetting[];
};

export const DEFAULT_HERO_STATS_SETTINGS: HeroStatsSettings = {
  enabled: true,
  stats: [
    { value: 0, suffixAr: "", suffixEn: "", labelAr: "مزارع نشط", labelEn: "Active farmers" },
    { value: 0, suffixAr: "", suffixEn: "", labelAr: "مورد موثوق", labelEn: "Trusted vendors" },
    { value: 0, suffixAr: "", suffixEn: "", labelAr: "منتج زراعي", labelEn: "Agri products" },
    { value: 0, suffixAr: "%", suffixEn: "%", labelAr: "رضا العملاء", labelEn: "Customer satisfaction" },
  ],
};

const HERO_STATS_SETTING_KEY = "hero_stats_settings";

export async function getHeroStatsSettings(): Promise<HeroStatsSettings> {
  const db = await getDb();
  if (!db) return DEFAULT_HERO_STATS_SETTINGS;
  const rows = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, HERO_STATS_SETTING_KEY))
    .limit(1);
  if (!rows[0]?.value) return DEFAULT_HERO_STATS_SETTINGS;
  try {
    const parsed = JSON.parse(rows[0].value) as Partial<HeroStatsSettings>;
    if (!Array.isArray(parsed.stats) || parsed.stats.length !== 4) {
      return DEFAULT_HERO_STATS_SETTINGS;
    }
    return {
      enabled: parsed.enabled ?? true,
      stats: parsed.stats.map((stat, index) => ({
        value: Number.isFinite(stat.value) ? Number(stat.value) : DEFAULT_HERO_STATS_SETTINGS.stats[index].value,
        suffixAr: typeof stat.suffixAr === "string" ? stat.suffixAr : DEFAULT_HERO_STATS_SETTINGS.stats[index].suffixAr,
        suffixEn: typeof stat.suffixEn === "string" ? stat.suffixEn : DEFAULT_HERO_STATS_SETTINGS.stats[index].suffixEn,
        labelAr: stat.labelAr?.trim() || DEFAULT_HERO_STATS_SETTINGS.stats[index].labelAr,
        labelEn: stat.labelEn?.trim() || DEFAULT_HERO_STATS_SETTINGS.stats[index].labelEn,
      })),
    };
  } catch (error) {
    console.warn("[Database] Failed to parse hero stats setting:", error);
    return DEFAULT_HERO_STATS_SETTINGS;
  }
}

export async function setHeroStatsSettings(settings: HeroStatsSettings): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const payload = JSON.stringify(settings);
  await db
    .insert(platformSettings)
    .values({ key: HERO_STATS_SETTING_KEY, value: payload })
    .onDuplicateKeyUpdate({ set: { value: payload } });
}
