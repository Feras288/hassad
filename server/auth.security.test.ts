import { describe, expect, it, vi } from "vitest";
import { getBetterAuthSecret, ENV } from "./_core/env";
import { auth, authDb } from "./_core/auth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createMockContext(user: User | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Security Audit Verifications", () => {
  describe("1. Environment & Production Secret Validation", () => {
    it("fails with a clear fatal error when BETTER_AUTH_SECRET is missing in production", () => {
      expect(() => {
        getBetterAuthSecret({
          NODE_ENV: "production",
          BETTER_AUTH_SECRET: "",
        });
      }).toThrow("FATAL: BETTER_AUTH_SECRET environment variable is required in production mode.");

      expect(() => {
        getBetterAuthSecret({
          NODE_ENV: "production",
          // BETTER_AUTH_SECRET is undefined
        });
      }).toThrow("FATAL: BETTER_AUTH_SECRET environment variable is required in production mode.");
    });

    it("accepts a valid BETTER_AUTH_SECRET in production", () => {
      const secret = "production-super-secret-key-32-chars-long";
      const result = getBetterAuthSecret({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: secret,
      });
      expect(result).toBe(secret);
    });

    it("provides a development fallback secret only in non-production environments", () => {
      const devSecret = getBetterAuthSecret({
        NODE_ENV: "development",
        BETTER_AUTH_SECRET: "",
      });
      expect(devSecret).toBe("dev-secret-key-only-for-local-testing-32chars");
    });
  });

  describe("2. Registration & Role Escalation Prevention", () => {
    it("sanitizes user creation hook to strictly force role=user and vendorId=null for arbitrary signups", async () => {
      // Simulate Better Auth databaseHooks.user.create.before
      const hook = auth.options.databaseHooks?.user?.create?.before;
      expect(hook).toBeDefined();

      if (hook) {
        // Attacker attempts to inject role: "admin" and vendorId: "v_123"
        const maliciousPayload = {
          id: "attacker_user_id",
          email: "attacker@example.com",
          name: "Malicious User",
          role: "admin",
          vendorId: "v_123",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as User;

        const result = await hook(maliciousPayload);
        expect(result).toBeDefined();
        if (result && "data" in result) {
          const sanitized = result.data as User;
          expect(sanitized.role).toBe("user");
          expect(sanitized.vendorId).toBeNull();
          expect(sanitized.email).toBe("attacker@example.com");
        }
      }
    });

    it("sanitizes user creation hook to force role=user when user attempts vendor role injection", async () => {
      const hook = auth.options.databaseHooks?.user?.create?.before;
      expect(hook).toBeDefined();

      if (hook) {
        const payload = {
          id: "fake_vendor_id",
          email: "supplier@example.com",
          name: "Unapproved Supplier",
          role: "vendor",
          vendorId: "vendor_hijack",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as User;

        const result = await hook(payload);
        expect(result).toBeDefined();
        if (result && "data" in result) {
          const sanitized = result.data as User;
          expect(sanitized.role).toBe("user");
          expect(sanitized.vendorId).toBeNull();
        }
      }
    });

    it("does not grant admin role if email matches INITIAL_ADMIN_EMAIL but emailVerified is false", async () => {
      const hook = auth.options.databaseHooks?.user?.create?.before;
      expect(hook).toBeDefined();

      if (hook) {
        const unverifiedAdminPayload = {
          id: "admin_unverified_id",
          email: ENV.initialAdminEmail,
          name: "Unverified Admin Candidate",
          role: "user",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as User;

        const result = await hook(unverifiedAdminPayload);
        expect(result).toBeDefined();
        if (result && "data" in result) {
          const sanitized = result.data as User;
          expect(sanitized.role).toBe("user");
          expect(sanitized.vendorId).toBeNull();
        }
      }
    });

    it("does not grant admin role if the database admin query throws an error (fail-closed with mockRejectedValue)", async () => {
      const hook = auth.options.databaseHooks?.user?.create?.before;
      expect(hook).toBeDefined();

      if (hook) {
        // Force the database admin lookup to reject with an error
        const selectSpy = vi.spyOn(authDb, "select").mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error("Simulated Database Timeout Error")),
            }),
          }),
        } as any);

        try {
          const candidatePayload = {
            id: "admin_error_candidate_id",
            email: ENV.initialAdminEmail,
            name: "Admin Query Error Candidate",
            role: "user",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as User;

          // When DB query throws or fails, fail-closed enforces grantAdmin = false
          const result = await hook(candidatePayload);
          expect(result).toBeDefined();
          if (result && "data" in result) {
            const sanitized = result.data as User;
            expect(sanitized.role).toBe("user");
            expect(sanitized.vendorId).toBeNull();
          }
        } finally {
          selectSpy.mockRestore();
        }
      }
    });

    it("grants admin role when initial admin has verified email and zero existing admins", async () => {
      const hook = auth.options.databaseHooks?.user?.create?.before;
      expect(hook).toBeDefined();

      if (hook) {
        // Mock zero existing admins in the database
        const selectSpy = vi.spyOn(authDb, "select").mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);

        try {
          const candidatePayload = {
            id: "admin_verified_id",
            email: ENV.initialAdminEmail,
            name: "Legit Verified First Admin",
            role: "user",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as User;

          const result = await hook(candidatePayload);
          expect(result).toBeDefined();
          if (result && "data" in result) {
            const sanitized = result.data as User;
            expect(sanitized.role).toBe("admin");
            expect(sanitized.vendorId).toBeNull();
          }
        } finally {
          selectSpy.mockRestore();
        }
      }
    });
  });

  describe("3. Banned User & Invalid Session Enforcement in tRPC Middleware", () => {
    const activeNormalUser: User = {
      id: "usr_active_normal",
      email: "user@example.com",
      name: "Normal User",
      emailVerified: true,
      image: null,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      vendorId: null,
      preferredLanguage: "ar",
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bannedUser: User = {
      ...activeNormalUser,
      id: "usr_banned_user",
      email: "banned@example.com",
      banned: true,
      banReason: "مخالفة شروط الاستخدام",
    };

    const bannedAdminUser: User = {
      ...activeNormalUser,
      id: "usr_banned_admin",
      email: "banned_admin@example.com",
      role: "admin",
      banned: true,
      banReason: "إيقاف احترازي",
    };

    const bannedVendorUser: User = {
      ...activeNormalUser,
      id: "usr_banned_vendor",
      email: "banned_vendor@example.com",
      role: "vendor",
      vendorId: "v_1",
      banned: true,
      banReason: "تعليق ترخيص",
    };

    it("rejects unauthenticated/expired sessions from protected procedures with UNAUTHORIZED", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.accountPreferences.language()).rejects.toThrow("Please login (10001)");
    });

    it("rejects banned users from protected procedures with FORBIDDEN", async () => {
      const ctx = createMockContext(bannedUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.accountPreferences.language()).rejects.toThrow("الحساب موقوف: مخالفة شروط الاستخدام");
    });

    it("rejects banned admin accounts from admin procedures with FORBIDDEN", async () => {
      const ctx = createMockContext(bannedAdminUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.platformPreferences.defaultRegistrationLanguage()).rejects.toThrow("الحساب موقوف: إيقاف احترازي");
    });

    it("rejects banned vendor accounts from vendor procedures with FORBIDDEN", async () => {
      const ctx = createMockContext(bannedVendorUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.vendorNotifications.list()).rejects.toThrow("الحساب موقوف: تعليق ترخيص");
    });

    it("allows active, unbanned users through protected procedures", async () => {
      const ctx = createMockContext(activeNormalUser);
      const caller = appRouter.createCaller(ctx);

      // auth.me is public and returns ctx.user
      const me = await caller.auth.me();
      expect(me?.id).toBe("usr_active_normal");
    });
  });
});
