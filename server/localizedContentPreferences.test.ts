import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("المحتوى الإنكليزي وتفضيلات اللغة المحفوظة", () => {
  it("يخزن حقول المحتوى الإنكليزي للمنتجات والمقالات وتفضيل المستخدم", () => {
    const schema = source("drizzle/schema.ts");
    const migration = source("drizzle/0021_sharp_spectrum.sql");
    expect(schema).toContain('preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "en"])');
    expect(schema).toContain('shortDescEn: text("shortDescEn")');
    expect(schema).toContain('longDescEn: text("longDescEn")');
    expect(schema).toContain('contentEn: text("contentEn")');
    expect(schema).toContain('tagsEn: json("tagsEn")');
    expect(migration).toContain('ALTER TABLE `catalog_products` ADD `shortDescEn` text;');
  });

  it("يعرض حقول الإنجليزية صراحة في نموذج إدارة المنتج والمقال", () => {
    const products = source("client/src/pages/admin/AdminProducts.tsx");
    const articles = source("client/src/pages/admin/AdminArticles.tsx");
    expect(products).toContain("English product content");
    expect(products).toContain("English specifications");
    expect(articles).toContain("English content");
    expect(articles).toContain("English article HTML");
  });

  it("يعرض المحتوى الإنكليزي المعتمد في صفحات المنتج والمقالات", () => {
    const productDetail = source("client/src/pages/ProductDetail.tsx");
    const articleDetail = source("client/src/pages/StoryArticlePage.tsx");
    const articleList = source("client/src/pages/StoriesPage.tsx");
    expect(productDetail).toContain("productSource.shortDescEn");
    expect(articleDetail).toContain("item.contentEn?.trim()");
    expect(articleList).toContain("article.titleEn?.trim()");
  });

  it("يحفظ تفضيل اللغة عبر الحساب ويعرضه في إعدادات العميل والمورد", () => {
    const context = source("client/src/contexts/LanguageContext.tsx");
    const profile = source("client/src/pages/dashboard/DashboardProfile.tsx");
    const vendorSettings = source("client/src/pages/vendor/VendorSettings.tsx");
    const app = source("client/src/App.tsx");
    expect(context).toContain("accountPreferences.updateLanguage");
    expect(context).toContain("accountPreferences.language");
    expect(profile).toContain("لغة العرض");
    expect(vendorSettings).toContain('value={language}');
    expect(app).toContain('path="/dashboard/settings"');
  });
});
