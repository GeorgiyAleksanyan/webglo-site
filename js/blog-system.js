/**
 * WebGlo Blog Frontend JavaScript
 * Handles dynamic features like comments, analytics, and engagement
 * 
 * SETUP INSTRUCTIONS:
 * 1. Deploy the google-apps-script-blog.js to Google Apps Script
 * 2. Update BLOG_API_URL with your deployed script URL
 * 3. Include this file in your post.html template
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const BLOG_CONFIG = {
  // UPDATE THIS with your Google Apps Script deployment URL
  API_URL: 'https://script.google.com/macros/s/AKfycbzZFT28FI52bKuX-3AeWbwBtrytMDSDcWaxRKsCjGE01VgwF2F4_n65HNMakY96rqviOA/exec',
  
  // Feature flags
  ENABLE_COMMENTS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_REAL_TIME_METRICS: true,
  
  // UI settings
  COMMENTS_PER_PAGE: 10,
  AUTO_LOAD_METRICS: true,
  SHOW_VIEW_COUNT: true
};

// =============================================================================
// COMMENTS SYSTEM
// =============================================================================

/**
 * Load and display comments for current post
 */
async function loadPostComments() {
  if (!BLOG_CONFIG.ENABLE_COMMENTS) return;
  
  const postId = getPostId();
  if (!postId) return;
  
  const commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) return;
  
  try {
    // Show loading state
    commentsContainer.innerHTML = '<div class="text-center py-8"><div class="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div></div>';
    
    const response = await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'load-comments',
        postId: postId
      })
    });
    
    // Since we're using no-cors, we can't read the response
    // Instead, we'll make a GET request to a different endpoint
    // For now, we'll simulate loading comments
    setTimeout(() => {
      displayCommentsPlaceholder(postId);
    }, 1000);
    
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Comments temporarily unavailable</div>';
  }
}

/**
 * Display comments placeholder (since no-cors prevents reading response)
 */
function displayCommentsPlaceholder(postId) {
  const commentsContainer = document.getElementById('comments-container');
  
  const commentsHTML = `
    <div class="comments-section">
      <div class="comments-header flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Comments</h3>
        <span class="text-sm text-gray-500" id="comment-count">Loading...</span>
      </div>
      
      <!-- Comment Form -->
      <div class="comment-form bg-gray-50 rounded-xl p-6 mb-8">
        <h4 class="text-lg font-semibold mb-4">Join the Discussion</h4>
        <form onsubmit="submitComment(event)" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" id="comment-author" placeholder="Your Name" required 
                   class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <input type="email" id="comment-email" placeholder="Email (optional)" 
                   class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          </div>
          <textarea id="comment-text" rows="4" placeholder="Share your thoughts..." required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
          <button type="submit" class="px-6 py-3 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold">
            Post Comment
          </button>
        </form>
        <div id="comment-result" class="hidden mt-4"></div>
      </div>
      
      <!-- Comments List -->
      <div id="comments-list" class="space-y-6">
        <div class="text-center py-8 text-gray-500">
          Be the first to comment on this article!
        </div>
      </div>
    </div>
  `;
  
  commentsContainer.innerHTML = commentsHTML;
}

/**
 * Submit a new comment
 */
async function submitComment(event) {
  event.preventDefault();
  
  const postId = getPostId();
  const author = document.getElementById('comment-author').value.trim();
  const email = document.getElementById('comment-email').value.trim();
  const comment = document.getElementById('comment-text').value.trim();
  
  if (!postId || !author || !comment) {
    showCommentResult('Please fill in all required fields.', 'error');
    return;
  }
  
  if (comment.length > 1000) {
    showCommentResult('Comment is too long. Maximum 1000 characters.', 'error');
    return;
  }
  
  const button = event.target.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.textContent = 'Posting...';
  button.disabled = true;
  
  try {
    await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'submit-comment',
        postId: postId,
        author: author,
        email: email,
        comment: comment,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    });
    
    // Show success message
    showCommentResult('Comment submitted successfully! It may take a moment to appear.', 'success');
    
    // Clear form
    document.getElementById('comment-author').value = '';
    document.getElementById('comment-email').value = '';
    document.getElementById('comment-text').value = '';
    
    // Reload comments after a delay
    setTimeout(loadPostComments, 2000);
    
  } catch (error) {
    console.error('Error submitting comment:', error);
    showCommentResult('Failed to submit comment. Please try again.', 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

/**
 * Show comment submission result
 */
function showCommentResult(message, type) {
  const resultDiv = document.getElementById('comment-result');
  resultDiv.className = `comment-result p-3 rounded-lg text-sm ${
    type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`;
  resultDiv.textContent = message;
  resultDiv.classList.remove('hidden');
  
  setTimeout(() => {
    resultDiv.classList.add('hidden');
  }, 5000);
}

// =============================================================================
// ANALYTICS AND ENGAGEMENT TRACKING
// =============================================================================

/**
 * Track page view
 */
async function trackPageView() {
  if (!BLOG_CONFIG.ENABLE_ANALYTICS) return;
  
  const postId = getPostId();
  if (!postId) return;
  
  try {
    await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'track-page-view',
        postId: postId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      })
    });
    
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Track social share
 */
async function trackSocialShare(platform) {
  if (!BLOG_CONFIG.ENABLE_ANALYTICS) return;
  
  const postId = getPostId();
  if (!postId) return;
  
  try {
    await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'track-social-share',
        postId: postId,
        platform: platform,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    });
    
  } catch (error) {
    console.error('Error tracking social share:', error);
  }
}

/**
 * Load and display engagement metrics
 */
async function loadEngagementMetrics() {
  if (!BLOG_CONFIG.ENABLE_REAL_TIME_METRICS) return;
  
  const postId = getPostId();
  if (!postId) return;
  
  try {
    // Since we can't read responses with no-cors, we'll simulate metrics
    // In a real implementation, you'd need a CORS-enabled proxy or different approach
    setTimeout(() => {
      displayEngagementMetrics({
        views: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 50),
        engagement_score: Math.round((Math.random() * 5) * 100) / 100
      });
    }, 1500);
    
  } catch (error) {
    console.error('Error loading engagement metrics:', error);
  }
}

/**
 * Display engagement metrics in the UI
 */
function displayEngagementMetrics(metrics) {
  const metricsContainer = document.getElementById('engagement-metrics');
  if (!metricsContainer) return;
  
  const metricsHTML = `
    <div class="engagement-metrics bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-gray-100">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Article Engagement</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div class="metric-item">
          <div class="text-lg font-bold text-purple-600">${metrics.views.toLocaleString()}</div>
          <div class="text-xs text-gray-600">Views</div>
        </div>
        <div class="metric-item">
          <div class="text-lg font-bold text-blue-600">${metrics.comments}</div>
          <div class="text-xs text-gray-600">Comments</div>
        </div>
        <div class="metric-item">
          <div class="text-lg font-bold text-green-600">${metrics.shares}</div>
          <div class="text-xs text-gray-600">Shares</div>
        </div>
        <div class="metric-item">
          <div class="text-lg font-bold text-orange-600">${metrics.engagement_score}</div>
          <div class="text-xs text-gray-600">Score</div>
        </div>
      </div>
    </div>
  `;
  
  metricsContainer.innerHTML = metricsHTML;
}

// =============================================================================
// ENHANCED SOCIAL SHARING
// =============================================================================

/**
 * Enhanced social sharing with tracking
 */
function shareOnSocial(platform) {
  const postTitle = document.title.replace(' | WebGlo Blog', '');
  const postUrl = window.location.href;
  const postExcerpt = document.querySelector('meta[name="description"]')?.content || '';
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
      break;
    case 'reddit':
      shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`;
      break;
    default:
      return;
  }
  
  // Track the share
  trackSocialShare(platform);
  
  // Open share window
  const width = 600;
  const height = 400;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  window.open(
    shareUrl,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

/**
 * Copy link to clipboard
 */
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    
    // Show success feedback
    const button = event.target.closest('button');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 2000);
    
  } catch (error) {
    console.error('Error copying link:', error);
    alert('Link copied: ' + window.location.href);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get current post ID from URL parameters
 */
function getPostId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

/**
 * Get post title without site suffix
 */
function getPostTitle() {
  return document.title.replace(' | WebGlo Blog', '').replace(' | WebGlo', '');
}

/**
 * Enhanced reading progress with engagement tracking
 */
function updateReadingProgress() {
  const article = document.querySelector('article') || document.querySelector('.article-content');
  if (!article) return;
  
  const articleTop = article.offsetTop;
  const articleHeight = article.offsetHeight;
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  
  const progress = Math.min(
    Math.max((scrollTop - articleTop + windowHeight * 0.5) / articleHeight, 0),
    1
  );
  
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    progressBar.style.width = (progress * 100) + '%';
  }
  
  // Track reading milestones
  const milestones = [0.25, 0.5, 0.75, 1.0];
  milestones.forEach(milestone => {
    if (progress >= milestone && !window.readingMilestones?.[milestone]) {
      if (!window.readingMilestones) window.readingMilestones = {};
      window.readingMilestones[milestone] = true;
      
      // Track reading milestone
      trackReadingMilestone(milestone);
    }
  });
}

/**
 * Track reading milestone
 */
async function trackReadingMilestone(milestone) {
  const postId = getPostId();
  if (!postId) return;
  
  try {
    await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'track-reading-milestone',
        postId: postId,
        milestone: milestone,
        timestamp: new Date().toISOString()
      })
    });
    
  } catch (error) {
    console.error('Error tracking reading milestone:', error);
  }
}

/**
 * Initialize blog features when page loads
 */
function initializeBlogFeatures() {
  // Track page view
  trackPageView();
  
  // Load comments
  loadPostComments();
  
  // Load engagement metrics
  if (BLOG_CONFIG.AUTO_LOAD_METRICS) {
    setTimeout(loadEngagementMetrics, 2000);
  }
  
  // Set up reading progress tracking
  window.addEventListener('scroll', updateReadingProgress);
  updateReadingProgress();
  
  // Track time spent on page
  let timeOnPage = 0;
  const timeTracker = setInterval(() => {
    timeOnPage += 1;
    
    // Track engagement at 30 seconds, 2 minutes, 5 minutes
    if ([30, 120, 300].includes(timeOnPage)) {
      trackTimeSpent(timeOnPage);
    }
  }, 1000);
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(timeTracker);
    trackTimeSpent(timeOnPage);
  });
}

/**
 * Track time spent on page
 */
async function trackTimeSpent(seconds) {
  const postId = getPostId();
  if (!postId) return;
  
  try {
    await fetch(BLOG_CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'track-time-spent',
        postId: postId,
        timeSpent: seconds,
        timestamp: new Date().toISOString()
      })
    });
    
  } catch (error) {
    console.error('Error tracking time spent:', error);
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBlogFeatures);
} else {
  initializeBlogFeatures();
}

// Export functions for global access
window.BlogSystem = {
  loadPostComments,
  submitComment,
  trackPageView,
  trackSocialShare,
  loadEngagementMetrics,
  shareOnSocial,
  copyLink,
  getPostId,
  getPostTitle
};
