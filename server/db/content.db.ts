import { and, desc, eq, sql } from "drizzle-orm";
import {
  contactInquiries,
  contentArticles,
  InsertContactInquiry,
  InsertContentArticle,
} from "../../drizzle/schema";
import { getDb } from "./connection";

/** Persist a public support inquiry submitted from the contact page. */
export async function createContactInquiry(inquiry: InsertContactInquiry) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(contactInquiries).values(inquiry);
  return inquiry;
}

/** Administrative inbox for all messages submitted through the public contact form. */
export async function listContactInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contactInquiries)
    .orderBy(desc(contactInquiries.updatedAt));
}

export async function updateContactInquiry(
  id: string,
  updates: Partial<InsertContactInquiry>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await db
    .update(contactInquiries)
    .set({ ...safeUpdates, updatedAt: new Date() })
    .where(eq(contactInquiries.id, id));
}

/** Public article feed exposes only content explicitly published by an administrator. */
export async function listPublishedContentArticles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contentArticles)
    .where(eq(contentArticles.status, "published"))
    .orderBy(
      desc(contentArticles.publishedAt),
      desc(contentArticles.createdAt)
    );
}

export async function getPublishedContentArticle(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(contentArticles)
    .where(
      and(eq(contentArticles.id, id), eq(contentArticles.status, "published"))
    )
    .limit(1);
  return result[0] ?? null;
}

/** Counts a verified page view only for an article that remains publicly published. */
export async function recordContentArticleView(id: string) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(contentArticles)
    .set({ viewCount: sql`${contentArticles.viewCount} + 1` })
    .where(
      and(eq(contentArticles.id, id), eq(contentArticles.status, "published"))
    );
  const result = await db
    .select({ viewCount: contentArticles.viewCount })
    .from(contentArticles)
    .where(
      and(eq(contentArticles.id, id), eq(contentArticles.status, "published"))
    )
    .limit(1);
  return result[0]?.viewCount ?? null;
}

/** Uses common taxonomy first, then readership and recency to surface a small, explainable related list. */
export async function listRelatedContentArticles(id: string, limit = 3) {
  const db = await getDb();
  if (!db) return [];
  const current = await getPublishedContentArticle(id);
  if (!current) return [];
  const candidates = await db
    .select()
    .from(contentArticles)
    .where(eq(contentArticles.status, "published"));
  const currentTags = new Set(current.tags ?? []);
  return candidates
    .filter((article) => article.id !== current.id)
    .map((article) => {
      const sharedTags = (article.tags ?? []).filter((tag) =>
        currentTags.has(tag)
      ).length;
      return {
        article,
        score:
          (article.category === current.category ? 5 : 0) + sharedTags * 3,
      };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.article.viewCount - a.article.viewCount ||
        Number(b.article.publishedAt ?? 0) - Number(a.article.publishedAt ?? 0)
    )
    .slice(0, limit)
    .map(({ article }) => article);
}

export async function listMostReadContentArticles(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contentArticles)
    .where(eq(contentArticles.status, "published"))
    .orderBy(
      desc(contentArticles.viewCount),
      desc(contentArticles.publishedAt),
      desc(contentArticles.createdAt)
    )
    .limit(limit);
}

/** Administrative feed includes drafts so editors can continue unfinished work. */
export async function listContentArticles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contentArticles)
    .orderBy(desc(contentArticles.updatedAt));
}

export async function createContentArticle(article: InsertContentArticle) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(contentArticles).values(article);
  return article;
}

export async function updateContentArticle(
  id: string,
  updates: Partial<InsertContentArticle>
) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await db
    .update(contentArticles)
    .set({ ...safeUpdates, updatedAt: new Date() })
    .where(eq(contentArticles.id, id));
}

export async function deleteContentArticle(id: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.delete(contentArticles).where(eq(contentArticles.id, id));
}
