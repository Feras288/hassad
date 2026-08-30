/*
 * HASAAD PLATFORM — Stats Section
 * Design: White bg with animated counters
 * Trust signals between hero and marketplace
 */

import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, ShoppingBag, Star, Award, MapPin } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 12000,
    suffix: "+",
    label: "مزارع مسجّل",
    desc: "من جميع مناطق المملكة",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: ShoppingBag,
    value: 800,
    suffix: "+",
    label: "منتج زراعي",
    desc: "من موردين موثوقين",
    color: "#C9A227",
    bg: "#FFF8E1",
  },
  {
    icon: TrendingUp,
    value: 95,
    suffix: "٪",
    label: "دقة التشخيص",
    desc: "بالذكاء الاصطناعي",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: Star,
    value: 300,
    suffix: "+",
    label: "مقدم خدمة",
    desc: "معتمد ومتخصص",
    color: "#C9A227",
    bg: "#FFF8E1",
  },
  {
    icon: Award,
    value: 98,
    suffix: "٪",
    label: "رضا العملاء",
    desc: "تقييم موثق",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: MapPin,
    value: 13,
    suffix: "+",
    label: "منطقة مغطاة",
    desc: "في المملكة العربية السعودية",
    color: "#C9A227",
    bg: "#FFF8E1",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const increment = value / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [started, value]);

  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-black">
      {toArabicNumerals(count)}{suffix}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-100 py-4 md:py-5">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#4CAF50] hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-lg font-black leading-none" style={{ color: stat.color, fontFamily: "'Tajawal', sans-serif" }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
