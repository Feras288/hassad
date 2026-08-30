import { adminProcedure, publicProcedure, router, vendorProcedure } from "../_core/trpc";
import {
  answerVendorProductQuestion,
  createCatalogProduct,
  createProductAvailabilityRequest,
  createProductAvailabilityRequestMatches,
  createProductQuestion,
  createVendorNotification,
  deleteCatalogProduct,
  getPublicCatalogProduct,
  getVendorDailyQuestionSummary,
  getVendorNotificationPreferences,
  listCatalogProducts,
  listFeaturedCatalogProducts,
  listProductAvailabilityRequestMatches,
  listProductAvailabilityRequests,
  listPublicCatalogProducts,
  listPublicProductQuestions,
  listVendorProductQuestions,
  matchActiveSuppliers,
  rateProductQuestionAnswer,
  searchPublicCatalogProducts,
  updateCatalogProduct,
  updateProductAvailabilityRequest,
  updateProductQuestionNotificationStatus,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { z } from "zod";
import { nanoid } from "nanoid";

export const productStatusSchema = z.enum(["active", "inactive", "pending_review", "rejected", "out_of_stock"]);

export const priceTiersSchema = z
  .array(
    z.object({
      minQuantity: z.number().int().min(2),
      unitPrice: z.number().int().min(0),
    })
  )
  .max(8)
  .superRefine((tiers, ctx) => {
    for (let index = 1; index < tiers.length; index += 1) {
      if (tiers[index].minQuantity <= tiers[index - 1].minQuantity)
        ctx.addIssue({
          code: "custom",
          path: [index, "minQuantity"],
          message: "يجب ترتيب كميات شرائح السعر تصاعدياً دون تكرار",
        });
      if (tiers[index].unitPrice >= tiers[index - 1].unitPrice)
        ctx.addIssue({
          code: "custom",
          path: [index, "unitPrice"],
          message: "يجب أن يقل سعر الوحدة مع زيادة الكمية",
        });
    }
  });

export const productInputSchema = z
  .object({
    id: z.string().min(1).max(64),
    name: z.string().min(2).max(255),
    nameEn: z.string().max(255).nullable().optional(),
    sku: z.string().min(1).max(120),
    category: z.string().min(1).max(120),
    brand: z.string().max(160).nullable().optional(),
    vendor: z.string().min(1).max(255),
    vendorId: z.string().min(1).max(64),
    price: z.number().int().min(0),
    originalPrice: z.number().int().min(0).nullable().optional(),
    priceTiers: priceTiersSchema.nullable().optional(),
    tierPricingStartsAt: z.date().nullable().optional(),
    tierPricingEndsAt: z.date().nullable().optional(),
    unit: z.string().min(1).max(120),
    minOrder: z.number().int().min(1).default(1),
    stock: z.number().int().min(0).default(0),
    sold: z.number().int().min(0).default(0),
    status: productStatusSchema,
    images: z.array(z.string().url()).min(1),
    shortDesc: z.string().nullable().optional(),
    longDesc: z.string().nullable().optional(),
    highlights: z.array(z.string()).nullable().optional(),
    specs: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .nullable()
      .optional(),
    usageInstructions: z.array(z.string()).nullable().optional(),
    certifications: z.array(z.string()).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    shortDescEn: z.string().max(3000).nullable().optional(),
    longDescEn: z.string().max(12000).nullable().optional(),
    highlightsEn: z.array(z.string().max(500)).nullable().optional(),
    specsEn: z
      .array(z.object({ label: z.string().max(255), value: z.string().max(500) }))
      .nullable()
      .optional(),
    usageInstructionsEn: z
      .array(z.string().max(1000))
      .nullable()
      .optional(),
    certificationsEn: z.array(z.string().max(500)).nullable().optional(),
    tagsEn: z.array(z.string().max(80)).nullable().optional(),
    rating: z.number().int().min(0).max(500).default(0),
    reviewCount: z.number().int().min(0).default(0),
  })
  .superRefine((product, ctx) => {
    (product.priceTiers ?? []).forEach((tier, index) => {
      if (tier.unitPrice >= product.price)
        ctx.addIssue({
          code: "custom",
          path: ["priceTiers", index, "unitPrice"],
          message: "يجب أن يكون سعر الشريحة أقل من السعر الأساسي",
        });
    });
    if (
      product.tierPricingStartsAt &&
      product.tierPricingEndsAt &&
      product.tierPricingEndsAt <= product.tierPricingStartsAt
    )
      ctx.addIssue({
        code: "custom",
        path: ["tierPricingEndsAt"],
        message: "يجب أن يكون تاريخ نهاية العرض بعد تاريخ البداية",
      });
  });

export const productUpdateSchema = z
  .object({
    name: z.string().min(2).max(255).optional(),
    nameEn: z.string().max(255).nullable().optional(),
    sku: z.string().min(1).max(120).optional(),
    category: z.string().min(1).max(120).optional(),
    brand: z.string().max(160).nullable().optional(),
    vendor: z.string().min(1).max(255).optional(),
    vendorId: z.string().min(1).max(64).optional(),
    price: z.number().int().min(0).optional(),
    originalPrice: z.number().int().min(0).nullable().optional(),
    priceTiers: priceTiersSchema.nullable().optional(),
    tierPricingStartsAt: z.date().nullable().optional(),
    tierPricingEndsAt: z.date().nullable().optional(),
    unit: z.string().min(1).max(120).optional(),
    minOrder: z.number().int().min(1).optional(),
    stock: z.number().int().min(0).optional(),
    sold: z.number().int().min(0).optional(),
    status: productStatusSchema.optional(),
    images: z.array(z.string().url()).min(1).optional(),
    shortDesc: z.string().nullable().optional(),
    longDesc: z.string().nullable().optional(),
    highlights: z.array(z.string()).nullable().optional(),
    specs: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .nullable()
      .optional(),
    usageInstructions: z.array(z.string()).nullable().optional(),
    certifications: z.array(z.string()).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    shortDescEn: z.string().max(3000).nullable().optional(),
    longDescEn: z.string().max(12000).nullable().optional(),
    highlightsEn: z.array(z.string().max(500)).nullable().optional(),
    specsEn: z
      .array(z.object({ label: z.string().max(255), value: z.string().max(500) }))
      .nullable()
      .optional(),
    usageInstructionsEn: z
      .array(z.string().max(1000))
      .nullable()
      .optional(),
    certificationsEn: z.array(z.string().max(500)).nullable().optional(),
    tagsEn: z.array(z.string().max(80)).nullable().optional(),
    rating: z.number().int().min(0).max(500).optional(),
    reviewCount: z.number().int().min(0).optional(),
  })
  .superRefine((updates, ctx) => {
    if (
      updates.tierPricingStartsAt &&
      updates.tierPricingEndsAt &&
      updates.tierPricingEndsAt <= updates.tierPricingStartsAt
    )
      ctx.addIssue({
        code: "custom",
        path: ["tierPricingEndsAt"],
        message: "يجب أن يكون تاريخ نهاية العرض بعد تاريخ البداية",
      });
  });

export const availabilityRequestStatusSchema = z.enum(["new", "contacted", "sourcing", "fulfilled", "closed"]);

export const availabilityRequestInputSchema = z.object({
  requestedProduct: z.string().trim().min(2).max(255),
  sourceProductId: z.string().max(64).nullable().optional(),
  requesterName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.string().email().max(320).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  quantity: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const productQuestionInputSchema = z.object({
  productId: z.string().min(1).max(64),
  askerName: z.string().trim().min(2).max(160),
  question: z.string().trim().min(8).max(1200),
});

export const productsRouter = router({
  featured: publicProcedure
    .input(
      z
        .object({ limit: z.number().int().min(1).max(12).default(4) })
        .optional()
    )
    .query(({ input }) => listFeaturedCatalogProducts(input?.limit ?? 4)),
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(100),
          offset: z.number().int().min(0).default(0),
        })
        .optional()
    )
    .query(({ input }) =>
      listPublicCatalogProducts(input?.limit ?? 100, input?.offset ?? 0)
    ),
  suggestions: publicProcedure
    .input(
      z.object({
        query: z.string().trim().min(1).max(120),
        limit: z.number().int().min(1).max(8).default(6),
      })
    )
    .query(({ input }) => searchPublicCatalogProducts(input.query, input.limit)),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .query(({ input }) => getPublicCatalogProduct(input.id)),
  adminList: adminProcedure.query(() => listCatalogProducts()),
  create: adminProcedure
    .input(productInputSchema)
    .mutation(({ input }) => createCatalogProduct(input)),
  update: adminProcedure
    .input(
      z.object({ id: z.string().min(1).max(64), updates: productUpdateSchema })
    )
    .mutation(({ input }) => updateCatalogProduct(input.id, input.updates)),
  changeStatus: adminProcedure
    .input(
      z.object({ id: z.string().min(1).max(64), status: productStatusSchema })
    )
    .mutation(({ input }) =>
      updateCatalogProduct(input.id, { status: input.status })
    ),
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ input }) => deleteCatalogProduct(input.id)),
});

export const productAvailabilityRequestsRouter = router({
  create: publicProcedure
    .input(availabilityRequestInputSchema)
    .mutation(async ({ input }) => {
      const request = {
        id: `par_${nanoid(14)}`,
        ...input,
        status: "new" as const,
      };
      await createProductAvailabilityRequest(request);
      const matches = await matchActiveSuppliers(
        input.requestedProduct,
        input.city
      );
      await createProductAvailabilityRequestMatches(request.id, matches);
      const notificationDelivered = await notifyOwner({
        title: "طلب توفير منتج جديد",
        content: `${input.requesterName} يطلب توفير «${input.requestedProduct}»${
          input.city ? ` في ${input.city}` : ""
        }. تم اقتراح ${matches.length} مورد/موردين مناسبين.`,
      });
      await updateProductAvailabilityRequest(request.id, {
        ownerNotificationDelivered: notificationDelivered,
        ownerNotifiedAt: new Date(),
      });
      return {
        ...request,
        matchedSuppliersCount: matches.length,
        notificationDelivered,
      };
    }),
  adminList: adminProcedure.query(() => listProductAvailabilityRequests()),
  matches: adminProcedure
    .input(z.object({ requestId: z.string().min(1).max(64) }))
    .query(({ input }) =>
      listProductAvailabilityRequestMatches(input.requestId)
    ),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        status: availabilityRequestStatusSchema.optional(),
        adminNote: z.string().max(2000).nullable().optional(),
      })
    )
    .mutation(({ input }) =>
      updateProductAvailabilityRequest(input.id, {
        status: input.status,
        adminNote: input.adminNote,
      })
    ),
});

export const productQuestionsRouter = router({
  publicList: publicProcedure
    .input(z.object({ productId: z.string().min(1).max(64) }))
    .query(({ input }) => listPublicProductQuestions(input.productId)),
  ask: publicProcedure
    .input(productQuestionInputSchema)
    .mutation(async ({ input }) => {
      const product = await getPublicCatalogProduct(input.productId);
      if (!product) throw new Error("المنتج غير متاح لطرح سؤال حالياً");
      const question = {
        id: `pqq_${nanoid(14)}`,
        productId: product.id,
        vendorId: product.vendorId,
        vendorName: product.vendor,
        askerName: input.askerName,
        question: input.question,
        status: "pending" as const,
      };
      await createProductQuestion(question);
      const preferences = await getVendorNotificationPreferences(
        product.vendorId
      );
      if (!preferences.productQuestionEnabled) {
        await updateProductQuestionNotificationStatus(
          question.id,
          false,
          "تم إيقاف إشعارات أسئلة المنتجات في تفضيلات المورد"
        );
        return { ...question, vendorNotificationDelivered: false };
      }
      try {
        await createVendorNotification({
          id: `vnt_${nanoid(14)}`,
          vendorId: product.vendorId,
          type: "product_question",
          title: "سؤال جديد عن أحد منتجاتك",
          message: `أرسل ${input.askerName} سؤالاً جديداً عن «${product.name}». افتح الأسئلة للرد عليه سريعاً.`,
          productId: product.id,
          questionId: question.id,
        });
        await updateProductQuestionNotificationStatus(question.id, true);
        return { ...question, vendorNotificationDelivered: true };
      } catch (error) {
        const notificationError =
          error instanceof Error
            ? error.message.slice(0, 500)
            : "تعذر إنشاء إشعار المورد";
        console.error(
          "[Vendor notification] Failed to create product-question alert:",
          error
        );
        await updateProductQuestionNotificationStatus(
          question.id,
          false,
          notificationError
        );
        return { ...question, vendorNotificationDelivered: false };
      }
    }),
  vendorList: vendorProcedure.query(({ ctx }) =>
    listVendorProductQuestions(ctx.user.vendorId!)
  ),
  dailySummary: vendorProcedure.query(({ ctx }) =>
    getVendorDailyQuestionSummary(ctx.user.vendorId!)
  ),
  answer: vendorProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        answer: z.string().trim().min(2).max(2000),
      })
    )
    .mutation(({ ctx, input }) =>
      answerVendorProductQuestion(
        input.id,
        ctx.user.vendorId!,
        input.answer,
        ctx.user.name ?? "المورد"
      )
    ),
  rateAnswer: publicProcedure
    .input(
      z.object({
        questionId: z.string().min(1).max(64),
        feedbackToken: z.string().min(16).max(64),
        isHelpful: z.boolean(),
      })
    )
    .mutation(({ input }) =>
      rateProductQuestionAnswer(
        input.questionId,
        input.feedbackToken,
        input.isHelpful
      )
    ),
});
