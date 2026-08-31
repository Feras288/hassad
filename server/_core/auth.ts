import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "../../drizzle/schema";
import { ENV } from "./env";

// Create db client instance for Better Auth adapter
export const authDb = drizzle(ENV.databaseUrl || "mysql://user:pass@localhost:3306/db");

// Explicitly define trusted origins without wildcards, separating production from development
const trustedOrigins: string[] = ENV.isProduction
  ? [ENV.betterAuthUrl, ...(process.env.VITE_APP_URL ? [process.env.VITE_APP_URL] : [])].filter(Boolean)
  : [
      ENV.betterAuthUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "mysql",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: ENV.betterAuthSecret,
  baseURL: ENV.betterAuthUrl,
  trustedOrigins: Array.from(new Set(trustedOrigins)),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    ...(ENV.googleClientId && ENV.googleClientSecret
      ? {
          google: {
            clientId: ENV.googleClientId,
            clientSecret: ENV.googleClientSecret,
          },
        }
      : {}),
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
      vendorId: {
        type: "string",
        required: false,
        input: false,
      },
      preferredLanguage: {
        type: "string",
        defaultValue: "ar",
      },
      loginMethod: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = (user.email || "").trim().toLowerCase();
          const initialAdmin = ENV.initialAdminEmail;
          const isTargetEmail = email === initialAdmin && initialAdmin.length > 0;
          const isEmailVerified = Boolean(user.emailVerified);

          let grantAdmin = false;
          // Grant admin only if target email is verified AND no admin exists in table yet (single bootstrap)
          if (isTargetEmail && isEmailVerified) {
            try {
              const existingAdmins = await authDb
                .select({ id: users.id })
                .from(users)
                .where(eq(users.role, "admin"))
                .limit(1);
              if (existingAdmins.length === 0) {
                grantAdmin = true;
              }
            } catch {
              // Fail closed: if database query fails or throws an error, never grant admin
              grantAdmin = false;
            }
          }

          return {
            data: {
              ...user,
              email,
              role: grantAdmin ? "admin" : "user",
              vendorId: null,
              loginMethod: user.loginMethod ?? "email",
              preferredLanguage: user.preferredLanguage ?? "ar",
            },
          };
        },
      },
    },
  },
});

export type Auth = typeof auth;
