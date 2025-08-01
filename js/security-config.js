/**
 * Security Configuration for WebGlo Website
 * This file contains security settings and utilities to protect against exploitation
 */

class SecurityConfig {
  constructor() {
    this.isProduction = this.detectEnvironment();
    this.config = this.getConfig();
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    return hostname === 'webglo.org' || hostname === 'www.webglo.org';
  }

  getConfig() {
    return {
      // Rate limiting
      rateLimit: {
        windowMs: 30000, // 30 seconds
        maxRequests: 1,
        storageKey: 'webglo_form_submission'
      },
      
      // Domain validation
      allowedDomains: [
        'webglo.org',
        'www.webglo.org',
        'georgiyaleksanyan.github.io', // GitHub Pages fallback
        'localhost',
        '127.0.0.1'
      ],
      
      // Honeypot field names (randomized)
      honeypotFields: [
        'website',
        'url',
        'homepage',
        'company_website'
      ],
      
      // Form validation rules
      validation: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        name: /^[a-zA-Z\s\-\.\']{2,50}$/,
        message: {
          minLength: 10,
          maxLength: 2000
        }
      },
      
      // Security headers
      headers: {
        'Content-Security-Policy': "default-src 'self'",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    };
  }

  // Email obfuscation utility
  obfuscateEmail(email) {
    return email
      .replace('@', '&#64;')
      .replace(/\./g, '&#46;')
      .split('')
      .map(char => Math.random() > 0.5 ? char : `&#${char.charCodeAt(0)};`)
      .join('');
  }

  // Generate CSRF-like token
  generateSecurityToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const source = window.location.hostname;
    
    return btoa(`${timestamp}:${random}:${source}`).substring(0, 32);
  }

  // Validate form data before submission
  validateFormData(formData) {
    const errors = [];

    // Check required fields
    if (!formData.get('name') || !formData.get('name').trim()) {
      errors.push('Name is required');
    } else if (!this.config.validation.name.test(formData.get('name'))) {
      errors.push('Invalid name format');
    }

    if (!formData.get('email') || !formData.get('email').trim()) {
      errors.push('Email is required');
    } else if (!this.config.validation.email.test(formData.get('email'))) {
      errors.push('Invalid email format');
    }

    if (!formData.get('message') || !formData.get('message').trim()) {
      errors.push('Message is required');
    } else {
      const message = formData.get('message').trim();
      if (message.length < this.config.validation.message.minLength) {
        errors.push(`Message must be at least ${this.config.validation.message.minLength} characters`);
      }
      if (message.length > this.config.validation.message.maxLength) {
        errors.push(`Message must be less than ${this.config.validation.message.maxLength} characters`);
      }
    }

    // Check honeypot
    const honeypotField = formData.get('website');
    if (honeypotField && honeypotField.trim() !== '') {
      errors.push('Spam detected');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Check if domain is allowed
  isDomainAllowed(url) {
    try {
      const domain = new URL(url).hostname;
      return this.config.allowedDomains.includes(domain);
    } catch {
      return false;
    }
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now();
    const lastSubmissionKey = this.config.rateLimit.storageKey;
    const lastSubmission = localStorage.getItem(lastSubmissionKey);

    if (lastSubmission) {
      const timeDiff = now - parseInt(lastSubmission);
      if (timeDiff < this.config.rateLimit.windowMs) {
        const remainingTime = Math.ceil((this.config.rateLimit.windowMs - timeDiff) / 1000);
        return {
          allowed: false,
          remainingTime: remainingTime
        };
      }
    }

    localStorage.setItem(lastSubmissionKey, now.toString());
    return { allowed: true };
  }

  // Log security events (in production, this could send to analytics)
  logSecurityEvent(event, details = {}) {
    if (this.isProduction) {
      console.warn(`Security Event: ${event}`, details);
      // In production, you might want to send this to an analytics service
    } else {
      console.log(`Security Event: ${event}`, details);
    }
  }
}

// Export for use in other files
window.SecurityConfig = SecurityConfig;
