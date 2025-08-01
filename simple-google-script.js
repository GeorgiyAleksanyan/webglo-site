/**
 * Simple WebGlo Form Handler - Google Apps Script
 * Minimal, clean implementation
 */

// Configuration
const SHEET_ID = '1pgMueQhJ-yRcrV2S_qdrj_Ia3-fg5RRNBN5EsAe5LfY';
const NOTIFICATION_EMAIL = 'info@webglo.org';

function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'WebGlo Form Handler Active',
    timestamp: new Date().toISOString()
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders({
    'Access-Control-Allow-Origin': '*'
  });
}

function doPost(e) {
  try {
    console.log('📧 Form submission received');
    
    // Parse request
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received');
    }
    
    console.log('📋 Data:', data);
    
    // Basic validation
    if (!data.type || !data.data || !data.data.email) {
      throw new Error('Missing required fields');
    }
    
    // Log to sheet
    logToSheet(data);
    
    // Send notifications
    if (data.type === 'newsletter') {
      sendNewsletterConfirmation(data.data.email);
    } else if (data.type === 'contact') {
      sendContactNotification(data);
      sendContactConfirmation(data);
    }
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
  }
}

function logToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = data.type === 'newsletter' ? 'Newsletter' : 'Contact';
    
    let targetSheet = sheet.getSheetByName(sheetName);
    if (!targetSheet) {
      targetSheet = sheet.insertSheet(sheetName);
      
      // Add headers
      if (data.type === 'newsletter') {
        targetSheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Email', 'Source']]);
      } else {
        targetSheet.getRange(1, 1, 1, 6).setValues([
          ['Timestamp', 'First Name', 'Last Name', 'Email', 'Message', 'Source']
        ]);
      }
    }
    
    // Add data
    if (data.type === 'newsletter') {
      targetSheet.appendRow([
        new Date(data.timestamp),
        data.data.email,
        data.source || ''
      ]);
    } else {
      targetSheet.appendRow([
        new Date(data.timestamp),
        data.data.firstName || '',
        data.data.lastName || '',
        data.data.email,
        data.data.message || '',
        data.source || ''
      ]);
    }
    
    console.log('✅ Data logged to sheet');
    
  } catch (error) {
    console.error('❌ Sheet error:', error);
    throw error;
  }
}

function sendNewsletterConfirmation(email) {
  try {
    const subject = '🎉 Welcome to WebGlo Insights!';
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #df00ff, #0cead9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to WebGlo Insights! 🚀</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Thanks for subscribing!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            You'll receive weekly insights, tips, and strategies to grow your business online.
          </p>
        </div>
        
        <div style="padding: 20px; background: #374151; color: white; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            <strong>WebGlo - Digital Solutions That Work</strong><br>
            Email: info@webglo.org | Phone: (848) 207-4616
          </p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: body,
      name: 'WebGlo Team',
      replyTo: 'info@webglo.org'
    });
    
    console.log('✅ Newsletter confirmation sent');
    
  } catch (error) {
    console.error('❌ Newsletter email error:', error);
  }
}

function sendContactNotification(data) {
  try {
    const subject = `New Contact: ${data.data.firstName || ''} ${data.data.lastName || ''}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #df00ff, #0cead9); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #374151;">Contact Details</h2>
          <p><strong>Name:</strong> ${data.data.firstName || ''} ${data.data.lastName || ''}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.data.email}">${data.data.email}</a></p>
          ${data.data.phone ? `<p><strong>Phone:</strong> ${data.data.phone}</p>` : ''}
          ${data.data.company ? `<p><strong>Company:</strong> ${data.data.company}</p>` : ''}
        </div>
        
        ${data.data.message ? `
        <div style="padding: 20px; background: white;">
          <h3 style="color: #374151;">Message</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            ${data.data.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}
        
        <div style="padding: 20px; background: #374151; color: white; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Submitted: ${new Date(data.timestamp).toLocaleString()}<br>
            Source: ${data.source || 'Unknown'}
          </p>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: body
    });
    
    console.log('✅ Contact notification sent');
    
  } catch (error) {
    console.error('❌ Contact notification error:', error);
  }
}

function sendContactConfirmation(data) {
  try {
    const subject = `Thank you for contacting WebGlo, ${data.data.firstName || 'there'}!`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #df00ff, #0cead9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Hi ${data.data.firstName || 'there'}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for reaching out to WebGlo! We've received your message and will respond within 24 hours.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151;">What's next?</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>We'll review your message within 4 hours</li>
              <li>You'll receive a personalized response within 24 hours</li>
              <li>If needed, we'll schedule a consultation call</li>
            </ul>
          </div>
        </div>
        
        <div style="padding: 20px; background: #374151; color: white; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            <strong>WebGlo - Digital Solutions That Work</strong><br>
            Email: info@webglo.org | Phone: (848) 207-4616
          </p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(data.data.email, subject, '', {
      htmlBody: body,
      name: 'WebGlo Team',
      replyTo: 'info@webglo.org'
    });
    
    console.log('✅ Contact confirmation sent');
    
  } catch (error) {
    console.error('❌ Contact confirmation error:', error);
  }
}
