# Comment System Deployment Guide

## Overview
This guide walks you through setting up the secure comment system with Google Apps Script backend for the WebGlo blog.

## Prerequisites
- Google Account
- Access to Google Sheets and Google Apps Script
- Basic understanding of web development

## Step 1: Set Up Google Sheets

### 1.1 Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "WebGlo Comments Database"
4. Note the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 1.2 Set Up the Comments Sheet
1. Rename "Sheet1" to "Comments"
2. In row 1, create the following headers:
   ```
   A1: id
   B1: postId
   C1: author
   D1: email
   E1: content
   F1: timestamp
   G1: status
   H1: ipAddress
   I1: userAgent
   J1: likes
   K1: parentId
   ```

### 1.3 Create Analytics Sheet (Optional)
1. Add a new sheet called "Analytics"
2. Headers:
   ```
   A1: timestamp
   B1: event
   C1: postId
   D1: commentId
   E1: ipAddress
   F1: userAgent
   ```

## Step 2: Set Up Google Apps Script

### 2.1 Create the Script
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the contents of `backend/comments-backend.gs`
4. Rename the project to "WebGlo Comments API"

### 2.2 Configure the Script
1. In the script, update the `SHEET_ID` in the CONFIG section:
   ```javascript
   SHEET_ID: 'YOUR_ACTUAL_SPREADSHEET_ID_HERE'
   ```

2. Set up script properties for security:
   - Go to Project Settings (gear icon)
   - Click "Script Properties"
   - Add the following properties:
     ```
     COMMENTS_SHEET_ID: your_spreadsheet_id
     ALLOWED_ORIGINS: https://webglo.org,https://www.webglo.org
     ADMIN_EMAIL: your-admin@email.com
     ADMIN_KEY: your-secure-random-admin-key-here
     ```

### 2.3 Deploy the Script
1. Click "Deploy" > "New deployment"
2. Click the gear icon next to "Type" and select "Web app"
3. Configure:
   - Description: "WebGlo Comments API"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click "Deploy"
5. Copy the Web app URL - this is your API endpoint
6. Authorize the script when prompted

## Step 3: Update Frontend Configuration

### 3.1 Update Comment System Configuration
In `js/comments-system.js`, replace the API URL:
```javascript
this.apiUrl = 'YOUR_ACTUAL_GOOGLE_APPS_SCRIPT_URL_HERE';
```

### 3.2 Update Admin Dashboard Configuration
In `admin/comments-moderation.html`, replace the API URL:
```javascript
this.apiUrl = 'YOUR_ACTUAL_GOOGLE_APPS_SCRIPT_URL_HERE';
```

## Step 4: Test the System

### 4.1 Test Comment Submission
1. Open a blog post with comments enabled
2. Submit a test comment
3. Check your Google Sheet to see if the comment appears
4. If moderation is enabled, the status should be "pending"

### 4.2 Test Comment Moderation
1. Open `admin/comments-moderation.html`
2. Enter your admin key
3. Try approving/rejecting comments
4. Verify the status changes in Google Sheets

### 4.3 Test Comment Display
1. Approve a comment in the admin panel
2. Refresh the blog post
3. Verify the comment appears for all users

## Step 5: Security Configuration

### 5.1 Admin Key Security
- Generate a strong, random admin key (at least 32 characters)
- Store it securely and don't share it
- Consider using a password manager

### 5.2 CORS Configuration
- Update `ALLOWED_ORIGINS` to include only your actual domains
- Remove localhost/testing URLs for production

### 5.3 Rate Limiting
- Adjust `MAX_COMMENTS_PER_IP_PER_HOUR` based on your needs
- Monitor for abuse and adjust as necessary

## Step 6: Content Moderation Setup

### 6.1 Enable Email Notifications
1. In Google Apps Script, the system will send emails to `ADMIN_EMAIL`
2. Make sure this email is accessible for moderation notifications

### 6.2 Configure Spam Filters
- Update `SPAM_KEYWORDS` array with relevant terms
- Add profanity filters as needed
- Adjust auto-moderation rules

## Step 7: Production Deployment

### 7.1 Update All URLs
- Replace all localhost/testing URLs with production URLs
- Update CORS origins
- Test thoroughly

### 7.2 Monitor and Maintain
- Check Google Apps Script execution logs regularly
- Monitor comment quality and adjust filters
- Backup your Google Sheets data regularly

## Troubleshooting

### Common Issues

**Comments not appearing:**
- Check Google Apps Script execution logs
- Verify CORS settings
- Ensure API URL is correct

**Moderation not working:**
- Verify admin key is correct
- Check script permissions
- Look for errors in browser console

**Rate limiting issues:**
- Adjust rate limiting settings
- Clear rate limit data in script if needed

**CORS errors:**
- Verify domain is in ALLOWED_ORIGINS
- Check for typos in domain names

### Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: See if API calls are successful
3. **Check Google Apps Script Logs**: Go to Executions tab in Apps Script
4. **Test with Postman**: Test API endpoints directly

## Security Best Practices

1. **Regular Updates**: Keep monitoring and update spam filters
2. **Admin Key Rotation**: Change admin key periodically
3. **Monitor Usage**: Watch for unusual activity patterns
4. **Backup Data**: Regular exports of comment data
5. **Review Permissions**: Ensure script has minimal necessary permissions

## Performance Optimization

1. **Caching**: Frontend caches approved comments
2. **Pagination**: Large comment threads are paginated
3. **Lazy Loading**: Comments load as needed
4. **Efficient Queries**: Backend optimizes Google Sheets queries

## Future Enhancements

Possible improvements you could add:
- User authentication/registration
- Comment threading (replies)
- Like/dislike functionality
- Advanced spam detection
- Comment search functionality
- Email notifications for replies
- Social media integration
- Comment analytics dashboard

## Support

If you encounter issues:
1. Check this documentation first
2. Review Google Apps Script documentation
3. Check browser developer tools
4. Test with minimal examples
5. Consider reaching out to Google Apps Script community forums

---

**Note**: This system provides a robust, free solution for blog comments using Google's infrastructure. While it may not scale to millions of comments, it's perfect for small to medium-sized blogs and provides enterprise-level features like moderation, spam protection, and analytics.
