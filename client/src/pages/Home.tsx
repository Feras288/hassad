/**
 * Home Page — Hassad Platform
 * Sections order matches reference HTML design
 */

import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ThreePillars from "@/components/ThreePillars";
import MarketplaceSection from "@/components/MarketplaceSection";
import AIDiagnosisSection from "@/components/AIDiagnosisSection";
import ServicesSection from "@/components/ServicesSection";
import B2BSection from "@/components/B2BSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import BenefitsSection from "@/components/BenefitsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  const homepageProducts = trpc.products.featured.useQuery({ limit: 8 }, { staleTime: 30_000 });
  const isInitialMobileLoading = homepageProducts.isLoading && !homepageProducts.data;

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#FBF9F4" }}>
      <Navbar />
      {isInitialMobileLoading && (
        <main data-home-mobile-skeleton aria-label="جاري تحميل الصفحة الرئيسية" className="animate-pulse bg-[#FBF9F4] px-4 py-5 md:hidden">
          <div className="h-[272px] rounded-[24px] bg-[#174634]" />
          <div className="mt-5 space-y-3"><div className="h-5 w-28 rounded bg-[#E7ECE3]" /><div className="h-8 w-4/5 rounded bg-[#E7ECE3]" /><div className="h-4 w-full rounded bg-[#E7ECE3]" /></div>
          <div className="mt-7 grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-[18px] bg-white" />)}</div>
          <div className="mt-7 flex gap-3 overflow-hidden">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-48 min-w-[70%] rounded-[18px] bg-white" />)}</div>
        </main>
      )}
      <div className={isInitialMobileLoading ? "hidden md:block" : "block"}>
        <HeroSection />
        <ThreePillars />
        <MarketplaceSection />
        <AIDiagnosisSection />
        <ServicesSection />
        <B2BSection />
        <HowItWorksSection />
        <BenefitsSection />
        <NewsletterSection />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
