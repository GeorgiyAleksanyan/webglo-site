# Custom Form Handler Setup Guide

## Overview
This guide walks you through setting up a completely free, professional form handling solution using Google Apps Script and Google Sheets. No third-party costs, fully customizable, and perfect for GitHub Pages hosting.

## 🎯 Benefits
- ✅ **100% Free**: No ongoing costs ever
- ✅ **Professional**: Custom styling, loading states, success/error messages
- ✅ **Secure**: Data stored in your own Google account
- ✅ **Customizable**: Full control over design and functionality
- ✅ **Email Notifications**: Automatic email alerts for new submissions
- ✅ **Data Export**: All submissions stored in Google Sheets (CSV export available)

## 📋 Setup Instructions

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "WebGlo Form Submissions"
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### Step 2: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the contents of `google-apps-script.js`
4. Update the configuration at the top:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Paste your Sheet ID here
   const NOTIFICATION_EMAIL = 'hello@webglo.org'; // Your notification email
   ```

### Step 3: Deploy the Script
1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Click "Deploy"
6. Copy the Web app URL (it looks like: `https://script.google.com/macros/s/.../exec`)

### Step 4: Update Your Website
1. Open `js/form-handler.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your Web app URL:
   ```javascript
   this.scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

### Step 5: Test Your Setup
1. Run your local server: `python -m http.server 8000`
2. Go to `http://localhost:8000/contact.html`
3. Fill out and submit the form
4. Check your Google Sheet for the new submission
5. Check your email for the notification

## 🔧 Advanced Configuration

### Custom Email Templates
Edit the `sendNotificationEmail` function in your Google Apps Script to customize:
- Email subject lines
- HTML email templates
- Multiple notification recipients
- Conditional notifications based on form data

### Additional Form Fields
To add new form fields:
1. Add the field to your HTML form
2. Update the `logToSheet` function headers array
3. Update the `rowData` array to include the new field

### Form Validation
Add custom validation in `form-handler.js`:
```javascript
validateForm(formData) {
  const errors = [];
  
  if (!formData.get('email').includes('@')) {
    errors.push('Please enter a valid email address');
  }
  
  if (formData.get('message').length < 10) {
    errors.push('Please provide more details about your project');
  }
  
  return errors;
}
```

### Multiple Forms
You can use the same script for multiple forms:
1. Add `data-webglo-form="form-name"` to each form
2. The form type will be automatically logged in your spreadsheet
3. Create different email templates based on form type

## 📊 Analytics Integration

### Google Analytics 4
The form handler automatically tracks submissions to GA4 if available:
```javascript
gtag('event', 'form_submission', {
  form_id: 'contact',
  status: 'success'
});
```

### Custom Analytics
Add your own tracking in the `trackSubmission` method:
```javascript
trackSubmission(formId, status, error = null) {
  // Your custom analytics code here
  console.log(`Form ${formId}: ${status}`);
}
```

## 🛡️ Security Features

### Built-in Protection
- **CORS Protection**: Uses Google's secure infrastructure
- **Spam Protection**: Can add rate limiting and CAPTCHA
- **Data Validation**: Server-side validation in Google Apps Script
- **Access Control**: Only you can access the Google Sheet

### Adding CAPTCHA (Optional)
1. Get reCAPTCHA keys from Google
2. Add reCAPTCHA to your form HTML
3. Validate the token in your Google Apps Script

## 📱 Mobile Optimization

The form handler is fully responsive and includes:
- Touch-friendly form elements
- Mobile-optimized loading states
- Responsive success/error messages
- Proper viewport handling

## 🔄 Backup & Recovery

### Automatic Backups
- Google Sheets automatically saves all data
- Version history available for 30 days
- Export to CSV/Excel anytime

### Migration
If you need to move to another solution:
1. Export data from Google Sheets
2. Update the `scriptUrl` in `form-handler.js`
3. No changes needed to your HTML forms

## 🚀 Deployment

### GitHub Pages
1. Commit all files to your repository
2. Push to GitHub
3. Enable GitHub Pages in repository settings
4. Your forms will work immediately!

### Custom Domain
Works perfectly with custom domains on GitHub Pages. No additional configuration needed.

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Verify your Google Apps Script is deployed correctly
3. Test the Google Apps Script directly using the `testFormSubmission()` function
4. Check that your Google Sheet has the correct permissions

## 🎨 Customization Examples

### Change Loading Message
```javascript
loadingOverlay.innerHTML = `
  <div class="text-center">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
    <p class="text-gray-600 font-medium">Processing your request...</p>
  </div>
`;
```

### Custom Success Actions
```javascript
if (response.success) {
  this.setFormState(form, 'success');
  form.reset();
  
  // Custom success actions
  window.location.href = '/thank-you.html';
  // or
  document.getElementById('special-offer').style.display = 'block';
}
```

This solution gives you enterprise-level form handling capabilities while staying completely free and maintaining full control over your data!
