import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getOAuthErrorMessage, isOAuthSupported } from "../oauthConfig";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string>('');

  // Initialize OAuth configuration once
  useEffect(() => {
    try {
      if (options?.redirectPath) {
        setRedirectPath(options.redirectPath);
      } else {
        const url = getLoginUrl();
        setRedirectPath(url);
        setOauthError(null);
      }
    } catch (error) {
      // OAuth is not supported in this environment
      setRedirectPath('');
      setOauthError(getOAuthErrorMessage() || 'OAuth authentication is not available');
    }
  }, [options?.redirectPath]);

  const { redirectOnUnauthenticated = false } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  useEffect(() => {
    if (meQuery.data) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
  }, [meQuery.data]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      oauthError,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    oauthError,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (!redirectPath) return; // OAuth not supported
    if (window.location.pathname === redirectPath) return;

    try {
      window.location.href = redirectPath;
    } catch (error) {
      console.error('[Auth] Failed to redirect to login:', error);
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);



  return {
    ...state,
    loginUrl: redirectPath,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
