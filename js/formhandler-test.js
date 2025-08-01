// Simple FormHandler test
console.log('🧪 Testing FormHandler creation...');

// Check if FormHandler class exists
if (typeof FormHandler !== 'undefined') {
  console.log('✅ FormHandler class is available');
  
  try {
    // Try to create instance manually
    const testHandler = new FormHandler();
    console.log('✅ FormHandler instance created successfully:', testHandler);
    
    // Assign to window if not already there
    if (typeof window.formHandler === 'undefined') {
      window.formHandler = testHandler;
      console.log('✅ Assigned FormHandler to window.formHandler');
    }
    
  } catch (error) {
    console.error('❌ Error creating FormHandler:', error);
    console.error('Error stack:', error.stack);
  }
} else {
  console.error('❌ FormHandler class not found!');
}

// Also check dependencies
console.log('Dependencies check:', {
  SecurityConfig: typeof SecurityConfig,
  FormData: typeof FormData,
  fetch: typeof fetch
});
