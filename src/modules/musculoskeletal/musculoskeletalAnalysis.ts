/**
 * Musculoskeletal Analysis Algorithms
 * Medical algorithms for muscle, bone, and joint health assessment.
 */

import { HealthData } from '../../core/types/core';

export interface MusculoskeletalRiskResult {
  riskScore: number;
  riskFactors: string[];
  boneHealth?: number; // Bone health score (0-100)
  muscleStrength?: number; // Muscle strength score (0-100)
  mobilityScore?: number; // Mobility and flexibility score (0-100)
  osteoporosisRisk?: number; // Osteoporosis risk percentage
  fractureRisk?: number; // Fracture risk percentage
}

/**
 * Calculate musculoskeletal risk score based on medical guidelines
 */
export function calculateMusculoskeletalRisk(healthData: HealthData, model?: any): MusculoskeletalRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Calculate specific assessments
  const boneHealth = calculateBoneHealth(healthData);
  const muscleStrength = calculateMuscleStrength(healthData);
  const mobilityScore = calculateMobilityScore(healthData);
  const osteoporosisRisk = calculateOsteoporosisRisk(healthData);
  const fractureRisk = calculateFractureRisk(healthData);

  // Risk factors assessment
  
  // 1. Age factor (significant for bone and muscle health)
  if (healthData.age) {
    if (healthData.age >= 70) {
      riskScore += 20;
      riskFactors.push('Advanced Age');
    } else if (healthData.age >= 60) {
      riskScore += 12;
      riskFactors.push('Age Factor');
    } else if (healthData.age >= 50) {
      riskScore += 6;
    }
  }

  // 2. Gender factor (especially for osteoporosis)
  if (healthData.sex === 'female' && healthData.age && healthData.age >= 50) {
    riskScore += 8;
    riskFactors.push('Postmenopausal Risk');
  }

  // 3. Bone health assessment
  if (boneHealth < 70) {
    riskScore += 15;
    riskFactors.push('Low Bone Density');
    
    if (boneHealth < 50) {
      riskScore += 10;
      riskFactors.push('Osteoporosis Risk');
    }
  }

  // 4. Muscle strength assessment
  if (muscleStrength < 70) {
    riskScore += 12;
    riskFactors.push('Muscle Weakness');
    
    if (muscleStrength < 50) {
      riskScore += 8;
      riskFactors.push('Sarcopenia Risk');
    }
  }

  // 5. Mobility and flexibility
  if (mobilityScore < 70) {
    riskScore += 10;
    riskFactors.push('Joint Stiffness');
    
    if (mobilityScore < 50) {
      riskScore += 8;
      riskFactors.push('Mobility Impairment');
    }
  }

  // 6. Physical activity level
  if (healthData.physicalActivity === 'sedentary') {
    riskScore += 15;
    riskFactors.push('Low Physical Activity');
  } else if (healthData.physicalActivity === 'light') {
    riskScore += 8;
  }

  // 7. BMI factors
  if (healthData.bmi) {
    if (healthData.bmi < 18.5) {
      riskScore += 10;
      riskFactors.push('Underweight');
    } else if (healthData.bmi >= 30) {
      riskScore += 8;
      riskFactors.push('Obesity');
    }
  }

  // 8. Nutritional factors
  if (healthData.calciumIntake && healthData.calciumIntake < 800) { // mg/day
    riskScore += 8;
    riskFactors.push('Low Calcium Intake');
  }

  if (healthData.vitaminD && healthData.vitaminD < 20) { // ng/mL
    riskScore += 10;
    riskFactors.push('Vitamin D Deficiency');
  }

  // 9. Lifestyle factors
  if (healthData.smoking) {
    riskScore += 8;
    riskFactors.push('Smoking');
  }

  if (healthData.alcohol === 'heavy') {
    riskScore += 6;
    riskFactors.push('Heavy Alcohol Use');
  }

  // 10. Medical history
  if (healthData.previousFractures) {
    riskScore += 12;
    riskFactors.push('Previous Fractures');
  }

  if (healthData.arthritis) {
    riskScore += 10;
    riskFactors.push('Arthritis');
  }

  if (healthData.osteoporosis) {
    riskScore += 20;
    riskFactors.push('Osteoporosis');
  }

  // 11. Hormonal factors
  if (healthData.menopause && healthData.sex === 'female') {
    riskScore += 10;
    riskFactors.push('Menopause');
  }

  if (healthData.lowTestosterone && healthData.sex === 'male') {
    riskScore += 8;
    riskFactors.push('Low Testosterone');
  }

  // 12. Medications
  if (healthData.corticosteroids) {
    riskScore += 12;
    riskFactors.push('Corticosteroid Use');
  }

  // 13. Family history
  if (healthData.familyHistory?.includes('osteoporosis') || 
      healthData.familyHistory?.includes('fractures')) {
    riskScore += 8;
    riskFactors.push('Family History');
  }

  // 14. Posture assessment
  if (healthData.posture === 'poor') {
    riskScore += 8;
    riskFactors.push('Poor Posture');
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictWithAI(healthData, model);
      // Combine traditional risk score (75%) with AI prediction (25%)
      riskScore = riskScore * 0.75 + aiPrediction * 0.25;
    } catch (error) {
      console.warn('[MusculoskeletalAnalysis] AI prediction failed, using traditional algorithm only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    boneHealth: Math.round(boneHealth),
    muscleStrength: Math.round(muscleStrength),
    mobilityScore: Math.round(mobilityScore),
    osteoporosisRisk: Math.round(osteoporosisRisk),
    fractureRisk: Math.round(fractureRisk)
  };
}

/**
 * Calculate bone health score
 */
function calculateBoneHealth(healthData: HealthData): number {
  let boneHealth = 100; // Start with perfect score

  // Age-related bone loss
  if (healthData.age) {
    if (healthData.age >= 50) {
      boneHealth -= (healthData.age - 50) * 0.8;
    }
  }

  // Gender factor
  if (healthData.sex === 'female' && healthData.age && healthData.age >= 50) {
    boneHealth -= 10; // Postmenopausal bone loss
  }

  // Physical activity benefits
  if (healthData.physicalActivity === 'active') {
    boneHealth += 8;
  } else if (healthData.physicalActivity === 'sedentary') {
    boneHealth -= 15;
  }

  // Nutritional factors
  if (healthData.calciumIntake && healthData.calciumIntake >= 1000) {
    boneHealth += 5;
  } else if (healthData.calciumIntake && healthData.calciumIntake < 600) {
    boneHealth -= 10;
  }

  if (healthData.vitaminD && healthData.vitaminD >= 30) {
    boneHealth += 5;
  } else if (healthData.vitaminD && healthData.vitaminD < 20) {
    boneHealth -= 12;
  }

  // Lifestyle factors
  if (healthData.smoking) {
    boneHealth -= 10;
  }

  if (healthData.alcohol === 'heavy') {
    boneHealth -= 8;
  }

  // Medical conditions
  if (healthData.osteoporosis) {
    boneHealth -= 30;
  }

  if (healthData.corticosteroids) {
    boneHealth -= 15;
  }

  return Math.max(20, Math.min(120, boneHealth));
}

/**
 * Calculate muscle strength score
 */
function calculateMuscleStrength(healthData: HealthData): number {
  let muscleStrength = 100; // Start with perfect score

  // Age-related muscle loss (sarcopenia)
  if (healthData.age) {
    if (healthData.age >= 60) {
      muscleStrength -= (healthData.age - 60) * 1.2;
    }
  }

  // Physical activity impact
  if (healthData.physicalActivity === 'active') {
    muscleStrength += 10;
  } else if (healthData.physicalActivity === 'sedentary') {
    muscleStrength -= 20;
  }

  // Resistance training
  if (healthData.resistanceTraining) {
    muscleStrength += 15;
  }

  // Nutritional factors
  if (healthData.proteinIntake && healthData.proteinIntake >= 1.2) { // g/kg body weight
    muscleStrength += 5;
  } else if (healthData.proteinIntake && healthData.proteinIntake < 0.8) {
    muscleStrength -= 10;
  }

  // BMI impact
  if (healthData.bmi) {
    if (healthData.bmi < 18.5) {
      muscleStrength -= 15; // Underweight often means low muscle mass
    } else if (healthData.bmi >= 30) {
      muscleStrength -= 8; // Obesity can affect muscle function
    }
  }

  // Medical conditions
  if (healthData.diabetes) {
    muscleStrength -= 8;
  }

  if (healthData.chronicKidneyDisease) {
    muscleStrength -= 12;
  }

  return Math.max(20, Math.min(120, muscleStrength));
}

/**
 * Calculate mobility and flexibility score
 */
function calculateMobilityScore(healthData: HealthData): number {
  let mobilityScore = 100; // Start with perfect score

  // Age impact
  if (healthData.age) {
    if (healthData.age >= 65) {
      mobilityScore -= (healthData.age - 65) * 1.0;
    }
  }

  // Physical activity benefits
  if (healthData.physicalActivity === 'active') {
    mobilityScore += 8;
  } else if (healthData.physicalActivity === 'sedentary') {
    mobilityScore -= 15;
  }

  // Flexibility exercises
  if (healthData.flexibilityExercises) {
    mobilityScore += 10;
  }

  // Joint conditions
  if (healthData.arthritis) {
    mobilityScore -= 20;
  }

  if (healthData.jointPain) {
    mobilityScore -= 12;
  }

  // Posture
  if (healthData.posture === 'poor') {
    mobilityScore -= 10;
  } else if (healthData.posture === 'excellent') {
    mobilityScore += 5;
  }

  // Work-related factors
  if (healthData.sedentaryWork) {
    mobilityScore -= 8;
  }

  return Math.max(20, Math.min(120, mobilityScore));
}

/**
 * Calculate osteoporosis risk using established factors
 */
function calculateOsteoporosisRisk(healthData: HealthData): number {
  let osteoporosisRisk = 0;

  // Age factor
  if (healthData.age) {
    if (healthData.age >= 70) {
      osteoporosisRisk += 30;
    } else if (healthData.age >= 60) {
      osteoporosisRisk += 20;
    } else if (healthData.age >= 50) {
      osteoporosisRisk += 10;
    }
  }

  // Gender factor
  if (healthData.sex === 'female') {
    osteoporosisRisk += 15;
    if (healthData.menopause) {
      osteoporosisRisk += 10;
    }
  }

  // Family history
  if (healthData.familyHistory?.includes('osteoporosis')) {
    osteoporosisRisk += 15;
  }

  // Lifestyle factors
  if (healthData.smoking) {
    osteoporosisRisk += 10;
  }

  if (healthData.physicalActivity === 'sedentary') {
    osteoporosisRisk += 12;
  }

  // Nutritional deficiencies
  if (healthData.calciumIntake && healthData.calciumIntake < 800) {
    osteoporosisRisk += 8;
  }

  if (healthData.vitaminD && healthData.vitaminD < 20) {
    osteoporosisRisk += 10;
  }

  // Medical factors
  if (healthData.corticosteroids) {
    osteoporosisRisk += 15;
  }

  return Math.min(100, Math.max(0, osteoporosisRisk));
}

/**
 * Calculate fracture risk using FRAX-like algorithm
 */
function calculateFractureRisk(healthData: HealthData): number {
  let fractureRisk = 0;

  // Age factor
  if (healthData.age) {
    if (healthData.age >= 70) {
      fractureRisk += 25;
    } else if (healthData.age >= 60) {
      fractureRisk += 15;
    } else if (healthData.age >= 50) {
      fractureRisk += 8;
    }
  }

  // Previous fractures (strongest predictor)
  if (healthData.previousFractures) {
    fractureRisk += 30;
  }

  // Bone density
  if (healthData.boneDensity && healthData.boneDensity < -2.5) { // T-score
    fractureRisk += 25;
  } else if (healthData.boneDensity && healthData.boneDensity < -1.0) {
    fractureRisk += 10;
  }

  // Fall risk factors
  if (healthData.fallRisk) {
    fractureRisk += 15;
  }

  // Medical conditions
  if (healthData.osteoporosis) {
    fractureRisk += 20;
  }

  // Lifestyle factors
  if (healthData.smoking) {
    fractureRisk += 8;
  }

  if (healthData.alcohol === 'heavy') {
    fractureRisk += 6;
  }

  return Math.min(100, Math.max(0, fractureRisk));
}

/**
 * AI-based prediction (placeholder for TensorFlow.js model)
 */
function predictWithAI(healthData: HealthData, model: any): number {
  // This would use the actual TensorFlow.js model
  // For now, return a mock prediction based on key factors
  
  const features = [
    healthData.age || 40,
    healthData.sex === 'female' ? 1 : 0,
    healthData.bmi || 25,
    healthData.physicalActivity === 'sedentary' ? 1 : 0,
    healthData.smoking ? 1 : 0,
    healthData.calciumIntake || 800,
    healthData.vitaminD || 25,
    healthData.previousFractures ? 1 : 0
  ];

  // Mock AI prediction - in reality, this would use model.predict()
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [100, 1, 50, 1, 1, 1500, 50, 1];
    return f / maxValues[i];
  });

  const prediction = normalizedFeatures.reduce((sum, f, i) => {
    const weights = [0.2, 0.15, 0.1, 0.15, 0.1, 0.1, 0.1, 0.1]; // Feature importance
    return sum + f * weights[i];
  }, 0) * 100;
  
  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed musculoskeletal health insights
 */
export function generateMusculoskeletalInsights(result: MusculoskeletalRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
} {
  const { riskScore, boneHealth, muscleStrength, mobilityScore, osteoporosisRisk, fractureRisk, riskFactors } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];

  // Determine urgency and summary
  if (riskScore >= 65 || (fractureRisk && fractureRisk > 70) || (boneHealth && boneHealth < 40)) {
    urgency = 'high';
    summary = 'Significant musculoskeletal health concerns detected. Medical evaluation recommended.';
  } else if (riskScore >= 40 || (osteoporosisRisk && osteoporosisRisk > 50)) {
    urgency = 'medium';
    summary = 'Moderate musculoskeletal risk factors present. Preventive measures recommended.';
  } else {
    summary = 'Musculoskeletal health appears good. Continue healthy practices.';
  }

  // Add detailed explanations
  if (boneHealth) {
    details.push(`Bone health score: ${boneHealth}% of optimal`);
  }

  if (muscleStrength) {
    details.push(`Muscle strength score: ${muscleStrength}% of optimal`);
  }

  if (mobilityScore) {
    details.push(`Mobility and flexibility score: ${mobilityScore}% of optimal`);
  }

  if (osteoporosisRisk && osteoporosisRisk > 30) {
    details.push(`Osteoporosis risk: ${osteoporosisRisk}% - Consider bone density testing`);
  }

  if (fractureRisk && fractureRisk > 25) {
    details.push(`Fracture risk: ${fractureRisk}% - Focus on fall prevention and bone health`);
  }

  if (riskFactors.includes('Low Physical Activity')) {
    details.push('Regular weight-bearing exercise is crucial for bone and muscle health.');
  }

  if (riskFactors.includes('Low Calcium Intake') || riskFactors.includes('Vitamin D Deficiency')) {
    details.push('Adequate calcium and vitamin D are essential for bone health.');
  }

  return { summary, details, urgency };
}

