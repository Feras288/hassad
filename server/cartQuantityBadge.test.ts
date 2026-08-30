import { describe, expect, it } from "vitest";
import { formatCartQuantityBadge } from "../client/src/lib/cartQuantityBadge";

describe("cart quantity badge", () => {
  it("لا يعرض شارة عند عدم وجود كمية في السلة", () => {
    expect(formatCartQuantityBadge(0)).toBeNull();
    expect(formatCartQuantityBadge(-1)).toBeNull();
  });

  it("يعرض كمية المنتج بالأرقام العربية", () => {
    expect(formatCartQuantityBadge(3)).toBe("٣");
    expect(formatCartQuantityBadge(12)).toBe("١٢");
  });
});
