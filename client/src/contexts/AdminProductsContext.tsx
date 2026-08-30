/*
 * HASAAD PLATFORM — Admin Products Context
 * Database-backed catalog administration. Public storefront reads only approved records;
 * this context keeps mutations restricted to authenticated administrators.
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { AdminProduct, ProductStatus } from "@/lib/adminData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface AdminCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  productCount: number;
  description?: string;
  active: boolean;
  createdAt: string;
}

type CatalogRow = {
  id: string; name: string; nameEn: string | null; sku: string; category: string; brand: string | null;
  vendor: string; vendorId: string; price: number; originalPrice: number | null; priceTiers: Array<{ minQuantity: number; unitPrice: number }> | null; tierPricingStartsAt: Date | null; tierPricingEndsAt: Date | null; unit: string;
  minOrder: number; stock: number; sold: number; status: ProductStatus; images: string[];
  shortDesc: string | null; longDesc: string | null; highlights: string[] | null;
  specs: Array<{ label: string; value: string }> | null; usageInstructions: string[] | null;
  certifications: string[] | null; tags: string[] | null; rating: number; reviewCount: number;
  shortDescEn: string | null; longDescEn: string | null; highlightsEn: string[] | null;
  specsEn: Array<{ label: string; value: string }> | null; usageInstructionsEn: string[] | null;
  certificationsEn: string[] | null; tagsEn: string[] | null;
  createdAt: Date; updatedAt: Date;
};

const toAdminProduct = (product: CatalogRow): AdminProduct => ({
  id: product.id,
  name: product.name,
  nameEn: product.nameEn ?? undefined,
  sku: product.sku,
  category: product.category,
  brand: product.brand ?? undefined,
  vendor: product.vendor,
  vendorId: product.vendorId,
  price: product.price,
  originalPrice: product.originalPrice ?? undefined,
  priceTiers: product.priceTiers ?? undefined,
  tierPricingStartsAt: product.tierPricingStartsAt,
  tierPricingEndsAt: product.tierPricingEndsAt,
  unit: product.unit,
  minOrder: product.minOrder,
  stock: product.stock,
  sold: product.sold,
  status: product.status,
  images: product.images,
  image: product.images[0] ?? "",
  shortDesc: product.shortDesc ?? undefined,
  longDesc: product.longDesc ?? undefined,
  highlights: product.highlights ?? undefined,
  specs: product.specs ?? undefined,
  usageInstructions: product.usageInstructions ?? undefined,
  certifications: product.certifications ?? undefined,
  tags: product.tags ?? undefined,
  shortDescEn: product.shortDescEn ?? undefined,
  longDescEn: product.longDescEn ?? undefined,
  highlightsEn: product.highlightsEn ?? undefined,
  specsEn: product.specsEn ?? undefined,
  usageInstructionsEn: product.usageInstructionsEn ?? undefined,
  certificationsEn: product.certificationsEn ?? undefined,
  tagsEn: product.tagsEn ?? undefined,
  rating: product.rating / 100,
  reviewCount: product.reviewCount,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

const toCatalogPayload = (product: AdminProduct) => ({
  id: product.id,
  name: product.name,
  nameEn: product.nameEn ?? null,
  sku: product.sku,
  category: product.category,
  brand: product.brand ?? null,
  vendor: product.vendor,
  vendorId: product.vendorId,
  price: product.price,
  originalPrice: product.originalPrice ?? null,
  priceTiers: product.priceTiers ?? null,
  tierPricingStartsAt: product.tierPricingStartsAt ?? null,
  tierPricingEndsAt: product.tierPricingEndsAt ?? null,
  unit: product.unit ?? "وحدة",
  minOrder: product.minOrder ?? 1,
  stock: product.stock,
  sold: product.sold,
  status: product.status,
  images: product.images.length ? product.images : [product.image],
  shortDesc: product.shortDesc ?? null,
  longDesc: product.longDesc ?? null,
  highlights: product.highlights ?? null,
  specs: product.specs ?? null,
  usageInstructions: product.usageInstructions ?? null,
  certifications: product.certifications ?? null,
  tags: product.tags ?? null,
  shortDescEn: product.shortDescEn ?? null,
  longDescEn: product.longDescEn ?? null,
  highlightsEn: product.highlightsEn ?? null,
  specsEn: product.specsEn ?? null,
  usageInstructionsEn: product.usageInstructionsEn ?? null,
  certificationsEn: product.certificationsEn ?? null,
  tagsEn: product.tagsEn ?? null,
  rating: Math.round(product.rating * 100),
  reviewCount: product.reviewCount,
});

interface AdminProductsContextType {
  products: AdminProduct[];
  categories: AdminCategory[];
  addProduct: (product: Omit<AdminProduct, "id" | "createdAt" | "rating" | "reviewCount" | "sold">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => void;
  changeProductStatus: (id: string, status: ProductStatus) => void;
  addCategory: (cat: Omit<AdminCategory, "id" | "createdAt" | "productCount">) => void;
  updateCategory: (id: string, updates: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => boolean;
}

const AdminProductsContext = createContext<AdminProductsContextType | null>(null);

export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const catalogQuery = trpc.products.adminList.useQuery(undefined, { enabled: isAdmin, retry: false });
  const refreshProducts = () => {
    utils.products.adminList.invalidate();
    utils.products.featured.invalidate();
    utils.products.byId.invalidate();
  };
  const createMutation = trpc.products.create.useMutation({ onSuccess: refreshProducts });
  const updateMutation = trpc.products.update.useMutation({ onSuccess: refreshProducts });
  const statusMutation = trpc.products.changeStatus.useMutation({ onSuccess: refreshProducts });
  const deleteMutation = trpc.products.delete.useMutation({ onSuccess: refreshProducts });
  const categoriesQuery = trpc.adminManagement.categories.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const createCategoryMutation = trpc.adminManagement.categories.create.useMutation({ onSuccess: () => utils.adminManagement.categories.list.invalidate() });
  const updateCategoryMutation = trpc.adminManagement.categories.update.useMutation({ onSuccess: () => utils.adminManagement.categories.list.invalidate() });
  const deleteCategoryMutation = trpc.adminManagement.categories.delete.useMutation({ onSuccess: () => utils.adminManagement.categories.list.invalidate() });

  const products = useMemo(() => (catalogQuery.data ?? []).map((product) => toAdminProduct(product as CatalogRow)), [catalogQuery.data]);
  const categories = useMemo<AdminCategory[]>(() => (categoriesQuery.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    nameEn: category.nameEn,
    icon: category.icon,
    color: category.color,
    productCount: products.filter((product) => product.category === category.name).length,
    description: category.description ?? undefined,
    active: category.active,
    createdAt: category.createdAt.toISOString(),
  })), [categoriesQuery.data, products]);

  const addProduct: AdminProductsContextType["addProduct"] = async (data) => {
    const newProduct: AdminProduct = { ...data, id: `ap-${Date.now()}`, createdAt: new Date().toISOString(), rating: 0, reviewCount: 0, sold: 0 };
    await createMutation.mutateAsync(toCatalogPayload(newProduct));
  };

  const updateProduct: AdminProductsContextType["updateProduct"] = async (id, updates) => {
    const current = products.find((product) => product.id === id);
    if (!current) return;
    const { id: _id, ...payload } = toCatalogPayload({ ...current, ...updates, images: updates.images ?? current.images, image: updates.image ?? current.image });
    await updateMutation.mutateAsync({ id, updates: payload });
  };

  const deleteProduct = (id: string) => deleteMutation.mutate({ id });
  const changeProductStatus = (id: string, status: ProductStatus) => statusMutation.mutate({ id, status });
  const addCategory: AdminProductsContextType["addCategory"] = (data) => createCategoryMutation.mutate({ id: `cat_${Date.now()}`, ...data, description: data.description ?? null });
  const updateCategory = (id: string, updates: Partial<AdminCategory>) => updateCategoryMutation.mutate({ id, updates: { name: updates.name, nameEn: updates.nameEn, icon: updates.icon, color: updates.color, description: updates.description === undefined ? undefined : updates.description ?? null, active: updates.active } });
  const deleteCategory = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category || products.some((product) => product.category === category.name)) return false;
    deleteCategoryMutation.mutate({ id });
    return true;
  };

  return <AdminProductsContext.Provider value={{ products, categories, addProduct, updateProduct, deleteProduct, changeProductStatus, addCategory, updateCategory, deleteCategory }}>{children}</AdminProductsContext.Provider>;
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext);
  if (!ctx) throw new Error("useAdminProducts must be used within AdminProductsProvider");
  return ctx;
}
