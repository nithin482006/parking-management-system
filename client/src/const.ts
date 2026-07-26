export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getOAuthRedirectUri, isOAuthSupported, getOAuthErrorMessage } from "./_core/oauthConfig";

// Generate login URL at runtime with environment-aware redirect URI
export const getLoginUrl = () => {
  // Check if OAuth is supported in this environment
  if (!isOAuthSupported()) {
    const errorMsg = getOAuthErrorMessage();
    console.error('[OAuth] Configuration Error:', errorMsg);
    throw new Error(errorMsg || 'OAuth is not supported in this environment');
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = getOAuthRedirectUri();
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
