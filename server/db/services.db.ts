import { and, desc, eq, isNull, ne } from "drizzle-orm";
import {
  adminVendorProfiles,
  InsertServiceBooking,
  InsertServiceConversation,
  InsertServiceConversationMessage,
  serviceBookings,
  serviceConversationMessages,
  serviceConversations,
} from "../../drizzle/schema";
import { getDb } from "./connection";

export type ServiceBookingStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

export async function createServiceBooking(booking: InsertServiceBooking) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(serviceBookings).values(booking);
  return booking;
}

export async function listServiceBookingsForCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.customerId, customerId))
    .orderBy(desc(serviceBookings.scheduledAt));
}

export async function listServiceBookingsForProvider(providerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.providerId, providerId))
    .orderBy(desc(serviceBookings.scheduledAt));
}

export async function getServiceBooking(bookingId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.id, bookingId))
    .limit(1);
  return result[0];
}

export async function updateServiceBookingStatus(input: {
  id: string;
  providerId: string;
  status: Exclude<ServiceBookingStatus, "requested">;
  providerNote?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.id, input.id),
        eq(serviceBookings.providerId, input.providerId)
      )
    )
    .limit(1);
  if (!existing[0]) throw new Error("الحجز غير موجود أو لا تملك صلاحية تحديثه");

  await db
    .update(serviceBookings)
    .set({
      status: input.status,
      providerNote: input.providerNote ?? existing[0].providerNote,
      updatedAt: new Date(),
    })
    .where(eq(serviceBookings.id, input.id));

  const updated = await db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.id, input.id))
    .limit(1);
  return updated[0];
}

export async function cancelServiceBooking(
  bookingId: string,
  customerId: number
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db
    .select()
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.id, bookingId),
        eq(serviceBookings.customerId, customerId)
      )
    )
    .limit(1);
  if (!existing[0]) throw new Error("الحجز غير موجود أو لا تملك صلاحية إلغائه");
  if (existing[0].status === "completed" || existing[0].status === "declined") {
    throw new Error("لا يمكن إلغاء حجز مكتمل أو مرفوض مسبقاً");
  }

  await db
    .update(serviceBookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(serviceBookings.id, bookingId));
  return { success: true };
}

export async function getServiceConversationForCustomerAndProvider(
  customerId: number,
  providerId: string
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serviceConversations)
    .where(
      and(
        eq(serviceConversations.customerId, customerId),
        eq(serviceConversations.providerId, providerId)
      )
    )
    .limit(1);
  return result[0];
}

export async function createServiceConversation(
  conversation: InsertServiceConversation
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(serviceConversations).values(conversation);
  return conversation;
}

export async function listServiceConversationsForCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceConversations)
    .where(eq(serviceConversations.customerId, customerId))
    .orderBy(desc(serviceConversations.updatedAt));
}

export async function listServiceConversationsForProvider(providerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceConversations)
    .where(eq(serviceConversations.providerId, providerId))
    .orderBy(desc(serviceConversations.updatedAt));
}

export async function getServiceConversation(conversationId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serviceConversations)
    .where(eq(serviceConversations.id, conversationId))
    .limit(1);
  return result[0];
}

export async function listServiceConversationMessages(conversationId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceConversationMessages)
    .where(eq(serviceConversationMessages.conversationId, conversationId))
    .orderBy(serviceConversationMessages.createdAt);
}

export async function createServiceConversationMessage(
  message: InsertServiceConversationMessage
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(serviceConversationMessages).values(message);
  await db
    .update(serviceConversations)
    .set({ updatedAt: new Date() })
    .where(eq(serviceConversations.id, message.conversationId));
  return message;
}

export async function markServiceConversationMessagesRead(
  conversationId: string,
  recipientId: number
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(serviceConversationMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(serviceConversationMessages.conversationId, conversationId),
        ne(serviceConversationMessages.senderId, recipientId),
        isNull(serviceConversationMessages.readAt)
      )
    );
}

/** Public directory fields only; operational and financial vendor data stays private. */
export async function listPublicServiceProviders() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: adminVendorProfiles.id,
      name: adminVendorProfiles.name,
      category: adminVendorProfiles.category,
      location: adminVendorProfiles.location,
      logoUrl: adminVendorProfiles.logoUrl,
      description: adminVendorProfiles.description,
      verified: adminVendorProfiles.verified,
    })
    .from(adminVendorProfiles)
    .where(
      and(
        eq(adminVendorProfiles.type, "provider"),
        eq(adminVendorProfiles.status, "active")
      )
    )
    .orderBy(
      desc(adminVendorProfiles.verified),
      desc(adminVendorProfiles.createdAt)
    );
}

export async function getPublicServiceProvider(id: string) {
  const db = await getDb();
  if (!db) return null;
  const providers = await db
    .select({
      id: adminVendorProfiles.id,
      name: adminVendorProfiles.name,
      category: adminVendorProfiles.category,
      location: adminVendorProfiles.location,
      logoUrl: adminVendorProfiles.logoUrl,
      description: adminVendorProfiles.description,
      verified: adminVendorProfiles.verified,
    })
    .from(adminVendorProfiles)
    .where(
      and(
        eq(adminVendorProfiles.id, id),
        eq(adminVendorProfiles.type, "provider"),
        eq(adminVendorProfiles.status, "active")
      )
    )
    .limit(1);
  return providers[0] ?? null;
}
