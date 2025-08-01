/**
 * WebGlo Security Quick Test
 * Simple security test that can be run in browser console
 */

function runSecurityTest() {
  console.log('🔒 Starting WebGlo Security Quick Test...\n');
  
  const results = [];
  
  // Test 1: Check if scripts are loaded
  console.log('📦 Checking script availability...');
  
  const securityConfigAvailable = typeof SecurityConfig !== 'undefined';
  console.log(`SecurityConfig: ${securityConfigAvailable ? '✅ Available' : '❌ Not loaded'}`);
  results.push(['SecurityConfig loaded', securityConfigAvailable]);
  
  const formHandlerAvailable = typeof FormHandler !== 'undefined';
  console.log(`FormHandler: ${formHandlerAvailable ? '✅ Available' : '❌ Not loaded'}`);
  results.push(['FormHandler loaded', formHandlerAvailable]);
  
  // Test 2: Check form elements
  console.log('\n📋 Checking form elements...');
  
  const form = document.querySelector('form[data-webglo-form]');
  const formExists = !!form;
  console.log(`Contact form: ${formExists ? '✅ Found' : '❌ Not found'}`);
  results.push(['Contact form exists', formExists]);
  
  if (formExists) {
    const honeypot = form.querySelector('input[name="website"]');
    const honeypotExists = !!honeypot;
    console.log(`Honeypot field: ${honeypotExists ? '✅ Found' : '❌ Missing'}`);
    results.push(['Honeypot field exists', honeypotExists]);
    
    if (honeypotExists) {
      const isHidden = honeypot.style.display === 'none' || 
                      honeypot.hasAttribute('hidden') ||
                      honeypot.classList.contains('hidden');
      console.log(`Honeypot hidden: ${isHidden ? '✅ Properly hidden' : '❌ Visible'}`);
      results.push(['Honeypot properly hidden', isHidden]);
    }
  }
  
  // Test 3: Check form handler instance
  console.log('\n🔧 Checking form handler instance...');
  
  if (typeof window.formHandler !== 'undefined') {
    console.log('✅ FormHandler instance found');
    results.push(['FormHandler instance exists', true]);
    
    const hasSecurityConfig = !!window.formHandler.securityConfig;
    console.log(`Security config in handler: ${hasSecurityConfig ? '✅ Available' : '❌ Missing'}`);
    results.push(['FormHandler has security config', hasSecurityConfig]);
    
  } else {
    console.log('❌ FormHandler instance not found');
    results.push(['FormHandler instance exists', false]);
  }
  
  // Test 4: Check environment detection
  console.log('\n🌍 Checking environment...');
  
  const currentDomain = window.location.hostname;
  const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
  const isProduction = currentDomain === 'webglo.org' || currentDomain === 'www.webglo.org';
  
  console.log(`Current domain: ${currentDomain}`);
  console.log(`Environment: ${isProduction ? 'Production' : isLocalhost ? 'Development' : 'Unknown'}`);
  results.push(['Environment detected', isProduction || isLocalhost]);
  
  // Test 5: Test basic validation
  console.log('\n✅ Testing validation...');
  
  try {
    if (securityConfigAvailable) {
      const config = new SecurityConfig();
      const testEmail = config.config.validation.email.test('test@example.com');
      console.log(`Email validation working: ${testEmail ? '✅ Yes' : '❌ No'}`);
      results.push(['Email validation working', testEmail]);
    } else {
      console.log('⚠️ SecurityConfig not available for validation test');
      results.push(['Email validation working', false]);
    }
  } catch (error) {
    console.log('❌ Error testing validation:', error.message);
    results.push(['Email validation working', false]);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r[1]).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 All tests passed! Security measures are working.');
  } else if (percentage >= 70) {
    console.log('⚠️ Most tests passed, but some issues need attention.');
  } else {
    console.log('🚨 Several issues detected. Review the failed tests above.');
  }
  
  // Show recommendations
  console.log('\n💡 Recommendations:');
  
  if (!securityConfigAvailable) {
    console.log('- Ensure security-config.js is loaded before form-handler.js');
  }
  
  if (!formExists) {
    console.log('- Make sure you\'re on a page with a contact form');
  }
  
  if (formExists && !form.querySelector('input[name="website"]')) {
    console.log('- Add honeypot field to the form for spam protection');
  }
  
  console.log('- Test the actual form submission to verify full functionality');
  console.log('- Check browser Network tab for any failed script loads');
  
  return results;
}

// Auto-run instructions
console.log('WebGlo Security Quick Test loaded.');
console.log('Run: runSecurityTest() to test security measures');

// Export for use
if (typeof window !== 'undefined') {
  window.runSecurityTest = runSecurityTest;
}
