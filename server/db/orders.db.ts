import { and, desc, eq } from "drizzle-orm";
import {
  commerceOrderDeliveryRatings,
  commerceOrderItems,
  commerceOrders,
  commerceOrderTrackingEvents,
  customerOrderNotifications,
  InsertCommerceOrder,
  InsertVendorNotification,
  vendorNotificationPreferences,
  vendorNotifications,
  vendorOrderNotifications,
} from "../../drizzle/schema";
import { getDb } from "./connection";

export type CommerceOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type CommerceOrderItemInput = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  category: string;
  image?: string | null;
  unit: string;
  unitPrice: number;
  quantity: number;
};

type CommerceTrackingEventInput = {
  id: string;
  orderId: string;
  status: CommerceOrderStatus;
  title: string;
  message: string;
};

async function hydrateCommerceOrder(
  order: typeof commerceOrders.$inferSelect
) {
  const db = await getDb();
  if (!db)
    return { ...order, items: [], trackingEvents: [], deliveryRating: null };
  const [items, trackingEvents, deliveryRating] = await Promise.all([
    db
      .select()
      .from(commerceOrderItems)
      .where(eq(commerceOrderItems.orderId, order.id))
      .orderBy(desc(commerceOrderItems.createdAt)),
    db
      .select()
      .from(commerceOrderTrackingEvents)
      .where(eq(commerceOrderTrackingEvents.orderId, order.id))
      .orderBy(desc(commerceOrderTrackingEvents.createdAt)),
    db
      .select()
      .from(commerceOrderDeliveryRatings)
      .where(eq(commerceOrderDeliveryRatings.orderId, order.id))
      .limit(1),
  ]);
  return {
    ...order,
    items,
    trackingEvents,
    deliveryRating: deliveryRating[0] ?? null,
  };
}

/** Persist an order assigned to one supplier, its items, and its initial tracking event. */
export async function createCommerceOrder(
  order: InsertCommerceOrder,
  items: CommerceOrderItemInput[],
  initialEvent: CommerceTrackingEventInput
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(commerceOrders).values(order);
  if (items.length > 0) await db.insert(commerceOrderItems).values(items);
  await db.insert(commerceOrderTrackingEvents).values(initialEvent);
  const created = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, order.id))
    .limit(1);
  if (!created[0]) throw new Error("تعذر حفظ الطلب");
  return hydrateCommerceOrder(created[0]);
}

export async function listCommerceOrdersForCustomer(customerId: string) {
  const db = await getDb();
  if (!db) return [];
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.customerId, customerId))
    .orderBy(desc(commerceOrders.createdAt));
  return Promise.all(orders.map(hydrateCommerceOrder));
}

export async function listCommerceOrdersForVendor(vendorId: string) {
  const db = await getDb();
  if (!db) return [];
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.vendorId, vendorId))
    .orderBy(desc(commerceOrders.createdAt));
  return Promise.all(orders.map(hydrateCommerceOrder));
}

/** Back-office order feed, including every supplier order and its live item history. */
export async function listCommerceOrdersForAdmin() {
  const db = await getDb();
  if (!db) return [];
  const orders = await db
    .select()
    .from(commerceOrders)
    .orderBy(desc(commerceOrders.createdAt));
  return Promise.all(orders.map(hydrateCommerceOrder));
}

export async function getCommerceOrderForAdmin(orderId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, orderId))
    .limit(1);
  return orders[0] ? hydrateCommerceOrder(orders[0]) : undefined;
}

/** Allows a platform administrator to amend the status while preserving the customer-facing history. */
export async function updateCommerceOrderStatusForAdmin(input: {
  orderId: string;
  status: CommerceOrderStatus;
  event: CommerceTrackingEventInput;
  notification?: {
    id: string;
    title: string;
    message: string;
    type?: "order_status" | "shipment_update";
  };
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, input.orderId))
    .limit(1);
  const order = existing[0];
  if (!order) throw new Error("الطلب غير موجود");

  await db
    .update(commerceOrders)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(commerceOrders.id, input.orderId));
  await db.insert(commerceOrderTrackingEvents).values(input.event);
  if (order.customerId && input.notification) {
    await db.insert(customerOrderNotifications).values({
      id: input.notification.id,
      customerId: order.customerId,
      orderId: input.orderId,
      type: input.notification.type ?? "order_status",
      title: input.notification.title,
      message: input.notification.message,
    });
  }

  const updated = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, input.orderId))
    .limit(1);
  if (!updated[0]) throw new Error("تعذر تحديث الطلب");
  return hydrateCommerceOrder(updated[0]);
}

export async function getCommerceOrderForCustomer(
  orderId: string,
  customerId: string
) {
  const db = await getDb();
  if (!db) return undefined;
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, orderId),
        eq(commerceOrders.customerId, customerId)
      )
    )
    .limit(1);
  return orders[0] ? hydrateCommerceOrder(orders[0]) : undefined;
}

export async function getCommerceOrderForVendor(
  orderId: string,
  vendorId: string
) {
  const db = await getDb();
  if (!db) return undefined;
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, orderId),
        eq(commerceOrders.vendorId, vendorId)
      )
    )
    .limit(1);
  return orders[0] ? hydrateCommerceOrder(orders[0]) : undefined;
}

export async function updateCommerceOrderTracking(input: {
  orderId: string;
  vendorId: string;
  status: CommerceOrderStatus;
  trackingNumber?: string | null;
  shippingProvider?: string | null;
  estimatedDelivery?: Date | null;
  event: CommerceTrackingEventInput;
  notification?: {
    id: string;
    title: string;
    message: string;
    type: "order_status" | "shipment_update";
  };
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, input.orderId),
        eq(commerceOrders.vendorId, input.vendorId)
      )
    )
    .limit(1);
  const order = existing[0];
  if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية تحديثه");

  await db
    .update(commerceOrders)
    .set({
      status: input.status,
      trackingNumber: input.trackingNumber ?? order.trackingNumber,
      shippingProvider: input.shippingProvider ?? order.shippingProvider,
      estimatedDelivery: input.estimatedDelivery ?? order.estimatedDelivery,
      updatedAt: new Date(),
    })
    .where(eq(commerceOrders.id, input.orderId));
  await db.insert(commerceOrderTrackingEvents).values(input.event);

  if (order.customerId && input.notification) {
    await db.insert(customerOrderNotifications).values({
      id: input.notification.id,
      customerId: order.customerId,
      orderId: order.id,
      type: input.notification.type,
      title: input.notification.title,
      message: input.notification.message,
    });
  }

  const updated = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, input.orderId))
    .limit(1);
  if (!updated[0]) throw new Error("تعذر تحديث الطلب");
  return hydrateCommerceOrder(updated[0]);
}

export async function listCustomerOrderNotifications(customerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(customerOrderNotifications)
    .where(eq(customerOrderNotifications.customerId, customerId))
    .orderBy(desc(customerOrderNotifications.createdAt));
}

export async function setCustomerOrderNotificationRead(
  notificationId: string,
  customerId: string,
  isRead: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(customerOrderNotifications)
    .set({ isRead, readAt: isRead ? new Date() : null })
    .where(
      and(
        eq(customerOrderNotifications.id, notificationId),
        eq(customerOrderNotifications.customerId, customerId)
      )
    );
}

/** Saves one verified delivery-experience rating, only after the buyer's own order is delivered. */
export async function createCommerceOrderDeliveryRating(input: {
  id: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const orders = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, input.orderId),
        eq(commerceOrders.customerId, input.customerId)
      )
    )
    .limit(1);
  const order = orders[0];
  if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية تقييمه");
  if (order.status !== "delivered")
    throw new Error("يمكن تقييم تجربة التوصيل بعد وصول الطلب فقط");

  const existing = await db
    .select()
    .from(commerceOrderDeliveryRatings)
    .where(eq(commerceOrderDeliveryRatings.orderId, input.orderId))
    .limit(1);
  if (existing[0])
    throw new Error("تم إرسال تقييم تجربة التوصيل لهذا الطلب مسبقاً");

  await db.insert(commerceOrderDeliveryRatings).values({
    id: input.id,
    orderId: input.orderId,
    customerId: input.customerId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
  });
  const created = await db
    .select()
    .from(commerceOrderDeliveryRatings)
    .where(eq(commerceOrderDeliveryRatings.id, input.id))
    .limit(1);
  if (!created[0]) throw new Error("تعذر حفظ التقييم");
  return created[0];
}

export async function requestCommerceOrderCancellation(input: {
  orderId: string;
  customerId: string;
  reason: string;
  event: CommerceTrackingEventInput;
  vendorNotification: { id: string; title: string; message: string };
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, input.orderId),
        eq(commerceOrders.customerId, input.customerId)
      )
    )
    .limit(1);
  const order = existing[0];
  if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية طلب إلغائه");
  if (
    order.status !== "pending" &&
    order.status !== "confirmed" &&
    order.status !== "processing"
  )
    throw new Error("لا يمكن طلب إلغاء هذا الطلب بعد الشحن أو التوصيل");
  if (order.cancellationStatus === "requested")
    throw new Error("يوجد طلب إلغاء قيد مراجعة المورد بالفعل");

  await db
    .update(commerceOrders)
    .set({
      cancellationStatus: "requested",
      cancellationReason: input.reason,
      cancellationRequestedAt: new Date(),
      cancellationResolvedAt: null,
      cancellationResponse: null,
      updatedAt: new Date(),
    })
    .where(eq(commerceOrders.id, order.id));
  await db.insert(commerceOrderTrackingEvents).values(input.event);
  await db.insert(vendorOrderNotifications).values({
    id: input.vendorNotification.id,
    vendorId: order.vendorId,
    orderId: order.id,
    type: "cancellation_request",
    title: input.vendorNotification.title,
    message: input.vendorNotification.message,
  });

  const updated = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, order.id))
    .limit(1);
  if (!updated[0]) throw new Error("تعذر تسجيل طلب الإلغاء");
  return hydrateCommerceOrder(updated[0]);
}

export async function reviewCommerceOrderCancellation(input: {
  orderId: string;
  vendorId: string;
  approve: boolean;
  response?: string | null;
  event: CommerceTrackingEventInput;
  customerNotification: { id: string; title: string; message: string };
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(commerceOrders)
    .where(
      and(
        eq(commerceOrders.id, input.orderId),
        eq(commerceOrders.vendorId, input.vendorId)
      )
    )
    .limit(1);
  const order = existing[0];
  if (!order) throw new Error("الطلب غير موجود أو لا تملك صلاحية مراجعته");
  if (order.cancellationStatus !== "requested")
    throw new Error("لا يوجد طلب إلغاء قيد المراجعة لهذا الطلب");

  await db
    .update(commerceOrders)
    .set({
      status: input.approve ? "cancelled" : order.status,
      cancellationStatus: input.approve ? "approved" : "rejected",
      cancellationResponse: input.response?.trim() || null,
      cancellationResolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(commerceOrders.id, order.id));
  await db.insert(commerceOrderTrackingEvents).values(input.event);
  if (order.customerId) {
    await db.insert(customerOrderNotifications).values({
      id: input.customerNotification.id,
      customerId: order.customerId,
      orderId: order.id,
      type: "order_status",
      title: input.customerNotification.title,
      message: input.customerNotification.message,
    });
  }

  const updated = await db
    .select()
    .from(commerceOrders)
    .where(eq(commerceOrders.id, order.id))
    .limit(1);
  if (!updated[0]) throw new Error("تعذر مراجعة طلب الإلغاء");
  return hydrateCommerceOrder(updated[0]);
}

export async function listVendorOrderNotifications(vendorId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(vendorOrderNotifications)
    .where(eq(vendorOrderNotifications.vendorId, vendorId))
    .orderBy(desc(vendorOrderNotifications.createdAt));
}

export async function setVendorOrderNotificationRead(
  notificationId: string,
  vendorId: string,
  isRead: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(vendorOrderNotifications)
    .set({ isRead, readAt: isRead ? new Date() : null })
    .where(
      and(
        eq(vendorOrderNotifications.id, notificationId),
        eq(vendorOrderNotifications.vendorId, vendorId)
      )
    );
}

/** Persists an in-app supplier alert immediately after a farmer submits a question. */
export async function createVendorNotification(
  notification: InsertVendorNotification
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(vendorNotifications).values(notification);
  return notification;
}

export type VendorNotificationPreferenceInput = {
  productQuestionEnabled: boolean;
  inAppToastEnabled: boolean;
};

export const defaultVendorNotificationPreferences: VendorNotificationPreferenceInput =
  {
    productQuestionEnabled: true,
    inAppToastEnabled: true,
  };

export async function getVendorNotificationPreferences(vendorId: string) {
  const db = await getDb();
  if (!db) return { vendorId, ...defaultVendorNotificationPreferences };
  const result = await db
    .select()
    .from(vendorNotificationPreferences)
    .where(eq(vendorNotificationPreferences.vendorId, vendorId))
    .limit(1);
  return result[0] ?? { vendorId, ...defaultVendorNotificationPreferences };
}

export async function updateVendorNotificationPreferences(
  vendorId: string,
  preferences: VendorNotificationPreferenceInput
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .insert(vendorNotificationPreferences)
    .values({ vendorId, ...preferences })
    .onDuplicateKeyUpdate({ set: { ...preferences, updatedAt: new Date() } });
  return { vendorId, ...preferences };
}

export async function listVendorNotifications(vendorId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(vendorNotifications)
    .where(eq(vendorNotifications.vendorId, vendorId))
    .orderBy(desc(vendorNotifications.createdAt));
}

export async function markVendorNotificationRead(
  id: string,
  vendorId: string
) {
  return setVendorNotificationReadStatus(id, vendorId, true);
}

export async function setVendorNotificationReadStatus(
  id: string,
  vendorId: string,
  isRead: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(vendorNotifications)
    .set({
      isRead,
      readAt: isRead ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vendorNotifications.id, id),
        eq(vendorNotifications.vendorId, vendorId)
      )
    );
}

export async function markAllVendorNotificationsRead(vendorId: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(vendorNotifications)
    .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(vendorNotifications.vendorId, vendorId),
        eq(vendorNotifications.isRead, false)
      )
    );
}

export async function deleteVendorNotification(
  id: string,
  vendorId: string
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .delete(vendorNotifications)
    .where(
      and(
        eq(vendorNotifications.id, id),
        eq(vendorNotifications.vendorId, vendorId)
      )
    );
}

export async function clearVendorNotifications(vendorId: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .delete(vendorNotifications)
    .where(eq(vendorNotifications.vendorId, vendorId));
}
