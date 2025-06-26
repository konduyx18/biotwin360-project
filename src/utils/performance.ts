/**
 * Performance optimization utilities for BioTwin360
 */

// Performance monitoring
let performanceMetrics: { [key: string]: number } = {};

/**
 * Start performance measurement
 */
export const startPerformanceMeasure = (name: string): void => {
  performanceMetrics[`${name}_start`] = performance.now();
};

/**
 * End performance measurement and log result
 */
export const endPerformanceMeasure = (name: string): number => {
  const startTime = performanceMetrics[`${name}_start`];
  if (startTime) {
    const duration = performance.now() - startTime;
    performanceMetrics[name] = duration;
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }
  return 0;
};

/**
 * Debounce function for input optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for scroll/resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load images with intersection observer
 */
export const setupLazyLoading = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (): void => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/src/App.css';
  document.head.appendChild(criticalCSS);

  // Preload TensorFlow.js if needed
  if (window.location.pathname.includes('analysis')) {
    const tfScript = document.createElement('link');
    tfScript.rel = 'preload';
    tfScript.as = 'script';
    tfScript.href = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
    document.head.appendChild(tfScript);
  }
};

/**
 * Optimize bundle size by code splitting
 */
export const loadComponentAsync = async (componentName: string) => {
  try {
    switch (componentName) {
      case 'OrganVisualization':
        return await import('../components/analysis/OrganVisualization');
      case 'HealthRecommendations':
        return await import('../components/analysis/HealthRecommendations');
      default:
        throw new Error(`Unknown component: ${componentName}`);
    }
  } catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
    return null;
  }
};

/**
 * Memory cleanup for Three.js scenes
 */
export const cleanupThreeJSResources = (scene: any): void => {
  if (!scene) return;

  scene.traverse((object: any) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material: any) => {
          if (material.map) material.map.dispose();
          if (material.normalMap) material.normalMap.dispose();
          if (material.roughnessMap) material.roughnessMap.dispose();
          material.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        if (object.material.normalMap) object.material.normalMap.dispose();
        if (object.material.roughnessMap) object.material.roughnessMap.dispose();
        object.material.dispose();
      }
    }
  });

  // Clear the scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
};

/**
 * Optimize AI model loading
 */
export const optimizeAIModelLoading = async (): Promise<void> => {
  // Warm up TensorFlow.js backend
  if (typeof window !== 'undefined' && window.tf) {
    try {
      await window.tf.ready();
      console.log('TensorFlow.js backend ready');
    } catch (error) {
      console.error('TensorFlow.js initialization failed:', error);
    }
  }
};

/**
 * Monitor and report performance metrics
 */
export const reportPerformanceMetrics = (): void => {
  // Core Web Vitals
  if ('web-vitals' in window) {
    // This would typically use the web-vitals library
    console.log('Performance metrics:', performanceMetrics);
  }

  // Memory usage
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }

  // Network information
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('Network info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    });
  }
};

/**
 * Service Worker registration for caching
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  // Setup lazy loading
  setupLazyLoading();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Register service worker
  registerServiceWorker();
  
  // Setup performance monitoring
  setTimeout(reportPerformanceMetrics, 5000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    reportPerformanceMetrics();
  });
};

