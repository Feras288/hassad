import { adminProcedure, router } from "../_core/trpc";
import {
  createAdminManagedUser,
  createAdminVendorProfile,
  createCatalogCategory,
  deleteAdminVendorProfile,
  deleteCatalogCategory,
  linkVendorAccount,
  listAdminManagedUsers,
  listAdminNotificationReadKeys,
  listAdminVendorProfiles,
  listCatalogCategoriesForAdmin,
  listContactInquiries,
  listProductAvailabilityRequests,
  listVendorAccountLinks,
  markAllAdminNotificationsRead,
  setAdminNotificationReadStatus,
  updateAdminManagedUser,
  updateAdminVendorProfile,
  updateCatalogCategory,
} from "../db";
import { storagePut } from "../storage";
import { z } from "zod";
import { nanoid } from "nanoid";

const articleCoverUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  dataUrl: z.string().min(30).max(9_000_000),
});

export async function getAdminNotificationHistory(adminUserId: number) {
  const [inquiries, requests, readKeys] = await Promise.all([
    listContactInquiries(),
    listProductAvailabilityRequests(),
    listAdminNotificationReadKeys(adminUserId),
  ]);
  const readSet = new Set(readKeys);
  return [
    ...inquiries.map((inquiry) => ({
      id: `contact:${inquiry.id}`,
      type: "contact" as const,
      title: inquiry.subject,
      message: `استفسار من ${inquiry.name}`,
      href: "/admin/contact-inquiries",
      createdAt: inquiry.createdAt,
      sourceStatus: inquiry.status,
    })),
    ...requests.map((request) => ({
      id: `availability:${request.id}`,
      type: "availability" as const,
      title: `طلب توفير: ${request.requestedProduct}`,
      message: `طلب من ${request.requesterName}`,
      href: "/admin/product-requests",
      createdAt: request.createdAt,
      sourceStatus: request.status,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 250)
    .map((notification) => ({
      ...notification,
      isRead: readSet.has(notification.id),
    }));
}

export const adminNotificationsRouter = router({
  list: adminProcedure.query(async ({ ctx }) =>
    (await getAdminNotificationHistory(ctx.user.id))
      .filter(
        (notification) =>
          notification.sourceStatus === "new" ||
          notification.sourceStatus === "in_progress"
      )
      .slice(0, 8)
  ),
  history: adminProcedure.query(({ ctx }) =>
    getAdminNotificationHistory(ctx.user.id)
  ),
  setRead: adminProcedure
    .input(
      z.object({
        notificationKey: z.string().min(3).max(128),
        isRead: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) =>
      setAdminNotificationReadStatus(
        ctx.user.id,
        input.notificationKey,
        input.isRead
      )
    ),
  markAllRead: adminProcedure
    .input(
      z.object({
        notificationKeys: z.array(z.string().min(3).max(128)).max(8),
      })
    )
    .mutation(({ ctx, input }) =>
      markAllAdminNotificationsRead(ctx.user.id, input.notificationKeys)
    ),
});

export const adminManagementRouter = router({
  uploadImage: adminProcedure
    .input(articleCoverUploadSchema)
    .mutation(async ({ input }) => {
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
        `admin/assets/${nanoid(14)}.${extension}`,
        bytes,
        match[1]
      );
    }),
  vendors: router({
    list: adminProcedure.query(() => listAdminVendorProfiles()),
    create: adminProcedure
      .input(
        z.object({
          id: z.string().min(1).max(64),
          name: z.string().min(2).max(255),
          type: z.enum(["supplier", "provider"]),
          category: z.string().min(1).max(160),
          status: z.enum(["active", "pending", "suspended", "rejected"]),
          verified: z.boolean(),
          email: z.string().email().max(320),
          phone: z.string().min(7).max(32),
          location: z.string().min(2).max(160),
          logoUrl: z.string().url().nullable().optional(),
          commission: z.number().int().min(0).max(100),
          description: z.string().max(3000).nullable().optional(),
          website: z.string().url().nullable().optional(),
          crNumber: z.string().max(120).nullable().optional(),
          vatNumber: z.string().max(120).nullable().optional(),
          bankName: z.string().max(160).nullable().optional(),
          bankIban: z.string().max(120).nullable().optional(),
        })
      )
      .mutation(({ input }) => createAdminVendorProfile(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.string().min(1).max(64),
          updates: z.object({
            name: z.string().min(2).max(255).optional(),
            type: z.enum(["supplier", "provider"]).optional(),
            category: z.string().min(1).max(160).optional(),
            status: z
              .enum(["active", "pending", "suspended", "rejected"])
              .optional(),
            verified: z.boolean().optional(),
            email: z.string().email().max(320).optional(),
            phone: z.string().min(7).max(32).optional(),
            location: z.string().min(2).max(160).optional(),
            logoUrl: z.string().url().nullable().optional(),
            commission: z.number().int().min(0).max(100).optional(),
            description: z.string().max(3000).nullable().optional(),
            website: z.string().url().nullable().optional(),
            crNumber: z.string().max(120).nullable().optional(),
            vatNumber: z.string().max(120).nullable().optional(),
            bankName: z.string().max(160).nullable().optional(),
            bankIban: z.string().max(120).nullable().optional(),
          }),
        })
      )
      .mutation(({ input }) => updateAdminVendorProfile(input.id, input.updates)),
    delete: adminProcedure
      .input(z.object({ id: z.string().min(1).max(64) }))
      .mutation(({ input }) => deleteAdminVendorProfile(input.id)),
  }),
  categories: router({
    list: adminProcedure.query(() => listCatalogCategoriesForAdmin()),
    create: adminProcedure
      .input(
        z.object({
          id: z.string().min(1).max(64),
          name: z.string().min(2).max(160),
          nameEn: z.string().min(2).max(160),
          icon: z.string().min(1).max(32),
          color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          description: z.string().max(1000).nullable().optional(),
          active: z.boolean(),
        })
      )
      .mutation(({ input }) => createCatalogCategory(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.string().min(1).max(64),
          updates: z.object({
            name: z.string().min(2).max(160).optional(),
            nameEn: z.string().min(2).max(160).optional(),
            icon: z.string().min(1).max(32).optional(),
            color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
            description: z.string().max(1000).nullable().optional(),
            active: z.boolean().optional(),
          }),
        })
      )
      .mutation(({ input }) => updateCatalogCategory(input.id, input.updates)),
    delete: adminProcedure
      .input(z.object({ id: z.string().min(1).max(64) }))
      .mutation(({ input }) => deleteCatalogCategory(input.id)),
  }),
  users: router({
    list: adminProcedure.query(() => listAdminManagedUsers()),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(2).max(160),
          email: z.string().email().max(320),
          role: z.enum(["user", "admin", "vendor"]),
          vendorId: z.string().max(64).nullable().optional(),
        })
      )
      .mutation(({ input }) =>
        createAdminManagedUser({
          openId: `admin_invite_${nanoid(20)}`,
          name: input.name,
          email: input.email,
          role: input.role,
          vendorId: input.vendorId ?? null,
          loginMethod: "admin_invite",
          lastSignedIn: new Date(),
        })
      ),
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          updates: z.object({
            name: z.string().min(2).max(160).nullable().optional(),
            email: z.string().email().max(320).nullable().optional(),
            role: z.enum(["user", "admin", "vendor"]).optional(),
            vendorId: z.string().max(64).nullable().optional(),
          }),
        })
      )
      .mutation(({ input }) => updateAdminManagedUser(input.id, input.updates)),
  }),
});

export const vendorAccountsRouter = router({
  adminList: adminProcedure.query(() => listVendorAccountLinks()),
  link: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        vendorId: z.string().min(1).max(64),
      })
    )
    .mutation(({ input }) => linkVendorAccount(input.userId, input.vendorId)),
});
