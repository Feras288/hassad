import { describe, expect, it } from "vitest";
import { matchActiveSuppliers } from "./db";

describe("matchActiveSuppliers", () => {
  it("يعيد قائمة نتائج آمنة من المصدر الحي عند عدم توفر قاعدة البيانات", async () => {
    const matches = await matchActiveSuppliers("بذور قمح محسنة", "القصيم");
    expect(Array.isArray(matches)).toBe(true);
  });

  it("لا يعيد قيماً ثابتة عند عدم وجود موردين مطابقين", async () => {
    const matches = await matchActiveSuppliers("نظام ري بالتنقيط", "الدمام");
    expect(matches).toEqual([]);
  });
});
