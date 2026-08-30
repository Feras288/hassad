// أنواع وحالات فارغة للوحات المورد ومقدم الخدمة. لا يحتوي هذا الملف على بيانات حسابات أو مبيعات تجريبية.

export type VendorType = "supplier" | "provider";

export interface VendorProfile {
  id: string;
  name: string;
  type: VendorType;
  avatar: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  joinDate: string;
  location: string;
  specialty: string;
}

export interface VendorStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeListings: number;
  listingsChange: number;
  avgRating: number;
  ratingChange: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyVisits: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  sold: number;
  growth: number;
  status: "active" | "inactive" | "out_of_stock" | "low_stock" | "pending" | "draft";
  image: string;
  rating: number;
  reviewCount: number;
  revenue: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceListing {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType: "fixed" | "hourly" | "per_hectare";
  status: "active" | "inactive" | "pending";
  bookings: number;
  rating: number;
  reviewCount: number;
  image: string;
  createdAt: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  quantity: number;
  price: number;
  unit: string;
  image: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAvatar: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  location: string;
  paymentMethod: string;
  type: "product" | "service";
  notes?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  sold: number;
  revenue: number;
  growth: number;
}

export interface VendorNotification {
  id: string;
  type: "order" | "review" | "stock" | "payment" | "booking";
  message: string;
  time: string;
  read: boolean;
}

export const vendorProfile: VendorProfile = { id: "", name: "", type: "supplier", avatar: "", rating: 0, reviewCount: 0, verified: false, joinDate: "", location: "", specialty: "" };
export const providerProfile: VendorProfile = { id: "", name: "", type: "provider", avatar: "", rating: 0, reviewCount: 0, verified: false, joinDate: "", location: "", specialty: "" };
export const vendorStats: VendorStats = { totalRevenue: 0, revenueChange: 0, totalOrders: 0, ordersChange: 0, activeListings: 0, listingsChange: 0, avgRating: 0, ratingChange: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, monthlyVisits: 0 };
export const providerStats: VendorStats = { totalRevenue: 0, revenueChange: 0, totalOrders: 0, ordersChange: 0, activeListings: 0, listingsChange: 0, avgRating: 0, ratingChange: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, monthlyVisits: 0 };
export const revenueData: RevenueData[] = [];
export const vendorProducts: Product[] = [];
export const providerServices: ServiceListing[] = [];
export const vendorOrders: VendorOrder[] = [];
export const providerOrders: VendorOrder[] = [];
export const topProducts: TopProduct[] = [];
export const vendorNotifications: VendorNotification[] = [];

export const getStatusLabel = (status: string): string => ({ pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد المعالجة", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" }[status] ?? status);
export const getStatusColor = (status: string): string => ({ pending: "bg-amber-50 text-amber-700", confirmed: "bg-blue-50 text-blue-700", processing: "bg-violet-50 text-violet-700", shipped: "bg-sky-50 text-sky-700", delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-700" }[status] ?? "bg-gray-100 text-gray-600");
