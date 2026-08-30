/*
 * HASAAD PLATFORM — Product Order Panel
 * Design: "قرار المزرعة" — minimal, price-forward ordering control with no duplicated supplier content.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Minus, Plus, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/productsData";
import FavoriteButton from "@/components/FavoriteButton";
import { useCart } from "@/contexts/CartContext";
import { calculateTierSavings, getNextPriceTier, getTieredUnitPrice, isTierPricingActive, normalizePriceTiers } from "@/lib/tierPricing";
import TierDiscountProgress from "@/components/TierDiscountProgress";
import WholesaleOfferBadge from "@/components/WholesaleOfferBadge";

interface ProductPurchaseCardProps { product: Product; }

export default function ProductPurchaseCard({ product }: ProductPurchaseCardProps) {
  const [quantity, setQuantity] = useState(product.minOrder);
  const { addToCart, isInCart } = useCart();
  const [, navigate] = useLocation();
  const inCart = isInCart(product.id);
  const pricingWindow = { tierPricingStartsAt: product.tierPricingStartsAt, tierPricingEndsAt: product.tierPricingEndsAt };
  const tiers = normalizePriceTiers(product.priceTiers);
  const isWholesaleActive = isTierPricingActive(pricingWindow);
  const unitPrice = getTieredUnitPrice(product.price, tiers, quantity, pricingWindow);
  const totalPrice = unitPrice * quantity;
  const tierSavings = calculateTierSavings(product.price, tiers, quantity, pricingWindow);
  const nextTier = getNextPriceTier(tiers, quantity, pricingWindow);
  const isAvailable = product.stock > 0;

  const cartItem = () => ({
    id: product.id,
    name: product.name,
    price: product.price,
    priceFormatted: product.priceFormatted,
    originalPrice: product.originalPrice,
    priceTiers: product.priceTiers,
    tierPricingStartsAt: product.tierPricingStartsAt,
    tierPricingEndsAt: product.tierPricingEndsAt,
    image: product.images[0] ?? "",
    category: product.category,
    unit: product.unit,
    stock: product.stock,
    vendorName: product.supplier.name,
  });

  const addItem = () => {
    if (inCart) return navigate("/cart");
    addToCart(cartItem(), quantity);
    toast.success("تمت إضافة المنتج إلى السلة", { action: { label: "عرض السلة", onClick: () => navigate("/cart") } });
  };

  const buyNow = () => {
    addToCart(cartItem(), quantity);
    navigate("/checkout");
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#D6E3D3] bg-white shadow-[0_18px_45px_rgba(25,71,42,0.09)]" aria-label="خيارات الشراء">
      <div className="bg-[#183F2B] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#B7D8B7]">سعر حصاد</span><div className="flex items-center gap-1.5">{tiers.length > 0 && isWholesaleActive && <WholesaleOfferBadge {...pricingWindow} />}{product.originalPriceFormatted && <span className="rounded-full bg-[#D19A32] px-2.5 py-1 text-[11px] font-black text-[#233019]">خصم {product.discount}٪</span>}</div></div>
        <div className="mt-1.5 flex items-end justify-between gap-3"><div><p className="text-[32px] font-black leading-none tracking-[-0.04em]">{product.priceFormatted}</p><p className="mt-1 text-xs text-[#CDE3CB]">لكل {product.unit}</p></div>{product.originalPriceFormatted && <p className="pb-1 text-sm text-[#B7C8BC] line-through">{product.originalPriceFormatted}</p>}</div>
      </div>

      <div className="p-5">
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${isAvailable ? "bg-[#EEF7EC] text-[#236445]" : "bg-[#FFF2F0] text-[#B23A2B]"}`}><span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-[#45A463]" : "bg-[#D75A4A]"}`} />{isAvailable ? `متوفر الآن — ${product.stock.toLocaleString("ar-SA")} ${product.unit}` : "غير متوفر حالياً"}</div>

        <div className="mt-5 flex items-center justify-between"><div><p className="text-sm font-black text-[#1C3A2A]">الكمية المطلوبة</p><p className="mt-1 text-xs text-[#78857E]">الحد الأدنى: {product.minOrder} {product.unit}</p></div><div className="flex items-center rounded-xl border border-[#D7E2D5] bg-[#FAFCF9]" dir="ltr"><button type="button" onClick={() => setQuantity((current) => Math.max(product.minOrder, current - 1))} disabled={!isAvailable || quantity <= product.minOrder} className="grid h-10 w-10 place-items-center text-[#426151] disabled:opacity-35"><Minus className="h-4 w-4" /></button><span className="w-9 text-center text-base font-black text-[#183F2B]">{quantity}</span><button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} disabled={!isAvailable || quantity >= product.stock} className="grid h-10 w-10 place-items-center text-[#426151] disabled:opacity-35"><Plus className="h-4 w-4" /></button></div></div>

        {tiers.length > 0 && (isWholesaleActive ? <div className="mt-4 overflow-hidden rounded-xl border border-[#D9E7D5] bg-[#F7FBF5]"><div className="border-b border-[#E2EEE0] px-3 py-2 text-xs font-black text-[#315B40]">أسعار الكمية</div>{tiers.map((tier) => <div key={tier.minQuantity} className={`flex items-center justify-between px-3 py-2 text-xs ${quantity >= tier.minQuantity ? "bg-[#E5F3E1] font-black text-[#1F6B45]" : "text-[#617369]"}`}><span>{tier.minQuantity.toLocaleString("ar-SA")}+ {product.unit}</span><span>{tier.unitPrice.toLocaleString("ar-SA")} ريال / وحدة</span></div>)}</div> : <p className="mt-4 rounded-xl border border-[#E8DCC4] bg-[#FFF9EE] px-3 py-2.5 text-xs font-bold leading-6 text-[#7B653B]">أسعار الكمية لهذا المنتج غير مفعّلة حالياً؛ سيُطبّق السعر الأساسي.</p>)}
        {nextTier && <TierDiscountProgress tiers={tiers} quantity={quantity} unit={product.unit} {...pricingWindow} />}
        <div className="mt-5 flex items-center justify-between border-y border-[#E6EEE4] py-4"><div><span className="block text-sm font-bold text-[#66766C]">إجمالي طلبك</span>{tierSavings > 0 && <span className="mt-1 block text-xs font-bold text-[#2B7948]">وفّرت {tierSavings.toLocaleString("ar-SA")} ريال بسعر الكمية</span>}</div><div className="text-left"><span className="block text-xl font-black text-[#1F6B45]">{totalPrice.toLocaleString("ar-SA")} ريال</span><span className="text-xs text-[#738078]">{unitPrice.toLocaleString("ar-SA")} ريال / وحدة</span></div></div>

        <button type="button" onClick={buyNow} disabled={!isAvailable} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D19A32] py-3.5 text-sm font-black text-white transition-colors hover:bg-[#B98120] disabled:cursor-not-allowed disabled:opacity-50"><Zap className="h-4 w-4" />اشتر الآن</button>
        <button type="button" onClick={addItem} disabled={!isAvailable} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F6B45] py-3 text-sm font-black text-[#1F6B45] transition-colors hover:bg-[#EEF7EC] disabled:cursor-not-allowed disabled:opacity-50">{inCart ? <><Check className="h-4 w-4" />الانتقال إلى السلة</> : <><ShoppingCart className="h-4 w-4" />أضف إلى السلة</>}</button>

        <div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E7D74]"><Sparkles className="h-3.5 w-3.5 text-[#B98120]" />الدفع آمن ومشفّر</div><FavoriteButton product={{ id: product.id, name: product.name, price: product.priceFormatted, originalPrice: product.originalPriceFormatted, rating: product.rating, reviews: product.reviewCount, image: product.images[0], badge: product.badge, badgeColor: product.badgeColor, category: product.category, addedAt: 0 }} showLabel={false} className="h-9 w-9 rounded-lg border border-[#D7E2D5]" /></div>
      </div>
    </section>
  );
}
