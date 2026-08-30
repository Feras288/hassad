/**
 * LoyaltyContext — برنامج ولاء حصاد
 * نظام نقاط يكافئ المستخدمين على مشترياتهم مع 4 مستويات وقسائم قابلة للاستبدال
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useOrders } from "./OrdersContext";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  label: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  multiplier: number; // معامل مضاعفة النقاط
  benefits: string[];
}

export interface LoyaltyTransaction {
  id: string;
  type: "earn" | "redeem" | "expire" | "bonus";
  points: number;
  description: string;
  orderId?: string;
  createdAt: number;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: "discount" | "free_shipping" | "cashback" | "gift";
  value: number; // قيمة الخصم أو المبلغ
  icon: string;
  available: boolean;
  minTier?: LoyaltyTier;
}

export interface LoyaltyCoupon {
  id: string;
  code: string;
  rewardId: string;
  rewardTitle: string;
  type: "discount" | "free_shipping" | "cashback" | "gift";
  value: number;
  used: boolean;
  expiresAt: number;
  createdAt: number;
}

interface LoyaltyContextValue {
  points: number;
  totalEarned: number;
  tier: LoyaltyTier;
  tierInfo: LoyaltyTierInfo;
  nextTierInfo: LoyaltyTierInfo | null;
  progressToNextTier: number; // 0-100
  transactions: LoyaltyTransaction[];
  rewards: LoyaltyReward[];
  coupons: LoyaltyCoupon[];
  addPoints: (points: number, description: string, orderId?: string) => void;
  redeemReward: (rewardId: string) => boolean;
  getPointsForAmount: (amount: number) => number;
  unreadTransactions: number;
  markTransactionsRead: () => void;
}

// ─── Tier Definitions ─────────────────────────────────────────
export const TIERS: LoyaltyTierInfo[] = [
  {
    tier: "bronze",
    label: "برونزي",
    minPoints: 0,
    maxPoints: 999,
    color: "#cd7f32",
    bgColor: "#fdf3e7",
    borderColor: "#cd7f32",
    icon: "🥉",
    multiplier: 1,
    benefits: [
      "1 نقطة لكل ريال",
      "خصم 5% على أول طلب",
      "إشعارات العروض الحصرية",
    ],
  },
  {
    tier: "silver",
    label: "فضي",
    minPoints: 1000,
    maxPoints: 4999,
    color: "#9ca3af",
    bgColor: "#f3f4f6",
    borderColor: "#9ca3af",
    icon: "🥈",
    multiplier: 1.5,
    benefits: [
      "1.5 نقطة لكل ريال",
      "شحن مجاني على الطلبات فوق 200 ريال",
      "أولوية في خدمة العملاء",
      "خصم 10% في المناسبات",
    ],
  },
  {
    tier: "gold",
    label: "ذهبي",
    minPoints: 5000,
    maxPoints: 14999,
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#f59e0b",
    icon: "🥇",
    multiplier: 2,
    benefits: [
      "2 نقطة لكل ريال",
      "شحن مجاني على جميع الطلبات",
      "وصول مبكر للعروض",
      "خصم 15% في المناسبات",
      "مستشار زراعي مخصص",
    ],
  },
  {
    tier: "platinum",
    label: "بلاتيني",
    minPoints: 15000,
    maxPoints: null,
    color: "#6366f1",
    bgColor: "#eef2ff",
    borderColor: "#6366f1",
    icon: "💎",
    multiplier: 3,
    benefits: [
      "3 نقاط لكل ريال",
      "شحن مجاني + تأمين على الشحنات",
      "أولوية قصوى في الدعم",
      "خصم 20% دائم",
      "هدايا موسمية حصرية",
      "دعوة لفعاليات حصاد الخاصة",
    ],
  },
];

// ─── Rewards Catalog ──────────────────────────────────────────
const REWARDS_CATALOG: LoyaltyReward[] = [
  {
    id: "r1",
    title: "خصم 10 ريال",
    description: "خصم فوري على طلبك القادم",
    pointsCost: 200,
    type: "discount",
    value: 10,
    icon: "🏷️",
    available: true,
  },
  {
    id: "r2",
    title: "شحن مجاني",
    description: "توصيل مجاني لطلب واحد",
    pointsCost: 300,
    type: "free_shipping",
    value: 0,
    icon: "🚚",
    available: true,
  },
  {
    id: "r3",
    title: "خصم 25 ريال",
    description: "خصم على طلبات فوق 150 ريال",
    pointsCost: 500,
    type: "discount",
    value: 25,
    icon: "💰",
    available: true,
    minTier: "silver",
  },
  {
    id: "r4",
    title: "استرداد نقدي 50 ريال",
    description: "رصيد مضاف لمحفظتك في حصاد",
    pointsCost: 1000,
    type: "cashback",
    value: 50,
    icon: "💵",
    available: true,
    minTier: "gold",
  },
  {
    id: "r5",
    title: "خصم 50 ريال",
    description: "خصم على طلبات فوق 300 ريال",
    pointsCost: 900,
    type: "discount",
    value: 50,
    icon: "🎁",
    available: true,
    minTier: "silver",
  },
  {
    id: "r6",
    title: "هدية ترحيبية",
    description: "منتج زراعي مجاني مع طلبك",
    pointsCost: 2000,
    type: "gift",
    value: 100,
    icon: "🌱",
    available: true,
    minTier: "gold",
  },
  {
    id: "r7",
    title: "خصم 100 ريال",
    description: "خصم كبير على طلبات فوق 500 ريال",
    pointsCost: 1800,
    type: "discount",
    value: 100,
    icon: "⭐",
    available: true,
    minTier: "platinum",
  },
  {
    id: "r8",
    title: "استرداد نقدي 150 ريال",
    description: "رصيد ضخم لمحفظتك في حصاد",
    pointsCost: 2800,
    type: "cashback",
    value: 150,
    icon: "💎",
    available: true,
    minTier: "platinum",
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function getTierForPoints(points: number): LoyaltyTier {
  if (points >= 15000) return "platinum";
  if (points >= 5000) return "gold";
  if (points >= 1000) return "silver";
  return "bronze";
}

function getTierInfo(tier: LoyaltyTier): LoyaltyTierInfo {
  return TIERS.find((t) => t.tier === tier)!;
}

function getNextTierInfo(tier: LoyaltyTier): LoyaltyTierInfo | null {
  const idx = TIERS.findIndex((t) => t.tier === tier);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HSL-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const STORAGE_KEY = "hasaad_loyalty";

// ─── Context ──────────────────────────────────────────────────
const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

interface StoredLoyalty {
  points: number;
  totalEarned: number;
  transactions: LoyaltyTransaction[];
  coupons: LoyaltyCoupon[];
  processedOrderIds: string[];
  unreadCount: number;
}

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const { orders } = useOrders();

  const [stored, setStored] = useState<StoredLoyalty>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      points: 0,
      totalEarned: 0,
      transactions: [],
      coupons: [],
      processedOrderIds: [],
      unreadCount: 0,
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [stored]);

  // Auto-award points for new completed/delivered orders
  useEffect(() => {
    const newOrders = orders.filter(
      (o) =>
        !stored.processedOrderIds.includes(o.id) &&
        (o.status === "completed" || o.status === "confirmed")
    );
    if (newOrders.length === 0) return;

    const tier = getTierForPoints(stored.points);
    const tierInfo = getTierInfo(tier);

    setStored((prev) => {
      let pts = prev.points;
      let totalEarned = prev.totalEarned;
      const newTxs: LoyaltyTransaction[] = [];
      const newProcessed = [...prev.processedOrderIds];

      newOrders.forEach((order) => {
        const earned = Math.floor(order.total * tierInfo.multiplier);
        pts += earned;
        totalEarned += earned;
        newTxs.push({
          id: `t_${order.id}`,
          type: "earn",
          points: earned,
          description: `شراء طلب ${order.orderNumber}`,
          orderId: order.id,
          createdAt: Date.now(),
        });
        newProcessed.push(order.id);
      });

      // Show toast for first new order
      if (newTxs.length > 0) {
        setTimeout(() => {
          toast.success(`🌟 ربحت ${newTxs[0].points} نقطة من طلبك!`, {
            description: "تحقق من رصيدك في برنامج الولاء",
            action: { label: "عرض الرصيد", onClick: () => window.location.href = "/dashboard/loyalty" },
          });
        }, 1500);
      }

      return {
        ...prev,
        points: pts,
        totalEarned,
        transactions: [...newTxs, ...prev.transactions],
        processedOrderIds: newProcessed,
        unreadCount: prev.unreadCount + newTxs.length,
      };
    });
  }, [orders]);

  const tier = getTierForPoints(stored.points);
  const tierInfo = getTierInfo(tier);
  const nextTierInfo = getNextTierInfo(tier);
  const progressToNextTier = nextTierInfo
    ? Math.min(100, Math.round(((stored.points - tierInfo.minPoints) / (nextTierInfo.minPoints - tierInfo.minPoints)) * 100))
    : 100;

  const addPoints = useCallback((points: number, description: string, orderId?: string) => {
    setStored((prev) => ({
      ...prev,
      points: prev.points + points,
      totalEarned: prev.totalEarned + (points > 0 ? points : 0),
      transactions: [
        {
          id: `t_${Date.now()}`,
          type: points > 0 ? "earn" : "redeem",
          points,
          description,
          orderId,
          createdAt: Date.now(),
        },
        ...prev.transactions,
      ],
      unreadCount: prev.unreadCount + 1,
    }));
  }, []);

  const redeemReward = useCallback((rewardId: string): boolean => {
    const reward = REWARDS_CATALOG.find((r) => r.id === rewardId);
    if (!reward) return false;

    const currentTier = getTierForPoints(stored.points);
    const tierOrder: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];
    if (reward.minTier && tierOrder.indexOf(currentTier) < tierOrder.indexOf(reward.minTier)) {
      toast.error("هذه المكافأة تتطلب مستوى أعلى في برنامج الولاء");
      return false;
    }
    if (stored.points < reward.pointsCost) {
      toast.error("رصيد النقاط غير كافٍ لاستبدال هذه المكافأة");
      return false;
    }

    const coupon: LoyaltyCoupon = {
      id: `c_${Date.now()}`,
      code: generateCouponCode(),
      rewardId: reward.id,
      rewardTitle: reward.title,
      type: reward.type,
      value: reward.value,
      used: false,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      createdAt: Date.now(),
    };

    setStored((prev) => ({
      ...prev,
      points: prev.points - reward.pointsCost,
      transactions: [
        {
          id: `t_redeem_${Date.now()}`,
          type: "redeem",
          points: -reward.pointsCost,
          description: `استبدال نقاط - ${reward.title}`,
          createdAt: Date.now(),
        },
        ...prev.transactions,
      ],
      coupons: [coupon, ...prev.coupons],
    }));

    toast.success(`✅ تم استبدال النقاط بنجاح!`, {
      description: `كود القسيمة: ${coupon.code}`,
    });
    return true;
  }, [stored.points]);

  const getPointsForAmount = useCallback((amount: number): number => {
    return Math.floor(amount * tierInfo.multiplier);
  }, [tierInfo.multiplier]);

  const markTransactionsRead = useCallback(() => {
    setStored((prev) => ({ ...prev, unreadCount: 0 }));
  }, []);

  return (
    <LoyaltyContext.Provider
      value={{
        points: stored.points,
        totalEarned: stored.totalEarned,
        tier,
        tierInfo,
        nextTierInfo,
        progressToNextTier,
        transactions: stored.transactions,
        rewards: REWARDS_CATALOG,
        coupons: stored.coupons,
        addPoints,
        redeemReward,
        getPointsForAmount,
        unreadTransactions: stored.unreadCount,
        markTransactionsRead,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty must be used inside LoyaltyProvider");
  return ctx;
}
