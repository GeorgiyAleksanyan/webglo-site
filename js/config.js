/**
 * WebGlo Configuration
 * Set environment variables for different deployment environments
 */

// Production configuration (default)
window.ENV = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51Rrm6PJaxQeyxmGh1IP7crg7AkkkRLF9xOWY8zfQBYl5qF25PYgzGS9Vdkc0gyczwS49mmJFnOfBMRewA8T2M6y9', // Your actual Stripe test publishable key
  BACKEND_URL: 'https://webglo-payment-api.service-webglo.workers.dev', // Your Cloudflare Worker URL
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxcDtLrK9Zdd5CfgjEZf3mR7bSsziwv_fz8Ibn4f4Xewr9yY-oujBuXQvEO9kzr2SwP/exec', // Your actual Google Apps Script URL
  ENVIRONMENT: 'test' // Using test environment
};

// Development override (only if running locally)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.ENV = {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51Rrm6PJaxQeyxmGh1IP7crg7AkkkRLF9xOWY8zfQBYl5qF25PYgzGS9Vdkc0gyczwS49mmJFnOfBMRewA8T2M6y9', // Your test key for local dev
    BACKEND_URL: 'http://localhost:8787', // Local Cloudflare Worker for development
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxcDtLrK9Zdd5CfgjEZf3mR7bSsziwv_fz8Ibn4f4Xewr9yY-oujBuXQvEO9kzr2SwP/exec',
    ENVIRONMENT: 'development'
  };
}

console.log('WebGlo Config loaded:', window.ENV.ENVIRONMENT);
