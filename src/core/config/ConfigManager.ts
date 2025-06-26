/**
 * Global Configuration Management for BioTwin360
 */

import { GlobalConfig } from '../types/core';

const defaultConfig: GlobalConfig = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'https://api.biotwin360.com',
    timeout: 30000,
    retries: 3
  },
  ai: {
    modelPath: '/models/',
    batchSize: 32,
    confidenceThreshold: 0.7
  },
  visualization: {
    quality: 'high',
    animations: true,
    antialiasing: true
  },
  privacy: {
    dataRetention: 0, // No data retention by default
    anonymization: true,
    auditLogging: true
  },
  performance: {
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    gcInterval: 60000, // 1 minute
    cacheSize: 100 * 1024 * 1024 // 100MB
  }
};

class ConfigManager {
  private config: GlobalConfig;
  private listeners: ((config: GlobalConfig) => void)[] = [];

  constructor() {
    this.config = { ...defaultConfig };
    this.loadFromEnvironment();
  }

  private loadFromEnvironment(): void {
    // Load configuration from environment variables
    if (process.env.VITE_AI_CONFIDENCE_THRESHOLD) {
      this.config.ai.confidenceThreshold = parseFloat(process.env.VITE_AI_CONFIDENCE_THRESHOLD);
    }
    
    if (process.env.VITE_VISUALIZATION_QUALITY) {
      this.config.visualization.quality = process.env.VITE_VISUALIZATION_QUALITY as 'low' | 'medium' | 'high';
    }
    
    if (process.env.VITE_ENABLE_ANIMATIONS) {
      this.config.visualization.animations = process.env.VITE_ENABLE_ANIMATIONS === 'true';
    }
  }

  get(): GlobalConfig {
    return { ...this.config };
  }

  update(updates: Partial<GlobalConfig>): void {
    this.config = { ...this.config, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (config: GlobalConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }
}

export const configManager = new ConfigManager();
export default configManager;

