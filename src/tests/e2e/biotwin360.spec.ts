/**
 * End-to-End Tests for BioTwin360
 * Complete user journey testing with Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('BioTwin360 E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Application Loading and Initial State', () => {
    test('should load the application successfully', async ({ page }) => {
      // Check that the main title is visible
      await expect(page.locator('h1')).toContainText('BioTwin360');
      
      // Check that main navigation is present
      await expect(page.locator('nav')).toBeVisible();
      
      // Check that the patient form is visible
      await expect(page.locator('form')).toBeVisible();
    });

    test('should show GDPR notice on first visit', async ({ page }) => {
      // Check for GDPR notice
      await expect(page.locator('text=Privacy Notice')).toBeVisible();
      await expect(page.locator('text=We use cookies')).toBeVisible();
      
      // Check for accept buttons
      await expect(page.locator('button:has-text("Accept All")')).toBeVisible();
      await expect(page.locator('button:has-text("Reject All")')).toBeVisible();
    });

    test('should hide GDPR notice after acceptance', async ({ page }) => {
      // Accept GDPR notice
      await page.click('button:has-text("Accept All")');
      
      // GDPR notice should disappear
      await expect(page.locator('text=Privacy Notice')).not.toBeVisible();
      
      // Check that acceptance is persisted
      await page.reload();
      await expect(page.locator('text=Privacy Notice')).not.toBeVisible();
    });
  });

  test.describe('Patient Data Entry Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Accept GDPR notice
      await page.click('button:has-text("Accept All")');
    });

    test('should allow entering basic patient information', async ({ page }) => {
      // Fill in patient information
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      await page.fill('input[name="height"]', '175');
      await page.fill('input[name="weight"]', '70');
      
      // Verify the data is entered correctly
      await expect(page.locator('input[name="name"]')).toHaveValue('John Doe');
      await expect(page.locator('input[name="age"]')).toHaveValue('35');
      await expect(page.locator('select[name="gender"]')).toHaveValue('male');
    });

    test('should validate required fields', async ({ page }) => {
      // Try to analyze without required fields
      await page.click('button:has-text("Analyze Health")');
      
      // Should show validation errors
      await expect(page.locator('text=Patient name is required')).toBeVisible();
      await expect(page.locator('text=Age is required')).toBeVisible();
    });

    test('should validate age range', async ({ page }) => {
      await page.fill('input[name="name"]', 'Test Patient');
      await page.fill('input[name="age"]', '150');
      await page.selectOption('select[name="gender"]', 'male');
      
      // Try to analyze with invalid age
      await page.click('button:has-text("Analyze Health")');
      
      // Should show age validation error
      await expect(page.locator('text=Age must be between 0 and 120')).toBeVisible();
    });

    test('should allow entering vital signs', async ({ page }) => {
      // Expand vital signs section
      await page.click('button:has-text("Vital Signs")');
      
      // Fill in vital signs
      await page.fill('input[name="heartRate"]', '72');
      await page.fill('input[name="systolic"]', '120');
      await page.fill('input[name="diastolic"]', '80');
      await page.fill('input[name="temperature"]', '36.5');
      
      // Verify vital signs are entered
      await expect(page.locator('input[name="heartRate"]')).toHaveValue('72');
      await expect(page.locator('input[name="systolic"]')).toHaveValue('120');
    });

    test('should allow entering lab results', async ({ page }) => {
      // Expand lab results section
      await page.click('button:has-text("Lab Results")');
      
      // Fill in lab results
      await page.fill('input[name="cholesterol"]', '180');
      await page.fill('input[name="glucose"]', '90');
      await page.fill('input[name="hemoglobin"]', '14.5');
      
      // Verify lab results are entered
      await expect(page.locator('input[name="cholesterol"]')).toHaveValue('180');
      await expect(page.locator('input[name="glucose"]')).toHaveValue('90');
    });
  });

  test.describe('Health Analysis Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Accept GDPR notice
      await page.click('button:has-text("Accept All")');
      
      // Fill in minimum required patient data
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      await page.fill('input[name="height"]', '175');
      await page.fill('input[name="weight"]', '70');
    });

    test('should perform complete health analysis', async ({ page }) => {
      // Start analysis
      await page.click('button:has-text("Analyze Health")');
      
      // Should show loading state
      await expect(page.locator('text=Analyzing')).toBeVisible();
      
      // Wait for analysis to complete (with timeout)
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      // Should show overall risk score
      await expect(page.locator('text=Overall Risk Score')).toBeVisible();
      
      // Should show organ analysis results
      await expect(page.locator('text=Organ Analysis')).toBeVisible();
    });

    test('should display individual organ results', async ({ page }) => {
      // Perform analysis
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      // Check for individual organ results
      await expect(page.locator('text=Heart')).toBeVisible();
      await expect(page.locator('text=Liver')).toBeVisible();
      await expect(page.locator('text=Kidneys')).toBeVisible();
      await expect(page.locator('text=Lungs')).toBeVisible();
      await expect(page.locator('text=Brain')).toBeVisible();
      
      // Each organ should have a risk score
      await expect(page.locator('[data-testid="heart-risk-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="liver-risk-score"]')).toBeVisible();
    });

    test('should show 3D organ visualizations', async ({ page }) => {
      // Perform analysis
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      // Should show 3D models
      await expect(page.locator('[data-testid="heart-model"]')).toBeVisible();
      
      // Should be able to switch between organs
      await page.click('button:has-text("Liver")');
      await expect(page.locator('[data-testid="liver-model"]')).toBeVisible();
      
      await page.click('button:has-text("Kidneys")');
      await expect(page.locator('[data-testid="kidney-model"]')).toBeVisible();
    });

    test('should provide health recommendations', async ({ page }) => {
      // Perform analysis
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
      
      // Should show recommendations section
      await expect(page.locator('text=Recommendations')).toBeVisible();
      
      // Should have at least one recommendation
      await expect(page.locator('[data-testid="recommendation-item"]')).toHaveCount({ min: 1 });
    });
  });

  test.describe('Export and Sharing Features', () => {
    test.beforeEach(async ({ page }) => {
      // Accept GDPR, fill form, and complete analysis
      await page.click('button:has-text("Accept All")');
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      await page.click('button:has-text("Analyze Health")');
      await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 10000 });
    });

    test('should export analysis as PDF', async ({ page }) => {
      // Start PDF export
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export PDF")');
      
      // Should show export progress
      await expect(page.locator('text=Generating PDF')).toBeVisible();
      
      // Wait for download to complete
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should export data as JSON', async ({ page }) => {
      // Start JSON export
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Data")');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
    });

    test('should share analysis via link', async ({ page }) => {
      // Open share dialog
      await page.click('button:has-text("Share")');
      
      // Should show share options
      await expect(page.locator('text=Share Analysis')).toBeVisible();
      
      // Generate share link
      await page.click('button:has-text("Generate Link")');
      
      // Should show generated link
      await expect(page.locator('input[readonly]')).toBeVisible();
      
      // Copy link button should be available
      await expect(page.locator('button:has-text("Copy Link")')).toBeVisible();
    });
  });

  test.describe('Advanced Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Accept All")');
    });

    test('should access analytics dashboard', async ({ page }) => {
      // Navigate to analytics
      await page.click('nav >> text=Analytics');
      
      // Should show analytics dashboard
      await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
      
      // Should show charts and metrics
      await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="population-metrics"]')).toBeVisible();
    });

    test('should access security dashboard', async ({ page }) => {
      // Navigate to security
      await page.click('nav >> text=Security');
      
      // Should show security dashboard
      await expect(page.locator('text=Security Dashboard')).toBeVisible();
      
      // Should show security metrics
      await expect(page.locator('text=Security Events')).toBeVisible();
      await expect(page.locator('text=Active Sessions')).toBeVisible();
    });

    test('should access backup management', async ({ page }) => {
      // Navigate to backup
      await page.click('nav >> text=Backup');
      
      // Should show backup dashboard
      await expect(page.locator('text=Backup & Recovery')).toBeVisible();
      
      // Should show backup options
      await expect(page.locator('button:has-text("Create Backup")')).toBeVisible();
    });

    test('should use medical assistant', async ({ page }) => {
      // Open medical assistant
      await page.click('button:has-text("Medical Assistant")');
      
      // Should show assistant interface
      await expect(page.locator('text=Medical Assistant')).toBeVisible();
      
      // Should be able to send a message
      await page.fill('textarea[placeholder*="Ask"]', 'What is a healthy heart rate?');
      await page.click('button:has-text("Send")');
      
      // Should receive a response
      await expect(page.locator('[data-testid="assistant-response"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive Design and Mobile', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Accept GDPR
      await page.click('button:has-text("Accept All")');
      
      // Should show mobile navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Should be able to fill form on mobile
      await page.fill('input[name="name"]', 'Mobile User');
      await page.fill('input[name="age"]', '30');
      
      // Form should be usable
      await expect(page.locator('input[name="name"]')).toHaveValue('Mobile User');
    });

    test('should adapt layout for tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.click('button:has-text("Accept All")');
      
      // Should show tablet-optimized layout
      await expect(page.locator('nav')).toBeVisible();
      
      // Form should be properly sized
      const form = page.locator('form');
      const boundingBox = await form.boundingBox();
      expect(boundingBox?.width).toBeLessThan(768);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill form with data
      await page.fill('input[name="name"]', 'Performance Test User');
      await page.fill('input[name="age"]', '35');
      await page.selectOption('select[name="gender"]', 'male');
      
      // Expand and fill many fields quickly
      await page.click('button:has-text("Medical History")');
      
      for (let i = 0; i < 10; i++) {
        await page.fill(`input[name="condition-${i}"]`, `Condition ${i}`);
      }
      
      // Should remain responsive
      await expect(page.locator('input[name="name"]')).toHaveValue('Performance Test User');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      // Fill form and try to analyze
      await page.fill('input[name="name"]', 'Network Test');
      await page.fill('input[name="age"]', '30');
      await page.selectOption('select[name="gender"]', 'male');
      
      await page.click('button:has-text("Analyze Health")');
      
      // Should show error message
      await expect(page.locator('text=Network error')).toBeVisible({ timeout: 5000 });
    });

    test('should handle invalid data gracefully', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Enter invalid data
      await page.fill('input[name="name"]', '');
      await page.fill('input[name="age"]', '-5');
      
      await page.click('button:has-text("Analyze Health")');
      
      // Should show validation errors
      await expect(page.locator('text=Patient name is required')).toBeVisible();
      await expect(page.locator('text=Age must be')).toBeVisible();
    });

    test('should recover from JavaScript errors', async ({ page }) => {
      // Monitor console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.click('button:has-text("Accept All")');
      
      // Perform normal operations
      await page.fill('input[name="name"]', 'Error Test');
      await page.fill('input[name="age"]', '25');
      
      // App should continue to function despite any console errors
      await expect(page.locator('input[name="name"]')).toHaveValue('Error Test');
      
      // Log any errors for debugging
      if (errors.length > 0) {
        console.log('Console errors detected:', errors);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Should be able to navigate with Tab
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Should be able to activate buttons with Enter
      const nameInput = page.locator('input[name="name"]');
      await nameInput.focus();
      await page.keyboard.type('Keyboard User');
      
      await expect(nameInput).toHaveValue('Keyboard User');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Check for ARIA labels on form elements
      await expect(page.locator('input[name="name"]')).toHaveAttribute('aria-label');
      await expect(page.locator('input[name="age"]')).toHaveAttribute('aria-label');
      
      // Check for proper heading structure
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2')).toHaveCount({ min: 1 });
    });

    test('should work with screen readers', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Check for screen reader friendly elements
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      
      // Form should have proper labels
      const nameInput = page.locator('input[name="name"]');
      const label = await nameInput.getAttribute('aria-label');
      expect(label).toBeTruthy();
    });
  });

  test.describe('Data Persistence', () => {
    test('should save and restore patient data', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill in patient data
      await page.fill('input[name="name"]', 'Persistent User');
      await page.fill('input[name="age"]', '40');
      await page.selectOption('select[name="gender"]', 'female');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Data should be restored
      await expect(page.locator('input[name="name"]')).toHaveValue('Persistent User');
      await expect(page.locator('input[name="age"]')).toHaveValue('40');
      await expect(page.locator('select[name="gender"]')).toHaveValue('female');
    });

    test('should clear data when requested', async ({ page }) => {
      await page.click('button:has-text("Accept All")');
      
      // Fill in data
      await page.fill('input[name="name"]', 'Clear Test User');
      await page.fill('input[name="age"]', '35');
      
      // Clear data
      await page.click('button:has-text("Clear Data")');
      await page.click('button:has-text("Confirm")');
      
      // Data should be cleared
      await expect(page.locator('input[name="name"]')).toHaveValue('');
      await expect(page.locator('input[name="age"]')).toHaveValue('');
    });
  });
});

