/*
 * HASAAD PLATFORM — Provider Profile Header
 * Design: "الحقل الرقمي" — Modern SaaS + Organic Warmth
 * Cover image, avatar, name, stats, availability badge, CTA buttons
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin, Star, CheckCircle, Award, Clock, Phone,
  MessageCircle, Share2, Heart, ChevronRight, Briefcase,
  Users, TrendingUp, Repeat2
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import type { Provider } from "@/lib/providersData";

const SPECIALTY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  agronomist:   { label: "مهندس زراعي",       color: "text-[#2E7D32]", bg: "bg-green-50 border-green-200" },
  irrigation:   { label: "مهندس ري",           color: "text-blue-700",  bg: "bg-blue-50 border-blue-200" },
  veterinarian: { label: "طبيب بيطري",         color: "text-purple-700",bg: "bg-purple-50 border-purple-200" },
  worker:       { label: "عامل زراعي",         color: "text-orange-700",bg: "bg-orange-50 border-orange-200" },
};

const AVAILABILITY_CONFIG = {
  available:   { label: "متاح الآن",     dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  busy:        { label: "مشغول حالياً", dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  unavailable: { label: "غير متاح",      dot: "bg-red-400",     text: "text-red-700",     bg: "bg-red-50 border-red-200" },
};

interface ProviderProfileHeaderProps {
  provider: Provider;
}

export default function ProviderProfileHeader({ provider }: ProviderProfileHeaderProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [, navigate] = useLocation();
  const specialty = SPECIALTY_LABELS[provider.specialty] ?? SPECIALTY_LABELS.agronomist;
  const avail = AVAILABILITY_CONFIG[provider.availability];

  const handleContact = () => {
    window.location.href = `mailto:support@hassad.net?subject=طلب استشارة - ${provider.name}`;
  };
  const handleBook = () => navigate("/booking");
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    toast.success("تم نسخ رابط الملف الشخصي");
  };

  return (
    <div className="bg-white" dir="rtl">
      {/* Cover Image */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src={provider.coverImage}
          alt="غلاف الملف الشخصي"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-white/80 text-sm">
          <button onClick={() => window.history.back()} className="hover:text-white transition-colors">
            الخدمات الزراعية
          </button>
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-white font-medium">{provider.name}</span>
        </div>

        {/* Action buttons top-left */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`w-9 h-9 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all ${
              isSaved ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "text-white fill-white" : "text-white"}`} />
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="container">
        <div className="relative pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 right-0 md:right-6">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {provider.verified && (
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
          </div>

          {/* Name & Info */}
          <div className="pt-16 md:pt-4 md:pr-44">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Left: Name & Badges */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Specialty Badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${specialty.bg} ${specialty.color}`}>
                    {specialty.label}
                  </span>
                  {/* Top Rated */}
                  {provider.topRated && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      الأعلى تقييماً
                    </span>
                  )}
                  {/* Availability */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${avail.bg} ${avail.text}`}>
                    <span className={`w-2 h-2 rounded-full ${avail.dot} animate-pulse`} />
                    {avail.label}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-[#263238] mb-1">
                  {provider.name}
                </h1>
                <p className="text-[#4CAF50] font-bold text-base mb-2">{provider.title}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#2E7D32]" />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#2E7D32]" />
                    <span>يرد {provider.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#2E7D32]" />
                    <span>{provider.yearsExperience} سنوات خبرة</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:min-w-[180px]">
                <Button
                  className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold rounded-xl px-6 py-3 shadow-lg shadow-green-900/20 flex items-center gap-2 justify-center"
                  onClick={handleBook}
                >
                  <Phone className="w-4 h-4" />
                  احجز الآن
                </Button>
                <Button
                  variant="outline"
                  className="border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 font-bold rounded-xl px-6 py-3 flex items-center gap-2 justify-center"
                  onClick={handleContact}
                >
                  <MessageCircle className="w-4 h-4" />
                  راسل المهندس
                </Button>
                <div className="text-center text-sm text-gray-400 font-medium">
                  {provider.priceRange} ريال
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-gray-100 bg-[#F5F1E8]/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-gray-200 py-4">
            {[
              {
                icon: Star,
                value: provider.rating.toFixed(1),
                label: `(${provider.reviewCount} تقييم)`,
                color: "text-[#C9A227]",
                iconColor: "text-[#C9A227]",
              },
              {
                icon: Briefcase,
                value: `${provider.completedJobs}+`,
                label: "مهمة مكتملة",
                color: "text-[#2E7D32]",
                iconColor: "text-[#2E7D32]",
              },
              {
                icon: TrendingUp,
                value: `${provider.successRate}%`,
                label: "نسبة النجاح",
                color: "text-blue-600",
                iconColor: "text-blue-600",
              },
              {
                icon: Repeat2,
                value: `${provider.repeatClients}%`,
                label: "عملاء متكررون",
                color: "text-purple-600",
                iconColor: "text-purple-600",
              },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-3 px-4 gap-1">
                <div className="flex items-center gap-1.5">
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
