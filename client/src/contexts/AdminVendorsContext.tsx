import { createContext, ReactNode, useContext, useMemo } from "react";
import { AdminVendor, VendorStatus } from "@/lib/adminData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface VendorFormData {
  name: string;
  type: "supplier" | "provider";
  category: string;
  status: VendorStatus;
  verified: boolean;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  commission: number;
  description?: string;
  website?: string;
  crNumber?: string;
  vatNumber?: string;
  bankName?: string;
  bankIban?: string;
}

interface AdminVendorsContextType {
  vendors: AdminVendor[];
  addVendor: (data: VendorFormData) => void;
  updateVendor: (id: string, data: Partial<VendorFormData>) => void;
  deleteVendor: (id: string) => void;
  changeStatus: (id: string, status: VendorStatus) => void;
  toggleVerified: (id: string) => void;
}

const AdminVendorsContext = createContext<AdminVendorsContextType | null>(null);

export function AdminVendorsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const vendorsQuery = trpc.adminManagement.vendors.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const invalidate = () => utils.adminManagement.vendors.list.invalidate();
  const createMutation = trpc.adminManagement.vendors.create.useMutation({ onSuccess: invalidate });
  const updateMutation = trpc.adminManagement.vendors.update.useMutation({ onSuccess: invalidate });
  const deleteMutation = trpc.adminManagement.vendors.delete.useMutation({ onSuccess: invalidate });

  const vendors = useMemo<AdminVendor[]>(() => (vendorsQuery.data ?? []).map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    type: vendor.type,
    email: vendor.email,
    phone: vendor.phone,
    avatar: vendor.logoUrl ?? "",
    status: vendor.status,
    location: vendor.location,
    joinDate: new Date(vendor.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
    lastActive: "—",
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    commission: vendor.commission,
    rating: 0,
    reviewCount: 0,
    verified: vendor.verified,
    category: vendor.category,
  })), [vendorsQuery.data]);

  const addVendor = (data: VendorFormData) => createMutation.mutate({
    id: `vendor_${Date.now()}`,
    name: data.name,
    type: data.type,
    category: data.category,
    status: data.status,
    verified: data.verified,
    email: data.email,
    phone: data.phone,
    location: data.location,
    logoUrl: data.avatar || null,
    commission: data.commission,
    description: data.description || null,
    website: data.website || null,
    crNumber: data.crNumber || null,
    vatNumber: data.vatNumber || null,
    bankName: data.bankName || null,
    bankIban: data.bankIban || null,
  });

  const updateVendor = (id: string, data: Partial<VendorFormData>) => updateMutation.mutate({
    id,
    updates: {
      name: data.name,
      type: data.type,
      category: data.category,
      status: data.status,
      verified: data.verified,
      email: data.email,
      phone: data.phone,
      location: data.location,
      logoUrl: data.avatar === undefined ? undefined : data.avatar || null,
      commission: data.commission,
      description: data.description === undefined ? undefined : data.description || null,
      website: data.website === undefined ? undefined : data.website || null,
      crNumber: data.crNumber === undefined ? undefined : data.crNumber || null,
      vatNumber: data.vatNumber === undefined ? undefined : data.vatNumber || null,
      bankName: data.bankName === undefined ? undefined : data.bankName || null,
      bankIban: data.bankIban === undefined ? undefined : data.bankIban || null,
    },
  });

  const deleteVendor = (id: string) => deleteMutation.mutate({ id });
  const changeStatus = (id: string, status: VendorStatus) => updateVendor(id, { status });
  const toggleVerified = (id: string) => {
    const vendor = vendors.find((item) => item.id === id);
    if (vendor) updateVendor(id, { verified: !vendor.verified });
  };

  return <AdminVendorsContext.Provider value={{ vendors, addVendor, updateVendor, deleteVendor, changeStatus, toggleVerified }}>{children}</AdminVendorsContext.Provider>;
}

export function useAdminVendors() {
  const ctx = useContext(AdminVendorsContext);
  if (!ctx) throw new Error("useAdminVendors must be used within AdminVendorsProvider");
  return ctx;
}
