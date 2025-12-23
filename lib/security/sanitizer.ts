import DOMPurify from 'isomorphic-dompurify';

// 🛡️ Security Configuration
const SECURITY_CONFIG = {
  MAX_INPUT_LENGTH: 1000,
  ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  BLOCKED_PATTERNS: [
    /<script\b[^>]*>.*?<\/script>/gi,
    /<iframe\b[^>]*>.*?<\/iframe>/gi,
    /<object\b[^>]*>.*?<\/object>/gi,
    /<embed\b[^>]*>.*?<\/embed>/gi,
    /<applet\b[^>]*>.*?<\/applet>/gi,
    /<form\b[^>]*>.*?<\/form>/gi,
    /<input\b[^>]*>/gi,
    /<a\b[^>]*href\s*=\s*["']javascript:[^"']*["'][^>]*>.*?<\/a>/gi,
    /<meta\b[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi,
    /<base\b[^>]*>/gi,
    /&#x?[0-9a-f]+;/gi
  ],
  SQL_KEYWORDS: ['union', 'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter', 'exec', 'execute', 'script', 'javascript', 'vbscript'],
  DANGEROUS_CHARS: /[';\\-\\*\\|%+=\\[\\]{}()^$!@#&~`\\\\]/g
};

// 🧹 General Input Sanitization
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// 🔤 String Sanitization
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Length check
  if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
    input = input.substring(0, SECURITY_CONFIG.MAX_INPUT_LENGTH);
  }

  // Remove dangerous patterns
  let sanitized = input;
  SECURITY_CONFIG.BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Use DOMPurify for HTML sanitization
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: SECURITY_CONFIG.ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return sanitized.trim();
}

// 🗄️ SQL Injection Prevention
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove dangerous characters
  let sanitized = input.replace(SECURITY_CONFIG.DANGEROUS_CHARS, '');
  
  // Remove SQL keywords
  SECURITY_CONFIG.SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized.trim();
}

// 📧 Email Sanitization
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return email;
  }

  // Basic email validation and sanitization
  const sanitized = email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '');

  // Basic email format validation
  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

// 🔍 Search Query Sanitization
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Remove dangerous characters and patterns
  let sanitized = query
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/[;\\-\\*\\|%+=\\[\\]{}()^$!@#&~`\\\\]/g, '') // Remove SQL injection characters
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '') // Remove SQL keywords
    .trim();

  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized;
}

// 📝 Text Content Sanitization
export function sanitizeTextContent(text: string): string {
  if (typeof text !== 'string') {
    return text;
  }

  // Use DOMPurify for comprehensive sanitization
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }).trim();
}

// 🔗 URL Sanitization
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

// 📊 Object Sanitization
export function sanitizeObject(obj: any, allowedFields: string[] = []): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Only include allowed fields
    if (allowedFields.length === 0 || allowedFields.includes(key)) {
      sanitized[key] = sanitizeInput(value);
    }
  }

  return sanitized;
}

// 🚨 Threat Detection
export function detectThreats(input: string): { isThreat: boolean; threats: string[] } {
  const threats: string[] = [];
  
  if (typeof input !== 'string') {
    return { isThreat: false, threats: [] };
  }

  // Check for XSS patterns
  if (/<script\b[^>]*>.*?<\/script>/gi.test(input)) {
    threats.push('XSS_SCRIPT_TAG');
  }

  if (/javascript:/gi.test(input)) {
    threats.push('XSS_JAVASCRIPT_URL');
  }

  if (/on\w+\s*=/gi.test(input)) {
    threats.push('XSS_EVENT_HANDLER');
  }

  // Check for SQL injection patterns
  if (/\b(union|select|insert|update|delete|drop|create|alter)\b/gi.test(input)) {
    threats.push('SQL_INJECTION_KEYWORD');
  }

  if (/[';\\-\\*\\|%+=\\[\\]{}()^$!@#&~`\\\\]/g.test(input)) {
    threats.push('SQL_INJECTION_CHARACTERS');
  }

  // Check for command injection
  if (/[;&|`$()]/g.test(input)) {
    threats.push('COMMAND_INJECTION');
  }

  return {
    isThreat: threats.length > 0,
    threats
  };
}

// 🛡️ Comprehensive Sanitization
export function comprehensiveSanitize(input: any): any {
  const sanitized = sanitizeInput(input);
  
  if (typeof sanitized === 'string') {
    const threatDetection = detectThreats(sanitized);
    if (threatDetection.isThreat) {
      console.warn('🚨 Threat detected:', threatDetection.threats);
    }
  }

  return sanitized;
}

const sanitizer = {
  sanitizeInput,
  sanitizeSQL,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeTextContent,
  sanitizeURL,
  sanitizeObject,
  detectThreats,
  comprehensiveSanitize
};

export default sanitizer;
