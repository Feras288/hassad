import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx }) {
    // Correlate server-side error logs with the client-visible x-request-id, without logging PII.
    if (ctx?.requestId) {
      console.error(`[${ctx.requestId}] ${error.code}: ${error.message}`);
    }
    // Routers throw plain Error(...) with user-facing Arabic messages by convention, so the
    // message itself must reach the client — only strip the stack trace/debug data in production.
    if (ENV.isProduction) {
      return { ...shape, data: { ...shape.data, stack: undefined } };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.banned) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.user.banReason
        ? `الحساب موقوف: ${ctx.user.banReason}`
        : "تم إيقاف هذا الحساب من قبل إدارة المنصة",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    if (ctx.user.banned) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.user.banReason
          ? `الحساب موقوف: ${ctx.user.banReason}`
          : "تم إيقاف هذا الحساب من قبل إدارة المنصة",
      });
    }

    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

/** Supplier-only procedures: the account must be mapped to a catalog vendorId. */
export const vendorProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    if (ctx.user.banned) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.user.banReason
          ? `الحساب موقوف: ${ctx.user.banReason}`
          : "تم إيقاف هذا الحساب من قبل إدارة المنصة",
      });
    }

    if (ctx.user.role !== "vendor" || !ctx.user.vendorId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "حساب المورد غير مرتبط بملف مورد معتمد",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
