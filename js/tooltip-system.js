// === Webglo Refactored TooltipSystem.js ===

class TooltipSystem {
  constructor() {
    // This part of your structure is great. We'll keep it as is.
    this.tooltips = {
      '48hour-guarantee': 'Delivery within 48 hours of order confirmation and receipt of all materials, or full refund applies. Development begins within 4 hours of order.',
      'money-back': 'Full refund available if delivery deadline is missed or within 4-hour cancellation window. See our refunds policy for complete terms.',
      'delivery-guarantee': 'Professional landing page delivered within 48 hours or your money back. Timeline starts after order confirmation.',
      'quality-guarantee': 'All work meets professional standards with one free revision included. Additional revisions available for $97 each.',
      'satisfaction-guarantee': 'We work with you through our revision process to ensure project satisfaction. Refunds available under specific conditions.',
      'no-monthly-fees': 'One-time payment of $297 with no recurring charges. Hosting and maintenance are separate services if requested.'
    };
  }

  // Your createTooltip method is perfect and does not need to change.
  createTooltip(text, tooltipKey, variant = 'default') {
    const content = this.tooltips[tooltipKey] || 'See our terms and conditions for full details.';
    const variantClass = variant !== 'default' ? `tooltip-${variant}` : '';
    
    return `
      <span class="tooltip-container">
        ${text}
        <button class="tooltip-trigger ${variantClass}" 
                type="button" 
                aria-label="More information"
                data-tooltip="${tooltipKey}">
          ?
        </button>
        <div class="tooltip-content" role="tooltip">
          ${content}
          <br><br>
          <a href="refunds-policy.html" class="text-blue-300 hover:text-blue-200 text-xs underline">View Refunds Policy</a>
        </div>
      </span>
    `;
  }

  // REFACTORED: Simplified and universal event handling.
  init() {
    document.body.addEventListener('click', (e) => {
      const trigger = e.target.closest('.tooltip-trigger');

      // Case 1: A tooltip trigger was clicked
      if (trigger) {
        const container = trigger.closest('.tooltip-container');
        if (!container) return;

        const isActive = container.classList.contains('is-active');

        // First, close all other active tooltips
        document.querySelectorAll('.tooltip-container.is-active').forEach(openContainer => {
          if (openContainer !== container) {
            openContainer.classList.remove('is-active');
            openContainer.querySelector('.tooltip-content').style = ''; // Reset styles
          }
        });

        // Then, toggle the state of the clicked tooltip's container
        container.classList.toggle('is-active');

        // Handle mobile-specific positioning
        const tooltipContent = container.querySelector('.tooltip-content');
        if (window.innerWidth <= 768) {
          if (container.classList.contains('is-active')) {
            tooltipContent.style.position = 'fixed';
            tooltipContent.style.top = '50%';
            tooltipContent.style.left = '50%';
            tooltipContent.style.transform = 'translate(-50%, -50%)';
            tooltipContent.style.zIndex = '9999';
          } else {
            tooltipContent.style = ''; // Reset styles
          }
        }

        return; // Stop further processing
      }

      // Case 2: A click happened anywhere else on the page
      // If the click was not inside an active tooltip, close all of them.
      const overlay = e.target.closest('.tooltip-container.is-active::before');
      if (!e.target.closest('.tooltip-container.is-active') && !overlay) {
        document.querySelectorAll('.tooltip-container.is-active').forEach(container => {
          container.classList.remove('is-active');
          container.querySelector('.tooltip-content').style = ''; // Reset styles
        });
      }
    });
  }

  // Your static helper method is great and does not need to change.
  static wrapText(selector, tooltipKey, variant = 'default') {
    const elements = document.querySelectorAll(selector);
    const tooltipSystem = new TooltipSystem();
    
    elements.forEach(element => {
      const originalText = element.innerHTML;
      element.innerHTML = tooltipSystem.createTooltip(originalText, tooltipKey, variant);
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const tooltipSystem = new TooltipSystem();
  tooltipSystem.init();
});

// Export for use in other scripts
window.TooltipSystem = TooltipSystem;