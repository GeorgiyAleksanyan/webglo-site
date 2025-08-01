/**
 * WebGlo Contact Form Handler
 * Dedicated handler for contact form submissions
 * Comprehensive validation and professional communication
 */

class ContactFormHandler {
  constructor() {
    // Initialize security configuration
    this.initializeSecurity();
    this.scriptUrl = this.getScriptUrl();
    this.forms = new Map();
    this.init();
  }

  initializeSecurity() {
    // Check if SecurityConfig is available
    if (typeof SecurityConfig !== 'undefined') {
      try {
        this.securityConfig = new SecurityConfig();
        console.log('✅ SecurityConfig initialized for contact forms');
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
    return {
      isProduction: window.location.hostname === 'webglo.org' || window.location.hostname === 'www.webglo.org',
      
      validateFormData: (formData) => {
        const errors = [];
        
        // Contact form validation - all fields required
        if (!formData.get('firstName') || !formData.get('firstName').trim()) {
          errors.push('First name is required');
        }
        if (!formData.get('lastName') || !formData.get('lastName').trim()) {
          errors.push('Last name is required');
        }
        if (!formData.get('email') || !formData.get('email').trim()) {
          errors.push('Email is required');
        }
        if (!formData.get('message') || !formData.get('message').trim()) {
          errors.push('Message is required');
        }
        
        // Email format validation
        const email = formData.get('email');
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
          }
        }
        
        // Message length validation - reduced minimum length
        const message = formData.get('message');
        if (message && message.trim().length < 5) {
          errors.push('Message must be at least 5 characters long');
        }
        
        return { isValid: errors.length === 0, errors };
      },
      
      checkRateLimit: () => {
        const now = Date.now();
        const lastSubmission = localStorage.getItem('webglo_contact_submission');
        if (lastSubmission) {
          const timeDiff = now - parseInt(lastSubmission);
          // Reduced rate limit to 30 seconds for better UX
          if (timeDiff < 30000) { 
            return { allowed: false, remainingTime: Math.ceil((30000 - timeDiff) / 1000) };
          }
        }
        localStorage.setItem('webglo_contact_submission', now.toString());
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
        console.log(`Contact Security Event: ${event}`, details);
      }
    };
  }

  getScriptUrl() {
    if (this.securityConfig.isProduction) {
      // Production URL for contact forms
      return 'https://script.google.com/macros/s/AKfycbyDiuGlHBz3Y_Ba76IEoeYrnB179_NBYR-FX1iW29-VWJtuVaAYdEokLpx7Y-qSw57WIQ/exec';
    } else {
      // Development URL
      return 'https://script.google.com/macros/s/AKfycbyDiuGlHBz3Y_Ba76IEoeYrnB179_NBYR-FX1iW29-VWJtuVaAYdEokLpx7Y-qSw57WIQ/exec';
    }
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeForms();
      });
    } else {
      this.initializeForms();
    }
  }

  initializeForms() {
    const forms = document.querySelectorAll('form[data-webglo-form="contact"]');
    console.log(`📞 Initializing ${forms.length} contact form(s)`);
    forms.forEach(form => this.setupForm(form));
  }

  setupForm(form) {
    const formId = 'contact';
    this.forms.set(formId, form);
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.addFormStates(form);
    this.addRealTimeValidation(form);
  }

  addFormStates(form) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'contact-loading hidden absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10';
    loadingOverlay.innerHTML = `
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
        <p class="text-gray-600 font-medium">Sending your message...</p>
        <p class="text-gray-500 text-sm mt-1">This may take a few seconds</p>
      </div>
    `;
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'contact-success hidden p-6 bg-green-50 border border-green-200 rounded-lg mb-6';
    successMessage.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-green-800">Message sent successfully! 🎉</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>Thank you for contacting WebGlo! We've received your message and will get back to you within 24 hours.</p>
            <p class="mt-2 font-medium">Next steps:</p>
            <ul class="mt-1 list-disc list-inside">
              <li>Check your email for our confirmation message</li>
              <li>We'll review your project details</li>
              <li>Expect a personalized response soon</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'contact-error hidden p-6 bg-red-50 border border-red-200 rounded-lg mb-6';
    errorMessage.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-red-800">Error sending message</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>We encountered an issue sending your message. Please try again or contact us directly:</p>
            <p class="mt-2"><strong>Email:</strong> <a href="mailto:info@webglo.org" class="underline">info@webglo.org</a></p>
            <p><strong>Phone:</strong> <a href="tel:8482074616" class="underline">(848) 207-4616</a></p>
          </div>
        </div>
      </div>
    `;

    // Make form container relative
    form.style.position = 'relative';
    
    // Insert messages before form
    form.parentNode.insertBefore(successMessage, form);
    form.parentNode.insertBefore(errorMessage, form);
    form.appendChild(loadingOverlay);
  }

  addRealTimeValidation(form) {
    // Add real-time validation for better UX
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        // Clear error state when user starts typing
        this.clearFieldError(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let error = null;
    
    // Validation rules
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value) {
          error = `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length < 2) {
          error = `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        break;
        
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;
        
      case 'message':
        if (!value) {
          error = 'Message is required';
        } else if (value.length < 10) {
          error = 'Message must be at least 10 characters long';
        } else if (value.length > 2000) {
          error = 'Message must be less than 2000 characters';
        }
        break;
        
      case 'phone':
        if (value) {
          // Optional field, but validate format if provided
          const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            error = 'Please enter a valid phone number';
          }
        }
        break;
    }
    
    if (error) {
      this.showFieldError(field, error);
    } else {
      this.clearFieldError(field);
    }
    
    return !error;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    
    field.classList.add('border-red-500', 'focus:border-red-500');
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    field.classList.remove('border-red-500', 'focus:border-red-500');
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    console.log('📞 Contact form submission started');
    console.log('Form data:', Object.fromEntries(formData.entries()));
    
    // Clear any existing field errors
    form.querySelectorAll('input, textarea, select').forEach(field => {
      this.clearFieldError(field);
    });
    
    // Comprehensive validation
    const validation = this.securityConfig.validateFormData(formData);
    if (!validation.isValid) {
      console.error('❌ Contact form validation failed:', validation.errors);
      
      // Show field-specific errors
      validation.errors.forEach(error => {
        if (error.includes('First name')) {
          const field = form.querySelector('input[name="firstName"]');
          if (field) this.showFieldError(field, error);
        } else if (error.includes('Last name')) {
          const field = form.querySelector('input[name="lastName"]');
          if (field) this.showFieldError(field, error);
        } else if (error.includes('Email') || error.includes('email')) {
          const field = form.querySelector('input[name="email"]');
          if (field) this.showFieldError(field, error);
        } else if (error.includes('Message')) {
          const field = form.querySelector('textarea[name="message"]');
          if (field) this.showFieldError(field, error);
        }
      });
      
      // Focus on first error field
      const firstErrorField = form.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      
      return;
    }
    
    // Rate limiting check
    const rateLimitCheck = this.securityConfig.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      console.warn('⚠️ Contact form rate limit exceeded');
      this.showRateLimitMessage(form, rateLimitCheck.remainingTime);
      return;
    }
    
    // Honeypot spam check
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn('🍯 Contact form honeypot triggered');
      // Silently fail but appear successful
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Show loading state
    this.setFormState(form, 'loading');
    
    try {
      // Prepare data for contact form submission
      const data = {
        formType: 'contact',
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData.entries()),
        source: window.location.href,
        userAgent: navigator.userAgent,
        securityToken: this.securityConfig.generateSecurityToken(),
        allowedDomain: this.securityConfig.isDomainAllowed(window.location.href)
      };

      console.log('📋 Contact data prepared:', data);

      // Send to Google Apps Script
      const response = await this.sendToGoogleScript(data);
      
      console.log('📬 Contact response:', response);
      
      if (response.success) {
        console.log('✅ Contact form submitted successfully!');
        this.setFormState(form, 'success');
        form.reset();
        
        // Auto-hide success message after 20 seconds
        setTimeout(() => {
          this.setFormState(form, 'normal');
        }, 20000);
        
        // Track successful submission
        this.trackSubmission('success');
      } else {
        throw new Error(response.error || 'Contact submission failed');
      }
      
    } catch (error) {
      console.error('❌ Contact form submission error:', error);
      this.setFormState(form, 'error');
      
      // Auto-hide error message after 15 seconds
      setTimeout(() => {
        this.setFormState(form, 'normal');
      }, 15000);
      
      // Track failed submission
      this.trackSubmission('error', error.message);
    }
  }

  async sendToGoogleScript(data) {
    console.log('📤 Sending contact data to Google Apps Script:', data);
    
    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
        mode: 'cors'
      });

      console.log('📥 Google Apps Script response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Google Apps Script response data:', result);
      return result;
      
    } catch (error) {
      console.error('📤 Google Apps Script request failed:', error);
      throw error;
    }
  }

  setFormState(form, state) {
    const container = form.parentNode;
    const loading = form.querySelector('.contact-loading');
    const success = container.querySelector('.contact-success');
    const error = container.querySelector('.contact-error');
    
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
        // All hidden (normal state)
        break;
    }
  }

  showRateLimitMessage(form, remainingTime) {
    const existingMsg = form.parentNode.querySelector('.rate-limit-message');
    if (existingMsg) existingMsg.remove();

    const message = document.createElement('div');
    message.className = 'rate-limit-message p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 text-yellow-800';
    message.innerHTML = `
      <div class="flex items-start">
        <svg class="h-5 w-5 text-yellow-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-medium">Please wait before submitting again</h4>
          <p class="text-sm mt-1">To prevent spam, please wait ${remainingTime} seconds before submitting another message.</p>
        </div>
      </div>
    `;
    
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
      message.remove();
    }, remainingTime * 1000);
  }

  trackSubmission(status, error = null) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_submission', {
        event_category: 'contact',
        event_label: status,
        value: status === 'success' ? 1 : 0
      });
    }
    
    console.log(`📊 Contact submission ${status}`, error ? { error } : {});
  }
}

// Initialize contact form handler
window.ContactFormHandler = ContactFormHandler;

// Auto-initialize if DOM is ready or when it becomes ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webgloContactHandler = new ContactFormHandler();
  });
} else {
  window.webgloContactHandler = new ContactFormHandler();
}
