/**
 * Performance Analytics Module
 * Simplified version for BioTwin360 platform
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

export interface UserMetrics {
  sessionDuration: number;
  interactionCount: number;
  errorCount: number;
  timestamp: number;
}

export class PerformanceAnalytics {
  private metrics: PerformanceMetrics[] = [];
  private userMetrics: UserMetrics[] = [];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.initializePerformanceObserver();
  }

  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordPerformanceEntry(entry);
          });
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private recordPerformanceEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetrics = {
      loadTime: entry.duration,
      renderTime: entry.startTime,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: 0, // Simplified
      timestamp: Date.now()
    };

    this.metrics.push(metric);
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  public recordUserInteraction(type: string, duration?: number): void {
    const userMetric: UserMetrics = {
      sessionDuration: Date.now() - this.startTime,
      interactionCount: this.userMetrics.length + 1,
      errorCount: 0,
      timestamp: Date.now()
    };

    this.userMetrics.push(userMetric);
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getUserMetrics(): UserMetrics[] {
    return [...this.userMetrics];
  }

  public getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  public reset(): void {
    this.metrics = [];
    this.userMetrics = [];
    this.startTime = Date.now();
  }

  public destroy(): void {
    this.reset();
  }
}

// Export singleton instance
export const performanceAnalytics = new PerformanceAnalytics();

