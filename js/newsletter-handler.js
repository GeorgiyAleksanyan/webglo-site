/**
 * WebGlo Newsletter Handler
 * Dedicated handler for newsletter subscriptions
 * Simplified validation and focused functionality
 */

class NewsletterHandler {
  constructor() {
    this.scriptUrl = this.getScriptUrl();
    this.forms = new Map();
    this.init();
  }

  getScriptUrl() {
    // For now, use the same Google Apps Script but we'll modify it to handle different sheets
    // Later we can create a separate script if needed
    const isProduction = window.location.hostname === 'webglo.org' || window.location.hostname === 'www.webglo.org';
    
    if (isProduction) {
      // Production URL - Same as contact form for now
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
    const forms = document.querySelectorAll('form[data-webglo-form="newsletter"]');
    console.log(`📧 Initializing ${forms.length} newsletter form(s)`);
    forms.forEach(form => this.setupForm(form));
  }

  setupForm(form) {
    const formId = 'newsletter';
    this.forms.set(formId, form);
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.addFormStates(form);
  }

  addFormStates(form) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'newsletter-loading hidden absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-xl z-10';
    loadingOverlay.innerHTML = `
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
        <p class="text-gray-600 text-sm font-medium">Subscribing...</p>
      </div>
    `;
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'newsletter-success hidden p-4 bg-green-50 border border-green-200 rounded-xl mb-4';
    successMessage.innerHTML = `
      <div class="flex items-center text-green-800">
        <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-medium">Welcome to WebGlo Insights! 🎉</h4>
          <p class="text-sm text-green-700 mt-1">Check your email for a welcome message with exclusive resources.</p>
        </div>
      </div>
    `;

    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'newsletter-error hidden p-4 bg-red-50 border border-red-200 rounded-xl mb-4';
    errorMessage.innerHTML = `
      <div class="flex items-center text-red-800">
        <svg class="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-medium">Subscription failed</h4>
          <p class="text-sm text-red-700 mt-1">Please try again or email us at info@webglo.org</p>
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

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    console.log('📧 Newsletter subscription started');
    console.log('Form data:', Object.fromEntries(formData.entries()));
    
    // Simple validation for newsletter (only email required)
    const email = formData.get('email');
    if (!email || !email.trim()) {
      console.error('❌ Email is required');
      this.setFormState(form, 'error');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      this.setFormState(form, 'error');
      return;
    }
    
    // Check for existing subscription (simple client-side check)
    const existingEmails = this.getStoredEmails();
    if (existingEmails.includes(email.toLowerCase())) {
      console.log('📧 Email already subscribed');
      // Show success anyway for privacy reasons
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Honeypot spam check
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn('🍯 Honeypot triggered - likely spam');
      // Silently fail but appear successful
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Rate limiting (simpler for newsletter)
    if (!this.checkRateLimit()) {
      console.warn('⚠️ Rate limit exceeded for newsletter');
      this.showRateLimitMessage(form);
      return;
    }
    
    // Show loading state
    this.setFormState(form, 'loading');
    
    try {
      // Prepare data specifically for newsletter
      const data = {
        formType: 'newsletter',
        timestamp: new Date().toISOString(),
        data: {
          email: email.trim().toLowerCase()
        },
        source: window.location.href,
        userAgent: navigator.userAgent
      };

      console.log('📋 Newsletter data prepared:', data);

      // Send to Google Apps Script
      const response = await this.sendToGoogleScript(data);
      
      console.log('📬 Newsletter response:', response);
      
      if (response.success) {
        console.log('✅ Newsletter subscription successful!');
        this.setFormState(form, 'success');
        form.reset();
        
        // Store email locally to prevent duplicate submissions
        this.storeEmail(email.toLowerCase());
        
        // Auto-hide success message after 15 seconds
        setTimeout(() => {
          this.setFormState(form, 'normal');
        }, 15000);
        
        // Track successful subscription
        this.trackSubscription('success');
      } else {
        throw new Error(response.error || 'Subscription failed');
      }
      
    } catch (error) {
      console.error('❌ Newsletter subscription error:', error);
      this.setFormState(form, 'error');
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => {
        this.setFormState(form, 'normal');
      }, 10000);
      
      // Track failed subscription
      this.trackSubscription('error', error.message);
    }
  }

  async sendToGoogleScript(data) {
    console.log('📧 Sending newsletter data to Google Apps Script:', data);
    
    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
        mode: 'cors'
      });

      console.log('📥 Newsletter response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Newsletter response data:', result);
      return result;
      
    } catch (error) {
      console.error('📧 Newsletter request failed:', error);
      throw error;
    }
  }

  setFormState(form, state) {
    const container = form.parentNode;
    const loading = form.querySelector('.newsletter-loading');
    const success = container.querySelector('.newsletter-success');
    const error = container.querySelector('.newsletter-error');
    
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

  checkRateLimit() {
    const now = Date.now();
    const lastSubmission = localStorage.getItem('webglo_newsletter_submission');
    if (lastSubmission) {
      const timeDiff = now - parseInt(lastSubmission);
      // Reduced rate limit to 20 seconds for newsletter
      if (timeDiff < 20000) { 
        return false;
      }
    }
    localStorage.setItem('webglo_newsletter_submission', now.toString());
    return true;
  }

  showRateLimitMessage(form) {
    const existingMsg = form.parentNode.querySelector('.rate-limit-message');
    if (existingMsg) existingMsg.remove();

    const message = document.createElement('div');
    message.className = 'rate-limit-message p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-4 text-yellow-800';
    message.innerHTML = `
      <div class="flex items-center text-sm">
        <svg class="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Please wait a moment before subscribing again.
      </div>
    `;
    
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  getStoredEmails() {
    const stored = localStorage.getItem('webglo_newsletter_emails');
    return stored ? JSON.parse(stored) : [];
  }

  storeEmail(email) {
    const emails = this.getStoredEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      // Keep only last 50 emails to prevent localStorage bloat
      if (emails.length > 50) {
        emails.splice(0, emails.length - 50);
      }
      localStorage.setItem('webglo_newsletter_emails', JSON.stringify(emails));
    }
  }

  trackSubscription(status, error = null) {
    // Simple analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_subscription', {
        event_category: 'newsletter',
        event_label: status,
        value: status === 'success' ? 1 : 0
      });
    }
    
    console.log(`📊 Newsletter subscription ${status}`, error ? { error } : {});
  }
}

// Initialize newsletter handler when script loads
window.NewsletterHandler = NewsletterHandler;

// Auto-initialize if DOM is ready or when it becomes ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webgloNewsletterHandler = new NewsletterHandler();
  });
} else {
  window.webgloNewsletterHandler = new NewsletterHandler();
}
