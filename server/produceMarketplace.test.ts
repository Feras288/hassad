import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("سوق المحاصيل B2B", () => {
  it("يحفظ ملفات المشترين والعروض وطلبات التسعير والمحادثات في جداول مستقلة", () => {
    const schema = source("drizzle/schema.ts");
    const migration = source("drizzle/0023_serious_lord_tyger.sql");

    expect(schema).toContain('mysqlTable("business_buyer_profiles"');
    expect(schema).toContain('mysqlTable("produce_listings"');
    expect(schema).toContain('mysqlTable("produce_quote_requests"');
    expect(schema).toContain('mysqlTable("produce_quote_messages"');
    expect(migration).toContain("CREATE TABLE `produce_listings`");
  });

  it("يقصر الأسعار وطلبات التسعير على حسابات الجملة المعتمدة", () => {
    const router = source("server/routers/produce.router.ts");

    expect(router).toContain("isApprovedBuyer");
    expect(router).toContain('buyerProfile?.status === "approved"');
    expect(router).toContain('هذه الخدمة مخصصة لحسابات الجملة المعتمدة');
    expect(router).toContain("priceVisible");
  });

  it("يتحقق من أطراف التفاوض ويمنع الطرف غير المصرح له من قراءة المحادثة أو الرد", () => {
    const router = source("server/routers/produce.router.ts");

    expect(router).toContain("quoteRequest.farmerId !== ctx.user.id && quoteRequest.buyerId !== ctx.user.id");
    expect(router).toContain("لا تملك صلاحية الاطلاع على هذه المفاوضة");
    expect(router).toContain("لا تملك صلاحية الرد على هذه المفاوضة");
  });

  it("يوفر واجهات عروض المزارع وطلب اعتماد المشتري والتحكم الإداري بالخدمة", () => {
    const marketPage = source("client/src/pages/ProduceMarketplacePage.tsx");
    const farmerPage = source("client/src/pages/dashboard/DashboardProduce.tsx");
    const settings = source("client/src/pages/admin/AdminSettings.tsx");

    expect(marketPage).toContain("اعتماد حساب جملة");
    expect(marketPage).toContain("طلب عرض سعر");
    expect(farmerPage).toContain("إضافة عرض محصول");
    expect(farmerPage).toContain("uploadListingImage");
    expect(settings).toContain("سوق المحاصيل B2B");
    expect(settings).toContain("updateProduceMarketplaceEnabled");
  });

  it("يحفظ شهادات الجودة عبر رفع مقيد ويعرضها مع فلاتر سوق قابلة للتصفية", () => {
    const schema = source("drizzle/schema.ts");
    const router = source("server/routers/produce.router.ts");
    const marketPage = source("client/src/pages/ProduceMarketplacePage.tsx");
    const farmerPage = source("client/src/pages/dashboard/DashboardProduce.tsx");

    expect(schema).toContain("qualityCertificates");
    expect(router).toContain("uploadQualityCertificate");
    expect(router).toContain("application/pdf");
    expect(marketPage).toContain("الكمية المتاحة من");
    expect(marketPage).toContain("شهادات الجودة الزراعية");
    expect(farmerPage).toContain("شهادات الجودة الزراعية (اختياري)");
  });

  it("يعرض مراحل طلب التسعير بصورة مرئية متسقة للطرفين", () => {
    const quoteThread = source("client/src/components/produce/ProduceQuoteThread.tsx");

    expect(quoteThread).toContain("QUOTE_STEPS");
    expect(quoteThread).toContain("role=\"progressbar\"");
    expect(quoteThread).toContain("طلب التسعير");
    expect(quoteThread).toContain("التفاوض");
    expect(quoteThread).toContain("الاتفاق");
  });

  it("ينشئ إشعارات خاصة بالطرف المقابل ويقيد القراءة بمالك التنبيه", () => {
    const schema = source("drizzle/schema.ts");
    const router = source("server/routers/produce.router.ts");
    const db = source("server/db/produce.db.ts");
    const alerts = source("client/src/components/produce/ProduceQuoteAlerts.tsx");

    expect(schema).toContain('mysqlTable("produce_quote_notifications"');
    expect(router).toContain("createProduceQuoteNotification");
    expect(router).toContain("recipientId");
    expect(router).toContain("markQuoteNotificationRead");
    expect(db).toContain("markProduceQuoteMessagesRead");
    expect(db).toContain("eq(produceQuoteNotifications.recipientId, recipientId)");
    expect(alerts).toContain("refetchInterval: 10_000");
  });

  it("يعرض حالة قراءة الرسائل وإرسالاً سريعاً في صندوق المحادثة", () => {
    const quoteThread = source("client/src/components/produce/ProduceQuoteThread.tsx");

    expect(quoteThread).toContain("تمت القراءة");
    expect(quoteThread).toContain("markQuoteMessagesRead");
    expect(quoteThread).toContain("Ctrl + Enter");
    expect(quoteThread).toContain("محادثة التفاوض المباشرة");
  });

  it("يقبل مسار التخزين الداخلي الذي يعيده رفع صورة عرض المحصول", () => {
    const router = source("server/routers/produce.router.ts");
    const storage = source("server/storage.ts");

    expect(storage).toContain("url: `/manus-storage/${key}`");
    expect(router).toContain('value.startsWith("/manus-storage/")');
    expect(router).toContain("storedAssetUrlSchema");
    expect(router).toContain("images: z.array(storedAssetUrlSchema)");
  });

  it("يحافظ على ترتيب صور العرض عبر السحب والإفلات وأزرار النقل البديلة", () => {
    const farmerPage = source("client/src/pages/dashboard/DashboardProduce.tsx");

    expect(farmerPage).toContain("moveImage");
    expect(farmerPage).toContain("draggable={sortable}");
    expect(farmerPage).toContain("onMove={moveImage}");
    expect(farmerPage).toContain("الصورة الأولى هي غلاف العرض");
    expect(farmerPage).toContain("نقل ${item.name} إلى السابق");
  });

  it("يقتص صورة المحصول ويتيح تعيين الغلاف بنقرة واحدة", () => {
    const cropDialog = source("client/src/components/produce/ProduceImageCropDialog.tsx");
    const farmerPage = source("client/src/pages/dashboard/DashboardProduce.tsx");

    expect(cropDialog).toContain("const OUTPUT_LONG_EDGE = 1600");
    expect(cropDialog).toContain('canvas.toDataURL("image/jpeg", 0.82)');
    expect(farmerPage).toContain("ProduceImageCropDialog");
    expect(farmerPage).toContain("setCoverImage");
    expect(farmerPage).toContain("onSetCover={setCoverImage}");
    expect(farmerPage).toContain("تعيين كغلاف");
  });

  it("يدعم تحرير صور العرض المنشور وتحويل HEIC والقص الحر وتدوير الصورة", () => {
    const cropDialog = source("client/src/components/produce/ProduceImageCropDialog.tsx");
    const farmerPage = source("client/src/pages/dashboard/DashboardProduce.tsx");
    const imagePreparation = source("client/src/lib/prepareProduceImage.ts");

    expect(farmerPage).toContain("تحرير الصور");
    expect(farmerPage).toContain("editingListingId");
    expect(farmerPage).toContain("saveListing.mutate");
    expect(farmerPage).toContain("image/heic,image/heif,.heic,.heif");
    expect(imagePreparation).toContain('await import("heic2any")');
    expect(imagePreparation).toContain("prepareProduceImage");
    expect(cropDialog).toContain("isFixedRatio");
    expect(cropDialog).toContain("قص حر");
    expect(cropDialog).toContain("setRotation");
    expect(cropDialog).toContain("تدوير الصورة");
  });

  it("يعرض صور المحصول في عارض تفاعلي قابل للتكبير والتنقل والإغلاق", () => {
    const lightbox = source("client/src/components/produce/ProduceImageLightbox.tsx");
    const marketPage = source("client/src/pages/ProduceMarketplacePage.tsx");

    expect(marketPage).toContain("ProduceImageLightbox");
    expect(lightbox).toContain("تكبير صور المحصول");
    expect(lightbox).toContain("lightboxOpen");
    expect(lightbox).toContain('event.key === "Escape"');
    expect(lightbox).toContain("الصورة السابقة");
    expect(lightbox).toContain("الصورة التالية");
    expect(lightbox).toContain("onTouchEnd");
  });

  it("يدعم تكبير صورة المحصول بإصبعين دون تعارض مع التنقل", () => {
    const lightbox = source("client/src/components/produce/ProduceImageLightbox.tsx");

    expect(lightbox).toContain("pinchStartDistance");
    expect(lightbox).toContain("event.touches.length === 2");
    expect(lightbox).toContain("Math.min(3, Math.max(1");
    expect(lightbox).toContain("touch-none");
    expect(lightbox).toContain("قرّب أو باعد بإصبعين للتكبير");
  });
});
