import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─────────────────────────────────────────────────────────────────────────────
// Authorization Matrix Definitions (4-Tier Architecture)
// ─────────────────────────────────────────────────────────────────────────────

export const PUBLIC_PATHS = [
  "system.health",
  "auth.me",
  "auth.logout",
  "platformPreferences.heroStats",
  "serviceProviders.list",
  "serviceProviders.byId",
  "produceMarketplace.enabled",
  "produceMarketplace.listings",
  "contactInquiries.create",
  "contentArticles.publicList",
  "contentArticles.byId",
  "contentArticles.related",
  "contentArticles.mostRead",
  "contentArticles.recordView",
  "products.featured",
  "products.list",
  "products.suggestions",
  "products.byId",
  "productAvailabilityRequests.create",
  "productQuestions.publicList",
  "productQuestions.ask",
  "productQuestions.rateAnswer",
] as const;

export const AUTHENTICATED_PATHS = [
  "accountPreferences.language",
  "accountPreferences.updateLanguage",
  "serviceBookings.create",
  "serviceBookings.mine",
  "serviceBookings.cancel",
  "serviceMessaging.conversations",
  "serviceMessaging.open",
  "serviceMessaging.messages",
  "serviceMessaging.send",
  "serviceMessaging.markRead",
  "produceMarketplace.buyerProfile",
  "produceMarketplace.applyAsBuyer",
  "produceMarketplace.myListings",
  "produceMarketplace.createListing",
  "produceMarketplace.updateListing",
  "produceMarketplace.requestQuote",
  "produceMarketplace.buyerQuoteRequests",
  "produceMarketplace.farmerQuoteRequests",
  "produceMarketplace.quoteMessages",
  "produceMarketplace.markQuoteMessagesRead",
  "produceMarketplace.quoteNotifications",
  "produceMarketplace.markQuoteNotificationRead",
  "produceMarketplace.sendQuoteMessage",
  "produceMarketplace.updateQuoteStatus",
  "produceMarketplace.uploadListingImage",
  "produceMarketplace.uploadQualityCertificate",
  "orders.create",
  "orders.mine",
  "orders.mineById",
  "orders.rateDelivery",
  "orders.requestCancellation",
  "orders.notifications.mine",
  "orders.notifications.setRead",
] as const;

export const VENDOR_PATHS = [
  "serviceBookings.providerMine",
  "serviceBookings.updateStatus",
  "productQuestions.vendorList",
  "productQuestions.dailySummary",
  "productQuestions.answer",
  "vendorNotifications.list",
  "vendorNotifications.markRead",
  "vendorNotifications.markUnread",
  "vendorNotifications.markAllRead",
  "vendorNotifications.delete",
  "vendorNotifications.clear",
  "vendorNotificationPreferences.get",
  "vendorNotificationPreferences.update",
  "orders.vendorList",
  "orders.vendorUpdateTracking",
  "orders.vendorReviewCancellation",
  "orders.vendorCancellationNotifications.list",
  "orders.vendorCancellationNotifications.setRead",
] as const;

export const ADMIN_PATHS = [
  "system.notifyOwner",
  "platformPreferences.defaultRegistrationLanguage",
  "platformPreferences.updateDefaultRegistrationLanguage",
  "platformPreferences.updateHeroStats",
  "produceMarketplace.adminBuyerProfiles",
  "produceMarketplace.adminUpdateBuyerStatus",
  "produceMarketplace.updateEnabled",
  "contactInquiries.adminList",
  "contactInquiries.adminUpdate",
  "adminNotifications.list",
  "adminNotifications.history",
  "adminNotifications.setRead",
  "adminNotifications.markAllRead",
  "contentArticles.adminList",
  "contentArticles.create",
  "contentArticles.update",
  "contentArticles.uploadCover",
  "contentArticles.uploadInlineImage",
  "contentArticles.archive",
  "contentArticles.delete",
  "adminManagement.uploadImage",
  "adminManagement.vendors.list",
  "adminManagement.vendors.create",
  "adminManagement.vendors.update",
  "adminManagement.vendors.delete",
  "adminManagement.categories.list",
  "adminManagement.categories.create",
  "adminManagement.categories.update",
  "adminManagement.categories.delete",
  "adminManagement.users.list",
  "adminManagement.users.create",
  "adminManagement.users.update",
  "products.adminList",
  "products.create",
  "products.update",
  "products.changeStatus",
  "products.delete",
  "productAvailabilityRequests.adminList",
  "productAvailabilityRequests.matches",
  "productAvailabilityRequests.update",
  "vendorAccounts.adminList",
  "vendorAccounts.link",
  "orders.adminList",
  "orders.adminCreate",
  "orders.adminUpdateStatus",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Context Helpers
// ─────────────────────────────────────────────────────────────────────────────

const nullContext = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
});

const userContext = (): TrpcContext => ({
  user: {
    id: "usr_matrix_regular_user",
    email: "user@hassad.net",
    name: "مستخدم عادي",
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
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
});

const vendorContext = (): TrpcContext => ({
  user: {
    id: "usr_matrix_vendor",
    email: "vendor@hassad.net",
    name: "مورد اختبار",
    emailVerified: true,
    image: null,
    role: "vendor",
    banned: false,
    banReason: null,
    banExpires: null,
    vendorId: "vendor-matrix",
    preferredLanguage: "ar",
    loginMethod: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
});

function getCallerProcedure(caller: any, path: string): (...args: any[]) => Promise<any> {
  const parts = path.split(".");
  let curr: any = caller;
  for (const part of parts) {
    if (curr === undefined || curr === null) {
      throw new Error(`Cannot access property "${part}" of ${curr} on path "${path}"`);
    }
    curr = curr[part];
  }
  if (typeof curr !== "function") {
    throw new Error(`Resolved target for path "${path}" is not a function`);
  }
  return curr;
}

async function invokeProcedure(caller: any, path: string): Promise<any> {
  const proc = getCallerProcedure(caller, path);
  return proc(undefined);
}

// ─────────────────────────────────────────────────────────────────────────────
// Authorization Matrix Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe("Authorization Matrix & Procedure Security Enforcement", () => {
  it("extracts all procedures programmatically and validates complete 4-tier matrix coverage", () => {
    const allProcedures = Object.keys(appRouter._def.procedures || {}).sort();
    
    // Print the extracted structure
    console.log(`[Authorization Matrix] Total registered procedures in appRouter: ${allProcedures.length}`);
    console.log(JSON.stringify(allProcedures, null, 2));

    const publicSet = new Set<string>(PUBLIC_PATHS);
    const authSet = new Set<string>(AUTHENTICATED_PATHS);
    const vendorSet = new Set<string>(VENDOR_PATHS);
    const adminSet = new Set<string>(ADMIN_PATHS);

    const allDefinedPaths = new Set([
      ...PUBLIC_PATHS,
      ...AUTHENTICATED_PATHS,
      ...VENDOR_PATHS,
      ...ADMIN_PATHS,
    ]);

    const unlistedPaths = allProcedures.filter((path) => !allDefinedPaths.has(path as any));
    expect(
      unlistedPaths,
      `The following tRPC procedures are defined in appRouter but missing from authorization lists: ${unlistedPaths.join(", ")}`
    ).toEqual([]);

    const extraPaths = Array.from(allDefinedPaths).filter((path) => !allProcedures.includes(path));
    expect(
      extraPaths,
      `The following paths are defined in the matrix but do not exist in appRouter: ${extraPaths.join(", ")}`
    ).toEqual([]);

    // Check for overlap across all 4 categories
    const overlaps = [
      ...PUBLIC_PATHS.filter((p) => authSet.has(p) || vendorSet.has(p) || adminSet.has(p)),
      ...AUTHENTICATED_PATHS.filter((p) => vendorSet.has(p) || adminSet.has(p)),
      ...VENDOR_PATHS.filter((p) => adminSet.has(p)),
    ];
    expect(overlaps, `Overlapping procedures across categories: ${overlaps.join(", ")}`).toEqual([]);
  });

  describe("ADMIN_PATHS security enforcement", () => {
    ADMIN_PATHS.forEach((path) => {
      describe(`Path: ${path}`, () => {
        it("rejects unauthenticated requests (nullContext) with UNAUTHORIZED", async () => {
          const caller = appRouter.createCaller(nullContext());
          let caughtError: any = null;
          try {
            await invokeProcedure(caller, path);
          } catch (err: any) {
            caughtError = err;
          }

          expect(caughtError, `Expected ${path} with nullContext to throw an error`).toBeDefined();
          expect(caughtError?.code, `Expected ${path} to fail with code UNAUTHORIZED, got: ${caughtError?.code}`).toBe("UNAUTHORIZED");
        });

        it("rejects non-admin authenticated requests (vendorContext) with FORBIDDEN", async () => {
          const caller = appRouter.createCaller(vendorContext());
          let caughtError: any = null;
          try {
            await invokeProcedure(caller, path);
          } catch (err: any) {
            caughtError = err;
          }

          expect(caughtError, `Expected ${path} with vendorContext to throw an error`).toBeDefined();
          expect(caughtError?.code, `Expected ${path} to fail with code FORBIDDEN, got: ${caughtError?.code}`).toBe("FORBIDDEN");
        });
      });
    });
  });

  describe("VENDOR_PATHS security enforcement", () => {
    VENDOR_PATHS.forEach((path) => {
      describe(`Path: ${path}`, () => {
        it("rejects unauthenticated requests (nullContext) with UNAUTHORIZED", async () => {
          const caller = appRouter.createCaller(nullContext());
          let caughtError: any = null;
          try {
            await invokeProcedure(caller, path);
          } catch (err: any) {
            caughtError = err;
          }

          expect(caughtError, `Expected ${path} with nullContext to throw an error`).toBeDefined();
          expect(caughtError?.code, `Expected ${path} to fail with code UNAUTHORIZED, got: ${caughtError?.code}`).toBe("UNAUTHORIZED");
        });

        it("rejects regular user requests without vendorId (userContext) with FORBIDDEN", async () => {
          const caller = appRouter.createCaller(userContext());
          let caughtError: any = null;
          try {
            await invokeProcedure(caller, path);
          } catch (err: any) {
            caughtError = err;
          }

          expect(caughtError, `Expected ${path} with userContext to throw an error`).toBeDefined();
          expect(caughtError?.code, `Expected ${path} to fail with code FORBIDDEN, got: ${caughtError?.code}`).toBe("FORBIDDEN");
        });
      });
    });
  });

  describe("AUTHENTICATED_PATHS security enforcement", () => {
    AUTHENTICATED_PATHS.forEach((path) => {
      it(`rejects unauthenticated requests (nullContext) for ${path} with UNAUTHORIZED`, async () => {
        const caller = appRouter.createCaller(nullContext());
        let caughtError: any = null;
        try {
          await invokeProcedure(caller, path);
        } catch (err: any) {
          caughtError = err;
        }

        expect(caughtError, `Expected ${path} with nullContext to throw an error`).toBeDefined();
        expect(caughtError?.code, `Expected ${path} to fail with code UNAUTHORIZED, got: ${caughtError?.code}`).toBe("UNAUTHORIZED");
      });
    });
  });
});
