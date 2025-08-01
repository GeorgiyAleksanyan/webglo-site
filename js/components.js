// WebGlo Components - Universal Navigation and Footer System
class WebGloComponents {
  constructor() {
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    
    // Initialize immediately since we're called at the right time
    this.init();
    
    // Set up page navigation listeners to maintain components
    this.setupNavigationListeners();
  }

  init() {
    try {
      // Check if already initialized to prevent duplicate rendering
      if (this.initialized) {
        console.log('WebGlo Components already initialized');
        return;
      }

      this.renderNavigation();
      this.renderFooter();
      this.initMobileMenu();
      this.initScrollEffects();
      this.initialized = true;
      console.log('WebGlo Components initialized successfully');
    } catch (error) {
      console.error('Error initializing WebGlo Components:', error);
      
      // Retry initialization if failed
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => this.init(), 1000);
      }
    }
  }

  setupNavigationListeners() {
    // Listen for page visibility changes (when user navigates back/forward)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.ensureComponentsExist();
      }
    });

    // Listen for focus events (when user returns to tab)
    window.addEventListener('focus', () => {
      this.ensureComponentsExist();
    });

    // Periodically check if components still exist
    setInterval(() => {
      this.ensureComponentsExist();
    }, 2000);
  }

  ensureComponentsExist() {
    const navExists = document.querySelector('#webglo-navigation nav');
    const footerExists = document.querySelector('#webglo-footer footer');
    
    if (!navExists || !footerExists) {
      console.log('Components missing, re-rendering...');
      this.initialized = false;
      this.init();
    }
  }

  renderNavigation() {
    const nav = `
      <nav class="relative bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a href="index.html" class="flex items-center space-x-3">
              <img src="assets/logo.png" alt="WebGlo logo" class="h-10 w-10">
              <span class="text-2xl font-bold bg-gradient-to-r from-[#0cead9] to-[#df00ff] bg-clip-text text-transparent">WebGlo</span>
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center space-x-8">
              <a href="index.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">Home</a>
              
              <!-- Services Dropdown -->
              <div class="relative group">
                <button class="nav-link flex items-center space-x-1 text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">
                  <span>Services</span>
                  <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-[600px] max-w-[95vw] bg-white shadow-2xl border border-gray-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 mt-2 z-50">
                  <div class="p-6">
                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Website Solutions</h3>
                        <ul class="space-y-3">
                          <li><a href="services.html#design" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Custom Design</a></li>
                          <li><a href="services.html#development" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Development</a></li>
                          <li><a href="services.html#ecommerce" class="text-gray-600 hover:text-[#df00ff] transition-colors block">E-commerce</a></li>
                          <li><a href="services.html#maintenance" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Maintenance</a></li>
                        </ul>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Digital Marketing</h3>
                        <ul class="space-y-3">
                          <li><a href="services.html#seo" class="text-gray-600 hover:text-[#0cead9] transition-colors block">SEO Optimization</a></li>
                          <li><a href="services.html#content" class="text-gray-600 hover:text-[#0cead9] transition-colors block">Content Strategy</a></li>
                          <li><a href="services.html#branding" class="text-gray-600 hover:text-[#0cead9] transition-colors block">Branding</a></li>
                          <li><a href="services.html#automation" class="text-gray-600 hover:text-[#0cead9] transition-colors block">AI & Automation</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pricing Dropdown -->
              <div class="relative group">
                <button class="nav-link flex items-center space-x-1 text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">
                  <span>Pricing</span>
                  <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-[400px] max-w-[95vw] bg-white shadow-2xl border border-gray-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 mt-2 z-50">
                  <div class="p-6">
                    <ul class="space-y-3">
                      <li><a href="pricing.html#packages" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Single-Purchase Packages</a></li>
                      <li><a href="pricing.html#subscriptions" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Monthly Plans</a></li>
                      <li><a href="pricing.html#itemized" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Itemized Services</a></li>
                      <li><a href="consulting.html" class="text-gray-600 hover:text-[#df00ff] transition-colors block">Free Consultation</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <a href="about.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">About</a>
              <a href="blog.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">Blog</a>
              <a href="contact.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium transition-colors duration-200">Contact</a>
              
              <a href="contact.html" class="bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                Free Consultation
              </a>
            </div>

            <!-- Mobile Menu Button -->
            <button id="mobile-menu-button" class="lg:hidden text-gray-700 hover:text-[#df00ff] focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile Menu -->
          <div id="mobile-menu" class="lg:hidden hidden bg-white border-t border-gray-100">
            <div class="px-2 pt-2 pb-3 space-y-1">
              <a href="index.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">Home</a>
              <a href="services.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">Services</a>
              <a href="pricing.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">Pricing</a>
              <a href="about.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">About</a>
              <a href="blog.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">Blog</a>
              <a href="contact.html" class="block px-3 py-2 text-gray-700 hover:text-[#df00ff] font-medium">Contact</a>
              <a href="contact.html" class="block mx-3 my-2 px-4 py-2 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-lg font-semibold text-center">Free Consultation</a>
            </div>
          </div>
        </div>
      </nav>
    `;

    const navContainer = document.getElementById('webglo-navigation');
    if (navContainer) {
      navContainer.innerHTML = nav;
      console.log('Navigation rendered successfully');
    } else {
      console.error('Navigation container not found - make sure element with id="webglo-navigation" exists');
    }
  }

  renderFooter() {
    const footer = `
      <footer class="bg-gray-900 text-white py-16">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <!-- Company Info -->
            <div>
              <div class="flex items-center space-x-3 mb-6">
                <img src="assets/logo.png" alt="WebGlo logo" class="h-10 w-10">
                <span class="text-2xl font-bold bg-gradient-to-r from-[#0cead9] to-[#df00ff] bg-clip-text text-transparent">WebGlo</span>
              </div>
              <p class="text-gray-300 mb-4">Professional web development and digital marketing services that drive growth and deliver results.</p>
              <div class="flex space-x-4">
                <!-- Facebook -->
                <a href="https://www.facebook.com/people/Webglo/61574697745988/" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-[#df00ff] transition-colors" title="Follow us on Facebook">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
                  </svg>
                </a>
                <!-- Twitter/X -->
                <a href="https://x.com/WebGlo_Media" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-[#0cead9] transition-colors" title="Follow us on X (Twitter)">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <!-- LinkedIn -->
                <a href="https://www.linkedin.com/company/webglo/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-[#df00ff] transition-colors" title="Connect with us on LinkedIn">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
                  </svg>
                </a>
                <!-- Instagram -->
                <a href="https://www.instagram.com/webglo.media/?hl=en" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-[#0cead9] transition-colors" title="Follow us on Instagram">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10 10-4.478 10-10S15.522 0 10 0zm4.95 7.05L9.95 12.05a.7.7 0 01-.99 0L4.05 7.95a.7.7 0 010-.99l4.9-4.9a.7.7 0 01.99 0l5 5a.7.7 0 010 .99z" clip-rule="evenodd"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-2.296 0-4.162 1.866-4.162 4.163 0 2.296 1.866 4.162 4.162 4.162 2.296 0 4.163-1.866 4.163-4.162 0-2.297-1.867-4.163-4.163-4.163zm0 6.862c-1.493 0-2.7-1.207-2.7-2.699 0-1.493 1.207-2.7 2.7-2.7 1.492 0 2.699 1.207 2.699 2.7 0 1.492-1.207 2.699-2.699 2.699zm4.29-8.829c-.536 0-.97.434-.97.97 0 .536.434.97.97.97.536 0 .97-.434.97-.97 0-.536-.434-.97-.97-.97z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Services -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Services</h3>
              <ul class="space-y-3">
                <li><a href="services.html#design" class="text-gray-300 hover:text-[#df00ff] transition-colors">Web Design</a></li>
                <li><a href="services.html#development" class="text-gray-300 hover:text-[#df00ff] transition-colors">Development</a></li>
                <li><a href="services.html#branding" class="text-gray-300 hover:text-[#df00ff] transition-colors">Branding</a></li>
                <li><a href="services.html#seo" class="text-gray-300 hover:text-[#df00ff] transition-colors">SEO</a></li>
                <li><a href="services.html#automation" class="text-gray-300 hover:text-[#df00ff] transition-colors">AI & Automation</a></li>
              </ul>
            </div>

            <!-- Company -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Company</h3>
              <ul class="space-y-3">
                <li><a href="about.html" class="text-gray-300 hover:text-[#df00ff] transition-colors">About Us</a></li>
                <li><a href="blog.html" class="text-gray-300 hover:text-[#df00ff] transition-colors">Blog</a></li>
                <li><a href="contact.html" class="text-gray-300 hover:text-[#df00ff] transition-colors">Contact</a></li>
                <li><a href="consulting.html" class="text-gray-300 hover:text-[#df00ff] transition-colors">Free Consultation</a></li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Contact</h3>
              <div class="space-y-3 text-gray-300">
                <p>General: <a href="mailto:info@webglo.org" class="hover:text-[#df00ff] transition-colors">info@webglo.org</a></p>
                <p>Sales: <a href="mailto:sales@webglo.org" class="hover:text-[#df00ff] transition-colors">sales@webglo.org</a></p>
                <p>Support: <a href="mailto:support@webglo.org" class="hover:text-[#df00ff] transition-colors">support@webglo.org</a></p>
                <p>Phone: <a href="tel:+18482074616" class="hover:text-[#df00ff] transition-colors">(848) 207-4616</a></p>
                <p>Business Hours:<br>Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <p class="text-gray-400 text-sm">© 2025 WebGlo. All rights reserved.</p>
              <div class="flex space-x-6 mt-4 md:mt-0">
                <a href="privacy-policy.html" class="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                <a href="terms-of-service.html" class="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    const footerContainer = document.getElementById('webglo-footer');
    if (footerContainer) {
      footerContainer.innerHTML = footer;
      console.log('Footer rendered successfully');
    } else {
      console.error('Footer container not found - make sure element with id="webglo-footer" exists');
    }
  }

  initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.add('hidden');
        }
      });
    }
  }

  initScrollEffects() {
    // Highlight active navigation link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('text-[#df00ff]', 'font-semibold');
      }
    });
  }
}

// Initialize components - ensure single initialization
if (typeof window.webGloComponentsInitialized === 'undefined') {
  window.webGloComponentsInitialized = true;
  
  // Multiple initialization strategies for better browser compatibility
  function initializeComponents() {
    console.log('Attempting to initialize WebGlo Components...');
    new WebGloComponents();
  }
  
  // Strategy 1: If DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already loaded, initializing immediately');
    initializeComponents();
  } 
  // Strategy 2: Wait for DOMContentLoaded
  else if (document.readyState === 'loading') {
    console.log('DOM loading, waiting for DOMContentLoaded event');
    document.addEventListener('DOMContentLoaded', initializeComponents);
    
    // Strategy 3: Fallback timer (in case DOMContentLoaded doesn't fire)
    setTimeout(() => {
      if (!document.querySelector('#webglo-navigation nav')) {
        console.log('Fallback initialization triggered');
        initializeComponents();
      }
    }, 1000);
  }
  
  // Strategy 4: Window load fallback
  window.addEventListener('load', () => {
    if (!document.querySelector('#webglo-navigation nav')) {
      console.log('Window load fallback triggered');
      initializeComponents();
    }
  });
}
