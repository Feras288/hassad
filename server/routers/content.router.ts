import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createContactInquiry,
  createContentArticle,
  deleteContentArticle,
  getPublishedContentArticle,
  listContactInquiries,
  listContentArticles,
  listMostReadContentArticles,
  listPublishedContentArticles,
  listRelatedContentArticles,
  recordContentArticleView,
  updateContactInquiry,
  updateContentArticle,
} from "../db";
import { storagePut } from "../storage";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { nanoid } from "nanoid";

export const contactInquiryStatusSchema = z.enum(["new", "in_progress", "resolved", "closed"]);
export const contentArticleStatusSchema = z.enum(["draft", "published", "archived"]);

export const contentArticleInputSchema = z.object({
  title: z.string().trim().min(5).max(255),
  excerpt: z.string().trim().min(20).max(1000),
  content: z.string().trim().min(1).max(60000),
  category: z.string().trim().min(2).max(120),
  tags: z.array(z.string().trim().min(2).max(40)).max(12).default([]),
  titleEn: z.string().trim().min(5).max(255).nullable().optional(),
  excerptEn: z.string().trim().max(1000).nullable().optional(),
  contentEn: z.string().trim().max(60000).nullable().optional(),
  categoryEn: z.string().trim().max(120).nullable().optional(),
  tagsEn: z.array(z.string().trim().min(2).max(40)).max(12).nullable().optional(),
  coverImage: z.string().url().max(1000).nullable().optional(),
  status: contentArticleStatusSchema.default("draft"),
});

export const contentArticleUpdateSchema = contentArticleInputSchema.partial();

export const articleCoverUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  dataUrl: z.string().min(30).max(9_000_000),
});

export const sanitizeArticleContent = (content: string) =>
  sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });

export const normalizeArticleTags = (tags: string[]) =>
  Array.from(
    new Set(tags.map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))
  ).slice(0, 12);

export const contactInquiriesRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(160),
        email: z.string().trim().email().max(320),
        phone: z.string().trim().min(7).max(32),
        subject: z.string().trim().min(2).max(255),
        message: z.string().trim().min(10).max(3000),
      })
    )
    .mutation(({ input }) =>
      createContactInquiry({ id: `ci_${nanoid(16)}`, ...input, status: "new" })
    ),
  adminList: adminProcedure.query(() => listContactInquiries()),
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        status: contactInquiryStatusSchema,
        adminReply: z.string().trim().max(5000).nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const reply = input.adminReply?.trim() || null;
      return updateContactInquiry(input.id, {
        status: input.status,
        adminReply: reply,
        handledBy: reply ? ctx.user.name?.trim() || "مدير النظام" : null,
        respondedAt: reply ? new Date() : null,
      });
    }),
});

export const contentArticlesRouter = router({
  publicList: publicProcedure.query(() => listPublishedContentArticles()),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .query(({ input }) => getPublishedContentArticle(input.id)),
  related: publicProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        limit: z.number().int().min(1).max(6).default(3),
      })
    )
    .query(({ input }) => listRelatedContentArticles(input.id, input.limit)),
  mostRead: publicProcedure
    .input(
      z.object({ limit: z.number().int().min(1).max(8).default(5) }).optional()
    )
    .query(({ input }) => listMostReadContentArticles(input?.limit ?? 5)),
  recordView: publicProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ input }) => recordContentArticleView(input.id)),
  adminList: adminProcedure.query(() => listContentArticles()),
  create: adminProcedure
    .input(contentArticleInputSchema)
    .mutation(({ ctx, input }) => {
      const isPublished = input.status === "published";
      return createContentArticle({
        id: `art_${nanoid(14)}`,
        ...input,
        content: sanitizeArticleContent(input.content),
        tags: normalizeArticleTags(input.tags),
        titleEn: input.titleEn?.trim() || null,
        excerptEn: input.excerptEn?.trim() || null,
        contentEn: input.contentEn
          ? sanitizeArticleContent(input.contentEn)
          : null,
        categoryEn: input.categoryEn?.trim() || null,
        tagsEn: input.tagsEn ? normalizeArticleTags(input.tagsEn) : null,
        coverImage: input.coverImage ?? null,
        authorName: ctx.user.name?.trim() || "مدير النظام",
        publishedAt: isPublished ? new Date() : null,
      });
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64),
        updates: contentArticleUpdateSchema,
      })
    )
    .mutation(({ input }) => {
      const isPublished = input.updates.status === "published";
      const updates = {
        ...input.updates,
        content:
          input.updates.content === undefined
            ? undefined
            : sanitizeArticleContent(input.updates.content),
        tags:
          input.updates.tags === undefined
            ? undefined
            : normalizeArticleTags(input.updates.tags),
        contentEn:
          input.updates.contentEn === undefined
            ? undefined
            : input.updates.contentEn
            ? sanitizeArticleContent(input.updates.contentEn)
            : null,
        tagsEn:
          input.updates.tagsEn === undefined
            ? undefined
            : input.updates.tagsEn
            ? normalizeArticleTags(input.updates.tagsEn)
            : null,
      };
      return updateContentArticle(input.id, {
        ...updates,
        coverImage: updates.coverImage,
        publishedAt: isPublished
          ? new Date()
          : updates.status === "draft"
          ? null
          : undefined,
      });
    }),
  uploadCover: adminProcedure
    .input(articleCoverUploadSchema)
    .mutation(async ({ input }) => {
      const match = input.dataUrl.match(
        /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
      );
      if (!match) throw new Error("اختر صورة PNG أو JPG أو WEBP صالحة");
      const contentType = match[1];
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
        throw new Error("حجم صورة الغلاف يجب ألا يتجاوز 5 ميجابايت");
      const extension =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
          ? "webp"
          : "jpg";
      return storagePut(
        `content/article-covers/${nanoid(14)}.${extension}`,
        bytes,
        contentType
      );
    }),
  uploadInlineImage: adminProcedure
    .input(articleCoverUploadSchema)
    .mutation(async ({ input }) => {
      const match = input.dataUrl.match(
        /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
      );
      if (!match) throw new Error("اختر صورة PNG أو JPG أو WEBP صالحة");
      const contentType = match[1];
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
        throw new Error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      const extension =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
          ? "webp"
          : "jpg";
      return storagePut(
        `content/article-inline/${nanoid(14)}.${extension}`,
        bytes,
        contentType
      );
    }),
  archive: adminProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ input }) =>
      updateContentArticle(input.id, { status: "archived" })
    ),
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1).max(64) }))
    .mutation(({ input }) => deleteContentArticle(input.id)),
});
