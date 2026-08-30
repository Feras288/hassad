/**
 * DashboardLoyalty — صفحة برنامج الولاء والنقاط
 * تعرض: رصيد النقاط، المستوى الحالي، التقدم للمستوى التالي،
 * كتالوج المكافآت، سجل المعاملات، والقسائم المستبدلة
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  Star, Gift, TrendingUp, Award, ChevronLeft,
  Clock, CheckCircle, XCircle, Zap, Copy, Check,
  ShoppingBag, ArrowUpRight, ArrowDownRight, Sparkles,
  Crown, Shield, Medal, Trophy
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLoyalty, TIERS, LoyaltyTier } from "@/contexts/LoyaltyContext";
import { toast } from "sonner";

// ─── Tier Icon Component ───────────────────────────────────────
function TierIcon({ tier, size = 24 }: { tier: LoyaltyTier; size?: number }) {
  const icons = {
    bronze: Medal,
    silver: Shield,
    gold: Award,
    platinum: Crown,
  };
  const Icon = icons[tier];
  return <Icon size={size} />;
}

// ─── Points Badge ─────────────────────────────────────────────
function PointsBadge({ points, type }: { points: number; type: "earn" | "redeem" | "expire" | "bonus" }) {
  const isPositive = points > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-sm ${
        isPositive ? "text-green-600" : "text-red-500"
      }`}
    >
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {isPositive ? "+" : ""}{points.toLocaleString("ar-SA")}
    </span>
  );
}

// ─── Copy Button ──────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ الكود!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
      title="نسخ الكود"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function DashboardLoyalty() {
  const {
    points, totalEarned, tier, tierInfo, nextTierInfo, progressToNextTier,
    transactions, rewards, coupons, redeemReward, markTransactionsRead,
  } = useLoyalty();

  const [activeTab, setActiveTab] = useState<"rewards" | "history" | "coupons">("rewards");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  // Mark as read when page opens
  useState(() => { markTransactionsRead(); });

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    await new Promise((r) => setTimeout(r, 600));
    redeemReward(rewardId);
    setRedeeming(null);
  };

  const tierOrder: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];
  const tierIndex = tierOrder.indexOf(tier);

  const txTypeLabel: Record<string, string> = {
    earn: "ربح نقاط",
    redeem: "استبدال نقاط",
    expire: "انتهاء صلاحية",
    bonus: "مكافأة",
  };
  const txTypeIcon: Record<string, React.ReactNode> = {
    earn: <ShoppingBag size={14} className="text-green-600" />,
    redeem: <Gift size={14} className="text-amber-500" />,
    expire: <XCircle size={14} className="text-red-500" />,
    bonus: <Sparkles size={14} className="text-purple-500" />,
  };

  const activeCoupons = coupons.filter((c) => !c.used && c.expiresAt > Date.now());
  const usedCoupons = coupons.filter((c) => c.used || c.expiresAt <= Date.now());

  return (
    <DashboardLayout title="برنامج الولاء" breadcrumb={[{ label: "برنامج الولاء" }]}>
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/dashboard" className="hover:text-green-700 transition-colors">
            لوحة التحكم
          </Link>
          <ChevronLeft size={14} />
          <span className="text-gray-800 font-medium">برنامج الولاء</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">برنامج ولاء حصاد 🌟</h1>
        <p className="text-gray-500 mt-1">اكسب نقاطاً على كل عملية شراء واستبدلها بمكافآت حصرية</p>
      </div>

      {/* ── Points Hero Card ── */}
      <div
        className="relative rounded-2xl p-6 mb-6 overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${tierInfo.color}dd 0%, ${tierInfo.color}88 100%)`,
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                top: `${-20 + i * 10}px`,
                right: `${-30 + i * 20}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Points */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                {tierInfo.icon}
              </div>
              <div>
                <p className="text-white/80 text-sm">مستواك الحالي</p>
                <p className="font-bold text-lg">{tierInfo.label}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-white/80 text-sm mb-1">رصيد نقاطك</p>
              <p className="text-5xl font-black tracking-tight">
                {points.toLocaleString("ar-SA")}
              </p>
              <p className="text-white/70 text-sm mt-1">
                إجمالي ما كسبته: {totalEarned.toLocaleString("ar-SA")} نقطة
              </p>
            </div>
          </div>

          {/* Progress to next tier */}
          <div className="flex-1 bg-white/10 rounded-xl p-4">
            {nextTierInfo ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/80">التقدم نحو {nextTierInfo.label}</span>
                  <span className="text-sm font-bold">{progressToNextTier}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${progressToNextTier}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{points.toLocaleString("ar-SA")} نقطة</span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-xl">{nextTierInfo.icon}</span>
                    {nextTierInfo.minPoints.toLocaleString("ar-SA")} نقطة
                  </span>
                </div>
                <p className="text-white/70 text-xs mt-2">
                  تحتاج {(nextTierInfo.minPoints - points).toLocaleString("ar-SA")} نقطة إضافية للوصول لمستوى {nextTierInfo.label}
                </p>
              </>
            ) : (
              <div className="text-center py-2">
                <Trophy size={32} className="mx-auto mb-2 text-white/80" />
                <p className="font-bold">أعلى مستوى!</p>
                <p className="text-white/70 text-sm mt-1">أنت في قمة برنامج الولاء</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tiers Overview ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TIERS.map((t, idx) => (
          <div
            key={t.tier}
            className={`rounded-xl p-4 border-2 transition-all ${
              t.tier === tier
                ? "shadow-md scale-[1.02]"
                : idx < tierIndex
                ? "opacity-60"
                : "opacity-80"
            }`}
            style={{
              borderColor: t.tier === tier ? t.color : "#e5e7eb",
              backgroundColor: t.tier === tier ? t.bgColor : "#f9fafb",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: t.color }}>{t.label}</p>
                <p className="text-xs text-gray-500">
                  {t.minPoints.toLocaleString("ar-SA")}
                  {t.maxPoints ? `–${t.maxPoints.toLocaleString("ar-SA")}` : "+"} نقطة
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-semibold" style={{ color: t.color }}>×{t.multiplier}</span> نقطة/ريال
            </p>
            {t.tier === tier && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: t.color }}>
                مستواك الحالي
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: "rewards", label: "المكافآت", icon: Gift },
          { id: "history", label: "سجل النقاط", icon: Clock },
          { id: "coupons", label: `قسائمي (${activeCoupons.length})`, icon: Star },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Rewards Tab ── */}
      {activeTab === "rewards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rewards.map((reward) => {
            const tierOrder2: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];
            const canAfford = points >= reward.pointsCost;
            const meetsMinTier = !reward.minTier || tierOrder2.indexOf(tier) >= tierOrder2.indexOf(reward.minTier);
            const isAvailable = canAfford && meetsMinTier;
            const isRedeeming = redeeming === reward.id;

            return (
              <div
                key={reward.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isAvailable
                    ? "border-green-200 bg-white hover:border-green-400 hover:shadow-md"
                    : "border-gray-200 bg-gray-50 opacity-70"
                }`}
              >
                <div className="text-3xl mb-3">{reward.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{reward.description}</p>

                {reward.minTier && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-gray-400">يتطلب مستوى:</span>
                    <span className="text-xs font-medium" style={{ color: TIERS.find(t => t.tier === reward.minTier)?.color }}>
                      {TIERS.find(t => t.tier === reward.minTier)?.icon} {TIERS.find(t => t.tier === reward.minTier)?.label}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-600 text-sm">
                      {reward.pointsCost.toLocaleString("ar-SA")} نقطة
                    </span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!isAvailable || isRedeeming}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAvailable
                        ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isRedeeming ? (
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="animate-pulse" />
                        جارٍ...
                      </span>
                    ) : !meetsMinTier ? (
                      "مستوى أعلى"
                    ) : !canAfford ? (
                      "نقاط غير كافية"
                    ) : (
                      "استبدل"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">سجل النقاط</h3>
            <span className="text-sm text-gray-500">{transactions.length} معاملة</span>
          </div>
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-40" />
              <p>لا توجد معاملات بعد</p>
              <p className="text-sm mt-1">ابدأ التسوق لكسب نقاطك الأولى!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {txTypeIcon[tx.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{txTypeLabel[tx.type]}</span>
                    </div>
                  </div>
                  <PointsBadge points={tx.points} type={tx.type} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Coupons Tab ── */}
      {activeTab === "coupons" && (
        <div className="space-y-4">
          {activeCoupons.length === 0 && usedCoupons.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400">
              <Gift size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">لا توجد قسائم بعد</p>
              <p className="text-sm mt-1">استبدل نقاطك بمكافآت للحصول على قسائم</p>
              <button
                onClick={() => setActiveTab("rewards")}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                تصفح المكافآت
              </button>
            </div>
          ) : (
            <>
              {activeCoupons.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    القسائم النشطة ({activeCoupons.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="bg-white rounded-xl border-2 border-dashed border-green-300 p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{coupon.rewardTitle}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              تنتهي في {new Date(coupon.expiresAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <span className="text-2xl">
                            {coupon.type === "discount" ? "🏷️" :
                             coupon.type === "free_shipping" ? "🚚" :
                             coupon.type === "cashback" ? "💵" : "🎁"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <code className="flex-1 font-mono font-bold text-green-700 tracking-wider text-sm">
                            {coupon.code}
                          </code>
                          <CopyButton text={coupon.code} />
                        </div>
                        {coupon.value > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            قيمة الخصم: <span className="font-bold text-green-700">{coupon.value} ريال</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usedCoupons.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <XCircle size={16} className="text-gray-400" />
                    القسائم المستخدمة / المنتهية ({usedCoupons.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usedCoupons.map((coupon) => (
                      <div key={coupon.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-600">{coupon.rewardTitle}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {coupon.used ? "مستخدمة" : "منتهية الصلاحية"}
                            </p>
                          </div>
                          <span className="text-xl opacity-50">
                            {coupon.type === "discount" ? "🏷️" :
                             coupon.type === "free_shipping" ? "🚚" :
                             coupon.type === "cashback" ? "💵" : "🎁"}
                          </span>
                        </div>
                        <code className="font-mono text-gray-400 text-sm line-through">{coupon.code}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tier Benefits ── */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          مزايا مستواك الحالي — {tierInfo.label} {tierInfo.icon}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tierInfo.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
              {benefit}
            </div>
          ))}
        </div>
        {nextTierInfo && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              <span className="font-medium text-gray-700">مزايا إضافية</span> عند الوصول لمستوى {nextTierInfo.label} {nextTierInfo.icon}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nextTierInfo.benefits.slice(tierInfo.benefits.length).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <Star size={13} className="text-gray-300 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
