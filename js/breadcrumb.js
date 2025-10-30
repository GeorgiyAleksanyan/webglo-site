/**
 * WebGlo Breadcrumb Navigation Component
 * SEO-optimized breadcrumb with Schema.org structured data
 */

class WebGloBreadcrumb {
  constructor(items = []) {
    this.items = items;
    this.baseUrl = 'https://webglo.org';
  }

  /**
   * Render breadcrumb navigation with Schema.org markup
   * @param {string} containerId - ID of container element
   */
  render(containerId = 'breadcrumb-navigation') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Breadcrumb container #${containerId} not found`);
      return;
    }

    // Generate HTML
    const breadcrumbHTML = this.generateHTML();
    container.innerHTML = breadcrumbHTML;

    // Add Schema.org structured data
    this.addStructuredData();
  }

  /**
   * Generate breadcrumb HTML
   */
  generateHTML() {
    if (!this.items || this.items.length === 0) return '';

    const breadcrumbItems = this.items.map((item, index) => {
      const isLast = index === this.items.length - 1;
      
      if (isLast) {
        // Last item (current page) - no link
        return `
          <li class="flex items-center">
            <svg class="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="text-gray-600 font-medium">${this.escapeHtml(item.label)}</span>
          </li>
        `;
      } else {
        // Clickable breadcrumb item
        return `
          <li class="flex items-center">
            ${index > 0 ? `
              <svg class="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            ` : ''}
            <a href="${item.url}" class="text-[#df00ff] hover:text-[#0cead9] transition-colors font-medium">
              ${this.escapeHtml(item.label)}
            </a>
          </li>
        `;
      }
    }).join('');

    return `
      <nav aria-label="Breadcrumb" class="breadcrumb-nav bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <ol class="flex items-center flex-wrap text-sm">
            ${breadcrumbItems}
          </ol>
        </div>
      </nav>
    `;
  }

  /**
   * Add Schema.org BreadcrumbList structured data
   */
  addStructuredData() {
    // Remove existing breadcrumb schema if present
    const existingScript = document.querySelector('script[data-breadcrumb-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    // Build schema.org BreadcrumbList
    const itemListElements = this.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${this.baseUrl}${item.url}`
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElements
    };

    // Add script tag to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb-schema', 'true');
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Auto-generate breadcrumbs from current URL path
   */
  static fromPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && s !== 'index.html');
    
    const items = [{
      label: 'Home',
      url: '/'
    }];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Clean up segment for display
      let label = segment
        .replace(/\.html$/, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Special cases
      if (segment === 'blog') {
        label = 'Blog';
      }

      items.push({
        label: label,
        url: currentPath
      });
    });

    return new WebGloBreadcrumb(items);
  }

  /**
   * Create breadcrumb for blog listing page
   */
  static forBlogListing() {
    return new WebGloBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/blog/' }
    ]);
  }

  /**
   * Create breadcrumb for blog post page
   */
  static forBlogPost(postTitle, postSlug, categoryName = null) {
    const items = [
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/blog/' }
    ];

    if (categoryName) {
      items.push({
        label: categoryName,
        url: `/blog/?category=${categoryName.toLowerCase().replace(/\s+/g, '-')}`
      });
    }

    items.push({
      label: postTitle,
      url: `/blog/${postSlug}/`
    });

    return new WebGloBreadcrumb(items);
  }

  /**
   * Create breadcrumb for service page
   */
  static forServicePage(serviceName) {
    return new WebGloBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services.html' },
      { label: serviceName, url: window.location.pathname }
    ]);
  }

  /**
   * Create breadcrumb for generic page
   */
  static forPage(pageTitle, parentPages = []) {
    const items = [{ label: 'Home', url: '/' }];
    
    parentPages.forEach(parent => {
      items.push(parent);
    });

    items.push({
      label: pageTitle,
      url: window.location.pathname
    });

    return new WebGloBreadcrumb(items);
  }
}

// Auto-initialize breadcrumb if container exists
document.addEventListener('DOMContentLoaded', () => {
  const breadcrumbContainer = document.getElementById('breadcrumb-navigation');
  if (breadcrumbContainer && !breadcrumbContainer.hasChildNodes()) {
    // Auto-generate from path if no manual initialization
    const breadcrumb = WebGloBreadcrumb.fromPath();
    breadcrumb.render();
  }
});

// Make available globally
window.WebGloBreadcrumb = WebGloBreadcrumb;
