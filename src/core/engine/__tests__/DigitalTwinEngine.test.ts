/**
 * Digital Twin Engine Tests
 * Unit tests for the core digital twin engine functionality
 */

import { DigitalTwinEngine } from '../../core/engine/DigitalTwinEngine';
import { mockPatientData, mockAnalysisResult } from '../setup';

describe('DigitalTwinEngine', () => {
  let engine: DigitalTwinEngine;

  beforeEach(() => {
    engine = new DigitalTwinEngine();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(engine).toBeDefined();
      expect(engine.isInitialized()).toBe(true);
    });

    test('should have empty organ registry initially', () => {
      const organs = engine.getRegisteredOrgans();
      expect(organs).toEqual([]);
    });

    test('should initialize performance monitoring', () => {
      const metrics = engine.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalAnalyses).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
    });
  });

  describe('Organ Registration', () => {
    test('should register organ successfully', () => {
      const organConfig = {
        id: 'heart',
        name: 'Heart',
        type: 'cardiovascular',
        analysisFunction: jest.fn(),
        visualizationComponent: 'HeartModel',
        dependencies: [],
        priority: 1,
      };

      engine.registerOrgan(organConfig);
      const organs = engine.getRegisteredOrgans();
      
      expect(organs).toHaveLength(1);
      expect(organs[0].id).toBe('heart');
      expect(organs[0].name).toBe('Heart');
    });

    test('should not register duplicate organs', () => {
      const organConfig = {
        id: 'heart',
        name: 'Heart',
        type: 'cardiovascular',
        analysisFunction: jest.fn(),
        visualizationComponent: 'HeartModel',
        dependencies: [],
        priority: 1,
      };

      engine.registerOrgan(organConfig);
      
      expect(() => {
        engine.registerOrgan(organConfig);
      }).toThrow('Organ with ID heart is already registered');
    });

    test('should validate organ configuration', () => {
      const invalidConfig = {
        id: '',
        name: 'Invalid Organ',
        type: 'unknown',
        analysisFunction: null,
        visualizationComponent: '',
        dependencies: [],
        priority: -1,
      };

      expect(() => {
        engine.registerOrgan(invalidConfig as any);
      }).toThrow();
    });
  });

  describe('Health Analysis', () => {
    beforeEach(() => {
      // Register mock organs
      const heartConfig = {
        id: 'heart',
        name: 'Heart',
        type: 'cardiovascular',
        analysisFunction: jest.fn().mockResolvedValue({
          riskScore: 20,
          status: 'healthy',
          recommendations: ['Regular exercise'],
        }),
        visualizationComponent: 'HeartModel',
        dependencies: [],
        priority: 1,
      };

      const liverConfig = {
        id: 'liver',
        name: 'Liver',
        type: 'metabolic',
        analysisFunction: jest.fn().mockResolvedValue({
          riskScore: 15,
          status: 'healthy',
          recommendations: ['Limit alcohol'],
        }),
        visualizationComponent: 'LiverModel',
        dependencies: [],
        priority: 2,
      };

      engine.registerOrgan(heartConfig);
      engine.registerOrgan(liverConfig);
    });

    test('should analyze health data successfully', async () => {
      const result = await engine.analyzeHealth(mockPatientData);

      expect(result).toBeDefined();
      expect(result.patientId).toBe(mockPatientData.id);
      expect(result.timestamp).toBeDefined();
      expect(result.overallRiskScore).toBeDefined();
      expect(result.organAnalysis).toBeDefined();
      expect(result.organAnalysis.heart).toBeDefined();
      expect(result.organAnalysis.liver).toBeDefined();
    });

    test('should calculate overall risk score correctly', async () => {
      const result = await engine.analyzeHealth(mockPatientData);

      // Overall risk should be calculated from individual organ risks
      expect(result.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.overallRiskScore).toBeLessThanOrEqual(100);
    });

    test('should handle analysis errors gracefully', async () => {
      const errorOrganConfig = {
        id: 'error-organ',
        name: 'Error Organ',
        type: 'test',
        analysisFunction: jest.fn().mockRejectedValue(new Error('Analysis failed')),
        visualizationComponent: 'ErrorModel',
        dependencies: [],
        priority: 3,
      };

      engine.registerOrgan(errorOrganConfig);

      const result = await engine.analyzeHealth(mockPatientData);

      // Should still return result for other organs
      expect(result.organAnalysis.heart).toBeDefined();
      expect(result.organAnalysis.liver).toBeDefined();
      
      // Error organ should have error status
      expect(result.organAnalysis['error-organ']).toBeDefined();
      expect(result.organAnalysis['error-organ'].status).toBe('error');
    });

    test('should respect organ dependencies', async () => {
      const dependentOrganConfig = {
        id: 'dependent-organ',
        name: 'Dependent Organ',
        type: 'test',
        analysisFunction: jest.fn().mockResolvedValue({
          riskScore: 25,
          status: 'healthy',
          recommendations: [],
        }),
        visualizationComponent: 'DependentModel',
        dependencies: ['heart'],
        priority: 3,
      };

      engine.registerOrgan(dependentOrganConfig);

      const result = await engine.analyzeHealth(mockPatientData);

      // Dependent organ should be analyzed after its dependencies
      expect(result.organAnalysis['dependent-organ']).toBeDefined();
    });

    test('should cache analysis results', async () => {
      const result1 = await engine.analyzeHealth(mockPatientData);
      const result2 = await engine.analyzeHealth(mockPatientData);

      // Second call should use cached result
      expect(result1.timestamp).toBe(result2.timestamp);
    });

    test('should invalidate cache when data changes', async () => {
      const result1 = await engine.analyzeHealth(mockPatientData);
      
      const modifiedData = { ...mockPatientData, age: 40 };
      const result2 = await engine.analyzeHealth(modifiedData);

      // Should generate new analysis for modified data
      expect(result1.timestamp).not.toBe(result2.timestamp);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track analysis performance', async () => {
      const heartConfig = {
        id: 'heart',
        name: 'Heart',
        type: 'cardiovascular',
        analysisFunction: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { riskScore: 20, status: 'healthy', recommendations: [] };
        }),
        visualizationComponent: 'HeartModel',
        dependencies: [],
        priority: 1,
      };

      engine.registerOrgan(heartConfig);

      await engine.analyzeHealth(mockPatientData);

      const metrics = engine.getPerformanceMetrics();
      expect(metrics.totalAnalyses).toBe(1);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
    });

    test('should track memory usage', () => {
      const metrics = engine.getPerformanceMetrics();
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.memoryUsage.used).toBeGreaterThan(0);
    });

    test('should track cache performance', async () => {
      const heartConfig = {
        id: 'heart',
        name: 'Heart',
        type: 'cardiovascular',
        analysisFunction: jest.fn().mockResolvedValue({
          riskScore: 20,
          status: 'healthy',
          recommendations: [],
        }),
        visualizationComponent: 'HeartModel',
        dependencies: [],
        priority: 1,
      };

      engine.registerOrgan(heartConfig);

      // First analysis
      await engine.analyzeHealth(mockPatientData);
      
      // Second analysis (should hit cache)
      await engine.analyzeHealth(mockPatientData);

      const metrics = engine.getPerformanceMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid patient data', async () => {
      const invalidData = { id: '', name: '', age: -1 };

      await expect(engine.analyzeHealth(invalidData as any)).rejects.toThrow();
    });

    test('should handle missing required fields', async () => {
      const incompleteData = { id: 'test', name: 'Test Patient' };

      await expect(engine.analyzeHealth(incompleteData as any)).rejects.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      const networkErrorOrgan = {
        id: 'network-organ',
        name: 'Network Organ',
        type: 'test',
        analysisFunction: jest.fn().mockRejectedValue(new Error('Network error')),
        visualizationComponent: 'NetworkModel',
        dependencies: [],
        priority: 1,
      };

      engine.registerOrgan(networkErrorOrgan);

      const result = await engine.analyzeHealth(mockPatientData);
      
      expect(result.organAnalysis['network-organ'].status).toBe('error');
      expect(result.organAnalysis['network-organ'].error).toContain('Network error');
    });
  });

  describe('Data Validation', () => {
    test('should validate patient data structure', () => {
      const isValid = engine.validatePatientData(mockPatientData);
      expect(isValid).toBe(true);
    });

    test('should reject invalid patient data', () => {
      const invalidData = {
        id: '',
        name: '',
        age: 'invalid',
        gender: 'unknown',
      };

      const isValid = engine.validatePatientData(invalidData as any);
      expect(isValid).toBe(false);
    });

    test('should validate vital signs ranges', () => {
      const dataWithInvalidVitals = {
        ...mockPatientData,
        vitalSigns: {
          heartRate: 300, // Invalid
          bloodPressure: { systolic: 50, diastolic: 200 }, // Invalid
          temperature: 50, // Invalid
          respiratoryRate: 100, // Invalid
          oxygenSaturation: 150, // Invalid
        },
      };

      const isValid = engine.validatePatientData(dataWithInvalidVitals);
      expect(isValid).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        cacheEnabled: false,
        maxCacheSize: 50,
        analysisTimeout: 10000,
      };

      engine.updateConfiguration(newConfig);
      const config = engine.getConfiguration();

      expect(config.cacheEnabled).toBe(false);
      expect(config.maxCacheSize).toBe(50);
      expect(config.analysisTimeout).toBe(10000);
    });

    test('should validate configuration changes', () => {
      const invalidConfig = {
        maxCacheSize: -1,
        analysisTimeout: 0,
      };

      expect(() => {
        engine.updateConfiguration(invalidConfig);
      }).toThrow();
    });
  });

  describe('Cleanup and Disposal', () => {
    test('should cleanup resources on disposal', () => {
      const disposeSpy = jest.spyOn(engine, 'dispose');
      
      engine.dispose();
      
      expect(disposeSpy).toHaveBeenCalled();
      expect(engine.isInitialized()).toBe(false);
    });

    test('should clear cache on disposal', () => {
      engine.dispose();
      
      const metrics = engine.getPerformanceMetrics();
      expect(metrics.cacheSize).toBe(0);
    });
  });
});

