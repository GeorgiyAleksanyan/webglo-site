/**
 * SECURITY FIX for GitHub CodeQL Alert: Incomplete URL substring sanitization
 * 
 * Replace lines 253-265 in your Google Apps Script with this improved validation:
 */

// IMPROVED URL VALIDATION CODE (Replace existing validation in validateSubmission function)
if (data.source) {
  try {
    // More robust URL hostname extraction and validation
    // First, ensure the URL starts with a valid protocol
    if (!data.source.match(/^https?:\/\//)) {
      console.log('Invalid URL protocol:', data.source);
      return false;
    }
    
    // Extract hostname using a more comprehensive approach
    const urlMatch = data.source.match(/^https?:\/\/([^\/\?\#]+)/);
    if (!urlMatch || !urlMatch[1]) {
      console.log('Could not extract hostname from URL:', data.source);
      return false;
    }
    
    const hostname = urlMatch[1].toLowerCase();
    
    // Remove port numbers if present for comparison
    const hostnameWithoutPort = hostname.split(':')[0];
    
    // Check against allowed domains (case-insensitive)
    const isAllowed = allowedDomains.some(domain => 
      hostnameWithoutPort === domain.toLowerCase() || 
      hostnameWithoutPort.endsWith('.' + domain.toLowerCase())
    );
    
    if (!isAllowed) {
      console.log('Invalid source domain:', hostnameWithoutPort);
      return false;
    }
  } catch (error) {
    console.log('Error validating source URL:', data.source, error);
    return false;
  }
}

/**
 * SECURITY IMPROVEMENTS MADE:
 * 
 * 1. Protocol Validation: Ensures URL starts with http:// or https://
 * 2. Comprehensive Regex: Uses [^\/\?\#]+ to properly extract hostname
 * 3. Null Checks: Validates urlMatch exists and has captured group
 * 4. Case-insensitive Comparison: Converts hostnames to lowercase
 * 5. Port Number Handling: Strips port numbers for domain comparison  
 * 6. Subdomain Support: Allows subdomains of allowed domains
 * 7. Better Error Handling: More specific error logging
 * 
 * This addresses the CodeQL security alert about incomplete URL sanitization
 * by implementing more robust hostname extraction and validation.
 */
