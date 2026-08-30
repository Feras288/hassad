// ===================================================
// Hasaad Platform — Vendor Reviews Management Page
// Design: Modern SaaS + Organic Warmth | RTL Arabic
// ===================================================
import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Flag, Search, Filter, TrendingUp } from "lucide-react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";

interface VendorReviewsProps {
  vendorType?: "supplier" | "provider";
}

const reviews = [
  {
    id: "r1",
    customerName: "أحمد محمد الغامدي",
    customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    date: "2024-04-08",
    product: "سماد NPK 20-20-20",
    comment: "منتج ممتاز جداً، لاحظت فرقاً واضحاً في نمو المحاصيل بعد استخدامه. التوصيل كان سريعاً والتغليف محكم. سأكرر الطلب بالتأكيد.",
    helpful: 12,
    replied: false,
  },
  {
    id: "r2",
    customerName: "سالم العتيبي",
    customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    rating: 4,
    date: "2024-04-05",
    product: "نظام ري بالتنقيط",
    comment: "جودة المنتج جيدة والتركيب سهل. التوصيل استغرق يومين إضافيين عن الموعد المحدد لكن المنتج يستحق الانتظار.",
    helpful: 8,
    replied: true,
    reply: "شكراً لك على تقييمك الكريم. نعتذر عن التأخير في التوصيل وسنعمل على تحسين ذلك.",
  },
  {
    id: "r3",
    customerName: "فهد الدوسري",
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    date: "2024-04-03",
    product: "بذور طماطم هجين F1",
    comment: "نسبة الإنبات عالية جداً، تجاوزت 95%. البذور أصيلة ومعبأة بشكل احترافي. أنصح بها بشدة لكل مزارع.",
    helpful: 21,
    replied: false,
  },
  {
    id: "r4",
    customerName: "محمد الزهراني",
    customerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
    rating: 3,
    date: "2024-03-28",
    product: "مبيد حشري بيرمثرين",
    comment: "المنتج مقبول لكن كنت أتوقع فاعلية أعلى. ربما يحتاج إلى جرعات أكبر للمحاصيل الكبيرة.",
    helpful: 5,
    replied: true,
    reply: "شكراً لملاحظتك. يُنصح باتباع تعليمات الاستخدام المرفقة وزيادة التركيز للمحاصيل الكبيرة. نحن هنا للمساعدة.",
  },
  {
    id: "r5",
    customerName: "عبدالله المطيري",
    customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    date: "2024-03-25",
    product: "سماد عضوي كمبوست",
    comment: "أفضل سماد عضوي جربته حتى الآن. رائحته طبيعية وتأثيره على التربة ملحوظ خلال أسبوعين فقط. سعره مناسب جداً.",
    helpful: 18,
    replied: false,
  },
];

const ratingDistribution = [
  { stars: 5, count: 187, percent: 60 },
  { stars: 4, count: 78, percent: 25 },
  { stars: 3, count: 31, percent: 10 },
  { stars: 2, count: 9, percent: 3 },
  { stars: 1, count: 7, percent: 2 },
];

export default function VendorReviews({ vendorType = "supplier" }: VendorReviewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterReplied, setFilterReplied] = useState<"all" | "replied" | "pending">("all");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null);

  const filtered = reviews.filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.customerName.includes(searchQuery) ||
      r.product.includes(searchQuery) ||
      r.comment.includes(searchQuery);
    const matchRating = filterRating === "all" || r.rating === filterRating;
    const matchReplied =
      filterReplied === "all" ||
      (filterReplied === "replied" && r.replied) ||
      (filterReplied === "pending" && !r.replied);
    return matchSearch && matchRating && matchReplied;
  });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F5F1E8]/30 flex" dir="rtl">
      <VendorSidebar vendorType={vendorType} />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          vendorType={vendorType}
          pageTitle="التقييمات والمراجعات"
          pageSubtitle="إدارة تقييمات العملاء والرد عليها"
        />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-[#263238]">{avgRating}</span>
                <Star size={20} className="text-[#C9A227] fill-[#C9A227]" />
              </div>
              <p className="text-xs text-gray-500">متوسط التقييم</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-[#263238]">{reviews.length}</p>
              <p className="text-xs text-gray-500">إجمالي التقييمات</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-green-600">
                {reviews.filter((r) => r.replied).length}
              </p>
              <p className="text-xs text-gray-500">تم الرد عليها</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {reviews.filter((r) => !r.replied).length}
              </p>
              <p className="text-xs text-gray-500">تنتظر الرد</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rating Distribution */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#263238] mb-4">توزيع التقييمات</h3>
              <div className="space-y-2.5">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 w-16">
                      <span className="text-sm font-medium text-[#263238]">{item.stars}</span>
                      <Star size={12} className="text-[#C9A227] fill-[#C9A227]" />
                    </div>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C9A227] rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-left">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">ارتفع 0.2 نجمة هذا الشهر</span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="بحث في التقييمات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]"
                    />
                  </div>
                  <select
                    value={filterRating === "all" ? "all" : String(filterRating)}
                    onChange={(e) =>
                      setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))
                    }
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                  >
                    <option value="all">كل التقييمات</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} نجوم
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterReplied}
                    onChange={(e) => setFilterReplied(e.target.value as any)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                  >
                    <option value="all">الكل</option>
                    <option value="pending">تنتظر الرد</option>
                    <option value="replied">تم الرد</option>
                  </select>
                </div>
              </div>

              {/* Review Cards */}
              <div className="space-y-4">
                {filtered.map((review) => (
                  <div
                    key={review.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border ${
                      !review.replied ? "border-amber-200" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={review.customerAvatar}
                        alt={review.customerName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-[#263238] text-sm">{review.customerName}</p>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                className={
                                  i < review.rating
                                    ? "text-[#C9A227] fill-[#C9A227]"
                                    : "text-gray-200 fill-gray-200"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {review.product}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

                        {/* Reply */}
                        {review.replied && review.reply && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                            <p className="text-xs font-semibold text-[#2E7D32] mb-1">ردك:</p>
                            <p className="text-xs text-gray-600">{review.reply}</p>
                          </div>
                        )}

                        {/* Reply Form */}
                        {showReplyFor === review.id && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              rows={2}
                              placeholder="اكتب ردك على التقييم..."
                              value={replyText[review.id] || ""}
                              onChange={(e) =>
                                setReplyText({ ...replyText, [review.id]: e.target.value })
                              }
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowReplyFor(null)}
                                className="flex-1 bg-[#2E7D32] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-colors"
                              >
                                إرسال الرد
                              </button>
                              <button
                                onClick={() => setShowReplyFor(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-3">
                          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                            <ThumbsUp size={12} />
                            مفيد ({review.helpful})
                          </button>
                          {!review.replied && showReplyFor !== review.id && (
                            <button
                              onClick={() => setShowReplyFor(review.id)}
                              className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline"
                            >
                              <MessageSquare size={12} />
                              رد على التقييم
                            </button>
                          )}
                          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 mr-auto">
                            <Flag size={12} />
                            إبلاغ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                    <Star size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد تقييمات تطابق البحث</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
