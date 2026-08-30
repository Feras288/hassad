import type { PriceTier } from "@/lib/tierPricing";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  location: string;
  images?: string[];
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  badgeColor?: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categorySlug: string;
  brand: string;
  sku: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  priceTiers: PriceTier[];
  tierPricingStartsAt?: Date | null;
  tierPricingEndsAt?: Date | null;
  discount?: number;
  unit: string;
  minOrder: number;
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: string;
  badge?: string;
  badgeColor?: string;
  images: string[];
  shortDesc: string;
  longDesc: string;
  highlights: string[];
  specs: ProductSpec[];
  usageInstructions: string[];
  certifications: string[];
  supplier: {
    id?: string;
    name: string;
    logo: string;
    rating: number;
    reviewCount: number;
    location: string;
    memberSince: string;
    verified: boolean;
    responseRate: string;
    responseTime: string;
  };
  shipping: {
    free: boolean;
    estimatedDays: string;
    regions: string;
  };
  reviews: ProductReview[];
  relatedProducts: RelatedProduct[];
  tags: string[];
  shortDescEn?: string;
  longDescEn?: string;
  highlightsEn?: string[];
  specsEn?: ProductSpec[];
  usageInstructionsEn?: string[];
  certificationsEn?: string[];
  tagsEn?: string[];
}

export interface CatalogProductSource {
  id: string;
  name: string;
  nameEn: string | null;
  sku: string;
  category: string;
  brand: string | null;
  vendor: string;
  vendorId: string;
  price: number;
  originalPrice: number | null;
  priceTiers: PriceTier[] | null;
  tierPricingStartsAt: Date | null;
  tierPricingEndsAt: Date | null;
  unit: string;
  minOrder: number;
  stock: number;
  sold: number;
  images: string[];
  shortDesc: string | null;
  longDesc: string | null;
  highlights: string[] | null;
  specs: ProductSpec[] | null;
  usageInstructions: string[] | null;
  certifications: string[] | null;
  tags: string[] | null;
  shortDescEn: string | null;
  longDescEn: string | null;
  highlightsEn: string[] | null;
  specsEn: ProductSpec[] | null;
  usageInstructionsEn: string[] | null;
  certificationsEn: string[] | null;
  tagsEn: string[] | null;
  rating: number;
  reviewCount: number;
}

const toArabicNumber = (value: number) => new Intl.NumberFormat("ar-SA").format(value);

/** Converts a real catalog row without inventing imagery, certifications, reviews, or supplier performance. */
export function mapCatalogProductToDetail(source: CatalogProductSource): Product {
  const discount = source.originalPrice && source.originalPrice > source.price
    ? Math.round(((source.originalPrice - source.price) / source.originalPrice) * 100)
    : undefined;
  const categorySlug = source.category.trim().replaceAll(/\s+/g, "-");

  return {
    id: source.id,
    name: source.name,
    nameEn: source.nameEn ?? source.name,
    category: source.category,
    categorySlug,
    brand: source.brand ?? source.vendor,
    sku: source.sku,
    price: source.price,
    priceFormatted: `${toArabicNumber(source.price)} ريال`,
    originalPrice: source.originalPrice ?? undefined,
    originalPriceFormatted: source.originalPrice ? `${toArabicNumber(source.originalPrice)} ريال` : undefined,
    priceTiers: source.priceTiers ?? [],
    tierPricingStartsAt: source.tierPricingStartsAt,
    tierPricingEndsAt: source.tierPricingEndsAt,
    discount,
    unit: source.unit,
    minOrder: source.minOrder,
    stock: source.stock,
    rating: source.rating / 100,
    reviewCount: source.reviewCount,
    soldCount: toArabicNumber(source.sold),
    badge: discount ? `خصم ${toArabicNumber(discount)}٪` : undefined,
    badgeColor: discount ? "#C65A45" : undefined,
    images: source.images,
    shortDesc: source.shortDesc ?? "",
    longDesc: source.longDesc ?? "",
    highlights: source.highlights ?? [],
    specs: source.specs ?? [],
    usageInstructions: source.usageInstructions ?? [],
    certifications: source.certifications ?? [],
    supplier: {
      id: source.vendorId,
      name: source.vendor,
      logo: "",
      rating: source.rating / 100,
      reviewCount: source.reviewCount,
      location: "",
      memberSince: "",
      verified: false,
      responseRate: "",
      responseTime: "",
    },
    shipping: { free: false, estimatedDays: "", regions: "" },
    reviews: [],
    relatedProducts: [],
    tags: source.tags ?? [],
    shortDescEn: source.shortDescEn ?? undefined,
    longDescEn: source.longDescEn ?? undefined,
    highlightsEn: source.highlightsEn ?? undefined,
    specsEn: source.specsEn ?? undefined,
    usageInstructionsEn: source.usageInstructionsEn ?? undefined,
    certificationsEn: source.certificationsEn ?? undefined,
    tagsEn: source.tagsEn ?? undefined,
  };
}
