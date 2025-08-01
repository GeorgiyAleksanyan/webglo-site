/**
 * WebGlo Form Submission Test
 * Tests the actual form submission process
 */

function testFormSubmission() {
  console.log('🧪 Testing Form Submission...\n');
  
  // Check if form handler exists
  if (!window.formHandler) {
    console.error('❌ FormHandler not found!');
    return false;
  }
  
  // Find the form
  const form = document.querySelector('form[data-webglo-form]');
  if (!form) {
    console.error('❌ Contact form not found!');
    return false;
  }
  
  console.log('✅ Form found, filling with test data...');
  
  // Fill form with test data
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    company: 'Test Company',
    message: 'This is a test message to verify the form submission system is working correctly. This message should be at least 10 characters long to pass validation.',
    website: '' // Honeypot should remain empty
  };
  
  // Fill the form
  Object.entries(testData).forEach(([key, value]) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      field.value = value;
      console.log(`📝 Set ${key}: ${value}`);
    }
  });
  
  console.log('\n🚀 Submitting form...');
  
  // Submit the form
  try {
    const submitEvent = new Event('submit', { 
      bubbles: true, 
      cancelable: true 
    });
    
    form.dispatchEvent(submitEvent);
    
    console.log('✅ Form submission triggered successfully!');
    console.log('⏳ Watch for loading animation and success message...');
    console.log('📧 Check your email for notifications...');
    console.log('📊 Check Google Sheets for data logging...');
    
    return true;
    
  } catch (error) {
    console.error('❌ Form submission failed:', error);
    return false;
  }
}

function testSecurityFeatures() {
  console.log('🔒 Testing Security Features...\n');
  
  const form = document.querySelector('form[data-webglo-form]');
  if (!form || !window.formHandler) {
    console.error('❌ Prerequisites not met for security testing');
    return;
  }
  
  console.log('1️⃣ Testing Rate Limiting...');
  
  // Test rate limiting by trying to submit twice quickly
  testFormSubmission();
  
  setTimeout(() => {
    console.log('2️⃣ Testing rate limit (should be blocked)...');
    testFormSubmission();
  }, 1000);
  
  setTimeout(() => {
    console.log('3️⃣ Testing Honeypot Detection...');
    
    // Fill honeypot field (should be caught as spam)
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot) {
      honeypot.value = 'http://spam-bot-website.com';
      console.log('🍯 Honeypot filled with spam value...');
      
      testFormSubmission();
      
      // Reset honeypot
      setTimeout(() => {
        honeypot.value = '';
        console.log('🧹 Honeypot cleared');
      }, 2000);
    }
  }, 2000);
}

function validateFormFields() {
  console.log('✅ Testing Form Validation...\n');
  
  const form = document.querySelector('form[data-webglo-form]');
  if (!form || !window.formHandler) {
    console.error('❌ Prerequisites not met for validation testing');
    return;
  }
  
  // Test with invalid data
  const invalidData = {
    firstName: '', // Empty name
    lastName: 'User',
    email: 'invalid-email', // Invalid email
    message: 'Short', // Too short message
    website: '' // Honeypot empty (correct)
  };
  
  console.log('🔍 Testing with invalid data...');
  
  // Create FormData for validation
  const formData = new FormData();
  Object.entries(invalidData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Test validation
  const validation = window.formHandler.securityConfig.validateFormData(formData);
  
  if (!validation.isValid) {
    console.log('✅ Validation correctly caught errors:');
    validation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  } else {
    console.log('❌ Validation should have failed but passed');
  }
  
  // Test with valid data
  console.log('\n🔍 Testing with valid data...');
  
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    message: 'This is a valid message that is long enough to pass validation requirements.',
    website: ''
  };
  
  const validFormData = new FormData();
  Object.entries(validData).forEach(([key, value]) => {
    validFormData.append(key, value);
  });
  
  const validValidation = window.formHandler.securityConfig.validateFormData(validFormData);
  
  if (validValidation.isValid) {
    console.log('✅ Valid data passed validation correctly');
  } else {
    console.log('❌ Valid data failed validation:');
    validValidation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }
}

// Export functions to window
if (typeof window !== 'undefined') {
  window.testFormSubmission = testFormSubmission;
  window.testSecurityFeatures = testSecurityFeatures;
  window.validateFormFields = validateFormFields;
  
  console.log('🧪 Form testing functions loaded:');
  console.log('   - testFormSubmission() - Test complete form submission');
  console.log('   - testSecurityFeatures() - Test rate limiting and honeypot');
  console.log('   - validateFormFields() - Test form validation logic');
}
