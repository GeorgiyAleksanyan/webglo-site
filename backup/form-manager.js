/**
 * WebGlo Form Manager
 * Automatically loads the appropriate form handlers based on forms present on the page
 */

class FormManager {
  constructor() {
    this.handlers = [];
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.loadAppropriateHandlers();
      });
    } else {
      this.loadAppropriateHandlers();
    }
  }

  loadAppropriateHandlers() {
    const contactForms = document.querySelectorAll('form[data-webglo-form="contact"]');
    const newsletterForms = document.querySelectorAll('form[data-webglo-form="newsletter"]');
    
    console.log(`📋 Form Manager: Found ${contactForms.length} contact forms and ${newsletterForms.length} newsletter forms`);
    
    // Load contact form handler if contact forms exist
    if (contactForms.length > 0) {
      this.loadContactHandler();
    }
    
    // Load newsletter handler if newsletter forms exist
    if (newsletterForms.length > 0) {
      this.loadNewsletterHandler();
    }
    
    // Fallback: if no specific forms found, check for generic forms
    if (contactForms.length === 0 && newsletterForms.length === 0) {
      const genericForms = document.querySelectorAll('form[data-webglo-form]');
      if (genericForms.length > 0) {
        console.log('⚠️ Found generic WebGlo forms, loading both handlers');
        this.loadContactHandler();
        this.loadNewsletterHandler();
      }
    }
  }

  loadContactHandler() {
    if (typeof ContactFormHandler !== 'undefined') {
      console.log('📞 Initializing Contact Form Handler');
      this.handlers.push(new ContactFormHandler());
    } else {
      console.error('❌ ContactFormHandler not found. Make sure contact-form-handler.js is loaded.');
    }
  }

  loadNewsletterHandler() {
    if (typeof NewsletterHandler !== 'undefined') {
      console.log('📧 Initializing Newsletter Handler');
      this.handlers.push(new NewsletterHandler());
    } else {
      console.error('❌ NewsletterHandler not found. Make sure newsletter-handler.js is loaded.');
    }
  }

  // Method to manually trigger handler reinitialization (useful for dynamic content)
  reinitialize() {
    console.log('🔄 Reinitializing form handlers...');
    this.handlers = [];
    this.loadAppropriateHandlers();
  }

  // Method to get status of all handlers
  getStatus() {
    return {
      handlersLoaded: this.handlers.length,
      contactForms: document.querySelectorAll('form[data-webglo-form="contact"]').length,
      newsletterForms: document.querySelectorAll('form[data-webglo-form="newsletter"]').length,
      totalForms: document.querySelectorAll('form[data-webglo-form]').length
    };
  }
}

// Global form manager instance
window.WebGloFormManager = FormManager;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webgloFormManager = new FormManager();
  });
} else {
  window.webgloFormManager = new FormManager();
}
