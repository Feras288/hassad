/**
 * One-off seed for populating the storefront with a real demo catalog before partner demos.
 * Run with: pnpm seed:demo-products
 *
 * Uses only free-to-reuse Wikimedia Commons photographs (no fabricated brands, ratings,
 * reviews, or certifications). rating/reviewCount/sold are left at 0 since these are new
 * listings with no real transaction history yet.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  adminVendorProfiles,
  catalogCategories,
  catalogProducts,
  InsertCatalogProduct,
} from "../drizzle/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const db = drizzle(process.env.DATABASE_URL);

  // Ensure tables exist in case migrations haven't run on production
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`admin_vendor_profiles\` (
      \`id\` varchar(64) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`type\` enum('supplier','provider') NOT NULL DEFAULT 'supplier',
      \`category\` varchar(160) NOT NULL,
      \`status\` enum('active','inactive','pending','suspended') NOT NULL DEFAULT 'pending',
      \`verified\` boolean NOT NULL DEFAULT false,
      \`email\` varchar(320) NOT NULL,
      \`phone\` varchar(32) NOT NULL,
      \`location\` varchar(160) NOT NULL,
      \`logoUrl\` text,
      \`commission\` int NOT NULL DEFAULT 0,
      \`description\` text,
      \`website\` varchar(500),
      \`crNumber\` varchar(120),
      \`vatNumber\` varchar(120),
      \`bankName\` varchar(160),
      \`bankIban\` varchar(120),
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`catalog_categories\` (
      \`id\` varchar(64) NOT NULL,
      \`name\` varchar(160) NOT NULL,
      \`nameEn\` varchar(160) NOT NULL,
      \`icon\` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`color\` varchar(16) NOT NULL DEFAULT '#4CAF50',
      \`description\` text,
      \`active\` boolean NOT NULL DEFAULT true,
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`catalog_products\` (
      \`id\` varchar(64) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`nameEn\` varchar(255),
      \`sku\` varchar(120) NOT NULL,
      \`category\` varchar(120) NOT NULL,
      \`brand\` varchar(160),
      \`vendor\` varchar(255) NOT NULL,
      \`vendorId\` varchar(64) NOT NULL,
      \`price\` int NOT NULL,
      \`originalPrice\` int,
      \`priceTiers\` json,
      \`tierPricingStartsAt\` timestamp NULL,
      \`tierPricingEndsAt\` timestamp NULL,
      \`unit\` varchar(120) NOT NULL,
      \`minOrder\` int NOT NULL DEFAULT 1,
      \`stock\` int NOT NULL DEFAULT 0,
      \`sold\` int NOT NULL DEFAULT 0,
      \`status\` enum('active','inactive','pending_review','rejected','out_of_stock') NOT NULL DEFAULT 'pending_review',
      \`images\` json NOT NULL,
      \`shortDesc\` text,
      \`longDesc\` text,
      \`highlights\` json,
      \`specs\` json,
      \`usageInstructions\` json,
      \`certifications\` json,
      \`tags\` json,
      \`shortDescEn\` text,
      \`longDescEn\` text,
      \`highlightsEn\` json,
      \`specsEn\` json,
      \`rating\` int NOT NULL DEFAULT 0,
      \`reviewCount\` int NOT NULL DEFAULT 0,
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`catalog_products_sku_unique\` (\`sku\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const columnsToAdd = [
    { col: "shortDescEn", def: "text NULL" },
    { col: "longDescEn", def: "text NULL" },
    { col: "highlightsEn", def: "json NULL" },
    { col: "specsEn", def: "json NULL" },
    { col: "usageInstructionsEn", def: "json NULL" },
    { col: "certificationsEn", def: "json NULL" },
    { col: "tagsEn", def: "json NULL" },
    { col: "certifications", def: "json NULL" },
    { col: "priceTiers", def: "json NULL" },
    { col: "tierPricingStartsAt", def: "timestamp NULL" },
    { col: "tierPricingEndsAt", def: "timestamp NULL" },
  ];

  for (const item of columnsToAdd) {
    try {
      await db.execute(
        sql.raw(`ALTER TABLE \`catalog_products\` ADD COLUMN \`${item.col}\` ${item.def}`)
      );
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME" && err.errno !== 1060) {
        console.warn(`Note on column ${item.col}:`, err.message);
      }
    }
  }

  const vendorSupplies = {
    id: `vendor_${nanoid(10)}`,
    name: "مؤسسة الحصاد للمستلزمات الزراعية",
    type: "supplier" as const,
    category: "بذور وأسمدة ومعدات زراعية",
    status: "active" as const,
    verified: false,
    email: "supplies@hasaad-demo.sa",
    phone: "+966500000001",
    location: "الرياض",
    description:
      "مورد مستلزمات زراعية يقدم البذور والأسمدة ومعدات الري ومكافحة الآفات والأدوات الزراعية.",
  };

  const vendorFarms = {
    id: `vendor_${nanoid(10)}`,
    name: "مزارع الواحة للمنتجات الزراعية المحلية",
    type: "supplier" as const,
    category: "منتجات محلية وشتلات وأعلاف",
    status: "active" as const,
    verified: false,
    email: "farms@hasaad-demo.sa",
    phone: "+966500000002",
    location: "القصيم",
    description:
      "منتج محلي للتمور والعسل وزيت الزيتون والشتلات والأعلاف الحيوانية.",
  };

  await db
    .insert(adminVendorProfiles)
    .values([vendorSupplies, vendorFarms])
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  const categories: (typeof catalogCategories.$inferInsert)[] = [
    {
      id: "cat_seeds",
      name: "بذور ومستلزمات الزراعة",
      nameEn: "Seeds & Planting Supplies",
      icon: "🌱",
      color: "#4CAF50",
      description: "بذور خضروات ومحاصيل معتمدة للزراعة.",
    },
    {
      id: "cat_fertilizers",
      name: "الأسمدة الزراعية",
      nameEn: "Fertilizers",
      icon: "🧪",
      color: "#8D6E63",
      description: "أسمدة معدنية وعضوية لتغذية التربة والمحاصيل.",
    },
    {
      id: "cat_pest_control",
      name: "مكافحة الآفات",
      nameEn: "Pest Control",
      icon: "🧯",
      color: "#F4511E",
      description: "معدات رش ومكافحة الآفات الزراعية.",
    },
    {
      id: "cat_irrigation",
      name: "معدات الري",
      nameEn: "Irrigation Equipment",
      icon: "💧",
      color: "#1E88E5",
      description: "أنظمة وأدوات الري الحديثة لترشيد استهلاك المياه.",
    },
    {
      id: "cat_tools",
      name: "الأدوات الزراعية",
      nameEn: "Farm Tools",
      icon: "🛠️",
      color: "#6D4C41",
      description: "أدوات يدوية للعناية بالمزرعة والحديقة.",
    },
    {
      id: "cat_seedlings",
      name: "الشتلات والنباتات",
      nameEn: "Seedlings & Plants",
      icon: "🌴",
      color: "#43A047",
      description: "فسائل وشتلات جاهزة للزراعة.",
    },
    {
      id: "cat_local_products",
      name: "المنتجات المحلية",
      nameEn: "Local Products",
      icon: "🍯",
      color: "#FB8C00",
      description: "منتجات زراعية محلية جاهزة للاستهلاك.",
    },
    {
      id: "cat_feed",
      name: "الأعلاف الحيوانية",
      nameEn: "Animal Feed",
      icon: "🐐",
      color: "#795548",
      description: "أعلاف وأتبان لتغذية الماشية.",
    },
  ];

  await db
    .insert(catalogCategories)
    .values(categories)
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  const wikimedia = (thumbUrl: string) => thumbUrl.split("?")[0];

  const products: InsertCatalogProduct[] = [
    {
      id: `prod_${nanoid(10)}`,
      name: "بذور طماطم هجين صنف روما",
      nameEn: "Hybrid Roma Tomato Seeds",
      sku: "SEED-TOM-001",
      category: "بذور ومستلزمات الزراعة",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 28,
      unit: "عبوة 10 غم",
      minOrder: 1,
      stock: 180,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Starr-110215-0963-Solanum_lycopersicum-seed_packet-KiHana_Nursery_Kihei-Maui_%2824956930012%29.jpg/1280px-Starr-110215-0963-Solanum_lycopersicum-seed_packet-KiHana_Nursery_Kihei-Maui_%2824956930012%29.jpg"
        ),
      ],
      shortDesc: "بذور طماطم هجين صنف روما مناسبة للزراعة المكشوفة والمحمية.",
      longDesc:
        "بذور طماطم من صنف روما ذات الشكل البيضاوي، مناسبة للزراعة في التربة المكشوفة أو داخل البيوت المحمية. تُزرع البذور على عمق 0.5-1 سم مع الحفاظ على رطوبة التربة حتى الإنبات.",
      highlights: [
        "صنف روما البيضاوي",
        "مناسبة للزراعة المكشوفة والمحمية",
        "عبوة 10 غرام",
      ],
      specs: [
        { label: "الصنف", value: "روما" },
        { label: "مدة الإنبات التقريبية", value: "7-10 أيام" },
        { label: "الوزن الصافي", value: "10 غم" },
      ],
      usageInstructions: [
        "ازرع البذور على عمق 0.5-1 سم",
        "حافظ على رطوبة التربة حتى الإنبات",
        "انقل الشتلات بعد ظهور 3-4 أوراق حقيقية",
      ],
      tags: ["بذور", "طماطم", "خضروات"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "بذور قمح بلدي معتمد",
      nameEn: "Certified Local Wheat Seed",
      sku: "SEED-WHT-001",
      category: "بذور ومستلزمات الزراعة",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 95,
      unit: "كيس 25 كغم",
      minOrder: 1,
      stock: 60,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Sunset-over-the-wheat-field-featured.jpg/1280px-Sunset-over-the-wheat-field-featured.jpg"
        ),
      ],
      shortDesc: "بذور قمح معتمدة مناسبة لمزارع الحبوب في المناطق الزراعية.",
      longDesc:
        "بذور قمح مُنتقاة تُستخدم لزراعة محصول الحبوب الرئيسي، وتُزرع عادة في مواسم الشتاء ضمن دورة زراعية منتظمة مع ري تكميلي حسب نوع التربة.",
      highlights: ["كيس 25 كغم", "مناسبة لدورة زراعة الحبوب"],
      specs: [
        { label: "الوزن", value: "25 كغم" },
        { label: "الاستخدام", value: "زراعة حقلية" },
      ],
      usageInstructions: [
        "احرث التربة جيداً قبل الزراعة",
        "وزّع البذور بانتظام على عمق 3-5 سم",
        "اروِ الأرض بعد الزراعة مباشرة",
      ],
      tags: ["بذور", "قمح", "حبوب"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "سماد DAP (فوسفات ثنائي الأمونيوم)",
      nameEn: "DAP Fertilizer (Diammonium Phosphate)",
      sku: "FERT-DAP-001",
      category: "الأسمدة الزراعية",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 140,
      unit: "كيس 50 كغم",
      minOrder: 1,
      stock: 90,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/DAP_%28Diammonium_Phosphate%29_Granules_%281%29.jpg/1280px-DAP_%28Diammonium_Phosphate%29_Granules_%281%29.jpg"
        ),
      ],
      shortDesc: "سماد فوسفاتي حبيبي يوفر الفوسفور والنيتروجين للتربة.",
      longDesc:
        "سماد ثنائي فوسفات الأمونيوم (DAP) على شكل حبيبات، يُستخدم عادة كسماد أساسي وقت الزراعة لإمداد التربة بعنصري الفوسفور والنيتروجين اللازمين لنمو الجذور.",
      highlights: ["حبيبات فوسفاتية", "كيس 50 كغم", "يُستخدم كسماد أساسي"],
      specs: [
        { label: "المحتوى", value: "فوسفور 46% + نيتروجين 18%" },
        { label: "الوزن", value: "50 كغم" },
      ],
      usageInstructions: [
        "يُضاف عادة عند التحضير للزراعة",
        "يُخلط مع التربة قبل الري",
        "يُخزَّن في مكان جاف بعيداً عن الرطوبة",
      ],
      tags: ["سماد", "DAP", "فوسفات"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "سماد عضوي (كمبوست طبيعي)",
      nameEn: "Natural Organic Compost",
      sku: "FERT-CMP-001",
      category: "الأسمدة الزراعية",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 45,
      unit: "كيس 20 كغم",
      minOrder: 1,
      stock: 120,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Composting_Creates_A_Natural_Fertilizer_%283678247587%29.jpg/1280px-Composting_Creates_A_Natural_Fertilizer_%283678247587%29.jpg"
        ),
      ],
      shortDesc:
        "سماد عضوي متحلل يحسّن بنية التربة وقدرتها على الاحتفاظ بالماء.",
      longDesc:
        "سماد عضوي ناتج عن تحلل المواد النباتية، يُستخدم لتحسين خصائص التربة الفيزيائية وزيادة نشاطها الحيوي، ويُضاف قبل الزراعة أو بشكل دوري خلال الموسم.",
      highlights: ["مصدر طبيعي", "كيس 20 كغم", "يحسّن بنية التربة"],
      specs: [{ label: "الوزن", value: "20 كغم" }],
      usageInstructions: [
        "يُخلط مع التربة السطحية قبل الزراعة",
        "يمكن إضافته حول جذور النباتات القائمة",
      ],
      tags: ["سماد", "عضوي", "كمبوست"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "رشاش ظهري يدوي 16 لتر",
      nameEn: "Manual Backpack Sprayer 16L",
      sku: "TOOL-SPR-001",
      category: "مكافحة الآفات",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 135,
      unit: "قطعة",
      minOrder: 1,
      stock: 45,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Spraying_pesticides_in_quinoa_field.JPG/1280px-Spraying_pesticides_in_quinoa_field.JPG"
        ),
      ],
      shortDesc: "رشاش ظهري يدوي بسعة 16 لتر لرش المبيدات والأسمدة السائلة.",
      longDesc:
        "رشاش ظهري يعمل بالضخ اليدوي بسعة خزان 16 لتراً، يُستخدم لرش المبيدات الحشرية أو الفطرية أو الأسمدة الورقية على المساحات الصغيرة والمتوسطة.",
      highlights: ["سعة 16 لتر", "ضخ يدوي", "حزام كتف قابل للتعديل"],
      specs: [
        { label: "سعة الخزان", value: "16 لتر" },
        { label: "طريقة التشغيل", value: "ضخ يدوي" },
      ],
      usageInstructions: [
        "املأ الخزان بالمحلول المطلوب حسب إرشادات المنتج",
        "اضخ الرافعة للحصول على ضغط الرش المناسب",
        "نظّف الرشاش جيداً بعد كل استخدام",
      ],
      tags: ["رشاش", "مكافحة آفات", "معدات"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "طقم ري بالتنقيط لكل الحقل",
      nameEn: "Field Drip Irrigation Kit",
      sku: "IRR-DRP-001",
      category: "معدات الري",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 380,
      unit: "طقم",
      minOrder: 1,
      stock: 30,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/NRCS-EQIP_Water_Wise_Irrigation_at_Schirmer_Farms_%2820200728-NRCS-LSC-0094%29.jpg/1280px-NRCS-EQIP_Water_Wise_Irrigation_at_Schirmer_Farms_%2820200728-NRCS-LSC-0094%29.jpg"
        ),
      ],
      shortDesc: "طقم ري بالتنقيط يشمل الأنابيب والنقاطات لتوزيع مياه منتظم.",
      longDesc:
        "طقم ري بالتنقيط يتضمن خطوط أنابيب رئيسية وفرعية ونقاطات مياه، يُستخدم لتوصيل المياه مباشرة إلى منطقة الجذور بما يقلل الفاقد المائي مقارنة بالري السطحي التقليدي.",
      highlights: [
        "يغطي مساحات حقلية متوسطة",
        "يقلل الفاقد المائي",
        "تركيب بالأنابيب والنقاطات",
      ],
      specs: [{ label: "المكونات", value: "أنابيب رئيسية وفرعية + نقاطات" }],
      usageInstructions: [
        "خطط لمسار الأنابيب حسب مساحة الحقل",
        "ثبّت النقاطات على مسافات متساوية قرب جذور النباتات",
        "افحص الشبكة دورياً للتأكد من عدم وجود انسداد",
      ],
      tags: ["ري", "تنقيط", "معدات ري"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "مجموعة أدوات زراعية يدوية",
      nameEn: "Hand Garden Tool Set",
      sku: "TOOL-SET-001",
      category: "الأدوات الزراعية",
      vendor: vendorSupplies.name,
      vendorId: vendorSupplies.id,
      price: 85,
      unit: "طقم",
      minOrder: 1,
      stock: 70,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Garden_tools_rack_%28i%29.jpg/1280px-Garden_tools_rack_%28i%29.jpg"
        ),
      ],
      shortDesc: "مجموعة أدوات يدوية أساسية للعناية بالتربة والنباتات.",
      longDesc:
        "مجموعة أدوات زراعية يدوية تشمل أدوات الحفر والتقليم والتعشيب الأساسية، مناسبة للحدائق المنزلية والمزارع الصغيرة.",
      highlights: ["أدوات متعددة الاستخدام", "مناسبة للحدائق والمزارع الصغيرة"],
      specs: [{ label: "الاستخدام", value: "حفر، تعشيب، تقليم" }],
      usageInstructions: [
        "نظّف الأدوات بعد كل استخدام",
        "خزّنها في مكان جاف لإطالة عمرها",
      ],
      tags: ["أدوات", "حديقة", "زراعة"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "شتلة نخيل تمر (فسيلة)",
      nameEn: "Date Palm Seedling",
      sku: "SEED-PLM-001",
      category: "الشتلات والنباتات",
      vendor: vendorFarms.name,
      vendorId: vendorFarms.id,
      price: 120,
      unit: "فسيلة",
      minOrder: 1,
      stock: 40,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Date_Palm_seedlings_2010.jpg/1280px-Date_Palm_seedlings_2010.jpg"
        ),
      ],
      shortDesc: "فسيلة نخيل تمر جاهزة للزراعة في المزارع والحدائق.",
      longDesc:
        "فسيلة نخيل تمر (Phoenix dactylifera) في طور النمو المبكر، مناسبة للزراعة في المزارع والحدائق ضمن المناطق ذات المناخ الملائم لزراعة النخيل.",
      highlights: ["فسيلة نخيل تمر", "مناسبة للمناخ المحلي"],
      specs: [{ label: "النوع", value: "نخيل تمر (Phoenix dactylifera)" }],
      usageInstructions: [
        "اختر موقعاً مشمساً جيد الصرف",
        "اروِ الفسيلة بانتظام خلال فترة التأسيس الأولى",
      ],
      tags: ["نخيل", "شتلات", "فسائل"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "تمر فاخر صنف مجدول",
      nameEn: "Premium Medjool Dates",
      sku: "FOOD-DAT-001",
      category: "المنتجات المحلية",
      vendor: vendorFarms.name,
      vendorId: vendorFarms.id,
      price: 65,
      unit: "علبة 1 كغم",
      minOrder: 1,
      stock: 150,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Date_Fruits-Duo.jpg/1280px-Date_Fruits-Duo.jpg"
        ),
      ],
      shortDesc: "تمر مجدول طازج معبأ في علبة 1 كغم.",
      longDesc:
        "تمر من صنف مجدول، ذو حجم كبير وقوام طري، مُعبأ في علبة بوزن 1 كغم جاهزة للاستهلاك المباشر أو التقديم.",
      highlights: ["صنف مجدول", "علبة 1 كغم", "جاهز للاستهلاك"],
      specs: [
        { label: "الصنف", value: "مجدول" },
        { label: "الوزن الصافي", value: "1 كغم" },
      ],
      usageInstructions: [
        "يُحفظ في مكان بارد وجاف أو في الثلاجة لإطالة مدة الصلاحية",
      ],
      tags: ["تمور", "منتجات محلية", "مجدول"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "عسل طبيعي نقي",
      nameEn: "Pure Natural Honey",
      sku: "FOOD-HNY-001",
      category: "المنتجات المحلية",
      vendor: vendorFarms.name,
      vendorId: vendorFarms.id,
      price: 90,
      unit: "برطمان 500 غم",
      minOrder: 1,
      stock: 85,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Runny_hunny.jpg/1280px-Runny_hunny.jpg"
        ),
      ],
      shortDesc: "عسل طبيعي معبأ في برطمان زجاجي بوزن 500 غم.",
      longDesc:
        "عسل نحل طبيعي مُصفّى ومُعبأ في برطمان زجاجي بوزن 500 غرام، مناسب للاستخدام المباشر أو في الوصفات الغذائية.",
      highlights: ["برطمان زجاجي 500 غم", "عسل مصفّى"],
      specs: [{ label: "الوزن الصافي", value: "500 غم" }],
      usageInstructions: [
        "يُحفظ في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة",
      ],
      tags: ["عسل", "منتجات محلية"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "زيت زيتون بكر ممتاز",
      nameEn: "Extra Virgin Olive Oil",
      sku: "FOOD-OIL-001",
      category: "المنتجات المحلية",
      vendor: vendorFarms.name,
      vendorId: vendorFarms.id,
      price: 75,
      unit: "زجاجة 1 لتر",
      minOrder: 1,
      stock: 100,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Bottle_of_olive_oil.jpg/1280px-Bottle_of_olive_oil.jpg"
        ),
      ],
      shortDesc: "زيت زيتون بكر ممتاز معبأ في زجاجة سعة 1 لتر.",
      longDesc:
        "زيت زيتون بكر ممتاز ناتج عن العصر البارد لثمار الزيتون، معبأ في زجاجة زجاجية سعة 1 لتر، مناسب للطهي والاستخدام اليومي.",
      highlights: ["عصرة باردة", "زجاجة 1 لتر"],
      specs: [{ label: "الحجم", value: "1 لتر" }],
      usageInstructions: ["يُحفظ في مكان بارد ومظلم بعيداً عن مصادر الحرارة"],
      tags: ["زيت زيتون", "منتجات محلية"],
    },
    {
      id: `prod_${nanoid(10)}`,
      name: "دريس برسيم (علف حيواني)",
      nameEn: "Alfalfa Hay (Animal Feed)",
      sku: "FEED-ALF-001",
      category: "الأعلاف الحيوانية",
      vendor: vendorFarms.name,
      vendorId: vendorFarms.id,
      price: 32,
      unit: "بالة",
      minOrder: 5,
      stock: 200,
      sold: 0,
      status: "active",
      images: [
        wikimedia(
          "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Alfalfa_round_bales.jpg/1280px-Alfalfa_round_bales.jpg"
        ),
      ],
      shortDesc: "بالات دريس برسيم مجفف لتغذية المواشي والأغنام.",
      longDesc:
        "دريس برسيم مجفف ومضغوط على شكل بالات، يُستخدم كعلف خشن أساسي لتغذية الأبقار والأغنام والماعز.",
      highlights: ["علف خشن مجفف", "مناسب للأبقار والأغنام"],
      specs: [{ label: "النوع", value: "دريس برسيم" }],
      usageInstructions: ["يُخزَّن في مكان جاف ومهوى لتجنب التعفن"],
      tags: ["أعلاف", "برسيم", "ماشية"],
    },
  ];

  await db
    .insert(catalogProducts)
    .values(products)
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  console.log(
    `Seeded ${products.length} products, 2 vendors, ${categories.length} categories.`
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
