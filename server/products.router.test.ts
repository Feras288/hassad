import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createCatalogProduct: vi.fn(),
  createContactInquiry: vi.fn(),
  createContentArticle: vi.fn(),
  deleteCatalogProduct: vi.fn(),
  deleteContentArticle: vi.fn(),
  getPublishedContentArticle: vi.fn(),
  getPublicCatalogProduct: vi.fn(),
  listCatalogProducts: vi.fn(),
  listContactInquiries: vi.fn(),
  listAdminNotificationReadKeys: vi.fn(),
  setAdminNotificationReadStatus: vi.fn(),
  markAllAdminNotificationsRead: vi.fn(),
  listContentArticles: vi.fn(),
  listFeaturedCatalogProducts: vi.fn(),
  listMostReadContentArticles: vi.fn(),
  listPublishedContentArticles: vi.fn(),
  listRelatedContentArticles: vi.fn(),
  recordContentArticleView: vi.fn(),
  searchPublicCatalogProducts: vi.fn(),
  updateCatalogProduct: vi.fn(),
  updateContactInquiry: vi.fn(),
  updateContentArticle: vi.fn(),
  createProductAvailabilityRequest: vi.fn(),
  listProductAvailabilityRequests: vi.fn(),
  updateProductAvailabilityRequest: vi.fn(),
  createProductAvailabilityRequestMatches: vi.fn(),
  listProductAvailabilityRequestMatches: vi.fn(),
  matchActiveSuppliers: vi.fn(),
  createProductQuestion: vi.fn(),
  createVendorNotification: vi.fn(),
  updateProductQuestionNotificationStatus: vi.fn(),
  getVendorNotificationPreferences: vi.fn(),
  updateVendorNotificationPreferences: vi.fn(),
  listPublicProductQuestions: vi.fn(),
  listVendorProductQuestions: vi.fn(),
  getVendorDailyQuestionSummary: vi.fn(),
  listVendorNotifications: vi.fn(),
  markVendorNotificationRead: vi.fn(),
  setVendorNotificationReadStatus: vi.fn(),
  markAllVendorNotificationsRead: vi.fn(),
  deleteVendorNotification: vi.fn(),
  clearVendorNotifications: vi.fn(),
  answerVendorProductQuestion: vi.fn(),
  rateProductQuestionAnswer: vi.fn(),
  listVendorAccountLinks: vi.fn(),
  linkVendorAccount: vi.fn(),
}));

const notificationMocks = vi.hoisted(() => ({ notifyOwner: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn() }));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/notification", () => notificationMocks);
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminContext = (): TrpcContext => ({
  user: {
    id: "usr_catalog_admin",
    email: "admin@hassad.net",
    name: "Catalog Admin",
    emailVerified: true,
    image: null,
    role: "admin",
    banned: false,
    banReason: null,
    banExpires: null,
    vendorId: null,
    preferredLanguage: "ar",
    loginMethod: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
});

const vendorContext = (): TrpcContext => ({
  user: {
    id: "usr_catalog_vendor",
    email: "vendor@hassad.net",
    name: "مورد اختبار",
    emailVerified: true,
    image: null,
    role: "vendor",
    banned: false,
    banReason: null,
    banExpires: null,
    vendorId: "vendor-sync",
    preferredLanguage: "ar",
    loginMethod: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
});

const product = {
  id: "sync-product",
  name: "منتج مزامنة",
  sku: "SYNC-001",
  category: "أسمدة",
  vendor: "مورد اختبار",
  vendorId: "vendor-sync",
  price: 99,
  unit: "كيس",
  minOrder: 1,
  stock: 20,
  sold: 0,
  status: "active" as const,
  images: [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85",
  ],
  rating: 0,
  reviewCount: 0,
};

describe("products router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getVendorNotificationPreferences.mockResolvedValue({
      productQuestionEnabled: true,
      inAppToastEnabled: true,
    });
  });

  it("يحفظ شرائح أسعار كمية مرتبة ويرفض الأسعار أو الكميات غير المتسقة", async () => {
    const caller = appRouter.createCaller(adminContext());
    const validTiers = [
      { minQuantity: 5, unitPrice: 45 },
      { minQuantity: 50, unitPrice: 30 },
    ];
    await caller.products.create({
      ...product,
      price: 50,
      priceTiers: validTiers,
    });
    await expect(
      caller.products.create({
        ...product,
        id: "invalid-tiers",
        price: 50,
        priceTiers: [
          { minQuantity: 5, unitPrice: 45 },
          { minQuantity: 5, unitPrice: 30 },
        ],
      })
    ).rejects.toThrow();
    await expect(
      caller.products.create({
        ...product,
        id: "invalid-price",
        price: 50,
        priceTiers: [{ minQuantity: 5, unitPrice: 55 }],
      })
    ).rejects.toThrow();
    expect(dbMocks.createCatalogProduct).toHaveBeenCalledWith(
      expect.objectContaining({ price: 50, priceTiers: validTiers })
    );
  });

  it("يحفظ استفسار التواصل العام مع حالة جديدة", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.contactInquiries.create({
      name: "مزارع اختبار",
      email: "farmer@example.com",
      phone: "0550000000",
      subject: "استفسار عن خدمة",
      message: "أحتاج إلى معرفة طريقة حجز مهندس زراعي للمزرعة.",
    });
    expect(dbMocks.createContactInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^ci_/),
        name: "مزارع اختبار",
        status: "new",
      })
    );
  });

  it("يرفض إرسال استفسار من دون رقم جوال صالح", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(
      caller.contactInquiries.create({
        name: "مزارع اختبار",
        email: "farmer@example.com",
        phone: "",
        subject: "استفسار",
        message: "هذه رسالة اختبار تتجاوز الحد الأدنى المطلوب.",
      })
    ).rejects.toThrow();
  });

  it("يتيح للمسؤول إدارة استفسارات التواصل وحفظ الرد وحالة المتابعة", async () => {
    const caller = appRouter.createCaller(adminContext());
    const inquiry = {
      id: "ci_support",
      name: "مزارع اختبار",
      email: "farmer@example.com",
      phone: "0550000000",
      subject: "استفسار عن خدمة",
      message: "أحتاج إلى تفاصيل حجز مهندس للمزرعة خلال هذا الأسبوع.",
      status: "new" as const,
      adminReply: null,
      handledBy: null,
      respondedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dbMocks.listContactInquiries.mockResolvedValueOnce([inquiry]);

    await expect(caller.contactInquiries.adminList()).resolves.toEqual([
      inquiry,
    ]);
    await caller.contactInquiries.adminUpdate({
      id: inquiry.id,
      status: "resolved",
      adminReply: "تمت مراجعة طلبك وسيتواصل معك الفريق المختص قريباً.",
    });

    expect(dbMocks.listContactInquiries).toHaveBeenCalledOnce();
    expect(dbMocks.updateContactInquiry).toHaveBeenCalledWith(
      inquiry.id,
      expect.objectContaining({
        status: "resolved",
        adminReply: "تمت مراجعة طلبك وسيتواصل معك الفريق المختص قريباً.",
        handledBy: "Catalog Admin",
        respondedAt: expect.any(Date),
      })
    );
  });

  it("يجمع إشعارات الأدمن الحية ويحفظ حالة القراءة لكل مدير", async () => {
    const caller = appRouter.createCaller(adminContext());
    const recent = new Date("2026-08-16T10:00:00.000Z");
    const earlier = new Date("2026-08-16T09:00:00.000Z");
    dbMocks.listContactInquiries.mockResolvedValueOnce([
      {
        id: "ci_live",
        name: "مزارع",
        subject: "مساعدة في الطلب",
        status: "new",
        createdAt: earlier,
      },
    ]);
    dbMocks.listProductAvailabilityRequests.mockResolvedValueOnce([
      {
        id: "par_live",
        requestedProduct: "بذور ذرة",
        requesterName: "مزارع آخر",
        status: "new",
        createdAt: recent,
      },
    ]);
    dbMocks.listAdminNotificationReadKeys.mockResolvedValueOnce([
      "contact:ci_live",
    ]);

    const notifications = await caller.adminNotifications.list();
    expect(notifications).toEqual([
      expect.objectContaining({
        id: "availability:par_live",
        type: "availability",
        isRead: false,
      }),
      expect.objectContaining({
        id: "contact:ci_live",
        type: "contact",
        isRead: true,
      }),
    ]);

    await caller.adminNotifications.setRead({
      notificationKey: "availability:par_live",
      isRead: true,
    });
    await caller.adminNotifications.markAllRead({
      notificationKeys: ["availability:par_live", "contact:ci_live"],
    });
    expect(dbMocks.setAdminNotificationReadStatus).toHaveBeenCalledWith(
      "usr_catalog_admin",
      "availability:par_live",
      true
    );
    expect(dbMocks.markAllAdminNotificationsRead).toHaveBeenCalledWith("usr_catalog_admin", [
      "availability:par_live",
      "contact:ci_live",
    ]);
  });

  it("يعرض السجل الكامل للإشعارات بما فيه التنبيهات القديمة", async () => {
    const caller = appRouter.createCaller(adminContext());
    dbMocks.listContactInquiries.mockResolvedValueOnce([
      {
        id: "ci_closed",
        name: "مزارع",
        subject: "تم الحل",
        status: "resolved",
        createdAt: new Date("2026-08-01T08:00:00.000Z"),
      },
    ]);
    dbMocks.listProductAvailabilityRequests.mockResolvedValueOnce([
      {
        id: "par_closed",
        requestedProduct: "مبيد",
        requesterName: "مزارع آخر",
        status: "closed",
        createdAt: new Date("2026-08-02T08:00:00.000Z"),
      },
    ]);
    dbMocks.listAdminNotificationReadKeys.mockResolvedValueOnce([
      "availability:par_closed",
    ]);

    await expect(caller.adminNotifications.history()).resolves.toEqual([
      expect.objectContaining({
        id: "availability:par_closed",
        sourceStatus: "closed",
        isRead: true,
      }),
      expect.objectContaining({
        id: "contact:ci_closed",
        sourceStatus: "resolved",
        isRead: false,
      }),
    ]);
  });

  it("يفصل المقالات المنشورة العامة عن إدارة المسودات وإجراءات النشر", async () => {
    const caller = appRouter.createCaller(adminContext());
    const articleInput = {
      title: "كيف ترتب احتياج المزرعة قبل الشراء",
      excerpt:
        "دليل عملي يساعد المزارع على تنظيم المعلومات الأساسية قبل مقارنة خيارات المنتجات والخدمات.",
      content:
        "<p>ابدأ بتحديد الاحتياج الزراعي القابل للقياس.</p><script>alert('unsafe')</script>",
      category: "إرشادات زراعية",
      tags: ["ري", "#نخيل", "ري"],
      status: "published" as const,
    };
    const publishedArticle = {
      id: "art_published",
      ...articleInput,
      coverImage: null,
      authorName: "Catalog Admin",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dbMocks.listPublishedContentArticles.mockResolvedValueOnce([
      publishedArticle,
    ]);
    dbMocks.getPublishedContentArticle.mockResolvedValueOnce(publishedArticle);

    await caller.contentArticles.create(articleInput);
    await caller.contentArticles.update({
      id: "art_published",
      updates: { title: "عنوان محدّث", status: "draft" },
    });
    await caller.contentArticles.archive({ id: "art_published" });
    await caller.contentArticles.delete({ id: "art_published" });
    await expect(caller.contentArticles.publicList()).resolves.toEqual([
      publishedArticle,
    ]);
    await expect(
      caller.contentArticles.byId({ id: "art_published" })
    ).resolves.toEqual(publishedArticle);
    await caller.contentArticles.adminList();

    expect(dbMocks.createContentArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^art_/),
        title: articleInput.title,
        content: "<p>ابدأ بتحديد الاحتياج الزراعي القابل للقياس.</p>",
        tags: ["ري", "نخيل"],
        status: "published",
        authorName: "Catalog Admin",
        publishedAt: expect.any(Date),
      })
    );
    expect(dbMocks.updateContentArticle).toHaveBeenCalledWith(
      "art_published",
      expect.objectContaining({
        title: "عنوان محدّث",
        status: "draft",
        publishedAt: null,
      })
    );
    expect(dbMocks.updateContentArticle).toHaveBeenCalledWith("art_published", {
      status: "archived",
    });
    expect(dbMocks.deleteContentArticle).toHaveBeenCalledWith("art_published");
    expect(dbMocks.listPublishedContentArticles).toHaveBeenCalledOnce();
    expect(dbMocks.getPublishedContentArticle).toHaveBeenCalledWith(
      "art_published"
    );
    expect(dbMocks.listContentArticles).toHaveBeenCalledOnce();
  });

  it("يرفع غلاف المقال بصيغة صورة معتمدة وبحجم آمن", async () => {
    const caller = appRouter.createCaller(adminContext());
    storageMocks.storagePut.mockResolvedValueOnce({
      key: "content/article-covers/cover.png",
      url: "/storage/content/article-covers/cover.png",
    });

    await expect(
      caller.contentArticles.uploadCover({
        fileName: "cover.png",
        dataUrl: "data:image/png;base64,aGVsbG8=",
      })
    ).resolves.toEqual({
      key: "content/article-covers/cover.png",
      url: "/storage/content/article-covers/cover.png",
    });
    await expect(
      caller.contentArticles.uploadCover({
        fileName: "cover.gif",
        dataUrl: "data:image/gif;base64,aGVsbG8=",
      })
    ).rejects.toThrow();

    expect(storageMocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^content\/article-covers\/.*\.png$/),
      expect.any(Buffer),
      "image/png"
    );
  });

  it("يرفع صورة من المحرر داخل نص المقال إلى التخزين الآمن", async () => {
    const caller = appRouter.createCaller(adminContext());
    storageMocks.storagePut.mockResolvedValueOnce({
      key: "content/article-inline/body.png",
      url: "/storage/content/article-inline/body.png",
    });

    await expect(
      caller.contentArticles.uploadInlineImage({
        fileName: "body.png",
        dataUrl: "data:image/png;base64,aGVsbG8=",
      })
    ).resolves.toEqual({
      key: "content/article-inline/body.png",
      url: "/storage/content/article-inline/body.png",
    });

    expect(storageMocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^content\/article-inline\/.*\.png$/),
      expect.any(Buffer),
      "image/png"
    );
  });

  it("يعرض توصيات المقالات والأكثر قراءة ويسجل مشاهدة للمقال المنشور", async () => {
    const caller = appRouter.createCaller(adminContext());
    const article = {
      id: "art_related",
      title: "مقال ذو صلة",
      excerpt: "ملخص واضح للمقال ذي الصلة في إدارة المزرعة والري.",
      content: "<p>محتوى منشور للمقال ذي الصلة.</p>",
      category: "إرشادات زراعية",
      tags: ["ري"],
      status: "published" as const,
      authorName: "Catalog Admin",
      viewCount: 12,
      coverImage: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dbMocks.listRelatedContentArticles.mockResolvedValueOnce([article]);
    dbMocks.listMostReadContentArticles.mockResolvedValueOnce([article]);
    dbMocks.recordContentArticleView.mockResolvedValueOnce(13);

    await expect(
      caller.contentArticles.related({ id: "art_published", limit: 3 })
    ).resolves.toEqual([article]);
    await expect(
      caller.contentArticles.mostRead({ limit: 5 })
    ).resolves.toEqual([article]);
    await expect(
      caller.contentArticles.recordView({ id: "art_published" })
    ).resolves.toBe(13);

    expect(dbMocks.listRelatedContentArticles).toHaveBeenCalledWith(
      "art_published",
      3
    );
    expect(dbMocks.listMostReadContentArticles).toHaveBeenCalledWith(5);
    expect(dbMocks.recordContentArticleView).toHaveBeenCalledWith(
      "art_published"
    );
  });

  it("يمرر إضافة وتعديل الحالة وحذف المنتج إلى طبقة قاعدة البيانات", async () => {
    const caller = appRouter.createCaller(adminContext());

    await caller.products.create(product);
    await caller.products.update({
      id: product.id,
      updates: { name: "منتج مُحدّث", price: 110 },
    });
    await caller.products.changeStatus({
      id: product.id,
      status: "out_of_stock",
    });
    await caller.products.delete({ id: product.id });

    expect(dbMocks.createCatalogProduct).toHaveBeenCalledWith(product);
    expect(dbMocks.updateCatalogProduct).toHaveBeenNthCalledWith(
      1,
      product.id,
      { name: "منتج مُحدّث", price: 110 }
    );
    expect(dbMocks.updateCatalogProduct).toHaveBeenNthCalledWith(
      2,
      product.id,
      { status: "out_of_stock" }
    );
    expect(dbMocks.deleteCatalogProduct).toHaveBeenCalledWith(product.id);
  });

  it("يستخدم مسارات قراءة منفصلة للبطاقات العامة ولإدارة الأدمن", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.products.featured({ limit: 4 });
    await caller.products.byId({ id: product.id });
    await caller.products.adminList();

    expect(dbMocks.listFeaturedCatalogProducts).toHaveBeenCalledWith(4);
    expect(dbMocks.getPublicCatalogProduct).toHaveBeenCalledWith(product.id);
    expect(dbMocks.listCatalogProducts).toHaveBeenCalledOnce();
  });

  it("يدعم عدداً أصغر لمنتجات الاقتراحات في الصفحة البديلة", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.products.featured({ limit: 3 });

    expect(dbMocks.listFeaturedCatalogProducts).toHaveBeenCalledWith(3);
  });

  it("يعيد اقتراحات المنتجات العامة بدءاً من أول حرف في البحث", async () => {
    const caller = appRouter.createCaller(adminContext());
    dbMocks.searchPublicCatalogProducts.mockResolvedValueOnce([product]);

    await expect(
      caller.products.suggestions({ query: "س", limit: 6 })
    ).resolves.toEqual([product]);
    expect(dbMocks.searchPublicCatalogProducts).toHaveBeenCalledWith("س", 6);
  });

  it("يعيد null للمنتج غير الموجود بدلاً من undefined", async () => {
    dbMocks.getPublicCatalogProduct.mockResolvedValueOnce(null);
    const caller = appRouter.createCaller(adminContext());

    await expect(
      caller.products.byId({ id: "missing-product" })
    ).resolves.toBeNull();
  });

  it("ينشئ طلب توفير ويقترح الموردين ويرسل إشعاراً فورياً", async () => {
    const caller = appRouter.createCaller(adminContext());
    const requestInput = {
      requestedProduct: "بذور قمح محسنة",
      requesterName: "مزارع اختبار",
      phone: "0550000000",
      city: "القصيم",
      quantity: "20 كيس",
    };
    const matches = [
      {
        vendorId: "v2",
        vendorName: "مؤسسة النماء للبذور",
        vendorEmail: "seeds@example.com",
        vendorPhone: "0123456789",
        vendorLocation: "جدة",
        vendorCategory: "بذور وشتلات",
        matchScore: 75,
        matchReason: "تطابق فئة المنتج",
        status: "suggested",
      },
    ];
    dbMocks.matchActiveSuppliers.mockReturnValue(matches);
    notificationMocks.notifyOwner.mockResolvedValue(true);

    await caller.productAvailabilityRequests.create(requestInput);
    await caller.productAvailabilityRequests.adminList();
    await caller.productAvailabilityRequests.matches({ requestId: "par_test" });
    await caller.productAvailabilityRequests.update({
      id: "par_test",
      status: "sourcing",
      adminNote: "تمت مخاطبة موردين",
    });

    expect(dbMocks.createProductAvailabilityRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        ...requestInput,
        status: "new",
        id: expect.stringMatching(/^par_/),
      })
    );
    const createdRequest =
      dbMocks.createProductAvailabilityRequest.mock.calls[0][0];
    expect(dbMocks.matchActiveSuppliers).toHaveBeenCalledWith(
      requestInput.requestedProduct,
      requestInput.city
    );
    expect(
      dbMocks.createProductAvailabilityRequestMatches
    ).toHaveBeenCalledWith(createdRequest.id, matches);
    expect(notificationMocks.notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({ title: "طلب توفير منتج جديد" })
    );
    expect(dbMocks.updateProductAvailabilityRequest).toHaveBeenCalledWith(
      createdRequest.id,
      expect.objectContaining({
        ownerNotificationDelivered: true,
        ownerNotifiedAt: expect.any(Date),
      })
    );
    expect(dbMocks.listProductAvailabilityRequests).toHaveBeenCalledOnce();
    expect(dbMocks.listProductAvailabilityRequestMatches).toHaveBeenCalledWith(
      "par_test"
    );
    expect(dbMocks.updateProductAvailabilityRequest).toHaveBeenCalledWith(
      "par_test",
      { status: "sourcing", adminNote: "تمت مخاطبة موردين" }
    );
  });

  it("يسجل سؤال المزارع ويقصر الرد على المورد المرتبط بالمنتج", async () => {
    dbMocks.getPublicCatalogProduct.mockResolvedValueOnce(product);
    const dailySummary = {
      totalPending: 3,
      todayPending: 2,
      olderPending: 1,
      oldestPendingAt: new Date("2026-08-13T08:00:00Z"),
      recentQuestions: [],
    };
    dbMocks.getVendorDailyQuestionSummary.mockResolvedValueOnce(dailySummary);
    const publicCaller = appRouter.createCaller(adminContext());
    const supplierCaller = appRouter.createCaller(vendorContext());

    await publicCaller.productQuestions.ask({
      productId: product.id,
      askerName: "مزارع اختبار",
      question: "هل يناسب هذا المنتج الري بالتنقيط؟",
    });
    await publicCaller.productQuestions.publicList({ productId: product.id });
    await supplierCaller.productQuestions.vendorList();
    const returnedDailySummary =
      await supplierCaller.productQuestions.dailySummary();
    await supplierCaller.productQuestions.answer({
      id: "pqq_test",
      answer: "نعم، اتبع الجرعة الموضحة على الملصق.",
    });
    await publicCaller.productQuestions.rateAnswer({
      questionId: "pqq_test",
      feedbackToken: "feedback-token-001",
      isHelpful: true,
    });

    expect(dbMocks.createProductQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: product.id,
        vendorId: product.vendorId,
        vendorName: product.vendor,
        status: "pending",
      })
    );
    expect(dbMocks.createVendorNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: product.vendorId,
        productId: product.id,
        questionId: expect.stringMatching(/^pqq_/),
        type: "product_question",
        title: "سؤال جديد عن أحد منتجاتك",
      })
    );
    const createdQuestion = dbMocks.createProductQuestion.mock.calls[0][0];
    expect(
      dbMocks.updateProductQuestionNotificationStatus
    ).toHaveBeenCalledWith(createdQuestion.id, true);
    expect(dbMocks.listPublicProductQuestions).toHaveBeenCalledWith(product.id);
    expect(dbMocks.listVendorProductQuestions).toHaveBeenCalledWith(
      product.vendorId
    );
    expect(dbMocks.getVendorDailyQuestionSummary).toHaveBeenCalledWith(
      product.vendorId
    );
    expect(returnedDailySummary).toEqual(dailySummary);
    expect(dbMocks.answerVendorProductQuestion).toHaveBeenCalledWith(
      "pqq_test",
      product.vendorId,
      "نعم، اتبع الجرعة الموضحة على الملصق.",
      "مورد اختبار"
    );
    expect(dbMocks.rateProductQuestionAnswer).toHaveBeenCalledWith(
      "pqq_test",
      "feedback-token-001",
      true
    );
  });

  it("يعرض إشعارات المورد ولا يحدّث إلا الإشعارات المرتبطة بحسابه", async () => {
    const supplierCaller = appRouter.createCaller(vendorContext());

    await supplierCaller.vendorNotifications.list();
    await supplierCaller.vendorNotifications.markRead({ id: "vnt_test" });
    await supplierCaller.vendorNotifications.markUnread({ id: "vnt_test" });
    await supplierCaller.vendorNotifications.markAllRead();
    await supplierCaller.vendorNotifications.delete({ id: "vnt_test" });
    await supplierCaller.vendorNotifications.clear();

    expect(dbMocks.listVendorNotifications).toHaveBeenCalledWith(
      product.vendorId
    );
    expect(dbMocks.markVendorNotificationRead).toHaveBeenCalledWith(
      "vnt_test",
      product.vendorId
    );
    expect(dbMocks.setVendorNotificationReadStatus).toHaveBeenCalledWith(
      "vnt_test",
      product.vendorId,
      false
    );
    expect(dbMocks.markAllVendorNotificationsRead).toHaveBeenCalledWith(
      product.vendorId
    );
    expect(dbMocks.deleteVendorNotification).toHaveBeenCalledWith(
      "vnt_test",
      product.vendorId
    );
    expect(dbMocks.clearVendorNotifications).toHaveBeenCalledWith(
      product.vendorId
    );
  });

  it("يحترم تعطيل إشعارات الأسئلة ويحفظ تفضيلات المورد", async () => {
    dbMocks.getPublicCatalogProduct.mockResolvedValueOnce(product);
    dbMocks.getVendorNotificationPreferences.mockResolvedValueOnce({
      productQuestionEnabled: false,
      inAppToastEnabled: false,
    });
    const publicCaller = appRouter.createCaller(adminContext());
    const supplierCaller = appRouter.createCaller(vendorContext());

    await publicCaller.productQuestions.ask({
      productId: product.id,
      askerName: "مزارع اختبار",
      question: "هل يناسب هذا المنتج الري بالتنقيط؟",
    });
    await supplierCaller.vendorNotificationPreferences.get();
    await supplierCaller.vendorNotificationPreferences.update({
      productQuestionEnabled: false,
      inAppToastEnabled: false,
    });

    const createdQuestion = dbMocks.createProductQuestion.mock.calls[0][0];
    expect(dbMocks.createVendorNotification).not.toHaveBeenCalled();
    expect(
      dbMocks.updateProductQuestionNotificationStatus
    ).toHaveBeenCalledWith(
      createdQuestion.id,
      false,
      "تم إيقاف إشعارات أسئلة المنتجات في تفضيلات المورد"
    );
    expect(dbMocks.getVendorNotificationPreferences).toHaveBeenCalledWith(
      product.vendorId
    );
    expect(dbMocks.updateVendorNotificationPreferences).toHaveBeenCalledWith(
      product.vendorId,
      { productQuestionEnabled: false, inAppToastEnabled: false }
    );
  });
});
