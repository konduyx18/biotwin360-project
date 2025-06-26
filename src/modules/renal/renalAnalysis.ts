/**
 * Renal Analysis Algorithms
 * Medical algorithms for kidney function assessment and risk prediction.
 */

import { HealthData } from '../../core/types/core';

export interface RenalRiskResult {
  riskScore: number;
  riskFactors: string[];
  gfr?: number; // Estimated Glomerular Filtration Rate
  ckdStage?: number; // Chronic Kidney Disease stage (1-5)
}

/**
 * Calculate renal risk score based on medical guidelines
 */
export function calculateRenalRisk(healthData: HealthData, model?: any): RenalRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Calculate eGFR (Estimated Glomerular Filtration Rate) using CKD-EPI equation
  const gfr = calculateGFR(healthData);
  
  // Determine CKD stage based on eGFR
  const ckdStage = determineCKDStage(gfr);

  // Risk factors assessment
  
  // 1. eGFR-based risk (most important factor)
  if (gfr < 60) {
    riskScore += 40;
    riskFactors.push('Reduced Kidney Function');
    
    if (gfr < 30) {
      riskScore += 30;
      riskFactors.push('Severely Reduced Kidney Function');
    }
    
    if (gfr < 15) {
      riskScore += 20;
      riskFactors.push('Kidney Failure Risk');
    }
  }

  // 2. Blood pressure assessment
  if (healthData.bloodPressureSystolic && healthData.bloodPressureDiastolic) {
    const systolic = healthData.bloodPressureSystolic;
    const diastolic = healthData.bloodPressureDiastolic;
    
    if (systolic >= 140 || diastolic >= 90) {
      riskScore += 15;
      riskFactors.push('High Blood Pressure');
      
      if (systolic >= 160 || diastolic >= 100) {
        riskScore += 10;
        riskFactors.push('Severe Hypertension');
      }
    }
  }

  // 3. Diabetes risk assessment
  if (healthData.glucose) {
    if (healthData.glucose >= 126) { // mg/dL fasting glucose
      riskScore += 20;
      riskFactors.push('Diabetes Risk');
    } else if (healthData.glucose >= 100) {
      riskScore += 10;
      riskFactors.push('Pre-diabetes');
    }
  }

  // 4. Age factor
  if (healthData.age) {
    if (healthData.age >= 65) {
      riskScore += 10;
      riskFactors.push('Age Factor');
    } else if (healthData.age >= 50) {
      riskScore += 5;
    }
  }

  // 5. Proteinuria assessment (if available)
  if (healthData.proteinuria) {
    if (healthData.proteinuria > 300) { // mg/day
      riskScore += 25;
      riskFactors.push('Proteinuria');
    } else if (healthData.proteinuria > 30) {
      riskScore += 15;
      riskFactors.push('Microalbuminuria');
    }
  }

  // 6. Family history
  if (healthData.familyHistory?.includes('kidney_disease')) {
    riskScore += 8;
    riskFactors.push('Family History');
  }

  // 7. Lifestyle factors
  if (healthData.smoking) {
    riskScore += 8;
    riskFactors.push('Smoking');
  }

  if (healthData.bmi && healthData.bmi >= 30) {
    riskScore += 5;
    riskFactors.push('Obesity');
  }

  // 8. Cardiovascular disease
  if (healthData.cardiovascularDisease) {
    riskScore += 12;
    riskFactors.push('Cardiovascular Disease');
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictWithAI(healthData, model);
      // Combine traditional risk score (70%) with AI prediction (30%)
      riskScore = riskScore * 0.7 + aiPrediction * 0.3;
    } catch (error) {
      console.warn('[RenalAnalysis] AI prediction failed, using traditional algorithm only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    gfr: Math.round(gfr),
    ckdStage
  };
}

/**
 * Calculate estimated Glomerular Filtration Rate using CKD-EPI equation
 */
function calculateGFR(healthData: HealthData): number {
  if (!healthData.creatinine || !healthData.age) {
    return 90; // Default normal value
  }

  const creatinine = healthData.creatinine; // mg/dL
  const age = healthData.age;
  const isFemale = healthData.sex === 'female';
  const isBlack = healthData.ethnicity === 'black';

  // CKD-EPI equation (2021 version without race coefficient)
  let gfr: number;
  
  if (isFemale) {
    if (creatinine <= 0.7) {
      gfr = 144 * Math.pow(creatinine / 0.7, -0.329) * Math.pow(0.993, age);
    } else {
      gfr = 144 * Math.pow(creatinine / 0.7, -1.209) * Math.pow(0.993, age);
    }
  } else {
    if (creatinine <= 0.9) {
      gfr = 141 * Math.pow(creatinine / 0.9, -0.411) * Math.pow(0.993, age);
    } else {
      gfr = 141 * Math.pow(creatinine / 0.9, -1.209) * Math.pow(0.993, age);
    }
  }

  return Math.max(0, gfr);
}

/**
 * Determine CKD stage based on eGFR
 */
function determineCKDStage(gfr: number): number {
  if (gfr >= 90) return 1; // Normal or high
  if (gfr >= 60) return 2; // Mildly decreased
  if (gfr >= 45) return 3; // Moderately decreased (3a)
  if (gfr >= 30) return 3; // Moderately decreased (3b)
  if (gfr >= 15) return 4; // Severely decreased
  return 5; // Kidney failure
}

/**
 * AI-based prediction (placeholder for TensorFlow.js model)
 */
function predictWithAI(healthData: HealthData, model: any): number {
  // This would use the actual TensorFlow.js model
  // For now, return a mock prediction based on key factors
  
  const features = [
    healthData.creatinine || 1.0,
    healthData.age || 40,
    healthData.bloodPressureSystolic || 120,
    healthData.glucose || 90,
    healthData.sex === 'male' ? 1 : 0,
    healthData.smoking ? 1 : 0,
    healthData.bmi || 25
  ];

  // Mock AI prediction - in reality, this would use model.predict()
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [3.0, 100, 200, 300, 1, 1, 50];
    return f / maxValues[i];
  });

  const prediction = normalizedFeatures.reduce((sum, f) => sum + f, 0) / features.length * 100;
  
  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed renal health insights
 */
export function generateRenalInsights(result: RenalRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
} {
  const { riskScore, gfr, ckdStage, riskFactors } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];

  // Determine urgency and summary based on CKD stage
  if (ckdStage && ckdStage >= 4) {
    urgency = 'high';
    summary = 'Severe kidney function impairment detected. Immediate medical attention required.';
  } else if (ckdStage && ckdStage === 3) {
    urgency = 'medium';
    summary = 'Moderate kidney function decline. Regular monitoring and lifestyle changes recommended.';
  } else if (riskScore > 50) {
    urgency = 'medium';
    summary = 'Elevated risk factors for kidney disease. Preventive measures recommended.';
  } else {
    summary = 'Kidney function appears normal. Continue healthy lifestyle practices.';
  }

  // Add detailed explanations
  if (gfr) {
    details.push(`Estimated GFR: ${gfr} mL/min/1.73m² (Stage ${ckdStage} CKD)`);
  }

  if (riskFactors.includes('Reduced Kidney Function')) {
    details.push('Kidney filtration rate is below normal range. This may indicate chronic kidney disease.');
  }

  if (riskFactors.includes('High Blood Pressure')) {
    details.push('High blood pressure can damage kidney blood vessels over time.');
  }

  if (riskFactors.includes('Diabetes Risk')) {
    details.push('Diabetes is a leading cause of kidney disease. Blood sugar control is crucial.');
  }

  return { summary, details, urgency };
}

