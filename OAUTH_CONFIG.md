# OAuth Configuration Guide

## Overview

This document explains how to configure Google OAuth authentication for the ParkHub Parking Management System across different environments (localhost, preview deployments, and production).

## Problem: Invalid Redirect URI

When deploying to preview domains that aren't registered in Google Cloud OAuth, you may encounter:

```
authorization failed: invalid_redirect_uri: redirect_uri domain '<preview-domain>' not allowed for this project
```

This happens because:
1. Google OAuth validates redirect URIs against a whitelist
2. Preview domains (e.g., `parkingsys-xyz.manus.space`) are temporary and not pre-registered
3. The app was using `window.location.origin` which changes for each deployment

## Solution: Environment-Aware Redirect URI Handling

The application now includes automatic environment detection and fallback mechanisms.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Login"                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  detectEnvironment() checks hostname                        │
│  - localhost → use localhost redirect URI                  │
│  - manus.space/manus.computer → use production domain      │
│  - custom domain → use current origin                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  getOAuthRedirectUri() generates correct URI               │
│  - Checks if VITE_PRODUCTION_DOMAIN is configured          │
│  - Falls back to production domain for preview deployments │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  isOAuthSupported() validates configuration                │
│  - Returns true if OAuth can proceed                       │
│  - Returns false if environment not supported              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  User is redirected to OAuth provider                      │
│  - With correct, registered redirect URI                  │
│  - OAuth succeeds and redirects back                       │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Steps

### 1. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add **Authorized Redirect URIs**:
   ```
   http://localhost:3000/api/oauth/callback
   http://localhost:3001/api/oauth/callback
   https://parkingsys-cccs8fnl.manus.space/api/oauth/callback
   https://yourdomain.com/api/oauth/callback
   ```

### 2. Configure Environment Variables

**For Local Development:**
```bash
VITE_APP_ID=your_google_oauth_client_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=your_jwt_secret
DATABASE_URL=mysql://user:password@localhost:3306/parking_db
```

**For Production Deployment:**
```bash
VITE_APP_ID=your_google_oauth_client_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_PRODUCTION_DOMAIN=parkingsys-cccs8fnl.manus.space
JWT_SECRET=your_jwt_secret
DATABASE_URL=mysql://user:password@host:3306/parking_db
```

**For Preview Deployments:**
```bash
# Same as production, but add:
VITE_PRODUCTION_DOMAIN=parkingsys-cccs8fnl.manus.space
# This tells preview deployments to use the production domain for OAuth
```

### 3. Verify Configuration

The server validates OAuth configuration on startup:

```
[OAuth] Configuration validated successfully
  - App ID: your_app_id
  - OAuth Server: https://api.manus.im
  - Production Domain: parkingsys-cccs8fnl.manus.space
  - Environment: production
```

If there are errors:

```
[OAuth] Configuration Errors:
  - VITE_APP_ID is not configured
  - OAUTH_SERVER_URL is not configured
```

## Implementation Details

### Files Modified

1. **`client/src/_core/oauthConfig.ts`** (NEW)
   - Environment detection logic
   - Redirect URI generation
   - OAuth support validation
   - Debug information

2. **`client/src/const.ts`**
   - Updated `getLoginUrl()` to use environment-aware redirect URI
   - Added error handling for unsupported environments

3. **`client/src/_core/hooks/useAuth.ts`**
   - Added OAuth error state
   - Graceful error handling for unsupported environments
   - User-friendly error messages

4. **`client/src/main.tsx`**
   - Added OAuth validation before redirects
   - Shows error alerts instead of failing silently

5. **`server/_core/index.ts`**
   - Added `validateOAuthConfig()` function
   - Validates all required environment variables
   - Logs configuration details on startup

6. **`server/_core/env.ts`**
   - Added `productionDomain` configuration

### Key Functions

#### `detectEnvironment(): Environment`
Detects whether the app is running on:
- `'localhost'` - Local development
- `'preview'` - Temporary preview domain
- `'production'` - Production domain

#### `getOAuthRedirectUri(): string`
Returns the correct redirect URI for the current environment:
- Localhost: `http://localhost:PORT/api/oauth/callback`
- Preview: Falls back to production domain if configured
- Production: `https://domain.com/api/oauth/callback`

#### `isOAuthSupported(): boolean`
Checks if OAuth can proceed:
- Returns `true` for localhost and production
- Returns `true` for preview only if `VITE_PRODUCTION_DOMAIN` is configured
- Returns `false` otherwise

#### `getOAuthErrorMessage(): string | null`
Returns a user-friendly error message if OAuth is not supported.

## Troubleshooting

### Error: "invalid_redirect_uri"

**Cause**: Redirect URI not registered in OAuth provider

**Solution**:
1. Check that the redirect URI in the error matches one of your registered URIs
2. Add the URI to Google Cloud Console OAuth settings
3. Restart the application

### Error: "VITE_PRODUCTION_DOMAIN is not configured"

**Cause**: Preview deployment without production domain configured

**Solution**:
1. Set `VITE_PRODUCTION_DOMAIN` to your production domain
2. Ensure the production domain is registered in OAuth
3. Restart the application

### Error: "OAuth is not supported in this environment"

**Cause**: Running on unsupported domain without proper configuration

**Solution**:
1. For preview deployments: Set `VITE_PRODUCTION_DOMAIN`
2. For custom domains: Register the domain in OAuth provider
3. Check server logs for specific configuration errors

### Debug Information

To view OAuth configuration details:

```javascript
import { getOAuthDebugInfo } from '@/_core/oauthConfig';

console.log(getOAuthDebugInfo());
// Output:
// {
//   environment: 'production',
//   hostname: 'parkingsys-cccs8fnl.manus.space',
//   origin: 'https://parkingsys-cccs8fnl.manus.space',
//   redirectUri: 'https://parkingsys-cccs8fnl.manus.space/api/oauth/callback',
//   productionDomain: 'parkingsys-cccs8fnl.manus.space',
//   isSupported: 'yes'
// }
```

## Testing

### Test Localhost
```bash
npm run dev
# Visit http://localhost:3000
# Click Login - should redirect to OAuth
```

### Test Production Domain
```bash
# Deploy to production
# Visit https://yourdomain.com
# Click Login - should redirect to OAuth
```

### Test Preview Domain
```bash
# Deploy to preview (e.g., parkingsys-xyz.manus.space)
# Set VITE_PRODUCTION_DOMAIN=yourdomain.com
# Visit preview domain
# Click Login - should redirect to OAuth using production domain
# After OAuth, should redirect back to preview domain
```

## Security Considerations

1. **Redirect URI Validation**: OAuth provider validates all redirect URIs
2. **State Parameter**: Includes encoded redirect URI in state for verification
3. **HTTPS**: Production deployments use HTTPS only
4. **Environment Variables**: Never commit sensitive credentials to version control
5. **Error Messages**: User-friendly errors don't expose sensitive information

## Support

For issues or questions about OAuth configuration:

1. Check the server logs for validation messages
2. Review the OAuth provider's documentation
3. Verify all environment variables are correctly set
4. Test with `getOAuthDebugInfo()` to inspect current configuration
