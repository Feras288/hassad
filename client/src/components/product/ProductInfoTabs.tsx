/*
 * HASAAD PLATFORM — Product Info Tabs
 * Design: "الحقل الرقمي" — Tabbed product details
 * Description, Specifications, Usage Instructions, Certifications
 */

import { useState } from "react";
import { CheckCircle, AlertTriangle, Award, FileText, Settings, BookOpen } from "lucide-react";
import type { Product } from "@/lib/productsData";

interface ProductInfoTabsProps {
  product: Product;
}

const tabs = [
  { id: "description", label: "الوصف", icon: FileText },
  { id: "specs", label: "المواصفات", icon: Settings },
  { id: "usage", label: "طريقة الاستخدام", icon: BookOpen },
  { id: "certifications", label: "الشهادات", icon: Award },
];

export default function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? "border-[#2E7D32] text-[#2E7D32] bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-[#2E7D32] hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Description */}
        {activeTab === "description" && (
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed text-base">
              {product.shortDesc}
            </p>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.longDesc}
            </p>

            {/* Highlights */}
            <div>
              <h4 className="font-black text-[#263238] mb-4 text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                المميزات الرئيسية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-green-50/60 rounded-xl p-3.5 border border-green-100"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#4CAF50] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="text-sm text-[#263238] font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-bold text-[#263238] mb-3 text-sm">الكلمات المفتاحية</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-green-50 hover:text-[#2E7D32] cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Specifications */}
        {activeTab === "specs" && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2E7D32]" />
              <h4 className="font-black text-[#263238]">المواصفات التقنية</h4>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {product.specs.map((spec, i) => (
                <div
                  key={i}
                  className={`flex items-center ${
                    i % 2 === 0 ? "bg-gray-50/80" : "bg-white"
                  }`}
                >
                  <div className="w-2/5 px-5 py-3.5 border-l border-gray-100">
                    <span className="text-sm font-bold text-[#263238]">{spec.label}</span>
                  </div>
                  <div className="w-3/5 px-5 py-3.5">
                    <span className="text-sm text-gray-600">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SKU & Brand */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">رقم المنتج (SKU)</p>
                <p className="text-sm font-bold text-[#263238] font-mono">{product.sku}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">الشركة المصنّعة</p>
                <p className="text-sm font-bold text-[#263238]">{product.brand}</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        {activeTab === "usage" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                يُرجى قراءة تعليمات الاستخدام بعناية قبل التطبيق. ارتدِ معدات الحماية المناسبة عند التعامل مع المنتج.
              </p>
            </div>

            <div>
              <h4 className="font-black text-[#263238] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2E7D32]" />
                تعليمات الاستخدام
              </h4>
              <div className="space-y-4">
                {product.usageInstructions.map((instruction, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-[#2E7D32] text-white rounded-full flex items-center justify-center text-sm font-black shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-[#263238] leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Notes */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <h5 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                تحذيرات السلامة
              </h5>
              <ul className="space-y-2 text-sm text-red-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  احفظ بعيداً عن متناول الأطفال
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  تجنب ابتلاع المنتج أو استنشاق الغبار
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  في حالة ملامسة العينين اغسل بالماء فوراً وراجع الطبيب
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  لا تتجاوز الجرعة الموصى بها لتجنب حرق النباتات
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Certifications */}
        {activeTab === "certifications" && (
          <div className="space-y-5">
            <p className="text-gray-500 text-sm">
              هذا المنتج حاصل على الشهادات والاعتمادات التالية التي تضمن جودته وسلامته
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.certifications.map((cert, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-5 bg-gradient-to-b from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                    <Award className="w-7 h-7 text-[#C9A227]" />
                  </div>
                  <p className="text-sm font-bold text-[#263238] leading-snug">{cert}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#F5F1E8] rounded-xl p-5 mt-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#263238] mb-1">ضمان الأصالة</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    جميع المنتجات المعروضة في منصة حصاد تمر بعملية تحقق صارمة للتأكد من أصالتها وصلاحيتها. يمكنك التحقق من شهادات المنتج عبر رمز QR على العبوة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
