import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("طبقات السلة الجانبية", () => {
  it("تظهر السلة وطبقة التعتيم فوق هيدر الموقع", () => {
    const drawer = readFileSync(resolve(process.cwd(), "client/src/components/CartDrawer.tsx"), "utf8");
    expect(drawer).toContain('z-[70]');
    expect(drawer).toContain('z-[80]');
    expect(drawer).toContain('aria-modal="true"');
  });

  it("يدعم إغلاق السلة بلوحة المفاتيح مع انتقال مناسب للجوال", () => {
    const drawer = readFileSync(resolve(process.cwd(), "client/src/components/CartDrawer.tsx"), "utf8");
    expect(drawer).toContain('event.key === "Escape"');
    expect(drawer).toContain('window.addEventListener("keydown", handleKeyDown)');
    expect(drawer).toContain('onClick={isCartOpen ? closeCart : undefined}');
    expect(drawer).toContain('transform-gpu');
    expect(drawer).toContain('motion-reduce:transition-none');
  });
});
