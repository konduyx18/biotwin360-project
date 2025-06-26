/**
 * BioTwin360 Organ Orchestrator
 * Advanced Multi-Organ Coordination and Dependency Management
 * 
 * This orchestrator manages the complex interactions between different
 * organ modules, handles inter-organ dependencies, and provides
 * sophisticated coordination for comprehensive health analysis.
 * 
 * Features:
 * - Inter-organ dependency management
 * - Parallel and sequential analysis coordination
 * - Cross-organ correlation analysis
 * - Dynamic module loading and unloading
 * - Health impact propagation modeling
 */

import { OrganModule, HealthData, PredictionResult } from '../types/core';
import { EventEmitter } from 'events';

export interface OrganDependency {
  sourceOrgan: string;
  targetOrgan: string;
  dependencyType: 'functional' | 'metabolic' | 'circulatory' | 'neural';
  strength: number; // 0-1, how strong the dependency is
  bidirectional: boolean;
}

export interface OrganInteraction {
  organs: string[];
  interactionType: 'synergistic' | 'antagonistic' | 'neutral';
  impactFactor: number; // Multiplier for risk calculations
  description: string;
}

export interface OrchestrationConfig {
  enableDependencyAnalysis: boolean;
  enableInteractionModeling: boolean;
  maxParallelAnalyses: number;
  dependencyTimeout: number;
  correlationThreshold: number;
  debugMode: boolean;
}

export interface OrchestrationResult {
  organResults: Map<string, PredictionResult>;
  globalRiskScore: number;
  globalConfidence: number;
  organInteractions: OrganInteraction[];
  dependencyImpacts: Map<string, number>;
  recommendations: string[];
  processingTime: number;
  analysisPath: string[];
}

export class OrganOrchestrator extends EventEmitter {
  private modules: Map<string, OrganModule> = new Map();
  private dependencies: OrganDependency[] = [];
  private interactions: OrganInteraction[] = [];
  private config: OrchestrationConfig;

  constructor(config: Partial<OrchestrationConfig> = {}) {
    super();
    this.config = {
      enableDependencyAnalysis: true,
      enableInteractionModeling: true,
      maxParallelAnalyses: 4,
      dependencyTimeout: 15000,
      correlationThreshold: 0.7,
      debugMode: false,
      ...config
    };

    this.initializeDefaultDependencies();
    this.initializeDefaultInteractions();
  }

  /**
   * Initialize default organ dependencies based on medical knowledge
   */
  private initializeDefaultDependencies(): void {
    const defaultDependencies: OrganDependency[] = [
      // Cardiovascular dependencies
      {
        sourceOrgan: 'cardiovascular',
        targetOrgan: 'renal',
        dependencyType: 'circulatory',
        strength: 0.9,
        bidirectional: true
      },
      {
        sourceOrgan: 'cardiovascular',
        targetOrgan: 'neurological',
        dependencyType: 'circulatory',
        strength: 0.8,
        bidirectional: false
      },
      {
        sourceOrgan: 'cardiovascular',
        targetOrgan: 'pulmonary',
        dependencyType: 'circulatory',
        strength: 0.95,
        bidirectional: true
      },

      // Hepatic dependencies
      {
        sourceOrgan: 'hepatic',
        targetOrgan: 'cardiovascular',
        dependencyType: 'metabolic',
        strength: 0.7,
        bidirectional: false
      },
      {
        sourceOrgan: 'hepatic',
        targetOrgan: 'renal',
        dependencyType: 'metabolic',
        strength: 0.6,
        bidirectional: false
      },

      // Renal dependencies
      {
        sourceOrgan: 'renal',
        targetOrgan: 'cardiovascular',
        dependencyType: 'functional',
        strength: 0.8,
        bidirectional: false
      },

      // Pulmonary dependencies
      {
        sourceOrgan: 'pulmonary',
        targetOrgan: 'cardiovascular',
        dependencyType: 'functional',
        strength: 0.9,
        bidirectional: false
      },

      // Neurological dependencies
      {
        sourceOrgan: 'neurological',
        targetOrgan: 'musculoskeletal',
        dependencyType: 'neural',
        strength: 0.85,
        bidirectional: false
      },

      // Musculoskeletal dependencies
      {
        sourceOrgan: 'musculoskeletal',
        targetOrgan: 'cardiovascular',
        dependencyType: 'functional',
        strength: 0.6,
        bidirectional: false
      }
    ];

    this.dependencies = defaultDependencies;

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Initialized default dependencies:', this.dependencies.length);
    }
  }

  /**
   * Initialize default organ interactions
   */
  private initializeDefaultInteractions(): void {
    const defaultInteractions: OrganInteraction[] = [
      {
        organs: ['cardiovascular', 'pulmonary'],
        interactionType: 'synergistic',
        impactFactor: 1.2,
        description: 'Cardiopulmonary synergy enhances overall cardiovascular health'
      },
      {
        organs: ['cardiovascular', 'renal'],
        interactionType: 'synergistic',
        impactFactor: 1.15,
        description: 'Cardiorenal axis - kidney and heart health are closely linked'
      },
      {
        organs: ['hepatic', 'cardiovascular'],
        interactionType: 'synergistic',
        impactFactor: 1.1,
        description: 'Liver metabolism affects cardiovascular risk factors'
      },
      {
        organs: ['neurological', 'cardiovascular'],
        interactionType: 'synergistic',
        impactFactor: 1.25,
        description: 'Neurovascular coupling - brain health depends on cardiovascular function'
      },
      {
        organs: ['musculoskeletal', 'cardiovascular'],
        interactionType: 'synergistic',
        impactFactor: 1.1,
        description: 'Physical activity and muscle health improve cardiovascular outcomes'
      },
      {
        organs: ['hepatic', 'renal'],
        interactionType: 'antagonistic',
        impactFactor: 0.9,
        description: 'Hepatorenal syndrome - liver dysfunction can impair kidney function'
      }
    ];

    this.interactions = defaultInteractions;

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Initialized default interactions:', this.interactions.length);
    }
  }

  /**
   * Register an organ module with the orchestrator
   */
  registerModule(module: OrganModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }

    this.modules.set(module.id, module);
    this.emit('moduleRegistered', { moduleId: module.id });

    if (this.config.debugMode) {
      console.log(`[OrganOrchestrator] Registered module: ${module.id}`);
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
    this.emit('moduleUnregistered', { moduleId });

    if (this.config.debugMode) {
      console.log(`[OrganOrchestrator] Unregistered module: ${moduleId}`);
    }
  }

  /**
   * Add a custom organ dependency
   */
  addDependency(dependency: OrganDependency): void {
    // Validate that both organs are registered
    if (!this.modules.has(dependency.sourceOrgan) || !this.modules.has(dependency.targetOrgan)) {
      throw new Error('Both source and target organs must be registered');
    }

    this.dependencies.push(dependency);
    this.emit('dependencyAdded', { dependency });

    if (this.config.debugMode) {
      console.log(`[OrganOrchestrator] Added dependency: ${dependency.sourceOrgan} -> ${dependency.targetOrgan}`);
    }
  }

  /**
   * Add a custom organ interaction
   */
  addInteraction(interaction: OrganInteraction): void {
    // Validate that all organs are registered
    for (const organId of interaction.organs) {
      if (!this.modules.has(organId)) {
        throw new Error(`Organ ${organId} must be registered`);
      }
    }

    this.interactions.push(interaction);
    this.emit('interactionAdded', { interaction });

    if (this.config.debugMode) {
      console.log(`[OrganOrchestrator] Added interaction: ${interaction.organs.join(', ')}`);
    }
  }

  /**
   * Calculate analysis order based on dependencies
   */
  private calculateAnalysisOrder(): string[] {
    const moduleIds = Array.from(this.modules.keys());
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (moduleId: string): void => {
      if (visited.has(moduleId)) return;
      if (visiting.has(moduleId)) {
        // Circular dependency detected - use parallel analysis
        if (this.config.debugMode) {
          console.log(`[OrganOrchestrator] Circular dependency detected for ${moduleId}`);
        }
        return;
      }

      visiting.add(moduleId);

      // Visit dependencies first
      const deps = this.dependencies.filter(d => d.targetOrgan === moduleId);
      for (const dep of deps) {
        if (this.modules.has(dep.sourceOrgan)) {
          visit(dep.sourceOrgan);
        }
      }

      visiting.delete(moduleId);
      visited.add(moduleId);
      order.push(moduleId);
    };

    for (const moduleId of moduleIds) {
      visit(moduleId);
    }

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Analysis order:', order);
    }

    return order;
  }

  /**
   * Perform orchestrated health analysis across all modules
   */
  async orchestrateAnalysis(healthData: HealthData): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const organResults = new Map<string, PredictionResult>();
    const dependencyImpacts = new Map<string, number>();
    const analysisPath: string[] = [];

    this.emit('orchestrationStarted', { timestamp: startTime });

    try {
      if (this.config.enableDependencyAnalysis) {
        // Sequential analysis based on dependencies
        const analysisOrder = this.calculateAnalysisOrder();
        
        for (const moduleId of analysisOrder) {
          const module = this.modules.get(moduleId);
          if (!module) continue;

          analysisPath.push(moduleId);
          
          try {
            // Apply dependency impacts to health data
            const adjustedHealthData = this.applyDependencyImpacts(healthData, moduleId, organResults);
            
            const result = await Promise.race([
              module.analyze(adjustedHealthData),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Module timeout')), this.config.dependencyTimeout)
              )
            ]);

            organResults.set(moduleId, {
              ...result,
              moduleId,
              timestamp: Date.now(),
              processingTime: Date.now() - startTime
            });

            this.emit('moduleAnalysisComplete', { moduleId, result });

          } catch (error) {
            this.emit('moduleAnalysisError', { moduleId, error: (error as Error).message });
            
            // Continue with fallback result
            organResults.set(moduleId, {
              moduleId,
              riskScore: 0,
              confidence: 0,
              recommendations: [],
              riskFactors: [],
              timestamp: Date.now(),
              processingTime: Date.now() - startTime,
              error: (error as Error).message
            });
          }
        }
      } else {
        // Parallel analysis without dependencies
        const analysisPromises = Array.from(this.modules.entries()).map(async ([moduleId, module]) => {
          analysisPath.push(moduleId);
          
          try {
            const result = await module.analyze(healthData);
            return [moduleId, {
              ...result,
              moduleId,
              timestamp: Date.now(),
              processingTime: Date.now() - startTime
            }] as [string, PredictionResult];
          } catch (error) {
            return [moduleId, {
              moduleId,
              riskScore: 0,
              confidence: 0,
              recommendations: [],
              riskFactors: [],
              timestamp: Date.now(),
              processingTime: Date.now() - startTime,
              error: (error as Error).message
            }] as [string, PredictionResult];
          }
        });

        const results = await Promise.all(analysisPromises);
        results.forEach(([moduleId, result]) => {
          organResults.set(moduleId, result);
        });
      }

      // Calculate organ interactions
      const organInteractions = this.config.enableInteractionModeling 
        ? this.calculateOrganInteractions(organResults)
        : [];

      // Calculate global metrics
      const validResults = Array.from(organResults.values()).filter(r => !r.error);
      const globalRiskScore = this.calculateGlobalRiskScore(validResults, organInteractions);
      const globalConfidence = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
        : 0;

      // Generate global recommendations
      const recommendations = this.generateGlobalRecommendations(organResults, organInteractions);

      const result: OrchestrationResult = {
        organResults,
        globalRiskScore,
        globalConfidence,
        organInteractions,
        dependencyImpacts,
        recommendations,
        processingTime: Date.now() - startTime,
        analysisPath
      };

      this.emit('orchestrationComplete', { result, timestamp: Date.now() });

      return result;

    } catch (error) {
      this.emit('orchestrationError', { error: (error as Error).message, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Apply dependency impacts to health data for a specific module
   */
  private applyDependencyImpacts(
    healthData: HealthData, 
    targetModuleId: string, 
    existingResults: Map<string, PredictionResult>
  ): HealthData {
    const adjustedData = { ...healthData };
    
    const relevantDependencies = this.dependencies.filter(d => d.targetOrgan === targetModuleId);
    
    for (const dependency of relevantDependencies) {
      const sourceResult = existingResults.get(dependency.sourceOrgan);
      if (!sourceResult || sourceResult.error) continue;

      // Apply dependency impact based on source organ's risk score
      const impactFactor = (sourceResult.riskScore / 100) * dependency.strength;
      
      // Adjust relevant health parameters based on dependency type
      switch (dependency.dependencyType) {
        case 'circulatory':
          if (adjustedData.bloodPressureSystolic) {
            adjustedData.bloodPressureSystolic *= (1 + impactFactor * 0.1);
          }
          break;
        case 'metabolic':
          if (adjustedData.glucose) {
            adjustedData.glucose *= (1 + impactFactor * 0.05);
          }
          break;
        case 'functional':
          // General functional impact - could affect multiple parameters
          break;
        case 'neural':
          // Neural impact - could affect cognitive or motor functions
          break;
      }
    }

    return adjustedData;
  }

  /**
   * Calculate organ interactions and their impacts
   */
  private calculateOrganInteractions(organResults: Map<string, PredictionResult>): OrganInteraction[] {
    const activeInteractions: OrganInteraction[] = [];

    for (const interaction of this.interactions) {
      // Check if all organs in the interaction have results
      const hasAllResults = interaction.organs.every(organId => 
        organResults.has(organId) && !organResults.get(organId)?.error
      );

      if (hasAllResults) {
        // Calculate correlation between organs
        const organScores = interaction.organs.map(organId => 
          organResults.get(organId)!.riskScore
        );

        const correlation = this.calculateCorrelation(organScores);
        
        if (Math.abs(correlation) >= this.config.correlationThreshold) {
          activeInteractions.push({
            ...interaction,
            impactFactor: interaction.impactFactor * Math.abs(correlation)
          });
        }
      }
    }

    return activeInteractions;
  }

  /**
   * Calculate correlation between organ scores
   */
  private calculateCorrelation(scores: number[]): number {
    if (scores.length < 2) return 0;

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    if (variance === 0) return 1; // Perfect correlation if no variance
    
    // Simplified correlation calculation
    return Math.min(1, variance / 1000); // Normalize to 0-1 range
  }

  /**
   * Calculate global risk score considering organ interactions
   */
  private calculateGlobalRiskScore(
    results: PredictionResult[], 
    interactions: OrganInteraction[]
  ): number {
    if (results.length === 0) return 0;

    let baseScore = results.reduce((sum, r) => sum + r.riskScore, 0) / results.length;

    // Apply interaction impacts
    for (const interaction of interactions) {
      const relevantResults = results.filter(r => interaction.organs.includes(r.moduleId));
      if (relevantResults.length >= 2) {
        const interactionScore = relevantResults.reduce((sum, r) => sum + r.riskScore, 0) / relevantResults.length;
        
        if (interaction.interactionType === 'synergistic') {
          baseScore *= interaction.impactFactor;
        } else if (interaction.interactionType === 'antagonistic') {
          baseScore *= (2 - interaction.impactFactor); // Inverse effect
        }
      }
    }

    return Math.min(100, Math.max(0, baseScore));
  }

  /**
   * Generate global recommendations based on all organ results and interactions
   */
  private generateGlobalRecommendations(
    organResults: Map<string, PredictionResult>,
    interactions: OrganInteraction[]
  ): string[] {
    const recommendations: string[] = [];
    const highRiskOrgans: string[] = [];

    // Identify high-risk organs
    for (const [organId, result] of organResults) {
      if (!result.error && result.riskScore > 70) {
        highRiskOrgans.push(organId);
      }
    }

    // Generate organ-specific recommendations
    if (highRiskOrgans.length > 0) {
      recommendations.push(`High-risk organs detected: ${highRiskOrgans.join(', ')}. Immediate medical consultation recommended.`);
    }

    // Generate interaction-based recommendations
    for (const interaction of interactions) {
      if (interaction.interactionType === 'synergistic' && interaction.impactFactor > 1.1) {
        recommendations.push(`${interaction.description}. Focus on improving ${interaction.organs.join(' and ')} health together.`);
      }
    }

    // General recommendations
    if (organResults.size >= 3) {
      recommendations.push('Comprehensive health approach recommended - address multiple organ systems simultaneously for optimal results.');
    }

    return recommendations;
  }

  /**
   * Get orchestrator statistics
   */
  getStatistics(): {
    registeredModules: number;
    dependencies: number;
    interactions: number;
    averageAnalysisTime: number;
  } {
    return {
      registeredModules: this.modules.size,
      dependencies: this.dependencies.length,
      interactions: this.interactions.length,
      averageAnalysisTime: 0 // TODO: Implement tracking
    };
  }

  /**
   * Update orchestrator configuration
   */
  updateConfig(newConfig: Partial<OrchestrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', { config: this.config });

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Configuration updated:', newConfig);
    }
  }

  /**
   * Reset orchestrator state
   */
  reset(): void {
    this.modules.clear();
    this.dependencies = [];
    this.interactions = [];
    
    this.initializeDefaultDependencies();
    this.initializeDefaultInteractions();
    
    this.emit('orchestratorReset', { timestamp: Date.now() });

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Orchestrator reset completed');
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.modules.clear();
    this.dependencies = [];
    this.interactions = [];
    this.removeAllListeners();

    if (this.config.debugMode) {
      console.log('[OrganOrchestrator] Orchestrator destroyed');
    }
  }
}

export default OrganOrchestrator;

