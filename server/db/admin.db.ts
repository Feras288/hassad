import { desc, eq } from "drizzle-orm";
import {
  adminNotificationReads,
  adminVendorProfiles,
  catalogCategories,
  InsertUser,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";

/** Safe account list for admins to attach an approved supplier identity to a vendor account. */
export async function listVendorAccountLinks() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      vendorId: users.vendorId,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.updatedAt));
}

export async function linkVendorAccount(userId: number, vendorId: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const target = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!target[0]) throw new Error("الحساب غير موجود");
  if (target[0].role === "admin")
    throw new Error("لا يمكن تحويل حساب مدير النظام إلى مورد");
  await db
    .update(users)
    .set({ role: "vendor", vendorId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/** Stores a per-admin read state without changing the operational status of the source record. */
export async function listAdminNotificationReadKeys(adminUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ notificationKey: adminNotificationReads.notificationKey })
    .from(adminNotificationReads)
    .where(eq(adminNotificationReads.adminUserId, adminUserId));
  return rows.map((row) => row.notificationKey);
}

const adminReadId = (adminUserId: number, notificationKey: string) =>
  `anr_${adminUserId}_${notificationKey}`;

export async function setAdminNotificationReadStatus(
  adminUserId: number,
  notificationKey: string,
  isRead: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const id = adminReadId(adminUserId, notificationKey);
  if (!isRead) {
    await db
      .delete(adminNotificationReads)
      .where(eq(adminNotificationReads.id, id));
    return;
  }
  await db
    .insert(adminNotificationReads)
    .values({ id, adminUserId, notificationKey, readAt: new Date() })
    .onDuplicateKeyUpdate({ set: { readAt: new Date() } });
}

export async function markAllAdminNotificationsRead(
  adminUserId: number,
  notificationKeys: string[]
) {
  const keys = Array.from(new Set(notificationKeys));
  await Promise.all(
    keys.map((notificationKey) =>
      setAdminNotificationReadStatus(adminUserId, notificationKey, true)
    )
  );
}

export async function listAdminVendorProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(adminVendorProfiles)
    .orderBy(desc(adminVendorProfiles.createdAt));
}

export async function createAdminVendorProfile(
  profile: typeof adminVendorProfiles.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(adminVendorProfiles).values(profile);
  return profile;
}

export async function updateAdminVendorProfile(
  id: string,
  updates: Partial<typeof adminVendorProfiles.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db
    .update(adminVendorProfiles)
    .set(updates)
    .where(eq(adminVendorProfiles.id, id));
}

export async function deleteAdminVendorProfile(id: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db
    .delete(adminVendorProfiles)
    .where(eq(adminVendorProfiles.id, id));
}

export async function listCatalogCategoriesForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(catalogCategories)
    .orderBy(desc(catalogCategories.createdAt));
}

export async function createCatalogCategory(
  category: typeof catalogCategories.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(catalogCategories).values(category);
  return category;
}

export async function updateCatalogCategory(
  id: string,
  updates: Partial<typeof catalogCategories.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db
    .update(catalogCategories)
    .set(updates)
    .where(eq(catalogCategories.id, id));
}

export async function deleteCatalogCategory(id: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.delete(catalogCategories).where(eq(catalogCategories.id, id));
}

export async function listAdminManagedUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createAdminManagedUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(users).values(user);
  return user;
}

export async function updateAdminManagedUser(
  id: number,
  updates: Partial<InsertUser>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.update(users).set(updates).where(eq(users.id, id));
}
