/*
 * HASAAD PLATFORM — Cart Context
 * Global state for shopping cart management
 * Persists to localStorage for cross-session retention
 * Handles: add/remove/update quantity, coupon codes, totals
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { PriceTier, TierPricingDate } from "@/lib/tierPricing";
import { calculateTierSavings, getTieredUnitPrice, hasReachedHigherDiscountTier } from "@/lib/tierPricing";
import TierDiscountCelebration from "@/components/TierDiscountCelebration";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  priceTiers?: PriceTier[];
  tierPricingStartsAt?: TierPricingDate;
  tierPricingEndsAt?: TierPricingDate;
  image: string;
  category: string;
  unit: string;
  quantity: number;
  stock: number;
  vendorName?: string;
  vendorId?: string;
  addedAt: number;
}

export interface CouponCode {
  code: string;
  discount: number; // percentage
  type: "percentage" | "fixed";
  label: string;
}

const VALID_COUPONS: CouponCode[] = [
  { code: "HASAAD10", discount: 10, type: "percentage", label: "خصم 10% على جميع المنتجات" },
  { code: "HASAAD20", discount: 20, type: "percentage", label: "خصم 20% على جميع المنتجات" },
  { code: "WELCOME50", discount: 50, type: "fixed", label: "خصم 50 ريال للعملاء الجدد" },
  { code: "FARM100", discount: 100, type: "fixed", label: "خصم 100 ريال للطلبات فوق 500 ريال" },
];

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  tierSavings: number;
  discount: number;
  shippingCost: number;
  vat: number;
  total: number;
  appliedCoupon: CouponCode | null;
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity" | "addedAt">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hasaad_cart";
const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 35;
const VAT_RATE = 0.15;

interface TierCelebration {
  productName: string;
  savedAmount: number;
  unitPrice: number;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tierCelebration, setTierCelebration] = useState<TierCelebration | null>(null);
  const previousItemsRef = useRef<CartItem[]>(items);
  const isInitialCartSync = useRef(true);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  useEffect(() => {
    if (isInitialCartSync.current) {
      isInitialCartSync.current = false;
      previousItemsRef.current = items;
      return;
    }
    const previousItems = previousItemsRef.current;
    const upgradedItem = items.find((item) => {
      const previous = previousItems.find((candidate) => candidate.id === item.id);
      return previous ? hasReachedHigherDiscountTier(item.price, item.priceTiers, previous.quantity, item.quantity, item) : false;
    });
    previousItemsRef.current = items;
    if (!upgradedItem) return;
    const unitPrice = getTieredUnitPrice(upgradedItem.price, upgradedItem.priceTiers, upgradedItem.quantity, upgradedItem);
    setTierCelebration({
      productName: upgradedItem.name,
      unitPrice,
      savedAmount: calculateTierSavings(upgradedItem.price, upgradedItem.priceTiers, upgradedItem.quantity, upgradedItem),
    });
  }, [items]);

  // Computed values
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const tierSavings = items.reduce((sum, item) => sum + calculateTierSavings(item.price, item.priceTiers, item.quantity, item), 0);
  const subtotal = items.reduce((sum, item) => sum + getTieredUnitPrice(item.price, item.priceTiers, item.quantity, item) * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }

  const afterDiscount = subtotal - discount;
  const shippingCost = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const vat = Math.round(afterDiscount * VAT_RATE);
  const total = afterDiscount + shippingCost + vat;

  const addToCart = useCallback((item: Omit<CartItem, "quantity" | "addedAt">, requestedQuantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          toast.error("لا يمكن إضافة المزيد — وصلت للحد الأقصى المتاح");
          return prev;
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(i.stock, i.quantity + requestedQuantity), priceTiers: item.priceTiers ?? i.priceTiers } : i
        );
      }
      return [{ ...item, quantity: Math.min(item.stock, Math.max(1, requestedQuantity)), addedAt: Date.now() }, ...prev];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newQty = Math.min(quantity, i.stock);
        return { ...i, quantity: newQty };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const coupon = VALID_COUPONS.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!coupon) return false;
    setAppliedCoupon(coupon);
    return true;
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), []);

  const isInCart = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const getItemQuantity = useCallback(
    (id: string) => items.find((i) => i.id === id)?.quantity ?? 0,
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        tierSavings,
        discount,
        shippingCost,
        vat,
        total,
        appliedCoupon,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        openCart,
        closeCart,
        toggleCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {tierCelebration && <TierDiscountCelebration {...tierCelebration} onDismiss={() => setTierCelebration(null)} />}
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
