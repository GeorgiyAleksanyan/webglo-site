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
      return 'https://script.google.com/macros/s/AKfycbxhn5f4EiT-c1FS80ssDg8sj5eyARC3J_RYxMpel4iCScDjxDpc4dJjGGehbd9jVZ1pHQ/exec';
    } else {
      // Development URL
      return 'https://script.google.com/macros/s/AKfycbxhn5f4EiT-c1FS80ssDg8sj5eyARC3J_RYxMpel4iCScDjxDpc4dJjGGehbd9jVZ1pHQ/exec';
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
    loadingOverlay.className = 'newsletter-loading hidden absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10';
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
          <p class="font-medium text-sm">Success! Welcome to WebGlo Insights! 🎉</p>
          <p class="text-xs text-green-700 mt-1">Check your email for a welcome message with exclusive resources.</p>
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
          <p class="font-medium text-sm">Subscription failed</p>
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
    const email = formData.get('email');
    
    console.log('📧 Newsletter subscription started for:', email);
    
    // Basic email validation
    if (!email || !email.trim()) {
      console.error('❌ Email is required for newsletter subscription');
      this.setFormState(form, 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format for newsletter');
      this.setFormState(form, 'error');
      return;
    }
    
    // Check rate limiting
    if (!this.checkRateLimit()) {
      console.warn('⚠️ Newsletter subscription rate limit exceeded');
      this.showRateLimitMessage(form);
      return;
    }
    
    // Check for duplicate subscriptions
    if (this.getStoredEmails().includes(email.toLowerCase())) {
      console.log('📧 Email already subscribed:', email);
      // Show success anyway for privacy (don't reveal existing subscriptions)
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Honeypot spam check
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn('🍯 Newsletter honeypot triggered - likely spam');
      // Fail silently for spam
      this.setFormState(form, 'success');
      form.reset();
      return;
    }
    
    // Show loading state
    this.setFormState(form, 'loading');
    console.log('📤 Sending newsletter subscription to Google Apps Script...');
    
    try {
      // Prepare data for Google Apps Script
      const data = {
        formType: 'newsletter',
        timestamp: new Date().toISOString(),
        data: { email: email.trim() },
        source: window.location.href,
        userAgent: navigator.userAgent
      };

      console.log('📧 Newsletter data prepared for submission:', data);

      // Send to Google Apps Script
      const response = await this.sendToGoogleScript(data);
      
      console.log('📬 Newsletter response received:', response);
      
      if (response.success) {
        console.log('✅ Newsletter subscription successful!');
        this.setFormState(form, 'success');
        form.reset();
        
        // Store email locally to prevent duplicate submissions
        this.storeEmail(email.toLowerCase());
        
        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          this.setFormState(form, 'normal');
        }, 8000);
        
        // Track successful subscription
        this.trackSubscription('success');
      } else {
        throw new Error(response.error || 'Subscription failed');
      }
      
    } catch (error) {
      console.error('❌ Newsletter subscription error:', error);
      this.setFormState(form, 'error');
      
      // Auto-hide error message after 6 seconds
      setTimeout(() => {
        this.setFormState(form, 'normal');
      }, 6000);
      
      // Track failed subscription
      this.trackSubscription('error', error.message);
    }
  }

  async sendToGoogleScript(data) {
    const response = await fetch(this.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }
    
    return response.json();
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
      // 1 minute rate limit for newsletter
      if (timeDiff < 60000) { 
        return false;
      }
    }
    localStorage.setItem('webglo_newsletter_submission', now.toString());
    return true;
  }

  showRateLimitMessage(form) {
    const container = form.parentNode;
    let rateLimitMessage = container.querySelector('.newsletter-rate-limit');
    
    if (!rateLimitMessage) {
      rateLimitMessage = document.createElement('div');
      rateLimitMessage.className = 'newsletter-rate-limit p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-4';
      container.insertBefore(rateLimitMessage, form);
    }
    
    rateLimitMessage.innerHTML = `
      <div class="flex items-center text-yellow-800">
        <svg class="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm">Please wait a moment before subscribing again.</p>
      </div>
    `;
    
    rateLimitMessage.classList.remove('hidden');
    
    // Auto-hide rate limit message after 3 seconds
    setTimeout(() => {
      rateLimitMessage?.classList.add('hidden');
    }, 3000);
  }

  getStoredEmails() {
    try {
      const stored = localStorage.getItem('webglo_newsletter_emails');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  storeEmail(email) {
    try {
      const emails = this.getStoredEmails();
      if (!emails.includes(email)) {
        emails.push(email);
        // Keep only last 100 emails to prevent localStorage bloat
        if (emails.length > 100) {
          emails.splice(0, emails.length - 100);
        }
        localStorage.setItem('webglo_newsletter_emails', JSON.stringify(emails));
      }
    } catch (error) {
      console.warn('Could not store email locally:', error);
    }
  }

  trackSubscription(status, error = null) {
    // Track newsletter subscriptions for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_subscription', {
        status: status,
        error: error
      });
    }
    
    // Log to console for debugging
    console.log(`Newsletter subscription: ${status}`, error || '');
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
