export function getBetterAuthSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: BETTER_AUTH_SECRET environment variable is required in production mode."
      );
    }
    // Only for local non-production development/tests
    return "dev-secret-key-only-for-local-testing-32chars";
  }
  return secret.trim();
}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  betterAuthSecret: getBetterAuthSecret(),
  betterAuthUrl:
    process.env.BETTER_AUTH_URL ??
    process.env.VITE_APP_URL ??
    "http://localhost:3000",
  initialAdminEmail: (process.env.INITIAL_ADMIN_EMAIL ?? "dealb2b@gmail.com")
    .trim()
    .toLowerCase(),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  trustProxy: process.env.TRUST_PROXY,
  isProduction: process.env.NODE_ENV === "production",
};
