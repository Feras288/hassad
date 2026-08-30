export type HelpFaq = { id: string; category: "الطلبات" | "السوق" | "الخدمات" | "التشخيص" | "الحساب"; question: string; answer: string };

export const HELP_FAQS: HelpFaq[] = [
  { id: "order-status", category: "الطلبات", question: "كيف أتابع حالة طلبي؟", answer: "بعد تسجيل الدخول، انتقل إلى الطلبات من لوحة الحساب لمراجعة حالة الطلب وتفاصيله المتاحة." },
  { id: "return", category: "الطلبات", question: "كيف أطلب مساعدة بخصوص الإرجاع؟", answer: "احتفظ برقم الطلب ووصف واضح للحالة، ثم استخدم نموذج التواصل لتقديم الاستفسار ومتابعة التوجيه المناسب." },
  { id: "cart", category: "السوق", question: "كيف أضيف منتجاً إلى السلة؟", answer: "اضغط أيقونة السلة في بطاقة المنتج؛ ستظهر رسالة تأكيد وتعرض الشارة كمية المنتج الموجودة في السلة." },
  { id: "product-search", category: "السوق", question: "كيف أجد المنتج المناسب؟", answer: "استخدم البحث أو الفئات والمرشحات مثل الشحن المجاني والخصومات والتقييم، ثم راجع مواصفات المنتج قبل الإضافة." },
  { id: "book-service", category: "الخدمات", question: "كيف أحجز خبيراً زراعياً؟", answer: "اختر فئة الخدمة ثم افتح ملف مقدم الخدمة أو ابدأ من صفحة الحجز، وراجع تفاصيل الخدمة قبل الإرسال." },
  { id: "provider-profile", category: "الخدمات", question: "أين أجد معلومات مقدم الخدمة؟", answer: "تظهر صفحة مقدم الخدمة خبرته وخدماته وموقعه وتقييمه وخيارات الحجز المتاحة." },
  { id: "diagnosis-start", category: "التشخيص", question: "كيف أبدأ التشخيص الذكي؟", answer: "انتقل إلى التشخيص وارفع صورة واضحة للمحصول أو استخدم صورة نموذجية، ثم أضف الملاحظات المطلوبة." },
  { id: "diagnosis-photo", category: "التشخيص", question: "ما مواصفات الصورة المناسبة للتشخيص؟", answer: "التقط صورة واضحة بإضاءة جيدة للجزء المصاب، وتجنب الخلفية المزدحمة قدر الإمكان لتسهيل مراجعة الحالة." },
  { id: "vendor-register", category: "الحساب", question: "كيف أسجل كمورد؟", answer: "اختر «كن مورداً» من الفوتر، ثم أكمل بيانات النشاط والمستندات المطلوبة وتابع حالة المراجعة." },
  { id: "account-help", category: "الحساب", question: "ماذا أفعل إذا نسيت كلمة المرور؟", answer: "استخدم رابط «نسيت كلمة المرور؟» من صفحة تسجيل الدخول واتبع خطوات التحقق ثم تعيين كلمة مرور جديدة." },
];

export function normalizeHelpSearch(value: string) {
  return value.trim().toLowerCase().replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ًٌٍَُِّْ]/g, "");
}

export function filterHelpFaqs(faqs: HelpFaq[], query: string, category: string) {
  const normalizedQuery = normalizeHelpSearch(query);
  return faqs.filter((faq) => (category === "الكل" || faq.category === category) && (!normalizedQuery || normalizeHelpSearch(`${faq.question} ${faq.answer} ${faq.category}`).includes(normalizedQuery)));
}
