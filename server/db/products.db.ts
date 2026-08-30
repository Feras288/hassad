import { and, desc, eq, sql } from "drizzle-orm";
import {
  adminVendorProfiles,
  catalogProducts,
  InsertCatalogProduct,
  InsertProductAvailabilityRequest,
  InsertProductAvailabilityRequestMatch,
  InsertProductQuestion,
  productAvailabilityRequestMatches,
  productAvailabilityRequests,
  productQuestionFeedback,
  productQuestions,
} from "../../drizzle/schema";
import { getDb } from "./connection";
import {
  createVendorNotification,
  getVendorNotificationPreferences,
} from "./orders.db";

/** Public storefront queries: only approved and in-stock catalog entries are returned. */
export async function listFeaturedCatalogProducts(limit = 4) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(catalogProducts)
    .where(eq(catalogProducts.status, "active"))
    .orderBy(
      desc(catalogProducts.sold),
      desc(catalogProducts.rating),
      desc(catalogProducts.createdAt)
    )
    .limit(limit);
}

/** Public storefront listing: active catalog entries only, without fallback records. */
export async function listPublicCatalogProducts(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(catalogProducts)
    .where(eq(catalogProducts.status, "active"))
    .orderBy(
      desc(catalogProducts.sold),
      desc(catalogProducts.rating),
      desc(catalogProducts.createdAt)
    )
    .limit(limit)
    .offset(offset);
}

/** Lightweight public matching for the header search typeahead. */
export async function searchPublicCatalogProducts(query: string, limit = 6) {
  const db = await getDb();
  if (!db) return [];
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const pattern = `%${normalizedQuery}%`;
  return db
    .select()
    .from(catalogProducts)
    .where(
      and(
        eq(catalogProducts.status, "active"),
        sql`(${catalogProducts.name} LIKE ${pattern} OR ${catalogProducts.category} LIKE ${pattern} OR ${catalogProducts.vendor} LIKE ${pattern})`
      )
    )
    .orderBy(
      desc(catalogProducts.sold),
      desc(catalogProducts.rating),
      desc(catalogProducts.createdAt)
    )
    .limit(limit);
}

export async function getPublicCatalogProduct(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(catalogProducts)
    .where(eq(catalogProducts.id, id))
    .limit(1);

  const product = result[0];
  return product?.status === "active" ? product : null;
}

/** Back-office catalog list, including products awaiting review and unavailable stock. */
export async function listCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(catalogProducts)
    .orderBy(desc(catalogProducts.updatedAt));
}

export async function createCatalogProduct(product: InsertCatalogProduct) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");

  await db.insert(catalogProducts).values(product);
  return product;
}

export async function updateCatalogProduct(
  id: string,
  updates: Partial<InsertCatalogProduct>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");

  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await db
    .update(catalogProducts)
    .set({ ...safeUpdates, updatedAt: new Date() })
    .where(eq(catalogProducts.id, id));
}

export async function deleteCatalogProduct(id: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");

  await db.delete(catalogProducts).where(eq(catalogProducts.id, id));
}

export async function createProductAvailabilityRequest(
  request: InsertProductAvailabilityRequest
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");

  await db.insert(productAvailabilityRequests).values(request);
  return request;
}

export async function listProductAvailabilityRequests() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productAvailabilityRequests)
    .orderBy(desc(productAvailabilityRequests.createdAt));
}

export async function updateProductAvailabilityRequest(
  id: string,
  updates: Partial<InsertProductAvailabilityRequest>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");

  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await db
    .update(productAvailabilityRequests)
    .set({ ...safeUpdates, updatedAt: new Date() })
    .where(eq(productAvailabilityRequests.id, id));
}

export type SupplierMatchSuggestion = Omit<
  InsertProductAvailabilityRequestMatch,
  "id" | "requestId" | "createdAt" | "updatedAt"
>;

const categoryKeywords: Record<string, string[]> = {
  بذور: [
    "بذور",
    "شتلات",
    "طماطم",
    "فلفل",
    "قمح",
    "wheat",
    "seed",
    "seeds",
    "tomato",
  ],
  أسمدة: ["سماد", "أسمدة", "npk", "كمبوست", "fertilizer", "fertiliser"],
  مبيدات: ["مبيد", "مبيدات", "آفات", "حشري", "pesticide", "insecticide"],
  "معدات الري": ["ري", "تنقيط", "رشاش", "مضخة", "irrigation", "drip", "pump"],
  "مستلزمات زراعية": ["معدات", "أداة", "معدات زراعية", "equipment"],
};

function normaliseText(value: string) {
  return value
    .toLocaleLowerCase("ar-SA")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي");
}

function inferRequestedCategories(requestedProduct: string) {
  const text = normaliseText(requestedProduct);
  return Object.entries(categoryKeywords)
    .filter(([, keywords]) =>
      keywords.some((keyword) => text.includes(normaliseText(keyword)))
    )
    .map(([category]) => category);
}

/** Scores active supplier records by product category, specialist keywords, verification, and request city. */
export async function matchActiveSuppliers(
  requestedProduct: string,
  city?: string | null
): Promise<SupplierMatchSuggestion[]> {
  const db = await getDb();
  if (!db) return [];
  const requestedCategories = inferRequestedCategories(requestedProduct);
  const requestText = normaliseText(requestedProduct);
  const requestCity = city ? normaliseText(city) : "";
  const suppliers = await db
    .select()
    .from(adminVendorProfiles)
    .where(
      and(
        eq(adminVendorProfiles.type, "supplier"),
        eq(adminVendorProfiles.status, "active")
      )
    );

  return suppliers
    .map((supplier) => {
      const supplierText = normaliseText(
        [supplier.category, supplier.description ?? ""].join(" ")
      );
      const categoryHit = requestedCategories.some((category) =>
        supplierText.includes(normaliseText(category))
      );
      const keywordHits = Object.values(categoryKeywords)
        .flat()
        .filter(
          (keyword) =>
            requestText.includes(normaliseText(keyword)) &&
            supplierText.includes(normaliseText(keyword))
        ).length;
      const cityHit = Boolean(
        requestCity && normaliseText(supplier.location).includes(requestCity)
      );
      const matchScore = Math.min(
        100,
        (categoryHit ? 65 : 0) +
          Math.min(keywordHits * 10, 20) +
          (supplier.verified ? 10 : 0) +
          (cityHit ? 5 : 0)
      );
      const reasonParts = [
        categoryHit ? "تطابق فئة المنتج" : "مطابقة كلمات مفتاحية",
        keywordHits > 0 ? "تخصص مناسب" : "",
        cityHit ? "ضمن مدينة الطلب" : "",
        supplier.verified ? "مورد موثّق" : "",
      ].filter(Boolean);
      return {
        vendorId: supplier.id,
        vendorName: supplier.name,
        vendorEmail: supplier.email,
        vendorPhone: supplier.phone,
        vendorLocation: supplier.location,
        vendorCategory: supplier.category,
        matchScore,
        matchReason: reasonParts.join(" • "),
        status: "suggested" as const,
      };
    })
    .filter((match) => match.matchScore >= 60)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

export async function createProductAvailabilityRequestMatches(
  requestId: string,
  matches: SupplierMatchSuggestion[]
) {
  const db = await getDb();
  if (!db || matches.length === 0) return;
  await db.insert(productAvailabilityRequestMatches).values(
    matches.map((match, index) => ({
      id: `parm_${requestId}_${index + 1}`,
      requestId,
      ...match,
    }))
  );
}

export async function listProductAvailabilityRequestMatches(requestId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productAvailabilityRequestMatches)
    .where(eq(productAvailabilityRequestMatches.requestId, requestId))
    .orderBy(desc(productAvailabilityRequestMatches.matchScore));
}

export async function createProductQuestion(question: InsertProductQuestion) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(productQuestions).values(question);
  return question;
}

export async function updateProductQuestionNotificationStatus(
  id: string,
  delivered: boolean,
  error: string | null = null
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(productQuestions)
    .set({
      vendorNotificationDelivered: delivered,
      vendorNotifiedAt: new Date(),
      vendorNotificationError: error,
      updatedAt: new Date(),
    })
    .where(eq(productQuestions.id, id));
}

/** The public product page lists only supplier responses that are ready for display. */
export async function listPublicProductQuestions(productId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productQuestions)
    .where(
      and(
        eq(productQuestions.productId, productId),
        eq(productQuestions.status, "answered")
      )
    )
    .orderBy(desc(productQuestions.answeredAt));
}

/** Supplier inbox only exposes questions for the supplier linked to the authenticated account. */
export async function listVendorProductQuestions(vendorId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productQuestions)
    .where(eq(productQuestions.vendorId, vendorId))
    .orderBy(desc(productQuestions.createdAt));
}

/** Daily supplier workload summary for pending product questions, scoped to the authenticated vendor. */
export async function getVendorDailyQuestionSummary(vendorId: string) {
  const db = await getDb();
  const emptySummary = {
    totalPending: 0,
    todayPending: 0,
    olderPending: 0,
    oldestPendingAt: null,
    recentQuestions: [] as Array<{
      id: string;
      productId: string;
      askerName: string;
      question: string;
      createdAt: Date;
    }>,
  };
  if (!db) return emptySummary;

  const pendingQuestions = await db
    .select({
      id: productQuestions.id,
      productId: productQuestions.productId,
      askerName: productQuestions.askerName,
      question: productQuestions.question,
      createdAt: productQuestions.createdAt,
    })
    .from(productQuestions)
    .where(
      and(
        eq(productQuestions.vendorId, vendorId),
        eq(productQuestions.status, "pending")
      )
    )
    .orderBy(desc(productQuestions.createdAt));
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayPending = pendingQuestions.filter(
    (question) => question.createdAt >= startOfToday
  ).length;
  const oldestPendingAt =
    pendingQuestions.length > 0
      ? pendingQuestions[pendingQuestions.length - 1].createdAt
      : null;

  return {
    totalPending: pendingQuestions.length,
    todayPending,
    olderPending: pendingQuestions.length - todayPending,
    oldestPendingAt,
    recentQuestions: pendingQuestions.slice(0, 3),
  };
}

export async function answerVendorProductQuestion(
  id: string,
  vendorId: string,
  answer: string,
  answererName: string
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const row = await db
    .select({ id: productQuestions.id })
    .from(productQuestions)
    .where(
      and(eq(productQuestions.id, id), eq(productQuestions.vendorId, vendorId))
    )
    .limit(1);
  if (!row[0]) throw new Error("لا تملك صلاحية الرد على هذا السؤال");
  await db
    .update(productQuestions)
    .set({
      answer,
      answererName,
      status: "answered",
      answeredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(productQuestions.id, id));
}

/** Stores one anonymous device vote per answer and maintains aggregate helpfulness counters. */
export async function rateProductQuestionAnswer(
  questionId: string,
  feedbackToken: string,
  isHelpful: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const question = await db
    .select({ id: productQuestions.id })
    .from(productQuestions)
    .where(
      and(
        eq(productQuestions.id, questionId),
        eq(productQuestions.status, "answered")
      )
    )
    .limit(1);
  if (!question[0]) throw new Error("الإجابة غير متاحة للتقييم");
  const feedbackId = `${questionId}_${feedbackToken}`;
  const existing = await db
    .select()
    .from(productQuestionFeedback)
    .where(eq(productQuestionFeedback.id, feedbackId))
    .limit(1);
  if (!existing[0]) {
    await db
      .insert(productQuestionFeedback)
      .values({ id: feedbackId, questionId, feedbackToken, isHelpful });
    await db
      .update(productQuestions)
      .set(
        isHelpful
          ? { helpfulCount: sql`${productQuestions.helpfulCount} + 1` }
          : { notHelpfulCount: sql`${productQuestions.notHelpfulCount} + 1` }
      )
      .where(eq(productQuestions.id, questionId));
    return;
  }
  if (existing[0].isHelpful !== isHelpful) {
    await db
      .update(productQuestionFeedback)
      .set({ isHelpful, updatedAt: new Date() })
      .where(eq(productQuestionFeedback.id, feedbackId));
    await db
      .update(productQuestions)
      .set(
        isHelpful
          ? {
              helpfulCount: sql`${productQuestions.helpfulCount} + 1`,
              notHelpfulCount: sql`GREATEST(${productQuestions.notHelpfulCount} - 1, 0)`,
            }
          : {
              helpfulCount: sql`GREATEST(${productQuestions.helpfulCount} - 1, 0)`,
              notHelpfulCount: sql`${productQuestions.notHelpfulCount} + 1`,
            }
      )
      .where(eq(productQuestions.id, questionId));
  }
}
