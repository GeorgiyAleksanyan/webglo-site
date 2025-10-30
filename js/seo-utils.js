/**
 * WebGlo SEO Utilities
 * Structured Data (JSON-LD) and SEO helpers
 */

class WebGloSEO {
  constructor() {
    this.baseUrl = 'https://webglo.org';
    this.organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WebGlo",
      "url": "https://webglo.org",
      "logo": "https://webglo.org/assets/logo.png",
      "description": "Expert web development, IT solutions, and digital marketing services",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": "https://webglo.org/contact.html"
      },
      "sameAs": [
        // Add social media profiles here
      ]
    };
  }

  /**
   * Add Organization schema to page
   */
  addOrganizationSchema() {
    this.addSchema(this.organizationData, 'organization-schema');
  }

  /**
   * Add Blog Post Article schema
   */
  addBlogPostSchema(post) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.image,
      "author": {
        "@type": "Person",
        "name": post.author || "WebGlo Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WebGlo",
        "logo": {
          "@type": "ImageObject",
          "url": `${this.baseUrl}/assets/logo.png`
        }
      },
      "datePublished": post.publishDate || post.date,
      "dateModified": post.modifiedDate || post.publishDate || post.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${this.baseUrl}/blog/${post.slug}/`
      },
      "articleSection": post.category,
      "keywords": post.tags ? post.tags.join(', ') : '',
      "wordCount": post.content ? post.content.split(/\s+/).length : undefined
    };

    this.addSchema(schema, 'article-schema');
  }

  /**
   * Add Website schema
   */
  addWebsiteSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "WebGlo",
      "url": this.baseUrl,
      "description": "Expert web development, IT solutions, and digital marketing services",
      "publisher": {
        "@type": "Organization",
        "name": "WebGlo"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.baseUrl}/blog/?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    this.addSchema(schema, 'website-schema');
  }

  /**
   * Add Service schema for service pages
   */
  addServiceSchema(service) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.description,
      "provider": {
        "@type": "Organization",
        "name": "WebGlo",
        "url": this.baseUrl
      },
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": service.name,
        "itemListElement": service.offerings ? service.offerings.map(offer => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": offer.name,
            "description": offer.description
          }
        })) : []
      }
    };

    this.addSchema(schema, 'service-schema');
  }

  /**
   * Add FAQ schema
   */
  addFAQSchema(faqs) {
    if (!faqs || faqs.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    this.addSchema(schema, 'faq-schema');
  }

  /**
   * Add Product/Offer schema
   */
  addProductSchema(product) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.image,
      "offers": {
        "@type": "Offer",
        "url": product.url || window.location.href,
        "priceCurrency": "USD",
        "price": product.price,
        "priceValidUntil": product.priceValidUntil,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "WebGlo"
        }
      }
    };

    if (product.aggregateRating) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.aggregateRating.value,
        "reviewCount": product.aggregateRating.count
      };
    }

    this.addSchema(schema, 'product-schema');
  }

  /**
   * Add generic schema to page
   */
  addSchema(schemaObject, id = null) {
    // Remove existing schema with same ID
    if (id) {
      const existing = document.querySelector(`script[data-schema-id="${id}"]`);
      if (existing) {
        existing.remove();
      }
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    if (id) {
      script.setAttribute('data-schema-id', id);
    }
    script.textContent = JSON.stringify(schemaObject, null, 2);
    document.head.appendChild(script);

    console.log(`✓ Added ${id || 'schema'} structured data`);
  }

  /**
   * Update canonical URL
   */
  updateCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    console.log(`✓ Canonical URL: ${canonical.href}`);
  }

  /**
   * Update Open Graph meta tags
   */
  updateOGTags(og) {
    const tags = {
      'og:title': og.title,
      'og:description': og.description,
      'og:image': og.image,
      'og:url': og.url || window.location.href,
      'og:type': og.type || 'website'
    };

    Object.entries(tags).forEach(([property, content]) => {
      if (!content) return;

      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    console.log('✓ Updated Open Graph tags');
  }

  /**
   * Update Twitter Card meta tags
   */
  updateTwitterCard(twitter) {
    const tags = {
      'twitter:card': twitter.card || 'summary_large_image',
      'twitter:title': twitter.title,
      'twitter:description': twitter.description,
      'twitter:image': twitter.image
    };

    Object.entries(tags).forEach(([name, content]) => {
      if (!content) return;

      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    console.log('✓ Updated Twitter Card tags');
  }

  /**
   * Update page title and description
   */
  updateMetaTags({ title, description, keywords }) {
    if (title) {
      document.title = title;
    }

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'keywords';
        document.head.appendChild(meta);
      }
      meta.content = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    }

    console.log('✓ Updated meta tags');
  }

  /**
   * Complete SEO setup for blog post
   */
  setupBlogPostSEO(post) {
    const postUrl = `/blog/${post.slug}/`;
    const fullUrl = `${this.baseUrl}${postUrl}`;

    // Update meta tags
    this.updateMetaTags({
      title: `${post.title} | WebGlo Blog`,
      description: post.excerpt,
      keywords: post.tags
    });

    // Update canonical
    this.updateCanonical(postUrl);

    // Update OG tags
    this.updateOGTags({
      title: post.title,
      description: post.excerpt,
      image: post.image,
      url: fullUrl,
      type: 'article'
    });

    // Update Twitter Card
    this.updateTwitterCard({
      title: post.title,
      description: post.excerpt,
      image: post.image
    });

    // Add structured data
    this.addBlogPostSchema(post);
    this.addOrganizationSchema();

    console.log(`✓ Complete SEO setup for: ${post.title}`);
  }

  /**
   * Track pageview (respects cookie consent)
   */
  trackPageview(path = window.location.pathname) {
    if (window.gtag && this.hasAnalyticsConsent()) {
      gtag('config', 'G-BFDSVY8Y4N', {
        'page_path': path
      });
      console.log('✓ Pageview tracked:', path);
    }
  }

  /**
   * Check if analytics consent given
   */
  hasAnalyticsConsent() {
    const consent = this.getCookie('webglo_cookie_consent');
    if (!consent) return false;

    try {
      const data = JSON.parse(consent);
      return data.preferences?.analytics === true;
    } catch (e) {
      return false;
    }
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
}

// Initialize globally
window.WebGloSEO = new WebGloSEO();
