/**
 * WebGlo Blog Engagement Tracking System
 * Google Apps Script Backend for GitHub Pages Blog
 * 
 * Handles:
 * - View counting per blog post
 * - Like/reaction tracking
 * - Post usefulness survey responses
 * - Engagement metrics aggregation
 * 
 * Deploy as Web App with "Anyone" access
 * Connects to Google Sheets for data persistence
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Google Sheets Configuration
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Set via Script Properties in production
  
  // Sheet Names
  SHEETS: {
    VIEWS: 'PostViews',
    LIKES: 'PostLikes',
    SURVEYS: 'PostSurveys',
    METRICS: 'EngagementMetrics'
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    VIEWS_PER_SESSION: 1, // Only count 1 view per session per post
    LIKES_PER_IP: 10, // Max likes from same IP
    SURVEYS_PER_IP: 1 // One survey response per IP per post
  },
  
  // CORS Settings
  ALLOWED_ORIGINS: [
    'https://webglo.org',
    'https://georgiyaleksanyan.github.io',
    'http://localhost:3000', // For testing
    'http://127.0.0.1:3000'
  ],
  
  // Cache Duration (milliseconds)
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// ============================================================================
// MAIN HANDLERS
// ============================================================================

/**
 * Handle GET requests - Retrieve metrics
 */
function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  try {
    const action = e.parameter.action;
    const postId = e.parameter.postId;
    
    if (!action) {
      return createResponse({ error: 'Missing action parameter' }, 400, headers);
    }
    
    let result;
    
    switch (action) {
      case 'getMetrics':
        if (!postId) {
          return createResponse({ error: 'Missing postId' }, 400, headers);
        }
        result = getPostMetrics(postId);
        break;
        
      case 'getAllMetrics':
        result = getAllMetrics();
        break;
        
      case 'getPopularPosts':
        const limit = parseInt(e.parameter.limit) || 5;
        result = getPopularPosts(limit);
        break;
        
      default:
        return createResponse({ error: 'Invalid action' }, 400, headers);
    }
    
    return createResponse({ success: true, data: result }, 200, headers);
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse({ error: error.toString() }, 500, headers);
  }
}

/**
 * Handle POST requests - Record engagement
 */
function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const postId = data.postId;
    
    if (!action || !postId) {
      return createResponse({ error: 'Missing required parameters' }, 400, headers);
    }
    
    // Get client info for rate limiting
    const clientIp = getClientIp(e);
    const sessionId = data.sessionId || generateSessionId();
    
    let result;
    
    switch (action) {
      case 'trackView':
        result = trackView(postId, clientIp, sessionId);
        break;
        
      case 'incrementLike':
        result = incrementLike(postId, clientIp);
        break;
        
      case 'submitSurvey':
        const response = data.response; // 'helpful' or 'not-helpful'
        if (!response || !['helpful', 'not-helpful'].includes(response)) {
          return createResponse({ error: 'Invalid survey response' }, 400, headers);
        }
        result = submitSurvey(postId, response, clientIp);
        break;
        
      default:
        return createResponse({ error: 'Invalid action' }, 400, headers);
    }
    
    return createResponse({ success: true, data: result }, 200, headers);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse({ error: error.toString() }, 500, headers);
  }
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Track a page view
 */
function trackView(postId, clientIp, sessionId) {
  const sheet = getSheet(CONFIG.SHEETS.VIEWS);
  const now = new Date();
  
  // Check if this session already viewed this post (prevent double counting)
  const recentViews = sheet.getDataRange().getValues();
  const sessionKey = `${sessionId}-${postId}`;
  
  for (let i = recentViews.length - 1; i >= Math.max(0, recentViews.length - 100); i--) {
    if (recentViews[i][3] === sessionKey) {
      const viewTime = new Date(recentViews[i][0]);
      const timeDiff = now - viewTime;
      
      // If same session viewed within 30 minutes, don't count
      if (timeDiff < 30 * 60 * 1000) {
        return { counted: false, reason: 'duplicate_session' };
      }
    }
  }
  
  // Record the view
  sheet.appendRow([
    now,
    postId,
    clientIp,
    sessionKey,
    'web'
  ]);
  
  // Update aggregated metrics
  updateMetrics(postId);
  
  return { 
    counted: true, 
    totalViews: getPostMetrics(postId).views 
  };
}

/**
 * Increment like counter for a post
 */
function incrementLike(postId, clientIp) {
  const sheet = getSheet(CONFIG.SHEETS.LIKES);
  const data = sheet.getDataRange().getValues();
  
  // Find existing post row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === postId) {
      const currentLikes = data[i][1] || 0;
      const likedIps = (data[i][2] || '').split(',').filter(ip => ip);
      
      // Check if this IP already liked
      if (likedIps.includes(clientIp)) {
        return { success: false, reason: 'already_liked', likes: currentLikes };
      }
      
      // Add like
      likedIps.push(clientIp);
      const newLikes = currentLikes + 1;
      
      sheet.getRange(i + 1, 2).setValue(newLikes);
      sheet.getRange(i + 1, 3).setValue(likedIps.join(','));
      sheet.getRange(i + 1, 4).setValue(new Date());
      
      updateMetrics(postId);
      
      return { success: true, likes: newLikes };
    }
  }
  
  // Post not found, create new row
  sheet.appendRow([
    postId,
    1, // likes
    clientIp, // liked IPs
    new Date() // last updated
  ]);
  
  updateMetrics(postId);
  
  return { success: true, likes: 1 };
}

/**
 * Submit survey response (helpful/not helpful)
 */
function submitSurvey(postId, response, clientIp) {
  const sheet = getSheet(CONFIG.SHEETS.SURVEYS);
  const data = sheet.getDataRange().getValues();
  
  // Check if this IP already submitted for this post
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === postId) {
      const respondedIps = (data[i][4] || '').split(',').filter(ip => ip);
      
      if (respondedIps.includes(clientIp)) {
        return { success: false, reason: 'already_responded' };
      }
      
      // Add response
      respondedIps.push(clientIp);
      const helpfulCount = data[i][1] || 0;
      const notHelpfulCount = data[i][2] || 0;
      
      if (response === 'helpful') {
        sheet.getRange(i + 1, 2).setValue(helpfulCount + 1);
      } else {
        sheet.getRange(i + 1, 3).setValue(notHelpfulCount + 1);
      }
      
      sheet.getRange(i + 1, 4).setValue(new Date());
      sheet.getRange(i + 1, 5).setValue(respondedIps.join(','));
      
      updateMetrics(postId);
      
      return { 
        success: true, 
        helpfulCount: response === 'helpful' ? helpfulCount + 1 : helpfulCount,
        notHelpfulCount: response === 'not-helpful' ? notHelpfulCount + 1 : notHelpfulCount
      };
    }
  }
  
  // Create new row
  sheet.appendRow([
    postId,
    response === 'helpful' ? 1 : 0,
    response === 'not-helpful' ? 1 : 0,
    new Date(),
    clientIp
  ]);
  
  updateMetrics(postId);
  
  return { success: true, helpfulCount: response === 'helpful' ? 1 : 0, notHelpfulCount: response === 'not-helpful' ? 1 : 0 };
}

/**
 * Get all metrics for a specific post
 */
function getPostMetrics(postId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `metrics_${postId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const metrics = {
    postId: postId,
    views: getViewCount(postId),
    likes: getLikeCount(postId),
    survey: getSurveyResults(postId),
    lastUpdated: new Date().toISOString()
  };
  
  cache.put(cacheKey, JSON.stringify(metrics), CONFIG.CACHE_DURATION / 1000);
  
  return metrics;
}

/**
 * Get metrics for all posts
 */
function getAllMetrics() {
  const metricsSheet = getSheet(CONFIG.SHEETS.METRICS);
  const data = metricsSheet.getDataRange().getValues();
  
  const metrics = [];
  
  for (let i = 1; i < data.length; i++) {
    metrics.push({
      postId: data[i][0],
      views: data[i][1] || 0,
      likes: data[i][2] || 0,
      helpfulVotes: data[i][3] || 0,
      notHelpfulVotes: data[i][4] || 0,
      engagementScore: data[i][5] || 0,
      lastUpdated: data[i][6]
    });
  }
  
  return metrics;
}

/**
 * Get popular posts based on engagement
 */
function getPopularPosts(limit = 5) {
  const allMetrics = getAllMetrics();
  
  // Sort by engagement score (views + likes*5 + helpful*10)
  allMetrics.sort((a, b) => b.engagementScore - a.engagementScore);
  
  return allMetrics.slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get view count for a post
 */
function getViewCount(postId) {
  const sheet = getSheet(CONFIG.SHEETS.VIEWS);
  const data = sheet.getDataRange().getValues();
  
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === postId) {
      count++;
    }
  }
  
  return count;
}

/**
 * Get like count for a post
 */
function getLikeCount(postId) {
  const sheet = getSheet(CONFIG.SHEETS.LIKES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === postId) {
      return data[i][1] || 0;
    }
  }
  
  return 0;
}

/**
 * Get survey results for a post
 */
function getSurveyResults(postId) {
  const sheet = getSheet(CONFIG.SHEETS.SURVEYS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === postId) {
      const helpful = data[i][1] || 0;
      const notHelpful = data[i][2] || 0;
      const total = helpful + notHelpful;
      
      return {
        helpful: helpful,
        notHelpful: notHelpful,
        total: total,
        helpfulPercentage: total > 0 ? Math.round((helpful / total) * 100) : 0
      };
    }
  }
  
  return { helpful: 0, notHelpful: 0, total: 0, helpfulPercentage: 0 };
}

/**
 * Update aggregated metrics for a post
 */
function updateMetrics(postId) {
  const metricsSheet = getSheet(CONFIG.SHEETS.METRICS);
  const data = metricsSheet.getDataRange().getValues();
  
  const views = getViewCount(postId);
  const likes = getLikeCount(postId);
  const survey = getSurveyResults(postId);
  
  // Calculate engagement score
  const engagementScore = views + (likes * 5) + (survey.helpful * 10);
  
  // Find existing row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === postId) {
      metricsSheet.getRange(i + 1, 2, 1, 6).setValues([[
        views,
        likes,
        survey.helpful,
        survey.notHelpful,
        engagementScore,
        new Date()
      ]]);
      return;
    }
  }
  
  // Create new row
  metricsSheet.appendRow([
    postId,
    views,
    likes,
    survey.helpful,
    survey.notHelpful,
    engagementScore,
    new Date()
  ]);
}

/**
 * Get or create a sheet
 */
function getSheet(sheetName) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.SPREADSHEET_ID;
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

/**
 * Initialize sheet headers
 */
function initializeSheet(sheet, sheetName) {
  switch (sheetName) {
    case CONFIG.SHEETS.VIEWS:
      sheet.appendRow(['Timestamp', 'PostId', 'ClientIP', 'SessionKey', 'Source']);
      break;
      
    case CONFIG.SHEETS.LIKES:
      sheet.appendRow(['PostId', 'Likes', 'LikedIPs', 'LastUpdated']);
      break;
      
    case CONFIG.SHEETS.SURVEYS:
      sheet.appendRow(['PostId', 'HelpfulCount', 'NotHelpfulCount', 'LastUpdated', 'RespondedIPs']);
      break;
      
    case CONFIG.SHEETS.METRICS:
      sheet.appendRow(['PostId', 'Views', 'Likes', 'HelpfulVotes', 'NotHelpfulVotes', 'EngagementScore', 'LastUpdated']);
      break;
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Get client IP (approximate, may be Google's IP in some cases)
 */
function getClientIp(e) {
  return e.parameter.userIp || 'unknown';
}

/**
 * Generate a session ID
 */
function generateSessionId() {
  return Utilities.getUuid();
}

/**
 * Create HTTP response
 */
function createResponse(data, statusCode = 200, headers = {}) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// INITIALIZATION & ADMIN FUNCTIONS
// ============================================================================

/**
 * Initialize the blog tracking system
 * Run this once to set up all sheets
 */
function initializeBlogSystem() {
  Logger.log('Initializing WebGlo Blog Engagement System...');
  
  // Create all sheets
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    getSheet(sheetName);
    Logger.log(`✓ Created sheet: ${sheetName}`);
  });
  
  Logger.log('✓ Blog system initialized successfully!');
  Logger.log('\nNext steps:');
  Logger.log('1. Deploy as Web App');
  Logger.log('2. Set Script Properties: SPREADSHEET_ID');
  Logger.log('3. Copy deployment URL to your frontend config');
}

/**
 * Get system stats (for admin dashboard)
 */
function getSystemStats() {
  const stats = {
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalSurveyResponses: 0,
    topPosts: getPopularPosts(5)
  };
  
  const metrics = getAllMetrics();
  
  stats.totalPosts = metrics.length;
  
  metrics.forEach(post => {
    stats.totalViews += post.views;
    stats.totalLikes += post.likes;
    stats.totalSurveyResponses += post.helpfulVotes + post.notHelpfulVotes;
  });
  
  return stats;
}
