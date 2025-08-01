// WebGlo Main JavaScript - Page-specific functionality and enhancements
class WebGloMain {
  constructor() {
    this.init();
  }

  init() {
    this.initScrollReveal();
    this.initSmoothScrolling();
    this.initFormHandling();
    this.initPageSpecificFeatures();
  }

  // Scroll reveal animations
  initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    // Add animation classes via CSS
    if (!document.querySelector('#scroll-animations')) {
      const style = document.createElement('style');
      style.id = 'scroll-animations';
      style.textContent = `
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Smooth scrolling for anchor links
  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed nav
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Handle form submissions
  initFormHandling() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmission(form);
      });
    });
  }

  handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      // Reset button
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      
      // Show success message
      this.showNotification('Thank you! Your message has been sent. We\'ll get back to you soon.', 'success');
      
      // Reset form
      form.reset();
      
      // In production, replace this with actual form submission logic
      console.log('Form submitted:', data);
    }, 2000);
  }

  // Show notification messages
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    notification.classList.add(bgColor, 'text-white');
    
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-1">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  // Page-specific features
  initPageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
      case 'index.html':
      case '':
        this.initHomePage();
        break;
      case 'services.html':
        this.initServicesPage();
        break;
      case 'contact.html':
        this.initContactPage();
        break;
    }
  }

  initHomePage() {
    console.log('Homepage initialized');
  }

  initServicesPage() {
    console.log('Services page initialized');
  }

  initContactPage() {
    this.initFormValidation();
  }

  initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  validateField(field) {
    const isValid = field.checkValidity();
    const parent = field.parentElement;
    
    // Remove existing error message
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    if (!isValid) {
      field.classList.add('border-red-500');
      const errorMsg = document.createElement('p');
      errorMsg.className = 'error-message text-red-500 text-sm mt-1';
      errorMsg.textContent = field.validationMessage;
      parent.appendChild(errorMsg);
    } else {
      field.classList.remove('border-red-500');
      field.classList.add('border-green-500');
    }
  }
}

// Mobile nav toggle (backward compatibility)
function toggleNav() {
  const nav = document.getElementById('mobile-menu');
  nav.classList.toggle('hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebGloMain();
});
