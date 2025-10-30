# WebGlo Blog Engagement System - Setup Guide

## Quick Start: 5-Minute Setup

This system combines **Giscus** (for comments) with **Google Apps Script** (for engagement metrics) to create a fully functional blog with GitHub Pages.

---

## Part 1: Google Apps Script Setup (Backend)

### Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet: **"WebGlo Blog Engagement"**
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_ID]/edit
   ```

### Step 2: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Name it: **"WebGlo Blog Engagement API"**
4. Delete the default code
5. Copy all code from `backend/google-apps-script-blog-engagement.js`
6. Paste into the script editor

### Step 3: Configure Script Properties

1. In the Apps Script editor, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **"Add script property"**
4. Add:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: [Your spreadsheet ID from Step 1]
5. Click **"Save"**

### Step 4: Initialize the System

1. In the script editor, select the function: `initializeBlogSystem`
2. Click **"Run"**
3. **First time only**: Authorize the script when prompted
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to WebGlo Blog Engagement API (unsafe)"
   - Click "Allow"
4. Check the **Execution log** (bottom of screen) for success message
5. Go back to your spreadsheet - you should see 4 new sheets created:
   - `PostViews`
   - `PostLikes`
   - `PostSurveys`
   - `EngagementMetrics`

### Step 5: Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon next to "Select type"
3. Choose **"Web app"**
4. Configure:
   - **Description**: "WebGlo Blog Engagement API v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
5. Click **"Deploy"**
6. **Important**: Copy the **Web app URL** (you'll need this!)
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## Part 2: Giscus Setup (Comments)

### Step 1: Enable GitHub Discussions

1. Go to your repository: `https://github.com/GeorgiyAleksanyan/webglo-site`
2. Click **"Settings"**
3. Scroll to **"Features"**
4. Check ✅ **"Discussions"**

### Step 2: Configure Giscus

1. Go to [giscus.app](https://giscus.app/)
2. **Repository**: Enter `GeorgiyAleksanyan/webglo-site`
3. **Page ↔️ Discussions Mapping**: Choose **"Discussion title contains page pathname"**
4. **Discussion Category**: Choose **"Announcements"** (or create a "Blog Comments" category)
5. **Features**: 
   - ✅ Enable reactions for the main post
   - ✅ Emit discussion metadata
6. **Theme**: Choose **"preferred_color_scheme"** (auto light/dark)
7. Copy the generated `<script>` tag

### Step 3: Get Your Giscus Configuration

The generated script will look like:
```html
<script src="https://giscus.app/client.js"
        data-repo="GeorgiyAleksanyan/webglo-site"
        data-repo-id="YOUR_REPO_ID"
        data-category="Announcements"
        data-category-id="YOUR_CATEGORY_ID"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

**Save these values** - you'll add them to `post.html`

---

## Part 3: Frontend Integration

### Step 1: Update Configuration

1. Open `js/blog-engagement.js`
2. Find line 17:
   ```javascript
   this.apiUrl = config.apiUrl || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace with your deployment URL from Part 1, Step 5

**Or** create a config file:

**File: `js/config.js`**
```javascript
window.BLOG_CONFIG = {
  ENGAGEMENT_API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

### Step 2: Update post.html with Engagement Widgets

Add before the closing `</article>` tag:

```html
<!-- Engagement Widgets -->
<div class="blog-engagement-section">
  
  <!-- View Counter & Like Button -->
  <div class="engagement-stats">
    <div class="stat-item">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
      <span id="view-count">0</span> views
    </div>
    
    <button id="like-button" class="like-button">
      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
      </svg>
      <span id="like-count">0</span>
    </button>
  </div>
  
  <!-- Usefulness Survey -->
  <div id="survey-container" class="usefulness-survey">
    <p class="survey-question">Was this article helpful?</p>
    <div class="survey-buttons">
      <button id="survey-helpful" class="survey-button helpful">
        👍 Yes, helpful
      </button>
      <button id="survey-not-helpful" class="survey-button not-helpful">
        👎 Not helpful
      </button>
    </div>
    <p class="survey-stats">
      <span id="helpful-percentage">0%</span> found this helpful
      <span class="divider">•</span>
      <span id="survey-count">0 responses</span>
    </p>
  </div>
  
</div>
```

### Step 3: Add Giscus Comments Section

Add before the closing `</main>` or after the article:

```html
<!-- Comments Section (Giscus) -->
<section class="comments-section">
  <h2>Comments</h2>
  <script src="https://giscus.app/client.js"
          data-repo="GeorgiyAleksanyan/webglo-site"
          data-repo-id="YOUR_REPO_ID_HERE"
          data-category="Announcements"
          data-category-id="YOUR_CATEGORY_ID_HERE"
          data-mapping="pathname"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="1"
          data-input-position="bottom"
          data-theme="preferred_color_scheme"
          data-lang="en"
          crossorigin="anonymous"
          async>
  </script>
</section>
```

### Step 4: Add Script References

In `post.html` before `</body>`:

```html
<!-- Blog Engagement System -->
<script src="js/config.js"></script>
<script src="js/blog-engagement.js"></script>
```

### Step 5: Add CSS Styles

**File: `css/blog-engagement.css`**
```css
/* Engagement Section */
.blog-engagement-section {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.engagement-stats {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-item .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-size: 0.875rem;
}

.like-button:hover {
  border-color: #df00ff;
  color: #df00ff;
  transform: scale(1.05);
}

.like-button.liked {
  background: #df00ff;
  border-color: #df00ff;
  color: white;
}

.like-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Usefulness Survey */
.usefulness-survey {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.survey-question {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.survey-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.survey-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.survey-button:hover {
  border-color: #df00ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.survey-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.survey-stats {
  font-size: 0.75rem;
  color: #6b7280;
}

.survey-thank-you {
  padding: 2rem;
  text-align: center;
}

.thank-you-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* Comments Section */
.comments-section {
  margin: 4rem 0;
}

.comments-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #111827;
}

/* Notification Toast */
.blog-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s;
  z-index: 1000;
}

.blog-notification.show {
  opacity: 1;
  transform: translateY(0);
}

.blog-notification.success {
  border-left: 4px solid #10b981;
}

.blog-notification.error {
  border-left: 4px solid #ef4444;
}

.blog-notification.info {
  border-left: 4px solid #3b82f6;
}
```

---

## Part 4: Testing

### Test Checklist

1. **View Tracking**
   - Open a blog post
   - Check DevTools Console for successful API call
   - Verify view count increments in Google Sheets

2. **Like Button**
   - Click the like button
   - Verify it shows "liked" state
   - Check that count increments
   - Try liking again (should show "already liked")

3. **Survey**
   - Click "Yes, helpful" or "Not helpful"
   - Verify thank you message appears
   - Check Google Sheets for recorded response

4. **Comments (Giscus)**
   - Scroll to comments section
   - Sign in with GitHub
   - Leave a test comment
   - Verify it appears in GitHub Discussions

5. **Google Sheets Data**
   - Open your spreadsheet
   - Check each sheet has data:
     - `PostViews`: Each view listed
     - `PostLikes`: Post IDs with like counts
     - `PostSurveys`: Survey responses
     - `EngagementMetrics`: Aggregated stats

---

## Part 5: Production Deployment

### Security Checklist

- [ ] Script Properties set (not hardcoded in script)
- [ ] Google Apps Script deployed with correct permissions
- [ ] Giscus repo and category IDs configured
- [ ] API URL updated in frontend config
- [ ] Test all features in production environment

### Performance Optimization

- [ ] Enable browser caching for JS/CSS files
- [ ] Minify blog-engagement.js for production
- [ ] Set appropriate cache headers
- [ ] Monitor Google Apps Script quotas

---

## Troubleshooting

### "Failed to track view" error
- Check that API URL is correct in `blog-engagement.js`
- Verify Google Apps Script is deployed as "Anyone" access
- Check browser console for CORS errors

### Likes not incrementing
- Clear localStorage: `localStorage.clear()`
- Check Google Sheets for data
- Verify script has write permissions

### Giscus comments not loading
- Verify GitHub Discussions is enabled
- Check that repo and category IDs are correct
- Ensure giscus.app script is loaded (check Network tab)

### Google Apps Script quota exceeded
- Free tier: 20,000 executions/day
- Consider implementing client-side caching
- Batch API calls where possible

---

## Next Steps

1. **Analytics Integration**: Add Google Analytics to track all interactions
2. **Admin Dashboard**: Build a simple dashboard to view all metrics
3. **Email Notifications**: Get notified of new comments/survey responses
4. **A/B Testing**: Test different survey questions and button placements

---

## Support

If you encounter issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Google Apps Script execution logs
3. Check browser DevTools console
4. Verify all configuration values are correct

**System is ready! 🎉**
