import { describe, expect, it } from "vitest";
import { filterHelpFaqs, HELP_FAQS, normalizeHelpSearch } from "../client/src/lib/helpCenterFaq";

describe("help center FAQ search", () => {
  it("يطابق البحث العربي بعد توحيد صيغ الحروف", () => {
    expect(normalizeHelpSearch("إرجاع")).toBe("ارجاع");
    expect(filterHelpFaqs(HELP_FAQS, "ارجاع", "الكل").map((faq) => faq.id)).toContain("return");
  });

  it("يجمع بين البحث وفئة السؤال", () => {
    expect(filterHelpFaqs(HELP_FAQS, "", "الخدمات").every((faq) => faq.category === "الخدمات")).toBe(true);
    expect(filterHelpFaqs(HELP_FAQS, "كلمة المرور", "الحساب").map((faq) => faq.id)).toEqual(["account-help"]);
  });
});
