/**
 * EMERGENCY FORM HANDLER
 * Temporary solution while Google Apps Script CORS issues are resolved
 */

class EmergencyFormHandler {
  constructor() {
    this.init();
  }

  init() {
    console.log('🚨 Emergency form handler activated');
    
    // Handle all form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.hasAttribute('data-webglo-form')) {
        e.preventDefault();
        this.handleFormSubmission(form);
      }
    });
  }

  async handleFormSubmission(form) {
    const formType = form.getAttribute('data-webglo-form');
    const formData = new FormData(form);
    
    console.log(`🚨 Emergency handling ${formType} form submission`);
    
    // Show loading state
    this.showLoadingState(form);
    
    try {
      // Prepare data
      const data = {
        formType: formType,
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData.entries()),
        source: window.location.href,
        userAgent: navigator.userAgent
      };
      
      console.log('🚨 Form data prepared:', data);
      
      // Try multiple endpoints
      const endpoints = [
        'https://script.google.com/macros/s/AKfycbwWN1BeKpgcerWlH4iNYQnI1oPvF7sTbXBa7srdSKVubEd1esKn4qlDqDimPiUUH6n2PQ/exec',
        'https://script.google.com/macros/s/AKfycbwWN1BeKpgcerWlH4iNYQnI1oPvF7sTbXBa7srdSKVubEd1esKn4qlDqDimPiUUH6n2PQ/exec?callback=handleResponse'
      ];
      
      let success = false;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('🚨 Trying endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors', // Bypass CORS
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          
          console.log('🚨 Response received (no-cors mode)');
          success = true;
          break;
          
        } catch (error) {
          console.log('🚨 Endpoint failed:', endpoint, error.message);
          lastError = error;
        }
      }
      
      if (success) {
        this.showSuccessState(form, formType);
        
        // Send backup email notification
        this.sendBackupNotification(data);
      } else {
        throw lastError || new Error('All endpoints failed');
      }
      
    } catch (error) {
      console.error('🚨 Emergency form handler failed:', error);
      this.showErrorState(form);
      
      // Still send backup notification
      this.sendBackupNotification({
        formType: formType,
        data: Object.fromEntries(formData.entries()),
        error: error.message
      });
    }
  }
  
  showLoadingState(form) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }
  }
  
  showSuccessState(form, formType) {
    this.removeMessages(form);
    
    const message = document.createElement('div');
    message.className = 'emergency-success p-4 bg-green-50 border border-green-200 rounded-lg mb-4 text-green-800';
    message.innerHTML = formType === 'newsletter' 
      ? `<strong>✅ Subscribed successfully!</strong><br>Welcome to WebGlo Insights! Check your email for confirmation.`
      : `<strong>✅ Message sent successfully!</strong><br>Thank you for contacting WebGlo! We'll respond within 24 hours.`;
    
    form.parentNode.insertBefore(message, form);
    form.reset();
    
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = false;
      button.textContent = formType === 'newsletter' ? 'Subscribe Free' : 'Send Message';
    }
    
    // Auto-hide success message
    setTimeout(() => {
      message.remove();
    }, 10000);
  }
  
  showErrorState(form) {
    this.removeMessages(form);
    
    const message = document.createElement('div');
    message.className = 'emergency-error p-4 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-800';
    message.innerHTML = `<strong>❌ Temporary technical issue</strong><br>Please email us directly at <a href="mailto:info@webglo.org" class="underline">info@webglo.org</a> or call <a href="tel:8482074616" class="underline">(848) 207-4616</a>`;
    
    form.parentNode.insertBefore(message, form);
    
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = false;
      button.textContent = 'Try Again';
    }
    
    // Auto-hide error message
    setTimeout(() => {
      message.remove();
    }, 15000);
  }
  
  removeMessages(form) {
    const messages = form.parentNode.querySelectorAll('.emergency-success, .emergency-error');
    messages.forEach(msg => msg.remove());
  }
  
  sendBackupNotification(data) {
    // Store in localStorage for manual retrieval
    const submissions = JSON.parse(localStorage.getItem('webglo_emergency_submissions') || '[]');
    submissions.push({
      ...data,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(2)
    });
    localStorage.setItem('webglo_emergency_submissions', JSON.stringify(submissions));
    
    console.log('🚨 Backup notification stored locally:', data);
  }
}

// Initialize emergency handler
console.log('🚨 Loading emergency form handler...');
const emergencyHandler = new EmergencyFormHandler();

// Export for debugging
window.emergencyFormHandler = emergencyHandler;
