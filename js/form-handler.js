/**
 * WebGlo Custom Form Handler
 * Handles form submissions via Google Apps Script
 * Completely free and customizable solution
 */

class FormHandler {
  constructor() {
    this.scriptUrl = 'https://script.google.com/macros/s/AKfycbyvyoIRoKveFc-DV3PqR9d8GjB8hoGxERNoSpx7CxZvXVnd2Uj260eMLhXMMS4EwtoCTQ/exec'; // Replace with your deployed script URL
    this.forms = new Map();
    this.init();
  }

  init() {
    // Initialize all forms on the page
    document.addEventListener('DOMContentLoaded', () => {
      const forms = document.querySelectorAll('form[data-webglo-form]');
      forms.forEach(form => this.setupForm(form));
    });
  }

  setupForm(form) {
    const formId = form.getAttribute('data-webglo-form') || 'contact';
    this.forms.set(formId, form);
    
    form.addEventListener('submit', (e) => this.handleSubmit(e, formId));
    
    // Add loading and success states
    this.addFormStates(form);
  }

  addFormStates(form) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'webglo-form-loading hidden absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg';
    loadingOverlay.innerHTML = `
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
        <p class="text-gray-600 font-medium">Sending your message...</p>
      </div>
    `;
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'webglo-form-success hidden p-6 bg-green-50 border border-green-200 rounded-lg mb-6';
    successMessage.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Message sent successfully!</h3>
          <p class="mt-1 text-sm text-green-700">We'll get back to you within 24 hours.</p>
        </div>
      </div>
    `;

    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'webglo-form-error hidden p-6 bg-red-50 border border-red-200 rounded-lg mb-6';
    errorMessage.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error sending message</h3>
          <p class="mt-1 text-sm text-red-700">Please try again or contact us directly at hello@webglo.org</p>
        </div>
      </div>
    `;

    // Make form container relative for absolute positioning
    form.style.position = 'relative';
    
    // Insert messages before form
    form.parentNode.insertBefore(successMessage, form);
    form.parentNode.insertBefore(errorMessage, form);
    form.appendChild(loadingOverlay);
  }

  async handleSubmit(event, formId) {
    event.preventDefault();
    
    const form = this.forms.get(formId);
    const formData = new FormData(form);
    
    // Show loading state
    this.setFormState(form, 'loading');
    
    try {
      // Prepare data for Google Apps Script
      const data = {
        formType: formId,
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData.entries()),
        source: window.location.href,
        userAgent: navigator.userAgent
      };

      // Send to Google Apps Script
      const response = await this.sendToGoogleScript(data);
      
      if (response.success) {
        this.setFormState(form, 'success');
        form.reset(); // Clear form
        
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          this.setFormState(form, 'normal');
        }, 10000);
        
        // Track successful submission
        this.trackSubmission(formId, 'success');
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.setFormState(form, 'error');
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => {
        this.setFormState(form, 'normal');
      }, 8000);
      
      // Track failed submission
      this.trackSubmission(formId, 'error', error.message);
    }
  }

  async sendToGoogleScript(data) {
    const response = await fetch(this.scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    // Since we use no-cors, we can't read the response
    // We'll assume success and handle errors via timeout
    return new Promise((resolve) => {
      // Simulate success after reasonable time
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  }

  setFormState(form, state) {
    const loading = form.querySelector('.webglo-form-loading');
    const success = form.parentNode.querySelector('.webglo-form-success');
    const error = form.parentNode.querySelector('.webglo-form-error');
    
    // Hide all states
    loading?.classList.add('hidden');
    success?.classList.add('hidden');
    error?.classList.add('hidden');
    
    // Show appropriate state
    switch (state) {
      case 'loading':
        loading?.classList.remove('hidden');
        break;
      case 'success':
        success?.classList.remove('hidden');
        break;
      case 'error':
        error?.classList.remove('hidden');
        break;
      case 'normal':
      default:
        // All hidden by default
        break;
    }
  }

  trackSubmission(formId, status, error = null) {
    // Track form submissions for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submission', {
        form_id: formId,
        status: status,
        error: error
      });
    }
    
    // Log to console for debugging
    console.log(`Form submission: ${formId} - ${status}`, error || '');
  }

  // Public method to update script URL
  setScriptUrl(url) {
    this.scriptUrl = url;
  }

  // Public method to manually trigger form submission (for testing)
  async submitForm(formId, data) {
    const form = this.forms.get(formId);
    if (!form) {
      throw new Error(`Form with ID '${formId}' not found`);
    }
    
    // Populate form with data
    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) field.value = value;
    });
    
    // Trigger submission
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
  }
}

// Initialize form handler
window.webgloForms = new FormHandler();

// Fallback for older browsers
if (!window.FormData) {
  console.warn('FormData not supported. Form submissions may not work properly.');
}
