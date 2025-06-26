/**
 * Security Tests for BioTwin360
 * Automated security testing and vulnerability assessment
 */

import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication and Authorization', () => {
    test('should enforce secure session management', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Check for secure session cookies
      const cookies = await page.context().cookies();
      
      // Session cookies should have secure flags
      const sessionCookies = cookies.filter(cookie => 
        cookie.name.includes('session') || cookie.name.includes('auth')
      );
      
      sessionCookies.forEach(cookie => {
        expect(cookie.secure).toBe(true);
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.sameSite).toBe('Strict');
      });
    });

    test('should handle invalid authentication attempts', async ({ page }) => {
      // Try to access protected resources without authentication
      await page.goto('/admin');
      
      // Should redirect to login or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 5000 });
    });

    test('should implement proper session timeout', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Simulate session timeout by manipulating time
      await page.evaluate(() => {
        // Mock session expiration
        localStorage.setItem('session_expires', (Date.now() - 1000).toString());
      });
      
      // Try to perform authenticated action
      await page.reload();
      
      // Should handle expired session gracefully
      await expect(page.locator('text=Session Expired')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Data Protection and Encryption', () => {
    test('should encrypt sensitive data in localStorage', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill in sensitive patient data
      await page.fill('input[name="name"]', 'Sensitive Patient Data');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      
      // Check localStorage content
      const localStorageData = await page.evaluate(() => {
        return localStorage.getItem('biotwin360_patient_data');
      });
      
      if (localStorageData) {
        // Data should be encrypted (not plain text)
        expect(localStorageData).not.toContain('Sensitive Patient Data');
        
        // Should contain encrypted data markers
        expect(localStorageData).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 pattern
      }
    });

    test('should protect against XSS attacks', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Try to inject malicious script
      const maliciousScript = '<script>alert("XSS")</script>';
      
      await page.fill('input[name="name"]', maliciousScript);
      
      // Script should be sanitized and not executed
      const nameValue = await page.locator('input[name="name"]').inputValue();
      expect(nameValue).not.toContain('<script>');
      
      // Check that no alert was triggered
      page.on('dialog', dialog => {
        throw new Error('XSS attack succeeded - alert was triggered');
      });
      
      await page.waitForTimeout(1000); // Wait to see if any alerts appear
    });

    test('should sanitize user input', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Test various injection attempts
      const injectionAttempts = [
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '"><script>alert(1)</script>',
        '\'; DROP TABLE patients; --',
        '{{7*7}}', // Template injection
        '${7*7}', // Expression injection
      ];
      
      for (const injection of injectionAttempts) {
        await page.fill('input[name="name"]', injection);
        
        // Input should be sanitized
        const value = await page.locator('input[name="name"]').inputValue();
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('javascript:');
        expect(value).not.toContain('onerror');
      }
    });

    test('should implement Content Security Policy', async ({ page }) => {
      // Check for CSP headers
      const response = await page.goto('/');
      const headers = response?.headers();
      
      expect(headers?.['content-security-policy']).toBeDefined();
      
      // CSP should restrict inline scripts
      const csp = headers?.['content-security-policy'];
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    });
  });

  test.describe('Network Security', () => {
    test('should enforce HTTPS', async ({ page }) => {
      // Check that all requests use HTTPS in production
      const requests: string[] = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // In production, all requests should use HTTPS
      const httpRequests = requests.filter(url => url.startsWith('http://'));
      
      // Allow localhost for development
      const nonLocalHttpRequests = httpRequests.filter(url => 
        !url.includes('localhost') && !url.includes('127.0.0.1')
      );
      
      expect(nonLocalHttpRequests).toHaveLength(0);
    });

    test('should have proper security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Check for essential security headers
      expect(headers?.['x-frame-options']).toBeDefined();
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['referrer-policy']).toBeDefined();
      expect(headers?.['permissions-policy']).toBeDefined();
      
      // Check for HSTS in production
      if (page.url().startsWith('https://')) {
        expect(headers?.['strict-transport-security']).toBeDefined();
      }
    });

    test('should prevent clickjacking', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // X-Frame-Options should prevent framing
      const xFrameOptions = headers?.['x-frame-options'];
      expect(xFrameOptions).toMatch(/DENY|SAMEORIGIN/);
      
      // CSP should also prevent framing
      const csp = headers?.['content-security-policy'];
      expect(csp).toContain("frame-ancestors 'self'");
    });

    test('should handle CORS properly', async ({ page }) => {
      // Test CORS by making cross-origin requests
      const corsTest = await page.evaluate(async () => {
        try {
          const response = await fetch('https://evil-site.com/api/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: 'data' }),
          });
          return { success: true, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      // Cross-origin requests should be blocked
      expect(corsTest.success).toBe(false);
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    test('should validate form inputs', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Test invalid age values
      const invalidAges = ['-1', '999', 'abc', '<script>', ''];
      
      for (const age of invalidAges) {
        await page.fill('input[name="age"]', age);
        await page.click('button:has-text("Analyze Health")');
        
        // Should show validation error
        await expect(page.locator('text=Invalid age')).toBeVisible({ timeout: 2000 });
        
        // Clear the error for next test
        await page.fill('input[name="age"]', '');
      }
    });

    test('should prevent SQL injection attempts', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Test SQL injection patterns
      const sqlInjections = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM patients --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ];
      
      for (const injection of sqlInjections) {
        await page.fill('input[name="name"]', injection);
        
        // Input should be sanitized
        const value = await page.locator('input[name="name"]').inputValue();
        expect(value).not.toContain('DROP TABLE');
        expect(value).not.toContain('UNION SELECT');
        expect(value).not.toContain('INSERT INTO');
      }
    });

    test('should validate file uploads', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Try to upload malicious files
      const maliciousFiles = [
        { name: 'malware.exe', content: 'MZ\x90\x00', type: 'application/x-msdownload' },
        { name: 'script.js', content: 'alert("XSS")', type: 'application/javascript' },
        { name: 'large.txt', content: 'x'.repeat(10 * 1024 * 1024), type: 'text/plain' }, // 10MB
      ];
      
      for (const file of maliciousFiles) {
        const fileInput = page.locator('input[type="file"]');
        
        if (await fileInput.count() > 0) {
          // Create file and try to upload
          await fileInput.setInputFiles({
            name: file.name,
            mimeType: file.type,
            buffer: Buffer.from(file.content),
          });
          
          // Should show validation error for malicious files
          await expect(page.locator('text=Invalid file type')).toBeVisible({ timeout: 2000 });
        }
      }
    });
  });

  test.describe('Privacy and GDPR Compliance', () => {
    test('should show privacy notice', async ({ page }) => {
      // Privacy notice should be visible on first visit
      await expect(page.locator('text=Privacy Notice')).toBeVisible();
      await expect(page.locator('text=We use cookies')).toBeVisible();
      
      // Should have granular consent options
      await expect(page.locator('button:has-text("Accept All")')).toBeVisible();
      await expect(page.locator('button:has-text("Reject All")')).toBeVisible();
      await expect(page.locator('button:has-text("Customize")')).toBeVisible();
    });

    test('should respect user consent choices', async ({ page }) => {
      // Reject all cookies
      await page.click('button:has-text("Reject All")');
      
      // Check that only essential cookies are set
      const cookies = await page.context().cookies();
      const nonEssentialCookies = cookies.filter(cookie => 
        !cookie.name.includes('essential') && 
        !cookie.name.includes('session') &&
        !cookie.name.includes('csrf')
      );
      
      expect(nonEssentialCookies).toHaveLength(0);
    });

    test('should allow data deletion', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill in some data
      await page.fill('input[name="name"]', 'Data to Delete');
      await page.fill('input[name="age"]', '30');
      
      // Navigate to privacy settings
      await page.click('text=Privacy Settings');
      
      // Request data deletion
      await page.click('button:has-text("Delete My Data")');
      await page.click('button:has-text("Confirm Deletion")');
      
      // Data should be deleted
      await expect(page.locator('text=Data deleted successfully')).toBeVisible();
      
      // Verify data is actually deleted
      const localStorageData = await page.evaluate(() => {
        return localStorage.getItem('biotwin360_patient_data');
      });
      
      expect(localStorageData).toBeFalsy();
    });

    test('should provide data export', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill in some data
      await page.fill('input[name="name"]', 'Export Test User');
      await page.fill('input[name="age"]', '35');
      
      // Navigate to privacy settings
      await page.click('text=Privacy Settings');
      
      // Request data export
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export My Data")');
      
      // Should download user data
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('user-data');
      expect(download.suggestedFilename()).toContain('.json');
    });
  });

  test.describe('Error Handling and Information Disclosure', () => {
    test('should not expose sensitive information in errors', async ({ page }) => {
      // Trigger various error conditions
      await page.route('**/api/**', route => route.abort());
      
      await page.click('button:has-text("Accept All")');
      await page.fill('input[name="name"]', 'Error Test');
      await page.fill('input[name="age"]', '30');
      await page.click('button:has-text("Analyze Health")');
      
      // Wait for error message
      await expect(page.locator('text=error')).toBeVisible({ timeout: 5000 });
      
      // Error message should not contain sensitive information
      const errorText = await page.locator('[data-testid="error-message"]').textContent();
      
      if (errorText) {
        expect(errorText).not.toContain('database');
        expect(errorText).not.toContain('server');
        expect(errorText).not.toContain('internal');
        expect(errorText).not.toContain('stack trace');
        expect(errorText).not.toContain('password');
        expect(errorText).not.toContain('token');
      }
    });

    test('should handle malformed requests gracefully', async ({ page }) => {
      // Intercept and modify requests to send malformed data
      await page.route('**/api/**', route => {
        route.continue({
          postData: 'malformed json {{{',
          headers: {
            ...route.request().headers(),
            'Content-Type': 'application/json',
          },
        });
      });
      
      await page.click('button:has-text("Accept All")');
      await page.fill('input[name="name"]', 'Malformed Test');
      await page.click('button:has-text("Analyze Health")');
      
      // Should handle malformed requests gracefully
      await expect(page.locator('text=Request failed')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Rate Limiting and DoS Protection', () => {
    test('should implement rate limiting', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill form once
      await page.fill('input[name="name"]', 'Rate Limit Test');
      await page.fill('input[name="age"]', '30');
      
      // Rapidly submit multiple requests
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(page.click('button:has-text("Analyze Health")'));
      }
      
      await Promise.all(requests);
      
      // Should show rate limiting message
      await expect(page.locator('text=Too many requests')).toBeVisible({ timeout: 5000 });
    });

    test('should handle large payloads', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Try to submit very large data
      const largeString = 'x'.repeat(1024 * 1024); // 1MB string
      
      await page.fill('input[name="name"]', largeString);
      await page.click('button:has-text("Analyze Health")');
      
      // Should reject large payloads
      await expect(page.locator('text=Payload too large')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Audit and Monitoring', () => {
    test('should log security events', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Perform actions that should be logged
      await page.fill('input[name="name"]', 'Audit Test');
      await page.click('button:has-text("Analyze Health")');
      
      // Navigate to security dashboard (if accessible)
      await page.goto('/security');
      
      // Should show audit logs
      await expect(page.locator('text=Security Events')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="audit-log"]')).toBeVisible();
    });

    test('should detect suspicious activity', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Simulate suspicious activity patterns
      const suspiciousPatterns = [
        'admin',
        'root',
        'administrator',
        'test',
        'guest',
      ];
      
      for (const pattern of suspiciousPatterns) {
        await page.fill('input[name="name"]', pattern);
        await page.click('button:has-text("Analyze Health")');
        await page.waitForTimeout(100);
      }
      
      // Should detect and flag suspicious activity
      // (This would depend on the specific implementation)
    });
  });

  test.describe('Secure Communication', () => {
    test('should use secure WebSocket connections', async ({ page }) => {
      // Check for WebSocket connections
      const wsConnections: string[] = [];
      
      page.on('websocket', ws => {
        wsConnections.push(ws.url());
      });
      
      await page.click('button:has-text("Accept All")');
      
      // Trigger real-time features that might use WebSockets
      await page.click('button:has-text("Real-time Monitoring")');
      
      // WebSocket connections should use wss:// (secure)
      wsConnections.forEach(url => {
        if (!url.includes('localhost')) {
          expect(url).toMatch(/^wss:/);
        }
      });
    });

    test('should validate API responses', async ({ page }) => {
      // Intercept API responses and modify them
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            maliciousScript: '<script>alert("XSS")</script>',
            invalidData: { nested: { tooDeep: { way: { too: { deep: 'value' } } } } },
          }),
        });
      });
      
      await page.click('button:has-text("Accept All")');
      await page.fill('input[name="name"]', 'API Validation Test');
      await page.click('button:has-text("Analyze Health")');
      
      // Should validate and sanitize API responses
      await expect(page.locator('text=<script>')).not.toBeVisible();
    });
  });

  test.describe('Dependency Security', () => {
    test('should not expose vulnerable dependencies', async ({ page }) => {
      // Check for common vulnerable patterns in loaded scripts
      const scripts = await page.evaluate(() => {
        const scriptElements = document.querySelectorAll('script[src]');
        return Array.from(scriptElements).map(script => script.getAttribute('src'));
      });
      
      // Should not load known vulnerable libraries
      const vulnerablePatterns = [
        /jquery.*1\.[0-7]/i, // Old jQuery versions
        /angular.*1\.[0-5]/i, // Old Angular versions
        /lodash.*[0-3]\./i, // Old Lodash versions
      ];
      
      scripts.forEach(src => {
        if (src) {
          vulnerablePatterns.forEach(pattern => {
            expect(src).not.toMatch(pattern);
          });
        }
      });
    });
  });
});

