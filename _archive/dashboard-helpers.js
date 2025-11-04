/**
 * Get dashboard statistics for display
 */
function getDashboardStats() {
  try {
    const CONFIG = ConfigService_.get();
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Get total posts
    const postsJsonContent = GitHubUtils_.getFile(CONFIG.BLOG_DATA_PATH);
    const postsData = JSON.parse(postsJsonContent);
    const totalPosts = postsData.totalPosts || 0;
    const lastPublished = postsData.lastUpdated || 'Never';
    
    // Get queued topics
    const queueSheet = ss.getSheetByName(CONFIG.QUEUE_SHEET);
    let queuedTopics = 0;
    let nextTopics = [];
    
    if (queueSheet) {
      const queueData = queueSheet.getDataRange().getValues();
      for (let i = 1; i < queueData.length; i++) {
        if (queueData[i][0] === 'Queued') {
          queuedTopics++;
          nextTopics.push({
            title: queueData[i][2],
            priorityScore: queueData[i][1],
            searchIntent: queueData[i][3],
            estimatedWordCount: queueData[i][7]
          });
        }
      }
    }
    
    // Get total views
    const analyticsSheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
    let totalViews = 0;
    
    if (analyticsSheet) {
      const analyticsData = analyticsSheet.getDataRange().getValues();
      for (let i = 1; i < analyticsData.length; i++) {
        totalViews += analyticsData[i][4] || 0;
      }
    }
    
    // Get this month's posts
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const thisMonth = postsData.posts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= thisMonthStart;
    }).length;
    
    return {
      totalPosts: totalPosts,
      queuedTopics: queuedTopics,
      totalViews: totalViews,
      thisMonth: thisMonth,
      lastPublished: lastPublished,
      nextTopics: nextTopics
    };
    
  } catch (error) {
    throw new Error('Failed to load stats: ' + error.message);
  }
}
