/*
 * HASAAD PLATFORM — VendorProductsContext
 * Manages only products created during the active local editing session.
 * It intentionally starts empty and does not merge seed products.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/vendorDashboardData";

interface NewProductInput {
  name: string;
  category: string;
  subCategory?: string;
  brand?: string;
  unit: string;
  sku: string;
  description: string;
  keywords?: string;
  price: string;
  originalPrice?: string;
  minOrder?: string;
  weight?: string;
  stock: string;
  lowStockAlert?: string;
  freeShipping?: boolean;
  images: { url: string; isMain: boolean }[];
  specs: { key: string; value: string }[];
  status: "active" | "draft";
  featured?: boolean;
}

interface VendorProductsContextValue {
  products: Product[];
  addProduct: (input: NewProductInput) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStatus: (id: string) => void;
}

const STORAGE_KEY = "hasaad_vendor_products";

const VendorProductsContext = createContext<VendorProductsContextValue | null>(null);

export function VendorProductsProvider({ children }: { children: React.ReactNode }) {
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist dynamic products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicProducts));
  }, [dynamicProducts]);

  const products: Product[] = dynamicProducts;

  const addProduct = useCallback((input: NewProductInput): Product => {
    const mainImage = input.images.find((img) => img.isMain)?.url || input.images[0]?.url || "";
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: input.name,
      sku: input.sku || `SKU-${Date.now()}`,
      category: input.category,
      price: parseFloat(input.price) || 0,
      originalPrice: input.originalPrice ? parseFloat(input.originalPrice) : undefined,
      unit: input.unit || "قطعة",
      stock: parseInt(input.stock) || 0,
      sold: 0,
      growth: 0,
      status: input.status === "draft" ? "draft" : "active",
      image: mainImage,
      rating: 0,
      reviewCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDynamicProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString().split("T")[0];
    setDynamicProducts((prev) => {
      return prev.map((product) => (product.id === id ? { ...product, ...updates, updatedAt: now } : product));
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setDynamicProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setDynamicProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "draft" : "active" }
          : p
      )
    );
  }, []);

  return (
    <VendorProductsContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, toggleStatus }}
    >
      {children}
    </VendorProductsContext.Provider>
  );
}

export function useVendorProducts() {
  const ctx = useContext(VendorProductsContext);
  if (!ctx) throw new Error("useVendorProducts must be used inside VendorProductsProvider");
  return ctx;
}
