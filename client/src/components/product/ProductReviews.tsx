/*
 * HASAAD PLATFORM — Product Reviews Section
 * Design: "الحقل الرقمي" — Reviews with rating breakdown, filters, and review cards
 * Full RTL Arabic layout
 */

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, Camera, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/lib/productsData";

interface ProductReviewsProps {
  product: Product;
}

const ratingBreakdown = [
  { stars: 5, count: 89, percentage: 72 },
  { stars: 4, count: 24, percentage: 19 },
  { stars: 3, count: 7, percentage: 6 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 2, percentage: 1 },
];

const filterOptions = ["الكل", "٥ نجوم", "٤ نجوم", "مع صور", "مشتريات موثقة"];
const sortOptions = ["الأحدث", "الأكثر فائدة", "الأعلى تقييماً", "الأقل تقييماً"];

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [activeSort, setActiveSort] = useState("الأحدث");
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleHelpful = (reviewId: number) => {
    setHelpfulClicked((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
        toast.info("تم إلغاء التصويت");
      } else {
        next.add(reviewId);
        toast.success("شكراً على تقييمك!");
      }
      return next;
    });
  };

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error("يرجى اختيار تقييم بالنجوم");
      return;
    }
    toast.success("تم إرسال تقييمك بنجاح! سيتم مراجعته قريباً");
    setShowWriteReview(false);
    setNewRating(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-[#263238] flex items-center gap-2">
            <Star className="w-5 h-5 text-[#C9A227] fill-[#C9A227]" />
            آراء المشترين
            <span className="text-gray-400 text-base font-normal">
              ({product.reviewCount} تقييم)
            </span>
          </h3>
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            اكتب تقييماً
          </Button>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="p-6 bg-[#F5F1E8] border-b border-gray-100">
          <h4 className="font-black text-[#263238] mb-4">شارك تجربتك مع هذا المنتج</h4>
          
          {/* Star Rating Input */}
          <div className="mb-4">
            <label className="text-sm font-bold text-[#263238] mb-2 block">تقييمك</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setNewRating(star)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || newRating)
                        ? "text-[#C9A227] fill-[#C9A227]"
                        : "text-gray-300 fill-gray-300"
                    }`}
                  />
                </button>
              ))}
              {(hoverRating || newRating) > 0 && (
                <span className="text-sm text-gray-500 self-center mr-2">
                  {["", "سيء", "مقبول", "جيد", "جيد جداً", "ممتاز"][hoverRating || newRating]}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-bold text-[#263238] mb-2 block">عنوان التقييم</label>
              <input
                type="text"
                placeholder="ملخص تجربتك..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#263238] mb-2 block">موقعك</label>
              <input
                type="text"
                placeholder="المدينة / المنطقة"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-bold text-[#263238] mb-2 block">تفاصيل تقييمك</label>
            <textarea
              rows={4}
              placeholder="شارك تجربتك مع هذا المنتج بالتفصيل..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => toast.info("رفع صور — قريباً")}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#4CAF50] hover:text-[#2E7D32] transition-colors"
            >
              <Camera className="w-4 h-4" />
              أضف صوراً
            </button>
            <span className="text-xs text-gray-400">يمكنك إضافة حتى ٥ صور</span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold px-6 py-2.5 rounded-xl"
            >
              إرسال التقييم
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWriteReview(false)}
              className="border-gray-200 text-gray-500 hover:bg-gray-50 font-bold px-6 py-2.5 rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Rating Summary */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Overall Score */}
          <div className="text-center">
            <div className="text-7xl font-black text-[#263238] leading-none mb-2">
              {product.rating}
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-[#C9A227] fill-[#C9A227]"
                      : i < product.rating
                      ? "text-[#C9A227] fill-[#C9A227] opacity-50"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              بناءً على {product.reviewCount} تقييم
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="md:col-span-2 space-y-2.5">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-bold text-[#263238]">{item.stars}</span>
                  <Star className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                </div>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A227] rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 text-left shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? "bg-[#2E7D32] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-[#2E7D32]"
              }`}
            >
              {f === "مع صور" && <Camera className="w-3 h-3" />}
              {f === "مشتريات موثقة" && <CheckCircle className="w-3 h-3" />}
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#4CAF50] bg-white"
          >
            {sortOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Cards */}
      <div className="divide-y divide-gray-50">
        {product.reviews.map((review) => (
          <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {review.verified && (
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[#263238] text-sm">{review.author}</span>
                      {review.verified && (
                        <span className="text-[10px] bg-green-50 text-[#2E7D32] font-bold px-2 py-0.5 rounded-full border border-green-100">
                          شراء موثق
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{review.location}</span>
                      <span>·</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-[#C9A227] fill-[#C9A227]"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <h5 className="font-bold text-[#263238] mb-2">{review.title}</h5>

                {/* Review Body */}
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.body}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {review.images.map((img, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={img}
                          alt={`صورة التقييم ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpful */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">هل كان هذا مفيداً؟</span>
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      helpfulClicked.has(review.id)
                        ? "bg-green-50 text-[#2E7D32] border border-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-[#2E7D32]"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    نعم ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-6 border-t border-gray-100 text-center">
        <button
          onClick={() => toast.info("تحميل المزيد من التقييمات — قريباً")}
          className="flex items-center gap-2 mx-auto text-[#2E7D32] font-bold text-sm hover:gap-3 transition-all"
        >
          عرض المزيد من التقييمات
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
