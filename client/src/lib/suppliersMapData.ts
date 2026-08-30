// واجهة بيانات خريطة الموردين. تُغذى الخريطة من سجلات الموردين الحية.

export interface SupplierLocation {
  id: string;
  name: string;
  type: "supplier" | "service";
  category: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  productsCount: number;
  totalRevenue: number;
  status: "active" | "pending" | "suspended";
  logo: string;
  tags: string[];
  description: string;
  verified: boolean;
}

export const suppliersMapData: SupplierLocation[] = [];
export const supplierCategories: string[] = [];
export const supplierRegions: string[] = [];
