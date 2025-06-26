/**
 * Backup and Recovery System
 * Secure data backup, recovery, and disaster recovery for BioTwin360
 */

import { securityManager, EncryptedData } from './AdvancedSecurityManager';

export interface BackupConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: {
    hourly: number; // hours
    daily: number; // days
    weekly: number; // weeks
    monthly: number; // months
  };
  encryption: boolean;
  compression: boolean;
  remoteStorage: boolean;
  verificationEnabled: boolean;
  incrementalBackups: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  type: 'full' | 'incremental' | 'differential';
  size: number; // bytes
  checksum: string;
  encrypted: boolean;
  compressed: boolean;
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'corrupted';
  dataTypes: string[];
  version: string;
  retentionUntil: number;
}

export interface RecoveryPoint {
  id: string;
  timestamp: number;
  description: string;
  backupIds: string[];
  verified: boolean;
  dataIntegrity: number; // percentage
}

export interface DisasterRecoveryPlan {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  rto: number; // Recovery Time Objective (minutes)
  rpo: number; // Recovery Point Objective (minutes)
  steps: {
    id: string;
    description: string;
    automated: boolean;
    estimatedTime: number; // minutes
    dependencies: string[];
  }[];
  lastTested: number;
  testResults: {
    timestamp: number;
    success: boolean;
    duration: number;
    issues: string[];
  }[];
}

class BackupRecoveryManager {
  private config: BackupConfig;
  private backups: BackupMetadata[] = [];
  private recoveryPoints: RecoveryPoint[] = [];
  private drPlans: DisasterRecoveryPlan[] = [];
  private isBackupRunning = false;

  constructor(config: BackupConfig) {
    this.config = config;
    this.initializeBackupScheduler();
    this.initializeDisasterRecoveryPlans();
  }

  /**
   * Initialize backup scheduler
   */
  private initializeBackupScheduler(): void {
    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    setInterval(() => {
      this.performScheduledBackup();
    }, intervals[this.config.frequency]);

    // Cleanup old backups daily
    setInterval(() => {
      this.cleanupOldBackups();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Perform scheduled backup
   */
  private async performScheduledBackup(): Promise<void> {
    if (this.isBackupRunning) {
      console.log('Backup already in progress, skipping scheduled backup');
      return;
    }

    try {
      const backupType = this.determineBackupType();
      await this.createBackup(backupType);
    } catch (error) {
      console.error('Scheduled backup failed:', error);
      securityManager.logSecurityEvent(
        'backup_failed',
        'backup_system',
        false,
        { error: error.message, type: 'scheduled' }
      );
    }
  }

  /**
   * Determine backup type based on schedule and existing backups
   */
  private determineBackupType(): 'full' | 'incremental' | 'differential' {
    if (!this.config.incrementalBackups) {
      return 'full';
    }

    const lastFullBackup = this.backups
      .filter(b => b.type === 'full' && b.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastFullBackup) {
      return 'full';
    }

    // Create full backup weekly, incremental otherwise
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (lastFullBackup.timestamp < weekAgo) {
      return 'full';
    }

    return 'incremental';
  }

  /**
   * Create backup
   */
  public async createBackup(
    type: 'full' | 'incremental' | 'differential' = 'full',
    description?: string
  ): Promise<string> {
    if (this.isBackupRunning) {
      throw new Error('Backup already in progress');
    }

    this.isBackupRunning = true;

    const backupId = this.generateBackupId();
    const timestamp = Date.now();

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      type,
      size: 0,
      checksum: '',
      encrypted: this.config.encryption,
      compressed: this.config.compression,
      location: `backup/${backupId}`,
      status: 'pending',
      dataTypes: ['patient_data', 'analysis_results', 'user_settings', 'audit_logs'],
      version: '1.0.0',
      retentionUntil: this.calculateRetentionDate(timestamp)
    };

    this.backups.push(metadata);

    try {
      // Update status to in_progress
      metadata.status = 'in_progress';

      // Collect data to backup
      const dataToBackup = await this.collectBackupData(type);

      // Compress data if enabled
      let processedData = dataToBackup;
      if (this.config.compression) {
        processedData = await this.compressData(dataToBackup);
      }

      // Encrypt data if enabled
      let finalData = processedData;
      if (this.config.encryption) {
        finalData = this.encryptBackupData(processedData);
      }

      // Calculate checksum
      metadata.checksum = await this.calculateChecksum(finalData);
      metadata.size = this.getDataSize(finalData);

      // Store backup
      await this.storeBackup(backupId, finalData);

      // Verify backup if enabled
      if (this.config.verificationEnabled) {
        const verified = await this.verifyBackup(backupId);
        if (!verified) {
          throw new Error('Backup verification failed');
        }
      }

      // Update status to completed
      metadata.status = 'completed';

      // Create recovery point
      await this.createRecoveryPoint(backupId, description);

      securityManager.logSecurityEvent(
        'backup_created',
        'backup_system',
        true,
        { backupId, type, size: metadata.size }
      );

      return backupId;

    } catch (error) {
      metadata.status = 'failed';
      securityManager.logSecurityEvent(
        'backup_failed',
        'backup_system',
        false,
        { backupId, error: error.message }
      );
      throw error;
    } finally {
      this.isBackupRunning = false;
    }
  }

  /**
   * Collect data for backup
   */
  private async collectBackupData(type: 'full' | 'incremental' | 'differential'): Promise<any> {
    const data: any = {};

    if (type === 'full') {
      // Collect all data
      data.patientData = this.getPatientData();
      data.analysisResults = this.getAnalysisResults();
      data.userSettings = this.getUserSettings();
      data.auditLogs = this.getAuditLogs();
      data.securityData = this.getSecurityData();
    } else {
      // Collect only changed data since last backup
      const lastBackup = this.getLastBackup();
      const since = lastBackup ? lastBackup.timestamp : 0;

      data.patientData = this.getPatientDataSince(since);
      data.analysisResults = this.getAnalysisResultsSince(since);
      data.userSettings = this.getUserSettingsSince(since);
      data.auditLogs = this.getAuditLogsSince(since);
      data.securityData = this.getSecurityDataSince(since);
    }

    return data;
  }

  /**
   * Compress backup data
   */
  private async compressData(data: any): Promise<string> {
    // In a real implementation, this would use a compression library like pako
    const jsonString = JSON.stringify(data);
    // Mock compression - in reality would use gzip/deflate
    return btoa(jsonString); // Base64 encoding as mock compression
  }

  /**
   * Encrypt backup data
   */
  private encryptBackupData(data: string): EncryptedData {
    return securityManager.encryptData(data);
  }

  /**
   * Calculate checksum for data integrity
   */
  private async calculateChecksum(data: any): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get data size in bytes
   */
  private getDataSize(data: any): number {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([dataString]).size;
  }

  /**
   * Store backup data
   */
  private async storeBackup(backupId: string, data: any): Promise<void> {
    // In a real implementation, this would store to cloud storage, local storage, etc.
    const key = `backup_${backupId}`;
    localStorage.setItem(key, JSON.stringify(data));

    // If remote storage is enabled, also upload to cloud
    if (this.config.remoteStorage) {
      await this.uploadToRemoteStorage(backupId, data);
    }
  }

  /**
   * Upload to remote storage
   */
  private async uploadToRemoteStorage(backupId: string, data: any): Promise<void> {
    // Mock implementation - in reality would upload to AWS S3, Azure Blob, etc.
    console.log(`Uploading backup ${backupId} to remote storage...`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Backup ${backupId} uploaded successfully`);
  }

  /**
   * Verify backup integrity
   */
  private async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) return false;

      // Retrieve backup data
      const key = `backup_${backupId}`;
      const storedData = localStorage.getItem(key);
      if (!storedData) return false;

      // Calculate checksum of stored data
      const calculatedChecksum = await this.calculateChecksum(storedData);
      
      // Compare with original checksum
      return calculatedChecksum === backup.checksum;

    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  /**
   * Create recovery point
   */
  private async createRecoveryPoint(backupId: string, description?: string): Promise<void> {
    const recoveryPoint: RecoveryPoint = {
      id: this.generateRecoveryPointId(),
      timestamp: Date.now(),
      description: description || `Recovery point for backup ${backupId}`,
      backupIds: [backupId],
      verified: await this.verifyBackup(backupId),
      dataIntegrity: 100 // Would be calculated based on verification results
    };

    this.recoveryPoints.push(recoveryPoint);
  }

  /**
   * Restore from backup
   */
  public async restoreFromBackup(
    backupId: string,
    options: {
      dataTypes?: string[];
      overwrite?: boolean;
      targetTimestamp?: number;
    } = {}
  ): Promise<boolean> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup || backup.status !== 'completed') {
        throw new Error('Backup not found or not completed');
      }

      // Retrieve backup data
      const key = `backup_${backupId}`;
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        throw new Error('Backup data not found');
      }

      let backupData = JSON.parse(storedData);

      // Decrypt if encrypted
      if (backup.encrypted) {
        const decryptedData = securityManager.decryptData(backupData);
        backupData = JSON.parse(decryptedData);
      }

      // Decompress if compressed
      if (backup.compressed) {
        backupData = this.decompressData(backupData);
      }

      // Verify data integrity
      const calculatedChecksum = await this.calculateChecksum(storedData);
      if (calculatedChecksum !== backup.checksum) {
        throw new Error('Data integrity check failed');
      }

      // Restore data
      await this.restoreData(backupData, options);

      securityManager.logSecurityEvent(
        'backup_restored',
        'backup_system',
        true,
        { backupId, options }
      );

      return true;

    } catch (error) {
      securityManager.logSecurityEvent(
        'backup_restore_failed',
        'backup_system',
        false,
        { backupId, error: error.message }
      );
      throw error;
    }
  }

  /**
   * Decompress backup data
   */
  private decompressData(data: string): any {
    // Mock decompression - reverse of compression
    const jsonString = atob(data);
    return JSON.parse(jsonString);
  }

  /**
   * Restore data to application
   */
  private async restoreData(
    data: any,
    options: {
      dataTypes?: string[];
      overwrite?: boolean;
      targetTimestamp?: number;
    }
  ): Promise<void> {
    const { dataTypes = [], overwrite = false } = options;

    // Restore patient data
    if (dataTypes.length === 0 || dataTypes.includes('patient_data')) {
      await this.restorePatientData(data.patientData, overwrite);
    }

    // Restore analysis results
    if (dataTypes.length === 0 || dataTypes.includes('analysis_results')) {
      await this.restoreAnalysisResults(data.analysisResults, overwrite);
    }

    // Restore user settings
    if (dataTypes.length === 0 || dataTypes.includes('user_settings')) {
      await this.restoreUserSettings(data.userSettings, overwrite);
    }

    // Note: Audit logs and security data typically shouldn't be restored
    // as they represent historical events
  }

  /**
   * Test disaster recovery plan
   */
  public async testDisasterRecoveryPlan(planId: string): Promise<{
    success: boolean;
    duration: number;
    issues: string[];
  }> {
    const plan = this.drPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Disaster recovery plan not found');
    }

    const startTime = Date.now();
    const issues: string[] = [];

    try {
      // Execute each step in the plan
      for (const step of plan.steps) {
        if (step.automated) {
          await this.executeAutomatedStep(step);
        } else {
          // Manual steps would be logged for human execution
          console.log(`Manual step required: ${step.description}`);
        }
      }

      const duration = Date.now() - startTime;
      const success = issues.length === 0;

      // Record test results
      plan.testResults.push({
        timestamp: Date.now(),
        success,
        duration,
        issues
      });

      plan.lastTested = Date.now();

      return { success, duration, issues };

    } catch (error) {
      issues.push(error.message);
      return {
        success: false,
        duration: Date.now() - startTime,
        issues
      };
    }
  }

  /**
   * Execute automated disaster recovery step
   */
  private async executeAutomatedStep(step: any): Promise<void> {
    // Mock implementation of automated recovery steps
    console.log(`Executing automated step: ${step.description}`);
    
    // Simulate step execution time
    await new Promise(resolve => setTimeout(resolve, step.estimatedTime * 100));
  }

  /**
   * Initialize disaster recovery plans
   */
  private initializeDisasterRecoveryPlans(): void {
    const criticalDataRecovery: DisasterRecoveryPlan = {
      id: 'critical_data_recovery',
      name: 'Critical Data Recovery',
      description: 'Restore critical patient data and analysis results',
      priority: 'critical',
      rto: 30, // 30 minutes
      rpo: 60, // 1 hour
      steps: [
        {
          id: 'assess_damage',
          description: 'Assess system damage and data loss',
          automated: true,
          estimatedTime: 5,
          dependencies: []
        },
        {
          id: 'restore_infrastructure',
          description: 'Restore basic infrastructure and services',
          automated: true,
          estimatedTime: 15,
          dependencies: ['assess_damage']
        },
        {
          id: 'restore_patient_data',
          description: 'Restore patient data from latest backup',
          automated: true,
          estimatedTime: 10,
          dependencies: ['restore_infrastructure']
        },
        {
          id: 'verify_data_integrity',
          description: 'Verify restored data integrity',
          automated: true,
          estimatedTime: 5,
          dependencies: ['restore_patient_data']
        },
        {
          id: 'notify_stakeholders',
          description: 'Notify relevant stakeholders of recovery status',
          automated: false,
          estimatedTime: 5,
          dependencies: ['verify_data_integrity']
        }
      ],
      lastTested: 0,
      testResults: []
    };

    this.drPlans.push(criticalDataRecovery);
  }

  // Helper methods for data collection (mock implementations)
  private getPatientData(): any { return {}; }
  private getAnalysisResults(): any { return {}; }
  private getUserSettings(): any { return {}; }
  private getAuditLogs(): any { return {}; }
  private getSecurityData(): any { return {}; }
  
  private getPatientDataSince(timestamp: number): any { return {}; }
  private getAnalysisResultsSince(timestamp: number): any { return {}; }
  private getUserSettingsSince(timestamp: number): any { return {}; }
  private getAuditLogsSince(timestamp: number): any { return {}; }
  private getSecurityDataSince(timestamp: number): any { return {}; }
  
  private async restorePatientData(data: any, overwrite: boolean): Promise<void> {}
  private async restoreAnalysisResults(data: any, overwrite: boolean): Promise<void> {}
  private async restoreUserSettings(data: any, overwrite: boolean): Promise<void> {}

  private getLastBackup(): BackupMetadata | null {
    return this.backups
      .filter(b => b.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecoveryPointId(): string {
    return `rp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateRetentionDate(timestamp: number): number {
    const retention = this.config.retention;
    const frequency = this.config.frequency;
    
    switch (frequency) {
      case 'hourly':
        return timestamp + (retention.hourly * 60 * 60 * 1000);
      case 'daily':
        return timestamp + (retention.daily * 24 * 60 * 60 * 1000);
      case 'weekly':
        return timestamp + (retention.weekly * 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return timestamp + (retention.monthly * 30 * 24 * 60 * 60 * 1000);
      default:
        return timestamp + (30 * 24 * 60 * 60 * 1000); // 30 days default
    }
  }

  private cleanupOldBackups(): void {
    const now = Date.now();
    const expiredBackups = this.backups.filter(b => b.retentionUntil < now);
    
    expiredBackups.forEach(backup => {
      // Remove from storage
      const key = `backup_${backup.id}`;
      localStorage.removeItem(key);
      
      // Remove from backups array
      const index = this.backups.indexOf(backup);
      if (index > -1) {
        this.backups.splice(index, 1);
      }
      
      securityManager.logSecurityEvent(
        'backup_expired',
        'backup_system',
        true,
        { backupId: backup.id }
      );
    });
  }

  /**
   * Get backup status and statistics
   */
  public getBackupStatus(): {
    backups: BackupMetadata[];
    recoveryPoints: RecoveryPoint[];
    drPlans: DisasterRecoveryPlan[];
    statistics: {
      totalBackups: number;
      totalSize: number;
      lastBackup?: number;
      nextBackup?: number;
      successRate: number;
    };
  } {
    const totalBackups = this.backups.length;
    const totalSize = this.backups.reduce((sum, b) => sum + b.size, 0);
    const lastBackup = this.backups
      .filter(b => b.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp;
    
    const successfulBackups = this.backups.filter(b => b.status === 'completed').length;
    const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 100;

    return {
      backups: this.backups,
      recoveryPoints: this.recoveryPoints,
      drPlans: this.drPlans,
      statistics: {
        totalBackups,
        totalSize,
        lastBackup,
        successRate
      }
    };
  }
}

// Default backup configuration
export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  frequency: 'daily',
  retention: {
    hourly: 24, // 24 hours
    daily: 30, // 30 days
    weekly: 12, // 12 weeks
    monthly: 12 // 12 months
  },
  encryption: true,
  compression: true,
  remoteStorage: true,
  verificationEnabled: true,
  incrementalBackups: true
};

// Singleton instance
export const backupManager = new BackupRecoveryManager(DEFAULT_BACKUP_CONFIG);

export default BackupRecoveryManager;

