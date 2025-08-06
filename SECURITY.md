# WebGlo Security Guide

## Overview
This document outlines the security measures implemented to protect the WebGlo website against common vulnerabilities and exploits, despite being hosted on a public GitHub repository.

## Security Concerns Addressed

### 1. Public Repository Exposure
**Risk**: All source code, including form handlers and API endpoints, are publicly visible.

**Mitigations Implemented**:
- Environment-aware script URLs with obfuscation
- Domain validation to prevent unauthorized usage
- Rate limiting to prevent abuse
- Security token generation for request validation
- Honeypot fields for spam detection

### 2. Form Abuse and Spam
**Risk**: Automated bots submitting spam through contact forms.

**Mitigations Implemented**:
- Client-side rate limiting (30-second intervals between submissions)
- Server-side rate limiting (10-second minimum in Google Apps Script)
- Honeypot field detection (`website` field)
- Domain whitelist validation
- Form input validation (email format, message length, etc.)
- Security tokens for each submission

### 3. Email Address Harvesting
**Risk**: Bots scraping email addresses from the website.

**Mitigations Available**:
- Email obfuscation utility in SecurityConfig
- Indirect contact through forms instead of direct email display

### 4. API Endpoint Abuse
**Risk**: Direct calls to Google Apps Script endpoints bypassing website security.

**Mitigations Implemented**:
- Source domain validation
- Security token validation
- Referrer checking
- Rate limiting per script execution
- Input sanitization and validation

### 5. Blog System Security
**Risk**: Comment spam, XSS attacks, and data manipulation in the new blog system.

**Mitigations Implemented**:
- HTML entity encoding for all user-generated content
- Input length limits (1000 characters for comments)
- Comment moderation system (auto-approve or manual review)
- Rate limiting on comment submissions
- Post ID validation to prevent data corruption
- No script tag execution in user content
- Separate Google Sheets database for blog data isolation
- Email validation for newsletter subscriptions
- Honeypot protection for all blog forms

## Security Architecture

### Client-Side Security (JavaScript)

#### SecurityConfig Class (`js/security-config.js`)
- **Environment Detection**: Automatically detects production vs development
- **Rate Limiting**: Prevents rapid-fire form submissions
- **Input Validation**: Validates form data before submission
- **Domain Validation**: Ensures requests come from authorized domains
- **Security Token Generation**: Creates unique tokens for each request
- **Email Obfuscation**: Utility for hiding email addresses from bots

#### FormHandler Class (`js/form-handler.js`)
- **Enhanced Validation**: Uses SecurityConfig for comprehensive validation
- **Honeypot Detection**: Silently rejects spam submissions
- **Error Handling**: Secure error messages that don't expose internal details
- **Loading States**: Professional UI feedback during submission

### Server-Side Security (Google Apps Script)

#### Request Validation
```javascript
function validateSubmission(data) {
  // Domain whitelist checking
  // Honeypot spam detection
  // Rate limiting enforcement
  // Email format validation
  // Security token validation
}
```

#### Rate Limiting
- 10-second minimum between any submissions (global)
- Uses Google Apps Script Properties Service for persistence
- Logs security events for monitoring

#### Input Sanitization
- All form inputs are validated and sanitized
- Email format validation with regex
- Message length limits enforced
- Name format validation

## Configuration

### Allowed Domains
The following domains are authorized to use the form system:
- `webglo.org`
- `www.webglo.org`
- `georgiyaleksanyan.github.io` (GitHub Pages fallback)

### Rate Limits
- **Client-side**: 30 seconds between submissions per browser
- **Server-side**: 10 seconds between any submissions globally
- **Error threshold**: Failed submissions are logged for monitoring

### Form Validation Rules
- **Email**: Must match standard email format
- **Name**: 2-50 characters, letters and common punctuation only
- **Message**: 10-2000 characters
- **Phone** (optional): International format validation

## Security Monitoring

### Event Logging
The system logs the following security events:
- Form validation failures
- Rate limit violations
- Honeypot triggers
- Invalid domain attempts
- Failed submissions

### Google Apps Script Logs
- All submissions are logged with timestamps
- Security validation results are recorded
- Failed attempts are tracked for analysis

## Best Practices Implemented

### 1. Defense in Depth
Multiple layers of security:
- Client-side validation and rate limiting
- Server-side validation and rate limiting
- Domain validation
- Honeypot detection
- Security token validation

### 2. Fail Securely
- Spam submissions fail silently (appear successful to bots)
- Error messages don't expose internal system details
- Invalid requests return generic error messages

### 3. Minimal Exposure
- No sensitive data in client-side code
- Google Apps Script deployment IDs are not easily discoverable
- Email addresses are not directly exposed in HTML

### 4. User Experience
- Security measures are transparent to legitimate users
- Clear feedback for rate limiting
- Professional error handling

## Additional Security Recommendations

### For Enhanced Security (Optional)

1. **CAPTCHA Integration**
   - Add Google reCAPTCHA for additional bot protection
   - Implement in both client and server validation

2. **Email Obfuscation**
   - Use the built-in email obfuscation utility
   - Implement JavaScript-based email reveals

3. **Content Security Policy**
   - Add CSP headers to prevent XSS attacks
   - Implement in meta tags or server configuration

4. **API Key Rotation**
   - Regularly update Google Apps Script deployment IDs
   - Implement versioned deployments

5. **Advanced Monitoring**
   - Integrate with Google Analytics for security event tracking
   - Set up alerts for suspicious activity patterns

## Emergency Procedures

### If Security Breach Detected

1. **Immediate Actions**:
   - Disable the Google Apps Script temporarily
   - Update deployment ID to invalidate old endpoints
   - Check Google Sheets for suspicious submissions

2. **Investigation**:
   - Review Google Apps Script execution logs
   - Analyze form submission patterns
   - Check for unusual traffic patterns

3. **Recovery**:
   - Deploy updated security measures
   - Update script URLs if necessary
   - Monitor for continued suspicious activity

### Contact Security Issues
If you discover a security vulnerability:
1. Do not post publicly about it
2. Contact through the secure contact form
3. Include detailed information about the issue
4. Allow time for investigation and patching

## Compliance and Privacy

### Data Handling
- Form submissions are stored in Google Sheets
- No sensitive personal data is collected beyond contact information
- Data is used only for business communication purposes

### GDPR Considerations
- Users can request data deletion
- Data retention policies should be established
- Privacy policy should be updated accordingly

---

**Note**: This security implementation provides strong protection against common threats while maintaining usability and being completely free to operate. Regular review and updates of these measures are recommended as threats evolve.
