/**
 * WebGlo Cookie Consent Manager
 * GDPR & CCPA compliant cookie consent with Google Analytics integration
 */

class CookieConsent {
  constructor() {
    this.cookieName = 'webglo_cookie_consent';
    this.cookieExpiry = 365; // days
    this.analyticsId = 'G-BFDSVY8Y4N';
    
    this.init();
  }

  init() {
    // Check if consent already given
    const consent = this.getConsent();
    
    if (consent === null) {
      // No consent yet - show banner
      this.showBanner();
    } else {
      // Consent given - apply preferences
      this.applyConsent(consent);
    }
  }

  showBanner() {
    // Check if banner already exists
    if (document.getElementById('cookie-consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <h3 class="cookie-consent-title">🍪 We Value Your Privacy</h3>
          <p class="cookie-consent-description">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
            By clicking "Accept All", you consent to our use of cookies. 
            <a href="/privacy-policy.html" class="cookie-link">Learn more</a>
          </p>
        </div>
        <div class="cookie-consent-actions">
          <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">
            Accept All
          </button>
          <button id="cookie-accept-necessary" class="cookie-btn cookie-btn-secondary">
            Necessary Only
          </button>
          <button id="cookie-customize" class="cookie-btn cookie-btn-text">
            Customize
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add styles
    this.injectStyles();

    // Add event listeners
    this.attachEventListeners(banner);

    // Animate in
    setTimeout(() => banner.classList.add('show'), 100);
  }

  attachEventListeners(banner) {
    const acceptAll = banner.querySelector('#cookie-accept-all');
    const acceptNecessary = banner.querySelector('#cookie-accept-necessary');
    const customize = banner.querySelector('#cookie-customize');

    acceptAll?.addEventListener('click', () => {
      this.setConsent({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true
      });
      this.hideBanner();
    });

    acceptNecessary?.addEventListener('click', () => {
      this.setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false
      });
      this.hideBanner();
    });

    customize?.addEventListener('click', () => {
      this.showCustomizeModal();
    });
  }

  showCustomizeModal() {
    const modal = document.createElement('div');
    modal.id = 'cookie-customize-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
      <div class="cookie-modal-overlay"></div>
      <div class="cookie-modal-content">
        <div class="cookie-modal-header">
          <h2 class="cookie-modal-title">Cookie Preferences</h2>
          <button class="cookie-modal-close" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="cookie-modal-body">
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3 class="cookie-category-title">Strictly Necessary</h3>
                <p class="cookie-category-desc">Essential for the website to function properly. Cannot be disabled.</p>
              </div>
              <div class="cookie-toggle-wrapper">
                <input type="checkbox" id="cookie-necessary" checked disabled class="cookie-toggle">
                <label for="cookie-necessary" class="cookie-toggle-label disabled">Always Active</label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3 class="cookie-category-title">Analytics & Performance</h3>
                <p class="cookie-category-desc">Help us understand how visitors interact with our website (Google Analytics).</p>
              </div>
              <div class="cookie-toggle-wrapper">
                <input type="checkbox" id="cookie-analytics" class="cookie-toggle" checked>
                <label for="cookie-analytics" class="cookie-toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3 class="cookie-category-title">Marketing & Advertising</h3>
                <p class="cookie-category-desc">Used to deliver personalized ads and track campaign performance.</p>
              </div>
              <div class="cookie-toggle-wrapper">
                <input type="checkbox" id="cookie-marketing" class="cookie-toggle">
                <label for="cookie-marketing" class="cookie-toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3 class="cookie-category-title">Preferences</h3>
                <p class="cookie-category-desc">Remember your settings and preferences for a better experience.</p>
              </div>
              <div class="cookie-toggle-wrapper">
                <input type="checkbox" id="cookie-preferences" class="cookie-toggle" checked>
                <label for="cookie-preferences" class="cookie-toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="cookie-modal-footer">
          <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">
            Save Preferences
          </button>
          <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">
            Reject All
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.cookie-modal-close');
    const saveBtn = modal.querySelector('#cookie-save-preferences');
    const rejectBtn = modal.querySelector('#cookie-reject-all');
    const overlay = modal.querySelector('.cookie-modal-overlay');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    saveBtn?.addEventListener('click', () => {
      const analytics = modal.querySelector('#cookie-analytics').checked;
      const marketing = modal.querySelector('#cookie-marketing').checked;
      const preferences = modal.querySelector('#cookie-preferences').checked;

      this.setConsent({
        necessary: true,
        analytics,
        marketing,
        preferences
      });
      
      closeModal();
      this.hideBanner();
    });

    rejectBtn?.addEventListener('click', () => {
      this.setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false
      });
      closeModal();
      this.hideBanner();
    });

    // Animate in
    setTimeout(() => modal.classList.add('show'), 100);
  }

  setConsent(preferences) {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences: preferences
    };

    // Save to cookie
    this.setCookie(this.cookieName, JSON.stringify(consentData), this.cookieExpiry);

    // Apply consent
    this.applyConsent(preferences);

    console.log('✓ Cookie consent saved:', preferences);
  }

  getConsent() {
    const cookie = this.getCookie(this.cookieName);
    if (!cookie) return null;

    try {
      const data = JSON.parse(cookie);
      return data.preferences;
    } catch (e) {
      return null;
    }
  }

  applyConsent(preferences) {
    // Google Analytics
    if (preferences.analytics) {
      this.enableGoogleAnalytics();
    } else {
      this.disableGoogleAnalytics();
    }

    // Future: Add other tracking scripts based on preferences
    if (preferences.marketing) {
      // Enable marketing pixels
    }

    if (preferences.preferences) {
      // Enable preference cookies
    }
  }

  enableGoogleAnalytics() {
    // Check if gtag is already loaded
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      console.log('✓ Google Analytics enabled');
    }
  }

  disableGoogleAnalytics() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      console.log('✗ Google Analytics disabled');
    }

    // Disable GA cookies
    window['ga-disable-' + this.analyticsId] = true;
  }

  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }
  }

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  injectStyles() {
    if (document.getElementById('cookie-consent-styles')) return;

    const style = document.createElement('style');
    style.id = 'cookie-consent-styles';
    style.textContent = `
      .cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        transform: translateY(100%);
        transition: transform 0.3s ease-out;
        border-top: 3px solid #df00ff;
      }

      .cookie-consent-banner.show {
        transform: translateY(0);
      }

      .cookie-consent-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .cookie-consent-text {
        flex: 1;
        min-width: 300px;
      }

      .cookie-consent-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #111;
        margin-bottom: 0.5rem;
      }

      .cookie-consent-description {
        color: #666;
        font-size: 0.9375rem;
        line-height: 1.6;
        margin: 0;
      }

      .cookie-link {
        color: #df00ff;
        text-decoration: underline;
        font-weight: 600;
      }

      .cookie-link:hover {
        color: #0cead9;
      }

      .cookie-consent-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .cookie-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        white-space: nowrap;
      }

      .cookie-btn-primary {
        background: linear-gradient(135deg, #df00ff 0%, #0cead9 100%);
        color: white;
      }

      .cookie-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(223, 0, 255, 0.4);
      }

      .cookie-btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 2px solid #e5e7eb;
      }

      .cookie-btn-secondary:hover {
        background: #e5e7eb;
      }

      .cookie-btn-text {
        background: transparent;
        color: #6b7280;
        padding: 0.75rem 1rem;
      }

      .cookie-btn-text:hover {
        color: #df00ff;
        text-decoration: underline;
      }

      /* Modal Styles */
      .cookie-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .cookie-modal.show {
        opacity: 1;
        visibility: visible;
      }

      .cookie-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }

      .cookie-modal-content {
        position: relative;
        background: white;
        border-radius: 1rem;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .cookie-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .cookie-modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111;
        margin: 0;
      }

      .cookie-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 0.2s;
      }

      .cookie-modal-close:hover {
        background: #f3f4f6;
        color: #111;
      }

      .cookie-modal-body {
        padding: 2rem;
        overflow-y: auto;
        flex: 1;
      }

      .cookie-category {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .cookie-category:last-child {
        border-bottom: none;
      }

      .cookie-category-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .cookie-category-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111;
        margin-bottom: 0.5rem;
      }

      .cookie-category-desc {
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0;
      }

      .cookie-toggle-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .cookie-toggle {
        opacity: 0;
        position: absolute;
      }

      .cookie-toggle-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }

      .cookie-toggle-label.disabled {
        cursor: not-allowed;
        opacity: 0.5;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .toggle-slider {
        width: 48px;
        height: 24px;
        background: #d1d5db;
        border-radius: 24px;
        position: relative;
        transition: background 0.3s;
      }

      .toggle-slider::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        top: 2px;
        left: 2px;
        transition: transform 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .cookie-toggle:checked + .cookie-toggle-label .toggle-slider {
        background: linear-gradient(135deg, #df00ff 0%, #0cead9 100%);
      }

      .cookie-toggle:checked + .cookie-toggle-label .toggle-slider::before {
        transform: translateX(24px);
      }

      .cookie-modal-footer {
        padding: 1.5rem 2rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .cookie-consent-content {
          flex-direction: column;
          align-items: stretch;
          padding: 1rem;
        }

        .cookie-consent-actions {
          flex-direction: column;
        }

        .cookie-btn {
          width: 100%;
          text-align: center;
        }

        .cookie-modal-content {
          width: 95%;
        }

        .cookie-modal-header,
        .cookie-modal-body,
        .cookie-modal-footer {
          padding: 1rem;
        }

        .cookie-modal-footer {
          flex-direction: column;
        }

        .cookie-category-header {
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Public API for programmatic control
  static resetConsent() {
    document.cookie = 'webglo_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    location.reload();
  }

  static openPreferences() {
    const manager = window.cookieConsentManager;
    if (manager) {
      manager.showCustomizeModal();
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsentManager = new CookieConsent();
});

// Make available globally
window.CookieConsent = CookieConsent;
