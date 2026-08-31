import {
  adminProcedure,
  protectedProcedure,
  router,
  vendorProcedure,
} from "../_core/trpc";
import {
  clearVendorNotifications,
  createCommerceOrder,
  createCommerceOrderDeliveryRating,
  deleteVendorNotification,
  getAccountLanguagePreference,
  getCommerceOrderForAdmin,
  getCommerceOrderForCustomer,
  getCommerceOrderForVendor,
  getVendorNotificationPreferences,
  listAdminManagedUsers,
  listAdminVendorProfiles,
  listCatalogProducts,
  listCommerceOrdersForAdmin,
  listCommerceOrdersForCustomer,
  listCommerceOrdersForVendor,
  listCustomerOrderNotifications,
  listVendorNotifications,
  listVendorOrderNotifications,
  markAllVendorNotificationsRead,
  markVendorNotificationRead,
  requestCommerceOrderCancellation,
  reviewCommerceOrderCancellation,
  setCustomerOrderNotificationRead,
  setVendorNotificationReadStatus,
  setVendorOrderNotificationRead,
  updateCommerceOrderStatusForAdmin,
  updateCommerceOrderTracking,
  updateVendorNotificationPreferences,
} from "../db";
import {
  localizeCancellationDecision,
  localizeCancellationRequestForVendor,
  localizeOrderStatus,
} from "../notificationLocalization";
import { z } from "zod";
import { nanoid } from "nanoid";

export const commerceOrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const checkoutItemSchema = z.object({
  productId: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(120),
  image: z.string().url().max(2000).nullable().optional(),
  unit: z.string().trim().min(1).max(120),
  unitPrice: z.number().int().min(0),
  quantity: z.number().int().min(1).max(10_000),
  vendorId: z.string().trim().min(1).max(64),
  vendorName: z.string().trim().min(1).max(255),
});

export const checkoutAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  city: z.string().trim().min(2).max(120),
  district: z.string().trim().min(2).max(160),
  street: z.string().trim().min(2).max(255),
  building: z.string().trim().max(160).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const commerceOrderCreateSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100),
  address: checkoutAddressSchema,
  paymentMethod: z.string().trim().min(1).max(64),
  discount: z.number().int().min(0).default(0),
  shippingCost: z.number().int().min(0).default(0),
  vat: z.number().int().min(0).default(0),
  total: z.number().int().min(0),
});

export const adminOrderItemSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(10_000),
});

export const adminOrderCreateSchema = z.object({
  customerId: z.string().min(1).max(64).nullable().optional(),
  customerName: z.string().trim().min(2).max(160),
  customerPhone: z.string().trim().min(7).max(32),
  customerEmail: z.string().trim().email().max(320).nullable().optional(),
  vendorId: z.string().trim().min(1).max(64),
  items: z.array(adminOrderItemSchema).min(1).max(30),
  address: checkoutAddressSchema,
  paymentMethod: z.string().trim().min(1).max(64),
  shippingCost: z.number().int().min(0).max(100_000).default(0),
  discount: z.number().int().min(0).max(100_000).default(0),
  status: commerceOrderStatusSchema.default("pending"),
});

export const vendorTrackingUpdateSchema = z
  .object({
    orderId: z.string().min(1).max(64),
    status: commerceOrderStatusSchema,
    trackingNumber: z.string().trim().min(3).max(120).nullable().optional(),
    shippingProvider: z.string().trim().min(2).max(160).nullable().optional(),
    estimatedDelivery: z.date().nullable().optional(),
    note: z.string().trim().max(1000).nullable().optional(),
  })
  .superRefine((input, ctx) => {
    if (input.status === "shipped" && !input.trackingNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["trackingNumber"],
        message: "أدخل رقم التتبع عند تحديث حالة الطلب إلى تم الشحن",
      });
    }
  });

export const customerCancellationRequestSchema = z.object({
  orderId: z.string().min(1).max(64),
  reason: z.string().trim().min(5, "اذكر سبب طلب الإلغاء").max(1000),
});

export const vendorCancellationReviewSchema = z.object({
  orderId: z.string().min(1).max(64),
  approve: z.boolean(),
  response: z.string().trim().max(1000).nullable().optional(),
});

export const vendorNotificationsRouter = router({
  list: vendorProcedure.query(({ ctx }) =>
    listVendorNotifications(ctx.user.vendorId!)
  ),
  markRead: vendorProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ ctx, input }) =>
      markVendorNotificationRead(input.id, ctx.user.vendorId!)
    ),
  markUnread: vendorProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ ctx, input }) =>
      setVendorNotificationReadStatus(input.id, ctx.user.vendorId!, false)
    ),
  markAllRead: vendorProcedure.mutation(({ ctx }) =>
    markAllVendorNotificationsRead(ctx.user.vendorId!)
  ),
  delete: vendorProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ ctx, input }) =>
      deleteVendorNotification(input.id, ctx.user.vendorId!)
    ),
  clear: vendorProcedure.mutation(({ ctx }) =>
    clearVendorNotifications(ctx.user.vendorId!)
  ),
});

export const vendorNotificationPreferencesRouter = router({
  get: vendorProcedure.query(({ ctx }) =>
    getVendorNotificationPreferences(ctx.user.vendorId!)
  ),
  update: vendorProcedure
    .input(
      z.object({
        productQuestionEnabled: z.boolean(),
        inAppToastEnabled: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) =>
      updateVendorNotificationPreferences(ctx.user.vendorId!, input)
    ),
});

export const ordersRouter = router({
  /** Splits a multi-supplier cart into traceable supplier orders. Requires authentication. */
  create: protectedProcedure
    .input(commerceOrderCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const grouped = new Map<string, z.infer<typeof checkoutItemSchema>[]>();
      input.items.forEach((item) => {
        const group = grouped.get(item.vendorId) ?? [];
        group.push(item);
        grouped.set(item.vendorId, group);
      });
      const cartSubtotal = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const customerLanguage =
        ctx.user.preferredLanguage === "en" ? "en" : "ar";
      const entries = await Promise.all(
        Array.from(grouped.entries()).map(async ([vendorId, items], index) => {
          const subtotal = items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
          );
          const ratio =
            cartSubtotal > 0 ? subtotal / cartSubtotal : 1 / grouped.size;
          const orderId = `ord_${nanoid(14)}`;
          const orderNumber = `HS-${nanoid(8).toUpperCase()}`;
          const statusCopy = localizeOrderStatus(customerLanguage, "pending");
          return createCommerceOrder(
            {
              id: orderId,
              orderNumber,
              customerId: ctx.user.id,
              customerName: input.address.fullName,
              customerPhone: input.address.phone,
              customerEmail: ctx.user.email ?? null,
              vendorId,
              vendorName: items[0].vendorName,
              deliveryAddress: {
                city: input.address.city,
                district: input.address.district,
                street: input.address.street,
                building: input.address.building ?? null,
                notes: input.address.notes ?? null,
              },
              paymentMethod: input.paymentMethod,
              subtotal,
              discount: Math.round(input.discount * ratio),
              shippingCost: Math.round(input.shippingCost * ratio),
              vat: Math.round(input.vat * ratio),
              total:
                index === grouped.size - 1
                  ? input.total -
                    Array.from(grouped.entries())
                      .slice(0, index)
                      .reduce(
                        (sum, [, priorItems]) =>
                          sum +
                          Math.round(
                            (priorItems.reduce(
                              (subtotalSum, item) =>
                                subtotalSum + item.unitPrice * item.quantity,
                              0
                            ) /
                              Math.max(cartSubtotal, 1)) *
                              input.total
                          ),
                        0
                      )
                  : Math.round(input.total * ratio),
              status: "pending",
            },
            items.map((item) => ({
              id: `orditm_${nanoid(14)}`,
              orderId,
              productId: item.productId,
              name: item.name,
              category: item.category,
              image: item.image ?? null,
              unit: item.unit,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
            })),
            {
              id: `ordtrk_${nanoid(14)}`,
              orderId,
              status: "pending",
              title: statusCopy.title,
              message: statusCopy.message,
            }
          );
        })
      );
      return entries;
    }),
  adminList: adminProcedure.query(() => listCommerceOrdersForAdmin()),
  adminCreate: adminProcedure.input(adminOrderCreateSchema).mutation(async ({ input }) => {
      const [vendors, products, customers] = await Promise.all([
        listAdminVendorProfiles(),
        listCatalogProducts(),
        listAdminManagedUsers(),
      ]);
      const vendor = vendors.find(
        (entry) => entry.id === input.vendorId && entry.status === "active"
      );
      if (!vendor) throw new Error("اختر مورداً معتمداً ونشطاً لإنشاء الطلب");
      if (
        input.customerId &&
        !customers.some((entry) => entry.id === input.customerId)
      )
        throw new Error("العميل المختار غير موجود");

      const requestedIds = new Set(input.items.map((item) => item.productId));
      const selectedProducts = products.filter((product) =>
        requestedIds.has(product.id)
      );
      if (selectedProducts.length !== requestedIds.size)
        throw new Error("تتضمن الطلبية منتجاً غير موجود");
      if (
        selectedProducts.some(
          (product) =>
            product.status !== "active" || product.vendorId !== vendor.id
        )
      )
        throw new Error(
          "يجب أن تكون جميع المنتجات نشطة وتتبع المورد المختار"
        );

      const orderId = `ord_${nanoid(14)}`;
      const selectedItems = input.items.map((item) => {
        const product = selectedProducts.find(
          (entry) => entry.id === item.productId
        )!;
        return { product, quantity: item.quantity };
      });
      const subtotal = selectedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const total = Math.max(0, subtotal + input.shippingCost - input.discount);
      const copy = localizeOrderStatus("ar", input.status);
      return createCommerceOrder(
        {
          id: orderId,
          orderNumber: `HS-${nanoid(8).toUpperCase()}`,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail ?? null,
          vendorId: vendor.id,
          vendorName: vendor.name,
          deliveryAddress: input.address,
          paymentMethod: input.paymentMethod,
          subtotal,
          discount: input.discount,
          shippingCost: input.shippingCost,
          vat: 0,
          total,
          status: input.status,
        },
        selectedItems.map(({ product, quantity }) => ({
          id: `orditm_${nanoid(14)}`,
          orderId,
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.images[0] ?? null,
          unit: product.unit,
          unitPrice: product.price,
          quantity,
        })),
        {
          id: `ordtrk_${nanoid(14)}`,
          orderId,
          status: input.status,
          title: copy.title,
          message: copy.message,
        }
      );
    }),
  adminUpdateStatus: adminProcedure.input(
    z.object({
      orderId: z.string().min(1).max(64),
      status: commerceOrderStatusSchema,
    })
  ).mutation(async ({ input }) => {
      const order = await getCommerceOrderForAdmin(input.orderId);
      if (!order) throw new Error("الطلب غير موجود");
      const customerLanguage = order.customerId
        ? await getAccountLanguagePreference(order.customerId)
        : "ar";
      const copy = localizeOrderStatus(customerLanguage, input.status);
      return updateCommerceOrderStatusForAdmin({
        orderId: order.id,
        status: input.status,
        event: {
          id: `ordtrk_${nanoid(14)}`,
          orderId: order.id,
          status: input.status,
          title: copy.title,
          message: copy.message,
        },
        notification: {
          id: `ordnot_${nanoid(14)}`,
          title: copy.title,
          message: copy.message,
          type: input.status === "shipped" ? "shipment_update" : "order_status",
        },
      });
    }),
  mine: protectedProcedure.query(({ ctx }) =>
    listCommerceOrdersForCustomer(ctx.user.id)
  ),
  mineById: protectedProcedure
    .input(z.object({ orderId: z.string().min(1).max(64) }))
    .query(({ ctx, input }) =>
      getCommerceOrderForCustomer(input.orderId, ctx.user.id)
    ),
  rateDelivery: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1).max(64),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().max(500).optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createCommerceOrderDeliveryRating({
        id: `ordrate_${nanoid(14)}`,
        orderId: input.orderId,
        customerId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
      })
    ),
  vendorList: vendorProcedure.query(({ ctx }) =>
    listCommerceOrdersForVendor(ctx.user.vendorId!)
  ),
  vendorUpdateTracking: vendorProcedure
    .input(vendorTrackingUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await getCommerceOrderForVendor(
        input.orderId,
        ctx.user.vendorId!
      );
      if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية تحديثه");
      const customerLanguage = order.customerId
        ? await getAccountLanguagePreference(order.customerId)
        : "ar";
      const copy = localizeOrderStatus(customerLanguage, input.status, input);
      return updateCommerceOrderTracking({
        orderId: input.orderId,
        vendorId: ctx.user.vendorId!,
        status: input.status,
        trackingNumber: input.trackingNumber ?? null,
        shippingProvider: input.shippingProvider ?? null,
        estimatedDelivery: input.estimatedDelivery ?? null,
        event: {
          id: `ordtrk_${nanoid(14)}`,
          orderId: input.orderId,
          status: input.status,
          title: copy.title,
          message: copy.message,
        },
        notification: {
          id: `ordnot_${nanoid(14)}`,
          title: copy.title,
          message: copy.message,
          type: input.status === "shipped" ? "shipment_update" : "order_status",
        },
      });
    }),
  requestCancellation: protectedProcedure
    .input(customerCancellationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await getCommerceOrderForCustomer(
        input.orderId,
        ctx.user.id
      );
      if (!order)
        throw new Error("الطلب غير موجود أو لا تملك صلاحية طلب إلغائه");
      return requestCommerceOrderCancellation({
        orderId: order.id,
        customerId: ctx.user.id,
        reason: input.reason,
        event: {
          id: `ordtrk_${nanoid(14)}`,
          orderId: order.id,
          status: order.status,
          title: "طلب إلغاء بانتظار المورد",
          message: `أرسلت طلب إلغاء للطلب. السبب: ${input.reason}`,
        },
        vendorNotification: {
          id: `vordnot_${nanoid(14)}`,
          ...localizeCancellationRequestForVendor(
            ctx.user.preferredLanguage === "en" ? "en" : "ar",
            order.customerName,
            order.orderNumber
          ),
        },
      });
    }),
  vendorReviewCancellation: vendorProcedure
    .input(vendorCancellationReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await getCommerceOrderForVendor(
        input.orderId,
        ctx.user.vendorId!
      );
      if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية مراجعته");
      const approved = input.approve;
      const customerLanguage = order.customerId
        ? await getAccountLanguagePreference(order.customerId)
        : "ar";
      const decision = localizeCancellationDecision(
        customerLanguage,
        approved,
        order.orderNumber,
        input.response
      );
      return reviewCommerceOrderCancellation({
        orderId: order.id,
        vendorId: ctx.user.vendorId!,
        approve: approved,
        response: input.response,
        event: {
          id: `ordtrk_${nanoid(14)}`,
          orderId: order.id,
          status: approved ? "cancelled" : order.status,
          title: decision.title,
          message: decision.message,
        },
        customerNotification: {
          id: `ordnot_${nanoid(14)}`,
          title: decision.title,
          message: decision.message,
        },
      });
    }),
  notifications: router({
    mine: protectedProcedure.query(({ ctx }) =>
      listCustomerOrderNotifications(ctx.user.id)
    ),
    setRead: protectedProcedure
      .input(z.object({ id: z.string().min(1).max(64), isRead: z.boolean() }))
      .mutation(({ ctx, input }) =>
        setCustomerOrderNotificationRead(input.id, ctx.user.id, input.isRead)
      ),
  }),
  vendorCancellationNotifications: router({
    list: vendorProcedure.query(({ ctx }) =>
      listVendorOrderNotifications(ctx.user.vendorId!)
    ),
    setRead: vendorProcedure
      .input(z.object({ id: z.string().min(1).max(64), isRead: z.boolean() }))
      .mutation(({ ctx, input }) =>
        setVendorOrderNotificationRead(input.id, ctx.user.vendorId!, input.isRead)
      ),
  }),
});
