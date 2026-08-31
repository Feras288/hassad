export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Navigate user to the authentication page.
 */
export const startLogin = (redirectPath?: string) => {
  if (typeof window === "undefined") return;
  const target = redirectPath
    ? `/auth?redirect=${encodeURIComponent(redirectPath)}`
    : "/auth";
  if (window.location.pathname !== "/auth") {
    window.location.href = target;
  }
};
