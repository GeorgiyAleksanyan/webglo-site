/**
 * Blog Post Generator
 * Generates individual HTML files for each blog post (SEO-friendly URLs)
 */

const fs = require('fs');
const path = require('path');

// Read posts data
const postsData = JSON.parse(fs.readFileSync('./blog/data/posts.json', 'utf8'));

// Template HTML
const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BFDSVY8Y4N"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-BFDSVY8Y4N');
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags (will be updated by JavaScript) -->
  <title>{{TITLE}} | WebGlo Blog</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <meta name="keywords" content="{{KEYWORDS}}">
  <meta name="author" content="{{AUTHOR}}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="{{TITLE}}">
  <meta property="og:description" content="{{DESCRIPTION}}">
  <meta property="og:image" content="{{IMAGE}}">
  <meta property="og:url" content="https://webglo.org/blog/{{SLUG}}.html">
  <meta property="og:site_name" content="WebGlo">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{TITLE}}">
  <meta name="twitter:description" content="{{DESCRIPTION}}">
  <meta name="twitter:image" content="{{IMAGE}}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://webglo.org/blog/{{SLUG}}.html" />
  
  <meta name="theme-color" content="#df00ff">
  <link rel="icon" type="image/svg+xml" href="../assets/logo.svg">
  <link rel="apple-touch-icon" href="../assets/logo.png">
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></noscript>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/mobile-first.css">
  <link rel="stylesheet" href="./styles/blog-engagement.css">
  <link rel="stylesheet" href="./styles/blog-post.css">
  
  <!-- SEO and Cookie Scripts -->
  <script src="../js/seo-utils.js"></script>
  <script src="../js/breadcrumb.js"></script>
  <script src="../js/cookie-consent.js"></script>
  
  <!-- Post Data -->
  <script>
    window.BLOG_POST_DATA = {{POST_JSON}};
  </script>
</head>
<body class="font-inter bg-white text-gray-900">
  <div id="webglo-navigation"></div>

  <!-- Breadcrumb Navigation -->
  <div id="breadcrumb-navigation" class="mt-16"></div>

  <!-- Article Header -->
  <section class="pt-32 pb-12 bg-gradient-to-br from-purple-50 via-white to-blue-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Category & Read Time -->
        <div class="flex items-center gap-4 mb-6">
          <span id="article-category" class="px-4 py-1 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white text-sm font-semibold rounded-full">
            {{CATEGORY}}
          </span>
          <span id="article-read-time" class="text-gray-600 text-sm">{{READ_TIME}}</span>
        </div>

        <!-- Title -->
        <h1 id="article-title" class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {{TITLE}}
        </h1>

        <!-- Author & Date -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-r from-[#df00ff] to-[#0cead9] rounded-full flex items-center justify-center text-white font-bold">
              <span id="author-initials">{{AUTHOR_INITIALS}}</span>
            </div>
            <div>
              <div id="article-author" class="font-semibold text-gray-900">{{AUTHOR}}</div>
              <div id="article-date" class="text-sm text-gray-600">{{DATE}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Article Content -->
  <section class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <!-- Sidebar (desktop) -->
        <div class="hidden lg:block lg:col-span-2">
          <div class="sticky top-24 space-y-6">
            <!-- View Counter -->
            <div id="view-counter" class="text-center p-4 bg-gray-50 rounded-xl">
              <div class="text-3xl font-bold text-[#df00ff]" id="view-count">-</div>
              <div class="text-xs text-gray-600 mt-1">Views</div>
            </div>
            
            <!-- Share Buttons -->
            <div class="flex flex-col gap-3">
              <button onclick="shareOnTwitter()" class="w-12 h-12 bg-[#1DA1F2] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center" title="Share on Twitter">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </button>
              
              <button onclick="shareOnLinkedIn()" class="w-12 h-12 bg-[#0077B5] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center" title="Share on LinkedIn">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              
              <button onclick="shareOnFacebook()" class="w-12 h-12 bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center" title="Share on Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
            
            <!-- Copy Link -->
            <div class="border-t border-gray-200 pt-3">
              <button onclick="copyLink()" class="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center group" title="Copy Link">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>

            <!-- Like Button Widget -->
            <div id="like-widget-sidebar" class="border-t border-gray-200 pt-3">
              <!-- Will be populated by engagement system -->
            </div>
          </div>
        </div>

        <!-- Main Article -->
        <article class="lg:col-span-10 prose prose-lg max-w-none">
          <!-- Hero Image -->
          <img id="article-hero-image" class="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg mb-8" src="{{IMAGE}}" alt="{{IMAGE_ALT}}">
          
          <!-- Article Content -->
          <div id="article-content" class="article-content">
            {{CONTENT}}
          </div>

          <!-- Tags -->
          <div id="article-tags" class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
            {{TAGS}}
          </div>

          <!-- Like Button (mobile) -->
          <div id="like-widget-mobile" class="lg:hidden mt-8">
            <!-- Will be populated by engagement system -->
          </div>

          <!-- Article Feedback Survey Widget -->
          <div id="survey-widget" class="mt-12">
            <!-- Will be populated by engagement system -->
          </div>

          <!-- Newsletter Signup Widget -->
          <div class="webglo-newsletter-widget mt-12 mb-12">
            <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-gray-100">
              <div class="text-center mb-6">
                <span class="inline-block px-4 py-1 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white text-sm font-semibold rounded-full mb-4">
                  📧 Join Our Newsletter
                </span>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Never Miss an Update</h3>
                <p class="text-gray-600">Get weekly insights, exclusive tips, and free resources delivered to your inbox.</p>
              </div>
              
              <form class="newsletter-form max-w-md mx-auto">
                <div class="flex flex-col sm:flex-row gap-3">
                  <input type="email" name="email" placeholder="Your email address" required 
                         class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                  <button type="submit" class="px-6 py-3 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold whitespace-nowrap">
                    Subscribe Free
                  </button>
                </div>
              </form>
              
              <p class="text-sm text-gray-500 mt-4 text-center">✓ Join 5,000+ entrepreneurs • No spam • Unsubscribe anytime</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Related Posts -->
      <div id="related-posts" class="mt-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
        <div id="related-posts-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Will be populated by JavaScript -->
        </div>
      </div>

      <!-- Comments Section (Giscus) -->
      <div id="giscus-comments" class="mt-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Comments</h2>
        <div class="giscus"></div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <div id="webglo-footer"></div>

  <!-- Components JavaScript -->
  <script src="../js/components.js"></script>

  <!-- Blog Configuration -->
  <script src="./scripts/config.js"></script>

  <!-- Blog Engagement System -->
  <script src="./scripts/blog-engagement.js"></script>

  <!-- Post Initialization -->
  <script src="./scripts/post-standalone.js"></script>
</body>
</html>`;

// Function to generate individual post HTML
function generatePostHTML(post) {
  let html = template;
  
  // Replace placeholders
  html = html.replace(/{{TITLE}}/g, post.title);
  html = html.replace(/{{DESCRIPTION}}/g, post.excerpt);
  html = html.replace(/{{KEYWORDS}}/g, post.tags ? post.tags.join(', ') : '');
  html = html.replace(/{{AUTHOR}}/g, post.author);
  html = html.replace(/{{SLUG}}/g, post.slug);
  html = html.replace(/{{IMAGE}}/g, post.image);
  html = html.replace(/{{IMAGE_ALT}}/g, post.imageAlt || post.title);
  html = html.replace(/{{CATEGORY}}/g, getCategoryName(post.category));
  html = html.replace(/{{READ_TIME}}/g, post.readTime);
  html = html.replace(/{{DATE}}/g, post.date);
  html = html.replace(/{{AUTHOR_INITIALS}}/g, getInitials(post.author));
  html = html.replace(/{{CONTENT}}/g, post.content || '<p>Content coming soon...</p>');
  
  // Tags HTML
  const tagsHTML = post.tags && post.tags.length > 0 ? `
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
      <span class="font-semibold">Tags:</span>
    </div>
    <div class="flex flex-wrap gap-2">
      ${post.tags.map(tag => `
        <a href="./?search=${encodeURIComponent(tag)}" 
           class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#df00ff] hover:text-white transition-colors">
          #${tag}
        </a>
      `).join('')}
    </div>
  ` : '';
  
  html = html.replace(/{{TAGS}}/g, tagsHTML);
  
  // Post JSON data
  html = html.replace(/{{POST_JSON}}/g, JSON.stringify(post, null, 2));
  
  return html;
}

function getCategoryName(categoryId) {
  const categories = {
    'web-development': 'Web Development',
    'seo': 'SEO & Analytics',
    'digital-marketing': 'Digital Marketing',
    'tutorials': 'Tutorials',
    'digital-strategy': 'Digital Strategy'
  };
  return categories[categoryId] || categoryId;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

// Generate HTML files for all posts
console.log('Generating individual blog post HTML files...\n');

postsData.posts.forEach(post => {
  const html = generatePostHTML(post);
  const filename = `./blog/${post.slug}.html`;
  
  fs.writeFileSync(filename, html, 'utf8');
  console.log(`✓ Generated: ${filename}`);
});

console.log(`\n✅ Successfully generated ${postsData.posts.length} blog post files!`);
console.log('\nNow you can access posts at URLs like:');
console.log('https://webglo.org/blog/seo-ranking-factors-2024.html');
