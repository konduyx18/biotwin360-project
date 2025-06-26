/**
 * Jest Test Setup
 * Global test configuration and mocks for BioTwin360
 */

import '@testing-library/jest-dom';

// Mock Web APIs that are not available in Jest environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock WebGL context for Three.js
const mockWebGLContext = {
  canvas: document.createElement('canvas'),
  getExtension: jest.fn(),
  getParameter: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  blendFunc: jest.fn(),
  depthFunc: jest.fn(),
  cullFace: jest.fn(),
  frontFace: jest.fn(),
  getUniformLocation: jest.fn(),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  createTexture: jest.fn(),
  bindTexture: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  generateMipmap: jest.fn(),
  activeTexture: jest.fn(),
  deleteTexture: jest.fn(),
  deleteBuffer: jest.fn(),
  deleteProgram: jest.fn(),
  deleteShader: jest.fn(),
};

HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext;
  }
  return null;
});

// Mock crypto.subtle for security tests
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
      decrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
      generateKey: jest.fn().mockResolvedValue({}),
      importKey: jest.fn().mockResolvedValue({}),
      exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
    getRandomValues: jest.fn().mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  configurable: true,
});

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true,
});

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  configurable: true,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  blob: jest.fn().mockResolvedValue(new Blob()),
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Suppress console errors and warnings in tests unless explicitly needed
console.error = jest.fn();
console.warn = jest.fn();

// Restore console methods after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
export const mockPatientData = {
  id: 'test-patient-123',
  name: 'John Doe',
  age: 35,
  gender: 'male',
  height: 175,
  weight: 70,
  bloodType: 'O+',
  medicalHistory: [],
  currentMedications: [],
  allergies: [],
  vitalSigns: {
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98,
  },
  labResults: {
    cholesterol: { total: 180, hdl: 50, ldl: 110 },
    glucose: 90,
    hemoglobin: 14.5,
    whiteBloodCells: 7000,
    platelets: 250000,
  },
};

export const mockAnalysisResult = {
  patientId: 'test-patient-123',
  timestamp: Date.now(),
  overallRiskScore: 25,
  organAnalysis: {
    heart: {
      riskScore: 20,
      status: 'healthy',
      recommendations: ['Regular exercise', 'Maintain healthy diet'],
    },
    liver: {
      riskScore: 15,
      status: 'healthy',
      recommendations: ['Limit alcohol consumption', 'Regular check-ups'],
    },
    kidneys: {
      riskScore: 30,
      status: 'moderate_risk',
      recommendations: ['Monitor blood pressure', 'Stay hydrated'],
    },
    lungs: {
      riskScore: 10,
      status: 'healthy',
      recommendations: ['Avoid smoking', 'Regular exercise'],
    },
    brain: {
      riskScore: 25,
      status: 'healthy',
      recommendations: ['Mental exercises', 'Adequate sleep'],
    },
  },
  predictions: {
    cardiovascularRisk: 0.15,
    diabetesRisk: 0.08,
    liverDiseaseRisk: 0.05,
    kidneyDiseaseRisk: 0.12,
    cognitiveDeclineRisk: 0.06,
  },
  recommendations: [
    'Maintain regular exercise routine',
    'Follow balanced diet',
    'Regular health check-ups',
    'Monitor blood pressure',
  ],
};

export const mockSecurityEvent = {
  id: 'event-123',
  timestamp: Date.now(),
  userId: 'user-123',
  action: 'login_success',
  resource: 'authentication',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  success: true,
  riskLevel: 'low' as const,
};

export const mockBackupMetadata = {
  id: 'backup-123',
  timestamp: Date.now(),
  type: 'full' as const,
  size: 1024 * 1024, // 1MB
  checksum: 'abc123def456',
  encrypted: true,
  compressed: true,
  location: 'backup/backup-123',
  status: 'completed' as const,
  dataTypes: ['patient_data', 'analysis_results'],
  version: '1.0.0',
  retentionUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Test helper functions
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockFile = (name: string, content: string, type: string = 'text/plain') => {
  return new File([content], name, { type });
};

export const createMockEvent = (type: string, properties: any = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  return event;
};

export const mockComponent = (name: string) => {
  return jest.fn().mockImplementation(({ children, ...props }) => {
    return React.createElement('div', { 'data-testid': name, ...props }, children);
  });
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

export const expectPerformance = (duration: number, maxDuration: number) => {
  expect(duration).toBeLessThan(maxDuration);
};

// Accessibility testing utilities
export const checkAccessibility = (element: HTMLElement) => {
  // Check for basic accessibility attributes
  const hasAriaLabel = element.hasAttribute('aria-label');
  const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
  const hasRole = element.hasAttribute('role');
  const hasTabIndex = element.hasAttribute('tabindex');
  
  return {
    hasAriaLabel,
    hasAriaLabelledBy,
    hasRole,
    hasTabIndex,
    isAccessible: hasAriaLabel || hasAriaLabelledBy || hasRole,
  };
};

// Security testing utilities
export const checkSecurityHeaders = (response: Response) => {
  const headers = response.headers;
  return {
    hasCSP: headers.has('content-security-policy'),
    hasXFrameOptions: headers.has('x-frame-options'),
    hasXContentTypeOptions: headers.has('x-content-type-options'),
    hasStrictTransportSecurity: headers.has('strict-transport-security'),
    hasReferrerPolicy: headers.has('referrer-policy'),
  };
};

export const validateInput = (input: string, pattern: RegExp) => {
  return pattern.test(input);
};

// Data validation utilities
export const validatePatientData = (data: any) => {
  const required = ['id', 'name', 'age', 'gender'];
  const missing = required.filter(field => !data[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    hasVitalSigns: !!data.vitalSigns,
    hasLabResults: !!data.labResults,
  };
};

export const validateAnalysisResult = (result: any) => {
  const required = ['patientId', 'timestamp', 'overallRiskScore', 'organAnalysis'];
  const missing = required.filter(field => !result[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    hasRecommendations: !!result.recommendations,
    hasPredictions: !!result.predictions,
  };
};

