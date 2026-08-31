import { startLogin } from "@/const";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const session = authClient.useSession();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [utils]);

  const user = meQuery.data ?? (session.data?.user ? (session.data.user as any) : null);
  const loading = session.isPending || (Boolean(session.data?.user) && meQuery.isLoading);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin(window.location.pathname);
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    isAuthenticated,
  ]);

  return {
    user,
    loading,
    error: meQuery.error ?? session.error ?? null,
    isAuthenticated,
    refresh: () => {
      meQuery.refetch();
    },
    logout,
  };
}
