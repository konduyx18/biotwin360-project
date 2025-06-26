/**
 * Hepatic Module
 * Advanced liver function analysis and disease risk assessment algorithms
 */

export { calculateHepaticRisk, generateHepaticInsights } from './hepaticAnalysis';
export type { HepaticRiskResult } from './hepaticAnalysis';

// Module metadata
export const hepaticModule = {
  name: 'Hepatic Analysis',
  version: '2.1.0',
  description: 'Advanced AI-powered liver function assessment and hepatic disease risk analysis',
  algorithms: [
    'MELD Score (Model for End-Stage Liver Disease)',
    'Child-Pugh Score',
    'NAFLD Risk Assessment',
    'Hepatic Fibrosis Prediction',
    'AI-Enhanced Liver Function Analysis'
  ],
  biomarkers: [
    'ALT (Alanine Aminotransferase)',
    'AST (Aspartate Aminotransferase)',
    'Bilirubin (Total & Direct)',
    'Albumin',
    'Alkaline Phosphatase',
    'GGT (Gamma-Glutamyl Transferase)',
    'PT/INR (Prothrombin Time)',
    'Platelet Count'
  ]
};

