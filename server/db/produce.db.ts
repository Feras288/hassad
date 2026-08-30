import { and, desc, eq, isNull, ne } from "drizzle-orm";
import {
  businessBuyerProfiles,
  InsertBusinessBuyerProfile,
  InsertProduceListing,
  InsertProduceQuoteMessage,
  InsertProduceQuoteNotification,
  InsertProduceQuoteRequest,
  platformSettings,
  produceListings,
  produceQuoteMessages,
  produceQuoteNotifications,
  produceQuoteRequests,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";

/** Feature switch controlled by admins; enabled by default to avoid hiding an approved service unexpectedly. */
export async function getProduceMarketplaceEnabled(): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  const rows = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, "produce_marketplace_enabled"))
    .limit(1);
  return rows[0]?.value !== "false";
}

export async function setProduceMarketplaceEnabled(
  enabled: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .insert(platformSettings)
    .values({
      key: "produce_marketplace_enabled",
      value: enabled ? "true" : "false",
    })
    .onDuplicateKeyUpdate({ set: { value: enabled ? "true" : "false" } });
}

export async function getBusinessBuyerProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(businessBuyerProfiles)
    .where(eq(businessBuyerProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function createOrUpdateBusinessBuyerProfile(
  profile: InsertBusinessBuyerProfile
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await getBusinessBuyerProfile(profile.userId);
  if (!existing) {
    await db.insert(businessBuyerProfiles).values(profile);
    return profile;
  }
  await db
    .update(businessBuyerProfiles)
    .set({
      businessType: profile.businessType,
      businessName: profile.businessName,
      contactName: profile.contactName,
      phone: profile.phone,
      crNumber: profile.crNumber ?? null,
      vatNumber: profile.vatNumber ?? null,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(businessBuyerProfiles.userId, profile.userId));
  return {
    ...existing,
    ...profile,
    status: "pending" as const,
    reviewedBy: null,
    reviewedAt: null,
  };
}

export async function listBusinessBuyerProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: businessBuyerProfiles.id,
      userId: businessBuyerProfiles.userId,
      businessType: businessBuyerProfiles.businessType,
      businessName: businessBuyerProfiles.businessName,
      contactName: businessBuyerProfiles.contactName,
      phone: businessBuyerProfiles.phone,
      crNumber: businessBuyerProfiles.crNumber,
      vatNumber: businessBuyerProfiles.vatNumber,
      status: businessBuyerProfiles.status,
      reviewedBy: businessBuyerProfiles.reviewedBy,
      reviewedAt: businessBuyerProfiles.reviewedAt,
      createdAt: businessBuyerProfiles.createdAt,
      updatedAt: businessBuyerProfiles.updatedAt,
      email: users.email,
    })
    .from(businessBuyerProfiles)
    .leftJoin(users, eq(businessBuyerProfiles.userId, users.id))
    .orderBy(desc(businessBuyerProfiles.updatedAt));
}

export async function updateBusinessBuyerProfileStatus(
  id: string,
  status: "approved" | "rejected" | "suspended",
  reviewedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(businessBuyerProfiles)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(businessBuyerProfiles.id, id));
}

export async function listPublishedProduceListings() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: produceListings.id,
      farmerId: produceListings.farmerId,
      title: produceListings.title,
      cropType: produceListings.cropType,
      variety: produceListings.variety,
      grade: produceListings.grade,
      location: produceListings.location,
      harvestDate: produceListings.harvestDate,
      availableQuantity: produceListings.availableQuantity,
      unit: produceListings.unit,
      minOrderQuantity: produceListings.minOrderQuantity,
      priceMode: produceListings.priceMode,
      wholesalePrice: produceListings.wholesalePrice,
      description: produceListings.description,
      images: produceListings.images,
      qualityCertificates: produceListings.qualityCertificates,
      status: produceListings.status,
      createdAt: produceListings.createdAt,
      updatedAt: produceListings.updatedAt,
      farmerName: users.name,
    })
    .from(produceListings)
    .leftJoin(users, eq(produceListings.farmerId, users.id))
    .where(eq(produceListings.status, "published"))
    .orderBy(desc(produceListings.createdAt));
}

export async function listFarmerProduceListings(farmerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(produceListings)
    .where(eq(produceListings.farmerId, farmerId))
    .orderBy(desc(produceListings.updatedAt));
}

export async function getProduceListing(id: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(produceListings)
    .where(eq(produceListings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProduceListing(listing: InsertProduceListing) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(produceListings).values(listing);
  return listing;
}

export async function updateProduceListing(
  id: string,
  farmerId: number,
  updates: Partial<InsertProduceListing>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const {
    id: _id,
    farmerId: _farmerId,
    createdAt: _createdAt,
    ...safeUpdates
  } = updates;
  await db
    .update(produceListings)
    .set({ ...safeUpdates, updatedAt: new Date() })
    .where(
      and(eq(produceListings.id, id), eq(produceListings.farmerId, farmerId))
    );
}

export async function createProduceQuoteRequest(
  request: InsertProduceQuoteRequest
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(produceQuoteRequests).values(request);
  return request;
}

export async function getProduceQuoteRequest(id: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: produceQuoteRequests.id,
      listingId: produceQuoteRequests.listingId,
      buyerId: produceQuoteRequests.buyerId,
      requestedQuantity: produceQuoteRequests.requestedQuantity,
      message: produceQuoteRequests.message,
      status: produceQuoteRequests.status,
      createdAt: produceQuoteRequests.createdAt,
      updatedAt: produceQuoteRequests.updatedAt,
      farmerId: produceListings.farmerId,
      listingTitle: produceListings.title,
      listingUnit: produceListings.unit,
    })
    .from(produceQuoteRequests)
    .innerJoin(
      produceListings,
      eq(produceQuoteRequests.listingId, produceListings.id)
    )
    .where(eq(produceQuoteRequests.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listProduceQuoteRequestsForFarmer(farmerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: produceQuoteRequests.id,
      listingId: produceQuoteRequests.listingId,
      buyerId: produceQuoteRequests.buyerId,
      requestedQuantity: produceQuoteRequests.requestedQuantity,
      message: produceQuoteRequests.message,
      status: produceQuoteRequests.status,
      createdAt: produceQuoteRequests.createdAt,
      updatedAt: produceQuoteRequests.updatedAt,
      listingTitle: produceListings.title,
      listingUnit: produceListings.unit,
      buyerBusinessName: businessBuyerProfiles.businessName,
      buyerType: businessBuyerProfiles.businessType,
    })
    .from(produceQuoteRequests)
    .innerJoin(
      produceListings,
      eq(produceQuoteRequests.listingId, produceListings.id)
    )
    .leftJoin(
      businessBuyerProfiles,
      eq(produceQuoteRequests.buyerId, businessBuyerProfiles.userId)
    )
    .where(eq(produceListings.farmerId, farmerId))
    .orderBy(desc(produceQuoteRequests.updatedAt));
}

export async function listProduceQuoteRequestsForBuyer(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: produceQuoteRequests.id,
      listingId: produceQuoteRequests.listingId,
      buyerId: produceQuoteRequests.buyerId,
      requestedQuantity: produceQuoteRequests.requestedQuantity,
      message: produceQuoteRequests.message,
      status: produceQuoteRequests.status,
      createdAt: produceQuoteRequests.createdAt,
      updatedAt: produceQuoteRequests.updatedAt,
      listingTitle: produceListings.title,
      listingUnit: produceListings.unit,
      farmerName: users.name,
    })
    .from(produceQuoteRequests)
    .innerJoin(
      produceListings,
      eq(produceQuoteRequests.listingId, produceListings.id)
    )
    .leftJoin(users, eq(produceListings.farmerId, users.id))
    .where(eq(produceQuoteRequests.buyerId, buyerId))
    .orderBy(desc(produceQuoteRequests.updatedAt));
}

export async function listProduceQuoteMessages(quoteRequestId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: produceQuoteMessages.id,
      quoteRequestId: produceQuoteMessages.quoteRequestId,
      senderId: produceQuoteMessages.senderId,
      message: produceQuoteMessages.message,
      proposedUnitPrice: produceQuoteMessages.proposedUnitPrice,
      readAt: produceQuoteMessages.readAt,
      createdAt: produceQuoteMessages.createdAt,
      senderName: users.name,
    })
    .from(produceQuoteMessages)
    .leftJoin(users, eq(produceQuoteMessages.senderId, users.id))
    .where(eq(produceQuoteMessages.quoteRequestId, quoteRequestId))
    .orderBy(produceQuoteMessages.createdAt);
}

export async function createProduceQuoteMessage(
  message: InsertProduceQuoteMessage
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(produceQuoteMessages).values(message);
  await db
    .update(produceQuoteRequests)
    .set({ status: "negotiating", updatedAt: new Date() })
    .where(
      and(
        eq(produceQuoteRequests.id, message.quoteRequestId),
        eq(produceQuoteRequests.status, "new")
      )
    );
  return message;
}

export async function markProduceQuoteMessagesRead(
  quoteRequestId: string,
  recipientId: number
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(produceQuoteMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(produceQuoteMessages.quoteRequestId, quoteRequestId),
        ne(produceQuoteMessages.senderId, recipientId),
        isNull(produceQuoteMessages.readAt)
      )
    );
}

export async function updateProduceQuoteRequestStatus(
  id: string,
  status: "accepted" | "rejected" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(produceQuoteRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(produceQuoteRequests.id, id));
}

export async function createProduceQuoteNotification(
  notification: InsertProduceQuoteNotification
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(produceQuoteNotifications).values(notification);
  return notification;
}

export async function listProduceQuoteNotifications(recipientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(produceQuoteNotifications)
    .where(eq(produceQuoteNotifications.recipientId, recipientId))
    .orderBy(desc(produceQuoteNotifications.createdAt))
    .limit(30);
}

export async function markProduceQuoteNotificationRead(
  id: string,
  recipientId: number
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .update(produceQuoteNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(produceQuoteNotifications.id, id),
        eq(produceQuoteNotifications.recipientId, recipientId)
      )
    );
}
