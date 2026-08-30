export function getMarketplaceCategoryCount(products: Array<{ category: string }>, category: string) {
  return category === "الكل" ? products.length : products.filter((product) => product.category === category).length;
}
