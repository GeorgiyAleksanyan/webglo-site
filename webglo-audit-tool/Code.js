// ===================================================
// WebGlo Pro Website Audit Tool (Comprehensive Version)
// FINAL VERSION
// ===================================================

// --- CONFIGURATION ---
const PSI_API_KEY = PropertiesService.getScriptProperties().getProperty('PSI_API_KEY');

// ===================================================
// WEB APP & API ENDPOINT
// ===================================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('WebGlo Free Website Audit');
}

/**
 * Main API endpoint called by the frontend.
 * Orchestrates the entire audit and email sending process for all pages.
 */
function performWebsiteAudit(formData) {
  try {
    const domain = formData.url;
    const email = formData.email;
    const geminiApiKey = formData.geminiApiKey;
    const isAdminOverride = !!formData.adminOverride;

    if (!domain || !email) {
      throw new Error("URL and Email are required fields.");
    }

    // Audit limit check
    if (!canRunAudit(email, isAdminOverride)) {
      return { success: false, message: "You can only request one audit per week. Contact admin for override." };
    }

    // Discover all pages (try sitemap, fallback to homepage)
    let urls = [];
    try {
      urls = discoverSitePages(domain);
    } catch (err) {
      Logger.log('Error discovering site pages: ' + err);
      return { success: false, message: "Failed to discover site pages. Please check your URL and try again." };
    }

    // Create Drive folder for this audit
    let auditFolder;
    try {
      auditFolder = DriveApp.createFolder('audit_' + email + '_' + new Date().getTime());
      saveAuditFolderInfo(email, auditFolder.getId());
    } catch (err) {
      Logger.log('Error creating audit folder: ' + err);
      return { success: false, message: "Failed to create audit folder. Please try again later." };
    }

    // Store the audit request data in PropertiesService for async retrieval (queue)
    const requestId = Utilities.getUuid();
    const requestData = { urls, email, geminiApiKey, auditFolderId: auditFolder.getId(), status: 'pending', timestamp: Date.now() };
    let queue = [];
    try {
      queue = JSON.parse(PropertiesService.getScriptProperties().getProperty('AUDIT_QUEUE') || '[]');
    } catch (err) {
      queue = [];
    }
    queue.push({ requestId, email, timestamp: Date.now() });
    PropertiesService.getScriptProperties().setProperty('AUDIT_QUEUE', JSON.stringify(queue));
    PropertiesService.getScriptProperties().setProperty('AUDIT_REQUEST_' + requestId, JSON.stringify(requestData));

    // Start the queue processor if not already running
    if (!PropertiesService.getScriptProperties().getProperty('AUDIT_QUEUE_RUNNING')) {
      PropertiesService.getScriptProperties().setProperty('AUDIT_QUEUE_RUNNING', 'true');
      ScriptApp.newTrigger("processAuditQueue")
        .timeBased()
        .after(100)
        .create();
    }

    return { success: true, message: "Audit request queued! Your comprehensive report will be sent to your email shortly. You will receive status updates as your audit progresses." };
  } catch (error) {
    Logger.log(`Error in performWebsiteAudit: ${error.toString()}\n${error.stack}`);
    return { success: false, message: error.message };
  }
}

// ===================================================
// CORE ORCHESTRATION (Asynchronous)
// ===================================================

/**
 * Processes the audit queue, running one audit at a time to avoid quota issues.
 */
function processAuditQueue(e) {
  // Delete the trigger that called this function to prevent re-runs.
  const allTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of allTriggers) {
    if (trigger.getHandlerFunction() === "processAuditQueue") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  const scriptProps = PropertiesService.getScriptProperties();
  let queue = [];
  try {
    queue = JSON.parse(scriptProps.getProperty('AUDIT_QUEUE') || '[]');
  } catch (err) {
    queue = [];
  }
  if (queue.length === 0) {
    scriptProps.deleteProperty('AUDIT_QUEUE_RUNNING');
    return;
  }
  // Get the next request in the queue
  const next = queue.shift();
  scriptProps.setProperty('AUDIT_QUEUE', JSON.stringify(queue));
  const requestKey = 'AUDIT_REQUEST_' + next.requestId;
  const requestData = JSON.parse(scriptProps.getProperty(requestKey));
  // Mark as running
  requestData.status = 'running';
  scriptProps.setProperty(requestKey, JSON.stringify(requestData));

  const { urls, email, geminiApiKey, auditFolderId } = requestData;
  let allAuditData = [];
  let errorOccurred = false;

  for (let i = 0; i < urls.length; i++) {
    let pageUrl = urls[i];
    let psiRawData = null, psiSummary = null, contentData = null, screenshotFileId = null;
    try {
      psiRawData = getPageSpeedInsightsRaw(pageUrl);
      Utilities.sleep(1500); // Delay to avoid API rate limits
      psiSummary = summarizePageSpeedInsights(psiRawData);
      contentData = getWebsiteContent(pageUrl);
      screenshotFileId = null;
      var psiFile = DriveApp.getFolderById(auditFolderId).createFile('psi_' + encodeURIComponent(pageUrl) + '.json', JSON.stringify(psiRawData), MimeType.PLAIN_TEXT);
      allAuditData.push({
        url: pageUrl,
        psi: psiSummary,
        psiRaw: psiRawData,
        content: contentData,
        psiFileId: psiFile.getId(),
        screenshotFileId: screenshotFileId
      });
      // Log progress for frontend (can be polled via Apps Script API)
      scriptProps.setProperty(requestKey + '_PROGRESS', `Processed ${i + 1} of ${urls.length} pages.`);
    } catch (err) {
      Logger.log(`Data gathering failed for ${pageUrl}: ${err.toString()}`);
      errorOccurred = true;
      allAuditData.push({
        url: pageUrl,
        error: err.toString()
      });
    }
  }

  // Compose AI prompt from all audit data
  var aiAnalysis = 'AI analysis was not requested or failed to generate.';
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      aiAnalysis = getGeminiAnalysisMultiPage(allAuditData, geminiApiKey, auditFolderId);
    } catch (err) {
      Logger.log(`AI Analysis failed: ${err.toString()}`);
      aiAnalysis = `*AI analysis could not be completed. Reason: ${err.message}*`;
    }
  }

  sendAuditEmail(email, { domain: urls[0], pages: allAuditData, auditFolderId: auditFolderId }, aiAnalysis);
  // Mark as done
  requestData.status = errorOccurred ? 'error' : 'done';
  scriptProps.setProperty(requestKey, JSON.stringify(requestData));
  // Remove progress property
  scriptProps.deleteProperty(requestKey + '_PROGRESS');

  // If more in queue, schedule next
  if (queue.length > 0) {
    ScriptApp.newTrigger("processAuditQueue")
      .timeBased()
      .after(100)
      .create();
  } else {
    scriptProps.deleteProperty('AUDIT_QUEUE_RUNNING');
  }
}

// ===================================================
// DATA GATHERING MODULES
// ===================================================

/**
 * Discover all pages for a domain using sitemap.xml or fallback to homepage.
 */
function discoverSitePages(domain) {
  var urls = [];
  var sitemapUrl = domain.endsWith('/') ? domain + 'sitemap.xml' : domain + '/sitemap.xml';
  try {
    var response = UrlFetchApp.fetch(sitemapUrl, {muteHttpExceptions: true});
    if (response.getResponseCode() == 200) {
      var xml = response.getContentText();
      var matches = xml.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        matches.forEach(function(loc) {
          var url = loc.replace(/<\/?loc>/g, '').trim();
          if (url) urls.push(url);
        });
      }
    }
  } catch (e) {
    Logger.log('Sitemap fetch failed: ' + e);
  }
  // If no sitemap, run basic crawler
  if (urls.length === 0) {
    try {
      var homepageResponse = UrlFetchApp.fetch(domain, {muteHttpExceptions: true});
      if (homepageResponse.getResponseCode() == 200) {
        var html = homepageResponse.getContentText();
        var linkRegex = /<a\s+[^>]*href=["']([^"'#?]+)["'][^>]*>/gi;
        var match;
        var found = {};
        var baseDomain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');
        // Always include homepage
        urls.push(domain);
        while ((match = linkRegex.exec(html)) !== null && urls.length < 20) {
          var href = match[1];
          // Only internal links, not mailto, tel, etc.
          if (href.startsWith('/')) {
            var fullUrl = domain.replace(/\/$/, '') + href;
            if (!found[fullUrl]) {
              urls.push(fullUrl);
              found[fullUrl] = true;
            }
          } else if (href.indexOf(baseDomain) !== -1) {
            var fullUrl = href.startsWith('http') ? href : 'https://' + href;
            if (!found[fullUrl]) {
              urls.push(fullUrl);
              found[fullUrl] = true;
            }
          }
        }
      }
    } catch (e) {
      Logger.log('Homepage crawl failed: ' + e);
    }
    // If still empty, fallback to homepage only
    if (urls.length === 0) urls.push(domain);
  }
  return urls;
}

/**
 * Save audit folder info and timestamp for purge/limit logic.
 */
function saveAuditFolderInfo(email, folderId) {
  var info = { folderId: folderId, timestamp: Date.now() };
  PropertiesService.getScriptProperties().setProperty('AUDIT_' + email, JSON.stringify(info));
}

/**
 * Check if user can run audit (limit 1 per week unless admin override).
 */
function canRunAudit(email, isAdminOverride) {
  var info = PropertiesService.getScriptProperties().getProperty('AUDIT_' + email);
  if (!info) return true;
  var data = JSON.parse(info);
  var oneWeek = 7 * 24 * 60 * 60 * 1000;
  if (isAdminOverride) return true;
  return (Date.now() - data.timestamp) > oneWeek;
}

/**
 * Purge old audit folders (run daily via time-based trigger).
 */
function purgeOldAuditFolders() {
  var props = PropertiesService.getScriptProperties();
  var keys = props.getKeys().filter(k => k.startsWith('AUDIT_'));
  var threshold = 7 * 24 * 60 * 60 * 1000;
  keys.forEach(function(key) {
    var data = JSON.parse(props.getProperty(key));
    if ((Date.now() - data.timestamp) > threshold) {
      try {
        DriveApp.getFolderById(data.folderId).setTrashed(true);
        props.deleteProperty(key);
      } catch (e) {
        Logger.log('Failed to delete folder: ' + e);
      }
    }
  });
}

/**
 * Fetches the raw HTML and extracts key content.
 */
function getWebsiteContent(url) {
  try {
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const html = response.getContentText();
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || 'Not found';
    const description = html.match(/<meta\s+name="description"\s+content="(.*?)"/i)?.[1] || 'Not found';
    const h1 = html.match(/<h1.*?>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, '').trim() || 'Not found';
    return { title, description, h1 };
  } catch (e) {
    Logger.log(`Content fetch failed for ${url}: ${e.toString()}`);
    return { title: 'Error fetching', description: 'Error fetching', h1: 'Error fetching' };
  }
}

/**
 * Fetches the full PageSpeed Insights API response (all categories, audits, etc.).
 */
function getPageSpeedInsightsRaw(url) {
  let api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${PSI_API_KEY}`;
  api += '&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO';
  const response = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
  const data = JSON.parse(response.getContentText());
  if (data.error) throw new Error(`PageSpeed API Error: ${data.error.message}`);
  return data;
}

/**
 * Summarizes the PSI API response for quick reference (scores, top opportunities).
 */
function summarizePageSpeedInsights(data) {
  if (!data || !data.lighthouseResult) return {};
  const { categories, audits } = data.lighthouseResult;
  const opportunities = Object.values(audits)
    .filter(audit => audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative')
    .map(audit => ({
      id: audit.id || audit.title,
      title: audit.title,
      description: audit.description,
      score: audit.score,
      displayValue: audit.displayValue || ''
    }));
  return {
    scores: {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    },
    opportunities: opportunities.sort((a, b) => a.score - b.score)
  };
}

// ===================================================
// AI & EMAIL MODULES
// ===================================================

/**
 * Calls Gemini API for multi-page audit, assembling prompt from Drive data.
 */
function getGeminiAnalysisMultiPage(allAuditData, geminiApiKey, auditFolderId) {
  var prompt = 'You are Aura, an elite web consultant for WebGlo (webglo.org), delivering a premium, AI-enhanced website audit. Analyze the following data for each page. Use Markdown.\\n';
  allAuditData.forEach(function(page) {
    prompt += `\\n---\\n**Page:** ${page.url}\\n`;
    prompt += `**PageSpeed Insights:**\\n\\n${JSON.stringify(page.psiRaw, null, 2)}\\n`;
    prompt += `**Content Extracted:**\\n${JSON.stringify(page.content, null, 2)}\\n`;
    if (page.screenshotFileId) {
      prompt += `**Screenshot File ID:** ${page.screenshotFileId}\\n`;
    }
  });
  prompt += '\\n---\\nPlease provide a deep analysis, recommendations, and action plan for the entire site.';

  const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey;
  const textPart = { "text": prompt };
  const payload = {
    contents: [{ "parts": [textPart] }],
    "generationConfig": { "temperature": 0.5, "maxOutputTokens": 8192 },
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(apiUrl, options);
  const resultText = response.getContentText();
  const result = JSON.parse(resultText);
  if (result.error) throw new Error(result.error.message);
  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('AI returned an unexpected response format. Full response: ' + resultText);
  }
  return result.candidates[0].content.parts[0].text;
}

/**
 * Sends the final, enhanced HTML email report with styled CTA buttons.
 */
function sendAuditEmail(email, auditData, aiAnalysis) {
  const subject = `Your Pro-Level WebGlo Website Audit for ${auditData.domain}`;
  const aiHtml = markdownToHtml(aiAnalysis);
  const htmlBody = `<!DOCTYPE html><html><body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;"><tr><td align="center"><table width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;"><tr><td style="background: linear-gradient(135deg, #df00ff 0%, #0cead9 100%); padding: 40px 30px; text-align: center;"><h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Your AI-Enhanced Audit is Ready!</h1><p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">A comprehensive analysis for: <strong>${auditData.domain}</strong></p></td></tr><tr><td style="padding: 30px 40px;"><div style="color: #374151; font-size: 16px; line-height: 1.6;">${aiHtml}</div></td></tr><tr><td style="background-color: #111827; padding: 40px 30px; text-align: center;"><h2 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">Ready to Transform Your Business?</h2><p style="color: #d1d5db; font-size: 16px; margin: 0 0 30px 0;">Let's discuss how we can help you achieve your digital goals.</p><table cellpadding="0" cellspacing="0" style="margin: 0 auto;"><tr><td align="center" style="padding: 0 10px;"><a href="https://webglo.org/contact.html" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #df00ff, #0cead9); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Book Free Consultation</a></td><td align="center" style="padding: 0 10px;"><a href="https://webglo.org/pricing.html" target="_blank" style="display: inline-block; background-color: transparent; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; border: 2px solid #6b7280; font-weight: 600; font-size: 16px;">View Pricing</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlBody,
    name: 'Aura from WebGlo',
    replyTo: 'sales@webglo.org'
  });
}

/**
 * Converts basic Markdown from the AI response to HTML for the email.
 */
function markdownToHtml(md) {
   return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 25px 0 15px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 30px 0 20px 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 35px 0 25px 0;">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li style="margin-bottom: 10px; line-height: 1.6;">$1</li>')
    .replace(/(<\/li>\s*<li)/g, '</li><li')
    .replace(/(<li>.*<\/li>)/g, '<ul style="padding-left: 20px; margin: 15px 0; color: #4b5563;">$1</ul>')
    .replace(/\n/g, '<br>');
}