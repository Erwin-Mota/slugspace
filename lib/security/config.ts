// 🛡️ Security Configuration for SlugSpace
// Centralized security settings and policies

export const SECURITY_CONFIG = {
  // 🔐 Authentication & Authorization
  AUTH: {
    JWT_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
    JWT_EXPIRES_IN: '7d',
    SESSION_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_SPECIAL: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_UPPERCASE: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },

  // 🚫 Rate Limiting
  RATE_LIMITS: {
    GENERAL: { windowMs: 60000, maxRequests: 100 },
    SEARCH: { windowMs: 60000, maxRequests: 30 },
    AUTH: { windowMs: 60000, maxRequests: 5 },
    ADMIN: { windowMs: 60000, maxRequests: 10 },
    ANALYTICS: { windowMs: 60000, maxRequests: 20 },
    UPLOAD: { windowMs: 300000, maxRequests: 5 },
    API_KEY: { windowMs: 60000, maxRequests: 1000 },
  },

  // 🛡️ Input Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    MAX_EMAIL_LENGTH: 254,
    MAX_URL_LENGTH: 2048,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAG_LENGTH: 50,
    MAX_SEARCH_LENGTH: 200,
    MAX_PAGE_SIZE: 100,
    MAX_PAGE_NUMBER: 1000,
  },

  // 🔒 CORS & Headers
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true,
  },

  // 🚨 Security Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
  },

  // 📊 Request Limits
  REQUEST_LIMITS: {
    MAX_BODY_SIZE: 1024 * 1024, // 1MB
    MAX_QUERY_SIZE: 2048, // 2KB
    MAX_HEADER_SIZE: 8192, // 8KB
    MAX_URL_LENGTH: 2048,
    MAX_FILES: 5,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // 🔍 Audit & Logging
  AUDIT: {
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_RETENTION_DAYS: 90,
    LOG_SENSITIVE_DATA: false,
    LOG_IP_ADDRESSES: true,
    LOG_USER_AGENTS: true,
    LOG_REQUEST_BODIES: false,
    LOG_RESPONSE_BODIES: false,
    ALERT_ON_CRITICAL: true,
    ALERT_EMAIL: process.env.SECURITY_ALERT_EMAIL,
  },

  // 🚫 IP Restrictions
  IP_RESTRICTIONS: {
    ADMIN_IPS: process.env.ADMIN_IPS?.split(',') || [],
    BLOCKED_IPS: process.env.BLOCKED_IPS?.split(',') || [],
    ALLOWED_COUNTRIES: process.env.ALLOWED_COUNTRIES?.split(',') || [],
    BLOCKED_COUNTRIES: process.env.BLOCKED_COUNTRIES?.split(',') || [],
  },

  // 🔐 Database Security
  DATABASE: {
    CONNECTION_TIMEOUT: 30000, // 30 seconds
    QUERY_TIMEOUT: 10000, // 10 seconds
    MAX_CONNECTIONS: 20,
    MIN_CONNECTIONS: 2,
    LOG_QUERIES: process.env.NODE_ENV === 'development',
    LOG_SLOW_QUERIES: true,
    SLOW_QUERY_THRESHOLD: 1000, // 1 second
  },

  // 🚀 Cache Security
  CACHE: {
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_TLS: process.env.REDIS_TLS === 'true',
    CACHE_TTL: {
      DEFAULT: 3600, // 1 hour
      SEARCH: 1800, // 30 minutes
      ANALYTICS: 7200, // 2 hours
      USER_DATA: 1800, // 30 minutes
    },
    CACHE_KEY_PREFIX: 'slugspace:',
    CACHE_MAX_KEYS: 10000,
  },

  // 🔒 Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    SALT_ROUNDS: 12,
  },

  // 🚨 Threat Detection
  THREAT_DETECTION: {
    ENABLED: true,
    XSS_THRESHOLD: 3, // Max XSS attempts before blocking
    SQL_INJECTION_THRESHOLD: 2, // Max SQL injection attempts before blocking
    RATE_LIMIT_THRESHOLD: 5, // Max rate limit violations before blocking
    SUSPICIOUS_ACTIVITY_THRESHOLD: 10, // Max suspicious activities before alerting
    BLOCK_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  },

  // 📧 Email Security
  EMAIL: {
    FROM_ADDRESS: process.env.EMAIL_FROM || 'noreply@slugspace.com',
    REPLY_TO: process.env.EMAIL_REPLY_TO,
    MAX_RECIPIENTS: 100,
    RATE_LIMIT: { windowMs: 3600000, maxRequests: 10 }, // 10 emails per hour
  },

  // 🔐 API Keys
  API_KEYS: {
    REQUIRED_FOR_ADMIN: true,
    REQUIRED_FOR_ANALYTICS: false,
    ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
    MAX_KEYS_PER_USER: 5,
  },

  // 🚫 Content Security
  CONTENT_SECURITY: {
    ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SCAN_FOR_MALWARE: false, // Would require external service
    QUARANTINE_SUSPICIOUS: true,
  },

  // 🔍 Monitoring
  MONITORING: {
    HEALTH_CHECK_INTERVAL: 60000, // 1 minute
    METRICS_COLLECTION: true,
    PERFORMANCE_MONITORING: true,
    ERROR_TRACKING: true,
    UPTIME_MONITORING: true,
  },

  // 🚨 Incident Response
  INCIDENT_RESPONSE: {
    AUTO_BLOCK_IPS: true,
    AUTO_NOTIFY_ADMINS: true,
    ESCALATION_THRESHOLD: 5, // Critical events before escalation
    RESPONSE_TIME_SLA: 15 * 60 * 1000, // 15 minutes
  },
};

// 🎯 Environment-specific overrides
export const getSecurityConfig = () => {
  const config = { ...SECURITY_CONFIG };
  
  if (process.env.NODE_ENV === 'development') {
    // Relaxed settings for development
    config.RATE_LIMITS.GENERAL.maxRequests = 1000;
    config.AUDIT.LOG_SENSITIVE_DATA = true;
    config.THREAT_DETECTION.ENABLED = false;
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Stricter settings for production
    config.RATE_LIMITS.GENERAL.maxRequests = 50;
    config.AUDIT.LOG_SENSITIVE_DATA = false;
    config.THREAT_DETECTION.ENABLED = true;
    config.REQUEST_LIMITS.MAX_BODY_SIZE = 512 * 1024; // 512KB
  }
  
  return config;
};

// 🛡️ Security Policy Validator
export const validateSecurityPolicy = (policy: any): boolean => {
  const requiredFields = [
    'AUTH.JWT_SECRET',
    'RATE_LIMITS.GENERAL',
    'VALIDATION.MAX_STRING_LENGTH',
    'REQUEST_LIMITS.MAX_BODY_SIZE',
  ];
  
  for (const field of requiredFields) {
    const keys = field.split('.');
    let current = policy;
    
    for (const key of keys) {
      if (!current || !current[key]) {
        console.error(`❌ Missing required security policy field: ${field}`);
        return false;
      }
      current = current[key];
    }
  }
  
  return true;
};

// 🚨 Security Event Severity Levels
export const SECURITY_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type SecuritySeverity = typeof SECURITY_SEVERITY[keyof typeof SECURITY_SEVERITY];

// 🎯 Security Event Categories
export const SECURITY_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  SYSTEM_SECURITY: 'SYSTEM_SECURITY',
  NETWORK_SECURITY: 'NETWORK_SECURITY',
  APPLICATION_SECURITY: 'APPLICATION_SECURITY',
} as const;

export type SecurityCategory = typeof SECURITY_CATEGORIES[keyof typeof SECURITY_CATEGORIES];

export default SECURITY_CONFIG;
