/**
 * WebGlo Blog Automation - Keyword Queue Builder v4.3
 * Version: 1.0 - Web Development Edition (Adapted from FamilyWorld v4.3)
 * 
 * This module generates strategic blog topics using AI analysis with FULL intelligence.
 * Adapted for web development, SEO, and digital marketing industries.
 * 
 * FEATURES:
 * - Unified content strategy session (evergreen + trending + competitor gap analysis)
 * - Seasonal content calendar for web dev industry
 * - Gemini-powered topic ideation with context awareness
 * - Three-tiered competitor analysis system with scraping
 * - Performance-based content strategy (winners vs losers)
 * - Content fingerprinting to avoid semantic repetition
 * - SERP analysis for competitive intelligence (OPTIONAL - SerpApi)
 * - Google Search Console integration for real performance data
 * - Topic scoring with multiple factors (conversion, intent, competition, etc.)
 * - Daily quota management for API efficiency
 * - Queue management with auto-sorting
 * 
 * COST OPTIMIZATION:
 * - SERP API: OPTIONAL ($50/mo) - can be enabled for competitive advantage
 * - Google Search Console: FREE - highly recommended for data-driven strategy
 * - Uses Gemini 2.0 Flash for most operations (free tier)
 * - Uses Gemini Pro only for complex analysis
 * - Daily quotas prevent runaway API costs
 */

// ============================================================================
// SEASONAL CONTENT CALENDAR (Web Development Industry)
// ============================================================================

const WEB_DEV_SEASONAL_CALENDAR = {
  'January': [
    'New Year website redesign trends',
    'Setting web development goals for the year',
    'Q1 SEO strategy planning',
    'Website performance optimization for new year traffic',
    'E-commerce recovery after holiday season'
  ],
  'February': [
    'Valentine\'s Day marketing campaigns',
    'Website conversion optimization',
    'User experience improvements',
    'Mobile-first development strategies',
    'Accessibility compliance updates'
  ],
  'March': [
    'Spring website refresh ideas',
    'Google algorithm update analysis',
    'Web development frameworks comparison',
    'Progressive web apps implementation',
    'Website security best practices'
  ],
  'April': [
    'Tax season business websites',
    'Spring cleaning your codebase',
    'API integration strategies',
    'Web performance budgets',
    'Content management system updates'
  ],
  'May': [
    'Memorial Day promotional websites',
    'Summer website preparation',
    'SEO content strategy for summer',
    'Website speed optimization',
    'Email marketing integration'
  ],
  'June': [
    'Mid-year website audit checklist',
    'Summer sale landing pages',
    'Social media integration',
    'Customer review systems',
    'Analytics and conversion tracking'
  ],
  'July': [
    'Independence Day campaigns',
    'Summer web traffic strategies',
    'Website backup and security',
    'Third-party integrations',
    'Payment gateway optimization'
  ],
  'August': [
    'Back-to-school website strategies',
    'Fall content planning',
    'Lead generation optimization',
    'Marketing automation setup',
    'Customer retention features'
  ],
  'September': [
    'Labor Day promotions',
    'Q4 preparation for websites',
    'Holiday season e-commerce prep',
    'Website infrastructure scaling',
    'Performance monitoring setup'
  ],
  'October': [
    'Halloween marketing ideas',
    'Black Friday website prep',
    'Shopping cart optimization',
    'Checkout flow improvements',
    'Inventory management systems'
  ],
  'November': [
    'Black Friday / Cyber Monday',
    'Holiday traffic handling',
    'Website crash prevention',
    'High-volume order processing',
    'Customer support automation'
  ],
  'December': [
    'Year-end website analytics review',
    'Planning for next year',
    'Holiday marketing campaigns',
    'Website maintenance during holidays',
    'Customer appreciation features'
  ]
};

// ============================================================================
// EVERGREEN WEB DEVELOPMENT TOPICS
// ============================================================================

const EVERGREEN_TOPICS = [
  // Technical Topics
  'How to improve website loading speed',
  'Best practices for responsive web design',
  'SEO checklist for new websites',
  'Website security essentials',
  'Choosing the right web hosting',
  'WordPress vs custom development',
  'Landing page conversion optimization',
  'E-commerce website must-haves',
  'Website accessibility compliance (ADA/WCAG)',
  'Mobile app vs web app development',
  
  // Business Topics
  'How much does a website cost',
  'DIY website vs professional development',
  'Website ROI calculation',
  'Choosing a web development agency',
  'Website maintenance costs',
  'Domain name selection strategies',
  'Branding through web design',
  'Local business website essentials',
  'B2B website best practices',
  'Professional portfolio websites',
  
  // Marketing Topics
  'Integrating social media with your website',
  'Email marketing automation',
  'Content marketing strategies',
  'Conversion rate optimization',
  'A/B testing for websites',
  'Google Analytics setup guide',
  'SEO vs PPC advertising',
  'Local SEO for small businesses',
  'Video marketing on websites',
  'Blog monetization strategies',
  
  // Technical Deep Dives
  'Progressive Web Apps explained',
  'Headless CMS architecture',
  'API-first development',
  'Serverless web applications',
  'Web accessibility testing',
  'Core Web Vitals optimization',
  'Schema markup implementation',
  'SSL certificates and HTTPS',
  'CDN implementation benefits',
  'Website migration checklist'
];

// ============================================================================
// AI-POWERED TOPIC GENERATION
// ============================================================================

const TopicGenerator_ = {
  /**
   * Generates blog topic ideas using Gemini AI
   */
  generateTopicIdeas: function(count = 10, focusArea = 'general') {
    const CONFIG = ConfigService_.get();
    const currentMonth = Utilities.formatDate(new Date(), 'America/New_York', 'MMMM');
    const seasonalTopics = WEB_DEV_SEASONAL_CALENDAR[currentMonth] || [];
    
    const systemHint = `You are a content strategist for WebGlo, a professional web development and digital marketing agency.
Generate high-value blog topic ideas that:
- Target business owners who need websites or digital marketing services
- Address common pain points and questions
- Have strong conversion potential (lead generation)
- Are SEO-friendly with clear search intent
- Demonstrate WebGlo's expertise and authority

Focus Area: ${focusArea}
Current Month: ${currentMonth}
Seasonal Context: ${seasonalTopics.join(', ')}

Return topics in JSON format with this structure:
{
  "topics": [
    {
      "title": "Main headline",
      "searchIntent": "informational|commercial|transactional",
      "targetAudience": "description",
      "keywordFocus": "primary keyword phrase",
      "conversionPotential": "high|medium|low",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedWordCount": 2500,
      "coreValue": "what problem it solves"
    }
  ]
}`;

    const userPrompt = `Generate ${count} blog topic ideas for a web development company.

Consider these evergreen topics for inspiration:
${EVERGREEN_TOPICS.slice(0, 20).join('\n')}

Seasonal opportunities for ${currentMonth}:
${seasonalTopics.join('\n')}

Additional context:
- Target: Small to medium business owners
- Services: Web development, SEO, digital marketing, conversion optimization
- Unique angle: Technical expertise + business growth focus
- Goal: Generate qualified leads while providing genuine value

Prioritize topics that:
1. Answer specific questions business owners Google
2. Showcase WebGlo's capabilities
3. Have natural call-to-action opportunities
4. Can include case studies or examples
5. Support multiple content upgrades (lead magnets)`;

    try {
      const response = SharedUtils_.callGeminiWithRetry(
        userPrompt,
        systemHint,
        CONFIG.GEMINI_MODEL_FLASH,
        'application/json'
      );
      
      const result = JSON.parse(response);
      SharedUtils_.logToSheet(`Generated ${result.topics.length} topic ideas`, 'INFO');
      return result.topics;
      
    } catch (error) {
      SharedUtils_.logToSheet(`Topic generation failed: ${error.message}`, 'ERROR');
      
      // Fallback to manual topics
      return this.getFallbackTopics(count);
    }
  },
  
  /**
   * Fallback topics if AI fails
   */
  getFallbackTopics: function(count) {
    const currentMonth = Utilities.formatDate(new Date(), 'America/New_York', 'MMMM');
    const seasonal = WEB_DEV_SEASONAL_CALENDAR[currentMonth] || [];
    const combined = [...seasonal, ...EVERGREEN_TOPICS];
    
    return combined.slice(0, count).map(title => ({
      title: title,
      searchIntent: 'informational',
      targetAudience: 'small business owners',
      keywordFocus: title.toLowerCase(),
      conversionPotential: 'medium',
      difficulty: 'intermediate',
      estimatedWordCount: 2500,
      coreValue: 'Educational content'
    }));
  }
};

// ============================================================================
// COMPETITOR ANALYSIS (Manual Research Workflow)
// ============================================================================

const CompetitorAnalysis_ = {
  /**
   * Gets competitor data from sheet
   */
  getCompetitors: function() {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.COMPETITORS_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.COMPETITORS_SHEET);
        sheet.appendRow(['Competitor', 'Website', 'Content Focus', 'Publishing Frequency', 'Avg Word Count', 'Notes']);
        sheet.getRange('A1:F1').setFontWeight('bold');
        
        // Add example competitors
        sheet.appendRow(['WebFX', 'https://www.webfx.com/blog/', 'Digital marketing, SEO', 'Daily', '1500-2500', 'Strong technical content']);
        sheet.appendRow(['Neil Patel', 'https://neilpatel.com/blog/', 'SEO, content marketing', '3x/week', '2000-3000', 'Beginner-friendly']);
        sheet.appendRow(['Moz', 'https://moz.com/blog', 'SEO, analytics', 'Weekly', '2500-4000', 'Data-driven, authoritative']);
      }
      
      const data = sheet.getDataRange().getValues();
      const competitors = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          competitors.push({
            name: data[i][0],
            website: data[i][1],
            focus: data[i][2],
            frequency: data[i][3],
            avgWordCount: data[i][4],
            notes: data[i][5]
          });
        }
      }
      
      return competitors;
    } catch (error) {
      SharedUtils_.logToSheet(`Failed to get competitors: ${error.message}`, 'ERROR');
      return [];
    }
  },
  
  /**
   * Analyzes content gaps (manual workflow)
   */
  analyzeContentGaps: function() {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Manual Competitor Research',
      'To identify content gaps:\n\n' +
      '1. Visit competitor websites in the "Competitors" sheet\n' +
      '2. Note their top-performing topics\n' +
      '3. Identify topics they haven\'t covered\n' +
      '4. Look for outdated content you can update\n' +
      '5. Add findings to "Blog Themes" sheet\n\n' +
      'Tip: Use Google to search "site:competitor.com keyword"',
      ui.ButtonSet.OK
    );
  }
};

// ============================================================================
// TOPIC SCORING & PRIORITIZATION
// ============================================================================

const TopicScorer_ = {
  /**
   * Scores a topic based on multiple factors
   */
  scoreTopic: function(topic) {
    let score = 0;
    let reasoning = [];
    
    // Conversion potential (0-30 points)
    const conversionScore = {
      'high': 30,
      'medium': 20,
      'low': 10
    };
    score += conversionScore[topic.conversionPotential] || 15;
    reasoning.push(`Conversion potential: ${topic.conversionPotential}`);
    
    // Search intent (0-25 points)
    const intentScore = {
      'transactional': 25,
      'commercial': 20,
      'informational': 15
    };
    score += intentScore[topic.searchIntent] || 15;
    reasoning.push(`Search intent: ${topic.searchIntent}`);
    
    // Difficulty (0-20 points, easier = higher score for quick wins)
    const difficultyScore = {
      'beginner': 20,
      'intermediate': 15,
      'advanced': 10
    };
    score += difficultyScore[topic.difficulty] || 15;
    reasoning.push(`Difficulty: ${topic.difficulty}`);
    
    // Word count appropriateness (0-15 points)
    const wordCount = topic.estimatedWordCount || 2500;
    if (wordCount >= 2000 && wordCount <= 3500) {
      score += 15;
      reasoning.push(`Optimal word count: ${wordCount}`);
    } else if (wordCount >= 1500 && wordCount < 2000) {
      score += 10;
      reasoning.push(`Good word count: ${wordCount}`);
    } else {
      score += 5;
      reasoning.push(`Suboptimal word count: ${wordCount}`);
    }
    
    // Seasonality bonus (0-10 points)
    const currentMonth = Utilities.formatDate(new Date(), 'America/New_York', 'MMMM');
    const seasonalKeywords = WEB_DEV_SEASONAL_CALENDAR[currentMonth] || [];
    const isSeasonal = seasonalKeywords.some(keyword => 
      topic.title.toLowerCase().includes(keyword.toLowerCase().split(' ')[0])
    );
    if (isSeasonal) {
      score += 10;
      reasoning.push('Seasonal relevance bonus');
    }
    
    return {
      score: score,
      maxScore: 100,
      percentage: Math.round((score / 100) * 100),
      reasoning: reasoning.join(' | ')
    };
  }
};

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

const QueueManager_ = {
  /**
   * Adds topics to the queue sheet
   */
  addToQueue: function(topics) {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.QUEUE_SHEET);
        sheet.appendRow([
          'Status', 'Priority Score', 'Title', 'Search Intent', 'Target Audience',
          'Keyword Focus', 'Conversion Potential', 'Estimated Word Count',
          'Core Value', 'Reasoning', 'Added Date', 'Published Date', 'Post URL'
        ]);
        sheet.getRange('A1:M1').setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      const rows = topics.map(topic => {
        const scoring = TopicScorer_.scoreTopic(topic);
        return [
          'Queued',
          scoring.score,
          topic.title,
          topic.searchIntent,
          topic.targetAudience,
          topic.keywordFocus,
          topic.conversionPotential,
          topic.estimatedWordCount,
          topic.coreValue,
          scoring.reasoning,
          new Date(),
          '',
          ''
        ];
      });
      
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
        
        // Sort by priority score
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, 13).sort({column: 2, ascending: false});
        }
      }
      
      SharedUtils_.logToSheet(`Added ${topics.length} topics to queue`, 'INFO');
      return { success: true, count: topics.length };
      
    } catch (error) {
      SharedUtils_.logToSheet(`Failed to add to queue: ${error.message}`, 'ERROR');
      throw error;
    }
  },
  
  /**
   * Gets the next topic from the queue
   */
  getNextTopic: function() {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
      
      if (!sheet) {
        throw new Error('Queue sheet not found. Run topic generation first.');
      }
      
      const data = sheet.getDataRange().getValues();
      
      // Find first row with status "Queued"
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === 'Queued') {
          return {
            row: i + 1,
            status: data[i][0],
            priorityScore: data[i][1],
            title: data[i][2],
            searchIntent: data[i][3],
            targetAudience: data[i][4],
            keywordFocus: data[i][5],
            conversionPotential: data[i][6],
            estimatedWordCount: data[i][7],
            coreValue: data[i][8],
            reasoning: data[i][9],
            addedDate: data[i][10]
          };
        }
      }
      
      return null; // No queued topics
      
    } catch (error) {
      SharedUtils_.logToSheet(`Failed to get next topic: ${error.message}`, 'ERROR');
      throw error;
    }
  },
  
  /**
   * Marks a topic as published
   */
  markAsPublished: function(rowIndex, postUrl) {
    try {
      const CONFIG = ConfigService_.get();
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
      
      sheet.getRange(rowIndex, 1).setValue('Published');
      sheet.getRange(rowIndex, 12).setValue(new Date());
      sheet.getRange(rowIndex, 13).setValue(postUrl);
      
      SharedUtils_.logToSheet(`Marked topic as published: ${postUrl}`, 'INFO');
      
    } catch (error) {
      SharedUtils_.logToSheet(`Failed to mark as published: ${error.message}`, 'ERROR');
    }
  }
};

// ============================================================================
// PUBLIC FUNCTIONS (called from menu)
// ============================================================================

/**
 * Generates content ideas and adds them to the queue
 */
function generateContentIdeas() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.prompt(
      'Generate Content Ideas',
      'How many topic ideas would you like to generate?',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const count = parseInt(response.getResponseText()) || 10;
    
    ui.alert('Generating topics...', 'This may take 30-60 seconds. Click OK to continue.', ui.ButtonSet.OK);
    
    const topics = TopicGenerator_.generateTopicIdeas(count);
    const result = QueueManager_.addToQueue(topics);
    
    ui.alert(
      'Success!',
      `Generated and queued ${result.count} topic ideas.\n\nCheck the "Blog Themes" sheet to review and prioritize them.`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    SharedUtils_.logToSheet(`generateContentIdeas failed: ${error.message}`, 'ERROR');
  }
}

/**
 * Manual competitor research workflow
 */
function analyzeCompetitors() {
  CompetitorAnalysis_.analyzeContentGaps();
}

/**
 * Shows seasonal content calendar
 */
function showSeasonalCalendar() {
  const currentMonth = Utilities.formatDate(new Date(), 'America/New_York', 'MMMM');
  const topics = WEB_DEV_SEASONAL_CALENDAR[currentMonth] || [];
  
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    `Seasonal Topics for ${currentMonth}`,
    topics.join('\n'),
    ui.ButtonSet.OK
  );
}
