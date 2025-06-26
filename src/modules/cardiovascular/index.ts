/**
 * Cardiovascular Module
 * Advanced cardiovascular analysis and risk assessment algorithms
 */

export { calculateCardiovascularRisk, generateCardiovascularInsights } from './cardiovascularAnalysis';
export type { CardiovascularRiskResult } from './cardiovascularAnalysis';

// Module metadata
export const cardiovascularModule = {
  name: 'Cardiovascular Analysis',
  version: '2.1.0',
  description: 'Advanced AI-powered cardiovascular risk assessment and heart health analysis',
  algorithms: [
    'Framingham Risk Score',
    'ASCVD Risk Calculator',
    'ESC/EAS Risk Assessment',
    'AI-Enhanced Prediction Models'
  ],
  biomarkers: [
    'Total Cholesterol',
    'HDL Cholesterol',
    'LDL Cholesterol',
    'Triglycerides',
    'Blood Pressure',
    'Heart Rate',
    'CRP (C-Reactive Protein)',
    'Troponin',
    'BNP/NT-proBNP'
  ]
};

