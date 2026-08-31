import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: "usr_sample123",
    email: "sample@example.com",
    name: "Sample User",
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.logout", () => {
  it("reports success on logout", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });
});
