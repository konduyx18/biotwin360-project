/**
 * Core Types for BioTwin360 Digital Twin Engine
 */

export interface HealthData {
  // Basic Demographics
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  
  // Vital Signs
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  
  // Laboratory Values
  cholesterolTotal: number;
  cholesterolLDL: number;
  cholesterolHDL: number;
  triglycerides: number;
  glucose: number;
  hba1c: number;
  creatinine: number;
  bun: number;
  alt: number;
  ast: number;
  bilirubin: number;
  
  // Lifestyle Factors
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'intense';
  dietQuality: 'poor' | 'fair' | 'good' | 'excellent';
  sleepHours: number;
  stressLevel: number; // 1-10 scale
  
  // Medical History
  familyHistory: string[];
  medications: string[];
  allergies: string[];
  chronicConditions: string[];
  
  // Wearable Data (optional)
  steps?: number;
  activeMinutes?: number;
  vo2Max?: number;
  restingHeartRate?: number;
  hrv?: number;
  
  // Additional Biomarkers (optional)
  inflammatoryMarkers?: {
    crp: number;
    esr: number;
    il6?: number;
  };
  
  timestamp: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  value: number | string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  modifiable: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'lifestyle' | 'medical' | 'monitoring' | 'prevention';
  actionable: boolean;
  timeframe: string;
  expectedBenefit: string;
  evidenceLevel: 'low' | 'moderate' | 'high';
}

export interface PredictionResult {
  moduleId: string;
  riskScore: number; // 0-100
  confidence: number; // 0-1
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  timestamp: number;
  processingTime: number;
  error?: string;
  
  // Module-specific data
  organSpecificData?: Record<string, any>;
}

export interface OrganModule {
  id: string;
  name: string;
  version: string;
  description: string;
  
  // Core analysis function
  analyze(healthData: HealthData): Promise<PredictionResult>;
  
  // Module lifecycle
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Configuration
  getConfig(): Record<string, any>;
  updateConfig(config: Record<string, any>): void;
  
  // Health checks
  isHealthy(): boolean;
  getStatus(): ModuleStatus;
}

export interface ModuleStatus {
  isInitialized: boolean;
  isHealthy: boolean;
  lastAnalysis: number | null;
  errorCount: number;
  averageProcessingTime: number;
  memoryUsage: number;
}

export interface DigitalTwinState {
  isAnalyzing: boolean;
  lastUpdate: number | null;
  activeModules: string[];
  globalRiskScore: number;
  confidence: number;
}

export interface AnalyticsEvent {
  type: string;
  moduleId?: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface PerformanceMetrics {
  analysisCount: number;
  averageAnalysisTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  moduleMetrics: Record<string, ModuleMetrics>;
}

export interface ModuleMetrics {
  analysisCount: number;
  averageProcessingTime: number;
  errorCount: number;
  successRate: number;
  lastError?: string;
  lastErrorTimestamp?: number;
}

export interface VisualizationData {
  organId: string;
  riskScore: number;
  riskAreas: RiskArea[];
  animations: Animation[];
  interactionPoints: InteractionPoint[];
}

export interface RiskArea {
  id: string;
  name: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  coordinates: number[];
  description: string;
}

export interface Animation {
  id: string;
  type: 'pulse' | 'flow' | 'highlight' | 'warning';
  duration: number;
  intensity: number;
  target: string;
}

export interface InteractionPoint {
  id: string;
  position: [number, number, number];
  type: 'info' | 'warning' | 'critical';
  content: string;
  actions: string[];
}

// Configuration types
export interface GlobalConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ai: {
    modelPath: string;
    batchSize: number;
    confidenceThreshold: number;
  };
  visualization: {
    quality: 'low' | 'medium' | 'high';
    animations: boolean;
    antialiasing: boolean;
  };
  privacy: {
    dataRetention: number;
    anonymization: boolean;
    auditLogging: boolean;
  };
  performance: {
    maxMemoryUsage: number;
    gcInterval: number;
    cacheSize: number;
  };
}

// Event types
export type EngineEvent = 
  | 'moduleRegistered'
  | 'moduleUnregistered'
  | 'analysisStarted'
  | 'analysisComplete'
  | 'moduleAnalysisComplete'
  | 'moduleAnalysisError'
  | 'configUpdated'
  | 'engineReset'
  | 'performanceAlert'
  | 'memoryWarning';

export interface EngineEventData {
  moduleRegistered: { moduleId: string; module: OrganModule };
  moduleUnregistered: { moduleId: string };
  analysisStarted: { timestamp: number };
  analysisComplete: { 
    results: PredictionResult[]; 
    globalRiskScore: number; 
    globalConfidence: number; 
    timestamp: number 
  };
  moduleAnalysisComplete: { 
    moduleId: string; 
    duration: number; 
    success: boolean 
  };
  moduleAnalysisError: { 
    moduleId: string; 
    error: string; 
    duration: number 
  };
  configUpdated: { config: any };
  engineReset: { timestamp: number };
  performanceAlert: { 
    metric: string; 
    value: number; 
    threshold: number 
  };
  memoryWarning: { 
    usage: number; 
    limit: number 
  };
}

