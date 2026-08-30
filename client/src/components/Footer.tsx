/**
 * Footer — مطابق للتصميم المرفق
 * Structure: Brand col + 4 link columns + bottom bar with payment icons
 */

import { Link } from "wouter";
import { Twitter, Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";

export const FOOTER_LINKS = [
  {
    title: "المنصة",
    links: [
      { label: "من نحن", href: "/info/about" },
      { label: "كيف نعمل", href: "/info/how-it-works" },
      { label: "أخبار وقصص", href: "/info/stories" },
      { label: "وظائف", href: "/info/careers" },
      { label: "اتصل بنا", href: "/contact" },
    ],
  },
  {
    title: "للمزارعين",
    links: [
      { label: "تسوّق المنتجات", href: "/marketplace" },
      { label: "التشخيص الذكي", href: "/diagnosis" },
      { label: "احجز خدمة", href: "/booking" },
      { label: "دليل المزارع", href: "/info/farmer-guide" },
      { label: "تتبع الطلب", href: "/dashboard/orders" },
    ],
  },
  {
    title: "للأعمال",
    links: [
      { label: "كن مورداً", href: "/register?role=vendor" },
      { label: "حساب B2B", href: "/auth" },
      { label: "قدّم خدماتك", href: "/register?role=provider" },
      { label: "حلول المؤسسات", href: "/info/enterprise" },
      { label: "API للتكامل", href: "/info/api-integration" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { label: "مركز المساعدة", href: "/help" },
      { label: "سياسة الإرجاع", href: "/info/return-policy" },
      { label: "الشحن والتوصيل", href: "/info/shipping-delivery" },
      { label: "الشروط والأحكام", href: "/info/terms" },
      { label: "سياسة الخصوصية", href: "/info/privacy" },
    ],
  },
];

const PAYMENT_METHODS = ["Mada", "Visa", "Mastercard", "Apple Pay", "STC Pay", "تابي"];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A17] text-white">
      <div className="max-w-[1440px] mx-auto px-4 pb-8 pt-10 sm:px-6 sm:pt-16 md:px-8">
        {/* Top Grid */}
        <div className="mb-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:mb-12 sm:gap-10 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center">
              <img src="/hassad-logo.png" alt="حصاد" className="h-10 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-[14px] text-[#6E6E66] leading-[1.7] mb-5 max-w-[280px]">
              منصة عربية متكاملة للتكنولوجيا الزراعية — نربط المزارعين بأفضل المنتجات، الخدمات، والخبرات لإنتاج أفضل ومستقبل أخضر.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Twitter, href: "https://twitter.com/hassadnet", label: "تويتر" },
                { icon: Instagram, href: "https://instagram.com/hassadnet", label: "انستقرام" },
                { icon: Linkedin, href: "https://linkedin.com/company/hassadnet", label: "لينكدإن" },
                { icon: Youtube, href: "https://youtube.com/@hassadnet", label: "يوتيوب" },
                { icon: MessageCircle, href: "https://wa.me/966552144040", label: "واتساب" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-[10px] grid place-items-center transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.title}>
              <h5 className="font-semibold text-[14px] text-white mb-4">{col.title}</h5>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") || link.href.startsWith("https:") ? (
                      <a href={link.href} className="text-[13px] text-[#6E6E66] hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-[13px] text-[#6E6E66] transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-[13px] text-[#6E6E66]">
          <div>© ٢٠٢٦ منصة حصاد — جميع الحقوق محفوظة.</div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>طرق الدفع:</span>
            {PAYMENT_METHODS.map(m => (
              <span key={m} className="px-2.5 py-1 bg-white/10 rounded-[6px] text-[12px] font-medium text-white/80">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
