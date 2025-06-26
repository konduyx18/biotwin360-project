/**
 * Security utilities for BioTwin360
 */

/**
 * Input sanitization to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate medical input values
 */
export const validateMedicalInput = (value: number, min: number, max: number): boolean => {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value) && 
         value >= min && 
         value <= max;
};

/**
 * Validate patient data structure
 */
export const validatePatientData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;

  const requiredFields = ['age', 'sex', 'bloodPressure', 'cholesterol', 'glucose'];
  const hasRequiredFields = requiredFields.every(field => field in data);
  
  if (!hasRequiredFields) return false;

  // Validate specific fields
  const validations = [
    validateMedicalInput(data.age, 1, 120),
    ['male', 'female'].includes(data.sex),
    data.bloodPressure && 
      validateMedicalInput(data.bloodPressure.systolic, 70, 250) &&
      validateMedicalInput(data.bloodPressure.diastolic, 40, 150),
    validateMedicalInput(data.cholesterol, 100, 500),
    validateMedicalInput(data.glucose, 50, 400)
  ];

  return validations.every(Boolean);
};

/**
 * Rate limiting for API calls
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Content Security Policy headers (for server-side implementation)
 */
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.biotwin360.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

/**
 * Secure random string generation
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data (for logging without exposing actual values)
 */
export const hashSensitiveData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure session management
 */
export class SecureSession {
  private static readonly SESSION_KEY = 'biotwin360_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static createSession(): string {
    const sessionId = generateSecureRandomString();
    const session = {
      id: sessionId,
      created: Date.now(),
      lastActivity: Date.now()
    };
    
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return sessionId;
  }

  static validateSession(): boolean {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session has expired
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.destroySession();
        return false;
      }

      // Update last activity
      session.lastActivity = now;
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      this.destroySession();
      return false;
    }
  }

  static destroySession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  static getSessionId(): string | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      return session.id;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Audit logging for security events
 */
export const logSecurityEvent = (event: string, details?: any): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    sessionId: SecureSession.getSessionId(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    details: details ? JSON.stringify(details) : null
  };

  // In production, this would be sent to a secure logging service
  console.log('Security Event:', logEntry);
};

/**
 * Detect and prevent common attacks
 */
export const detectSuspiciousActivity = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /alert\(/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input));
  
  if (isSuspicious) {
    logSecurityEvent('suspicious_input_detected', { input: input.substring(0, 100) });
  }
  
  return isSuspicious;
};

/**
 * Initialize security measures
 */
export const initializeSecurity = (): void => {
  // Create secure session
  if (!SecureSession.validateSession()) {
    SecureSession.createSession();
  }

  // Set up security event listeners
  window.addEventListener('error', (event) => {
    logSecurityEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
  });

  // Monitor for suspicious activity
  document.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      if (detectSuspiciousActivity(target.value)) {
        target.value = sanitizeInput(target.value);
      }
    }
  });

  // Log security initialization
  logSecurityEvent('security_initialized');
};

