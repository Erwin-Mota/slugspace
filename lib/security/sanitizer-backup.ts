// 🧹 Input Sanitization for SlugConnect
// Comprehensive XSS and injection attack prevention

import DOMPurify from 'isomorphic-dompurify';

// 🛡️ HTML Sanitization
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Use DOMPurify for HTML sanitization
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
}

// 🔍 XSS Protection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  let sanitized = input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove data: protocols (except safe image types)
    .replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, '')
    // Remove vbscript: protocols
    .replace(/vbscript:/gi, '')
    // Remove onload, onclick, etc. event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove style attributes
    .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<(object|embed)\b[^>]*>.*?<\/(object|embed)>/gi, '')
    // Remove form tags
    .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
    // Remove input tags
    .replace(/<input\b[^>]*>/gi, '')
    // Remove link tags with javascript
    .replace(/<a\b[^>]*href\s*=\s*["']javascript:[^"']*["'][^>]*>.*?<\/a>/gi, '')
    // Remove meta refresh
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi, '')
    // Remove base tags
    .replace(/<base\b[^>]*>/gi, '')
    // Remove potentially dangerous HTML entities
    .replace(/&#x?[0-9a-f]+;/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();

  // Additional length limits
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

// 🔒 SQL Injection Prevention
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove SQL injection patterns
  return input
    .replace(/('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)|(\|)|(\*)|(%)|(\+)|(\=)|(\<)|(\>)|(\[)|(\])|(\{)|(\})|(\()|(\))|(\^)|(\$)|(\!)|(\@)|(\#)|(\&)|(\~)|(\`)|(\\)/g, '')
    .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript)/gi, '')
    .trim();
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
    .replace(/[^a-z0-9@._-]/g, '')
    .substring(0, 254); // RFC 5321 limit

  // Validate email format
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

// 🔗 URL Sanitization
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return url;
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    // Remove potentially dangerous parameters
    const dangerousParams = ['javascript', 'data', 'vbscript'];
    dangerousParams.forEach(param => {
      parsed.searchParams.delete(param);
    });

    return parsed.toString();
  } catch {
    return '';
  }
}

// 📝 Text Sanitization (for descriptions, comments, etc.)
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return sanitizeInput(input)
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

// 🏷️ Tag Sanitization (for categories, tags, etc.)
export function sanitizeTag(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50); // Limit tag length
}

// 🔢 Number Sanitization
export function sanitizeNumber(input: any): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

// 📅 Date Sanitization
export function sanitizeDate(input: any): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

// 🎯 Comprehensive Object Sanitization
export function sanitizeObject(obj: any, options: {
  maxDepth?: number;
  maxStringLength?: number;
  allowedKeys?: string[];
  sanitizeFunctions?: { [key: string]: (value: any) => any };
} = {}): any {
  const {
    maxDepth = 10,
    maxStringLength = 10000,
    allowedKeys = [],
    sanitizeFunctions = {}
  } = options;

  return sanitizeRecursive(obj, 0);

  function sanitizeRecursive(value: any, depth: number): any {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      return null;
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle primitives
    if (typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }

    // Handle strings
    if (typeof value === 'string') {
      const sanitized = sanitizeInput(value);
      return sanitized.length > maxStringLength 
        ? sanitized.substring(0, maxStringLength) 
        : sanitized;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => sanitizeRecursive(item, depth + 1));
    }

    // Handle objects
    if (typeof value === 'object') {
      const sanitized: any = {};
      
      for (const [key, val] of Object.entries(value)) {
        // Check allowed keys if specified
        if (allowedKeys.length > 0 && !allowedKeys.includes(key)) {
          continue;
        }

        // Apply custom sanitization function if specified
        if (sanitizeFunctions[key]) {
          sanitized[key] = sanitizeFunctions[key](val);
        } else {
          sanitized[key] = sanitizeRecursive(val, depth + 1);
        }
      }

      return sanitized;
    }

    // Handle functions (remove them for security)
    if (typeof value === 'function') {
      return null;
    }

    return null;
  }
}

// 🛡️ Search Query Sanitization
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  return query
    // Remove SQL injection patterns
    .replace(/('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)/g, '')
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove special characters that could be used for injection
    .replace(/[<>'"&]/g, '')
    // Limit length
    .substring(0, 200)
    .trim();
}

// 🎯 Field-specific sanitization functions
export const FIELD_SANITIZERS = {
  email: sanitizeEmail,
  url: sanitizeURL,
  text: sanitizeText,
  html: sanitizeHTML,
  tag: sanitizeTag,
  search: sanitizeSearchQuery,
  number: sanitizeNumber,
  date: sanitizeDate,
  sql: sanitizeSQL,
};

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeSQL,
  sanitizeEmail,
  sanitizeURL,
  sanitizeText,
  sanitizeTag,
  sanitizeNumber,
  sanitizeDate,
  sanitizeObject,
  sanitizeSearchQuery,
  FIELD_SANITIZERS,
};
