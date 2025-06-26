/**
 * Advanced Security Manager Tests
 * Unit tests for security, encryption, and GDPR compliance functionality
 */

import AdvancedSecurityManager, { 
  DEFAULT_SECURITY_CONFIG,
  EncryptedData,
  GDPRConsent,
  AuditLogEntry,
  SecurityAlert
} from '../../security/AdvancedSecurityManager';
import { mockSecurityEvent } from '../setup';

describe('AdvancedSecurityManager', () => {
  let securityManager: AdvancedSecurityManager;

  beforeEach(() => {
    securityManager = new AdvancedSecurityManager(DEFAULT_SECURITY_CONFIG);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(securityManager).toBeDefined();
    });

    test('should generate master encryption key', () => {
      // Test that encryption key is generated (indirectly through encryption test)
      const testData = 'test data';
      const encrypted = securityManager.encryptData(testData);
      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
    });
  });

  describe('Encryption and Decryption', () => {
    test('should encrypt data successfully', () => {
      const testData = 'sensitive patient data';
      const encrypted = securityManager.encryptData(testData);

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-GCM');
      expect(encrypted.timestamp).toBeDefined();
    });

    test('should decrypt data successfully', () => {
      const testData = 'sensitive patient data';
      const encrypted = securityManager.encryptData(testData);
      const decrypted = securityManager.decryptData(encrypted);

      expect(decrypted).toBe(testData);
    });

    test('should encrypt with custom user key', () => {
      const testData = 'user specific data';
      const userKey = 'user-specific-key-123';
      
      const encrypted = securityManager.encryptData(testData, userKey);
      const decrypted = securityManager.decryptData(encrypted, userKey);

      expect(decrypted).toBe(testData);
    });

    test('should fail decryption with wrong key', () => {
      const testData = 'sensitive data';
      const userKey1 = 'key1';
      const userKey2 = 'key2';
      
      const encrypted = securityManager.encryptData(testData, userKey1);
      
      expect(() => {
        securityManager.decryptData(encrypted, userKey2);
      }).toThrow('Decryption failed');
    });

    test('should handle encryption errors', () => {
      const invalidData = null;
      
      expect(() => {
        securityManager.encryptData(invalidData as any);
      }).toThrow('Encryption failed');
    });

    test('should handle decryption errors', () => {
      const invalidEncryptedData: EncryptedData = {
        data: 'invalid',
        iv: 'invalid',
        salt: 'invalid',
        tag: 'invalid',
        algorithm: 'AES-256-GCM',
        timestamp: Date.now(),
      };
      
      expect(() => {
        securityManager.decryptData(invalidEncryptedData);
      }).toThrow('Decryption failed');
    });
  });

  describe('Password Management', () => {
    test('should hash password with salt', () => {
      const password = 'SecurePassword123!';
      const { hash, salt } = securityManager.hashPassword(password);

      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(salt.length).toBeGreaterThan(0);
    });

    test('should verify correct password', () => {
      const password = 'SecurePassword123!';
      const { hash, salt } = securityManager.hashPassword(password);
      
      const isValid = securityManager.verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const { hash, salt } = securityManager.hashPassword(password);
      
      const isValid = securityManager.verifyPassword(wrongPassword, hash, salt);
      expect(isValid).toBe(false);
    });

    test('should validate password policy', () => {
      const validPassword = 'SecurePassword123!';
      const { valid, errors } = securityManager.validatePassword(validPassword);
      
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const weakPassword = '123';
      const { valid, errors } = securityManager.validatePassword(weakPassword);
      
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Password must be at least 12 characters long');
    });

    test('should enforce password complexity', () => {
      const simplePassword = 'simplepassword';
      const { valid, errors } = securityManager.validatePassword(simplePassword);
      
      expect(valid).toBe(false);
      expect(errors).toContain('Password must contain at least one uppercase letter');
      expect(errors).toContain('Password must contain at least one number');
      expect(errors).toContain('Password must contain at least one special character');
    });
  });

  describe('Session Management', () => {
    test('should generate session token', () => {
      const userId = 'user123';
      const token = securityManager.generateSessionToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should validate valid session token', () => {
      const userId = 'user123';
      const token = securityManager.generateSessionToken(userId);
      
      const validation = securityManager.validateSessionToken(token);
      
      expect(validation.valid).toBe(true);
      expect(validation.userId).toBe(userId);
    });

    test('should reject invalid session token', () => {
      const invalidToken = 'invalid-token';
      
      const validation = securityManager.validateSessionToken(invalidToken);
      
      expect(validation.valid).toBe(false);
      expect(validation.userId).toBeUndefined();
    });

    test('should handle expired session tokens', async () => {
      // Mock short session timeout for testing
      const shortTimeoutConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        sessionTimeout: 0.001, // 0.001 minutes = 0.06 seconds
      };
      
      const shortTimeoutManager = new AdvancedSecurityManager(shortTimeoutConfig);
      const userId = 'user123';
      const token = shortTimeoutManager.generateSessionToken(userId);
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const validation = shortTimeoutManager.validateSessionToken(token);
      expect(validation.valid).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    test('should log security events', () => {
      const action = 'login_attempt';
      const resource = 'authentication';
      const success = true;
      const userId = 'user123';
      const ipAddress = '192.168.1.1';

      securityManager.logSecurityEvent(action, resource, success, {}, userId, ipAddress);

      const dashboard = securityManager.getSecurityDashboard();
      const auditLog = dashboard.auditLog;

      expect(auditLog.length).toBeGreaterThan(0);
      
      const lastEvent = auditLog[auditLog.length - 1];
      expect(lastEvent.action).toBe(action);
      expect(lastEvent.resource).toBe(resource);
      expect(lastEvent.success).toBe(success);
      expect(lastEvent.userId).toBe(userId);
      expect(lastEvent.ipAddress).toBe(ipAddress);
    });

    test('should assess risk levels correctly', () => {
      // Test different risk scenarios
      securityManager.logSecurityEvent('login_failed', 'authentication', false);
      securityManager.logSecurityEvent('data_access', 'patient_data', true, { unusualLocation: true });
      securityManager.logSecurityEvent('encryption_failed', 'data_protection', false);

      const dashboard = securityManager.getSecurityDashboard();
      const auditLog = dashboard.auditLog;

      expect(auditLog.some(event => event.riskLevel === 'medium')).toBe(true);
      expect(auditLog.some(event => event.riskLevel === 'high')).toBe(true);
      expect(auditLog.some(event => event.riskLevel === 'critical')).toBe(true);
    });

    test('should create security alerts for high-risk events', () => {
      securityManager.logSecurityEvent('unauthorized_access', 'patient_data', false, {
        attemptCount: 10
      });

      const dashboard = securityManager.getSecurityDashboard();
      const alerts = dashboard.securityAlerts;

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.severity === 'high')).toBe(true);
    });

    test('should resolve security alerts', () => {
      // Create a high-risk event to generate an alert
      securityManager.logSecurityEvent('suspicious_activity', 'system', false);

      const dashboard = securityManager.getSecurityDashboard();
      const alerts = dashboard.securityAlerts;
      
      expect(alerts.length).toBeGreaterThan(0);
      
      const alertId = alerts[0].id;
      const resolved = securityManager.resolveSecurityAlert(alertId, 'admin');
      
      expect(resolved).toBe(true);
      
      const updatedDashboard = securityManager.getSecurityDashboard();
      const resolvedAlert = updatedDashboard.securityAlerts.find(a => a.id === alertId);
      
      expect(resolvedAlert?.resolved).toBe(true);
      expect(resolvedAlert?.resolvedBy).toBe('admin');
    });
  });

  describe('GDPR Compliance', () => {
    test('should record GDPR consent', () => {
      const userId = 'user123';
      const purposes = {
        analytics: true,
        marketing: false,
        research: true,
        sharing: false,
        storage: true,
      };

      const consentId = securityManager.recordGDPRConsent(userId, purposes);

      expect(consentId).toBeDefined();
      expect(typeof consentId).toBe('string');
    });

    test('should check valid consent for purposes', () => {
      const userId = 'user123';
      const purposes = {
        analytics: true,
        marketing: false,
        research: true,
        sharing: false,
        storage: true,
      };

      securityManager.recordGDPRConsent(userId, purposes);

      expect(securityManager.hasValidConsent(userId, 'analytics')).toBe(true);
      expect(securityManager.hasValidConsent(userId, 'marketing')).toBe(false);
      expect(securityManager.hasValidConsent(userId, 'research')).toBe(true);
    });

    test('should withdraw GDPR consent', () => {
      const userId = 'user123';
      const purposes = {
        analytics: true,
        marketing: true,
        research: true,
        sharing: true,
        storage: true,
      };

      const consentId = securityManager.recordGDPRConsent(userId, purposes);
      const withdrawn = securityManager.withdrawGDPRConsent(userId, consentId);

      expect(withdrawn).toBe(true);
      
      // After withdrawal, consent should be invalid
      expect(securityManager.hasValidConsent(userId, 'analytics')).toBe(false);
    });

    test('should handle consent for non-existent user', () => {
      const nonExistentUser = 'nonexistent';
      
      expect(securityManager.hasValidConsent(nonExistentUser, 'analytics')).toBe(false);
    });

    test('should secure data deletion (right to be forgotten)', () => {
      const userId = 'user123';
      
      // First record some consent
      securityManager.recordGDPRConsent(userId, {
        analytics: true,
        marketing: true,
        research: true,
        sharing: true,
        storage: true,
      });

      const deleted = securityManager.secureDataDeletion(userId);
      expect(deleted).toBe(true);
    });
  });

  describe('Security Dashboard', () => {
    test('should provide security dashboard data', () => {
      // Generate some test data
      securityManager.logSecurityEvent('login_success', 'authentication', true, {}, 'user1');
      securityManager.logSecurityEvent('data_access', 'patient_data', true, {}, 'user2');
      securityManager.recordGDPRConsent('user1', {
        analytics: true,
        marketing: false,
        research: true,
        sharing: false,
        storage: true,
      });

      const dashboard = securityManager.getSecurityDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.auditLog).toBeDefined();
      expect(dashboard.securityAlerts).toBeDefined();
      expect(dashboard.activeSessions).toBeDefined();
      expect(dashboard.gdprConsents).toBeDefined();
      
      expect(dashboard.auditLog.length).toBeGreaterThan(0);
      expect(dashboard.gdprConsents.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Log Export', () => {
    test('should export audit log', () => {
      // Generate test events
      securityManager.logSecurityEvent('test_event_1', 'test_resource', true);
      securityManager.logSecurityEvent('test_event_2', 'test_resource', false);

      const exportedLog = securityManager.exportAuditLog();

      expect(exportedLog).toBeDefined();
      expect(Array.isArray(exportedLog)).toBe(true);
      expect(exportedLog.length).toBeGreaterThan(0);
    });

    test('should export audit log with date range', () => {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);

      // Generate events
      securityManager.logSecurityEvent('old_event', 'test', true);
      securityManager.logSecurityEvent('recent_event', 'test', true);

      const recentLog = securityManager.exportAuditLog(oneDayAgo, now);
      const allLog = securityManager.exportAuditLog(twoDaysAgo, now);

      expect(recentLog.length).toBeLessThanOrEqual(allLog.length);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed encrypted data', () => {
      const malformedData: EncryptedData = {
        data: 'not-valid-encrypted-data',
        iv: 'invalid-iv',
        salt: 'invalid-salt',
        tag: 'invalid-tag',
        algorithm: 'AES-256-GCM',
        timestamp: Date.now(),
      };

      expect(() => {
        securityManager.decryptData(malformedData);
      }).toThrow('Decryption failed');
    });

    test('should handle invalid session token format', () => {
      const invalidTokens = ['', 'invalid', null, undefined, 123];

      invalidTokens.forEach(token => {
        const validation = securityManager.validateSessionToken(token as any);
        expect(validation.valid).toBe(false);
      });
    });

    test('should handle security event logging errors', () => {
      // Test with invalid parameters
      expect(() => {
        securityManager.logSecurityEvent('', '', true);
      }).not.toThrow(); // Should handle gracefully
    });
  });

  describe('Performance', () => {
    test('should handle multiple concurrent encryptions', async () => {
      const testData = 'test data for concurrent encryption';
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(securityManager.encryptData(testData))
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
      });
    });

    test('should handle large data encryption', () => {
      const largeData = 'x'.repeat(10000); // 10KB of data
      
      const start = performance.now();
      const encrypted = securityManager.encryptData(largeData);
      const decrypted = securityManager.decryptData(encrypted);
      const end = performance.now();

      expect(decrypted).toBe(largeData);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should maintain performance with many audit log entries', () => {
      // Generate many audit log entries
      for (let i = 0; i < 1000; i++) {
        securityManager.logSecurityEvent(`test_event_${i}`, 'performance_test', true);
      }

      const start = performance.now();
      const dashboard = securityManager.getSecurityDashboard();
      const end = performance.now();

      expect(dashboard.auditLog).toBeDefined();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });
});

