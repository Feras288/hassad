/*
 * HASAAD PLATFORM — Provider Reviews Section
 * Rating breakdown, filter tabs, review cards, write review form
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, CheckCircle, ChevronDown, PenLine, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/lib/providersData";

const FILTER_OPTIONS = [
  { label: "الكل", value: "all" },
  { label: "٥ نجوم", value: "5" },
  { label: "٤ نجوم", value: "4" },
  { label: "٣ نجوم", value: "3" },
];

const SORT_OPTIONS = [
  { label: "الأحدث", value: "newest" },
  { label: "الأعلى تقييماً", value: "highest" },
  { label: "الأكثر فائدة", value: "helpful" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizes[size]} ${s <= rating ? "text-[#C9A227] fill-[#C9A227]" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

interface ProviderReviewsProps {
  provider: Provider;
}

export default function ProviderReviews({ provider }: ProviderReviewsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(3);

  // Rating distribution (mock)
  const ratingDist = [
    { stars: 5, count: 89, pct: 70 },
    { stars: 4, count: 25, pct: 20 },
    { stars: 3, count: 8,  pct: 6 },
    { stars: 2, count: 3,  pct: 2 },
    { stars: 1, count: 2,  pct: 2 },
  ];

  const filtered = provider.reviews.filter((r) =>
    activeFilter === "all" ? true : r.rating === parseInt(activeFilter)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "helpful") return b.helpful - a.helpful;
    return 0;
  });

  const handleHelpful = (id: string) => {
    if (helpfulClicked.has(id)) return;
    setHelpfulClicked((prev) => new Set(prev).add(id));
    toast.success("شكراً على تقييمك!");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) { toast.error("يرجى اختيار تقييم بالنجوم"); return; }
    if (reviewText.trim().length < 20) { toast.error("يرجى كتابة تقييم لا يقل عن ٢٠ حرفاً"); return; }
    toast.success("تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة");
    setShowWriteReview(false);
    setNewRating(0);
    setReviewText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-[#263238] flex items-center gap-2">
          <span className="w-1 h-5 bg-[#C9A227] rounded-full inline-block" />
          تقييمات العملاء
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 font-bold rounded-xl text-xs flex items-center gap-1.5"
          onClick={() => setShowWriteReview(!showWriteReview)}
        >
          <PenLine className="w-3.5 h-3.5" />
          اكتب تقييماً
        </Button>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 p-5 bg-[#F5F1E8] rounded-2xl">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center md:min-w-[120px]">
          <div className="text-5xl font-black text-[#263238] mb-1">{provider.rating.toFixed(1)}</div>
          <StarRating rating={Math.round(provider.rating)} size="md" />
          <div className="text-xs text-gray-500 mt-1">{provider.reviewCount} تقييم</div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {ratingDist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <button
                onClick={() => setActiveFilter(String(d.stars))}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#C9A227] transition-colors shrink-0 w-16 justify-end"
              >
                {d.stars} <Star className="w-3 h-3 fill-[#C9A227] text-[#C9A227]" />
              </button>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C9A227] rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 shrink-0 w-6 text-left">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-6 p-5 border-2 border-dashed border-[#4CAF50]/30 rounded-2xl bg-green-50/30"
        >
          <h3 className="font-black text-[#263238] mb-4">شاركنا تجربتك</h3>
          {/* Star Picker */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">تقييمك:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setNewRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      s <= (hoverRating || newRating)
                        ? "text-[#C9A227] fill-[#C9A227]"
                        : "text-gray-300 fill-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {newRating > 0 && (
              <span className="text-sm font-bold text-[#C9A227]">
                {["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"][newRating]}
              </span>
            )}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="شاركنا تفاصيل تجربتك مع هذا المهندس..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#263238] placeholder-gray-400 focus:outline-none focus:border-[#4CAF50] resize-none bg-white"
            dir="rtl"
          />
          <div className="flex gap-2 mt-3">
            <Button
              type="submit"
              className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold rounded-xl px-6 text-sm"
            >
              إرسال التقييم
            </Button>
            <Button
              type="button"
              variant="outline"
              className="font-bold rounded-xl px-4 text-sm"
              onClick={() => setShowWriteReview(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                activeFilter === f.value
                  ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#4CAF50] hover:text-[#2E7D32]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-1.5 text-gray-500 focus:outline-none focus:border-[#4CAF50] bg-white"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Review Cards */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p className="text-sm">لا توجد تقييمات بهذا التصفية</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.slice(0, visibleCount).map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-base">{review.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-[#263238]">{review.author}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-[#2E7D32] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        عميل موثق
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>

              {/* Service Tag & Location */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-bold bg-green-50 text-[#2E7D32] border border-green-200 px-2.5 py-1 rounded-full">
                  {review.serviceType}
                </span>
                <span className="text-[10px] font-bold bg-[#F5F1E8] text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {review.location}
                </span>
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.text}</p>

              {/* Helpful */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">هل كان هذا مفيداً؟</span>
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                    helpfulClicked.has(review.id)
                      ? "bg-green-50 border-green-200 text-[#2E7D32]"
                      : "border-gray-200 text-gray-400 hover:border-[#4CAF50] hover:text-[#2E7D32]"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  نعم ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {sorted.length > visibleCount && (
        <button
          onClick={() => setVisibleCount((v) => v + 3)}
          className="w-full mt-4 py-3 text-sm font-bold text-[#2E7D32] border border-dashed border-[#4CAF50]/40 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          عرض المزيد من التقييمات
        </button>
      )}
    </div>
  );
}
