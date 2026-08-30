import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../_core/trpc";
import {
  createOrUpdateBusinessBuyerProfile,
  createProduceListing,
  createProduceQuoteMessage,
  createProduceQuoteNotification,
  createProduceQuoteRequest,
  getBusinessBuyerProfile,
  getProduceListing,
  getProduceMarketplaceEnabled,
  getProduceQuoteRequest,
  listBusinessBuyerProfiles,
  listFarmerProduceListings,
  listProduceQuoteMessages,
  listProduceQuoteNotifications,
  listProduceQuoteRequestsForBuyer,
  listProduceQuoteRequestsForFarmer,
  listPublishedProduceListings,
  markProduceQuoteMessagesRead,
  markProduceQuoteNotificationRead,
  setProduceMarketplaceEnabled,
  updateBusinessBuyerProfileStatus,
  updateProduceListing,
  updateProduceQuoteRequestStatus,
} from "../db";
import { storagePut } from "../storage";
import { z } from "zod";
import { nanoid } from "nanoid";

export const businessBuyerStatusSchema = z.enum([
  "approved",
  "rejected",
  "suspended",
]);
export const produceListingStatusSchema = z.enum([
  "draft",
  "published",
  "paused",
  "sold_out",
  "archived",
]);

export const storedAssetUrlSchema = z
  .string()
  .trim()
  .refine(
    value => value.startsWith("/storage/") || /^https?:\/\//i.test(value),
    "رابط الملف غير صالح"
  );

export const produceListingInputSchema = z
  .object({
    title: z.string().trim().min(3).max(255),
    cropType: z.string().trim().min(2).max(120),
    variety: z.string().trim().max(160).nullable().optional(),
    grade: z.string().trim().max(120).nullable().optional(),
    location: z.string().trim().min(2).max(160),
    harvestDate: z.date().nullable().optional(),
    availableQuantity: z.number().int().positive(),
    unit: z.string().trim().min(1).max(48),
    minOrderQuantity: z.number().int().positive(),
    priceMode: z.enum(["request_quote", "visible_to_b2b"]),
    wholesalePrice: z.number().int().positive().nullable().optional(),
    description: z.string().trim().max(3000).nullable().optional(),
    images: z.array(storedAssetUrlSchema).min(1).max(5),
    qualityCertificates: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(255),
          url: storedAssetUrlSchema,
        })
      )
      .max(5)
      .nullable()
      .optional(),
    status: produceListingStatusSchema,
  })
  .superRefine((listing, ctx) => {
    if (listing.minOrderQuantity > listing.availableQuantity)
      ctx.addIssue({
        code: "custom",
        path: ["minOrderQuantity"],
        message: "الحد الأدنى للطلب لا يمكن أن يتجاوز الكمية المتاحة",
      });
    if (listing.priceMode === "visible_to_b2b" && !listing.wholesalePrice)
      ctx.addIssue({
        code: "custom",
        path: ["wholesalePrice"],
        message: "أدخل سعر الجملة أو اختر طلب التسعير",
      });
  });

export const produceImageUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  dataUrl: z.string().min(32).max(7_000_000),
});

export const produceCertificateUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  dataUrl: z.string().min(32).max(7_000_000),
});

export const produceMarketplaceRouter = router({
  enabled: publicProcedure.query(() => getProduceMarketplaceEnabled()),
  listings: publicProcedure.query(async ({ ctx }) => {
    const enabled = await getProduceMarketplaceEnabled();
    if (!enabled) return { enabled, isApprovedBuyer: false, listings: [] };
    const buyerProfile = ctx.user
      ? await getBusinessBuyerProfile(ctx.user.id)
      : null;
    const isApprovedBuyer = buyerProfile?.status === "approved";
    const listings = await listPublishedProduceListings();
    return {
      enabled,
      isApprovedBuyer,
      buyerProfileStatus: buyerProfile?.status ?? null,
      listings: listings.map(listing => ({
        ...listing,
        wholesalePrice:
          isApprovedBuyer && listing.priceMode === "visible_to_b2b"
            ? listing.wholesalePrice
            : null,
        priceVisible:
          isApprovedBuyer &&
          listing.priceMode === "visible_to_b2b" &&
          listing.wholesalePrice !== null,
      })),
    };
  }),
  buyerProfile: protectedProcedure.query(({ ctx }) =>
    getBusinessBuyerProfile(ctx.user.id)
  ),
  applyAsBuyer: protectedProcedure
    .input(
      z.object({
        businessType: z.enum(["company", "trader", "restaurant"]),
        businessName: z.string().trim().min(2).max(255),
        contactName: z.string().trim().min(2).max(160),
        phone: z.string().trim().min(7).max(32),
        crNumber: z.string().trim().max(120).nullable().optional(),
        vatNumber: z.string().trim().max(120).nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createOrUpdateBusinessBuyerProfile({
        id: `bb_${nanoid(16)}`,
        userId: ctx.user.id,
        ...input,
      })
    ),
  adminBuyerProfiles: adminProcedure.query(() => listBusinessBuyerProfiles()),
  adminUpdateBuyerStatus: adminProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        status: businessBuyerStatusSchema,
      })
    )
    .mutation(({ ctx, input }) =>
      updateBusinessBuyerProfileStatus(input.id, input.status, ctx.user.id)
    ),
  myListings: protectedProcedure.query(({ ctx }) =>
    listFarmerProduceListings(ctx.user.id)
  ),
  createListing: protectedProcedure
    .input(produceListingInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!(await getProduceMarketplaceEnabled()))
        throw new Error("خدمة تسويق المحاصيل غير متاحة حالياً");
      return createProduceListing({
        id: `pl_${nanoid(16)}`,
        farmerId: ctx.user.id,
        ...input,
      });
    }),
  updateListing: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        updates: produceListingInputSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await getProduceMarketplaceEnabled()))
        throw new Error("خدمة تسويق المحاصيل غير متاحة حالياً");
      const listing = await getProduceListing(input.id);
      if (!listing || listing.farmerId !== ctx.user.id)
        throw new Error("لا تملك صلاحية تعديل هذا العرض");
      const merged = { ...listing, ...input.updates };
      const checked = produceListingInputSchema.safeParse(merged);
      if (!checked.success)
        throw new Error(
          checked.error.issues[0]?.message ?? "بيانات العرض غير مكتملة"
        );
      return updateProduceListing(input.id, ctx.user.id, input.updates);
    }),
  requestQuote: protectedProcedure
    .input(
      z.object({
        listingId: z.string().min(1).max(64),
        requestedQuantity: z.number().int().positive(),
        message: z.string().trim().min(3).max(3000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await getProduceMarketplaceEnabled()))
        throw new Error("خدمة تسويق المحاصيل غير متاحة حالياً");
      const buyerProfile = await getBusinessBuyerProfile(ctx.user.id);
      if (buyerProfile?.status !== "approved")
        throw new Error("هذه الخدمة مخصصة لحسابات الجملة المعتمدة");
      const listing = await getProduceListing(input.listingId);
      if (!listing || listing.status !== "published")
        throw new Error("عرض المحصول لم يعد متاحاً");
      if (listing.farmerId === ctx.user.id)
        throw new Error("لا يمكن طلب تسعير لعرضك الخاص");
      if (
        input.requestedQuantity < listing.minOrderQuantity ||
        input.requestedQuantity > listing.availableQuantity
      )
        throw new Error("الكمية المطلوبة يجب أن تكون ضمن الحد المتاح للعرض");
      const request = await createProduceQuoteRequest({
        id: `pqr_${nanoid(16)}`,
        listingId: listing.id,
        buyerId: ctx.user.id,
        requestedQuantity: input.requestedQuantity,
        message: input.message,
        status: "new",
      });
      await createProduceQuoteNotification({
        id: `pqn_${nanoid(16)}`,
        quoteRequestId: request.id,
        recipientId: listing.farmerId,
        actorId: ctx.user.id,
        type: "new_request",
        title: "طلب تسعير جديد",
        message: `ورد طلب تسعير جديد لعرض «${listing.title}».`,
        isRead: false,
      });
      return request;
    }),
  buyerQuoteRequests: protectedProcedure.query(async ({ ctx }) => {
    const buyerProfile = await getBusinessBuyerProfile(ctx.user.id);
    if (buyerProfile?.status !== "approved") return [];
    return listProduceQuoteRequestsForBuyer(ctx.user.id);
  }),
  farmerQuoteRequests: protectedProcedure.query(({ ctx }) =>
    listProduceQuoteRequestsForFarmer(ctx.user.id)
  ),
  quoteMessages: protectedProcedure
    .input(z.object({ quoteRequestId: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const quoteRequest = await getProduceQuoteRequest(input.quoteRequestId);
      if (
        !quoteRequest ||
        (quoteRequest.farmerId !== ctx.user.id &&
          quoteRequest.buyerId !== ctx.user.id)
      )
        throw new Error("لا تملك صلاحية الاطلاع على هذه المفاوضة");
      return listProduceQuoteMessages(input.quoteRequestId);
    }),
  markQuoteMessagesRead: protectedProcedure
    .input(z.object({ quoteRequestId: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const quoteRequest = await getProduceQuoteRequest(input.quoteRequestId);
      if (
        !quoteRequest ||
        (quoteRequest.farmerId !== ctx.user.id &&
          quoteRequest.buyerId !== ctx.user.id)
      )
        throw new Error("لا تملك صلاحية تحديث هذه المحادثة");
      return markProduceQuoteMessagesRead(input.quoteRequestId, ctx.user.id);
    }),
  quoteNotifications: protectedProcedure.query(({ ctx }) =>
    listProduceQuoteNotifications(ctx.user.id)
  ),
  markQuoteNotificationRead: protectedProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ ctx, input }) =>
      markProduceQuoteNotificationRead(input.id, ctx.user.id)
    ),
  sendQuoteMessage: protectedProcedure
    .input(
      z.object({
        quoteRequestId: z.string().min(1).max(64),
        message: z.string().trim().min(1).max(3000),
        proposedUnitPrice: z.number().int().positive().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quoteRequest = await getProduceQuoteRequest(input.quoteRequestId);
      if (
        !quoteRequest ||
        (quoteRequest.farmerId !== ctx.user.id &&
          quoteRequest.buyerId !== ctx.user.id)
      )
        throw new Error("لا تملك صلاحية الرد على هذه المفاوضة");
      if (
        quoteRequest.status === "accepted" ||
        quoteRequest.status === "rejected" ||
        quoteRequest.status === "cancelled"
      )
        throw new Error("هذه المفاوضة مغلقة");
      const saved = await createProduceQuoteMessage({
        id: `pqm_${nanoid(16)}`,
        quoteRequestId: input.quoteRequestId,
        senderId: ctx.user.id,
        message: input.message,
        proposedUnitPrice: input.proposedUnitPrice ?? null,
      });
      const recipientId =
        quoteRequest.farmerId === ctx.user.id
          ? quoteRequest.buyerId
          : quoteRequest.farmerId;
      await createProduceQuoteNotification({
        id: `pqn_${nanoid(16)}`,
        quoteRequestId: input.quoteRequestId,
        recipientId,
        actorId: ctx.user.id,
        type: "new_message",
        title: "رسالة جديدة في التفاوض",
        message: `وردت رسالة جديدة بشأن «${quoteRequest.listingTitle}».`,
        isRead: false,
      });
      return saved;
    }),
  updateQuoteStatus: protectedProcedure
    .input(
      z.object({
        quoteRequestId: z.string().min(1).max(64),
        status: z.enum(["accepted", "rejected", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quoteRequest = await getProduceQuoteRequest(input.quoteRequestId);
      if (!quoteRequest) throw new Error("طلب التسعير غير موجود");
      const isFarmer = quoteRequest.farmerId === ctx.user.id;
      const isBuyer = quoteRequest.buyerId === ctx.user.id;
      if (
        (!isFarmer && !isBuyer) ||
        (!isFarmer && input.status !== "cancelled")
      )
        throw new Error("لا تملك صلاحية تغيير حالة هذه المفاوضة");
      await updateProduceQuoteRequestStatus(input.quoteRequestId, input.status);
      const recipientId = isFarmer
        ? quoteRequest.buyerId
        : quoteRequest.farmerId;
      const statusText =
        input.status === "accepted"
          ? "تم الاتفاق"
          : input.status === "rejected"
            ? "تم رفض الطلب"
            : "تم إلغاء الطلب";
      await createProduceQuoteNotification({
        id: `pqn_${nanoid(16)}`,
        quoteRequestId: input.quoteRequestId,
        recipientId,
        actorId: ctx.user.id,
        type: "status_change",
        title: "تحديث حالة التفاوض",
        message: `${statusText} بشأن «${quoteRequest.listingTitle}».`,
        isRead: false,
      });
      return { success: true };
    }),
  uploadListingImage: protectedProcedure
    .input(produceImageUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(
        /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
      );
      if (!match) throw new Error("اختر صورة PNG أو JPG أو WEBP صالحة");
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
        throw new Error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      const extension =
        match[1] === "image/png"
          ? "png"
          : match[1] === "image/webp"
            ? "webp"
            : "jpg";
      return storagePut(
        `produce/listings/${ctx.user.id}/${nanoid(14)}.${extension}`,
        bytes,
        match[1]
      );
    }),
  uploadQualityCertificate: protectedProcedure
    .input(produceCertificateUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(
        /^data:(application\/pdf|image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
      );
      if (!match)
        throw new Error("ارفع شهادة PDF أو صورة PNG أو JPG أو WEBP صالحة");
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
        throw new Error("حجم الشهادة يجب ألا يتجاوز 5 ميجابايت");
      const extension =
        match[1] === "application/pdf"
          ? "pdf"
          : match[1] === "image/png"
            ? "png"
            : match[1] === "image/webp"
              ? "webp"
              : "jpg";
      const stored = await storagePut(
        `produce/certificates/${ctx.user.id}/${nanoid(14)}.${extension}`,
        bytes,
        match[1]
      );
      return { name: input.fileName, url: stored.url };
    }),
  updateEnabled: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input }) => setProduceMarketplaceEnabled(input.enabled)),
});
