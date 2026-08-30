/*
 * HASAAD PLATFORM — Scroll To Top Button
 * Appears when user scrolls down
 */

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-[#2E7D32] hover:bg-[#4CAF50] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
      aria-label="العودة للأعلى"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
