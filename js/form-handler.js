/**
 * Simple WebGlo Form Handler
 * Clean, minimal approach - one handler for all forms
 */

class SimpleFormHandler {
  constructor() {
    this.scriptUrl = 'https://script.google.com/macros/s/AKfycbxtonT0H__IZAsENyE97Wb1IOu1Gfq-XI899L5Gecg3zk-JczZmjQOOrEwcIiX2YH0/exec';
    this.init();
  }

  init() {
    console.log('🚀 Simple form handler initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupForms());
    } else {
      this.setupForms();
    }
  }

  setupForms() {
    // Find all WebGlo forms
    const forms = document.querySelectorAll('form[data-webglo-form]');
    console.log(`Found ${forms.length} form(s) to handle`);
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
      this.addStatusElements(form);
    });
  }

  addStatusElements(form) {
    // Add loading overlay
    const loading = document.createElement('div');
    loading.className = 'form-loading hidden absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10';
    loading.innerHTML = `
      <div class="text-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
        <p class="text-gray-600 text-sm">Sending...</p>
      </div>
    `;
    
    // Add success message
    const success = document.createElement('div');
    success.className = 'form-success hidden p-4 bg-green-50 border border-green-200 rounded-lg mb-4';
    success.innerHTML = `
      <div class="flex items-center text-green-800">
        <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="text-sm font-medium">Success! Message sent.</span>
      </div>
    `;
    
    // Add error message
    const error = document.createElement('div');
    error.className = 'form-error hidden p-4 bg-red-50 border border-red-200 rounded-lg mb-4';
    error.innerHTML = `
      <div class="flex items-center text-red-800">
        <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="text-sm">Failed to send. Please email info@webglo.org</span>
      </div>
    `;
    
    // Make form relative and add elements
    form.style.position = 'relative';
    form.parentNode.insertBefore(success, form);
    form.parentNode.insertBefore(error, form);
    form.appendChild(loading);
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formType = form.getAttribute('data-webglo-form') || 'contact';
    
    console.log(`📧 Submitting ${formType} form`);
    
    // Show loading
    this.setFormState(form, 'loading');
    
    try {
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Basic validation
      if (formType === 'newsletter' && !data.email) {
        throw new Error('Email is required');
      }
      if (formType === 'contact' && (!data.email || !data.message)) {
        throw new Error('Email and message are required');
      }
      
      // Prepare payload
      const payload = {
        type: formType,
        data: data,
        timestamp: new Date().toISOString(),
        source: window.location.href
      };
      
      console.log('📤 Sending:', payload);
      
      // Send to Google Apps Script
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Success!');
        this.setFormState(form, 'success');
        form.reset();
        
        // Hide success after 5 seconds
        setTimeout(() => this.setFormState(form, 'normal'), 5000);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Form error:', error);
      this.setFormState(form, 'error');
      
      // Hide error after 5 seconds
      setTimeout(() => this.setFormState(form, 'normal'), 5000);
    }
  }

  setFormState(form, state) {
    const loading = form.querySelector('.form-loading');
    const success = form.parentNode.querySelector('.form-success');
    const error = form.parentNode.querySelector('.form-error');
    
    // Hide all
    loading?.classList.add('hidden');
    success?.classList.add('hidden');
    error?.classList.add('hidden');
    
    // Show relevant state
    if (state === 'loading') loading?.classList.remove('hidden');
    if (state === 'success') success?.classList.remove('hidden');
    if (state === 'error') error?.classList.remove('hidden');
  }
}

// Initialize when page loads
console.log('🔧 Loading Simple Form Handler...');
new SimpleFormHandler();
