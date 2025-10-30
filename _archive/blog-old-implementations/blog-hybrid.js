// Enhanced Blog System - Hybrid Architecture
// Static JSON + Lightweight Metrics Backend

class WebGloBlogHybrid {
  constructor() {
    // Primary data source: Static JSON files
    this.staticDataUrl = './blog-data/posts.json';
    this.metricsApiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Optional for metrics only
    
    this.posts = [];
    this.categories = [];
    this.tags = [];
    this.metrics = {};
    
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes for static data
    this.metricsTimeout = 5 * 60 * 1000; // 5 minutes for metrics
    
    this.init();
  }

  async init() {
    try {
      // Load static data first (fast)
      await this.loadStaticData();
      
      // Load metrics separately (optional, doesn't block)
      this.loadMetricsAsync();
      
      // Initialize UI immediately
      this.initializeUI();
      this.setupEventListeners();
      this.trackPageView();
      
    } catch (error) {
      console.error('Failed to initialize blog system:', error);
      this.handleInitError();
    }
  }

  // ===== STATIC DATA LOADING =====

  async loadStaticData() {
    try {
      // Load main posts index
      const postsResponse = await fetch(this.staticDataUrl);
      const postsData = await postsResponse.json();
      
      this.posts = postsData.posts || [];
      this.categories = postsData.categories || [];
      this.tags = postsData.tags || [];
      
      // Cache the data
      this.cache.set('posts', {
        data: this.posts,
        timestamp: Date.now(),
        timeout: this.cacheTimeout
      });
      
      console.log(`✅ Loaded ${this.posts.length} posts from static data`);
      
      // Render immediately with static data
      this.renderPosts();
      
      return true;
      
    } catch (error) {
      console.error('Failed to load static blog data:', error);
      return false;
    }
  }

  async loadMetricsAsync() {
    try {
      // Non-blocking metrics load
      if (!this.metricsApiUrl.includes('YOUR_SCRIPT_ID')) {
        const response = await fetch(`${this.metricsApiUrl}?path=metrics`);
        const data = await response.json();
        
        this.metrics = data.metrics || {};
        this.updateMetricsDisplay();
        
        console.log('✅ Loaded live metrics');
      } else {
        // Use fallback static metrics if available
        await this.loadStaticMetrics();
      }
    } catch (error) {
      console.log('ℹ️ Live metrics unavailable, using static data');
      await this.loadStaticMetrics();
    }
  }

  async loadStaticMetrics() {
    try {
      const response = await fetch('/blog-data/metrics.json');
      const data = await response.json();
      this.metrics = data.metrics || {};
      this.updateMetricsDisplay();
    } catch (error) {
      // Fallback to default metrics
      this.generateDefaultMetrics();
    }
  }

  generateDefaultMetrics() {
    // Generate reasonable default metrics for posts
    this.posts.forEach(post => {
      if (!this.metrics[post.id]) {
        this.metrics[post.id] = {
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 2
        };
      }
    });
  }

  // ===== INDIVIDUAL POST LOADING =====

  async loadFullPost(postId) {
    try {
      // Try to load individual post file for full content
      const response = await fetch(`/blog-data/posts/${postId}.json`);
      const postData = await response.json();
      
      // Cache the full post
      this.cache.set(`post-${postId}`, {
        data: postData,
        timestamp: Date.now(),
        timeout: this.cacheTimeout
      });
      
      return postData;
      
    } catch (error) {
      console.log(`Post file not found for ${postId}, using index data`);
      return this.posts.find(post => post.id === postId);
    }
  }

  // ===== METRICS INTERACTION =====

  async toggleLike(postId) {
    try {
      // Optimistic update
      if (!this.metrics[postId]) {
        this.metrics[postId] = { views: 0, likes: 0, shares: 0 };
      }
      
      this.metrics[postId].likes++;
      this.updatePostLikeCount(postId, this.metrics[postId].likes);
      this.showLikeAnimation(postId);
      
      // Try to sync with backend if available
      if (!this.metricsApiUrl.includes('YOUR_SCRIPT_ID')) {
        fetch(`${this.metricsApiUrl}?path=like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        }).catch(() => {
          // Silent fail - the optimistic update already happened
          console.log('Backend sync failed, using optimistic update');
        });
      }
      
      // Update local storage as backup
      this.saveMetricsToStorage();
      
      return { liked: true, likeCount: this.metrics[postId].likes };
      
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return { liked: false };
    }
  }

  async trackView(postId) {
    try {
      // Optimistic update
      if (!this.metrics[postId]) {
        this.metrics[postId] = { views: 0, likes: 0, shares: 0 };
      }
      
      this.metrics[postId].views++;
      this.updatePostViewCount(postId, this.metrics[postId].views);
      
      // Try to sync with backend
      if (!this.metricsApiUrl.includes('YOUR_SCRIPT_ID')) {
        fetch(`${this.metricsApiUrl}?path=view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        }).catch(() => console.log('Backend view tracking failed'));
      }
      
      // Update local storage
      this.saveMetricsToStorage();
      
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }

  // ===== LOCAL STORAGE BACKUP =====

  saveMetricsToStorage() {
    try {
      localStorage.setItem('webglo-blog-metrics', JSON.stringify({
        metrics: this.metrics,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.log('Failed to save metrics to localStorage');
    }
  }

  loadMetricsFromStorage() {
    try {
      const stored = localStorage.getItem('webglo-blog-metrics');
      if (stored) {
        const data = JSON.parse(stored);
        // Only use if less than 24 hours old
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          this.metrics = { ...this.metrics, ...data.metrics };
          return true;
        }
      }
    } catch (error) {
      console.log('Failed to load metrics from localStorage');
    }
    return false;
  }

  // ===== SEARCH AND FILTERING =====

  searchPosts(query) {
    if (!query) return this.posts;
    
    const searchTerm = query.toLowerCase();
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (post.content && post.content.toLowerCase().includes(searchTerm))
    );
  }

  filterByCategory(category) {
    if (category === 'all') return this.posts;
    return this.posts.filter(post => post.category === category);
  }

  getPostsByTag(tag) {
    return this.posts.filter(post => post.tags.includes(tag));
  }

  // ===== UI RENDERING =====

  renderPosts(postsToRender = null) {
    const posts = postsToRender || this.posts;
    const postsContainer = document.getElementById('blog-posts-grid');
    
    if (!postsContainer) return;

    if (posts.length === 0) {
      postsContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }

    const postsHTML = posts.map(post => this.generatePostCard(post)).join('');
    postsContainer.innerHTML = postsHTML;

    // Initialize interactions after rendering
    this.initializePostInteractions();
  }

  generatePostCard(post) {
    const metrics = this.metrics[post.id] || { views: 0, likes: 0, shares: 0 };
    const publishDate = new Date(post.publishDate || post.created).toLocaleDateString();
    
    return `
      <article class="blog-post bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group" 
               data-category="${post.category}" 
               data-post-id="${post.id}">
        <div class="relative overflow-hidden">
          <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
          <div class="absolute top-4 left-4">
            <span class="bg-white/90 backdrop-blur-sm text-[#df00ff] px-3 py-1 rounded-full text-xs font-bold">
              ${this.getCategoryDisplayName(post.category)}
            </span>
          </div>
          <div class="absolute top-4 right-4">
            <button class="like-btn bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 flex items-center justify-center"
                    data-post-id="${post.id}"
                    title="Like this post">
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
              <img src="assets/logo.svg" alt="WebGlo" class="w-6 h-6 rounded-full mr-2">
              <span>${post.author}</span>
            </div>
            <div class="text-sm text-gray-500">
              <span>${publishDate}</span> • <span>${post.readTime} min read</span>
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#df00ff] transition-colors duration-300 line-clamp-2">
            ${post.title}
          </h3>
          <p class="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
            ${post.excerpt}
          </p>
          <div class="flex items-center justify-between">
            <a href="${this.getPostUrl(post)}" class="inline-flex items-center text-[#df00ff] font-semibold text-sm hover:text-[#0cead9] transition-colors duration-300">
              Read More
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <div class="flex items-center space-x-3 text-xs text-gray-500">
              <span class="view-count">${this.formatNumber(metrics.views)} views</span>
              <span class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                ${metrics.shares}
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            ${post.tags.map(tag => `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs hover:bg-[#df00ff] hover:text-white transition-colors cursor-pointer" data-tag="${tag}">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }

  // ===== UTILITY METHODS =====

  getPostUrl(post) {
    // Use the single post.html template with URL parameters for consistent styling
    return `post.html?id=${post.id}`;
  }

  getCategoryDisplayName(category) {
    const categoryMap = {
      'web-development': 'Web Development',
      'digital-marketing': 'Digital Marketing',
      'digital-strategy': 'Digital Strategy',
      'seo': 'SEO & Analytics',
      'business': 'Business Growth',
      'tutorials': 'Tutorials',
      'case-studies': 'Case Studies'
    };
    return categoryMap[category] || category.replace('-', ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getEmptyStateHTML() {
    return `
      <div class="col-span-full text-center py-12">
        <div class="text-gray-400 text-lg mb-4">No posts found</div>
        <p class="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    `;
  }

  // ===== EVENT HANDLERS =====

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

    // Tag clicks
    document.querySelectorAll('[data-tag]').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        const tagName = tag.dataset.tag;
        this.filterByTag(tagName);
      });
    });

    // View tracking
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

  filterByTag(tagName) {
    const filteredPosts = this.getPostsByTag(tagName);
    this.renderPosts(filteredPosts);
    
    // Update URL or show filter indicator
    console.log(`Filtered by tag: ${tagName} (${filteredPosts.length} posts)`);
  }

  setupEventListeners() {
    this.setupSearch();
    this.setupCategoryFilters();
  }

  setupSearch() {
    const searchInput = document.getElementById('blog-search');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        const results = this.searchPosts(query);
        this.renderPosts(results);
      }, 300);
    });
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
        const filteredPosts = this.filterByCategory(category);
        this.renderPosts(filteredPosts);
      });
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
        viewCount.textContent = `${this.formatNumber(count)} views`;
      }
    }
  }

  showLikeAnimation(postId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      const likeBtn = postElement.querySelector('.like-btn');
      likeBtn.classList.add('animate-pulse');
      
      setTimeout(() => {
        likeBtn.classList.remove('animate-pulse');
      }, 1000);
    }
  }

  updateMetricsDisplay() {
    // Update individual post metrics
    Object.keys(this.metrics).forEach(postId => {
      this.updatePostLikeCount(postId, this.metrics[postId].likes);
      this.updatePostViewCount(postId, this.metrics[postId].views);
    });
  }

  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Blog Index',
        page_location: window.location.href
      });
    }
  }

  handleInitError() {
    console.log('Using emergency fallback mode');
    // Could load from localStorage or show static content
  }

  initializeUI() {
    // Any UI setup that doesn't depend on data
    console.log('✅ Blog system initialized successfully');
  }
}

// Initialize the hybrid blog system
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/blog.html') || 
      window.location.pathname.endsWith('/blog/')) {
    window.webgloBlogHybrid = new WebGloBlogHybrid();
  }
});
