// Dynamic Blog Post Loader for GitHub Pages
class BlogPostLoader {
  constructor() {
    this.blogData = null;
    this.currentPost = null;
    this.init();
  }

  async init() {
    try {
      console.log('BlogPostLoader: Starting initialization...');
      await this.loadBlogData();
      console.log('BlogPostLoader: Blog data loaded, proceeding to load post...');
      this.loadPostFromURL();
      console.log('BlogPostLoader: Initialization complete');
    } catch (error) {
      console.error('BlogPostLoader: Failed to initialize:', error);
      this.showError('Failed to load blog content. Please try again later.');
    }
  }

  async loadBlogData() {
    try {
      console.log('BlogPostLoader: Fetching blog-data.json...');
      const response = await fetch('blog-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.blogData = await response.json();
      console.log('BlogPostLoader: Blog data loaded successfully, posts:', this.blogData.posts.length);
    } catch (error) {
      console.error('BlogPostLoader: Error loading blog data:', error);
      throw error;
    }
  }

  loadPostFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    console.log('Loading post with ID:', postId);
    
    if (!postId) {
      this.showError('No post ID specified in URL.');
      return;
    }

    if (!this.blogData || !this.blogData.posts) {
      this.showError('Blog data not loaded properly.');
      return;
    }

    const post = this.blogData.posts.find(p => p.id === postId);
    
    console.log('Found post:', post ? post.title : 'Not found');
    
    if (!post) {
      this.showError(`Post with ID "${postId}" not found.`);
      return;
    }

    this.currentPost = post;
    this.renderPost(post);
    this.updatePageMetadata(post);
  }

  renderPost(post) {
    // Update page title
    document.title = `${post.title} | WebGlo Blog`;
    
    // Update article header
    this.updateArticleHeader(post);
    
    // Update article content
    this.updateArticleContent(post);
    
    // Update related posts
    this.updateRelatedPosts(post);
  }

  updateArticleHeader(post) {
    // Update category and read time
    const categoryEl = document.querySelector('.article-category');
    if (categoryEl) {
      categoryEl.textContent = this.formatCategory(post.category);
    }

    const readTimeEl = document.querySelector('.article-read-time');
    if (readTimeEl) {
      readTimeEl.textContent = post.readTime;
    }

    // Update main headline
    const headlineEl = document.querySelector('.article-headline');
    if (headlineEl) {
      headlineEl.innerHTML = this.formatHeadline(post.title);
    }

    // Update hero image
    const heroImageEl = document.querySelector('.article-hero-image');
    if (heroImageEl) {
      heroImageEl.src = post.image;
      heroImageEl.alt = post.imageAlt;
    }

    // Update author and date
    const authorEl = document.querySelector('.article-author');
    if (authorEl) {
      authorEl.textContent = post.author;
    }

    const dateEl = document.querySelector('.article-date');
    if (dateEl) {
      dateEl.textContent = post.date;
    }
  }

  updateArticleContent(post) {
    const contentEl = document.querySelector('.article-content');
    if (!contentEl) {
      console.error('Article content element not found');
      return;
    }

    console.log('Loading content for post:', post.title);
    console.log('Raw content length:', post.content ? post.content.length : 'No content');

    // Convert markdown-style content to HTML
    const htmlContent = this.markdownToHtml(post.content || '');
    console.log('Converted HTML length:', htmlContent.length);
    
    contentEl.innerHTML = htmlContent;

    // Add syntax highlighting and other enhancements
    this.enhanceContent(contentEl);
    
    // Ensure feedback and newsletter widgets are present after the article
    this.ensureArticleWidgets(post);
  }

  ensureArticleWidgets(post) {
    // Look for widgets in the article content first
    const contentEl = document.querySelector('.article-content');
    const existingFeedback = contentEl && contentEl.querySelector('.webglo-article-feedback-widget');
    const existingNewsletter = contentEl && contentEl.querySelector('.webglo-newsletter-widget');
    
    // If widgets already exist in content, don't add them again
    if (existingFeedback && existingNewsletter) {
      console.log('Widgets already exist in post content');
      return;
    }
    
    // Find the article section to inject widgets after it
    const articleSection = document.querySelector('section:has(article)') || 
                          document.querySelector('.article-content').closest('section');
    
    if (!articleSection) {
      console.error('Could not find article section for widget injection');
      return;
    }
    
    // Create widget container section
    let widgetSection = document.getElementById('article-widgets-section');
    
    if (!widgetSection) {
      widgetSection = document.createElement('section');
      widgetSection.id = 'article-widgets-section';
      widgetSection.className = 'py-12 bg-gray-50';
      
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'max-w-4xl mx-auto px-6 lg:px-8 space-y-8';
      
      // Add feedback widget if not in content
      if (!existingFeedback) {
        const feedbackWidget = this.createFeedbackWidget();
        widgetContainer.appendChild(feedbackWidget);
      }
      
      // Add newsletter widget if not in content
      if (!existingNewsletter) {
        const newsletterWidget = this.createNewsletterWidget();
        widgetContainer.appendChild(newsletterWidget);
      }
      
      widgetSection.appendChild(widgetContainer);
      
      // Insert after the article section
      articleSection.parentNode.insertBefore(widgetSection, articleSection.nextSibling);
      
      console.log('Article widgets injected for post:', post.id);
    }
  }

  createFeedbackWidget() {
    const widget = document.createElement('div');
    widget.className = 'webglo-article-feedback-widget';
    widget.innerHTML = `
      <div class="feedback-container">
        <h3>Was this article helpful?</h3>
        <div class="feedback-buttons">
          <button class="feedback-btn helpful" onclick="submitFeedback('helpful')">
            <span class="feedback-icon">👍</span>
            <span>Yes</span>
          </button>
          <button class="feedback-btn not-helpful" onclick="submitFeedback('not-helpful')">
            <span class="feedback-icon">👎</span>
            <span>No</span>
          </button>
        </div>
        <div id="feedback-result" class="feedback-result hidden">
          <p>Thank you for your feedback!</p>
        </div>
      </div>
    `;
    return widget;
  }

  createNewsletterWidget() {
    const widget = document.createElement('div');
    widget.className = 'webglo-newsletter-widget';
    widget.innerHTML = `
      <div class="newsletter-container">
        <div class="newsletter-header">
          <h2>Never miss another article</h2>
          <p>Get the latest web development insights, framework guides, and business growth strategies delivered to your inbox.</p>
        </div>
        
        <form class="newsletter-form" data-webglo-form="newsletter" onsubmit="submitNewsletter(event)">
          <div class="form-group">
            <input 
              type="email" 
              id="newsletter-email" 
              name="email"
              placeholder="Enter your email here" 
              required 
              class="newsletter-input"
            >
            <button type="submit" class="newsletter-submit">
              Join
            </button>
          </div>
          
          <div class="newsletter-checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" id="terms-agreement" required>
              <span class="checkmark"></span>
              I agree to the <a href="terms-of-service.html" class="terms-link">Terms of Use</a>
            </label>
            
            <label class="checkbox-label">
              <input type="checkbox" id="privacy-agreement" required>
              <span class="checkmark"></span>
              I acknowledge that I've read <a href="privacy-policy.html" class="privacy-link">Privacy Policy</a>
            </label>
          </div>
          
          <div id="newsletter-result" class="newsletter-result hidden">
            <!-- Result message will be inserted here -->
          </div>
        </form>
      </div>
    `;
    return widget;
  }

  markdownToHtml(markdown) {
    let html = markdown;
    
    // Convert code blocks first (before other processing)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-white p-4 rounded-lg mb-6 overflow-x-auto"><code class="language-$1">$2</code></pre>');
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-gray-900 mb-6 mt-12">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-gray-900 mb-8">$1</h1>');
    
    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Convert lists
    html = html.replace(/^- (.*$)/gim, '<li class="mb-2">$1</li>');
    html = html.replace(/(<li.*?<\/li>)/gs, '<ul class="list-disc list-inside mb-6 space-y-2 text-gray-700">$1</ul>');
    
    // Convert inline code (after code blocks)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Convert paragraphs (handle double newlines) - do this last
    html = html.replace(/\n\n/g, '</p><p class="text-lg text-gray-700 leading-relaxed mb-6">');
    html = '<p class="text-lg text-gray-700 leading-relaxed mb-6">' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*><\/p>/g, '');
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    return html;
  }

  enhanceContent(contentEl) {
    // Add smooth scrolling to anchor links
    const headings = contentEl.querySelectorAll('h2, h3');
    headings.forEach(heading => {
      const id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      heading.id = id;
      heading.style.scrollMarginTop = '100px';
    });

    // Add table of contents for long articles
    if (headings.length > 3) {
      this.addTableOfContents(headings);
    }
  }

  addTableOfContents(headings) {
    const tocEl = document.querySelector('.table-of-contents');
    if (!tocEl) return;

    const tocList = document.createElement('ul');
    tocList.className = 'space-y-2';

    headings.forEach(heading => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent;
      a.className = 'text-[#df00ff] hover:text-[#0cead9] transition-colors text-sm';
      
      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocEl.appendChild(tocList);
    tocEl.style.display = 'block';
  }

  updateRelatedPosts(currentPost) {
    const relatedContainer = document.querySelector('.related-posts-container');
    if (!relatedContainer) return;

    // Find related posts (same category, excluding current post)
    const relatedPosts = this.blogData.posts
      .filter(post => post.id !== currentPost.id && post.category === currentPost.category)
      .slice(0, 3);

    if (relatedPosts.length === 0) {
      relatedContainer.style.display = 'none';
      return;
    }

    const relatedHTML = relatedPosts.map(post => `
      <article class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div class="relative overflow-hidden">
          <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-6">
          <div class="mb-3">
            <span class="text-xs text-gray-500">${post.date} • ${post.readTime}</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-3 hover:text-[#df00ff] transition-colors">
            ${post.title}
          </h3>
          <p class="text-gray-600 mb-4 text-sm leading-relaxed">
            ${post.excerpt}
          </p>
          <a href="post.html?id=${post.id}" class="text-[#df00ff] font-semibold hover:text-[#0cead9] transition-colors text-sm">
            Read More →
          </a>
        </div>
      </article>
    `).join('');

    const relatedGrid = relatedContainer.querySelector('.related-posts-grid');
    if (relatedGrid) {
      relatedGrid.innerHTML = relatedHTML;
    }
  }

  updatePageMetadata(post) {
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', post.excerpt);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${post.title} | WebGlo Blog`);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', post.excerpt);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', post.image);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://webglo.org/post.html?id=${post.id}`);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://webglo.org/post.html?id=${post.id}`);
    }
  }

  formatCategory(category) {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatHeadline(title) {
    // Split title and highlight key words
    const words = title.split(' ');
    if (words.length > 4) {
      const midpoint = Math.floor(words.length / 2);
      const firstPart = words.slice(0, midpoint).join(' ');
      const secondPart = words.slice(midpoint).join(' ');
      
      return `${firstPart} <span class="bg-gradient-to-r from-[#df00ff] to-[#0cead9] bg-clip-text text-transparent">${secondPart}</span>`;
    }
    return title;
  }

  showError(message) {
    const contentEl = document.querySelector('.article-content') || document.body;
    contentEl.innerHTML = `
      <div class="max-w-2xl mx-auto text-center py-16">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
        <p class="text-gray-600 mb-8">${message}</p>
        <a href="blog.html" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-lg hover:shadow-lg transition-all duration-300">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Blog
        </a>
      </div>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blogPostLoader = new BlogPostLoader();
});
