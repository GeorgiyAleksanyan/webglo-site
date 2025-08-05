/**
 * WebGlo Configuration
 * Set environment variables for different deployment environments
 */

// Production configuration (default)
window.ENV = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY', // Replace with your actual Stripe test publishable key
  BACKEND_URL: 'https://webglo-payment-api.service-webglo.workers.dev', // Your Cloudflare Worker URL
  GOOGLE_APPS_SCRIPT_URL: 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL', // Replace with your actual Google Apps Script URL
  ENVIRONMENT: 'test' // Using test environment
};

// Development override (only if running locally)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.ENV = {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY', // Replace with your test key for local dev
    BACKEND_URL: 'http://localhost:8787', // Local Cloudflare Worker for development
    GOOGLE_APPS_SCRIPT_URL: 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL',
    ENVIRONMENT: 'development'
  };
}

console.log('WebGlo Config loaded:', window.ENV.ENVIRONMENT);
