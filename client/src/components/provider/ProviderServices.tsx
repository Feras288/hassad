/*
 * HASAAD PLATFORM — Provider Services Section
 * Service cards with pricing, duration, and booking CTA
 */

import { Button } from "@/components/ui/button";
import { Clock, Star, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { Provider } from "@/lib/providersData";

interface ProviderServicesProps {
  provider: Provider;
}

export default function ProviderServices({ provider }: ProviderServicesProps) {
  const [, navigate] = useLocation();

  if (!provider.services.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-[#263238] flex items-center gap-2">
          <span className="w-1 h-5 bg-[#2E7D32] rounded-full inline-block" />
          الخدمات المقدمة
        </h2>
        <span className="text-sm text-gray-400">{provider.services.length} خدمة</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {provider.services.map((service) => (
          <div
            key={service.id}
            className={`relative rounded-xl border p-4 transition-all hover:shadow-md group ${
              service.popular
                ? "border-[#2E7D32] bg-green-50/50"
                : "border-gray-100 bg-white hover:border-[#4CAF50]/40"
            }`}
          >
            {service.popular && (
              <div className="absolute -top-2.5 right-4">
                <span className="bg-[#2E7D32] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  الأكثر طلباً
                </span>
              </div>
            )}

            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                service.popular ? "bg-[#2E7D32]/10" : "bg-[#F5F1E8]"
              }`}>
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#263238] text-sm leading-snug">{service.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#2E7D32]">{service.price.toLocaleString("ar-SA")}</span>
                  <span className="text-xs text-gray-400">{service.priceUnit}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{service.duration}</span>
                </div>
              </div>
              <Button
                size="sm"
                className={`rounded-xl font-bold text-xs px-4 flex items-center gap-1.5 ${
                  service.popular
                    ? "bg-[#2E7D32] hover:bg-[#4CAF50] text-white shadow-sm"
                    : "bg-[#F5F1E8] hover:bg-green-50 text-[#2E7D32] border border-[#2E7D32]/20"
                }`}
                onClick={() => navigate(`/booking?provider=${encodeURIComponent(provider.id)}&service=${encodeURIComponent(provider.specialty)}&serviceOffer=${encodeURIComponent(service.id)}`)}
              >
                احجز
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
