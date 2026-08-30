// Hasaad Platform — Suppliers Map Page
// خريطة الموردين التفاعلية مع Google Maps وفلاتر متقدمة

import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import { type SupplierLocation } from "@/lib/suppliersMapData";
import { useAdminVendors } from "@/contexts/AdminVendorsContext";
import type { AdminVendor } from "@/lib/adminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Star,
  Phone,
  Mail,
  Package,
  Filter,
  X,
  CheckCircle,
  ChevronRight,
  Building2,
  Wrench,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "wouter";

// ألوان الفئات
const categoryColors: Record<string, string> = {
  "أسمدة ومبيدات":       "#22c55e",
  "بذور وشتلات":         "#84cc16",
  "معدات الري":          "#06b6d4",
  "معدات زراعية":        "#f59e0b",
  "منتجات زراعية":       "#10b981",
  "أعلاف ومواد غذائية": "#8b5cf6",
  "استشارات زراعية":     "#3b82f6",
  "تحليل التربة":        "#a16207",
  "هندسة زراعية":        "#ef4444",
};

function SupplierCard({
  supplier,
  isSelected,
  onClick,
}: {
  supplier: SupplierLocation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusMap: Record<string, { label: string; color: string }> = {
    active:    { label: "نشط",               color: "bg-green-500/20 text-green-400 border-green-500/30" },
    pending:   { label: "بانتظار الموافقة",  color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    suspended: { label: "موقوف",             color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const s = statusMap[supplier.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-green-900/30 border-green-500/50 shadow-lg shadow-green-900/20"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={supplier.logo}
          alt={supplier.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/20"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm text-white truncate">{supplier.name}</span>
            {supplier.verified && (
              <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: (categoryColors[supplier.category] || "#6b7280") + "22",
                color: categoryColors[supplier.category] || "#9ca3af",
              }}
            >
              {supplier.category}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${s.color}`}>
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {supplier.city}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {supplier.rating}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {supplier.productsCount} منتج
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

function SupplierDetailPanel({
  supplier,
  onClose,
}: {
  supplier: SupplierLocation;
  onClose: () => void;
}) {
  const statusMap: Record<string, { label: string; color: string }> = {
    active:    { label: "نشط",               color: "bg-green-500/20 text-green-400 border-green-500/30" },
    pending:   { label: "بانتظار الموافقة",  color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    suspended: { label: "موقوف",             color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const s = statusMap[supplier.status];

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#0f1a0f] border border-white/15 rounded-2xl shadow-2xl z-30 overflow-hidden">
      {/* Header */}
      <div className="relative p-4 border-b border-white/10">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
        <div className="flex items-start gap-3">
          <img
            src={supplier.logo}
            alt={supplier.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-bold text-white text-sm leading-tight">{supplier.name}</h3>
              {supplier.verified && (
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: (categoryColors[supplier.category] || "#6b7280") + "22",
                  color: categoryColors[supplier.category] || "#9ca3af",
                }}
              >
                {supplier.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${s.color}`}>
                {s.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border-b border-white/10">
        {[
          { label: "التقييم", value: supplier.rating.toString(), icon: "⭐" },
          { label: "المنتجات", value: supplier.productsCount.toString(), icon: "📦" },
          { label: "المراجعات", value: supplier.reviewCount.toString(), icon: "💬" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 text-center border-l border-white/10 last:border-0">
            <div className="text-base font-bold text-white">{stat.icon} {stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-300 leading-relaxed">{supplier.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            <span>{supplier.address}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span dir="ltr">{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>{supplier.email}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {supplier.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            onClick={() => window.open(`tel:${supplier.phone}`, "_self")}
          >
            <Phone className="w-3.5 h-3.5 ml-1" />
            تواصل
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 text-xs h-8"
            onClick={() => window.open(`mailto:${supplier.email}`, "_self")}
          >
            <Mail className="w-3.5 h-3.5 ml-1" />
            راسل
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [selectedSupplier, setSelectedSupplier] = useState<SupplierLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // ربط AdminVendorsContext
  const { vendors } = useAdminVendors();

  // إحداثيات مدن المملكة
  const cityCoords: Record<string, { lat: number; lng: number; region: string }> = {
    "الرياض": { lat: 24.7136, lng: 46.6753, region: "منطقة الرياض" },
    "جدة": { lat: 21.4858, lng: 39.1925, region: "منطقة مكة المكرمة" },
    "مكة المكرمة": { lat: 21.3891, lng: 39.8579, region: "منطقة مكة المكرمة" },
    "المدينة المنورة": { lat: 24.5247, lng: 39.5692, region: "منطقة المدينة المنورة" },
    "الدمام": { lat: 26.4207, lng: 50.0888, region: "المنطقة الشرقية" },
    "الخبر": { lat: 26.2172, lng: 50.1971, region: "المنطقة الشرقية" },
    "القصيم": { lat: 26.3260, lng: 43.9750, region: "منطقة القصيم" },
    "بريدة": { lat: 26.3260, lng: 43.9750, region: "منطقة القصيم" },
    "أبها": { lat: 18.2164, lng: 42.5053, region: "منطقة عسير" },
    "حائل": { lat: 27.5219, lng: 41.6905, region: "منطقة حائل" },
    "الطائف": { lat: 21.2854, lng: 40.4148, region: "منطقة مكة المكرمة" },
    "تبوك": { lat: 28.3998, lng: 36.5715, region: "منطقة تبوك" },
    "نجران": { lat: 17.4924, lng: 44.1277, region: "منطقة نجران" },
    "جازان": { lat: 16.8892, lng: 42.5611, region: "منطقة جازان" },
  };

  // تحويل AdminVendor إلى SupplierLocation
  const vendorToSupplierLocation = (v: AdminVendor, index: number): SupplierLocation => {
    const coords = cityCoords[v.location] || { lat: 24.7136, lng: 46.6753, region: "منطقة الرياض" };
    return {
      id: v.id,
      name: v.name,
      type: v.type === "provider" ? "service" : "supplier",
      category: v.category,
      city: v.location,
      region: coords.region,
      lat: (v as any).lat ?? (coords.lat + (index % 3 - 1) * 0.015),
      lng: (v as any).lng ?? (coords.lng + (index % 2 === 0 ? index * 0.008 : -index * 0.008)),
      address: (v as any).address ?? `${v.location}، المملكة العربية السعودية`,
      phone: v.phone,
      email: v.email,
      rating: v.rating,
      reviewCount: v.reviewCount,
      productsCount: v.totalProducts,
      totalRevenue: v.totalRevenue,
      status: v.status === "active" ? "active" : v.status === "pending" ? "pending" : "suspended",
      logo: v.avatar,
      tags: (v as any).tags ?? [v.category],
      description: (v as any).description ?? `${v.name} — ${v.category}`,
      verified: v.verified,
    };
  };

  // تعرض الخريطة الموردين الحيين المتاحين للمسؤول فقط، دون احتياط ثابت.
  const realVendors: SupplierLocation[] = vendors.map(vendorToSupplierLocation);
  const allSuppliersData: SupplierLocation[] = realVendors;

  // الفئات والمناطق الديناميكية
  const dynamicCategories = ["all", ...Array.from(new Set(allSuppliersData.map(s => s.category)))];
  const dynamicRegions = ["all", ...Array.from(new Set(allSuppliersData.map(s => s.region)))];

  // فلترة الموردين
  const filteredSuppliers = allSuppliersData.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.name.includes(searchQuery) ||
      s.city.includes(searchQuery) ||
      s.category.includes(searchQuery);
    const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchRegion = selectedRegion === "all" || s.region === selectedRegion;
    const matchType = selectedType === "all" || s.type === selectedType;
    const matchStatus = selectedStatus === "all" || s.status === selectedStatus;
    return matchSearch && matchCategory && matchRegion && matchType && matchStatus;
  });

  // إنشاء العلامات على الخريطة
  const createMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // حذف العلامات القديمة
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    filteredSuppliers.forEach((supplier) => {
      const color = categoryColors[supplier.category] || "#6b7280";
      const isSelected = selectedSupplier?.id === supplier.id;

      // إنشاء عنصر HTML للعلامة
      const markerEl = document.createElement("div");
      markerEl.style.cssText = `
        width: ${isSelected ? "44px" : "36px"};
        height: ${isSelected ? "44px" : "36px"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        border: 3px solid ${isSelected ? "#fff" : color + "99"};
        box-shadow: 0 4px 12px ${color}66;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const inner = document.createElement("div");
      inner.style.cssText = `
        transform: rotate(45deg);
        font-size: ${isSelected ? "16px" : "14px"};
      `;
      inner.textContent = supplier.type === "service" ? "🔧" : "🌿";
      markerEl.appendChild(inner);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: supplier.lat, lng: supplier.lng },
        content: markerEl,
        title: supplier.name,
      });

      marker.addListener("click", () => {
        setSelectedSupplier(supplier);
        mapRef.current?.panTo({ lat: supplier.lat, lng: supplier.lng });
        mapRef.current?.setZoom(12);
      });

      markersRef.current.push(marker);
    });
  }, [filteredSuppliers, selectedSupplier]);

  useEffect(() => {
    if (mapReady) {
      createMarkers();
    }
  }, [mapReady, createMarkers]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  const handleSupplierClick = (supplier: SupplierLocation) => {
    setSelectedSupplier(supplier);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: supplier.lat, lng: supplier.lng });
      mapRef.current.setZoom(12);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRegion("all");
    setSelectedType("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedRegion !== "all" ||
    selectedType !== "all" || selectedStatus !== "all";

  // إحصائيات
  const stats = {
    total: filteredSuppliers.length,
    active: filteredSuppliers.filter((s) => s.status === "active").length,
    suppliers: filteredSuppliers.filter((s) => s.type === "supplier").length,
    services: filteredSuppliers.filter((s) => s.type === "service").length,
  };

  return (
    <div className="min-h-screen bg-[#0a140a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f1a0f]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                ← العودة
              </Link>
              <div className="w-px h-4 bg-white/20" />
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  خريطة الموردين
                </h1>
                <p className="text-xs text-gray-400">اكتشف الموردين والمزودين في منطقتك</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4">
              {[
                { icon: Users, label: "إجمالي", value: stats.total, color: "text-white" },
                { icon: CheckCircle, label: "نشط", value: stats.active, color: "text-green-400" },
                { icon: Building2, label: "موردون", value: stats.suppliers, color: "text-blue-400" },
                { icon: Wrench, label: "خدمات", value: stats.services, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 bg-[#0f1a0f] border-l border-white/10 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو المدينة..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-9 text-sm h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 h-8 text-xs border-white/20 ${showFilters ? "bg-green-900/30 text-green-400 border-green-500/30" : "text-gray-300 hover:bg-white/10"}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 ml-1" />
                فلاتر متقدمة
                {hasActiveFilters && (
                  <span className="mr-1 w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="space-y-2 pt-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {dynamicCategories.filter((category) => category !== "all").map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                    <SelectValue placeholder="المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المناطق</SelectItem>
                    {dynamicRegions.filter((region) => region !== "all").map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="supplier">مورد</SelectItem>
                      <SelectItem value="service">خدمة</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="pending">بانتظار</SelectItem>
                      <SelectItem value="suspended">موقوف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-base">🌿</span> مورد منتجات
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base">🔧</span> مزود خدمات
              </span>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا يوجد موردون يطابقون الفلاتر المحددة</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="mt-2 text-green-400 hover:text-green-300 text-xs"
                >
                  مسح الفلاتر
                </Button>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  isSelected={selectedSupplier?.id === supplier.id}
                  onClick={() => handleSupplierClick(supplier)}
                />
              ))
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapView
            initialCenter={{ lat: 24.7136, lng: 44.0 }}
            initialZoom={6}
            onMapReady={handleMapReady}
          />

          {/* Selected Supplier Detail Panel */}
          {selectedSupplier && (
            <SupplierDetailPanel
              supplier={selectedSupplier}
              onClose={() => setSelectedSupplier(null)}
            />
          )}

          {/* Map Legend Overlay */}
          <div className="absolute top-4 right-4 bg-[#0f1a0f]/90 backdrop-blur-sm border border-white/15 rounded-xl p-3 z-20">
            <p className="text-xs font-semibold text-gray-300 mb-2">الفئات</p>
            <div className="space-y-1.5">
              {Object.entries(categoryColors).slice(0, 5).map(([cat, color]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                  className={`flex items-center gap-2 text-xs w-full text-right transition-opacity ${
                    selectedCategory !== "all" && selectedCategory !== cat ? "opacity-40" : ""
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-300">{cat}</span>
                </button>
              ))}
              {Object.keys(categoryColors).length > 5 && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  <Filter className="w-3 h-3" />
                  المزيد...
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="absolute top-4 left-4 bg-[#0f1a0f]/90 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2 z-20">
            <p className="text-xs text-gray-300">
              <span className="font-bold text-white text-sm">{filteredSuppliers.length}</span>
              {" "}مورد على الخريطة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
