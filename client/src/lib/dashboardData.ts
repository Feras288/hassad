// أنواع وحالات عرض مشتركة للوحة العميل. السجلات تأتي من tRPC ولا تحفظ هنا.

export interface Order {
  id: string;
  type: "product" | "service";
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  provider?: string;
  image?: string;
  rating?: number;
  trackingSteps?: { label: string; done: boolean; date?: string }[];
}

export interface DiagnosisRecord {
  id: string;
  cropName: string;
  diseaseName: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  date: string;
  imageUrl: string;
  status: "treated" | "monitoring" | "untreated";
  recommendation: string;
  productsRecommended: string[];
}

export interface FavoriteProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
  lastOrdered?: string;
}

export interface Notification {
  id: string;
  type: "order" | "diagnosis" | "service" | "promo" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface FarmStats {
  totalOrders: number;
  activeServices: number;
  diagnosesThisMonth: number;
  totalSpent: number;
  savedAmount: number;
  farmArea: number;
}

export const farmStats: FarmStats = { totalOrders: 0, activeServices: 0, diagnosesThisMonth: 0, totalSpent: 0, savedAmount: 0, farmArea: 0 };
export const orders: Order[] = [];
export const diagnosisRecords: DiagnosisRecord[] = [];
export const favoriteProducts: FavoriteProduct[] = [];
export const notifications: Notification[] = [];
export const monthlySpending: Array<{ month: string; amount: number }> = [];
export const upcomingEvents: Array<{ id: string; title: string; provider: string; date: string; time: string; type: "service" | "reminder" }> = [];

export const statusConfig = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  in_progress: { label: "جاري التنفيذ", color: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

export const severityConfig = {
  low: { label: "منخفضة", color: "bg-green-100 text-green-800", icon: "✅" },
  medium: { label: "متوسطة", color: "bg-yellow-100 text-yellow-800", icon: "⚠️" },
  high: { label: "عالية", color: "bg-orange-100 text-orange-800", icon: "🔶" },
  critical: { label: "حرجة", color: "bg-red-100 text-red-800", icon: "🚨" },
};

export const diagnosisStatusConfig = {
  treated: { label: "تم العلاج", color: "bg-green-100 text-green-800" },
  monitoring: { label: "تحت المراقبة", color: "bg-blue-100 text-blue-800" },
  untreated: { label: "لم يُعالج", color: "bg-red-100 text-red-800" },
};
