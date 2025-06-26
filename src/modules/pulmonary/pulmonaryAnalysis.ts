/**
 * Pulmonary Analysis Algorithms
 * Medical algorithms for lung function assessment and respiratory risk prediction.
 */

import { HealthData } from '../../core/types/core';

export interface PulmonaryRiskResult {
  riskScore: number;
  riskFactors: string[];
  lungCapacity?: number; // Predicted lung capacity percentage
  copdRisk?: number; // COPD risk percentage
  asthmaRisk?: number; // Asthma risk percentage
}

/**
 * Calculate pulmonary risk score based on medical guidelines
 */
export function calculatePulmonaryRisk(healthData: HealthData, model?: any): PulmonaryRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Calculate predicted lung capacity
  const lungCapacity = calculateLungCapacity(healthData);
  
  // Calculate specific disease risks
  const copdRisk = calculateCOPDRisk(healthData);
  const asthmaRisk = calculateAsthmaRisk(healthData);

  // Risk factors assessment
  
  // 1. Smoking (most significant risk factor)
  if (healthData.smoking) {
    riskScore += 35;
    riskFactors.push('Smoking');
    
    if (healthData.smokingPackYears && healthData.smokingPackYears > 20) {
      riskScore += 20;
      riskFactors.push('Heavy Smoking History');
    }
  }

  // 2. Age factor
  if (healthData.age) {
    if (healthData.age >= 65) {
      riskScore += 12;
      riskFactors.push('Age Factor');
    } else if (healthData.age >= 50) {
      riskScore += 6;
    }
  }

  // 3. Environmental factors
  if (healthData.airPollutionExposure) {
    riskScore += 15;
    riskFactors.push('Air Pollution Exposure');
  }

  if (healthData.occupationalExposure?.includes('dust') || 
      healthData.occupationalExposure?.includes('chemicals')) {
    riskScore += 12;
    riskFactors.push('Occupational Hazards');
  }

  // 4. Medical history
  if (healthData.asthmaHistory) {
    riskScore += 18;
    riskFactors.push('Asthma History');
  }

  if (healthData.allergies?.length && healthData.allergies.length > 0) {
    riskScore += 8;
    riskFactors.push('Allergies');
  }

  if (healthData.respiratoryInfections && healthData.respiratoryInfections > 2) {
    riskScore += 10;
    riskFactors.push('Frequent Respiratory Infections');
  }

  // 5. Physical factors
  if (healthData.bmi) {
    if (healthData.bmi >= 30) {
      riskScore += 8;
      riskFactors.push('Obesity');
    } else if (healthData.bmi < 18.5) {
      riskScore += 6;
      riskFactors.push('Underweight');
    }
  }

  // 6. Physical activity
  if (healthData.physicalActivity === 'sedentary') {
    riskScore += 10;
    riskFactors.push('Low Physical Activity');
  }

  // 7. Family history
  if (healthData.familyHistory?.includes('lung_disease') || 
      healthData.familyHistory?.includes('asthma')) {
    riskScore += 8;
    riskFactors.push('Family History');
  }

  // 8. Cardiovascular factors (heart-lung connection)
  if (healthData.bloodPressureSystolic && healthData.bloodPressureSystolic >= 140) {
    riskScore += 5;
    riskFactors.push('High Blood Pressure');
  }

  // 9. Sleep disorders
  if (healthData.sleepApnea) {
    riskScore += 8;
    riskFactors.push('Sleep Apnea');
  }

  // 10. Lung capacity assessment
  if (lungCapacity < 70) {
    riskScore += 20;
    riskFactors.push('Reduced Lung Capacity');
    
    if (lungCapacity < 50) {
      riskScore += 15;
      riskFactors.push('Severely Reduced Lung Capacity');
    }
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictWithAI(healthData, model);
      // Combine traditional risk score (75%) with AI prediction (25%)
      riskScore = riskScore * 0.75 + aiPrediction * 0.25;
    } catch (error) {
      console.warn('[PulmonaryAnalysis] AI prediction failed, using traditional algorithm only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    lungCapacity: Math.round(lungCapacity),
    copdRisk: Math.round(copdRisk),
    asthmaRisk: Math.round(asthmaRisk)
  };
}

/**
 * Calculate predicted lung capacity based on demographics and health factors
 */
function calculateLungCapacity(healthData: HealthData): number {
  if (!healthData.age || !healthData.height) {
    return 85; // Default normal value
  }

  const age = healthData.age;
  const height = healthData.height; // in cm
  const isMale = healthData.sex === 'male';

  // Predicted FEV1 (Forced Expiratory Volume in 1 second) using reference equations
  let predictedFEV1: number;
  
  if (isMale) {
    // Male reference equation (Hankinson et al.)
    predictedFEV1 = (0.5536 * height - 0.01303 * age - 4.1960) * 1000;
  } else {
    // Female reference equation
    predictedFEV1 = (0.4333 * height - 0.00361 * age - 2.6387) * 1000;
  }

  // Adjust for health factors
  let capacityPercentage = 100;

  if (healthData.smoking) {
    capacityPercentage -= 15;
    if (healthData.smokingPackYears && healthData.smokingPackYears > 10) {
      capacityPercentage -= healthData.smokingPackYears * 0.5;
    }
  }

  if (healthData.asthmaHistory) {
    capacityPercentage -= 10;
  }

  if (healthData.airPollutionExposure) {
    capacityPercentage -= 8;
  }

  if (healthData.bmi && healthData.bmi >= 30) {
    capacityPercentage -= 5;
  }

  if (healthData.physicalActivity === 'active') {
    capacityPercentage += 5;
  } else if (healthData.physicalActivity === 'sedentary') {
    capacityPercentage -= 8;
  }

  return Math.max(30, Math.min(120, capacityPercentage));
}

/**
 * Calculate COPD risk using established risk factors
 */
function calculateCOPDRisk(healthData: HealthData): number {
  let copdRisk = 0;

  if (healthData.smoking) {
    copdRisk += 40;
    if (healthData.smokingPackYears && healthData.smokingPackYears > 20) {
      copdRisk += 30;
    }
  }

  if (healthData.age && healthData.age >= 40) {
    copdRisk += (healthData.age - 40) * 0.5;
  }

  if (healthData.occupationalExposure?.includes('dust')) {
    copdRisk += 15;
  }

  if (healthData.airPollutionExposure) {
    copdRisk += 10;
  }

  if (healthData.familyHistory?.includes('lung_disease')) {
    copdRisk += 8;
  }

  return Math.min(100, Math.max(0, copdRisk));
}

/**
 * Calculate asthma risk based on triggers and history
 */
function calculateAsthmaRisk(healthData: HealthData): number {
  let asthmaRisk = 0;

  if (healthData.asthmaHistory) {
    asthmaRisk += 60;
  }

  if (healthData.allergies?.length && healthData.allergies.length > 0) {
    asthmaRisk += 20;
  }

  if (healthData.familyHistory?.includes('asthma')) {
    asthmaRisk += 15;
  }

  if (healthData.age && healthData.age < 18) {
    asthmaRisk += 10; // Higher risk in children
  }

  if (healthData.airPollutionExposure) {
    asthmaRisk += 8;
  }

  if (healthData.smoking) {
    asthmaRisk += 12;
  }

  return Math.min(100, Math.max(0, asthmaRisk));
}

/**
 * AI-based prediction (placeholder for TensorFlow.js model)
 */
function predictWithAI(healthData: HealthData, model: any): number {
  // This would use the actual TensorFlow.js model
  // For now, return a mock prediction based on key factors
  
  const features = [
    healthData.age || 40,
    healthData.smoking ? 1 : 0,
    healthData.smokingPackYears || 0,
    healthData.bmi || 25,
    healthData.physicalActivity === 'sedentary' ? 1 : 0,
    healthData.asthmaHistory ? 1 : 0,
    healthData.airPollutionExposure ? 1 : 0
  ];

  // Mock AI prediction - in reality, this would use model.predict()
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [100, 1, 50, 50, 1, 1, 1];
    return f / maxValues[i];
  });

  const prediction = normalizedFeatures.reduce((sum, f, i) => {
    const weights = [0.2, 0.3, 0.25, 0.1, 0.05, 0.15, 0.1]; // Feature importance
    return sum + f * weights[i];
  }, 0) * 100;
  
  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed pulmonary health insights
 */
export function generatePulmonaryInsights(result: PulmonaryRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
} {
  const { riskScore, lungCapacity, copdRisk, asthmaRisk, riskFactors } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];

  // Determine urgency and summary
  if (riskScore >= 70 || (lungCapacity && lungCapacity < 50)) {
    urgency = 'high';
    summary = 'Significant respiratory health concerns detected. Medical evaluation recommended.';
  } else if (riskScore >= 40 || (copdRisk && copdRisk > 50)) {
    urgency = 'medium';
    summary = 'Moderate respiratory risk factors present. Lifestyle changes and monitoring recommended.';
  } else {
    summary = 'Respiratory health appears good. Continue healthy practices.';
  }

  // Add detailed explanations
  if (lungCapacity) {
    details.push(`Estimated lung capacity: ${lungCapacity}% of predicted normal`);
  }

  if (copdRisk && copdRisk > 30) {
    details.push(`COPD risk: ${copdRisk}% - Consider pulmonary function testing`);
  }

  if (asthmaRisk && asthmaRisk > 40) {
    details.push(`Asthma risk: ${asthmaRisk}% - Monitor for respiratory symptoms`);
  }

  if (riskFactors.includes('Smoking')) {
    details.push('Smoking is the leading cause of preventable lung disease. Quitting provides immediate benefits.');
  }

  if (riskFactors.includes('Air Pollution Exposure')) {
    details.push('Long-term air pollution exposure can cause chronic respiratory problems.');
  }

  return { summary, details, urgency };
}

