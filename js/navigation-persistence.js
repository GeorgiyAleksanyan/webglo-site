// Navigation Persistence - Ensures components stay loaded across page navigation
class NavigationPersistence {
  constructor() {
    this.observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    };
    
    this.init();
  }

  init() {
    // Set up mutation observer to watch for component removal
    this.setupMutationObserver();
    
    // Set up page visibility and focus handlers
    this.setupVisibilityHandlers();
    
    // Set up periodic health checks
    this.setupHealthChecks();
    
    // Handle browser back/forward navigation
    this.setupPopstateHandler();
    
    console.log('Navigation Persistence initialized');
  }

  setupMutationObserver() {
    // Create observer to watch for DOM changes that might remove our components
    this.observer = new MutationObserver((mutations) => {
      let componentsRemoved = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if navigation or footer was removed
              if (node.id === 'webglo-navigation' || 
                  node.id === 'webglo-footer' ||
                  node.querySelector('#webglo-navigation') ||
                  node.querySelector('#webglo-footer')) {
                componentsRemoved = true;
              }
            }
          });
        }
      });
      
      if (componentsRemoved) {
        console.log('Components removed detected, restoring...');
        this.restoreComponents();
      }
    });

    // Start observing
    this.observer.observe(document.body, this.observerConfig);
  }

  setupVisibilityHandlers() {
    // Handle page visibility changes (tab switching, minimizing)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => this.checkComponentHealth(), 100);
      }
    });

    // Handle window focus (returning to browser)
    window.addEventListener('focus', () => {
      setTimeout(() => this.checkComponentHealth(), 100);
    });

    // Handle page show (back/forward navigation)
    window.addEventListener('pageshow', (event) => {
      // If page is loaded from cache (back/forward)
      if (event.persisted) {
        console.log('Page restored from cache, checking components...');
        setTimeout(() => this.checkComponentHealth(), 100);
      }
    });
  }

  setupHealthChecks() {
    // Periodic health check every 3 seconds
    setInterval(() => {
      this.checkComponentHealth();
    }, 3000);
  }

  setupPopstateHandler() {
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      console.log('Popstate detected, ensuring components exist...');
      setTimeout(() => this.checkComponentHealth(), 500);
    });
  }

  checkComponentHealth() {
    const navContainer = document.getElementById('webglo-navigation');
    const footerContainer = document.getElementById('webglo-footer');
    
    const navContent = navContainer?.querySelector('nav');
    const footerContent = footerContainer?.querySelector('footer');
    
    if (!navContent || !footerContent) {
      console.log('Component health check failed, restoring components...');
      this.restoreComponents();
    }
  }

  restoreComponents() {
    // Check if WebGloComponents class is available
    if (typeof WebGloComponents !== 'undefined') {
      try {
        // Force re-initialization
        window.webGloComponentsInitialized = false;
        new WebGloComponents();
        console.log('Components restored successfully');
      } catch (error) {
        console.error('Failed to restore components:', error);
        
        // Fallback: reload the components script
        this.reloadComponentsScript();
      }
    } else {
      console.log('WebGloComponents not available, reloading script...');
      this.reloadComponentsScript();
    }
  }

  reloadComponentsScript() {
    // Remove existing script if present
    const existingScript = document.querySelector('script[src*="components.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = 'js/components.js?t=' + Date.now(); // Cache bust
    script.onload = () => {
      console.log('Components script reloaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to reload components script');
    };

    // Add to document
    document.head.appendChild(script);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize navigation persistence when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationPersistence();
  });
} else {
  new NavigationPersistence();
}
