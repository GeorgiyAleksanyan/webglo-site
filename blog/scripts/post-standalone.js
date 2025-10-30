/**
 * Standalone Blog Post Initializer
 * For individual post HTML files
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Standalone blog post loaded');

  // Post data is embedded in the page
  const post = window.BLOG_POST_DATA;

  if (!post) {
    console.error('No post data found');
    return;
  }

  // Setup SEO
  if (window.WebGloSEO) {
    window.WebGloSEO.setupBlogPostSEO(post);
    console.log('✓ SEO setup complete');
  }

  // Setup breadcrumbs
  if (window.WebGloBreadcrumb) {
    const categoryName = getCategoryName(post.category);
    const breadcrumb = WebGloBreadcrumb.forBlogPost(
      post.title,
      post.slug,
      categoryName
    );
    breadcrumb.render('breadcrumb-navigation');
    console.log('✓ Breadcrumbs rendered');
  }

  // Initialize engagement system
  initEngagement(post);

  // Load related posts
  loadRelatedPosts(post);

  // Setup reading progress
  setupReadingProgress();

  // Load Giscus comments
  loadGiscus(post);

  // Setup social sharing
  setupSocialSharing(post);
});

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

async function initEngagement(post) {
  // Check if engagement features are enabled
  const features = window.BLOG_CONFIG?.FEATURES || {};
  const engagementEnabled = features.viewTracking || features.likes || features.survey;
  
  if (!engagementEnabled) {
    console.log('Engagement features disabled - skipping initialization');
    return;
  }

  try {
    const engagement = new BlogEngagement(post.id);
    await engagement.init();
    
    // Render like button
    if (features.likes && engagement.renderLikeButton) {
      const sidebarContainer = document.getElementById('like-widget-sidebar');
      const mobileContainer = document.getElementById('like-widget-mobile');
      
      if (sidebarContainer) {
        sidebarContainer.innerHTML = engagement.renderLikeButton();
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = engagement.renderLikeButton();
      }
    }

    // Render survey
    if (features.survey && engagement.renderSurvey) {
      const surveyContainer = document.getElementById('survey-widget');
      if (surveyContainer) {
        surveyContainer.innerHTML = engagement.renderSurvey();
      }
    }

    console.log('✓ Engagement initialized');
  } catch (error) {
    console.error('Failed to initialize engagement:', error);
  }
}

function loadRelatedPosts(post) {
  // Load related posts based on category
  fetch(window.BLOG_CONFIG?.DATA_URL || './data/posts.json')
    .then(res => res.json())
    .then(data => {
      const related = data.posts
        .filter(p => p.id !== post.id && p.category === post.category)
        .slice(0, 3);

      const grid = document.getElementById('related-posts-grid');
      const section = document.getElementById('related-posts');

      if (related.length > 0 && grid) {
        grid.innerHTML = related.map(relatedPost => `
          <article class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
            <img src="${relatedPost.image}" alt="${relatedPost.title}" class="w-full h-48 object-cover">
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#df00ff]">
                <a href="./${relatedPost.slug}.html">${relatedPost.title}</a>
              </h3>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">${relatedPost.excerpt}</p>
              <a href="./${relatedPost.slug}.html" class="text-[#df00ff] hover:text-[#0cead9] font-semibold text-sm">
                Read More →
              </a>
            </div>
          </article>
        `).join('');
        console.log('✓ Related posts loaded');
      } else if (section) {
        section.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Failed to load related posts:', error);
    });
}

function setupReadingProgress() {
  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // You can add a progress bar here if desired
  });
}

function loadGiscus(post) {
  const features = window.BLOG_CONFIG?.FEATURES || {};
  
  if (!features.comments) {
    document.getElementById('giscus-comments').style.display = 'none';
    return;
  }

  const giscusConfig = window.BLOG_CONFIG?.GISCUS || {};
  
  if (!giscusConfig.ENABLED) {
    document.getElementById('giscus-comments').style.display = 'none';
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', giscusConfig.REPO || '');
  script.setAttribute('data-repo-id', giscusConfig.REPO_ID || '');
  script.setAttribute('data-category', giscusConfig.CATEGORY || '');
  script.setAttribute('data-category-id', giscusConfig.CATEGORY_ID || '');
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'top');
  script.setAttribute('data-theme', 'light');
  script.setAttribute('data-lang', 'en');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  const container = document.querySelector('.giscus');
  if (container) {
    container.appendChild(script);
    console.log('✓ Giscus comments loaded');
  }
}

function setupSocialSharing(post) {
  const url = window.location.href;
  const title = encodeURIComponent(post.title);

  window.shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=550,height=420');
  };

  window.shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=500');
  };

  window.shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=500');
  };

  window.copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };
}
