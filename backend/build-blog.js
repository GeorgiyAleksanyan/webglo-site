#!/usr/bin/env node

/**
 * WebGlo Blog Builder
 * Generates optimized JSON files for the hybrid blog system
 */

const fs = require('fs').promises;
const path = require('path');

class BlogBuilder {
  constructor() {
    this.sourceDir = path.join(__dirname, '../blog-data');
    this.postsDir = path.join(this.sourceDir, 'posts');
    this.outputDir = path.join(__dirname, '../blog-data');
    
    this.posts = [];
    this.categories = new Map();
    this.tags = new Set();
  }

  async build() {
    console.log('🚀 Building WebGlo Blog Data...\n');
    
    try {
      // Ensure directories exist
      await this.ensureDirectories();
      
      // Load existing posts
      await this.loadPosts();
      
      // Process posts
      await this.processPosts();
      
      // Generate category data
      await this.generateCategories();
      
      // Generate tag data
      await this.generateTags();
      
      // Generate main index
      await this.generateIndex();
      
      // Generate RSS feed
      await this.generateRSSFeed();
      
      // Generate sitemap entries
      await this.generateSitemapEntries();
      
      // Optimize images (if needed)
      await this.optimizeImages();
      
      console.log('✅ Blog build completed successfully!\n');
      this.printStats();
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    const dirs = [this.sourceDir, this.postsDir, this.outputDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async loadPosts() {
    try {
      // Load from main posts.json if it exists
      const postsFile = path.join(this.sourceDir, 'posts.json');
      const data = await fs.readFile(postsFile, 'utf8');
      const postsData = JSON.parse(data);
      
      this.posts = postsData.posts || [];
      console.log(`📖 Loaded ${this.posts.length} posts from posts.json`);
      
    } catch (error) {
      console.log('ℹ️ No existing posts.json found, starting fresh');
      this.posts = [];
    }
  }

  async processPosts() {
    const processedPosts = [];
    
    for (const post of this.posts) {
      try {
        // Validate required fields
        if (!post.id || !post.title) {
          console.warn(`⚠️ Skipping invalid post: ${post.id || 'unknown'}`);
          continue;
        }
        
        // Process and enrich post data
        const processedPost = await this.processPost(post);
        processedPosts.push(processedPost);
        
        // Save individual post file
        await this.saveIndividualPost(processedPost);
        
        // Track categories and tags
        this.trackCategoriesAndTags(processedPost);
        
      } catch (error) {
        console.error(`❌ Error processing post ${post.id}:`, error.message);
      }
    }
    
    this.posts = processedPosts;
    console.log(`✅ Processed ${processedPosts.length} posts`);
  }

  async processPost(post) {
    // Generate slug if missing
    if (!post.slug) {
      post.slug = this.generateSlug(post.title);
    }
    
    // Generate excerpt if missing
    if (!post.excerpt && post.content) {
      post.excerpt = this.generateExcerpt(post.content);
    }
    
    // Estimate read time if missing
    if (!post.readTime && post.content) {
      post.readTime = this.estimateReadTime(post.content);
    }
    
    // Set default values
    post.status = post.status || 'published';
    post.featured = post.featured || false;
    post.publishDate = post.publishDate || new Date().toISOString();
    post.author = post.author || 'WebGlo Team';
    
    // Generate URL if missing
    if (!post.url) {
      post.url = `blog/${post.slug}.html`;
    }
    
    // Validate and clean tags
    if (Array.isArray(post.tags)) {
      post.tags = post.tags.filter(tag => tag && typeof tag === 'string');
    } else {
      post.tags = [];
    }
    
    return post;
  }

  async saveIndividualPost(post) {
    try {
      const postFile = path.join(this.postsDir, `${post.id}.json`);
      
      // Create enhanced post data with full content
      const fullPost = {
        ...post,
        meta: {
          wordCount: post.content ? post.content.split(/\s+/).length : 0,
          lastModified: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      await fs.writeFile(postFile, JSON.stringify(fullPost, null, 2));
      console.log(`💾 Saved individual post: ${post.id}.json`);
      
    } catch (error) {
      console.error(`Failed to save post ${post.id}:`, error.message);
    }
  }

  trackCategoriesAndTags(post) {
    // Track categories
    if (post.category) {
      if (!this.categories.has(post.category)) {
        this.categories.set(post.category, {
          id: post.category,
          name: this.formatCategoryName(post.category),
          description: this.generateCategoryDescription(post.category),
          count: 0
        });
      }
      this.categories.get(post.category).count++;
    }
    
    // Track tags
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => this.tags.add(tag));
    }
  }

  async generateCategories() {
    const categoriesArray = Array.from(this.categories.values());
    const categoriesFile = path.join(this.outputDir, 'categories.json');
    
    const categoriesData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      total: categoriesArray.length,
      categories: categoriesArray
    };
    
    await fs.writeFile(categoriesFile, JSON.stringify(categoriesData, null, 2));
    console.log(`📂 Generated categories.json with ${categoriesArray.length} categories`);
  }

  async generateTags() {
    const tagsArray = Array.from(this.tags).sort();
    const tagsFile = path.join(this.outputDir, 'tags.json');
    
    const tagsData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      total: tagsArray.length,
      tags: tagsArray
    };
    
    await fs.writeFile(tagsFile, JSON.stringify(tagsData, null, 2));
    console.log(`🏷️ Generated tags.json with ${tagsArray.length} tags`);
  }

  async generateIndex() {
    const indexFile = path.join(this.outputDir, 'posts.json');
    
    // Sort posts by publish date (newest first)
    const sortedPosts = [...this.posts].sort((a, b) => 
      new Date(b.publishDate) - new Date(a.publishDate)
    );
    
    // Only include published posts in the index
    const publishedPosts = sortedPosts.filter(post => post.status === 'published');
    
    const indexData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalPosts: publishedPosts.length,
      categories: Array.from(this.categories.values()),
      tags: Array.from(this.tags).sort(),
      posts: publishedPosts.map(post => {
        // Remove content from index to keep it lightweight
        const { content, ...postIndex } = post;
        return postIndex;
      })
    };
    
    await fs.writeFile(indexFile, JSON.stringify(indexData, null, 2));
    console.log(`📝 Generated posts.json index with ${publishedPosts.length} published posts`);
  }

  async generateRSSFeed() {
    const rssFile = path.join(this.outputDir, 'rss.xml');
    
    const publishedPosts = this.posts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, 20); // Latest 20 posts
    
    const rssXML = this.generateRSSXML(publishedPosts);
    
    await fs.writeFile(rssFile, rssXML);
    console.log(`📡 Generated RSS feed with ${publishedPosts.length} posts`);
  }

  generateRSSXML(posts) {
    const baseUrl = 'https://webglo.org';
    const now = new Date().toUTCString();
    
    let rssItems = '';
    
    posts.forEach(post => {
      const postUrl = `${baseUrl}/${post.url}`;
      const pubDate = new Date(post.publishDate).toUTCString();
      
      rssItems += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <author>hello@webglo.org (${post.author})</author>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${this.formatCategoryName(post.category)}]]></category>
    </item>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WebGlo Blog</title>
    <link>${baseUrl}/blog.html</link>
    <description>Expert insights on web development, digital marketing, SEO strategies, and business growth from WebGlo professionals.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/blog-data/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
  }

  async generateSitemapEntries() {
    const sitemapFile = path.join(this.outputDir, 'sitemap-entries.json');
    
    const publishedPosts = this.posts.filter(post => post.status === 'published');
    
    const sitemapEntries = publishedPosts.map(post => ({
      url: `https://webglo.org/${post.url}`,
      lastmod: post.publishDate,
      changefreq: 'weekly',
      priority: post.featured ? '0.8' : '0.6'
    }));
    
    await fs.writeFile(sitemapFile, JSON.stringify(sitemapEntries, null, 2));
    console.log(`🗺️ Generated sitemap entries for ${sitemapEntries.length} posts`);
  }

  async optimizeImages() {
    // Placeholder for image optimization
    // Could integrate with sharp, imagemin, etc.
    console.log('🖼️ Image optimization: Placeholder (implement as needed)');
  }

  // ===== UTILITY METHODS =====

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  generateExcerpt(content, maxLength = 160) {
    if (!content) return '';
    
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last complete sentence within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    // Fallback to word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  estimateReadTime(content) {
    if (!content) return 5;
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  formatCategoryName(category) {
    const categoryMap = {
      'web-development': 'Web Development',
      'digital-marketing': 'Digital Marketing',
      'digital-strategy': 'Digital Strategy',
      'seo': 'SEO & Analytics',
      'business': 'Business Growth',
      'tutorials': 'Tutorials',
      'case-studies': 'Case Studies'
    };
    
    return categoryMap[category] || category.replace('-', ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  generateCategoryDescription(category) {
    const descriptions = {
      'web-development': 'Technical guides and best practices for modern web development',
      'digital-marketing': 'Marketing strategies and conversion optimization techniques',
      'digital-strategy': 'Strategic insights for digital transformation and growth',
      'seo': 'Search optimization and performance tracking strategies',
      'business': 'Business growth strategies and entrepreneurship insights',
      'tutorials': 'Step-by-step guides and practical tutorials',
      'case-studies': 'Real-world examples and success stories'
    };
    
    return descriptions[category] || `Content related to ${this.formatCategoryName(category)}`;
  }

  printStats() {
    console.log('📊 Build Statistics:');
    console.log(`   • Posts: ${this.posts.length}`);
    console.log(`   • Categories: ${this.categories.size}`);
    console.log(`   • Tags: ${this.tags.size}`);
    console.log(`   • Published: ${this.posts.filter(p => p.status === 'published').length}`);
    console.log(`   • Featured: ${this.posts.filter(p => p.featured).length}`);
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const builder = new BlogBuilder();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'build':
    case undefined:
      builder.build();
      break;
      
    case 'help':
      console.log(`
WebGlo Blog Builder

Usage:
  node build-blog.js [command]

Commands:
  build (default)  Build all blog data files
  help            Show this help message

Examples:
  node build-blog.js
  node build-blog.js build
      `);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "node build-blog.js help" for usage information');
      process.exit(1);
  }
}

module.exports = BlogBuilder;
