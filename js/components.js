// WebGloComponents - unified nav + footer + mobile behavior
class WebGloComponents {
  constructor() {
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 5;

    // initialize immediately and keep listeners to re-render if SPA nav removes elements
    this.init();
    this.setupNavigationListeners();
  }

  init() {
    try {
      if (this.initialized) return;

      this.renderNavigation();
      this.renderFooter();
      this.attachBehaviors(); // all event listeners and behaviors
      this.initialized = true;
      console.log('WebGloComponents initialized');
    } catch (err) {
      console.error('Error initializing WebGloComponents:', err);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.init(), 800);
      }
    }
  }

  setupNavigationListeners() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.ensureComponentsExist();
    });
    window.addEventListener('focus', () => this.ensureComponentsExist());
    // periodic check (for SPA or DOM replacements)
    this._checkInterval = setInterval(() => this.ensureComponentsExist(), 2500);
    // also listen for popstate (back/forward)
    window.addEventListener('popstate', () => this.ensureComponentsExist());
  }

  ensureComponentsExist() {
    const navExists = !!document.querySelector('#webglo-navigation nav');
    const footerExists = !!document.querySelector('#webglo-footer footer');
    if (!navExists || !footerExists) {
      console.log('WebGloComponents missing — re-rendering');
      this.initialized = false;
      this.init();
    }
  }

  renderNavigation() {
    // If page supplies its own header (#main-header or nav.nav-container), skip rendering
    if (document.getElementById('main-header') || document.querySelector('nav.nav-container')) {
      console.log('Static navigation exists — skipping dynamic render');
      return;
    }

    const navHTML = `
      <nav id="main-navigation" class="bg-white shadow-lg border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
        <div class="w-full px-3 lg:px-6">
          <div class="flex items-center justify-between h-16">
            <!-- Left side: Logo + Desktop menu items -->
            <div class="flex items-center space-x-8">
              <!-- Logo (keeps Home behavior) -->
              <a id="webglo-logo" href="index.html" class="flex items-center space-x-2">
                <img src="assets/logo.png" alt="WebGlo logo" class="h-8 w-8 lg:h-10 lg:w-10">
                <span class="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#0cead9] to-[#df00ff] bg-clip-text text-transparent">WebGlo</span>
              </a>

              <!-- Desktop nav items -->
              <div class="hidden lg:flex items-center space-x-8">
                <!-- Services dropdown -->
                <div class="relative group">
                  <button class="desktop-dropdown-toggle nav-link flex items-center space-x-2 text-gray-700 hover:text-[#df00ff] font-medium">
                    <span>Services</span>
                    <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div class="desktop-dropdown absolute top-full left-0 transform w-[600px] max-w-[95vw] bg-white shadow-2xl border border-gray-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible hover:opacity-100 hover:visible translate-y-2 group-hover:translate-y-0 hover:translate-y-0 z-50">
                    <div class="p-6">
                      <div class="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg mb-6 border border-red-200">
                        <a href="landing-page-express.html" class="block group">
                          <div class="flex items-center justify-between">
                            <div>
                              <h4 class="font-bold text-red-600 group-hover:text-red-700">⚡ Landing Page Express</h4>
                              <p class="text-sm text-red-500">48-hour delivery • Only $297</p>
                            </div>
                            <div class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">HOT</div>
                          </div>
                        </a>
                      </div>

                      <div class="grid grid-cols-3 gap-6">
                        <div>
                          <h3 class="text-lg font-bold text-gray-900 mb-4">Website Solutions</h3>
                          <ul class="space-y-2">
                            <li><a href="services.html#design" class="block text-gray-600 hover:text-[#df00ff]">Custom Design</a></li>
                            <li><a href="services.html#development" class="block text-gray-600 hover:text-[#df00ff]">Development</a></li>
                            <li><a href="services.html#ecommerce" class="block text-gray-600 hover:text-[#df00ff]">E-commerce</a></li>
                            <li><a href="services.html#domain-hosting" class="block text-gray-600 hover:text-[#df00ff]">Domain & Hosting</a></li>
                            <li><a href="services.html#maintenance" class="block text-gray-600 hover:text-[#df00ff]">Maintenance</a></li>
                          </ul>
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-gray-900 mb-4">IT Solutions</h3>
                          <ul class="space-y-2">
                            <li><a href="services.html#it-solutions" class="block text-gray-600 hover:text-[#0cead9]">Custom Software</a></li>
                            <li><a href="services.html#it-solutions" class="block text-gray-600 hover:text-[#0cead9]">IT Infrastructure</a></li>
                            <li><a href="services.html#it-solutions" class="block text-gray-600 hover:text-[#0cead9]">Digital Transformation</a></li>
                            <li><a href="services.html#automation" class="block text-gray-600 hover:text-[#0cead9]">AI & Automation</a></li>
                          </ul>
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-gray-900 mb-4">Marketing & Branding</h3>
                          <ul class="space-y-2">
                            <li><a href="services.html#seo" class="block text-gray-600 hover:text-[#df00ff]">SEO Optimization</a></li>
                            <li><a href="services.html#content" class="block text-gray-600 hover:text-[#df00ff]">Content Strategy</a></li>
                            <li><a href="services.html#branding" class="block text-gray-600 hover:text-[#df00ff]">Branding</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Regular Pricing link -->
                <a href="pricing.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium">Pricing</a>

                <!-- Free Consultation link -->
                <a href="consulting.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium">Free Consultation</a>
                
                <a href="about.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium">About</a>
                <a href="case-studies.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium">Case Studies</a>
                <a href="blog.html" class="nav-link text-gray-700 hover:text-[#df00ff] font-medium">Blog</a>
              </div>
            </div>

            <!-- Right side: Desktop CTA + Mobile controls -->
            <div class="flex items-center">
              <!-- Desktop CTA -->
              <a href="contact.html" class="hidden lg:inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-xl font-semibold shadow-xl no-hover-color">Get Started</a>

            <!-- Mobile controls (small screens) -->
            <div class="flex lg:hidden items-center gap-1">
              <!-- small immediate CTA (kept visible before opening menu) -->
              <a id="mobile-cta-top" href="contact.html" class="inline-flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-lg font-medium text-sm no-hover-color">Get Started</a>

              <button id="mobile-menu-toggle" aria-expanded="false" aria-controls="mobile-menu" class="text-gray-700 hover:text-[#df00ff] focus:outline-none p-1">
                <svg id="hamburger-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                <svg id="close-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Mobile menu overlay (position will be set to sit below nav) -->
      <div id="mobile-menu" class="lg:hidden hidden fixed left-0 right-0 bottom-0 bg-white z-[9999] overflow-auto">
        <div class="mobile-menu-inner flex flex-col min-h-full" style="min-height: calc(100vh - 4rem);">
          <div class="px-6 py-6 space-y-3">
            <!-- Collapsible Services -->
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer py-3 text-lg font-medium">
                <span>Services</span>
                <span class="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <ul class="pl-4 pb-2 space-y-2">
                <li><a href="services.html#design" class="block text-gray-700 hover:text-[#df00ff]">Custom Design</a></li>
                <li><a href="services.html#development" class="block text-gray-700 hover:text-[#df00ff]">Development</a></li>
                <li><a href="services.html#ecommerce" class="block text-gray-700 hover:text-[#df00ff]">E-commerce</a></li>
                <li><a href="services.html#domain-hosting" class="block text-gray-700 hover:text-[#df00ff]">Domain & Hosting</a></li>
                <li><a href="services.html#it-solutions" class="block text-gray-700 hover:text-[#df00ff]">IT Solutions</a></li>
                <li><a href="services.html#maintenance" class="block text-gray-700 hover:text-[#df00ff]">Maintenance</a></li>
                <li class="mt-2">
                  <div class="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                    <a href="landing-page-express.html" class="block">
                      <div class="text-red-600 font-bold">⚡ Landing Page Express</div>
                      <div class="text-red-500 text-xs">48-hour delivery • $297</div>
                    </a>
                  </div>
                </li>
              </ul>
            </details>

            <!-- Regular Pricing link -->
            <a href="pricing.html" class="block py-3 text-lg text-gray-700 hover:text-[#df00ff]">Pricing</a>
            
            <!-- Free Consultation link -->
            <a href="consulting.html" class="block py-3 text-lg text-gray-700 hover:text-[#df00ff]">Free Consultation</a>

            <a href="about.html" class="block py-3 text-lg text-gray-700 hover:text-[#df00ff]">About</a>
            <a href="case-studies.html" class="block py-3 text-lg text-gray-700 hover:text-[#df00ff]">Case Studies</a>
            <a href="blog.html" class="block py-3 text-lg text-gray-700 hover:text-[#df00ff]">Blog</a>
            <!-- Contact tab removed; Get Started button leads to contact page -->
          </div>

          <!-- Bottom action bar inside mobile menu -->
          <div class="mt-auto border-t p-4 bg-white">
            <div class="flex gap-3 justify-between">
              <a href="consulting.html" id="mobile-book-btn" class="inline-flex items-center justify-center px-3 py-2 border border-gray-800 rounded-lg font-medium text-sm">Book free call</a>
              <a href="contact.html" id="mobile-getstarted-btn" class="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-lg font-medium text-sm no-hover-color">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const navContainer = document.getElementById('webglo-navigation');
    if (!navContainer) {
      console.error('webglo-navigation container not found; please add <div id="webglo-navigation"></div>');
      return;
    }
    navContainer.innerHTML = navHTML;

    // after DOM inserted, adjust mobile menu top to match nav height (so it expands below nav)
    this._updateMobileMenuTop();
    window.addEventListener('resize', () => this._updateMobileMenuTop());
  }

  _updateMobileMenuTop() {
    const nav = document.getElementById('main-navigation');
    const mobileMenu = document.getElementById('mobile-menu');
    if (nav && mobileMenu) {
      const navHeight = nav.offsetHeight || 64;
      // set top so mobile menu sits below the fixed nav
      mobileMenu.style.top = navHeight + 'px';
      // adjust min-height of inner so bottom bar sits at screen bottom
      const inner = mobileMenu.querySelector('.mobile-menu-inner');
      if (inner) inner.style.minHeight = `calc(100vh - ${navHeight}px)`;
    }
  }

  renderFooter() {
    // if a footer already exists on the page, don't overwrite it
    if (document.querySelector('#webglo-footer footer') || document.querySelector('footer.footer-static')) {
      console.log('Static footer exists; skipping dynamic footer render');
      return;
    }

    const footerHTML = `
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
                <li><a href="case-studies.html" class="text-gray-300 hover:text-[#df00ff] transition-colors">Case Studies</a></li>
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
                <a href="refunds-policy.html" class="text-gray-400 hover:text-white text-sm">Refunds Policy</a>
                <a href="return-policy.html" class="text-gray-400 hover:text-white text-sm">Return Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <!-- Updated: ${new Date().toISOString()} -->
    `;

    const footerContainer = document.getElementById('webglo-footer');
    if (!footerContainer) {
      console.error('webglo-footer container not found; please add <div id="webglo-footer"></div>');
      return;
    }
    footerContainer.innerHTML = footerHTML;
  }

  attachBehaviors() {
    // mobile menu toggle + outside click + aria updates + body overflow
    this.initMobileBehaviors();

    // make desktop dropdowns clickable (toggle on click for accessibility)
    this.initDesktopDropdownClick();

    // collapsible details: ensure summary toggle icons update (handled by native <details>)
    this.initCollapsibleBehavior();

    // active link highlighting (desktop + mobile)
    this.highlightActiveLinks();

    // Add CSS to prevent hover/active color change for Get Started buttons
    this._injectNoHoverColorCSS();

    // close mobile menu on navigation (when user clicks a link inside)
    this._autoCloseOnNavClick();
  }

  initMobileBehaviors() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    const mobileTopCTA = document.getElementById('mobile-cta-top');

    if (!toggle || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      if (hamburger) hamburger.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      // hide top small CTA (we want bottom actions visible inside menu)
      if (mobileTopCTA) mobileTopCTA.classList.add('hidden');
      this._updateMobileMenuTop();
    };

    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      if (hamburger) hamburger.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      if (mobileTopCTA) mobileTopCTA.classList.remove('hidden');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !mobileMenu.classList.contains('hidden');
      if (isOpen) closeMenu(); else openMenu();
    });

    // close when clicking outside the menu (but ignore clicks inside menu)
    document.addEventListener('click', (e) => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      if (!isOpen) return;
      const clickInside = e.target.closest && (e.target.closest('#mobile-menu') || e.target.closest('#mobile-menu-toggle'));
      if (!clickInside) closeMenu();
    });

    // close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        if (hamburger) hamburger.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
        if (mobileTopCTA) mobileTopCTA.classList.remove('hidden');
      }
    });

    // ensure mobile menu top offset is correct on open
    window.addEventListener('resize', () => this._updateMobileMenuTop());
  }

  initDesktopDropdownClick() {
    // allow clicking desktop dropdown toggle to toggle visibility (accessibility)
    const toggles = document.querySelectorAll('.desktop-dropdown-toggle');
    toggles.forEach(btn => {
      const parent = btn.closest('.relative');
      if (!parent) return;
      const dropdown = parent.querySelector('.desktop-dropdown');
      if (!dropdown) return;

      let openedByClick = false;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // toggle classes to show/hide (mirror :hover behavior)
        const isVisible = dropdown.classList.contains('!visible') || dropdown.style.opacity === '1';
        if (isVisible) {
          dropdown.style.opacity = '';
          dropdown.style.visibility = '';
          dropdown.classList.remove('open-by-click');
          openedByClick = false;
        } else {
          dropdown.style.opacity = '1';
          dropdown.style.visibility = 'visible';
          dropdown.classList.add('open-by-click');
          openedByClick = true;
        }
      });

      // close when clicking outside
      document.addEventListener('click', (ev) => {
        const inside = ev.target.closest && ev.target.closest('.relative') === parent;
        if (!inside && openedByClick) {
          dropdown.style.opacity = '';
          dropdown.style.visibility = '';
          dropdown.classList.remove('open-by-click');
          openedByClick = false;
        }
      });
    });
  }

  initCollapsibleBehavior() {
    // No heavy JS needed — <details> works on mobile. But ensure only UI icon flips when open.
    // We also close other <details> if you want only-one-open behavior (optional).
    const details = document.querySelectorAll('#mobile-menu details');
    details.forEach(d => {
      // optional: when one opens, close siblings
      d.addEventListener('toggle', () => {
        if (d.open) {
          details.forEach(sib => {
            if (sib !== d) sib.open = false;
          });
        }
      });
    });
  }

  highlightActiveLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const mark = (anchor) => {
      try {
        const href = anchor.getAttribute('href');
        if (!href) return false;
        // normalize relative hrefs
        const url = new URL(href, window.location.origin);
        const hrefPage = url.pathname.split('/').pop() || 'index.html';
        // Don't highlight Get Started button
        if ((anchor.id === 'mobile-getstarted-btn' || anchor.classList.contains('no-hover-color'))) {
          return false;
        }
        if (hrefPage === currentPath || (currentPath === '' && hrefPage === 'index.html')) {
          anchor.classList.add('text-[#df00ff]', 'font-semibold');
          return true;
        }
      } catch (e) {
        // ignore malformed hrefs
      }
      return false;
    };

    const navRoot = document.getElementById('webglo-navigation');
    if (!navRoot) return;

    const links = navRoot.querySelectorAll('a[href]');
    links.forEach(a => {
      // clear previous highlights
      a.classList.remove('text-[#df00ff]', 'font-semibold');
    });
    links.forEach(a => mark(a));
  }

  _injectNoHoverColorCSS() {
    if (document.getElementById('no-hover-color-style')) return;
    const style = document.createElement('style');
    style.id = 'no-hover-color-style';
    style.textContent = `
      .no-hover-color:hover,
      .no-hover-color:focus,
      .no-hover-color:active {
        color: white !important;
        background: linear-gradient(to right, #df00ff, #0cead9) !important;
        box-shadow: 0 4px 24px 0 rgba(223,0,255,0.12), 0 1.5px 6px 0 rgba(12,234,217,0.08);
      }
    `;
    document.head.appendChild(style);
  }

  _autoCloseOnNavClick() {
    // close mobile menu when clicking any link inside it
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    mobileMenu.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (a) {
        // small delay to allow navigation to start
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
          const hamburger = document.getElementById('hamburger-icon');
          const closeIcon = document.getElementById('close-icon');
          if (hamburger) hamburger.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
          const mobileTopCTA = document.getElementById('mobile-cta-top');
          if (mobileTopCTA) mobileTopCTA.classList.remove('hidden');
        }, 120);
      }
    });
  }
}

// single initialization guard
if (typeof window.webGloComponentsInitialized === 'undefined') {
  window.webGloComponentsInitialized = true;

  function initComponentsSafe() {
    console.log('Initializing WebGloComponents (safe)');
    new WebGloComponents();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initComponentsSafe();
  } else {
    document.addEventListener('DOMContentLoaded', initComponentsSafe);
    // fallback in case DOMContentLoaded doesn't fire fast
    setTimeout(() => {
      if (!document.querySelector('#webglo-navigation nav')) initComponentsSafe();
    }, 1000);
  }

  window.addEventListener('load', () => {
    if (!document.querySelector('#webglo-navigation nav')) initComponentsSafe();
  });
}
