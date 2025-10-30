# WebGlo Blog System

A modern, hybrid Jamstack blog with static content, Giscus comments, and Google Apps Script engagement tracking.

## 📁 Folder Structure

```
blog/
├── index.html              # Main blog listing page
├── post.html               # Individual blog post template
├── data/
│   └── posts.json         # Blog post content (static data)
├── scripts/
│   ├── config.js          # Blog configuration
│   ├── blog-listing.js    # Blog listing functionality
│   └── blog-engagement.js # Engagement tracking (views, likes, surveys)
├── styles/
│   └── blog-engagement.css # Engagement widgets styling
├── backend/
│   └── google-apps-script-blog-engagement.js # Google Apps Script backend
└── docs/
    ├── BLOG_ENGAGEMENT_SETUP.md           # Setup guide
    └── BLOG_IMPLEMENTATION_SUMMARY.md     # Implementation details
```

## 🚀 Quick Start

### 1. Local Development

Start a local server to test the blog:

**Option A: Python**
```bash
cd c:\Dev\webglo-site
python -m http.server 8000
```

**Option B: Node.js (npx)**
```bash
cd c:\Dev\webglo-site
npx serve
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → Open with Live Server

Then visit: `http://localhost:8000/blog/`

### 2. Deploy Google Apps Script Backend

1. Open [Google Apps Script](https://script.google.com/)
2. Create a new project: **"WebGlo Blog Engagement"**
3. Copy code from `backend/google-apps-script-blog-engagement.js`
4. Set up Google Sheets (see detailed guide in `docs/BLOG_ENGAGEMENT_SETUP.md`)
5. Deploy as Web App (Anyone can access)
6. Copy the deployment URL
7. Update `scripts/config.js` with your URL

### 3. Configure Giscus Comments

1. Visit [giscus.app](https://giscus.app/)
2. Connect your GitHub repository
3. Enable Discussions in your repo
4. Configure settings and copy the generated values
5. Update `scripts/config.js` with Giscus settings

### 4. Test Everything

- [ ] Blog listing loads all posts
- [ ] Search and filters work
- [ ] Individual posts load correctly
- [ ] View counter increments
- [ ] Like button works
- [ ] Survey appears and submits
- [ ] Giscus comments load
- [ ] Social sharing works
- [ ] Newsletter signup works

## 📝 Adding New Blog Posts

Edit `data/posts.json` and add a new post object:

```json
{
  "id": "unique-post-id",
  "title": "Your Post Title",
  "slug": "your-post-slug",
  "excerpt": "A brief summary of your post",
  "content": "<h2>Your Content</h2><p>Full HTML content here</p>",
  "author": "Author Name",
  "date": "January 15, 2024",
  "readTime": "5 min read",
  "category": "web-development",
  "image": "https://images.unsplash.com/...",
  "imageAlt": "Image description",
  "tags": ["tag1", "tag2", "tag3"]
}
```

**Categories:**
- `digital-strategy`
- `web-development`
- `seo`
- `digital-marketing`
- `tutorials`

## 🎨 Features

### Blog Listing (`index.html`)
- ✅ Responsive grid layout
- ✅ Search functionality
- ✅ Category filtering
- ✅ Tag filtering
- ✅ Sort by date/title
- ✅ Load more pagination
- ✅ Featured post section
- ✅ Sidebar widgets (categories, tags, popular posts)

### Blog Post (`post.html`)
- ✅ Reading progress bar
- ✅ Social sharing sidebar
- ✅ View counter
- ✅ Like button
- ✅ Article feedback survey
- ✅ Giscus comments
- ✅ Newsletter signup
- ✅ Related posts
- ✅ Tag links
- ✅ SEO meta tags

### Engagement Tracking
- ✅ **Views:** Automatically tracked when post loads
- ✅ **Likes:** Click to like, stores in Google Sheets
- ✅ **Surveys:** "Was this helpful?" feedback
- ✅ **Analytics:** Real-time metrics in Google Sheets

### Comments System
- ✅ **Giscus:** Free, GitHub Discussions-based comments
- ✅ Markdown support
- ✅ Reactions
- ✅ Moderation via GitHub

## ⚙️ Configuration

All configuration is in `scripts/config.js`:

```javascript
window.BLOG_CONFIG = {
  // Data source
  DATA_URL: './data/posts.json',
  
  // Google Apps Script API
  ENGAGEMENT_API_URL: 'YOUR_DEPLOYMENT_URL_HERE',
  
  // Giscus comments
  GISCUS: {
    ENABLED: true,
    REPO: 'username/repo',
    REPO_ID: 'YOUR_REPO_ID',
    // ... more settings
  },
  
  // Feature flags
  FEATURES: {
    ENGAGEMENT: true,
    COMMENTS: true,
    NEWSLETTER: true
  }
};
```

## 📊 Google Sheets Backend

The backend uses 4 sheets:

1. **PostViews** - Tracks page views per post
2. **PostLikes** - Stores likes with timestamps
3. **PostSurveys** - Collects feedback responses
4. **EngagementMetrics** - Aggregated analytics

See `docs/BLOG_ENGAGEMENT_SETUP.md` for detailed setup instructions.

## 🔒 Security

- ✅ Google Apps Script runs server-side (secure)
- ✅ No API keys exposed in frontend
- ✅ Rate limiting via Google Apps Script quotas
- ✅ CORS handled by Google Apps Script
- ✅ Input validation on backend

## 🚢 Deployment

### GitHub Pages
1. Commit all changes
2. Push to your repository
3. GitHub Pages will automatically build
4. Blog accessible at: `https://yourusername.github.io/blog/`

### Custom Domain
1. Update `CNAME` file in root
2. Configure DNS records
3. Update canonical URLs in `index.html` and `post.html`

## 📚 Documentation

Detailed guides in `docs/` folder:
- **BLOG_ENGAGEMENT_SETUP.md** - Complete setup guide for Google Apps Script
- **BLOG_IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🐛 Troubleshooting

### Posts not loading
- Check `data/posts.json` is valid JSON
- Verify `DATA_URL` in `config.js`
- Check browser console for errors

### Engagement features not working
- Verify Google Apps Script is deployed as "Web App"
- Check `ENGAGEMENT_API_URL` in `config.js`
- Ensure Google Sheets are created correctly
- Check Apps Script execution logs

### Giscus comments not loading
- Verify repository has Discussions enabled
- Check all Giscus settings in `config.js`
- Ensure `REPO` and `REPO_ID` are correct

### Styles not loading
- Verify paths: `../css/` for main styles, `./styles/` for blog styles
- Check browser developer tools Network tab
- Ensure Tailwind CDN is loading

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 🎯 Performance

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Static assets:** Cached via service worker (`sw.prod.js`)

## 🤝 Contributing

To add features or fix bugs:
1. Test locally first
2. Update documentation
3. Ensure all features still work
4. Commit with clear messages

## 📧 Support

For issues or questions:
- Check documentation in `docs/` folder
- Review setup guides
- Contact WebGlo team

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Maintainer:** WebGlo Team
