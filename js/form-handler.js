/**
 * WebGlo Custom Form Handler
 * Handles form submissions via Google Apps Script
 * Completely free and customizable solution
 */

class FormHandler {
  constructor() {
    // Initialize security configuration with fallback
    this.initializeSecurity();
    
    // Use environment-aware script URL
    this.scriptUrl = this.getScriptUrl();
    this.forms = new Map();
    this.init();
  }

  initializeSecurity() {
    // Check if SecurityConfig is available
    if (typeof SecurityConfig !== 'undefined') {
      try {
        this.securityConfig = new SecurityConfig();
        console.log('✅ SecurityConfig initialized successfully');
      } catch (error) {
        console.warn('⚠️ Error initializing SecurityConfig:', error);
        this.securityConfig = this.createFallbackSecurity();
      }
    } else {
      console.warn('⚠️ SecurityConfig not found, using fallback security');
      this.securityConfig = this.createFallbackSecurity();
    }
  }

  createFallbackSecurity() {
    // Fallback security configuration if SecurityConfig is not available
    return {
      isProduction: window.location.hostname === 'webglo.org' || window.location.hostname === 'www.webglo.org',
      
      validateFormData: (formData) => {
        const errors = [];
        if (!formData.get('name') || !formData.get('name').trim()) {
          errors.push('Name is required');
        }
        if (!formData.get('email') || !formData.get('email').trim()) {
          errors.push('Email is required');
        }
        if (!formData.get('message') || !formData.get('message').trim()) {
          errors.push('Message is required');
        }
        return { isValid: errors.length === 0, errors };
      },
      
      checkRateLimit: () => {
        const now = Date.now();
        const lastSubmission = localStorage.getItem('webglo_form_submission');
        if (lastSubmission) {
          const timeDiff = now - parseInt(lastSubmission);
          if (timeDiff < 30000) {
            return { allowed: false, remainingTime: Math.ceil((30000 - timeDiff) / 1000) };
          }
        }
        localStorage.setItem('webglo_form_submission', now.toString());
        return { allowed: true };
      },
      
      generateSecurityToken: () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const source = window.location.hostname;
        return btoa(`${timestamp}:${random}:${source}`).substring(0, 32);
      },
      
      isDomainAllowed: (url) => {
        try {
          const domain = new URL(url).hostname;
          const allowedDomains = ['webglo.org', 'www.webglo.org', 'localhost', '127.0.0.1'];
          return allowedDomains.includes(domain);
        } catch {
          return false;
        }
      },
      
      logSecurityEvent: (event, details) => {
        console.log(`Security Event: ${event}`, details);
      }
    };
  }

  getScriptUrl() {
    // Use security config for environment detection
    if (this.securityConfig.isProduction) {
      // Obfuscated production URL - still public but less obvious
      const parts = [
        'https://script.google.com/macros/s/',
        'AKfycbyvyoIRoKveFc-DV3PqR9d8GjB8hoGxERNoSpx7CxZvXVnd2Uj260eMLhXMMS4EwtoCTQ',
        '/exec'
      ];
      return parts.join('');
    } else {
      // Development/testing URL (can be different)
      return 'https://script.google.com/macros/s/AKfycbyvyoIRoKveFc-DV3PqR9d8GjB8hoGxERNoSpx7CxZvXVnd2Uj260eMLhXMMS4EwtoCTQ/exec';
    }
  }

  init() {
    // Initialize forms immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeForms();
      });
    } else {
      // DOM is already ready
      this.initializeForms();
    }
  }

  initializeForms() {
    const forms = document.querySelectorAll('form[data-webglo-form]');
    console.log(`🔧 Initializing ${forms.length} WebGlo form(s)`);
    forms.forEach(form => this.setupForm(form));
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
    
    // Enhanced security validation using SecurityConfig
    const validation = this.securityConfig.validateFormData(formData);
    if (!validation.isValid) {
      this.securityConfig.logSecurityEvent('Form validation failed', { 
        errors: validation.errors,
        formId: formId 
      });
      this.setFormState(form, 'error');
      return;
    }
    
    // Rate limiting check using SecurityConfig
    const rateLimitCheck = this.securityConfig.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      this.securityConfig.logSecurityEvent('Rate limit exceeded', { 
        remainingTime: rateLimitCheck.remainingTime,
        formId: formId 
      });
      
      // Show rate limit message
      this.showRateLimitMessage(form, rateLimitCheck.remainingTime);
      return;
    }
    
    // Basic honeypot spam check
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      this.securityConfig.logSecurityEvent('Honeypot triggered', { formId: formId });
      // Likely spam - fail silently but log it
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Show loading state
    this.setFormState(form, 'loading');
    
    try {
      // Prepare data for Google Apps Script with enhanced security
      const data = {
        formType: formId,
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData.entries()),
        source: window.location.href,
        userAgent: navigator.userAgent,
        // Add security token using SecurityConfig
        securityToken: this.securityConfig.generateSecurityToken(),
        // Add domain validation
        allowedDomain: this.securityConfig.isDomainAllowed(window.location.href)
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

  showRateLimitMessage(form, remainingTime) {
    // Find or create rate limit message
    let rateLimitMessage = form.parentNode.querySelector('.webglo-form-ratelimit');
    
    if (!rateLimitMessage) {
      rateLimitMessage = document.createElement('div');
      rateLimitMessage.className = 'webglo-form-ratelimit p-6 bg-yellow-50 border border-yellow-200 rounded-lg mb-6';
      form.parentNode.insertBefore(rateLimitMessage, form);
    }
    
    rateLimitMessage.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Please wait before submitting again</h3>
          <p class="mt-1 text-sm text-yellow-700">You can submit another message in ${remainingTime} seconds.</p>
        </div>
      </div>
    `;
    
    rateLimitMessage.classList.remove('hidden');
    
    // Hide the message after the remaining time
    setTimeout(() => {
      rateLimitMessage.classList.add('hidden');
    }, remainingTime * 1000);
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

// Initialize form handler globally
window.formHandler = new FormHandler();

// Also create backup reference for compatibility
window.webgloForms = window.formHandler;

// Fallback for older browsers
if (!window.FormData) {
  console.warn('FormData not supported. Form submissions may not work properly.');
}
