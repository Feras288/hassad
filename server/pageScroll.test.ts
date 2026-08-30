import { describe, expect, it, vi } from "vitest";
import { scrollPageToTop } from "../client/src/lib/pageScroll";

describe("page scroll reset", () => {
  it("يعيد الصفحة إلى أعلى الإحداثيات دون حركة انتقالية", () => {
    const scrollTo = vi.fn();
    scrollPageToTop({ scrollTo } as Window);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
