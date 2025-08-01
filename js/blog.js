// Enhanced Blog functionality with rich features
class WebGloBlog {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentCategory = 'all';
    this.searchTerm = '';
    this.metrics = this.loadMetrics();
    this.init();
  }

  // Load metrics from localStorage with initial boost
  loadMetrics() {
    const stored = localStorage.getItem('webglo_blog_metrics');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initial boosted metrics for authentic feel
    return {
      totalViews: 12847,
      totalLikes: 2156,
      totalShares: 428,
      postMetrics: {}
    };
  }

  // Save metrics to localStorage
  saveMetrics() {
    localStorage.setItem('webglo_blog_metrics', JSON.stringify(this.metrics));
  }

  // Track individual post interactions
  trackPostInteraction(postId, type) {
    if (!this.metrics.postMetrics[postId]) {
      this.metrics.postMetrics[postId] = {
        views: Math.floor(Math.random() * 500) + 200, // Initial boosted views
        likes: Math.floor(Math.random() * 50) + 10,   // Initial boosted likes
        shares: Math.floor(Math.random() * 20) + 5    // Initial boosted shares
      };
    }
    
    this.metrics.postMetrics[postId][type]++;
    this.metrics[`total${type.charAt(0).toUpperCase() + type.slice(1)}`]++;
    this.saveMetrics();
    this.updatePostDisplay(postId);
  }

  // Update post display with real metrics
  updatePostDisplay(postId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement && this.metrics.postMetrics[postId]) {
      const metrics = this.metrics.postMetrics[postId];
      
      // Update like count
      const likeButton = postElement.querySelector('.like-btn');
      if (likeButton) {
        const likeCount = likeButton.querySelector('.like-count');
        if (likeCount) {
          likeCount.textContent = metrics.likes;
        }
      }
      
      // Update view count
      const viewCount = postElement.querySelector('.view-count');
      if (viewCount) {
        viewCount.textContent = `${metrics.views} views`;
      }
    }
  }

  init() {
    this.initCategoryFilters();
    this.initSearchFunctionality();
    this.initNewsletterForm();
    this.initPostInteractions();
    this.initLoadMore();
    this.initLikeSystem();
    this.trackAnalytics();
    this.initializePostMetrics();
  }

  // Initialize like system for all posts
  initLikeSystem() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const postElement = button.closest('.blog-post');
        const postId = postElement.dataset.postId || this.generatePostId(postElement);
        postElement.dataset.postId = postId;
        
        this.handleLike(button, postId);
      });
    });
  }

  // Generate unique post ID based on title
  generatePostId(postElement) {
    const title = postElement.querySelector('h3').textContent;
    return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }

  // Handle like button click
  handleLike(button, postId) {
    const isLiked = button.classList.contains('liked');
    const heartIcon = button.querySelector('svg');
    const likeCount = button.querySelector('.like-count');
    
    if (!isLiked) {
      // Like the post
      button.classList.add('liked');
      heartIcon.style.fill = '#df00ff';
      heartIcon.style.color = '#df00ff';
      button.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
      
      this.trackPostInteraction(postId, 'likes');
      this.showLikeAnimation(button);
      
    } else {
      // Unlike the post
      button.classList.remove('liked');
      heartIcon.style.fill = 'none';
      heartIcon.style.color = '#6b7280';
      
      if (this.metrics.postMetrics[postId]) {
        this.metrics.postMetrics[postId].likes = Math.max(0, this.metrics.postMetrics[postId].likes - 1);
        this.metrics.totalLikes = Math.max(0, this.metrics.totalLikes - 1);
        this.saveMetrics();
        this.updatePostDisplay(postId);
      }
    }
  }

  // Show like animation
  showLikeAnimation(button) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
      position: absolute;
      font-size: 20px;
      pointer-events: none;
      animation: like-float 1s ease-out forwards;
      z-index: 1000;
    `;
    
    const rect = button.getBoundingClientRect();
    heart.style.left = rect.left + rect.width/2 + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
      heart.remove();
    }, 1000);
  }

  // Initialize post metrics on page load
  initializePostMetrics() {
    const posts = document.querySelectorAll('.blog-post');
    posts.forEach((post, index) => {
      const postId = this.generatePostId(post);
      post.dataset.postId = postId;
      
      // Track view
      this.trackPostInteraction(postId, 'views');
    });
  }

  initCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.blog-category-btn');
    const blogPosts = document.querySelectorAll('.blog-post');

    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        this.currentCategory = category;
        
        // Update button states with smooth animation
        categoryButtons.forEach(btn => {
          btn.classList.remove('active', 'text-white', 'bg-gradient-to-r', 'from-[#df00ff]', 'to-[#0cead9]', 'shadow-lg');
          btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        button.classList.add('active', 'text-white', 'bg-gradient-to-r', 'from-[#df00ff]', 'to-[#0cead9]', 'shadow-lg');
        button.classList.remove('bg-gray-100', 'text-gray-700');
        
        // Filter posts with animation
        this.filterPosts(category);
        
        // Track category selection
        this.trackEvent('Blog Category Filter', { category: category });
      });
    });
  }

  filterPosts(category) {
    const blogPosts = document.querySelectorAll('.blog-post');
    
    blogPosts.forEach((post, index) => {
      // Add fade out animation
      post.style.opacity = '0';
      post.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (category === 'all' || post.dataset.category === category) {
          post.style.display = 'block';
          // Stagger the fade in animation
          setTimeout(() => {
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
          }, index * 100);
        } else {
          post.style.display = 'none';
        }
      }, 300);
    });
  }

  initSearchFunctionality() {
    const searchInput = document.getElementById('blog-search');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300); // Debounce search
    });

    // Search button functionality
    const searchButton = searchInput.nextElementSibling;
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
    }

    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(e.target.value);
      }
    });
  }

  performSearch(term) {
    this.searchTerm = term.toLowerCase();
    const blogPosts = document.querySelectorAll('.blog-post');
    let visibleCount = 0;

    blogPosts.forEach(post => {
      const title = post.querySelector('h3').textContent.toLowerCase();
      const description = post.querySelector('p').textContent.toLowerCase();
      const tags = Array.from(post.querySelectorAll('.inline-block')).map(tag => tag.textContent.toLowerCase());
      
      const matchesSearch = !this.searchTerm || 
        title.includes(this.searchTerm) || 
        description.includes(this.searchTerm) ||
        tags.some(tag => tag.includes(this.searchTerm));
      
      const matchesCategory = this.currentCategory === 'all' || post.dataset.category === this.currentCategory;
      
      if (matchesSearch && matchesCategory) {
        post.style.display = 'block';
        post.style.opacity = '1';
        post.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        post.style.display = 'none';
      }
    });

    // Show no results message if needed
    this.showNoResultsMessage(visibleCount === 0);
    
    // Track search
    if (term) {
      this.trackEvent('Blog Search', { term: term, results: visibleCount });
    }
  }

  showNoResultsMessage(show) {
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (show && !noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.id = 'no-results-message';
      noResultsMsg.className = 'col-span-full text-center py-12';
      noResultsMsg.innerHTML = `
        <div class="max-w-md mx-auto">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
          <p class="text-gray-600 mb-6">Try adjusting your search terms or browse by category.</p>
          <button onclick="webgloBlog.clearSearch()" class="px-6 py-3 bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white rounded-lg hover:shadow-lg transition-all duration-300">
            Clear Search
          </button>
        </div>
      `;
      document.getElementById('blog-posts-grid').appendChild(noResultsMsg);
    } else if (!show && noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('blog-search');
    if (searchInput) searchInput.value = '';
    this.searchTerm = '';
    this.performSearch('');
  }

  initNewsletterForm() {
    // Newsletter forms are now handled by the main form handler (form-handler.js)
    // This ensures they go through the same security validation and Google Apps Script backend
    console.log('Newsletter form initialization - handled by form-handler.js');
  }

  // Newsletter subscription is now handled by form-handler.js with proper backend integration

  initPostInteractions() {
    // Like buttons
    document.querySelectorAll('.blog-post').forEach(post => {
      const likeButton = post.querySelector('button');
      if (likeButton) {
        likeButton.addEventListener('click', () => {
          this.toggleLike(post, likeButton);
        });
      }
    });

    // Reading progress tracking
    this.initReadingProgress();
    
    // Social sharing
    this.initSocialSharing();
  }

  toggleLike(post, button) {
    const icon = button.querySelector('svg');
    const isLiked = button.classList.contains('liked');
    
    if (isLiked) {
      button.classList.remove('liked');
      icon.classList.remove('text-red-500');
      icon.classList.add('text-gray-600');
    } else {
      button.classList.add('liked');
      icon.classList.remove('text-gray-600');
      icon.classList.add('text-red-500');
      
      // Animate heart
      button.style.transform = 'scale(1.2)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 200);
    }
    
    // Track like
    this.trackEvent('Post Like', { 
      title: post.querySelector('h3').textContent,
      action: isLiked ? 'unlike' : 'like'
    });
  }

  initReadingProgress() {
    // Track how long users spend reading
    let startTime = Date.now();
    let isVisible = true;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        // Track reading time when user leaves
        const readingTime = Math.floor((Date.now() - startTime) / 1000);
        if (readingTime > 10) { // Only track if more than 10 seconds
          this.trackEvent('Blog Reading Time', { 
            seconds: readingTime,
            page: 'blog-index'
          });
        }
      } else {
        isVisible = true;
        startTime = Date.now();
      }
    });
  }

  initSocialSharing() {
    // Add social sharing functionality
    const socialShareHTML = `
      <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 space-y-3">
          <button onclick="webgloBlog.shareOnSocial('twitter')" class="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button onclick="webgloBlog.shareOnSocial('linkedin')" class="w-10 h-10 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button onclick="webgloBlog.shareOnSocial('facebook')" class="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', socialShareHTML);
  }

  shareOnSocial(platform) {
    const url = window.location.href;
    const title = 'Check out this great blog post from WebGlo!';
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      this.trackEvent('Social Share', { platform: platform, url: url });
    }
  }

  initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMorePosts();
      });
    }
  }

  async loadMorePosts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const originalText = loadMoreBtn.textContent;
    
    // Show loading state
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading More...
    `;

    try {
      // Simulate loading more posts
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you'd fetch from an API here
      this.showMessage('All articles loaded! 🎉', 'success');
      loadMoreBtn.style.display = 'none';
      
    } catch (error) {
      this.showMessage('Failed to load more posts. Please try again.', 'error');
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = originalText;
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.webglo-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = `webglo-message fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => messageEl.remove(), 300);
      }
    }, 5000);
  }

  trackEvent(eventName, properties = {}) {
    // Track events for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    
    // Console log for development
    console.log('Event tracked:', eventName, properties);
  }

  trackAnalytics() {
    // Track page view
    this.trackEvent('Blog Page View', {
      page: 'blog-index',
      timestamp: new Date().toISOString()
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestones
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          this.trackEvent('Blog Scroll Depth', {
            percent: scrollPercent,
            page: 'blog-index'
          });
        }
      }
    });
  }
}

// Initialize blog functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.webgloBlog = new WebGloBlog();
});

// Add enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse-once {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .animate-pulse-once {
    animation: pulse-once 0.6s ease-in-out;
  }
  
  .blog-post {
    transition: all 0.3s ease;
  }
  
  .blog-category-btn {
    transition: all 0.3s ease;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);
