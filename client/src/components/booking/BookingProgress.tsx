/*
 * HASAAD PLATFORM — Booking Progress Bar
 * Design: Horizontal step indicator with animated transitions
 * Shows current step, completed steps, and upcoming steps
 */

import { CheckCircle } from "lucide-react";

interface Step {
  number: number;
  label: string;
  sublabel: string;
}

const steps: Step[] = [
  { number: 1, label: "الخدمة", sublabel: "اختر نوع الخدمة" },
  { number: 2, label: "الموعد", sublabel: "حدد التاريخ والوقت" },
  { number: 3, label: "التأكيد", sublabel: "راجع وأكد الطلب" },
];

interface BookingProgressProps {
  currentStep: number;
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-0 relative">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm ${
                    isCompleted
                      ? "bg-[#2E7D32] text-white scale-100"
                      : isCurrent
                      ? "bg-[#2E7D32] text-white scale-110 ring-4 ring-[#2E7D32]/20"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 fill-white stroke-white" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Labels */}
                <div className="text-center">
                  <div
                    className={`text-sm font-bold transition-colors duration-300 ${
                      isCurrent
                        ? "text-[#2E7D32]"
                        : isCompleted
                        ? "text-[#2E7D32]"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block mt-0.5">
                    {step.sublabel}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-24 sm:w-32 md:w-40 h-0.5 mx-2 mb-6 relative overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="absolute inset-y-0 right-0 bg-[#2E7D32] transition-all duration-700 ease-out"
                    style={{
                      width: currentStep > step.number ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
