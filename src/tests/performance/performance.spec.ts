/**
 * Performance Tests for BioTwin360
 * Automated performance testing and monitoring
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load Performance', () => {
    test('should load initial page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals: Record<string, number> = {};
            
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
              if (entry.name === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
            });
            
            resolve(vitals);
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        });
      });
      
      console.log('Performance metrics:', metrics);
    });

    test('should have acceptable bundle size', async ({ page }) => {
      // Navigate to page and check network requests
      const responses: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('.js') || response.url().includes('.css')) {
          responses.push({
            url: response.url(),
            size: response.headers()['content-length'],
            type: response.url().includes('.js') ? 'js' : 'css'
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Calculate total bundle size
      const totalJSSize = responses
        .filter(r => r.type === 'js')
        .reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
      
      const totalCSSSize = responses
        .filter(r => r.type === 'css')
        .reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
      
      console.log(`Total JS size: ${totalJSSize} bytes`);
      console.log(`Total CSS size: ${totalCSSSize} bytes`);
      
      // JS bundle should be under 1MB
      expect(totalJSSize).toBeLessThan(1024 * 1024);
      
      // CSS bundle should be under 100KB
      expect(totalCSSSize).toBeLessThan(100 * 1024);
    });

    test('should load critical resources quickly', async ({ page }) => {
      const criticalResources: string[] = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.includes('main.') || url.includes('index.') || url.includes('app.')) {
          criticalResources.push(url);
        }
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForSelector('h1'); // Wait for main content
      const endTime = Date.now();
      
      // Critical resources should load within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
      expect(criticalResources.length).toBeGreaterThan(0);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle form interactions efficiently', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      const startTime = Date.now();
      
      // Perform rapid form interactions
      await page.fill('input[name="name"]', 'Performance Test User');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      await page.fill('input[name="height"]', '175');
      await page.fill('input[name="weight"]', '70');
      
      const endTime = Date.now();
      
      // Form interactions should be responsive (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should handle analysis computation efficiently', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill minimum required data
      await page.fill('input[name="name"]', 'Analysis Performance Test');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      
      const startTime = Date.now();
      
      // Start analysis
      await page.click('button:has-text("Analyze Health")');
      
      // Wait for analysis to complete
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      const endTime = Date.now();
      const analysisTime = endTime - startTime;
      
      console.log(`Analysis completed in ${analysisTime}ms`);
      
      // Analysis should complete within 5 seconds
      expect(analysisTime).toBeLessThan(5000);
    });

    test('should handle 3D rendering efficiently', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Complete analysis first
      await page.fill('input[name="name"]', '3D Performance Test');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      const startTime = Date.now();
      
      // Switch between different 3D models
      await page.click('button:has-text("Heart")');
      await page.waitForSelector('[data-testid="heart-model"]');
      
      await page.click('button:has-text("Liver")');
      await page.waitForSelector('[data-testid="liver-model"]');
      
      await page.click('button:has-text("Kidneys")');
      await page.waitForSelector('[data-testid="kidney-model"]');
      
      const endTime = Date.now();
      
      // 3D model switching should be smooth (under 500ms)
      expect(endTime - startTime).toBeLessThan(500);
    });

    test('should maintain performance with large datasets', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill form with extensive data
      await page.fill('input[name="name"]', 'Large Dataset Test');
      await page.fill('input[name="age"]', '45');
      await page.selectOption('select[name="gender"]', 'female');
      
      // Expand and fill medical history
      await page.click('button:has-text("Medical History")');
      
      const startTime = Date.now();
      
      // Add multiple medical history entries
      for (let i = 0; i < 20; i++) {
        await page.click('button:has-text("Add Condition")');
        await page.fill(`input[name="condition-${i}"]`, `Test Condition ${i}`);
        await page.fill(`input[name="date-${i}"]`, '2023-01-01');
      }
      
      const endTime = Date.now();
      
      // Should handle large datasets efficiently (under 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Form should remain responsive
      await expect(page.locator('input[name="name"]')).toHaveValue('Large Dataset Test');
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have memory leaks during normal usage', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Perform multiple analysis cycles
      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="name"]', `Memory Test ${i}`);
        await page.fill('input[name="age"]', '30');
        await page.selectOption('select[name="gender"]', 'male');
        
        await page.click('button:has-text("Analyze Health")');
        await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
        
        // Clear and repeat
        await page.click('button:has-text("Clear Data")');
        await page.click('button:has-text("Confirm")');
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      console.log(`Initial memory: ${initialMemory} bytes`);
      console.log(`Final memory: ${finalMemory} bytes`);
      
      // Memory usage should not increase significantly (less than 50% increase)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
        expect(memoryIncrease).toBeLessThan(0.5);
      }
    });

    test('should handle rapid navigation without memory issues', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      const startMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Rapidly navigate between sections
      for (let i = 0; i < 10; i++) {
        await page.click('nav >> text=Analytics');
        await page.waitForSelector('text=Analytics Dashboard');
        
        await page.click('nav >> text=Security');
        await page.waitForSelector('text=Security Dashboard');
        
        await page.click('nav >> text=Home');
        await page.waitForSelector('text=Patient Information');
      }
      
      const endMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      console.log(`Navigation memory test - Start: ${startMemory}, End: ${endMemory}`);
      
      // Memory should not grow excessively during navigation
      if (startMemory > 0 && endMemory > 0) {
        const memoryGrowth = (endMemory - startMemory) / startMemory;
        expect(memoryGrowth).toBeLessThan(0.3);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out data URLs and external resources
      const appRequests = requests.filter(url => 
        !url.startsWith('data:') && 
        !url.includes('google') && 
        !url.includes('cdn')
      );
      
      console.log(`Total app requests: ${appRequests.length}`);
      
      // Should make reasonable number of requests (under 20)
      expect(appRequests.length).toBeLessThan(20);
    });

    test('should cache resources effectively', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const firstVisitRequests: string[] = [];
      page.on('request', request => {
        firstVisitRequests.push(request.url());
      });
      
      // Second visit (should use cache)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any additional requests
      await page.waitForTimeout(1000);
      
      console.log(`Requests on reload: ${firstVisitRequests.length}`);
      
      // Should make fewer requests on reload due to caching
      expect(firstVisitRequests.length).toBeLessThan(10);
    });

    test('should handle offline scenarios gracefully', async ({ page, context }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill form while online
      await page.fill('input[name="name"]', 'Offline Test');
      await page.fill('input[name="age"]', '30');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to perform analysis
      await page.click('button:has-text("Analyze Health")');
      
      // Should show appropriate offline message
      await expect(page.locator('text=offline')).toBeVisible({ timeout: 5000 });
      
      // Go back online
      await context.setOffline(false);
      
      // Should recover and work normally
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analyzing')).toBeVisible();
    });
  });

  test.describe('Scalability Tests', () => {
    test('should handle concurrent users simulation', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Simulate multiple concurrent operations
      const operations = [
        page.fill('input[name="name"]', 'Concurrent User 1'),
        page.fill('input[name="age"]', '25'),
        page.selectOption('select[name="gender"]', 'male'),
        page.click('button:has-text("Vital Signs")'),
        page.fill('input[name="heartRate"]', '70'),
      ];
      
      const startTime = Date.now();
      
      // Execute all operations concurrently
      await Promise.all(operations);
      
      const endTime = Date.now();
      
      // Concurrent operations should complete quickly
      expect(endTime - startTime).toBeLessThan(500);
      
      // Verify all operations completed successfully
      await expect(page.locator('input[name="name"]')).toHaveValue('Concurrent User 1');
      await expect(page.locator('input[name="age"]')).toHaveValue('25');
    });

    test('should maintain performance under stress', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      const startTime = Date.now();
      
      // Perform stress test with rapid interactions
      for (let i = 0; i < 50; i++) {
        await page.fill('input[name="name"]', `Stress Test ${i}`);
        await page.fill('input[name="age"]', (20 + i % 50).toString());
        
        if (i % 10 === 0) {
          // Occasionally perform more complex operations
          await page.click('button:has-text("Vital Signs")');
          await page.fill('input[name="heartRate"]', (60 + i % 40).toString());
        }
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`Stress test completed in ${totalTime}ms`);
      
      // Should handle stress test within reasonable time (under 5 seconds)
      expect(totalTime).toBeLessThan(5000);
      
      // Final state should be correct
      await expect(page.locator('input[name="name"]')).toHaveValue('Stress Test 49');
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track performance metrics', async ({ page }) => {
      // Enable performance monitoring
      await page.addInitScript(() => {
        (window as any).performanceMetrics = [];
        
        // Track navigation timing
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          (window as any).performanceMetrics.push({
            type: 'navigation',
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          });
        });
        
        // Track resource timing
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              (window as any).performanceMetrics.push({
                type: 'resource',
                name: entry.name,
                duration: entry.duration,
              });
            }
          });
        }).observe({ entryTypes: ['resource'] });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get performance metrics
      const metrics = await page.evaluate(() => (window as any).performanceMetrics);
      
      console.log('Performance metrics collected:', metrics.length);
      
      // Should have collected metrics
      expect(metrics.length).toBeGreaterThan(0);
      
      // Check for navigation metrics
      const navigationMetrics = metrics.filter((m: any) => m.type === 'navigation');
      expect(navigationMetrics.length).toBeGreaterThan(0);
    });

    test('should measure Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      
      // Measure Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: Record<string, number> = {};
          
          // Measure LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Measure FID (simulated)
          document.addEventListener('click', (event) => {
            const start = performance.now();
            setTimeout(() => {
              vitals.fid = performance.now() - start;
            }, 0);
          });
          
          // Measure CLS
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Return metrics after a delay
          setTimeout(() => resolve(vitals), 3000);
        });
      });
      
      console.log('Core Web Vitals:', vitals);
      
      // Validate Core Web Vitals thresholds
      if ((vitals as any).lcp) {
        expect((vitals as any).lcp).toBeLessThan(2500); // LCP should be under 2.5s
      }
      
      if ((vitals as any).cls) {
        expect((vitals as any).cls).toBeLessThan(0.1); // CLS should be under 0.1
      }
    });
  });
});

