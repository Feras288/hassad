import { describe, expect, it } from "vitest";
import { mergeRecentSearches } from "../client/src/lib/recentSearches";

describe("recent searches", () => {
  it("يضيف البحث الجديد في المقدمة ويحذف التكرار دون حساسية لحالة الأحرف", () => {
    expect(mergeRecentSearches(["الأسمدة", "بذور"], " الأسمدة ")).toEqual(["الأسمدة", "بذور"]);
  });

  it("لا يحفظ بحثاً فارغاً ويلتزم بالحد الأقصى للسجل", () => {
    expect(mergeRecentSearches(["أ", "ب", "ج"], "", 2)).toEqual(["أ", "ب"]);
    expect(mergeRecentSearches(["ب", "ج", "د"], "أ", 3)).toEqual(["أ", "ب", "ج"]);
  });
});
