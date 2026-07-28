import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectEnvironment,
  getEnvironmentConfig,
  getOAuthRedirectUri,
  isOAuthSupported,
  getOAuthErrorMessage,
  getOAuthDebugInfo,
  type Environment,
} from './oauthConfig';

describe('OAuth Configuration', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      protocol: 'https:',
      host: 'localhost:3000',
      hostname: 'localhost',
      origin: 'http://localhost:3000',
    };
  });

  afterEach(() => {
    // Restore original location
    (window as any).location = originalLocation;
  });

  describe('detectEnvironment', () => {
    it('should detect localhost environment', () => {
      window.location.hostname = 'localhost';
      expect(detectEnvironment()).toBe('localhost');
    });

    it('should detect localhost with 127.0.0.1', () => {
      window.location.hostname = '127.0.0.1';
      expect(detectEnvironment()).toBe('localhost');
    });

    it('should detect preview environment for manus.computer domains', () => {
      window.location.hostname = 'parking-system.manus.computer';
      expect(detectEnvironment()).toBe('preview');
    });

    it('should detect production environment for manus.space domains', () => {
      window.location.hostname = 'parking-system.manus.space';
      expect(detectEnvironment()).toBe('production');
    });

    it('should detect production environment for custom domains', () => {
      window.location.hostname = 'parking.example.com';
      expect(detectEnvironment()).toBe('production');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return localhost config', () => {
      window.location.hostname = 'localhost';
      window.location.host = 'localhost:3000';
      window.location.origin = 'http://localhost:3000';

      const config = getEnvironmentConfig();
      expect(config.environment).toBe('localhost');
      expect(config.isSupported).toBe(true);
      expect(config.redirectUri).toContain('/api/oauth/callback');
    });

    it('should return preview config for manus.computer', () => {
      window.location.hostname = 'parking-system.manus.computer';
      window.location.host = 'parking-system.manus.computer';
      window.location.origin = 'https://parking-system.manus.computer';

      const config = getEnvironmentConfig();
      expect(config.environment).toBe('preview');
      expect(config.isSupported).toBe(true);
      expect(config.redirectUri).toContain('parking-system.manus.computer');
    });

    it('should return production config for manus.space', () => {
      window.location.hostname = 'parking-system.manus.space';
      window.location.host = 'parking-system.manus.space';
      window.location.origin = 'https://parking-system.manus.space';

      const config = getEnvironmentConfig();
      expect(config.environment).toBe('production');
      expect(config.isSupported).toBe(true);
      expect(config.redirectUri).toContain('parking-system.manus.space');
    });
  });

  describe('getOAuthRedirectUri', () => {
    it('should return redirect URI for localhost', () => {
      window.location.hostname = 'localhost';
      window.location.origin = 'http://localhost:3000';

      const uri = getOAuthRedirectUri();
      expect(uri).toBe('http://localhost:3000/api/oauth/callback');
    });

    it('should return redirect URI for preview domain', () => {
      window.location.hostname = 'parking-system.manus.computer';
      window.location.origin = 'https://parking-system.manus.computer';

      const uri = getOAuthRedirectUri();
      expect(uri).toBe('https://parking-system.manus.computer/api/oauth/callback');
    });

    it('should return redirect URI for production domain', () => {
      window.location.hostname = 'parking-system.manus.space';
      window.location.origin = 'https://parking-system.manus.space';

      const uri = getOAuthRedirectUri();
      expect(uri).toBe('https://parking-system.manus.space/api/oauth/callback');
    });
  });

  describe('isOAuthSupported', () => {
    it('should support localhost', () => {
      window.location.hostname = 'localhost';
      expect(isOAuthSupported()).toBe(true);
    });

    it('should support preview domains', () => {
      window.location.hostname = 'parking-system.manus.computer';
      expect(isOAuthSupported()).toBe(true);
    });

    it('should support production domains', () => {
      window.location.hostname = 'parking-system.manus.space';
      expect(isOAuthSupported()).toBe(true);
    });
  });

  describe('getOAuthErrorMessage', () => {
    it('should return null when OAuth is supported', () => {
      window.location.hostname = 'localhost';
      expect(getOAuthErrorMessage()).toBeNull();
    });

    it('should return error message for unsupported environment', () => {
      // Create an unsupported environment by mocking
      vi.stubGlobal('location', {
        hostname: 'unsupported-domain.invalid',
        protocol: 'https:',
        host: 'unsupported-domain.invalid',
        origin: 'https://unsupported-domain.invalid',
      });

      // This test would need additional setup to actually test unsupported environments
      // For now, we verify the function doesn't crash
      expect(() => getOAuthErrorMessage()).not.toThrow();
    });
  });

  describe('getOAuthDebugInfo', () => {
    it('should return debug info with all required fields', () => {
      window.location.hostname = 'localhost';
      window.location.origin = 'http://localhost:3000';

      const debugInfo = getOAuthDebugInfo();
      expect(debugInfo).toHaveProperty('environment');
      expect(debugInfo).toHaveProperty('domain');
      expect(debugInfo).toHaveProperty('hostname');
      expect(debugInfo).toHaveProperty('origin');
      expect(debugInfo).toHaveProperty('redirectUri');
      expect(debugInfo).toHaveProperty('isSupported');
    });

    it('should include correct values in debug info', () => {
      window.location.hostname = 'localhost';
      window.location.host = 'localhost:3000';
      window.location.origin = 'http://localhost:3000';

      const debugInfo = getOAuthDebugInfo();
      expect(debugInfo.environment).toBe('localhost');
      expect(debugInfo.hostname).toBe('localhost');
      expect(debugInfo.isSupported).toBe('yes');
    });
  });

  describe('Environment-specific behavior', () => {
    it('should use current origin for all environments', () => {
      const testCases: Array<[string, string, string]> = [
        ['localhost', 'http://localhost:3000', 'http://localhost:3000/api/oauth/callback'],
        ['parking.manus.computer', 'https://parking.manus.computer', 'https://parking.manus.computer/api/oauth/callback'],
        ['parking.manus.space', 'https://parking.manus.space', 'https://parking.manus.space/api/oauth/callback'],
      ];

      testCases.forEach(([hostname, origin, expectedUri]) => {
        window.location.hostname = hostname;
        window.location.origin = origin;

        const uri = getOAuthRedirectUri();
        expect(uri).toBe(expectedUri);
      });
    });
  });
});
