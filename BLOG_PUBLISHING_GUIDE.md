# WebGlo Blog Publishing Guide

## Overview
This guide explains how to add new blog posts to the WebGlo website using our streamlined JSON-based system.

## Publishing a New Blog Post

### Step 1: Add Post Data to blog-data.json

1. Open `blog-data.json`
2. Add a new post object to the `posts` array
3. Use this template:

```json
{
  "id": "your-post-slug",
  "title": "Your Post Title",
  "excerpt": "A brief description of your post (150-200 characters).",
  "content": "Your full post content in markdown format...",
  "author": "Author Name",
  "date": "Month DD, YYYY",
  "readTime": "X min read",
  "category": "web-development",
  "tags": ["tag1", "tag2", "tag3"],
  "image": "https://images.unsplash.com/your-image-url",
  "imageAlt": "Description of the image"
}
```

### Step 2: Add Post Card to blog.html

1. Open `blog.html`
2. Find the blog posts grid section
3. Add a new article card:

```html
<article class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 blog-post-card" data-category="your-category" data-tags="tag1,tag2,tag3">
  <div class="relative overflow-hidden">
    <img src="your-image-url" alt="Your Image Alt" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300">
    <div class="absolute top-4 left-4">
      <span class="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
        Your Category
      </span>
    </div>
  </div>
  <div class="p-6">
    <div class="mb-3">
      <span class="text-xs text-gray-500">Month DD, YYYY • X min read</span>
    </div>
    <h3 class="text-xl font-bold text-gray-900 mb-3 hover:text-[#df00ff] transition-colors">
      Your Post Title
    </h3>
    <p class="text-gray-600 mb-4 leading-relaxed">
      Your post excerpt here...
    </p>
    <div class="flex items-center justify-between">
      <a href="post.html?id=your-post-slug" class="text-[#df00ff] font-semibold hover:text-[#0cead9] transition-colors">
        Read More →
      </a>
      <button class="like-btn flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors" data-post-id="your-post-slug">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <span class="like-count">0</span>
      </button>
    </div>
  </div>
</article>
```

### Step 3: Test Your Post

1. Start the local server: `python -m http.server 8080`
2. Visit `http://localhost:8080/blog.html`
3. Check that your post appears in the listing
4. Click "Read More" to test the dynamic loading
5. Verify the post content, images, and metadata display correctly

## Content Guidelines

### Post ID (slug)
- Use lowercase letters, numbers, and hyphens only
- Keep it descriptive but concise
- Example: `react-hooks-tutorial-2024`

### Categories
Available categories (use exactly as shown):
- `web-development`
- `digital-marketing` 
- `seo`
- `design`
- `business`

### Content Format
- Use markdown syntax in the content field
- Escape quotes in JSON: `"` becomes `\"`
- Use `\n\n` for paragraph breaks
- Headers: `# H1`, `## H2`, `### H3`
- Bold: `**bold text**`
- Lists: Start lines with `- ` for bullet points

### Images
- Use high-quality images from Unsplash or similar
- Recommended size: 1200x800px or larger
- Include descriptive alt text
- Use HTTPS URLs only

### SEO Optimization
- Keep titles under 60 characters
- Excerpts should be 150-200 characters
- Include relevant keywords in tags
- Use descriptive image alt text

## File Structure
```
webglo_site/
├── blog-data.json     # Central content database
├── blog.html          # Blog listing page
├── post.html          # Dynamic post template
└── js/
    ├── blog.js         # Blog functionality
    └── post-loader.js  # Dynamic content loading
```

## Advanced Features

### Table of Contents
Posts with 3+ headings automatically get a table of contents.

### Related Posts
Related posts are automatically shown based on matching categories.

### Social Sharing
Built-in social sharing for Twitter, LinkedIn, and Facebook.

### Reading Progress
Visual reading progress bar updates as users scroll.

### Search Integration
New posts are automatically searchable once added to blog-data.json.

## Troubleshooting

### Post Not Loading
1. Check that the post ID in the URL matches the ID in blog-data.json
2. Verify JSON syntax is valid (use a JSON validator)
3. Ensure the post-loader.js script is included in post.html

### Images Not Showing
1. Verify image URLs are accessible
2. Check that URLs use HTTPS
3. Ensure alt text is provided

### Search Not Finding Post
1. Confirm post exists in blog-data.json
2. Check that categories and tags are properly formatted
3. Verify the blog.js script is loading correctly

## Quick Checklist

Before publishing a new post:
- [ ] Added post data to blog-data.json
- [ ] Added post card to blog.html  
- [ ] Tested locally on development server
- [ ] Verified post loads correctly via dynamic URL
- [ ] Checked image loading and alt text
- [ ] Confirmed search finds the post
- [ ] Validated JSON syntax
- [ ] Tested "Read More" link functionality

## GitHub Pages Deployment

Once you've tested locally:
1. Commit changes to your repository
2. Push to the main branch
3. GitHub Pages will automatically deploy your changes
4. Test the live site to ensure everything works in production

This system provides a scalable, maintainable way to manage blog content without requiring a database or complex CMS setup.
