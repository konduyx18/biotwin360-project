// Patient data types
export interface PatientData {
  age: number;
  sex: 'male' | 'female';
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  cholesterol: number;
  glucose: number;
  bmi?: number;
  smokingStatus: 'never' | 'former' | 'current';
  exerciseLevel: 'sedentary' | 'light' | 'moderate' | 'vigorous';
}

// Risk assessment types
export interface RiskScore {
  level: 'low' | 'moderate' | 'high';
  score: number; // 0-100
  factors: string[];
}

export interface OrganRisk {
  heart: RiskScore;
  liver: RiskScore;
}

// Recommendation types
export interface Recommendation {
  type: 'medical' | 'preventive' | 'followup';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface OrganRecommendations {
  heart: Recommendation[];
  liver: Recommendation[];
}

// 3D visualization types
export interface OrganVisualization {
  organ: 'heart' | 'liver';
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  rotationSpeed?: number;
}

// Analysis result types
export interface AnalysisResult {
  patientData: PatientData;
  risks: OrganRisk;
  recommendations: OrganRecommendations;
  timestamp: Date;
  overallScore: number;
}

// Form validation types
export interface FormErrors {
  age?: string;
  bloodPressure?: string;
  cholesterol?: string;
  glucose?: string;
}

// Export types
export interface ExportData {
  analysisResult: AnalysisResult;
  format: 'pdf' | 'json';
  includeRecommendations: boolean;
}

