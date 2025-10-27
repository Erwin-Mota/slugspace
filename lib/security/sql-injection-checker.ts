// 🛡️ SQL Injection Detection and Prevention
// Advanced SQL injection pattern detection

// SQL keywords to detect
const SQL_KEYWORDS = [
  'union', 'select', 'insert', 'update', 'delete', 'drop', 'create',
  'alter', 'exec', 'execute', 'script', 'javascript', 'vbscript',
  'or', 'and', 'where', 'like', 'order', 'group', 'having', 'limit'
];

// Dangerous SQL patterns
const SQL_PATTERNS = [
  /(\s|\b)(union|select|insert|update|delete|drop|create|alter)\s+.*/gi,
  /('|;|--|\|\|)/g,
  /(or|and)\s+[0-9]+=[0-9]+/gi,
  /\/\*.*\*\//,
  /@@version/i,
  /xp_/i,
  /sp_/i,
  /cast\(/i,
  /convert\(/i,
  /benchmark\(/i,
  /waitfor/i,
  /exec\s*\(/i,
];

// Check if input contains SQL injection patterns
export function detectSQLInjection(input: string): { isThreat: boolean; threats: string[] } {
  const threats: string[] = [];
  
  if (typeof input !== 'string') {
    return { isThreat: false, threats: [] };
  }
  
  // Check for SQL keywords
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(input)) {
      threats.push(`SQL_KEYWORD_${keyword.toUpperCase()}`);
    }
  });
  
  // Check for dangerous patterns
  SQL_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push(`SQL_PATTERN_${index}`);
    }
  });
  
  // Check for comment injection
  if (/--/g.test(input) || /\/\*/g.test(input)) {
    threats.push('SQL_COMMENT_INJECTION');
  }
  
  // Check for boolean-based injection
  if (/('|")\s*(or|and)\s*[0-9]+\s*=\s*[0-9]+/gi.test(input)) {
    threats.push('SQL_BOOLEAN_INJECTION');
  }
  
  // Check for time-based injection
  if (/sleep\(|waitfor\s+delay/i.test(input)) {
    threats.push('SQL_TIME_BASED_INJECTION');
  }
  
  // Check for union-based injection
  if (/\bunion\b.*\bselect\b/gi.test(input)) {
    threats.push('SQL_UNION_INJECTION');
  }
  
  return {
    isThreat: threats.length > 0,
    threats: [...new Set(threats)] // Remove duplicates
  };
}

// Sanitize SQL input (basic protection)
export function sanitizeSQLInput(input: string): string {
  // Remove SQL comments
  let sanitized = input.replace(/--.*/g, '').replace(/\/\*.*?\*\//g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[';\\-\\*\\|%+=\\[\\]{}()^$!@#&~`\\\\]/g, '');
  
  // Remove SQL keywords (basic)
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Truncate if too long
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized.trim();
}

// Parameterized query helper (use with Prisma)
export function buildSafeQuery(baseQuery: any, params: Record<string, any>) {
  const detection = detectSQLInjection(JSON.stringify(params));
  
  if (detection.isThreat) {
    throw new Error(`SQL injection attempt detected: ${detection.threats.join(', ')}`);
  }
  
  // Return sanitized parameters
  const sanitizedParams: Record<string, any> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitizedParams[key] = sanitizeSQLInput(value);
    } else {
      sanitizedParams[key] = value;
    }
  });
  
  return { ...baseQuery, ...sanitizedParams };
}

