/*
 * HASAAD PLATFORM — Related Products Section
 * Design: "الحقل الرقمي" — Horizontal scrollable product cards
 * Similar products and recommendations
 */

import { ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import type { RelatedProduct } from "@/lib/productsData";
import FavoriteButton from "@/components/FavoriteButton";
import { useCart } from "@/contexts/CartContext";

interface RelatedProductsProps {
  products: RelatedProduct[];
  title?: string;
}

export default function RelatedProducts({
  products,
  title = "منتجات مشابهة",
}: RelatedProductsProps) {
  const [, navigate] = useLocation();
  const { addToCart, isInCart } = useCart();
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#DCE8DA] bg-white p-4 shadow-[0_10px_28px_rgba(25,73,45,0.06)] sm:rounded-[26px] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <p className="text-xs font-bold text-[#5C8A6D]">اقتراحات لمزرعتك</p>
          <h3 className="mt-1 text-lg font-black text-[#263238] sm:text-xl">{title}</h3>
        </div>
        <button
          onClick={() => navigate("/marketplace")}
          className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-bold text-[#2E7D32] active:scale-[0.97]"
        >
          عرض الكل
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Touch-first carousel on phones, balanced grid on larger screens. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {products.map((product) => (
          <article key={product.id} className="touch-card w-[74vw] max-w-[272px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-[#DCE8DA] bg-white shadow-sm md:w-auto md:max-w-none">
            <Link href={`/product/${product.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-inset">
              <div className="relative h-32 overflow-hidden bg-[#F2F6F0] sm:h-36">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                {product.badge && <span className="absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-black text-white" style={{ backgroundColor: product.badgeColor }}>{product.badge}</span>}
              </div>
              <div className="px-3 pb-2 pt-3"><span className="block truncate text-[11px] font-bold text-[#3E885B]">{product.category}</span><h4 className="mt-1 min-h-10 text-sm font-black leading-5 text-[#263238] line-clamp-2">{product.name}</h4><div className="mt-2 flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#C9A227] text-[#C9A227]" /><span className="text-xs font-bold text-[#4D5D53]">{product.rating.toFixed(1)}</span><span className="text-[11px] text-gray-400">({product.reviews})</span></div></div>
            </Link>
            <div className="flex items-end justify-between gap-2 px-3 pb-3 pt-1"><div className="min-w-0"><span className="block truncate text-base font-black text-[#1F6B45]">{product.price}</span>{product.originalPrice && <span className="block text-[11px] text-gray-400 line-through">{product.originalPrice}</span>}</div><div className="flex shrink-0 items-center gap-1.5"><FavoriteButton product={{ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, rating: product.rating, reviews: product.reviews, image: product.image, badge: product.badge, badgeColor: product.badgeColor, category: product.category, addedAt: 0 }} size="sm" className="h-10 w-10 rounded-xl border border-[#D8E5D5]" /><button onClick={() => { if (isInCart(product.id)) return navigate("/cart"); addToCart({ id: product.id, name: product.name, price: parseFloat(product.price.replace(/[^\d.]/g, "")) || 0, priceFormatted: product.price, originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(/[^\d.]/g, "")) : undefined, image: product.image, category: product.category, unit: "وحدة", stock: 100 }); toast.success(`تمت إضافة "${product.name}" إلى السلة`); }} aria-label={isInCart(product.id) ? "الانتقال إلى السلة" : `أضف ${product.name} إلى السلة`} className="grid h-10 w-10 place-items-center rounded-xl bg-[#1F6B45] text-white active:scale-[0.96]">{isInCart(product.id) ? <Heart className="h-4 w-4 fill-current" /> : <ShoppingCart className="h-4 w-4" />}</button></div></div>
          </article>
        ))}
      </div>
    </section>
  );
}
