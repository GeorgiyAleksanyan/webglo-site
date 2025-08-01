/**
 * WebGlo Emergency Form Handler
 * Last resort fallback for when main form handlers fail
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
    console.log('🚨 Emergency handler processing form submission');
    
    try {
      this.showLoadingState(form);
      
      const formData = new FormData(form);
      const formType = form.getAttribute('data-webglo-form') || 'contact';
      
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
        'https://script.google.com/macros/s/AKfycbxhn5f4EiT-c1FS80ssDg8sj5eyARC3J_RYxMpel4iCScDjxDpc4dJjGGehbd9jVZ1pHQ/exec',
        'https://script.google.com/macros/s/AKfycbxhn5f4EiT-c1FS80ssDg8sj5eyARC3J_RYxMpel4iCScDjxDpc4dJjGGehbd9jVZ1pHQ/exec?callback=handleResponse'
      ];
      
      let success = false;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🚨 Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              console.log('🚨 Emergency submission successful!');
              this.showSuccessState(form, formType);
              form.reset();
              success = true;
              break;
            }
          }
        } catch (error) {
          console.log(`🚨 Endpoint failed: ${error.message}`);
          lastError = error;
        }
      }
      
      if (!success) {
        console.error('🚨 All emergency endpoints failed');
        this.showErrorState(form);
        
        // Send backup notification
        this.sendBackupNotification(data);
      }
      
    } catch (error) {
      console.error('🚨 Emergency handler error:', error);
      this.showErrorState(form);
    }
  }
  
  showLoadingState(form) {
    this.removeMessages(form);
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'emergency-loading p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4';
    loadingDiv.innerHTML = `
      <div class="flex items-center text-blue-800">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <p class="text-sm font-medium">Emergency processing...</p>
      </div>
    `;
    
    form.parentNode.insertBefore(loadingDiv, form);
  }
  
  showSuccessState(form, formType) {
    this.removeMessages(form);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'emergency-success p-4 bg-green-50 border border-green-200 rounded-lg mb-4';
    
    const message = formType === 'newsletter' 
      ? 'Successfully subscribed to newsletter!' 
      : 'Message sent successfully!';
    
    successDiv.innerHTML = `
      <div class="flex items-center text-green-800">
        <svg class="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm font-medium">${message}</p>
      </div>
    `;
    
    form.parentNode.insertBefore(successDiv, form);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 8000);
  }
  
  showErrorState(form) {
    this.removeMessages(form);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'emergency-error p-4 bg-red-50 border border-red-200 rounded-lg mb-4';
    errorDiv.innerHTML = `
      <div class="flex items-center text-red-800">
        <svg class="h-4 w-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="text-sm font-medium">Emergency processing failed</p>
          <p class="text-xs text-red-600 mt-1">Please email info@webglo.org directly</p>
        </div>
      </div>
    `;
    
    form.parentNode.insertBefore(errorDiv, form);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 10000);
  }
  
  removeMessages(form) {
    const messages = form.parentNode.querySelectorAll('.emergency-loading, .emergency-success, .emergency-error');
    messages.forEach(msg => msg.remove());
  }
  
  sendBackupNotification(data) {
    console.log('🚨 Sending backup notification...');
    console.log('Data to be sent manually:', data);
    
    // Create a backup email link
    const subject = `Emergency Form Submission - ${data.formType}`;
    const body = `
Emergency form submission data:

Type: ${data.formType}
Time: ${data.timestamp}
Source: ${data.source}

Data:
${JSON.stringify(data.data, null, 2)}

User Agent: ${data.userAgent}
    `;
    
    const mailtoLink = `mailto:info@webglo.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Try to open email client
    try {
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.log('Could not open email client automatically');
    }
  }
}

// Initialize emergency handler
console.log('🚨 Loading emergency form handler...');
window.emergencyFormHandler = new EmergencyFormHandler();
