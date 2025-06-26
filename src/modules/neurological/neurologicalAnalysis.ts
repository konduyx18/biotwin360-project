/**
 * Neurological Analysis Algorithms
 * Medical algorithms for brain function assessment and neurological risk prediction.
 */

import { HealthData } from '../../core/types/core';

export interface NeurologicalRiskResult {
  riskScore: number;
  riskFactors: string[];
  cognitiveScore?: number; // Estimated cognitive function score
  strokeRisk?: number; // Stroke risk percentage
  dementiaRisk?: number; // Dementia risk percentage
  depressionRisk?: number; // Depression risk percentage
}

/**
 * Calculate neurological risk score based on medical guidelines
 */
export function calculateNeurologicalRisk(healthData: HealthData, model?: any): NeurologicalRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Calculate specific risk assessments
  const cognitiveScore = calculateCognitiveScore(healthData);
  const strokeRisk = calculateStrokeRisk(healthData);
  const dementiaRisk = calculateDementiaRisk(healthData);
  const depressionRisk = calculateDepressionRisk(healthData);

  // Risk factors assessment
  
  // 1. Age factor (most significant for neurological health)
  if (healthData.age) {
    if (healthData.age >= 75) {
      riskScore += 25;
      riskFactors.push('Advanced Age');
    } else if (healthData.age >= 65) {
      riskScore += 15;
      riskFactors.push('Age Factor');
    } else if (healthData.age >= 50) {
      riskScore += 5;
    }
  }

  // 2. Cardiovascular factors (brain-heart connection)
  if (healthData.bloodPressureSystolic && healthData.bloodPressureDiastolic) {
    const systolic = healthData.bloodPressureSystolic;
    const diastolic = healthData.bloodPressureDiastolic;
    
    if (systolic >= 140 || diastolic >= 90) {
      riskScore += 12;
      riskFactors.push('High Blood Pressure');
      
      if (systolic >= 160 || diastolic >= 100) {
        riskScore += 8;
        riskFactors.push('Severe Hypertension');
      }
    }
  }

  // 3. Diabetes and metabolic factors
  if (healthData.glucose) {
    if (healthData.glucose >= 126) {
      riskScore += 15;
      riskFactors.push('Diabetes Risk');
    } else if (healthData.glucose >= 100) {
      riskScore += 8;
      riskFactors.push('Pre-diabetes');
    }
  }

  // 4. Cholesterol levels
  if (healthData.cholesterol) {
    if (healthData.cholesterol >= 240) {
      riskScore += 10;
      riskFactors.push('High Cholesterol');
    }
  }

  // 5. Lifestyle factors
  if (healthData.smoking) {
    riskScore += 12;
    riskFactors.push('Smoking');
  }

  if (healthData.physicalActivity === 'sedentary') {
    riskScore += 10;
    riskFactors.push('Low Physical Activity');
  }

  if (healthData.alcohol === 'heavy') {
    riskScore += 8;
    riskFactors.push('Heavy Alcohol Use');
  }

  // 6. Sleep factors
  if (healthData.sleepHours && healthData.sleepHours < 6) {
    riskScore += 8;
    riskFactors.push('Poor Sleep');
  }

  if (healthData.sleepApnea) {
    riskScore += 10;
    riskFactors.push('Sleep Apnea');
  }

  // 7. Mental health factors
  if (healthData.depression) {
    riskScore += 12;
    riskFactors.push('Depression');
  }

  if (healthData.anxiety) {
    riskScore += 6;
    riskFactors.push('Anxiety');
  }

  if (healthData.stress === 'high') {
    riskScore += 8;
    riskFactors.push('High Stress');
  }

  // 8. Social factors
  if (healthData.socialIsolation) {
    riskScore += 8;
    riskFactors.push('Social Isolation');
  }

  // 9. Education and cognitive reserve
  if (healthData.education === 'low') {
    riskScore += 6;
    riskFactors.push('Limited Education');
  }

  // 10. Family history
  if (healthData.familyHistory?.includes('dementia') || 
      healthData.familyHistory?.includes('stroke') ||
      healthData.familyHistory?.includes('alzheimer')) {
    riskScore += 15;
    riskFactors.push('Family History');
  }

  // 11. Head injury history
  if (healthData.headInjury) {
    riskScore += 10;
    riskFactors.push('Head Injury History');
  }

  // 12. Cognitive assessment
  if (cognitiveScore < 70) {
    riskScore += 20;
    riskFactors.push('Cognitive Decline');
    
    if (cognitiveScore < 50) {
      riskScore += 15;
      riskFactors.push('Significant Cognitive Impairment');
    }
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictWithAI(healthData, model);
      // Combine traditional risk score (80%) with AI prediction (20%)
      riskScore = riskScore * 0.8 + aiPrediction * 0.2;
    } catch (error) {
      console.warn('[NeurologicalAnalysis] AI prediction failed, using traditional algorithm only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    cognitiveScore: Math.round(cognitiveScore),
    strokeRisk: Math.round(strokeRisk),
    dementiaRisk: Math.round(dementiaRisk),
    depressionRisk: Math.round(depressionRisk)
  };
}

/**
 * Calculate estimated cognitive function score
 */
function calculateCognitiveScore(healthData: HealthData): number {
  let cognitiveScore = 100; // Start with perfect score

  // Age-related decline
  if (healthData.age) {
    if (healthData.age >= 65) {
      cognitiveScore -= (healthData.age - 65) * 0.8;
    }
  }

  // Education protective factor
  if (healthData.education === 'high') {
    cognitiveScore += 5;
  } else if (healthData.education === 'low') {
    cognitiveScore -= 8;
  }

  // Physical activity benefits
  if (healthData.physicalActivity === 'active') {
    cognitiveScore += 8;
  } else if (healthData.physicalActivity === 'sedentary') {
    cognitiveScore -= 10;
  }

  // Cardiovascular health impact
  if (healthData.bloodPressureSystolic && healthData.bloodPressureSystolic >= 140) {
    cognitiveScore -= 8;
  }

  if (healthData.diabetes) {
    cognitiveScore -= 12;
  }

  // Lifestyle factors
  if (healthData.smoking) {
    cognitiveScore -= 8;
  }

  if (healthData.alcohol === 'heavy') {
    cognitiveScore -= 6;
  }

  // Sleep quality
  if (healthData.sleepHours && healthData.sleepHours >= 7 && healthData.sleepHours <= 9) {
    cognitiveScore += 3;
  } else {
    cognitiveScore -= 5;
  }

  // Mental health
  if (healthData.depression) {
    cognitiveScore -= 10;
  }

  // Social engagement
  if (healthData.socialIsolation) {
    cognitiveScore -= 8;
  }

  return Math.max(20, Math.min(120, cognitiveScore));
}

/**
 * Calculate stroke risk using established risk factors
 */
function calculateStrokeRisk(healthData: HealthData): number {
  let strokeRisk = 0;

  // Age factor
  if (healthData.age) {
    if (healthData.age >= 65) {
      strokeRisk += (healthData.age - 65) * 1.2;
    }
  }

  // Hypertension (major risk factor)
  if (healthData.bloodPressureSystolic && healthData.bloodPressureSystolic >= 140) {
    strokeRisk += 25;
  }

  // Diabetes
  if (healthData.diabetes) {
    strokeRisk += 15;
  }

  // Atrial fibrillation
  if (healthData.atrialFibrillation) {
    strokeRisk += 20;
  }

  // Smoking
  if (healthData.smoking) {
    strokeRisk += 12;
  }

  // High cholesterol
  if (healthData.cholesterol && healthData.cholesterol >= 240) {
    strokeRisk += 8;
  }

  // Family history
  if (healthData.familyHistory?.includes('stroke')) {
    strokeRisk += 10;
  }

  return Math.min(100, Math.max(0, strokeRisk));
}

/**
 * Calculate dementia risk based on established factors
 */
function calculateDementiaRisk(healthData: HealthData): number {
  let dementiaRisk = 0;

  // Age (strongest risk factor)
  if (healthData.age) {
    if (healthData.age >= 85) {
      dementiaRisk += 40;
    } else if (healthData.age >= 75) {
      dementiaRisk += 25;
    } else if (healthData.age >= 65) {
      dementiaRisk += 10;
    }
  }

  // Genetic factors
  if (healthData.familyHistory?.includes('dementia') || 
      healthData.familyHistory?.includes('alzheimer')) {
    dementiaRisk += 20;
  }

  // Cardiovascular factors
  if (healthData.bloodPressureSystolic && healthData.bloodPressureSystolic >= 140) {
    dementiaRisk += 8;
  }

  if (healthData.diabetes) {
    dementiaRisk += 10;
  }

  // Lifestyle protective factors
  if (healthData.education === 'high') {
    dementiaRisk -= 8;
  }

  if (healthData.physicalActivity === 'active') {
    dementiaRisk -= 6;
  }

  // Risk factors
  if (healthData.smoking) {
    dementiaRisk += 8;
  }

  if (healthData.socialIsolation) {
    dementiaRisk += 6;
  }

  if (healthData.depression) {
    dementiaRisk += 8;
  }

  return Math.min(100, Math.max(0, dementiaRisk));
}

/**
 * Calculate depression risk based on various factors
 */
function calculateDepressionRisk(healthData: HealthData): number {
  let depressionRisk = 0;

  // Current depression
  if (healthData.depression) {
    depressionRisk += 60;
  }

  // Family history
  if (healthData.familyHistory?.includes('depression')) {
    depressionRisk += 15;
  }

  // Social factors
  if (healthData.socialIsolation) {
    depressionRisk += 20;
  }

  // Stress
  if (healthData.stress === 'high') {
    depressionRisk += 15;
  }

  // Physical health
  if (healthData.chronicPain) {
    depressionRisk += 12;
  }

  // Sleep
  if (healthData.sleepHours && healthData.sleepHours < 6) {
    depressionRisk += 10;
  }

  // Protective factors
  if (healthData.physicalActivity === 'active') {
    depressionRisk -= 8;
  }

  return Math.min(100, Math.max(0, depressionRisk));
}

/**
 * AI-based prediction (placeholder for TensorFlow.js model)
 */
function predictWithAI(healthData: HealthData, model: any): number {
  // This would use the actual TensorFlow.js model
  // For now, return a mock prediction based on key factors
  
  const features = [
    healthData.age || 40,
    healthData.bloodPressureSystolic || 120,
    healthData.glucose || 90,
    healthData.smoking ? 1 : 0,
    healthData.physicalActivity === 'sedentary' ? 1 : 0,
    healthData.depression ? 1 : 0,
    healthData.sleepHours || 8,
    healthData.socialIsolation ? 1 : 0
  ];

  // Mock AI prediction - in reality, this would use model.predict()
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [100, 200, 300, 1, 1, 1, 12, 1];
    return f / maxValues[i];
  });

  const prediction = normalizedFeatures.reduce((sum, f, i) => {
    const weights = [0.25, 0.15, 0.1, 0.12, 0.08, 0.15, 0.05, 0.1]; // Feature importance
    return sum + f * weights[i];
  }, 0) * 100;
  
  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed neurological health insights
 */
export function generateNeurologicalInsights(result: NeurologicalRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
} {
  const { riskScore, cognitiveScore, strokeRisk, dementiaRisk, depressionRisk, riskFactors } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];

  // Determine urgency and summary
  if (riskScore >= 60 || (strokeRisk && strokeRisk > 70) || (cognitiveScore && cognitiveScore < 50)) {
    urgency = 'high';
    summary = 'Significant neurological health concerns detected. Medical evaluation recommended.';
  } else if (riskScore >= 35 || (dementiaRisk && dementiaRisk > 40)) {
    urgency = 'medium';
    summary = 'Moderate neurological risk factors present. Preventive measures and monitoring recommended.';
  } else {
    summary = 'Neurological health appears good. Continue brain-healthy practices.';
  }

  // Add detailed explanations
  if (cognitiveScore) {
    details.push(`Estimated cognitive function: ${cognitiveScore}% of optimal`);
  }

  if (strokeRisk && strokeRisk > 20) {
    details.push(`Stroke risk: ${strokeRisk}% - Focus on cardiovascular health`);
  }

  if (dementiaRisk && dementiaRisk > 25) {
    details.push(`Dementia risk: ${dementiaRisk}% - Engage in cognitive activities and social interaction`);
  }

  if (depressionRisk && depressionRisk > 30) {
    details.push(`Depression risk: ${depressionRisk}% - Consider mental health support`);
  }

  if (riskFactors.includes('Age Factor')) {
    details.push('Age-related cognitive changes are normal, but healthy lifestyle can slow decline.');
  }

  if (riskFactors.includes('High Blood Pressure')) {
    details.push('High blood pressure increases risk of stroke and vascular dementia.');
  }

  return { summary, details, urgency };
}

