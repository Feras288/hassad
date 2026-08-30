import { protectedProcedure, publicProcedure, router, vendorProcedure } from "../_core/trpc";
import {
  cancelServiceBooking,
  createServiceBooking,
  createServiceConversation,
  createServiceConversationMessage,
  getPublicServiceProvider,
  getServiceConversation,
  getServiceConversationForCustomerAndProvider,
  listPublicServiceProviders,
  listServiceBookingsForCustomer,
  listServiceBookingsForProvider,
  listServiceConversationMessages,
  listServiceConversationsForCustomer,
  listServiceConversationsForProvider,
  markServiceConversationMessagesRead,
  updateServiceBookingStatus,
} from "../db";
import { z } from "zod";
import { nanoid } from "nanoid";

export const serviceProvidersRouter = router({
  list: publicProcedure.query(() => listPublicServiceProviders()),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .query(({ input }) => getPublicServiceProvider(input.id)),
});

export const serviceBookingsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        providerId: z.string().trim().min(2).max(96),
        providerName: z.string().trim().min(2).max(255),
        providerAvatar: z.string().trim().max(2000).nullable().optional(),
        serviceType: z.string().trim().min(2).max(120),
        serviceName: z.string().trim().min(2).max(255),
        serviceOfferId: z.string().trim().max(96).nullable().optional(),
        packageName: z.string().trim().min(2).max(255),
        packagePrice: z.number().int().nonnegative(),
        scheduledAt: z.date(),
        duration: z.string().trim().max(120).nullable().optional(),
        location: z.string().trim().min(3).max(2000),
        farmSize: z.string().trim().max(96).nullable().optional(),
        notes: z.string().trim().max(3000).nullable().optional(),
        contactName: z.string().trim().min(2).max(160),
        contactPhone: z.string().trim().min(7).max(32),
        paymentMethod: z.enum(["card", "transfer", "cash"]),
      })
    )
    .mutation(({ ctx, input }) =>
      createServiceBooking({
        id: `sb_${nanoid(16)}`,
        customerId: ctx.user.id,
        ...input,
        providerAvatar: input.providerAvatar ?? null,
        serviceOfferId: input.serviceOfferId ?? null,
        duration: input.duration ?? null,
        farmSize: input.farmSize ?? null,
        notes: input.notes ?? null,
        status: "requested",
      })
    ),
  mine: protectedProcedure.query(({ ctx }) =>
    listServiceBookingsForCustomer(ctx.user.id)
  ),
  providerMine: vendorProcedure.query(({ ctx }) => {
    if (!ctx.user.vendorId)
      throw new Error("حساب مقدم الخدمة غير مرتبط بملف خدمة معتمد");
    return listServiceBookingsForProvider(ctx.user.vendorId);
  }),
  updateStatus: vendorProcedure
    .input(
      z.object({
        bookingId: z.string().min(1).max(64),
        status: z.enum(["confirmed", "completed", "declined"]),
        providerNote: z.string().trim().max(2000).nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!ctx.user.vendorId)
        throw new Error("حساب مقدم الخدمة غير مرتبط بملف خدمة معتمد");
      return updateServiceBookingStatus({
        id: input.bookingId,
        providerId: ctx.user.vendorId,
        status: input.status,
        providerNote: input.providerNote ?? null,
      });
    }),
  cancel: protectedProcedure
    .input(z.object({ bookingId: z.string().min(1).max(64) }))
    .mutation(({ ctx, input }) =>
      cancelServiceBooking(input.bookingId, ctx.user.id)
    ),
});

export const serviceMessagingRouter = router({
  conversations: protectedProcedure.query(({ ctx }) => {
    if (ctx.user.role === "vendor" && ctx.user.vendorId)
      return listServiceConversationsForProvider(ctx.user.vendorId);
    return listServiceConversationsForCustomer(ctx.user.id);
  }),
  open: protectedProcedure
    .input(
      z.object({
        providerId: z.string().trim().min(2).max(96),
        providerName: z.string().trim().min(2).max(255),
        providerAvatar: z.string().trim().max(2000).nullable().optional(),
        subject: z.string().trim().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getServiceConversationForCustomerAndProvider(
        ctx.user.id,
        input.providerId
      );
      if (existing) return existing;
      return createServiceConversation({
        id: `sc_${nanoid(16)}`,
        customerId: ctx.user.id,
        providerId: input.providerId,
        providerName: input.providerName,
        providerAvatar: input.providerAvatar ?? null,
        subject: input.subject ?? null,
      });
    }),
  messages: protectedProcedure
    .input(z.object({ conversationId: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const conversation = await getServiceConversation(input.conversationId);
      if (!conversation || (conversation.customerId !== ctx.user.id && conversation.providerId !== ctx.user.vendorId))
        throw new Error("لا تملك صلاحية الاطلاع على هذه المحادثة");
      return listServiceConversationMessages(input.conversationId);
    }),
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().min(1).max(64),
        message: z.string().trim().min(1).max(3000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getServiceConversation(input.conversationId);
      if (!conversation || (conversation.customerId !== ctx.user.id && conversation.providerId !== ctx.user.vendorId))
        throw new Error("لا تملك صلاحية الإرسال في هذه المحادثة");
      return createServiceConversationMessage({
        id: `scm_${nanoid(16)}`,
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        message: input.message,
        readAt: null,
      });
    }),
  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await getServiceConversation(input.conversationId);
      if (!conversation || (conversation.customerId !== ctx.user.id && conversation.providerId !== ctx.user.vendorId))
        throw new Error("لا تملك صلاحية تحديث هذه المحادثة");
      return markServiceConversationMessagesRead(
        input.conversationId,
        ctx.user.id
      );
    }),
});
