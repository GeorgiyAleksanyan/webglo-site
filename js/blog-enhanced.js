// Enhanced Blog System - Frontend Client
// Connects to Google Apps Script backend for real persistence

class WebGloBlogEnhanced {
  constructor() {
    this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Replace with actual script URL
    this.posts = [];
    this.metrics = {};
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    this.init();
  }

  async init() {
    try {
      await this.loadPosts();
      await this.loadMetrics();
      this.initializeUI();
      this.setupEventListeners();
      this.trackPageView();
    } catch (error) {
      console.error('Failed to initialize blog system:', error);
      this.fallbackToStaticMode();
    }
  }

  // ===== API METHODS =====

  async apiRequest(endpoint, method = 'GET', data = null) {
    const cacheKey = `${method}-${endpoint}`;
    
    // Check cache for GET requests
    if (method === 'GET' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const url = new URL(this.apiBaseUrl);
      
      if (method === 'GET') {
        url.searchParams.append('path', endpoint);
        if (data) {
          Object.keys(data).forEach(key => {
            url.searchParams.append(key, data[key]);
          });
        }
      }

      const config = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (method === 'POST' && data) {
        url.searchParams.append('path', endpoint);
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache GET requests
      if (method === 'GET') {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async loadPosts() {
    try {
      const response = await this.apiRequest('posts');
      this.posts = response.posts || [];
      this.renderPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.loadStaticPosts(); // Fallback
    }
  }

  async loadMetrics() {
    try {
      const response = await this.apiRequest('metrics');
      this.metrics = response.metrics || {};
      this.updateMetricsDisplay();
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  async getPostMetrics(postId) {
    try {
      const response = await this.apiRequest('metrics', 'GET', { postId });
      return response.metrics || { views: 0, likes: 0, shares: 0 };
    } catch (error) {
      console.error('Failed to get post metrics:', error);
      return { views: 0, likes: 0, shares: 0 };
    }
  }

  async toggleLike(postId) {
    try {
      const response = await this.apiRequest('like', 'POST', { postId });
      
      if (response.liked) {
        // Update local metrics
        if (!this.metrics[postId]) {
          this.metrics[postId] = { views: 0, likes: 0, shares: 0 };
        }
        this.metrics[postId].likes = response.likeCount;
        
        // Update UI
        this.updatePostLikeCount(postId, response.likeCount);
        
        // Visual feedback
        this.showLikeAnimation(postId);
      }
      
      return response;
      
    } catch (error) {
      console.error('Failed to toggle like:', error);
      this.showMessage('Failed to like post. Please try again.', 'error');
    }
  }

  async trackView(postId) {
    try {
      await this.apiRequest('view', 'POST', { postId });
      
      // Update local count
      if (!this.metrics[postId]) {
        this.metrics[postId] = { views: 0, likes: 0, shares: 0 };
      }
      this.metrics[postId].views++;
      
      this.updatePostViewCount(postId, this.metrics[postId].views);
      
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }

  // ===== UI METHODS =====

  renderPosts() {
    const postsContainer = document.getElementById('blog-posts-grid');
    if (!postsContainer || this.posts.length === 0) return;

    const postsHTML = this.posts.map(post => this.generatePostCard(post)).join('');
    postsContainer.innerHTML = postsHTML;

    // Initialize post interactions
    this.initializePostInteractions();
  }

  generatePostCard(post) {
    const metrics = this.metrics[post.id] || { views: 0, likes: 0, shares: 0 };
    
    return `
      <article class="blog-post bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group" 
               data-category="${post.category}" 
               data-post-id="${post.id}">
        <div class="relative overflow-hidden">
          <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
          <div class="absolute top-4 left-4">
            <span class="bg-white/90 backdrop-blur-sm text-[#df00ff] px-3 py-1 rounded-full text-xs font-bold">
              ${post.category}
            </span>
          </div>
          <div class="absolute top-4 right-4">
            <button class="like-btn bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 flex items-center justify-center"
                    data-post-id="${post.id}">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="like-count ml-1 text-xs text-gray-600">${metrics.likes}</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center text-sm text-gray-500">
              <img src="assets/logo.png" alt="WebGlo" class="w-6 h-6 rounded-full mr-2">
              <span>${post.author}</span>
            </div>
            <span class="text-sm text-gray-500">${post.readTime} min read</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#df00ff] transition-colors duration-300 line-clamp-2">
            ${post.title}
          </h3>
          <p class="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
            ${post.excerpt}
          </p>
          <div class="flex items-center justify-between">
            <a href="blog/${post.slug}.html" class="inline-flex items-center text-[#df00ff] font-semibold text-sm hover:text-[#0cead9] transition-colors duration-300">
              Read More
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <div class="flex items-center space-x-3 text-xs text-gray-500">
              <span class="view-count">${metrics.views} views</span>
              <span class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                ${metrics.shares}
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            ${post.tags.map(tag => `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }

  initializePostInteractions() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const postId = button.dataset.postId;
        button.disabled = true;
        
        await this.toggleLike(postId);
        
        setTimeout(() => {
          button.disabled = false;
        }, 1000);
      });
    });

    // Track views when posts enter viewport
    this.setupViewTracking();
  }

  setupViewTracking() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const postId = entry.target.dataset.postId;
          if (postId && !entry.target.dataset.viewed) {
            entry.target.dataset.viewed = 'true';
            this.trackView(postId);
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.blog-post').forEach(post => {
      observer.observe(post);
    });
  }

  updatePostLikeCount(postId, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      const likeCount = postElement.querySelector('.like-count');
      if (likeCount) {
        likeCount.textContent = count;
      }
    }
  }

  updatePostViewCount(postId, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      const viewCount = postElement.querySelector('.view-count');
      if (viewCount) {
        viewCount.textContent = `${count} views`;
      }
    }
  }

  showLikeAnimation(postId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      const likeBtn = postElement.querySelector('.like-btn');
      likeBtn.classList.add('animate-pulse');
      
      // Create floating heart animation
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'absolute text-red-500 text-xl animate-bounce pointer-events-none';
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%)';
      
      likeBtn.appendChild(heart);
      
      setTimeout(() => {
        likeBtn.classList.remove('animate-pulse');
        heart.remove();
      }, 1000);
    }
  }

  updateMetricsDisplay() {
    // Update any global metrics displays
    const totalViews = Object.values(this.metrics).reduce((sum, metric) => sum + metric.views, 0);
    const totalLikes = Object.values(this.metrics).reduce((sum, metric) => sum + metric.likes, 0);
    
    // Update metrics if elements exist
    const viewsElement = document.getElementById('total-views');
    const likesElement = document.getElementById('total-likes');
    
    if (viewsElement) viewsElement.textContent = totalViews.toLocaleString();
    if (likesElement) likesElement.textContent = totalLikes.toLocaleString();
  }

  // ===== SEARCH AND FILTERING =====

  setupSearch() {
    const searchInput = document.getElementById('blog-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filterPosts(query);
    });
  }

  filterPosts(query) {
    const filteredPosts = this.posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );

    this.renderFilteredPosts(filteredPosts);
  }

  renderFilteredPosts(posts) {
    const postsContainer = document.getElementById('blog-posts-grid');
    if (!postsContainer) return;

    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 text-lg">No posts found matching your search.</div>
        </div>
      `;
      return;
    }

    const postsHTML = posts.map(post => this.generatePostCard(post)).join('');
    postsContainer.innerHTML = postsHTML;
    this.initializePostInteractions();
  }

  // ===== FALLBACK METHODS =====

  fallbackToStaticMode() {
    console.log('Falling back to static blog mode');
    this.loadStaticPosts();
  }

  async loadStaticPosts() {
    try {
      const response = await fetch('/blog-data.json');
      const data = await response.json();
      this.posts = data.posts || [];
      this.renderPosts();
    } catch (error) {
      console.error('Failed to load static posts:', error);
    }
  }

  // ===== ANALYTICS =====

  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Blog Index',
        page_location: window.location.href
      });
    }
  }

  // ===== UTILITY METHODS =====

  setupEventListeners() {
    this.setupSearch();
    this.setupCategoryFilters();
    this.setupNewsletterForm();
  }

  setupCategoryFilters() {
    document.querySelectorAll('.blog-category-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        
        // Update active state
        document.querySelectorAll('.blog-category-btn').forEach(btn => {
          btn.classList.remove('bg-gradient-to-r', 'from-[#df00ff]', 'to-[#0cead9]', 'text-white');
          btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        e.target.classList.remove('bg-gray-100', 'text-gray-700');
        e.target.classList.add('bg-gradient-to-r', 'from-[#df00ff]', 'to-[#0cead9]', 'text-white');
        
        // Filter posts
        if (category === 'all') {
          this.renderPosts();
        } else {
          const filteredPosts = this.posts.filter(post => post.category === category);
          this.renderFilteredPosts(filteredPosts);
        }
      });
    });
  }

  setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      
      // Here you could integrate with your email service
      this.showMessage('Thank you for subscribing!', 'success');
      form.reset();
      
      // Track newsletter signup
      if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
          source: 'blog_index'
        });
      }
    });
  }

  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }
}

// ===== BLOG POST PAGE ENHANCEMENTS =====

class BlogPostEnhanced {
  constructor(postId) {
    this.postId = postId;
    this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    this.init();
  }

  async init() {
    await this.loadPostMetrics();
    this.setupInteractions();
    this.trackPageView();
  }

  async loadPostMetrics() {
    try {
      const response = await fetch(`${this.apiBaseUrl}?path=metrics&postId=${this.postId}`);
      const data = await response.json();
      this.updateMetricsDisplay(data.metrics);
    } catch (error) {
      console.error('Failed to load post metrics:', error);
    }
  }

  updateMetricsDisplay(metrics) {
    // Update view count if element exists
    const viewCount = document.querySelector('.post-view-count');
    if (viewCount && metrics.views) {
      viewCount.textContent = `${metrics.views} views`;
    }
  }

  setupInteractions() {
    // Helpfulness buttons
    document.querySelectorAll('.helpfulness-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const helpful = e.target.dataset.helpful === 'true';
        
        // Disable buttons
        document.querySelectorAll('.helpfulness-btn').forEach(btn => btn.disabled = true);
        
        // Show feedback
        const feedbackMessage = document.getElementById('feedback-message');
        if (feedbackMessage) {
          feedbackMessage.classList.remove('hidden');
        }
        
        // Track event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'article_feedback', {
            helpful: helpful,
            post_id: this.postId
          });
        }
      });
    });
  }

  trackPageView() {
    // Track view
    fetch(`${this.apiBaseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: this.postId })
    }).catch(console.error);

    // Track with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        post_id: this.postId
      });
    }
  }
}

// Initialize based on page type
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/blog.html')) {
    // Blog index page
    window.webgloBlogEnhanced = new WebGloBlogEnhanced();
  } else if (window.location.pathname.includes('/blog/')) {
    // Individual blog post
    const postId = extractPostIdFromUrl();
    if (postId) {
      window.blogPostEnhanced = new BlogPostEnhanced(postId);
    }
  }
});

function extractPostIdFromUrl() {
  const path = window.location.pathname;
  const matches = path.match(/\/blog\/(.+)\.html/);
  return matches ? matches[1] : null;
}
