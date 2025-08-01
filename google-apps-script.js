/**
 * WebGlo Form Handler - Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Create a Google Sheet for storing submissions
 * 5. Update the SHEET_ID constant below
 * 6. Deploy as a web app (Execute as: Me, Access: Anyone)
 * 7. Copy the web app URL to your form-handler.js file
 */

// CONFIGURATION - Update these values
const SHEET_ID = '1pgMueQhJ-yRcrV2S_qdrj_Ia3-fg5RRNBN5EsAe5LfY';
const NOTIFICATION_EMAIL = 'info@webglo.org';

/**
 * GOOGLE APPS SCRIPT ALIAS LIMITATION SOLUTION
 * 
 * Issue: Google Apps Script cannot use custom email aliases as senders
 * even when properly configured in Gmail due to security restrictions.
 * 
 * Solution: Professional email branding with clear WebGlo identity
 * and proper reply-to configuration for professional communication.
 */

function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    // Log the submission to Google Sheets
    const result = logToSheet(data);
    
    // Send email notification to business
    sendNotificationEmail(data);
    
    // Send confirmation email to user
    sendConfirmationEmail(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully',
        id: result.id 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function logToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Create headers if this is the first submission
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Form Type', 'First Name', 'Last Name', 'Email', 
        'Phone', 'Company', 'Service', 'Budget', 'Timeline', 'Message',
        'Source URL', 'User Agent', 'Submission ID'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f4f6');
    }
    
    // Generate unique submission ID
    const submissionId = Utilities.getUuid();
    
    // Prepare row data
    const rowData = [
      new Date(data.timestamp),
      data.formType || 'contact',
      data.data.firstName || '',
      data.data.lastName || '',
      data.data.email || '',
      data.data.phone || '',
      data.data.company || '',
      data.data.service || '',
      data.data.budget || '',
      data.data.timeline || '',
      data.data.message || '',
      data.source || '',
      data.userAgent || '',
      submissionId
    ];
    
    // Add the row
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    
    return { id: submissionId, row: sheet.getLastRow() };
    
  } catch (error) {
    console.error('Error logging to sheet:', error);
    throw new Error('Failed to log submission to Google Sheets');
  }
}

function sendNotificationEmail(data) {
  try {
    const subject = `New ${data.formType} submission from ${data.data.firstName} ${data.data.lastName}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #df00ff, #0cead9); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Form Submission</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.firstName} ${data.data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.email}</td>
            </tr>
            ${data.data.phone ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Phone:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.phone}</td>
            </tr>
            ` : ''}
            ${data.data.company ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Company:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.company}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="padding: 20px; background: white;">
          <h2 style="color: #374151; margin-top: 0;">Project Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.data.service ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Service:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.service}</td>
            </tr>
            ` : ''}
            ${data.data.budget ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Budget:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.budget}</td>
            </tr>
            ` : ''}
            ${data.data.timeline ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Timeline:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.data.timeline}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        ${data.data.message ? `
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Message</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #df00ff;">
            ${data.data.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}
        
        <div style="padding: 20px; background: #374151; color: white; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Submitted from: <a href="${data.source}" style="color: #0cead9;">${data.source}</a><br>
            Time: ${new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });
    
  } catch (error) {
    console.error('Error sending notification email:', error);
    // Don't throw error here as the form submission should still succeed
  }
}

function sendConfirmationEmail(data) {
  try {
    if (!data.data.email) {
      console.log('No email address provided, skipping confirmation email');
      return;
    }

    const subject = `[WebGlo] Thank you for contacting us - Message received!`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #df00ff, #0cead9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">We've received your message</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #df00ff; margin-bottom: 20px;">
            <p style="margin: 0; color: #374151; font-weight: bold; font-size: 16px;">
              📧 This is an automated email from WebGlo
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
              For replies and questions, please contact: <strong>info@webglo.org</strong>
            </p>
          </div>
          
          <h2 style="color: #374151; margin-top: 0;">Hi ${data.data.firstName || 'there'}!</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
            Thank you for reaching out to WebGlo! We've successfully received your message and are excited to learn more about your project.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #df00ff; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">What happens next?</h3>
            <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
              <li>Our team will review your submission within 24 hours</li>
              <li>We'll prepare a personalized response based on your needs</li>
              <li>You'll receive a detailed follow-up from our team</li>
              <li>We'll schedule a free consultation call if requested</li>
            </ul>
          </div>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h3 style="color: #374151; margin-top: 0;">Your submission details:</h3>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Name:</strong> ${data.data.firstName} ${data.data.lastName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${data.data.email}</p>
            ${data.data.company ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Company:</strong> ${data.data.company}</p>` : ''}
            ${data.data.service ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Service:</strong> ${data.data.service}</p>` : ''}
            ${data.data.budget ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Budget:</strong> ${data.data.budget}</p>` : ''}
            <p style="margin: 5px 0; color: #6b7280;"><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        <div style="padding: 30px; background: #f3f4f6;">
          <h3 style="color: #374151; margin-top: 0;">In the meantime...</h3>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
            Feel free to explore our website to learn more about our services, or check out our portfolio of recent projects.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://webglo.org" style="display: inline-block; background: linear-gradient(135deg, #df00ff, #0cead9); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; background: #374151; color: white; text-align: center;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">
            <strong>WebGlo - Digital Solutions That Work</strong><br>
            Email: info@webglo.org | Phone: (848) 207-4616<br>
            <span style="color: #9ca3af;">This is an automated confirmation from WebGlo. Please do not reply to this email.</span>
          </p>
        </div>
      </div>
    `;
    
    // Use GmailApp with professional branding (no alias needed)
    GmailApp.sendEmail(
      data.data.email,
      subject,
      '', // Plain text body (empty)
      {
        htmlBody: htmlBody,
        name: 'WebGlo Team',
        replyTo: 'info@webglo.org'
      }
    );
    
    console.log(`Confirmation email sent to: ${data.data.email}`);
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error here as the form submission should still succeed
  }
}

// Test function for manual testing
function testFormSubmission() {
  const testData = {
    formType: 'contact',
    timestamp: new Date().toISOString(),
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'georgiy.student.me@gmail.com',
      phone: '(555) 123-4567',
      company: 'Test Company',
      service: 'web-development',
      budget: '5k-10k',
      timeline: '2-3-months',
      message: 'This is a test submission to verify the form handler is working correctly.'
    },
    source: 'http://localhost:8000/contact.html',
    userAgent: 'Test User Agent'
  };
  
  const result = logToSheet(testData);
  sendNotificationEmail(testData);
  sendConfirmationEmail(testData);
  
  console.log('Test submission result:', result);
  console.log('Both notification and confirmation emails sent!');
}

// Setup function to create the initial spreadsheet structure
function setupSpreadsheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Set sheet name
    sheet.setName('Form Submissions');
    
    // Add headers
    const headers = [
      'Timestamp', 'Form Type', 'First Name', 'Last Name', 'Email', 
      'Phone', 'Company', 'Service', 'Budget', 'Timeline', 'Message',
      'Source URL', 'User Agent', 'Submission ID'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f4f6');
    headerRange.setBorder(true, true, true, true, true, true);
    
    // Set column widths
    sheet.setColumnWidth(1, 120); // Timestamp
    sheet.setColumnWidth(2, 100); // Form Type
    sheet.setColumnWidth(3, 100); // First Name
    sheet.setColumnWidth(4, 100); // Last Name
    sheet.setColumnWidth(5, 150); // Email
    sheet.setColumnWidth(6, 120); // Phone
    sheet.setColumnWidth(7, 150); // Company
    sheet.setColumnWidth(8, 120); // Service
    sheet.setColumnWidth(9, 120); // Budget
    sheet.setColumnWidth(10, 120); // Timeline
    sheet.setColumnWidth(11, 300); // Message
    sheet.setColumnWidth(12, 200); // Source URL
    sheet.setColumnWidth(13, 150); // User Agent
    sheet.setColumnWidth(14, 150); // Submission ID
    
    console.log('Spreadsheet setup complete!');
    
  } catch (error) {
    console.error('Error setting up spreadsheet:', error);
  }
}
