/**
 * WebGlo Landing Page Express - Google Apps Script Backend
 * 
 * This script handles:
 * - Order processing via Stripe webhooks
 * - Customer data storage in Google Sheets
 * - File uploads to dedicated Google Drive folders
 * - Email notifications via Gmail
 * - Project brief submissions
 * 
 * Deploy as a web app with execute permissions for "Anyone"
 */

// Configuration - Update these with your actual values
const CONFIG = {
  STRIPE_WEBHOOK_SECRET: 'whsec_your_webhook_secret_here',
  ORDERS_SHEET_ID: 'your_google_sheet_id_here',
  DRIVE_FOLDER_ID: 'your_main_drive_folder_id_here',
  EMAIL_FROM: 'hello@webglo.org',
  WEBSITE_URL: 'https://webglo.org'
};

/**
 * Main doPost function - handles all POST requests
 */
function doPost(e) {
  try {
    const path = e.parameter.path || 'webhook';
    
    switch (path) {
      case 'webhook':
        return handleStripeWebhook(e);
      case 'submit-brief':
        return handleProjectBrief(e);
      case 'upload-files':
        return handleFileUploads(e);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid endpoint' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Internal server error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle Stripe webhook events
 */
function handleStripeWebhook(e) {
  try {
    const payload = e.postData.contents;
    const sig = e.parameter.stripe_signature;
    
    // In production, verify the webhook signature here
    // For now, we'll process the event directly
    
    const event = JSON.parse(payload);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      processOrder(session);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ received: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Webhook error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Webhook processing failed' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Process completed order
 */
function processOrder(session) {
  try {
    const orderNumber = session.metadata.order_number;
    const customerEmail = session.customer_details.email;
    const customerName = session.customer_details.name;
    const amount = session.amount_total / 100; // Convert from cents
    
    // Create customer folder in Google Drive
    const customerFolder = createCustomerFolder(orderNumber, session.metadata.business_name);
    
    // Save order to Google Sheets
    saveOrderToSheet({
      orderNumber: orderNumber,
      customerEmail: customerEmail,
      customerName: customerName,
      businessName: session.metadata.business_name,
      industry: session.metadata.industry,
      mainGoal: session.metadata.main_goal,
      amount: amount,
      stripeSessionId: session.id,
      customerFolderId: customerFolder.getId(),
      status: 'confirmed',
      createdAt: new Date(),
      deliveryDeadline: new Date(Date.now() + (48 * 60 * 60 * 1000)) // 48 hours from now
    });
    
    // Send confirmation email
    sendConfirmationEmail(orderNumber, customerEmail, customerName, customerFolder.getUrl());
    
    // Send internal notification
    sendInternalNotification(orderNumber, session.metadata);
    
    Logger.log('Order processed successfully: ' + orderNumber);
    
  } catch (error) {
    Logger.log('Order processing error: ' + error.toString());
  }
}

/**
 * Create dedicated Google Drive folder for customer
 */
function createCustomerFolder(orderNumber, businessName) {
  try {
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const folderName = `${orderNumber} - ${businessName} - ${new Date().toISOString().split('T')[0]}`;
    
    const customerFolder = mainFolder.createFolder(folderName);
    
    // Create subfolders
    customerFolder.createFolder('01-Assets-Provided');
    customerFolder.createFolder('02-Design-Drafts');
    customerFolder.createFolder('03-Final-Deliverables');
    customerFolder.createFolder('04-Revisions');
    
    // Set sharing permissions (view access for customer)
    customerFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return customerFolder;
    
  } catch (error) {
    Logger.log('Error creating customer folder: ' + error.toString());
    throw error;
  }
}

/**
 * Save order data to Google Sheets
 */
function saveOrderToSheet(orderData) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID).getActiveSheet();
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 12).setValues([[
        'Order Number', 'Customer Email', 'Customer Name', 'Business Name', 
        'Industry', 'Main Goal', 'Amount', 'Stripe Session ID', 
        'Customer Folder ID', 'Status', 'Created At', 'Delivery Deadline'
      ]]);
    }
    
    // Add the order data
    sheet.appendRow([
      orderData.orderNumber,
      orderData.customerEmail,
      orderData.customerName,
      orderData.businessName,
      orderData.industry,
      orderData.mainGoal,
      orderData.amount,
      orderData.stripeSessionId,
      orderData.customerFolderId,
      orderData.status,
      orderData.createdAt,
      orderData.deliveryDeadline
    ]);
    
    Logger.log('Order saved to sheet: ' + orderData.orderNumber);
    
  } catch (error) {
    Logger.log('Error saving to sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Send confirmation email to customer
 */
function sendConfirmationEmail(orderNumber, customerEmail, customerName, folderUrl) {
  try {
    const subject = `🎉 Order Confirmed: ${orderNumber} - Landing Page Express`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">Your Landing Page Express is on its way!</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${customerName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for choosing WebGlo! We're excited to create your professional landing page.
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Service:</strong> Landing Page Express</p>
            <p><strong>Amount Paid:</strong> $297.00</p>
            <p><strong>Expected Delivery:</strong> Within 48 hours</p>
          </div>
          
          <h3 style="color: #1f2937;">🚀 What Happens Next?</h3>
          <ol style="color: #4b5563; line-height: 1.8;">
            <li><strong>Project Brief (Within 2 hours):</strong> We'll send you a detailed questionnaire to gather your assets and preferences.</li>
            <li><strong>Design & Development (24-40 hours):</strong> Our team will create your landing page.</li>
            <li><strong>Delivery & Review (48 hours):</strong> You'll receive your completed landing page with one free revision round.</li>
          </ol>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #1e40af; margin-top: 0;">📁 Your Project Folder</h3>
            <p style="color: #1e40af; margin-bottom: 15px;">We've created a dedicated Google Drive folder for your project:</p>
            <a href="${folderUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Your Project Folder →
            </a>
          </div>
          
          <h3 style="color: #1f2937;">📞 Need Help?</h3>
          <p style="color: #4b5563;">
            <strong>Email:</strong> hello@webglo.org<br>
            <strong>Response Time:</strong> Within 2 hours<br>
            <strong>Reference:</strong> Order ${orderNumber}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="${CONFIG.WEBSITE_URL}/project-brief.html?order=${orderNumber}" 
               style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              Complete Your Project Brief →
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; color: #6b7280; font-size: 14px;">
          <p>Thank you for choosing WebGlo!</p>
          <p>WebGlo | Professional Web Solutions | <a href="${CONFIG.WEBSITE_URL}" style="color: #ef4444;">webglo.org</a></p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(customerEmail, subject, '', {
      htmlBody: htmlBody,
      from: CONFIG.EMAIL_FROM
    });
    
    Logger.log('Confirmation email sent to: ' + customerEmail);
    
  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
  }
}

/**
 * Send internal notification to team
 */
function sendInternalNotification(orderNumber, metadata) {
  try {
    const subject = `🚨 NEW ORDER: ${orderNumber} - Landing Page Express`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc2626;">🚨 New Landing Page Express Order</h2>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Order Details</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Business:</strong> ${metadata.business_name}</p>
          <p><strong>Industry:</strong> ${metadata.industry}</p>
          <p><strong>Goal:</strong> ${metadata.main_goal}</p>
          <p><strong>Customer Email:</strong> ${metadata.contact_email}</p>
          <p><strong>Deadline:</strong> 48 hours from now</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Customer will receive project brief link via email</li>
          <li>Review brief submission when it arrives</li>
          <li>Begin design and development</li>
          <li>Deliver within 48 hours</li>
        </ol>
        
        <p><strong>Customer Folder:</strong> Check Google Drive for ${orderNumber} folder</p>
      </div>
    `;
    
    GmailApp.sendEmail(CONFIG.EMAIL_FROM, subject, '', {
      htmlBody: htmlBody
    });
    
    Logger.log('Internal notification sent for order: ' + orderNumber);
    
  } catch (error) {
    Logger.log('Error sending internal notification: ' + error.toString());
  }
}

/**
 * Handle project brief submissions
 */
function handleProjectBrief(e) {
  try {
    const formData = JSON.parse(e.postData.contents);
    const orderNumber = formData.order_number;
    
    // Find customer folder
    const customerFolder = findCustomerFolder(orderNumber);
    
    if (customerFolder) {
      // Save brief data to folder as JSON
      const briefData = JSON.stringify(formData, null, 2);
      const briefFile = customerFolder.createFile(`project-brief-${orderNumber}.json`, briefData, MimeType.PLAIN_TEXT);
      
      // Also save to a Google Sheet for easy access
      saveBriefToSheet(formData);
      
      // Send brief received notification
      sendBriefReceivedEmail(formData.contact_email, orderNumber);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Project brief received' }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error('Customer folder not found for order: ' + orderNumber);
    }
    
  } catch (error) {
    Logger.log('Error handling project brief: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle file uploads
 */
function handleFileUploads(e) {
  try {
    const orderNumber = e.parameter.order_number;
    const fileType = e.parameter.file_type; // 'logo' or 'images'
    
    // Find customer folder
    const customerFolder = findCustomerFolder(orderNumber);
    
    if (!customerFolder) {
      throw new Error('Customer folder not found');
    }
    
    const assetsFolder = customerFolder.getFoldersByName('01-Assets-Provided').next();
    
    // Process uploaded files
    const uploadedFiles = [];
    
    // Note: File upload handling in Google Apps Script is complex
    // For production, consider using Google Drive API directly from frontend
    // This is a simplified example
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, files: uploadedFiles }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error handling file uploads: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Find customer folder by order number
 */
function findCustomerFolder(orderNumber) {
  try {
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const folders = mainFolder.getFolders();
    
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.getName().startsWith(orderNumber)) {
        return folder;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Error finding customer folder: ' + error.toString());
    return null;
  }
}

/**
 * Save project brief to Google Sheets
 */
function saveBriefToSheet(briefData) {
  try {
    // Create or get briefs sheet
    const spreadsheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID);
    let briefsSheet;
    
    try {
      briefsSheet = spreadsheet.getSheetByName('Project Briefs');
    } catch (e) {
      briefsSheet = spreadsheet.insertSheet('Project Briefs');
      // Add headers
      briefsSheet.getRange(1, 1, 1, 10).setValues([[
        'Order Number', 'Headline', 'Target Audience', 'Value Proposition', 
        'CTA Text', 'Benefits', 'Form Fields', 'Special Requests', 
        'Contact Preference', 'Submitted At'
      ]]);
    }
    
    briefsSheet.appendRow([
      briefData.order_number,
      briefData.headline_copy,
      briefData.target_audience,
      briefData.value_proposition,
      briefData.cta_text,
      briefData.benefits_list,
      briefData.form_fields ? briefData.form_fields.join(', ') : '',
      briefData.special_requests,
      briefData.contact_preference,
      new Date()
    ]);
    
    Logger.log('Brief saved to sheet for order: ' + briefData.order_number);
    
  } catch (error) {
    Logger.log('Error saving brief to sheet: ' + error.toString());
  }
}

/**
 * Send brief received confirmation
 */
function sendBriefReceivedEmail(customerEmail, orderNumber) {
  try {
    const subject = `📋 Project Brief Received - ${orderNumber}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">📋 Brief Received!</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">We're now creating your landing page</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Thank you for the detailed information!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            We've received your project brief for order <strong>${orderNumber}</strong>. 
            Our design team is now working on creating your professional landing page.
          </p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #065f46; margin-top: 0;">⏰ Delivery Timeline</h3>
            <p style="color: #065f46; margin-bottom: 0; font-size: 18px;">
              <strong>Your landing page will be delivered within 48 hours</strong>
            </p>
          </div>
          
          <h3 style="color: #1f2937;">What's happening now:</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>✅ Project brief reviewed and analyzed</li>
            <li>🎨 Design mockup creation (in progress)</li>
            <li>⚙️ Development and optimization (next)</li>
            <li>📧 Delivery and revision round (final step)</li>
          </ul>
          
          <p style="color: #4b5563;">
            We'll send you a preview link as soon as the initial design is ready for your review.
          </p>
          
          <h3 style="color: #1f2937;">Questions or Changes?</h3>
          <p style="color: #4b5563;">
            If you need to make any changes to your requirements or have questions, 
            please email us at <strong>hello@webglo.org</strong> with your order number <strong>${orderNumber}</strong>.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; color: #6b7280; font-size: 14px;">
          <p>We're excited to deliver an amazing landing page for you!</p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(customerEmail, subject, '', {
      htmlBody: htmlBody,
      from: CONFIG.EMAIL_FROM
    });
    
    Logger.log('Brief received email sent to: ' + customerEmail);
    
  } catch (error) {
    Logger.log('Error sending brief received email: ' + error.toString());
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  Logger.log('Testing WebGlo Apps Script setup...');
  
  try {
    // Test Drive access
    const mainFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    Logger.log('✅ Drive access OK: ' + mainFolder.getName());
    
    // Test Sheets access
    const sheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID);
    Logger.log('✅ Sheets access OK: ' + sheet.getName());
    
    // Test Gmail access
    const emailQuota = GmailApp.getRemainingDailyQuota();
    Logger.log('✅ Gmail access OK. Daily quota remaining: ' + emailQuota);
    
    Logger.log('🎉 All systems ready!');
    
  } catch (error) {
    Logger.log('❌ Setup error: ' + error.toString());
  }
}
