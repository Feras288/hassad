import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const publicPages = [
  "FooterInfoPage.tsx",
  "ContactPage.tsx",
  "HelpCenterPage.tsx",
  "StoriesPage.tsx",
  "StoryArticlePage.tsx",
  "ProviderProfile.tsx",
  "DiagnosisPage.tsx",
];

describe("محاذاة صفحات المحتوى ومقدمي الخدمات", () => {
  it("لا تضيف تعويضاً علوياً زائداً بعد الهيدر العام", () => {
    for (const file of publicPages) {
      const page = readFileSync(resolve(process.cwd(), "client/src/pages", file), "utf8");
      expect(page).not.toMatch(/<main className="pt-(?:16|20)"/);
    }
  });
});
