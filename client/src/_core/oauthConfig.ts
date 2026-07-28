/**
 * OAuth Configuration Utility
 * Handles environment-aware OAuth configuration for localhost, preview, and production
 * Supports multiple Google OAuth client IDs for different environments
 */

export type Environment = 'localhost' | 'preview' | 'production';

interface EnvironmentConfig {
  environment: Environment;
  domain: string;
  protocol: string;
  isSupported: boolean;
  clientId?: string;
  redirectUri: string;
}

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
  
  // Preview domains (*.manus.computer)
  if (hostname.includes('manus.computer')) {
    return 'preview';
  }
  
  // Production domains (*.manus.space or custom domains)
  return 'production';
}

/**
 * Get the current domain with protocol
 */
export function getCurrentDomain(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.protocol}//${window.location.host}`;
}

/**
 * Get environment-specific OAuth configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (typeof window === 'undefined') {
    return {
      environment: 'production',
      domain: '',
      protocol: 'https',
      isSupported: false,
      redirectUri: '',
    };
  }

  const env = detectEnvironment();
  const protocol = window.location.protocol;
  const domain = window.location.host;
  const origin = window.location.origin;

  // Configuration for each environment
  const configs: Record<Environment, Omit<EnvironmentConfig, 'environment'>> = {
    localhost: {
      domain: 'localhost:3000',
      protocol,
      isSupported: true,
      redirectUri: `${origin}/api/oauth/callback`,
    },
    preview: {
      domain,
      protocol,
      isSupported: true, // Preview domains are now supported
      redirectUri: `${origin}/api/oauth/callback`,
    },
    production: {
      domain,
      protocol,
      isSupported: true,
      redirectUri: `${origin}/api/oauth/callback`,
    },
  };

  const config = configs[env];
  return {
    environment: env,
    ...config,
  };
}

/**
 * Get the OAuth redirect URI for the current environment
 */
export function getOAuthRedirectUri(): string {
  const config = getEnvironmentConfig();
  return config.redirectUri;
}

/**
 * Check if the current environment is supported for OAuth
 * Returns true if OAuth should work, false if it will likely fail
 */
export function isOAuthSupported(): boolean {
  const config = getEnvironmentConfig();
  return config.isSupported;
}

/**
 * Get a user-friendly error message if OAuth is not supported
 */
export function getOAuthErrorMessage(): string | null {
  if (isOAuthSupported()) return null;
  
  const env = detectEnvironment();
  
  if (env === 'preview') {
    return (
      'Authentication is temporarily unavailable on this preview domain. ' +
      'Please try again or use the production domain.'
    );
  }
  
  if (env === 'localhost') {
    return 'Authentication is not available in local development mode.';
  }
  
  return 'Authentication is not available in this environment.';
}

/**
 * Get environment information for debugging
 */
export function getOAuthDebugInfo(): Record<string, string> {
  const config = getEnvironmentConfig();
  return {
    environment: config.environment,
    domain: config.domain,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    redirectUri: config.redirectUri,
    isSupported: config.isSupported ? 'yes' : 'no',
  };
}

/**
 * Log OAuth configuration info (for debugging)
 */
export function logOAuthConfig(): void {
  if (typeof window === 'undefined') return;
  
  const config = getEnvironmentConfig();
  console.log('[OAuth] Configuration:', {
    environment: config.environment,
    domain: config.domain,
    redirectUri: config.redirectUri,
    supported: config.isSupported,
  });
}
