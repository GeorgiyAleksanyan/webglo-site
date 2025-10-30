/**
 * WebGlo Blog Configuration
 * Update this file with your deployment URLs
 */

window.BLOG_CONFIG = {
  // Google Apps Script API URL (get this after deploying the backend)
  ENGAGEMENT_API_URL: 'https://script.google.com/macros/s/AKfycby8yrfMm2Lnv_LTpcGRUzO1v-3PREUxxbsvCCPsDlFm2VkDIW3PPNj8RRoj3pL5EdEa/exec',
  
  // Blog data location (relative to blog folder)
  DATA_URL: './data/posts.json',
  
  // Base paths
  BASE_PATH: '/blog/',
  ASSETS_PATH: '../assets/',
  
  // Feature flags
  FEATURES: {
    viewTracking: true, // ✅ ENABLED - Google Apps Script backend
    likes: true, // ✅ ENABLED - Google Apps Script backend
    survey: true, // ✅ ENABLED - Google Apps Script backend
    comments: true, // ✅ ENABLED - Giscus (configure below)
    analytics: true // Google Analytics
  },
  
  // Giscus configuration
  GISCUS: {
    ENABLED: true, // ✅ ENABLED - Follow setup instructions below
    REPO: 'GeorgiyAleksanyan/webglo-site',
    REPO_ID: 'R_kgDOPWn_EQ', // Get from giscus.app
    CATEGORY: 'Announcements',
    CATEGORY_ID: 'DIC_kwDOPWn_Ec4CxPq_', // Get from giscus.app
    MAPPING: 'pathname',
    STRICT: '0',
    REACTIONS_ENABLED: '1',
    EMIT_METADATA: '0',
    INPUT_POSITION: 'bottom',
    THEME: 'preferred_color_scheme',
    LANG: 'en'
  },
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // UI settings
  POSTS_PER_PAGE: 12,
  SHOW_READ_TIME: true,
  SHOW_VIEW_COUNT: true,
  SHOW_LIKE_COUNT: true
};
