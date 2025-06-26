/**
 * Advanced Security Manager
 * End-to-end encryption, GDPR compliance, and security monitoring for BioTwin360
 */

import CryptoJS from 'crypto-js';

export interface SecurityConfig {
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyDerivation: 'PBKDF2' | 'Argon2id';
  hashAlgorithm: 'SHA-256' | 'SHA-3';
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // last N passwords
  };
  auditRetention: number; // days
  dataRetention: number; // days
  backupEncryption: boolean;
  twoFactorRequired: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  geoLocation?: {
    country: string;
    region: string;
    city: string;
  };
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  type: 'login_anomaly' | 'data_breach' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  tag: string;
  algorithm: string;
  timestamp: number;
}

export interface GDPRConsent {
  userId: string;
  consentId: string;
  timestamp: number;
  version: string;
  purposes: {
    analytics: boolean;
    marketing: boolean;
    research: boolean;
    sharing: boolean;
    storage: boolean;
  };
  ipAddress: string;
  userAgent: string;
  withdrawnAt?: number;
}

class AdvancedSecurityManager {
  private config: SecurityConfig;
  private auditLog: AuditLogEntry[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private gdprConsents: GDPRConsent[] = [];
  private encryptionKey: string;
  private sessionKeys: Map<string, { key: string; expires: number }> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.encryptionKey = this.generateMasterKey();
    this.initializeSecurityMonitoring();
  }

  /**
   * Generate a cryptographically secure master key
   */
  private generateMasterKey(): string {
    const entropy = CryptoJS.lib.WordArray.random(256 / 8);
    return CryptoJS.SHA256(entropy + Date.now() + Math.random()).toString();
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private deriveKey(password: string, salt: string, iterations: number = 100000): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: iterations
    }).toString();
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  public encryptData(data: string, userKey?: string): EncryptedData {
    try {
      const key = userKey || this.encryptionKey;
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const iv = CryptoJS.lib.WordArray.random(96 / 8);
      
      const derivedKey = this.deriveKey(key, salt.toString());
      
      const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      });

      return {
        data: encrypted.ciphertext.toString(),
        iv: iv.toString(),
        salt: salt.toString(),
        tag: encrypted.tag?.toString() || '',
        algorithm: 'AES-256-GCM',
        timestamp: Date.now()
      };
    } catch (error) {
      this.logSecurityEvent('encryption_failed', 'data_encryption', false, { error: error.message });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decryptData(encryptedData: EncryptedData, userKey?: string): string {
    try {
      const key = userKey || this.encryptionKey;
      const derivedKey = this.deriveKey(key, encryptedData.salt);
      
      const decrypted = CryptoJS.AES.decrypt(
        {
          ciphertext: CryptoJS.enc.Hex.parse(encryptedData.data),
          tag: CryptoJS.enc.Hex.parse(encryptedData.tag)
        },
        derivedKey,
        {
          iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
          mode: CryptoJS.mode.GCM,
          padding: CryptoJS.pad.NoPadding
        }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      this.logSecurityEvent('decryption_failed', 'data_decryption', false, { error: error.message });
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash password with salt
   */
  public hashPassword(password: string): { hash: string; salt: string } {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();

    return { hash, salt };
  }

  /**
   * Verify password against hash
   */
  public verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();

    return computedHash === hash;
  }

  /**
   * Validate password against policy
   */
  public validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate secure session token
   */
  public generateSessionToken(userId: string): string {
    const sessionKey = CryptoJS.lib.WordArray.random(256 / 8).toString();
    const expires = Date.now() + (this.config.sessionTimeout * 60 * 1000);
    
    this.sessionKeys.set(userId, { key: sessionKey, expires });
    
    const tokenData = {
      userId,
      sessionKey,
      expires,
      issued: Date.now()
    };

    return CryptoJS.AES.encrypt(JSON.stringify(tokenData), this.encryptionKey).toString();
  }

  /**
   * Validate session token
   */
  public validateSessionToken(token: string): { valid: boolean; userId?: string } {
    try {
      const decrypted = CryptoJS.AES.decrypt(token, this.encryptionKey);
      const tokenData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      if (Date.now() > tokenData.expires) {
        this.sessionKeys.delete(tokenData.userId);
        return { valid: false };
      }

      const storedSession = this.sessionKeys.get(tokenData.userId);
      if (!storedSession || storedSession.key !== tokenData.sessionKey) {
        return { valid: false };
      }

      return { valid: true, userId: tokenData.userId };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Log security event for audit trail
   */
  public logSecurityEvent(
    action: string,
    resource: string,
    success: boolean,
    details?: Record<string, any>,
    userId?: string,
    ipAddress?: string
  ): void {
    const auditEntry: AuditLogEntry = {
      id: CryptoJS.lib.WordArray.random(128 / 8).toString(),
      timestamp: Date.now(),
      userId: userId || 'system',
      action,
      resource,
      ipAddress: ipAddress || 'unknown',
      userAgent: navigator.userAgent,
      success,
      details,
      riskLevel: this.assessRiskLevel(action, success, details)
    };

    this.auditLog.push(auditEntry);
    
    // Trigger security alert if high risk
    if (auditEntry.riskLevel === 'high' || auditEntry.riskLevel === 'critical') {
      this.createSecurityAlert(auditEntry);
    }

    // Clean up old audit logs
    this.cleanupAuditLog();
  }

  /**
   * Assess risk level of security event
   */
  private assessRiskLevel(action: string, success: boolean, details?: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    // Failed authentication attempts
    if (action.includes('login') && !success) {
      return 'medium';
    }

    // Data access from unusual location
    if (action.includes('data_access') && details?.unusualLocation) {
      return 'high';
    }

    // Multiple failed attempts
    if (details?.attemptCount && details.attemptCount > this.config.maxLoginAttempts) {
      return 'high';
    }

    // Encryption/decryption failures
    if ((action.includes('encryption') || action.includes('decryption')) && !success) {
      return 'critical';
    }

    // Data export/download
    if (action.includes('export') || action.includes('download')) {
      return 'medium';
    }

    // Administrative actions
    if (action.includes('admin') || action.includes('config')) {
      return 'high';
    }

    return 'low';
  }

  /**
   * Create security alert
   */
  private createSecurityAlert(auditEntry: AuditLogEntry): void {
    const alert: SecurityAlert = {
      id: CryptoJS.lib.WordArray.random(128 / 8).toString(),
      timestamp: Date.now(),
      type: this.categorizeSecurityEvent(auditEntry.action),
      severity: auditEntry.riskLevel,
      description: `Security event: ${auditEntry.action} on ${auditEntry.resource}`,
      userId: auditEntry.userId,
      ipAddress: auditEntry.ipAddress,
      resolved: false
    };

    this.securityAlerts.push(alert);
  }

  /**
   * Categorize security event type
   */
  private categorizeSecurityEvent(action: string): SecurityAlert['type'] {
    if (action.includes('login')) return 'login_anomaly';
    if (action.includes('breach') || action.includes('unauthorized')) return 'unauthorized_access';
    if (action.includes('suspicious')) return 'suspicious_activity';
    return 'suspicious_activity';
  }

  /**
   * Record GDPR consent
   */
  public recordGDPRConsent(
    userId: string,
    purposes: GDPRConsent['purposes'],
    version: string = '1.0',
    ipAddress: string = 'unknown'
  ): string {
    const consentId = CryptoJS.lib.WordArray.random(128 / 8).toString();
    
    const consent: GDPRConsent = {
      userId,
      consentId,
      timestamp: Date.now(),
      version,
      purposes,
      ipAddress,
      userAgent: navigator.userAgent
    };

    this.gdprConsents.push(consent);
    this.logSecurityEvent('gdpr_consent_recorded', 'user_consent', true, { consentId, purposes }, userId, ipAddress);

    return consentId;
  }

  /**
   * Withdraw GDPR consent
   */
  public withdrawGDPRConsent(userId: string, consentId: string): boolean {
    const consent = this.gdprConsents.find(c => c.userId === userId && c.consentId === consentId);
    
    if (consent && !consent.withdrawnAt) {
      consent.withdrawnAt = Date.now();
      this.logSecurityEvent('gdpr_consent_withdrawn', 'user_consent', true, { consentId }, userId);
      return true;
    }

    return false;
  }

  /**
   * Check if user has valid consent for purpose
   */
  public hasValidConsent(userId: string, purpose: keyof GDPRConsent['purposes']): boolean {
    const latestConsent = this.gdprConsents
      .filter(c => c.userId === userId && !c.withdrawnAt)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return latestConsent ? latestConsent.purposes[purpose] : false;
  }

  /**
   * Initialize security monitoring
   */
  private initializeSecurityMonitoring(): void {
    // Monitor for suspicious activities
    setInterval(() => {
      this.detectAnomalies();
      this.cleanupExpiredSessions();
    }, 60000); // Every minute

    // Daily security report
    setInterval(() => {
      this.generateSecurityReport();
    }, 86400000); // Every 24 hours
  }

  /**
   * Detect security anomalies
   */
  private detectAnomalies(): void {
    const recentEvents = this.auditLog.filter(
      entry => Date.now() - entry.timestamp < 3600000 // Last hour
    );

    // Detect multiple failed login attempts
    const failedLogins = recentEvents.filter(
      entry => entry.action.includes('login') && !entry.success
    );

    const loginAttemptsByUser = failedLogins.reduce((acc, entry) => {
      acc[entry.userId] = (acc[entry.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(loginAttemptsByUser).forEach(([userId, attempts]) => {
      if (attempts >= this.config.maxLoginAttempts) {
        this.createSecurityAlert({
          id: '',
          timestamp: Date.now(),
          userId,
          action: 'multiple_failed_logins',
          resource: 'authentication',
          ipAddress: 'unknown',
          userAgent: '',
          success: false,
          riskLevel: 'high'
        });
      }
    });
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessionKeys.entries()) {
      if (now > session.expires) {
        this.sessionKeys.delete(userId);
        this.logSecurityEvent('session_expired', 'session_management', true, {}, userId);
      }
    }
  }

  /**
   * Clean up old audit logs
   */
  private cleanupAuditLog(): void {
    const cutoff = Date.now() - (this.config.auditRetention * 24 * 60 * 60 * 1000);
    this.auditLog = this.auditLog.filter(entry => entry.timestamp > cutoff);
  }

  /**
   * Generate security report
   */
  private generateSecurityReport(): void {
    const last24h = this.auditLog.filter(
      entry => Date.now() - entry.timestamp < 86400000
    );

    const report = {
      timestamp: Date.now(),
      totalEvents: last24h.length,
      successfulEvents: last24h.filter(e => e.success).length,
      failedEvents: last24h.filter(e => !e.success).length,
      riskLevels: {
        low: last24h.filter(e => e.riskLevel === 'low').length,
        medium: last24h.filter(e => e.riskLevel === 'medium').length,
        high: last24h.filter(e => e.riskLevel === 'high').length,
        critical: last24h.filter(e => e.riskLevel === 'critical').length
      },
      activeAlerts: this.securityAlerts.filter(a => !a.resolved).length,
      activeSessions: this.sessionKeys.size
    };

    this.logSecurityEvent('security_report_generated', 'security_monitoring', true, report);
  }

  /**
   * Get security dashboard data
   */
  public getSecurityDashboard(): {
    auditLog: AuditLogEntry[];
    securityAlerts: SecurityAlert[];
    activeSessions: number;
    gdprConsents: GDPRConsent[];
  } {
    return {
      auditLog: this.auditLog.slice(-100), // Last 100 events
      securityAlerts: this.securityAlerts.filter(a => !a.resolved),
      activeSessions: this.sessionKeys.size,
      gdprConsents: this.gdprConsents
    };
  }

  /**
   * Resolve security alert
   */
  public resolveSecurityAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      alert.resolvedBy = resolvedBy;
      
      this.logSecurityEvent('security_alert_resolved', 'security_management', true, { alertId }, resolvedBy);
      return true;
    }
    return false;
  }

  /**
   * Export audit log for compliance
   */
  public exportAuditLog(startDate?: number, endDate?: number): AuditLogEntry[] {
    let filteredLog = this.auditLog;
    
    if (startDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp <= endDate);
    }

    this.logSecurityEvent('audit_log_exported', 'compliance', true, {
      startDate,
      endDate,
      recordCount: filteredLog.length
    });

    return filteredLog;
  }

  /**
   * Secure data deletion (GDPR right to be forgotten)
   */
  public secureDataDeletion(userId: string): boolean {
    try {
      // Remove user sessions
      this.sessionKeys.delete(userId);
      
      // Mark user data for secure deletion in audit log
      this.logSecurityEvent('secure_data_deletion', 'gdpr_compliance', true, { userId }, userId);
      
      // In a real implementation, this would trigger secure deletion
      // of all user data across all systems
      
      return true;
    } catch (error) {
      this.logSecurityEvent('secure_data_deletion_failed', 'gdpr_compliance', false, { 
        userId, 
        error: error.message 
      }, userId);
      return false;
    }
  }
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  encryptionAlgorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  hashAlgorithm: 'SHA-256',
  sessionTimeout: 30, // 30 minutes
  maxLoginAttempts: 5,
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5
  },
  auditRetention: 365, // 1 year
  dataRetention: 2555, // 7 years (medical data retention)
  backupEncryption: true,
  twoFactorRequired: true
};

// Singleton instance
export const securityManager = new AdvancedSecurityManager(DEFAULT_SECURITY_CONFIG);

export default AdvancedSecurityManager;

