// Migration Script: Convert blog-data.json to Google Apps Script Backend
// Run this in browser console on your blog page to migrate existing posts

class BlogMigration {
  constructor() {
    this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Replace with your actual URL
    this.existingPosts = [];
  }

  async loadExistingPosts() {
    try {
      const response = await fetch('/blog-data.json');
      const data = await response.json();
      this.existingPosts = data.posts || [];
      console.log(`Found ${this.existingPosts.length} existing posts to migrate`);
      return this.existingPosts;
    } catch (error) {
      console.error('Failed to load existing posts:', error);
      return [];
    }
  }

  async initializeBackend() {
    try {
      console.log('Initializing backend system...');
      const response = await fetch(`${this.apiBaseUrl}?path=init`, {
        method: 'POST'
      });
      const result = await response.json();
      console.log('Backend initialization result:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to initialize backend:', error);
      return false;
    }
  }

  async migrateSinglePost(post) {
    try {
      const postData = {
        title: post.title,
        slug: post.slug || this.generateSlug(post.title),
        excerpt: post.excerpt || '',
        content: post.content || '',
        author: post.author || 'WebGlo Team',
        category: post.category || 'general',
        tags: Array.isArray(post.tags) ? post.tags : [],
        image: post.image || '',
        imageAlt: post.imageAlt || '',
        readTime: post.readTime || this.estimateReadTime(post.content)
      };

      const response = await fetch(`${this.apiBaseUrl}?path=posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Migrated: ${post.title}`);
        
        // If the post has existing metrics, migrate those too
        if (post.views || post.likes || post.shares) {
          await this.migratePostMetrics(result.postId, {
            views: post.views || 0,
            likes: post.likes || 0,
            shares: post.shares || 0
          });
        }
        
        return true;
      } else {
        console.error(`❌ Failed to migrate: ${post.title}`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error migrating ${post.title}:`, error);
      return false;
    }
  }

  async migratePostMetrics(postId, metrics) {
    try {
      const response = await fetch(`${this.apiBaseUrl}?path=metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: postId,
          views: metrics.views,
          likes: metrics.likes,
          shares: metrics.shares
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`📊 Migrated metrics for post ${postId}`);
      }
    } catch (error) {
      console.error(`Failed to migrate metrics for ${postId}:`, error);
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  estimateReadTime(content) {
    if (!content) return 5;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async migrateAllPosts() {
    console.log('🚀 Starting blog migration...');
    
    // Initialize backend first
    const initialized = await this.initializeBackend();
    if (!initialized) {
      console.error('❌ Failed to initialize backend. Migration aborted.');
      return false;
    }

    // Load existing posts
    await this.loadExistingPosts();
    
    if (this.existingPosts.length === 0) {
      console.log('ℹ️ No posts found to migrate');
      return true;
    }

    let successCount = 0;
    let failureCount = 0;

    console.log(`📝 Migrating ${this.existingPosts.length} posts...`);
    
    for (const post of this.existingPosts) {
      const success = await this.migrateSinglePost(post);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✨ Migration Complete!`);
    console.log(`✅ Successfully migrated: ${successCount} posts`);
    console.log(`❌ Failed to migrate: ${failureCount} posts`);
    
    if (failureCount === 0) {
      console.log(`\n🎉 All posts migrated successfully!`);
      console.log(`\nNext steps:`);
      console.log(`1. Test the enhanced blog system`);
      console.log(`2. Update js/blog-enhanced.js with your API URL`);
      console.log(`3. Deploy the updated blog.html`);
      console.log(`4. Create backup of original blog-data.json`);
    }

    return failureCount === 0;
  }

  // Helper method to manually add a single post
  async addPost(postData) {
    return await this.migrateSinglePost(postData);
  }

  // Helper method to test the backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.apiBaseUrl}?path=posts`);
      const result = await response.json();
      console.log('✅ Backend connection successful');
      console.log('Current posts in backend:', result.posts?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }
}

// Example usage:
console.log(`
WebGlo Blog Migration Script
============================

To use this migration script:

1. First, update the apiBaseUrl with your Google Apps Script URL
2. Test the connection:
   const migration = new BlogMigration();
   await migration.testConnection();

3. Run the full migration:
   await migration.migrateAllPosts();

4. Or migrate individual posts:
   await migration.addPost({
     title: "Your Post Title",
     slug: "your-post-slug",
     excerpt: "Post excerpt...",
     content: "Full post content...",
     author: "Author Name",
     category: "web-development",
     tags: ["tag1", "tag2"],
     image: "https://example.com/image.jpg",
     imageAlt: "Image description",
     readTime: 8
   });

Note: Make sure to replace YOUR_SCRIPT_ID in the apiBaseUrl before running!
`);

// Make the class available globally
window.BlogMigration = BlogMigration;
