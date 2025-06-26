/**
 * Cardiovascular Analysis Algorithms
 * Medical algorithms for cardiovascular risk assessment and heart health prediction.
 * Based on established clinical guidelines and enhanced with AI predictions.
 */

import { HealthData } from '../../core/types/core';

export interface CardiovascularRiskResult {
  riskScore: number;
  riskFactors: string[];
  framinghamScore?: number;
  ascvdScore?: number;
  heartAge?: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'very-high';
  recommendations: string[];
}

/**
 * Calculate comprehensive cardiovascular risk score
 * Combines multiple validated risk assessment tools
 */
export function calculateCardiovascularRisk(healthData: HealthData, model?: any): CardiovascularRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Calculate individual risk scores
  const framinghamScore = calculateFraminghamRisk(healthData);
  const ascvdScore = calculateASCVDRisk(healthData);
  const heartAge = calculateHeartAge(healthData);

  // Primary risk factors assessment

  // 1. Blood Pressure Assessment (Major Risk Factor)
  if (healthData.bloodPressureSystolic && healthData.bloodPressureDiastolic) {
    const systolic = healthData.bloodPressureSystolic;
    const diastolic = healthData.bloodPressureDiastolic;
    
    if (systolic >= 180 || diastolic >= 110) {
      riskScore += 35;
      riskFactors.push('Severe Hypertension (Stage 3)');
      recommendations.push('Immediate medical attention required for blood pressure control');
    } else if (systolic >= 160 || diastolic >= 100) {
      riskScore += 25;
      riskFactors.push('Stage 2 Hypertension');
      recommendations.push('Antihypertensive medication and lifestyle modifications needed');
    } else if (systolic >= 140 || diastolic >= 90) {
      riskScore += 15;
      riskFactors.push('Stage 1 Hypertension');
      recommendations.push('Lifestyle modifications and possible medication');
    } else if (systolic >= 130 || diastolic >= 80) {
      riskScore += 8;
      riskFactors.push('Elevated Blood Pressure');
      recommendations.push('Lifestyle modifications recommended');
    }
  }

  // 2. Cholesterol Assessment
  if (healthData.totalCholesterol) {
    if (healthData.totalCholesterol >= 240) {
      riskScore += 20;
      riskFactors.push('High Total Cholesterol');
      recommendations.push('Statin therapy and dietary changes recommended');
    } else if (healthData.totalCholesterol >= 200) {
      riskScore += 10;
      riskFactors.push('Borderline High Cholesterol');
      recommendations.push('Dietary modifications and regular monitoring');
    }
  }

  if (healthData.ldlCholesterol) {
    if (healthData.ldlCholesterol >= 190) {
      riskScore += 25;
      riskFactors.push('Very High LDL Cholesterol');
      recommendations.push('Aggressive statin therapy required');
    } else if (healthData.ldlCholesterol >= 160) {
      riskScore += 18;
      riskFactors.push('High LDL Cholesterol');
      recommendations.push('Statin therapy consideration');
    } else if (healthData.ldlCholesterol >= 130) {
      riskScore += 12;
      riskFactors.push('Borderline High LDL');
      recommendations.push('Lifestyle modifications');
    }
  }

  if (healthData.hdlCholesterol) {
    if (healthData.hdlCholesterol < 40) { // Men
      riskScore += 15;
      riskFactors.push('Low HDL Cholesterol');
      recommendations.push('Exercise and weight management to raise HDL');
    } else if (healthData.hdlCholesterol >= 60) {
      riskScore -= 5; // Protective factor
    }
  }

  if (healthData.triglycerides) {
    if (healthData.triglycerides >= 500) {
      riskScore += 20;
      riskFactors.push('Very High Triglycerides');
      recommendations.push('Immediate treatment to prevent pancreatitis');
    } else if (healthData.triglycerides >= 200) {
      riskScore += 12;
      riskFactors.push('High Triglycerides');
      recommendations.push('Dietary changes and possible medication');
    } else if (healthData.triglycerides >= 150) {
      riskScore += 6;
      riskFactors.push('Borderline High Triglycerides');
      recommendations.push('Lifestyle modifications');
    }
  }

  // 3. Diabetes Assessment
  if (healthData.glucose) {
    if (healthData.glucose >= 126 || healthData.hba1c >= 6.5) {
      riskScore += 25;
      riskFactors.push('Diabetes Mellitus');
      recommendations.push('Optimal diabetes management crucial for cardiovascular health');
    } else if (healthData.glucose >= 100 || healthData.hba1c >= 5.7) {
      riskScore += 12;
      riskFactors.push('Pre-diabetes');
      recommendations.push('Lifestyle intervention to prevent diabetes progression');
    }
  }

  // 4. Age and Gender Factors
  if (healthData.age) {
    if (healthData.sex === 'male') {
      if (healthData.age >= 45) {
        riskScore += Math.min(15, (healthData.age - 45) * 0.8);
        riskFactors.push('Age-related Risk (Male)');
      }
    } else {
      if (healthData.age >= 55) {
        riskScore += Math.min(12, (healthData.age - 55) * 0.7);
        riskFactors.push('Age-related Risk (Female)');
      }
    }
  }

  // 5. Lifestyle Risk Factors
  if (healthData.smoking) {
    riskScore += 20;
    riskFactors.push('Current Smoking');
    recommendations.push('Smoking cessation is the most important intervention');
  }

  if (healthData.bmi) {
    if (healthData.bmi >= 35) {
      riskScore += 15;
      riskFactors.push('Severe Obesity');
      recommendations.push('Weight loss surgery consideration');
    } else if (healthData.bmi >= 30) {
      riskScore += 10;
      riskFactors.push('Obesity');
      recommendations.push('Structured weight loss program');
    } else if (healthData.bmi >= 25) {
      riskScore += 5;
      riskFactors.push('Overweight');
      recommendations.push('Weight management through diet and exercise');
    }
  }

  // 6. Family History
  if (healthData.familyHistory?.includes('heart_disease')) {
    riskScore += 12;
    riskFactors.push('Family History of Heart Disease');
    recommendations.push('Enhanced screening and preventive measures');
  }

  // 7. Physical Activity
  if (healthData.physicalActivity === 'sedentary') {
    riskScore += 8;
    riskFactors.push('Sedentary Lifestyle');
    recommendations.push('Regular aerobic exercise at least 150 minutes per week');
  }

  // 8. Additional Biomarkers
  if (healthData.crp && healthData.crp > 3.0) {
    riskScore += 8;
    riskFactors.push('Elevated Inflammation (CRP)');
    recommendations.push('Anti-inflammatory lifestyle measures');
  }

  // 9. Existing Cardiovascular Conditions
  if (healthData.cardiovascularDisease) {
    riskScore += 30;
    riskFactors.push('Existing Cardiovascular Disease');
    recommendations.push('Secondary prevention measures and optimal medical therapy');
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictCardiovascularRiskWithAI(healthData, model);
      // Combine traditional risk score (75%) with AI prediction (25%)
      riskScore = riskScore * 0.75 + aiPrediction * 0.25;
    } catch (error) {
      console.warn('[CardiovascularAnalysis] AI prediction failed, using traditional algorithms only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine risk category
  let riskCategory: 'low' | 'moderate' | 'high' | 'very-high';
  if (riskScore >= 80) {
    riskCategory = 'very-high';
  } else if (riskScore >= 60) {
    riskCategory = 'high';
  } else if (riskScore >= 30) {
    riskCategory = 'moderate';
  } else {
    riskCategory = 'low';
  }

  // Add general recommendations based on risk category
  if (riskCategory === 'very-high') {
    recommendations.unshift('Immediate cardiology consultation required');
    recommendations.push('Intensive risk factor modification');
  } else if (riskCategory === 'high') {
    recommendations.unshift('Cardiology evaluation recommended');
    recommendations.push('Aggressive risk factor management');
  } else if (riskCategory === 'moderate') {
    recommendations.unshift('Regular cardiovascular monitoring');
    recommendations.push('Lifestyle modifications and possible medication');
  } else {
    recommendations.unshift('Continue healthy lifestyle practices');
    recommendations.push('Regular health screenings');
  }

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    framinghamScore,
    ascvdScore,
    heartAge,
    riskCategory,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}

/**
 * Calculate Framingham Risk Score (10-year CHD risk)
 */
function calculateFraminghamRisk(healthData: HealthData): number {
  if (!healthData.age || !healthData.sex) return 0;

  let points = 0;
  const age = healthData.age;
  const isMale = healthData.sex === 'male';

  // Age points
  if (isMale) {
    if (age >= 70) points += 11;
    else if (age >= 65) points += 10;
    else if (age >= 60) points += 8;
    else if (age >= 55) points += 6;
    else if (age >= 50) points += 4;
    else if (age >= 45) points += 2;
    else if (age >= 40) points += 1;
  } else {
    if (age >= 70) points += 12;
    else if (age >= 65) points += 9;
    else if (age >= 60) points += 7;
    else if (age >= 55) points += 4;
    else if (age >= 50) points += 2;
    else if (age >= 45) points += 1;
  }

  // Total cholesterol points
  if (healthData.totalCholesterol) {
    const chol = healthData.totalCholesterol;
    if (chol >= 280) points += isMale ? 3 : 4;
    else if (chol >= 240) points += isMale ? 2 : 2;
    else if (chol >= 200) points += isMale ? 1 : 1;
  }

  // HDL cholesterol points
  if (healthData.hdlCholesterol) {
    const hdl = healthData.hdlCholesterol;
    if (hdl < 35) points += 2;
    else if (hdl < 45) points += 1;
    else if (hdl >= 60) points -= 1;
  }

  // Blood pressure points
  if (healthData.bloodPressureSystolic) {
    const sbp = healthData.bloodPressureSystolic;
    if (sbp >= 160) points += 2;
    else if (sbp >= 140) points += 1;
  }

  // Diabetes
  if (healthData.glucose >= 126 || healthData.hba1c >= 6.5) {
    points += isMale ? 2 : 4;
  }

  // Smoking
  if (healthData.smoking) {
    points += isMale ? 2 : 3;
  }

  // Convert points to percentage risk
  const riskTable = [1, 1, 2, 2, 3, 4, 4, 5, 7, 8, 10, 13, 16, 20, 25, 31, 37, 45];
  const riskIndex = Math.min(Math.max(points, 0), riskTable.length - 1);
  
  return riskTable[riskIndex];
}

/**
 * Calculate ASCVD Risk Score (10-year risk)
 */
function calculateASCVDRisk(healthData: HealthData): number {
  if (!healthData.age || !healthData.sex || healthData.age < 40 || healthData.age > 79) {
    return 0;
  }

  const isMale = healthData.sex === 'male';
  const isBlack = healthData.ethnicity === 'black';
  
  // ASCVD Risk Calculator coefficients
  let lnAge = Math.log(healthData.age);
  let lnTotalChol = healthData.totalCholesterol ? Math.log(healthData.totalCholesterol) : Math.log(200);
  let lnHdl = healthData.hdlCholesterol ? Math.log(healthData.hdlCholesterol) : Math.log(50);
  let lnSbp = healthData.bloodPressureSystolic ? Math.log(healthData.bloodPressureSystolic) : Math.log(120);
  
  let diabetes = (healthData.glucose >= 126 || healthData.hba1c >= 6.5) ? 1 : 0;
  let smoking = healthData.smoking ? 1 : 0;
  
  let sum = 0;
  
  if (isMale) {
    if (isBlack) {
      // Black male coefficients
      sum = 2.469 * lnAge + 0.302 * lnTotalChol - 0.307 * lnHdl + 
            1.916 * lnSbp + 0.549 * diabetes + 0.645 * smoking;
    } else {
      // White male coefficients
      sum = 12.344 * lnAge + 11.853 * lnTotalChol - 2.664 * lnHdl + 
            7.990 * lnSbp + 1.797 * diabetes + 1.764 * smoking;
    }
  } else {
    if (isBlack) {
      // Black female coefficients
      sum = 17.114 * lnAge + 0.940 * lnTotalChol - 18.920 * lnHdl + 
            4.475 * lnSbp + 2.019 * diabetes + 1.957 * smoking;
    } else {
      // White female coefficients
      sum = -29.799 * lnAge + 4.884 * lnTotalChol - 13.540 * lnHdl + 
            20.350 * lnSbp + 22.465 * diabetes + 12.096 * smoking;
    }
  }
  
  // Calculate risk percentage
  let risk = 1 - Math.pow(0.9144, Math.exp(sum - 61.18));
  return Math.max(0, Math.min(100, risk * 100));
}

/**
 * Calculate Heart Age
 */
function calculateHeartAge(healthData: HealthData): number {
  if (!healthData.age) return healthData.age || 40;
  
  let ageAdjustment = 0;
  
  // Blood pressure adjustment
  if (healthData.bloodPressureSystolic) {
    if (healthData.bloodPressureSystolic >= 160) ageAdjustment += 10;
    else if (healthData.bloodPressureSystolic >= 140) ageAdjustment += 5;
  }
  
  // Cholesterol adjustment
  if (healthData.totalCholesterol >= 240) ageAdjustment += 5;
  if (healthData.hdlCholesterol && healthData.hdlCholesterol < 40) ageAdjustment += 3;
  
  // Lifestyle factors
  if (healthData.smoking) ageAdjustment += 8;
  if (healthData.bmi >= 30) ageAdjustment += 3;
  if (healthData.physicalActivity === 'sedentary') ageAdjustment += 2;
  
  // Diabetes
  if (healthData.glucose >= 126) ageAdjustment += 6;
  
  return healthData.age + ageAdjustment;
}

/**
 * AI-based cardiovascular risk prediction
 */
function predictCardiovascularRiskWithAI(healthData: HealthData, model: any): number {
  // This would use the actual TensorFlow.js model
  // For now, return a mock prediction based on key factors
  
  const features = [
    healthData.age || 50,
    healthData.bloodPressureSystolic || 120,
    healthData.totalCholesterol || 200,
    healthData.hdlCholesterol || 50,
    healthData.glucose || 90,
    healthData.sex === 'male' ? 1 : 0,
    healthData.smoking ? 1 : 0,
    healthData.bmi || 25,
    healthData.physicalActivity === 'sedentary' ? 1 : 0
  ];

  // Mock AI prediction - in reality, this would use model.predict()
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [100, 200, 400, 100, 300, 1, 1, 50, 1];
    return f / maxValues[i];
  });

  const prediction = normalizedFeatures.reduce((sum, f, i) => {
    const weights = [0.15, 0.20, 0.15, -0.10, 0.18, 0.08, 0.12, 0.08, 0.04];
    return sum + f * weights[i];
  }, 0) * 100;
  
  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed cardiovascular health insights
 */
export function generateCardiovascularInsights(result: CardiovascularRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
  interventions: string[];
} {
  const { riskScore, riskCategory, riskFactors, recommendations, framinghamScore, ascvdScore, heartAge } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];
  const interventions: string[] = [];

  // Determine urgency and summary based on risk category
  switch (riskCategory) {
    case 'very-high':
      urgency = 'high';
      summary = 'Very high cardiovascular risk detected. Immediate medical intervention required.';
      interventions.push('Emergency cardiology consultation');
      interventions.push('Intensive statin therapy');
      interventions.push('Blood pressure optimization');
      break;
    case 'high':
      urgency = 'high';
      summary = 'High cardiovascular risk. Prompt medical evaluation and aggressive risk factor modification needed.';
      interventions.push('Cardiology referral within 2 weeks');
      interventions.push('Statin therapy initiation');
      interventions.push('Lifestyle counseling');
      break;
    case 'moderate':
      urgency = 'medium';
      summary = 'Moderate cardiovascular risk. Lifestyle modifications and regular monitoring recommended.';
      interventions.push('Primary care follow-up in 3 months');
      interventions.push('Dietary consultation');
      interventions.push('Exercise program');
      break;
    case 'low':
      summary = 'Low cardiovascular risk. Continue current healthy practices with regular screening.';
      interventions.push('Annual health screening');
      interventions.push('Maintain healthy lifestyle');
      break;
  }

  // Add detailed risk score information
  details.push(`Overall Cardiovascular Risk Score: ${riskScore}/100 (${riskCategory.replace('-', ' ').toUpperCase()} risk)`);
  
  if (framinghamScore) {
    details.push(`Framingham 10-year CHD Risk: ${framinghamScore}%`);
  }
  
  if (ascvdScore) {
    details.push(`ASCVD 10-year Risk: ${ascvdScore.toFixed(1)}%`);
  }
  
  if (heartAge) {
    details.push(`Estimated Heart Age: ${heartAge} years`);
  }

  // Add risk factor explanations
  if (riskFactors.includes('Severe Hypertension (Stage 3)')) {
    details.push('Blood pressure is dangerously high and requires immediate medical attention.');
  }
  
  if (riskFactors.includes('High Total Cholesterol')) {
    details.push('Elevated cholesterol levels significantly increase heart disease risk.');
  }
  
  if (riskFactors.includes('Current Smoking')) {
    details.push('Smoking is the most preventable risk factor for heart disease.');
  }
  
  if (riskFactors.includes('Diabetes Mellitus')) {
    details.push('Diabetes doubles the risk of heart disease and stroke.');
  }

  return { 
    summary, 
    details, 
    urgency, 
    interventions: [...new Set(interventions)]
  };
}

