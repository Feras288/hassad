// ================================================================
// HASAAD PLATFORM — OrdersContext
// Local compatibility store for browser-created orders only.
// It begins empty and never provides demo orders or shipping estimates.
// ================================================================
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { CartItem } from "./CartContext";
import type { PriceTier, TierPricingDate } from "@/lib/tierPricing";

// ─── Types ────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface OrderTrackingStep {
  label: string;
  description: string;
  done: boolean;
  date?: string;
  active?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceTiers?: PriceTier[];
  tierPricingStartsAt?: TierPricingDate;
  tierPricingEndsAt?: TierPricingDate;
  quantity: number;
  unit: string;
  image?: string;
  vendor?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  notes?: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  type: "product" | "service";
  items: OrderItem[];
  address: OrderAddress;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  vat: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  createdAt: number; // timestamp
  updatedAt: number;
  estimatedDelivery: string;
  trackingSteps: OrderTrackingStep[];
}

// ─── Context Interface ─────────────────────────────────────────
interface OrdersContextValue {
  orders: PlacedOrder[];
  placeOrder: (params: PlaceOrderParams) => PlacedOrder;
  getOrder: (id: string) => PlacedOrder | undefined;
  cancelOrder: (id: string) => void;
  reorder: (id: string) => OrderItem[];
  totalOrders: number;
  pendingOrders: number;
}

export interface PlaceOrderParams {
  id?: string;
  orderNumber?: string;
  items: CartItem[];
  address: OrderAddress;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  vat: number;
  total: number;
  couponCode?: string;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "hasaad_orders";

// ─── Helpers ──────────────────────────────────────────────────
function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `HS-${suffix}`;
}

function buildTrackingSteps(status: OrderStatus): OrderTrackingStep[] {
  return [{
    label: "بانتظار تحديث المورد",
    description: "ستظهر حالة الشحن عندما يضيف المورد تحديثاً فعلياً.",
    done: status !== "cancelled",
    active: status === "pending",
  }];
}

// ─── Provider ─────────────────────────────────────────────────
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const placeOrder = useCallback((params: PlaceOrderParams): PlacedOrder => {
    const now = Date.now();
    const newOrder: PlacedOrder = {
      id: params.id ?? `order_${now}`,
      orderNumber: params.orderNumber ?? generateOrderNumber(),
      type: "product",
      items: params.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        priceTiers: item.priceTiers,
        tierPricingStartsAt: item.tierPricingStartsAt,
        tierPricingEndsAt: item.tierPricingEndsAt,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image,
        vendor: item.vendorName,
      })),
      address: params.address,
      paymentMethod: params.paymentMethod,
      subtotal: params.subtotal,
      discount: params.discount,
      shippingCost: params.shippingCost,
      vat: params.vat,
      total: params.total,
      couponCode: params.couponCode,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      estimatedDelivery: "",
      trackingSteps: buildTrackingSteps("pending"),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id || o.orderNumber === id),
    [orders]
  );

  const cancelOrder = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id || o.orderNumber === id
          ? { ...o, status: "cancelled", updatedAt: Date.now() }
          : o
      )
    );
  }, []);

  const reorder = useCallback(
    (id: string): OrderItem[] => {
      const order = orders.find((o) => o.id === id || o.orderNumber === id);
      return order ? order.items : [];
    },
    [orders]
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "in_progress"
  ).length;

  return (
    <OrdersContext.Provider
      value={{ orders, placeOrder, getOrder, cancelOrder, reorder, totalOrders, pendingOrders }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
