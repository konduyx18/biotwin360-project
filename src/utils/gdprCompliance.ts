import { PatientData } from '../types/patient';

/**
 * GDPR Compliance utilities for BioTwin360
 */

// Data retention policy (in days)
const DATA_RETENTION_DAYS = 0; // No data storage by default

/**
 * Clear all patient data from local storage and memory
 */
export const clearAllPatientData = (): void => {
  try {
    // Clear localStorage
    localStorage.removeItem('biotwin360_patient_data');
    localStorage.removeItem('biotwin360_analysis_result');
    localStorage.removeItem('biotwin360_session_id');
    
    // Clear sessionStorage
    sessionStorage.removeItem('biotwin360_temp_data');
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('biotwin360')) {
            caches.delete(name);
          }
        });
      });
    }
    
    console.log('All patient data cleared successfully');
  } catch (error) {
    console.error('Error clearing patient data:', error);
  }
};

/**
 * Generate anonymous session ID for analytics (GDPR compliant)
 */
export const generateAnonymousSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `anon_${timestamp}_${random}`;
};

/**
 * Log user action for audit trail (anonymized)
 */
export const logUserAction = (action: string, details?: any): void => {
  const sessionId = generateAnonymousSessionId();
  const logEntry = {
    sessionId,
    action,
    timestamp: new Date().toISOString(),
    details: details ? JSON.stringify(details) : null,
    userAgent: navigator.userAgent,
    language: navigator.language
  };
  
  // In production, this would be sent to a secure logging service
  console.log('User Action Log:', logEntry);
};

/**
 * Encrypt sensitive data before temporary storage (if needed)
 */
export const encryptData = (data: string, key: string): string => {
  // Simple XOR encryption for demonstration
  // In production, use proper encryption like AES-256
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(encrypted);
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

/**
 * Validate data processing consent
 */
export const validateConsent = (): boolean => {
  const consent = localStorage.getItem('biotwin360_gdpr_consent');
  return consent === 'accepted';
};

/**
 * Record consent with timestamp
 */
export const recordConsent = (accepted: boolean): void => {
  const consentRecord = {
    accepted,
    timestamp: new Date().toISOString(),
    version: '1.0',
    ip: 'anonymized', // IP should be anonymized
    userAgent: navigator.userAgent
  };
  
  localStorage.setItem('biotwin360_gdpr_consent', accepted ? 'accepted' : 'declined');
  localStorage.setItem('biotwin360_consent_record', JSON.stringify(consentRecord));
  
  logUserAction('gdpr_consent', { accepted });
};

/**
 * Get data processing information for transparency
 */
export const getDataProcessingInfo = () => {
  return {
    purpose: 'Health risk analysis and personalized recommendations',
    dataTypes: [
      'Age',
      'Sex',
      'Blood pressure',
      'Cholesterol levels',
      'Glucose levels',
      'BMI',
      'Smoking status',
      'Exercise level'
    ],
    processing: 'Local AI analysis only - no data transmission',
    retention: 'No data storage - cleared after session',
    rights: [
      'Right to access your data',
      'Right to rectification',
      'Right to erasure',
      'Right to data portability',
      'Right to object to processing'
    ],
    contact: 'privacy@biotwin360.com',
    dpo: 'dpo@biotwin360.com'
  };
};

/**
 * Generate privacy report for user
 */
export const generatePrivacyReport = (): string => {
  const info = getDataProcessingInfo();
  const consent = localStorage.getItem('biotwin360_consent_record');
  
  return `
BioTwin360 Privacy Report
Generated: ${new Date().toISOString()}

DATA PROCESSING INFORMATION:
Purpose: ${info.purpose}
Data Types: ${info.dataTypes.join(', ')}
Processing Method: ${info.processing}
Data Retention: ${info.retention}

CONSENT RECORD:
${consent ? JSON.stringify(JSON.parse(consent), null, 2) : 'No consent recorded'}

YOUR RIGHTS:
${info.rights.map(right => `- ${right}`).join('\n')}

CONTACT INFORMATION:
Privacy Contact: ${info.contact}
Data Protection Officer: ${info.dpo}

This report confirms that BioTwin360 processes your health data locally on your device only, with no data transmission or storage on external servers.
  `;
};

/**
 * Check if data should be automatically cleared (based on retention policy)
 */
export const checkDataRetention = (): void => {
  const lastActivity = localStorage.getItem('biotwin360_last_activity');
  if (lastActivity) {
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const daysDiff = (now.getTime() - lastActivityDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > DATA_RETENTION_DAYS) {
      clearAllPatientData();
      logUserAction('auto_data_cleanup', { daysSinceLastActivity: daysDiff });
    }
  }
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = (): void => {
  localStorage.setItem('biotwin360_last_activity', new Date().toISOString());
};

/**
 * Initialize GDPR compliance on app start
 */
export const initializeGDPRCompliance = (): void => {
  // Check data retention
  checkDataRetention();
  
  // Update activity
  updateLastActivity();
  
  // Log app initialization
  logUserAction('app_initialized');
  
  // Set up automatic cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (DATA_RETENTION_DAYS === 0) {
      clearAllPatientData();
    }
    logUserAction('app_closed');
  });
};

