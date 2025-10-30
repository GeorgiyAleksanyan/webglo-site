/**
 * WebGlo Blog - Main Blog Listing Page
 * Handles blog post rendering, search, filtering, and pagination
 */

class WebGloBlog {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentCategory = 'all';
    this.searchTerm = '';
    this.dataUrl = window.BLOG_CONFIG?.DATA_URL || './data/posts.json';
    this.currentPage = 1;
    this.postsPerPage = window.BLOG_CONFIG?.POSTS_PER_PAGE || 12;
    this.init();
  }

  async init() {
    try {
      await this.loadPosts();
      this.setupEventListeners();
      this.renderPosts();
      this.setupWidgets();
    } catch (error) {
      console.error('Failed to initialize blog:', error);
      this.showError('Failed to load blog posts. Please try again later.');
    }
  }

  async loadPosts() {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      this.posts = data.posts || [];
      this.filteredPosts = [...this.posts];
      
      console.log(`✓ Loaded ${this.posts.length} blog posts`);
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('blog-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterPosts();
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.filterPosts();
      });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.filterPosts();
      });
    }

    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.sortPosts(e.target.value);
      });
    }

    // Load more
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.renderPosts(true);
      });
    }
  }

  filterPosts() {
    this.filteredPosts = this.posts.filter(post => {
      // Category filter
      if (this.currentCategory && this.currentCategory !== 'all' && this.currentCategory !== '') {
        if (post.category !== this.currentCategory) return false;
      }

      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(searchLower);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(searchLower);
        const matchesTags = post.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesTitle && !matchesExcerpt && !matchesTags) return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.renderPosts();
  }

  sortPosts(sortBy) {
    switch (sortBy) {
      case 'date-desc':
        this.filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        this.filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'title-asc':
        this.filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        this.filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    this.renderPosts();
  }

  renderPosts(append = false) {
    const grid = document.getElementById('blog-posts-grid');
    const noPostsMsg = document.getElementById('no-posts-message');
    const loadMoreContainer = document.getElementById('load-more-container');

    if (!grid) return;

    // Show/hide no posts message
    if (this.filteredPosts.length === 0) {
      if (noPostsMsg) noPostsMsg.style.display = 'block';
      grid.innerHTML = '';
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    } else {
      if (noPostsMsg) noPostsMsg.style.display = 'none';
    }

    // Calculate which posts to show
    const startIndex = 0;
    const endIndex = this.currentPage * this.postsPerPage;
    const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

    // Clear or keep existing posts
    if (!append) {
      grid.innerHTML = '';
    }

    // Render posts
    postsToShow.forEach(post => {
      const postCard = this.createPostCard(post);
      if (!append || !grid.querySelector(`[data-post-id="${post.id}"]`)) {
        grid.appendChild(postCard);
      }
    });

    // Show/hide load more button
    if (loadMoreContainer) {
      loadMoreContainer.style.display = 
        endIndex < this.filteredPosts.length ? 'block' : 'none';
    }

    // Render featured post if on first page and not searching
    if (this.currentPage === 1 && !this.searchTerm && this.currentCategory === 'all') {
      this.renderFeaturedPost();
    }
  }

  createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1';
    card.setAttribute('data-post-id', post.id);

    card.innerHTML = `
      <div class="relative h-48 overflow-hidden">
        <img src="${post.image}" alt="${post.imageAlt || post.title}" 
             class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
             onerror="this.src='../assets/blog-placeholder.jpg'">
        <div class="absolute top-4 right-4">
          <span class="px-3 py-1 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white text-xs font-semibold rounded-full">
            ${this.getCategoryName(post.category)}
          </span>
        </div>
      </div>
      
      <div class="p-6">
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            ${post.date}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            ${post.readTime}
          </span>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#df00ff] transition-colors">
          <a href="./${post.slug}.html">${post.title}</a>
        </h3>

        <p class="text-gray-600 mb-4 line-clamp-3">${post.excerpt}</p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">By ${post.author}</span>
          </div>
          <a href="./${post.slug}.html" 
             class="inline-flex items-center gap-2 text-[#df00ff] hover:text-[#0cead9] font-semibold transition-colors">
            Read More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        ${post.tags && post.tags.length > 0 ? `
          <div class="flex flex-wrap gap-2 mt-4">
            ${post.tags.slice(0, 3).map(tag => `
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                #${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    return card;
  }

  renderFeaturedPost() {
    const featuredContainer = document.getElementById('featured-post');
    if (!featuredContainer || this.filteredPosts.length === 0) return;

    const featured = this.filteredPosts[0];
    
    featuredContainer.innerHTML = `
      <article class="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl overflow-hidden shadow-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div class="relative h-64 md:h-full min-h-[300px]">
            <img src="${featured.image}" alt="${featured.imageAlt || featured.title}" 
                 class="w-full h-full object-cover"
                 onerror="this.src='../assets/blog-placeholder.jpg'">
            <div class="absolute top-4 left-4">
              <span class="px-4 py-2 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white text-sm font-bold rounded-full shadow-lg">
                ⭐ Featured Post
              </span>
            </div>
          </div>
          
          <div class="p-8 md:p-12 flex flex-col justify-center">
            <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span class="px-3 py-1 bg-white rounded-full font-semibold">
                ${this.getCategoryName(featured.category)}
              </span>
              <span>${featured.date}</span>
              <span>${featured.readTime}</span>
            </div>

            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              ${featured.title}
            </h2>

            <p class="text-lg text-gray-700 mb-6 line-clamp-4">
              ${featured.excerpt}
            </p>

            <div class="flex items-center gap-4">
              <a href="./${featured.slug}.html" 
                 class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0cead9] to-[#df00ff] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold">
                Read Full Article
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  setupWidgets() {
    this.renderCategoriesWidget();
    this.renderTagsWidget();
    this.renderPopularPostsWidget();
  }

  renderCategoriesWidget() {
    const widget = document.getElementById('categories-widget');
    const filter = document.getElementById('category-filter');
    
    if (!widget) return;

    // Get unique categories
    const categories = {};
    this.posts.forEach(post => {
      if (post.category) {
        categories[post.category] = (categories[post.category] || 0) + 1;
      }
    });

    // Render categories
    widget.innerHTML = Object.entries(categories)
      .map(([category, count]) => `
        <div class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
             onclick="window.webgloBlog.filterByCategory('${category}')">
          <span class="text-gray-700 font-medium">${this.getCategoryName(category)}</span>
          <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">${count}</span>
        </div>
      `).join('');

    // Populate filter dropdown
    if (filter) {
      filter.innerHTML = '<option value="">All Categories</option>' +
        Object.keys(categories).map(category => `
          <option value="${category}">${this.getCategoryName(category)}</option>
        `).join('');
    }
  }

  renderTagsWidget() {
    const widget = document.getElementById('tags-widget');
    if (!widget) return;

    // Get all tags
    const tagCounts = {};
    this.posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count and get top 15
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    widget.innerHTML = topTags.map(([tag, count]) => `
      <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#df00ff] hover:text-white cursor-pointer transition-colors"
            onclick="window.webgloBlog.filterByTag('${tag}')">
        #${tag} (${count})
      </span>
    `).join('');
  }

  renderPopularPostsWidget() {
    const widget = document.getElementById('popular-posts-widget');
    if (!widget) return;

    // Get top 5 most recent posts as "popular"
    const popular = this.posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    widget.innerHTML = popular.map((post, index) => `
      <article class="flex gap-3 py-3 ${index < popular.length - 1 ? 'border-b border-gray-100' : ''}">
        <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
          <img src="${post.image}" alt="${post.title}" 
               class="w-full h-full object-cover"
               onerror="this.src='../assets/blog-placeholder.jpg'">
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#df00ff] transition-colors">
            <a href="./${post.slug}.html">${post.title}</a>
          </h4>
          <p class="text-xs text-gray-500 mt-1">${post.date}</p>
        </div>
      </article>
    `).join('');
  }

  filterByCategory(category) {
    this.currentCategory = category;
    const filter = document.getElementById('category-filter');
    if (filter) filter.value = category;
    this.filterPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filterByTag(tag) {
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
      searchInput.value = tag;
      this.searchTerm = tag.toLowerCase();
      this.filterPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getCategoryName(category) {
    const categoryNames = {
      'digital-strategy': 'Digital Strategy',
      'web-development': 'Web Development',
      'seo': 'SEO',
      'digital-marketing': 'Digital Marketing',
      'tutorials': 'Tutorials'
    };
    return categoryNames[category] || category;
  }

  showError(message) {
    const grid = document.getElementById('blog-posts-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-red-500 text-xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p class="text-gray-600">${message}</p>
        </div>
      `;
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webgloBlog = new WebGloBlog();
  });
} else {
  window.webgloBlog = new WebGloBlog();
}
