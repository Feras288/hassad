import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("runtime mock-data cleanup", () => {
  it("keeps the marketplace, dashboard, support, and diagnosis screens free of legacy demo records", () => {
    const runtimeSources = [
      "client/src/pages/MarketplacePage.tsx",
      "client/src/pages/admin/AdminReports.tsx",
      "client/src/pages/admin/AdminSupport.tsx",
      "client/src/pages/dashboard/DashboardHome.tsx",
      "client/src/pages/SupplierPending.tsx",
      "client/src/pages/DiagnosisPage.tsx",
      "client/src/components/diagnosis/DiagnosisUploader.tsx",
      "client/src/contexts/MessagesContext.tsx",
      "client/src/contexts/LoyaltyContext.tsx",
      "server/db.ts",
    ].map(projectFile).join("\n");

    [
      "const allProducts: Product[] = [",
      "const topVendors = [",
      "supportTickets",
      "SEED_MESSAGES",
      "شركة الأمل للمستلزمات الزراعية",
      "getRandomDiagnosis",
      "SAMPLE_IMAGES",
      "DEMO_TRANSACTIONS",
      "seedConversations",
      "seedCatalogProductsFromLegacyData",
    ].forEach((legacyMarker) => expect(runtimeSources).not.toContain(legacyMarker));
  });
});
