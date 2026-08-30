/*
 * HASAAD PLATFORM — FavoriteButton Component
 * Reusable heart button for toggling product favorites
 * Supports multiple sizes and variants
 */
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites, type FavoriteProduct } from "@/contexts/FavoritesContext";

interface FavoriteButtonProps {
  product: FavoriteProduct;
  size?: "sm" | "md" | "lg";
  variant?: "circle" | "pill";
  className?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: { btn: "w-7 h-7", icon: "w-3.5 h-3.5" },
  md: { btn: "w-9 h-9", icon: "w-4 h-4" },
  lg: { btn: "w-10 h-10", icon: "w-5 h-5" },
};

export default function FavoriteButton({
  product,
  size = "md",
  variant = "circle",
  className = "",
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.id);
  const { btn, icon } = sizeMap[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    if (!active) {
      toast.success(`تمت إضافة "${product.name}" إلى المفضلة`, {
        description: "يمكنك الوصول إليها من لوحة التحكم",
        action: {
          label: "عرض المفضلة",
          onClick: () => (window.location.href = "/dashboard/favorites"),
        },
      });
    } else {
      toast.info(`تمت إزالة "${product.name}" من المفضلة`);
    }
  };

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        aria-label={active ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${
          active
            ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
            : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
        } ${className}`}
      >
        <Heart
          className={`${icon} transition-all duration-200 ${
            active ? "fill-red-500 text-red-500 scale-110" : ""
          }`}
        />
        {active ? "في المفضلة" : "أضف للمفضلة"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      className={`${btn} ${
        variant === "circle" ? "rounded-full" : "rounded-xl"
      } flex items-center justify-center transition-all duration-200 ${
        active
          ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
          : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm backdrop-blur-sm"
      } ${className}`}
    >
      <Heart
        className={`${icon} transition-all duration-200 ${
          active ? "fill-red-500 text-red-500 scale-110" : ""
        }`}
      />
    </button>
  );
}
