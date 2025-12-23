// 🛡️ XSS (Cross-Site Scripting) Detection and Prevention
// Advanced XSS pattern detection

import { detectSQLInjection } from './sql-injection-checker';

// XSS attack patterns
const XSS_PATTERNS = [
  // Script tags
  /<script\b[^>]*>.*?<\/script>/gi,
  /<script\b[^>]*\/?>/gi,
  
  // Event handlers
  /on\w+\s*=/gi,
  
  // JavaScript protocol
  /javascript\s*:/gi,
  /j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi,
  
  // Data URIs (dangerous when combined with script)
  /data:\s*text\/html/gi,
  
  // VBScript
  /vbscript\s*:/gi,
  
  // Iframe injection
  /<iframe\b[^>]*>.*?<\/iframe>/gi,
  
  // Object/embed/audio/video (can be used for XSS)
  /<object\b[^>]*>.*?<\/object>/gi,
  /<embed\b[^>]*\/?>/gi,
  /<audio\b[^>]*>.*?<\/audio>/gi,
  /<video\b[^>]*>.*?<\/video>/gi,
  
  // HTML entities encoding bypass
  /&#x3C;script/i,
  /%3Cscript/i,
  
  // Sanitized HTML with encoded payloads
  /&lt;script&gt;/gi,
  /&#60;script&#62;/gi,
  
  // Unencoded < and >
  /<img\b[^>]*src[^>]*>/gi,
  
  // CSS expressions (IE exploit)
  /expression\s*\(/gi,
  
  // SVG with script
  /<svg\b[^>]*>.*<script/gi,
  
  // Unicode encoding
  /\\x3Cscript/i,
  /\\u003Cscript/i,
];

// Dangerous HTML attributes
const DANGEROUS_ATTRIBUTES = [
  'onerror',
  'onload',
  'onclick',
  'onmouseover',
  'onfocus',
  'onblur',
  'onkeypress',
  'onkeydown',
  'onkeyup',
  'onchange',
  'onsubmit',
  'onreset',
  'onresize',
  'onabort',
  'onunload',
];

// Check if input contains XSS patterns
export function detectXSS(input: string): { isThreat: boolean; threats: string[] } {
  const threats: string[] = [];
  
  if (typeof input !== 'string') {
    return { isThreat: false, threats: [] };
  }
  
  // Check for XSS patterns
  XSS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push(`XSS_PATTERN_${index}`);
    }
  });
  
  // Check for dangerous attributes
  DANGEROUS_ATTRIBUTES.forEach(attr => {
    const regex = new RegExp(attr + '\\s*=', 'gi');
    if (regex.test(input)) {
      threats.push(`XSS_EVENT_HANDLER_${attr}`);
    }
  });
  
  // Check for encoded payloads
  if (/&#x[0-9a-f]+/gi.test(input) && /script/i.test(input)) {
    threats.push('XSS_ENCODED_PAYLOAD');
  }
  
  // Check for reflected XSS in URL parameters
  if (input.includes('=</script>') || input.includes('="><script>')) {
    threats.push('XSS_REFLECTED');
  }
  
  // Check for stored XSS markers
  if (/<img[^>]*src=x/gi.test(input)) {
    threats.push('XSS_STORED');
  }
  
  // Check for DOM-based XSS
  if (/document\.(cookie|location|URL|write)/i.test(input)) {
    threats.push('XSS_DOM_BASED');
  }
  
  return {
    isThreat: threats.length > 0,
    threats: [...new Set(threats)]
  };
}

// Sanitize input for XSS
export function sanitizeForXSS(input: string): string {
  // Use DOMPurify (already installed)
  const DOMPurify = require('isomorphic-dompurify');
  
  // Remove script tags
  let sanitized = input.replace(/<script\b[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<script\b[^>]*\/?>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  // Use DOMPurify for comprehensive sanitization
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  return sanitized;
}

// Check all common injection attacks
export function detectAllInjectionAttacks(input: string): {
  xss: boolean;
  sql: boolean;
  ldap: boolean;
  xpath: boolean;
  nosql: boolean;
  command: boolean;
  allThreats: string[];
} {
  const xss = detectXSS(input);
  const sql = detectSQLInjection(input);
  const allThreats = [...xss.threats, ...sql.threats];
  
  // Check for LDAP injection
  const ldap = /[()&|!]/gi.test(input) && /uid|cn|dn/i.test(input);
  
  // Check for XPATH injection
  const xpath = /'|"|\(|\)/gi.test(input) && /or\s+.*=.*or/i.test(input);
  
  // Check for NoSQL injection
  const nosql = /\$[a-z]+|\$eq|\$ne|\$gt|\$lt/i.test(input);
  
  // Check for command injection
  const command = /[;&|`$()]|rm\s+-rf|cat\s+\//gi.test(input);
  
  return {
    xss: xss.isThreat,
    sql: sql.isThreat,
    ldap,
    xpath,
    nosql,
    command,
    allThreats: [...allThreats, ...(ldap ? ['LDAP_INJECTION'] : []), ...(xpath ? ['XPATH_INJECTION'] : []), ...(nosql ? ['NOSQL_INJECTION'] : []), ...(command ? ['COMMAND_INJECTION'] : [])]
  };
}

