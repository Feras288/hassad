/*
 * HASAAD PLATFORM — Provider Portfolio Section
 * Past projects gallery with categories, dates, and locations
 */

import { useState } from "react";
import { MapPin, Calendar, ExternalLink, X } from "lucide-react";
import type { Provider } from "@/lib/providersData";
import type { PortfolioItem } from "@/lib/providersData";

interface ProviderPortfolioProps {
  provider: Provider;
}

export default function ProviderPortfolio({ provider }: ProviderPortfolioProps) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  if (!provider.portfolio.length) return null;

  return (
    <>
    {selected && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
        <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative h-64">
            <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
            <button onClick={() => setSelected(null)} className="absolute top-3 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#2E7D32] text-white px-2.5 py-1 rounded-full">{selected.category}</span>
          </div>
          <div className="p-5">
            <h3 className="font-black text-lg text-[#263238] mb-2">{selected.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{selected.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{selected.date}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selected.location}</span>
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-[#263238] flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
          أعمال سابقة
        </h2>
        <span className="text-sm text-gray-400">{provider.portfolio.length} مشروع</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {provider.portfolio.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl overflow-hidden border border-gray-100 hover:border-[#4CAF50]/40 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setSelected(item)}
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold bg-[#2E7D32] text-white px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-black text-sm text-[#263238] mb-1 leading-snug line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
