/**
 * WebGlo Blog Configuration
 * Update this file with your deployment URLs
 */

window.BLOG_CONFIG = {
  // Google Apps Script API URL (get this after deploying the backend)
  ENGAGEMENT_API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL',
  
  // Blog data location (relative to blog folder)
  DATA_URL: './data/posts.json',
  
  // Base paths
  BASE_PATH: '/blog/',
  ASSETS_PATH: '../assets/',
  
  // Feature flags
  FEATURES: {
    viewTracking: true,
    likes: true,
    survey: true,
    comments: true, // Giscus
    analytics: true // Google Analytics
  },
  
  // Giscus configuration
  GISCUS: {
    repo: 'GeorgiyAleksanyan/webglo-site',
    repoId: 'YOUR_REPO_ID', // Get from giscus.app
    category: 'Announcements',
    categoryId: 'YOUR_CATEGORY_ID', // Get from giscus.app
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: true,
    theme: 'preferred_color_scheme',
    lang: 'en'
  },
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // UI settings
  POSTS_PER_PAGE: 12,
  SHOW_READ_TIME: true,
  SHOW_VIEW_COUNT: true,
  SHOW_LIKE_COUNT: true
};
