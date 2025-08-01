/**
 * WebGlo Form Handler - Production Version
 * Updated to use JSONP and enhanced email templates
 */

class SimpleFormHandler {
    constructor(scriptUrl) {
        this.scriptUrl = scriptUrl;
        this.setupForms();
        console.log('✅ Simple form handler initialized');
    }

    setupForms() {
        // Handle newsletter forms
        const newsletterForms = document.querySelectorAll('form[data-webglo-form="newsletter"]');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, 'newsletter'));
        });

        // Handle contact forms
        const contactForms = document.querySelectorAll('form[data-webglo-form="contact"]');
        contactForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, 'contact'));
        });

        console.log(`📧 Found ${newsletterForms.length + contactForms.length} form(s) to handle`);
    }

    async handleSubmit(event, formType) {
        event.preventDefault();
        const form = event.target;
        
        console.log(`📧 Submitting ${formType} form`);
        
        try {
            // Disable form during submission
            this.setFormState(form, 'submitting');
            
            // Collect form data
            const formData = this.collectFormData(form);
            
            // Validate data
            if (!this.validateForm(formData, formType)) {
                throw new Error('Please fill in all required fields');
            }
            
            // Submit via JSONP
            const result = await this.submitViaJsonp({
                type: formType,
                data: formData,
                timestamp: new Date().toISOString(),
                source: window.location.href,
                userAgent: navigator.userAgent
            });
            
            if (result.success) {
                this.setFormState(form, 'success');
                console.log('✅ Form submitted successfully');
            } else {
                throw new Error(result.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            this.setFormState(form, 'error', error.message);
        }
    }

    submitViaJsonp(data) {
        return new Promise((resolve, reject) => {
            // Create unique callback name
            const callbackName = 'webglo_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Create callback function
            window[callbackName] = (response) => {
                // Cleanup
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                delete window[callbackName];
                
                resolve(response);
            };
            
            // Create script element
            const script = document.createElement('script');
            
            // Build URL with data as query parameters
            const params = new URLSearchParams({
                callback: callbackName,
                data: JSON.stringify(data)
            });
            
            script.src = `${this.scriptUrl}?${params.toString()}`;
            script.onerror = () => {
                // Cleanup on error
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                delete window[callbackName];
                reject(new Error('Network error'));
            };
            
            // Add to page to trigger request
            document.head.appendChild(script);
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    if (script.parentNode) {
                        document.head.removeChild(script);
                    }
                    delete window[callbackName];
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    validateForm(data, formType) {
        // Email validation
        if (!data.email || !this.isValidEmail(data.email)) {
            return false;
        }
        
        // Type-specific validation
        if (formType === 'contact') {
            return data.firstName && data.lastName && data.message;
        }
        
        return true; // Newsletter only needs email
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setFormState(form, state, message = '') {
        // Remove existing state classes
        form.classList.remove('form-submitting', 'form-success', 'form-error');
        
        // Clear existing messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Get submit button
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        switch (state) {
            case 'submitting':
                form.classList.add('form-submitting');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                }
                break;
                
            case 'success':
                form.classList.add('form-success');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
                }
                this.showMessage(form, 'Thanks! Your message has been sent successfully.', 'success');
                form.reset();
                break;
                
            case 'error':
                form.classList.add('form-error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
                }
                this.showMessage(form, message || 'Failed to send. Please try again.', 'error');
                break;
                
            default:
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (!submitBtn.dataset.originalText) {
                        submitBtn.dataset.originalText = submitBtn.textContent;
                    }
                }
        }
    }

    showMessage(form, message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message-${type}`;
        messageElement.textContent = message;
        
        // Insert after form or at the beginning
        const target = form.querySelector('.form-messages') || form;
        if (target === form) {
            target.insertBefore(messageElement, target.firstChild);
        } else {
            target.appendChild(messageElement);
        }
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Use your deployed Google Apps Script URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtonT0H__IZAsENyE97Wb1IOu1Gfq-XI899L5Gecg3zk-JczZmjQOOrEwcIiX2YH0/exec';
    
    new SimpleFormHandler(SCRIPT_URL);
});
