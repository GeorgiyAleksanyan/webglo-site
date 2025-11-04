/**
 * WebGlo Blog Automation - Blog Poster
 * Version: 1.0 - GitHub Pages Edition with AdSense
 * 
 * This module handles AI-powered content generation and GitHub publishing.
 * Generates monetization-ready blog posts with strategic ad placement.
 * 
 * PUBLISHING FLOW:
 * 1. Get next topic from queue
 * 2. Generate content with Gemini AI
 * 3. Create standalone HTML file
 * 4. Update posts.json
 * 5. Commit to GitHub
 * 6. Track analytics
 * 
 * ADSENSE INTEGRATION:
 * - Auto Ads (recommended) or Manual Units
 * - 5 strategic ad zones
 * - Ad blocker detection
 * - Content-to-ad ratio optimization
 */

// ============================================================================
// ADSENSE CODE GENERATION
// ============================================================================

const AdSenseUtils_ = {
  /**
   * Generates AdSense auto ads script
   */
  getAutoAdsScript: function() {
    const CONFIG = ConfigService_.get();
    return `<!-- Google AdSense Auto Ads -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.ADSENSE_PUBLISHER_ID}"
     crossorigin="anonymous"></script>`;
  },
  
  /**
   * Generates manual ad unit
   */
  getManualAdUnit: function(slot, format = 'auto', style = '') {
    const CONFIG = ConfigService_.get();
    return `<!-- WebGlo Blog Ad -->
<ins class="adsbygoogle"
     style="display:block${style ? '; ' + style : ''}"
     data-ad-client="${CONFIG.ADSENSE_PUBLISHER_ID}"
     data-ad-slot="${slot}"
     data-ad-format="${format}"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
  },
  
  /**
   * Generates ad blocker detection script
   */
  getAdBlockerDetectionScript: function() {
    return `<script>
// Ad Blocker Detection
(function() {
  const testAd = document.createElement('div');
  testAd.innerHTML = '&nbsp;';
  testAd.className = 'adsbox';
  testAd.style.position = 'absolute';
  testAd.style.top = '-1px';
  testAd.style.left = '-1px';
  testAd.style.width = '1px';
  testAd.style.height = '1px';
  document.body.appendChild(testAd);
  
  setTimeout(function() {
    if (testAd.offsetHeight === 0) {
      // Ad blocker detected - show polite message
      const adContainers = document.querySelectorAll('.ad-container');
      adContainers.forEach(function(container) {
        container.innerHTML = \`
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              📢 We notice you're using an ad blocker. We respect your choice! <br>
              Our ads help keep quality content free. Consider whitelisting us 🙏
            </p>
          </div>
        \`;
      });
    }
    document.body.removeChild(testAd);
  }, 100);
})();
</script>`;
  },
  
  /**
   * Generates strategic ad placement HTML
   */
  getAdPlacements: function(contentWordCount, useAutoAds = true) {
    if (useAutoAds) {
      // Auto ads handle placement automatically
      return {
        header: this.getAutoAdsScript(),
        afterIntro: '<!-- Auto Ads will place ads automatically -->',
        midContent: '',
        beforeConclusion: '',
        sidebar: '',
        footer: ''
      };
    }
    
    // Manual ad units (requires ad unit IDs from AdSense)
    return {
      header: this.getAutoAdsScript(),
      afterIntro: `<div class="ad-container" style="margin: 30px 0; text-align: center;">
  ${this.getManualAdUnit('YOUR_SLOT_ID_1', 'auto')}
</div>`,
      midContent: contentWordCount > 1500 ? `<div class="ad-container" style="margin: 30px 0; text-align: center;">
  ${this.getManualAdUnit('YOUR_SLOT_ID_2', 'auto')}
</div>` : '',
      beforeConclusion: `<div class="ad-container" style="margin: 30px 0; text-align: center;">
  ${this.getManualAdUnit('YOUR_SLOT_ID_3', 'auto')}
</div>`,
      sidebar: `<div class="ad-container" style="margin: 20px 0;">
  ${this.getManualAdUnit('YOUR_SLOT_ID_4', 'vertical')}
</div>`,
      footer: ''
    };
  }
};

// ============================================================================
// CONTENT GENERATION
// ============================================================================

const ContentGenerator_ = {
  /**
   * Generates a complete, monetization-ready blog post
   */
  generateMonetizationReadyBlog: function(topic) {
    const CONFIG = ConfigService_.get();
    
    const systemHint = `You are a professional content writer for WebGlo, a web development and digital marketing agency.

COMPANY CONTEXT:
${JSON.stringify(CONFIG.BUSINESS_CLAIMS, null, 2)}

CONTENT REQUIREMENTS:
1. E-E-A-T Optimization:
   - Demonstrate EXPERIENCE through real examples and scenarios
   - Show EXPERTISE with technical depth but accessible language
   - Establish AUTHORITATIVENESS by citing industry standards
   - Build TRUST with transparency and actionable advice

2. SEO Best Practices:
   - Primary keyword: "${topic.keywordFocus}"
   - Target word count: ${topic.estimatedWordCount} words
   - Include H2 and H3 subheadings
   - Natural keyword placement (no stuffing)
   - Include semantic variations
   - Add FAQ section for featured snippets

3. Conversion Optimization:
   - Target audience: ${topic.targetAudience}
   - Search intent: ${topic.searchIntent}
   - Include 2-3 natural CTAs throughout
   - Highlight WebGlo's relevant services
   - Create urgency without being pushy

4. Content Structure:
   - Compelling introduction (hook + value promise)
   - Logical flow with clear sections
   - Actionable takeaways in each section
   - Practical examples and case studies
   - Strong conclusion with clear next steps

5. Monetization-Friendly Format:
   - Paragraphs: 3-4 sentences max
   - Sections: 300-500 words (ideal for ad breaks)
   - Include lists and tables (visual breaks)
   - Use callout boxes for key insights
   - Add image placeholders with descriptions

6. Local SEO (when relevant):
   - Service areas: ${CONFIG.SERVICE_AREAS}
   - Contact info: ${CONFIG.COMPANY_PHONE}, ${CONFIG.COMPANY_EMAIL}

RETURN FORMAT: Pure JSON (no markdown, no code blocks)
{
  "title": "Compelling, SEO-optimized title (60 chars max)",
  "metaDescription": "Engaging meta description with keyword (155 chars max)",
  "slug": "url-friendly-slug",
  "content": "Full HTML content with proper structure",
  "excerpt": "150-word summary for listing page",
  "category": "web-development|seo|digital-marketing|tutorials|digital-strategy|business-growth",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": 8,
  "focusKeyword": "primary keyword phrase",
  "faqSection": [
    {"question": "Question?", "answer": "Answer..."}
  ],
  "seoScore": 85,
  "cta": [
    {"text": "CTA text", "position": "after-intro|mid-content|conclusion", "type": "contact|consultation|resource"}
  ]
}`;

    const userPrompt = `Write a comprehensive blog post for this topic:

TITLE: ${topic.title}
CORE VALUE: ${topic.coreValue}
TARGET AUDIENCE: ${topic.targetAudience}
SEARCH INTENT: ${topic.searchIntent}
KEYWORD FOCUS: ${topic.keywordFocus}
CONVERSION POTENTIAL: ${topic.conversionPotential}
TARGET WORD COUNT: ${topic.estimatedWordCount}

SPECIFIC REQUIREMENTS:
1. Start with a hook that resonates with ${topic.targetAudience}
2. Address the core problem: ${topic.coreValue}
3. Provide actionable solutions with step-by-step guidance
4. Include real-world examples or scenarios
5. Add data points or statistics (cite sources if specific)
6. Create natural transitions for ad placements
7. End with a clear call-to-action

CONTENT SECTIONS (suggested):
- Introduction (hook + problem + value promise)
- Background/Context (why this matters now)
- Main Content (3-5 major sections with H2 headings)
- Practical Implementation (how-to steps)
- Common Mistakes/Pitfalls to Avoid
- Tools and Resources
- FAQ Section (3-5 questions)
- Conclusion with Next Steps

Make it comprehensive, authoritative, and genuinely helpful. Write in a professional but conversational tone.`;

    try {
      const response = SharedUtils_.callGeminiWithRetry(
        userPrompt,
        systemHint,
        CONFIG.GEMINI_MODEL_FLASH,
        'application/json'
      );
      
      // Parse and validate
      const blogData = JSON.parse(response);
      
      if (!blogData.title || !blogData.content) {
        throw new Error('Generated content missing required fields');
      }
      
      SharedUtils_.logToSheet(`Generated blog post: ${blogData.title}`, 'INFO');
      return blogData;
      
    } catch (error) {
      SharedUtils_.logToSheet(`Content generation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
};

// ============================================================================
// HTML GENERATION (matching existing blog structure)
// ============================================================================

const HTMLGenerator_ = {
  /**
   * Generates standalone HTML file for a blog post
   * UPDATED 2025: Modern structure with engagement widgets, Giscus comments, AND AdSense
   */
  generateStandaloneHTML: function(postData, postId, publishDate, imageData) {
    const CONFIG = ConfigService_.get();
    
    // Get AdSense placements
    const adPlacements = AdSenseUtils_.getAdPlacements(
      postData.content.split(' ').length,
      CONFIG.ADSENSE_STRATEGY === 'AUTO_ADS'
    );
    
    // Split content into sections for ad placement
    const contentSections = this.splitContentForAds(postData.content);
    
    // Determine image source (Unsplash or fallback)
    const imageUrl = imageData ? imageData.url : `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80`;
    const imageAlt = imageData ? imageData.description : postData.title;
    
    const html = `<!DOCTYPE html>
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
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=yes, minimum-scale=1, maximum-scale=5">
  
  <title>${postData.title} | WebGlo Blog</title>
  <meta name="description" content="${postData.excerpt}">
  <link rel="canonical" href="https://webglo.org/blog/${postData.slug}.html" />
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${postData.title}">
  <meta property="og:description" content="${postData.excerpt}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="https://webglo.org/blog/${postData.slug}.html">
  <meta name="twitter:card" content="summary_large_image">
  
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${postData.title}",
    "description": "${postData.excerpt}",
    "image": "${imageUrl}",
    "author": {
      "@type": "Organization",
      "name": "WebGlo"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WebGlo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://webglo.org/assets/logo.svg"
      }
    },
    "datePublished": "${publishDate}",
    "mainEntityOfPage": "https://webglo.org/blog/${postData.slug}.html"
  }
  </script>
  
  ${postData.faqSection && postData.faqSection.length > 0 ? this.generateFAQSchema(postData.faqSection) : ''}
  
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
  
  <!-- AdSense -->
  ${adPlacements.header}
  ${CONFIG.ENABLE_AD_BLOCKER_DETECTION ? AdSenseUtils_.getAdBlockerDetectionScript() : ''}
  
  <!-- Embedded Post Data -->
  <script>
    window.BLOG_POST_DATA = ${JSON.stringify({
      id: postId,
      slug: postData.slug,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      author: "WebGlo Team",
      date: publishDate,
      readTime: postData.readTime,
      category: postData.category,
      tags: postData.tags,
      image: imageUrl,
      imageAlt: imageAlt
    })};
  </script>
</head>
<body class="font-inter bg-white text-gray-900">
  <div id="webglo-navigation"></div>

  <!-- Breadcrumb Navigation -->
  <div id="breadcrumb-navigation" class="mt-16"></div>

  <!-- Main Content -->
  <section class="pt-32 pb-12 bg-gradient-to-br from-purple-50 via-white to-blue-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Sidebar (Desktop) -->
        <div class="hidden lg:block lg:w-64 flex-shrink-0">
          <div class="sticky top-24 space-y-6">
            <!-- Share Widget -->
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4">Share Article</h3>
              <div class="flex flex-col gap-3">
                <button onclick="shareOnTwitter()" class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                  Twitter
                </button>
                <button onclick="shareOnLinkedIn()" class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                  LinkedIn
                </button>
                <button onclick="copyLink()" class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy Link
                </button>
              </div>
            </div>

            <!-- Sidebar Ad -->
            ${adPlacements.sidebar}

            <!-- Like Button Widget -->
            <div id="like-widget-sidebar" class="border-t border-gray-200 pt-3">
              <!-- Will be populated by engagement system -->
            </div>
          </div>
        </div>

        <!-- Article Content -->
        <div class="flex-1 max-w-4xl">
          <!-- Back Button -->
          <div class="mb-6">
            <a href="./" class="inline-flex items-center text-[#df00ff] hover:text-[#0cead9] font-semibold transition-colors duration-300">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Blog
            </a>
          </div>

          <!-- Article Header -->
          <div class="text-center mb-12">
            <div class="mb-4">
              <span class="text-sm text-[#df00ff] font-semibold uppercase tracking-wide">${postData.category}</span>
              <span class="text-gray-400 mx-2">•</span>
              <span class="text-sm text-gray-500">${postData.readTime} min read</span>
            </div>

            <h1 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              ${postData.title}
            </h1>

            <div class="flex items-center justify-center">
              <div class="w-12 h-12 bg-gradient-to-r from-[#df00ff] to-[#0cead9] rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold">WG</span>
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900">WebGlo Team</p>
                <p class="text-sm text-gray-500">${this.formatDate(publishDate)}</p>
              </div>
            </div>

            <!-- View Counter -->
            <div id="view-counter" class="mt-6">
              <!-- Will be populated by engagement system -->
            </div>
          </div>

          <!-- Hero Image -->
          <img class="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg mb-8" src="${imageUrl}" alt="${imageAlt}">
          
          <!-- Article Content -->
          <article class="prose prose-lg max-w-none">
            <div class="article-content">
              ${contentSections.intro}
              
              ${adPlacements.afterIntro}
              
              ${contentSections.main}
              
              ${adPlacements.midContent}
              
              ${contentSections.conclusion}
              
              ${adPlacements.beforeConclusion}
              
              ${postData.faqSection && postData.faqSection.length > 0 ? this.generateFAQHTML(postData.faqSection) : ''}
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
              ${postData.tags.map(tag => `
              <a href="./?search=${tag}" class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#df00ff] hover:text-white transition-colors">
                #${tag}
              </a>`).join('')}
            </div>

            <!-- Like Button (mobile) -->
            <div id="like-widget-mobile" class="lg:hidden mt-8">
              <!-- Will be populated by engagement system -->
            </div>

            <!-- Article Feedback Survey Widget -->
            <div id="survey-widget" class="mt-12">
              <!-- Will be populated by engagement system -->
            </div>

            <!-- Comments Section (Giscus) -->
            <div class="mt-12 mb-8">
              <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">💬 Join the Discussion</h2>
                <p class="text-gray-600 mb-6">Share your thoughts, ask questions, or provide feedback in the comments below!</p>
                
                <!-- Giscus Comments -->
                <div id="giscus-container">
                  <div class="giscus"></div>
                </div>
              </div>
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

          <!-- Related Posts -->
          <div id="related-posts" class="mt-16">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div id="related-posts-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <div id="webglo-footer"></div>

  <!-- Components JavaScript -->
  <script src="../js/components.js"></script>

  <!-- Blog Configuration -->
  <script src="./scripts/config.js"></script>
  
  <!-- Blog Engagement & Post Standalone Scripts -->
  <script src="./scripts/blog-engagement.js"></script>
  <script src="./scripts/post-standalone.js"></script>
  
  <!-- Social Sharing Functions -->
  <script>
    function shareOnTwitter() {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(window.BLOG_POST_DATA.title);
      window.open(\`https://twitter.com/intent/tweet?url=\${url}&text=\${text}\`, '_blank');
    }
    
    function shareOnLinkedIn() {
      const url = encodeURIComponent(window.location.href);
      window.open(\`https://www.linkedin.com/sharing/share-offsite/?url=\${url}\`, '_blank');
    }
    
    function copyLink() {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  </script>
</body>
</html>`;
    
    return html;
  },
  
  /**
   * Splits content into sections for ad placement
   */
  splitContentForAds: function(htmlContent) {
    // Simple split by H2 tags
    const parts = htmlContent.split(/<h2/i);
    
    if (parts.length === 1) {
      return {
        intro: htmlContent,
        main: '',
        conclusion: ''
      };
    }
    
    const intro = parts[0];
    const middle = parts.slice(1, -1).map(p => '<h2' + p).join('');
    const conclusion = parts.length > 1 ? '<h2' + parts[parts.length - 1] : '';
    
    return {
      intro: intro,
      main: middle,
      conclusion: conclusion
    };
  },
  
  /**
   * Generates FAQ schema markup
   */
  generateFAQSchema: function(faqs) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  },
  
  /**
   * Generates FAQ HTML section
   */
  generateFAQHTML: function(faqs) {
    return `
<section class="faq-section">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-container">
        ${faqs.map((faq, index) => `
        <div class="faq-item">
            <h3 class="faq-question">${faq.question}</h3>
            <div class="faq-answer">${faq.answer}</div>
        </div>
        `).join('')}
    </div>
</section>`;
  },
  
  /**
   * Formats date for display
   */
  formatDate: function(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
};

// ============================================================================
// GITHUB PUBLISHING
// ============================================================================

const Publisher_ = {
  /**
   * Publishes a blog post to GitHub
   */
  publishToGitHub: function(topic) {
    const CONFIG = ConfigService_.get();
    
    try {
      // 1. Generate content
      SpreadsheetApp.getUi().alert('Generating content with AI... (30-60 seconds)');
      const blogData = ContentGenerator_.generateMonetizationReadyBlog(topic);
      
      // 2. Fetch featured image from Unsplash
      const imageData = SharedUtils_.fetchUnsplashImage(blogData.focusKeyword || blogData.title, 'landscape');
      
      // 3. Get current posts.json
      const postsJsonContent = GitHubUtils_.getFile(CONFIG.BLOG_DATA_PATH);
      const postsData = JSON.parse(postsJsonContent);
      
      // 4. Create new post entry
      const postId = postsData.posts.length > 0 ? Math.max(...postsData.posts.map(p => p.id)) + 1 : 1;
      const publishDate = new Date().toISOString();
      
      const newPost = {
        id: postId,
        slug: blogData.slug,
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.excerpt, // Full content is in HTML file
        date: publishDate,
        author: "WebGlo Team",
        category: blogData.category,
        tags: blogData.tags,
        readTime: blogData.readTime,
        image: imageData ? imageData.url : `../assets/blog/${blogData.slug}.jpg`, // Use Unsplash or fallback
        imageCredit: imageData ? {
          photographer: imageData.photographer,
          photographerUrl: imageData.photographerUrl,
          unsplashUrl: imageData.unsplashUrl
        } : null,
        featured: false
      };
      
      // 5. Update posts.json
      postsData.posts.unshift(newPost); // Add to beginning
      postsData.totalPosts = postsData.posts.length;
      postsData.lastUpdated = publishDate;
      
      // Add category/tags if new
      if (!postsData.categories.includes(blogData.category)) {
        postsData.categories.push(blogData.category);
      }
      blogData.tags.forEach(tag => {
        if (!postsData.tags.includes(tag)) {
          postsData.tags.push(tag);
        }
      });
      
      // 6. Generate HTML file with image data
      const htmlContent = HTMLGenerator_.generateStandaloneHTML(blogData, postId, publishDate, imageData);
      
      // 7. Commit both files to GitHub
      const files = [
        {
          path: CONFIG.BLOG_DATA_PATH,
          content: JSON.stringify(postsData, null, 2)
        },
        {
          path: `${CONFIG.BLOG_HTML_DIR}${blogData.slug}.html`,
          content: htmlContent
        }
      ];
      
      GitHubUtils_.commitMultipleFiles(
        files,
        `📝 Published: ${blogData.title}`
      );
      
      // 7. Update analytics
      EngagementUtils_.trackView(postId, {
        slug: blogData.slug,
        title: blogData.title,
        publishedDate: publishDate
      });
      
      // 8. Mark as published in queue
      QueueManager_.markAsPublished(
        topic.row,
        `https://webglo.org/blog/${blogData.slug}.html`
      );
      
      SharedUtils_.logToSheet(`Published: ${blogData.title} (${blogData.slug})`, 'SUCCESS');
      
      return {
        success: true,
        title: blogData.title,
        url: `https://webglo.org/blog/${blogData.slug}.html`,
        wordCount: blogData.content.split(' ').length
      };
      
    } catch (error) {
      SharedUtils_.logToSheet(`Publishing failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
};

// ============================================================================
// PUBLIC FUNCTIONS (called from menu and triggers)
// ============================================================================

/**
 * Publishes the next blog post from the queue
 */
function publishNextBlogPost() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Get next topic
    const topic = QueueManager_.getNextTopic();
    
    if (!topic) {
      ui.alert('No topics in queue', 'Generate some content ideas first!', ui.ButtonSet.OK);
      return;
    }
    
    const response = ui.alert(
      'Publish Blog Post',
      `Ready to publish:\n\n"${topic.title}"\n\nThis will:\n1. Generate content with AI\n2. Create HTML file\n3. Update posts.json\n4. Commit to GitHub\n\nContinue?`,
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    const result = Publisher_.publishToGitHub(topic);
    
    ui.alert(
      'Published Successfully! 🎉',
      `Title: ${result.title}\n\nURL: ${result.url}\n\nWord Count: ${result.wordCount}\n\nThe post is now live on GitHub Pages!`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}\n\nCheck the Logs sheet for details.`);
  }
}

/**
 * Publishes multiple blog posts in bulk
 */
function publishBulkBlogPosts() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.prompt(
      'Bulk Publish',
      'How many posts would you like to publish?',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const count = parseInt(response.getResponseText()) || 3;
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const topic = QueueManager_.getNextTopic();
      
      if (!topic) {
        ui.alert('Queue exhausted', `Published ${i} posts. No more topics in queue.`, ui.ButtonSet.OK);
        break;
      }
      
      try {
        const result = Publisher_.publishToGitHub(topic);
        results.push(`✅ ${result.title}`);
        
        // Wait 10 seconds between posts to avoid rate limits
        if (i < count - 1) {
          Utilities.sleep(10000);
        }
      } catch (error) {
        results.push(`❌ ${topic.title}: ${error.message}`);
      }
    }
    
    ui.alert(
      'Bulk Publishing Complete',
      results.join('\n'),
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
  }
}
