import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { isOAuthSupported, getOAuthErrorMessage } from "./_core/oauthConfig";
import "./index.css";

// Global state for unauthorized errors
let unauthorizedErrorOccurred = false;

// Make it accessible globally
(window as any).__parkHub = {
  getUnauthorizedErrorState: () => unauthorizedErrorOccurred,
  resetUnauthorizedErrorState: () => {
    unauthorizedErrorOccurred = false;
  },
};

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Mark that an unauthorized error occurred
  unauthorizedErrorOccurred = true;

  // Check if OAuth is supported before attempting redirect
  if (!isOAuthSupported()) {
    // OAuth is not available - the UnauthorizedView will be shown
    return;
  }

  try {
    const loginUrl = getLoginUrl();
    if (loginUrl) {
      window.location.href = loginUrl;
    }
    // If loginUrl is null, OAuth is not supported - the UnauthorizedView will be shown
  } catch (err) {
    // OAuth redirect failed - the UnauthorizedView will be shown
  }
};



queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
