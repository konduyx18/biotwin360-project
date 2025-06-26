/**
 * BioTwin360 Core Engine v2.0
 * Advanced Digital Twin Engine for Multi-Organ Health Simulation
 * 
 * This is the enhanced core engine that orchestrates all organ modules,
 * manages data flow, coordinates AI predictions, implements caching,
 * and provides real-time performance monitoring across the entire
 * digital twin ecosystem.
 * 
 * Features:
 * - Multi-organ orchestration with dependency management
 * - Intelligent caching system for performance optimization
 * - Real-time performance monitoring and analytics
 * - Advanced error handling and recovery mechanisms
 * - Scalable architecture for production deployment
 */

import { OrganModule, HealthData, PredictionResult, DigitalTwinState } from '../types/core';
import { EventEmitter } from 'events';

export interface EngineConfig {
  maxConcurrentAnalyses: number;
  predictionTimeout: number;
  cacheEnabled: boolean;
  cacheMaxSize: number;
  cacheTTL: number;
  debugMode: boolean;
  performanceMonitoring: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface CacheEntry {
  data: PredictionResult[];
  timestamp: number;
  hash: string;
  accessCount: number;
}

export interface PerformanceMetrics {
  totalAnalyses: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  errorRate: number;
  modulePerformance: Map<string, {
    averageTime: number;
    successRate: number;
    totalCalls: number;
  }>;
}

export class DigitalTwinEngine extends EventEmitter {
  private modules: Map<string, OrganModule> = new Map();
  private state: DigitalTwinState = {
    isAnalyzing: false,
    lastUpdate: null,
    activeModules: [],
    globalRiskScore: 0,
    confidence: 0
  };
  private config: EngineConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: PerformanceMetrics = {
    totalAnalyses: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    modulePerformance: new Map()
  };
  private analysisQueue: Array<{
    id: string;
    healthData: HealthData;
    resolve: (results: PredictionResult[]) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private isProcessingQueue = false;

  constructor(config: Partial<EngineConfig> = {}) {
    super();
    this.config = {
      maxConcurrentAnalyses: 5,
      predictionTimeout: 30000,
      cacheEnabled: true,
      cacheMaxSize: 1000,
      cacheTTL: 300000, // 5 minutes
      debugMode: false,
      performanceMonitoring: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Initialize cache cleanup interval
    if (this.config.cacheEnabled) {
      setInterval(() => this.cleanupCache(), 60000); // Cleanup every minute
    }

    // Initialize performance monitoring
    if (this.config.performanceMonitoring) {
      setInterval(() => this.updateMetrics(), 30000); // Update metrics every 30 seconds
    }
  }

  /**
   * Generate cache key for health data
   */
  private generateCacheKey(healthData: HealthData): string {
    const dataString = JSON.stringify(healthData, Object.keys(healthData).sort());
    return btoa(dataString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * Check cache for existing analysis results
   */
  private getCachedResult(healthData: HealthData): PredictionResult[] | null {
    if (!this.config.cacheEnabled) return null;

    const cacheKey = this.generateCacheKey(healthData);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update access count and return cached data
    entry.accessCount++;
    this.emit('cacheHit', { cacheKey, accessCount: entry.accessCount });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Cache hit for key: ${cacheKey}`);
    }

    return entry.data;
  }

  /**
   * Store analysis results in cache
   */
  private setCachedResult(healthData: HealthData, results: PredictionResult[]): void {
    if (!this.config.cacheEnabled) return;

    const cacheKey = this.generateCacheKey(healthData);
    
    // Check cache size limit
    if (this.cache.size >= this.config.cacheMaxSize) {
      // Remove oldest entries (LRU-like behavior)
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    const entry: CacheEntry = {
      data: results,
      timestamp: Date.now(),
      hash: cacheKey,
      accessCount: 1
    };

    this.cache.set(cacheKey, entry);
    this.emit('cacheSet', { cacheKey, dataSize: JSON.stringify(results).length });

    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Cached result for key: ${cacheKey}`);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    if (!this.config.cacheEnabled) return;

    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.cacheTTL) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.emit('cacheCleanup', { cleanedEntries: cleanedCount, remainingEntries: this.cache.size });
      
      if (this.config.debugMode) {
        console.log(`[DigitalTwinEngine] Cleaned ${cleanedCount} expired cache entries`);
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    if (!this.config.performanceMonitoring) return;

    // Calculate cache hit rate
    const totalCacheAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    this.metrics.cacheHitRate = totalCacheAccesses > 0 
      ? (this.cache.size / totalCacheAccesses) * 100 
      : 0;

    this.emit('metricsUpdated', { metrics: this.metrics });

    if (this.config.debugMode) {
      console.log('[DigitalTwinEngine] Metrics updated:', this.metrics);
    }
  }

  /**
   * Process analysis queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.analysisQueue.length === 0) return;

    this.isProcessingQueue = true;
    const concurrentLimit = this.config.maxConcurrentAnalyses;
    const processing: Promise<void>[] = [];

    while (this.analysisQueue.length > 0 && processing.length < concurrentLimit) {
      const queueItem = this.analysisQueue.shift();
      if (!queueItem) break;

      const processPromise = this.executeAnalysis(queueItem)
        .finally(() => {
          const index = processing.indexOf(processPromise);
          if (index > -1) processing.splice(index, 1);
        });

      processing.push(processPromise);
    }

    await Promise.all(processing);
    this.isProcessingQueue = false;

    // Continue processing if there are more items in queue
    if (this.analysisQueue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Execute individual analysis with retry logic
   */
  private async executeAnalysis(queueItem: {
    id: string;
    healthData: HealthData;
    resolve: (results: PredictionResult[]) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }): Promise<void> {
    const { id, healthData, resolve, reject } = queueItem;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const results = await this.performAnalysis(healthData);
        resolve(results);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
          
          if (this.config.debugMode) {
            console.log(`[DigitalTwinEngine] Retry attempt ${attempt} for analysis ${id}`);
          }
        }
      }
    }

    reject(lastError || new Error('Analysis failed after all retry attempts'));
  }

  /**
   * Perform the actual health analysis
   */
  private async performAnalysis(healthData: HealthData): Promise<PredictionResult[]> {
    const startTime = Date.now();

    try {
      const analysisPromises = Array.from(this.modules.values()).map(async (module) => {
        const moduleStartTime = Date.now();
        
        try {
          const result = await Promise.race([
            module.analyze(healthData),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Module analysis timeout')), this.config.predictionTimeout)
            )
          ]);

          const duration = Date.now() - moduleStartTime;
          
          // Update module performance metrics
          if (this.config.performanceMonitoring) {
            const moduleMetrics = this.metrics.modulePerformance.get(module.id) || {
              averageTime: 0,
              successRate: 0,
              totalCalls: 0
            };

            moduleMetrics.totalCalls++;
            moduleMetrics.averageTime = (moduleMetrics.averageTime * (moduleMetrics.totalCalls - 1) + duration) / moduleMetrics.totalCalls;
            moduleMetrics.successRate = ((moduleMetrics.successRate * (moduleMetrics.totalCalls - 1)) + 100) / moduleMetrics.totalCalls;
            
            this.metrics.modulePerformance.set(module.id, moduleMetrics);
          }

          this.emit('moduleAnalysisComplete', {
            moduleId: module.id,
            duration,
            success: true
          });

          return {
            ...result,
            moduleId: module.id,
            timestamp: Date.now(),
            processingTime: duration
          };
        } catch (error) {
          const duration = Date.now() - moduleStartTime;
          
          // Update module performance metrics for failure
          if (this.config.performanceMonitoring) {
            const moduleMetrics = this.metrics.modulePerformance.get(module.id) || {
              averageTime: 0,
              successRate: 0,
              totalCalls: 0
            };

            moduleMetrics.totalCalls++;
            moduleMetrics.averageTime = (moduleMetrics.averageTime * (moduleMetrics.totalCalls - 1) + duration) / moduleMetrics.totalCalls;
            moduleMetrics.successRate = (moduleMetrics.successRate * (moduleMetrics.totalCalls - 1)) / moduleMetrics.totalCalls;
            
            this.metrics.modulePerformance.set(module.id, moduleMetrics);
          }
          
          this.emit('moduleAnalysisError', {
            moduleId: module.id,
            error: (error as Error).message,
            duration
          });

          // Return fallback result for failed module
          return {
            moduleId: module.id,
            riskScore: 0,
            confidence: 0,
            recommendations: [],
            riskFactors: [],
            timestamp: Date.now(),
            processingTime: duration,
            error: (error as Error).message
          };
        }
      });

      const results = await Promise.all(analysisPromises);
      
      // Calculate global risk score and confidence
      const validResults = results.filter(r => !r.error);
      const globalRiskScore = validResults.length > 0 
        ? validResults.reduce((sum, r) => sum + r.riskScore, 0) / validResults.length
        : 0;
      
      const globalConfidence = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
        : 0;

      this.state.globalRiskScore = globalRiskScore;
      this.state.confidence = globalConfidence;
      this.state.lastUpdate = Date.now();

      // Update global performance metrics
      if (this.config.performanceMonitoring) {
        const totalTime = Date.now() - startTime;
        this.metrics.totalAnalyses++;
        this.metrics.averageProcessingTime = (this.metrics.averageProcessingTime * (this.metrics.totalAnalyses - 1) + totalTime) / this.metrics.totalAnalyses;
        
        const errorCount = results.filter(r => r.error).length;
        this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalAnalyses - 1) + (errorCount / results.length * 100)) / this.metrics.totalAnalyses;
      }

      this.emit('analysisComplete', {
        results,
        globalRiskScore,
        globalConfidence,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime
      });

      return results;
    } catch (error) {
      this.emit('analysisError', {
        error: (error as Error).message,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Register a new organ module with the engine
   */
  registerModule(module: OrganModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }

    this.modules.set(module.id, module);
    this.state.activeModules.push(module.id);
    
    this.emit('moduleRegistered', { moduleId: module.id, module });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Registered module: ${module.id}`);
    }
  }

  /**
   * Unregister an organ module
   */
  unregisterModule(moduleId: string): void {
    if (!this.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is not registered`);
    }

    this.modules.delete(moduleId);
    this.state.activeModules = this.state.activeModules.filter(id => id !== moduleId);
    
    this.emit('moduleUnregistered', { moduleId });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Unregistered module: ${moduleId}`);
    }
  }

  /**
   * Perform comprehensive health analysis across all modules
   */
  /**
   * Register a new organ module with the engine
   */
  registerModule(module: OrganModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }

    this.modules.set(module.id, module);
    this.state.activeModules.push(module.id);
    
    // Initialize module performance metrics
    if (this.config.performanceMonitoring) {
      this.metrics.modulePerformance.set(module.id, {
        averageTime: 0,
        successRate: 0,
        totalCalls: 0
      });
    }
    
    this.emit('moduleRegistered', { moduleId: module.id, module });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Registered module: ${module.id}`);
    }
  }

  /**
   * Unregister an organ module
   */
  unregisterModule(moduleId: string): void {
    if (!this.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is not registered`);
    }

    this.modules.delete(moduleId);
    this.state.activeModules = this.state.activeModules.filter(id => id !== moduleId);
    this.metrics.modulePerformance.delete(moduleId);
    
    this.emit('moduleUnregistered', { moduleId });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Unregistered module: ${moduleId}`);
    }
  }

  /**
   * Perform comprehensive health analysis across all modules with caching and queue management
   */
  async analyzeHealth(healthData: HealthData): Promise<PredictionResult[]> {
    // Check cache first
    const cachedResult = this.getCachedResult(healthData);
    if (cachedResult) {
      this.emit('analysisComplete', {
        results: cachedResult,
        globalRiskScore: this.state.globalRiskScore,
        globalConfidence: this.state.confidence,
        timestamp: Date.now(),
        fromCache: true
      });
      return cachedResult;
    }

    // Add to analysis queue
    return new Promise((resolve, reject) => {
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.analysisQueue.push({
        id: analysisId,
        healthData,
        resolve: (results) => {
          // Cache the results
          this.setCachedResult(healthData, results);
          resolve(results);
        },
        reject,
        timestamp: Date.now()
      });

      // Start processing queue
      this.processQueue().catch(reject);
    });
  }

  /**
   * Get current engine state with additional metrics
   */
  getState(): DigitalTwinState & { metrics?: PerformanceMetrics; cacheSize?: number } {
    const state = { ...this.state };
    
    if (this.config.performanceMonitoring) {
      (state as any).metrics = { ...this.metrics };
    }
    
    if (this.config.cacheEnabled) {
      (state as any).cacheSize = this.cache.size;
    }
    
    return state;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalEntries: number;
    oldestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const oldestTimestamp = entries.length > 0 
      ? Math.min(...entries.map(e => e.timestamp))
      : null;

    return {
      size: this.cache.size,
      maxSize: this.config.cacheMaxSize,
      hitRate: this.metrics.cacheHitRate,
      totalEntries: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      oldestEntry: oldestTimestamp
    };
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    
    this.emit('cacheCleared', { previousSize });
    
    if (this.config.debugMode) {
      console.log(`[DigitalTwinEngine] Cache cleared, removed ${previousSize} entries`);
    }
  }

  /**
   * Get registered modules
   */
  getModules(): OrganModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get specific module by ID
   */
  getModule(moduleId: string): OrganModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Update engine configuration
   */
  updateConfig(newConfig: Partial<EngineConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Handle cache configuration changes
    if (newConfig.cacheEnabled === false && oldConfig.cacheEnabled === true) {
      this.clearCache();
    }
    
    this.emit('configUpdated', { 
      oldConfig, 
      newConfig: this.config,
      changes: Object.keys(newConfig)
    });
    
    if (this.config.debugMode) {
      console.log('[DigitalTwinEngine] Configuration updated:', newConfig);
    }
  }

  /**
   * Reset engine state
   */
  reset(): void {
    // Clear analysis queue
    this.analysisQueue.forEach(item => {
      item.reject(new Error('Engine reset - analysis cancelled'));
    });
    this.analysisQueue = [];
    this.isProcessingQueue = false;

    // Reset state
    this.state = {
      isAnalyzing: false,
      lastUpdate: null,
      activeModules: Array.from(this.modules.keys()),
      globalRiskScore: 0,
      confidence: 0
    };

    // Reset metrics
    this.metrics = {
      totalAnalyses: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      modulePerformance: new Map()
    };

    // Reinitialize module metrics
    for (const moduleId of this.modules.keys()) {
      this.metrics.modulePerformance.set(moduleId, {
        averageTime: 0,
        successRate: 0,
        totalCalls: 0
      });
    }

    // Clear cache
    this.clearCache();
    
    this.emit('engineReset', { timestamp: Date.now() });
    
    if (this.config.debugMode) {
      console.log('[DigitalTwinEngine] Engine reset completed');
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    oldestQueueItem: number | null;
  } {
    const oldestTimestamp = this.analysisQueue.length > 0
      ? Math.min(...this.analysisQueue.map(item => item.timestamp))
      : null;

    return {
      queueLength: this.analysisQueue.length,
      isProcessing: this.isProcessingQueue,
      oldestQueueItem: oldestTimestamp
    };
  }

  /**
   * Health check for the engine
   */
  healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      modulesRegistered: number;
      cacheHealth: 'ok' | 'full' | 'disabled';
      queueHealth: 'ok' | 'backlogged' | 'stalled';
      performanceHealth: 'ok' | 'slow' | 'failing';
    };
  } {
    const details = {
      modulesRegistered: this.modules.size,
      cacheHealth: this.config.cacheEnabled 
        ? (this.cache.size >= this.config.cacheMaxSize * 0.9 ? 'full' : 'ok')
        : 'disabled' as const,
      queueHealth: this.analysisQueue.length > 10 
        ? 'backlogged' 
        : (this.isProcessingQueue ? 'ok' : 'stalled') as const,
      performanceHealth: this.metrics.errorRate > 10 
        ? 'failing' 
        : (this.metrics.averageProcessingTime > 10000 ? 'slow' : 'ok') as const
    };

    const healthyCount = Object.values(details).filter(v => v === 'ok').length;
    const status = healthyCount >= 3 ? 'healthy' : healthyCount >= 2 ? 'degraded' : 'unhealthy';

    return { status, details };
  }

  /**
   * Cleanup resources and destroy engine
   */
  destroy(): void {
    // Cancel all pending analyses
    this.analysisQueue.forEach(item => {
      item.reject(new Error('Engine destroyed - analysis cancelled'));
    });
    this.analysisQueue = [];

    // Clear all data
    this.modules.clear();
    this.cache.clear();
    this.removeAllListeners();
    this.state.activeModules = [];
    
    if (this.config.debugMode) {
      console.log('[DigitalTwinEngine] Engine destroyed and resources cleaned up');
    }
  }
}

export default DigitalTwinEngine;

