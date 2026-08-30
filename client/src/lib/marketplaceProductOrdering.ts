export type MarketplaceListingSort = "popular" | "rating" | "price-asc" | "price-desc" | "newest" | "discount" | "free-shipping" | "best-deal";

type SortableMarketplaceProduct = {
  rating: number;
  reviews: number;
  price: number;
  discount?: number;
  freeShipping: boolean;
  isNew?: boolean;
};

export function orderMarketplaceProducts<T extends SortableMarketplaceProduct>(products: T[], sortBy: MarketplaceListingSort) {
  const result = [...products];
  return result.sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating || b.reviews - a.reviews;
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      case "discount": return (b.discount ?? 0) - (a.discount ?? 0);
      case "free-shipping": return Number(b.freeShipping) - Number(a.freeShipping) || b.rating - a.rating;
      case "best-deal": return ((b.discount ?? 0) * 2 + Number(b.freeShipping) * 10 + b.rating) - ((a.discount ?? 0) * 2 + Number(a.freeShipping) * 10 + a.rating);
      default: return b.reviews - a.reviews;
    }
  });
}
