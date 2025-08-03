/**
 * WebGlo Configuration
 * Set environment variables for different deployment environments
 */

// Production configuration (default)
window.ENV = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY', // Replace with your actual key
  BACKEND_URL: 'https://your-worker.your-subdomain.workers.dev', // Replace with your Cloudflare Worker URL
  ENVIRONMENT: 'production'
};

// Development override (only if running locally)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.ENV = {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY', // Your test key for local dev
    BACKEND_URL: 'http://localhost:3000', // Local backend for development
    ENVIRONMENT: 'development'
  };
}

console.log('WebGlo Config loaded:', window.ENV.ENVIRONMENT);
