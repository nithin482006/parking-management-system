export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getOAuthRedirectUri, isOAuthSupported, getOAuthErrorMessage, logOAuthConfig } from "./_core/oauthConfig";

// Log OAuth configuration on app start (for debugging)
if (typeof window !== 'undefined') {
  logOAuthConfig();
}

/**
 * Generate login URL at runtime with environment-aware redirect URI
 * Returns null if OAuth is not supported in the current environment
 * This is non-throwing to allow graceful fallback to guest UI
 */
export const getLoginUrl = (): string | null => {
  try {
    // Check if OAuth is supported in this environment
    if (!isOAuthSupported()) {
      const errorMsg = getOAuthErrorMessage();
      console.warn('[OAuth] OAuth not supported:', errorMsg);
      return null;
    }

    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    
    if (!oauthPortalUrl || !appId) {
      console.warn('[OAuth] Missing required environment variables');
      return null;
    }

    const redirectUri = getOAuthRedirectUri();
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.warn('[OAuth] Failed to generate login URL:', error);
    return null;
  }
};
