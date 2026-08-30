/*
 * HASAAD PLATFORM — Booking Step 1
 * Design: Service type selection → Package selection → Provider selection
 * Three sub-steps within step 1
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, MapPin, Clock, ArrowLeft, ChevronLeft, Zap, Users, Award } from "lucide-react";
import { serviceTypes, servicePackages, providers, type ServiceType, type ServicePackage, type Provider } from "@/lib/bookingData";

interface BookingStep1Props {
  selectedService: ServiceType | null;
  selectedPackage: ServicePackage | null;
  selectedProvider: Provider | null;
  onServiceSelect: (service: ServiceType) => void;
  onPackageSelect: (pkg: ServicePackage) => void;
  onProviderSelect: (provider: Provider) => void;
  onNext: () => void;
  initialSubStep?: "service" | "package" | "provider";
}

export default function BookingStep1({
  selectedService,
  selectedPackage,
  selectedProvider,
  onServiceSelect,
  onPackageSelect,
  onProviderSelect,
  onNext,
  initialSubStep = "service",
}: BookingStep1Props) {
  const [subStep, setSubStep] = useState<"service" | "package" | "provider">(initialSubStep);

  const availablePackages = selectedService ? servicePackages[selectedService.id] || [] : [];
  const availableProviders = selectedService
    ? providers.filter((p) => p.serviceTypes.includes(selectedService.id))
    : providers;

  const handleServiceSelect = (service: ServiceType) => {
    onServiceSelect(service);
    setSubStep("package");
  };

  const handlePackageSelect = (pkg: ServicePackage) => {
    onPackageSelect(pkg);
    setSubStep("provider");
  };

  const handleProviderSelect = (provider: Provider) => {
    onProviderSelect(provider);
  };

  const canProceed = selectedService && selectedPackage && selectedProvider;

  return (
    <div className="space-y-6">
      {/* Sub-step Tabs */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5">
        {[
          { key: "service", label: "نوع الخدمة", icon: "🌿" },
          { key: "package", label: "الباقة", icon: "📦" },
          { key: "provider", label: "المقدم", icon: "👤" },
        ].map((tab, index) => {
          const isActive = subStep === tab.key;
          const isDone =
            (tab.key === "service" && selectedService) ||
            (tab.key === "package" && selectedPackage) ||
            (tab.key === "provider" && selectedProvider);

          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === "service") setSubStep("service");
                if (tab.key === "package" && selectedService) setSubStep("package");
                if (tab.key === "provider" && selectedPackage) setSubStep("provider");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#2E7D32] shadow-sm"
                  : isDone
                  ? "text-[#4CAF50] hover:bg-white/60"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {isDone && !isActive && (
                <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50] fill-[#4CAF50]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-step Content */}
      {subStep === "service" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-5">
            <h3 className="text-xl font-black text-[#263238] mb-1">ما الخدمة التي تحتاجها؟</h3>
            <p className="text-gray-500 text-sm">اختر نوع الخدمة الزراعية المطلوبة</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`relative group p-4 rounded-2xl border-2 text-right transition-all duration-300 hover:shadow-md ${
                  selectedService?.id === service.id
                    ? "border-[#2E7D32] bg-green-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-[#4CAF50]"
                }`}
              >
                {service.popular && (
                  <span className="absolute top-2 left-2 bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    الأكثر طلبًا
                  </span>
                )}
                {selectedService?.id === service.id && (
                  <div className="absolute top-2 left-2">
                    <CheckCircle className="w-4 h-4 text-[#2E7D32] fill-[#2E7D32]" />
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: service.bg }}
                >
                  {service.icon}
                </div>
                <div className="font-black text-[#263238] text-sm mb-1">{service.name}</div>
                <div className="text-xs text-gray-400 mb-2 leading-tight">{service.description}</div>
                <div className="text-xs font-bold" style={{ color: service.color }}>
                  {service.priceRange}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {subStep === "package" && selectedService && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setSubStep("service")}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
            </button>
            <div>
              <h3 className="text-xl font-black text-[#263238]">اختر الباقة المناسبة</h3>
              <p className="text-gray-500 text-sm">
                <span
                  className="font-bold"
                  style={{ color: selectedService.color }}
                >
                  {selectedService.icon} {selectedService.name}
                </span>
                {" "}— اختر الباقة التي تناسب احتياجاتك
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className={`relative text-right p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg group ${
                  selectedPackage?.id === pkg.id
                    ? "border-[#2E7D32] bg-green-50 shadow-md"
                    : pkg.recommended
                    ? "border-[#C9A227] bg-amber-50/30 hover:border-[#2E7D32]"
                    : "border-gray-100 bg-white hover:border-[#4CAF50]"
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 right-4 bg-[#C9A227] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    موصى به
                  </div>
                )}
                {selectedPackage?.id === pkg.id && (
                  <div className="absolute top-3 left-3">
                    <CheckCircle className="w-5 h-5 text-[#2E7D32] fill-[#2E7D32]" />
                  </div>
                )}

                <div className="mb-3">
                  <div className="font-black text-[#263238] text-base mb-1">{pkg.name}</div>
                  <div className="text-xs text-gray-500">{pkg.description}</div>
                </div>

                <div className="text-2xl font-black text-[#2E7D32] mb-1">
                  {pkg.price.toLocaleString("ar-SA")}
                  <span className="text-sm font-medium text-gray-400 mr-1">ريال</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pkg.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {pkg.visits}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  {pkg.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <div className="text-xs text-[#4CAF50] font-semibold">
                      +{pkg.features.length - 3} مزايا إضافية
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {subStep === "provider" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setSubStep("package")}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
            </button>
            <div>
              <h3 className="text-xl font-black text-[#263238]">اختر مقدم الخدمة</h3>
              <p className="text-gray-500 text-sm">اختر المتخصص الأنسب لمزرعتك</p>
            </div>
          </div>

          <div className="space-y-3">
            {(availableProviders.length > 0 ? availableProviders : providers).map((provider) => (
              <button
                key={provider.id}
                onClick={() => onProviderSelect(provider)}
                className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-md group flex items-start gap-4 ${
                  selectedProvider?.id === provider.id
                    ? "border-[#2E7D32] bg-green-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-[#4CAF50]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  {provider.verified && (
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="font-black text-[#263238] text-sm">{provider.name}</div>
                      <div className="text-[#4CAF50] text-xs font-semibold">{provider.role}</div>
                    </div>
                    <div
                      className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                        provider.availability === "available"
                          ? "bg-green-100 text-[#2E7D32]"
                          : provider.availability === "busy"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {provider.availabilityText}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                      <span className="text-sm font-bold text-[#263238]">{provider.rating}</span>
                      <span className="text-xs text-gray-400">({provider.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 text-[#4CAF50]" />
                      {provider.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Zap className="w-3 h-3 text-[#C9A227]" />
                      {provider.responseTime}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {provider.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-green-50 text-[#2E7D32] text-[10px] font-medium px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm font-black text-[#2E7D32] shrink-0">
                      {provider.priceRange}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedProvider?.id === provider.id && (
                  <div className="shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-[#2E7D32] fill-[#2E7D32]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {selectedService && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedService.icon}</span>
              <span className="font-semibold text-[#263238]">{selectedService.name}</span>
              {selectedPackage && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-[#2E7D32] font-bold">{selectedPackage.name}</span>
                </>
              )}
              {selectedProvider && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-600">{selectedProvider.name.split(" ").slice(0, 2).join(" ")}</span>
                </>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#2E7D32] hover:bg-[#4CAF50] text-white font-bold px-8 py-3 rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          التالي
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
