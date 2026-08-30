/*
 * HASAAD PLATFORM — Cart Page (/cart)
 * Full cart management: quantities, coupon codes, totals
 * Design: Clean, professional, agriculture-themed
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import Navbar from "@/components/Navbar";
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, X, ChevronLeft,
  Heart, ArrowRight, ShoppingBag, Truck, Shield, RotateCcw, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { calculateTierSavings, getNextTierProgress, getTieredUnitPrice } from "@/lib/tierPricing";
import TierDiscountProgress from "@/components/TierDiscountProgress";

function formatPrice(n: number) {
  return n.toLocaleString("ar-SA") + " ريال";
}

function CartTierSuggestionListener() {
  const { items, updateQuantity } = useCart();

  useEffect(() => {
    const candidate = items.map((item) => ({ item, progress: getNextTierProgress(item.priceTiers, item.quantity, item) }))
      .find(({ item, progress }) => progress.nextTier && progress.nextTier.minQuantity <= item.stock);
    if (!candidate || !candidate.progress.nextTier) return;
    const { item, progress } = candidate;
    const suggestionKey = `hassad-tier-suggestion:${item.id}:${progress.nextTier.minQuantity}`;
    if (sessionStorage.getItem(suggestionKey)) return;
    sessionStorage.setItem(suggestionKey, "shown");
    toast("اقتربت من سعر الجملة التالي", {
      description: `أضف ${progress.remainingQuantity.toLocaleString("ar-SA")} ${item.unit} من «${item.name}» لتحصل على سعر ${progress.nextTier.unitPrice.toLocaleString("ar-SA")} ريال للوحدة.`,
      duration: 9_000,
      action: { label: "أضف الكمية", onClick: () => updateQuantity(item.id, progress.nextTier!.minQuantity) },
    });
  }, [items, updateQuantity]);

  return null;
}

export default function CartPage() {
  const {
    items, removeFromCart, updateQuantity, clearCart,
    subtotal, tierSavings, discount, shippingCost, vat, total,
    appliedCoupon, applyCoupon, removeCoupon, cartCount
  } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      toast.success("تم تطبيق كود الخصم بنجاح!");
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("كود الخصم غير صحيح أو منتهي الصلاحية");
    }
  };

  const handleMoveToFavorites = (item: typeof items[0]) => {
    toggleFavorite({
      id: item.id,
      name: item.name,
      price: item.priceFormatted,
      image: item.image,
      category: item.category,
      rating: 4.5,
      reviews: 0,
      addedAt: Date.now(),
    });
    removeFromCart(item.id);
    toast.success("تم نقل المنتج إلى المفضلة");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <CartTierSuggestionListener />
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8 md:pt-10">
        {/* Breadcrumb */}
        <div className="mb-5 hidden items-center gap-2 text-sm text-gray-500 sm:flex">
          <Link href="/" className="hover:text-[#2E7D32] transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link href="/marketplace" className="hover:text-[#2E7D32] transition-colors">السوق الزراعي</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium">سلة التسوق</span>
        </div>

        {/* Page Title */}
        <div className="mb-5 flex items-center justify-between sm:mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">سلة التسوق</h1>
            {cartCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">{cartCount} منتج في سلتك</p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { clearCart(); toast.success("تم تفريغ السلة"); }}
              className="flex min-h-10 items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700 sm:text-sm"
            >
              <Trash2 className="w-4 h-4" />
              تفريغ السلة
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-28 h-28 rounded-3xl bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-14 h-14 text-gray-300" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">سلتك فارغة</h2>
              <p className="text-gray-400 mt-2 max-w-sm">
                لم تضف أي منتجات بعد. تصفح السوق الزراعي واكتشف أفضل المنتجات الزراعية
              </p>
            </div>
            <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl px-8 py-3 text-base">
              <Link href="/marketplace">
                <ShoppingCart className="w-5 h-5 ml-2" />
                تصفح المنتجات
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Trust Badges */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible">
                {[
                  { icon: Truck, label: "شحن مجاني فوق 300 ريال" },
                  { icon: Shield, label: "دفع آمن ومشفر" },
                  { icon: RotateCcw, label: "إرجاع مجاني خلال 14 يوم" },
                ].map((b) => (
                  <div key={b.label} className="flex min-w-[148px] items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:min-w-0">
                    <b.icon className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {items.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <Separator />}
                    <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                      {/* Image */}
                      <Link href={`/product/${item.id}`}>
                        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-20 sm:w-20">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/product/${item.id}`}>
                              <h3 className="font-semibold text-gray-800 hover:text-[#2E7D32] transition-colors line-clamp-2 text-sm leading-snug">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.unit}</p>
                            {item.vendorName && (
                              <p className="text-xs text-[#2E7D32] mt-0.5">المورد: {item.vendorName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          {/* Quantity */}
                          <div className="flex items-center gap-1.5 rounded-xl bg-gray-100 p-1 sm:gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#2E7D32] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#2E7D32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="shrink-0 text-left">
                            <p className="font-bold text-[#2E7D32] text-base">{formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item) * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400">{formatPrice(getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item))} / وحدة</p>
                            )}
                            {calculateTierSavings(item.price, item.priceTiers, item.quantity, item) > 0 && <p className="mt-0.5 text-xs font-bold text-green-600">وفّرت {formatPrice(calculateTierSavings(item.price, item.priceTiers, item.quantity, item))}</p>}
                          </div>
                        </div>
                        <div className="mt-3"><TierDiscountProgress tiers={item.priceTiers} quantity={item.quantity} unit={item.unit} tierPricingStartsAt={item.tierPricingStartsAt} tierPricingEndsAt={item.tierPricingEndsAt} compact /></div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleMoveToFavorites(item)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                            حفظ للمفضلة
                          </button>
                          {item.stock <= 5 && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              متبقي {item.stock} فقط
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link href="/marketplace" className="flex items-center gap-2 text-sm text-[#2E7D32] hover:text-[#1B5E20] font-medium transition-colors w-fit">
                <ArrowRight className="w-4 h-4" />
                متابعة التسوق
              </Link>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Coupon Code */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#2E7D32]" />
                  كود الخصم
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">{appliedCoupon.label}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="أدخل كود الخصم"
                        className="flex-1 rounded-xl border-gray-200 text-sm"
                        dir="ltr"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl px-4 text-sm"
                      >
                        تطبيق
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500">{couponError}</p>
                    )}
                    <p className="text-xs text-gray-400">جرب: HASAAD10 أو WELCOME50</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="font-bold text-gray-800 mb-4">ملخص الطلب</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>المجموع الفرعي ({cartCount} منتج)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {tierSavings > 0 && <div className="flex justify-between text-green-600"><span>خصم أسعار الكمية</span><span className="font-medium">- {formatPrice(tierSavings)}</span></div>}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم ({appliedCoupon?.code})</span>
                      <span className="font-medium">- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>رسوم الشحن</span>
                    <span className={`font-medium ${shippingCost === 0 ? "text-green-600" : ""}`}>
                      {shippingCost === 0 ? "مجاني 🎉" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ضريبة القيمة المضافة (15%)</span>
                    <span className="font-medium">{formatPrice(vat)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>الإجمالي</span>
                    <span className="text-[#2E7D32] text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {shippingCost > 0 && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-700 text-center">
                      أضف <strong>{formatPrice(300 - (subtotal - discount))}</strong> للحصول على شحن مجاني
                    </p>
                    <div className="mt-2 bg-amber-200 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(((subtotal - discount) / 300) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className="mt-5 min-h-12 w-full rounded-xl bg-[#2E7D32] py-3 text-base font-bold text-white hover:bg-[#1B5E20]"
                >
                  <Link href="/checkout">
                    إتمام الشراء
                    <ChevronLeft className="w-5 h-5 mr-2" />
                  </Link>
                </Button>

                {/* Payment Methods */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {["VISA", "MC", "MADA", "STC"].map((p) => (
                    <div key={p} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">{p}</div>
                  ))}
                </div>
              </div>

              {/* Recommended */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#2E7D32]" />
                  قد يعجبك أيضاً
                </h3>
                <div className="space-y-3">
                  {[
                    { id: "rec1", name: "سماد عضوي طبيعي معالج", price: "٣٨ ريال", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&h=80&fit=crop" },
                    { id: "rec2", name: "بذور قمح محسّنة عالية الإنتاج", price: "١٢٠ ريال", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&h=80&fit=crop" },
                  ].map((r) => (
                    <Link key={r.id} href={`/product/${r.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors">
                      <img src={r.img} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{r.name}</p>
                        <p className="text-xs text-[#2E7D32] font-bold">{r.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
