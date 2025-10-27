// 🛡️ Content Security Policy Configuration
// Implements strict CSP headers to prevent XSS attacks

export const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Remove 'unsafe-inline' in production
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: ["'self'", "https://api.github.com", "https://www.googleapis.com"],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    reportUri: '/api/csp-report'
  }
};

// Generate CSP header string
export function getCSPHeader(): string {
  const directives = contentSecurityPolicy.directives;
  
  return Object.entries(directives)
    .map(([key, value]) => {
      if (value === '') return '';
      const valueStr = Array.isArray(value) ? value.join(' ') : value;
      return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${valueStr}`;
    })
    .filter(Boolean)
    .join('; ');
}

// Generate security headers
export function getSecurityHeaders() {
  return {
    'Content-Security-Policy': getCSPHeader(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

