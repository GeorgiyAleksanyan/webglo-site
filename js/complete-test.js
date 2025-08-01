/**
 * Complete WebGlo Security and Form Test Suite
 * Run this after page load to verify everything is working
 */

function runCompleteTest() {
  console.log('🚀 Starting Complete WebGlo Test Suite...\n');
  
  // Wait for page to fully load
  if (document.readyState !== 'complete') {
    console.log('⏳ Waiting for page to load...');
    window.addEventListener('load', runCompleteTest);
    return;
  }
  
  const results = [];
  let testNumber = 1;
  
  function logTest(name, result, details = '') {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${testNumber}. ${status}: ${name}`, details);
    results.push({ test: name, result, details });
    testNumber++;
  }
  
  // Test 1: Core Dependencies
  console.log('📦 Testing Core Dependencies...');
  logTest('SecurityConfig available', typeof SecurityConfig !== 'undefined');
  logTest('FormHandler available', typeof FormHandler !== 'undefined');
  logTest('Main WebGlo class available', typeof WebGloMain !== 'undefined');
  
  // Test 2: Form Handler Instance
  console.log('\n🔧 Testing Form Handler Instance...');
  const hasFormHandlerInstance = typeof window.formHandler !== 'undefined';
  logTest('FormHandler instance exists', hasFormHandlerInstance);
  
  if (hasFormHandlerInstance) {
    logTest('FormHandler has security config', !!window.formHandler.securityConfig);
    logTest('FormHandler has script URL', !!window.formHandler.scriptUrl);
    logTest('FormHandler has forms map', window.formHandler.forms instanceof Map);
  }
  
  // Test 3: Form Elements
  console.log('\n📋 Testing Form Elements...');
  const form = document.querySelector('form[data-webglo-form]');
  logTest('Contact form exists', !!form);
  
  if (form) {
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    requiredFields.forEach(field => {
      const element = form.querySelector(`[name="${field}"]`);
      logTest(`Required field '${field}' exists`, !!element);
    });
    
    const honeypot = form.querySelector('input[name="website"]');
    logTest('Honeypot field exists', !!honeypot);
    
    if (honeypot) {
      const isHidden = honeypot.style.display === 'none' || 
                      honeypot.hasAttribute('hidden') ||
                      honeypot.offsetParent === null;
      logTest('Honeypot field is hidden', isHidden);
    }
  }
  
  // Test 4: Security Configuration
  console.log('\n🔒 Testing Security Configuration...');
  if (typeof SecurityConfig !== 'undefined') {
    try {
      const config = new SecurityConfig();
      logTest('SecurityConfig instantiation', true);
      logTest('Environment detection', typeof config.isProduction === 'boolean');
      logTest('Validation rules exist', !!config.config.validation);
      logTest('Rate limiting config', !!config.config.rateLimit);
      logTest('Domain validation', Array.isArray(config.config.allowedDomains));
      
      // Test email validation
      const emailTest = config.config.validation.email.test('test@example.com');
      logTest('Email validation (valid)', emailTest);
      
      const emailTestInvalid = !config.config.validation.email.test('invalid-email');
      logTest('Email validation (invalid)', emailTestInvalid);
      
    } catch (error) {
      logTest('SecurityConfig functionality', false, error.message);
    }
  }
  
  // Test 5: Form Validation
  console.log('\n✅ Testing Form Validation...');
  if (form && hasFormHandlerInstance) {
    const testFormData = new FormData();
    testFormData.append('firstName', '');
    testFormData.append('lastName', 'Doe');
    testFormData.append('email', 'invalid-email');
    testFormData.append('message', 'Hi');
    testFormData.append('website', ''); // Honeypot should be empty
    
    const validation = window.formHandler.securityConfig.validateFormData(testFormData);
    logTest('Form validation catches errors', !validation.isValid && validation.errors.length > 0);
  }
  
  // Test 6: Rate Limiting
  console.log('\n⏱️ Testing Rate Limiting...');
  if (hasFormHandlerInstance) {
    const rateLimitCheck1 = window.formHandler.securityConfig.checkRateLimit();
    logTest('Rate limit first check', rateLimitCheck1.allowed);
    
    // Immediately check again (should be blocked)
    const rateLimitCheck2 = window.formHandler.securityConfig.checkRateLimit();
    logTest('Rate limit second check (blocked)', !rateLimitCheck2.allowed);
    
    if (!rateLimitCheck2.allowed) {
      logTest('Rate limit provides remaining time', typeof rateLimitCheck2.remainingTime === 'number');
    }
  }
  
  // Test 7: Environment Detection
  console.log('\n🌍 Testing Environment...');
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = hostname === 'webglo.org' || hostname === 'www.webglo.org';
  
  logTest('Current environment detected', isLocalhost || isProduction, `Domain: ${hostname}`);
  
  if (hasFormHandlerInstance) {
    const scriptUrl = window.formHandler.scriptUrl;
    logTest('Script URL configured', !!scriptUrl && scriptUrl.includes('script.google.com'));
  }
  
  // Test 8: Security Token Generation
  console.log('\n🎫 Testing Security Token...');
  if (hasFormHandlerInstance) {
    try {
      const token = window.formHandler.securityConfig.generateSecurityToken();
      logTest('Security token generation', !!token && token.length > 0);
    } catch (error) {
      logTest('Security token generation', false, error.message);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('==================');
  
  const passed = results.filter(r => r.result).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 Perfect! All security measures are working correctly.');
  } else if (percentage >= 90) {
    console.log('🟢 Excellent! Minor issues detected but security is strong.');
  } else if (percentage >= 75) {
    console.log('🟡 Good! Some issues need attention but core security works.');
  } else {
    console.log('🔴 Issues detected! Review failed tests and fix security gaps.');
  }
  
  // Failed tests
  const failed = results.filter(r => !r.result);
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(f => console.log(`   - ${f.test}: ${f.details || 'Check implementation'}`));
  }
  
  // Next steps
  console.log('\n🎯 Next Steps:');
  if (percentage < 100) {
    console.log('1. Fix any failed tests above');
    console.log('2. Refresh page and test again');
  }
  console.log('3. Test actual form submission with valid data');
  console.log('4. Check that emails are received');
  console.log('5. Verify Google Sheets logging');
  
  return { passed, total, percentage, results };
}

// Auto-run when available
if (typeof window !== 'undefined') {
  window.runCompleteTest = runCompleteTest;
  
  // Auto-run after a short delay to let everything load
  setTimeout(() => {
    if (document.readyState === 'complete') {
      console.log('🔧 Complete test suite available. Run: runCompleteTest()');
    }
  }, 1000);
}
