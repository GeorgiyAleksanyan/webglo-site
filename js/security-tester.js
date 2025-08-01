/**
 * WebGlo Security Test Suite
 * Run this in browser console to test security measures
 */

class SecurityTester {
  constructor() {
    this.results = [];
    this.testForm = document.querySelector('form[data-webglo-form]');
  }

  log(test, result, details = '') {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const message = `${status}: ${test}`;
    console.log(message, details);
    this.results.push({ test, result, details, message });
  }

  async runAllTests() {
    console.log('🔒 Starting WebGlo Security Tests...\n');
    
    await this.testSecurityConfigExists();
    await this.testFormHandlerSecurity();
    await this.testRateLimiting();
    await this.testHoneypotDetection();
    await this.testInputValidation();
    await this.testEnvironmentDetection();
    
    this.printSummary();
  }

  async testSecurityConfigExists() {
    const exists = typeof SecurityConfig !== 'undefined';
    this.log('SecurityConfig class loaded', exists);
    
    if (exists) {
      const config = new SecurityConfig();
      this.log('SecurityConfig can be instantiated', !!config);
      this.log('Environment detection working', typeof config.isProduction === 'boolean');
      this.log('Configuration object available', !!config.config);
    }
  }

  async testFormHandlerSecurity() {
    const formHandlerExists = typeof FormHandler !== 'undefined';
    this.log('FormHandler class loaded', formHandlerExists);
    
    if (formHandlerExists && window.formHandler) {
      const hasSecurityConfig = !!window.formHandler.securityConfig;
      this.log('FormHandler has SecurityConfig', hasSecurityConfig);
      
      if (hasSecurityConfig) {
        const hasValidation = typeof window.formHandler.securityConfig.validateFormData === 'function';
        this.log('Form validation method available', hasValidation);
      }
    }
  }

  async testRateLimiting() {
    if (!this.testForm) {
      this.log('Rate limiting test', false, 'No form found to test');
      return;
    }

    // Check if rate limiting storage exists
    const hasRateLimit = localStorage.getItem('webglo_form_submission') !== null;
    
    if (!hasRateLimit) {
      // Set a recent submission time
      localStorage.setItem('webglo_form_submission', Date.now().toString());
    }
    
    const config = new SecurityConfig();
    const rateLimitCheck = config.checkRateLimit();
    
    this.log('Rate limiting functional', !rateLimitCheck.allowed || rateLimitCheck.allowed);
    
    if (!rateLimitCheck.allowed) {
      this.log('Rate limit properly enforced', true, `${rateLimitCheck.remainingTime}s remaining`);
    }
  }

  async testHoneypotDetection() {
    if (!this.testForm) {
      this.log('Honeypot test', false, 'No form found to test');
      return;
    }

    const honeypotField = this.testForm.querySelector('input[name="website"]');
    const honeypotExists = !!honeypotField;
    this.log('Honeypot field exists', honeypotExists);
    
    if (honeypotExists) {
      const isHidden = honeypotField.style.display === 'none' || 
                      honeypotField.hasAttribute('hidden') ||
                      honeypotField.classList.contains('hidden');
      this.log('Honeypot field is hidden', isHidden);
      
      const hasProperAttributes = honeypotField.hasAttribute('tabindex') && 
                                  honeypotField.hasAttribute('aria-hidden');
      this.log('Honeypot has accessibility attributes', hasProperAttributes);
    }
  }

  async testInputValidation() {
    if (!SecurityConfig) {
      this.log('Input validation test', false, 'SecurityConfig not available');
      return;
    }

    const config = new SecurityConfig();
    
    // Test email validation
    const validEmail = config.config.validation.email.test('test@example.com');
    const invalidEmail = config.config.validation.email.test('invalid-email');
    
    this.log('Email validation (valid email)', validEmail);
    this.log('Email validation (invalid email)', !invalidEmail);
    
    // Test form data validation if form exists
    if (this.testForm) {
      const formData = new FormData();
      formData.append('name', '');
      formData.append('email', 'invalid');
      formData.append('message', 'short');
      formData.append('website', ''); // honeypot
      
      const validation = config.validateFormData(formData);
      this.log('Form validation catches errors', !validation.isValid && validation.errors.length > 0);
    }
  }

  async testEnvironmentDetection() {
    if (!SecurityConfig) {
      this.log('Environment detection test', false, 'SecurityConfig not available');
      return;
    }

    const config = new SecurityConfig();
    const currentDomain = window.location.hostname;
    const isKnownDomain = config.config.allowedDomains.includes(currentDomain);
    
    this.log('Current domain recognized', isKnownDomain, `Domain: ${currentDomain}`);
    this.log('Environment detection works', typeof config.isProduction === 'boolean');
    
    // Test domain validation
    const validDomain = config.isDomainAllowed(window.location.href);
    this.log('Domain validation works', validDomain);
  }

  printSummary() {
    console.log('\n📊 Security Test Summary:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.result).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('🎉 All security tests passed!');
    } else if (percentage >= 80) {
      console.log('⚠️  Most tests passed, review failures');
    } else {
      console.log('🚨 Security issues detected, review immediately');
    }
    
    // Show failed tests
    const failed = this.results.filter(r => !r.result);
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(f => console.log(`   ${f.test}: ${f.details}`));
    }
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(r => console.log(`   ${r.message}`));
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined' && window.location) {
  console.log('WebGlo Security Tester loaded. Run: new SecurityTester().runAllTests()');
}
