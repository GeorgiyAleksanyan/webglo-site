/**
 * WebGlo Blog Automation - System Core & Setup
 * Version: 1.0 - GitHub Pages Edition
 * 
 * This is the central nervous system for the WebGlo blog automation.
 * It manages configuration, GitHub API integration, engagement tracking,
 * and provides shared utilities for all other modules.
 * 
 * ARCHITECTURE:
 * - GitHub Pages (static hosting)
 * - Google Sheets (content queue & analytics)
 * - Gemini AI (content generation)
 * - AdSense (monetization)
 * 
 * ZERO-COST OPERATION:
 * - All services use free tiers
 * - No paid APIs required
 * - 100% profit margin on ad revenue
 * 
 * @OnlyCurrentDoc false
 */

/**
 * OAuth Scopes Required (Apps Script will auto-detect these)
 * Manual declaration for Search Console API access
 */
// @ts-ignore
var OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/script.external_request',
  'https://www.googleapis.com/auth/webmasters.readonly'
];

// ============================================================================
// MASTER CONFIGURATION SERVICE
// ============================================================================

/**
 * Master configuration template. Values are stored in Script Properties.
 * To update: File > Project Properties > Script Properties
 */
const MASTER_CONFIG_ = {
  // GitHub Configuration
  GITHUB_OWNER: 'GeorgiyAleksanyan',
  GITHUB_REPO: 'webglo-site',
  GITHUB_BRANCH: 'main',
  GITHUB_TOKEN: '', // REQUIRED: Set in Script Properties (Personal Access Token)
  
  // Blog Paths (relative to repo root)
  BLOG_DATA_PATH: 'blog/data/posts.json',
  BLOG_HTML_DIR: 'blog/',
  BLOG_SCRIPTS_DIR: 'blog/scripts/',
  
  // Google Sheets Configuration
  SPREADSHEET_ID: '', // REQUIRED: Your spreadsheet ID
  QUEUE_SHEET: 'Blog Themes',
  ANALYTICS_SHEET: 'Blog Analytics',
  ENGAGEMENT_SHEET: 'Engagement Data',
  COMMENTS_SHEET: 'Comments',
  SURVEYS_SHEET: 'Usefulness Surveys',
  LOGS_SHEET: 'Logs',
  COMPETITORS_SHEET: 'Competitors',
  
  // Error Notification
  ERROR_EMAIL: 'info@webglo.org',
  
  // AI Configuration (Gemini)
  GEMINI_MODEL_PRO: 'gemini-2.0-flash-exp', // Using Flash for free tier
  GEMINI_MODEL_FLASH: 'gemini-2.0-flash-exp',
  GEMINI_API_KEY: '', // REQUIRED: Set in Script Properties
  
  // Content Generation Settings
  TARGET_WORD_COUNT_MIN: 2000,
  TARGET_WORD_COUNT_MAX: 3500,
  TARGET_WORD_COUNT_OPTIMAL: 2500,
  GEMINI_MAX_OUTPUT_TOKENS: 8000,
  GEMINI_TEMPERATURE: 0.8,
  
  // SERP API Configuration (FREE TIER with fallback)
  USE_SERP_ANALYSIS: true, // Toggle SERP features on/off
  SERPAPI_KEY: '', // OPTIONAL: SerpApi free tier (100 searches/month)
  SERPAPI_DAILY_LIMIT: 3, // Daily limit to spread 100/month quota
  USE_SERP_ANALYSIS_FOR_BRIEFS: true, // Use SERP insights in content briefs
  
  // Google Search Console (FREE - highly recommended)
  SEARCH_CONSOLE_SITE_URL: 'sc-domain:webglo.org', // Set to your verified property
  
  // Google Search Console (FREE - highly recommended)
  SEARCH_CONSOLE_SITE_URL: 'sc-domain:webglo.org', // Set to your verified property
  
  // Unsplash API (FREE - 50 requests/hour)
  UNSPLASH_ACCESS_KEY: '', // Get from https://unsplash.com/developers
  
  // AdSense Configuration
  ADSENSE_PUBLISHER_ID: 'pub-9128014602464663',
  ADSENSE_STRATEGY: 'AUTO_ADS', // or 'MANUAL_UNITS'
  ENABLE_AD_BLOCKER_DETECTION: true,
  
  // WebGlo Company Info
  COMPANY_NAME: 'WebGlo',
  COMPANY_PHONE: '(848) 207-4616',
  COMPANY_EMAIL: 'info@webglo.org',
  COMPANY_WEBSITE: 'webglo.org',
  BLOG_DOMAIN: 'webglo.org/blog',
  MAIN_WEBSITE: 'https://webglo.org',
  
  // Content Categories (matching existing blog structure)
  CONTENT_CATEGORIES: JSON.stringify({
    'web-development': 'Web Development',
    'seo': 'SEO & Analytics',
    'digital-marketing': 'Digital Marketing',
    'tutorials': 'Tutorials',
    'digital-strategy': 'Digital Strategy',
    'business-growth': 'Business Growth'
  }),
  
  // Service Areas (for local SEO when applicable)
  SERVICE_AREAS: JSON.stringify([
    'United States', 'Global', 'Remote Services'
  ]),
  
  // E-E-A-T Signals
  BUSINESS_CLAIMS: JSON.stringify({
    experience: 'Professional web development and digital marketing agency',
    expertise: 'Specialized in modern web technologies and conversion optimization',
    authoritativeness: 'Published guides and case studies on web development best practices',
    trustworthiness: 'Transparent pricing, proven results, and client testimonials'
  })
};

/**
 * Configuration Service - Centralized config management
 */
const ConfigService_ = {
  _config: null,
  
  get: function() {
    if (this._config) return this._config;
    
    const props = PropertiesService.getScriptProperties();
    const loadedConfig = {};
    
    for (const key in MASTER_CONFIG_) {
      const propValue = props.getProperty(key);
      if (propValue !== null) {
        // Try to parse JSON strings back to objects/arrays
        try {
          if (propValue.startsWith('{') || propValue.startsWith('[')) {
            loadedConfig[key] = JSON.parse(propValue);
          } else {
            loadedConfig[key] = propValue;
          }
        } catch (e) {
          loadedConfig[key] = propValue;
        }
      } else {
        // Use default from MASTER_CONFIG_
        loadedConfig[key] = MASTER_CONFIG_[key];
      }
    }
    
    this._config = loadedConfig;
    return this._config;
  },
  
  initialize: function() {
    const props = PropertiesService.getScriptProperties();
    const currentKeys = new Set(props.getKeys());
    const toSet = {};
    let newKeysCount = 0;
    
    for (const key in MASTER_CONFIG_) {
      if (!currentKeys.has(key)) {
        const value = MASTER_CONFIG_[key];
        toSet[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        newKeysCount++;
      }
    }
    
    if (newKeysCount > 0) {
      props.setProperties(toSet, false);
      SharedUtils_.logToSheet(`Initialized ${newKeysCount} config values`, 'INFO');
    }
  }
};

// ============================================================================
// SHARED UTILITIES
// ============================================================================

const SharedUtils_ = {
  /**
   * Logs to the Logs sheet
   */
  logToSheet: function(message, level = 'INFO') {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.LOGS_SHEET);
        sheet.appendRow(['Timestamp', 'Level', 'Message']);
        sheet.getRange('A1:C1').setFontWeight('bold');
      }
      
      sheet.appendRow([new Date(), level, message]);
      
      // Keep only last 1000 logs
      if (sheet.getLastRow() > 1001) {
        sheet.deleteRows(2, 100);
      }
    } catch (e) {
      Logger.log(`[${level}] ${message} (Sheet logging failed: ${e.message})`);
    }
  },
  
  /**
   * Calls Gemini AI with retry logic
   */
  callGeminiWithRetry: function(userPrompt, systemHint, modelName, mimeType = 'text/plain') {
    const MAX_RETRIES = 3;
    let lastError = null;
    const CONFIG = ConfigService_.get();
    const apiKey = CONFIG.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in Script Properties');
    }
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{
            parts: [{
              text: userPrompt
            }]
          }],
          systemInstruction: {
            parts: [{ text: systemHint }]
          },
          generationConfig: {
            temperature: CONFIG.GEMINI_TEMPERATURE,
            maxOutputTokens: CONFIG.GEMINI_MAX_OUTPUT_TOKENS,
            responseMimeType: mimeType
          }
        };
        
        const response = UrlFetchApp.fetch(url, {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();
        
        if (responseCode === 200) {
          const result = JSON.parse(responseText);
          if (result.candidates && result.candidates[0] && result.candidates[0].content) {
            return result.candidates[0].content.parts[0].text;
          }
        }
        
        throw new Error(`Gemini API error ${responseCode}: ${responseText}`);
        
      } catch (e) {
        lastError = e;
        if (attempt < MAX_RETRIES - 1) {
          Utilities.sleep((attempt + 1) * 2000);
        }
      }
    }
    
    this.logToSheet(`Gemini failed after ${MAX_RETRIES} attempts: ${lastError.message}`, 'ERROR');
    throw lastError;
  },
  
  /**
   * Search Google using SerpApi with free tier quota management
   * FREE TIER: 100 searches/month (we limit to 3/day = ~90/month)
   */
  searchGoogle: function(query, numResults = 10) {
    const CONFIG = ConfigService_.get();
    
    // Check if SERP analysis is enabled
    if (!CONFIG.USE_SERP_ANALYSIS) {
      this.logToSheet('SERP analysis disabled in config', 'DEBUG');
      return null;
    }
    
    const apiKey = CONFIG.SERPAPI_KEY;
    if (!apiKey || apiKey === '') {
      this.logToSheet('SERPAPI_KEY not configured - skipping SERP search', 'WARNING');
      return null;
    }
    
    // Daily quota management (3 searches/day to stay within 100/month free tier)
    const today = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');
    const quotaKey = `SERP_QUOTA_${today}`;
    const props = PropertiesService.getScriptProperties();
    const dailyCount = parseInt(props.getProperty(quotaKey) || '0');
    const dailyLimit = CONFIG.SERPAPI_DAILY_LIMIT;
    
    if (dailyCount >= dailyLimit) {
      this.logToSheet(`Daily SERP quota exhausted (${dailyCount}/${dailyLimit}) - using fallback`, 'WARNING');
      return null;
    }
    
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=${numResults}`;
      
      const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
      const statusCode = response.getResponseCode();
      
      if (statusCode !== 200) {
        this.logToSheet(`SerpApi returned status ${statusCode} for query: ${query}`, 'ERROR');
        return null;
      }
      
      const data = JSON.parse(response.getContentText());
      
      // Increment daily quota counter
      props.setProperty(quotaKey, String(dailyCount + 1));
      this.logToSheet(`SERP search completed (${dailyCount + 1}/${dailyLimit} today): ${query}`, 'INFO');
      
      // Return organic results
      return data.organic_results || [];
      
    } catch (error) {
      this.logToSheet(`SERP API error: ${error.message}`, 'ERROR');
      return null;
    }
  },
  
  /**
   * Scrape article text from a URL (for competitor analysis)
   */
  scrapeArticleText: function(url) {
    try {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      if (response.getResponseCode() !== 200) {
        this.logToSheet(`Failed to fetch URL (status ${response.getResponseCode()}): ${url}`, 'WARNING');
        return '';
      }
      
      let html = response.getContentText();
      
      // Remove script and style tags
      html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
      // Remove navigation, header, footer, aside elements
      html = html.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
      html = html.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
      html = html.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
      html = html.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');
      
      // Try to extract main content from article/main/content containers
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      
      let content = articleMatch ? articleMatch[1] : (mainMatch ? mainMatch[1] : (contentMatch ? contentMatch[1] : html));
      
      // Strip all remaining HTML tags
      content = content.replace(/<[^>]+>/g, ' ');
      
      // Decode HTML entities
      content = content.replace(/&nbsp;/g, ' ')
                       .replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&quot;/g, '"')
                       .replace(/&#39;/g, "'");
      
      // Normalize whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      // Limit to first 3000 characters for analysis
      if (content.length > 3000) {
        content = content.substring(0, 3000) + '...';
      }
      
      return content;
      
    } catch (error) {
      this.logToSheet(`Error scraping article from ${url}: ${error.message}`, 'ERROR');
      return '';
    }
  },
  
  /**
   * Get Search Console performance data (winners vs losers)
   * 100% FREE - Google Search Console API has no costs
   * Uses REST API directly via OAuth token
   */
  getSearchConsoleData: function(days = 30) {
    try {
      const CONFIG = ConfigService_.get();
      const siteUrl = CONFIG.SEARCH_CONSOLE_SITE_URL;
      
      if (!siteUrl || siteUrl === '') {
        this.logToSheet('SEARCH_CONSOLE_SITE_URL not configured', 'WARNING');
        return {winners: [], losers: [], all: []};
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Get OAuth token (Apps Script handles this automatically)
      const token = ScriptApp.getOAuthToken();
      
      // Prepare request payload
      const payload = {
        startDate: Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd'),
        endDate: Utilities.formatDate(endDate, 'GMT', 'yyyy-MM-dd'),
        dimensions: ['page'],
        rowLimit: 500
      };
      
      // Call Search Console API via REST
      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const statusCode = response.getResponseCode();
      
      if (statusCode !== 200) {
        this.logToSheet(`Search Console API returned status ${statusCode}: ${response.getContentText()}`, 'ERROR');
        return {winners: [], losers: [], all: []};
      }
      
      const data = JSON.parse(response.getContentText());
      
      if (!data.rows || data.rows.length === 0) {
        this.logToSheet(`No Search Console data for last ${days} days`, 'INFO');
        return {winners: [], losers: [], all: []};
      }
      
      // Sort by clicks descending
      const rows = data.rows.sort((a, b) => b.clicks - a.clicks);
      
      // Identify top 20% (winners) and bottom 20% (losers)
      const topCount = Math.max(1, Math.floor(rows.length * 0.2));
      const bottomCount = Math.max(1, Math.floor(rows.length * 0.2));
      
      const winners = rows.slice(0, topCount);
      const losers = rows.slice(-bottomCount);
      
      this.logToSheet(`Search Console: ${rows.length} pages, ${winners.length} winners, ${losers.length} losers`, 'INFO');
      
      return {winners, losers, all: rows};
      
    } catch (error) {
      this.logToSheet(`Search Console API error: ${error.message}`, 'ERROR');
      return {winners: [], losers: [], all: []};
    }
  },
  
  /**
   * Fetch relevant image from Unsplash
   * FREE TIER: 50 requests/hour
   */
  fetchUnsplashImage: function(query, orientation = 'landscape') {
    try {
      const CONFIG = ConfigService_.get();
      const accessKey = CONFIG.UNSPLASH_ACCESS_KEY;
      
      if (!accessKey || accessKey === '') {
        this.logToSheet('UNSPLASH_ACCESS_KEY not configured - skipping image fetch', 'WARNING');
        return null;
      }
      
      // Clean query for better results
      const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 100);
      
      const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(cleanQuery)}&orientation=${orientation}&client_id=${accessKey}`;
      
      const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
      const statusCode = response.getResponseCode();
      
      if (statusCode !== 200) {
        this.logToSheet(`Unsplash API returned status ${statusCode}`, 'WARNING');
        return null;
      }
      
      const data = JSON.parse(response.getContentText());
      
      this.logToSheet(`Fetched Unsplash image for: ${cleanQuery}`, 'INFO');
      
      return {
        url: data.urls.regular, // High quality image
        downloadUrl: data.urls.full, // Full resolution
        thumb: data.urls.thumb, // Thumbnail
        photographer: data.user.name,
        photographerUrl: data.user.links.html,
        unsplashUrl: data.links.html,
        description: data.description || data.alt_description || cleanQuery,
        color: data.color // Dominant color for placeholder
      };
      
    } catch (error) {
      this.logToSheet(`Unsplash API error: ${error.message}`, 'ERROR');
      return null;
    }
  }
};

// ============================================================================
// GITHUB API INTEGRATION
// ============================================================================

const GitHubUtils_ = {
  /**
   * Gets a file from GitHub
   */
  getFile: function(path) {
    const CONFIG = ConfigService_.get();
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}?ref=${CONFIG.GITHUB_BRANCH}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString();
    }
    
    throw new Error(`Failed to get file ${path}: ${response.getContentText()}`);
  },
  
  /**
   * Creates or updates a file on GitHub
   */
  createOrUpdateFile: function(path, content, message, sha = null) {
    const CONFIG = ConfigService_.get();
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`;
    
    const payload = {
      message: message,
      content: Utilities.base64Encode(content),
      branch: CONFIG.GITHUB_BRANCH
    };
    
    if (sha) {
      payload.sha = sha;
    }
    
    const response = UrlFetchApp.fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200 || responseCode === 201) {
      return JSON.parse(response.getContentText());
    }
    
    throw new Error(`Failed to update ${path}: ${response.getContentText()}`);
  },
  
  /**
   * Commits multiple files at once (more efficient)
   */
  commitMultipleFiles: function(files, commitMessage) {
    const CONFIG = ConfigService_.get();
    
    try {
      // 1. Get the latest commit SHA
      const refUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/git/refs/heads/${CONFIG.GITHUB_BRANCH}`;
      const refResponse = UrlFetchApp.fetch(refUrl, {
        headers: {
          'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const latestCommitSha = JSON.parse(refResponse.getContentText()).object.sha;
      
      // 2. Get the commit tree
      const commitUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/git/commits/${latestCommitSha}`;
      const commitResponse = UrlFetchApp.fetch(commitUrl, {
        headers: {
          'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const baseTreeSha = JSON.parse(commitResponse.getContentText()).tree.sha;
      
      // 3. Create blobs for each file
      const tree = files.map(file => {
        const blobUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/git/blobs`;
        const blobResponse = UrlFetchApp.fetch(blobUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          contentType: 'application/json',
          payload: JSON.stringify({
            content: file.content,
            encoding: 'utf-8'
          })
        });
        const blobSha = JSON.parse(blobResponse.getContentText()).sha;
        
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobSha
        };
      });
      
      // 4. Create new tree
      const treeUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/git/trees`;
      const treeResponse = UrlFetchApp.fetch(treeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        contentType: 'application/json',
        payload: JSON.stringify({
          base_tree: baseTreeSha,
          tree: tree
        })
      });
      const newTreeSha = JSON.parse(treeResponse.getContentText()).sha;
      
      // 5. Create new commit
      const newCommitUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/git/commits`;
      const newCommitResponse = UrlFetchApp.fetch(newCommitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        contentType: 'application/json',
        payload: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [latestCommitSha]
        })
      });
      const newCommitSha = JSON.parse(newCommitResponse.getContentText()).sha;
      
      // 6. Update reference
      UrlFetchApp.fetch(refUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        contentType: 'application/json',
        payload: JSON.stringify({
          sha: newCommitSha,
          force: false
        })
      });
      
      SharedUtils_.logToSheet(`Successfully committed ${files.length} files: ${commitMessage}`, 'INFO');
      return { success: true, sha: newCommitSha };
      
    } catch (error) {
      SharedUtils_.logToSheet(`GitHub commit failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
};

// ============================================================================
// ENGAGEMENT TRACKING (Google Sheets as Database)
// ============================================================================

const EngagementUtils_ = {
  /**
   * Tracks a page view
   */
  trackView: function(postId, metadata = {}) {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.ANALYTICS_SHEET);
        sheet.appendRow(['Post ID', 'Slug', 'Title', 'Published Date', 'Total Views', 'Unique Visitors', 'Avg Read Time', 'Last Updated']);
        sheet.getRange('A1:H1').setFontWeight('bold');
      }
      
      // Find or create row for this post
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === postId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        // New post
        sheet.appendRow([postId, metadata.slug || '', metadata.title || '', metadata.publishedDate || new Date(), 1, 1, 0, new Date()]);
      } else {
        // Increment view count
        const currentViews = sheet.getRange(rowIndex, 5).getValue() || 0;
        sheet.getRange(rowIndex, 5).setValue(currentViews + 1);
        sheet.getRange(rowIndex, 8).setValue(new Date());
      }
      
      return { success: true };
    } catch (error) {
      Logger.log(`Failed to track view: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Records a comment
   */
  recordComment: function(data) {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.COMMENTS_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.COMMENTS_SHEET);
        sheet.appendRow(['Timestamp', 'Post ID', 'Comment ID', 'Author Name', 'Author Email', 'Content', 'Status', 'IP Hash']);
        sheet.getRange('A1:H1').setFontWeight('bold');
      }
      
      const commentId = Utilities.getUuid();
      const ipHash = data.ip ? Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.ip).toString() : '';
      
      sheet.appendRow([
        new Date(),
        data.postId,
        commentId,
        data.authorName,
        data.authorEmail,
        data.content,
        'pending',
        ipHash
      ]);
      
      return { success: true, commentId: commentId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Records a usefulness survey response
   */
  recordSurvey: function(data) {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.SURVEYS_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SURVEYS_SHEET);
        sheet.appendRow(['Timestamp', 'Post ID', 'Rating (1-5)', 'Feedback', 'User ID Hash', 'Source']);
        sheet.getRange('A1:F1').setFontWeight('bold');
      }
      
      const userIdHash = data.userId ? Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.userId).toString() : '';
      
      sheet.appendRow([
        new Date(),
        data.postId,
        data.rating,
        data.feedback || '',
        userIdHash,
        data.source || 'web'
      ]);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================================================
// WEB APP ENDPOINT (for engagement tracking from static pages)
// ============================================================================

/**
 * Handles OPTIONS requests - CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Handles POST requests from blog pages
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    let result;
    switch(data.action) {
      case 'trackView':
        result = EngagementUtils_.trackView(data.postId, data.metadata);
        break;
      case 'submitComment':
        result = EngagementUtils_.recordComment(data);
        break;
      case 'submitSurvey':
        result = EngagementUtils_.recordSurvey(data);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

/**
 * Handles GET requests (for metrics retrieval)
 */
function doGet(e) {
  const action = e.parameter.action;
  const postId = e.parameter.postId;
  
  try {
    let result;
    
    if (action === 'getMetrics' && postId) {
      // Return metrics for a specific post
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const analyticsSheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
      
      if (analyticsSheet) {
        const data = analyticsSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === postId) {
            result = {
              views: data[i][4] || 0,
              likes: 0, // Not implemented in this version
              surveys: { helpful: 0, notHelpful: 0 } // Placeholder
            };
            break;
          }
        }
      }
      
      if (!result) {
        result = { views: 0, likes: 0, surveys: { helpful: 0, notHelpful: 0 } };
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'WebGlo Blog Engagement API' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// ============================================================================
// UI & MENU (Merged with keyword-que-builder.js)
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Main automation menu
  const menu = ui.createMenu('ðŸ“ WebGlo Blog Automation');
  menu.addItem('ðŸ“Š Open Dashboard', 'showDashboard');
  menu.addSeparator();
  menu.addItem('â–¶ï¸ Publish Next Blog Post', 'publishNextBlogPost');
  menu.addItem('â–¶ï¸ Publish Bulk Posts (3)', 'publishBulkBlogPosts');
  menu.addSeparator();
  menu.addItem('ðŸŽ¯ Run Strategy Session', 'runContentStrategySession');
  menu.addSeparator();
  
  // Competitor intelligence submenu
  const competitorMenu = ui.createMenu('ðŸ” Competitor Intelligence');
  competitorMenu.addItem('Analyze Competitor Posts', 'analyzeCompetitorPosts');
  competitorMenu.addItem('Promote Top Competitor Topics', 'promoteTopCompetitorTopicsToQueue');
  menu.addSubMenu(competitorMenu);
  
  // Setup submenu
  const setupMenu = ui.createMenu('âš™ï¸ Setup & Config');
  setupMenu.addItem('ðŸš€ Run Setup Wizard', 'runSetupWizard');
  setupMenu.addItem('ï¿½ Initialize Sheet Structure', 'initializeSheetStructure');
  setupMenu.addItem('ï¿½ðŸ”§ Initialize Configuration', 'initializeConfig');
  setupMenu.addItem('ðŸ“… Install Automation Triggers', 'installTriggers');
  setupMenu.addItem('ðŸŒ Deploy Web App Endpoint', 'showWebAppDeploymentGuide');
  menu.addSubMenu(setupMenu);
  
  menu.addToUi();
}

function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('WebGlo Blog Dashboard')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showWebAppDeploymentGuide() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Deploy Web App for Engagement Tracking',
    'To enable engagement tracking:\n\n' +
    '1. Click "Deploy" > "New deployment"\n' +
    '2. Select "Web app"\n' +
    '3. Execute as: "Me"\n' +
    '4. Who has access: "Anyone"\n' +
    '5. Click "Deploy"\n' +
    '6. Copy the Web App URL\n' +
    '7. Add it to blog/scripts/config.js\n\n' +
    'The URL will look like:\n' +
    'https://script.google.com/macros/s/ABC123.../exec',
    ui.ButtonSet.OK
  );
}

function initializeConfig() {
  ConfigService_.initialize();
  SpreadsheetApp.getUi().alert('Configuration initialized! Check Script Properties to set API keys.');
}

function installTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Install new triggers
  ScriptApp.newTrigger('publishNextBlogPost')
    .timeBased()
    .everyDays(1)
    .atHour(10) // 10 AM daily
    .create();
  
  SpreadsheetApp.getUi().alert('Automation trigger installed! Blog posts will publish daily at 10 AM.');
}

/**
 * Initialize all required sheet structures
 */
function initializeSheetStructure() {
  const CONFIG = ConfigService_.get();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    SharedUtils_.logToSheet('Starting sheet structure initialization...', 'INFO');
    
    // 1. Create Blog Themes (Queue) sheet
    let queueSheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    if (!queueSheet) {
      queueSheet = ss.insertSheet(CONFIG.QUEUE_SHEET);
      queueSheet.appendRow(['Topic', 'Core Value', 'Target Audience', 'Search Intent', 'Keyword Focus', 'Est. Word Count', 'Conversion Potential', 'Total Score', 'Status', 'URL', 'Published Date']);
      queueSheet.getRange('A1:K1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      queueSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Blog Themes sheet', 'INFO');
    }
    
    // 2. Create Analytics sheet
    let analyticsSheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
    if (!analyticsSheet) {
      analyticsSheet = ss.insertSheet(CONFIG.ANALYTICS_SHEET);
      analyticsSheet.appendRow(['Post ID', 'Slug', 'Title', 'Published Date', 'Total Views', 'Unique Visitors', 'Avg Read Time', 'Last Updated']);
      analyticsSheet.getRange('A1:H1').setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
      analyticsSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Analytics sheet', 'INFO');
    }
    
    // 3. Create Comments sheet
    let commentsSheet = ss.getSheetByName(CONFIG.COMMENTS_SHEET);
    if (!commentsSheet) {
      commentsSheet = ss.insertSheet(CONFIG.COMMENTS_SHEET);
      commentsSheet.appendRow(['Timestamp', 'Post ID', 'Comment ID', 'Author Name', 'Author Email', 'Content', 'Status', 'IP Hash']);
      commentsSheet.getRange('A1:H1').setFontWeight('bold').setBackground('#fbbc04').setFontColor('#000000');
      commentsSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Comments sheet', 'INFO');
    }
    
    // 4. Create Surveys sheet
    let surveysSheet = ss.getSheetByName(CONFIG.SURVEYS_SHEET);
    if (!surveysSheet) {
      surveysSheet = ss.insertSheet(CONFIG.SURVEYS_SHEET);
      surveysSheet.appendRow(['Timestamp', 'Post ID', 'Rating (1-5)', 'Feedback', 'User ID Hash', 'Source']);
      surveysSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#ea4335').setFontColor('#ffffff');
      surveysSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Surveys sheet', 'INFO');
    }
    
    // 5. Create Logs sheet
    let logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
    if (!logsSheet) {
      logsSheet = ss.insertSheet(CONFIG.LOGS_SHEET);
      logsSheet.appendRow(['Timestamp', 'Level', 'Message', 'Details']);
      logsSheet.getRange('A1:D1').setFontWeight('bold').setBackground('#9e9e9e').setFontColor('#ffffff');
      logsSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Logs sheet', 'INFO');
    }
    
    // 6. Create Competitors sheet
    let competitorsSheet = ss.getSheetByName(CONFIG.COMPETITORS_SHEET);
    if (!competitorsSheet) {
      competitorsSheet = ss.insertSheet(CONFIG.COMPETITORS_SHEET);
      competitorsSheet.appendRow(['Competitor Name', 'Post Title', 'URL', 'Word Count', 'Key Topics', 'Analyzed Date']);
      competitorsSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
      competitorsSheet.setFrozenRows(1);
      SharedUtils_.logToSheet('Created Competitors sheet', 'INFO');
    }
    
    SharedUtils_.logToSheet('âœ… Sheet structure initialization complete!', 'INFO');
    return true;
    
  } catch (error) {
    SharedUtils_.logToSheet('Sheet initialization error: ' + error.message, 'ERROR');
    return false;
  }
}

/**
 * Setup wizard - guides user through initial configuration
 */
function runSetupWizard() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('WebGlo Blog Automation Setup', 
    'Welcome! This wizard will help you set up the blog automation system.\n\n' +
    'This will:\n' +
    '1. Initialize configuration\n' +
    '2. Create all required sheets\n' +
    '3. Set up the spreadsheet structure\n\n' +
    'Click OK to continue.',
    ui.ButtonSet.OK);
  
  try {
    // Initialize config
    ConfigService_.initialize();
    
    // Set spreadsheet ID automatically
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SPREADSHEET_ID', SpreadsheetApp.getActiveSpreadsheet().getId());
    
    // Initialize all sheets
    const sheetsCreated = initializeSheetStructure();
    
    if (sheetsCreated) {
      ui.alert('Setup Complete! âœ…',
        'Configuration has been initialized and all sheets created.\n\n' +
        'Next steps:\n' +
        '1. Go to Project Settings > Script Properties\n' +
        '2. Set GITHUB_TOKEN (your GitHub PAT)\n' +
        '3. Set GEMINI_API_KEY (from Google AI Studio)\n' +
        '4. Set UNSPLASH_ACCESS_KEY (from Unsplash)\n' +
        '5. Optional: SERPAPI_KEY for SERP analysis\n' +
        '6. Run "Strategy Session" to generate topics\n' +
        '7. Deploy Web App for engagement tracking\n' +
        '8. Install automation triggers\n\n' +
        'Check the Logs sheet for details!',
        ui.ButtonSet.OK);
    } else {
      ui.alert('Setup Incomplete',
        'There was an issue creating sheets. Check the Logs sheet for errors.',
        ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Setup Error',
      'An error occurred during setup: ' + error.message + '\n\n' +
      'Please check the Logs sheet for details.',
      ui.ButtonSet.OK);
  }
}

/**
 * Seeds the Blog Themes sheet with high-potential initial topics
 * These are curated topics optimized for WebGlo's services and high conversion potential
 */
function seedInitialBlogTopics() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Seed Initial Blog Topics',
    'This will add 12 high-potential blog topics to your queue.\n\n' +
    'These topics are:\n' +
    'âœ“ Optimized for search traffic\n' +
    'âœ“ Aligned with WebGlo services\n' +
    'âœ“ High conversion potential\n' +
    'âœ“ AdSense-friendly (1500-2500 words)\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    
    if (!sheet) {
      throw new Error('Blog Themes sheet not found. Run "Initialize Sheet Structure" first.');
    }
    
    // High-potential seed topics
    const seedTopics = [
      {
        title: "Why Your Online Presence Matters in 2025: Data-Driven Strategies That Actually Work",
        coreValue: "Help businesses understand the ROI of digital presence with concrete data and proven strategies",
        targetAudience: "Small to medium business owners without strong online presence",
        searchIntent: "Informational - Understanding importance and getting started",
        keywordFocus: "online presence, digital marketing ROI, business website importance",
        estimatedWordCount: 2200,
        conversionPotential: "High - Leads to web design and digital marketing services",
        category: "digital-strategy",
        tags: "online-presence, web-design, seo, digital-marketing, business-growth"
      },
      {
        title: "Complete Guide to Local SEO in 2025: Dominate Your Geographic Market",
        coreValue: "Step-by-step guide to ranking #1 in local search results and Google Maps",
        targetAudience: "Local businesses (restaurants, services, retail) wanting more foot traffic",
        searchIntent: "Informational + Transactional - Learn and implement local SEO",
        keywordFocus: "local SEO, Google My Business, local search ranking",
        estimatedWordCount: 2800,
        conversionPotential: "Very High - Direct SEO service offering",
        category: "seo",
        tags: "local-seo, google-my-business, local-search, map-rankings, citation-building"
      },
      {
        title: "Landing Page Conversion Optimization: Turn More Visitors Into Paying Customers",
        coreValue: "Actionable tactics to double landing page conversion rates using psychology and data",
        targetAudience: "Marketers and business owners running paid ads or with existing traffic",
        searchIntent: "Informational + Commercial - Looking for optimization strategies",
        keywordFocus: "landing page optimization, conversion rate optimization, CRO",
        estimatedWordCount: 2500,
        conversionPotential: "Very High - Promotes Landing Page Express service",
        category: "digital-marketing",
        tags: "landing-page, conversion, cro, a-b-testing, optimization"
      },
      {
        title: "Website Speed Optimization: The Complete Technical Guide (Core Web Vitals 2025)",
        coreValue: "Master technical SEO and page speed for better rankings and user experience",
        targetAudience: "Website owners with slow sites, developers, digital marketers",
        searchIntent: "Informational - Deep technical knowledge",
        keywordFocus: "website speed optimization, Core Web Vitals, page speed",
        estimatedWordCount: 3000,
        conversionPotential: "Medium - Technical audit and optimization services",
        category: "web-development",
        tags: "page-speed, core-web-vitals, performance, technical-seo, optimization"
      },
      {
        title: "Social Media Marketing Strategy That Actually Generates Revenue (Not Just Likes)",
        coreValue: "Build a social media strategy focused on business outcomes, not vanity metrics",
        targetAudience: "Business owners frustrated with social media ROI",
        searchIntent: "Informational - Strategy and implementation",
        keywordFocus: "social media marketing strategy, social media ROI, B2B social media",
        estimatedWordCount: 2400,
        conversionPotential: "High - Social media management and strategy services",
        category: "digital-marketing",
        tags: "social-media, marketing-strategy, roi, content-marketing, engagement"
      },
      {
        title: "Email Marketing Automation: Build Campaigns That Convert While You Sleep",
        coreValue: "Set up email automation sequences that nurture leads and drive sales 24/7",
        targetAudience: "E-commerce and service businesses looking to scale without more work",
        searchIntent: "Informational + Commercial - Learn and purchase tools/services",
        keywordFocus: "email marketing automation, email sequences, marketing automation",
        estimatedWordCount: 2600,
        conversionPotential: "Medium - Email setup and automation services",
        category: "digital-marketing",
        tags: "email-marketing, automation, drip-campaigns, lead-nurturing, conversions"
      },
      {
        title: "Google Ads for Local Businesses: Stop Wasting Money on Clicks That Don't Convert",
        coreValue: "Master Google Ads targeting, bidding, and optimization for local service businesses",
        targetAudience: "Local businesses currently running or considering Google Ads",
        searchIntent: "Informational + Commercial - Optimize existing campaigns or start new ones",
        keywordFocus: "Google Ads for local business, PPC optimization, local Google Ads",
        estimatedWordCount: 2700,
        conversionPotential: "Very High - PPC management services",
        category: "digital-marketing",
        tags: "google-ads, ppc, local-advertising, conversion-optimization, roi"
      },
      {
        title: "WordPress vs Custom Development: The Real Cost Analysis for Business Websites",
        coreValue: "Help businesses make informed decisions about website platform based on needs and budget",
        targetAudience: "Business owners planning a new website or considering redesign",
        searchIntent: "Commercial Investigation - Researching before hiring",
        keywordFocus: "WordPress vs custom website, website development cost, business website platform",
        estimatedWordCount: 2300,
        conversionPotential: "Very High - Web development services decision point",
        category: "web-development",
        tags: "wordpress, custom-development, web-design, cost-analysis, platforms"
      },
      {
        title: "Content Marketing That Drives Sales: From Blog Posts to Closed Deals",
        coreValue: "Build a content marketing system that generates qualified leads and closes sales",
        targetAudience: "B2B companies and service businesses with long sales cycles",
        searchIntent: "Informational - Strategy development",
        keywordFocus: "content marketing strategy, B2B content marketing, blog for business",
        estimatedWordCount: 2500,
        conversionPotential: "High - Content creation and strategy services",
        category: "digital-marketing",
        tags: "content-marketing, blogging, lead-generation, SEO, conversion"
      },
      {
        title: "Ecommerce SEO: Rank Your Product Pages and Dominate Online Shopping Searches",
        coreValue: "Optimize product pages and category pages for maximum organic traffic and sales",
        targetAudience: "Online store owners and ecommerce managers",
        searchIntent: "Informational - Technical implementation guide",
        keywordFocus: "ecommerce SEO, product page SEO, online store optimization",
        estimatedWordCount: 2900,
        conversionPotential: "High - Ecommerce SEO and optimization services",
        category: "seo",
        tags: "ecommerce, seo, product-pages, online-shopping, schema-markup"
      },
      {
        title: "Mobile-First Website Design: Why Your Desktop Site Is Killing Conversions",
        coreValue: "Understand mobile-first design principles and optimize for the 60%+ mobile traffic",
        targetAudience: "Businesses with high mobile traffic but low mobile conversions",
        searchIntent: "Informational + Problem Aware",
        keywordFocus: "mobile-first design, responsive web design, mobile optimization",
        estimatedWordCount: 2200,
        conversionPotential: "Very High - Mobile redesign services",
        category: "web-development",
        tags: "mobile-first, responsive-design, ux, mobile-optimization, conversion"
      },
      {
        title: "Brand Identity Design: Build a Brand That Commands Premium Prices",
        coreValue: "Create a cohesive brand identity that differentiates and justifies higher pricing",
        targetAudience: "Entrepreneurs and business owners struggling with commoditization",
        searchIntent: "Informational + Commercial - Understanding value and seeking services",
        keywordFocus: "brand identity design, branding strategy, logo design",
        estimatedWordCount: 2400,
        conversionPotential: "High - Branding and design services",
        category: "digital-strategy",
        tags: "branding, identity-design, logo-design, brand-strategy, differentiation"
      }
    ];
    
    // Add topics to sheet
    let addedCount = 0;
    seedTopics.forEach(topic => {
      sheet.appendRow([
        topic.title,
        topic.coreValue,
        topic.targetAudience,
        topic.searchIntent,
        topic.keywordFocus,
        topic.estimatedWordCount,
        topic.conversionPotential,
        new Date(), // Date Created
        'Pending', // Status
        '', // URL (will be filled after publishing)
        topic.category,
        topic.tags
      ]);
      addedCount++;
    });
    
    SharedUtils_.logToSheet(`Seeded ${addedCount} initial blog topics`, 'INFO');
    
    return addedCount;
    
  } catch (error) {
    SharedUtils_.logToSheet('Seeding error: ' + error.message, 'ERROR');
    throw error;
  }
}

// Note: The following functions are defined in their respective files:
// - publishNextBlogPost() â†’ blog-poster.js
// - publishBulkBlogPosts() â†’ blog-poster.js
// - runContentStrategySession() â†’ keyword-que-builder.js
// - analyzeCompetitorPosts() â†’ keyword-que-builder.js
// - promoteTopCompetitorTopicsToQueue() â†’ keyword-que-builder.js


