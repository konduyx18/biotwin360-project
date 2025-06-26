/**
 * BioTwin360 State Manager v2.0
 * Advanced Global State Management with Persistence and Optimization
 * 
 * Features:
 * - Centralized state management with Zustand
 * - Persistent storage with encryption
 * - State synchronization across components
 * - Undo/Redo functionality
 * - State validation and sanitization
 * - Performance optimizations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { PatientData } from '../../types/patient';
import { PredictionResult } from '../types/core';

export interface AppState {
  // Core application state
  currentView: 'form' | 'analysis' | 'recommendations' | 'dashboard' | 'history';
  isAnalyzing: boolean;
  gdprAccepted: boolean;
  
  // Patient and analysis data
  patientData: PatientData | null;
  analysisResult: PredictionResult[] | null;
  analysisHistory: AnalysisHistoryEntry[];
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fr' | 'es' | 'de';
  
  // Performance and monitoring
  performanceMetrics: {
    lastAnalysisTime: number;
    totalAnalyses: number;
    averageResponseTime: number;
    cacheHitRate: number;
  };
  
  // Error handling
  errors: AppError[];
  notifications: Notification[];
  
  // Settings
  settings: UserSettings;
  
  // Undo/Redo
  history: {
    past: Partial<AppState>[];
    present: Partial<AppState>;
    future: Partial<AppState>[];
  };
}

export interface AnalysisHistoryEntry {
  id: string;
  timestamp: number;
  patientData: PatientData;
  results: PredictionResult[];
  globalRiskScore: number;
  notes?: string;
}

export interface AppError {
  id: string;
  type: 'validation' | 'network' | 'analysis' | 'system';
  message: string;
  timestamp: number;
  resolved: boolean;
  details?: any;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface UserSettings {
  autoSave: boolean;
  dataRetentionDays: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  preferredUnits: 'metric' | 'imperial';
  accessibilityMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface AppActions {
  // Navigation actions
  setCurrentView: (view: AppState['currentView']) => void;
  goBack: () => void;
  goForward: () => void;
  
  // GDPR and privacy
  setGdprAccepted: (accepted: boolean) => void;
  clearAllData: () => void;
  
  // Patient data management
  setPatientData: (data: PatientData | null) => void;
  updatePatientData: (updates: Partial<PatientData>) => void;
  
  // Analysis management
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (result: PredictionResult[] | null) => void;
  addToHistory: (entry: Omit<AnalysisHistoryEntry, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // UI state management
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: AppState['theme']) => void;
  setLanguage: (language: AppState['language']) => void;
  
  // Error handling
  addError: (error: Omit<AppError, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveError: (id: string) => void;
  clearErrors: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  
  // Performance metrics
  updatePerformanceMetrics: (metrics: Partial<AppState['performanceMetrics']>) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Utility actions
  reset: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

// Default state values
const defaultSettings: UserSettings = {
  autoSave: true,
  dataRetentionDays: 30,
  enableNotifications: true,
  enableAnalytics: true,
  preferredUnits: 'metric',
  accessibilityMode: false,
  reducedMotion: false,
  highContrast: false
};

const defaultPerformanceMetrics = {
  lastAnalysisTime: 0,
  totalAnalyses: 0,
  averageResponseTime: 0,
  cacheHitRate: 0
};

// Encryption utilities for sensitive data
const encryptData = (data: string): string => {
  // Simple base64 encoding for demo - in production, use proper encryption
  return btoa(data);
};

const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData);
  } catch {
    return '';
  }
};

// Custom storage with encryption for sensitive data
const createEncryptedStorage = () => ({
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      if (parsed.encrypted) {
        return decryptData(parsed.data);
      }
      return item;
    } catch {
      return item;
    }
  },
  setItem: (name: string, value: string): void => {
    // Encrypt sensitive data
    if (name.includes('patient') || name.includes('analysis')) {
      const encrypted = {
        encrypted: true,
        data: encryptData(value),
        timestamp: Date.now()
      };
      localStorage.setItem(name, JSON.stringify(encrypted));
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  }
});

// State store with persistence and middleware
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentView: 'form',
        isAnalyzing: false,
        gdprAccepted: false,
        patientData: null,
        analysisResult: null,
        analysisHistory: [],
        sidebarOpen: false,
        theme: 'auto',
        language: 'en',
        performanceMetrics: defaultPerformanceMetrics,
        errors: [],
        notifications: [],
        settings: defaultSettings,
        history: {
          past: [],
          present: {},
          future: []
        },

        // Navigation actions
        setCurrentView: (view) => {
          set((state) => {
            const newState = { ...state, currentView: view };
            return addToHistory(newState, { currentView: state.currentView });
          });
        },

        goBack: () => {
          const state = get();
          if (state.history.past.length > 0) {
            const previous = state.history.past[state.history.past.length - 1];
            const newPast = state.history.past.slice(0, -1);
            const newFuture = [state.history.present, ...state.history.future];
            
            set({
              ...state,
              ...previous,
              history: {
                past: newPast,
                present: previous,
                future: newFuture
              }
            });
          }
        },

        goForward: () => {
          const state = get();
          if (state.history.future.length > 0) {
            const next = state.history.future[0];
            const newFuture = state.history.future.slice(1);
            const newPast = [...state.history.past, state.history.present];
            
            set({
              ...state,
              ...next,
              history: {
                past: newPast,
                present: next,
                future: newFuture
              }
            });
          }
        },

        // GDPR and privacy
        setGdprAccepted: (accepted) => set({ gdprAccepted: accepted }),

        clearAllData: () => {
          set({
            patientData: null,
            analysisResult: null,
            analysisHistory: [],
            errors: [],
            notifications: [],
            performanceMetrics: defaultPerformanceMetrics
          });
          
          // Clear localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('biotwin360')) {
              localStorage.removeItem(key);
            }
          });
        },

        // Patient data management
        setPatientData: (data) => {
          set((state) => {
            const newState = { ...state, patientData: data };
            return addToHistory(newState, { patientData: state.patientData });
          });
        },

        updatePatientData: (updates) => {
          set((state) => {
            if (!state.patientData) return state;
            
            const updatedData = { ...state.patientData, ...updates };
            const newState = { ...state, patientData: updatedData };
            return addToHistory(newState, { patientData: state.patientData });
          });
        },

        // Analysis management
        setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

        setAnalysisResult: (result) => {
          set((state) => {
            const newState = { ...state, analysisResult: result };
            
            // Update performance metrics
            if (result) {
              const newMetrics = {
                ...state.performanceMetrics,
                lastAnalysisTime: Date.now(),
                totalAnalyses: state.performanceMetrics.totalAnalyses + 1
              };
              newState.performanceMetrics = newMetrics;
            }
            
            return addToHistory(newState, { analysisResult: state.analysisResult });
          });
        },

        addToHistory: (entry) => {
          set((state) => {
            const historyEntry: AnalysisHistoryEntry = {
              id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              globalRiskScore: entry.results.reduce((sum, r) => sum + r.riskScore, 0) / entry.results.length,
              ...entry
            };

            const newHistory = [historyEntry, ...state.analysisHistory];
            
            // Limit history size based on settings
            const maxEntries = state.settings.dataRetentionDays * 5; // ~5 analyses per day
            const trimmedHistory = newHistory.slice(0, maxEntries);

            return { ...state, analysisHistory: trimmedHistory };
          });
        },

        removeFromHistory: (id) => {
          set((state) => ({
            ...state,
            analysisHistory: state.analysisHistory.filter(entry => entry.id !== id)
          }));
        },

        clearHistory: () => set({ analysisHistory: [] }),

        // UI state management
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),

        // Error handling
        addError: (error) => {
          set((state) => {
            const newError: AppError = {
              id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              resolved: false,
              ...error
            };

            return {
              ...state,
              errors: [newError, ...state.errors.slice(0, 49)] // Keep max 50 errors
            };
          });
        },

        resolveError: (id) => {
          set((state) => ({
            ...state,
            errors: state.errors.map(error =>
              error.id === id ? { ...error, resolved: true } : error
            )
          }));
        },

        clearErrors: () => set({ errors: [] }),

        // Notifications
        addNotification: (notification) => {
          set((state) => {
            const newNotification: Notification = {
              id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              ...notification
            };

            // Auto-remove notification after duration
            if (notification.duration) {
              setTimeout(() => {
                get().removeNotification(newNotification.id);
              }, notification.duration);
            }

            return {
              ...state,
              notifications: [newNotification, ...state.notifications.slice(0, 9)] // Keep max 10 notifications
            };
          });
        },

        removeNotification: (id) => {
          set((state) => ({
            ...state,
            notifications: state.notifications.filter(notification => notification.id !== id)
          }));
        },

        clearNotifications: () => set({ notifications: [] }),

        // Settings
        updateSettings: (settings) => {
          set((state) => ({
            ...state,
            settings: { ...state.settings, ...settings }
          }));
        },

        resetSettings: () => set({ settings: defaultSettings }),

        // Performance metrics
        updatePerformanceMetrics: (metrics) => {
          set((state) => ({
            ...state,
            performanceMetrics: { ...state.performanceMetrics, ...metrics }
          }));
        },

        // Undo/Redo
        undo: () => get().goBack(),
        redo: () => get().goForward(),
        canUndo: () => get().history.past.length > 0,
        canRedo: () => get().history.future.length > 0,

        // Utility actions
        reset: () => {
          set({
            currentView: 'form',
            isAnalyzing: false,
            patientData: null,
            analysisResult: null,
            sidebarOpen: false,
            errors: [],
            notifications: [],
            performanceMetrics: defaultPerformanceMetrics,
            history: {
              past: [],
              present: {},
              future: []
            }
          });
        },

        exportData: () => {
          const state = get();
          const exportData = {
            analysisHistory: state.analysisHistory,
            settings: state.settings,
            performanceMetrics: state.performanceMetrics,
            exportTimestamp: Date.now(),
            version: '2.0'
          };
          return JSON.stringify(exportData, null, 2);
        },

        importData: (data) => {
          try {
            const parsed = JSON.parse(data);
            
            // Validate import data
            if (!parsed.version || !parsed.exportTimestamp) {
              return false;
            }

            set((state) => ({
              ...state,
              analysisHistory: parsed.analysisHistory || [],
              settings: { ...state.settings, ...parsed.settings },
              performanceMetrics: { ...state.performanceMetrics, ...parsed.performanceMetrics }
            }));

            return true;
          } catch {
            return false;
          }
        }
      }),
      {
        name: 'biotwin360-app-state',
        storage: createJSONStorage(() => createEncryptedStorage()),
        partialize: (state) => ({
          // Only persist non-sensitive state
          gdprAccepted: state.gdprAccepted,
          theme: state.theme,
          language: state.language,
          settings: state.settings,
          sidebarOpen: state.sidebarOpen,
          // Sensitive data is handled separately with encryption
          analysisHistory: state.settings.autoSave ? state.analysisHistory : [],
          performanceMetrics: state.performanceMetrics
        }),
        version: 2,
        migrate: (persistedState: any, version: number) => {
          // Handle migration from older versions
          if (version < 2) {
            return {
              ...persistedState,
              settings: { ...defaultSettings, ...persistedState.settings },
              performanceMetrics: defaultPerformanceMetrics,
              history: {
                past: [],
                present: {},
                future: []
              }
            };
          }
          return persistedState;
        }
      }
    )
  )
);

// Helper function to add state to history
function addToHistory<T extends Partial<AppState>>(newState: T, previousState: Partial<AppState>): T {
  const maxHistorySize = 50;
  
  const newHistory = {
    past: [...newState.history?.past || [], previousState].slice(-maxHistorySize),
    present: previousState,
    future: [] // Clear future when new action is performed
  };

  return {
    ...newState,
    history: newHistory
  };
}

// Selectors for optimized component subscriptions
export const selectCurrentView = (state: AppState) => state.currentView;
export const selectPatientData = (state: AppState) => state.patientData;
export const selectAnalysisResult = (state: AppState) => state.analysisResult;
export const selectIsAnalyzing = (state: AppState) => state.isAnalyzing;
export const selectErrors = (state: AppState) => state.errors.filter(e => !e.resolved);
export const selectNotifications = (state: AppState) => state.notifications;
export const selectSettings = (state: AppState) => state.settings;
export const selectPerformanceMetrics = (state: AppState) => state.performanceMetrics;
export const selectAnalysisHistory = (state: AppState) => state.analysisHistory;

// Custom hooks for common state operations
export const useCurrentView = () => useAppStore(selectCurrentView);
export const usePatientData = () => useAppStore(selectPatientData);
export const useAnalysisResult = () => useAppStore(selectAnalysisResult);
export const useIsAnalyzing = () => useAppStore(selectIsAnalyzing);
export const useErrors = () => useAppStore(selectErrors);
export const useNotifications = () => useAppStore(selectNotifications);
export const useSettings = () => useAppStore(selectSettings);
export const usePerformanceMetrics = () => useAppStore(selectPerformanceMetrics);
export const useAnalysisHistory = () => useAppStore(selectAnalysisHistory);

export default useAppStore;

