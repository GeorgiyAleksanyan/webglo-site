// Tooltip Utility for Legal Claims and Guarantees
class TooltipSystem {
  constructor() {
    this.tooltips = {
      '48hour-guarantee': 'Delivery within 48 hours of order confirmation and receipt of all materials, or full refund applies. Development begins within 4 hours of order.',
      'money-back': 'Full refund available if delivery deadline is missed or within 4-hour cancellation window. See our refunds policy for complete terms.',
      'delivery-guarantee': 'Professional landing page delivered within 48 hours or your money back. Timeline starts after order confirmation.',
      'quality-guarantee': 'All work meets professional standards with one free revision included. Additional revisions available for $97 each.',
      'satisfaction-guarantee': 'We work with you through our revision process to ensure project satisfaction. Refunds available under specific conditions.',
      'no-monthly-fees': 'One-time payment of $297 with no recurring charges. Hosting and maintenance are separate services if requested.'
    };
  }

  // Create tooltip HTML structure
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

  // Initialize tooltips on page load
  init() {
    // Add tooltip CSS if not already included
    if (!document.querySelector('link[href*="tooltip.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/tooltip.css';
      document.head.appendChild(link);
    }

    // Add click handlers for mobile
    document.addEventListener('click', (e) => {
      if (e.target.matches('.tooltip-trigger')) {
        e.preventDefault();
        this.handleMobileTooltip(e.target);
      }
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tooltip-container')) {
        this.closeAllMobileTooltips();
      }
    });
  }

  // Handle mobile tooltip display
  handleMobileTooltip(trigger) {
    if (window.innerWidth <= 768) {
      const tooltip = trigger.nextElementSibling;
      const isVisible = tooltip.style.opacity === '1';
      
      // Close all other tooltips
      this.closeAllMobileTooltips();
      
      // Toggle current tooltip
      if (!isVisible) {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        trigger.setAttribute('aria-expanded', 'true');
      }
    }
  }

  // Close all mobile tooltips
  closeAllMobileTooltips() {
    const tooltips = document.querySelectorAll('.tooltip-content');
    tooltips.forEach(tooltip => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      const trigger = tooltip.previousElementSibling;
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Helper method to wrap existing text with tooltips
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
