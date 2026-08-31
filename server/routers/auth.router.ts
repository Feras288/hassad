import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../_core/auth";
import {
  getAccountLanguagePreference,
  getHeroStatsSettings,
  getPlatformDefaultLanguage,
  setHeroStatsSettings,
  setPlatformDefaultLanguage,
  updateAccountLanguagePreference,
} from "../db";
import { z } from "zod";

const heroStatSettingSchema = z.object({
  value: z.number().int().min(0).max(10_000_000),
  suffixAr: z.string().trim().max(16),
  suffixEn: z.string().trim().max(16),
  labelAr: z.string().trim().min(1).max(80),
  labelEn: z.string().trim().min(1).max(80),
});

const heroStatsSettingsSchema = z.object({
  enabled: z.boolean(),
  stats: z.array(heroStatSettingSchema).length(4),
});

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    try {
      await auth.api.signOut({
        headers: fromNodeHeaders(ctx.req.headers),
      });
    } catch {
      // Ignore if session already signed out
    }
    return {
      success: true,
    } as const;
  }),
});

export const accountPreferencesRouter = router({
  language: protectedProcedure.query(({ ctx }) =>
    getAccountLanguagePreference(ctx.user.id)
  ),
  updateLanguage: protectedProcedure
    .input(z.object({ preferredLanguage: z.enum(["ar", "en"]) }))
    .mutation(({ ctx, input }) =>
      updateAccountLanguagePreference(ctx.user.id, input.preferredLanguage)
    ),
});

export const platformPreferencesRouter = router({
  defaultRegistrationLanguage: adminProcedure.query(() =>
    getPlatformDefaultLanguage()
  ),
  updateDefaultRegistrationLanguage: adminProcedure
    .input(z.object({ preferredLanguage: z.enum(["ar", "en"]) }))
    .mutation(({ input }) =>
      setPlatformDefaultLanguage(input.preferredLanguage)
    ),
  heroStats: publicProcedure.query(() => getHeroStatsSettings()),
  updateHeroStats: adminProcedure
    .input(heroStatsSettingsSchema)
    .mutation(({ input }) => setHeroStatsSettings(input)),
});
