import { OrganRisk, PatientData } from '../types/patient';

export interface HealthRecommendation {
  id: string;
  category: 'lifestyle' | 'medical' | 'nutrition' | 'exercise' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  timeframe: string;
  expectedBenefit: string;
}

/**
 * Generate personalized health recommendations based on AI analysis
 */
export const generateRecommendations = (
  patientData: PatientData,
  organRisk: OrganRisk
): HealthRecommendation[] => {
  const recommendations: HealthRecommendation[] = [];

  // Heart-specific recommendations
  if (organRisk.heart.level === 'high') {
    recommendations.push({
      id: 'heart-urgent-medical',
      category: 'medical',
      priority: 'high',
      title: 'Urgent Cardiovascular Evaluation',
      description: 'Your cardiovascular risk assessment indicates elevated risk factors that require immediate medical attention.',
      actionItems: [
        'Schedule an appointment with a cardiologist within 2 weeks',
        'Consider stress testing and advanced cardiac imaging',
        'Discuss medication options for risk reduction',
        'Review family history of heart disease with your doctor'
      ],
      timeframe: 'Immediate (1-2 weeks)',
      expectedBenefit: 'Early intervention can significantly reduce cardiovascular events'
    });

    recommendations.push({
      id: 'heart-lifestyle-urgent',
      category: 'lifestyle',
      priority: 'high',
      title: 'Immediate Lifestyle Modifications',
      description: 'Critical lifestyle changes to reduce cardiovascular risk.',
      actionItems: [
        'Quit smoking immediately if applicable',
        'Limit sodium intake to less than 2,300mg per day',
        'Begin gentle daily exercise (walking 20-30 minutes)',
        'Manage stress through meditation or relaxation techniques'
      ],
      timeframe: 'Start immediately',
      expectedBenefit: 'Can reduce cardiovascular risk by 20-30% within 3-6 months'
    });
  } else if (organRisk.heart.level === 'moderate') {
    recommendations.push({
      id: 'heart-preventive-care',
      category: 'medical',
      priority: 'medium',
      title: 'Preventive Cardiovascular Care',
      description: 'Regular monitoring and preventive measures to maintain heart health.',
      actionItems: [
        'Annual cardiovascular check-up with your primary care physician',
        'Monitor blood pressure regularly at home',
        'Annual lipid panel and diabetes screening',
        'Discuss aspirin therapy with your doctor if appropriate'
      ],
      timeframe: 'Within 3 months',
      expectedBenefit: 'Prevents progression to higher risk categories'
    });
  }

  // Blood pressure specific recommendations
  if (patientData.bloodPressure.systolic >= 140 || patientData.bloodPressure.diastolic >= 90) {
    recommendations.push({
      id: 'blood-pressure-management',
      category: 'lifestyle',
      priority: 'high',
      title: 'Blood Pressure Management',
      description: 'Your blood pressure readings indicate hypertension that needs active management.',
      actionItems: [
        'Monitor blood pressure daily at the same time',
        'Reduce sodium intake to less than 1,500mg per day',
        'Increase potassium-rich foods (bananas, spinach, avocados)',
        'Limit alcohol consumption to 1 drink per day (women) or 2 (men)',
        'Practice deep breathing exercises for 10 minutes daily'
      ],
      timeframe: 'Start immediately',
      expectedBenefit: 'Can lower blood pressure by 5-10 mmHg within 2-4 weeks'
    });
  }

  // Cholesterol recommendations
  if (patientData.cholesterol >= 240) {
    recommendations.push({
      id: 'cholesterol-management',
      category: 'nutrition',
      priority: 'high',
      title: 'Cholesterol Reduction Program',
      description: 'Your cholesterol levels are elevated and require dietary and lifestyle interventions.',
      actionItems: [
        'Adopt a Mediterranean-style diet rich in omega-3 fatty acids',
        'Increase soluble fiber intake (oats, beans, apples)',
        'Limit saturated fats to less than 7% of daily calories',
        'Include plant sterols and stanols in your diet',
        'Consider fish oil supplements (consult your doctor first)'
      ],
      timeframe: '2-3 months',
      expectedBenefit: 'Can reduce LDL cholesterol by 10-15% naturally'
    });
  }

  // Liver-specific recommendations
  if (organRisk.liver.level === 'high') {
    recommendations.push({
      id: 'liver-protection',
      category: 'medical',
      priority: 'high',
      title: 'Liver Health Protection',
      description: 'Your liver risk assessment indicates factors that require attention and monitoring.',
      actionItems: [
        'Schedule comprehensive liver function tests',
        'Avoid alcohol completely or limit to special occasions only',
        'Review all medications and supplements with your doctor',
        'Consider hepatitis B and C screening if not previously done'
      ],
      timeframe: 'Within 4 weeks',
      expectedBenefit: 'Early detection and intervention can prevent liver damage'
    });
  }

  // Diabetes/glucose recommendations
  if (patientData.glucose >= 126) {
    recommendations.push({
      id: 'diabetes-management',
      category: 'medical',
      priority: 'high',
      title: 'Diabetes Management',
      description: 'Your glucose levels suggest diabetes that requires comprehensive management.',
      actionItems: [
        'Schedule appointment with an endocrinologist or diabetes educator',
        'Learn blood glucose self-monitoring techniques',
        'Develop a structured meal plan with a registered dietitian',
        'Start a diabetes-appropriate exercise program',
        'Consider continuous glucose monitoring if recommended'
      ],
      timeframe: 'Within 2 weeks',
      expectedBenefit: 'Proper management can prevent diabetes complications'
    });
  } else if (patientData.glucose >= 100) {
    recommendations.push({
      id: 'prediabetes-prevention',
      category: 'lifestyle',
      priority: 'medium',
      title: 'Prediabetes Prevention',
      description: 'Your glucose levels indicate prediabetes. Lifestyle changes can prevent progression to diabetes.',
      actionItems: [
        'Lose 5-10% of body weight if overweight',
        'Exercise for at least 150 minutes per week',
        'Choose complex carbohydrates over simple sugars',
        'Eat smaller, more frequent meals',
        'Monitor blood glucose periodically'
      ],
      timeframe: '3-6 months',
      expectedBenefit: 'Can reduce diabetes risk by up to 58%'
    });
  }

  // Exercise recommendations based on current level
  if (patientData.exerciseLevel === 'sedentary') {
    recommendations.push({
      id: 'exercise-initiation',
      category: 'exercise',
      priority: 'high',
      title: 'Exercise Program Initiation',
      description: 'Regular physical activity is crucial for your overall health improvement.',
      actionItems: [
        'Start with 10-minute walks after meals',
        'Gradually increase to 30 minutes of moderate activity 5 days per week',
        'Include strength training exercises 2 days per week',
        'Consider joining a fitness class or working with a personal trainer',
        'Track your progress with a fitness app or journal'
      ],
      timeframe: 'Start this week, build over 8 weeks',
      expectedBenefit: 'Can improve cardiovascular health by 20-30% and reduce diabetes risk'
    });
  }

  // Weight management recommendations
  if (patientData.bmi && patientData.bmi >= 30) {
    recommendations.push({
      id: 'weight-management',
      category: 'nutrition',
      priority: 'high',
      title: 'Comprehensive Weight Management',
      description: 'Your BMI indicates obesity, which significantly impacts your health risks.',
      actionItems: [
        'Consult with a registered dietitian for personalized meal planning',
        'Set a realistic goal to lose 1-2 pounds per week',
        'Keep a food diary to track eating patterns',
        'Consider joining a weight loss support group',
        'Discuss medical weight loss options with your doctor if needed'
      ],
      timeframe: '6-12 months for sustainable results',
      expectedBenefit: 'Losing 10% of body weight can significantly reduce health risks'
    });
  }

  // Smoking cessation
  if (patientData.smokingStatus === 'current') {
    recommendations.push({
      id: 'smoking-cessation',
      category: 'lifestyle',
      priority: 'high',
      title: 'Smoking Cessation Program',
      description: 'Quitting smoking is the single most important thing you can do for your health.',
      actionItems: [
        'Set a quit date within the next 2 weeks',
        'Consider nicotine replacement therapy or prescription medications',
        'Join a smoking cessation support group or program',
        'Identify and avoid smoking triggers',
        'Develop healthy coping strategies for stress and cravings'
      ],
      timeframe: 'Start immediately',
      expectedBenefit: 'Reduces cardiovascular risk by 50% within 1 year of quitting'
    });
  }

  // General wellness recommendations
  recommendations.push({
    id: 'general-wellness',
    category: 'lifestyle',
    priority: 'medium',
    title: 'General Wellness Optimization',
    description: 'Foundational health practices to support your overall well-being.',
    actionItems: [
      'Aim for 7-9 hours of quality sleep each night',
      'Practice stress management techniques daily',
      'Stay hydrated with 8-10 glasses of water per day',
      'Maintain social connections and mental health',
      'Schedule regular preventive health screenings'
    ],
    timeframe: 'Ongoing lifestyle practices',
    expectedBenefit: 'Supports overall health and enhances quality of life'
  });

  // Sort recommendations by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

