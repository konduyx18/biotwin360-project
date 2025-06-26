import { create } from 'zustand';
import { PatientData, AnalysisResult, OrganRisk, OrganRecommendations } from '../types/patient';

interface AppState {
  // Patient data
  patientData: PatientData | null;
  setPatientData: (data: PatientData) => void;
  
  // Analysis results
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult) => void;
  
  // UI state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  
  currentView: 'form' | 'analysis' | 'recommendations';
  setCurrentView: (view: 'form' | 'analysis' | 'recommendations') => void;
  
  selectedOrgan: 'heart' | 'liver' | null;
  setSelectedOrgan: (organ: 'heart' | 'liver' | null) => void;
  
  // Actions
  resetAll: () => void;
  
  // GDPR compliance
  gdprAccepted: boolean;
  setGdprAccepted: (accepted: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  patientData: null,
  analysisResult: null,
  isAnalyzing: false,
  currentView: 'form',
  selectedOrgan: null,
  gdprAccepted: false,
  
  // Setters
  setPatientData: (data) => set({ patientData: data }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),
  setGdprAccepted: (accepted) => set({ gdprAccepted: accepted }),
  
  // Actions
  resetAll: () => set({
    patientData: null,
    analysisResult: null,
    isAnalyzing: false,
    currentView: 'form',
    selectedOrgan: null,
    gdprAccepted: false,
  }),
}));

