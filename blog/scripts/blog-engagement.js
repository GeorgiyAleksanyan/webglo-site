/**
 * WebGlo Blog Engagement Client Library
 * Handles client-side interaction with Google Apps Script backend
 * 
 * Features:
 * - View tracking
 * - Like button
 * - Usefulness survey
 * - Metrics display
 */

class BlogEngagement {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://script.google.com/macros/s/AKfycby8yrfMm2Lnv_LTpcGRUzO1v-3PREUxxbsvCCPsDlFm2VkDIW3PPNj8RRoj3pL5EdEa/exec';
    this.postId = config.postId || this.getPostIdFromUrl();
    this.sessionId = this.getOrCreateSessionId();
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    
    // State tracking
    this.hasLiked = this.checkIfLiked();
    this.hasSurveyed = this.checkIfSurveyed();
    this.viewTracked = false;
    
    // Initialize
    if (this.postId) {
      this.init();
    }
  }
  
  /**
   * Initialize engagement tracking
   */
  async init() {
    try {
      // Check if engagement features are enabled
      const features = window.BLOG_CONFIG?.FEATURES || {};
      
      // Track view (once per session per post)
      if (features.viewTracking !== false) {
        await this.trackView();
      }
      
      // Load and display metrics
      if (features.viewTracking !== false || features.likes !== false) {
        await this.loadMetrics();
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Failed to initialize blog engagement:', error);
    }
  }
  
  /**
   * Track a page view
   */
  async trackView() {
    // Only track once per session
    if (this.viewTracked || this.hasViewedInSession()) {
      return;
    }
    
    try {
      const response = await this.apiCall('POST', {
        action: 'trackView',
        postId: this.postId,
        sessionId: this.sessionId
      });
      
      if (response.data.counted) {
        this.viewTracked = true;
        this.markViewedInSession();
        this.updateViewCounter(response.data.totalViews);
      }
      
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }
  
  /**
   * Handle like button click
   */
  async handleLike() {
    if (this.hasLiked) {
      this.showNotification('You already liked this post!', 'info');
      return;
    }
    
    // Optimistic UI update
    this.setLikeButtonState(true);
    
    try {
      const response = await this.apiCall('POST', {
        action: 'incrementLike',
        postId: this.postId
      });
      
      if (response.data.success) {
        this.hasLiked = true;
        localStorage.setItem(`liked_${this.postId}`, 'true');
        this.updateLikeCounter(response.data.likes);
        this.showNotification('Thanks for liking this post!', 'success');
        
        // Track in Google Analytics as Key Event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'blog_post_liked', {
            'event_category': 'engagement',
            'event_label': 'like_button',
            'post_id': this.postId,
            'post_title': document.title.replace(' | Webglo Blog', ''),
            'value': 1
          });
        }
      } else {
        // Already liked
        this.showNotification('You already liked this post!', 'info');
      }
      
    } catch (error) {
      console.error('Failed to increment like:', error);
      this.setLikeButtonState(false); // Revert optimistic update
      this.showNotification('Failed to like post. Please try again.', 'error');
    }
  }
  
  /**
   * Handle survey response
   */
  async handleSurvey(response) {
    if (this.hasSurveyed) {
      this.showNotification('You already responded to this survey!', 'info');
      return;
    }
    
    // Disable survey buttons
    this.setSurveyButtonsState(true);
    
    try {
      const result = await this.apiCall('POST', {
        action: 'submitSurvey',
        postId: this.postId,
        response: response
      });
      
      if (result.data.success) {
        this.hasSurveyed = true;
        localStorage.setItem(`surveyed_${this.postId}`, 'true');
        this.showSurveyThankYou(response);
        this.showNotification('Thank you for your feedback!', 'success');
        
        // Track in Google Analytics as Key Event
        if (typeof gtag !== 'undefined') {
          const eventName = response === 'helpful' ? 'blog_survey_helpful' : 'blog_survey_not_helpful';
          gtag('event', eventName, {
            'event_category': 'engagement',
            'event_label': 'usefulness_survey',
            'post_id': this.postId,
            'post_title': document.title.replace(' | Webglo Blog', ''),
            'survey_response': response,
            'value': response === 'helpful' ? 1 : 0
          });
        }
      } else {
        this.showNotification('You already responded to this survey!', 'info');
      }
      
    } catch (error) {
      console.error('Failed to submit survey:', error);
      this.setSurveyButtonsState(false);
      this.showNotification('Failed to submit survey. Please try again.', 'error');
    }
  }
  
  /**
   * Render survey widget HTML
   */
  renderSurvey() {
    if (this.hasSurveyed) {
      return `
        <div class="survey-container bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div class="text-center">
            <span class="text-4xl mb-3 block">✅</span>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
            <p class="text-gray-600">Your response helps us create better content.</p>
          </div>
        </div>
      `;
    }
    
    return `
      <div id="survey-container" class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Was this article helpful?</h3>
          <p class="text-gray-600 text-sm">Your feedback helps us improve our content.</p>
        </div>
        
        <div class="flex justify-center gap-4">
          <button id="survey-helpful" class="survey-button flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            Yes, helpful!
          </button>
          
          <button id="survey-not-helpful" class="survey-button flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            Not helpful
          </button>
        </div>
        
        <div id="survey-stats" class="mt-4 text-center text-sm text-gray-500">
          <!-- Will be populated with stats after voting -->
        </div>
      </div>
    `;
  }
  
  /**
   * Render like button widget HTML
   */
  renderLikeButton() {
    const likedClass = this.hasLiked ? 'liked bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300';
    const disabled = this.hasLiked ? 'disabled' : '';
    
    return `
      <div class="like-widget flex items-center gap-3">
        <button id="like-button" class="flex items-center gap-2 px-4 py-2 border-2 ${likedClass} rounded-lg hover:shadow-md transition-all duration-200 font-semibold ${disabled}">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <span id="like-count">0</span>
        </button>
        <span class="text-sm text-gray-600">
          ${this.hasLiked ? 'You liked this!' : 'Found this useful?'}
        </span>
      </div>
    `;
  }
  
  /**
   * Load and display all metrics
   */
  async loadMetrics() {
    try {
      const metrics = await this.getMetrics(this.postId);
      
      // Update UI with metrics
      this.updateViewCounter(metrics.views);
      this.updateLikeCounter(metrics.likes);
      this.updateSurveyDisplay(metrics.survey);
      
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }
  
  /**
   * Get metrics for a post
   */
  async getMetrics(postId) {
    const cacheKey = `metrics_${postId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    
    try {
      const response = await this.apiCall('GET', { action: 'getMetrics', postId });
      const metrics = response.data;
      
      this.cache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });
      
      return metrics;
      
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return { views: 0, likes: 0, survey: { helpful: 0, notHelpful: 0, total: 0 } };
    }
  }
  
  /**
   * Get popular posts
   */
  async getPopularPosts(limit = 5) {
    try {
      const response = await this.apiCall('GET', { action: 'getPopularPosts', limit });
      return response.data;
    } catch (error) {
      console.error('Failed to get popular posts:', error);
      return [];
    }
  }
  
  // ========================================================================
  // UI UPDATE METHODS
  // ========================================================================
  
  updateViewCounter(count) {
    const counter = document.getElementById('view-count');
    if (counter) {
      counter.textContent = this.formatNumber(count);
    }
  }
  
  updateLikeCounter(count) {
    const counter = document.getElementById('like-count');
    if (counter) {
      counter.textContent = this.formatNumber(count);
    }
  }
  
  updateSurveyDisplay(survey) {
    const percentage = document.getElementById('helpful-percentage');
    if (percentage && survey.total > 0) {
      percentage.textContent = `${survey.helpfulPercentage}%`;
    }
    
    const count = document.getElementById('survey-count');
    if (count) {
      count.textContent = `${survey.total} ${survey.total === 1 ? 'response' : 'responses'}`;
    }
  }
  
  setLikeButtonState(liked) {
    const button = document.getElementById('like-button');
    if (button) {
      if (liked) {
        button.classList.add('liked');
        button.disabled = true;
      } else {
        button.classList.remove('liked');
        button.disabled = false;
      }
    }
  }
  
  setSurveyButtonsState(disabled) {
    const buttons = document.querySelectorAll('.survey-button');
    buttons.forEach(btn => btn.disabled = disabled);
  }
  
  showSurveyThankYou(response) {
    const container = document.getElementById('survey-container');
    if (container) {
      container.innerHTML = `
        <div class="survey-thank-you">
          <span class="thank-you-icon">${response === 'helpful' ? '👍' : '👎'}</span>
          <p>Thank you for your feedback!</p>
        </div>
      `;
    }
  }
  
  showNotification(message, type = 'info') {
    // Simple toast notification
    const notification = document.createElement('div');
    notification.className = `blog-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // ========================================================================
  // EVENT LISTENERS
  // ========================================================================
  
  setupEventListeners() {
    // Like button
    const likeButton = document.getElementById('like-button');
    if (likeButton) {
      likeButton.addEventListener('click', () => this.handleLike());
      
      // Set initial state
      if (this.hasLiked) {
        this.setLikeButtonState(true);
      }
    }
    
    // Survey buttons
    const helpfulButton = document.getElementById('survey-helpful');
    const notHelpfulButton = document.getElementById('survey-not-helpful');
    
    if (helpfulButton) {
      helpfulButton.addEventListener('click', () => this.handleSurvey('helpful'));
    }
    
    if (notHelpfulButton) {
      notHelpfulButton.addEventListener('click', () => this.handleSurvey('not-helpful'));
    }
    
    // Disable survey if already responded
    if (this.hasSurveyed) {
      this.setSurveyButtonsState(true);
    }
  }
  
  // ========================================================================
  // HELPER METHODS
  // ========================================================================
  
  async apiCall(method, data) {
    const url = method === 'GET' 
      ? `${this.apiUrl}?${new URLSearchParams(data)}`
      : this.apiUrl;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (method === 'POST') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || window.location.pathname.split('/').pop().replace('.html', '');
  }
  
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('blog_session_id');
    
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('blog_session_id', sessionId);
    }
    
    return sessionId;
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  checkIfLiked() {
    return localStorage.getItem(`liked_${this.postId}`) === 'true';
  }
  
  checkIfSurveyed() {
    return localStorage.getItem(`surveyed_${this.postId}`) === 'true';
  }
  
  hasViewedInSession() {
    return sessionStorage.getItem(`viewed_${this.postId}`) === 'true';
  }
  
  markViewedInSession() {
    sessionStorage.setItem(`viewed_${this.postId}`, 'true');
  }
  
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// ========================================================================
// GLOBAL INITIALIZATION
// ========================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogEngagement);
} else {
  initBlogEngagement();
}

function initBlogEngagement() {
  // Check if engagement features are enabled
  const features = window.BLOG_CONFIG?.FEATURES || {};
  const engagementEnabled = features.viewTracking || features.likes || features.survey;
  
  if (!engagementEnabled) {
    console.log('Blog engagement features disabled in config');
    return;
  }
  
  // Check if we're on a blog post page
  const isPostPage = document.querySelector('[data-blog-post]') || 
                     document.querySelector('.blog-post-content') ||
                     window.location.pathname.includes('/post.html');
  
  if (isPostPage) {
    window.blogEngagement = new BlogEngagement({
      apiUrl: window.BLOG_CONFIG?.ENGAGEMENT_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
    });
  }
}

// Expose BlogEngagement class globally
window.BlogEngagement = BlogEngagement;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogEngagement;
}
