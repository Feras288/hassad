/**
 * CTASection — App Download CTA
 * Design: Matches reference HTML - dark green band with app store buttons
 */

import { Apple, Play } from "lucide-react";

export default function CTASection() {
  return (
    <section className="pt-[80px] bg-[#FBF9F4]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="rounded-[28px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #123528 0%, #1F4D3A 100%)" }}
        >
          <div className="text-white text-center md:text-right">
            <h3 className="text-[28px] md:text-[32px] font-bold mb-2">حمّل تطبيق حصاد للجوال</h3>
            <p className="text-[16px] text-white/70 max-w-md">
              تسوّق، شخّص، واحجز الخدمات من أي مكان — تجربة سلسة على iPhone وAndroid.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button className="flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-3.5 rounded-[14px] transition-colors">
              <Apple className="w-7 h-7" />
              <div className="text-right">
                <div className="text-[11px] text-white/70">حمّل من</div>
                <div className="text-[15px] font-bold">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-3.5 rounded-[14px] transition-colors">
              <Play className="w-7 h-7" />
              <div className="text-right">
                <div className="text-[11px] text-white/70">احصل عليه من</div>
                <div className="text-[15px] font-bold">Google Play</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
