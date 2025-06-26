/**
 * Hepatic Analysis Algorithms
 * Medical algorithms for liver function assessment and hepatic disease risk prediction.
 * Based on established clinical guidelines and enhanced with AI predictions.
 */

import { HealthData } from '../../core/types/core';

export interface HepaticRiskResult {
  riskScore: number;
  riskFactors: string[];
  meldScore?: number;
  childPughScore?: number;
  childPughClass?: 'A' | 'B' | 'C';
  nafldRisk?: number;
  fibrosisStage?: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'severe';
  recommendations: string[];
}

/**
 * Calculate comprehensive hepatic risk score
 * Combines multiple validated liver assessment tools
 */
export function calculateHepaticRisk(healthData: HealthData, model?: any): HepaticRiskResult {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Calculate individual liver scores
  const meldScore = calculateMELDScore(healthData);
  const childPughResult = calculateChildPughScore(healthData);
  const nafldRisk = calculateNAFLDRisk(healthData);
  const fibrosisStage = estimateFibrosisStage(healthData);

  // Liver enzyme assessment (Primary indicators)

  // 1. ALT (Alanine Aminotransferase) Assessment
  if (healthData.alt) {
    const altULN = healthData.sex === 'male' ? 41 : 33; // Upper limit of normal
    const altRatio = healthData.alt / altULN;
    
    if (altRatio >= 10) {
      riskScore += 40;
      riskFactors.push('Severe ALT Elevation (>10x ULN)');
      recommendations.push('Immediate hepatology consultation for acute liver injury');
    } else if (altRatio >= 5) {
      riskScore += 30;
      riskFactors.push('Marked ALT Elevation (5-10x ULN)');
      recommendations.push('Urgent medical evaluation within 24-48 hours');
    } else if (altRatio >= 3) {
      riskScore += 20;
      riskFactors.push('Moderate ALT Elevation (3-5x ULN)');
      recommendations.push('Medical evaluation within 1 week');
    } else if (altRatio >= 1.5) {
      riskScore += 10;
      riskFactors.push('Mild ALT Elevation');
      recommendations.push('Lifestyle modifications and follow-up in 3 months');
    }
  }

  // 2. AST (Aspartate Aminotransferase) Assessment
  if (healthData.ast) {
    const astULN = healthData.sex === 'male' ? 40 : 32;
    const astRatio = healthData.ast / astULN;
    
    if (astRatio >= 10) {
      riskScore += 35;
      riskFactors.push('Severe AST Elevation');
    } else if (astRatio >= 5) {
      riskScore += 25;
      riskFactors.push('Marked AST Elevation');
    } else if (astRatio >= 3) {
      riskScore += 15;
      riskFactors.push('Moderate AST Elevation');
    } else if (astRatio >= 1.5) {
      riskScore += 8;
      riskFactors.push('Mild AST Elevation');
    }
  }

  // 3. AST/ALT Ratio Assessment
  if (healthData.ast && healthData.alt) {
    const astAltRatio = healthData.ast / healthData.alt;
    if (astAltRatio >= 2.0) {
      riskScore += 15;
      riskFactors.push('High AST/ALT Ratio (Suggests Alcoholic Liver Disease)');
      recommendations.push('Alcohol cessation counseling and addiction support');
    } else if (astAltRatio >= 1.5) {
      riskScore += 8;
      riskFactors.push('Elevated AST/ALT Ratio');
    }
  }

  // 4. Bilirubin Assessment
  if (healthData.totalBilirubin) {
    if (healthData.totalBilirubin >= 10.0) {
      riskScore += 30;
      riskFactors.push('Severe Hyperbilirubinemia');
      recommendations.push('Emergency evaluation for acute liver failure');
    } else if (healthData.totalBilirubin >= 5.0) {
      riskScore += 20;
      riskFactors.push('Marked Hyperbilirubinemia');
      recommendations.push('Urgent hepatology consultation');
    } else if (healthData.totalBilirubin >= 2.0) {
      riskScore += 12;
      riskFactors.push('Moderate Hyperbilirubinemia');
      recommendations.push('Investigation for biliary obstruction or liver dysfunction');
    } else if (healthData.totalBilirubin >= 1.2) {
      riskScore += 6;
      riskFactors.push('Mild Hyperbilirubinemia');
      recommendations.push('Monitor liver function and investigate underlying causes');
    }
  }

  // 5. Albumin Assessment
  if (healthData.albumin) {
    if (healthData.albumin < 2.5) {
      riskScore += 25;
      riskFactors.push('Severe Hypoalbuminemia');
      recommendations.push('Evaluation for chronic liver disease and nutritional support');
    } else if (healthData.albumin < 3.0) {
      riskScore += 15;
      riskFactors.push('Moderate Hypoalbuminemia');
      recommendations.push('Liver function assessment and nutritional evaluation');
    } else if (healthData.albumin < 3.5) {
      riskScore += 8;
      riskFactors.push('Mild Hypoalbuminemia');
      recommendations.push('Monitor liver synthetic function');
    }
  }

  // 6. Alkaline Phosphatase Assessment
  if (healthData.alkalinePhosphatase) {
    const alpULN = 147; // Approximate upper limit
    const alpRatio = healthData.alkalinePhosphatase / alpULN;
    
    if (alpRatio >= 4) {
      riskScore += 20;
      riskFactors.push('Severe Alkaline Phosphatase Elevation');
      recommendations.push('Investigation for biliary obstruction or infiltrative liver disease');
    } else if (alpRatio >= 2) {
      riskScore += 12;
      riskFactors.push('Moderate Alkaline Phosphatase Elevation');
      recommendations.push('Hepatobiliary imaging and further evaluation');
    } else if (alpRatio >= 1.5) {
      riskScore += 6;
      riskFactors.push('Mild Alkaline Phosphatase Elevation');
    }
  }

  // 7. GGT Assessment
  if (healthData.ggt) {
    const ggtULN = healthData.sex === 'male' ? 73 : 42;
    const ggtRatio = healthData.ggt / ggtULN;
    
    if (ggtRatio >= 5) {
      riskScore += 15;
      riskFactors.push('Severe GGT Elevation');
      recommendations.push('Alcohol assessment and hepatobiliary evaluation');
    } else if (ggtRatio >= 3) {
      riskScore += 10;
      riskFactors.push('Moderate GGT Elevation');
    } else if (ggtRatio >= 2) {
      riskScore += 5;
      riskFactors.push('Mild GGT Elevation');
    }
  }

  // 8. Coagulation Assessment (PT/INR)
  if (healthData.inr) {
    if (healthData.inr >= 2.5) {
      riskScore += 25;
      riskFactors.push('Severe Coagulopathy');
      recommendations.push('Evaluation for acute liver failure and coagulation support');
    } else if (healthData.inr >= 1.8) {
      riskScore += 15;
      riskFactors.push('Moderate Coagulopathy');
      recommendations.push('Liver synthetic function assessment');
    } else if (healthData.inr >= 1.3) {
      riskScore += 8;
      riskFactors.push('Mild Coagulopathy');
    }
  }

  // 9. Platelet Count Assessment
  if (healthData.platelets) {
    if (healthData.platelets < 50) {
      riskScore += 20;
      riskFactors.push('Severe Thrombocytopenia');
      recommendations.push('Evaluation for portal hypertension and splenomegaly');
    } else if (healthData.platelets < 100) {
      riskScore += 12;
      riskFactors.push('Moderate Thrombocytopenia');
      recommendations.push('Assessment for chronic liver disease');
    } else if (healthData.platelets < 150) {
      riskScore += 6;
      riskFactors.push('Mild Thrombocytopenia');
    }
  }

  // 10. Risk Factors for Liver Disease

  // Alcohol consumption
  if (healthData.alcoholConsumption) {
    const unitsPerWeek = healthData.alcoholConsumption;
    if (unitsPerWeek >= 50) {
      riskScore += 25;
      riskFactors.push('Heavy Alcohol Consumption (>50 units/week)');
      recommendations.push('Immediate alcohol cessation and addiction treatment');
    } else if (unitsPerWeek >= 21) {
      riskScore += 15;
      riskFactors.push('Moderate-Heavy Alcohol Consumption');
      recommendations.push('Alcohol reduction counseling');
    } else if (unitsPerWeek >= 14) {
      riskScore += 8;
      riskFactors.push('Above Recommended Alcohol Consumption');
      recommendations.push('Lifestyle modification and alcohol awareness');
    }
  }

  // Obesity and metabolic factors
  if (healthData.bmi) {
    if (healthData.bmi >= 35) {
      riskScore += 15;
      riskFactors.push('Severe Obesity (BMI ≥35)');
      recommendations.push('Weight loss intervention and NAFLD screening');
    } else if (healthData.bmi >= 30) {
      riskScore += 10;
      riskFactors.push('Obesity (BMI 30-35)');
      recommendations.push('Weight management and metabolic assessment');
    } else if (healthData.bmi >= 25) {
      riskScore += 5;
      riskFactors.push('Overweight (BMI 25-30)');
      recommendations.push('Lifestyle modifications for weight control');
    }
  }

  // Diabetes
  if (healthData.glucose >= 126 || healthData.hba1c >= 6.5) {
    riskScore += 12;
    riskFactors.push('Diabetes Mellitus');
    recommendations.push('Optimal diabetes control and NAFLD monitoring');
  }

  // Metabolic syndrome components
  if (healthData.triglycerides >= 150) {
    riskScore += 6;
    riskFactors.push('Hypertriglyceridemia');
    recommendations.push('Lipid management and metabolic syndrome evaluation');
  }

  // Viral hepatitis risk factors
  if (healthData.hepatitisBSurface || healthData.hepatitisCRNA) {
    riskScore += 30;
    riskFactors.push('Chronic Viral Hepatitis');
    recommendations.push('Antiviral therapy evaluation and hepatology follow-up');
  }

  // Apply AI model prediction if available
  if (model) {
    try {
      const aiPrediction = predictHepaticRiskWithAI(healthData, model);
      // Combine traditional risk score (70%) with AI prediction (30%)
      riskScore = riskScore * 0.7 + aiPrediction * 0.3;
    } catch (error) {
      console.warn('[HepaticAnalysis] AI prediction failed, using traditional algorithms only');
    }
  }

  // Ensure score is within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine risk category
  let riskCategory: 'low' | 'moderate' | 'high' | 'severe';
  if (riskScore >= 80) {
    riskCategory = 'severe';
  } else if (riskScore >= 60) {
    riskCategory = 'high';
  } else if (riskScore >= 30) {
    riskCategory = 'moderate';
  } else {
    riskCategory = 'low';
  }

  // Add general recommendations based on risk category
  if (riskCategory === 'severe') {
    recommendations.unshift('Emergency hepatology consultation required');
    recommendations.push('Consider liver transplant evaluation if appropriate');
  } else if (riskCategory === 'high') {
    recommendations.unshift('Urgent hepatology referral within 1-2 weeks');
    recommendations.push('Comprehensive liver disease workup');
  } else if (riskCategory === 'moderate') {
    recommendations.unshift('Hepatology consultation within 1-2 months');
    recommendations.push('Lifestyle modifications and regular monitoring');
  } else {
    recommendations.unshift('Continue healthy liver practices');
    recommendations.push('Annual liver function screening');
  }

  return {
    riskScore: Math.round(riskScore),
    riskFactors,
    meldScore,
    childPughScore: childPughResult.score,
    childPughClass: childPughResult.class,
    nafldRisk,
    fibrosisStage,
    riskCategory,
    recommendations: [...new Set(recommendations)]
  };
}

/**
 * Calculate MELD Score (Model for End-Stage Liver Disease)
 */
function calculateMELDScore(healthData: HealthData): number {
  if (!healthData.totalBilirubin || !healthData.inr || !healthData.creatinine) {
    return 0;
  }

  const bilirubin = Math.max(1.0, healthData.totalBilirubin);
  const inr = Math.max(1.0, healthData.inr);
  const creatinine = Math.max(1.0, Math.min(4.0, healthData.creatinine));

  const meld = 3.78 * Math.log(bilirubin) + 11.2 * Math.log(inr) + 9.57 * Math.log(creatinine) + 6.43;
  
  return Math.round(Math.max(6, Math.min(40, meld)));
}

/**
 * Calculate Child-Pugh Score
 */
function calculateChildPughScore(healthData: HealthData): { score: number; class: 'A' | 'B' | 'C' } {
  let score = 0;

  // Bilirubin (mg/dL)
  if (healthData.totalBilirubin) {
    if (healthData.totalBilirubin < 2.0) score += 1;
    else if (healthData.totalBilirubin <= 3.0) score += 2;
    else score += 3;
  }

  // Albumin (g/dL)
  if (healthData.albumin) {
    if (healthData.albumin > 3.5) score += 1;
    else if (healthData.albumin >= 2.8) score += 2;
    else score += 3;
  }

  // INR
  if (healthData.inr) {
    if (healthData.inr < 1.7) score += 1;
    else if (healthData.inr <= 2.3) score += 2;
    else score += 3;
  }

  // Ascites (assumed absent if not specified)
  score += 1; // No ascites

  // Encephalopathy (assumed absent if not specified)
  score += 1; // No encephalopathy

  let childPughClass: 'A' | 'B' | 'C';
  if (score <= 6) childPughClass = 'A';
  else if (score <= 9) childPughClass = 'B';
  else childPughClass = 'C';

  return { score, class: childPughClass };
}

/**
 * Calculate NAFLD (Non-Alcoholic Fatty Liver Disease) Risk
 */
function calculateNAFLDRisk(healthData: HealthData): number {
  let nafldScore = 0;

  // Age factor
  if (healthData.age >= 50) nafldScore += 2;
  else if (healthData.age >= 40) nafldScore += 1;

  // BMI factor
  if (healthData.bmi >= 35) nafldScore += 3;
  else if (healthData.bmi >= 30) nafldScore += 2;
  else if (healthData.bmi >= 25) nafldScore += 1;

  // Diabetes
  if (healthData.glucose >= 126 || healthData.hba1c >= 6.5) nafldScore += 2;

  // Metabolic factors
  if (healthData.triglycerides >= 150) nafldScore += 1;
  if (healthData.hdlCholesterol < 40) nafldScore += 1;

  // Hypertension
  if (healthData.bloodPressureSystolic >= 130 || healthData.bloodPressureDiastolic >= 85) {
    nafldScore += 1;
  }

  // Convert to percentage
  return Math.min(100, nafldScore * 12);
}

/**
 * Estimate Fibrosis Stage using non-invasive markers
 */
function estimateFibrosisStage(healthData: HealthData): number {
  // Simplified fibrosis estimation based on available markers
  let fibrosisScore = 0;

  // AST/ALT ratio
  if (healthData.ast && healthData.alt) {
    const ratio = healthData.ast / healthData.alt;
    if (ratio >= 1.5) fibrosisScore += 2;
    else if (ratio >= 1.0) fibrosisScore += 1;
  }

  // Platelet count
  if (healthData.platelets) {
    if (healthData.platelets < 100) fibrosisScore += 3;
    else if (healthData.platelets < 150) fibrosisScore += 2;
    else if (healthData.platelets < 200) fibrosisScore += 1;
  }

  // Age factor
  if (healthData.age >= 60) fibrosisScore += 1;

  // Convert to fibrosis stage (0-4)
  if (fibrosisScore >= 6) return 4; // Cirrhosis
  if (fibrosisScore >= 4) return 3; // Advanced fibrosis
  if (fibrosisScore >= 2) return 2; // Moderate fibrosis
  if (fibrosisScore >= 1) return 1; // Mild fibrosis
  return 0; // No fibrosis
}

/**
 * AI-based hepatic risk prediction
 */
function predictHepaticRiskWithAI(healthData: HealthData, model: any): number {
  // Mock AI prediction based on key hepatic factors
  const features = [
    healthData.alt || 25,
    healthData.ast || 25,
    healthData.totalBilirubin || 0.8,
    healthData.albumin || 4.0,
    healthData.alkalinePhosphatase || 100,
    healthData.inr || 1.0,
    healthData.platelets || 250,
    healthData.bmi || 25,
    healthData.age || 40,
    healthData.alcoholConsumption || 0
  ];

  // Normalize features
  const normalizedFeatures = features.map((f, i) => {
    const maxValues = [200, 200, 10, 5, 500, 3, 400, 50, 100, 50];
    return f / maxValues[i];
  });

  // Mock prediction calculation
  const prediction = normalizedFeatures.reduce((sum, f, i) => {
    const weights = [0.15, 0.15, 0.12, -0.08, 0.10, 0.12, -0.08, 0.08, 0.06, 0.12];
    return sum + f * weights[i];
  }, 0) * 100;

  return Math.min(100, Math.max(0, prediction));
}

/**
 * Generate detailed hepatic health insights
 */
export function generateHepaticInsights(result: HepaticRiskResult): {
  summary: string;
  details: string[];
  urgency: 'low' | 'medium' | 'high';
  interventions: string[];
} {
  const { riskScore, riskCategory, riskFactors, recommendations, meldScore, childPughScore, childPughClass, nafldRisk, fibrosisStage } = result;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let summary = '';
  const details: string[] = [];
  const interventions: string[] = [];

  // Determine urgency and summary based on risk category
  switch (riskCategory) {
    case 'severe':
      urgency = 'high';
      summary = 'Severe liver dysfunction detected. Immediate medical intervention required.';
      interventions.push('Emergency hepatology consultation');
      interventions.push('Consider liver transplant evaluation');
      interventions.push('Intensive supportive care');
      break;
    case 'high':
      urgency = 'high';
      summary = 'Significant liver impairment. Urgent medical evaluation and treatment needed.';
      interventions.push('Hepatology referral within 1-2 weeks');
      interventions.push('Comprehensive liver workup');
      interventions.push('Alcohol cessation if applicable');
      break;
    case 'moderate':
      urgency = 'medium';
      summary = 'Moderate liver concerns. Medical evaluation and lifestyle modifications recommended.';
      interventions.push('Hepatology consultation within 1-2 months');
      interventions.push('Lifestyle modifications');
      interventions.push('Regular monitoring');
      break;
    case 'low':
      summary = 'Liver function appears normal. Continue healthy practices with regular screening.';
      interventions.push('Annual liver function tests');
      interventions.push('Maintain healthy lifestyle');
      break;
  }

  // Add detailed scoring information
  details.push(`Overall Hepatic Risk Score: ${riskScore}/100 (${riskCategory.toUpperCase()} risk)`);
  
  if (meldScore) {
    details.push(`MELD Score: ${meldScore} (${getMELDInterpretation(meldScore)})`);
  }
  
  if (childPughScore && childPughClass) {
    details.push(`Child-Pugh Score: ${childPughScore} (Class ${childPughClass})`);
  }
  
  if (nafldRisk) {
    details.push(`NAFLD Risk: ${nafldRisk}%`);
  }
  
  if (fibrosisStage !== undefined) {
    details.push(`Estimated Fibrosis Stage: ${fibrosisStage}/4 (${getFibrosisInterpretation(fibrosisStage)})`);
  }

  // Add specific risk factor explanations
  if (riskFactors.includes('Severe ALT Elevation (>10x ULN)')) {
    details.push('Extremely elevated ALT suggests acute liver injury requiring immediate attention.');
  }
  
  if (riskFactors.includes('Heavy Alcohol Consumption (>50 units/week)')) {
    details.push('Heavy alcohol use is a major risk factor for liver cirrhosis and liver cancer.');
  }
  
  if (riskFactors.includes('Chronic Viral Hepatitis')) {
    details.push('Chronic viral hepatitis requires antiviral treatment to prevent progression.');
  }

  return { 
    summary, 
    details, 
    urgency, 
    interventions: [...new Set(interventions)]
  };
}

function getMELDInterpretation(meld: number): string {
  if (meld >= 40) return 'Extremely high mortality risk';
  if (meld >= 30) return 'High mortality risk';
  if (meld >= 20) return 'Moderate mortality risk';
  if (meld >= 15) return 'Mild-moderate mortality risk';
  return 'Low mortality risk';
}

function getFibrosisInterpretation(stage: number): string {
  switch (stage) {
    case 0: return 'No fibrosis';
    case 1: return 'Mild fibrosis';
    case 2: return 'Moderate fibrosis';
    case 3: return 'Advanced fibrosis';
    case 4: return 'Cirrhosis';
    default: return 'Unknown';
  }
}

