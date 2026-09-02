import { drizzle } from "drizzle-orm/mysql2";
import {
  adminVendorProfiles,
  catalogCategories,
  catalogProducts,
  InsertCatalogProduct,
} from "../../drizzle/schema";

type InsertAdminVendorProfile = typeof adminVendorProfiles.$inferInsert;
type InsertCatalogCategory = typeof catalogCategories.$inferInsert;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ خطأ: لم يتم العثور على متغير البيئة DATABASE_URL في ملف .env");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ── 1. فئات المنتجات الأساسية ──────────────────────────────────────────
const categories: InsertCatalogCategory[] = [
  {
    id: "cat_fertilizers",
    name: "أسمدة ومخصبات",
    nameEn: "Fertilizers & Nutrients",
    icon: "🌱",
    color: "#2E7D32",
    description: "أسمدة كيميائية وعضوية متوازنة ومخصبات لتحسين خصوبة التربة",
    active: true,
  },
  {
    id: "cat_seeds",
    name: "بذور وتقاوي",
    nameEn: "Seeds & Seedlings",
    icon: "🌾",
    color: "#C9A227",
    description: "بذور مهجنة معتمدة وعالية الإنتاجية ومقاومة للأمراض",
    active: true,
  },
  {
    id: "cat_pesticides",
    name: "مبيدات ووقاية نبات",
    nameEn: "Crop Protection",
    icon: "🛡️",
    color: "#D97706",
    description: "مبيدات حشرية وفطرية ونيماتودية معتمدة مع فترات أمان محددة",
    active: true,
  },
  {
    id: "cat_irrigation",
    name: "شبكات ومعدات ري",
    nameEn: "Irrigation Systems",
    icon: "💧",
    color: "#0284C7",
    description: "أنظمة ري بالتنقيط ومحابس ذكية ومضخات موفرة للمياه",
    active: true,
  },
  {
    id: "cat_equipment",
    name: "آلات ومعدات زراعية",
    nameEn: "Agricultural Equipment",
    icon: "🚜",
    color: "#4B5563",
    description: "رشاشات زراعية وأدوات تقليم وحصاد عالية التحمل",
    active: true,
  },
];

// ── 2. الموردون المعتمدون ──────────────────────────────────────────────
const vendors: InsertAdminVendorProfile[] = [
  {
    id: "vnd_yamama",
    name: "شركة اليمامة للمدخلات الزراعية",
    type: "supplier",
    category: "أسمدة ومبيدات",
    status: "active",
    verified: true,
    email: "sales@alyamama-agri.com.sa",
    phone: "0114567890",
    location: "الرياض - طريق الخرج الصناعي",
    commission: 5,
    description: "موزع رئيسي معتمد للأسمدة المركبة والمبيدات الزراعية المرخصة في المملكة",
    crNumber: "1010452391",
  },
  {
    id: "vnd_namaa_irr",
    name: "مؤسسة نماء للري الحديث",
    type: "supplier",
    category: "شبكات ري",
    status: "active",
    verified: true,
    email: "info@namaa-irrigation.sa",
    phone: "0115482310",
    location: "الخرج - المنطقة الزراعية",
    commission: 5,
    description: "متخصصون في حلول الري بالتنقيط وتوريد الليات والمحابس المعالجة ضد الأشعة فوق البنفسجية",
    crNumber: "1010892341",
  },
  {
    id: "vnd_arasco_seeds",
    name: "شركة أراسكو للبذور المعتمدة",
    type: "supplier",
    category: "بذور وتقاوي",
    status: "active",
    verified: true,
    email: "support@arasco-seeds.com.sa",
    phone: "0138349120",
    location: "الدمام - المدينة الصناعية",
    commission: 5,
    description: "استيراد وتوزيع أجود أصناف البذور الهجينة F1 والمقاومة للفيروسات ومتحملة للملوحة",
    crNumber: "2050123984",
  },
  {
    id: "vnd_saudi_chem",
    name: "شركة الكيماويات الزراعية السعودية",
    type: "supplier",
    category: "وقاية نبات",
    status: "active",
    verified: true,
    email: "contact@saudi-agrichem.sa",
    phone: "0163821094",
    location: "القصيم - بريدة",
    commission: 5,
    description: "حلول وقاية متكاملة ومبيدات جهازيّة متوافقة مع متطلبات وزارة البيئة والمياه والزراعة",
    crNumber: "1131049283",
  },
  {
    id: "vnd_rawabi_tools",
    name: "مؤسسة الروابي للآلات والمعدات",
    type: "supplier",
    category: "آلات ومعدات",
    status: "active",
    verified: true,
    email: "sales@rawabi-machinery.sa",
    phone: "0126782390",
    location: "جدة - المنطقة الصناعية",
    commission: 5,
    description: "توريد معدات الرش الكهربائية وأجهزة تقليم النخيل ومستلزمات الحصاد للبيوت المحمية والمزارع",
    crNumber: "4030198234",
  },
];

// ── 3. منتجات المدخلات الزراعية الدقيقة ────────────────────────────────
const products: InsertCatalogProduct[] = [
  {
    id: "prd_npk_20_20_20",
    name: "سماد مركب NPK 20-20-20 متوازن ذواب (25 كجم)",
    nameEn: "Water-Soluble Balanced NPK 20-20-20 (25kg)",
    sku: "FERT-NPK-202020-25KG",
    category: "أسمدة ومخصبات",
    brand: "أجرو بلس (AgroPlus)",
    vendor: "شركة اليمامة للمدخلات الزراعية",
    vendorId: "vnd_yamama",
    price: 145,
    originalPrice: 165,
    unit: "كيس 25 كجم",
    minOrder: 1,
    stock: 250,
    sold: 14,
    status: "active",
    priceTiers: [
      { minQuantity: 10, unitPrice: 135 },
      { minQuantity: 50, unitPrice: 120 },
    ],
    images: [
      "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "سماد متوازن تام الذوبان في الماء غني بالعناصر الصغرى المخلبة EDTA، مناسب لجميع مراحل النمو.",
    longDesc: "تركيبة أوروبية فائقة النقاوة توفر تغذية متوازنة من النيتروجين والفوسفور والبوتاسيوم بنسبة 1:1:1، خالية تماماً من الكلور والشوائب، ومصممة لأنظمة الري بالتنقيط والرش الورقي في البيوت المحمية والحقول المكشوفة.",
    highlights: [
      "ذوبان كامل 100% في الماء دون ترسيب في النقاطات",
      "معزز بعناصر صغرى مخلبة: حديد، زنك، منغنيز، ونحاس",
      "خالٍ من الصوديوم والكلوريد وآمن للتربة الحساسة للملوحة",
    ],
    specs: [
      { label: "النيتروجين الكلي (N)", value: "20%" },
      { label: "خامس أكسيد الفوسفور (P2O5)", value: "20%" },
      { label: "أكسيد البوتاسيوم (K2O)", value: "20%" },
      { label: "العناصر الصغرى المخلبة", value: "حديد، زنك، منغنيز، نحاس، بورون" },
      { label: "الذوبان في الماء", value: "100% عند درجة حرارة 20°م" },
      { label: "بلد المنشأ", value: "بلجيكا" },
    ],
    usageInstructions: [
      "أنظمة الري بالتنقيط: يضاف بمعدل 2-4 كجم لكل هكتار يومياً حسب عمر النبات.",
      "الرش الورقي: يذاب بمعدل 200-250 جم لكل 100 لتر ماء في ساعات الصباح الباكر.",
    ],
  },
  {
    id: "prd_potassium_sulfate",
    name: "سلفات بوتاسيوم ذوابة 0-0-50+18S عالية النقاوة (25 كجم)",
    nameEn: "Soluble Potassium Sulfate 0-0-50+18S (25kg)",
    sku: "FERT-SOP-0050-25KG",
    category: "أسمدة ومخصبات",
    brand: "سولوبوتاس (SoliPotash)",
    vendor: "شركة الكيماويات الزراعية السعودية",
    vendorId: "vnd_saudi_chem",
    price: 180,
    originalPrice: 195,
    unit: "كيس 25 كجم",
    minOrder: 1,
    stock: 180,
    sold: 28,
    status: "active",
    priceTiers: [
      { minQuantity: 10, unitPrice: 170 },
      { minQuantity: 40, unitPrice: 155 },
    ],
    images: [
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "مصدر مثالي للبوتاسيوم والكبريت في مراحل عقد وتحجيم الثمار وتحسين جودة التمور والخضار.",
    longDesc: "سماد بوتاسي فوسفاتي خالي من النيتروجين والكلوريد، مخصص لرفع محتوى السكر واللون وحجم الثمار في نخيل التمر، الطماطم، البطيخ، والموالح، مع زيادة مقاومة المحصول للإجهاد المائي والحراري.",
    highlights: [
      "مثالي لمرحلة تلوين وتحجيم التمور والمحاصيل الثمرية",
      "كبريت ذواب بنسبة 18% يخفض قلوية محلول التربة",
      "معامل ملحي منخفض جداً مقارنة بكلوريد البوتاسيوم",
    ],
    specs: [
      { label: "البوتاسيوم (K2O)", value: "50% كحد أدنى" },
      { label: "الكبريت (S)", value: "18%" },
      { label: "الكلوريد (Cl)", value: "أقل من 0.5% (خالٍ من الكلور)" },
      { label: "الرقم الهيدروجيني (pH)", value: "2.8 - 3.2" },
      { label: "الوزن الصافي", value: "25 كجم" },
    ],
    usageInstructions: [
      "الجرعة في التسميد بالري: 3-5 كجم للهكتار أسبوعياً في مراحل النمو الثمري.",
      "للنخيل: 500-750 جم للشجرة الواحدة تقسم على دفعتين أثناء مرحلة الخلال والرطب.",
    ],
  },
  {
    id: "prd_humic_acid_liquid",
    name: "حمض الهيوميك العضوي السائل المركز 18% (5 لتر)",
    nameEn: "Concentrated Liquid Humic Acid 18% (5L)",
    sku: "FERT-HUMIC-LIQ-5L",
    category: "أسمدة ومخصبات",
    brand: "هيوميك تيك (HumicTech)",
    vendor: "شركة اليمامة للمدخلات الزراعية",
    vendorId: "vnd_yamama",
    price: 95,
    originalPrice: 110,
    unit: "جالون 5 لتر",
    minOrder: 1,
    stock: 120,
    sold: 45,
    status: "active",
    priceTiers: [
      { minQuantity: 4, unitPrice: 85 },
      { minQuantity: 20, unitPrice: 75 },
    ],
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "مخصب ومحسن تربة طبيعي 100% مستخلص من الليونارديت لزيادة امتصاص العناصر الغذائية.",
    longDesc: "مستخلص عضوي نشط يعمل على تفكيك التربة الطينية ورفع السعة التبادلية الكاتيونية، مما يمنع تثبيت الفوسفور والحديد في التربة الكلسية السعودية ويحفز المجموع الجذري بكفاءة عالية.",
    highlights: [
      "طبيعي وعضوي 100% معتمد للزراعة النظيفة",
      "يحفز تكوين الجذور الشعرية الجديدة بعد الشتل",
      "يرفع كفاءة امتصاص الأسمدة الكيميائية بنسبة تصل إلى 30%",
    ],
    specs: [
      { label: "حمض الهيوميك (Humic Acid)", value: "15%" },
      { label: "حمض الفولفيك (Fulvic Acid)", value: "3%" },
      { label: "أكسيد البوتاسيوم (K2O)", value: "4%" },
      { label: "المادة العضوية", value: "22%" },
      { label: "المصدر", value: "ليونارديت طبيعي نقي" },
    ],
    usageInstructions: [
      "إضافة أرضية: 2-3 لتر للهكتار مع مياه الري كل 15-20 يوماً.",
      "غمر الشتلات قبل الزراعة: 20 مل لكل 10 لتر ماء لمدة 10 دقائق.",
    ],
  },
  {
    id: "prd_tomato_seeds_f1",
    name: "بذور طماطم هجين F1 مقاومة لتجعد الأوراق TYLCV (1,000 بذرة)",
    nameEn: "Hybrid Tomato Seeds F1 TYLCV Resistant (1,000 Seeds)",
    sku: "SEED-TOM-F1-1000",
    category: "بذور وتقاوي",
    brand: "أراسكو سيليكت (Arasco Select)",
    vendor: "شركة أراسكو للبذور المعتمدة",
    vendorId: "vnd_arasco_seeds",
    price: 320,
    originalPrice: 350,
    unit: "عبوة 1000 بذرة",
    minOrder: 1,
    stock: 90,
    sold: 19,
    status: "active",
    priceTiers: [
      { minQuantity: 5, unitPrice: 300 },
      { minQuantity: 20, unitPrice: 275 },
    ],
    images: [
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "هجين طماطم غير محدود النمو للبيوت المحمية، ثمار صلبة ممتازة التخزين ومقاومة لفيروس الذبابة البيضاء.",
    longDesc: "صنف رائد مخصص لظروف البيوت المحمية في السعودية والخليج، يتميز بمقاومة وراثية عالية لفيروس تجعد واصفرار أوراق الطماطم (TYLCV) والفيوزاريوم والنيماتودا، مع ثمار ممتلئة بلون أحمر زاهي ومذاق ممتاز.",
    highlights: [
      "مقاومة ثلاثية: فيروس TYLCV + النيماتودا + الفيوزاريوم 1 و 2",
      "متوسط وزن الثمرة: 160 إلى 180 جرام",
      "صلابة استثنائية وقدرة تحمل للشحن والتخزين المبرد",
    ],
    specs: [
      { label: "نوع النمو", value: "غير محدود (Indeterminate)" },
      { label: "شكل الثمرة", value: "كروية ملساء متجانسة" },
      { label: "موسم الزراعة", value: "العروة الخريفية والشتوية والربيعية" },
      { label: "نسبة الإنبات", value: "98% كحد أدنى" },
      { label: "نسبة النقاوة الوراثية", value: "99.9%" },
    ],
    usageInstructions: [
      "الزراعة في صواني التشتيل بعمق 0.5 سم في وسط بيتموس وبرلايت معقم.",
      "تكون الشتلة جاهزة للنقل بعد 25-30 يوماً عند ظهور الورقة الحقيقية الثالثة.",
    ],
  },
  {
    id: "prd_cucumber_seeds_f1",
    name: "بذور خيار هجين F1 بيت ألفا للبيوت المحمية (500 بذرة)",
    nameEn: "Parthenocarpic Cucumber F1 Beit Alpha (500 Seeds)",
    sku: "SEED-CUC-F1-500",
    category: "بذور وتقاوي",
    brand: "رويال جرين (Royal Green)",
    vendor: "شركة أراسكو للبذور المعتمدة",
    vendorId: "vnd_arasco_seeds",
    price: 210,
    originalPrice: 230,
    unit: "عبوة 500 بذرة",
    minOrder: 1,
    stock: 140,
    sold: 32,
    status: "active",
    priceTiers: [
      { minQuantity: 6, unitPrice: 195 },
      { minQuantity: 25, unitPrice: 180 },
    ],
    images: [
      "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "خيار بكري التلقيح أنثوي بالكامل، إنتاجية فائقة ومقاومة ممتازة للبياض الدقيقي والفيروسات.",
    longDesc: "هجين محمي مبكر يتميز بسلاميات قصيرة وعقد 2 إلى 3 ثمار في كل عقدة، بطول مثالي 14-16 سم وقشرة خضراء داكنة لامعة مع تجانس تام وبدون مرارة.",
    highlights: [
      "تلقيح بكري 100% (Parthenocarpic) بدون الحاجة لحشرات تلقيح",
      "متحمل لدرجات الحرارة المرتفعة ومقاوم للبياض الدقيقي (PM)",
      "إنتاج مبكر يبدأ الحصاد بعد 35 يوماً من الشتل",
    ],
    specs: [
      { label: "طول الثمرة", value: "14 - 16 سم" },
      { label: "اللون", value: "أخضر داكن متجانس لامع" },
      { label: "فترة الجمع", value: "طويلة ومستمرة حتى 4-5 أشهر" },
      { label: "المقاومات", value: "ZYMV, WMV, PM, CVYV" },
    ],
    usageInstructions: [
      "مسافات الزراعة: 40-50 سم بين الشتلات على الخط الواحد، 100-120 سم بين الخطوط.",
      "التربية على خيط مفرد مع إزالة الأفرع الجانبية حتى ارتفاع 60 سم.",
    ],
  },
  {
    id: "prd_imidacloprid_350sc",
    name: "مبيد حشري جهازي إيميداكلوبريد 35% مركز (1 لتر)",
    nameEn: "Imidacloprid 350 SC Systemic Insecticide (1L)",
    sku: "PEST-IMIDA-350SC-1L",
    category: "مبيدات ووقاية نبات",
    brand: "كونفيكس 350 (Confix)",
    vendor: "شركة الكيماويات الزراعية السعودية",
    vendorId: "vnd_saudi_chem",
    price: 120,
    originalPrice: 135,
    unit: "عبوة 1 لتر",
    minOrder: 1,
    stock: 200,
    sold: 52,
    status: "active",
    priceTiers: [
      { minQuantity: 12, unitPrice: 110 },
      { minQuantity: 48, unitPrice: 95 },
    ],
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "مبيد حشري نيونيكوتينويد جهازي لمكافحة الذبابة البيضاء، المن، التربس، وصانعات الأنفاق.",
    longDesc: "مبيد ذو كفاءة استثنائية يعمل بالملامسة وكسم معدي، يمتص سريعاً عبر الأوراق والجذور وينتقل مع العصارة النباتية لحماية الأنسجة النامية الحديثة من الآفات الثاقبة الماصة.",
    highlights: [
      "حماية ممتدة تدوم من 3 إلى 4 أسابيع بعد المعاملة",
      "يمكن استخدامه بالرش الورقي أو حقناً في شبكة التسميد",
      "كفاءة عالية في كسر دورة حياة ناقلات الفيروسات الحشرية",
    ],
    specs: [
      { label: "المادة الفعالة", value: "إيميداكلوبريد (Imidacloprid) 350 جم/لتر" },
      { label: "صورة المستحضر", value: "معلق مركز (SC)" },
      { label: "المجموعة الكيميائية", value: "نيونيكوتينويدز (Neonicotinoids)" },
      { label: "فترة الأمان (PHI)", value: "خضار: 7 أيام | أشجار مثمرة: 14 يوماً" },
      { label: "رقم التسجيل الوزاري", value: "وزارة البيئة والمياه والزراعة - س/4921" },
    ],
    usageInstructions: [
      "الرش الورقي: 50 مل لكل 100 لتر ماء لمكافحة الذبابة البيضاء والمن والتربس.",
      "الحقن مع الري: 500 مل لكل هكتار لحماية المجموع الجذري والقمم النامية.",
    ],
  },
  {
    id: "prd_copper_fungicide",
    name: "مبيد فطري كوبروكسات سائل كبريتات النحاس الثلاثية 34.5% (1 لتر)",
    nameEn: "Cuproxat Liquid Copper Fungicide 34.5% (1L)",
    sku: "PEST-CUPROX-345-1L",
    category: "مبيدات ووقاية نبات",
    brand: "كوبروكسات (Cuproxat)",
    vendor: "شركة الكيماويات الزراعية السعودية",
    vendorId: "vnd_saudi_chem",
    price: 110,
    originalPrice: 125,
    unit: "عبوة 1 لتر",
    minOrder: 1,
    stock: 160,
    sold: 40,
    status: "active",
    priceTiers: [
      { minQuantity: 12, unitPrice: 100 },
      { minQuantity: 36, unitPrice: 90 },
    ],
    images: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "مبيد فطري وبكتيري وقائي فائق النعومة لمكافحة اللفحات، التبقعات، والبياض الزغبي في الخضار والأشجار.",
    longDesc: "مستحضر نحاسي سائل متطور يتميز بجزيئات نحاس ميكرونية فائقة الدقة تلتصق بقوة على أسطح الأوراق وتقاوم الغسيل بمياه الأمطار والري المحوري، مثالي لمكافحة اللفحة المبكرة والمتأخرة في الطماطم والبطاطس وعين الطاووس في الزيتون.",
    highlights: [
      "جزيئات نانو فائقة النعومة تغطي مساحة ورقية أوسع بتركيز أقل",
      "مقاومة عالية للغسيل بالمطر مع ثباتية ممتدة",
      "آمن ولا يسبب حروقاً للأوراق الحساسة مقارنة بالنحاس التقليدي",
    ],
    specs: [
      { label: "المادة الفعالة", value: "كبريتات النحاس القاعدية 34.5% (نحاس معدني 190 جم/ل)" },
      { label: "صورة المستحضر", value: "معلق سائل (Flowable / SC)" },
      { label: "فترة الأمان (PHI)", value: "3 أيام للخضار و 7 أيام للأشجار" },
      { label: "الهدف الحيوي", value: "فطريات وبكتيريا نباتية ممرضة" },
    ],
    usageInstructions: [
      "الرش الورقي: 200 مل لكل 100 لتر ماء عند توفر الظروف الملائمة للمرض وقائياً.",
      "تكرار الرش كل 10-14 يوماً مع تبديل المبيد مع عائلات أخرى لمنع تشكل المناعة.",
    ],
  },
  {
    id: "prd_abamectin_acaricide",
    name: "مبيد عناكيب وصانعات أنفاق أبامكتين 1.8% EC مركز (500 مل)",
    nameEn: "Abamectin 1.8% EC Miticide & Leafminer Control (500ml)",
    sku: "PEST-ABAMEC-18EC-500",
    category: "مبيدات ووقاية نبات",
    brand: "فيرتيمك بلس (VertiMec)",
    vendor: "شركة اليمامة للمدخلات الزراعية",
    vendorId: "vnd_yamama",
    price: 75,
    originalPrice: 85,
    unit: "عبوة 500 مل",
    minOrder: 1,
    stock: 190,
    sold: 63,
    status: "active",
    priceTiers: [
      { minQuantity: 10, unitPrice: 68 },
      { minQuantity: 30, unitPrice: 60 },
    ],
    images: [
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "مبيد حيوي فعال لمكافحة العنكبوت الأحمر ذو البقعتين، حلم الغبار في النخيل، وصانعات أنفاق الأوراق.",
    longDesc: "مستخلص من بكتيريا التربة الطبيعية، يمتلك خاصية اختراق صفيحة الورقة (Translaminar) ليستقر داخل النسيج الأخضر ويقضي على اليرقات والبالغات التي تتغذى على الأنسجة السفلية دون التأثير على الحشرات النافعة السطحية.",
    highlights: [
      "خاصية اختراق ورقي تقضي على الآفات المستترة أسفل الأوراق",
      "مبيد متخصص للعناكب والحلم الدودي في الحمضيات ونخيل التمر",
      "جرعة استخدام اقتصادية وفعالة من الرشة الأولى",
    ],
    specs: [
      { label: "المادة الفعالة", value: "أبامكتين (Abamectin) 18 جم/لتر" },
      { label: "طريقة التأثير", value: "معدي بالملامسة + اختراقي Translaminar" },
      { label: "فترة الأمان (PHI)", value: "طماطم وخيار: 3 أيام | حمضيات ونخيل: 7 أيام" },
    ],
    usageInstructions: [
      "الجرعة: 50 مل لكل 100 لتر ماء مع التأكد من تغطية السطح السفلي للأوراق بالكامل.",
      "لحلم الغبار في النخيل: يرش العرجون والعذوق مباشرة عند بدء مرحلة الخلال.",
    ],
  },
  {
    id: "prd_drip_irrigation_pipe_gr",
    name: "لفة ليات تنقيط زراعي مدمجة GR قطر 16 ملم تصريف 4 لتر/ساعة (400 متر)",
    nameEn: "Integrated In-Line Drip Pipe GR 16mm 4L/h (400m Roll)",
    sku: "IRR-PIPE-GR-16MM-400M",
    category: "شبكات ومعدات ري",
    brand: "نماء إريجيشن (NamaaPipe)",
    vendor: "مؤسسة نماء للري الحديث",
    vendorId: "vnd_namaa_irr",
    price: 260,
    originalPrice: 285,
    unit: "لفة 400 متر",
    minOrder: 1,
    stock: 320,
    sold: 84,
    status: "active",
    priceTiers: [
      { minQuantity: 10, unitPrice: 245 },
      { minQuantity: 50, unitPrice: 225 },
    ],
    images: [
      "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "ليات ري بالتنقيط بنقاطات داخلية مدمجة معالجة ضد انسداد الأملاح والأشعة فوق البنفسجية UV.",
    longDesc: "مصنعة من مادة البولي إيثيلين البكر عالي الكثافة (HDPE) المعالج بمانع التحلل الضوئي UV لضمان عمر تشغيلي يتجاوز 5 سنوات في أجواء الصيف الحارقة بالمملكة، وتأتي مع نقاطات بتصميم متاهة متطورة لطرد الشوائب ومنع الترسبات الكلسية.",
    highlights: [
      "مسافة بين النقاطات: 30 سم منتظمة",
      "تصريف ثابت وموزع بانتظام: 4 لتر/ساعة لكل نقاط",
      "مقاومة ممتازة للضغط العالي والمواد الكيميائية والأسمدة الحمضية",
    ],
    specs: [
      { label: "القطر الخارجي", value: "16 ملم" },
      { label: "سمك الجدار", value: "1.0 ملم (Class 2)" },
      { label: "طول اللفة", value: "400 متر" },
      { label: "ضغط التشغيل الأمثل", value: "1.0 إلى 2.5 بار" },
      { label: "المسافة بين النقاطات", value: "30 سم" },
      { label: "الضمان", value: "3 سنوات ضد عيوب التصنيع وتأثير الشمس" },
    ],
    usageInstructions: [
      "تمديد الخطوط بطول لا يتجاوز 80-100 متر لكل خط للحفاظ على توازن ضغط المياه.",
      "غسيل الخطوط بانتظام بفتح نهاياتها لمدة دقيقة واحدة مرة كل أسبوعين.",
    ],
  },
  {
    id: "prd_solenoid_valve_2inch",
    name: "محبس كهربائي ذكي 2 بوصة مع ملف لولبي 24V للتحكم الآلي بالري",
    nameEn: "Electric Solenoid Valve 2\" 24VAC with Flow Control",
    sku: "IRR-SOL-VALVE-2INCH-24V",
    category: "شبكات ومعدات ري",
    brand: "رين هانتر (RainHunter)",
    vendor: "مؤسسة نماء للري الحديث",
    vendorId: "vnd_namaa_irr",
    price: 195,
    originalPrice: 220,
    unit: "قطعة",
    minOrder: 1,
    stock: 85,
    sold: 21,
    status: "active",
    priceTiers: [
      { minQuantity: 4, unitPrice: 180 },
      { minQuantity: 12, unitPrice: 165 },
    ],
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "محبس كهرومغناطيسي صناعي عالي التحمل للتحكم في قطاعات الري الزراعية عبر أجهزة التايمر الذكية.",
    longDesc: "هيكل مصنوع من النايلون المقوى بالألياف الزجاجية مع غشاء مطاطي Santoprene عالي المرونة، مصمم لتحمل ضغوط المياه العالية حتى 10 بار، مزود بمقبض تحكم يدوي للتدفق وإمكانية الفتح اليدوي في حال انقطاع التيار الكهربائي.",
    highlights: [
      "ملف لولبي 24 فولت تيار متردد (24V AC) عازل للماء IP68",
      "معدل تدفق هائل يصل حتى 35 متر مكعب / ساعة",
      "فلتر داخلي ذاتي التنظيف يحمي الغشاء من الشوائب والرمال",
    ],
    specs: [
      { label: "المقاس والسن", value: "2 بوصة داخلي (2\" BSP Female)" },
      { label: "أقصى ضغط تشغيلي", value: "10 بار (150 PSI)" },
      { label: "جهد الملف (Solenoid)", value: "24 VAC, 50/60 Hz" },
      { label: "جسم المحبس", value: "نايلون مقوى بالفايبر جلاس مقاوم للكيماويات" },
    ],
    usageInstructions: [
      "يوصى بتركيب فلتر ري شبكي أو رملي قبل مجموعة المحابس لحمايتها من الحصى.",
      "ربط السلكين بمؤقت الري الزراعي باستخدام وصلات عازلة للرطوبة (Waterproof Wire Nuts).",
    ],
  },
  {
    id: "prd_electric_sprayer_16l",
    name: "رشاشة ظهرية زراعية شحن كهربائي مع بطارية ليثيوم 16 لتر",
    nameEn: "Electric Backpack Agricultural Sprayer 16L Lithium",
    sku: "EQP-SPRAYER-ELEC-16L",
    category: "آلات ومعدات زراعية",
    brand: "باور إيجري (PowerAgri)",
    vendor: "مؤسسة الروابي للآلات والمعدات",
    vendorId: "vnd_rawabi_tools",
    price: 185,
    originalPrice: 210,
    unit: "جهاز كامل",
    minOrder: 1,
    stock: 65,
    sold: 37,
    status: "active",
    priceTiers: [
      { minQuantity: 3, unitPrice: 170 },
      { minQuantity: 10, unitPrice: 155 },
    ],
    images: [
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "رشاشة ضغط كهربائية قابلة لإعادة الشحن تمنح رذاذاً متجانساً بدون مجهود ضخ يدوي.",
    longDesc: "مزودة بمضخة غشائية أوتوماتيكية عالية الكفاءة وبطارية ليثيوم أيون خفيفة الوزن تكفي لـ 6 إلى 8 ساعات من الرش المتواصل بشحنة واحدة، تأتي مع ذراع رش استانلس ستيل قابل للسحب ومفتاح تحكم في سرعة وقوة الضغط.",
    highlights: [
      "بطارية ليثيوم حديثة تدوم حتى 25-30 خزان بشحنة واحدة",
      "مفتاح تحكم في سرعة وضغط الرش من 1.5 إلى 4 بار",
      "طقم 4 فوهات مختلفة: مخروطية، مروحية، مزدوجة، وفوهة 4 فتحات",
    ],
    specs: [
      { label: "سعة الخزان", value: "16 لتر بولي بروبلين خفيف الوزن مقاوم للصدمات" },
      { label: "البطارية", value: "ليثيوم أيون 12 فولت / 8 أمبير" },
      { label: "أقصى ضغط", value: "4.5 بار (65 PSI)" },
      { label: "معدل التدفق", value: "1.8 إلى 3.0 لتر في الدقيقة" },
      { label: "الوزن فارغة", value: "3.2 كجم فقط" },
    ],
    usageInstructions: [
      "شحن البطارية بالكامل قبل الاستخدام الأول لمدة 4 ساعات باستخدام الشاحن المرفق.",
      "غسيل الخزان والمضخة بالماء النظيف بعد رش المبيدات لمنع ترسب المواد الفعالة.",
    ],
  },
  {
    id: "prd_pruning_shears_sk5",
    name: "مقص تقليم أغصان ونخيل احترافي فولاذي ياباني SK5 مع مقبض ألومنيوم",
    nameEn: "Professional SK5 Steel Pruning Shears for Orchards & Palms",
    sku: "EQP-SHEAR-SK5-HEAVY",
    category: "آلات ومعدات زراعية",
    brand: "ساموراي جاردن (SamuraiGarden)",
    vendor: "مؤسسة الروابي للآلات والمعدات",
    vendorId: "vnd_rawabi_tools",
    price: 65,
    originalPrice: 75,
    unit: "قطعة",
    minOrder: 1,
    stock: 150,
    sold: 48,
    status: "active",
    priceTiers: [
      { minQuantity: 5, unitPrice: 58 },
      { minQuantity: 20, unitPrice: 50 },
    ],
    images: [
      "https://images.unsplash.com/photo-1598880940371-c756e015fea1?w=800&auto=format&fit=crop&q=80",
    ],
    shortDesc: "شفرة يابانية حادة ومطلية بالتفلون المقاوم للصدأ لقص الأغصان الصلبة حتى سمك 25 ملم بسلاسة.",
    longDesc: "مقص بستنة احترافي مخصص لتقليم أشجار الفاكهة والزيتون وكرب النخيل، يتميز بهيكل ألومنيوم مسبوك خفيف الوزن ومقبض مريح مانع للانزلاق، مع زنبرك هيدروليكي ناعم يقلل من إجهاد اليد أثناء ساعات العمل الطويلة.",
    highlights: [
      "شفرة مصنوعة من فولاذ SK-5 الياباني الكربوني المقسى",
      "طلاء تفلون يمنع التصاق النسغ والألياف بالشفرة",
      "قفل أمان بإبهام واحد لسهولة الفتح والإغلاق",
    ],
    specs: [
      { label: "مادة الشفرة", value: "فولاذ ياباني SK-5 عالي الكربون" },
      { label: "أقصى قطر للقطع", value: "25 ملم (1 بوصة)" },
      { label: "الطول الكلي", value: "215 ملم" },
      { label: "الوزن", value: "240 جرام" },
    ],
    usageInstructions: [
      "القص بزاوية 45 درجة فوق البرعم بحوالي 5 ملم لضمان تصريف العصارة وسرعة التئام الجرح.",
      "مسح الشفرة بقطعة قماش مبللة بالكحول بعد الانتهاء، ثم تزييتها بزيت خفيف.",
    ],
  },
];

async function seed() {
  console.log("🌱 بدء إدخال بيانات العرض التجريبية الاحترافية...");

  // 1. إدخال الفئات
  for (const cat of categories) {
    await db
      .insert(catalogCategories)
      .values(cat)
      .onDuplicateKeyUpdate({ set: { name: cat.name, active: true } });
  }
  console.log(`✅ تم تجهيز ${categories.length} فئات رئيسية.`);

  // 2. إدخال الموردين
  for (const vendor of vendors) {
    await db
      .insert(adminVendorProfiles)
      .values(vendor)
      .onDuplicateKeyUpdate({
        set: {
          name: vendor.name,
          category: vendor.category,
          status: vendor.status,
          verified: vendor.verified,
        },
      });
  }
  console.log(`✅ تم تجهيز ${vendors.length} موردين معتمدين.`);

  // 3. إدخال المنتجات
  for (const product of products) {
    await db
      .insert(catalogProducts)
      .values(product)
      .onDuplicateKeyUpdate({
        set: {
          name: product.name,
          price: product.price,
          stock: product.stock,
          status: product.status,
          images: product.images,
          specs: product.specs,
          priceTiers: product.priceTiers,
          shortDesc: product.shortDesc,
          longDesc: product.longDesc,
          highlights: product.highlights,
          usageInstructions: product.usageInstructions,
        },
      });
  }
  console.log(`✅ تم تجهيز ${products.length} منتجات زراعية احترافية بمعلومات دقيقة.`);

  console.log("\n🎉 اكتمل الإدخال بنجاح! جميع المنتجات الآن حية ومتاحة في المتجر ولوحة الإدارة.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ حدث خطأ أثناء إدخال البيانات:", err);
  process.exit(1);
});
