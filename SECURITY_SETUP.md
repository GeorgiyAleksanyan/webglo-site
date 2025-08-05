# 🔒 WebGlo Security Configuration Guide

## ⚠️ IMPORTANT: Required Local Setup

After cloning this repository, you MUST create local configuration files with your actual API keys. The repository has been sanitized to remove all sensitive information.

## Required Local Files

### 1. Create `js/config.local.js`
```javascript
// Copy js/config.js and replace placeholders with your actual values:
window.ENV = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_ACTUAL_STRIPE_KEY',
  BACKEND_URL: 'https://webglo-payment-api.service-webglo.workers.dev',
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  ENVIRONMENT: 'test'
};
```

### 2. Update Google Apps Script Configuration
In your Google Apps Script deployment, update the CONFIG object:
```javascript
const CONFIG = {
  ORDERS_SHEET_ID: 'YOUR_ACTUAL_GOOGLE_SHEETS_ID',
  DRIVE_FOLDER_ID: 'YOUR_ACTUAL_DRIVE_FOLDER_ID',
  EMAIL_FROM: 'info@webglo.org',
  NOTIFICATION_EMAIL: 'info@webglo.org',
  WEBSITE_URL: 'https://webglo.org'
};
```

### 3. Cloudflare Worker Environment Variables
Ensure these are set in your Cloudflare Worker dashboard:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (whsec_...)
- `GOOGLE_APPS_SCRIPT_URL`: Your deployed Google Apps Script URL
- `ENVIRONMENT`: 'production' or 'test'

## Security Features Implemented

✅ **Sanitized Repository**: All API keys and sensitive URLs removed  
✅ **Protected Local Configs**: Local config files in .gitignore  
✅ **Environment Variables**: Secrets stored in Cloudflare Workers  
✅ **No Hardcoded Secrets**: All sensitive data externalized  
✅ **Debug Logging Removed**: No sensitive info in logs  

## Files Protected by .gitignore

- `js/config.local.js` - Local configuration with real API keys
- `.env*` - Environment files
- `*-private.js` - Any private configuration files
- `*stripe*key*` - Any files containing Stripe keys
- Google Apps Script URLs and IDs

## Production Deployment Checklist

- [ ] Update `js/config.local.js` with production Stripe keys
- [ ] Switch Cloudflare Worker to production Stripe keys
- [ ] Update Google Apps Script configuration
- [ ] Test payment flow with real cards
- [ ] Verify webhook signatures work correctly
- [ ] Confirm emails are being sent
- [ ] Check Google Sheets data collection

## Emergency Security Response

If sensitive information is ever accidentally committed:
1. Immediately rotate all API keys
2. Update webhook secrets in Stripe
3. Redeploy all services
4. Review git history for exposure

---
**Last Updated**: August 5, 2025  
**Status**: ✅ Production Ready & Secure
