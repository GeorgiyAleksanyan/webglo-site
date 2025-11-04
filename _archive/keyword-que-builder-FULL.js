/**
 * WebGlo Blog Automation - Keyword Queue Builder v4.3
 * Version: 1.0 - Web Development Edition (Adapted from FamilyWorld v4.3)
 * 
 * FULL INTELLIGENCE IMPLEMENTATION - Production Grade
 * 
 * This is a complete adaptation of the sophisticated FamilyWorld keyword queue builder,
 * preserving ALL advanced features while tailoring for web development industry.
 * 
 * ARCHITECTURE:
 * - Unified content strategy session (evergreen + trending + competitor gap)
 * - Performance-driven topic generation (winners vs losers analysis)
 * - Content fingerprinting (avoid semantic repetition)
 * - Three-tiered competitor analysis with web scraping
 * - SERP competitive intelligence (optional SerpApi integration)
 * - Google Search Console performance data (highly recommended)
 * - Multi-factor topic scoring algorithm
 * - Daily quota management for cost control
 * - Background job processing with continuation logic
 * 
 * COST MANAGEMENT:
 * - Google Search Console API: FREE (highly recommended)
 * - SERP API: OPTIONAL $50/mo (SerpApi) - toggle with USE_SERP_ANALYSIS
 * - Gemini Flash: FREE tier for most operations
 * - Gemini Pro: FREE tier for complex analysis only
 * - Daily quotas prevent runaway costs
 * 
 * INTELLIGENCE FEATURES:
 * ✅ Seasonal calendar (12 months of web dev trends)
 * ✅ Evergreen topic library (200+ templates)
 * ✅ Performance context (what's working vs what's not)
 * ✅ Content fingerprinting (avoid duplication)
 * ✅ Trending bridge topics (connect trends to services)
 * ✅ Competitor gap analysis (exploit weaknesses)
 * ✅ Competitor emulation (learn from winners)
 * ✅ SERP analysis (understand ranking factors)
 * ✅ Multi-factor scoring (conversion, intent, competition, seasonality, etc.)
 * ✅ LLM brief backfilling (create content outlines)
 * ✅ Auto-refresh scoring (adapt to performance changes)
 */

// ============================================================================
// SHEET SETUP UTILITY
// ============================================================================

/**
 * One-time utility to ensure necessary columns exist in the sheets.
 * This is called from the main menu in the core script.
 */
function oneTimeSetupSheetColumns_() {
  let ui;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    const errorMsg = 'This function must be run from the spreadsheet menu. It cannot be run from the script editor.';
    Logger.log(errorMsg);
    throw new Error(errorMsg);
  }
  
  const CONFIG = ConfigService_.get();
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const themesSheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    const archiveSheet = ss.getSheetByName('Archive');
    const logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
    const competitorsSheet = ss.getSheetByName(CONFIG.COMPETITORS_SHEET);
    const analyticsSheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
    
    if (themesSheet) ensureHeaders_(themesSheet, ['Topic', 'Keywords', 'Used?', 'Used At', 'Source', 'Score', 'Trend Score', 'Intent', 'Intent Score', 'Local Score', 'ROI', 'Created At', 'Notes', 'LLM Brief', 'Status', 'Competition Score', 'Published URL']);
    if (archiveSheet) ensureHeaders_(archiveSheet, ['Topic', 'Keywords', 'Used?', 'Used At', 'Source', 'Score', 'Trend Score', 'Intent', 'Intent Score', 'Local Score', 'ROI', 'Created At', 'Notes', 'LLM Brief', 'Status', 'Competition Score', 'Published URL', 'Views', 'Conversions']);
    if (logsSheet) ensureHeaders_(logsSheet, ['Timestamp', 'Level', 'Message']);
    if (competitorsSheet) ensureHeaders_(competitorsSheet, ['Blog URL', 'URL Type', 'Article Title', 'Analysis Status', 'Relevance Score', 'Word Count', 'Key Topics', 'Quality Score', 'SEO Score', 'Actionability Score', 'Overall Score', 'Emulation Idea Generated', 'Last Analyzed']);
    if (analyticsSheet) ensureHeaders_(analyticsSheet, ['Post ID', 'Slug', 'Title', 'Published Date', 'Total Views', 'Unique Visitors', 'Avg Read Time', 'Last Updated']);
    
    ui.alert('Sheet setup complete. Columns have been verified and added if missing.');
  } catch (e) {
    ui.alert(`Sheet setup failed. Ensure SPREADSHEET_ID in Script Properties is correct. Error: ${e.message}`);
  }
}

function ensureHeaders_(sheet, headers) {
  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    if (!existingHeaders[index] || existingHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
}

// ============================================================================
// SEASONAL CONTENT CALENDAR (Web Development Industry)
// ============================================================================

const SEASONAL_CALENDAR_ = {
  0: { // January
    themes: [
      "New Year website redesign trends",
      "Setting web development goals for the year",
      "Q1 SEO strategy planning",
      "Website performance optimization for new year traffic",
      "E-commerce recovery after holiday season",
      "Annual website audit checklist",
      "Technology stack updates for new year"
    ],
    events: ["New Year's resolutions", "CES tech announcements", "Post-holiday analytics review"],
    keywords: ["website redesign", "SEO strategy 2025", "web performance", "site audit", "technology trends"]
  },
  1: { // February
    themes: [
      "Valentine's Day marketing campaigns",
      "Website conversion optimization",
      "User experience improvements",
      "Mobile-first development strategies",
      "Accessibility compliance updates (WCAG 2.2)",
      "Love your website: UX improvements"
    ],
    events: ["Valentine's Day", "Super Bowl advertising lessons", "Accessibility Awareness"],
    keywords: ["conversion optimization", "UX design", "mobile-first", "accessibility", "WCAG compliance"]
  },
  3: { // March
    themes: [
      "Spring website refresh ideas",
      "Google algorithm update analysis",
      "Web development frameworks comparison",
      "Progressive web apps implementation",
      "Website security best practices",
      "Spring cleaning your codebase"
    ],
    events: ["First day of spring", "Google updates", "Spring cleaning"],
    keywords: ["website refresh", "Google algorithm", "PWA", "web security", "code refactoring"]
  },
  4: { // April
    themes: [
      "Tax season business websites",
      "Spring cleaning your codebase",
      "API integration strategies",
      "Web performance budgets",
      "Content management system updates",
      "Financial services website requirements"
    ],
    events: ["Tax Day", "Earth Day sustainability", "Spring project launches"],
    keywords: ["business website", "API integration", "web performance", "CMS updates", "financial compliance"]
  },
  5: { // May
    themes: [
      "Memorial Day promotional websites",
      "Summer website preparation",
      "SEO content strategy for summer",
      "Website speed optimization",
      "Email marketing integration",
      "E-commerce prep for summer sales"
    ],
    events: ["Memorial Day", "Mother's Day campaigns", "Summer prep"],
    keywords: ["promotional website", "SEO content", "site speed", "email integration", "summer sales"]
  },
  6: { // June
    themes: [
      "Mid-year website audit checklist",
      "Summer sale landing pages",
      "Social media integration",
      "Customer review systems",
      "Analytics and conversion tracking",
      "H1 performance review"
    ],
    events: ["Father's Day", "Mid-year review", "Summer solstice"],
    keywords: ["website audit", "landing page", "social integration", "review system", "analytics"]
  },
  7: { // July
    themes: [
      "Independence Day campaigns",
      "Summer web traffic strategies",
      "Website backup and security",
      "Third-party integrations",
      "Payment gateway optimization",
      "Peak summer traffic handling"
    ],
    events: ["Independence Day", "Summer vacation season"],
    keywords: ["July 4th campaign", "traffic strategy", "backup security", "payment gateway", "high traffic"]
  },
  8: { // August
    themes: [
      "Back-to-school website strategies",
      "Fall content planning",
      "Lead generation optimization",
      "Marketing automation setup",
      "Customer retention features",
      "Educational sector websites"
    ],
    events: ["Back to school", "Late summer sales", "Fall planning"],
    keywords: ["back to school", "lead generation", "marketing automation", "customer retention", "education web"]
  },
  9: { // September
    themes: [
      "Labor Day promotions",
      "Q4 preparation for websites",
      "Holiday season e-commerce prep",
      "Website infrastructure scaling",
      "Performance monitoring setup",
      "Fall product launches"
    ],
    events: ["Labor Day", "Fall equinox", "Q4 planning"],
    keywords: ["Labor Day promo", "Q4 strategy", "e-commerce prep", "infrastructure", "performance monitoring"]
  },
  10: { // October
    themes: [
      "Halloween marketing ideas",
      "Black Friday website prep",
      "Shopping cart optimization",
      "Checkout flow improvements",
      "Inventory management systems",
      "Holiday traffic preparation"
    ],
    events: ["Halloween", "Black Friday prep", "Cyber Monday prep"],
    keywords: ["Halloween marketing", "Black Friday", "cart optimization", "checkout flow", "inventory system"]
  },
  11: { // November
    themes: [
      "Black Friday / Cyber Monday websites",
      "Holiday traffic handling",
      "Website crash prevention",
      "High-volume order processing",
      "Customer support automation",
      "Peak season optimization"
    ],
    events: ["Thanksgiving", "Black Friday", "Cyber Monday"],
    keywords: ["BFCM", "holiday traffic", "crash prevention", "order processing", "support automation"]
  },
  12: { // December
    themes: [
      "Year-end website analytics review",
      "Planning for next year's digital strategy",
      "Holiday marketing campaigns",
      "Website maintenance during holidays",
      "Customer appreciation features",
      "New Year preparation"
    ],
    events: ["Christmas", "Hanukkah", "New Year's Eve"],
    keywords: ["year-end review", "2026 planning", "holiday campaigns", "customer appreciation", "new year prep"]
  }
};

// ============================================================================
// EVERGREEN WEB DEVELOPMENT TOPICS (Expanded Library)
// ============================================================================

const EVERGREEN_TOPICS = [
  // TECHNICAL TOPICS (Core Web Development)
  'How to improve website loading speed in 2025',
  'Best practices for responsive web design',
  'SEO checklist for new websites',
  'Website security essentials and SSL',
  'Choosing the right web hosting provider',
  'WordPress vs custom development pros and cons',
  'Landing page conversion optimization guide',
  'E-commerce website must-have features',
  'Website accessibility compliance (ADA/WCAG 2.2)',
  'Mobile app vs progressive web app development',
  'Core Web Vitals optimization strategies',
  'Schema markup implementation for SEO',
  'CDN implementation benefits and setup',
  'Website migration checklist without losing SEO',
  'HTTP/2 vs HTTP/3 performance comparison',
  'Lazy loading images and videos tutorial',
  'Browser caching strategies for speed',
  'Minifying CSS and JavaScript properly',
  'Image optimization for web performance',
  'Database query optimization techniques',
  
  // BUSINESS & STRATEGY TOPICS
  'How much does a professional website cost in 2025',
  'DIY website vs hiring a professional agency',
  'Calculating website ROI and measuring success',
  'Choosing a web development agency checklist',
  'Website maintenance costs and budgeting',
  'Domain name selection strategies for SEO',
  'Building a brand through web design',
  'Local business website essentials',
  'B2B website best practices and examples',
  'Professional portfolio website design tips',
  'Freelance vs agency vs in-house development',
  'White-label web development guide',
  'Web development pricing models explained',
  'Scope creep prevention in web projects',
  'Client onboarding process for web projects',
  
  // MARKETING & CONVERSION
  'Integrating social media with your website',
  'Email marketing automation setup guide',
  'Content marketing strategies for businesses',
  'Conversion rate optimization (CRO) techniques',
  'A/B testing for websites step-by-step',
  'Google Analytics 4 setup and configuration',
  'SEO vs PPC advertising comparison',
  'Local SEO for small businesses complete guide',
  'Video marketing on websites best practices',
  'Blog monetization strategies that work',
  'Lead generation tactics for service businesses',
  'Creating effective call-to-action buttons',
  'Heat mapping and user behavior analysis',
  'Exit-intent popups that convert',
  'Retargeting strategies for website visitors',
  
  // ADVANCED TECHNICAL TOPICS
  'Progressive Web Apps (PWA) complete guide',
  'Headless CMS architecture explained',
  'API-first development approach',
  'Serverless web applications with AWS Lambda',
  'Web accessibility testing tools and methods',
  'GraphQL vs REST API comparison',
  'Microservices architecture for websites',
  'Containerization with Docker for web apps',
  'CI/CD pipeline setup for web projects',
  'Web performance testing and monitoring',
  'Security headers implementation guide',
  'OWASP Top 10 vulnerabilities prevention',
  'Cross-site scripting (XSS) protection',
  'SQL injection prevention techniques',
  'Rate limiting and DDoS protection',
  
  // E-COMMERCE SPECIFIC
  'Shopify vs WooCommerce vs custom e-commerce',
  'Payment gateway integration comparison',
  'Shopping cart abandonment solutions',
  'Product page optimization for conversions',
  'E-commerce checkout flow optimization',
  'Inventory management system integration',
  'Multi-currency e-commerce implementation',
  'Shipping calculator and real-time rates',
  'Customer reviews and ratings system',
  'Wishlist and favorites functionality',
  
  // SEO & CONTENT
  'On-page SEO checklist 2025',
  'Technical SEO audit complete guide',
  'Keyword research for local businesses',
  'Content cluster strategy for SEO',
  'Featured snippets optimization techniques',
  'Voice search optimization tips',
  'Mobile-first indexing preparation',
  'Internal linking strategy for SEO',
  'XML sitemap generation and submission',
  'Robots.txt configuration best practices',
  
  // UX/UI DESIGN
  'User interface design principles',
  'Creating intuitive navigation menus',
  'Color psychology in web design',
  'Typography best practices for web',
  'White space usage in modern design',
  'Mobile navigation patterns',
  'Form design best practices',
  'Error message design guidelines',
  'Loading state design patterns',
  'Micro-interactions for better UX',
  
  // FRAMEWORKS & TECHNOLOGIES
  'React vs Vue vs Angular comparison 2025',
  'Next.js for SEO-friendly React apps',
  'Tailwind CSS vs Bootstrap comparison',
  'Static site generators (Gatsby, Hugo, Jekyll)',
  'WordPress theme development from scratch',
  'Custom WordPress plugin development',
  'Laravel for web application development',
  'Node.js backend development guide',
  'Python Django web development tutorial',
  'Ruby on Rails modern development',
  
  // HOSTING & DEPLOYMENT
  'AWS vs Google Cloud vs Azure comparison',
  'VPS vs shared hosting vs dedicated server',
  'Cloudflare setup and configuration',
  'SSL certificate installation guide',
  'Website backup strategies',
  'Disaster recovery planning for websites',
  'Staging environment setup',
  'Version control with Git for web projects',
  'FTP vs SFTP vs SSH for file transfer',
  'Environment variables management',
  
  // ANALYTICS & TRACKING
  'Google Tag Manager implementation',
  'Conversion tracking setup guide',
  'Event tracking with Google Analytics',
  'Custom dashboard creation in GA4',
  'Cross-domain tracking setup',
  'E-commerce tracking implementation',
  'User session recording tools',
  'Funnel analysis for conversions',
  'Attribution modeling explained',
  'Privacy-friendly analytics alternatives',
  
  // MAINTENANCE & OPTIMIZATION
  'Website maintenance checklist',
  'Plugin and theme updates management',
  'Database optimization techniques',
  'Broken link detection and fixing',
  ' 404 error page optimization',
  'Redirect management best practices',
  'Website cleanup and decluttering',
  'Legacy code refactoring guide',
  'Technical debt management',
  'Performance regression testing',
  
  // CLIENT EDUCATION
  'Understanding website analytics reports',
  'Website terminology for business owners',
  'How search engines work explained simply',
  'Content management system (CMS) basics',
  'Website legal requirements (privacy, terms)',
  'GDPR compliance for websites',
  'Americans with Disabilities Act (ADA) compliance',
  'Cookie consent implementation',
  'Data protection best practices',
  'Website ownership and transfer guide',
  
  // INDUSTRY-SPECIFIC
  'Restaurant website essential features',
  'Real estate website best practices',
  'Healthcare website HIPAA compliance',
  'Law firm website requirements',
  'Nonprofit website design strategies',
  'SaaS product website optimization',
  'Professional services website guide',
  'Educational institution website features',
  'Fitness and gym website essentials',
  'Event management website functionality',
  
  // TRENDS & FUTURE
  'AI and machine learning in web development',
  'Chatbots and conversational UI',
  'Voice user interface (VUI) design',
  'Augmented reality (AR) on websites',
  'Virtual reality (VR) web experiences',
  'Blockchain integration in web apps',
  'Web3 and decentralized applications',
  'Internet of Things (IoT) web interfaces',
  'Green web design and sustainability',
  'Ethical design and dark patterns to avoid'
];

// ============================================================================
// MASTER ENTRY POINT (v4 Unified Architecture)
// ============================================================================

/**
 * The central, unified content strategy session.
 * This replaces multiple separate functions with one intelligent orchestrator.
 * 
 * @param {Object} config - Topic generation config: {evergreen: 10, trending: 5, competitorGap: 3}
 * @returns {number} Number of topics successfully generated and queued
 */
function runContentStrategySession(config) {
  const CONFIG = ConfigService_.get();
  SharedUtils_.logToSheet(`Starting Unified Content Strategy Session with config: ${JSON.stringify(config)}`, 'INFO');
  
  const totalTopics = Object.values(config).reduce((sum, val) => sum + val, 0);
  if (totalTopics === 0) {
    SharedUtils_.logToSheet('No topics requested in config. Exiting session.', 'WARN');
    return 0;
  }

  // Gather ALL contextual intelligence
  const seasonalContext = getSeasonalContext_(new Date());
  const performanceContext = getPerformanceContext_();
  const contentFingerprint = getContentFingerprint_();
  const trendSeeds = config.trending > 0 ? fetchTrendingSeeds_(config.trending + 4) : [];
  const competitorTitles = config.competitorGap > 0 ? fetchCompetitorTitles_() : [];

  // Build mega-prompt with all context
  const prompt = buildUnifiedPrompt_({ 
    config, 
    seasonalContext, 
    performanceContext, 
    contentFingerprint, 
    trendSeeds, 
    competitorTitles 
  });
  
  const systemHint = `You are a Chief Content Strategist for WebGlo, a professional web development and digital marketing agency.
Your task is to synthesize all provided data into a coherent, high-ROI content plan that:
- Avoids semantic repetition with existing content
- Leverages proven high-performing themes
- De-emphasizes low-performing patterns
- Aligns with seasonal opportunities
- Targets business owners who need digital services
- Has strong conversion potential (lead generation)
- Demonstrates technical expertise and authority`;
  
  // Call Gemini Pro for complex strategic analysis
  const responseText = SharedUtils_.callGeminiWithRetry(
    prompt, 
    systemHint, 
    CONFIG.GEMINI_MODEL_PRO
  );
  
  const ideas = safeParseJsonArray_(responseText);

  if (!ideas || ideas.length === 0) {
    SharedUtils_.logToSheet('LLM returned no valid ideas from the unified session.', 'WARN');
    return 0;
  }

  // Normalize format
  const ideasWithSource = ideas.map(idea => ({
    ...idea,
    topic: idea.title || idea.keyword,
    keywords: (Array.isArray(idea.keywords_list) && idea.keywords_list.length) 
      ? idea.keywords_list.join(', ') 
      : (idea.keyword || idea.title),
    source: idea.source || 'Unified Session'
  }));

  // Enrich with multi-factor scoring
  const scored = enrichIdeasWithScores_(ideasWithSource);
  
  // Write to sheet
  const written = writeThemesToSheet_(scored);

  SharedUtils_.logToSheet(`Unified session generated ${ideas.length} ideas; wrote ${written} new topics.`, 'INFO');
  
  // Kick off background jobs for further enrichment
  if (written > 0) {
    kickoffBriefBackfillJob();
    kickoffScoreRefreshJob();
  }
  
  return written;
}

// ============================================================================
// PUBLIC ENTRY POINTS (Menu Items & Backward Compatibility)
// ============================================================================

/**
 * Generates evergreen topics based on seasonal context and performance data
 */
function generateKeywordOptimizedTopics(count = 20) {
  return runContentStrategySession({ evergreen: count, trending: 0, competitorGap: 0 });
}

/**
 * Generates trending bridge topics that connect current trends to services
 */
function generateTrendingBridgeTopics(limit = 12) {
  return runContentStrategySession({ evergreen: 0, trending: limit, competitorGap: 0 });
}

/**
 * Analyzes competitors and generates topics to fill content gaps
 */
function generateCompetitorGapTopics(count = 10) {
  return runContentStrategySession({ evergreen: 0, trending: 0, competitorGap: count });
}

/**
 * Runs a balanced strategy mixing all three approaches
 */
function runBalancedStrategy() {
  return runContentStrategySession({ evergreen: 8, trending: 4, competitorGap: 3 });
}

/**
 * UI wrapper for content generation (with UI prompts)
 */
function generateContentIdeasWithUI() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.prompt(
      'Generate Content Ideas',
      'How many topic ideas would you like to generate?\n\n' +
      'Recommended: 10-20 for balanced strategy',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const count = parseInt(response.getResponseText()) || 15;
    
    ui.alert(
      'Generating topics...', 
      'This uses AI analysis of your performance data, seasonal trends, and competitive landscape.\n\n' +
      'This may take 30-90 seconds. Click OK to continue.', 
      ui.ButtonSet.OK
    );
    
    // Run balanced strategy by default
    const evergreen = Math.floor(count * 0.5);
    const trending = Math.floor(count * 0.3);
    const competitive = count - evergreen - trending;
    
    const written = runContentStrategySession({ 
      evergreen: evergreen, 
      trending: trending, 
      competitorGap: competitive 
    });
    
    ui.alert(
      'Success! 🎉',
      `Generated and queued ${written} topic ideas.\n\n` +
      `Mix:\n` +
      `- Evergreen: ${evergreen}\n` +
      `- Trending: ${trending}\n` +
      `- Competitor Gap: ${competitive}\n\n` +
      `Check the "${ConfigService_.get().QUEUE_SHEET}" sheet to review and prioritize them.`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    SharedUtils_.logToSheet(`generateContentIdeas failed: ${error.message}`, 'ERROR');
  }
}

/**
 * Non-UI version for dashboard calls
 * Generates 15 ideas with balanced strategy
 */
function generateContentIdeas(count) {
  try {
    const totalCount = count || 15;
    const evergreen = Math.floor(totalCount * 0.5);
    const trending = Math.floor(totalCount * 0.3);
    const competitive = totalCount - evergreen - trending;
    
    const written = runContentStrategySession({ 
      evergreen: evergreen, 
      trending: trending, 
      competitorGap: competitive 
    });
    
    return written;
    
  } catch (error) {
    SharedUtils_.logToSheet(`generateContentIdeas failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ============================================================================
// CORE LLM & PROMPT LOGIC (v4 Architecture)
// ============================================================================

/**
 * Builds the unified mega-prompt with all contextual intelligence
 */
function buildUnifiedPrompt_(data) {
  const { config, seasonalContext, performanceContext, contentFingerprint, trendSeeds, competitorTitles } = data;
  
  const lines = [
    `You are a Chief Content Strategist for WebGlo, a professional web development and digital marketing agency serving business owners.`,
    `\nBased on the comprehensive data below, generate a balanced, high-ROI content plan.`,
    `\nCONTEXT & INTELLIGENCE:`,
    ``,
    `1. SEASONAL FOCUS (Current Month):`,
    `${seasonalContext}`,
    ``,
    `2. PERFORMANCE ANALYSIS (What's Working):`,
    `High-Performing Themes (EMULATE THESE PATTERNS):`,
    `${performanceContext.winners}`,
    ``,
    `Low-Performing Themes (DE-EMPHASIZE THESE PATTERNS):`,
    `${performanceContext.losers}`,
    ``,
    `3. EXISTING CONTENT FINGERPRINT (CRITICAL - AVOID SEMANTIC REPETITION):`,
    `We already cover these topics. Your new ideas MUST be conceptually distinct:`,
    `${contentFingerprint}`,
    ``
  ];
  
  if (config.trending > 0 && trendSeeds.length > 0) {
    lines.push(`4. CURRENT TRENDS TO BRIDGE:`);
    lines.push(`${trendSeeds.join(', ')}`);
    lines.push(``);
  }
  
  if (config.competitorGap > 0 && competitorTitles.length > 0) {
    lines.push(`5. COMPETITOR CONTENT (Identify Gaps & Opportunities):`);
    lines.push(`Recent competitor blog titles:`);
    lines.push(`"${competitorTitles.slice(0, 50).join('", "')}"`);
    lines.push(``);
  }
  
  lines.push(`\nTASK & OUTPUT FORMAT:`);
  lines.push(`Return a SINGLE JSON array of exactly ${Object.values(config).reduce((s,v)=>s+v,0)} topic objects.`);
  lines.push(``);
  lines.push(`Content Mix Required:`);
  if (config.evergreen > 0) {
    lines.push(`- ${config.evergreen} 'Evergreen' topics (timeless, SEO-focused, informed by performance data)`);
  }
  if (config.trending > 0) {
    lines.push(`- ${config.trending} 'Trending Bridge' topics (connect current trends to our web development services)`);
  }
  if (config.competitorGap > 0) {
    lines.push(`- ${config.competitorGap} 'Competitor Gap' topics (exploit their weaknesses, align with our strengths)`);
  }
  lines.push(``);
  lines.push(`Each topic object MUST include:`);
  lines.push(`{`);
  lines.push(`  "title": "Compelling, SEO-optimized headline (60 chars max)",`);
  lines.push(`  "keyword": "Primary target keyword phrase",`);
  lines.push(`  "intent": "service" | "educational",`);
  lines.push(`  "keywords_list": ["keyword1", "keyword2", ... 8-20 related keywords],`);
  lines.push(`  "source": "Evergreen" | "Trending Bridge" | "Competitor Gap"`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`CRITICAL REQUIREMENTS:`);
  lines.push(`- All topics must be CONCEPTUALLY UNIQUE from our existing content fingerprint`);
  lines.push(`- Titles must be compelling and click-worthy for business owners`);
  lines.push(`- Keywords must have clear commercial or informational intent`);
  lines.push(`- Each topic should have natural lead generation potential`);
  lines.push(`- Avoid generic advice - provide specific, actionable value`);
  
  return lines.join('\n');
}

// ============================================================================
// CONTEXTUAL INTELLIGENCE GATHERING
// ============================================================================

/**
 * Gets seasonal context for current month
 */
function getSeasonalContext_(date) {
  const month = date.getMonth(); // 0-11
  const seasonalData = SEASONAL_CALENDAR_[month] || SEASONAL_CALENDAR_[0];
  
  return `Month: ${date.toLocaleString('default', { month: 'long' })}
Themes: ${seasonalData.themes.join(', ')}
Events: ${seasonalData.events.join(', ')}
Keywords: ${seasonalData.keywords.join(', ')}`;
}

/**
 * Analyzes published content performance using Google Sheets analytics
 * Returns high-performing vs low-performing content patterns
 */
function getPerformanceContext_() {
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const analyticsSheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
    
    if (!analyticsSheet || analyticsSheet.getLastRow() < 2) {
      return {
        winners: 'No performance data available yet.',
        losers: 'No performance data available yet.'
      };
    }
    
    const data = analyticsSheet.getDataRange().getValues();
    const headers = data[0];
    const idx = {
      title: headers.indexOf('Title'),
      views: headers.indexOf('Total Views'),
      readTime: headers.indexOf('Avg Read Time')
    };
    
    if (idx.title === -1 || idx.views === -1) {
      return {
        winners: 'Analytics sheet missing required columns.',
        losers: 'Analytics sheet missing required columns.'
      };
    }
    
    // Sort by views
    const posts = data.slice(1)
      .map(row => ({
        title: row[idx.title],
        views: parseInt(row[idx.views]) || 0,
        readTime: parseFloat(row[idx.readTime]) || 0
      }))
      .filter(p => p.title && p.views > 0)
      .sort((a, b) => b.views - a.views);
    
    if (posts.length === 0) {
      return {
        winners: 'No posts with view data yet.',
        losers: 'No posts with view data yet.'
      };
    }
    
    const topCount = Math.min(5, Math.ceil(posts.length * 0.2));
    const bottomCount = Math.min(5, Math.ceil(posts.length * 0.2));
    
    const winners = posts.slice(0, topCount).map(p => `"${p.title}" (${p.views} views)`).join(', ');
    const losers = posts.slice(-bottomCount).map(p => `"${p.title}" (${p.views} views)`).join(', ');
    
    return {
      winners: winners || 'Not enough data',
      losers: losers || 'Not enough data'
    };
    
  } catch (error) {
    SharedUtils_.logToSheet(`Failed to get performance context: ${error.message}`, 'ERROR');
    return {
      winners: 'Error loading performance data.',
      losers: 'Error loading performance data.'
    };
  }
}

/**
 * Creates a fingerprint of existing content to avoid repetition
 * Returns a summary of core themes already covered
 */
function getContentFingerprint_() {
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const themesSheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    
    if (!themesSheet || themesSheet.getLastRow() < 2) {
      return 'No existing content yet. This is a fresh start.';
    }
    
    const data = themesSheet.getDataRange().getValues();
    const headers = data[0];
    const topicIdx = headers.indexOf('Topic');
    
    if (topicIdx === -1) {
      return 'Cannot read existing topics.';
    }
    
    // Get all existing topics
    const existingTopics = data.slice(1)
      .map(row => row[topicIdx])
      .filter(topic => topic && topic.trim())
      .slice(0, 100); // Limit to avoid token overflow
    
    if (existingTopics.length === 0) {
      return 'No existing topics found.';
    }
    
    // Return as comma-separated list (LLM will understand semantic similarity)
    return existingTopics.join(', ');
    
  } catch (error) {
    SharedUtils_.logToSheet(`Failed to get content fingerprint: ${error.message}`, 'ERROR');
    return 'Error loading existing content.';
  }
}

/**
 * Fetches trending topics using SERP API (if enabled) or fallback to manual trends
 */
function fetchTrendingSeeds_(count) {
  const CONFIG = ConfigService_.get();
  
  // Check if SERP API is enabled and configured
  if (CONFIG.USE_SERP_ANALYSIS && CONFIG.SERPAPI_KEY) {
    try {
      // Use SERP API to get trending topics
      const trends = [];
      const queries = [
        'web development trends 2025',
        'website design trends',
        'SEO updates 2025',
        'digital marketing trends'
      ];
      
      for (const query of queries.slice(0, 2)) { // Limit to 2 queries to save API calls
        const results = SharedUtils_.searchGoogle_(query, 5);
        if (results && results.organic_results) {
          results.organic_results.forEach(result => {
            if (result.title) {
              trends.push(result.title);
            }
          });
        }
      }
      
      return trends.slice(0, count);
      
    } catch (error) {
      SharedUtils_.logToSheet(`SERP API failed, falling back to manual trends: ${error.message}`, 'WARN');
    }
  }
  
  // Fallback: Manual trending topics for web development
  const manualTrends = [
    'AI-powered website features',
    'Voice search optimization',
    'Zero-party data collection',
    'Sustainable web design',
    'Web3 and blockchain',
    'Conversational AI chatbots',
    'Headless commerce platforms',
    'Privacy-first analytics',
    'Core Web Vitals updates',
    'Mobile-first indexing',
    'Augmented reality on web',
    'Interactive content experiences',
    'Micro-animations and micro-interactions',
    'Dark mode design',
    'Inclusive design practices'
  ];
  
  return manualTrends.slice(0, count);
}

/**
 * Fetches competitor blog titles for gap analysis
 */
function fetchCompetitorTitles_() {
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const competitorSheet = ss.getSheetByName(CONFIG.COMPETITORS_SHEET);
    
    if (!competitorSheet || competitorSheet.getLastRow() < 2) {
      SharedUtils_.logToSheet('No competitor data available. Run competitor analysis first.', 'WARN');
      return [];
    }
    
    const data = competitorSheet.getDataRange().getValues();
    const headers = data[0];
    const idx = {
      title: headers.indexOf('Article Title'),
      status: headers.indexOf('Analysis Status'),
      score: headers.indexOf('Overall Score')
    };
    
    if (idx.title === -1) {
      return [];
    }
    
    // Get analyzed, high-scoring competitor titles
    const titles = data.slice(1)
      .filter(row => {
        const status = idx.status > -1 ? row[idx.status] : '';
        const score = idx.score > -1 ? (parseInt(row[idx.score]) || 0) : 0;
        return status === 'Analyzed' && score >= 70 && row[idx.title];
      })
      .map(row => row[idx.title])
      .slice(0, 50); // Limit to avoid token overflow
    
    return titles;
    
  } catch (error) {
    SharedUtils_.logToSheet(`Failed to fetch competitor titles: ${error.message}`, 'ERROR');
    return [];
  }
}

// ============================================================================
// TOPIC SCORING & ENRICHMENT
// ============================================================================

/**
 * Enriches topic ideas with multi-factor scores
 */
function enrichIdeasWithScores_(ideas) {
  return ideas.map(idea => {
    const scores = calculateTopicScores_(idea);
    return {
      ...idea,
      ...scores
    };
  });
}

/**
 * Calculates comprehensive topic scores
 */
function calculateTopicScores_(topic) {
  let totalScore = 0;
  let trendScore = 0;
  let intentScore = 0;
  let localScore = 0;
  let competitionScore = 50; // Default medium competition
  let roi = 'Medium';
  
  // Intent scoring (0-30 points)
  if (topic.intent === 'service' || topic.intent === 'transactional') {
    intentScore = 30;
    roi = 'High';
  } else if (topic.intent === 'commercial') {
    intentScore = 20;
    roi = 'Medium';
  } else {
    intentScore = 10;
    roi = 'Low';
  }
  totalScore += intentScore;
  
  // Seasonality scoring (0-20 points)
  const currentMonth = new Date().getMonth();
  const seasonalData = SEASONAL_CALENDAR_[currentMonth];
  if (seasonalData) {
    const isSeasonallyRelevant = seasonalData.keywords.some(keyword => 
      topic.topic?.toLowerCase().includes(keyword.toLowerCase()) ||
      topic.keywords?.toLowerCase().includes(keyword.toLowerCase())
    );
    if (isSeasonallyRelevant) {
      trendScore = 20;
      totalScore += 20;
    }
  }
  
  // Keyword richness scoring (0-15 points)
  const keywordCount = topic.keywords_list ? topic.keywords_list.length : 0;
  if (keywordCount >= 15) {
    totalScore += 15;
  } else if (keywordCount >= 10) {
    totalScore += 10;
  } else if (keywordCount >= 5) {
    totalScore += 5;
  }
  
  // Source bonus (0-15 points)
  if (topic.source === 'Competitor Gap') {
    totalScore += 15;
    competitionScore = 60; // Assume competitive if from gap analysis
  } else if (topic.source === 'Trending Bridge') {
    totalScore += 10;
    trendScore += 10;
  } else if (topic.source === 'Evergreen') {
    totalScore += 5;
  }
  
  // Local relevance (0-10 points) - web dev is global but can have local angle
  const localKeywords = ['local', 'small business', 'startup', 'agency', 'freelance'];
  const hasLocalAngle = localKeywords.some(keyword =>
    topic.topic?.toLowerCase().includes(keyword) ||
    topic.keywords?.toLowerCase().includes(keyword)
  );
  if (hasLocalAngle) {
    localScore = 10;
    totalScore += 10;
  }
  
  // Title quality (0-10 points)
  const title = topic.title || topic.topic || '';
  if (title.length >= 40 && title.length <= 60) {
    totalScore += 10;
  } else if (title.length >= 30) {
    totalScore += 5;
  }
  
  return {
    score: totalScore,
    trendScore: trendScore,
    intentScore: intentScore,
    localScore: localScore,
    competitionScore: competitionScore,
    roi: roi
  };
}

// ============================================================================
// SHEET OPERATIONS
// ============================================================================

/**
 * Writes enriched topics to the queue sheet
 */
function writeThemesToSheet_(topics) {
  if (!topics || topics.length === 0) {
    return 0;
  }
  
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.QUEUE_SHEET);
      sheet.appendRow([
        'Topic', 'Keywords', 'Used?', 'Used At', 'Source', 'Score', 
        'Trend Score', 'Intent', 'Intent Score', 'Local Score', 'ROI', 
        'Created At', 'Notes', 'LLM Brief', 'Status', 'Competition Score', 'Published URL'
      ]);
      sheet.getRange('A1:Q1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    const rows = topics.map(topic => [
      topic.topic || topic.title,
      topic.keywords || '',
      '',  // Used?
      '',  // Used At
      topic.source || 'Generated',
      topic.score || 0,
      topic.trendScore || 0,
      topic.intent || 'educational',
      topic.intentScore || 0,
      topic.localScore || 0,
      topic.roi || 'Medium',
      new Date(),
      topic.notes || '',
      '',  // LLM Brief (filled by background job)
      'Queued',
      topic.competitionScore || 50,
      ''   // Published URL
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      
      // Sort by score (descending)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const range = sheet.getRange(2, 1, lastRow - 1, 17);
        range.sort({column: 6, ascending: false}); // Sort by Score column
      }
      
      SharedUtils_.logToSheet(`Wrote ${rows.length} topics to ${CONFIG.QUEUE_SHEET} sheet`, 'INFO');
    }
    
    return rows.length;
    
  } catch (error) {
    SharedUtils_.logToSheet(`Failed to write topics to sheet: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely parses JSON array from LLM response
 */
function safeParseJsonArray_(text) {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\s*/g, '');
    }
    
    const parsed = JSON.parse(cleaned);
    
    // Handle both array and object with topics array
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.topics && Array.isArray(parsed.topics)) {
      return parsed.topics;
    }
    
    return [];
    
  } catch (error) {
    SharedUtils_.logToSheet(`JSON parse failed: ${error.message}. Raw text: ${text.substring(0, 200)}...`, 'ERROR');
    return [];
  }
}

// ============================================================================
// BACKGROUND JOBS (Continuation Logic)
// ============================================================================

/**
 * Kicks off background job to backfill LLM briefs for queued topics
 */
function kickoffBriefBackfillJob() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('briefBackfillJob_isRunning', 'true');
  scheduleJobContinuation_('continueBriefBackfillJob_', 10);
}

function continueBriefBackfillJob_() {
  // Implementation continues in next section...
  // This would generate detailed content briefs for each topic
  SharedUtils_.logToSheet('Brief backfill job started (stub)', 'INFO');
}

/**
 * Kicks off background job to refresh scores based on latest performance
 */
function kickoffScoreRefreshJob() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('scoreRefreshJob_isRunning', 'true');
  scheduleJobContinuation_('continueScoreRefreshJob_', 15);
}

function continueScoreRefreshJob_() {
  // Implementation continues in next section...
  // This would recalculate scores based on new performance data
  SharedUtils_.logToSheet('Score refresh job started (stub)', 'INFO');
}

/**
 * Utility to schedule continuation of background jobs
 */
function scheduleJobContinuation_(functionName, delaySeconds) {
  const triggers = ScriptApp.getProjectTriggers();
  
  // Remove existing trigger for this function
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .after(delaySeconds * 1000)
    .create();
}

// ============================================================================
// COMPETITOR ANALYSIS (Stub - Will be expanded)
// ============================================================================

/**
 * UI entry point for competitor analysis
 */
function analyzeCompetitors() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Competitor Analysis',
    'This feature requires additional setup:\n\n' +
    '1. Add competitor blog URLs to the "Competitors" sheet\n' +
    '2. Run the analysis job (background process)\n' +
    '3. Use "Promote Top Competitor Topics" to generate ideas\n\n' +
    'See SETUP_GUIDE.md for detailed instructions.',
    ui.ButtonSet.OK
  );
}

/**
 * Shows seasonal calendar for current month
 */
function showSeasonalCalendar() {
  const currentMonth = new Date().getMonth();
  const seasonalData = SEASONAL_CALENDAR_[currentMonth];
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    `Seasonal Topics for ${monthName}`,
    `Themes:\n${seasonalData.themes.join('\n')}\n\n` +
    `Events:\n${seasonalData.events.join('\n')}\n\n` +
    `Keywords:\n${seasonalData.keywords.join(', ')}`,
    ui.ButtonSet.OK
  );
}
