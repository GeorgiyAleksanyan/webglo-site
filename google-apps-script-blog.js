/**
 * WebGlo Blog System - Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Apps Script project: https://script.google.com/
 * 2. Replace all code with this file
 * 3. Update the CONFIG section with your Google Sheets ID
 * 4. Deploy as web app with execute permissions: "Anyone"
 * 5. Copy the deployment URL to your blog JavaScript files
 * 
 * GOOGLE SHEETS SETUP:
 * The script will automatically create the following sheets if they don't exist:
 * - BlogComments: Stores all blog post comments
 * - BlogAnalytics: Stores engagement metrics
 * - BlogSubscriptions: Stores newsletter signups
 * - BlogFeedback: Stores article feedback
 * 
 * SECURITY NOTES:
 * - This script uses no-cors mode for GitHub Pages compatibility
 * - All inputs are sanitized to prevent XSS and injection attacks
 * - Rate limiting is handled by Google Apps Script's built-in protections
 */

// =============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================================================

const CONFIG = {
  // Create a new Google Sheet and paste its ID here
  BLOG_SHEET_ID: 'REPLACE_WITH_YOUR_GOOGLE_SHEETS_ID',
  
  // Email for notifications (optional)
  NOTIFICATION_EMAIL: 'your-email@example.com',
  
  // Your website URL for CORS validation
  WEBSITE_URL: 'https://webglo.org',
  
  // Comment moderation settings
  AUTO_APPROVE_COMMENTS: true, // Set to false for manual moderation
  MAX_COMMENT_LENGTH: 1000,
  
  // Analytics settings
  TRACK_PAGE_VIEWS: true,
  TRACK_ENGAGEMENT: true
};

// =============================================================================
// MAIN ENTRY POINTS
// =============================================================================

/**
 * Handle POST requests from the blog
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.type || data.action;
    
    Logger.log('Received request: ' + action);
    
    switch (action) {
      case 'submit-comment':
        return handleSubmitComment(data);
      case 'load-comments':
        return handleLoadComments(data);
      case 'track-page-view':
        return handlePageView(data);
      case 'load-engagement':
        return handleLoadEngagement(data);
      case 'newsletter-subscription':
        return handleNewsletterSubscription(data);
      case 'article-feedback':
        return handleArticleFeedback(data);
      case 'track-social-share':
        return handleSocialShare(data);
      default:
        return createResponse({
          success: false,
          error: 'Unknown action: ' + action
        });
    }
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Server error: ' + error.toString()
    });
  }
}

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
  return createResponse({
    success: true,
    message: 'WebGlo Blog API is running',
    timestamp: new Date().toISOString()
  });
}

// =============================================================================
// COMMENT SYSTEM
// =============================================================================

/**
 * Handle comment submission
 */
function handleSubmitComment(data) {
  try {
    // Validate required fields
    if (!data.postId || !data.author || !data.comment) {
      return createResponse({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Sanitize inputs
    const postId = sanitizeInput(data.postId);
    const author = sanitizeInput(data.author);
    const email = sanitizeInput(data.email || '');
    const comment = sanitizeInput(data.comment);
    
    // Validate comment length
    if (comment.length > CONFIG.MAX_COMMENT_LENGTH) {
      return createResponse({
        success: false,
        error: `Comment too long. Maximum ${CONFIG.MAX_COMMENT_LENGTH} characters.`
      });
    }
    
    // Get or create comments sheet
    const sheet = getOrCreateSheet('BlogComments', [
      'ID', 'PostID', 'Author', 'Email', 'Comment', 'Timestamp', 
      'Status', 'IP', 'UserAgent', 'Replies'
    ]);
    
    // Generate unique comment ID
    const commentId = Utilities.getUuid();
    const timestamp = new Date();
    const status = CONFIG.AUTO_APPROVE_COMMENTS ? 'approved' : 'pending';
    
    // Add comment to sheet
    sheet.appendRow([
      commentId,
      postId,
      author,
      email,
      comment,
      timestamp,
      status,
      '', // IP (not available in Apps Script)
      '', // UserAgent (not available in Apps Script)
      '' // Replies (for future threading)
    ]);
    
    // Send notification email if configured
    if (CONFIG.NOTIFICATION_EMAIL && !CONFIG.AUTO_APPROVE_COMMENTS) {
      sendCommentNotification(postId, author, comment);
    }
    
    return createResponse({
      success: true,
      message: CONFIG.AUTO_APPROVE_COMMENTS ? 
        'Comment posted successfully!' : 
        'Comment submitted for review.',
      commentId: commentId
    });
    
  } catch (error) {
    Logger.log('Error handling comment submission: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Failed to submit comment'
    });
  }
}

/**
 * Handle loading comments for a post
 */
function handleLoadComments(data) {
  try {
    if (!data.postId) {
      return createResponse({
        success: false,
        error: 'Post ID required'
      });
    }
    
    const sheet = getSheet('BlogComments');
    if (!sheet) {
      return createResponse({
        success: true,
        comments: []
      });
    }
    
    const comments = loadComments(data.postId);
    
    return createResponse({
      success: true,
      comments: comments,
      count: comments.length
    });
    
  } catch (error) {
    Logger.log('Error loading comments: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Failed to load comments'
    });
  }
}

/**
 * Load comments for a specific post
 */
function loadComments(postId) {
  const sheet = getSheet('BlogComments');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const comments = [];
  
  // Find column indices
  const postIdCol = headers.indexOf('PostID');
  const authorCol = headers.indexOf('Author');
  const commentCol = headers.indexOf('Comment');
  const timestampCol = headers.indexOf('Timestamp');
  const statusCol = headers.indexOf('Status');
  const idCol = headers.indexOf('ID');
  
  // Filter comments for this post
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (row[postIdCol] === postId && row[statusCol] === 'approved') {
      comments.push({
        id: row[idCol],
        author: row[authorCol],
        comment: row[commentCol],
        timestamp: row[timestampCol],
        date: formatDate(new Date(row[timestampCol]))
      });
    }
  }
  
  // Sort by timestamp (newest first)
  comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return comments;
}

// =============================================================================
// ANALYTICS SYSTEM
// =============================================================================

/**
 * Handle page view tracking
 */
function handlePageView(data) {
  try {
    if (!CONFIG.TRACK_PAGE_VIEWS || !data.postId) {
      return createResponse({ success: true });
    }
    
    const sheet = getOrCreateSheet('BlogAnalytics', [
      'PostID', 'Action', 'Timestamp', 'UserAgent', 'Referrer', 'URL'
    ]);
    
    sheet.appendRow([
      sanitizeInput(data.postId),
      'page_view',
      new Date(),
      sanitizeInput(data.userAgent || ''),
      sanitizeInput(data.referrer || ''),
      sanitizeInput(data.url || '')
    ]);
    
    return createResponse({ success: true });
    
  } catch (error) {
    Logger.log('Error tracking page view: ' + error.toString());
    return createResponse({ success: true }); // Fail silently for analytics
  }
}

/**
 * Handle loading engagement metrics
 */
function handleLoadEngagement(data) {
  try {
    if (!data.postId) {
      return createResponse({
        success: false,
        error: 'Post ID required'
      });
    }
    
    const metrics = calculateEngagementMetrics(data.postId);
    
    return createResponse({
      success: true,
      metrics: metrics
    });
    
  } catch (error) {
    Logger.log('Error loading engagement: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Failed to load engagement metrics'
    });
  }
}

/**
 * Calculate engagement metrics for a post
 */
function calculateEngagementMetrics(postId) {
  const analyticsSheet = getSheet('BlogAnalytics');
  const commentsSheet = getSheet('BlogComments');
  
  let views = 0;
  let shares = 0;
  let comments = 0;
  
  // Count page views
  if (analyticsSheet) {
    const data = analyticsSheet.getDataRange().getValues();
    const headers = data[0];
    const postIdCol = headers.indexOf('PostID');
    const actionCol = headers.indexOf('Action');
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[postIdCol] === postId) {
        if (row[actionCol] === 'page_view') views++;
        if (row[actionCol] === 'social_share') shares++;
      }
    }
  }
  
  // Count comments
  if (commentsSheet) {
    const data = commentsSheet.getDataRange().getValues();
    const headers = data[0];
    const postIdCol = headers.indexOf('PostID');
    const statusCol = headers.indexOf('Status');
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[postIdCol] === postId && row[statusCol] === 'approved') {
        comments++;
      }
    }
  }
  
  return {
    views: views,
    comments: comments,
    shares: shares,
    engagement_score: calculateEngagementScore(views, comments, shares)
  };
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(views, comments, shares) {
  if (views === 0) return 0;
  
  // Weighted engagement score
  const commentWeight = 10; // Comments are worth 10 points each
  const shareWeight = 5;    // Shares are worth 5 points each
  
  const totalEngagement = (comments * commentWeight) + (shares * shareWeight);
  return Math.round((totalEngagement / views) * 100) / 100;
}

// =============================================================================
// NEWSLETTER AND FEEDBACK
// =============================================================================

/**
 * Handle newsletter subscription
 */
function handleNewsletterSubscription(data) {
  try {
    if (!data.email) {
      return createResponse({
        success: false,
        error: 'Email required'
      });
    }
    
    const sheet = getOrCreateSheet('BlogSubscriptions', [
      'Email', 'Source', 'PostID', 'PostTitle', 'Timestamp', 'URL', 'Status'
    ]);
    
    // Check if email already exists
    if (isEmailSubscribed(data.email)) {
      return createResponse({
        success: true,
        message: 'Email already subscribed!'
      });
    }
    
    sheet.appendRow([
      sanitizeInput(data.email),
      sanitizeInput(data.source || 'blog'),
      sanitizeInput(data.postId || ''),
      sanitizeInput(data.postTitle || ''),
      new Date(),
      sanitizeInput(data.url || ''),
      'active'
    ]);
    
    return createResponse({
      success: true,
      message: 'Successfully subscribed!'
    });
    
  } catch (error) {
    Logger.log('Error handling newsletter subscription: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Subscription failed'
    });
  }
}

/**
 * Handle article feedback
 */
function handleArticleFeedback(data) {
  try {
    if (!data.postId || !data.feedback) {
      return createResponse({
        success: false,
        error: 'Post ID and feedback required'
      });
    }
    
    const sheet = getOrCreateSheet('BlogFeedback', [
      'PostID', 'PostTitle', 'Feedback', 'Timestamp', 'URL'
    ]);
    
    sheet.appendRow([
      sanitizeInput(data.postId),
      sanitizeInput(data.postTitle || ''),
      sanitizeInput(data.feedback),
      new Date(),
      sanitizeInput(data.url || '')
    ]);
    
    return createResponse({
      success: true,
      message: 'Thank you for your feedback!'
    });
    
  } catch (error) {
    Logger.log('Error handling feedback: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
}

/**
 * Handle social share tracking
 */
function handleSocialShare(data) {
  try {
    if (!CONFIG.TRACK_ENGAGEMENT || !data.postId || !data.platform) {
      return createResponse({ success: true });
    }
    
    const sheet = getOrCreateSheet('BlogAnalytics', [
      'PostID', 'Action', 'Timestamp', 'UserAgent', 'Referrer', 'URL', 'Platform'
    ]);
    
    sheet.appendRow([
      sanitizeInput(data.postId),
      'social_share',
      new Date(),
      sanitizeInput(data.userAgent || ''),
      sanitizeInput(data.referrer || ''),
      sanitizeInput(data.url || ''),
      sanitizeInput(data.platform)
    ]);
    
    return createResponse({ success: true });
    
  } catch (error) {
    Logger.log('Error tracking social share: ' + error.toString());
    return createResponse({ success: true }); // Fail silently for analytics
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get or create a sheet with specified headers
 */
function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.BLOG_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Add headers
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f1f3f4');
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, headers.length);
    }
    
    Logger.log('Created new sheet: ' + sheetName);
  }
  
  return sheet;
}

/**
 * Get existing sheet
 */
function getSheet(sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.BLOG_SHEET_ID);
    return spreadsheet.getSheetByName(sheetName);
  } catch (error) {
    Logger.log('Error getting sheet ' + sheetName + ': ' + error.toString());
    return null;
  }
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Check if email is already subscribed
 */
function isEmailSubscribed(email) {
  const sheet = getSheet('BlogSubscriptions');
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('Email');
  const statusCol = headers.indexOf('Status');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[emailCol] === email && row[statusCol] === 'active') {
      return true;
    }
  }
  
  return false;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Send comment notification email
 */
function sendCommentNotification(postId, author, comment) {
  try {
    const subject = `New Blog Comment on ${postId}`;
    const body = `
New comment awaiting moderation:

Post: ${postId}
Author: ${author}
Comment: ${comment}

Please review and approve/reject in your Google Sheet.
    `;
    
    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    Logger.log('Error sending notification email: ' + error.toString());
  }
}

/**
 * Create standardized response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// =============================================================================
// ADMIN FUNCTIONS (Call manually from script editor)
// =============================================================================

/**
 * Initialize all sheets with sample data (run once)
 */
function initializeBlogSystem() {
  Logger.log('Initializing WebGlo Blog System...');
  
  // Create all required sheets
  getOrCreateSheet('BlogComments', [
    'ID', 'PostID', 'Author', 'Email', 'Comment', 'Timestamp', 
    'Status', 'IP', 'UserAgent', 'Replies'
  ]);
  
  getOrCreateSheet('BlogAnalytics', [
    'PostID', 'Action', 'Timestamp', 'UserAgent', 'Referrer', 'URL', 'Platform'
  ]);
  
  getOrCreateSheet('BlogSubscriptions', [
    'Email', 'Source', 'PostID', 'PostTitle', 'Timestamp', 'URL', 'Status'
  ]);
  
  getOrCreateSheet('BlogFeedback', [
    'PostID', 'PostTitle', 'Feedback', 'Timestamp', 'URL'
  ]);
  
  Logger.log('Blog system initialized successfully!');
  Logger.log('Update CONFIG.BLOG_SHEET_ID with: ' + CONFIG.BLOG_SHEET_ID);
}

/**
 * Get system statistics (run manually for insights)
 */
function getSystemStats() {
  const stats = {
    totalComments: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalFeedback: 0
  };
  
  // Count comments
  const commentsSheet = getSheet('BlogComments');
  if (commentsSheet && commentsSheet.getLastRow() > 1) {
    stats.totalComments = commentsSheet.getLastRow() - 1;
  }
  
  // Count analytics entries
  const analyticsSheet = getSheet('BlogAnalytics');
  if (analyticsSheet && analyticsSheet.getLastRow() > 1) {
    const data = analyticsSheet.getDataRange().getValues();
    const headers = data[0];
    const actionCol = headers.indexOf('Action');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][actionCol] === 'page_view') {
        stats.totalViews++;
      }
    }
  }
  
  // Count subscribers
  const subscriptionsSheet = getSheet('BlogSubscriptions');
  if (subscriptionsSheet && subscriptionsSheet.getLastRow() > 1) {
    stats.totalSubscribers = subscriptionsSheet.getLastRow() - 1;
  }
  
  // Count feedback
  const feedbackSheet = getSheet('BlogFeedback');
  if (feedbackSheet && feedbackSheet.getLastRow() > 1) {
    stats.totalFeedback = feedbackSheet.getLastRow() - 1;
  }
  
  Logger.log('System Statistics:');
  Logger.log(JSON.stringify(stats, null, 2));
  
  return stats;
}
