// أنواع مشتركة للوحات الإدارة. لا يحتوي هذا الملف على سجلات تجريبية.

export type UserRole = "farmer" | "vendor" | "provider" | "admin";
export type UserStatus = "active" | "suspended" | "pending" | "banned";
export type VendorStatus = "active" | "pending" | "suspended" | "rejected";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type ProductStatus = "active" | "inactive" | "pending_review" | "rejected" | "out_of_stock";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  location: string;
  joinDate: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  verified: boolean;
}

export interface AdminVendor {
  id: string;
  name: string;
  type: "supplier" | "provider";
  email: string;
  phone: string;
  avatar: string;
  status: VendorStatus;
  location: string;
  joinDate: string;
  lastActive: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  commission: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  category: string;
  lat?: number;
  lng?: number;
  description?: string;
  tags?: string[];
  address?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface PriceTier {
  minQuantity: number;
  unitPrice: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  nameEn?: string;
  sku: string;
  category: string;
  brand?: string;
  vendor: string;
  vendorId: string;
  price: number;
  originalPrice?: number;
  priceTiers?: PriceTier[];
  tierPricingStartsAt?: Date | null;
  tierPricingEndsAt?: Date | null;
  unit?: string;
  minOrder?: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  images: string[];
  image: string;
  shortDesc?: string;
  longDesc?: string;
  highlights?: string[];
  specs?: ProductSpec[];
  usageInstructions?: string[];
  certifications?: string[];
  tags?: string[];
  shortDescEn?: string;
  longDescEn?: string;
  highlightsEn?: string[];
  specsEn?: ProductSpec[];
  usageInstructionsEn?: string[];
  certificationsEn?: string[];
  tagsEn?: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  customerPhone?: string;
  customerEmail?: string;
  vendor: string;
  vendorId: string;
  items: number;
  orderItems: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  date: string;
  deliveryDate?: string;
  address: string;
  location: string;
  commission: number;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  userId: string;
  userRole: UserRole;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: number;
}

export interface AdminStats {
  totalUsers: number;
  usersChange: number;
  totalVendors: number;
  vendorsChange: number;
  totalOrders: number;
  ordersChange: number;
  totalRevenue: number;
  revenueChange: number;
  totalProducts: number;
  productsChange: number;
  pendingVendors: number;
  pendingProducts: number;
  openTickets: number;
  platformCommission: number;
  commissionChange: number;
  activeUsers: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
  commission: number;
  newUsers: number;
}

export interface CategoryStats {
  name: string;
  products: number;
  orders: number;
  revenue: number;
  growth: number;
}

export const adminStats: AdminStats | null = null;
export const adminRevenueData: RevenueByMonth[] = [];
export const categoryStats: CategoryStats[] = [];
export const adminUsers: AdminUser[] = [];
export const adminVendors: AdminVendor[] = [];
export const adminProducts: AdminProduct[] = [];
export const adminOrders: AdminOrder[] = [];
export const supportTickets: SupportTicket[] = [];
