/**
 * CommissionContext — HASAAD Platform
 * Shared commission state between AdminSettings and AdminVendors.
 * Supports:
 *   - Tiered commission rates per category + revenue bracket
 *   - Custom (override) rate per individual vendor
 */
import { createContext, useContext, useState, ReactNode } from "react";

export interface CommissionTier {
  id: string;
  label: string;
  category: string;
  rate: number;
  minRevenue: number;
  maxRevenue: number | null;
}

/** Custom override for a specific vendor */
export interface VendorCustomRate {
  vendorId: string;
  rate: number;
  reason: string;
  setAt: string; // ISO date string
}

interface CommissionInfo {
  rate: number;
  tierLabel: string;
  tierColor: string;
  isCustom: boolean;
}

const defaultTiers: CommissionTier[] = [
  { id: "c1", label: "الفئة الأساسية",   category: "أسمدة ومبيدات",   rate: 10, minRevenue: 0,      maxRevenue: 50000  },
  { id: "c2", label: "الفئة المتوسطة",   category: "أسمدة ومبيدات",   rate: 8,  minRevenue: 50001,  maxRevenue: 200000 },
  { id: "c3", label: "الفئة المتميزة",   category: "أسمدة ومبيدات",   rate: 6,  minRevenue: 200001, maxRevenue: null   },
  { id: "c4", label: "البذور والشتلات",  category: "بذور وشتلات",      rate: 10, minRevenue: 0,      maxRevenue: null   },
  { id: "c5", label: "معدات الري",        category: "معدات الري",       rate: 8,  minRevenue: 0,      maxRevenue: null   },
  { id: "c6", label: "الأدوات والمعدات", category: "أدوات ومعدات",     rate: 9,  minRevenue: 0,      maxRevenue: null   },
  { id: "c7", label: "الخدمات الزراعية", category: "خدمات",            rate: 15, minRevenue: 0,      maxRevenue: null   },
  { id: "c8", label: "الاستشارات",        category: "استشارات زراعية", rate: 12, minRevenue: 0,      maxRevenue: null   },
  { id: "c9", label: "تحليل التربة",      category: "تحليل التربة",    rate: 12, minRevenue: 0,      maxRevenue: null   },
  { id: "c10",label: "المنتجات الزراعية",category: "منتجات زراعية",   rate: 10, minRevenue: 0,      maxRevenue: null   },
];

const TIERS_KEY   = "hasaad_commission_tiers";
const CUSTOMS_KEY = "hasaad_vendor_custom_rates";

function loadTiers(): CommissionTier[] {
  try {
    const raw = localStorage.getItem(TIERS_KEY);
    return raw ? JSON.parse(raw) : defaultTiers;
  } catch { return defaultTiers; }
}

function loadCustomRates(): VendorCustomRate[] {
  try {
    const raw = localStorage.getItem(CUSTOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

interface CommissionContextValue {
  tiers: CommissionTier[];
  setTiers: (tiers: CommissionTier[]) => void;
  customRates: VendorCustomRate[];
  setCustomRate: (vendorId: string, rate: number | null, reason: string) => void;
  getRate: (category: string, revenue: number, vendorId?: string) => CommissionInfo | null;
}

const CommissionContext = createContext<CommissionContextValue | null>(null);

export function CommissionProvider({ children }: { children: ReactNode }) {
  const [tiers, setTiersState] = useState<CommissionTier[]>(loadTiers);
  const [customRates, setCustomRatesState] = useState<VendorCustomRate[]>(loadCustomRates);

  const setTiers = (next: CommissionTier[]) => {
    setTiersState(next);
    localStorage.setItem(TIERS_KEY, JSON.stringify(next));
  };

  const setCustomRate = (vendorId: string, rate: number | null, reason: string) => {
    setCustomRatesState((prev) => {
      let next: VendorCustomRate[];
      if (rate === null) {
        // Remove override
        next = prev.filter((r) => r.vendorId !== vendorId);
      } else {
        const existing = prev.find((r) => r.vendorId === vendorId);
        if (existing) {
          next = prev.map((r) => r.vendorId === vendorId ? { ...r, rate, reason, setAt: new Date().toISOString() } : r);
        } else {
          next = [...prev, { vendorId, rate, reason, setAt: new Date().toISOString() }];
        }
      }
      localStorage.setItem(CUSTOMS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getRate = (category: string, revenue: number, vendorId?: string): CommissionInfo | null => {
    // Check custom override first
    if (vendorId) {
      const custom = customRates.find((r) => r.vendorId === vendorId);
      if (custom) {
        return {
          rate: custom.rate,
          tierLabel: "نسبة مخصصة",
          tierColor: "text-amber-400 bg-amber-400/10",
          isCustom: true,
        };
      }
    }

    // Find matching tier
    const matching = tiers.filter((t) => {
      const catMatch =
        t.category === category ||
        category.includes(t.category) ||
        t.category.includes(category);
      const revMatch = revenue >= t.minRevenue && (t.maxRevenue === null || revenue <= t.maxRevenue);
      return catMatch && revMatch;
    });

    if (matching.length === 0) {
      // Fallback: category match without revenue filter
      const catOnly = tiers.filter((t) =>
        t.category === category || category.includes(t.category) || t.category.includes(category)
      );
      if (catOnly.length === 0) return null;
      const t = catOnly[0];
      return { rate: t.rate, tierLabel: t.label, tierColor: "text-slate-300 bg-slate-700/50", isCustom: false };
    }

    const tier = matching[0];
    const colorMap: Record<string, string> = {
      "الفئة المتميزة":  "text-emerald-400 bg-emerald-400/10",
      "الفئة المتوسطة":  "text-blue-400 bg-blue-400/10",
      "الفئة الأساسية":  "text-slate-300 bg-slate-700/50",
    };
    return {
      rate: tier.rate,
      tierLabel: tier.label,
      tierColor: colorMap[tier.label] ?? "text-slate-300 bg-slate-700/50",
      isCustom: false,
    };
  };

  return (
    <CommissionContext.Provider value={{ tiers, setTiers, customRates, setCustomRate, getRate }}>
      {children}
    </CommissionContext.Provider>
  );
}

export function useCommission(): CommissionContextValue {
  const ctx = useContext(CommissionContext);
  if (!ctx) throw new Error("useCommission must be used inside CommissionProvider");
  return ctx;
}
