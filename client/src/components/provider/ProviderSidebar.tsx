/*
 * HASAAD PLATFORM — Provider Profile Sidebar
 * Bio, skills, certifications, crops, languages
 */

import { Button } from "@/components/ui/button";
import {
  Globe, Sprout, Award, CheckCircle2, CalendarCheck, Phone, MessageCircle
} from "lucide-react";
import { useLocation } from "wouter";
import type { Provider } from "@/lib/providersData";

interface ProviderSidebarProps {
  provider: Provider;
}

export default function ProviderSidebar({ provider }: ProviderSidebarProps) {
  const [, navigate] = useLocation();

  const handleBook = () => {
    navigate(`/booking?provider=${encodeURIComponent(provider.id)}&service=${encodeURIComponent(provider.specialty)}`);
  };
  const handleContact = () => {
    navigate(`/dashboard/messages?provider=${encodeURIComponent(provider.id)}`);
  };

  return (
    <div className="space-y-5" dir="rtl">

      {/* Quick Book Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="text-center mb-4">
          <div className="text-2xl font-black text-[#2E7D32] mb-0.5">{provider.priceRange}</div>
          <div className="text-xs text-gray-400">ريال سعودي</div>
        </div>
        <Button
          className="w-full bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold rounded-xl py-3 shadow-lg shadow-green-900/20 mb-2 flex items-center gap-2 justify-center"
          onClick={handleBook}
        >
          <CalendarCheck className="w-4 h-4" />
          احجز موعداً الآن
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 font-bold rounded-xl py-3 flex items-center gap-2 justify-center"
          onClick={handleContact}
        >
          <MessageCircle className="w-4 h-4" />
          راسل مباشرة
        </Button>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
          <span>دفع آمن عبر المنصة</span>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#2E7D32] rounded-full inline-block" />
          نبذة عن المهندس
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{provider.bio}</p>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#C9A227] rounded-full inline-block" />
          التخصصات والمهارات
        </h3>
        <div className="flex flex-wrap gap-2">
          {provider.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-semibold bg-[#F5F1E8] text-[#263238] border border-[#E8E0D0] px-3 py-1.5 rounded-full hover:border-[#4CAF50] hover:bg-green-50 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {provider.certifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C9A227]" />
            الشهادات والاعتمادات
          </h3>
          <div className="space-y-3">
            {provider.certifications.map((cert) => (
              <div key={cert.id} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#F5F1E8] rounded-xl flex items-center justify-center shrink-0 text-lg">
                  {cert.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#263238]">{cert.title}</div>
                  <div className="text-xs text-gray-500">{cert.issuer} · {cert.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crops */}
      {provider.crops.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#2E7D32]" />
            المحاصيل المتخصص بها
          </h3>
          <div className="flex flex-wrap gap-2">
            {provider.crops.map((crop) => (
              <span
                key={crop}
                className="text-xs font-semibold bg-green-50 text-[#2E7D32] border border-green-200 px-3 py-1.5 rounded-full"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#2E7D32]" />
          اللغات
        </h3>
        <div className="flex gap-2">
          {provider.languages.map((lang) => (
            <span
              key={lang}
              className="text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32] px-3 py-1.5 rounded-full"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-[#2E7D32] rounded-2xl p-5 text-white">
        <h3 className="text-sm font-black mb-3">هل تحتاج مساعدة؟</h3>
        <p className="text-white/70 text-xs mb-4 leading-relaxed">
          تواصل مع فريق دعم حصاد لمساعدتك في اختيار مقدم الخدمة المناسب
        </p>
        <button
          onClick={() => { window.location.href = 'tel:920000000'; }}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl py-2.5 flex items-center gap-2 justify-center transition-colors"
        >
          <Phone className="w-4 h-4" />
          تواصل مع الدعم
        </button>
      </div>

    </div>
  );
}
