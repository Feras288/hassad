export function formatCartQuantityBadge(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return Math.floor(quantity).toLocaleString("ar-SA");
}
