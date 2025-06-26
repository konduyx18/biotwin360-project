import { PatientData, RiskScore, OrganRisk } from '../types/patient';

/**
 * Cardiovascular Risk Assessment
 * Based on Framingham Risk Score and medical guidelines
 */
export const calculateHeartRisk = (data: PatientData): RiskScore => {
  let score = 0;
  const factors: string[] = [];

  // Age factor (0-25 points)
  if (data.age >= 65) {
    score += 25;
    factors.push('Advanced Age');
  } else if (data.age >= 55) {
    score += 15;
    factors.push('Age');
  } else if (data.age >= 45) {
    score += 10;
    factors.push('Age');
  } else if (data.age >= 35) {
    score += 5;
  }

  // Gender factor (0-10 points)
  if (data.sex === 'male' && data.age >= 45) {
    score += 10;
    factors.push('Male Gender');
  } else if (data.sex === 'female' && data.age >= 55) {
    score += 8;
    factors.push('Female Gender');
  }

  // Blood pressure factor (0-20 points)
  const systolic = data.bloodPressure.systolic;
  const diastolic = data.bloodPressure.diastolic;
  
  if (systolic >= 180 || diastolic >= 110) {
    score += 20;
    factors.push('Severe Hypertension');
  } else if (systolic >= 160 || diastolic >= 100) {
    score += 15;
    factors.push('High Blood Pressure');
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 10;
    factors.push('Blood Pressure');
  } else if (systolic >= 130 || diastolic >= 85) {
    score += 5;
    factors.push('Elevated Blood Pressure');
  }

  // Cholesterol factor (0-15 points)
  if (data.cholesterol >= 300) {
    score += 15;
    factors.push('Very High Cholesterol');
  } else if (data.cholesterol >= 240) {
    score += 12;
    factors.push('High Cholesterol');
  } else if (data.cholesterol >= 200) {
    score += 8;
    factors.push('Cholesterol');
  } else if (data.cholesterol >= 180) {
    score += 4;
  }

  // BMI factor (0-10 points)
  if (data.bmi) {
    if (data.bmi >= 35) {
      score += 10;
      factors.push('Severe Obesity');
    } else if (data.bmi >= 30) {
      score += 8;
      factors.push('Obesity');
    } else if (data.bmi >= 25) {
      score += 5;
      factors.push('Overweight');
    }
  }

  // Smoking factor (0-15 points)
  if (data.smokingStatus === 'current') {
    score += 15;
    factors.push('Current Smoking');
  } else if (data.smokingStatus === 'former') {
    score += 5;
    factors.push('Former Smoking');
  }

  // Exercise factor (protective, -5 to 0 points)
  if (data.exerciseLevel === 'vigorous') {
    score -= 5;
  } else if (data.exerciseLevel === 'moderate') {
    score -= 3;
  } else if (data.exerciseLevel === 'sedentary') {
    score += 5;
    factors.push('Sedentary Lifestyle');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let level: 'low' | 'moderate' | 'high';
  if (score < 30) {
    level = 'low';
  } else if (score < 60) {
    level = 'moderate';
  } else {
    level = 'high';
  }

  return { level, score, factors };
};

/**
 * Hepatic Risk Assessment
 * Based on liver function indicators and metabolic factors
 */
export const calculateLiverRisk = (data: PatientData): RiskScore => {
  let score = 0;
  const factors: string[] = [];

  // Age factor (0-15 points)
  if (data.age >= 60) {
    score += 15;
    factors.push('Advanced Age');
  } else if (data.age >= 50) {
    score += 10;
    factors.push('Age');
  } else if (data.age >= 40) {
    score += 5;
  }

  // Glucose/Diabetes factor (0-20 points)
  if (data.glucose >= 200) {
    score += 20;
    factors.push('Severe Hyperglycemia');
  } else if (data.glucose >= 140) {
    score += 15;
    factors.push('Diabetes');
  } else if (data.glucose >= 110) {
    score += 10;
    factors.push('Glucose Level');
  } else if (data.glucose >= 100) {
    score += 5;
    factors.push('Elevated Glucose');
  }

  // BMI/Obesity factor (0-15 points)
  if (data.bmi) {
    if (data.bmi >= 35) {
      score += 15;
      factors.push('Severe Obesity');
    } else if (data.bmi >= 30) {
      score += 12;
      factors.push('Obesity');
    } else if (data.bmi >= 25) {
      score += 8;
      factors.push('Overweight');
    }
  }

  // Cholesterol factor (0-10 points)
  if (data.cholesterol >= 300) {
    score += 10;
    factors.push('Very High Cholesterol');
  } else if (data.cholesterol >= 240) {
    score += 8;
    factors.push('High Cholesterol');
  } else if (data.cholesterol >= 200) {
    score += 5;
    factors.push('Cholesterol');
  }

  // Alcohol/Smoking factor (0-15 points)
  if (data.smokingStatus === 'current') {
    score += 10;
    factors.push('Current Smoking');
  } else if (data.smokingStatus === 'former') {
    score += 3;
  }

  // Exercise factor (protective, -5 to 0 points)
  if (data.exerciseLevel === 'vigorous') {
    score -= 5;
  } else if (data.exerciseLevel === 'moderate') {
    score -= 3;
  } else if (data.exerciseLevel === 'light') {
    score -= 1;
  } else if (data.exerciseLevel === 'sedentary') {
    score += 8;
    factors.push('Sedentary Lifestyle');
  }

  // Gender factor
  if (data.sex === 'male') {
    score += 5;
    factors.push('Male Gender');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let level: 'low' | 'moderate' | 'high';
  if (score < 25) {
    level = 'low';
  } else if (score < 50) {
    level = 'moderate';
  } else {
    level = 'high';
  }

  return { level, score, factors };
};

/**
 * Overall Health Risk Assessment
 * Combines heart and liver risk assessments
 */
export const calculateOverallRisk = (data: PatientData): OrganRisk => {
  const heart = calculateHeartRisk(data);
  const liver = calculateLiverRisk(data);

  return { heart, liver };
};

/**
 * Calculate overall health score (0-100)
 */
export const calculateOverallScore = (organRisk: OrganRisk): number => {
  const heartWeight = 0.6; // Heart risk is weighted more heavily
  const liverWeight = 0.4;
  
  const weightedScore = (100 - organRisk.heart.score) * heartWeight + 
                       (100 - organRisk.liver.score) * liverWeight;
  
  return Math.round(weightedScore);
};

