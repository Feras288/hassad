import { describe, expect, it } from "vitest";
import { getPendingQuestionPriority, QUESTION_RESPONSE_SLA_HOURS } from "../client/src/lib/questionResponsePriority";

describe("question response priority", () => {
  const now = new Date("2026-08-14T12:00:00Z");

  it("لا يصنف السؤال كمتأخر قبل مرور 24 ساعة كاملة", () => {
    const priority = getPendingQuestionPriority(new Date("2026-08-13T12:01:00Z"), now);
    expect(priority).toEqual({ elapsedHours: 23, isOverdue: false });
  });

  it("يصنف السؤال كمتأخر عند تجاوز مهلة الرد المحددة", () => {
    const priority = getPendingQuestionPriority(new Date("2026-08-13T11:00:00Z"), now);
    expect(priority.elapsedHours).toBe(25);
    expect(priority.isOverdue).toBe(true);
    expect(QUESTION_RESPONSE_SLA_HOURS).toBe(24);
  });
});
