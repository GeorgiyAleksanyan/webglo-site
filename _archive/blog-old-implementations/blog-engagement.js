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
    this.apiUrl = config.apiUrl || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
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
      // Track view (once per session per post)
      await this.trackView();
      
      // Load and display metrics
      await this.loadMetrics();
      
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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogEngagement;
}
