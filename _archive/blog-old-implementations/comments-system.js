// WebGlo Blog Comments System - Frontend
// Secure comment handling with spam protection and real-time updates

class WebGloComments {
  constructor(postId, options = {}) {
    this.postId = postId;
    this.apiUrl = options.apiUrl || 'https://script.google.com/macros/s/YOUR_COMMENTS_SCRIPT_ID/exec';
    this.container = options.container || '#comments-container';
    this.maxNestingLevel = options.maxNestingLevel || 3;
    this.autoRefresh = options.autoRefresh || false;
    this.refreshInterval = options.refreshInterval || 30000; // 30 seconds
    
    this.comments = [];
    this.loading = false;
    this.submitting = false;
    
    this.init();
  }

  async init() {
    try {
      // Create comment container if it doesn't exist
      this.ensureContainer();
      
      // Load existing comments
      await this.loadComments();
      
      // Render the comment system
      this.render();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup auto-refresh if enabled
      if (this.autoRefresh) {
        this.setupAutoRefresh();
      }
      
      console.log('✅ Comments system initialized for post:', this.postId);
      
    } catch (error) {
      console.error('Failed to initialize comments system:', error);
      this.renderError('Failed to load comments system');
    }
  }

  // ===== COMMENT LOADING =====

  async loadComments() {
    if (this.loading) return;
    
    this.loading = true;
    this.showLoadingState();
    
    try {
      const response = await fetch(`${this.apiUrl}?path=comments&postId=${encodeURIComponent(this.postId)}&origin=${encodeURIComponent(window.location.origin)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.comments = data.comments || [];
        console.log(`Loaded ${this.comments.length} comments`);
      } else {
        throw new Error(data.error || 'Failed to load comments');
      }
      
    } catch (error) {
      console.error('Error loading comments:', error);
      this.comments = [];
    } finally {
      this.loading = false;
    }
  }

  // ===== COMMENT SUBMISSION =====

  async submitComment(formData, parentId = null) {
    if (this.submitting) return false;
    
    this.submitting = true;
    
    try {
      // Validate form data
      const validation = this.validateCommentData(formData);
      if (!validation.valid) {
        this.showMessage(validation.error, 'error');
        return false;
      }
      
      // Prepare comment data
      const commentData = {
        postId: this.postId,
        author: formData.author.trim(),
        email: formData.email.trim(),
        content: formData.content.trim(),
        parentId: parentId,
        honeypot: formData.website || '' // Spam protection
      };
      
      // Show submitting state
      this.showSubmittingState();
      
      // Submit to backend
      const response = await fetch(`${this.apiUrl}?path=comments&origin=${encodeURIComponent(window.location.origin)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.showMessage(result.message, 'success');
        
        // Clear form
        this.clearCommentForm();
        
        // Reload comments if no moderation needed
        if (!result.needsModeration) {
          await this.loadComments();
          this.render();
        }
        
        // Track analytics
        this.trackCommentSubmission();
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to submit comment');
      }
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      this.showMessage(error.message || 'Failed to submit comment', 'error');
      return false;
    } finally {
      this.submitting = false;
      this.hideSubmittingState();
    }
  }

  // ===== RENDERING =====

  render() {
    const container = document.querySelector(this.container);
    if (!container) return;
    
    container.innerHTML = this.generateCommentsHTML();
    this.setupFormHandlers();
  }

  generateCommentsHTML() {
    const commentsCount = this.getTotalCommentsCount();
    
    return `
      <div class="comments-system bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
        <!-- Comments Header -->
        <div class="comments-header mb-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <svg class="w-6 h-6 text-[#df00ff] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            ${commentsCount === 0 ? 'Be the first to comment' : `${commentsCount} Comment${commentsCount !== 1 ? 's' : ''}`}
          </h3>
          <p class="text-gray-600">Share your thoughts and join the discussion!</p>
        </div>

        <!-- Comment Form -->
        ${this.generateCommentFormHTML()}

        <!-- Comments List -->
        <div class="comments-list mt-8">
          ${this.comments.length > 0 ? this.generateCommentsListHTML() : this.generateEmptyStateHTML()}
        </div>

        <!-- Messages Container -->
        <div id="comments-messages" class="mt-4"></div>
      </div>
    `;
  }

  generateCommentFormHTML(parentId = null, level = 0) {
    const formId = parentId ? `reply-form-${parentId}` : 'main-comment-form';
    const isReply = parentId !== null;
    
    return `
      <div class="comment-form ${isReply ? 'reply-form border-l-4 border-[#df00ff] pl-6 ml-8 mt-4' : 'main-form border-2 border-gray-200 rounded-xl p-6'}" id="${formId}">
        <form class="comment-form-element" data-parent-id="${parentId || ''}">
          ${isReply ? `<h4 class="font-semibold text-gray-800 mb-4">Reply to comment</h4>` : ''}
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="form-group">
              <label for="author-${formId}" class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input 
                type="text" 
                id="author-${formId}"
                name="author" 
                required 
                maxlength="50"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#df00ff] focus:border-[#df00ff] transition-colors"
                placeholder="Your name"
              >
            </div>
            <div class="form-group">
              <label for="email-${formId}" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input 
                type="email" 
                id="email-${formId}"
                name="email" 
                required 
                maxlength="100"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#df00ff] focus:border-[#df00ff] transition-colors"
                placeholder="your@email.com"
              >
              <p class="text-xs text-gray-500 mt-1">Your email won't be published</p>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label for="content-${formId}" class="block text-sm font-medium text-gray-700 mb-2">Comment *</label>
            <textarea 
              id="content-${formId}"
              name="content" 
              required 
              maxlength="2000"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#df00ff] focus:border-[#df00ff] transition-colors resize-vertical"
              placeholder="Share your thoughts..."
            ></textarea>
            <div class="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Be respectful and constructive</span>
              <span class="char-counter">0/2000</span>
            </div>
          </div>

          <!-- Honeypot field for spam protection -->
          <input type="text" name="website" style="display: none;" tabindex="-1" autocomplete="off">
          
          <div class="form-actions flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              class="submit-btn bg-gradient-to-r from-[#df00ff] to-[#0cead9] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span class="btn-text">${isReply ? 'Post Reply' : 'Post Comment'}</span>
              <span class="btn-loading hidden">
                <svg class="animate-spin w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            </button>
            ${isReply ? `
              <button 
                type="button" 
                class="cancel-reply-btn text-gray-600 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            ` : ''}
          </div>
        </form>
      </div>
    `;
  }

  generateCommentsListHTML() {
    if (this.comments.length === 0) {
      return this.generateEmptyStateHTML();
    }
    
    return `
      <div class="comments-container">
        ${this.comments.map(comment => this.generateCommentHTML(comment, 0)).join('')}
      </div>
    `;
  }

  generateCommentHTML(comment, level = 0) {
    const isNested = level > 0;
    const canReply = level < this.maxNestingLevel;
    const commentDate = new Date(comment.timestamp);
    const timeAgo = this.formatTimeAgo(commentDate);
    
    return `
      <div class="comment ${isNested ? 'nested-comment ml-8 border-l-2 border-gray-200 pl-6' : 'top-level-comment'} mb-6" data-comment-id="${comment.id}">
        <div class="comment-content bg-gray-50 rounded-xl p-6">
          <!-- Comment Header -->
          <div class="comment-header flex items-start justify-between mb-4">
            <div class="comment-author-info flex items-center">
              <div class="avatar w-10 h-10 bg-gradient-to-r from-[#df00ff] to-[#0cead9] rounded-full flex items-center justify-center text-white font-bold">
                ${comment.author.charAt(0).toUpperCase()}
              </div>
              <div class="ml-3">
                <div class="author-name font-semibold text-gray-900">${this.escapeHtml(comment.author)}</div>
                <div class="comment-meta text-sm text-gray-500" title="${commentDate.toLocaleString()}">
                  ${timeAgo}
                </div>
              </div>
            </div>
            <div class="comment-actions flex items-center gap-2">
              <button class="like-comment-btn text-gray-500 hover:text-red-500 transition-colors flex items-center" data-comment-id="${comment.id}">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span class="like-count">${comment.likes || 0}</span>
              </button>
            </div>
          </div>
          
          <!-- Comment Body -->
          <div class="comment-body">
            <div class="comment-text text-gray-800 leading-relaxed mb-4">
              ${this.formatCommentContent(comment.content)}
            </div>
            
            <!-- Comment Actions -->
            <div class="comment-footer flex items-center gap-4">
              ${canReply ? `
                <button class="reply-btn text-[#df00ff] hover:text-[#0cead9] text-sm font-medium transition-colors flex items-center" data-comment-id="${comment.id}">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                  </svg>
                  Reply
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Reply Form Container -->
        <div class="reply-form-container"></div>
        
        <!-- Nested Replies -->
        ${comment.replies && comment.replies.length > 0 ? `
          <div class="comment-replies mt-4">
            ${comment.replies.map(reply => this.generateCommentHTML(reply, level + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  generateEmptyStateHTML() {
    return `
      <div class="empty-comments text-center py-12">
        <div class="text-gray-400 text-lg mb-2">No comments yet</div>
        <p class="text-gray-500">Be the first to share your thoughts!</p>
      </div>
    `;
  }

  // ===== EVENT HANDLERS =====

  setupEventListeners() {
    // Main form submission
    this.setupFormHandlers();
    
    // Reply button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.reply-btn')) {
        e.preventDefault();
        const commentId = e.target.closest('.reply-btn').dataset.commentId;
        this.showReplyForm(commentId);
      }
      
      if (e.target.closest('.cancel-reply-btn')) {
        e.preventDefault();
        this.hideReplyForm(e.target.closest('.reply-form'));
      }
      
      if (e.target.closest('.like-comment-btn')) {
        e.preventDefault();
        const commentId = e.target.closest('.like-comment-btn').dataset.commentId;
        this.likeComment(commentId);
      }
    });
  }

  setupFormHandlers() {
    document.querySelectorAll('.comment-form-element').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const parentId = form.dataset.parentId || null;
        
        const commentData = {
          author: formData.get('author'),
          email: formData.get('email'),
          content: formData.get('content'),
          website: formData.get('website') // Honeypot
        };
        
        const success = await this.submitComment(commentData, parentId);
        
        if (success && parentId) {
          // Hide reply form after successful submission
          this.hideReplyForm(form.closest('.reply-form'));
        }
      });
    });
    
    // Character counter for textareas
    document.querySelectorAll('textarea[name="content"]').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const counter = e.target.closest('.form-group').querySelector('.char-counter');
        if (counter) {
          counter.textContent = `${e.target.value.length}/2000`;
        }
      });
    });
  }

  showReplyForm(commentId) {
    // Hide any existing reply forms
    document.querySelectorAll('.reply-form').forEach(form => {
      if (!form.id.includes(commentId)) {
        form.remove();
      }
    });
    
    const comment = document.querySelector(`[data-comment-id="${commentId}"]`);
    const replyContainer = comment.querySelector('.reply-form-container');
    
    if (replyContainer.querySelector('.reply-form')) {
      return; // Form already shown
    }
    
    replyContainer.innerHTML = this.generateCommentFormHTML(commentId, 1);
    this.setupFormHandlers();
    
    // Focus on the first input
    const firstInput = replyContainer.querySelector('input[name="author"]');
    if (firstInput) {
      firstInput.focus();
    }
  }

  hideReplyForm(replyForm) {
    if (replyForm) {
      replyForm.remove();
    }
  }

  // ===== UTILITY FUNCTIONS =====

  validateCommentData(data) {
    if (!data.author || data.author.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters long' };
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    
    if (!data.content || data.content.trim().length < 5) {
      return { valid: false, error: 'Comment must be at least 5 characters long' };
    }
    
    if (data.content.length > 2000) {
      return { valid: false, error: 'Comment is too long (maximum 2000 characters)' };
    }
    
    return { valid: true };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatCommentContent(content) {
    // Convert line breaks to <br> tags
    return this.escapeHtml(content)
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Basic bold formatting
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Basic italic formatting
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }

  getTotalCommentsCount() {
    let count = 0;
    
    const countReplies = (comments) => {
      comments.forEach(comment => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
          countReplies(comment.replies);
        }
      });
    };
    
    countReplies(this.comments);
    return count;
  }

  clearCommentForm() {
    const mainForm = document.querySelector('#main-comment-form form');
    if (mainForm) {
      mainForm.reset();
      const counter = mainForm.querySelector('.char-counter');
      if (counter) {
        counter.textContent = '0/2000';
      }
    }
  }

  showSubmittingState() {
    document.querySelectorAll('.submit-btn').forEach(btn => {
      btn.disabled = true;
      btn.querySelector('.btn-text').classList.add('hidden');
      btn.querySelector('.btn-loading').classList.remove('hidden');
    });
  }

  hideSubmittingState() {
    document.querySelectorAll('.submit-btn').forEach(btn => {
      btn.disabled = false;
      btn.querySelector('.btn-text').classList.remove('hidden');
      btn.querySelector('.btn-loading').classList.add('hidden');
    });
  }

  showLoadingState() {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = `
        <div class="comments-loading text-center py-12">
          <div class="inline-flex items-center">
            <svg class="animate-spin w-5 h-5 mr-3 text-[#df00ff]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading comments...
          </div>
        </div>
      `;
    }
  }

  showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('comments-messages');
    if (!messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message rounded-lg p-4 mb-4 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    messageEl.textContent = message;
    
    messagesContainer.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }

  renderError(message) {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = `
        <div class="comments-error text-center py-12">
          <div class="text-red-500 text-lg mb-2">Error loading comments</div>
          <p class="text-gray-500">${message}</p>
        </div>
      `;
    }
  }

  ensureContainer() {
    if (!document.querySelector(this.container)) {
      // Try to find a good place to insert the container
      const article = document.querySelector('article, main, .post-content');
      if (article) {
        const container = document.createElement('div');
        container.id = 'comments-container';
        article.appendChild(container);
        this.container = '#comments-container';
      }
    }
  }

  setupAutoRefresh() {
    setInterval(async () => {
      if (!this.loading && !this.submitting) {
        const oldCount = this.getTotalCommentsCount();
        await this.loadComments();
        const newCount = this.getTotalCommentsCount();
        
        if (newCount > oldCount) {
          this.render();
          this.showMessage('New comments have been added!', 'info');
        }
      }
    }, this.refreshInterval);
  }

  async likeComment(commentId) {
    // This would connect to the metrics API
    console.log(`Liked comment: ${commentId}`);
    // Implementation would be similar to blog post likes
  }

  trackCommentSubmission() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'comment_submit', {
        post_id: this.postId
      });
    }
  }
}

// Auto-initialize comments on blog post pages
document.addEventListener('DOMContentLoaded', () => {
  // Extract post ID from URL or page data
  const postId = extractPostIdFromPage();
  
  if (postId) {
    // Initialize comments system
    window.webgloComments = new WebGloComments(postId, {
      autoRefresh: true,
      refreshInterval: 60000 // 1 minute
    });
  }
});

function extractPostIdFromPage() {
  // Try various methods to get post ID
  
  // From meta tag
  const metaPostId = document.querySelector('meta[name="post-id"]');
  if (metaPostId) return metaPostId.content;
  
  // From URL pattern
  const urlMatch = window.location.pathname.match(/\/blog\/(.+)\.html/);
  if (urlMatch) return urlMatch[1];
  
  // From query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const queryPostId = urlParams.get('id');
  if (queryPostId) return queryPostId;
  
  // From page title or other indicators
  const titleElement = document.querySelector('h1[data-post-id]');
  if (titleElement) return titleElement.dataset.postId;
  
  return null;
}
