import { describe, expect, it } from "vitest";
import { getNewVendorQuestionToastCandidates } from "../client/src/lib/vendorNotificationToasts";

const notification = {
  id: "vnt_question_1",
  type: "product_question" as const,
  title: "سؤال جديد عن أحد منتجاتك",
  message: "لديك سؤال جديد عن أحد المنتجات.",
};

describe("vendor notification toast candidates", () => {
  it("يكتشف سؤالاً جديداً غير مرئي سابقاً لعرض التنبيه المنبثق", () => {
    expect(getNewVendorQuestionToastCandidates([notification], new Set(), { productQuestionEnabled: true, inAppToastEnabled: true })).toEqual([notification]);
  });

  it("لا يعيد الإشعار الذي سبق عرضه ولا يعرضه عند إيقاف أي تفضيل", () => {
    expect(getNewVendorQuestionToastCandidates([notification], new Set([notification.id]), { productQuestionEnabled: true, inAppToastEnabled: true })).toEqual([]);
    expect(getNewVendorQuestionToastCandidates([notification], new Set(), { productQuestionEnabled: false, inAppToastEnabled: true })).toEqual([]);
    expect(getNewVendorQuestionToastCandidates([notification], new Set(), { productQuestionEnabled: true, inAppToastEnabled: false })).toEqual([]);
  });
});
