/**
 * OAuth Configuration Utility
 * Handles environment-aware redirect URI generation for localhost, preview, and production
 */

export type Environment = 'localhost' | 'preview' | 'production';

/**
 * Detect the current environment based on the window location
 */
export function detectEnvironment(): Environment {
  if (typeof window === 'undefined') return 'production';
  
  const hostname = window.location.hostname;
  
  // localhost or 127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  // Preview domains (manus.computer, manus.space, etc.)
  if (hostname.includes('manus.computer') || hostname.includes('manus.space')) {
    return 'preview';
  }
  
  // Custom domains are considered production
  return 'production';
}

/**
 * Get the OAuth redirect URI for the current environment
 * For preview domains, falls back to production domain to avoid OAuth registration issues
 */
export function getOAuthRedirectUri(): string {
  const env = detectEnvironment();
  const protocol = window.location.protocol;
  
  // For preview deployments, use the production domain
  // This assumes the production domain is configured in Google OAuth
  if (env === 'preview') {
    const productionDomain = import.meta.env.VITE_PRODUCTION_DOMAIN;
    if (productionDomain) {
      return `${protocol}//${productionDomain}/api/oauth/callback`;
    }
    // If no production domain is configured, warn the user
    console.warn(
      '[OAuth] Running on preview domain but VITE_PRODUCTION_DOMAIN is not configured. ' +
      'OAuth may fail. Please set VITE_PRODUCTION_DOMAIN environment variable.'
    );
  }
  
  // For localhost and production, use the current origin
  return `${window.location.origin}/api/oauth/callback`;
}

/**
 * Check if the current environment is supported for OAuth
 * Returns true if OAuth should work, false if it will likely fail
 */
export function isOAuthSupported(): boolean {
  const env = detectEnvironment();
  
  // Localhost is always supported (for local development)
  if (env === 'localhost') return true;
  
  // Production is supported
  if (env === 'production') return true;
  
  // Preview is only supported if production domain is configured
  if (env === 'preview') {
    const productionDomain = import.meta.env.VITE_PRODUCTION_DOMAIN;
    return !!productionDomain;
  }
  
  return false;
}

/**
 * Get a user-friendly error message if OAuth is not supported
 */
export function getOAuthErrorMessage(): string | null {
  if (isOAuthSupported()) return null;
  
  const env = detectEnvironment();
  
  if (env === 'preview') {
    return (
      'This preview deployment is not configured for OAuth authentication. ' +
      'Please use the production domain to log in, or contact the administrator to configure this preview domain in Google Cloud OAuth.'
    );
  }
  
  return 'OAuth authentication is not available in this environment.';
}

/**
 * Get environment information for debugging
 */
export function getOAuthDebugInfo(): Record<string, string> {
  return {
    environment: detectEnvironment(),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    redirectUri: typeof window !== 'undefined' ? getOAuthRedirectUri() : 'N/A',
    productionDomain: import.meta.env.VITE_PRODUCTION_DOMAIN || 'not configured',
    isSupported: isOAuthSupported() ? 'yes' : 'no',
  };
}
