/*
 * HASAAD PLATFORM — Cart Drawer
 * Slide-in cart panel from the right side
 * Shows items, quantities, totals, and quick actions
 */
import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import {
  ShoppingCart, X, Trash2, Plus, Minus, Tag, ChevronLeft, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getTieredUnitPrice } from "@/lib/tierPricing";
import TierDiscountProgress from "@/components/TierDiscountProgress";
import { useSwipeToClose } from "@/hooks/useSwipeToClose";

function formatPrice(n: number) {
  return n.toLocaleString("ar-SA") + " ريال";
}

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    tierSavings,
    discount,
    shippingCost,
    vat,
    total,
    appliedCoupon,
    cartCount,
  } = useCart();
  const cartSwipe = useSwipeToClose({
    enabled: isCartOpen,
    axis: "x",
    closeDirection: -1,
    onClose: closeCart,
  });

  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isCartOpen}
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={isCartOpen ? closeCart : undefined}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        {...cartSwipe.swipeHandlers}
        style={cartSwipe.swipeStyle}
        className={`fixed top-0 left-0 z-[80] flex h-[100dvh] w-full flex-col bg-white shadow-2xl transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform motion-reduce:transition-none sm:w-[420px] ${
          isCartOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-l from-[#2E7D32]/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">سلة التسوق</h2>
              {cartCount > 0 && (
                <p className="text-xs text-gray-500">{cartCount} منتج</p>
              )}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-lg">السلة فارغة</p>
                <p className="text-sm text-gray-400 mt-1">أضف منتجات من السوق الزراعي</p>
              </div>
              <Button
                onClick={closeCart}
                asChild
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl px-6"
              >
                <Link href="/marketplace">تصفح المنتجات</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                  {/* Image */}
                  <Link href={`/product/${item.id}`} onClick={closeCart}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`} onClick={closeCart}>
                      <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 hover:text-[#2E7D32] transition-colors">
                        {item.name}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.unit}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#2E7D32] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-gray-800 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#2E7D32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#2E7D32]">
                          {formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item) * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">{formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item))} / وحدة</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2"><TierDiscountProgress tiers={item.priceTiers} quantity={item.quantity} unit={item.unit} tierPricingStartsAt={item.tierPricingStartsAt} tierPricingEndsAt={item.tierPricingEndsAt} compact /></div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50/80 px-5 py-4 space-y-3">
            {/* Coupon badge if applied */}
            {appliedCoupon && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium flex-1">{appliedCoupon.label}</span>
                <Badge className="bg-green-600 text-white text-[10px] px-1.5">مفعّل</Badge>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {tierSavings > 0 && <div className="flex justify-between text-green-600"><span>خصم الكمية</span><span className="font-medium">- {formatPrice(tierSavings)}</span></div>}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span className="font-medium">- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span className={shippingCost === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {shippingCost === 0 ? "مجاني" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span className="font-medium">{formatPrice(vat)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold text-gray-900 pt-0.5">
                <span>الإجمالي</span>
                <span className="text-[#2E7D32]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Free shipping hint */}
            {shippingCost > 0 && (
              <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-1.5 px-3">
                أضف {formatPrice(300 - (subtotal - discount))} لتحصل على شحن مجاني
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={closeCart}
                asChild
                className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <Link href="/cart">
                  <span>عرض السلة</span>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Link>
              </Button>
              <Button
                onClick={closeCart}
                asChild
                className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold"
              >
                <Link href="/checkout">إتمام الشراء</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
