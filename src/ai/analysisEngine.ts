import { PatientData, OrganRisk } from '../types/patient';
import { calculateOverallRisk } from './healthAnalysis';
import { healthAI } from './tensorflowModel';

/**
 * Main AI Analysis Engine
 * Combines traditional algorithms with TensorFlow.js models
 */
export class AIAnalysisEngine {
  private isInitialized = false;

  /**
   * Initialize the AI analysis engine
   */
  async initialize(): Promise<void> {
    try {
      await healthAI.initialize();
      this.isInitialized = true;
      console.log('BioTwin360 AI Analysis Engine ready');
    } catch (error) {
      console.error('Failed to initialize AI Analysis Engine:', error);
      // Fallback to traditional algorithms only
      this.isInitialized = true;
    }
  }

  /**
   * Perform comprehensive health analysis
   */
  async analyzeHealth(data: PatientData): Promise<OrganRisk> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use hybrid approach: traditional algorithms + AI enhancement
      const traditionalRisk = calculateOverallRisk(data);
      
      // Try to enhance with AI predictions
      let enhancedRisk = traditionalRisk;
      
      try {
        const aiHeartScore = await healthAI.predictHeartRisk(data);
        const aiLiverScore = await healthAI.predictLiverRisk(data);
        
        // Blend traditional and AI scores (70% traditional, 30% AI)
        const blendedHeartScore = Math.round(
          traditionalRisk.heart.score * 0.7 + aiHeartScore * 0.3
        );
        const blendedLiverScore = Math.round(
          traditionalRisk.liver.score * 0.7 + aiLiverScore * 0.3
        );
        
        enhancedRisk = {
          heart: {
            ...traditionalRisk.heart,
            score: blendedHeartScore,
            level: this.getScoreLevel(blendedHeartScore)
          },
          liver: {
            ...traditionalRisk.liver,
            score: blendedLiverScore,
            level: this.getScoreLevel(blendedLiverScore)
          }
        };
        
        console.log('AI-enhanced analysis completed');
      } catch (aiError) {
        console.warn('AI enhancement failed, using traditional analysis:', aiError);
      }
      
      return enhancedRisk;
    } catch (error) {
      console.error('Health analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get risk level from score
   */
  private getScoreLevel(score: number): 'low' | 'moderate' | 'high' {
    if (score < 30) return 'low';
    if (score < 60) return 'moderate';
    return 'high';
  }

  /**
   * Generate health insights
   */
  generateInsights(organRisk: OrganRisk): string[] {
    const insights: string[] = [];
    
    // Heart insights
    if (organRisk.heart.level === 'high') {
      insights.push('Your cardiovascular risk is elevated. Consider consulting a cardiologist.');
    } else if (organRisk.heart.level === 'moderate') {
      insights.push('Your heart health shows some risk factors that could be improved.');
    } else {
      insights.push('Your cardiovascular health appears to be in good condition.');
    }
    
    // Liver insights
    if (organRisk.liver.level === 'high') {
      insights.push('Your liver health indicators suggest increased risk. Medical evaluation recommended.');
    } else if (organRisk.liver.level === 'moderate') {
      insights.push('Your liver function shows some areas for improvement.');
    } else {
      insights.push('Your liver health indicators are within healthy ranges.');
    }
    
    // Combined insights
    const overallScore = (100 - organRisk.heart.score) * 0.6 + (100 - organRisk.liver.score) * 0.4;
    
    if (overallScore >= 80) {
      insights.push('Overall, your health profile shows excellent indicators.');
    } else if (overallScore >= 60) {
      insights.push('Your overall health is good with room for some improvements.');
    } else {
      insights.push('Your health profile indicates several areas that would benefit from attention.');
    }
    
    return insights;
  }

  /**
   * Get AI model status
   */
  getModelStatus(): { initialized: boolean, modelInfo: any } {
    return {
      initialized: this.isInitialized,
      modelInfo: healthAI.getModelInfo()
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    healthAI.dispose();
    this.isInitialized = false;
  }
}

// Singleton instance
export const aiEngine = new AIAnalysisEngine();

