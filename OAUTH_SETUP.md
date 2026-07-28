# OAuth Configuration Guide

This document explains how to configure Google OAuth for ParkHub on different environments (localhost, preview, and production).

## Overview

ParkHub uses Manus OAuth for authentication. The system automatically detects the current environment and uses the appropriate OAuth configuration.

## Environment Detection

The app automatically detects which environment it's running on:

- **localhost**: Local development (http://localhost:3000)
- **preview**: Manus preview domains (*.manus.computer)
- **production**: Manus production domains (*.manus.space) or custom domains

## OAuth Configuration for Each Environment

### 1. Localhost Development

**Redirect URI**: `http://localhost:3000/api/oauth/callback`

**Authorized JavaScript Origins**:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**Setup Steps**:
1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Set Application type to "Web application"
3. Add the redirect URI above
4. Add the authorized origins above
5. Copy the Client ID and set it as `VITE_APP_ID` in `.env.local`

### 2. Preview Domain (manus.computer)

**Redirect URI**: `https://{project-name}.manus.computer/api/oauth/callback`

**Authorized JavaScript Origins**:
- `https://{project-name}.manus.computer`

**Setup Steps**:
1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Set Application type to "Web application"
3. Add the redirect URI with your actual project name
4. Add the authorized origin with your actual project name
5. Configure the Client ID in your preview deployment environment variables

**Note**: The app will automatically use this configuration when deployed to preview domains.

### 3. Production Domain (manus.space or custom)

**Redirect URI**: `https://{your-domain}/api/oauth/callback`

**Authorized JavaScript Origins**:
- `https://{your-domain}`

**Setup Steps**:
1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Set Application type to "Web application"
3. Add the redirect URI with your actual domain
4. Add the authorized origin with your actual domain
5. Configure the Client ID in your production deployment environment variables

## Environment Variables

Configure these environment variables for OAuth to work:

```
VITE_APP_ID=your-google-oauth-client-id
VITE_OAUTH_PORTAL_URL=https://api.manus.im
```

The `VITE_APP_ID` should be set to the appropriate Google OAuth Client ID for your environment.

## Automatic Environment Switching

The app automatically detects the environment and uses the correct OAuth configuration:

```typescript
// Automatically detects environment based on domain
const env = detectEnvironment(); // Returns: 'localhost', 'preview', or 'production'

// Gets the correct redirect URI for the current environment
const redirectUri = getOAuthRedirectUri();

// Checks if OAuth is supported in the current environment
const supported = isOAuthSupported();
```

## Troubleshooting

### "Please use the production domain to log in" Error

This error occurs when:
1. The app is running on a preview domain (*.manus.computer)
2. The preview domain is not configured in Google OAuth
3. The Client ID doesn't have the correct redirect URI

**Solution**:
- Configure the preview domain in Google OAuth with the correct redirect URI
- Or use the production domain for testing

### OAuth Configuration Not Found

If you see this error:
1. Check that `VITE_APP_ID` is set correctly
2. Check that `VITE_OAUTH_PORTAL_URL` is set to `https://api.manus.im`
3. Verify the redirect URI matches exactly (including protocol and trailing slash)

### Redirect URI Mismatch

Google OAuth requires exact match of redirect URIs. Common issues:
- Missing `https://` or `http://`
- Missing `/api/oauth/callback` path
- Extra trailing slash
- Incorrect domain or port

## Testing OAuth Locally

To test OAuth locally:

1. Set up a Google OAuth Client ID for localhost
2. Configure the redirect URI: `http://localhost:3000/api/oauth/callback`
3. Set `VITE_APP_ID` in `.env.local`
4. Start the dev server: `pnpm dev`
5. Click "Login" and test the OAuth flow

## Debugging

To debug OAuth configuration:

```typescript
import { getOAuthDebugInfo, logOAuthConfig } from '@/_core/oauthConfig';

// Log configuration info
logOAuthConfig();

// Get detailed debug info
const debugInfo = getOAuthDebugInfo();
console.log(debugInfo);
```

The debug info includes:
- Current environment (localhost, preview, production)
- Current domain
- Redirect URI
- Whether OAuth is supported

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Manus OAuth Documentation](https://docs.manus.im)
- [Google Cloud Console](https://console.cloud.google.com)
